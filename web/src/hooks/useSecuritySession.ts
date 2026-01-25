import { useState, useEffect } from 'react';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export const useSecuritySession = () => {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS);
    };

    // Events to track activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    resetTimer(); // Start timer on mount

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, []);

  const togglePrivacyMode = () => setPrivacyMode(prev => !prev);

  return {
    privacyMode,
    togglePrivacyMode,
    isIdle
  };
};
