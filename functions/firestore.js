// ═══════════════════════════════════════════════════════════════════════════════
// Firebase-admin Firestore accessor for the integration API (Cloud Functions).
// -----------------------------------------------------------------------------
// In the Cloud Functions runtime, initializeApp() with no args uses the built-in
// default service account (Application Default Credentials) — no key file needed.
// The Firestore database id defaults to '(default)' (matching the web client's
// VITE_FIREBASE_DB_ID fallback); override with the FIRESTORE_DATABASE_ID env var.
// ═══════════════════════════════════════════════════════════════════════════════

import { Timestamp, FieldPath } from 'firebase-admin/firestore';
import { adminDb as db } from './admin.js';

// Opaque pagination cursor: base64url-encoded JSON array of the orderBy values
// of the last document served ([docId] or [seconds, nanoseconds, docId]).
export function encodeCursor(values) {
  return Buffer.from(JSON.stringify(values)).toString('base64url');
}

export function decodeCursor(cursor) {
  try {
    const v = JSON.parse(Buffer.from(String(cursor), 'base64url').toString('utf8'));
    return Array.isArray(v) && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

/**
 * Read up to `limit` documents from `collectionName`, id-stamped.
 * - `cursor`: opaque token from a previous page's `nextCursor`.
 * - `updatedSince`: ISO date — only docs whose `updatedAt` (a Firestore
 *   Timestamp; the app's saveDB stamps serverTimestamp() on every write) is at
 *   or after this moment. Docs that predate updatedAt stamping have no such
 *   field and are excluded from delta queries.
 * Returns { data, nextCursor } — nextCursor is null on the last page.
 */
export async function getCollection(collectionName, { limit = 100, cursor, updatedSince } = {}) {
  let q = db().collection(collectionName);
  if (updatedSince) {
    // The documentId tiebreaker makes the cursor stable across equal timestamps.
    q = q
      .where('updatedAt', '>=', Timestamp.fromDate(new Date(updatedSince)))
      .orderBy('updatedAt')
      .orderBy(FieldPath.documentId());
  } else {
    q = q.orderBy(FieldPath.documentId());
  }
  const after = cursor ? decodeCursor(cursor) : null;
  if (after) {
    // Delta cursors carry [seconds, nanoseconds, docId] so the Timestamp is
    // reconstructed exactly (millisecond rounding would re-serve page
    // boundaries). Plain cursors are [docId].
    if (updatedSince && after.length === 3) {
      q = q.startAfter(new Timestamp(after[0], after[1]), after[2]);
    } else if (!updatedSince && after.length === 1) {
      q = q.startAfter(after[0]);
    }
    // Mismatched cursor/mode combinations fall through as "no cursor".
  }
  const snap = await q.limit(limit).get();
  const data = snap.docs.map(d => {
    const rec = { id: d.id, ...d.data() };
    // Serialize the stamp as ISO — raw Timestamps JSON-encode as
    // {_seconds,_nanoseconds}, which is useless to integrators.
    if (rec.updatedAt && typeof rec.updatedAt.toDate === 'function') {
      rec.updatedAt = rec.updatedAt.toDate().toISOString();
    }
    return rec;
  });
  let nextCursor = null;
  if (snap.docs.length === limit) {
    const last = snap.docs[snap.docs.length - 1];
    if (updatedSince) {
      const ts = last.get('updatedAt');
      nextCursor = encodeCursor([ts.seconds, ts.nanoseconds, last.id]);
    } else {
      nextCursor = encodeCursor([last.id]);
    }
  }
  return { data, nextCursor };
}
