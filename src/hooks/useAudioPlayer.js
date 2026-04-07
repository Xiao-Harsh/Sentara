import { useAudio } from '../context/AudioContext';

/**
 * Reusable logic for audio playback.
 * This hook wraps the AudioContext to provide a clean interface
 * as per the technical requirements.
 */
export const useAudioPlayer = () => {
  const audio = useAudio();
  
  return {
    activeTrack: audio.activeTrack,
    isPlaying: audio.isPlaying,
    position: audio.position,
    duration: audio.duration,
    play: audio.playTrack,
    pause: audio.pauseTrack,
    resume: audio.resumeTrack,
    stop: audio.stopTrack,
  };
};

export default useAudioPlayer;
