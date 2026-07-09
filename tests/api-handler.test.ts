import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleApi, safeEqual, READABLE, _resetRateLimit } from '../functions/handler.js';

beforeEach(() => _resetRateLimit());

const API_KEY = 'test-secret-key';

function mockRes() {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as any,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
    },
  };
  return res;
}

const okGetCollection = vi.fn(async (name: string, { limit }: { limit: number }) =>
  Array.from({ length: Math.min(limit, 3) }, (_, i) => ({ id: `${name}-${i}` }))
);

describe('safeEqual', () => {
  it('matches identical strings and rejects others', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual('', '')).toBe(true);
    expect(safeEqual(null as unknown as string, 'abc')).toBe(false);
  });
});

describe('handleApi — auth', () => {
  it('503 when no API key is configured', async () => {
    const res = mockRes();
    await handleApi({ method: 'GET', headers: {}, query: {} }, res, {
      getCollection: okGetCollection,
      apiKey: '',
    });
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('not_configured');
  });

  it('401 on missing / wrong key', async () => {
    const res = mockRes();
    await handleApi({ method: 'GET', headers: {}, query: { resource: 'customers' } }, res, {
      getCollection: okGetCollection,
      apiKey: API_KEY,
    });
    expect(res.statusCode).toBe(401);

    const res2 = mockRes();
    await handleApi(
      { method: 'GET', headers: { 'x-api-key': 'nope' }, query: { resource: 'customers' } },
      res2,
      { getCollection: okGetCollection, apiKey: API_KEY }
    );
    expect(res2.statusCode).toBe(401);
  });

  it('accepts the key via header', async () => {
    const res = mockRes();
    await handleApi(
      { method: 'GET', headers: { 'x-api-key': API_KEY }, query: { resource: 'customers' } },
      res,
      { getCollection: okGetCollection, apiKey: API_KEY }
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.resource).toBe('customers');
  });
});

describe('handleApi — method + CORS', () => {
  it('204 on OPTIONS preflight', async () => {
    const res = mockRes();
    await handleApi({ method: 'OPTIONS', headers: {}, query: {} }, res, {
      getCollection: okGetCollection,
      apiKey: API_KEY,
    });
    expect(res.statusCode).toBe(204);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('405 on non-GET', async () => {
    const res = mockRes();
    await handleApi(
      { method: 'POST', headers: { 'x-api-key': API_KEY }, query: { resource: 'customers' } },
      res,
      { getCollection: okGetCollection, apiKey: API_KEY }
    );
    expect(res.statusCode).toBe(405);
  });
});

describe('handleApi — key rotation', () => {
  it('accepts the successor key (ERP_API_KEY_NEXT)', async () => {
    const res = mockRes();
    await handleApi(
      { method: 'GET', headers: { 'x-api-key': 'next-key' }, query: { resource: 'customers' } },
      res,
      { getCollection: okGetCollection, apiKey: API_KEY, apiKeyNext: 'next-key' }
    );
    expect(res.statusCode).toBe(200);
  });

  it('rejects a key matching neither', async () => {
    const res = mockRes();
    await handleApi(
      { method: 'GET', headers: { 'x-api-key': 'stale-key' }, query: { resource: 'customers' } },
      res,
      { getCollection: okGetCollection, apiKey: API_KEY, apiKeyNext: 'next-key' }
    );
    expect(res.statusCode).toBe(401);
  });
});

describe('handleApi — CORS pinning', () => {
  it('echoes an allowlisted Origin and adds Vary', async () => {
    const res = mockRes();
    await handleApi(
      {
        method: 'GET',
        headers: { 'x-api-key': API_KEY, origin: 'https://bi.example.com' },
        query: { resource: 'customers' },
      },
      res,
      {
        getCollection: okGetCollection,
        apiKey: API_KEY,
        allowedOrigins: 'https://bi.example.com, https://other.example.com',
      }
    );
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://bi.example.com');
    expect(res.headers['Vary']).toBe('Origin');
  });

  it('omits the CORS header for a non-allowlisted Origin', async () => {
    const res = mockRes();
    await handleApi(
      {
        method: 'GET',
        headers: { 'x-api-key': API_KEY, origin: 'https://evil.example.com' },
        query: { resource: 'customers' },
      },
      res,
      { getCollection: okGetCollection, apiKey: API_KEY, allowedOrigins: 'https://bi.example.com' }
    );
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(res.statusCode).toBe(200); // auth is the gate, CORS is browser-side
  });
});

describe('handleApi — rate limiting', () => {
  it('429 with Retry-After once the per-IP window is exhausted', async () => {
    const deps = {
      getCollection: okGetCollection,
      apiKey: API_KEY,
      rateLimit: { max: 3, windowMs: 60_000 },
    };
    const req = () => ({
      method: 'GET',
      headers: { 'x-api-key': API_KEY, 'x-forwarded-for': '203.0.113.9' },
      query: { resource: 'customers' },
    });
    for (let i = 0; i < 3; i++) {
      const res = mockRes();
      await handleApi(req(), res, deps);
      expect(res.statusCode).toBe(200);
    }
    const res = mockRes();
    await handleApi(req(), res, deps);
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBe('rate_limited');
    expect(Number(res.headers['Retry-After'])).toBeGreaterThan(0);
  });

  it('throttles unauthenticated requests too (key brute-force)', async () => {
    const deps = {
      getCollection: okGetCollection,
      apiKey: API_KEY,
      rateLimit: { max: 2, windowMs: 60_000 },
    };
    const req = () => ({
      method: 'GET',
      headers: { 'x-api-key': 'guess', 'x-forwarded-for': '198.51.100.7' },
      query: { resource: 'customers' },
    });
    for (let i = 0; i < 2; i++) {
      const res = mockRes();
      await handleApi(req(), res, deps);
      expect(res.statusCode).toBe(401);
    }
    const res = mockRes();
    await handleApi(req(), res, deps);
    expect(res.statusCode).toBe(429);
  });

  it('tracks IPs independently', async () => {
    const deps = {
      getCollection: okGetCollection,
      apiKey: API_KEY,
      rateLimit: { max: 1, windowMs: 60_000 },
    };
    const mk = (ip: string) => ({
      method: 'GET',
      headers: { 'x-api-key': API_KEY, 'x-forwarded-for': ip },
      query: { resource: 'customers' },
    });
    const res1 = mockRes();
    await handleApi(mk('10.0.0.1'), res1, deps);
    const res2 = mockRes();
    await handleApi(mk('10.0.0.2'), res2, deps);
    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
  });
});

describe('handleApi — routing', () => {
  it('returns discovery meta when no resource is given', async () => {
    const res = mockRes();
    await handleApi({ method: 'GET', headers: { 'x-api-key': API_KEY }, query: {} }, res, {
      getCollection: okGetCollection,
      apiKey: API_KEY,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.version).toBe('v1');
    expect(res.body.resources).toEqual(Object.keys(READABLE));
  });

  it('404 on unknown / non-whitelisted resource', async () => {
    const res = mockRes();
    await handleApi(
      { method: 'GET', headers: { 'x-api-key': API_KEY }, query: { resource: 'paymentLogs' } },
      res,
      { getCollection: okGetCollection, apiKey: API_KEY }
    );
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('unknown_resource');
  });

  it('maps a resource slug to its collection and clamps limit to MAX', async () => {
    const spy = vi.fn(async () => [{ id: 'x' }]);
    const res = mockRes();
    await handleApi(
      {
        method: 'GET',
        headers: { 'x-api-key': API_KEY },
        query: { resource: 'items', limit: '99999' },
      },
      res,
      { getCollection: spy, apiKey: API_KEY }
    );
    expect(spy).toHaveBeenCalledWith('inventoryItems', {
      limit: 500,
      cursor: null,
      updatedSince: null,
    });
    expect(res.statusCode).toBe(200);
  });

  it('defaults the limit when not provided', async () => {
    const spy = vi.fn(async () => []);
    const res = mockRes();
    await handleApi(
      { method: 'GET', headers: { 'x-api-key': API_KEY }, query: { resource: 'suppliers' } },
      res,
      { getCollection: spy, apiKey: API_KEY }
    );
    expect(spy).toHaveBeenCalledWith('suppliers', { limit: 100, cursor: null, updatedSince: null });
  });

  it('passes cursor/updatedSince through and surfaces nextCursor', async () => {
    const spy = vi.fn(async () => ({ data: [{ id: 'a' }], nextCursor: 'tok-2' }));
    const res = mockRes();
    await handleApi(
      {
        method: 'GET',
        headers: { 'x-api-key': API_KEY },
        query: { resource: 'customers', cursor: 'tok-1', updatedSince: '2026-07-01' },
      },
      res,
      { getCollection: spy, apiKey: API_KEY }
    );
    expect(spy).toHaveBeenCalledWith('customers', {
      limit: 100,
      cursor: 'tok-1',
      updatedSince: new Date('2026-07-01').toISOString(), // normalized to full ISO
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.nextCursor).toBe('tok-2');
    expect(res.body.count).toBe(1);
  });

  it('400 on a malformed updatedSince', async () => {
    const res = mockRes();
    await handleApi(
      {
        method: 'GET',
        headers: { 'x-api-key': API_KEY },
        query: { resource: 'customers', updatedSince: 'not-a-date' },
      },
      res,
      { getCollection: okGetCollection, apiKey: API_KEY }
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('invalid_param');
  });

  it('still accepts a plain-array data layer (no pagination info)', async () => {
    const res = mockRes();
    await handleApi(
      { method: 'GET', headers: { 'x-api-key': API_KEY }, query: { resource: 'customers' } },
      res,
      { getCollection: async () => [{ id: 'x' }], apiKey: API_KEY }
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.nextCursor).toBe(null);
    expect(res.body.data).toEqual([{ id: 'x' }]);
  });

  it('500 when the data layer throws', async () => {
    const res = mockRes();
    await handleApi(
      { method: 'GET', headers: { 'x-api-key': API_KEY }, query: { resource: 'customers' } },
      res,
      {
        getCollection: async () => {
          throw new Error('boom');
        },
        apiKey: API_KEY,
      }
    );
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('server_error');
  });
});
