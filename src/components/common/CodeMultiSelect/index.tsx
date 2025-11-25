'use client';

import React from 'react';
import {
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Checkbox,
  ListItemText,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { useCodeOptions } from '@/hooks/useCodeOptions';
import { useCurrentLocale } from '@/lib/i18n/client';

export interface CodeMultiSelectProps {
  /**
   * Code type to fetch options from (e.g., 'COMMON_STATUS', 'DEPARTMENT')
   */
  codeType: string;

  /**
   * Current selected values
   */
  value: string[];

  /**
   * Change handler
   */
  onChange: (value: string[]) => void;

  /**
   * Field label
   */
  label: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Helper text / error message
   */
  helperText?: string;

  /**
   * Full width
   */
  fullWidth?: boolean;

  /**
   * Size variant
   */
  size?: 'small' | 'medium';

  /**
   * Show checkboxes
   */
  showCheckbox?: boolean;

  /**
   * Render selected values as chips
   */
  renderChips?: boolean;

  /**
   * Custom locale override
   */
  locale?: string;

  /**
   * Maximum number of chips to show before "+X more"
   */
  maxChipsDisplay?: number;
}

/**
 * CodeMultiSelect - Multi select dropdown component that automatically fetches options from code management system
 *
 * @example
 * ```tsx
 * <CodeMultiSelect
 *   codeType="DEPARTMENT"
 *   value={selectedDepartments}
 *   onChange={setSelectedDepartments}
 *   label="Departments"
 *   showCheckbox
 *   renderChips
 * />
 * ```
 */
export default function CodeMultiSelect({
  codeType,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
  size = 'medium',
  showCheckbox = true,
  renderChips = true,
  locale: customLocale,
  maxChipsDisplay = 2
}: CodeMultiSelectProps) {
  const currentLocale = useCurrentLocale();
  const locale = customLocale || currentLocale;

  const { codes, loading, error: fetchError } = useCodeOptions(codeType, locale);

  // Handle change event
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValue = event.target.value;
    const newValue = typeof selectedValue === 'string' ? selectedValue.split(',') : selectedValue;
    onChange(newValue);
  };

  // Render selected values
  const renderValue = (selected: string[]) => {
    if (!renderChips) {
      return selected
        .map((val) => {
          const option = codes.find((c) => c.value === val);
          return option?.label || val;
        })
        .join(', ');
    }

    const displayChips = selected.slice(0, maxChipsDisplay);
    const remainingCount = selected.length - maxChipsDisplay;

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {displayChips.map((val) => {
          const option = codes.find((c) => c.value === val);
          return (
            <Chip
              key={val}
              label={option?.label || val}
              size="small"
              sx={{ maxWidth: 150 }}
            />
          );
        })}
        {remainingCount > 0 && (
          <Chip
            label={`+${remainingCount} more`}
            size="small"
            variant="outlined"
          />
        )}
      </Box>
    );
  };

  // Show error if fetch failed
  const displayError = error || !!fetchError;
  const displayHelperText = fetchError || helperText;

  return (
    <TextField
      select
      label={label}
      value={loading ? [] : value}
      onChange={handleChange as unknown as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>}
      required={required}
      disabled={disabled || loading}
      error={displayError}
      helperText={displayHelperText}
      fullWidth={fullWidth}
      size={size}
      placeholder={placeholder}
      SelectProps={{
        multiple: true,
        renderValue: renderValue as unknown as (value: unknown) => React.ReactNode,
        endAdornment: loading ? (
          <Box sx={{ display: 'flex', mr: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : undefined
      }}
    >
      {codes.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {showCheckbox && (
            <Checkbox checked={value.indexOf(option.value) > -1} />
          )}
          <ListItemText primary={option.label} />
        </MenuItem>
      ))}
      {!loading && codes.length === 0 && (
        <MenuItem disabled>
          <em>No options available</em>
        </MenuItem>
      )}
    </TextField>
  );
}
