'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
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
  Edit as EditIcon,
  Add as AddIcon,
  Smartphone as SmartphoneIcon,
  DesktopWindows as DesktopIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { MenuTreeNode } from '../../types';
import { getLocalizedValue, MultiLangField } from '@/lib/i18n/multiLang';
import { getMenuIcon } from '@/lib/icons/menuIcons';
import MenuTreeToolbar from './MenuTreeToolbar';

export interface MenuTreeViewProps {
  menus: MenuTreeNode[];
  expandedIds: Set<string>;
  selectedIds: Set<string>;
  locale: string;
  loading?: boolean;
  searchQuery?: string;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onEdit: (id: string) => void;
  onAdd: (parentId?: string | null) => void;
  onDelete: (ids: string[]) => void;
  onRefresh: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canAdd?: boolean;
}

interface TreeItemProps {
  menu: MenuTreeNode;
  level: number;
  expanded: boolean;
  selected: boolean;
  locale: string;
  isLast: boolean;
  parentLines: boolean[];
  searchQuery?: string;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onEdit: () => void;
  onAddChild: () => void;
  canEdit?: boolean;
  canAdd?: boolean;
  children?: React.ReactNode;
}

// Tree Item Component
function MenuTreeItem({
  menu,
  level,
  expanded,
  selected,
  locale,
  isLast,
  parentLines,
  searchQuery,
  onToggleExpand,
  onToggleSelect,
  onEdit,
  onAddChild,
  canEdit,
  canAdd,
  children
}: TreeItemProps) {
  const theme = useTheme();
  const hasChildren = menu.children && menu.children.length > 0;
  const displayName = getLocalizedValue(menu.name, locale) || menu.code;

  // Highlight search match
  const isSearchMatch = searchQuery && displayName.toLowerCase().includes(searchQuery.toLowerCase());

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

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 44,
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
        <Checkbox
          size="small"
          checked={selected}
          onChange={onToggleSelect}
          sx={{ p: 0.5, mr: 0.5 }}
        />

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
        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          {hasChildren ? (
            expanded ? <FolderOpenIcon fontSize="small" color="primary" /> : <FolderIcon fontSize="small" color="primary" />
          ) : (
            getMenuIcon(menu.icon)
          )}
        </Box>

        {/* Name & Path */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: hasChildren ? 600 : 400,
              color: isSearchMatch ? 'warning.dark' : 'text.primary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {menu.path}
          </Typography>
        </Box>

        {/* Program ID */}
        <Box sx={{ width: 100, px: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {menu.programId || '-'}
          </Typography>
        </Box>

        {/* Visibility Icons */}
        <Box sx={{ width: 60, display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Desktop">
            <DesktopIcon
              fontSize="small"
              sx={{ color: menu.desktopEnabled !== false ? 'success.main' : 'action.disabled' }}
            />
          </Tooltip>
          <Tooltip title="Mobile">
            <SmartphoneIcon
              fontSize="small"
              sx={{ color: menu.mobileEnabled !== false ? 'success.main' : 'action.disabled' }}
            />
          </Tooltip>
        </Box>

        {/* Actions */}
        <Box sx={{ width: 80, display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          {canAdd && (
            <Tooltip title={locale === 'ko' ? '하위 메뉴 추가' : 'Add Child'}>
              <IconButton size="small" onClick={onAddChild} color="primary">
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title={locale === 'ko' ? '편집' : 'Edit'}>
              <IconButton size="small" onClick={onEdit} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
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

// Main TreeView Component
export default function MenuTreeView({
  menus,
  expandedIds,
  selectedIds,
  locale,
  loading,
  searchQuery,
  onToggleExpand,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onExpandAll,
  onCollapseAll,
  onEdit,
  onAdd,
  onDelete,
  onRefresh,
  canEdit = true,
  canDelete = true,
  canAdd = true
}: MenuTreeViewProps) {
  const theme = useTheme();

  // Count total items for selection
  const countAllItems = useCallback((items: MenuTreeNode[]): number => {
    return items.reduce((count, item) => {
      return count + 1 + (item.children ? countAllItems(item.children) : 0);
    }, 0);
  }, []);

  const totalCount = useMemo(() => countAllItems(menus), [menus, countAllItems]);

  // Render tree recursively
  const renderTree = useCallback((
    items: MenuTreeNode[],
    level: number = 0,
    parentLines: boolean[] = []
  ): React.ReactNode => {
    return items.map((menu, index) => {
      const isLast = index === items.length - 1;
      const newParentLines = [...parentLines, !isLast];

      return (
        <MenuTreeItem
          key={menu.id}
          menu={menu}
          level={level}
          expanded={expandedIds.has(menu.id)}
          selected={selectedIds.has(menu.id)}
          locale={locale}
          isLast={isLast}
          parentLines={parentLines}
          searchQuery={searchQuery}
          onToggleExpand={() => onToggleExpand(menu.id)}
          onToggleSelect={() => onToggleSelect(menu.id)}
          onEdit={() => onEdit(menu.id)}
          onAddChild={() => onAdd(menu.id)}
          canEdit={canEdit}
          canAdd={canAdd}
        >
          {menu.children && menu.children.length > 0 && (
            renderTree(menu.children, level + 1, newParentLines)
          )}
        </MenuTreeItem>
      );
    });
  }, [expandedIds, selectedIds, locale, searchQuery, onToggleExpand, onToggleSelect, onEdit, onAdd, canEdit, canAdd]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <MenuTreeToolbar
        selectedCount={selectedIds.size}
        totalCount={totalCount}
        locale={locale}
        onAdd={() => onAdd(null)}
        onDelete={() => onDelete(Array.from(selectedIds))}
        onRefresh={onRefresh}
        onExpandAll={onExpandAll}
        onCollapseAll={onCollapseAll}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        canAdd={canAdd}
        canDelete={canDelete}
        loading={loading}
      />

      {/* Header */}
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
        <Box sx={{ width: 32 }} /> {/* Checkbox space */}
        <Typography variant="caption" fontWeight={600} sx={{ flex: 1, pl: 1 }}>
          {locale === 'ko' ? '메뉴명 / 경로' : 'Menu Name / Path'}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ width: 100, px: 1 }}>
          {locale === 'ko' ? '프로그램' : 'Program'}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ width: 60, textAlign: 'center' }}>
          {locale === 'ko' ? '표시' : 'Visibility'}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ width: 80, textAlign: 'right', pr: 1 }}>
          {locale === 'ko' ? '작업' : 'Actions'}
        </Typography>
      </Box>

      {/* Tree Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {locale === 'ko' ? '로딩 중...' : 'Loading...'}
            </Typography>
          </Box>
        ) : menus.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {locale === 'ko' ? '메뉴가 없습니다' : 'No menus found'}
            </Typography>
          </Box>
        ) : (
          renderTree(menus)
        )}
      </Box>
    </Box>
  );
}
