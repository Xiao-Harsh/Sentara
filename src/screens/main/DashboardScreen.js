import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserData } from '../../hooks/useUserData';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Emerald green
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: colors.primary
  }
};

const DashboardScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { emotions, patterns, wellnessScore, isRecent, loading, refreshData } = useUserData();

  // Aggregate Data for Charts and Suggestions
  const { chartData, latestEmotion } = useMemo(() => {
    if (!emotions || emotions.length === 0) return { chartData: null, latestEmotion: null };

    // 1. Process recent logs grouped by day for the line chart (Intensity trend)
    const groupedByDay = {};

    [...emotions].forEach((e) => {
      if (!e.timestamp) return;
      const dateObj = new Date(e.timestamp);
      const dateKey = dateObj.toDateString();

      let numVal = 5;
      const val = e.intensity;
      if (typeof val === 'number') {
        numVal = Math.min(Math.max(val, 1), 10);
      } else if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
          numVal = Math.min(Math.max(parsed, 1), 10);
        } else {
          const lower = val.toLowerCase();
          if (lower.includes('very low')) numVal = 2;
          else if (lower.includes('very high')) numVal = 9;
          else if (lower.includes('low')) numVal = 4;
          else if (lower.includes('high')) numVal = 8;
        }
      }

      if (!groupedByDay[dateKey]) {
        groupedByDay[dateKey] = { sum: 0, count: 0 };
      }
      groupedByDay[dateKey].sum += numVal;
      groupedByDay[dateKey].count += 1;
    });

    // Generate fixed 7-day calendar window leading up to today
    const lineLabels = [];
    const lineData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toDateString();
      const labelText = d.toLocaleDateString('en-US', { weekday: 'short' });

      if (groupedByDay[dateKey]) {
        lineLabels.push(labelText);
        lineData.push(Math.round((groupedByDay[dateKey].sum / groupedByDay[dateKey].count) * 10) / 10);
      }
      // Rule 4 & 7: Never push 0 or synthetic data for missing days
    }

    // Rule 2.3: Show line trend as long as there's at least 1 data point in the last 7 days
    const canShowLine = lineData.length > 0;
    const canShowPie = emotions.length >= 1;

    // 2. Process Pie Chart Emotion Distribution
    // Strictly map to known emotions so it doesn't build useless slices from random strings
    const validEmotions = ['Happy', 'Angry', 'Sad', 'Neutral', 'Stress', 'Calm'];
    const distribution = emotions.reduce((acc, curr) => {
      let em = curr.emotion || 'Neutral';
      let matched = validEmotions.find((v) => em.toLowerCase().includes(v.toLowerCase()));
      
      // Consolidation logic for older/other data
      if (!matched) {
        const lowerEm = em.toLowerCase();
        if (lowerEm.includes('frustrat')) matched = 'Angry';
        else if (lowerEm.includes('anxi') || lowerEm.includes('overwhelm') || lowerEm.includes('nerv')) matched = 'Stress';
        else if (lowerEm.includes('joy')) matched = 'Happy';
        else if (lowerEm.includes('calm') || lowerEm.includes('relax')) matched = 'Calm';
        else if (lowerEm.includes('sad')) matched = 'Sad';
        else matched = 'Neutral'; // catch-all
      }

      acc[matched] = (acc[matched] || 0) + 1;
      return acc;
    }, {});

    const colorMap = {
      'Happy': '#10B981',   // Emerald
      'Angry': '#EF4444',   // Red
      'Sad': '#60A5FA',     // Blue
      'Neutral': '#9CA3AF', // Gray
      'Stress': '#F59E0B',  // Amber
      'Calm': '#34D399',    // Light Green
    };

    const pieData = Object.keys(distribution).map((key) => ({
      name: key,
      population: distribution[key],
      color: colorMap[key] || '#9CA3AF',
      legendFontColor: colors.textSecondary,
      legendFontSize: 12
    }));

    // 3. Determine Dominant Emotion (Current Trend) based on last 10 entries
    const sortedEmotions = [...emotions].sort((a, b) => b.timestamp - a.timestamp);
    const recentEmotions = sortedEmotions.slice(0, 10);
    
    const recentDistribution = recentEmotions.reduce((acc, curr) => {
      let em = curr.emotion || 'Neutral';
      let matched = validEmotions.find((v) => em.toLowerCase().includes(v.toLowerCase()));
      if (!matched) {
        const lowerEm = em.toLowerCase();
        if (lowerEm.includes('frustrat')) matched = 'Angry';
        else if (lowerEm.includes('anxi') || lowerEm.includes('overwhelm') || lowerEm.includes('nerv')) matched = 'Stress';
        else if (lowerEm.includes('joy')) matched = 'Happy';
        else if (lowerEm.includes('calm') || lowerEm.includes('relax')) matched = 'Calm';
        else if (lowerEm.includes('sad')) matched = 'Sad';
        else matched = 'Neutral';
      }
      acc[matched] = (acc[matched] || 0) + 1;
      return acc;
    }, {});

    let dominant = 'Neutral';
    let max = 0;
    Object.keys(recentDistribution).forEach(key => {
      if (recentDistribution[key] > max) {
        max = recentDistribution[key];
        dominant = key;
      }
    });

    const latest = sortedEmotions[0];

    return {
      chartData: {
        line: canShowLine ? { labels: lineLabels, datasets: [{ data: lineData }] } : null,
        pie: canShowPie ? pieData : null,
        dominant: canShowPie ? dominant : 'No Data'
      },
      latestEmotion: latest
    };
  }, [emotions]);

  // if (loading && (!emotions || !emotions.length)) return <Loader />;
  if (loading && (!emotions || !emotions.length)) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={t('dashboard.title', 'Your Dashboard')}
        subtitle={t('dashboard.subtitle', 'Insights & Well-being Overview')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{t('dashboard.wellness_score', 'Mental Wellness Score')}</Text>
            <Text style={styles.heroSubtitle}>{t('dashboard.clinical_index', 'Based on app usage and chats with Sentara')}</Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: wellnessScore < 40 ? '#FEF2F2' : '#ECFDF5' }]}>
            <Text style={[styles.scoreText, { color: wellnessScore < 40 ? colors.error : colors.primaryDark }]}>
              {wellnessScore || 0}/100
            </Text>
          </View>
        </View>

        {/* DOMINANT STATE */}
        {chartData && chartData.pie && (
          <View style={styles.insightCard}>
            <Text style={styles.insightEmoji}>
              {chartData.dominant === 'Happy' ? '✨' :
                chartData.dominant === 'Sad' ? '🌧️' :
                  chartData.dominant === 'Stress' ? '🧘' :
                  chartData.dominant === 'Angry' ? '🔥' : '🌱'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>{t('dashboard.current_trend', 'Current Trend')}</Text>
              <Text style={styles.insightText}>
                {t('dashboard.current_trend_text', "Recently, you've been feeling mostly")} <Text style={{ fontWeight: '700', color: colors.primaryDark }}>{chartData.dominant}</Text>.
              </Text>
            </View>
          </View>
        )}

        {/* RECENCY WARNING */}
        {!isRecent && emotions.length > 0 && (
          <View style={styles.recencyWarningCard}>
            <Text style={{ fontSize: 24 }}>⏰</Text>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.recencyTitle}>{t('dashboard.no_recent_data', 'No recent data')}</Text>
              <Text style={styles.recencyText}>{t('dashboard.last_checkin_14', 'Your last check-in was over 14 days ago. Log a new session to see updated insights.')}</Text>
            </View>
          </View>
        )}

        {/* BEHAVIORAL PATTERNS / TRIGGERS */}
        {patterns && patterns.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('dashboard.identified_triggers', 'Identified Triggers')}</Text>
            <View style={styles.tagsContainer}>
              {patterns.map((pattern, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{pattern}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* DYNAMIC PSYCHIATRIST SUGGESTIONS */}
        {latestEmotion && latestEmotion.suggestions && latestEmotion.suggestions.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('dashboard.activity_context', 'Activity Context')}</Text>
            {latestEmotion.suggestions.map((sug, idx) => (
              <View key={idx} style={styles.suggestionCard}>
                <Text style={styles.suggestionIcon}>{sug.icon || '💡'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle}>{sug.title}</Text>
                  <Text style={styles.suggestionDesc}>{sug.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CHARTS */}
        {chartData && chartData.line && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>{t('dashboard.intensity_trend', 'Intensity Trend (Last 7 Days)')}</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData.line}
                width={screenWidth - 48}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
              />
            </View>
          </View>
        )}

        {chartData && chartData.pie && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>{t('dashboard.emotion_breakdown', 'Emotion Breakdown')}</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={chartData.pie}
                width={screenWidth - 48}
                height={200}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>
          </View>
        )}

        {/* SECTION 4: CHART EMPTY STATES */}
        {(!chartData || (!chartData.line && !chartData.pie)) && (
          <View style={styles.chartEmptyBox}>
            <Text style={styles.chartEmptyTitle}>{t('dashboard.charts_require_data', 'Charts require more data')}</Text>
            <Text style={styles.chartEmptyText}>{t('dashboard.min_logs_chart')} {t('dashboard.check_in_more')}</Text>
          </View>
        )}

        {/* QUICK ACTIONS */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>{t('dashboard.quick_actions', 'Quick Actions')}</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Chat')}>
              <Text style={styles.actionEmoji}>🩺</Text>
              <Text style={styles.actionLabel}>{t('dashboard.talk_to_doctor', 'Talk to Doctor')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* EMPTY STATE */}
        {!chartData && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>{t('dashboard.not_enough_data', 'Not enough data')}</Text>
            <Text style={styles.emptySubtext}>{t('dashboard.log_more', 'Log more emotions to unlock your personalized insights and charts.')}</Text>
          </View>
        )}

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
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  heroTitle: {
    ...typography.h2,
    color: '#fff',
    marginBottom: 4,
    fontSize: 20,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  scoreText: {
    ...typography.h2,
    fontSize: 20,
  },
  insightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  insightEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  insightTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  insightText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tagText: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  suggestionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  suggestionDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  chartSection: {
    marginBottom: 28,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chart: {
    borderRadius: 16,
  },
  actionsSection: {
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  recencyWarningCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  recencyTitle: {
    ...typography.h3,
    fontSize: 16,
    color: '#92400E',
    marginBottom: 4,
  },
  recencyText: {
    ...typography.bodySmall,
    color: '#B45309',
    lineHeight: 18,
  },
  chartEmptyBox: {
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 32,
  },
  chartEmptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },
  chartEmptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DashboardScreen;