import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Easing } from 'react-native';
import { useAudio } from '../../context/AudioContext';
import Svg, { Path, Polygon, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SkipBackIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polygon points="19 20 9 12 19 4 19 20" fill={color} />
    <Rect x="5" y="4" width="2" height="16" fill={color} />
  </Svg>
);

const SkipForwardIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polygon points="5 4 15 12 5 20 5 4" fill={color} />
    <Rect x="17" y="4" width="2" height="16" fill={color} />
  </Svg>
);

const PlayIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polygon points="5 3 19 12 5 21 5 3" fill={color} />
  </Svg>
);

const PauseIcon = ({ color }) => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="6" y="4" width="4" height="16" fill={color} />
    <Rect x="14" y="4" width="4" height="16" fill={color} />
  </Svg>
);

const SoundPlayer = () => {
  const { activeTrack, isPlaying, position, duration, pauseTrack, resumeTrack, playNext, playPrevious } = useAudio();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation;
    if (isPlaying) {
      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      rotateAnim.stopAnimation();
    }
    return () => animation?.stop();
  }, [isPlaying]);

  if (!activeTrack) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.playerCard}>
        {/* CD ICON (FLOATING STYLE) */}
        <View style={styles.cdContainer}>
          <Animated.View style={[styles.cdIcon, { transform: [{ rotate }] }]}>
            <View style={styles.cdHole} />
            {/* In a real app, this would be an Image with track artwork */}
            <View style={styles.cdDesign}>
              <View style={[styles.cdRing, { borderColor: 'rgba(255,255,255,0.3)' }]} />
              <View style={[styles.cdRing, { width: 40, height: 40, borderColor: 'rgba(255,255,255,0.1)' }]} />
            </View>
          </Animated.View>
        </View>

        <View style={styles.rightContent}>
          <View style={styles.trackInfo}>
            <Text style={styles.categoryName}>Mind Relax</Text>
            <Text style={styles.trackTitle} numberOfLines={1}>{activeTrack.title}</Text>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {/* CONTROLS */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={playPrevious} hitSlop={10}>
              <SkipBackIcon color="#059669" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainPlayBtn}
              onPress={isPlaying ? pauseTrack : resumeTrack}
              activeOpacity={0.8}
            >
              <View style={styles.playIconBg}>
                {isPlaying ? <PauseIcon color="#059669" /> : <PlayIcon color="#059669" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={playNext} hitSlop={10}>
              <SkipForwardIcon color="#059669" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 30,
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  playerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    height: 140,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 100, // Make room for floating CD
    paddingRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  cdContainer: {
    position: 'absolute',
    left: 15,
    top: -20,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  cdIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cdHole: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  cdDesign: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cdRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
  },
  rightContent: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingTop: 10,
  },
  trackInfo: {
    marginBottom: 8,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  progressContainer: {
    height: 4,
    marginBottom: 15,
    marginHorizontal: 30, // Centered and detached from CD
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  mainPlayBtn: {
    marginHorizontal: 10,
  },
  playIconBg: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SoundPlayer;
