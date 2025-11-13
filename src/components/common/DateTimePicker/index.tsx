'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';

interface DateTimePickerProps {
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
   * Minimum selectable datetime
   */
  minDateTime?: string;
  /**
   * Maximum selectable datetime
   */
  maxDateTime?: string;
}

/**
 * DateTime picker component with modern Google-style design
 * Returns format: YYYY-MM-DDTHH:mm:ss
 *
 * @example
 * ```tsx
 * <DateTimePicker
 *   label="Event Start"
 *   value={eventStart}
 *   onChange={(datetime) => setEventStart(datetime)}
 * />
 * ```
 */
export default function DateTimePicker({
  label,
  value,
  onChange,
  onEnter,
  disabled = false,
  helperText,
  lang = 'en',
  minDateTime,
  maxDateTime
}: DateTimePickerProps) {
  const toDayjs = (datetimeStr: string): Dayjs | null => {
    if (!datetimeStr) return null;
    return dayjs(datetimeStr);
  };

  const toDateTimeString = (date: Dayjs | null): string => {
    if (!date || !date.isValid()) return '';
    return date.format('YYYY-MM-DDTHH:mm:ss');
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
        <MuiDateTimePicker
          value={toDayjs(value)}
          onChange={handleChange}
          disabled={disabled}
          format="YYYY-MM-DD HH:mm"
          ampm={false}
          minDateTime={minDateTime ? toDayjs(minDateTime) : undefined}
          maxDateTime={maxDateTime ? toDayjs(maxDateTime) : undefined}
          slotProps={{
            textField: {
              size: 'small',
              helperText: helperText,
              onKeyDown: handleKeyDown,
              sx: {
                width: '220px',
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
