'use client';

import { ReactNode } from 'react';

/**
 * Base tree node interface for inline expansion tree
 * Data items must have id and parentId for hierarchical structure
 */
export interface BaseTreeNode {
  id: string;
  parentId: string | null;
}

/**
 * Swipe action definition
 */
export interface TreeSwipeAction<T> {
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
 * Tree node render context
 */
export interface TreeNodeContext<T extends BaseTreeNode> {
  /** The data item */
  item: T;
  /** Nesting level (0 = root) */
  level: number;
  /** Whether this node has children */
  hasChildren: boolean;
  /** Number of children */
  childCount: number;
  /** Whether this node is expanded */
  isExpanded: boolean;
  /** Toggle expand/collapse */
  onToggleExpand: () => void;
}

/**
 * Props for MobileTreeView component
 */
export interface MobileTreeViewProps<T extends BaseTreeNode> {
  /** Tree data (flat list with parentId) */
  data: T[];

  /** Loading state */
  loading?: boolean;

  /** Title for the tree view header */
  title?: string;

  /** Function to get display name for an item */
  getDisplayName: (item: T) => string;

  /**
   * Custom node content renderer
   * Receives item and context with expand/collapse handler
   */
  renderNodeContent: (context: TreeNodeContext<T>) => ReactNode;

  /** Key extractor for list items */
  keyExtractor: (item: T) => string;

  /** Swipe actions builder - return actions for each item */
  getSwipeActions?: (item: T) => TreeSwipeAction<T>[];

  /** Initial expanded state - set of node IDs to expand initially */
  initialExpandedIds?: Set<string>;

  /** Controlled expanded state (optional) */
  expandedIds?: Set<string>;

  /** Callback when expanded state changes */
  onExpandedChange?: (expandedIds: Set<string>) => void;

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

  /** Indent size per level in pixels */
  indentSize?: number;

  /** Custom header actions (rendered after add button) */
  headerActions?: ReactNode;

  /** Whether to show expand all/collapse all buttons */
  showExpandControls?: boolean;
}

/**
 * Internal tree node with computed properties
 */
export interface TreeNodeWithMeta<T extends BaseTreeNode> {
  item: T;
  level: number;
  hasChildren: boolean;
  childCount: number;
  isLast: boolean;
}
