import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz2WmPv04c8hhVi-fErQ51QJId8GjOG-8",
  authDomain: "blog-vibe-9de48.firebaseapp.com",
  projectId: "blog-vibe-9de48",
  storageBucket: "blog-vibe-9de48.firebasestorage.app",
  messagingSenderId: "53320671277",
  appId: "1:53320671277:web:2605bbb645721b5f5c58a4",
  measurementId: "G-138XGC94R4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google Sign-In function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Extract user information
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Sign out function
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

export default app;
