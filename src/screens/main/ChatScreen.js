import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChat } from '../../hooks/useChat';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import ChatBubble from '../../components/ChatBubble';
import Header from '../../components/Header';

const ChatScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const { messages, loading, sendMessage } = useChat();
  const scrollViewRef = useRef();

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    const textToSend = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    await sendMessage(textToSend);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
    );
    return () => keyboardListener.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      <Header 
        title="Your Safe Space" 
        subtitle="Sentara is here to support you."
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id}
              text={msg.text}
              sender={msg.sender}
              analysis={msg.analysis}
              timestamp={msg.timestamp}
            />
          ))}
          {loading && (
            <View style={styles.aiLoading}>
              <View style={styles.loadingDot} />
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.aiLoadingText}>Sentara is thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Tell me how you're feeling..."
              placeholderTextColor={colors.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxHeight={120}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.disabledButton]} 
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
              activeOpacity={0.7}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 6,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginRight: 12,
  },
  aiLoadingText: {
    ...typography.caption,
    marginLeft: 12,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 16,
    color: colors.text,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 120,
    marginLeft: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  sendIcon: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '800',
  },
});

export default ChatScreen;