'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: number | null;
  lastOfflineTime: number | null;
}

/**
 * Hook for detecting online/offline status
 */
export function useOnlineStatus(): OnlineStatusState & {
  checkConnection: () => Promise<boolean>;
} {
  const [state, setState] = useState<OnlineStatusState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineTime: null,
    lastOfflineTime: null,
  });

  // Check actual connection by pinging a server
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: true,
        wasOffline: true,
        lastOnlineTime: Date.now(),
      }));
    };

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: false,
        lastOfflineTime: Date.now(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
      checkConnection().then((connected) => {
        if (!connected) {
          setState((prev) => ({
            ...prev,
            isOnline: false,
            lastOfflineTime: Date.now(),
          }));
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  return {
    ...state,
    checkConnection,
  };
}

export default useOnlineStatus;
