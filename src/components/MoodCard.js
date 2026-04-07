import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const MoodCard = ({ title, subtitle, value, type = 'primary', onPress, children }) => (
  <TouchableOpacity 
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    style={[
      styles.card,
      type === 'error' ? styles.errorCard : styles.primaryCard
    ]}
  >
    <View style={styles.header}>
      <Text style={[styles.title, type === 'error' ? { color: colors.error } : {}]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.content}>
      {value && (
        <Text style={[styles.value, type === 'error' ? { color: colors.error } : { color: colors.primary }]}>
          {value}
        </Text>
      )}
      {children}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.primaryLight,
  },
  errorCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.error,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    marginTop: 8,
  },
  value: {
    ...typography.h1,
    textAlign: 'center',
    marginVertical: 16,
    color: colors.text,
  },
});

export default MoodCard;
