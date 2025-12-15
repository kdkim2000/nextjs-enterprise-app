'use client';

import { ReactNode } from 'react';

/**
 * Base tree node interface for drill-down navigation
 * Data items must have id and parentId for hierarchical navigation
 */
export interface BaseDrillDownNode {
  id: string;
  parentId: string | null;
}

/**
 * Swipe action definition
 */
export interface DrillDownSwipeAction<T> {
  /** Icon to display */
  icon: ReactNode;
  /** Label for the action */
  label: string;
  /** Text color */
  color: string;
  /** Background color */
  backgroundColor: string;
  /** Click handler */
  onClick: (item: T) => void;
}

/**
 * Card render context - provides information about the item
 */
export interface DrillDownCardContext<T extends BaseDrillDownNode> {
  /** The data item */
  item: T;
  /** Number of children */
  childCount: number;
  /** Whether item has children */
  hasChildren: boolean;
  /** Handle drill down (navigate into) */
  onDrillDown: () => void;
}

/**
 * Props for MobileDrillDownList component
 */
export interface MobileDrillDownListProps<T extends BaseDrillDownNode> {
  /** Tree data (flat list with parentId) */
  data: T[];

  /** Loading state */
  loading?: boolean;

  /** Title for the list (shown in header when at root) */
  title: string;

  /** Home/root label for breadcrumb */
  homeLabel?: string;

  /** Function to get display name for an item */
  getDisplayName: (item: T) => string;

  /**
   * Custom card renderer
   * Receives item and context with child info and handlers
   */
  renderCard: (context: DrillDownCardContext<T>) => ReactNode;

  /** Key extractor for list items */
  keyExtractor: (item: T) => string;

  /** Swipe actions builder - return actions for each item */
  getSwipeActions?: (item: T, childCount: number) => DrillDownSwipeAction<T>[];

  /** Add handler - called with parentId (null for root) */
  onAdd?: (parentId: string | null) => void;

  /** Refresh handler */
  onRefresh?: () => void;

  /** Whether add is allowed */
  canAdd?: boolean;

  /** Custom empty state icon */
  emptyIcon?: ReactNode;

  /** Empty state message */
  emptyMessage?: string;

  /** Empty state add button label */
  emptyAddLabel?: string;

  /** Swipe hint text */
  swipeHint?: string;

  /** Items count format - receives count, should return string */
  itemCountFormat?: (count: number) => string;

  /** Callback when navigation changes (for external state sync) */
  onNavigationChange?: (parentId: string | null, breadcrumbPath: T[]) => void;

  /** Custom header actions (rendered after add button) */
  headerActions?: ReactNode;
}
