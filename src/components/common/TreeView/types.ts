import { ReactNode } from 'react';

/**
 * Base tree node interface - extend this for your specific data type
 */
export interface BaseTreeNode {
  id: string;
  children?: BaseTreeNode[];
}

/**
 * Column definition for tree view
 */
export interface TreeViewColumn<T extends BaseTreeNode> {
  /** Unique key for the column */
  field: string;
  /** Header label */
  headerName: string;
  /** Column width (px or flex) */
  width?: number | string;
  /** Flex grow */
  flex?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer */
  renderCell?: (item: T, locale: string) => ReactNode;
  /** Value getter for simple text display */
  valueGetter?: (item: T, locale: string) => string;
}

/**
 * Action button definition for each row
 */
export interface TreeViewAction<T extends BaseTreeNode> {
  /** Unique key for the action */
  key: string;
  /** Icon to display */
  icon: ReactNode;
  /** Tooltip text */
  tooltip: string | ((item: T, locale: string) => string);
  /** Click handler */
  onClick: (item: T) => void;
  /** Whether the action is visible */
  visible?: boolean | ((item: T) => boolean);
  /** Whether the action is disabled */
  disabled?: boolean | ((item: T) => boolean);
  /** Icon color */
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

/**
 * Props for TreeView toolbar
 */
export interface TreeViewToolbarProps {
  selectedCount: number;
  totalCount: number;
  locale: string;
  loading?: boolean;
  // Add/Delete
  canAdd?: boolean;
  canDelete?: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
  // Refresh
  onRefresh?: () => void;
  // Expand/Collapse
  showExpandControls?: boolean;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  // Selection
  showSelectionControls?: boolean;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  // Custom toolbar content
  extraActions?: ReactNode;
}

/**
 * Main TreeView component props
 */
export interface TreeViewProps<T extends BaseTreeNode> {
  /** Tree data */
  data: T[];
  /** Column definitions */
  columns: TreeViewColumn<T>[];
  /** Expanded node IDs */
  expandedIds: Set<string>;
  /** Selected node IDs */
  selectedIds: Set<string>;
  /** Current locale */
  locale: string;
  /** Loading state */
  loading?: boolean;
  /** Search query for highlighting */
  searchQuery?: string;

  // Callbacks
  /** Toggle node expansion */
  onToggleExpand: (id: string) => void;
  /** Toggle node selection */
  onToggleSelect: (id: string) => void;
  /** Expand all nodes */
  onExpandAll: () => void;
  /** Collapse all nodes */
  onCollapseAll: () => void;
  /** Select all nodes */
  onSelectAll: () => void;
  /** Deselect all nodes */
  onDeselectAll: () => void;
  /** Refresh data */
  onRefresh?: () => void;
  /** Add new item (root level) */
  onAdd?: () => void;
  /** Delete selected items */
  onDelete?: (ids: string[]) => void;

  // Row actions
  /** Actions for each row */
  actions?: TreeViewAction<T>[];

  // Customization
  /** Get display name for a node (used for search highlight) */
  getDisplayName: (item: T, locale: string) => string;
  /** Get icon for a node */
  getIcon?: (item: T, expanded: boolean) => ReactNode;
  /** Get folder icon for nodes with children */
  getFolderIcon?: (expanded: boolean) => ReactNode;
  /** Whether to show checkboxes */
  checkboxSelection?: boolean;
  /** Whether editing is allowed */
  editable?: boolean;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Show header row */
  showHeader?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Row height */
  rowHeight?: number;
}

/**
 * Tree item props (internal)
 */
export interface TreeItemProps<T extends BaseTreeNode> {
  item: T;
  level: number;
  expanded: boolean;
  selected: boolean;
  locale: string;
  isLast: boolean;
  parentLines: boolean[];
  columns: TreeViewColumn<T>[];
  actions?: TreeViewAction<T>[];
  searchQuery?: string;
  checkboxSelection?: boolean;
  rowHeight?: number;
  getDisplayName: (item: T, locale: string) => string;
  getIcon?: (item: T, expanded: boolean) => ReactNode;
  getFolderIcon?: (expanded: boolean) => ReactNode;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  children?: ReactNode;
}
