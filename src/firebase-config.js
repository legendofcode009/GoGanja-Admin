// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore/lite";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8gIP2FTt-zp5oHm81sfPAbj20Notzq1Q",
  authDomain: "goganja-a18f4.firebaseapp.com",
  projectId: "goganja-a18f4",
  storageBucket: "goganja-a18f4.appspot.com",
  messagingSenderId: "290280809723",
  appId: "1:290280809723:web:4d4d406e66a3c205bf7c5e",
  measurementId: "G-9SMWZWD40S",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

export { auth, db, storage };
