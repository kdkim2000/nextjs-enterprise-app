/**
 * Offline Module
 *
 * Provides offline-first capabilities for the application.
 */

// Legacy inspection-specific store
export { inspectionStore, STORES } from './inspectionStore';
export type {
  SyncQueueItem,
  OfflineInspection,
  OfflineTemplate,
  OfflineItem,
  OfflineResult,
} from './inspectionStore';

// Sync service
export { syncService } from './syncService';
export type { SyncStatus, SyncProgress } from './syncService';

// Generic offline storage
export { offlineStorage } from './storage';
export type {
  SyncStatus as GenericSyncStatus,
  SyncAction,
  StoredEntity,
  SyncQueueItem as GenericSyncQueueItem,
  CachedMasterData,
} from './storage';
