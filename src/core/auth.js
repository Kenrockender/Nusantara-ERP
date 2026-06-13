// ═══════════════════════════════════════════════════════════════════════════════
// NUSANTARA ERP — Authentication Module (Firebase Auth + local fallback)
// Primary: Firebase Authentication (email/password) — populates request.auth so
// Firestore security rules pass and multi-device sync works.
// Fallback: the original PBKDF2/localStorage auth, used automatically when
// Firebase is not configured or Firebase Auth is unreachable (offline PWA, or
// before the Email/Password provider is enabled in the console). This keeps the
// app usable and prevents lock-out during/after the migration.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth as fbAuth, isFirebaseConfigured } from '../config/firebase.js';

// Use Firebase Auth when credentials are present and the SDK initialised.
const _useFirebase = isFirebaseConfigured && !!fbAuth;
// Tracks which path authenticated the active session: 'firebase' | 'local'.
let _activeMode = null;

// Auth error codes that mean "Firebase Auth can't be used right now" — we fall
// back to local auth so the app keeps working (offline, provider not enabled, …).
const UNREACHABLE = new Set([
  'auth/network-request-failed',
  'auth/operation-not-allowed',
  'auth/configuration-not-found',
  'auth/internal-error',
  'auth/invalid-api-key',
  'auth/api-key-not-valid',
  'auth/app-deleted',
]);

function mapFbUser(u) {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'user'),
    emailVerified: !!u.emailVerified,
  };
}

function friendlyAuthError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Format email tidak valid';
    case 'auth/user-disabled':
      return 'Akun ini dinonaktifkan';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Email atau password salah';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan — coba lagi nanti';
    default:
      return 'Terjadi kesalahan saat login';
  }
}

// Resolve the first auth-state callback (the persisted user on reload), with a
// safety timeout so boot never hangs if the SDK stalls.
function firstAuthState() {
  return new Promise(resolve => {
    let done = false;
    const finish = v => {
      if (done) {
        return;
      }
      done = true;
      resolve(v);
    };
    try {
      const unsub = onAuthStateChanged(
        fbAuth,
        u => {
          try {
            unsub();
          } catch (_) {
            /* ignore */
          }
          finish(u);
        },
        () => finish(null)
      );
    } catch (_) {
      finish(null);
    }
    setTimeout(() => finish(fbAuth && fbAuth.currentUser ? fbAuth.currentUser : null), 5000);
  });
}

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;
const CREDS_KEY = 'erp_auth_creds';
const SESSION_KEY = 'erp_session';
const PBKDF2_ITERATIONS = 100000;

// First-run default login. The user is prompted to change it after logging in.
const DEFAULT_EMAIL = 'admin@nusantara.local';
const DEFAULT_PASSWORD = 'admin123';

let sessionTimer = null;
let currentUser = null;

// ── Password hashing (PBKDF2 / SHA-256) ───────────────────────────────────────
function bufToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/.{1,2}/g).map(h => parseInt(h, 16)));
}

function randomSalt() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return bufToHex(a.buffer);
}

async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return bufToHex(bits);
}

// ── Credential storage ─────────────────────────────────────────────────────────
function loadCreds() {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

function saveCreds(creds) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

async function ensureCreds() {
  let creds = loadCreds();
  if (!creds || !creds.passwordHash) {
    const salt = randomSalt();
    const passwordHash = await hashPassword(DEFAULT_PASSWORD, salt);
    creds = { email: DEFAULT_EMAIL, salt, passwordHash, mustChangePassword: true };
    saveCreds(creds);
  }
  return creds;
}

// ── Session ──────────────────────────────────────────────────────────────────
function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

function isSessionValid(s) {
  return Boolean(s) && Date.now() - (s.lastActivity || 0) <= SESSION_TIMEOUT;
}

function createSession(email) {
  const s = { email, loginTime: Date.now(), lastActivity: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function userFromEmail(email) {
  return { uid: email, email, displayName: email.split('@')[0] };
}

function startSessionTimer() {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
  }
  sessionTimer = setTimeout(() => {
    logout('Sesi Anda telah berakhir karena tidak aktif. Silakan login kembali.');
  }, SESSION_TIMEOUT);
}

// Reset session timer on activity (called from main.js activity listeners)
export function resetSessionTimer() {
  if (!currentUser) {
    return;
  }
  const s = getSession();
  if (s) {
    s.lastActivity = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }
  startSessionTimer();
}

// ── Public API ─────────────────────────────────────────────────────────────────
/**
 * Initialize auth. Returns true when a valid session exists (user stays logged
 * in), false when login is required.
 */
export async function initAuth() {
  await ensureCreds(); // keep local creds available for the fallback path

  // Firebase first: a persisted Firebase session means the user stays logged in
  // and request.auth is populated for Firestore.
  if (_useFirebase) {
    try {
      const u = await firstAuthState();
      if (u) {
        currentUser = mapFbUser(u);
        _activeMode = 'firebase';
        startSessionTimer();
        return true;
      }
    } catch (e) {
      console.warn('[Auth] Firebase init failed, falling back to local:', e);
    }
  }

  // Local session fallback (covers non-Firebase mode and local-fallback logins).
  const s = getSession();
  if (isSessionValid(s)) {
    currentUser = userFromEmail(s.email);
    _activeMode = 'local';
    startSessionTimer();
    return true;
  }
  clearSession();
  return false;
}

/**
 * Authenticate with Firebase Auth, transparently falling back to local auth when
 * Firebase is unavailable. Returns { ok, mode, msg }.
 *
 * SECURITY: there is intentionally NO self-service account creation here. The
 * old first-run bootstrap (auto-creating admin@nusantara.local when someone typed the
 * default credentials) let any visitor on the public deployment mint a Firebase
 * account with write access. Firebase accounts must be created from the
 * Firebase Console / Admin SDK.
 */
async function login(email, password) {
  const mail = (email || '').trim();
  if (_useFirebase) {
    try {
      await signInWithEmailAndPassword(fbAuth, mail, password);
      return { ok: true, mode: 'firebase' };
    } catch (e) {
      const code = e.code || '';
      if (UNREACHABLE.has(code)) {
        // Firebase Auth not usable yet — keep the app working via local auth.
        return localLogin(mail, password);
      }
      return { ok: false, msg: friendlyAuthError(code) };
    }
  }
  return localLogin(mail, password);
}

async function localLogin(email, password) {
  const ok = await verifyCredentials(email, password);
  if (ok) {
    createSession((loadCreds() || {}).email || email);
    return { ok: true, mode: 'local' };
  }
  return { ok: false, msg: 'Email atau password salah' };
}

export function getCurrentUser() {
  return currentUser;
}

/** Auth backend that authenticated the active session: 'firebase' | 'local' | null. */
export function getAuthMode() {
  return _activeMode;
}

/**
 * Whether the active user is allowed to write to the cloud database.
 * In local mode, writes go to localStorage and there is no verification gate,
 * so this is always true. In Firebase mode it mirrors the user's verified
 * state, which the Firestore security rules require for any write.
 */
export function isEmailVerified() {
  // Email verification is no longer required (the Firestore rules' verified()
  // helper was relaxed to signedIn()). Always report verified so the cloud-write
  // gate and the "belum diverifikasi" banner stay out of the way.
  return true;
}

/**
 * Re-fetch the Firebase user so a verification that just happened (the user
 * clicked the email link in another tab) is reflected without a full re-login.
 * Returns the up-to-date verified state.
 */
export async function reloadVerification() {
  if (_activeMode !== 'firebase' || !fbAuth || !fbAuth.currentUser) {
    return true;
  }
  try {
    await fbAuth.currentUser.reload();
    if (currentUser) {
      currentUser.emailVerified = !!fbAuth.currentUser.emailVerified;
    }
  } catch (e) {
    console.warn('[Auth] verification reload failed:', e);
  }
  return !!fbAuth.currentUser.emailVerified;
}

/**
 * (Re)send the verification email to the signed-in Firebase user. No-op (returns
 * true) when already verified. Throws on local sessions or transport errors.
 */
export async function resendVerification() {
  if (_activeMode !== 'firebase' || !fbAuth || !fbAuth.currentUser) {
    throw new Error('Verifikasi email hanya berlaku untuk login cloud (Firebase).');
  }
  if (fbAuth.currentUser.emailVerified) {
    return true;
  }
  await sendEmailVerification(fbAuth.currentUser);
  return true;
}

/** Whether the current credentials are still the first-run default. */
export function mustChangePassword() {
  const creds = loadCreds();
  return Boolean(creds && creds.mustChangePassword);
}

async function verifyCredentials(email, password) {
  const creds = await ensureCreds();
  if ((email || '').trim().toLowerCase() !== creds.email.toLowerCase()) {
    return false;
  }
  const hash = await hashPassword(password || '', creds.salt);
  return hash === creds.passwordHash;
}

/**
 * Wire up the login screen defined in index.html (#login-screen / #login-form)
 * and show it. On a successful login the page reloads so boot re-runs with a
 * valid session.
 */
export function setupLoginScreen() {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.style.display = 'none';
  }
  if (!loginScreen) {
    return;
  }
  loginScreen.style.display = '';

  // Theme toggle on the login screen (in-app toggle lives in nav.js, which
  // only loads after login). Uses the same 'erp_theme' key + data-theme attr.
  const themeBtn = document.getElementById('login-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next =
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('erp_theme', next);
      } catch (_) {
        /* ignore */
      }
    });
  }

  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  const emailInput = document.getElementById('login-email');

  const pwInput = document.getElementById('login-password');
  const pwToggle = document.getElementById('login-toggle-pw');
  if (pwInput && pwToggle) {
    const eyeOpen =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    const eyeClosed =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    pwToggle.addEventListener('click', () => {
      const show = pwInput.type === 'password';
      pwInput.type = show ? 'text' : 'password';
      pwToggle.innerHTML = show ? eyeClosed : eyeOpen;
      pwToggle.title = show ? 'Sembunyikan password' : 'Tampilkan password';
    });
  }

  const showError = msg => {
    if (!errorBox) {
      return;
    }
    errorBox.style.display = 'block';
    errorBox.style.background = 'var(--danger-bg)';
    errorBox.style.color = 'var(--danger)';
    errorBox.style.borderColor = 'var(--danger)';
    errorBox.textContent = msg;
  };

  // Show the default-login hint until the password has been changed — but only
  // in local (offline) mode. On a Firebase deployment the login page is public,
  // so advertising any credentials there is a security hole.
  const creds = loadCreds();
  if (!_useFirebase && creds && creds.mustChangePassword && errorBox) {
    errorBox.style.display = 'block';
    errorBox.style.background = 'var(--surface)';
    errorBox.style.color = 'var(--muted)';
    errorBox.style.borderColor = 'var(--border)';
    errorBox.textContent = `Login default — Email: ${DEFAULT_EMAIL} · Password: ${DEFAULT_PASSWORD}`;
  }

  // Prefill the default email only in local mode (no point hinting at account
  // names on a public Firebase login page).
  if (!_useFirebase && emailInput && !emailInput.value) {
    emailInput.value = DEFAULT_EMAIL;
  }

  if (!form) {
    return;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';
    }

    try {
      const result = await login(email, password);
      if (result.ok) {
        // Mark this browser as a returning user so the landing page's inline
        // smart-skip script sends them straight to /app on future visits.
        try {
          localStorage.setItem('cf-returning', '1');
        } catch (_) {
          /* ignore (private mode / storage disabled) */
        }
        window.location.reload();
        return;
      }
      showError(result.msg || 'Email atau password salah');
    } catch (err) {
      console.error('Login error:', err);
      showError('Terjadi kesalahan saat login');
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });

  const emailField = document.getElementById('login-email');
  if (emailField) {
    emailField.focus();
  }
}

export async function logout(message) {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
  clearSession();
  currentUser = null;
  if (_useFirebase && fbAuth) {
    try {
      await signOut(fbAuth);
    } catch (e) {
      console.warn('[Auth] Firebase signOut failed:', e);
    }
  }
  _activeMode = null;
  if (message) {
    alert(message);
  }
  window.location.reload();
}

/**
 * Change the login password. Verifies the current password first.
 * Called as changePassword(currentPassword, newPassword) from settings.js.
 */
export async function changePassword(currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password baru harus minimal 6 karakter');
  }

  // Firebase-authenticated session: reauthenticate, then update via Firebase.
  if (_activeMode === 'firebase' && _useFirebase && fbAuth && fbAuth.currentUser) {
    const user = fbAuth.currentUser;
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword || '');
      await reauthenticateWithCredential(user, cred);
    } catch {
      throw new Error('Password lama salah');
    }
    await updatePassword(user, newPassword);
    return true;
  }

  const creds = await ensureCreds();
  const currentHash = await hashPassword(currentPassword || '', creds.salt);
  if (currentHash !== creds.passwordHash) {
    throw new Error('Password lama salah');
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  saveCreds({ ...creds, salt, passwordHash, mustChangePassword: false });
  return true;
}
