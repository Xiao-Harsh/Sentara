import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// ICONS (Reused/Simplified)
const BreathingIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="12" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const ThoughtShiftIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Path d="M22 8L26 12L22 16M26 12H10C7.79086 12 6 13.7909 6 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BubblePopIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.8" />
    <Circle cx="20" cy="18" r="4" stroke={color} strokeWidth="1.8" />
  </Svg>
);

const GamesListScreen = ({ navigation }) => {
  const games = [
    { id: '1', name: 'Mindful Breathing', tag: 'Find your center with deep breath work', duration: '5 mins', bg: '#D4EAFB', stroke: '#185FA5', icon: (c) => <BreathingIcon color={c} />, screen: 'GameBreathing' },
    { id: '2', name: 'Thought Shift', tag: 'Reframe negative patterns instantly', duration: '3 mins', bg: '#E8E4FC', stroke: '#534AB7', icon: (c) => <ThoughtShiftIcon color={c} />, screen: 'GameThoughtShift' },
    { id: '4', name: 'Bubble Pop', tag: 'Physically release tension and stress', duration: '2-3 min', bg: '#FCE4E0', stroke: '#993C1D', icon: (c) => <BubblePopIcon color={c} />, screen: 'GameBubblePop' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Games</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionDesc}>Choose a game to practice mindfulness and find your balance.</Text>

        {games.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => navigation.navigate(game.screen)}
            activeOpacity={0.9}
          >
            <View style={[styles.gameIconCircle, { backgroundColor: game.bg }]}>
              {game.icon(game.stroke)}
            </View>
            <View style={styles.gameContent}>
              <View style={styles.gameTop}>
                <Text style={styles.gameName}>{game.name}</Text>
                <View style={styles.durationPill}>
                  <Text style={styles.durationText}>{game.duration}</Text>
                </View>
              </View>
              <Text style={styles.gameTag}>{game.tag}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 60,
  },
  backText: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 24,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 24,
  },
  gameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  gameIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  gameContent: {
    flex: 1,
  },
  gameTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  gameTag: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 18,
  },
  durationPill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A8A8A8',
  },
});

export default GamesListScreen;
