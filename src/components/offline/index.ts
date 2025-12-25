/**
 * Offline Components
 *
 * UI components for displaying offline status and sync information.
 *
 * @example
 * ```tsx
 * import { SyncStatusIndicator, OfflineStatusBar } from '@/components/offline';
 *
 * // Header에 동기화 상태 표시
 * <SyncStatusIndicator onClick={openSyncPanel} />
 *
 * // 페이지 상단에 오프라인 배너
 * <OfflineStatusBar />
 * ```
 */

// Main components
export { default as SyncStatusIndicator } from './SyncStatusIndicator';
export { default as OfflineStatusBar } from './OfflineStatusBar';
export { default as DownloadOfflineButton } from './DownloadOfflineButton';
export { default as SyncDetailPanel } from './SyncDetailPanel';

// New offline mode components
export { default as OfflineModeToggle } from './OfflineModeToggle';
export { default as BulkDownloadButton } from './BulkDownloadButton';
export { default as OfflineModeBanner } from './OfflineModeBanner';

// Types
export type { SyncStatusIndicatorProps } from './SyncStatusIndicator';
export type { OfflineStatusBarProps } from './OfflineStatusBar';
export type { DownloadOfflineButtonProps } from './DownloadOfflineButton';
export type { SyncDetailPanelProps } from './SyncDetailPanel';
