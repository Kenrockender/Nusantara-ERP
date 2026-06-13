// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration. Exported so data modules can skip doomed Firestore
// calls (which otherwise retry for ~30s) when credentials are absent.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isFirebaseConfigured) {
  console.warn(
    '⚠ Firebase configuration missing — running with local default data. Copy .env.example to .env to enable cloud sync.'
  );
}

// Initialize Firebase only when credentials are present.
// Without this guard, initializeApp() throws auth/invalid-api-key when env
// vars are missing (e.g. Vercel preview without secrets), crashing the entire
// module graph before any UI can render.
let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // This project's Firestore database has ID "default" (a NAMED database), not
  // the standard "(default)". getFirestore(app) targets "(default)" and would
  // 404; pass the real database ID explicitly. Override via VITE_FIREBASE_DB_ID
  // if you later create a standard "(default)" database (set it to "(default)").
  db = getFirestore(app, import.meta.env.VITE_FIREBASE_DB_ID || 'default');
  storage = getStorage(app);
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    analytics = getAnalytics(app);
  }
}

// Connect to emulators in development (only when Firebase is configured)
if (isFirebaseConfigured && import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log('🔧 Connected to Firebase Emulators');
}

export { app, auth, db, storage, analytics };
