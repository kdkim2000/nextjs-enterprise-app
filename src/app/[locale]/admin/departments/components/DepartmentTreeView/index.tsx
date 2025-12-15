'use client';

import React, { useMemo } from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  FolderOpen as FolderOpenIcon,
  Folder as FolderIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import TreeView, { TreeViewColumn, TreeViewAction, BaseTreeNode } from '@/components/common/TreeView';
import { Department } from '../../types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

// Department tree node extending Department with children
export interface DepartmentTreeNode extends Department, BaseTreeNode {
  children?: DepartmentTreeNode[];
}

export interface DepartmentTreeViewProps {
  departments: Department[];
  allUsers: any[];
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

/**
 * Convert flat department list to tree structure
 */
function buildDepartmentTree(departments: Department[]): DepartmentTreeNode[] {
  const departmentMap = new Map<string, DepartmentTreeNode>();
  const roots: DepartmentTreeNode[] = [];

  // First pass: create all nodes
  departments.forEach((dept) => {
    departmentMap.set(dept.id, { ...dept, children: [] });
  });

  // Second pass: build tree structure
  departments.forEach((dept) => {
    const node = departmentMap.get(dept.id)!;
    if (dept.parentId && departmentMap.has(dept.parentId)) {
      const parent = departmentMap.get(dept.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort by order at each level
  const sortByOrder = (nodes: DepartmentTreeNode[]): DepartmentTreeNode[] => {
    return nodes
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((node) => ({
        ...node,
        children: node.children ? sortByOrder(node.children) : undefined,
      }));
  };

  return sortByOrder(roots);
}

export default function DepartmentTreeView({
  departments,
  allUsers,
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
  canAdd = true,
}: DepartmentTreeViewProps) {
  const isKorean = locale === 'ko';

  // Build tree data
  const treeData = useMemo(() => buildDepartmentTree(departments), [departments]);

  // Get manager name by ID
  const getManagerName = (managerId: string | null): string => {
    if (!managerId) return '-';
    const manager = allUsers.find((u) => u.id === managerId);
    return manager?.name || '-';
  };

  // Define columns for department tree
  const columns: TreeViewColumn<DepartmentTreeNode>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: isKorean ? '부서명 / 코드' : 'Department Name / Code',
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
                  textOverflow: 'ellipsis',
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
                  textOverflow: 'ellipsis',
                }}
              >
                {item.code}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'manager',
        headerName: isKorean ? '담당자' : 'Manager',
        width: 120,
        renderCell: (item) => {
          const managerName = getManagerName(item.managerId);
          if (managerName === '-') return <Typography variant="body2">-</Typography>;
          return (
            <Tooltip title={managerName}>
              <Chip
                icon={<PersonIcon sx={{ fontSize: 14 }} />}
                label={managerName}
                size="small"
                variant="outlined"
                sx={{ height: 24, maxWidth: 110, fontSize: '0.75rem' }}
              />
            </Tooltip>
          );
        },
      },
      {
        field: 'level',
        headerName: isKorean ? '레벨' : 'Level',
        width: 60,
        align: 'center',
        valueGetter: (item) => String(item.level || 0),
      },
      {
        field: 'status',
        headerName: isKorean ? '상태' : 'Status',
        width: 80,
        align: 'center',
        renderCell: (item) => (
          <Chip
            label={item.status === 'active' ? (isKorean ? '활성' : 'Active') : (isKorean ? '비활성' : 'Inactive')}
            color={item.status === 'active' ? 'success' : 'default'}
            size="small"
            sx={{ height: 22, fontSize: '0.7rem' }}
          />
        ),
      },
    ],
    [isKorean, allUsers]
  );

  // Define actions for each row
  const actions: TreeViewAction<DepartmentTreeNode>[] = useMemo(() => {
    const actionList: TreeViewAction<DepartmentTreeNode>[] = [];

    if (canAdd) {
      actionList.push({
        key: 'addChild',
        icon: <AddIcon fontSize="small" />,
        tooltip: isKorean ? '하위 부서 추가' : 'Add Child Department',
        onClick: (item) => onAdd(item.id),
        color: 'primary',
      });
    }

    if (canEdit) {
      actionList.push({
        key: 'edit',
        icon: <EditIcon fontSize="small" />,
        tooltip: isKorean ? '편집' : 'Edit',
        onClick: (item) => onEdit(item.id),
        color: 'primary',
      });
    }

    return actionList;
  }, [canAdd, canEdit, isKorean, onAdd, onEdit]);

  // Get display name for search highlighting
  const getDisplayName = (item: DepartmentTreeNode, loc: string): string => {
    return getLocalizedValue(item.name, loc) || item.code;
  };

  // Get icon for leaf nodes
  const getIcon = (): React.ReactNode => {
    return <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />;
  };

  // Get folder icon
  const getFolderIcon = (expanded: boolean): React.ReactNode => {
    return expanded ? (
      <FolderOpenIcon fontSize="small" color="primary" />
    ) : (
      <FolderIcon fontSize="small" color="primary" />
    );
  };

  return (
    <TreeView<DepartmentTreeNode>
      data={treeData}
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
      emptyMessage={isKorean ? '부서가 없습니다' : 'No departments found'}
    />
  );
}
