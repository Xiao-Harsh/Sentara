import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BottomTabBar = ({ state, descriptors, navigation }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.absoluteContainer}>
      {/* Bottom Blur/White Gradient Gradient */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)', '#FFFFFF']}
        style={styles.bottomGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <View style={styles.barWrapper}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const rawLabel = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
          const label = t(`common.${route.name.toLowerCase()}`, rawLabel);
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIcon = (name, focused) => {
            if (name === 'Home') return '🏠';
            if (name === 'Explore') return '🧭';
            if (name === 'Dashboard') return '📊';
            if (name === 'Profile') return '👤';
            return '•';
          };

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused ? styles.tabItemActive : styles.tabItemInactive
              ]}
            >
              <View style={[
                styles.iconBox,
                isFocused ? styles.iconBoxActive : styles.iconBoxInactive
              ]}>
                <Text style={[styles.iconText, { fontSize: isFocused ? 22 : 26 }]}>
                  {getIcon(route.name, isFocused)}
                </Text>
              </View>
              {isFocused && (
                <Text style={styles.activeLabel} numberOfLines={1}>
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120, // Enough height to cover the gradient area
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000,
  },
  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  barWrapper: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
  },
  tabItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5, // Increased spacing slightly
    // High-end Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tabItemActive: {
    height: 54, // Slightly taller
    borderRadius: 27,
    paddingRight: 18,
    paddingLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  tabItemInactive: {
    width: 54, // Slightly larger
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  iconBox: {
    width: 44, // Larger icon box
    height: 44,
    borderRadius: 22, // Force perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensure background doesn't bleed
  },
  iconBoxActive: {
    backgroundColor: '#0F6E56', // Deeper Sentara green for professional look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  iconBoxInactive: {
    backgroundColor: 'transparent',
  },
  iconText: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  activeLabel: {
    marginLeft: 10,
    fontSize: 13, // Slightly larger
    fontWeight: '700',
    color: colors.text, 
    letterSpacing: 0.3,
  },
});

export default BottomTabBar;
