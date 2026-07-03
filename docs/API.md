# Integration API (read-only)

A small, read-only HTTP API for pulling master data and documents out of the ERP
into other systems (BI tools, spreadsheets, partner integrations). It runs as
Vercel serverless functions under `/api/v1` and reads directly from Firestore.

> **Read-only, for now.** Only `GET` is supported. Write endpoints are on the
> roadmap. The API is **closed by default** and returns `503` until `ERP_API_KEY`
> is configured on the server.

## Setup (Vercel)

Add three encrypted environment variables to the Vercel project (Settings →
Environment Variables), then redeploy:

| Variable | Purpose |
| --- | --- |
| `ERP_API_KEY` | A long random string. Callers pass it as `x-api-key`. Enables the API. |
| `FIREBASE_SERVICE_ACCOUNT` | Service-account JSON (single line). Firebase console → Project settings → Service accounts → Generate new private key. |
| `FIRESTORE_DATABASE_ID` | Firestore database id. Defaults to `default` (this project's named ENTERPRISE db). |

For local dev you can instead point `GOOGLE_APPLICATION_CREDENTIALS` at the
service-account file (see `scripts/seed-glseed.cjs`).

## Authentication

Pass the key in the `x-api-key` header (or `?api_key=` query param):

```bash
curl -H "x-api-key: $ERP_API_KEY" https://<your-app>.vercel.app/api/v1/customers
```

| Status | Meaning |
| --- | --- |
| `401` | Missing / invalid API key |
| `404` | Unknown or non-whitelisted resource |
| `405` | Non-GET method |
| `503` | `ERP_API_KEY` not configured on the server |

## Endpoints

### `GET /api/v1`
Discovery. Returns the API version and the list of available resources.

```json
{ "version": "v1", "resources": ["customers", "suppliers", "items", "..."],
  "limits": { "default": 100, "max": 500 } }
```

### `GET /api/v1/:resource`
Returns up to `limit` documents (default 100, max 500) from the resource.

| Resource slug | Firestore collection |
| --- | --- |
| `customers` | customers |
| `suppliers` | suppliers |
| `items` | inventoryItems |
| `sales-orders` | salesOrders |
| `purchase-orders` | purchaseOrders |
| `sales-invoices` | salesInvoices |
| `purchase-invoices` | purchaseInvoices |
| `delivery-orders` | deliveryOrders |

Sensitive collections (payments, settings, users, accounts, notifications) are
**not** exposed.

**Query params:** `limit` (1–500).

**Example**

```bash
curl -H "x-api-key: $ERP_API_KEY" \
  "https://<your-app>.vercel.app/api/v1/sales-orders?limit=50"
```

```json
{
  "resource": "sales-orders",
  "count": 50,
  "limit": 50,
  "data": [ { "id": "...", "number": "SO-...", "customerName": "...", "amount": 0 } ]
}
```

## Implementation

- `api/v1/[resource].js`, `api/v1/index.js` — Vercel route handlers.
- `api/_lib/handler.js` — pure request logic (auth, whitelist, limit clamp);
  unit-tested in `tests/api-handler.test.ts`.
- `api/_lib/firestore.js` — lazy `firebase-admin` Firestore accessor.
