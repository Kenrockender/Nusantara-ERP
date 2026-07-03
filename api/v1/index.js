// GET /api/v1 — discovery: lists available resources (API-key auth).
import { handleApi } from '../_lib/handler.js';
import { getCollection } from '../_lib/firestore.js';

export default function handler(req, res) {
  // No `resource` in query → handler returns the discovery/meta payload.
  return handleApi(req, res, { getCollection, apiKey: process.env.ERP_API_KEY });
}
