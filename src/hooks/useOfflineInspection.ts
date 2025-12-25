'use client';

import { useState, useEffect, useCallback } from 'react';
import { inspectionStore, OfflineInspection, OfflineItem, OfflineResult } from '@/lib/offline/inspectionStore';
import { syncService } from '@/lib/offline/syncService';
import { inspectionApi } from '@/lib/axios';

export interface OfflineInspectionData {
  inspection: OfflineInspection | null;
  items: OfflineItem[];
  results: Record<string, OfflineResult>;
  isOffline: boolean;
  isAvailableOffline: boolean;
}

/**
 * Hook for managing inspection data with offline support
 */
export function useOfflineInspection(inspectionId: string) {
  const [data, setData] = useState<OfflineInspectionData>({
    inspection: null,
    items: [],
    results: {},
    isOffline: false,
    isAvailableOffline: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if data is available offline
  const checkOfflineAvailability = useCallback(async () => {
    const inspection = await inspectionStore.getInspection(inspectionId);
    return !!inspection;
  }, [inspectionId]);

  // Fetch data (from offline store or server)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isOnline = syncService.isOnline();
      const offlineInspection = await inspectionStore.getInspection(inspectionId);

      // If offline and have local data, use it
      if (!isOnline && offlineInspection) {
        const items = await inspectionStore.getItemsByTemplate(offlineInspection.template_id);
        const resultsList = await inspectionStore.getResultsByInspection(inspectionId);
        const resultsMap: Record<string, OfflineResult> = {};
        resultsList.forEach((r) => {
          resultsMap[r.item_id] = r;
        });

        setData({
          inspection: offlineInspection,
          items,
          results: resultsMap,
          isOffline: true,
          isAvailableOffline: true,
        });
        return;
      }

      // If online, fetch from server
      if (isOnline) {
        const inspectionResponse = await inspectionApi.get(`/executions/${inspectionId}`);
        const inspection = inspectionResponse.inspection;

        const itemsResponse = await inspectionApi.get(`/items?template_id=${inspection.template_id}`);
        const items = (itemsResponse.items || []).map((item: OfflineItem) => ({
          ...item,
          lastSynced: Date.now(),
        }));

        const resultsResponse = await inspectionApi.get(`/executions/${inspectionId}/results`);
        const resultsList = resultsResponse.results || [];
        const resultsMap: Record<string, OfflineResult> = {};
        resultsList.forEach((r: { item_id: string; value?: string; notes?: string; photo_url?: string }) => {
          resultsMap[r.item_id] = {
            id: `${inspectionId}_${r.item_id}`,
            inspection_id: inspectionId,
            item_id: r.item_id,
            value: r.value || '',
            notes: r.notes,
            photo_url: r.photo_url,
            lastModified: Date.now(),
            isSynced: true,
          };
        });

        const isAvailableOffline = await checkOfflineAvailability();

        setData({
          inspection: {
            id: inspection.id,
            template_id: inspection.template_id,
            inspection_code: inspection.inspection_code,
            title: inspection.title,
            status: inspection.status,
            scheduled_date: inspection.scheduled_date,
            location: inspection.location,
            inspector_id: inspection.inspector_id,
          },
          items,
          results: resultsMap,
          isOffline: false,
          isAvailableOffline,
        });
        return;
      }

      // Offline and no local data
      setError('No offline data available');
    } catch (err) {
      console.error('Failed to fetch inspection data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [inspectionId, checkOfflineAvailability]);

  // Load on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for online/offline changes
  useEffect(() => {
    const handleOnline = () => {
      fetchData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchData]);

  // Download for offline use
  const downloadForOffline = useCallback(async () => {
    try {
      setSaving(true);
      await syncService.downloadForOffline(inspectionId);
      setData((prev) => ({ ...prev, isAvailableOffline: true }));
    } catch (err) {
      console.error('Failed to download for offline:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [inspectionId]);

  // Save results
  const saveResults = useCallback(
    async (results: Array<{ item_id: string; value: string; notes?: string; photo_url?: string }>) => {
      try {
        setSaving(true);

        // Save to local storage
        const offlineResults: OfflineResult[] = results.map((r) => ({
          id: `${inspectionId}_${r.item_id}`,
          inspection_id: inspectionId,
          item_id: r.item_id,
          value: r.value,
          notes: r.notes,
          photo_url: r.photo_url,
          lastModified: Date.now(),
          isSynced: false,
        }));

        await inspectionStore.saveResults(offlineResults);

        // Update local state
        const newResultsMap: Record<string, OfflineResult> = { ...data.results };
        offlineResults.forEach((r) => {
          newResultsMap[r.item_id] = r;
        });
        setData((prev) => ({ ...prev, results: newResultsMap }));

        // Queue for sync if online
        if (syncService.isOnline()) {
          await inspectionApi.put(`/executions/${inspectionId}/results`, { results });
          // Mark as synced
          for (const r of offlineResults) {
            await inspectionStore.markResultSynced(r.id);
          }
        } else {
          // Queue for later sync
          await syncService.queueApiCall(
            `/executions/${inspectionId}/results`,
            'PUT',
            { results },
            'update'
          );
        }

        return true;
      } catch (err) {
        console.error('Failed to save results:', err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [inspectionId, data.results]
  );

  // Submit inspection
  const submitInspection = useCallback(async () => {
    try {
      setSaving(true);

      // Update local status
      if (data.inspection) {
        await inspectionStore.saveInspection({
          ...data.inspection,
          status: 'completed',
        });
        setData((prev) => ({
          ...prev,
          inspection: prev.inspection ? { ...prev.inspection, status: 'completed' } : null,
        }));
      }

      // Submit to server or queue
      if (syncService.isOnline()) {
        await inspectionApi.post(`/executions/${inspectionId}/submit`);
      } else {
        await syncService.queueApiCall(`/executions/${inspectionId}/submit`, 'POST', {}, 'update');
      }

      return true;
    } catch (err) {
      console.error('Failed to submit inspection:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [inspectionId, data.inspection]);

  // Update a single result locally
  const updateResult = useCallback(
    (itemId: string, value: string, notes?: string, photoUrl?: string) => {
      const result: OfflineResult = {
        id: `${inspectionId}_${itemId}`,
        inspection_id: inspectionId,
        item_id: itemId,
        value,
        notes,
        photo_url: photoUrl,
        lastModified: Date.now(),
        isSynced: false,
      };

      setData((prev) => ({
        ...prev,
        results: {
          ...prev.results,
          [itemId]: result,
        },
      }));

      // Save to IndexedDB (fire and forget)
      inspectionStore.saveResult(result);
    },
    [inspectionId]
  );

  // Remove offline data
  const removeOfflineData = useCallback(async () => {
    await inspectionStore.delete('inspections', inspectionId);
    const results = await inspectionStore.getResultsByInspection(inspectionId);
    for (const result of results) {
      await inspectionStore.delete('results', result.id);
    }
    setData((prev) => ({ ...prev, isAvailableOffline: false }));
  }, [inspectionId]);

  return {
    ...data,
    loading,
    saving,
    error,
    fetchData,
    downloadForOffline,
    saveResults,
    submitInspection,
    updateResult,
    removeOfflineData,
  };
}

export default useOfflineInspection;
