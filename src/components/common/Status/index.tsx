'use client';

import React from 'react';
import { Box, Chip, ChipProps, Tooltip } from '@mui/material';
import { Circle, CheckCircle, Cancel, Warning, Info, RemoveCircle } from '@mui/icons-material';

export type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'info';
export type StatusVariant = 'dot' | 'chip' | 'icon';

export interface StatusProps {
  type: StatusType;
  label?: string;
  variant?: StatusVariant;
  size?: 'small' | 'medium';
  tooltip?: string;
  showIcon?: boolean;
}

const statusConfig: Record<StatusType, { color: ChipProps['color']; icon: React.ReactNode; label: string }> = {
  active: {
    color: 'success',
    icon: <CheckCircle />,
    label: 'Active'
  },
  inactive: {
    color: 'default',
    icon: <RemoveCircle />,
    label: 'Inactive'
  },
  pending: {
    color: 'warning',
    icon: <Warning />,
    label: 'Pending'
  },
  success: {
    color: 'success',
    icon: <CheckCircle />,
    label: 'Success'
  },
  error: {
    color: 'error',
    icon: <Cancel />,
    label: 'Error'
  },
  warning: {
    color: 'warning',
    icon: <Warning />,
    label: 'Warning'
  },
  info: {
    color: 'info',
    icon: <Info />,
    label: 'Info'
  }
};

export default function Status({
  type,
  label,
  variant = 'chip',
  size = 'small',
  tooltip,
  showIcon = true
}: StatusProps) {
  const config = statusConfig[type];
  const displayLabel = label || config.label;

  // Dot variant - simple colored circle
  if (variant === 'dot') {
    const dotSize = size === 'small' ? 8 : 12;
    const content = (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Circle
          sx={{
            fontSize: dotSize,
            color: `${config.color}.main`
          }}
        />
        {label && <Box component="span">{label}</Box>}
      </Box>
    );

    return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
  }

  // Icon variant - just the icon
  if (variant === 'icon') {
    const iconElement = React.cloneElement(config.icon as React.ReactElement, {
      color: config.color,
      fontSize: size
    });

    return tooltip ? (
      <Tooltip title={tooltip || displayLabel}>
        {iconElement}
      </Tooltip>
    ) : (
      iconElement
    );
  }

  // Chip variant (default)
  const chipElement = (
    <Chip
      label={displayLabel}
      color={config.color}
      size={size}
      icon={showIcon ? (config.icon as React.ReactElement) : undefined}
    />
  );

  return tooltip ? <Tooltip title={tooltip}>{chipElement}</Tooltip> : chipElement;
}
