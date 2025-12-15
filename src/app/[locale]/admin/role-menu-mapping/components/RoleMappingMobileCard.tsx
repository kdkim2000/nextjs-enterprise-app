'use client';

import React from 'react';
import { Typography, Chip, Box, Stack } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as CreateIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction } from '@/components/mobile/MobileEntityCard';
import { RoleProgramMapping } from '../types';

export interface RoleMappingMobileCardProps {
  mapping: RoleProgramMapping;
  locale: string;
  onEdit?: (mapping: RoleProgramMapping) => void;
  onDelete?: (mapping: RoleProgramMapping) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function RoleMappingMobileCard({
  mapping,
  locale,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: RoleMappingMobileCardProps) {
  const isKorean = locale === 'ko';

  // Build permission chips
  const permissions = [];
  if (mapping.canView) permissions.push({ key: 'view', label: isKorean ? '조회' : 'View', color: 'info' as const });
  if (mapping.canCreate) permissions.push({ key: 'create', label: isKorean ? '생성' : 'Create', color: 'success' as const });
  if (mapping.canUpdate) permissions.push({ key: 'update', label: isKorean ? '수정' : 'Update', color: 'warning' as const });
  if (mapping.canDelete) permissions.push({ key: 'delete', label: isKorean ? '삭제' : 'Delete', color: 'error' as const });

  // Build swipe actions
  const swipeActions: EntitySwipeAction<RoleProgramMapping>[] = [];

  if (canDelete && onDelete) {
    swipeActions.push({
      icon: <DeleteIcon />,
      label: isKorean ? '삭제' : 'Delete',
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: onDelete,
    });
  }

  if (canEdit && onEdit) {
    swipeActions.push({
      icon: <EditIcon />,
      label: isKorean ? '편집' : 'Edit',
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: onEdit,
    });
  }

  return (
    <MobileEntityCard
      item={mapping}
      primaryText={mapping.roleDisplayName || mapping.roleName || mapping.roleId}
      secondaryText={mapping.roleName}
      onClick={canEdit && onEdit ? () => onEdit(mapping) : undefined}
      swipeActions={swipeActions}
      rightContent={
        <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end" sx={{ maxWidth: 140 }}>
          {permissions.map((perm) => (
            <Chip
              key={perm.key}
              label={perm.label}
              size="small"
              color={perm.color}
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          ))}
        </Stack>
      }
    />
  );
}
