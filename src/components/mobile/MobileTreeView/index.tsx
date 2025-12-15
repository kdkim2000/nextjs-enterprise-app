'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Divider,
  Collapse,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import MobileSwipeActions from '@/components/mobile/MobileSwipeActions';
import {
  BaseTreeNode,
  MobileTreeViewProps,
  TreeNodeContext,
  TreeNodeWithMeta,
} from './types';

// Re-export types
export * from './types';

/**
 * Build flat list of visible nodes with metadata
 */
function buildVisibleNodes<T extends BaseTreeNode>(
  data: T[],
  expandedIds: Set<string>,
  parentId: string | null = null,
  level: number = 0
): TreeNodeWithMeta<T>[] {
  const children = data.filter((item) => item.parentId === parentId);
  const result: TreeNodeWithMeta<T>[] = [];

  children.forEach((item, index) => {
    const itemChildren = data.filter((d) => d.parentId === item.id);
    const hasChildren = itemChildren.length > 0;
    const isLast = index === children.length - 1;

    result.push({
      item,
      level,
      hasChildren,
      childCount: itemChildren.length,
      isLast,
    });

    // If expanded, add children recursively
    if (hasChildren && expandedIds.has(item.id)) {
      result.push(...buildVisibleNodes(data, expandedIds, item.id, level + 1));
    }
  });

  return result;
}

/**
 * Get all node IDs from data
 */
function getAllNodeIds<T extends BaseTreeNode>(data: T[]): Set<string> {
  return new Set(data.map((item) => item.id));
}

/**
 * Get all parent node IDs (nodes that have children)
 */
function getParentNodeIds<T extends BaseTreeNode>(data: T[]): Set<string> {
  const parentIds = new Set<string>();
  data.forEach((item) => {
    if (item.parentId) {
      parentIds.add(item.parentId);
    }
  });
  return parentIds;
}

/**
 * MobileTreeView - A mobile-optimized inline expansion tree component
 *
 * Features:
 * - Inline expand/collapse (tap to toggle)
 * - Visual tree structure with indentation
 * - Swipe actions
 * - Touch-friendly design
 * - Expand all / Collapse all controls
 *
 * @example
 * ```tsx
 * <MobileTreeView
 *   data={departments}
 *   title="Departments"
 *   getDisplayName={(item) => item.name}
 *   renderNodeContent={({ item, hasChildren, isExpanded, onToggleExpand }) => (
 *     <Box onClick={hasChildren ? onToggleExpand : undefined}>
 *       {item.name}
 *     </Box>
 *   )}
 *   keyExtractor={(item) => item.id}
 *   getSwipeActions={(item) => [
 *     { icon: <EditIcon />, label: 'Edit', ... }
 *   ]}
 * />
 * ```
 */
export default function MobileTreeView<T extends BaseTreeNode>({
  data,
  loading = false,
  title,
  getDisplayName,
  renderNodeContent,
  keyExtractor,
  getSwipeActions,
  initialExpandedIds,
  expandedIds: controlledExpandedIds,
  onExpandedChange,
  onAdd,
  onRefresh,
  canAdd = true,
  emptyIcon,
  emptyMessage = 'No items',
  emptyAddLabel = 'Add Item',
  swipeHint = 'Swipe for actions',
  itemCountFormat = (count) => `${count} items`,
  indentSize = 24,
  headerActions,
  showExpandControls = true,
}: MobileTreeViewProps<T>) {
  const theme = useTheme();

  // Internal expanded state (used when not controlled)
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
    initialExpandedIds || new Set()
  );

  // Use controlled or internal state
  const expandedIds = controlledExpandedIds ?? internalExpandedIds;
  const setExpandedIds = useCallback(
    (newExpandedIds: Set<string>) => {
      if (onExpandedChange) {
        onExpandedChange(newExpandedIds);
      }
      if (!controlledExpandedIds) {
        setInternalExpandedIds(newExpandedIds);
      }
    },
    [controlledExpandedIds, onExpandedChange]
  );

  // Build visible nodes list
  const visibleNodes = useMemo(
    () => buildVisibleNodes(data, expandedIds),
    [data, expandedIds]
  );

  // Count root items
  const rootItemCount = useMemo(
    () => data.filter((item) => item.parentId === null).length,
    [data]
  );

  // Get child count for an item
  const getChildCount = useCallback(
    (itemId: string): number => {
      return data.filter((item) => item.parentId === itemId).length;
    },
    [data]
  );

  // Toggle expand state
  const handleToggleExpand = useCallback(
    (id: string) => {
      const newExpandedIds = new Set(expandedIds);
      if (newExpandedIds.has(id)) {
        newExpandedIds.delete(id);
      } else {
        newExpandedIds.add(id);
      }
      setExpandedIds(newExpandedIds);
    },
    [expandedIds, setExpandedIds]
  );

  // Expand all
  const handleExpandAll = useCallback(() => {
    const parentIds = getParentNodeIds(data);
    setExpandedIds(parentIds);
  }, [data, setExpandedIds]);

  // Collapse all
  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, [setExpandedIds]);

  // Render tree node
  const renderNode = useCallback(
    (nodeWithMeta: TreeNodeWithMeta<T>) => {
      const { item, level, hasChildren, childCount, isLast } = nodeWithMeta;
      const isExpanded = expandedIds.has(item.id);

      // Build context for custom renderer
      const context: TreeNodeContext<T> = {
        item,
        level,
        hasChildren,
        childCount,
        isExpanded,
        onToggleExpand: () => handleToggleExpand(item.id),
      };

      // Get swipe actions if provided
      const swipeActions = getSwipeActions ? getSwipeActions(item) : [];

      const nodeContent = (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 56,
          }}
        >
          {/* Indentation and tree lines */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              pl: `${level * indentSize}px`,
              flexShrink: 0,
            }}
          >
            {/* Expand/Collapse button for nodes with children */}
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={() => handleToggleExpand(item.id)}
                sx={{
                  width: 32,
                  height: 32,
                  transition: 'transform 0.2s ease',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            ) : (
              <Box sx={{ width: 32 }} />
            )}
          </Box>

          {/* Node content */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0, py: 1, pr: 1 }}>
            {renderNodeContent(context)}
          </Box>
        </Box>
      );

      // Wrap with swipe actions if available
      if (swipeActions.length > 0) {
        return (
          <MobileSwipeActions
            key={keyExtractor(item)}
            rightActions={swipeActions.map((action) => ({
              icon: action.icon,
              label: action.label,
              color: action.color,
              backgroundColor: action.backgroundColor,
              onClick: () => action.onClick(item),
            }))}
          >
            {nodeContent}
          </MobileSwipeActions>
        );
      }

      return <Box key={keyExtractor(item)}>{nodeContent}</Box>;
    },
    [
      expandedIds,
      handleToggleExpand,
      renderNodeContent,
      getSwipeActions,
      keyExtractor,
      indentSize,
    ]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Title Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            gap: 1,
          }}
        >
          {title && (
            <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
              {title}
            </Typography>
          )}

          {/* Expand/Collapse controls */}
          {showExpandControls && data.length > 0 && (
            <>
              <IconButton
                size="small"
                onClick={handleExpandAll}
                sx={{ bgcolor: 'grey.100' }}
                title="Expand All"
              >
                <UnfoldMoreIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCollapseAll}
                sx={{ bgcolor: 'grey.100' }}
                title="Collapse All"
              >
                <UnfoldLessIcon fontSize="small" />
              </IconButton>
            </>
          )}

          {canAdd && onAdd && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => onAdd(null)}
              sx={{ bgcolor: 'primary.50' }}
            >
              <AddIcon />
            </IconButton>
          )}

          {headerActions}
        </Box>

        {/* Info bar */}
        <Divider />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 0.75,
            bgcolor: 'grey.50',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {itemCountFormat(rootItemCount)}
          </Typography>
          {getSwipeActions && (
            <Typography variant="caption" color="text.secondary">
              {swipeHint}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Tree Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            {emptyIcon || (
              <FolderOpenIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            )}
            <Typography color="text.secondary" gutterBottom>
              {emptyMessage}
            </Typography>
            {canAdd && onAdd && (
              <Chip
                icon={<AddIcon />}
                label={emptyAddLabel}
                color="primary"
                onClick={() => onAdd(null)}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        ) : (
          <Box>
            {visibleNodes.map((nodeWithMeta) => renderNode(nodeWithMeta))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
