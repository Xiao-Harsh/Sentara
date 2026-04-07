import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * Reusable container for guided exercises.
 * Provides a full-screen gradient background, a common header with an exit button.
 */
const ExerciseContainer = ({
  title,
  children,
  onExit,
  gradientColors = ['#F8FAFC', '#E2E8F0'], // Soft default gradient
  isDark = false,
}) => {
  const handleExitPress = () => {
    Alert.alert(
      "End session?",
      "Your progress in this session won't be saved.",
      [
        { text: "Keep going", style: "cancel" },
        { text: "End", style: "destructive", onPress: onExit }
      ]
    );
  };

  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, isDark && styles.textWhite]}>{title}</Text>
            <TouchableOpacity 
              style={styles.exitBtn} 
              onPress={handleExitPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.exitText, isDark && styles.textWhite]}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            {children}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exitBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  exitText: {
    fontSize: 28,
    color: colors.text,
    marginTop: -2,
  },
  content: {
    flex: 1,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});

export default ExerciseContainer;
