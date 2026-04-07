/**
 * getEmotionTheme — Returns a soft, light visual theme based on user emotion + intensity.
 *
 * Intensity levels: "Very Low" | "Low" | "Medium" | "High" | "Very High"
 *
 * Color Spectrum (negative → positive):
 *   🔴 Sad / Overwhelmed / Very High negative    → Soft Rose
 *   🟡 Stressed / Angry / Anxious / Frustrated   → Soft Amber
 *   🔵 Neutral / Unknown                         → Soft Blue
 *   🌿 Calm / Content / Very Low intensity        → Soft Light Green
 *   🟩 Happy / Joyful / Excited                  → Soft Green
 *
 * @param {string} emotionString — The detected emotion label
 * @param {string} intensity     — "Very Low" | "Low" | "Medium" | "High" | "Very High"
 * @returns {{ label: string, emoji: string, colors: [string, string], textColor: string, iconBg: string, description: string }}
 */

// Maps legacy intensity strings to numeric weights (1-10 scale)
const LEGACY_INTENSITY_MAP = {
  'very low': 2,
  'low': 4,
  'medium': 6,
  'high': 8,
  'very high': 10,
};

const getIntensityWeight = (intensity) => {
  if (typeof intensity === 'number') return Math.min(Math.max(intensity, 1), 10);
  if (typeof intensity === 'string') {
    const lower = intensity.toLowerCase().trim();
    if (LEGACY_INTENSITY_MAP[lower]) return LEGACY_INTENSITY_MAP[lower];
    const parsed = parseInt(lower, 10);
    return !isNaN(parsed) ? Math.min(Math.max(parsed, 1), 10) : 5;
  }
  return 5;
};

export const getEmotionTheme = (emotionString = '', intensity = 'Medium') => {
  const e = emotionString.toLowerCase().trim();
  const weight = getIntensityWeight(intensity);

  // ────────────────────────────────────────────────────────
  // 🔴  VERY SAD / OVERWHELMED  →  Soft Rose
  //     Deep sadness, depression, hopelessness, grief
  //     OR any negative emotion with Very High intensity
  // ────────────────────────────────────────────────────────
  const isDeeplySad =
    e.includes('sad') ||
    e.includes('depress') ||
    e.includes('lonely') ||
    e.includes('cry') ||
    e.includes('hopeless') ||
    e.includes('grief') ||
    e.includes('overwhelm') ||
    e.includes('despair');

  const isNegative =
    e.includes('stress') ||
    e.includes('anxi') ||
    e.includes('angry') ||
    e.includes('anger') ||
    e.includes('frustrat') ||
    e.includes('fear') ||
    e.includes('panic') ||
    e.includes('worr') ||
    e.includes('nervous') ||
    e.includes('tire') ||
    e.includes('exhaust');

  // Deeply sad → always Rose
  if (isDeeplySad) {
    return {
      label: 'Sad',
      emoji: '😢',
      colors: ['#FFF1F2', '#FECDD3'],
      textColor: '#9F1239',
      iconBg: '#FFE4E6',
      description: "It's okay to feel this way. You're not alone.",
    };
  }

  // High intensity (7-10) + negative → escalate to Rose
  if (weight >= 7 && isNegative) {
    return {
      label: weight >= 9 ? 'Stress' : 'Stress', // High distress maps to Stress/Severe Stress
      emoji: weight >= 9 ? '🆘' : '⛈️',
      colors: ['#FFF1F2', '#FECDD3'],
      textColor: '#9F1239',
      iconBg: '#FFE4E6',
      description: weight >= 9
        ? 'You seem to be in significant distress. Please reach out for support.'
        : 'You logged a high intensity state. Take a deep breath.',
    };
  }

  // ────────────────────────────────────────────────────────
  // 🟡  STRESSED / ANXIOUS / ANGRY  →  Soft Amber
  //     Moderate negative emotions (Low–Medium intensity)
  // ────────────────────────────────────────────────────────
  if (isNegative) {
    const isAngry = e.includes('angry') || e.includes('anger') || e.includes('frustrat');
    return {
      label: isAngry ? 'Angry' : 'Stress',
      emoji: isAngry ? '🔥' : '🌩️',
      colors: ['#FFFBEB', '#FDE68A'],
      textColor: '#92400E',
      iconBg: '#FEF3C7',
      description: 'Take a moment to ground yourself. You are safe.',
    };
  }

  // ────────────────────────────────────────────────────────
  // 🟩  HAPPY / JOYFUL  →  Soft Green
  // ────────────────────────────────────────────────────────
  const isHappy =
    e.includes('happy') ||
    e.includes('joy') ||
    e.includes('excit') ||
    e.includes('grat') ||
    e.includes('amazing') ||
    e.includes('love') ||
    e.includes('proud') ||
    e.includes('elat');

  if (isHappy) {
    return {
      label: 'Happy',
      emoji: '☀️',
      colors: ['#F0FDF4', '#BBF7D0'],
      textColor: '#166534',
      iconBg: '#DCFCE7',
      description: 'You logged positive energy today! Keep it going.',
    };
  }

  // ────────────────────────────────────────────────────────
  // 🌿  CALM / CONTENT  →  Soft Light Green
  // ────────────────────────────────────────────────────────
  const isCalm =
    e.includes('calm') ||
    e.includes('peace') ||
    e.includes('relax') ||
    e.includes('content') ||
    e.includes('good') ||
    e.includes('better') ||
    e.includes('fine');

  if (isCalm) {
    return {
      label: 'Calm',
      emoji: '🍃',
      colors: ['#ECFDF5', '#A7F3D0'],
      textColor: '#065F46',
      iconBg: '#D1FAE5',
      description: "You're in a peaceful state. Well done.",
    };
  }

  // ────────────────────────────────────────────────────────
  // 🔵  NEUTRAL / DEFAULT  →  Soft Blue
  // ────────────────────────────────────────────────────────

  // Low intensity (1-3) with no keyword → calm state
  if (weight <= 3) {
    return {
      label: 'Calm',
      emoji: '🍃',
      colors: ['#ECFDF5', '#A7F3D0'],
      textColor: '#065F46',
      iconBg: '#D1FAE5',
      description: 'Your state seems balanced and calm.',
    };
  }

  return {
    label: 'Neutral',
    emoji: '🤍',
    colors: ['#EFF6FF', '#BFDBFE'],
    textColor: '#1E40AF',
    iconBg: '#DBEAFE',
    description: 'Based on your entries, your state is balanced.',
  };
};
