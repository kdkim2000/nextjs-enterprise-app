'use client';

import React from 'react';
import { Typography, Chip, Box } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction } from '@/components/mobile/MobileEntityCard';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Role } from '@/types/role';

export interface RoleMobileCardProps {
  role: Role;
  locale: string;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function RoleMobileCard({
  role,
  locale,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: RoleMobileCardProps) {
  const isKorean = locale === 'ko';

  // Build swipe actions
  const swipeActions: EntitySwipeAction<Role>[] = [];

  // System roles cannot be deleted
  if (canDelete && onDelete && !role.isSystem) {
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

  // Role type label
  const roleTypeLabel = role.roleType === 'management'
    ? getLocalizedValue({ en: 'Management', ko: '관리', zh: '管理', vi: 'Quản lý' }, locale)
    : getLocalizedValue({ en: 'General', ko: '일반', zh: '一般', vi: 'Chung' }, locale);

  // Description with manager/representative info
  const descriptionParts: string[] = [];
  if (role.description) {
    descriptionParts.push(role.description);
  }
  if (role.managerName) {
    descriptionParts.push(`${isKorean ? '담당자' : 'Manager'}: ${role.managerName}`);
  }

  return (
    <MobileEntityCard
      item={role}
      primaryText={role.displayName}
      secondaryText={role.name}
      tertiaryText={descriptionParts.join(' | ')}
      status={{
        active: role.isActive !== false,
        activeColor: 'success.main',
        inactiveColor: 'text.disabled',
      }}
      isActive={role.isActive !== false}
      onClick={canEdit && onEdit ? () => onEdit(role) : undefined}
      swipeActions={swipeActions}
      rightContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          <Chip
            icon={role.roleType === 'management' ? <AdminIcon sx={{ fontSize: 12 }} /> : <ShieldIcon sx={{ fontSize: 12 }} />}
            label={roleTypeLabel}
            size="small"
            color={role.roleType === 'management' ? 'secondary' : 'default'}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          {role.isSystem && (
            <Chip
              label={isKorean ? '시스템' : 'System'}
              size="small"
              color="info"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>
      }
    />
  );
}
