'use client';

import React from 'react';
import { Chip, ChipProps, Badge as MuiBadge, BadgeProps as MuiBadgeProps } from '@mui/material';

export interface BadgeProps extends Omit<ChipProps, 'variant'> {
  type?: 'chip' | 'dot' | 'count';
  variant?: 'filled' | 'outlined';
  count?: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
}

export default function Badge({
  type = 'chip',
  variant = 'filled',
  color = 'default',
  size = 'medium',
  label,
  count,
  max = 99,
  showZero = false,
  dot = false,
  children,
  ...rest
}: BadgeProps) {
  if (type === 'chip') {
    return (
      <Chip
        label={label}
        color={color}
        size={size}
        variant={variant}
        {...rest}
      />
    );
  }

  const badgeProps: Partial<MuiBadgeProps> = {
    color: color as any,
    variant: dot ? 'dot' : 'standard',
    ...(count !== undefined && { badgeContent: count }),
    max,
    showZero
  };

  return (
    <MuiBadge {...badgeProps}>
      {children}
    </MuiBadge>
  );
}
