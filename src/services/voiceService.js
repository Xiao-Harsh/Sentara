import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

/**
 * Service for handling Voice interactions: Speech-to-Text and Text-to-Speech
 */
class VoiceService {
  constructor() {
    this.recording = null;
    this.isListening = false;
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions() {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Start recording audio for speech-to-text
   * Note: In a real production app, you would send this audio to a 
   * speech-to-text API like Google Cloud Speech or Whisper.
   * For this implementation, we simulate the transcription flow.
   */
  async startListening(onTranscriptionUpdate) {
    try {
      // Clean up any existing hanging recording to prevent the "Only one Recording object" error
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (e) {
          console.warn('Silent cleanup of hanging recording failed', e);
        }
        this.recording = null;
        this.isListening = false;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) throw new Error('Permission denied');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      this.isListening = true;

      return true;
    } catch (err) {
      console.error('Failed to start recording', err);
      throw err;
    }
  }

  /**
   * Stop recording
   */
  async stopListening() {
    if (!this.recording) return null;

    try {
      this.isListening = false;
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      return uri;
    } catch (err) {
      console.error('Failed to stop recording', err);
      return null;
    }
  }

  /**
   * Speak text aloud using TTS
   */
  async speak(text, onDone = () => {}) {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        onDone: onDone,
        onError: (error) => console.error('TTS Error', error),
      });
    } catch (err) {
      console.error('Speech error:', err);
    }
  }

  /**
   * Stop any current speech
   */
  async stopSpeaking() {
    await Speech.stop();
  }
}

export default new VoiceService();
