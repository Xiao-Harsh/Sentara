import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import ExerciseContainer from '../../../components/exercises/ExerciseContainer';
import useTimer from '../../../hooks/useTimer';
import useExerciseFlow from '../../../hooks/useExerciseFlow';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const { width } = Dimensions.get('window');

const BreathingExerciseScreen = ({ navigation }) => {
  const { step, duration, setDuration, startExercise, completeExercise, resetFlow, timeSpent } = useExerciseFlow(navigation);
  const { timeLeft, isActive, start, formattedTime } = useTimer(duration, completeExercise);

  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold (Box Breathing)
  const circleScale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Box Breathing Cycle: 4-4-4-4
  useEffect(() => {
    let interval;
    if (step === 1 && isActive) {
      const runCycle = () => {
        // INHALE
        setPhase('Inhale');
        Animated.timing(circleScale, {
          toValue: 2,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          // HOLD
          setPhase('Hold');
          setTimeout(() => {
            // EXHALE
            setPhase('Exhale');
            Animated.timing(circleScale, {
              toValue: 1,
              duration: 4000,
              easing: Easing.linear,
              useNativeDriver: true,
            }).start(() => {
              // HOLD
              setPhase('Hold');
            });
          }, 4000);
        });
      };

      runCycle();
      interval = setInterval(runCycle, 16000); // Full cycle is 16s
    }
    return () => clearInterval(interval);
  }, [step, isActive]);

  const renderInstructions = () => (
    <View style={styles.contentPad}>
      <Text style={styles.title}>Box Breathing</Text>
      <Text style={styles.description}>
        A simple technique used by athletes and Navy SEALs to regain focus and calm the nervous system.
      </Text>
      
      <View style={styles.stepsBox}>
        <View style={styles.stepItem}><Text style={styles.stepNum}>1</Text><Text style={styles.stepText}>Inhale deeply for 4 seconds</Text></View>
        <View style={styles.stepItem}><Text style={styles.stepNum}>2</Text><Text style={styles.stepText}>Hold your breath for 4 seconds</Text></View>
        <View style={styles.stepItem}><Text style={styles.stepNum}>3</Text><Text style={styles.stepText}>Exhale slowly for 4 seconds</Text></View>
        <View style={styles.stepItem}><Text style={styles.stepNum}>4</Text><Text style={styles.stepText}>Hold your breath for 4 seconds</Text></View>
      </View>

      <Text style={styles.label}>Choose duration:</Text>
      <View style={styles.durationRow}>
        {[60, 180, 300].map((sec) => (
          <TouchableOpacity 
            key={sec} 
            style={[styles.durationPill, duration === sec && styles.durationPillActive]}
            onPress={() => setDuration(sec)}
          >
            <Text style={[styles.durationText, duration === sec && styles.durationTextActive]}>
              {sec / 60}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => { startExercise(duration); start(); }}>
        <Text style={styles.primaryBtnText}>Start Exercise</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExercise = () => (
    <View style={styles.exerciseArea}>
      <Animated.View style={[styles.circle, { transform: [{ scale: circleScale }] }]}>
        <View style={styles.innerCircle} />
      </Animated.View>
      
      <View style={styles.guidanceRow}>
        <Text style={styles.phaseText}>{phase}</Text>
        <Text style={styles.timerLarge}>{formattedTime}</Text>
      </View>
    </View>
  );

  const renderCompletion = () => (
    <View style={styles.contentPad}>
      <View style={styles.doneIcon}><Text style={{fontSize: 50}}>🧘</Text></View>
      <Text style={styles.title}>Well done.</Text>
      <Text style={styles.resultsText}>You spent {timeSpent} focusing on your breath.</Text>
      
      <View style={styles.benefitsBox}>
        <Text style={styles.benefitTitle}>Benefits of this session:</Text>
        <Text style={styles.benefitItem}>• Lowered heart rate</Text>
        <Text style={styles.benefitItem}>• Reduced anxiety levels</Text>
        <Text style={styles.benefitItem}>• Improved mental clarity</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.primaryBtnText}>Back to Explore</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ExerciseContainer 
      title="Breathing" 
      onExit={() => navigation.goBack()}
      gradientColors={step === 1 ? ['#065F46', '#064E3B'] : ['#F0FDFA', '#CCFBF1']}
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
  stepsBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  durationPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  durationTextActive: {
    color: '#fff',
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
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  guidanceRow: {
    marginTop: 100,
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  timerLarge: {
    fontSize: 64,
    fontWeight: '700',
    color: '#fff',
    opacity: 0.7,
    letterSpacing: 2,
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

export default BreathingExerciseScreen;
