/**
 * Sync Service for Offline Data Synchronization
 * Handles syncing local changes to the server when online
 */

import { inspectionStore, SyncQueueItem, OfflineResult } from './inspectionStore';
import { inspectionApi } from '@/lib/axios';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncTime: number | null;
  error: string | null;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  current: string | null;
}

type SyncProgressCallback = (progress: SyncProgress) => void;
type SyncStatusCallback = (status: SyncStatus) => void;

class SyncService {
  private isSyncing = false;
  private lastSyncTime: number | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private statusListeners: Set<SyncStatusCallback> = new Set();
  private progressListeners: Set<SyncProgressCallback> = new Set();

  /**
   * Initialize sync service
   */
  async init(): Promise<void> {
    await inspectionStore.init();

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.stopAutoSync();
  }

  /**
   * Handle coming online
   */
  private handleOnline = async (): Promise<void> => {
    console.log('Network online - starting sync');
    this.notifyStatusChange();
    await this.sync();
  };

  /**
   * Handle going offline
   */
  private handleOffline = (): void => {
    console.log('Network offline');
    this.notifyStatusChange();
  };

  /**
   * Check if online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: SyncStatusCallback): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: SyncProgressCallback): () => void {
    this.progressListeners.add(callback);
    return () => this.progressListeners.delete(callback);
  }

  /**
   * Notify status listeners
   */
  private async notifyStatusChange(): Promise<void> {
    const status = await this.getStatus();
    this.statusListeners.forEach((cb) => cb(status));
  }

  /**
   * Notify progress listeners
   */
  private notifyProgress(progress: SyncProgress): void {
    this.progressListeners.forEach((cb) => cb(progress));
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const counts = await inspectionStore.getSyncQueueCount();
    return {
      isOnline: this.isOnline(),
      isSyncing: this.isSyncing,
      pendingCount: counts.pending,
      failedCount: counts.failed,
      lastSyncTime: this.lastSyncTime,
      error: null,
    };
  }

  /**
   * Start auto sync
   */
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = setInterval(async () => {
      if (this.isOnline() && !this.isSyncing) {
        await this.sync();
      }
    }, intervalMs);

    // Initial sync
    if (this.isOnline()) {
      this.sync();
    }
  }

  /**
   * Stop auto sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Main sync function
   */
  async sync(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0 };
    }

    if (!this.isOnline()) {
      return { success: false, synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    await this.notifyStatusChange();

    let synced = 0;
    let failed = 0;

    try {
      const pendingItems = await inspectionStore.getPendingSyncItems();
      const total = pendingItems.length;

      this.notifyProgress({
        total,
        completed: 0,
        failed: 0,
        current: null,
      });

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await inspectionStore.removeSyncItem(item.id);
          synced++;
        } catch (error) {
          console.error('Failed to sync item:', item.id, error);
          await inspectionStore.updateSyncItemStatus(
            item.id,
            item.retryCount >= 3 ? 'failed' : 'pending',
            error instanceof Error ? error.message : 'Unknown error'
          );
          failed++;
        }

        this.notifyProgress({
          total,
          completed: synced,
          failed,
          current: item.id,
        });
      }

      this.lastSyncTime = Date.now();
      return { success: true, synced, failed };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, synced, failed };
    } finally {
      this.isSyncing = false;
      await this.notifyStatusChange();
    }
  }

  /**
   * Sync a single queue item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    await inspectionStore.updateSyncItemStatus(item.id, 'syncing');

    switch (item.method) {
      case 'GET':
        await inspectionApi.get(item.endpoint);
        break;
      case 'POST':
        await inspectionApi.post(item.endpoint, item.data);
        break;
      case 'PUT':
        await inspectionApi.put(item.endpoint, item.data);
        break;
      case 'DELETE':
        await inspectionApi.delete(item.endpoint);
        break;
    }
  }

  /**
   * Queue an API call for sync
   */
  async queueApiCall(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: unknown,
    type: 'create' | 'update' | 'delete' = 'update'
  ): Promise<string> {
    const id = await inspectionStore.addToSyncQueue({
      type,
      store: 'api',
      data,
      endpoint,
      method,
    });

    await this.notifyStatusChange();

    // Try to sync immediately if online
    if (this.isOnline()) {
      this.sync();
    }

    return id;
  }

  /**
   * Save inspection results with offline support
   */
  async saveResults(
    inspectionId: string,
    results: Array<{
      item_id: string;
      value: string;
      notes?: string;
      photo_url?: string;
    }>
  ): Promise<void> {
    // Save to local storage first
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

    // Queue for sync
    await this.queueApiCall(
      `/executions/${inspectionId}/results`,
      'PUT',
      { results },
      'update'
    );
  }

  /**
   * Submit inspection with offline support
   */
  async submitInspection(inspectionId: string): Promise<void> {
    // Update local status
    const inspection = await inspectionStore.getInspection(inspectionId);
    if (inspection) {
      await inspectionStore.saveInspection({
        ...inspection,
        status: 'completed',
      });
    }

    // Queue for sync
    await this.queueApiCall(
      `/executions/${inspectionId}/submit`,
      'POST',
      {},
      'update'
    );
  }

  /**
   * Download inspection data for offline use
   */
  async downloadForOffline(inspectionId: string): Promise<void> {
    if (!this.isOnline()) {
      throw new Error('Cannot download while offline');
    }

    try {
      // Fetch inspection
      const inspectionResponse = await inspectionApi.get(`/executions/${inspectionId}`);
      const inspection = inspectionResponse.inspection;

      // Save inspection
      await inspectionStore.saveInspection({
        id: inspection.id,
        template_id: inspection.template_id,
        inspection_code: inspection.inspection_code,
        title: inspection.title,
        status: inspection.status,
        scheduled_date: inspection.scheduled_date,
        location: inspection.location,
        inspector_id: inspection.inspector_id,
      });

      // Fetch and save template
      if (inspection.template_id) {
        const templateResponse = await inspectionApi.get(`/templates/${inspection.template_id}`);
        const template = templateResponse.template;

        await inspectionStore.saveTemplate({
          id: template.id,
          template_code: template.template_code,
          template_name: template.template_name,
          description: template.description,
          category: template.category,
        });

        // Fetch and save items
        const itemsResponse = await inspectionApi.get(`/items?template_id=${inspection.template_id}`);
        const items = itemsResponse.items || [];

        await inspectionStore.saveItems(
          items.map((item: {
            id: string;
            template_id: string;
            item_code: string;
            item_name: string;
            item_type: string;
            description?: string;
            options?: string;
            required: boolean;
            sort_order: number;
            parent_id?: string;
          }) => ({
            id: item.id,
            template_id: item.template_id,
            item_code: item.item_code,
            item_name: item.item_name,
            item_type: item.item_type,
            description: item.description,
            options: item.options,
            required: item.required,
            sort_order: item.sort_order,
            parent_id: item.parent_id,
          }))
        );
      }

      // Fetch and save existing results
      const resultsResponse = await inspectionApi.get(`/executions/${inspectionId}/results`);
      const results = resultsResponse.results || [];

      await inspectionStore.saveResults(
        results.map((r: {
          id: string;
          inspection_id: string;
          item_id: string;
          value: string;
          notes?: string;
          photo_url?: string;
        }) => ({
          id: `${inspectionId}_${r.item_id}`,
          inspection_id: inspectionId,
          item_id: r.item_id,
          value: r.value || '',
          notes: r.notes,
          photo_url: r.photo_url,
          lastModified: Date.now(),
          isSynced: true,
        }))
      );

      console.log(`Inspection ${inspectionId} downloaded for offline use`);
    } catch (error) {
      console.error('Failed to download inspection for offline:', error);
      throw error;
    }
  }

  /**
   * Get inspection data (from offline store if available)
   */
  async getInspectionData(inspectionId: string): Promise<{
    inspection: unknown;
    items: unknown[];
    results: unknown[];
    isOffline: boolean;
  } | null> {
    // Try to get from offline store first
    const offlineInspection = await inspectionStore.getInspection(inspectionId);

    if (offlineInspection) {
      const items = await inspectionStore.getItemsByTemplate(offlineInspection.template_id);
      const results = await inspectionStore.getResultsByInspection(inspectionId);

      return {
        inspection: offlineInspection,
        items,
        results,
        isOffline: !this.isOnline(),
      };
    }

    // If online, fetch from server
    if (this.isOnline()) {
      try {
        const inspectionResponse = await inspectionApi.get(`/executions/${inspectionId}`);
        const itemsResponse = await inspectionApi.get(
          `/items?template_id=${inspectionResponse.inspection.template_id}`
        );
        const resultsResponse = await inspectionApi.get(`/executions/${inspectionId}/results`);

        return {
          inspection: inspectionResponse.inspection,
          items: itemsResponse.items || [],
          results: resultsResponse.results || [],
          isOffline: false,
        };
      } catch (error) {
        console.error('Failed to fetch inspection data:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Retry failed sync items
   */
  async retryFailed(): Promise<void> {
    const allItems = await inspectionStore.getAllSyncItems();
    const failedItems = allItems.filter((item) => item.status === 'failed');

    for (const item of failedItems) {
      await inspectionStore.updateSyncItemStatus(item.id, 'pending');
    }

    await this.notifyStatusChange();

    if (this.isOnline()) {
      await this.sync();
    }
  }

  /**
   * Clear all failed items
   */
  async clearFailed(): Promise<void> {
    const allItems = await inspectionStore.getAllSyncItems();
    const failedItems = allItems.filter((item) => item.status === 'failed');

    for (const item of failedItems) {
      await inspectionStore.removeSyncItem(item.id);
    }

    await this.notifyStatusChange();
  }
}

// Singleton instance
export const syncService = new SyncService();
export default syncService;
