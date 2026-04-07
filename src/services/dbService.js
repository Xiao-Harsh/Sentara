import { ref, push, set, get, child } from 'firebase/database';
import { db } from '../firebase/config';

/**
 * Persists a validated emotion entry to Firebase Realtime Database.
 */
export const saveEmotion = async (userId, data) => {
  if (!userId || !data) {
    console.warn('Invalid emotion data or userId rejected:', { userId, data });
    return null;
  }

  try {
    const emotionRef = ref(db, `emotions/${userId}`);
    const newEntryRef = push(emotionRef);
    
    const entry = {
      userId,
      ...data,
      timestamp: Date.now(),
    };

    await set(newEntryRef, entry);
    return newEntryRef.key;
  } catch (error) {
    console.error('Error saving emotion to Realtime DB:', error);
    return null;
  }
};

/**
 * Retrieves normalized emotion history for a specific user from Realtime DB.
 */
export const getUserEmotions = async (userId) => {
  if (!userId) return [];

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `emotions/${userId}`));
    
    if (!snapshot.exists()) return [];

    const emotions = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      emotions.push({
        id: childSnapshot.key,
        userId: data.userId || userId,
        emotion: data.emotion,
        intensity: data.intensity,
        trigger: data.trigger || 'Unknown',
        suggestions: data.suggestions || [],
        timestamp: data.timestamp || Date.now(),
      });
    });

    // Sort by timestamp descending (most recent first)
    return emotions.sort((a, b) => b.timestamp - a.timestamp);
    
  } catch (error) {
    console.error('Error fetching emotions from Realtime DB:', error);
    return [];
  }
};

/**
 * Deletes a specific emotion entry from Realtime DB.
 */
export const deleteEmotion = async (userId, entryId) => {
  if (!userId || !entryId) return false;

  try {
    const emotionRef = ref(db, `emotions/${userId}/${entryId}`);
    await set(emotionRef, null); 
    return true;
  } catch (error) {
    console.error('Error deleting emotion from Realtime DB:', error);
    return false;
  }
};

/**
 * Persists onboarding data for a specific user.
 */
export const saveOnboardingData = async (userId, data) => {
  if (!userId || !data) return false;

  try {
    const userRef = ref(db, `users/${userId}/onboarding`);
    await set(userRef, data);
    return true;
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return false;
  }
};

/**
 * Retrieves onboarding data for a specific user.
 */
export const getOnboardingData = async (userId) => {
  if (!userId) return null;

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/onboarding`));
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return null;
  }
};
/**
 * Persists user profile metadata (Gender, etc.) to Realtime DB.
 */
export const saveUserProfile = async (userId, data) => {
  if (!userId || !data) return false;

  try {
    const userRef = ref(db, `users/${userId}/profile`);
    await set(userRef, data);
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

/**
 * Retrieves user profile metadata (Gender, etc.) from Realtime DB.
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/profile`));
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Persists an assessment result.
 */
export const saveAssessmentResult = async (userId, data) => {
  if (!userId || !data) return null;
  try {
    const assessmentRef = ref(db, `assessments/${userId}`);
    const newEntryRef = push(assessmentRef);
    const entry = {
      userId,
      ...data,
      timestamp: Date.now(),
    };
    await set(newEntryRef, entry);
    return newEntryRef.key;
  } catch (error) {
    console.error('Error saving assessment result:', error);
    return null;
  }
};

/**
 * Retrieves the latest assessment result for a user.
 */
export const getLatestAssessmentResult = async (userId) => {
  if (!userId) return null;
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `assessments/${userId}`));
    
    if (!snapshot.exists()) return null;

    const results = [];
    snapshot.forEach((childSnapshot) => {
      results.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp - a.timestamp);
    return results[0];
  } catch (error) {
    console.error('Error fetching latest assessment:', error);
    return null;
  }
};

/**
 * Persists a game session log.
 */
export const saveGameSession = async (userId, data) => {
  if (!userId || !data) return null;
  try {
    const gameRef = ref(db, `games/${userId}`);
    const newEntryRef = push(gameRef);
    const entry = {
      userId,
      ...data,
      timestamp: Date.now(),
    };
    await set(newEntryRef, entry);
    return newEntryRef.key;
  } catch (error) {
    console.error('Error saving game session:', error);
    return null;
  }
};

/**
 * Persists a daily tool usage log.
 */
export const saveDailyToolLog = async (userId, data) => {
  if (!userId || !data) return null;
  try {
    const toolsRef = ref(db, `tools/${userId}`);
    const newEntryRef = push(toolsRef);
    const entry = {
      userId,
      ...data,
      timestamp: Date.now(),
    };
    await set(newEntryRef, entry);
    return newEntryRef.key;
  } catch (error) {
    console.error('Error saving daily tool log:', error);
    return null;
  }
};

/**
 * Retrieves all tool logs for a specific user.
 */
export const getDailyToolLogs = async (userId) => {
  if (!userId) return [];
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `tools/${userId}`));
    
    if (!snapshot.exists()) return [];

    const logs = [];
    snapshot.forEach((childSnapshot) => {
      logs.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error fetching tool logs:', error);
    return [];
  }
};


export default {
  saveEmotion,
  getUserEmotions,
  deleteEmotion,
  saveOnboardingData,
  getOnboardingData,
  saveUserProfile,
  getUserProfile,
  saveAssessmentResult,
  getLatestAssessmentResult,
  saveGameSession,
  saveDailyToolLog,
  getDailyToolLogs,
};