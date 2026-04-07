import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import ExerciseContainer from '../../../components/exercises/ExerciseContainer';
import useExerciseFlow from '../../../hooks/useExerciseFlow';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const GROUNDING_STEPS = [
  { id: 5, label: 'SEE', prompt: 'Name 5 things you can see around you right now.', icon: '👁️' },
  { id: 4, label: 'FEEL', prompt: 'Name 4 things you can feel (e.g., texture of your shirt, the chair).', icon: '🖐️' },
  { id: 3, label: 'HEAR', prompt: 'Name 3 things you can hear (e.g., birds, traffic, your breath).', icon: '👂' },
  { id: 2, label: 'SMELL', prompt: 'Name 2 things you can smell (or favorite smells).', icon: '👃' },
  { id: 1, label: 'TASTE', prompt: 'Name 1 thing you can taste (or a flavor you enjoy).', icon: '👅' },
];

const GroundingExerciseScreen = ({ navigation }) => {
  const { step, startExercise, completeExercise, timeSpent } = useExerciseFlow(navigation);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [textInput, setTextInput] = useState('');

  const nextSubStep = () => {
    if (currentSubStep < GROUNDING_STEPS.length - 1) {
      setCurrentSubStep(currentSubStep + 1);
      setTextInput('');
    } else {
      completeExercise();
    }
  };

  const renderInstructions = () => (
    <View style={styles.contentPad}>
      <Text style={styles.title}>5-4-3-2-1 Grounding</Text>
      <Text style={styles.description}>
        This sensory exercise helps pull you out of anxiety or spiraling thoughts by reconnecting your mind to the physical world.
      </Text>
      
      <View style={styles.benefitPill}>
        <Text style={styles.benefitPillText}>Ideal for panic or high stress</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => startExercise()}>
        <Text style={styles.primaryBtnText}>Start Grounding</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExercise = () => {
    const current = GROUNDING_STEPS[currentSubStep];
    const progress = ((currentSubStep + 1) / GROUNDING_STEPS.length) * 100;

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.exerciseArea} keyboardShouldPersistTaps="handled">
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.stepCircle}>
            <Text style={styles.stepIcon}>{current.icon}</Text>
            <Text style={styles.stepLabel}>{current.id} {current.label}</Text>
          </View>

          <Text style={styles.promptText}>{current.prompt}</Text>

          <TextInput
            style={styles.input}
            placeholder="Write here (optional)..."
            placeholderTextColor="rgba(0,0,0,0.3)"
            value={textInput}
            onChangeText={setTextInput}
            multiline
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={nextSubStep}>
            <Text style={styles.primaryBtnText}>
              {currentSubStep === GROUNDING_STEPS.length - 1 ? 'Finish' : 'Next Step'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderCompletion = () => (
    <View style={styles.contentPad}>
      <View style={styles.doneIcon}><Text style={{fontSize: 50}}>🌍</Text></View>
      <Text style={styles.title}>Grounding Complete.</Text>
      <Text style={styles.resultsText}>You are back in the present moment.</Text>
      
      <View style={styles.benefitsBox}>
        <Text style={styles.benefitTitle}>What changed?</Text>
        <Text style={styles.benefitItem}>• Calmed nervous system</Text>
        <Text style={styles.benefitItem}>• Interrupted racing thoughts</Text>
        <Text style={styles.benefitItem}>• Reconnected with your body</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.primaryBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ExerciseContainer 
      title="Grounding" 
      onExit={() => navigation.goBack()}
      gradientColors={['#EFF6FF', '#DBEAFE']} // Soft Blue
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
    marginBottom: 24,
  },
  benefitPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 40,
  },
  benefitPillText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '700',
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
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    marginBottom: 48,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  stepCircle: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  stepLabel: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  promptText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 44,
    paddingHorizontal: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    height: 160,
    textAlignVertical: 'top',
    marginBottom: 40,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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

export default GroundingExerciseScreen;
