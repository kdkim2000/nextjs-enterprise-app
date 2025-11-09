'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';

interface TimePickerProps {
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
}

/**
 * Time picker component with modern Google-style design
 * Returns format: HH:mm:ss
 *
 * @example
 * ```tsx
 * <TimePicker
 *   label="Start Time"
 *   value={startTime}
 *   onChange={(time) => setStartTime(time)}
 * />
 * ```
 */
export default function TimePicker({
  label,
  value,
  onChange,
  onEnter,
  disabled = false,
  helperText,
  lang = 'en'
}: TimePickerProps) {
  const toDayjs = (timeStr: string): Dayjs | null => {
    if (!timeStr) return null;
    // If time only, use today's date
    if (timeStr.includes(':') && !timeStr.includes('T')) {
      return dayjs(`2000-01-01T${timeStr}`);
    }
    return dayjs(timeStr);
  };

  const toTimeString = (date: Dayjs | null): string => {
    if (!date || !date.isValid()) return '';
    return date.format('HH:mm:ss');
  };

  const handleChange = (value: Dayjs | null) => {
    const timeValue = toTimeString(value);
    onChange(timeValue);
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
        <MuiTimePicker
          value={toDayjs(value)}
          onChange={handleChange}
          disabled={disabled}
          ampm={false}
          format="HH:mm"
          slotProps={{
            textField: {
              size: 'small',
              helperText: helperText,
              onKeyDown: handleKeyDown,
              sx: {
                width: '150px',
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
                '& .MuiMultiSectionDigitalClock-root': {
                  '& .MuiMenuItem-root': {
                    borderRadius: '8px',
                    margin: '2px 8px',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
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
