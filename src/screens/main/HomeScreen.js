import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  Image,
  Modal,
  ScrollView,
  Linking,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import Header from '../../components/Header';
import MoodCard from '../../components/MoodCard';
import SuggestionCard from '../../components/SuggestionCard';
import Loader from '../../components/Loader';
import ChatBottomSheet from '../../components/ChatBottomSheet';
import CrisisSupportModal from '../../components/CrisisSupportModal';
import { getEmotionTheme } from '../../utils/getEmotionTheme';
import { getIntensityLabel } from '../../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { emotions, patterns, stressLevel, streak, isRecent, loading, refreshData } = useUserData();
  const [chatVisible, setChatVisible] = useState(false);
  const [initialChatMode, setInitialChatMode] = useState('text');
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const [crisisModalVisible, setCrisisModalVisible] = useState(false);

  // Animations
  const sosScale = useRef(new Animated.Value(1)).current;
  const sosPulse = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [loading]);

  useEffect(() => {
    // SOS Pulse Animation
    const pulseAction = Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulse, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sosPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    );
    pulseAction.start();
    return () => pulseAction.stop();
  }, []);

  // if (loading) return <Loader />;
  if (loading) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return t('greeting.morning', 'Good Morning');
    if (hour >= 12 && hour < 17) return t('greeting.afternoon', 'Good Afternoon');
    return t('greeting.evening', 'Good Evening');
  };

  const openChat = (mode, message = '') => {
    setInitialChatMode(mode);
    setInitialChatMessage(message);
    setChatVisible(true);
  };

  const handleSOSPressIn = () => {
    Animated.spring(sosScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handleSOSPressOut = () => {
    Animated.spring(sosScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const latestEmotion = emotions && emotions.length > 0 ? emotions[0] : null;

  const getWeeklyStreak = () => {
    if (!emotions) return [];
    const loggedDates = new Set();
    emotions.forEach(e => {
      if (e.timestamp) {
        loggedDates.add(new Date(e.timestamp).toDateString());
      }
    });

    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isLogged = loggedDates.has(d.toDateString());
      week.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' })[0], // "M", "T"
        dateStr: d.getDate(),
        isLogged,
        isToday: i === 0
      });
    }
    return week;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      <Header
        title={`${getGreeting()}, \n${user?.displayName?.split(' ')[0] || t('common.there', 'there')}`}
        subtitle={t('home.mindful_space_ready', 'Your mindful space is ready.')}
        rightComponent={
          <TouchableOpacity onPress={() => setStreakModalVisible(true)} activeOpacity={0.7} style={styles.streakBadge}>
            <Text style={{ fontSize: 16 }}>🔥</Text>
            <Text style={styles.streakText}>{streak}</Text>
          </TouchableOpacity>
        }
      />

      <Animated.ScrollView
        style={[styles.scrollContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={colors.primary} />}
      >
        {/* CRISIS SUPPORT SOS CARD */}
        <View style={styles.sosCard}>
          <View style={styles.sosHeaderRow}>
            <View style={styles.sosTextContainer}>
              <Text style={styles.sosTitle}>{t('home.crisis_support', 'Crisis Support')}</Text>
              <Text style={styles.sosSubtitle}>{t('home.crisis_subtitle', "You're not alone. Help is always here.")}</Text>
            </View>
            <View style={styles.sosBadgeContainer}>
              <Animated.View style={[styles.sosPulseRing, { transform: [{ scale: sosPulse }] }]} />
              <View style={styles.sosBadge}>
                <Text style={styles.sosBadgeText}>SOS</Text>
              </View>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: sosScale }] }}>
            <TouchableOpacity
              style={styles.sosCtaButton}
              activeOpacity={0.9}
              onPressIn={handleSOSPressIn}
              onPressOut={handleSOSPressOut}
              onPress={() => setCrisisModalVisible(true)}
            >
              <LinearGradient
                colors={['#FF5252', '#D32F2F']}
                style={styles.sosGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.sosCtaText}>{t('home.i_need_help', 'I need help right now')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* QUICK CHECK-IN BOX */}
        <View style={styles.quickCheckInBox}>
          <Text style={styles.quickCheckInTitle}>{t('home.how_are_you_feeling', 'How are you feeling right now?')}</Text>
          <View style={styles.emojiRow}>
            {[
              { emoji: '😭', msg: "I'm feeling really down and overwhelmed today... I could use some support." },
              { emoji: '🙁', msg: "I'm not doing great. Things are feeling a bit heavy right now." },
              { emoji: '😐', msg: "I'm feeling alright, just neutral. Let's talk about how to stay balanced." },
              { emoji: '🙂', msg: "I'm feeling good! I'd like to share some positive energy." },
              { emoji: '🤩', msg: "I'm feeling amazing! Everything is going great and I'm full of joy." }
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={() => openChat('text', item.msg)}
                activeOpacity={0.6}
              >
                <Text style={styles.quickEmoji}>{item.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Chat Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.aiHeader}>
            <View style={styles.aiAvatarContainer}>
              <Image
                source={require('../../../assets/sentara-logo.png')}
                style={{ width: 44, height: 44, resizeMode: 'contain' }}
              />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.aiTextContent}>
              <Text style={styles.aiGreeting}>{t('home.sentara_ai', 'Sentara AI')}</Text>
              <Text style={styles.aiStatus}>{t('home.online_ready', 'Online • Ready to reflect')}</Text>
            </View>
          </View>

          <Text style={styles.heroSubtext}>{t('home.start_session', 'Start a session by speaking or typing.')} {t('home.builds_dashboard', 'Every interaction builds your personalized dashboard.')}</Text>

          <View style={styles.aiOptionsRow}>
            <TouchableOpacity
              style={styles.pillButton}
              onPress={() => openChat('voice')}
              activeOpacity={0.8}
            >
              <Text style={styles.pillButtonText}>🎤 {t('home.voice', 'Voice')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pillButton, styles.pillButtonPrimary]}
              onPress={() => openChat('text')}
              activeOpacity={0.8}
            >
              <Text style={styles.pillButtonTextPrimary}>💬 {t('home.chat', 'Chat')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIORITY 1: TODAY'S DATA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.sentiment', 'Sentiment')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.6}>
            <Text style={styles.seeAllText}>{t('home.stats', 'Stats')}</Text>
          </TouchableOpacity>
        </View>

        {(() => {
          if (!latestEmotion) {
            return (
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.emptyMoodCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.emptyMoodIconContainer}>
                  <Text style={{ fontSize: 26 }}>📈</Text>
                </View>
                <View style={styles.emptyMoodTextContent}>
                  <Text style={styles.emptyMoodTitle}>{t('home.start_journey', 'Start your journey')}</Text>
                  <Text style={styles.emptyMoodSubtitle}>{t('home.no_logs', "You haven't logged any moods yet. Tap below to do your first check-in — it takes 30 seconds.")}</Text>
                </View>
                <TouchableOpacity
                  style={styles.logMoodButton}
                  onPress={() => openChat('text')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logMoodButtonText}>{t('home.check_in', 'Check In')}</Text>
                </TouchableOpacity>
              </LinearGradient>
            );
          }

          const emotionString = latestEmotion.emotion || "Neutral";
          const intensity = latestEmotion.intensity || 5;

          const theme = getEmotionTheme(emotionString, intensity);
          const gradientColors = theme.colors;
          const emoji = theme.emoji;
          const description = theme.description;
          const iconBg = theme.iconBg;
          const primaryDark = theme.textColor;

          return (
            <LinearGradient
              colors={gradientColors}
              style={styles.activeMoodCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.moodHeaderRow}>
                <View style={[styles.moodIconWrapper, { backgroundColor: iconBg }]}>
                  <Text style={styles.moodEmojiLarge}>{emoji}</Text>
                </View>
                <View style={styles.moodTextWrapper}>
                  <Text style={[styles.moodEmotionTitle, { color: primaryDark }]}>{emotionString}</Text>
                  <View style={styles.intensityPill}>
                    <View style={[styles.intensityDot, { backgroundColor: primaryDark }]} />
                    <Text style={[styles.intensityText, { color: primaryDark }]}>{getIntensityLabel(intensity)} Intensity</Text>
                  </View>
                </View>
              </View>
              <View style={styles.moodDivider} />
              <Text style={[styles.moodDescriptionSmall, { color: primaryDark }]}>
                {description}
              </Text>
              {!isRecent && (
                <View style={styles.noRecentBadge}>
                  <Text style={styles.noRecentText}>No recent data (14 days+)</Text>
                </View>
              )}
            </LinearGradient>
          );
        })()}


        {/* Suggested Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.support_tools', 'Support Tools')}</Text>
        </View>

        {(() => {
          if (loading && (!emotions || !emotions.length)) return null;
          const latestSuggestions = (emotions && emotions.length > 0 && emotions[0].suggestions && emotions[0].suggestions.length > 0)
            ? emotions[0].suggestions
            : [
              { title: "Deep Breathing", description: "You completed 0 sessions this week.", icon: "🌬️" },
              { title: "Journaling", description: "You haven't logged a text session today.", icon: "✍️" }
            ];

          return latestSuggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              title={suggestion.title}
              description={suggestion.description}
              icon={suggestion.icon}
            />
          ));
        })()}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      <ChatBottomSheet
        isVisible={chatVisible}
        onClose={() => setChatVisible(false)}
        initialMode={initialChatMode}
        initialMessage={initialChatMessage}
        onChatComplete={refreshData}
      />

      <CrisisSupportModal
        isVisible={crisisModalVisible}
        onClose={() => setCrisisModalVisible(false)}
        onStartAiChat={() => {
          setCrisisModalVisible(false);
          openChat('text', 'I am feeling overwhelmed and need immediate support.');
        }}
      />

      <Modal
        visible={streakModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStreakModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStreakModalVisible(false)}
        >
          <View style={styles.streakModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalIconBg}>
              <Text style={{ fontSize: 32 }}>🔥</Text>
            </View>
            <Text style={styles.streakModalTitle}>Check-in Streak</Text>
            <Text style={styles.streakModalSubtitle}>{streak === 0 ? "Your streak starts today. Come back tomorrow to keep it going." : `Based on your logs, you've checked in for ${streak} consecutive days.`}</Text>

            <View style={styles.weeklyStreakRow}>
              {getWeeklyStreak().map((day, idx) => (
                <View key={idx} style={styles.streakDayCol}>
                  <Text style={[styles.streakDayName, day.isToday && styles.streakTodayText]}>{day.dayName}</Text>
                  <View style={[
                    styles.streakCircle,
                    day.isLogged ? styles.streakCircleActive : styles.streakCircleInactive,
                    day.isToday && !day.isLogged && styles.streakCircleToday
                  ]}>
                    {day.isLogged && <Text style={styles.streakCheckmark}>✓</Text>}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setStreakModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Awesome</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary,
  },
  quickCheckInBox: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickCheckInTitle: {
    ...typography.h3,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickEmoji: {
    fontSize: 26,
  },
  heroSection: {
    backgroundColor: colors.primary, // Premium Solid Background
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)', // Glass effect
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  aiTextContent: {
    flex: 1,
  },
  aiGreeting: {
    ...typography.h2,
    color: colors.surface,
  },
  aiStatus: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroSubtext: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    lineHeight: 24,
  },
  aiOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillButton: {
    flex: 0.48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },


  noRecentBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  noRecentText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  moodDescriptionSmall: {
    ...typography.bodySmall,
    fontSize: 13,
    lineHeight: 18,
  },
  moodDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },

  pillButtonPrimary: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pillButtonText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '700',
  },
  pillButtonTextPrimary: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    ...typography.body,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 6,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyMoodCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyMoodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emptyMoodTextContent: {
    flex: 1,
  },
  emptyMoodTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  emptyMoodSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  logMoodButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 12,
  },
  logMoodButtonText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '700',
  },
  activeMoodCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  moodHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moodEmojiLarge: {
    fontSize: 32,
  },
  moodTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  moodEmotionTitle: {
    ...typography.h1,
    fontSize: 24,
    marginBottom: 6,
  },
  intensityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  intensityText: {
    ...typography.caption,
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  moodDivider: {
    height: 1.5,
    width: '100%',
    marginVertical: 16,
    opacity: 0.6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  streakModalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakModalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
  },
  streakModalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  weeklyStreakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  streakDayCol: {
    alignItems: 'center',
  },
  streakDayName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  streakTodayText: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  streakCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCircleInactive: {
    backgroundColor: '#F1F5F9',
  },
  streakCircleActive: {
    backgroundColor: colors.primary,
  },
  streakCircleToday: {
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
  },
  streakCheckmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  closeModalButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  closeModalText: {
    ...typography.h3,
    color: colors.surface,
    fontSize: 16,
  },
  sosCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sosTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  sosTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sosSubtitle: {
    ...typography.bodySmall,
    color: '#A0A0A0',
  },
  sosBadgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
  },
  sosBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  sosBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  sosCtaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sosGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCtaText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});

export default HomeScreen;
