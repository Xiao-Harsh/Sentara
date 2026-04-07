import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../../context/AudioContext';
import { colors } from '../../theme/colors';
import SoundPlayer from '../../components/relax/SoundPlayer';
import { useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SoundCategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const { playTrack, activeTrack, isPlaying, pauseTrack, resumeTrack, stopTrack, setPlaylist } = useAudio();

  const stopTrackRef = useRef(stopTrack);
  useEffect(() => {
    stopTrackRef.current = stopTrack;
  }, [stopTrack]);

  useFocusEffect(
    useCallback(() => {
      // Return cleanup function to stop music when screen is blurred (navigated away)
      return () => {
        if (stopTrackRef.current) {
          stopTrackRef.current();
        }
      };
    }, [])
  );

  const handleTrackPress = (track) => {
    if (activeTrack?.id === track.id) {
      if (isPlaying) pauseTrack();
      else resumeTrack();
    } else {
      setPlaylist(category.songs);
      playTrack(track);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <LinearGradient colors={category.gradient} style={styles.header}>
        <View style={{ height: 44, marginBottom: 20 }} />
        <View style={styles.headerContent}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.trackCount}>{category.songs.length} Tracks</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {category.songs.map((track) => {
          const isCurrent = activeTrack?.id === track.id;
          return (
            <TouchableOpacity
              key={track.id}
              style={[styles.trackItem, isCurrent && styles.trackItemActive]}
              onPress={() => handleTrackPress(track)}
              activeOpacity={0.7}
            >
              <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, isCurrent && styles.trackTitleActive]}>{track.title}</Text>
                <Text style={styles.trackDuration}>{track.duration}</Text>
              </View>
              <View style={[styles.playButton, isCurrent && isPlaying && styles.pauseButton]}>
                <Text style={styles.playIcon}>{isCurrent && isPlaying ? 'Pause' : 'Play'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FLOATING PLAYER (ONLY IN MUSIC SECTION) */}
      <SoundPlayer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  headerContent: {
    marginTop: 10,
  },
  categoryName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  trackCount: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  trackItemActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  trackTitleActive: {
    color: '#3730A3',
  },
  trackDuration: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  playButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pauseButton: {
    backgroundColor: '#EF4444',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SoundCategoryScreen;
