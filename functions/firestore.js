// ═══════════════════════════════════════════════════════════════════════════════
// Firebase-admin Firestore accessor for the integration API (Cloud Functions).
// -----------------------------------------------------------------------------
// In the Cloud Functions runtime, initializeApp() with no args uses the built-in
// default service account (Application Default Credentials) — no key file needed.
// The Firestore database id defaults to '(default)' (matching the web client's
// VITE_FIREBASE_DB_ID fallback); override with the FIRESTORE_DATABASE_ID env var.
// ═══════════════════════════════════════════════════════════════════════════════

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let _db = null;

function db() {
  if (_db) {
    return _db;
  }
  if (!getApps().length) {
    initializeApp();
  }
  const dbId = process.env.FIRESTORE_DATABASE_ID || '(default)';
  _db = getFirestore(dbId);
  return _db;
}

/** Read up to `limit` documents from `collectionName`, id-stamped. */
export async function getCollection(collectionName, { limit = 100 } = {}) {
  const snap = await db().collection(collectionName).limit(limit).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
