import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';

/**
 * Handles user sign in.
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Sign In Error:', error);
    return { user: null, error: error.message };
  }
};

/**
 * Handles user registration.
 */
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Sign Up Error:', error);
    return { user: null, error: error.message };
  }
};

/**
 * Handles user sign out.
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Log Out Error:', error);
    return { error: error.message };
  }
};

/**
 * Updates the user's profile information (display name).
 */
export const updateUserProfile = async (displayName) => {
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
      return { error: null };
    }
    return { error: 'No user signed in' };
  } catch (error) {
    console.error('Update Profile Error:', error);
    return { error: error.message };
  }
};

/**
 * Listens for authentication state changes.
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default {
  signIn,
  signUp,
  logOut,
  updateUserProfile,
  subscribeToAuthChanges,
};