'use client';

import React from 'react';
import { Chip } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction } from '@/components/mobile/MobileEntityCard';
import { UserRoleMapping } from '../types';

export interface UserMappingMobileCardProps {
  mapping: UserRoleMapping;
  locale: string;
  onDelete?: (mapping: UserRoleMapping) => void;
  canDelete?: boolean;
}

export default function UserMappingMobileCard({
  mapping,
  locale,
  onDelete,
  canDelete = true,
}: UserMappingMobileCardProps) {
  const isKorean = locale === 'ko';

  // Build swipe actions
  const swipeActions: EntitySwipeAction<UserRoleMapping>[] = [];

  if (canDelete && onDelete) {
    swipeActions.push({
      icon: <DeleteIcon />,
      label: isKorean ? '삭제' : 'Delete',
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: onDelete,
    });
  }

  // Build secondary info
  const secondaryParts: string[] = [];
  if (mapping.userEmail) secondaryParts.push(mapping.userEmail);
  if (mapping.userDepartment) secondaryParts.push(mapping.userDepartment);

  return (
    <MobileEntityCard
      item={mapping}
      primaryText={mapping.userName || mapping.userId}
      secondaryText={secondaryParts.join(' • ')}
      status={{
        active: mapping.isActive,
        activeColor: 'success.main',
        inactiveColor: 'text.disabled',
      }}
      avatar={{
        initials: (mapping.userName || mapping.userId || '?').charAt(0).toUpperCase(),
        bgcolor: 'primary.main',
        size: 36,
      }}
      swipeActions={swipeActions}
      rightContent={
        <Chip
          label={mapping.isActive ? (isKorean ? '활성' : 'Active') : (isKorean ? '비활성' : 'Inactive')}
          size="small"
          color={mapping.isActive ? 'success' : 'default'}
          sx={{ height: 22, fontSize: '0.65rem' }}
        />
      }
    />
  );
}
