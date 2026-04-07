export const COLORS = {
  primary: '#6BAB8A', // Sage Green
  secondary: '#8EB69B',
  accent: '#A4C3B2',
  background: '#F5EEE6', // Soft Blush / Warm Neutral
  surface: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#8A8A8A',
  placeholder: '#A4B0BE',
  border: 'rgba(0,0,0,0.05)',
  error: '#E07070', // Soft Coral
  success: '#6BAB8A',
  warning: '#E9C46A',
  onPrimary: '#FFFFFF',
  sageLight: '#E9F5EF',
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
    fontFamily: 'Nunito-Bold',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
    fontFamily: 'Nunito-Bold',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    fontFamily: 'Nunito-SemiBold',
  },
  body: {
    fontSize: 16,
    color: '#2D2D2D',
    lineHeight: 24,
    fontFamily: 'Nunito-Regular',
  },
  bodySmall: {
    fontSize: 14,
    color: '#2D2D2D',
    lineHeight: 20,
    fontFamily: 'Nunito-Regular',
  },
  caption: {
    fontSize: 12,
    color: '#8A8A8A',
    fontFamily: 'Nunito-Regular',
  },
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const APP_CONFIG = {
  name: 'Sentara',
  version: '1.2.0',
};

export default {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  SHADOWS,
  APP_CONFIG,
};
