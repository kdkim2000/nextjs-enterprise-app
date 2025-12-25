/**
 * useOfflineMode Hook
 * Provides offline mode state and controls for inspection module
 */

import { useState, useEffect, useCallback } from 'react';
import { syncService, DownloadProgress } from '@/lib/offline/syncService';
import { OfflineMetadata } from '@/lib/offline/inspectionStore';
import { useNetworkStatus } from './useNetworkStatus';

export interface OfflineStats {
  inspectionCount: number;
  templateCount: number;
  itemCount: number;
  resultCount: number;
  pendingSyncCount: number;
  lastDownloadTime: number | null;
}

export interface UseOfflineModeReturn {
  // State
  isOfflineModeEnabled: boolean;
  isEffectivelyOffline: boolean; // Mode ON or no network
  isNetworkAvailable: boolean;
  hasOfflineData: boolean;
  downloadedCount: number;
  lastDownloadTime: Date | null;
  offlineStats: OfflineStats | null;

  // Download state
  isDownloading: boolean;
  downloadProgress: DownloadProgress | null;

  // Actions
  enableOfflineMode: () => Promise<void>;
  disableOfflineMode: () => Promise<void>;
  toggleOfflineMode: () => Promise<void>;
  downloadAllData: () => Promise<{ success: boolean; error?: string }>;
  clearOfflineData: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useOfflineMode(): UseOfflineModeReturn {
  const { isOnline: isNetworkAvailable } = useNetworkStatus();

  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(false);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null);
  const [lastDownloadTime, setLastDownloadTime] = useState<Date | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        await syncService.init();
        const [metadata, hasData, stats] = await Promise.all([
          syncService.getOfflineMetadata(),
          syncService.hasOfflineData(),
          syncService.getOfflineStats(),
        ]);

        setIsOfflineModeEnabled(metadata?.isOfflineModeEnabled ?? false);
        setHasOfflineData(hasData);
        setOfflineStats(stats);
        if (metadata?.lastDownloadTime) {
          setLastDownloadTime(new Date(metadata.lastDownloadTime));
        }
        setInitialized(true);
      } catch (error) {
        console.error('Failed to load offline mode state:', error);
        setInitialized(true);
      }
    };

    loadState();
  }, []);

  // Subscribe to download progress
  useEffect(() => {
    const unsubscribe = syncService.onDownloadProgress((progress) => {
      setDownloadProgress(progress);
      if (progress.stage === 'complete') {
        setIsDownloading(false);
        // Refresh stats after download
        refreshStats();
      }
    });

    return unsubscribe;
  }, []);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const [stats, hasData, metadata] = await Promise.all([
        syncService.getOfflineStats(),
        syncService.hasOfflineData(),
        syncService.getOfflineMetadata(),
      ]);
      setOfflineStats(stats);
      setHasOfflineData(hasData);
      if (metadata?.lastDownloadTime) {
        setLastDownloadTime(new Date(metadata.lastDownloadTime));
      }
    } catch (error) {
      console.error('Failed to refresh offline stats:', error);
    }
  }, []);

  // Enable offline mode
  const enableOfflineMode = useCallback(async () => {
    try {
      await syncService.setOfflineModeEnabled(true);
      setIsOfflineModeEnabled(true);
    } catch (error) {
      console.error('Failed to enable offline mode:', error);
      throw error;
    }
  }, []);

  // Disable offline mode
  const disableOfflineMode = useCallback(async () => {
    try {
      await syncService.setOfflineModeEnabled(false);
      setIsOfflineModeEnabled(false);
    } catch (error) {
      console.error('Failed to disable offline mode:', error);
      throw error;
    }
  }, []);

  // Toggle offline mode
  const toggleOfflineMode = useCallback(async () => {
    if (isOfflineModeEnabled) {
      await disableOfflineMode();
    } else {
      await enableOfflineMode();
    }
  }, [isOfflineModeEnabled, enableOfflineMode, disableOfflineMode]);

  // Download all data
  const downloadAllData = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isNetworkAvailable) {
      return { success: false, error: 'Network not available' };
    }

    setIsDownloading(true);
    setDownloadProgress(null);

    try {
      const result = await syncService.downloadAllForOffline();
      if (result.success) {
        await refreshStats();
        setHasOfflineData(true);
      }
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Failed to download offline data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsDownloading(false);
    }
  }, [isNetworkAvailable, refreshStats]);

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await syncService.clearOfflineData();
      setHasOfflineData(false);
      setOfflineStats(null);
      setLastDownloadTime(null);
      setIsOfflineModeEnabled(false);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  }, []);

  // Computed: effectively offline (mode enabled OR no network)
  const isEffectivelyOffline = isOfflineModeEnabled || !isNetworkAvailable;

  // Downloaded count
  const downloadedCount = offlineStats?.inspectionCount ?? 0;

  return {
    // State
    isOfflineModeEnabled,
    isEffectivelyOffline,
    isNetworkAvailable,
    hasOfflineData,
    downloadedCount,
    lastDownloadTime,
    offlineStats,

    // Download state
    isDownloading,
    downloadProgress,

    // Actions
    enableOfflineMode,
    disableOfflineMode,
    toggleOfflineMode,
    downloadAllData,
    clearOfflineData,
    refreshStats,
  };
}

export default useOfflineMode;
