import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const ChatButton = ({ title, onPress, loading, disabled, type = 'primary' }) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      type === 'secondary' ? styles.secondaryButton : styles.primaryButton,
      (disabled || loading) && styles.disabledButton
    ]} 
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color={type === 'secondary' ? colors.primary : colors.surface} size="small" />
    ) : (
      <Text style={[
        styles.text, 
        type === 'secondary' ? styles.secondaryText : styles.primaryText
      ]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderFocus,
  },
  disabledButton: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    ...typography.button,
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.textSecondary,
  },
});

export default ChatButton;