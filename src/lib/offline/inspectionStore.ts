/**
 * IndexedDB Store for Offline Inspection Data
 * Provides persistent storage for inspections, items, and results when offline
 */

const DB_NAME = 'inspection-offline-db';
const DB_VERSION = 2; // Bumped for OFFLINE_META store

// Store names
export const STORES = {
  INSPECTIONS: 'inspections',
  ITEMS: 'items',
  RESULTS: 'results',
  SYNC_QUEUE: 'sync_queue',
  TEMPLATES: 'templates',
  OFFLINE_META: 'offline_meta', // New: offline mode metadata
} as const;

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  store: string;
  data: unknown;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

export interface OfflineInspection {
  id: string;
  template_id: string;
  inspection_code: string;
  title: string;
  status: string;
  scheduled_date?: string;
  location?: string;
  inspector_id?: string;
  template?: OfflineTemplate;
  lastSynced?: number;
  isOfflineCreated?: boolean;
}

export interface OfflineTemplate {
  id: string;
  template_code: string;
  template_name: string;
  description?: string;
  category?: string;
  lastSynced?: number;
}

export interface OfflineItem {
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
  lastSynced?: number;
}

export interface OfflineResult {
  id: string;
  inspection_id: string;
  item_id: string;
  value: string;
  notes?: string;
  photo_url?: string;
  signature_url?: string;
  lastModified: number;
  isSynced: boolean;
}

/**
 * Offline mode metadata - singleton record
 */
export interface OfflineMetadata {
  id: 'singleton'; // Always 'singleton' for single record
  isOfflineModeEnabled: boolean;
  lastDownloadTime: number | null;
  downloadedInspectionIds: string[];
  downloadedTemplateIds: string[];
  downloadedItemCount: number;
  serverDataVersion?: string;
}

class InspectionStore {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not available'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Inspections store
        if (!db.objectStoreNames.contains(STORES.INSPECTIONS)) {
          const inspectionStore = db.createObjectStore(STORES.INSPECTIONS, { keyPath: 'id' });
          inspectionStore.createIndex('template_id', 'template_id', { unique: false });
          inspectionStore.createIndex('status', 'status', { unique: false });
          inspectionStore.createIndex('scheduled_date', 'scheduled_date', { unique: false });
        }

        // Templates store
        if (!db.objectStoreNames.contains(STORES.TEMPLATES)) {
          const templateStore = db.createObjectStore(STORES.TEMPLATES, { keyPath: 'id' });
          templateStore.createIndex('template_code', 'template_code', { unique: false });
        }

        // Items store
        if (!db.objectStoreNames.contains(STORES.ITEMS)) {
          const itemStore = db.createObjectStore(STORES.ITEMS, { keyPath: 'id' });
          itemStore.createIndex('template_id', 'template_id', { unique: false });
          itemStore.createIndex('parent_id', 'parent_id', { unique: false });
        }

        // Results store
        if (!db.objectStoreNames.contains(STORES.RESULTS)) {
          const resultStore = db.createObjectStore(STORES.RESULTS, { keyPath: 'id' });
          resultStore.createIndex('inspection_id', 'inspection_id', { unique: false });
          resultStore.createIndex('item_id', 'item_id', { unique: false });
          resultStore.createIndex('isSynced', 'isSynced', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Offline metadata store (v2)
        if (!db.objectStoreNames.contains(STORES.OFFLINE_META)) {
          db.createObjectStore(STORES.OFFLINE_META, { keyPath: 'id' });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Get database instance
   */
  private async getDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  /**
   * Generic get by ID
   */
  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic get all
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic get by index
   */
  async getByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic put (insert or update)
   */
  async put<T>(storeName: string, data: T): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic put many
   */
  async putMany<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach((item) => {
        store.put(item);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Generic delete
   */
  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear a store
   */
  async clear(storeName: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Inspection-specific methods ====================

  /**
   * Save inspection for offline use
   */
  async saveInspection(inspection: OfflineInspection): Promise<void> {
    await this.put(STORES.INSPECTIONS, {
      ...inspection,
      lastSynced: Date.now(),
    });
  }

  /**
   * Get inspection by ID
   */
  async getInspection(id: string): Promise<OfflineInspection | undefined> {
    return this.get<OfflineInspection>(STORES.INSPECTIONS, id);
  }

  /**
   * Get all offline inspections
   */
  async getAllInspections(): Promise<OfflineInspection[]> {
    return this.getAll<OfflineInspection>(STORES.INSPECTIONS);
  }

  /**
   * Get inspections by status
   */
  async getInspectionsByStatus(status: string): Promise<OfflineInspection[]> {
    return this.getByIndex<OfflineInspection>(STORES.INSPECTIONS, 'status', status);
  }

  // ==================== Template methods ====================

  /**
   * Save template for offline use
   */
  async saveTemplate(template: OfflineTemplate): Promise<void> {
    await this.put(STORES.TEMPLATES, {
      ...template,
      lastSynced: Date.now(),
    });
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<OfflineTemplate | undefined> {
    return this.get<OfflineTemplate>(STORES.TEMPLATES, id);
  }

  // ==================== Item methods ====================

  /**
   * Save items for a template
   */
  async saveItems(items: OfflineItem[]): Promise<void> {
    await this.putMany(STORES.ITEMS, items.map((item) => ({
      ...item,
      lastSynced: Date.now(),
    })));
  }

  /**
   * Get items by template ID
   */
  async getItemsByTemplate(templateId: string): Promise<OfflineItem[]> {
    return this.getByIndex<OfflineItem>(STORES.ITEMS, 'template_id', templateId);
  }

  // ==================== Result methods ====================

  /**
   * Save result
   */
  async saveResult(result: OfflineResult): Promise<void> {
    await this.put(STORES.RESULTS, result);
  }

  /**
   * Save multiple results
   */
  async saveResults(results: OfflineResult[]): Promise<void> {
    await this.putMany(STORES.RESULTS, results);
  }

  /**
   * Get results by inspection ID
   */
  async getResultsByInspection(inspectionId: string): Promise<OfflineResult[]> {
    return this.getByIndex<OfflineResult>(STORES.RESULTS, 'inspection_id', inspectionId);
  }

  /**
   * Get unsynced results
   */
  async getUnsyncedResults(): Promise<OfflineResult[]> {
    return this.getByIndex<OfflineResult>(STORES.RESULTS, 'isSynced', 0);
  }

  /**
   * Mark result as synced
   */
  async markResultSynced(id: string): Promise<void> {
    const result = await this.get<OfflineResult>(STORES.RESULTS, id);
    if (result) {
      await this.put(STORES.RESULTS, { ...result, isSynced: true });
    }
  }

  // ==================== Sync Queue methods ====================

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queueItem: SyncQueueItem = {
      ...item,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };
    await this.put(STORES.SYNC_QUEUE, queueItem);
    return id;
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const items = await this.getByIndex<SyncQueueItem>(STORES.SYNC_QUEUE, 'status', 'pending');
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get all sync queue items
   */
  async getAllSyncItems(): Promise<SyncQueueItem[]> {
    return this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
  }

  /**
   * Update sync item status
   */
  async updateSyncItemStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string
  ): Promise<void> {
    const item = await this.get<SyncQueueItem>(STORES.SYNC_QUEUE, id);
    if (item) {
      await this.put(STORES.SYNC_QUEUE, {
        ...item,
        status,
        retryCount: status === 'failed' ? item.retryCount + 1 : item.retryCount,
        error,
      });
    }
  }

  /**
   * Remove sync item
   */
  async removeSyncItem(id: string): Promise<void> {
    await this.delete(STORES.SYNC_QUEUE, id);
  }

  /**
   * Clear completed sync items
   */
  async clearCompletedSyncItems(): Promise<void> {
    const allItems = await this.getAllSyncItems();
    const completedIds = allItems
      .filter((item) => item.status !== 'pending' && item.status !== 'syncing')
      .map((item) => item.id);

    for (const id of completedIds) {
      await this.delete(STORES.SYNC_QUEUE, id);
    }
  }

  /**
   * Get sync queue count
   */
  async getSyncQueueCount(): Promise<{ pending: number; failed: number; total: number }> {
    const items = await this.getAllSyncItems();
    return {
      pending: items.filter((i) => i.status === 'pending').length,
      failed: items.filter((i) => i.status === 'failed').length,
      total: items.length,
    };
  }

  // ==================== Offline Mode Metadata methods ====================

  /**
   * Get offline metadata
   */
  async getOfflineMetadata(): Promise<OfflineMetadata | null> {
    const metadata = await this.get<OfflineMetadata>(STORES.OFFLINE_META, 'singleton');
    return metadata || null;
  }

  /**
   * Save offline metadata
   */
  async saveOfflineMetadata(metadata: Partial<OfflineMetadata>): Promise<void> {
    const existing = await this.getOfflineMetadata();
    const updated: OfflineMetadata = {
      id: 'singleton',
      isOfflineModeEnabled: metadata.isOfflineModeEnabled ?? existing?.isOfflineModeEnabled ?? false,
      lastDownloadTime: metadata.lastDownloadTime ?? existing?.lastDownloadTime ?? null,
      downloadedInspectionIds: metadata.downloadedInspectionIds ?? existing?.downloadedInspectionIds ?? [],
      downloadedTemplateIds: metadata.downloadedTemplateIds ?? existing?.downloadedTemplateIds ?? [],
      downloadedItemCount: metadata.downloadedItemCount ?? existing?.downloadedItemCount ?? 0,
      serverDataVersion: metadata.serverDataVersion ?? existing?.serverDataVersion,
    };
    await this.put(STORES.OFFLINE_META, updated);
  }

  /**
   * Set offline mode enabled/disabled
   */
  async setOfflineModeEnabled(enabled: boolean): Promise<void> {
    await this.saveOfflineMetadata({ isOfflineModeEnabled: enabled });
  }

  /**
   * Check if offline mode is enabled
   */
  async isOfflineModeEnabled(): Promise<boolean> {
    const metadata = await this.getOfflineMetadata();
    return metadata?.isOfflineModeEnabled ?? false;
  }

  /**
   * Check if offline data is available
   */
  async hasOfflineData(): Promise<boolean> {
    const metadata = await this.getOfflineMetadata();
    if (!metadata) return false;
    return (
      metadata.downloadedInspectionIds.length > 0 ||
      metadata.downloadedTemplateIds.length > 0
    );
  }

  /**
   * Update download metadata after bulk download
   */
  async updateDownloadMetadata(
    inspectionIds: string[],
    templateIds: string[],
    itemCount: number
  ): Promise<void> {
    await this.saveOfflineMetadata({
      lastDownloadTime: Date.now(),
      downloadedInspectionIds: inspectionIds,
      downloadedTemplateIds: templateIds,
      downloadedItemCount: itemCount,
    });
  }

  /**
   * Clear all offline data and reset metadata
   */
  async clearAllOfflineData(): Promise<void> {
    await this.clear(STORES.INSPECTIONS);
    await this.clear(STORES.TEMPLATES);
    await this.clear(STORES.ITEMS);
    await this.clear(STORES.RESULTS);
    await this.saveOfflineMetadata({
      isOfflineModeEnabled: false,
      lastDownloadTime: null,
      downloadedInspectionIds: [],
      downloadedTemplateIds: [],
      downloadedItemCount: 0,
    });
  }

  /**
   * Get offline data statistics
   */
  async getOfflineStats(): Promise<{
    inspectionCount: number;
    templateCount: number;
    itemCount: number;
    resultCount: number;
    pendingSyncCount: number;
    lastDownloadTime: number | null;
  }> {
    const [inspections, templates, items, results, syncQueue, metadata] = await Promise.all([
      this.getAllInspections(),
      this.getAll<OfflineTemplate>(STORES.TEMPLATES),
      this.getAll<OfflineItem>(STORES.ITEMS),
      this.getAll<OfflineResult>(STORES.RESULTS),
      this.getSyncQueueCount(),
      this.getOfflineMetadata(),
    ]);

    return {
      inspectionCount: inspections.length,
      templateCount: templates.length,
      itemCount: items.length,
      resultCount: results.length,
      pendingSyncCount: syncQueue.pending,
      lastDownloadTime: metadata?.lastDownloadTime ?? null,
    };
  }

  /**
   * Save multiple templates at once
   */
  async saveTemplates(templates: OfflineTemplate[]): Promise<void> {
    await this.putMany(STORES.TEMPLATES, templates.map((t) => ({
      ...t,
      lastSynced: Date.now(),
    })));
  }

  /**
   * Save multiple inspections at once
   */
  async saveInspections(inspections: OfflineInspection[]): Promise<void> {
    await this.putMany(STORES.INSPECTIONS, inspections.map((i) => ({
      ...i,
      lastSynced: Date.now(),
    })));
  }

  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<OfflineTemplate[]> {
    return this.getAll<OfflineTemplate>(STORES.TEMPLATES);
  }
}

// Singleton instance
export const inspectionStore = new InspectionStore();
export default inspectionStore;
