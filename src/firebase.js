// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Add these imports at the top
import { doc, setDoc, getDoc } from "firebase/firestore";

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

// Add these functions at the bottom
const getUserProfile = async (userId) => {
    try {
        const docRef = doc(db, "userProfiles", userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

const updateUserProfile = async (userId, profileData) => {
    try {
        const docRef = doc(db, "userProfiles", userId);
        await setDoc(docRef, profileData, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating user profile:", error);
        return false;
    }
};

// Export the new functions
export { auth, db, storage, signInWithGoogle, getUserProfile, updateUserProfile };


