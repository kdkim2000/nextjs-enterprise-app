'use client';

import { useState, useEffect, useCallback } from 'react';
import { syncService, SyncStatus, SyncProgress } from '@/lib/offline/syncService';

/**
 * Hook for sync status and operations
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    lastSyncTime: null,
    error: null,
  });

  const [progress, setProgress] = useState<SyncProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    current: null,
  });

  // Initialize
  useEffect(() => {
    const init = async () => {
      await syncService.init();
      const initialStatus = await syncService.getStatus();
      setStatus(initialStatus);
    };

    init();

    // Subscribe to status changes
    const unsubscribeStatus = syncService.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Subscribe to progress updates
    const unsubscribeProgress = syncService.onProgress((newProgress) => {
      setProgress(newProgress);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeProgress();
    };
  }, []);

  // Manual sync
  const sync = useCallback(async () => {
    return syncService.sync();
  }, []);

  // Retry failed
  const retryFailed = useCallback(async () => {
    await syncService.retryFailed();
  }, []);

  // Clear failed
  const clearFailed = useCallback(async () => {
    await syncService.clearFailed();
  }, []);

  // Start auto sync
  const startAutoSync = useCallback((intervalMs?: number) => {
    syncService.startAutoSync(intervalMs);
  }, []);

  // Stop auto sync
  const stopAutoSync = useCallback(() => {
    syncService.stopAutoSync();
  }, []);

  // Download for offline
  const downloadForOffline = useCallback(async (inspectionId: string) => {
    await syncService.downloadForOffline(inspectionId);
  }, []);

  return {
    status,
    progress,
    sync,
    retryFailed,
    clearFailed,
    startAutoSync,
    stopAutoSync,
    downloadForOffline,
    hasPending: status.pendingCount > 0,
    hasFailed: status.failedCount > 0,
  };
}

export default useSyncStatus;
