// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBpdNsnBdInQv3mVsMvzr_PwDCOzRb3cw8",
    authDomain: "extension-e7604.firebaseapp.com",
    projectId: "extension-e7604",
    storageBucket: "extension-e7604.firebasestorage.app",
    messagingSenderId: "321576555908",
    appId: "1:321576555908:web:50526dece986898aaef9d1",
    measurementId: "G-K0982J26ZY"
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Google authentication provider and sign-in function
const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error(error);
    }
};

// Export Firebase objects and functions
export { auth, db, storage, signInWithGoogle };
