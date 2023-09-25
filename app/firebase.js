import firebase, { getApp, getApps } from 'firebase/app'
import "firebase/auth"

import { initializeApp, } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAs-_3_7wjeOL3ZJkEz3M-Hb57ekAODvqs",
  authDomain: "relly-8d881.firebaseapp.com",
  databaseURL: "https://relly-8d881-default-rtdb.firebaseio.com",
  projectId: "relly-8d881",
  storageBucket: "relly-8d881.appspot.com",
  messagingSenderId: "10387202088",
  appId: "1:10387202088:web:0e8d8d86d0fc08d260d51d"
};

// Initialize Firebase
const app = getApps().length ? getApp():  initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth()

export {app, auth,db}