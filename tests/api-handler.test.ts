import { describe, it, expect, vi } from 'vitest';
import { handleApi, safeEqual, READABLE } from '../api/_lib/handler.js';

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
    expect(spy).toHaveBeenCalledWith('inventoryItems', { limit: 500 });
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
    expect(spy).toHaveBeenCalledWith('suppliers', { limit: 100 });
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
