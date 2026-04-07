import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  RefreshControl,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { getLatestAssessmentResult, getDailyToolLogs } from '../../services/dbService';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import RelaxSoundSection from '../../components/relax/RelaxSoundSection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// SVG COMPONENTS FOR ICONS
const BreathingIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="12" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M10 16C10 19.3137 12.6863 22 16 22C19.3137 22 22 19.3137 22 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
  </Svg>
);

const ThoughtShiftIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Path d="M22 8L26 12L22 16M26 12H10C7.79086 12 6 13.7909 6 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 24L6 20L10 16M6 20H22C24.2091 20 26 18.2091 26 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);



const BubblePopIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.8" />
    <Circle cx="20" cy="18" r="4" stroke={color} strokeWidth="1.8" />
    <Circle cx="14" cy="22" r="3" stroke={color} strokeWidth="1.8" />
  </Svg>
);

const GroundingIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Path d="M16 8V24M8 16H24" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Circle cx="16" cy="16" r="8" stroke={color} strokeWidth="1.8" strokeDasharray="4 4" />
  </Svg>
);

const WalkingIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Path d="M12 24L14 20M20 24L18 20M16 20V12M16 12L14 8M16 12L18 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="16" cy="6" r="2" stroke={color} strokeWidth="1.8" />
  </Svg>
);

// Tool Icons (20px)
const JournalIcon = ({ color }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path d="M4 19V5C4 3.89543 4.89543 3 6 3H18V21H6C4.89543 21 4 20.1046 4 19Z" stroke={color} strokeWidth="1.6" />
    <Path d="M8 7H14M8 11H14M8 15H11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

const StarIcon = ({ color }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
  </Svg>
);

const BodyIcon = ({ color }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Circle cx="12" cy="6" r="3" stroke={color} strokeWidth="1.6" />
    <Path d="M12 9V21M12 12H8M12 12H16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

const CardsIcon = ({ color }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path d="M21 11.5C21 15.5868 16.9706 19 12 19C10.5181 19 9.12457 18.6946 7.9 18.15L3 20L4.5 15.75C3.55938 14.5654 3 13.1206 3 11.5C3 7.41319 7.02944 4 12 4C16.9706 4 21 7.41319 21 11.5Z" stroke={color} strokeWidth="1.6" />
    <Circle cx="8" cy="11.5" r="1" fill={color} />
    <Circle cx="12" cy="11.5" r="1" fill={color} />
    <Circle cx="16" cy="11.5" r="1" fill={color} />
  </Svg>
);

const ExploreScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { emotions, loading, wellnessScore, refreshData } = useUserData();
  const [refreshing, setRefreshing] = useState(false);
  const [toolLogs, setToolLogs] = useState([]);
  const [assessment, setAssessment] = useState({ score: '--', date: 'Never' });
  const isFocused = useIsFocused();

  const loadAssessment = async () => {
    if (user?.uid) {
      const latest = await getLatestAssessmentResult(user.uid);
      if (latest) {
        const days = Math.floor((Date.now() - latest.timestamp) / (1000 * 60 * 60 * 24));
        setAssessment({
          score: latest.score,
          date: days === 0 ? 'today' : `${days} days ago`
        });
      }
    }
  };

  const loadToolLogs = async () => {
    if (user?.uid) {
      const logs = await getDailyToolLogs(user.uid);
      setToolLogs(logs);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadAssessment(),
      loadToolLogs(),
      refreshData()
    ]);
    setRefreshing(false);
  };

  React.useEffect(() => {
    if (isFocused) {
      loadAssessment();
      loadToolLogs();
    }
  }, [user, isFocused]);

  const getBannerState = () => {
    if (!emotions || emotions.length === 0) {
      return {
        bg: colors.primary,
        textColor: '#FFFFFF',
        label: 'START WITH A CHECK-IN',
        suggestion: 'How are you feeling?',
        pills: [{ label: 'Take Assessment', action: 'assessment' }, { label: 'Explore Games', action: 'games' }],
      };
    }

    const latestMood = emotions[0];
    const em = (latestMood.emotion || '').toLowerCase();
    const intensityStr = (latestMood.intensity || '').toString().toLowerCase().trim();
    const isHighIntensity = intensityStr === 'high' || intensityStr === 'very high';
    const isSad = em.includes('stres') || em.includes('anxi') || em.includes('sad') || em.includes('angry') || em.includes('overwhelm') || em.includes('frustrat') || isHighIntensity;
    const isHappy = em.includes('happy') || em.includes('joy') || em.includes('calm') || em.includes('excit');

    if (isHappy) {
      return {
        bg: '#1A1A1A',
        textColor: '#FFFFFF',
        label: 'BASED ON YOUR LAST CHECK-IN',
        suggestion: "Keep the momentum going",
        pills: [{ label: 'Thought Shift', action: 'game2' }, { label: 'Bubble Pop', action: 'game4' }],
      };
    } else if (isSad) {
      return {
        bg: '#E8453C',
        textColor: '#FFFFFF',
        label: 'BASED ON YOUR LAST CHECK-IN',
        suggestion: 'Breathing might help now',
        pills: [{ label: 'Mindful Breathing', action: 'game1' }, { label: 'Bubble Pop', action: 'game4' }],
      };
    } else {
      return {
        bg: colors.primary,
        textColor: '#FFFFFF',
        label: 'BASED ON YOUR LAST CHECK-IN',
        suggestion: 'A good moment to check in',
        pills: [{ label: 'Take Assessment', action: 'assessment' }, { label: 'Thought Shift', action: 'game2' }],
      };
    }
  };

  const handleBannerAction = (action) => {
    if (action === 'assessment') navigation.navigate('Assessment');
    else if (action === 'game1') navigation.navigate('GameBreathing');
    else if (action === 'game2') navigation.navigate('GameThoughtShift');
    else if (action === 'game4') navigation.navigate('GameBubblePop');
  };

  const bannerData = getBannerState();

  const lastScore = assessment.score;
  const refreshedText = assessment.date === 'Never' ? 'Take your first assessment' : `Refreshed ${assessment.date}`;

  const games = [
    { id: '1', name: 'Mindful Breathing', tag: 'Find your center with deep breath work', duration: '5 mins', bg: '#D4EAFB', stroke: '#185FA5', icon: (c) => <BreathingIcon color={c} />, screen: 'GameBreathing' },
    { id: '2', name: 'Thought Shift', tag: 'Reframe negative patterns instantly', duration: '3 mins', bg: '#E8E4FC', stroke: '#534AB7', icon: (c) => <ThoughtShiftIcon color={c} />, screen: 'GameThoughtShift' },
    { id: '4', name: 'Bubble Pop', tag: 'Physically release tension and stress', duration: '2-3 min', bg: '#FCE4E0', stroke: '#993C1D', icon: (c) => <BubblePopIcon color={c} />, screen: 'GameBubblePop' },
  ];

  const exercises = [
    { id: '1', image: require('../../../assets/breathingg.png'), duration: '5 mins', screen: 'BreathingExercise' },
    { id: '2', image: require('../../../assets/54321grounding.png'), duration: '3 mins', screen: 'GroundingExercise' },
    { id: '3', image: require('../../../assets/walking.png'), duration: '10 mins', screen: 'WalkingExercise' },
  ];

  const tools = [
    { id: '1', name: 'Emotion journal', desc: 'Write and reflect freely', icon: (c) => <JournalIcon color={c} />, bg: '#E1F5EE', stroke: '#0F6E56', actionType: 'write' },
    { id: '2', name: 'Gratitude log', desc: "3 things you're grateful for", icon: (c) => <StarIcon color={c} />, bg: '#FAEEDA', stroke: '#854F0B', actionType: 'log' },
    { id: '3', name: 'Body scan', desc: '5-min awareness guide', icon: (c) => <BodyIcon color={c} />, bg: '#EEEDFE', stroke: '#534AB7', actionType: 'scan' },
    { id: '4', name: 'Affirmation cards', desc: 'One card, every day', icon: (c) => <CardsIcon color={c} />, bg: '#FCE4E0', stroke: '#993C1D', actionType: 'cards' },
  ];

  const handleToolAction = (tool) => {
    navigation.navigate('DailyPracticeDetail', {
      toolId: tool.id,
      title: tool.name,
      description: tool.desc,
      actionType: tool.actionType,
    });
  };

  const isCompletedToday = (toolId) => {
    if (!toolLogs || toolLogs.length === 0) return false;

    const today = new Date().toDateString();
    return toolLogs.some(log =>
      log.toolId === toolId &&
      new Date(log.timestamp).toDateString() === today
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('explore.title', 'Explore')}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* PREMIUM BANNER (REDESIGNED) */}
        <View style={[styles.premiumBanner, { backgroundColor: bannerData.bg }]}>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerLabel}>{bannerData.label}</Text>
            <Text style={styles.bannerSuggestion}>{bannerData.suggestion}</Text>
          </View>
          <View style={styles.bannerActionRow}>
            {bannerData.pills.map((pill, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.bannerButton}
                onPress={() => handleBannerAction(pill.action)}
                activeOpacity={0.8}
              >
                <Text style={[styles.bannerButtonText, { color: bannerData.bg === '#1A1A1A' ? '#1A1A1A' : bannerData.bg }]}>
                  {pill.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ASSESSMENT STATUS (CLEANER) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('explore.your_wellbeing', 'Your Wellbeing')}</Text>
        </View>
        <View style={styles.assessmentCardLarge}>
          <View style={styles.cardTop}>
            <Text style={styles.scoreBig}>{lastScore}</Text>
            <View>
              <Text style={styles.scoreUnit}>{t('explore.wellbeing_score', 'Wellbeing Score')}</Text>
              <Text style={styles.scoreSub}>{refreshedText}</Text>
            </View>
          </View>
          <View style={styles.scoreTrackLarge}>
            <View style={[styles.scoreFillLarge, { width: lastScore === '--' ? 0 : `${lastScore}%` }]} />
          </View>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => navigation.navigate('Assessment')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryActionText}>{t('explore.retake_assessment', 'Retake Assessment')}</Text>
          </TouchableOpacity>
        </View>

        {/* EXERCISE SECTION (NEW) */}
        <View style={[styles.sectionHeader, { marginTop: 0 }]}>
          <Text style={styles.sectionTitle}>{t('explore.exercise', 'Exercise')}</Text>
        </View>
        <View style={{ marginBottom: 28 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gamesScroll}>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCardSquare}
                onPress={() => exercise.screen && navigation.navigate(exercise.screen)}
                activeOpacity={0.9}
              >
                <Image 
                  source={exercise.image} 
                  style={styles.exerciseImage}
                />
                <View style={styles.exerciseDurationOverlay}>
                  <Text style={styles.durationText}>{exercise.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* MIND RELAX SOUNDS (NEW) */}
        <RelaxSoundSection 
          onCategoryPress={(category) => navigation.navigate('SoundCategory', { category })} 
        />

        {/* WELLNESS GAMES (SPACIOUS) */}
        <View style={[styles.sectionHeader, { marginTop: 4 }]}>
          <Text style={styles.sectionTitle}>{t('explore.mindful_games', 'Mindful Games')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('GamesList')}><Text style={styles.linkText}>{t('explore.view_all', 'View All →')}</Text></TouchableOpacity>
        </View>
        <View style={{ marginBottom: 28 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gamesScroll}>
            {games.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.gameCardLarge}
                onPress={() => navigation.navigate(game.screen)}
                activeOpacity={0.9}
              >
                <View style={[styles.gameIconCircle, { backgroundColor: game.bg }]}>
                  {game.icon(game.stroke)}
                </View>
                <View style={styles.gameContent}>
                  <Text style={styles.gameName}>{game.name}</Text>
                  <Text style={styles.gameTag} numberOfLines={2}>{game.tag}</Text>
                  <View style={styles.durationPill}>
                    <Text style={styles.durationText}>{game.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* DAILY TOOLS (DYNAMIC) */}
        <View style={[styles.sectionHeader, { marginTop: 4 }]}>
          <Text style={styles.sectionTitle}>{t('explore.daily_practices', 'Daily Practices')}</Text>
        </View>
        <View style={styles.toolsList}>
          {tools.map((tool) => {
            const isDone = isCompletedToday(tool.id);
            return (
              <View key={tool.id} style={styles.toolCardPremium}>
                <View style={[styles.toolIconWrap, { backgroundColor: tool.bg }]}>
                  {tool.icon(tool.stroke)}
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolTitle}>{tool.name}</Text>
                  <Text style={styles.toolDesc}>{tool.desc}</Text>
                  <View style={styles.toolStatusRow}>
                    <View style={[styles.statusIndicator, { backgroundColor: isDone ? '#2DB87A' : '#A8A8A8' }]} />
                    <Text style={styles.statusLabel}>{isDone ? 'Finished for today' : 'Available now'}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.toolActionBtn, isDone && styles.toolActionBtnDone]}
                  onPress={() => handleToolAction(tool)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toolActionText, isDone && styles.toolActionTextDone]}>
                    {isDone ? 'Review' : 'Start'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  premiumBanner: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  bannerInfo: {
    marginBottom: 16,
  },
  bannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bannerSuggestion: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  bannerActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    height: 38,
    borderRadius: 50,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  assessmentCardLarge: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    marginBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scoreSub: {
    fontSize: 13,
    color: '#A8A8A8',
    marginTop: 2,
  },
  scoreTrackLarge: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  scoreFillLarge: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  primaryActionBtn: {
    backgroundColor: '#F0F9F5',
    height: 52,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  gamesScroll: {
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  gameCardLarge: {
    width: 170,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginRight: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  exerciseCardSquare: {
    width: 160,
    height: 160,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  exerciseDurationOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gameName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  gameTag: {
    fontSize: 12,
    color: '#6B6B6B',
    lineHeight: 16,
    marginTop: 4,
  },
  durationPill: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A8A8A8',
  },
  toolsList: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  toolCardPremium: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  toolIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  toolDesc: {
    fontSize: 12,
    color: '#6B6B6B',
    marginTop: 1,
  },
  toolStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    color: '#A8A8A8',
    fontWeight: '500',
  },
  toolActionBtn: {
    backgroundColor: '#2DB87A15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toolActionBtnDone: {
    backgroundColor: '#F5F5F5',
  },
  toolActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  toolActionTextDone: {
    color: '#A8A8A8',
  },
});

export default ExploreScreen;
