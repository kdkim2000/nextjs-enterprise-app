'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';

export interface DateTimeRangeValue {
  startDateTime: string;
  endDateTime: string;
}

interface DateTimeRangePickerProps {
  label?: string;
  startDateTime: string;
  endDateTime: string;
  onChange: (startDateTime: string, endDateTime: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  startLabel?: string;
  endLabel?: string;
  helperText?: string;
  /**
   * Language code for date picker (e.g., 'en', 'ko')
   * Default: 'en'
   */
  lang?: string;
}

/**
 * DateTime range picker component with modern Google-style design
 * Returns format: YYYY-MM-DDTHH:mm:ss ~ YYYY-MM-DDTHH:mm:ss
 *
 * @example
 * ```tsx
 * <DateTimeRangePicker
 *   label="Event Period"
 *   startDateTime={eventStart}
 *   endDateTime={eventEnd}
 *   onChange={(start, end) => {
 *     setEventStart(start);
 *     setEventEnd(end);
 *   }}
 *   lang="ko"
 * />
 * ```
 */
export default function DateTimeRangePicker({
  label,
  startDateTime,
  endDateTime,
  onChange,
  onEnter,
  disabled = false,
  startLabel = 'Start',
  endLabel = 'End',
  helperText,
  lang = 'en'
}: DateTimeRangePickerProps) {
  const toDayjs = (datetimeStr: string): Dayjs | null => {
    if (!datetimeStr) return null;
    return dayjs(datetimeStr);
  };

  const toDateTimeString = (date: Dayjs | null): string => {
    if (!date || !date.isValid()) return '';
    return date.format('YYYY-MM-DDTHH:mm:ss');
  };

  const handleStartChange = (value: Dayjs | null) => {
    const datetimeValue = toDateTimeString(value);
    onChange(datetimeValue, endDateTime);
  };

  const handleEndChange = (value: Dayjs | null) => {
    const datetimeValue = toDateTimeString(value);
    onChange(startDateTime, datetimeValue);
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
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'nowrap' }}>
          <DateTimePicker
            label={startLabel}
            value={toDayjs(startDateTime)}
            onChange={handleStartChange}
            disabled={disabled}
            format="YYYY-MM-DD HH:mm"
            ampm={false}
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
                    borderRadius: '8px',
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
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '1rem',
              fontWeight: 400,
              px: 0.5,
              lineHeight: '40px',
            }}
          >
            ~
          </Typography>
          <DateTimePicker
            label={endLabel}
            value={toDayjs(endDateTime)}
            onChange={handleEndChange}
            disabled={disabled}
            format="YYYY-MM-DD HH:mm"
            ampm={false}
            minDateTime={toDayjs(startDateTime)}
            slotProps={{
              textField: {
                size: 'small',
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
                    borderRadius: '8px',
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
      </Box>
    </LocalizationProvider>
  );
}
