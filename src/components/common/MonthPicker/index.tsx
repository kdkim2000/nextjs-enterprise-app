'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';

interface MonthPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  helperText?: string;
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
 * Month picker component with modern Google-style design
 * Returns format: YYYY-MM
 *
 * @example
 * ```tsx
 * <MonthPicker
 *   label="Birth Month"
 *   value={birthMonth}
 *   onChange={(month) => setBirthMonth(month)}
 * />
 * ```
 */
export default function MonthPicker({
  label,
  value,
  onChange,
  onEnter,
  disabled = false,
  helperText,
  lang = 'en',
  minDate,
  maxDate
}: MonthPickerProps) {
  const toDayjs = (monthStr: string): Dayjs | null => {
    if (!monthStr) return null;
    return dayjs(monthStr);
  };

  const toMonthString = (date: Dayjs | null): string => {
    if (!date || !date.isValid()) return '';
    return date.format('YYYY-MM');
  };

  const handleChange = (value: Dayjs | null) => {
    const monthValue = toMonthString(value);
    onChange(monthValue);
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
        <DatePicker
          views={['year', 'month']}
          value={toDayjs(value)}
          onChange={handleChange}
          disabled={disabled}
          format="YYYY-MM"
          minDate={minDate ? toDayjs(minDate) || undefined : undefined}
          maxDate={maxDate ? toDayjs(maxDate) || undefined : undefined}
          slotProps={{
            textField: {
              size: 'small',
              helperText: helperText,
              onKeyDown: handleKeyDown,
              sx: {
                width: '170px',
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
                },
                '& .MuiPickersMonth-monthButton': {
                  fontSize: '0.875rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
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
