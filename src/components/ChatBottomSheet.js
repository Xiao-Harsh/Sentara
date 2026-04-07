import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  Keyboard
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import VoiceService from '../services/voiceService';
import { getChatResponseWithAnalysis, transcribeAudio } from '../services/llmApi';
import { saveEmotion } from '../services/dbService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChatBottomSheet = ({ isVisible, onClose, initialMode = 'text', initialMessage = '', onChatComplete }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [waveAnimation] = useState(new Animated.Value(0));
  const [micPulse] = useState(new Animated.Value(1));
  const scrollViewRef = useRef();
  const lastProcessedMessage = useRef('');
  const messagesRef = useRef(messages);
  
  // Animated state
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only allow drag if pulling down more than a tiny bit
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        Keyboard.dismiss();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.8) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.85],
    outputRange: [0.4, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (isVisible) {
      // Animate entrance
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
      
      if (messagesRef.current.length === 0) {
        setMessages([{ role: 'assistant', content: "I'm here for you. How can I help?" }]);
      }
      setMode(initialMode);

      if (initialMessage && initialMessage !== lastProcessedMessage.current) {
        lastProcessedMessage.current = initialMessage;
        setTimeout(() => {
          handleSendMessage(initialMessage);
        }, 500);
      }
    } else {
      setIsListening(false);
      VoiceService.stopSpeaking();
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isListening) startAnimations();
    else stopAnimations();
  }, [isListening]);

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(waveAnimation, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopAnimations = () => {
    micPulse.setValue(1);
    waveAnimation.setValue(0);
    micPulse.stopAnimation();
    waveAnimation.stopAnimation();
  };

  const handleSendMessage = async (text) => {
    const userText = text || inputText;
    if (!userText.trim()) return;

    const currentMessages = messagesRef.current;
    const baseMessages = currentMessages.length === 0 ? [{ role: 'assistant', content: "I'm here for you. How can I help?" }] : currentMessages;

    const newMessages = [...baseMessages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInputText('');
    setTranscription('');
    setIsAIProcessing(true);

    try {
      const { text: aiResponse, analysis: emotionAnalysis } = await getChatResponseWithAnalysis(newMessages);

      if (user?.uid && emotionAnalysis) {
        await saveEmotion(user.uid, emotionAnalysis);
        if (onChatComplete) {
          onChatComplete();
        }
      }

      const updatedMessages = [...newMessages, { role: 'assistant', content: aiResponse }];
      setMessages(updatedMessages);

      if (mode === 'voice') VoiceService.speak(aiResponse);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "I'm having trouble connecting right now." }]);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const toggleVoice = async () => {
    if (isListening) {
      setIsListening(false);
      const uri = await VoiceService.stopListening();
      if (uri) {
        setTranscription("Processing audio...");
        const text = await transcribeAudio(uri);
        if (text && text.trim().length > 0) {
          setTranscription("");
          handleSendMessage(text);
        } else {
          setTranscription("Audio not recognized.");
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I didn't hear you clearly. Could you try again?" }]);
          if (mode === 'voice') VoiceService.speak("Sorry, I didn't hear you clearly. Could you try again?");
        }
      }
    } else {
      setIsListening(true);
      setTranscription("Tap mic when you're done speaking...");
      try {
        await VoiceService.startListening();
      } catch (err) {
        setIsListening(false);
        setTranscription("Microphone unavailable.");
      }
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]} />
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />

        <Animated.View 
          style={[styles.sheetContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.bottomSheet}
          >
            <View style={styles.header}>
              <View style={styles.handle} />
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'voice' && styles.activeMode]}
                  onPress={() => setMode('voice')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeText, mode === 'voice' && styles.activeModeText]}>🎤 Voice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'text' && styles.activeMode]}
                  onPress={() => setMode('text')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeText, mode === 'text' && styles.activeModeText]}>💬 Text</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.chatArea}
              contentContainerStyle={styles.chatContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
            >
              {messages.map((msg, i) => (
                <View key={i} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.messageText, msg.role === 'user' ? styles.userMessageText : styles.aiMessageText]}>
                    {msg.content}
                  </Text>
                </View>
              ))}
              {isAIProcessing && (
                <View style={[styles.messageBubble, styles.aiBubble, styles.processingBubble]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.processingText}>Listening...</Text>
                </View>
              )}
            </ScrollView>

            {mode === 'voice' ? (
              <View style={styles.voiceContainer}>
                <Text style={styles.transcriptionText}>
                  {isListening ? transcription || "Listening intently..." : "Tap the mic to share"}
                </Text>

                <TouchableOpacity onPress={toggleVoice} activeOpacity={0.8}>
                  <Animated.View style={[
                    styles.micButton,
                    isListening && styles.micButtonActive,
                    { transform: [{ scale: micPulse }] }
                  ]}>
                    <Text style={{ fontSize: 36 }}>{isListening ? "🛑" : "🎤"}</Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor={colors.textLight}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                  onPress={() => handleSendMessage()}
                  disabled={!inputText.trim() || isAIProcessing}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  dismissArea: {
    flex: 1,
  },
  bottomSheet: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sheetContainer: {
    width: '100%',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: colors.borderFocus,
    borderRadius: 3,
    marginBottom: 24,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 6,
    width: '70%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 18,
  },
  activeMode: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    fontSize: 13,
  },
  activeModeText: {
    color: colors.surface,
  },
  chatArea: {
    flex: 1,
    padding: 24,
  },
  chatContent: {
    paddingBottom: 32,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  processingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  processingText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 12,
  },
  messageText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.surface,
  },
  aiMessageText: {
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxHeight: 100,
    ...typography.body,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  sendButtonText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 15,
  },
  voiceContainer: {
    padding: 32,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  micButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
  },
  transcriptionText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 32,
    color: colors.textSecondary,
    fontStyle: 'italic',
    minHeight: 24,
  },
});

export default ChatBottomSheet;
