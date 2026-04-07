import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import TabNavigator from './TabNavigator';
import ChatScreen from '../screens/main/ChatScreen';
import AssessmentScreen from '../screens/explore/AssessmentScreen';
import AssessmentResultsScreen from '../screens/explore/AssessmentResultsScreen';
import MindfulBreathingGame from '../screens/explore/games/MindfulBreathingGame';
import ThoughtShiftGame from '../screens/explore/games/ThoughtShiftGame';
import BubblePopGame from '../screens/explore/games/BubblePopGame';
import ThoughtReframeScreen from '../screens/explore/games/ThoughtReframeScreen';
import GamesListScreen from '../screens/explore/GamesListScreen';
import DailyPracticeDetailScreen from '../screens/explore/DailyPracticeDetailScreen';
import Loader from '../components/Loader';
import BreathingExerciseScreen from '../screens/explore/exercises/BreathingExerciseScreen';
import GroundingExerciseScreen from '../screens/explore/exercises/GroundingExerciseScreen';
import WalkingExerciseScreen from '../screens/explore/exercises/WalkingExerciseScreen';
import SoundCategoryScreen from '../screens/explore/SoundCategoryScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !user.onboardingCompleted ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Assessment" component={AssessmentScreen} />
          <Stack.Screen name="AssessmentResults" component={AssessmentResultsScreen} />
          <Stack.Screen name="GameBreathing" component={MindfulBreathingGame} />
          <Stack.Screen name="GameThoughtShift" component={ThoughtShiftGame} />
          <Stack.Screen name="GameBubblePop" component={BubblePopGame} />
          <Stack.Screen name="ThoughtReframe" component={ThoughtReframeScreen} />
          <Stack.Screen name="GamesList" component={GamesListScreen} />
          <Stack.Screen name="DailyPracticeDetail" component={DailyPracticeDetailScreen} />
          <Stack.Screen name="BreathingExercise" component={BreathingExerciseScreen} />
          <Stack.Screen name="GroundingExercise" component={GroundingExerciseScreen} />
          <Stack.Screen name="WalkingExercise" component={WalkingExerciseScreen} />
          <Stack.Screen name="SoundCategory" component={SoundCategoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;