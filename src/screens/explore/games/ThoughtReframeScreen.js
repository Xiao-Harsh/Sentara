import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ThoughtReframeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { thought } = route.params || { thought: "Original thought placeholder" };
  const [reframeText, setReframeText] = useState('');

  const isSubmitEnabled = reframeText.trim().length > 10;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Reframe</Text>
        <View style={{ width: 80 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <View style={styles.mainContent}>
          {/* STEP 1: ORIGINAL THOUGHT (GLASS) */}
          <View style={styles.glassCardMuted}>
            <Text style={styles.mutedThoughtText}>"{thought}"</Text>
          </View>

          {/* STEP 2: TEXT AREA (PREMIUM) */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Try writing a more balanced version..."
              placeholderTextColor="#94A3B8"
              multiline
              value={reframeText}
              onChangeText={setReframeText}
            />
          </View>

          {/* STEP 3: TIP */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 Mindfulness Tip</Text>
            <Text style={styles.tipText}>Replace absolute words like 'always' or 'never' with 'sometimes' or 'this time'.</Text>
          </View>

          {/* STEP 4: SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitBtn, !isSubmitEnabled && styles.submitBtnDisabled]}
            disabled={!isSubmitEnabled}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Main', { screen: 'Explore' })}
          >
            <Text style={[styles.submitBtnText, !isSubmitEnabled && styles.submitBtnDisabledText]}>
              Submit reframe
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9', // Subtle blue-grey premium bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 72,
  },
  backBtn: {
    width: 80,
    height: 44,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  keyboardAvoid: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  glassCardMuted: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  mutedThoughtText: {
    fontSize: 16,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    height: 180,
    fontSize: 16,
    color: '#1E293B',
    textAlignVertical: 'top',
  },
  tipContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(45,184,122,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(45,184,122,0.1)',
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#525252',
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: '#2DB87A',
    height: 56,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
    shadowColor: '#2DB87A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitBtnDisabledText: {
    color: '#94A3B8',
  },
});

export default ThoughtReframeScreen;
