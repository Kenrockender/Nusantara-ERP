// GET /api/v1/:resource — read-only integration endpoint (API-key auth).
// e.g. /api/v1/customers?limit=50   (header: x-api-key: <ERP_API_KEY>)
import { handleApi } from '../_lib/handler.js';
import { getCollection } from '../_lib/firestore.js';

export default function handler(req, res) {
  return handleApi(req, res, { getCollection, apiKey: process.env.ERP_API_KEY });
}
