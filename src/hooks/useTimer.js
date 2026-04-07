import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage a countdown timer.
 * @param {number} initialSeconds - Total seconds to count down from.
 * @param {function} onFinish - Optional callback when timer hits 0.
 */
export const useTimer = (initialSeconds = 0, onFinish = null) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(initialSeconds);
    }
  }, [initialSeconds, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
      if (onFinish) onFinish();
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, onFinish]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = (seconds) => {
    setIsActive(false);
    setTimeLeft(seconds || initialSeconds);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return {
    timeLeft,
    isActive,
    start,
    pause,
    reset,
    formattedTime: formatTime(timeLeft),
  };
};

export default useTimer;
