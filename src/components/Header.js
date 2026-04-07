import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const Header = ({ title, subtitle, showBack, onBackPress, rightComponent }) => (
  <View style={styles.container}>
    <View style={styles.left}>
      {showBack && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      )}
      <View style={[styles.titleContainer, { marginLeft: showBack ? 12 : 0 }]}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
    {rightComponent && <View style={styles.right}>{rightComponent}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    color: colors.text,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    // Apply precise transforms to shift the arrow into the absolute center
    transform: [{ translateY: Platform.OS === 'ios' ? -2 : -1 }, { translateX: 2 }],
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  right: {
    marginLeft: 16,
  },
});

export default Header;
