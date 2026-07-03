// ═══════════════════════════════════════════════════════════════════════════════
// Lazy firebase-admin Firestore accessor for the integration API.
// -----------------------------------------------------------------------------
// Credentials come from the environment (never committed):
//   • FIREBASE_SERVICE_ACCOUNT — the service-account JSON as a single-line string
//     (recommended on Vercel: add it as an encrypted env var), OR
//   • GOOGLE_APPLICATION_CREDENTIALS — path to the JSON (local dev).
// The Firestore database id defaults to the named 'default' (ENTERPRISE) db this
// project uses; override with FIRESTORE_DATABASE_ID. See scripts/seed-glseed.cjs.
// ═══════════════════════════════════════════════════════════════════════════════

import admin from 'firebase-admin';

let _db = null;

function initAdmin() {
  if (admin.apps.length) {
    return;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    let cred;
    try {
      cred = JSON.parse(raw);
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON: ' + e.message, { cause: e });
    }
    admin.initializeApp({ credential: admin.credential.cert(cred) });
  } else {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS / ADC.
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
}

function db() {
  if (_db) {
    return _db;
  }
  initAdmin();
  const dbId = process.env.FIRESTORE_DATABASE_ID || 'default';
  _db = admin.firestore(undefined, dbId);
  return _db;
}

/** Read up to `limit` documents from `collectionName`, id-stamped. */
export async function getCollection(collectionName, { limit = 100 } = {}) {
  const snap = await db().collection(collectionName).limit(limit).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
