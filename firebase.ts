/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA33bV8ZVrjQs0Hi4bVwQBRURM2zMfTLCQ",
  authDomain: "audiovitality-clinical-t-afd34.firebaseapp.com",
  projectId: "audiovitality-clinical-t-afd34",
  storageBucket: "audiovitality-clinical-t-afd34.firebasestorage.app",
  messagingSenderId: "937653154040",
  appId: "1:937653154040:web:3458af35c5d1f23e40cb0d",
  measurementId: "G-D07K6ZTJYV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
