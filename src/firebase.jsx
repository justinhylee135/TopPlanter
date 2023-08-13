// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore utilities
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-sgv_E4AD1rMIllAMZ1J87zEsDG9FBEU",
  authDomain: "topplanter-8497c.firebaseapp.com",
  projectId: "topplanter-8497c",
  storageBucket: "topplanter-8497c.appspot.com",
  messagingSenderId: "859785954462",
  appId: "1:859785954462:web:27fc3fe36227869950678f",
  measurementId: "G-PQG30B1NZL",
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    return null;
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); // Initialize and export Firestore database reference
export const storage = getStorage(app);