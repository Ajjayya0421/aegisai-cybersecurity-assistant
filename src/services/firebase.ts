import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App safely
const app = getApps().length === 0 ? initializeApp(firebaseConfigJson) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
try {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (e) {
  console.warn('Could not set custom params on googleProvider:', e);
}

// Initialize Cloud Firestore safely with fallback
let firestoreDb: Firestore;
try {
  if (firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)') {
    firestoreDb = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
  } else {
    firestoreDb = getFirestore(app);
  }
} catch (err) {
  console.warn('Failed to initialize Firestore with custom ID, trying default:', err);
  try {
    firestoreDb = getFirestore(app);
  } catch (defaultErr) {
    console.error('Fatal Firestore init error:', defaultErr);
    firestoreDb = getFirestore(app);
  }
}

export const db = firestoreDb;
export default app;

