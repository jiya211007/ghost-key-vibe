import { signInWithGoogle as firebaseSignInWithGoogle } from '../config/firebase.js';
import api from '../config/api.js';

// Google Sign-In with backend integration
export const googleSignIn = async () => {
  try {
    // Step 1: Sign in with Google Firebase
    const firebaseResult = await firebaseSignInWithGoogle();
    
    if (!firebaseResult.success) {
      throw new Error(firebaseResult.error || 'Google Sign-In failed');
    }

    const { user } = firebaseResult;

    // Step 2: Send Google user data to our backend
    const backendResponse = await api.post('/auth/google-signin', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    });

    if (backendResponse.data.success) {
      // Store access token
      const { accessToken } = backendResponse.data.data;
      localStorage.setItem('accessToken', accessToken);

      return {
        success: true,
        user: backendResponse.data.data.user,
        message: 'Google Sign-In successful!'
      };
    } else {
      throw new Error(backendResponse.data.message || 'Backend authentication failed');
    }

  } catch (error) {
    console.error('Google Sign-In Error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        error: 'Sign-in was cancelled. Please try again.'
      };
    } else if (error.code === 'auth/popup-blocked') {
      return {
        success: false,
        error: 'Pop-up was blocked. Please allow pop-ups and try again.'
      };
    }

    return {
      success: false,
      error: error.message || 'Google Sign-In failed. Please try again.'
    };
  }
};

// Google Sign-Up (same as sign-in, backend will handle user creation)
export const googleSignUp = async () => {
  return await googleSignIn(); // Same process, backend will create account if needed
};
