import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      if (isMounted.current) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis);
        setIsPlaying(status.isPlaying);
      }
      
      if (status.didJustFinish) {
        playNext();
      }
    }
  };

  const playTrack = async (track) => {
    if (isLoading) return; // Prevent concurrent loading
    
    try {
      setIsLoading(true);
      
      // 1. Unload previous sound completely
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // 2. Load and play new sound
      const { sound } = await Audio.Sound.createAsync(
        track.file,
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      if (isMounted.current) {
        soundRef.current = sound;
        setActiveTrack(track);
        setIsPlaying(true);
      } else {
        await sound.unloadAsync();
      }
    } catch (error) {
      console.error("Error playing track:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseTrack = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeTrack = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const stopTrack = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        // Handle potential errors during unload
      } finally {
        soundRef.current = null;
        setActiveTrack(null);
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const playNext = () => {
    if (playlist.length === 0 || !activeTrack || isLoading) return;
    const currentIndex = playlist.findIndex(t => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  };

  const playPrevious = () => {
    if (playlist.length === 0 || !activeTrack || isLoading) return;
    const currentIndex = playlist.findIndex(t => t.id === activeTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  };

  return (
    <AudioContext.Provider value={{
      activeTrack,
      isPlaying,
      position,
      duration,
      isLoading,
      playlist,
      setPlaylist,
      playTrack,
      pauseTrack,
      resumeTrack,
      stopTrack,
      playNext,
      playPrevious
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
