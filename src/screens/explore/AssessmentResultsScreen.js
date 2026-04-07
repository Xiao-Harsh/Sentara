import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { saveAssessmentResult } from '../../services/dbService';
import llmApi from '../../services/llmApi';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AssessmentResultsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const userName = user?.displayName || 'there';
  const answers = route.params?.answers || {};

  const [saving, setSaving] = React.useState(false);
  const [dynamicReport, setDynamicReport] = React.useState(null);

  // SCORING LOGIC (DYNAMIC 14-POINT)
  const calculateResults = () => {
    const questions = [
      { id: 1, type: 'pos', cat: 'Mood' },
      { id: 2, type: 'pos', cat: 'Stress' },
      { id: 3, type: 'pos', cat: 'Energy' },
      { id: 4, type: 'pos', cat: 'Sleep' },
      { id: 5, type: 'pos', cat: 'Stress' },
      { id: 6, type: 'pos', cat: 'Stress' },
      { id: 7, type: 'pos', cat: 'Output' },
      { id: 8, type: 'pos', cat: 'Connection' },
      { id: 9, type: 'pos', cat: 'Mood' },
      { id: 10, type: 'pos', cat: 'Connection' },
      { id: 11, type: 'pos', cat: 'Output' },
      { id: 12, type: 'pos', cat: 'Mood' },
      { id: 13, type: 'pos', cat: 'Mood' },
    ];

    const categoryScores = { Mood: [], Stress: [], Energy: [], Sleep: [], Output: [], Connection: [] };

    questions.forEach(q => {
      const answer = answers[q.id];
      if (answer === undefined) return;

      // Find index in options to calculate score
      // ALL options are ordered from Positive/Low Stress to Negative/High Stress
      // except Q10 (Frequency), Q13 (Change)
      // Actually, looking at the user questions:
      // Q1: Pos (0) to Neg (4) -> Mostly Positive (0) is high score.
      // Q2: Low Stress (0) to High Stress (4) -> Very Low (0) is high score.
      // Q3: High Energy (0) to Low Energy (3) -> Very Energetic (0) is high score.
      // So universally (except maybe Q10), index 0 is the "best" result.
      
      const qConfig = [
        ["😊 Mostly positive", "🙂 Balanced", "😐 Neutral", "😟 Mostly low", "😣 Very low or distressing"],
        ["😌 Very low", "🙂 Manageable", "😐 Moderate", "😣 High", "😫 Extremely high"],
        ["⚡ Very energetic", "🙂 Normal", "😐 Low", "😣 Very low"],
        ["😴 Consistently restful", "🙂 Mostly good", "😕 Inconsistent", "😣 Poor sleep", "😫 Very disturbed"],
        ["Never", "Rarely", "Sometimes", "Often", "Almost every day"],
        ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
        ["💪 Highly productive", "🙂 Moderately productive", "😐 Slightly productive", "😞 Low productivity", "😫 No motivation"],
        ["🤝 Very connected", "🙂 Somewhat connected", "😐 Neutral", "😔 Isolated", "😞 Completely disconnected"],
        ["😊 Very well", "🙂 Fairly well", "😐 Sometimes struggled", "😣 Often struggled", "😫 Could not manage"],
        ["Daily", "A few times", "Occasionally", "Rarely", "Not at all"],
        ["🎯 Very focused", "🙂 Mostly focused", "😕 Easily distracted", "😣 Often unable to focus", "😫 Couldn't concentrate"],
        ["😌 Very in control", "🙂 Mostly in control", "😐 Sometimes unsure", "😣 Often out of control", "😫 Not in control at all"],
        ["📈 Much better", "🙂 Slightly improved", "😐 No change", "😟 Slightly worse", "📉 Much worse"]
      ][q.id - 1];

      const idx = qConfig.indexOf(answer);
      if (idx !== -1) {
        // Score = 100 - (percentage of index). e.g. Index 0 of 5 = 100%. Index 4 of 5 = 0%.
        const score = 100 - (idx / (qConfig.length - 1)) * 100;
        categoryScores[q.cat].push(score);
      }
    });

    const average = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50;

    const results = {
      overall: Math.round(Object.values(categoryScores).flat().reduce((a, b) => a + b, 0) / Object.values(categoryScores).flat().length),
      categories: [
        { name: 'Mood & Balance', score: average(categoryScores.Mood), color: '#2DB87A' },
        { name: 'Stress Relief', score: average(categoryScores.Stress), color: '#F0A023' },
        { name: 'Energy & Sleep', score: average([...categoryScores.Energy, ...categoryScores.Sleep]), color: '#185FA5' },
        { name: 'Focus & Productivity', score: average(categoryScores.Output), color: '#534AB7' },
        { name: 'Social Connection', score: average(categoryScores.Connection), color: '#993C1D' },
      ],
      raw: categoryScores
    };

    return results;
  };

  const results = calculateResults();
  const overallScore = results.overall;
  const categories = results.categories;

  const handleSave = async (target = 'Explore') => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await saveAssessmentResult(user.uid, {
        score: overallScore,
        categories: categories,
        answers: answers
      });
      if (target === 'Explore') {
        navigation.navigate('Main', { screen: 'Explore' });
      } else {
        navigation.navigate('Main', { screen: 'History' }); // Placeholder
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const getEmpatheticMsg = (score) => {
    if (score < 40) return "This is a safe space, and we're here to help you find some calm.";
    if (score < 70) return "You're managing, but taking some time for yourself could really help.";
    return "You're in a strong place. Let's keep that momentum going.";
  };

  const animValues = useRef(categories.map(() => new Animated.Value(0))).current;
  const circleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [
      ...categories.map((cat, index) => (
        Animated.timing(animValues[index], {
          toValue: cat.score / 100,
          duration: 800,
          delay: 200 + index * 100,
          useNativeDriver: false,
        })
      )),
      Animated.timing(circleAnim, {
        toValue: overallScore / 100,
        duration: 1000,
        useNativeDriver: false,
      })
    ];

    // Ensure reset before animation
    circleAnim.setValue(0);
    animValues.forEach(v => v.setValue(0));
    
    Animated.parallel(animations).start();
  }, [overallScore]); // Re-run if overallScore changes

  useEffect(() => {
    const fetchReport = async () => {
      // Prevent multiple calls if report already exists
      if (dynamicReport) return;
      
      // Pass the category scores and the free text thought (Q14)
      const formattedScores = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.score;
        return acc;
      }, { Overall: overallScore });

      const report = await llmApi.generateAssessmentReport(formattedScores, answers[14]);
      if (report) {
        setDynamicReport(report);
      }
    };
    fetchReport();
  }, []); // Run ONLY once on mount to prevent 429 API rate limits

  // SVG CIRCLE CONSTANTS
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.summaryTitle}>Assessment results</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.introBlock}>
          <Text style={styles.title}>Your results are ready, {userName}.</Text>
          <Text style={styles.subtitle}>{getEmpatheticMsg(overallScore)}</Text>
        </View>

        {/* OVERALL SCORE CIRCLE (FIXED TO PROGRESS) */}
        <View style={styles.scoreSection}>
          <View style={styles.circleContainer}>
            <Svg width={size} height={size} style={styles.svg}>
              {/* Background Circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#F0F9F5"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress Circle Layer */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#2DB87A"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [circumference, 0]
                })}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <View style={styles.scoreTextOverlay}>
              <Text style={styles.scoreNumber}>{overallScore}</Text>
              <Text style={styles.scoreMax}>out of 100</Text>
            </View>
          </View>
          <Text style={styles.scoreLabel}>Overall wellness score</Text>
        </View>

        {/* BREAKDOWN (ONE-VIEW OPTIMIZED) */}
        <View style={styles.breakdownList}>
          {categories.map((cat, idx) => (
            <View key={idx} style={styles.barItem}>
              <View style={styles.barTop}>
                <Text style={styles.barName}>{cat.name}</Text>
                <Text style={styles.barPercent}>{cat.score}%</Text>
              </View>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: cat.color,
                      width: animValues[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* COMPACT RECOMMENDATIONS */}
        <View style={styles.reportContainer}>
          <Text style={styles.reportHeader}>🧠 AI Wellness Report</Text>
          
          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>👤 Current State</Text>
            <Text style={styles.reportText}>
              {dynamicReport ? dynamicReport : (overallScore < 40 
                ? "You appear to be going through a highly stressful phase right now. Your responses indicate a tendency to hold onto tension, affecting your focus and energy. Give yourself permission to pause—your mind is asking for a break."
                : results.categories[1].score < 50 
                  ? "You are currently operating under significant pressure. While you remain productive, your stress levels are elevated. It's important to find small moments to decompress before you hit burnout."
                  : results.categories[2].score < 50
                    ? "Your energy levels and sleep patterns are currently compromised. You seem to be pushing through fatigue, which might be impacting your overall mood. Prioritizing rest is your biggest need right now."
                    : results.categories[4].score < 50
                      ? "You are currently feeling somewhat disconnected. Your answers suggest you might be isolating yourself more than usual. Reaching out to a trusted friend could significantly boost your mood."
                      : "You are currently in a very balanced and stable state. Your responses show a strong resilience to stress and an ability to maintain focus. Keep leaning into the positive habits you've built!"
              )}
            </Text>
          </View>

          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>🥗 Diet Suggestion</Text>
            <Text style={styles.reportText}>
              {results.categories[1].score < 55 
                ? "Eat leafy greens & walnuts. They contain Magnesium to help calm your stress."
                : results.categories[2].score < 55
                  ? "Try oats & B-vitamin rich eggs. They provide steady energy to fight fatigue."
                  : results.categories[3].score < 55
                    ? "Focus on blueberries & dark chocolate. These boost concentration and mental clarity."
                    : "Stick to antioxidant-rich berries to maintain your current high mental energy."
              }
            </Text>
          </View>

          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>💧 Hydration Tracker</Text>
            <Text style={styles.reportText}>
              {results.categories[3].score < 55 
                ? "Drink 3.0L Water. Hydration is the fastest way to fix your low focus today." 
                : "Aim for 2.5L Water to keep your mood and physical energy stable."}
            </Text>
          </View>

          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>✨ Suggested Activities</Text>
            <View style={styles.activityRow}>
              {results.categories[1].score < 60 && (
                <TouchableOpacity style={styles.activityPill} onPress={() => navigation.navigate('GameBreathing')}>
                  <Text style={styles.activityPillText}>🌬️ Mindful Breathing</Text>
                </TouchableOpacity>
              )}
              {results.categories[3].score < 60 && (
                <TouchableOpacity style={styles.activityPill} onPress={() => navigation.navigate('GameThoughtShift')}>
                  <Text style={styles.activityPillText}>🧩 Thought Shift</Text>
                </TouchableOpacity>
              )}
              {overallScore >= 60 && (
                <TouchableOpacity style={styles.activityPill} onPress={() => navigation.navigate('WalkingExercise')}>
                  <Text style={styles.activityPillText}>🚶 Mindful Walking</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.shareReportBtn} 
            onPress={() => {
              const reportText = `🧠 Sentara Weekly Wellness Report for ${userName}\n` +
                `Overall Score: ${overallScore}/100\n\n` +
                `Thoughts: ${answers[14] || 'None shared'}\n\n` +
                `Recommendations:\n- Diet: ${results.categories[1].score < 50 ? 'Magnesium & Omega-3 focused' : 'Balanced & Antioxidant-rich'}\n` +
                `- Hydration: Aim for 3L daily\n` +
                `- Activity: ${overallScore < 60 ? 'Mindful Breathing' : 'Mindful Walking'}`;
              Share.share({ message: reportText });
            }}
          >
            <Text style={styles.shareReportBtnText}>📤 Share/Download Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.mainCta, saving && { opacity: 0.5 }]}
            onPress={() => handleSave('Explore')}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.mainCtaText}>Go to recommended tools</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ghostBtn, saving && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#A8A8A8" />
            ) : (
              <Text style={styles.ghostBtnText}>Save assessment to history</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  summaryTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  introBlock: {
    marginTop: 4,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginTop: 8,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circleContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  svg: {
    position: 'absolute',
  },
  scoreTextOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: '#1A1A1A', // Neutral black for better readability inside green ring
  },
  scoreMax: {
    fontSize: 11,
    color: '#A8A8A8',
    marginTop: -4,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2DB87A', // Highlighting the goal
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  breakdownList: {
    marginBottom: 24,
  },
  barItem: {
    marginBottom: 12,
  },
  barTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  barPercent: {
    fontSize: 12,
    color: '#A8A8A8',
    fontWeight: '600',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipsCard: {
    backgroundColor: '#F9FBFB',
    borderWidth: 1,
    borderColor: '#E1F5EE',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tipText: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 18,
    flex: 1,
  },
  buttonGroup: {
    width: '100%',
  },
  mainCta: {
    backgroundColor: '#2DB87A',
    height: 52,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2DB87A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  mainCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ghostBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostBtnText: {
    color: '#A8A8A8',
    fontSize: 14,
    fontWeight: '600',
  },
  reportContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E1F5EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  reportHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  reportSection: {
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F6E56',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
  },
  activityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  activityPill: {
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1F5EE',
  },
  activityPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F6E56',
  },
  shareReportBtn: {
    backgroundColor: '#1A1A1A',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  shareReportBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AssessmentResultsScreen;
