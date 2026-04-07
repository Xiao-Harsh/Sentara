import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUESTIONS = [
  { id: 1, text: "Over the past week, how would you describe your overall mood?", type: 'choice', options: ["😊 Mostly positive", "🙂 Balanced", "😐 Neutral", "😟 Mostly low", "😣 Very low or distressing"] },
  { id: 2, text: "How has your stress level been throughout the week?", type: 'choice', options: ["😌 Very low", "🙂 Manageable", "😐 Moderate", "😣 High", "😫 Extremely high"] },
  { id: 3, text: "How was your energy level this week?", type: 'choice', options: ["⚡ Very energetic", "🙂 Normal", "😐 Low", "😣 Very low"] },
  { id: 4, text: "How well did you sleep on average this week?", type: 'choice', options: ["😴 Consistently restful", "🙂 Mostly good", "😕 Inconsistent", "😣 Poor sleep", "😫 Very disturbed"] },
  { id: 5, text: "How often did you feel overwhelmed this week?", type: 'choice', options: ["Never", "Rarely", "Sometimes", "Often", "Almost every day"] },
  { id: 6, text: "How often did you experience overthinking or constant worry?", type: 'choice', options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"] },
  { id: 7, text: "How often did you feel productive or motivated did you feel this week?", type: 'choice', options: ["💪 Highly productive", "🙂 Moderately productive", "😐 Slightly productive", "😞 Low productivity", "😫 No motivation"] },
  { id: 8, text: "How connected did you feel with others this week?", type: 'choice', options: ["🤝 Very connected", "🙂 Somewhat connected", "😐 Neutral", "😔 Isolated", "😞 Completely disconnected"] },
  { id: 9, text: "How well were you able to manage negative thoughts?", type: 'choice', options: ["😊 Very well", "🙂 Fairly well", "😐 Sometimes struggled", "😣 Often struggled", "😫 Could not manage"] },
  { id: 10, text: "How often did you intentionally do something to improve your mood (e.g., exercise, music, talking to someone)?", type: 'choice', options: ["Daily", "A few times", "Occasionally", "Rarely", "Not at all"] },
  { id: 11, text: "How was your focus and concentration this week?", type: 'choice', options: ["🎯 Very focused", "🙂 Mostly focused", "😕 Easily distracted", "😣 Often unable to focus", "😫 Couldn't concentrate"] },
  { id: 12, text: "How in control did you feel over your emotions and daily life?", type: 'choice', options: ["😌 Very in control", "🙂 Mostly in control", "😐 Sometimes unsure", "😣 Often out of control", "😫 Not in control at all"] },
  { id: 13, text: "Compared to last week, how has your mental well-being changed?", type: 'choice', options: ["📈 Much better", "🙂 Slightly improved", "😐 No change", "😟 Slightly worse", "📉 Much worse"] },
  { id: 14, text: "What has been on your mind the most this week? You can share anything freely.", type: 'text', hint: "Thought Reflection (Most Important)" },
];

const AssessmentScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const progressAnim = useRef(new Animated.Value(1 / 14)).current;

  const currentQ = QUESTIONS[currentIndex];

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: (currentIndex + 1) / QUESTIONS.length,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [currentIndex]);

  const handleSelect = (val) => {
    setAnswers({ ...answers, [currentQ.id]: val });

    if (currentQ.id === 9 && val === "Yes, more than once") {
      // In real Sentara: navigation.navigate('SOS')
    }
  };

  const handleNext = () => {
    if (currentIndex === QUESTIONS.length - 1) {
      navigation.replace('AssessmentResults', { answers });
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const isCurrentAnswered = () => {
    if (currentQ.type === 'text') return true;
    return answers[currentQ.id] !== undefined;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness Check-in</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* PROGRESS BAR (FIX 8A) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            })
          }]} />
        </View>
        <Text style={styles.progressText}>Step {currentIndex + 1} of 14</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <View style={styles.layoutBody}>
          {/* 35% TOP OFFSET SPACING ELEMENT */}
          <View style={styles.topSpacer} />

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQ.text}</Text>
            {currentQ.hint && <Text style={styles.hintText}>{currentQ.hint}</Text>}

            <View style={styles.optionsList}>
              {currentQ.type === 'choice' && currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.answerOption, isSelected && styles.answerSelected]}
                    onPress={() => handleSelect(opt)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.answerText, isSelected && styles.answerTextSelected]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}


              {currentQ.type === 'text' && (
                <View style={styles.textInputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Just type freely here..."
                    placeholderTextColor="#A8A8A8"
                    multiline
                    value={answers[currentQ.id] || ''}
                    onChangeText={handleSelect}
                  />
                  <Text style={styles.privacyNote}>This helps us understand you better</Text>
                </View>
              )}
            </View>
          </View>

          {/* FILL REMAINING SPACE */}
          <View style={styles.flex1} />
        </View>

        {/* FIXED BOTTOM ACTION */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, !isCurrentAnswered() && styles.nextBtnDisabled]}
            disabled={!isCurrentAnswered()}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextBtnText, !isCurrentAnswered() && styles.nextBtnDisabledText]}>
              {currentIndex === QUESTIONS.length - 1 ? 'See results' : 'Next'}
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
    backgroundColor: '#FFFFFF',
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#2DB87A',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#A8A8A8',
    textAlign: 'center',
    marginTop: 8,
  },
  layoutBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topSpacer: {
    flex: 0.35, // Position card 35% from top
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
  },
  questionText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 28.5,
  },
  hintText: {
    fontSize: 13,
    color: '#A8A8A8',
    marginTop: 8,
    marginBottom: 24,
  },
  optionsList: {
    marginTop: 8,
  },
  answerOption: {
    height: 62,
    backgroundColor: '#F8F8F8',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  answerSelected: {
    backgroundColor: '#E1F5EE',
    borderColor: '#2DB87A',
    borderWidth: 2,
  },
  answerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B6B6B',
  },
  answerTextSelected: {
    color: '#1F9962',
    fontWeight: '700',
  },
  privacyNote: {
    fontSize: 11,
    color: '#A8A8A8',
    textAlign: 'center',
    marginTop: 12,
  },
  textInputWrapper: {
    width: '100%',
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    height: 120,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  nextBtn: {
    height: 52,
    backgroundColor: '#2DB87A',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nextBtnDisabledText: {
    color: '#A8A8A8',
  },
});

export default AssessmentScreen;
