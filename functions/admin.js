// ═══════════════════════════════════════════════════════════════════════════════
// Shared firebase-admin initialization for all Cloud Functions.
// -----------------------------------------------------------------------------
// Initializing the default app EAGERLY at module load (and passing it explicitly
// to getFirestore/getAuth) guarantees the default app exists before any handler
// runs — avoiding the "default Firebase app does not exist" race that the lazy,
// per-module getApps() guards could hit in some function instances.
// initializeApp() with no args uses Application Default Credentials in the Cloud
// Functions runtime — no key file needed.
// ═══════════════════════════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const adminApp = getApps().length ? getApp() : initializeApp();

let _db = null;
export function adminDb() {
  if (!_db) {
    _db = getFirestore(adminApp, process.env.FIRESTORE_DATABASE_ID || '(default)');
  }
  return _db;
}

export function adminAuth() {
  return getAuth(adminApp);
}
