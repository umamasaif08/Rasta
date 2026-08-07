import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Firebase client config — safe to be public.
// Real security lives entirely in Firestore Security Rules.
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard: warn clearly in dev if any required value is missing
if (process.env.NODE_ENV === "development") {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => `NEXT_PUBLIC_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`);
  if (missing.length) {
    console.warn(
      "[firebase] Missing env vars — check .env.local:\n" + missing.join("\n")
    );
  }
}

// Prevent duplicate initialization across Next.js hot reloads
function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

// Lazy singletons — avoids SSR crashes when the module is imported
// in server components that don't actually call Firebase
let _db:   Firestore | null = null;
let _auth: Auth | null      = null;

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(app);
  return _db;
}

export function getAuthInstance(): Auth {
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

// Convenience direct exports for client components
export const db   = getFirestore(app);
export const auth = getAuth(app);
export default app;
