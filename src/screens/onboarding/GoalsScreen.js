import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import OptionCard from '../../components/OptionCard';
import ChatButton from '../../components/ChatButton';

const GoalsScreen = ({ navigation, route }) => {
  const [selectedGoals, setSelectedGoals] = useState([]);

  const goals = [
    { id: '1', title: 'Manage Stress', icon: '🧘' },
    { id: '2', title: 'Improve Sleep', icon: '😴' },
    { id: '3', title: 'Understand Patterns', icon: '📈' },
    { id: '4', title: 'Daily Journaling', icon: '✍️' },
    { id: '5', title: 'Better Relationships', icon: '🤝' },
  ];

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleNext = () => {
    navigation.navigate('Tone', { ...route.params, goals: selectedGoals });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Goals</Text>
          <Text style={styles.subtitle}>What would you like to achieve for your mental wellness?</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {goals.map((goal) => (
            <OptionCard
              key={goal.id}
              title={goal.title}
              icon={goal.icon}
              isSelected={selectedGoals.includes(goal.title)}
              onPress={() => toggleGoal(goal.title)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <ChatButton 
            title="Next Step" 
            onPress={handleNext} 
            disabled={selectedGoals.length === 0}
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

export default GoalsScreen;