'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  Collapse,
  alpha,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';
import TreeViewToolbar from './TreeViewToolbar';
import {
  BaseTreeNode,
  TreeViewProps,
  TreeItemProps,
  TreeViewColumn,
  TreeViewAction
} from './types';

// Re-export types
export * from './types';

/**
 * Generic Tree Item Component
 */
function TreeItem<T extends BaseTreeNode>({
  item,
  level,
  expanded,
  selected,
  locale,
  isLast,
  parentLines,
  columns,
  actions,
  searchQuery,
  checkboxSelection = true,
  rowHeight = 44,
  getDisplayName,
  getIcon,
  getFolderIcon,
  onToggleExpand,
  onToggleSelect,
  children
}: TreeItemProps<T>) {
  const theme = useTheme();
  const hasChildren = item.children && item.children.length > 0;
  const displayName = getDisplayName(item, locale);

  // Highlight search match
  const isSearchMatch = searchQuery && displayName.toLowerCase().includes(searchQuery.toLowerCase());

  // Default folder icon
  const defaultFolderIcon = getFolderIcon
    ? getFolderIcon(expanded)
    : expanded
      ? <FolderOpenIcon fontSize="small" color="primary" />
      : <FolderIcon fontSize="small" color="primary" />;

  // Get item icon
  const itemIcon = hasChildren
    ? defaultFolderIcon
    : getIcon
      ? getIcon(item, expanded)
      : null;

  // Tree line rendering
  const renderTreeLines = () => {
    const lines = [];
    for (let i = 0; i < level; i++) {
      lines.push(
        <Box
          key={i}
          sx={{
            width: 24,
            height: '100%',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            '&::before': parentLines[i] ? {
              content: '""',
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 1,
              bgcolor: 'divider'
            } : {}
          }}
        />
      );
    }
    return lines;
  };

  // Evaluate action visibility/disabled
  const evaluateActionProp = (
    prop: boolean | ((item: T) => boolean) | undefined,
    defaultValue: boolean
  ): boolean => {
    if (prop === undefined) return defaultValue;
    if (typeof prop === 'function') return prop(item);
    return prop;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minHeight: rowHeight,
          py: 0.5,
          px: 1,
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          bgcolor: selected
            ? alpha(theme.palette.primary.main, 0.08)
            : isSearchMatch
              ? alpha(theme.palette.warning.main, 0.08)
              : 'transparent',
          '&:hover': {
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.action.hover, 0.04)
          },
          transition: 'background-color 0.15s'
        }}
      >
        {/* Checkbox */}
        {checkboxSelection && (
          <Checkbox
            size="small"
            checked={selected}
            onChange={onToggleSelect}
            sx={{ p: 0.5, mr: 0.5 }}
          />
        )}

        {/* Tree Lines */}
        {renderTreeLines()}

        {/* Connector Line for non-root items */}
        {level > 0 && (
          <Box
            sx={{
              width: 24,
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: 0,
                height: isLast ? '50%' : '100%',
                width: 1,
                bgcolor: 'divider'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 12,
                height: 1,
                bgcolor: 'divider'
              }
            }}
          />
        )}

        {/* Expand/Collapse Button */}
        <Box sx={{ width: 28, display: 'flex', justifyContent: 'center' }}>
          {hasChildren ? (
            <IconButton size="small" onClick={onToggleExpand} sx={{ p: 0.25 }}>
              {expanded ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          ) : (
            <Box sx={{ width: 24 }} />
          )}
        </Box>

        {/* Icon */}
        {itemIcon && (
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            {itemIcon}
          </Box>
        )}

        {/* Columns */}
        {columns.map((column, colIndex) => {
          const isFirstColumn = colIndex === 0;
          const value = column.valueGetter
            ? column.valueGetter(item, locale)
            : column.renderCell
              ? column.renderCell(item, locale)
              : null;

          return (
            <Box
              key={column.field}
              sx={{
                width: column.width,
                flex: column.flex,
                px: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start',
                overflow: 'hidden'
              }}
            >
              {column.renderCell ? (
                column.renderCell(item, locale)
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isFirstColumn && hasChildren ? 600 : 400,
                    color: isFirstColumn && isSearchMatch ? 'warning.dark' : 'text.primary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {value}
                </Typography>
              )}
            </Box>
          );
        })}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, ml: 'auto' }}>
            {actions.map((action) => {
              const isVisible = evaluateActionProp(action.visible, true);
              const isDisabled = evaluateActionProp(action.disabled, false);

              if (!isVisible) return null;

              const tooltip = typeof action.tooltip === 'function'
                ? action.tooltip(item, locale)
                : action.tooltip;

              return (
                <Tooltip key={action.key} title={tooltip}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => action.onClick(item)}
                      disabled={isDisabled}
                      color={action.color || 'primary'}
                    >
                      {action.icon}
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Children */}
      {hasChildren && (
        <Collapse in={expanded} unmountOnExit>
          {children}
        </Collapse>
      )}
    </Box>
  );
}

/**
 * Generic TreeView Component
 */
export default function TreeView<T extends BaseTreeNode>({
  data,
  columns,
  expandedIds,
  selectedIds,
  locale,
  loading,
  searchQuery,
  onToggleExpand,
  onToggleSelect,
  onExpandAll,
  onCollapseAll,
  onSelectAll,
  onDeselectAll,
  onRefresh,
  onAdd,
  onDelete,
  actions,
  getDisplayName,
  getIcon,
  getFolderIcon,
  checkboxSelection = true,
  editable = true,
  showToolbar = true,
  showHeader = true,
  emptyMessage,
  rowHeight = 44
}: TreeViewProps<T>) {
  const theme = useTheme();
  const isKorean = locale === 'ko';

  // Count total items
  function countAllItems(items: T[]): number {
    return items.reduce((count, item) => {
      return count + 1 + (item.children ? countAllItems(item.children as T[]) : 0);
    }, 0);
  }

  const totalCount = useMemo(() => countAllItems(data), [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render tree recursively
  function renderTree(
    items: T[],
    level: number = 0,
    parentLines: boolean[] = []
  ): React.ReactNode {
    return items.map((item, index) => {
      const isLast = index === items.length - 1;
      const newParentLines = [...parentLines, !isLast];

      return (
        <TreeItem<T>
          key={item.id}
          item={item}
          level={level}
          expanded={expandedIds.has(item.id)}
          selected={selectedIds.has(item.id)}
          locale={locale}
          isLast={isLast}
          parentLines={parentLines}
          columns={columns}
          actions={actions}
          searchQuery={searchQuery}
          checkboxSelection={checkboxSelection}
          rowHeight={rowHeight}
          getDisplayName={getDisplayName}
          getIcon={getIcon}
          getFolderIcon={getFolderIcon}
          onToggleExpand={() => onToggleExpand(item.id)}
          onToggleSelect={() => onToggleSelect(item.id)}
        >
          {item.children && item.children.length > 0 && (
            renderTree(item.children as T[], level + 1, newParentLines)
          )}
        </TreeItem>
      );
    });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      {showToolbar && (
        <TreeViewToolbar
          selectedCount={selectedIds.size}
          totalCount={totalCount}
          locale={locale}
          loading={loading}
          canAdd={editable}
          canDelete={editable}
          onAdd={onAdd}
          onDelete={onDelete ? () => onDelete(Array.from(selectedIds)) : undefined}
          onRefresh={onRefresh}
          showExpandControls
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          showSelectionControls={checkboxSelection}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
        />
      )}

      {/* Header */}
      {showHeader && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: 40,
            px: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: '2px solid',
            borderBottomColor: 'divider'
          }}
        >
          {checkboxSelection && <Box sx={{ width: 32 }} />}

          {columns.map((column) => (
            <Typography
              key={column.field}
              variant="caption"
              fontWeight={600}
              sx={{
                width: column.width,
                flex: column.flex,
                px: 0.5,
                textAlign: column.align || 'left'
              }}
            >
              {column.headerName}
            </Typography>
          ))}

          {actions && actions.length > 0 && (
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ width: 80, textAlign: 'right', pr: 1, ml: 'auto' }}
            >
              {isKorean ? '작업' : 'Actions'}
            </Typography>
          )}
        </Box>
      )}

      {/* Tree Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {isKorean ? '로딩 중...' : 'Loading...'}
            </Typography>
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {emptyMessage || (isKorean ? '데이터가 없습니다' : 'No data found')}
            </Typography>
          </Box>
        ) : (
          renderTree(data)
        )}
      </Box>
    </Box>
  );
}
