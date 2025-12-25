'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Network connection information
 */
export interface NetworkStatus {
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Whether the connection is considered slow */
  isSlowConnection: boolean;
  /** Connection type (wifi, cellular, etc.) */
  connectionType: 'wifi' | 'cellular' | '4g' | '3g' | '2g' | 'unknown';
  /** Effective connection type */
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  /** Estimated downlink speed in Mbps */
  downlink: number;
  /** Round trip time in milliseconds */
  rtt: number;
}

// Navigator connection type definition
interface NetworkInformation extends EventTarget {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Hook to monitor network connectivity status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline, isSlowConnection } = useNetworkStatus();
 *
 *   if (!isOnline) {
 *     return <OfflineBanner />;
 *   }
 *
 *   if (isSlowConnection) {
 *     return <LowBandwidthMode />;
 *   }
 *
 *   return <NormalContent />;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  }));

  const updateNetworkStatus = useCallback(() => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const newStatus: NetworkStatus = {
      isOnline: navigator.onLine,
      isSlowConnection: false,
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
    };

    if (connection) {
      newStatus.connectionType = (connection.type as NetworkStatus['connectionType']) || 'unknown';
      newStatus.effectiveType = (connection.effectiveType as NetworkStatus['effectiveType']) || 'unknown';
      newStatus.downlink = connection.downlink || 0;
      newStatus.rtt = connection.rtt || 0;

      // Consider connection slow if:
      // - Effective type is 2g or slower
      // - RTT is greater than 500ms
      // - Downlink is less than 0.5 Mbps
      newStatus.isSlowConnection =
        ['slow-2g', '2g'].includes(newStatus.effectiveType) ||
        newStatus.rtt > 500 ||
        (newStatus.downlink > 0 && newStatus.downlink < 0.5);
    }

    setStatus(newStatus);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial status
    updateNetworkStatus();

    // Register event listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);

      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  return status;
}

export default useNetworkStatus;
