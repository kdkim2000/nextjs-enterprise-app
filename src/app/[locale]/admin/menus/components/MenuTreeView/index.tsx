'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Smartphone as SmartphoneIcon,
  DesktopWindows as DesktopIcon,
  FolderOpen as FolderOpenIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import TreeView, { TreeViewColumn, TreeViewAction, BaseTreeNode } from '@/components/common/TreeView';
import { MenuTreeNode } from '../../types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { getMenuIcon } from '@/lib/icons/menuIcons';

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

// Extend MenuTreeNode to satisfy BaseTreeNode constraint
interface MenuTreeNodeExtended extends MenuTreeNode, BaseTreeNode {
  children?: MenuTreeNodeExtended[];
}

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
  const isKorean = locale === 'ko';

  // Define columns for menu tree
  const columns: TreeViewColumn<MenuTreeNodeExtended>[] = useMemo(() => [
    {
      field: 'name',
      headerName: isKorean ? '메뉴명 / 경로' : 'Menu Name / Path',
      flex: 1,
      renderCell: (item, loc) => {
        const displayName = getLocalizedValue(item.name, loc) || item.code;
        const hasChildren = item.children && item.children.length > 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: hasChildren ? 600 : 400,
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
              {item.path}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'programId',
      headerName: isKorean ? '프로그램' : 'Program',
      width: 100,
      valueGetter: (item) => item.programId || '-'
    },
    {
      field: 'visibility',
      headerName: isKorean ? '표시' : 'Visibility',
      width: 60,
      align: 'center',
      renderCell: (item) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Desktop">
            <DesktopIcon
              fontSize="small"
              sx={{ color: item.desktopEnabled !== false ? 'success.main' : 'action.disabled' }}
            />
          </Tooltip>
          <Tooltip title="Mobile">
            <SmartphoneIcon
              fontSize="small"
              sx={{ color: item.mobileEnabled !== false ? 'success.main' : 'action.disabled' }}
            />
          </Tooltip>
        </Box>
      )
    }
  ], [isKorean]);

  // Define actions for each row
  const actions: TreeViewAction<MenuTreeNodeExtended>[] = useMemo(() => {
    const actionList: TreeViewAction<MenuTreeNodeExtended>[] = [];

    if (canAdd) {
      actionList.push({
        key: 'addChild',
        icon: <AddIcon fontSize="small" />,
        tooltip: isKorean ? '하위 메뉴 추가' : 'Add Child',
        onClick: (item) => onAdd(item.id),
        color: 'primary'
      });
    }

    if (canEdit) {
      actionList.push({
        key: 'edit',
        icon: <EditIcon fontSize="small" />,
        tooltip: isKorean ? '편집' : 'Edit',
        onClick: (item) => onEdit(item.id),
        color: 'primary'
      });
    }

    return actionList;
  }, [canAdd, canEdit, isKorean, onAdd, onEdit]);

  // Get display name for search highlighting
  const getDisplayName = (item: MenuTreeNodeExtended, loc: string): string => {
    return getLocalizedValue(item.name, loc) || item.code;
  };

  // Get icon for leaf nodes
  const getIcon = (item: MenuTreeNodeExtended): React.ReactNode => {
    return getMenuIcon(item.icon);
  };

  // Get folder icon
  const getFolderIcon = (expanded: boolean): React.ReactNode => {
    return expanded
      ? <FolderOpenIcon fontSize="small" color="primary" />
      : <FolderIcon fontSize="small" color="primary" />;
  };

  return (
    <TreeView<MenuTreeNodeExtended>
      data={menus as MenuTreeNodeExtended[]}
      columns={columns}
      expandedIds={expandedIds}
      selectedIds={selectedIds}
      locale={locale}
      loading={loading}
      searchQuery={searchQuery}
      onToggleExpand={onToggleExpand}
      onToggleSelect={onToggleSelect}
      onExpandAll={onExpandAll}
      onCollapseAll={onCollapseAll}
      onSelectAll={onSelectAll}
      onDeselectAll={onDeselectAll}
      onRefresh={onRefresh}
      onAdd={canAdd ? () => onAdd(null) : undefined}
      onDelete={canDelete ? onDelete : undefined}
      actions={actions}
      getDisplayName={getDisplayName}
      getIcon={getIcon}
      getFolderIcon={getFolderIcon}
      checkboxSelection
      editable={canEdit || canAdd || canDelete}
      showToolbar
      showHeader
      emptyMessage={isKorean ? '메뉴가 없습니다' : 'No menus found'}
    />
  );
}
