'use client';

/**
 * Generic Offline Storage Module
 *
 * Provides IndexedDB-based storage for offline data persistence.
 * Uses native IndexedDB API (no external dependencies).
 */

// ==================== Types ====================

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';
export type SyncAction = 'create' | 'update' | 'delete';

export interface StoredEntity<T = unknown> {
  id: string;
  entityType: string;
  data: T;
  syncStatus: SyncStatus;
  localUpdatedAt: number;
  serverUpdatedAt?: number;
  version?: number;
}

export interface SyncQueueItem {
  id?: number;
  action: SyncAction;
  entity: string;
  entityId: string;
  data: unknown;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

export interface CachedMasterData<T = unknown> {
  type: string;
  data: T[];
  cachedAt: number;
  expiresAt?: number;
}

// ==================== Constants ====================

const DB_NAME = 'app-generic-offline-db';
const DB_VERSION = 1;
const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const STORES = {
  ENTITIES: 'entities',
  SYNC_QUEUE: 'syncQueue',
  MASTER_DATA: 'masterData',
  SETTINGS: 'settings',
} as const;

// ==================== Offline Storage Class ====================

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<IDBDatabase> {
    // Return existing connection
    if (this.db) return this.db;

    // Return pending initialization
    if (this.initPromise) return this.initPromise;

    // Check for IndexedDB support
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB is not supported in this environment');
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open generic offline DB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Generic offline DB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create entities store
        if (!db.objectStoreNames.contains(STORES.ENTITIES)) {
          const entityStore = db.createObjectStore(STORES.ENTITIES, { keyPath: 'id' });
          entityStore.createIndex('by-sync-status', 'syncStatus', { unique: false });
          entityStore.createIndex('by-entity-type', 'entityType', { unique: false });
          entityStore.createIndex('by-updated', 'localUpdatedAt', { unique: false });
        }

        // Create syncQueue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('by-entity', 'entity', { unique: false });
          syncStore.createIndex('by-created', 'createdAt', { unique: false });
        }

        // Create masterData store
        if (!db.objectStoreNames.contains(STORES.MASTER_DATA)) {
          db.createObjectStore(STORES.MASTER_DATA, { keyPath: 'type' });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS);
        }
      };
    });

    return this.initPromise;
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

  // ==================== Entity Operations ====================

  /**
   * Save an entity to local storage
   */
  async saveEntity<T>(
    entityType: string,
    id: string,
    data: T,
    options: {
      syncStatus?: SyncStatus;
      serverUpdatedAt?: number;
    } = {}
  ): Promise<void> {
    const db = await this.getDb();
    const compositeKey = `${entityType}:${id}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.ENTITIES, 'readwrite');
      const store = transaction.objectStore(STORES.ENTITIES);
      const request = store.put({
        id: compositeKey,
        entityType,
        data: { ...(data as object), id },
        syncStatus: options.syncStatus || 'pending',
        localUpdatedAt: Date.now(),
        serverUpdatedAt: options.serverUpdatedAt,
      } as StoredEntity<T>);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get an entity from local storage
   */
  async getEntity<T>(entityType: string, id: string): Promise<T | null> {
    const db = await this.getDb();
    const compositeKey = `${entityType}:${id}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.ENTITIES, 'readonly');
      const store = transaction.objectStore(STORES.ENTITIES);
      const request = store.get(compositeKey);

      request.onsuccess = () => {
        const record = request.result as StoredEntity<T> | undefined;
        resolve(record?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all entities of a specific type
   */
  async getAllEntities<T>(entityType: string): Promise<T[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.ENTITIES, 'readonly');
      const store = transaction.objectStore(STORES.ENTITIES);
      const index = store.index('by-entity-type');
      const request = index.getAll(entityType);

      request.onsuccess = () => {
        const records = request.result as StoredEntity<T>[];
        resolve(records.map((r) => ({
          ...(r.data as object),
          _syncStatus: r.syncStatus,
          _localUpdatedAt: r.localUpdatedAt,
        }) as T));
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete an entity from local storage
   */
  async deleteEntity(entityType: string, id: string): Promise<void> {
    const db = await this.getDb();
    const compositeKey = `${entityType}:${id}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.ENTITIES, 'readwrite');
      const store = transaction.objectStore(STORES.ENTITIES);
      const request = store.delete(compositeKey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Sync Queue Operations ====================

  /**
   * Add an operation to the sync queue
   */
  async addToSyncQueue(
    action: SyncAction,
    entity: string,
    entityId: string,
    data?: unknown
  ): Promise<number> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);

      const item: Omit<SyncQueueItem, 'id'> = {
        action,
        entity,
        entityId,
        data,
        createdAt: Date.now(),
        retryCount: 0,
      };

      const request = store.add(item);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all items in the sync queue
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as SyncQueueItem[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get sync queue count
   */
  async getSyncQueueCount(): Promise<number> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove an item from the sync queue
   */
  async removeFromSyncQueue(id: number): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all items from sync queue
   */
  async clearSyncQueue(): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Master Data Caching ====================

  /**
   * Cache master/reference data
   */
  async cacheMasterData<T>(
    type: string,
    data: T[],
    ttl: number = DEFAULT_CACHE_TTL
  ): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.MASTER_DATA, 'readwrite');
      const store = transaction.objectStore(STORES.MASTER_DATA);
      const request = store.put({
        type,
        data,
        cachedAt: Date.now(),
        expiresAt: Date.now() + ttl,
      } as CachedMasterData<T>);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached master data
   */
  async getCachedMasterData<T>(
    type: string,
    options: { ignoreExpiry?: boolean } = {}
  ): Promise<T[] | null> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.MASTER_DATA, 'readonly');
      const store = transaction.objectStore(STORES.MASTER_DATA);
      const request = store.get(type);

      request.onsuccess = () => {
        const record = request.result as CachedMasterData<T> | undefined;

        if (!record) {
          resolve(null);
          return;
        }

        // Check expiry
        if (!options.ignoreExpiry && record.expiresAt && Date.now() > record.expiresAt) {
          resolve(null);
          return;
        }

        resolve(record.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Settings Operations ====================

  /**
   * Save a setting
   */
  async setSetting<T>(key: string, value: T): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a setting
   */
  async getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SETTINGS, 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ?? defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Utility Methods ====================

  /**
   * Clear all data from all stores
   */
  async clearAll(): Promise<void> {
    const db = await this.getDb();

    const clearStore = (storeName: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

    await Promise.all([
      clearStore(STORES.ENTITIES),
      clearStore(STORES.SYNC_QUEUE),
      clearStore(STORES.MASTER_DATA),
      clearStore(STORES.SETTINGS),
    ]);
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();

export default offlineStorage;
