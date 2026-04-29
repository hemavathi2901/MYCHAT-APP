import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth,GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getDatabase} from "firebase/database";

// Replace these values with the ones from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBzqHtgoEz3Y7w8dKi9Un0x1_PLMatX6WE",
  authDomain: "mychat-68f7b.firebaseapp.com",
  projectId: "mychat-68f7b",
  storageBucket: "mychat-68f7b.firebasestorage.app",
  messagingSenderId: "1066904553831",
  appId: "1:1066904553831:web:1e200cd7590d5923e507c2",
  measurementId: "G-5W418KGN9Z"
};



console.log("API KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("APP ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
// Next.js fix: Check if Firebase is already initialized to prevent errors during reload
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export const rtdb = getDatabase(app);
// export default app;