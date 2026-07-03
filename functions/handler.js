// ═══════════════════════════════════════════════════════════════════════════════
// NUSANTARA ERP — Integration API (read-only) request handler
// -----------------------------------------------------------------------------
// Pure, framework-agnostic core so it can be unit-tested without a live
// Firestore. The Vercel route files inject `getCollection` (real firebase-admin)
// and the configured API key. See api/v1/[resource].js.
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

function send(res, status, body) {
  res.statusCode = status;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-api-key, content-type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-store');
  }
  // Vercel/Node helpers (res.json) or a minimal res in tests.
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
 * @param req   { method, headers, query }  (Vercel/Node request)
 * @param res   response with statusCode + json()/end()
 * @param deps  { getCollection(collectionName, { limit }) → Promise<object[]>, apiKey }
 */
export async function handleApi(req, res, deps) {
  const { getCollection, apiKey } = deps || {};

  if (req.method === 'OPTIONS') {
    return send(res, 204, {});
  }
  if (req.method !== 'GET') {
    return send(res, 405, { error: 'method_not_allowed', message: 'Only GET is supported.' });
  }

  // The API is closed unless an API key is configured on the server.
  if (!apiKey) {
    return send(res, 503, {
      error: 'not_configured',
      message: 'ERP_API_KEY is not set on the server.',
    });
  }

  const provided =
    (req.headers && (req.headers['x-api-key'] || req.headers['X-API-Key'])) ||
    (req.query && req.query.api_key) ||
    '';
  if (!safeEqual(String(provided), String(apiKey))) {
    return send(res, 401, { error: 'unauthorized', message: 'Missing or invalid API key.' });
  }

  const query = req.query || {};
  const resource = query.resource;

  // No resource → discovery/meta.
  if (!resource) {
    return send(res, 200, {
      version: 'v1',
      resources: Object.keys(READABLE),
      limits: { default: DEFAULT_LIMIT, max: MAX_LIMIT },
    });
  }

  const collectionName = READABLE[resource];
  if (!collectionName) {
    return send(res, 404, {
      error: 'unknown_resource',
      message: `Unknown resource "${resource}".`,
      resources: Object.keys(READABLE),
    });
  }

  const limit = clampLimit(query.limit);
  try {
    const data = await getCollection(collectionName, { limit });
    return send(res, 200, { resource, count: data.length, limit, data });
  } catch (err) {
    return send(res, 500, {
      error: 'server_error',
      message: 'Failed to read data.',
      detail: String((err && err.message) || err),
    });
  }
}
