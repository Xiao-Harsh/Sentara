import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LanguageScreen from '../screens/onboarding/LanguageScreen';
import GoalsScreen from '../screens/onboarding/GoalsScreen';
import ToneScreen from '../screens/onboarding/ToneScreen';

const Stack = createNativeStackNavigator();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Tone" component={ToneScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;