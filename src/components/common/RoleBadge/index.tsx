'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  AdminPanelSettings,
  Person,
  SupervisorAccount,
  VerifiedUser,
  Security
} from '@mui/icons-material';

export type RoleType = 'admin' | 'user' | 'manager' | 'moderator' | 'guest' | 'custom';

export interface RoleBadgeProps extends Omit<ChipProps, 'label'> {
  role: RoleType | string;
  label?: string;
  showIcon?: boolean;
  variant?: 'filled' | 'outlined';
}

const roleConfig: Record<string, { color: ChipProps['color']; icon: React.ReactNode; label: string }> = {
  admin: {
    color: 'error',
    icon: <AdminPanelSettings />,
    label: 'Admin'
  },
  manager: {
    color: 'primary',
    icon: <SupervisorAccount />,
    label: 'Manager'
  },
  moderator: {
    color: 'warning',
    icon: <Security />,
    label: 'Moderator'
  },
  user: {
    color: 'default',
    icon: <Person />,
    label: 'User'
  },
  guest: {
    color: 'default',
    icon: <Person />,
    label: 'Guest'
  }
};

export default function RoleBadge({
  role,
  label,
  showIcon = true,
  variant = 'filled',
  size = 'small',
  ...rest
}: RoleBadgeProps) {
  const config = roleConfig[role.toLowerCase()] || {
    color: 'default' as ChipProps['color'],
    icon: <VerifiedUser />,
    label: role
  };

  const displayLabel = label || config.label;

  return (
    <Chip
      label={displayLabel}
      color={config.color}
      icon={showIcon ? (config.icon as React.ReactElement) : undefined}
      size={size}
      variant={variant}
      {...rest}
    />
  );
}
