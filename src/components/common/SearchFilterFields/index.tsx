'use client';

import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid2';
import UserSelector from '@/components/common/UserSelector';

export interface FilterFieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'select' | 'number' | 'userSelector';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  gridSize?: { xs?: number; sm?: number; md?: number };
}

interface SearchFilterFieldsProps {
  fields: FilterFieldConfig[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
}

/**
 * Common search filter fields component
 * Renders a grid of filter input fields based on configuration
 *
 * @example
 * ```tsx
 * const fields: FilterFieldConfig[] = [
 *   { name: 'username', label: 'Username', type: 'text', placeholder: 'Search by username...' },
 *   { name: 'role', label: 'Role', type: 'select', options: [
 *     { value: '', label: 'All Roles' },
 *     { value: 'admin', label: 'Admin' }
 *   ]}
 * ];
 *
 * <SearchFilterFields
 *   fields={fields}
 *   values={searchCriteria}
 *   onChange={handleSearchChange}
 *   onEnter={handleApply}
 * />
 * ```
 */
export default function SearchFilterFields({
  fields,
  values,
  onChange,
  onEnter,
  disabled = false
}: SearchFilterFieldsProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
    <Grid container spacing={2}>
      {fields.map((field) => {
        const gridSize = field.gridSize || { xs: 12, sm: 6, md: 4 };

        if (field.type === 'select') {
          return (
            <Grid key={field.name} size={gridSize}>
              <TextField
                label={field.label}
                select
                value={values[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                fullWidth
                size="small"
                disabled={disabled}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          );
        }

        if (field.type === 'userSelector') {
          return (
            <Grid key={field.name} size={gridSize}>
              <UserSelector
                label={field.label}
                value={values[field.name] || ''}
                onChange={(userId) => onChange(field.name, userId || '')}
                helperText={field.placeholder}
                disabled={disabled}
              />
            </Grid>
          );
        }

        return (
          <Grid key={field.name} size={gridSize}>
            <TextField
              label={field.label}
              type={field.type || 'text'}
              value={values[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
              size="small"
              placeholder={field.placeholder}
              disabled={disabled}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
