import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
// Firebase configuration from environment variables (Vite prefix VITE_)
const firebaseConfig = {
  apiKey: import.meta.env.AIzaSyCtDtaUSRBfFqHWrLJxSOCf1tkCoHBABLw,
  authDomain: import.meta.env.gen-lang-client-0857775553.firebaseapp.com,
  projectId: import.meta.env.gen-lang-client-0857775553,
  storageBucket: import.meta.env.gen-lang-client-0857775553.firebasestorage.app,
  messagingSenderId: import.meta.env.265345450031,
  appId: import.meta.env.1:265345450031:web:c0021dca323ea90912c6da,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)'
};

// Global flags and instances
let app;
let db: any;
let auth: any;
let googleProvider: any;

// Safe initialization
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { db, auth, googleProvider };

// Validation test - only if initialized
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Expected in many cases
  }
}
testConnection();

export const signInWithGoogle = () => {
  if (!auth || !googleProvider) {
    console.error("Firebase Auth or Google Provider not initialized");
    return Promise.reject("Firebase not initialized");
  }
  return signInWithPopup(auth, googleProvider);
};

export const logout = () => {
  if (!auth) {
    console.error("Firebase Auth not initialized");
    return Promise.resolve();
  }
  return signOut(auth);
};
