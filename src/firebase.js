import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const configuracionFirebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const VARIABLES_FIREBASE_FALTANTES = Object.entries(configuracionFirebase)
  .filter(([, valor]) => typeof valor !== 'string' || valor.trim().length === 0)
  .map(([campo]) => ({
    apiKey: 'VITE_FIREBASE_API_KEY',
    authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
    projectId: 'VITE_FIREBASE_PROJECT_ID',
    storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'VITE_FIREBASE_APP_ID',
  })[campo]);

export const firebaseConfigurado = VARIABLES_FIREBASE_FALTANTES.length === 0;

let appFirebase = null;
let auth = null;
let db = null;

if (firebaseConfigurado) {
  appFirebase = initializeApp(configuracionFirebase);
  auth = getAuth(appFirebase);
  db = getFirestore(appFirebase);
}

export { appFirebase, auth, db };
