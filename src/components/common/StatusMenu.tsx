'use client';

import React, { useState } from 'react';
import { Select, MenuItem, SelectChangeEvent, Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

export interface StatusMenuProps<T = any> {
  /**
   * The data row
   */
  row: T;

  /**
   * Status field name
   * @default "status"
   */
  statusField?: keyof T;

  /**
   * Callback when status changes
   */
  onStatusChange?: (newStatus: string) => Promise<void> | void;

  /**
   * Available status options
   * @default [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]
   */
  statusOptions?: Array<{ value: string; label: string; color?: string }>;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Show as chip instead of select
   */
  chipMode?: boolean;
}

const defaultStatusOptions = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' }
];

const StatusMenu = <T extends Record<string, any>>({
  row,
  statusField = 'status' as keyof T,
  onStatusChange,
  statusOptions = defaultStatusOptions,
  disabled = false,
  chipMode = false
}: StatusMenuProps<T>) => {
  const currentStatus = row[statusField] as string;
  const [loading, setLoading] = useState(false);

  const handleChange = async (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value;
    if (newStatus === currentStatus || !onStatusChange) return;

    try {
      setLoading(true);
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentOption = statusOptions.find(opt => opt.value === currentStatus);

  // Chip mode - read-only display
  if (chipMode || !onStatusChange) {
    return (
      <Chip
        label={currentOption?.label || currentStatus}
        color={currentOption?.color as any || 'default'}
        size="small"
        icon={currentStatus === 'active' ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
      />
    );
  }

  // Select mode - interactive
  return (
    <Select
      value={currentStatus || ''}
      onChange={handleChange}
      disabled={disabled || loading}
      size="small"
      sx={{
        minWidth: 100,
        '& .MuiSelect-select': {
          py: 0.5,
          fontSize: '0.875rem'
        }
      }}
    >
      {statusOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Chip
            label={option.label}
            color={option.color as any || 'default'}
            size="small"
            sx={{ minWidth: 70 }}
          />
        </MenuItem>
      ))}
    </Select>
  );
};

export default StatusMenu;
