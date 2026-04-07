import { useAuthContext } from '../context/AuthContext';
import { signIn, signUp, logOut, updateUserProfile } from '../services/authService';
import { saveUserProfile } from '../services/dbService';

export const useAuth = () => {
  const { user, loading, setUser } = useAuthContext();

  const handleSignIn = async (email, password) => {
    const { user: authUser, error } = await signIn(email, password);
    if (authUser) {
      setUser({
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
      });
    }
    return { user: authUser, error };
  };

  const handleSignUp = async (email, password, displayName) => {
    const { user: authUser, error } = await signUp(email, password, displayName);
    if (authUser) {
      setUser({
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
      });
    }
    return { user: authUser, error };
  };

  const handleLogOut = async () => {
    const { error } = await logOut();
    if (!error) {
      setUser(null);
    }
    return { error };
  };

  const handleUpdateUserProfile = async (newDisplayName, newGender) => {
    let error = null;

    // Update Firebase Auth if name changed
    if (newDisplayName && newDisplayName !== user?.displayName) {
      const { error: authError } = await updateUserProfile(newDisplayName);
      if (authError) error = authError;
    }

    // Update Realtime DB for Gender (and Name sync)
    if (!error) {
      const success = await saveUserProfile(user.uid, {
        displayName: newDisplayName || user.displayName,
        gender: newGender || user.gender,
        updatedAt: Date.now(),
      });
      if (!success) error = 'Failed to save profile details to database';
    }

    if (!error && user) {
      setUser({
        ...user,
        displayName: newDisplayName || user.displayName,
        gender: newGender || user.gender,
      });
    }

    return { error };
  };

  return {
    user,
    loading,
    setUser,
    signIn: handleSignIn,
    signUp: handleSignUp,
    logOut: handleLogOut,
    updateProfile: handleUpdateUserProfile,
  };
};

export default useAuth;