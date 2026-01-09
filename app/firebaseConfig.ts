// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsHi9_c8SPOL5AGsFNDtfEXXaqN2A1b8M",
  authDomain: "mindful-today-5th-app.firebaseapp.com",
  projectId: "mindful-today-5th-app",
  storageBucket: "mindful-today-5th-app.appspot.com", 
  messagingSenderId: "241201641945",
  appId: "1:241201641945:web:5d6b0e45c2682aaa0a41c8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services export
export const auth = getAuth(app);
export const db = getFirestore(app);




