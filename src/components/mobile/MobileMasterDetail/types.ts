'use client';

import { ReactNode } from 'react';

/**
 * View state for Master-Detail navigation
 */
export type MasterDetailView = 'master' | 'detail';

/**
 * Header configuration for detail view
 */
export interface DetailHeaderConfig {
  /** Title to show in detail view header */
  title: string;
  /** Subtitle (optional) */
  subtitle?: string;
  /** Custom header actions */
  actions?: ReactNode;
}

/**
 * Selection mode configuration
 */
export interface SelectionModeConfig {
  /** Whether selection mode is active */
  active: boolean;
  /** Number of selected items */
  selectedCount: number;
  /** Total number of items */
  totalCount: number;
  /** Toggle selection mode */
  onToggle: () => void;
  /** Select all items */
  onSelectAll: () => void;
  /** Deselect all items */
  onDeselectAll: () => void;
  /** Delete selected items */
  onDeleteSelected?: () => void;
}

/**
 * FAB (Floating Action Button) configuration
 */
export interface FabConfig {
  /** Click handler */
  onClick: () => void;
  /** Label for accessibility */
  label?: string;
  /** Custom icon */
  icon?: ReactNode;
}

/**
 * Props for MobileMasterDetail component
 */
export interface MobileMasterDetailProps<TMaster = unknown, TDetail = unknown> {
  /** Current view state */
  view: MasterDetailView;

  /** Callback when view changes */
  onViewChange: (view: MasterDetailView) => void;

  /** Master view content */
  masterContent: ReactNode;

  /** Detail view content */
  detailContent: ReactNode;

  /** Title for master view (shown when not using menu title) */
  masterTitle?: string;

  /** Header configuration for detail view */
  detailHeader: DetailHeaderConfig;

  /** Whether to show back button in detail view */
  showBackButton?: boolean;

  /** Custom back button handler (default: switch to master view) */
  onBack?: () => void;

  /** FAB configuration for master view */
  masterFab?: FabConfig;

  /** FAB configuration for detail view */
  detailFab?: FabConfig;

  /** Selection mode for detail view */
  detailSelection?: SelectionModeConfig;

  /** Whether to enable swipe gesture for back navigation */
  enableSwipeBack?: boolean;

  /** Animation duration in ms */
  animationDuration?: number;

  /** Loading state for detail view */
  detailLoading?: boolean;

  /** Empty state for detail view (shown when no detail selected) */
  detailEmptyState?: ReactNode;

  /** Whether detail has content (used for empty state) */
  hasDetailContent?: boolean;

  /** Container height - use CSS value like '100%', 'calc(100dvh - 100px)', etc.
   * Defaults to 'calc(100dvh - 112px)' for typical mobile layout */
  containerHeight?: string;
}

/**
 * Hook return type for useMobileMasterDetail
 */
export interface UseMobileMasterDetailReturn<TMaster> {
  /** Current view */
  view: MasterDetailView;
  /** Set current view */
  setView: (view: MasterDetailView) => void;
  /** Selected master item */
  selectedMaster: TMaster | null;
  /** Select master item and navigate to detail */
  selectMaster: (item: TMaster) => void;
  /** Go back to master view */
  goBack: () => void;
  /** Clear selection */
  clearSelection: () => void;
}
