'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  helperText?: string;
  /**
   * If true, uses date type (YYYY-MM-DD) and automatically adds time 00:00:00.
   * If false, uses datetime for full control.
   * Default: true
   */
  dateOnly?: boolean;
  /**
   * Language code for date picker (e.g., 'en', 'ko')
   * Default: 'en'
   */
  lang?: string;
  /**
   * Minimum selectable date
   */
  minDate?: string;
  /**
   * Maximum selectable date
   */
  maxDate?: string;
}

/**
 * Single date picker component with modern Google-style design
 *
 * @example
 * ```tsx
 * <DatePicker
 *   label="Birth Date"
 *   value={birthDate}
 *   onChange={(date) => setBirthDate(date)}
 *   lang="ko"
 * />
 * ```
 */
export default function DatePicker({
  label,
  value,
  onChange,
  onEnter,
  disabled = false,
  helperText,
  dateOnly = true,
  lang = 'en',
  minDate,
  maxDate
}: DatePickerProps) {
  const toDayjs = (datetimeStr: string): Dayjs | null => {
    if (!datetimeStr) return null;
    return dayjs(datetimeStr);
  };

  const toDateTimeString = (date: Dayjs | null): string => {
    if (!date || !date.isValid()) return '';
    if (dateOnly) {
      return date.format('YYYY-MM-DD') + 'T00:00:00';
    }
    return date.toISOString();
  };

  const handleChange = (value: Dayjs | null) => {
    const datetimeValue = toDateTimeString(value);
    onChange(datetimeValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
      <Box sx={{ display: 'inline-block', width: 'auto' }}>
        {label && (
          <Typography
            variant="caption"
            sx={{
              mb: 0.5,
              display: 'block',
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
          >
            {label}
          </Typography>
        )}
        <MuiDatePicker
          value={toDayjs(value)}
          onChange={handleChange}
          disabled={disabled}
          format="YYYY-MM-DD"
          minDate={minDate ? toDayjs(minDate) : undefined}
          maxDate={maxDate ? toDayjs(maxDate) : undefined}
          slotProps={{
            textField: {
              size: 'small',
              helperText: helperText,
              onKeyDown: handleKeyDown,
              sx: {
                width: '200px',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'background.paper',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.12)',
                    '& fieldset': {
                      borderWidth: '2px',
                      borderColor: 'primary.main',
                    },
                  },
                  '& fieldset': {
                    borderColor: 'divider',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                },
              }
            },
            popper: {
              sx: {
                '& .MuiPaper-root': {
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  border: '1px solid',
                  borderColor: 'divider',
                  marginTop: '4px',
                },
                '& .MuiPickersDay-root': {
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&.MuiPickersDay-today': {
                    border: '2px solid',
                    borderColor: 'primary.main',
                    backgroundColor: 'transparent',
                    fontWeight: 600,
                  },
                },
              }
            }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
