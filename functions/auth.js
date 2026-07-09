// ═══════════════════════════════════════════════════════════════════════════════
// NUSANTARA ERP — Username → Firebase custom-token auth (Cloud Functions).
// -----------------------------------------------------------------------------
// The browser logs in with a username/password. These callables verify the
// password server-side against the locked-down `authUsers` collection and mint a
// Firebase custom token carrying the user's role as a claim. The client then
// calls signInWithCustomToken(), which populates request.auth (uid + role) so the
// Firestore security rules pass and data syncs on every device — without any
// shared password ever being shipped to the client.
//
//   • loginWithUsername({ username, password })  → { token, mustChangePassword }
//   • changeMyPassword({ oldPassword, newPassword })  (self, must be signed in)
//   • admin* ({...})                              (caller must have role=admin)
// ═══════════════════════════════════════════════════════════════════════════════

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { adminAuth } from './admin.js';
import {
  ensureSeedUsers,
  verifyPassword,
  listUsers,
  createUser,
  setPassword,
  setRole,
  setActive,
  deleteUser,
  uidFor,
  getTwoFactor,
  setTwoFactor,
  newBackupCodes,
  encodeBackupCodes,
  verifyAndBurnBackupCode,
} from './auth-users.js';
import { verifyTOTP } from './totp.js';

const CALL_OPTS = { cors: true, maxInstances: 10 };

function need(value, message) {
  if (value == null || value === '') {
    throw new HttpsError('invalid-argument', message);
  }
  return value;
}

// The caller must be signed in as an admin (role claim on their token).
function requireAdmin(request) {
  const role = request.auth && request.auth.token && request.auth.token.role;
  if (role !== 'admin') {
    throw new HttpsError('permission-denied', 'Hanya admin yang boleh melakukan ini.');
  }
}

// Run an auth-users store operation, converting its plain validation Errors
// (e.g. "Username sudah dipakai") into an HttpsError so the message reaches the
// client instead of being masked as a generic INTERNAL.
async function guard(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpsError) {
      throw e;
    }
    throw new HttpsError('failed-precondition', (e && e.message) || 'Operasi gagal');
  }
}

async function mintToken(user) {
  // Additional claims ride inside the ID token, so the Firestore rules can read
  // request.auth.token.role without a users/{uid} lookup.
  return adminAuth().createCustomToken(uidFor(user.username), { role: user.role || 'viewer' });
}

/**
 * Verify username/password and return a Firebase custom token.
 * Auto-seeds the four default accounts the first time the store is empty, so a
 * fresh deploy has working logins (admin/admin123, …) exactly like local mode.
 */
export const loginWithUsername = onCall(CALL_OPTS, async request => {
  const username = need(request.data && request.data.username, 'Username wajib diisi');
  const password = need(request.data && request.data.password, 'Password wajib diisi');

  await ensureSeedUsers();

  const user = await verifyPassword(username, password);
  if (!user) {
    // Same message for unknown user and wrong password — don't reveal which.
    throw new HttpsError('unauthenticated', 'Username atau password salah');
  }

  // Second factor: when the account has 2FA on, require a valid TOTP or an unused
  // backup code before minting a token. A missing code returns { twoFactor: true }
  // so the client can prompt for step 2 (which re-calls with `totp`).
  if (user.twoFactor && user.twoFactor.enabled) {
    const totp = request.data && request.data.totp;
    if (!totp) {
      return { twoFactor: true };
    }
    const okTotp = verifyTOTP(user.twoFactor.secret, totp);
    const okBackup = okTotp ? false : await verifyAndBurnBackupCode(user.username, totp);
    if (!okTotp && !okBackup) {
      throw new HttpsError('unauthenticated', 'Kode 2FA salah atau sudah dipakai');
    }
  }

  const token = await mintToken(user);
  return { token, mustChangePassword: !!user.mustChangePassword, role: user.role || 'viewer' };
});

/** Change the signed-in user's own password (re-verifies the old one). */
export const changeMyPassword = onCall(CALL_OPTS, async request => {
  const uid = request.auth && request.auth.uid;
  if (!uid || !uid.startsWith('u_')) {
    throw new HttpsError('unauthenticated', 'Harus login terlebih dahulu.');
  }
  const username = uid.slice(2);
  const oldPassword = need(request.data && request.data.oldPassword, 'Password lama wajib diisi');
  const newPassword = need(request.data && request.data.newPassword, 'Password baru wajib diisi');
  if (String(newPassword).length < 6) {
    throw new HttpsError('invalid-argument', 'Password minimal 6 karakter');
  }

  const ok = await verifyPassword(username, oldPassword);
  if (!ok) {
    throw new HttpsError('permission-denied', 'Password lama salah');
  }
  await guard(() => setPassword(username, newPassword));
  return { ok: true };
});

// ── two-factor (TOTP) for the signed-in user ─────────────────────────────────────
// The account is identified by the token uid (u_<username>), so 2FA can only ever
// be managed for one's own account. Secrets/backup hashes stay server-side.
function callerUsername(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid || !uid.startsWith('u_')) {
    throw new HttpsError('unauthenticated', 'Harus login terlebih dahulu.');
  }
  return uid.slice(2);
}

/** Enable 2FA: verify a live TOTP for `secret`, store it, and return one-time backup codes. */
export const enable2FA = onCall(CALL_OPTS, async request => {
  const username = callerUsername(request);
  const d = request.data || {};
  const secret = need(d.secret, 'Secret wajib diisi');
  const token = need(d.token, 'Kode verifikasi wajib diisi');
  if (!verifyTOTP(secret, token)) {
    throw new HttpsError(
      'invalid-argument',
      'Kode salah — pastikan jam perangkat & authenticator sinkron.'
    );
  }
  const plainCodes = newBackupCodes();
  await guard(() =>
    setTwoFactor(username, { enabled: true, secret, backupCodes: encodeBackupCodes(plainCodes) })
  );
  return { backupCodes: plainCodes };
});

/** Disable 2FA. Confirm with the account password OR a valid TOTP / backup code. */
export const disable2FA = onCall(CALL_OPTS, async request => {
  const username = callerUsername(request);
  const confirm = need(request.data && request.data.confirm, 'Konfirmasi wajib diisi');
  const tf = await getTwoFactor(username);
  if (!tf || !tf.enabled) {
    return { ok: true }; // already off
  }
  const okPassword = !!(await verifyPassword(username, confirm));
  const okTotp = okPassword ? false : verifyTOTP(tf.secret, confirm);
  const okBackup = okPassword || okTotp ? false : await verifyAndBurnBackupCode(username, confirm);
  if (!okPassword && !okTotp && !okBackup) {
    throw new HttpsError(
      'permission-denied',
      'Konfirmasi salah — masukkan password atau kode 2FA yang benar.'
    );
  }
  await guard(() => setTwoFactor(username, null));
  return { ok: true };
});

/** Issue a fresh batch of backup codes (invalidates the old ones). */
export const regenerateBackupCodes = onCall(CALL_OPTS, async request => {
  const username = callerUsername(request);
  const tf = await getTwoFactor(username);
  if (!tf || !tf.enabled) {
    throw new HttpsError('failed-precondition', '2FA belum aktif.');
  }
  const plainCodes = newBackupCodes();
  await guard(() => setTwoFactor(username, { ...tf, backupCodes: encodeBackupCodes(plainCodes) }));
  return { backupCodes: plainCodes };
});

/** 2FA status snapshot for the settings UI. */
export const get2FAStatus = onCall(CALL_OPTS, async request => {
  const username = callerUsername(request);
  const tf = await getTwoFactor(username);
  return {
    enabled: !!(tf && tf.enabled),
    backupCodesRemaining:
      tf && Array.isArray(tf.backupCodes) ? tf.backupCodes.filter(c => !c.used).length : 0,
  };
});

// ── admin user management (caller must be an admin) ──────────────────────────────
export const adminListUsers = onCall(CALL_OPTS, async request => {
  requireAdmin(request);
  return { users: await listUsers() };
});

export const adminCreateUser = onCall(CALL_OPTS, async request => {
  requireAdmin(request);
  const d = request.data || {};
  await guard(() => createUser(d.username, d.displayName, d.password, d.role || 'viewer'));
  return { ok: true };
});

export const adminSetPassword = onCall(CALL_OPTS, async request => {
  requireAdmin(request);
  const d = request.data || {};
  await guard(() =>
    setPassword(need(d.username, 'Username wajib diisi'), need(d.password, 'Password wajib diisi'))
  );
  return { ok: true };
});

export const adminSetRole = onCall(CALL_OPTS, async request => {
  requireAdmin(request);
  const d = request.data || {};
  await guard(() => setRole(need(d.username, 'Username wajib diisi'), need(d.role, 'Role wajib diisi')));
  return { ok: true };
});

export const adminSetActive = onCall(CALL_OPTS, async request => {
  requireAdmin(request);
  const d = request.data || {};
  await guard(() => setActive(need(d.username, 'Username wajib diisi'), !!d.active));
  return { ok: true };
});

export const adminDeleteUser = onCall(CALL_OPTS, async request => {
  requireAdmin(request);
  const d = request.data || {};
  await guard(() => deleteUser(need(d.username, 'Username wajib diisi')));
  return { ok: true };
});
