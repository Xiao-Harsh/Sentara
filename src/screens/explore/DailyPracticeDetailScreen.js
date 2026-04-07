import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { saveDailyToolLog } from '../../services/dbService';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DailyPracticeDetailScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { toolId, title, description, actionType } = route.params;
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPlaceholder = () => {
    switch (actionType) {
      case 'write': return 'How are you feeling today? Write your thoughts here...';
      case 'log': return "1. \n2. \n3. ";
      case 'scan': return 'How does your body feel after the scan? Any areas of tension?';
      case 'cards': return 'How did this affirmation resonate with you today?';
      default: return 'Start writing...';
    }
  };

  const getPrompt = () => {
    switch (actionType) {
      case 'write': return 'Take a moment to let your thoughts flow without judgment.';
      case 'log': return 'Focus on three specific things that brought you peace or joy.';
      case 'scan': return 'Check in with yourself from head to toe. What did you notice?';
      case 'cards': return 'An affirmation is a seed for a more peaceful mind.';
      default: return 'Reflect on your practice.';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before completing your practice.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveDailyToolLog(user?.uid, {
        toolId,
        title,
        content,
        type: actionType,
      });

      Alert.alert(
        'Practice Completed',
        'Your daily practice has been logged. Great job!',
        [{ text: 'Great', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Could not save your practice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 80 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.introBox}>
            <Text style={styles.practiceDesc}>{description}</Text>
            <Text style={styles.promptText}>{getPrompt()}</Text>
          </View>

          <View style={styles.inputCard}>
            <TextInput
              style={styles.textArea}
              placeholder={getPlaceholder()}
              placeholderTextColor={colors.textLight}
              multiline
              value={content}
              onChangeText={setContent}
            />
          </View>
        </ScrollView>

        {/* STICKY BOTTOM BUTTON */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.submitBtn, (!content.trim() || isSubmitting) && styles.submitBtnDisabled]}
            disabled={!content.trim() || isSubmitting}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Saving...' : 'Complete Practice'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 90,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 20,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  backBtn: {
    width: 80,
    height: 44,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    flexGrow: 1,
  },
  introBox: {
    marginBottom: 32,
  },
  practiceDesc: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    minHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  textArea: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlignVertical: 'top',
    height: '100%',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonWrapper: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DailyPracticeDetailScreen;
