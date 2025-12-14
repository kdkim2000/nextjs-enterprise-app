'use client';

import React from 'react';
import { Box, Typography, Avatar, Chip, alpha, useTheme } from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
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
      label: isKorean ? '비밀번호' : 'Reset PW',
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

  const handleClick = () => {
    if (selectable && onSelectionChange) {
      onSelectionChange(!selected);
    } else if (onClick) {
      onClick(user);
    }
  };

  const departmentName = getDepartmentName();
  const positionInfo = [departmentName, user.position].filter(Boolean).join(' / ');

  const cardContent = (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        p: 1.5,
        gap: 1.5,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.08)
          : isActive
          ? 'background.paper'
          : alpha(theme.palette.action.disabled, 0.04),
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        '&:active': {
          bgcolor: alpha(theme.palette.primary.main, 0.12),
        },
      }}
    >
      {/* Selection checkbox area */}
      {selectable && (
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: selected ? 'primary.main' : 'divider',
            bgcolor: selected ? 'primary.main' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mt: 1,
          }}
        >
          {selected && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'white',
              }}
            />
          )}
        </Box>
      )}

      {/* Avatar */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Avatar
          src={user.avatar_image || user.avatarUrl || undefined}
          sx={{
            width: 48,
            height: 48,
            bgcolor: getAvatarColor(),
            fontSize: '1rem',
            fontWeight: 600,
            opacity: isActive ? 1 : 0.6,
          }}
        >
          {getAvatarInitials()}
        </Avatar>
        {/* Status indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid',
            borderColor: 'background.paper',
          }}
        >
          {isActive ? (
            <ActiveIcon sx={{ fontSize: 14, color: 'success.main' }} />
          ) : (
            <InactiveIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Name + Role */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: isActive ? 'text.primary' : 'text.secondary',
            }}
          >
            {getDisplayName()}
          </Typography>
          <Chip
            icon={getRoleIcon()}
            label={getRoleLabel()}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
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
              '& .MuiChip-icon': {
                ml: 0.5,
                mr: -0.5,
                color: 'inherit',
              },
            }}
          />
        </Box>

        {/* Login ID + Employee Number */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.25,
          }}
        >
          {user.loginid || user.email}
          {user.employee_number && (
            <Typography
              component="span"
              variant="caption"
              sx={{ color: 'text.disabled', ml: 0.5 }}
            >
              ({user.employee_number})
            </Typography>
          )}
        </Typography>

        {/* Department / Position */}
        {positionInfo && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.disabled',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.5,
            }}
          >
            {positionInfo}
          </Typography>
        )}

        {/* Security badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {user.mfaEnabled && (
            <Chip
              icon={<SecurityIcon sx={{ fontSize: '12px !important' }} />}
              label="MFA"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: 'success.50',
                color: 'success.dark',
                '& .MuiChip-icon': { ml: 0.5, mr: -0.5, color: 'inherit' },
              }}
            />
          )}
          {user.ssoEnabled && (
            <Chip
              icon={<VpnKeyIcon sx={{ fontSize: '12px !important' }} />}
              label="SSO"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: 'info.50',
                color: 'info.dark',
                '& .MuiChip-icon': { ml: 0.5, mr: -0.5, color: 'inherit' },
              }}
            />
          )}
          {user.user_category && user.user_category !== 'regular' && (
            <Chip
              label={user.user_category}
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>
      </Box>

      {/* Right side - Email icon or chevron */}
      {!selectable && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.5,
            pt: 0.5,
          }}
        >
          {user.email && (
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
          )}
        </Box>
      )}
    </Box>
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
