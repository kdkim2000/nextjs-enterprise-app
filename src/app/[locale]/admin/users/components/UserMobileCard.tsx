'use client';

import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import {
  Security,
  VpnKey,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import MobileCard, { MobileCardChip } from '@/components/mobile/MobileCard';
import MobileSwipeActions, { SwipeAction } from '@/components/mobile/MobileSwipeActions';
import { useI18n } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { User } from '../types';

export interface UserMobileCardProps {
  user: User;
  locale?: string;
  departments?: Array<{ id: string; name: any; name_ko?: string; name_en?: string }>;
  onClick?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSwipeActions?: boolean;
}

export default function UserMobileCard({
  user,
  locale = 'ko',
  departments = [],
  onClick,
  onEdit,
  onDelete,
  onResetPassword,
  selected = false,
  selectable = false,
  onSelectionChange,
  showSwipeActions = true,
}: UserMobileCardProps) {
  const t = useI18n();

  // Get department name
  const getDepartmentName = (): string => {
    if (!user.department || departments.length === 0) return '-';
    const dept = departments.find((d) => d.id === user.department);
    if (!dept) return '-';

    if (typeof dept.name === 'object' && dept.name !== null) {
      return getLocalizedValue(dept.name, locale);
    } else if (typeof dept.name === 'string') {
      return dept.name;
    }
    return dept.name_ko || dept.name_en || '-';
  };

  // Get display name based on locale
  const getDisplayName = (): string => {
    if (locale === 'ko' && user.name_ko) return user.name_ko;
    if (user.name_en) return user.name_en;
    return user.name_ko || user.name || user.loginid || '-';
  };

  // Get avatar
  const getAvatar = () => {
    let avatarSrc = '';
    if (user.avatar_image) {
      avatarSrc = user.avatar_image;
    } else if (user.avatarUrl) {
      avatarSrc = user.avatarUrl;
    }

    let avatarText = '';
    if (!avatarSrc) {
      if (user.name_ko) {
        avatarText = user.name_ko.substring(0, 1);
      } else if (user.name_en) {
        avatarText = user.name_en.substring(0, 2).toUpperCase();
      } else if (user.loginid) {
        avatarText = user.loginid.substring(0, 2).toUpperCase();
      }
    }

    return (
      <Avatar
        src={avatarSrc || undefined}
        sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
      >
        {avatarText}
      </Avatar>
    );
  };

  // Build chips
  const getChips = (): MobileCardChip[] => {
    const chips: MobileCardChip[] = [];

    // Role chip
    if (user.role) {
      const roleColors: Record<string, 'primary' | 'secondary' | 'default'> = {
        admin: 'secondary',
        manager: 'primary',
        user: 'default',
      };
      chips.push({
        label: user.role,
        color: roleColors[user.role] || 'default',
        variant: 'outlined',
      });
    }

    // Category chip
    if (user.user_category && user.user_category !== 'regular') {
      chips.push({
        label: user.user_category,
        color: 'default',
      });
    }

    return chips;
  };

  // Build badge (status + MFA/SSO)
  const getBadge = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Chip
        label={
          user.status === 'active'
            ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale)
            : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale)
        }
        size="small"
        color={user.status === 'active' ? 'success' : 'default'}
        sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
      />
      {user.mfaEnabled && (
        <Security sx={{ fontSize: 16, color: 'success.main' }} />
      )}
      {user.ssoEnabled && (
        <VpnKey sx={{ fontSize: 16, color: 'info.main' }} />
      )}
    </Box>
  );

  // Build swipe actions
  const rightActions: SwipeAction[] = [];

  if (onDelete) {
    rightActions.push({
      icon: <DeleteIcon />,
      label: t('common.delete'),
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: () => onDelete(user),
    });
  }

  if (onResetPassword) {
    rightActions.push({
      icon: <LockResetIcon />,
      label: getLocalizedValue({ en: 'Reset PW', ko: '비밀번호', zh: '重置密码', vi: 'Đặt lại MK' }, locale),
      color: '#fff',
      backgroundColor: '#ff9800',
      onClick: () => onResetPassword(user),
    });
  }

  if (onEdit) {
    rightActions.push({
      icon: <EditIcon />,
      label: t('common.edit'),
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: () => onEdit(user),
    });
  }

  const cardContent = (
    <MobileCard
      item={user}
      primaryText={getDisplayName()}
      secondaryText={(u) => `${u.loginid || ''} ${u.employee_number ? `(${u.employee_number})` : ''}`}
      tertiaryText={`${getDepartmentName()} ${user.position ? `/ ${user.position}` : ''}`}
      avatar={getAvatar()}
      badge={getBadge()}
      chips={getChips()}
      onClick={onClick ? () => onClick(user) : undefined}
      selected={selected}
      selectable={selectable}
      onSelectionChange={onSelectionChange}
      divider
    />
  );

  // Wrap with swipe actions if enabled
  if (showSwipeActions && rightActions.length > 0) {
    return (
      <MobileSwipeActions rightActions={rightActions}>
        {cardContent}
      </MobileSwipeActions>
    );
  }

  return cardContent;
}
