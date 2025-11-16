'use client';

import React from 'react';
import { TextField, MenuItem, CircularProgress, Box } from '@mui/material';
import { useCodeOptions } from '@/hooks/useCodeOptions';
import { useCurrentLocale } from '@/lib/i18n/client';

export interface CodeSelectProps {
  /**
   * Code type to fetch options from (e.g., 'COMMON_STATUS', 'DEPARTMENT')
   */
  codeType: string;

  /**
   * Current selected value
   */
  value: string;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

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
   * Show empty option (All / None)
   */
  showEmpty?: boolean;

  /**
   * Empty option label
   */
  emptyLabel?: string;

  /**
   * Custom locale override
   */
  locale?: string;
}

/**
 * CodeSelect - Single select dropdown component that automatically fetches options from code management system
 *
 * @example
 * ```tsx
 * <CodeSelect
 *   codeType="COMMON_STATUS"
 *   value={status}
 *   onChange={setStatus}
 *   label="Status"
 *   required
 * />
 * ```
 */
export default function CodeSelect({
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
  showEmpty = false,
  emptyLabel = 'All',
  locale: customLocale
}: CodeSelectProps) {
  const currentLocale = useCurrentLocale();
  const locale = customLocale || currentLocale;

  const { codes, loading, error: fetchError } = useCodeOptions(codeType, locale);

  // Handle change event
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  // Show error if fetch failed
  const displayError = error || !!fetchError;
  const displayHelperText = fetchError || helperText;

  return (
    <TextField
      select
      label={label}
      value={loading ? '' : value}
      onChange={handleChange}
      required={required}
      disabled={disabled || loading}
      error={displayError}
      helperText={displayHelperText}
      fullWidth={fullWidth}
      size={size}
      placeholder={placeholder}
      InputProps={{
        endAdornment: loading ? (
          <Box sx={{ display: 'flex', mr: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : undefined
      }}
    >
      {showEmpty && (
        <MenuItem value="">
          <em>{emptyLabel}</em>
        </MenuItem>
      )}
      {codes.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
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
