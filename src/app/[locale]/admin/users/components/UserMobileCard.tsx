'use client';

import React, { useMemo } from 'react';
import { Typography, useTheme } from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
} from '@mui/icons-material';
import MobileEntityCard, {
  EntityAvatarConfig,
  EntityStatusIndicator,
  EntityRoleBadge,
  EntityFeatureBadge,
  EntitySwipeAction,
} from '@/components/mobile/MobileEntityCard';
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
  const theme = useTheme();
  const isKorean = locale === 'ko';
  const isActive = user.status === 'active';

  // Get department name
  const getDepartmentName = (): string => {
    if (!user.department || departments.length === 0) return '';
    const dept = departments.find((d) => d.id === user.department);
    if (!dept) return '';

    if (typeof dept.name === 'object' && dept.name !== null) {
      return getLocalizedValue(dept.name, locale);
    } else if (typeof dept.name === 'string') {
      return dept.name;
    }
    return dept.name_ko || dept.name_en || '';
  };

  // Get display name based on locale
  const getDisplayName = (): string => {
    if (locale === 'ko' && user.name_ko) return user.name_ko;
    if (user.name_en) return user.name_en;
    return user.name_ko || user.name || user.loginid || '-';
  };

  // Get avatar initials
  const getAvatarInitials = (): string => {
    if (user.name_ko) return user.name_ko.substring(0, 1);
    if (user.name_en) return user.name_en.substring(0, 2).toUpperCase();
    if (user.loginid) return user.loginid.substring(0, 2).toUpperCase();
    return '?';
  };

  // Get avatar background color based on role
  const getAvatarColor = (): string => {
    switch (user.role) {
      case 'admin':
        return theme.palette.error.main;
      case 'manager':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Get role icon
  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin':
        return <AdminIcon sx={{ fontSize: 12 }} />;
      case 'manager':
        return <ManagerIcon sx={{ fontSize: 12 }} />;
      default:
        return <PersonIcon sx={{ fontSize: 12 }} />;
    }
  };

  // Get role label
  const getRoleLabel = (): string => {
    const roleLabels: Record<string, Record<string, string>> = {
      admin: { ko: '관리자', en: 'Admin' },
      manager: { ko: '매니저', en: 'Manager' },
      user: { ko: '사용자', en: 'User' },
    };
    return roleLabels[user.role || 'user']?.[isKorean ? 'ko' : 'en'] || user.role || 'User';
  };

  // Avatar config
  const avatar: EntityAvatarConfig = useMemo(
    () => ({
      src: user.avatar_image || user.avatarUrl,
      initials: getAvatarInitials(),
      bgcolor: getAvatarColor(),
      size: 48,
    }),
    [user.avatar_image, user.avatarUrl, user.name_ko, user.name_en, user.loginid, user.role]
  );

  // Status indicator
  const status: EntityStatusIndicator = useMemo(
    () => ({
      active: isActive,
    }),
    [isActive]
  );

  // Role badge
  const roleBadge: EntityRoleBadge = useMemo(
    () => ({
      label: getRoleLabel(),
      icon: getRoleIcon(),
      bgcolor:
        user.role === 'admin'
          ? 'error.50'
          : user.role === 'manager'
          ? 'warning.50'
          : 'grey.100',
      color:
        user.role === 'admin'
          ? 'error.dark'
          : user.role === 'manager'
          ? 'warning.dark'
          : 'text.secondary',
    }),
    [user.role, isKorean]
  );

  // Feature badges
  const featureBadges: EntityFeatureBadge[] = useMemo(
    () => [
      {
        key: 'mfa',
        label: 'MFA',
        icon: <SecurityIcon sx={{ fontSize: '12px !important' }} />,
        bgcolor: 'success.50',
        color: 'success.dark',
        show: user.mfaEnabled,
      },
      {
        key: 'sso',
        label: 'SSO',
        icon: <VpnKeyIcon sx={{ fontSize: '12px !important' }} />,
        bgcolor: 'info.50',
        color: 'info.dark',
        show: user.ssoEnabled,
      },
      {
        key: 'category',
        label: user.user_category || '',
        show: !!user.user_category && user.user_category !== 'regular',
      },
    ],
    [user.mfaEnabled, user.ssoEnabled, user.user_category]
  );

  // Swipe actions
  const swipeActions: EntitySwipeAction<User>[] = useMemo(() => {
    const actions: EntitySwipeAction<User>[] = [];

    if (onDelete) {
      actions.push({
        icon: <DeleteIcon />,
        label: t('common.delete'),
        color: '#fff',
        backgroundColor: '#f44336',
        onClick: onDelete,
      });
    }

    if (onResetPassword) {
      actions.push({
        icon: <LockResetIcon />,
        label: isKorean ? '비밀번호' : 'Reset PW',
        color: '#fff',
        backgroundColor: '#ff9800',
        onClick: onResetPassword,
      });
    }

    if (onEdit) {
      actions.push({
        icon: <EditIcon />,
        label: t('common.edit'),
        color: '#fff',
        backgroundColor: '#2196f3',
        onClick: onEdit,
      });
    }

    return actions;
  }, [onDelete, onResetPassword, onEdit, t, isKorean]);

  // Build tertiary text (department / position)
  const departmentName = getDepartmentName();
  const tertiaryText = [departmentName, user.position].filter(Boolean).join(' / ') || undefined;

  // Right content (email)
  const rightContent = user.email ? (
    <Typography
      variant="caption"
      sx={{
        color: 'text.disabled',
        fontSize: '0.65rem',
        maxWidth: 100,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {user.email}
    </Typography>
  ) : undefined;

  return (
    <MobileEntityCard
      item={user}
      avatar={avatar}
      status={status}
      primaryText={getDisplayName()}
      roleBadge={roleBadge}
      secondaryText={user.loginid || user.email || undefined}
      secondarySubtext={user.employee_number || undefined}
      tertiaryText={tertiaryText}
      featureBadges={featureBadges}
      rightContent={rightContent}
      isActive={isActive}
      onClick={onClick}
      swipeActions={swipeActions}
      showSwipeActions={showSwipeActions}
      selected={selected}
      selectable={selectable}
      onSelectionChange={onSelectionChange}
    />
  );
}
