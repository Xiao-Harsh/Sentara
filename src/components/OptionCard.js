import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const OptionCard = ({ title, description, icon, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
        {icon && icon.match(/(\u270d\ufe0f|[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83E[\uDD10-\uDDFF])/) ? (
          <Text style={{ fontSize: 24, opacity: isSelected ? 1 : 0.8 }}>{icon}</Text>
        ) : (
          <MaterialCommunityIcons 
            name={icon} 
            size={32} 
            color={isSelected ? colors.surface : colors.primary} 
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isSelected && styles.titleSelected]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.description, isSelected && styles.descriptionSelected]}>
            {description}
          </Text>
        )}
      </View>
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <MaterialCommunityIcons name="check" size={16} color={colors.surface} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4', // Very light green tint
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  titleSelected: {
    color: colors.primaryDark,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  descriptionSelected: {
    color: colors.primary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderFocus,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  }
});

export default OptionCard;