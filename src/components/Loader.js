import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const Loader = ({ visible = false, text = "Loading..." }) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <BlurView intensity={20} tint="light" style={styles.blurContainer}>
        <View style={styles.indicatorWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{text}</Text>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorWrapper: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: 16,
  }
});

export default Loader;