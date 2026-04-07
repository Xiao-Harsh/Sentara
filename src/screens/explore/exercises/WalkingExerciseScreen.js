import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import ExerciseContainer from '../../../components/exercises/ExerciseContainer';
import useTimer from '../../../hooks/useTimer';
import useExerciseFlow from '../../../hooks/useExerciseFlow';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const WALKING_PROMPTS = [
  'Notice the weight of each foot as it touches the ground.',
  'Observe the rhythm of your breath as you move.',
  'Listen to the subtle sounds of your environment.',
  'Feel the air on your skin and the wind around you.',
  'Pay attention to the colors and shapes you see.',
  'Relax your shoulders and let your arms swing naturally.',
  'Be completely present with each step you take.',
];

const WalkingExerciseScreen = ({ navigation }) => {
  const { step, duration, startExercise, completeExercise, timeSpent } = useExerciseFlow(navigation);
  const { timeLeft, isActive, start, formattedTime } = useTimer(duration, completeExercise);

  const [promptIndex, setPromptIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Nature background animation (subtle drifting shapes)
  const drift1 = useRef(new Animated.Value(0)).current;
  const drift2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === 1 && isActive) {
      // Prompt Cycling
      const promptInterval = setInterval(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }).start(() => {
          setPromptIndex((prev) => (prev + 1) % WALKING_PROMPTS.length);
          Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
        });
      }, 10000);

      // Nature Animation
      const animateDrift = (anim) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 20000 + Math.random() * 10000, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 20000 + Math.random() * 10000, easing: Easing.linear, useNativeDriver: true }),
          ])
        ).start();
      };

      animateDrift(drift1);
      animateDrift(drift2);
      
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

      return () => clearInterval(promptInterval);
    }
  }, [step, isActive]);

  const renderInstructions = () => (
    <View style={styles.contentPad}>
      <Text style={styles.title}>Mindful Walking</Text>
      <Text style={styles.description}>
        An active meditation technique to bring awareness to your body and environment while moving.
      </Text>
      
      <View style={styles.box}>
        <Text style={styles.boxTitle}>How to practice:</Text>
        <Text style={styles.boxText}>Walk at a natural pace. Keep your eyes open but focus your internal awareness on the physical sensations of movement.</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => { startExercise(300); start(); }}>
        <Text style={styles.primaryBtnText}>Start 5-Min Walk</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExercise = () => (
    <View style={styles.exerciseArea}>
      {/* Immersive Background Decorations */}
      <Animated.View style={[styles.natureBlob, { 
        top: '20%', 
        left: '-10%', 
        transform: [{ translateX: drift1.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) }] 
      }]} />
      <Animated.View style={[styles.natureBlob, { 
        bottom: '10%', 
        right: '-10%', 
        backgroundColor: 'rgba(255,255,255,0.05)',
        transform: [{ translateX: drift2.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) }] 
      }]} />

      <View style={styles.timerRow}>
        <Text style={styles.timerText}>{formattedTime} remaining</Text>
      </View>

      <Animated.View style={[styles.promptContainer, { opacity: fadeAnim }]}>
        <Text style={styles.walkingPrompt}>{WALKING_PROMPTS[promptIndex]}</Text>
      </Animated.View>

      <View style={styles.footstepIcon}><Text style={{fontSize: 40, opacity: 0.2}}>👣</Text></View>
    </View>
  );

  const renderCompletion = () => (
    <View style={styles.contentPad}>
      <View style={styles.doneIcon}><Text style={{fontSize: 50}}>🚶‍♂️</Text></View>
      <Text style={styles.title}>Walk Complete.</Text>
      <Text style={styles.resultsText}>You walked mindfully for {timeSpent}.</Text>
      
      <View style={styles.benefitsBox}>
        <Text style={styles.benefitTitle}>Benefits:</Text>
        <Text style={styles.benefitItem}>• Grounded energy</Text>
        <Text style={styles.benefitItem}>• Mental clarity through movement</Text>
        <Text style={styles.benefitItem}>• Reconnection with environment</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.primaryBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ExerciseContainer 
      title="Mindful Walking" 
      onExit={() => navigation.goBack()}
      gradientColors={step === 1 ? ['#1E3A8A', '#1E3A8A'] : ['#ECFDF5', '#D1FAE5']}
      isDark={step === 1}
    >
      {step === 0 && renderInstructions()}
      {step === 1 && renderExercise()}
      {step === 2 && renderCompletion()}
    </ExerciseContainer>
  );
};

const styles = StyleSheet.create({
  contentPad: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  box: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 48,
  },
  boxTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    marginBottom: 8,
  },
  boxText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    ...typography.button,
    color: '#fff',
  },
  exerciseArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  natureBlob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  timerRow: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  promptContainer: {
    width: '100%',
    alignItems: 'center',
  },
  walkingPrompt: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  footstepIcon: {
    position: 'absolute',
    bottom: 60,
  },
  doneIcon: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  resultsText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  benefitsBox: {
    marginBottom: 40,
  },
  benefitTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    marginBottom: 12,
  },
  benefitItem: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});

export default WalkingExerciseScreen;
