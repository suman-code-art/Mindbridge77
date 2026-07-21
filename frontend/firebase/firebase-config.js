// ==========================================================
// MINDBRIDGE - FIREBASE CONFIGURATION
// File: firebase/firebase-config.js
// ==========================================================


// ==========================================================
// IMPORT FIREBASE APP
// ==========================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


// ==========================================================
// IMPORT FIREBASE AUTHENTICATION
// ==========================================================

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// IMPORT CLOUD FIRESTORE
// ==========================================================

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ==========================================================
// FIREBASE WEB CONFIGURATION
// ==========================================================
//
// IMPORTANT:
//
// Replace the values below with YOUR existing Firebase
// configuration values.
//
// Do NOT put your Gemini API key here.
// Do NOT put Firebase Admin credentials here.
// Do NOT put serviceAccountKey.json information here.
//
// ==========================================================

const firebaseConfig = {
  apiKey: "AIzaSyC7-XxzTyXgYfCjxShhFy9eoVA1VxwQZ4k",
  authDomain: "mindbridge-b5c43.firebaseapp.com",
  projectId: "mindbridge-b5c43",
  storageBucket: "mindbridge-b5c43.firebasestorage.app",
  messagingSenderId: "118350479114",
  appId: "1:118350479114:web:98d2d022953a895309c4f3",
  measurementId: "G-P0D4XF6M80"
};



// ==========================================================
// INITIALIZE FIREBASE
// ==========================================================

const app =
    initializeApp(
        firebaseConfig
    );



// ==========================================================
// INITIALIZE FIREBASE AUTHENTICATION
// ==========================================================

const auth =
    getAuth(
        app
    );



// ==========================================================
// INITIALIZE CLOUD FIRESTORE
// ==========================================================

const db =
    getFirestore(
        app
    );



// ==========================================================
// EXPORT FIREBASE SERVICES
// ==========================================================

export {
    app,
    auth,
    db
};