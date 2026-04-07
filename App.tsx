import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, AppState, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AudioProvider } from './src/context/AudioContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen'; // Animated splash overlay
import './src/i18n';

/**
 * Root Application Component
 */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Re-apply immersive settings whenever app comes to foreground
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && Platform.OS === 'android') {
        initSystemBars();
      }
    };

    const initSystemBars = async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
      } catch (error) {
        console.warn('Navigation Bar init failed:', error);
      }
    };

    // Initial call
    if (Platform.OS === 'android') {
      initSystemBars();
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AudioProvider>
          <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          {/* Splash renders ABOVE everything — unmounts after animation finishes */}
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        </AudioProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}