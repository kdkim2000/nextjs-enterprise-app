'use client';

import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid2';
import UserSelector from '@/components/common/UserSelector';
import DateRangePicker from '@/components/common/DateRangePicker';
import MultiSelect from '@/components/common/MultiSelect';

export interface FilterFieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'select' | 'multi-select' | 'number' | 'userSelector' | 'date-range' | 'datetime-local';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  gridSize?: { xs?: number; sm?: number; md?: number };
  // For date-range type
  startDateField?: string;
  endDateField?: string;
  startLabel?: string;
  endLabel?: string;
  /**
   * For date-range type: if true, shows date picker only (time auto-filled)
   * Start: 00:00:00, End: 23:59:59
   * Default: true
   */
  dateOnly?: boolean;
  /**
   * Language code for date picker (e.g., 'en', 'ko')
   * Default: 'en'
   */
  lang?: string;
  /**
   * For multi-select type: label for "All" option
   * Default: 'All'
   */
  allLabel?: string;
}

interface SearchFilterFieldsProps {
  fields: FilterFieldConfig[];
  values: Record<string, string | string[]>;
  onChange: (name: string, value: string | string[]) => void;
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

        if (field.type === 'multi-select') {
          const currentValue = values[field.name];
          const arrayValue = Array.isArray(currentValue) ? currentValue : [];

          return (
            <Grid key={field.name} size={gridSize}>
              <MultiSelect
                label={field.label}
                value={arrayValue}
                onChange={(newValue) => onChange(field.name, newValue)}
                options={field.options || []}
                placeholder={field.placeholder}
                disabled={disabled}
                helperText={field.placeholder}
                allLabel={field.allLabel || 'All'}
              />
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

        if (field.type === 'date-range') {
          const startField = field.startDateField || 'startDate';
          const endField = field.endDateField || 'endDate';

          return (
            <Grid key={field.name} size={{ xs: 12 }}>
              <DateRangePicker
                label={field.label}
                startDate={values[startField] || ''}
                endDate={values[endField] || ''}
                onChange={(start, end) => {
                  onChange(startField, start);
                  onChange(endField, end);
                }}
                onEnter={onEnter}
                disabled={disabled}
                startLabel={field.startLabel || 'Start Date'}
                endLabel={field.endLabel || 'End Date'}
                gridSize={field.gridSize}
                helperText={field.placeholder}
                dateOnly={field.dateOnly !== undefined ? field.dateOnly : true}
                lang={field.lang || 'en'}
              />
            </Grid>
          );
        }

        if (field.type === 'datetime-local') {
          return (
            <Grid key={field.name} size={gridSize}>
              <TextField
                label={field.label}
                type="datetime-local"
                value={values[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                size="small"
                disabled={disabled}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText={field.placeholder}
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
