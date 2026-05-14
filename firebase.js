// firebase.js — Firebase initialization for SFS Routine App
// Checks getApps().length to avoid re-initializing if already set up by main portal

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // ← Replace with actual key
  authDomain: "st-francis-school-a3e7e.firebaseapp.com",
  projectId: "st-francis-school-a3e7e",
  storageBucket: "st-francis-school-a3e7e.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",   // ← Replace with actual sender ID
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXX" // ← Replace with actual app ID
};

// Guard: do not re-initialize if main portal already initialized Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db  = getFirestore(app);
export const auth = getAuth(app);
export default app;
