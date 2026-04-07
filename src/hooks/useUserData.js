import { useState, useEffect } from 'react';
import { 
  verifyDataIntegrity, 
  isDataRecent, 
  detectPatterns, 
  calculateWellnessScore,
  calculateCurrentStreak 
} from '../utils/helpers';
import { getUserEmotions } from '../services/dbService';
import { useAuth } from './useAuth';

export const useUserData = () => {
  const { user } = useAuth();
  const [emotions, setEmotions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(50);
  const [streak, setStreak] = useState(0);
  const [isRecent, setIsRecent] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (user && user.uid) {
      try {
        const history = await getUserEmotions(user.uid);
        const verified = verifyDataIntegrity(history);
        
        setEmotions(verified);
        setPatterns(detectPatterns(verified));
        setWellnessScore(calculateWellnessScore(verified));
        setIsRecent(isDataRecent(verified));
        setStreak(calculateCurrentStreak(verified));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    emotions,
    patterns,
    wellnessScore,
    streak,
    isRecent,
    loading,
    refreshData: fetchData,
  };
};

export default useUserData;