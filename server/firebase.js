const firebaseApp = require('firebase/app');
const { getApp, getApps } = firebaseApp;
require("firebase/auth");
const { initializeApp } = firebaseApp;
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const admin = require('firebase-admin');
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const apiKey = process.env.FIREBASE_API_KEY

const firebaseConfig = {
  apiKey ,
  authDomain: "relly-8d881.firebaseapp.com",
  projectId: "relly-8d881",
  storageBucket: "relly-8d881.appspot.com",
  messagingSenderId: "10387202088",
  appId: "1:10387202088:web:0e8d8d86d0fc08d260d51d"
}

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://relly-8d881-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { auth, db, firebaseConfig }