// ═══════════════════════════════════════════════════════════════════════════════
// NUSANTARA ERP — Integration API (read-only) request handler
// -----------------------------------------------------------------------------
// Pure, framework-agnostic core so it can be unit-tested without a live
// Firestore. The Cloud Functions entrypoint (functions/index.js) injects
// `getCollection` (real firebase-admin) and the configured API key(s).
// ═══════════════════════════════════════════════════════════════════════════════

// Public resource slug → Firestore collection. Deliberately excludes sensitive
// collections (paymentLogs, settings, users, accounts, notifications).
export const READABLE = Object.freeze({
  customers: 'customers',
  suppliers: 'suppliers',
  items: 'inventoryItems',
  'sales-orders': 'salesOrders',
  'purchase-orders': 'purchaseOrders',
  'sales-invoices': 'salesInvoices',
  'purchase-invoices': 'purchaseInvoices',
  'delivery-orders': 'deliveryOrders',
});

export const DEFAULT_LIMIT = 100;
export const MAX_LIMIT = 500;

// Fixed-window per-IP rate limit. In-memory is effective here because a warm
// function instance is reused across requests; it degrades to per-instance
// limits under scale-out, which is still enough to blunt key brute-forcing and
// runaway clients.
export const RATE_LIMIT_MAX = 120; // requests per window (default)
export const RATE_LIMIT_WINDOW_MS = 60_000;
const _rateBuckets = new Map(); // ip → { count, windowStart }

/** Test hook: clear rate-limit state between test cases. */
export function _resetRateLimit() {
  _rateBuckets.clear();
}

function clientIp(req) {
  const fwd = (req.headers && req.headers['x-forwarded-for']) || '';
  if (fwd) {
    return String(fwd).split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

// Returns null when allowed, or seconds-until-reset when the caller is over.
function checkRateLimit(ip, max, windowMs) {
  const now = Date.now();
  // Opportunistic prune so the map can't grow without bound.
  if (_rateBuckets.size > 10_000) {
    for (const [k, b] of _rateBuckets) {
      if (now - b.windowStart >= windowMs) {
        _rateBuckets.delete(k);
      }
    }
  }
  const bucket = _rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    _rateBuckets.set(ip, { count: 1, windowStart: now });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return Math.ceil((bucket.windowStart + windowMs - now) / 1000);
  }
  return null;
}

// Length-independent constant-time string compare (avoids leaking the key via
// early-exit timing). Returns false on any type/length mismatch.
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Resolve the Access-Control-Allow-Origin value. Unset config keeps the
// historical '*' (the API is key-authenticated and server-to-server); a
// comma-separated allowlist pins it to the request's Origin when it matches.
function resolveCorsOrigin(req, allowedOrigins) {
  if (!allowedOrigins) {
    return '*';
  }
  const list = String(allowedOrigins)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const origin = (req.headers && req.headers.origin) || '';
  return list.includes(origin) ? origin : null; // null → no CORS header
}

function send(res, status, body, corsOrigin = '*') {
  res.statusCode = status;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (corsOrigin) {
      res.setHeader('Access-Control-Allow-Origin', corsOrigin);
      if (corsOrigin !== '*') {
        res.setHeader('Vary', 'Origin');
      }
    }
    res.setHeader('Access-Control-Allow-Headers', 'x-api-key, content-type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-store');
  }
  // Express (res.json) or a minimal res in tests.
  if (typeof res.json === 'function') {
    res.status?.(status);
    res.json(body);
  } else {
    res.end(JSON.stringify(body));
  }
  return body;
}

function clampLimit(raw) {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(n, MAX_LIMIT);
}

/**
 * Handle a read-only API request.
 * @param req   { method, headers, query }  (Express/Node request)
 * @param res   response with statusCode + json()/end()
 * @param deps  {
 *   getCollection(collectionName, { limit, cursor, updatedSince })
 *     → Promise<object[]> | Promise<{ data: object[], nextCursor: string|null }>,
 *   apiKey, apiKeyNext,     // active key + optional rotation successor
 *   allowedOrigins,          // comma-separated Origin allowlist ('' → '*')
 *   rateLimit: { max, windowMs },
 * }
 */
export async function handleApi(req, res, deps) {
  const { getCollection, apiKey, apiKeyNext, allowedOrigins, rateLimit } = deps || {};
  const corsOrigin = resolveCorsOrigin(req, allowedOrigins);

  if (req.method === 'OPTIONS') {
    return send(res, 204, {}, corsOrigin);
  }
  if (req.method !== 'GET') {
    return send(
      res,
      405,
      { error: 'method_not_allowed', message: 'Only GET is supported.' },
      corsOrigin
    );
  }

  // Rate-limit before auth so brute-forcing the key is throttled too.
  const rlMax = (rateLimit && rateLimit.max) || RATE_LIMIT_MAX;
  const rlWindow = (rateLimit && rateLimit.windowMs) || RATE_LIMIT_WINDOW_MS;
  const retryAfter = checkRateLimit(clientIp(req), rlMax, rlWindow);
  if (retryAfter !== null) {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Retry-After', String(retryAfter));
    }
    return send(
      res,
      429,
      { error: 'rate_limited', message: 'Too many requests — slow down.', retryAfter },
      corsOrigin
    );
  }

  // The API is closed unless an API key is configured on the server.
  const validKeys = [apiKey, apiKeyNext].filter(Boolean).map(String);
  if (validKeys.length === 0) {
    return send(
      res,
      503,
      { error: 'not_configured', message: 'ERP_API_KEY is not set on the server.' },
      corsOrigin
    );
  }

  // Header only — a ?api_key= query param would leak the key into server logs,
  // browser history and proxies. Two keys are accepted so ERP_API_KEY_NEXT can
  // be handed to integrators before ERP_API_KEY is retired (zero-downtime
  // rotation).
  const provided = String(
    (req.headers && (req.headers['x-api-key'] || req.headers['X-API-Key'])) || ''
  );
  if (!validKeys.some(k => safeEqual(provided, k))) {
    return send(
      res,
      401,
      { error: 'unauthorized', message: 'Missing or invalid API key.' },
      corsOrigin
    );
  }

  const query = req.query || {};
  const resource = query.resource;

  // No resource → discovery/meta.
  if (!resource) {
    return send(
      res,
      200,
      {
        version: 'v1',
        resources: Object.keys(READABLE),
        limits: { default: DEFAULT_LIMIT, max: MAX_LIMIT },
        params: { limit: '1-500', cursor: 'opaque, from nextCursor', updatedSince: 'ISO 8601' },
      },
      corsOrigin
    );
  }

  const collectionName = READABLE[resource];
  if (!collectionName) {
    return send(
      res,
      404,
      {
        error: 'unknown_resource',
        message: `Unknown resource "${resource}".`,
        resources: Object.keys(READABLE),
      },
      corsOrigin
    );
  }

  const limit = clampLimit(query.limit);
  const cursor = typeof query.cursor === 'string' && query.cursor ? query.cursor : null;
  let updatedSince = null;
  if (query.updatedSince) {
    const d = new Date(String(query.updatedSince));
    if (Number.isNaN(d.getTime())) {
      return send(
        res,
        400,
        {
          error: 'invalid_param',
          message: 'updatedSince must be an ISO 8601 date, e.g. 2026-07-01T00:00:00Z.',
        },
        corsOrigin
      );
    }
    updatedSince = d.toISOString();
  }

  try {
    const result = await getCollection(collectionName, { limit, cursor, updatedSince });
    // Back-compat: a plain array means "no pagination info" (older data layers
    // and simple test doubles).
    const data = Array.isArray(result) ? result : result.data;
    const nextCursor = Array.isArray(result) ? null : result.nextCursor || null;
    return send(
      res,
      200,
      {
        resource,
        count: data.length,
        limit,
        ...(updatedSince ? { updatedSince } : {}),
        nextCursor,
        data,
      },
      corsOrigin
    );
  } catch (err) {
    // Log the detail server-side only — err.message can expose Firestore/infra
    // internals to the caller.
    console.error('[api] read failed for', collectionName, err);
    return send(res, 500, { error: 'server_error', message: 'Failed to read data.' }, corsOrigin);
  }
}
