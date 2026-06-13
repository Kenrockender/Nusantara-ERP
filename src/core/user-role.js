// ═══════════════════════════════════════════════════════════════════════════════
// Nusantara ERP — User Identity & Role Resolution  (user-role.js)
//
// Real multi-user RBAC lives in three layers:
//   1. Identity  (this file)   — maps each signed-in account to a role via a
//                                Firestore `users/{uid}` document.
//   2. Server    (firestore.rules) — the real boundary: rules read users/{uid}
//                                and allow writes only for permitted modules.
//   3. Client    (classic/core/rbac.js) — hides menus/buttons + a saveDB safety
//                                net so the UI matches what the server allows.
//
// This module is the bridge: after auth it resolves the active user's role,
// auto-provisioning a `pending` user document on first login (so an admin can
// later assign a real role) and exposes admin helpers to list users / set roles.
//
// Bootstrap: BOOTSTRAP_ADMINS are always treated as `admin`, even before a
// users/{uid} document exists — this prevents a chicken-and-egg lockout where
// nobody can grant the first role. Keep this list in sync with firestore.rules.
//
// Local-fallback mode (no Firebase): there is no shared database and a single
// operator owns the machine, so the local user is treated as `admin`. Real
// server enforcement only applies in Firebase mode.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db as fbDb, isFirebaseConfigured } from '../config/firebase.js';
import { getCurrentUser, getAuthMode } from './auth.js';

// Always-admin accounts (matched case-insensitively against the auth email).
// MUST mirror the bootstrapAdmin() allow-list in firestore.rules.
export const BOOTSTRAP_ADMINS = ['kenrockender521@gmail.com'];

// The fixed preset roles. Order = display order in the role picker.
export const ROLES = ['admin', 'manajer', 'akunting', 'penjualan', 'viewer'];

export const ROLE_LABELS = {
  admin: 'Admin / Owner',
  manajer: 'Manajer',
  akunting: 'Akunting',
  penjualan: 'Penjualan',
  viewer: 'Viewer (hanya lihat)',
  pending: 'Menunggu persetujuan',
};

function isBootstrap(email) {
  return !!email && BOOTSTRAP_ADMINS.includes(String(email).toLowerCase());
}

function usersCol() {
  return collection(fbDb, 'users');
}

function userRef(uid) {
  return doc(fbDb, 'users', uid);
}

/**
 * Resolve the active user's role. Returns
 *   { uid, email, displayName, role, active, mode, source }
 * and never throws — on any failure it degrades to a safe, low-privilege role
 * so a transient Firestore error can't escalate access.
 */
export async function resolveUserRole() {
  const user = getCurrentUser();
  const mode = getAuthMode();

  if (!user) {
    return { uid: null, email: null, displayName: null, role: 'pending', active: false, mode, source: 'none' };
  }

  const email = user.email || '';
  const displayName = user.displayName || (email ? email.split('@')[0] : 'user');

  // Local-fallback mode: single operator on this device → full admin. No shared
  // database means server enforcement is irrelevant here.
  if (mode !== 'firebase' || !isFirebaseConfigured || !fbDb) {
    return {
      uid: user.uid,
      email,
      displayName,
      role: 'admin',
      active: true,
      mode: 'local',
      source: 'local',
    };
  }

  const bootstrap = isBootstrap(email);

  try {
    const ref = userRef(user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() || {};
      // Heal the bootstrap admin's document if it was downgraded somehow.
      if (bootstrap && (data.role !== 'admin' || data.active === false)) {
        try {
          await updateDoc(ref, { role: 'admin', active: true });
        } catch (_) {
          /* rules will still treat them as admin via email */
        }
        return { uid: user.uid, email, displayName, role: 'admin', active: true, mode: 'firebase', source: 'doc' };
      }
      const role = bootstrap ? 'admin' : data.role || 'pending';
      const active = bootstrap ? true : data.active !== false;
      return { uid: user.uid, email, displayName, role, active, mode: 'firebase', source: 'doc' };
    }

    // First login → self-provision a document. Bootstrap admins get `admin`,
    // everyone else gets an inactive `pending` role until an admin assigns one.
    const role = bootstrap ? 'admin' : 'pending';
    const active = bootstrap;
    try {
      await setDoc(ref, {
        email,
        displayName,
        role,
        active,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('[UserRole] could not create users/{uid} document:', e);
    }
    return { uid: user.uid, email, displayName, role, active, mode: 'firebase', source: 'provisioned' };
  } catch (e) {
    console.warn('[UserRole] role resolution failed, defaulting to viewer:', e);
    // Safe degrade: read-only. Bootstrap admins stay admin (token-based in rules).
    return {
      uid: user.uid,
      email,
      displayName,
      role: bootstrap ? 'admin' : 'viewer',
      active: true,
      mode: 'firebase',
      source: 'error',
    };
  }
}

// ── Admin helpers (User Management UI) ─────────────────────────────────────────

/** List every known user document. Admin-only (enforced by rules). */
export async function listUsers() {
  if (!isFirebaseConfigured || !fbDb) {
    // Local mode: surface the single local operator so the UI isn't empty.
    const u = getCurrentUser();
    return u
      ? [{ uid: u.uid, email: u.email, displayName: u.displayName, role: 'admin', active: true, local: true }]
      : [];
  }
  const snap = await getDocs(usersCol());
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

/** Set a user's role and active flag. Admin-only (enforced by rules). */
export async function setUserRole(uid, role, active = true) {
  if (!uid) {
    throw new Error('uid wajib diisi');
  }
  if (!ROLES.includes(role) && role !== 'pending') {
    throw new Error(`Role tidak dikenal: ${role}`);
  }
  if (!isFirebaseConfigured || !fbDb) {
    throw new Error('Manajemen user hanya tersedia di mode cloud (Firebase).');
  }
  await setDoc(userRef(uid), { role, active: !!active }, { merge: true });
  return true;
}
