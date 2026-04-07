import { useState } from 'react';

/**
 * Custom hook to manage the 3-step exercise flow.
 * @param {object} navigation - Navigation object for handling exit.
 */
export const useExerciseFlow = (navigation) => {
  const [step, setStep] = useState(0); // 0: instructions, 1: exercise, 2: complete
  const [duration, setDuration] = useState(60); // In seconds
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const startExercise = (sec) => {
    if (sec) setDuration(sec);
    setStep(1);
    setSessionStartTime(Date.now());
  };

  const completeExercise = () => {
    setStep(2);
  };

  const resetFlow = () => {
    setStep(0);
    setSessionStartTime(null);
  };

  const getTimeSpent = () => {
    if (!sessionStartTime) return '0:00';
    const totalSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return {
    step,
    duration,
    setDuration,
    startExercise,
    completeExercise,
    resetFlow,
    timeSpent: getTimeSpent(),
  };
};

export default useExerciseFlow;
