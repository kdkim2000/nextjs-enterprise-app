'use client';

import React from 'react';
import { Tooltip } from '@mui/material';
import StatusDot from '@/components/common/StatusDot';

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

// Map all supported StatusType values to StatusDot's accepted 'active' | 'inactive' | 'pending' | 'suspended'
const statusDotMap: Record<StatusType, 'active' | 'inactive' | 'pending' | 'suspended'> = {
  active:   'active',
  inactive: 'inactive',
  pending:  'pending',
  success:  'active',
  error:    'suspended',
  warning:  'pending',
  info:     'active',
};

// Default display labels per type
const defaultLabels: Record<StatusType, string> = {
  active:   'Active',
  inactive: 'Inactive',
  pending:  'Pending',
  success:  'Success',
  error:    'Error',
  warning:  'Warning',
  info:     'Info',
};

export default function Status({
  type,
  label,
  variant = 'chip',
  size,
  tooltip,
  showIcon: _showIcon,
}: StatusProps) {
  const dotStatus = statusDotMap[type] ?? 'inactive';
  const displayLabel = label ?? defaultLabels[type];

  const content = (
    <StatusDot status={dotStatus} label={displayLabel} />
  );

  return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
}
