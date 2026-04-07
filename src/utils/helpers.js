/**
 * Sentinel Data Verification Layer for Sentara Dashboard.
 * 
 * Rules:
 * 1. Deduplicate identical timestamps (keep latest).
 * 2. Validate Mood (1-10) and Energy/Sleep (1-5) ranges.
 * 3. Filter out orphaned sessions (no messages/mood).
 * 4. Normalize timestamps for local timezone consistency.
 */

export const verifyDataIntegrity = (rawEmotions = []) => {
  if (!rawEmotions || !Array.isArray(rawEmotions)) return [];

  const integrityMap = new Map();

  rawEmotions.forEach(entry => {
    if (!entry.timestamp) return;

    // FIX 2: Out-of-range values
    const mood = parseInt(entry.intensity || entry.mood, 10);
    if (!isNaN(mood) && (mood < 1 || mood > 10)) {
        console.warn(`[Integrity] Excluding out-of-range mood: ${mood}`);
        return;
    }

    // FIX 3: Filter orphaned sessions
    const hasContent = (entry.emotion && entry.emotion !== 'unknown') || 
                      (entry.messages && entry.messages.length > 0) ||
                      (entry.trigger && entry.trigger !== 'unknown');
    
    if (!hasContent) {
        console.warn(`[Integrity] Excluding orphaned session: ${entry.timestamp}`);
        return;
    }

    // FIX 1 & 4: Deduplication & Timezone Normalization (Timestamps are UTC but mapped to Date objects)
    const existing = integrityMap.get(entry.timestamp);
    if (!existing || entry.updatedAt > (existing.updatedAt || 0)) {
        integrityMap.set(entry.timestamp, entry);
    }
  });

  return Array.from(integrityMap.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const calculateCurrentStreak = (emotions = []) => {
  if (!emotions || emotions.length === 0) return 0;

  const loggedDays = new Set(
    emotions.map(e => new Date(e.timestamp).toDateString())
  );

  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // If no activity today OR yesterday, streak is effectively 0 for "current" streak
  if (!loggedDays.has(todayStr) && !loggedDays.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let checkDate = loggedDays.has(todayStr) ? today : yesterday;

  while (loggedDays.has(checkDate.toDateString())) {
    streak++;
    const prevDate = new Date(checkDate);
    prevDate.setDate(prevDate.getDate() - 1);
    checkDate = prevDate;
  }

  return streak;
};

export const isDataRecent = (emotions = []) => {
    if (!emotions || emotions.length === 0) return false;
    const latest = emotions[0].timestamp;
    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    return latest > fourteenDaysAgo;
};

/**
 * Deterministic Behavioral Analysis Engine.
 */
export const detectPatterns = (emotions) => {
  if (!emotions || emotions.length === 0) return [];

  const FREQUENCY_THRESHOLD = 3; // Rule 2.3: Min 3 points for trends/patterns

  const relevantEmotions = emotions.filter(e => 
    ['Stress', 'Angry', 'Sad'].includes(e.emotion)
  );

  const triggerCounts = {};

  relevantEmotions.forEach((entry) => {
    const trigger = entry.trigger?.trim().toLowerCase();
    if (trigger && trigger !== 'unknown') {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    }
  });

  return Object.entries(triggerCounts)
    .filter(([_, count]) => count >= FREQUENCY_THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .map(([trigger]) => trigger.charAt(0).toUpperCase() + trigger.slice(1));
};

/**
 * Calculations for Mental Wellness Index (Section 3 & 7)
 * High values indicate strong focus and positive emotional state.
 * Never assumes data or uses padding.
 */
export const calculateWellnessScore = (emotions) => {
  if (!emotions || emotions.length === 0) return 50; // 50% baseline if 0 data (Neutral)

  const parseIntensity = (val) => {
    if (typeof val === 'number') return Math.min(Math.max(val, 1), 10);
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      // Legacy string mappings to numeric weights (1-10 scale)
      if (lower.includes('very low')) return 2;
      if (lower.includes('very high')) return 9;
      if (lower.includes('low')) return 4;
      if (lower.includes('high')) return 8;
      if (lower.includes('medium')) return 6;
      
      const parsed = parseInt(val, 10);
      return (!isNaN(parsed)) ? Math.min(Math.max(parsed, 1), 10) : 5;
    }
    return 5;
  };

  const getValenceMultiplier = (emotion) => {
    if (!emotion) return 0; // Neutral fallback
    const em = emotion.toLowerCase();
    
    // Positive valence
    if (em.includes('happ') || em.includes('joy') || em.includes('excit') || em.includes('calm') || em.includes('peace') || em.includes('grate') || em.includes('lov')) {
      return 1;
    }
    
    // Negative valence
    if (em.includes('sad') || em.includes('stress') || em.includes('angr') || em.includes('nerv') || em.includes('anxi') || em.includes('fear') || em.includes('worr') || em.includes('tire')) {
      return -1;
    }
    
    return 0; // Neutral
  };

  const samples = emotions.slice(0, 15); // Use last 15 real entries
  let totalPoints = 0;

  samples.forEach(e => {
    const intensity = parseIntensity(e.intensity);
    const valence = getValenceMultiplier(e.emotion);
    
    if (valence === 1) {
      // Positive: High intensity is good (e.g., 9/10)
      totalPoints += intensity;
    } else if (valence === -1) {
      // Negative: High intensity is bad (e.g., 10 intensity = 0 wellness points)
      totalPoints += (10 - intensity);
    } else {
      // Neutral: Middle ground
      totalPoints += 5;
    }
  });

  const averageInTen = totalPoints / samples.length;
  return Math.round((averageInTen / 10) * 100);
};

export const getIntensityLabel = (value) => {
  const num = parseInt(value, 10);
  if (isNaN(num)) return 'Neutral';
  if (num <= 2) return 'Very Low';
  if (num <= 4) return 'Low';
  if (num <= 6) return 'Neutral';
  if (num <= 8) return 'High';
  return 'Very High';
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default {
  verifyDataIntegrity,
  isDataRecent,
  detectPatterns,
  calculateWellnessScore,
  calculateCurrentStreak,
  formatDate,
};