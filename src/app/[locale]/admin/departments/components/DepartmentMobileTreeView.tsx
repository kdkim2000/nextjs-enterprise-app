'use client';

import React, { useCallback } from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import {
  Folder as FolderIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import MobileTreeView, { TreeNodeContext, TreeSwipeAction } from '@/components/mobile/MobileTreeView';
import { useI18n } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Department } from '../types';

// Department extends BaseTreeNode (has id and parentId)
export interface DepartmentMobileTreeViewProps {
  departments: Department[];
  allUsers: any[];
  locale: string;
  loading?: boolean;
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
  onAdd?: (parentId: string | null) => void;
  onRefresh?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canAdd?: boolean;
}

export default function DepartmentMobileTreeView({
  departments,
  allUsers,
  locale,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  canEdit = true,
  canDelete = true,
  canAdd = true,
}: DepartmentMobileTreeViewProps) {
  const t = useI18n();
  const theme = useTheme();
  const isKorean = locale === 'ko';

  // Get display name for a department
  const getDisplayName = useCallback(
    (department: Department): string => {
      return getLocalizedValue(department.name, locale) || department.code;
    },
    [locale]
  );

  // Get manager name
  const getManagerName = useCallback(
    (managerId: string | null): string | null => {
      if (!managerId) return null;
      const manager = allUsers.find((u) => u.id === managerId);
      return manager?.name || null;
    },
    [allUsers]
  );

  // Build swipe actions for a department
  const getSwipeActions = useCallback(
    (department: Department): TreeSwipeAction<Department>[] => {
      const actions: TreeSwipeAction<Department>[] = [];

      if (canDelete && onDelete) {
        actions.push({
          icon: <DeleteIcon />,
          label: t('common.delete'),
          color: '#fff',
          backgroundColor: '#f44336',
          onClick: onDelete,
        });
      }

      if (canAdd && onAdd) {
        actions.push({
          icon: <AddIcon />,
          label: isKorean ? '하위추가' : 'Add Child',
          color: '#fff',
          backgroundColor: '#4caf50',
          onClick: (item) => onAdd(item.id),
        });
      }

      if (canEdit && onEdit) {
        actions.push({
          icon: <EditIcon />,
          label: t('common.edit'),
          color: '#fff',
          backgroundColor: '#2196f3',
          onClick: onEdit,
        });
      }

      return actions;
    },
    [canDelete, canAdd, canEdit, onDelete, onAdd, onEdit, t, isKorean]
  );

  // Render department node content (inline expansion style)
  const renderNodeContent = useCallback(
    ({ item: department, hasChildren, childCount, isExpanded, onToggleExpand }: TreeNodeContext<Department>) => {
      const managerName = getManagerName(department.managerId);
      const isActive = department.status === 'active';

      const handleClick = () => {
        if (hasChildren) {
          onToggleExpand();
        } else if (onEdit && canEdit) {
          onEdit(department);
        }
      };

      return (
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flex: 1,
            cursor: 'pointer',
            opacity: isActive ? 1 : 0.6,
            '&:active': {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: hasChildren ? 'primary.50' : 'grey.100',
              borderRadius: 1,
              color: hasChildren ? 'primary.main' : 'text.secondary',
              flexShrink: 0,
            }}
          >
            {hasChildren ? <FolderIcon /> : <BusinessIcon />}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: hasChildren ? 600 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getDisplayName(department)}
              </Typography>
              {hasChildren && (
                <Chip
                  label={childCount}
                  size="small"
                  sx={{
                    height: 18,
                    minWidth: 20,
                    fontSize: '0.65rem',
                    bgcolor: isExpanded ? 'primary.100' : 'grey.200',
                    color: isExpanded ? 'primary.dark' : 'text.secondary',
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.7rem',
              }}
            >
              {department.code}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              {managerName && (
                <Chip
                  icon={<PersonIcon sx={{ fontSize: 10 }} />}
                  label={managerName}
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.6rem', '& .MuiChip-icon': { ml: 0.5 } }}
                />
              )}
              <Chip
                label={isActive ? (isKorean ? '활성' : 'Active') : (isKorean ? '비활성' : 'Inactive')}
                size="small"
                color={isActive ? 'success' : 'default'}
                sx={{ height: 16, fontSize: '0.6rem' }}
              />
            </Box>
          </Box>
        </Box>
      );
    },
    [getDisplayName, getManagerName, onEdit, canEdit, theme, isKorean]
  );

  return (
    <MobileTreeView
      data={departments}
      loading={loading}
      title={isKorean ? '부서 관리' : 'Department Management'}
      getDisplayName={getDisplayName}
      renderNodeContent={renderNodeContent}
      keyExtractor={(department) => department.id}
      getSwipeActions={getSwipeActions}
      onAdd={canAdd ? onAdd : undefined}
      onRefresh={onRefresh}
      canAdd={canAdd}
      emptyMessage={isKorean ? '부서가 없습니다' : 'No departments'}
      emptyAddLabel={isKorean ? '부서 추가' : 'Add Department'}
      swipeHint={isKorean ? '스와이프하여 편집' : 'Swipe for actions'}
      itemCountFormat={(count) => (isKorean ? `${count}개 부서` : `${count} departments`)}
      showExpandControls
      indentSize={20}
    />
  );
}
