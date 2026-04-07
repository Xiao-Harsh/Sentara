import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { subscribeToAuthChanges } from '../services/authService';
import { getOnboardingData, getUserProfile } from '../services/dbService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Auth subscription — only runs once on mount
    const unsubscribeAuth = subscribeToAuthChanges(async (authUser) => {
      try {
        if (authUser) {
          // Fetch status data from database
          const onboardingData = await getOnboardingData(authUser.uid);
          const profileData = await getUserProfile(authUser.uid);
          
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            onboardingCompleted: !!onboardingData,
            gender: profileData?.gender || null,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth subscription:', error);
        setUser(null); // Default to no user on error
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Handle App State changes (Minimize/Switch) — independent of auth
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }
      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, [appState]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, appState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;