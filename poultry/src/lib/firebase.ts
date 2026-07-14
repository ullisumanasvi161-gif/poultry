import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "reddy-poultry",
  appId: "1:992303089228:web:b2293a14de7e578ea216e9",
  storageBucket: "reddy-poultry.firebasestorage.app",
  apiKey: "AIzaSyAZ-DgObXGYeRdYP0Hlpq7wq-iNagCjz_o",
  authDomain: "reddy-poultry.firebaseapp.com",
  messagingSenderId: "992303089228",
  measurementId: "G-8HKW6EQ9MN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
