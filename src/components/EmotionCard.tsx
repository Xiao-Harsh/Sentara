import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface EmotionCardProps {
  title: string;
  subtitle: string;
  type?: 'primary' | 'secondary' | 'error' | 'success';
  icon?: string;
  children?: React.ReactNode;
}

const EmotionCard: React.FC<EmotionCardProps> = ({ title, subtitle, type = 'primary', children }) => {
  const getBorderColor = () => {
    switch (type) {
      case 'error': return COLORS.error;
      case 'secondary': return COLORS.secondary;
      default: return COLORS.primary;
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getBorderColor() }]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.m,
    borderRadius: 12,
    marginBottom: SPACING.m,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  content: {
    marginTop: SPACING.s,
  },
});

export default EmotionCard;
