'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseAutoLogoutOptions {
  timeout?: number; // Timeout in milliseconds (default: 30 minutes)
  warningTime?: number; // Show warning before timeout (default: 2 minutes)
  onWarning?: () => void;
  onLogout?: () => void;
}

export function useAutoLogout(options: UseAutoLogoutOptions = {}) {
  const {
    timeout = 30 * 60 * 1000, // 30 minutes
    warningTime = 2 * 60 * 1000, // 2 minutes
    onWarning,
    onLogout
  } = options;

  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setShowWarning(false);

    if (!isAuthenticated) return;

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingTime(warningTime / 1000);
      onWarning?.();

      // Start countdown
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeout - warningTime);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleAutoLogout();
    }, timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, timeout, warningTime, onWarning]);

  const handleAutoLogout = useCallback(async () => {
    setShowWarning(false);
    onLogout?.();
    await logout();
  }, [logout, onLogout]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) return;

    resetTimer();

    // Events that reset the timer (user activity)
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetTimer, showWarning]);

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout: handleAutoLogout
  };
}
