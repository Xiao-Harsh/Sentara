import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import OptionCard from '../../components/OptionCard';
import ChatButton from '../../components/ChatButton';
import { useAuth } from '../../hooks/useAuth';
import { saveOnboardingData } from '../../services/dbService';

const ToneScreen = ({ navigation, route }) => {
  const [selectedTone, setSelectedTone] = useState('Empathetic');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();

  const tones = [
    { id: '1', title: 'Empathetic', icon: '💖' },
    { id: '2', title: 'Professional', icon: '👔' },
    { id: '3', title: 'Motivational', icon: '💪' },
    { id: '4', title: 'Casual', icon: '😎' },
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      const onboardingData = {
        ...route.params,
        tone: selectedTone,
        completedAt: Date.now(),
      };

      if (user && user.uid) {
        const success = await saveOnboardingData(user.uid, onboardingData);
        if (success) {
          // Immediately update the user state in context to trigger navigator change
          setUser({ ...user, onboardingCompleted: true });
        } else {
          Alert.alert('Error', 'Could not save your preferences. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error in onboarding completion:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Tone</Text>
          <Text style={styles.subtitle}>Choose how your mental wellness companion should interact with you</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {tones.map((tone) => (
            <OptionCard
              key={tone.id}
              title={tone.title}
              icon={tone.icon}
              isSelected={selectedTone === tone.title}
              onPress={() => setSelectedTone(tone.title)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <ChatButton 
            title="Complete Setup" 
            onPress={handleFinish} 
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 32,
    marginBottom: 40,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 24,
  }
});

export default ToneScreen;