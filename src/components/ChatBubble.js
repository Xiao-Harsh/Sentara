import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getIntensityLabel } from '../utils/helpers';

const ChatBubble = ({ text, sender, analysis, timestamp }) => {
  const isAI = sender === 'ai';

  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={[styles.text, isAI ? styles.aiText : styles.userText]}>{text}</Text>

        {analysis && (
          <View style={styles.analysisContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {analysis.emotion === 'Happy' ? '😊' :
                  analysis.emotion === 'Sad' ? '😢' :
                    analysis.emotion === 'Stress' ? '😫' :
                      analysis.emotion === 'Angry' ? '😡' : '😐'} {analysis.emotion} • {getIntensityLabel(analysis.intensity)}
              </Text>
            </View>
            <Text style={styles.triggerText}>Trigger: {analysis.trigger}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.timestamp, isAI ? styles.timestampLeft : styles.timestampRight]}>
        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    maxWidth: '85%',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  aiBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  text: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  aiText: {
    color: colors.text,
  },
  userText: {
    color: colors.surface,
  },
  analysisContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  badge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  triggerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  timestamp: {
    ...typography.caption,
    marginTop: 6,
    color: colors.textLight,
    fontSize: 11,
  },
  timestampLeft: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  timestampRight: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
});

export default ChatBubble;