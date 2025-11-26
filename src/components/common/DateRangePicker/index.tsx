'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  label?: string;
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  startLabel?: string;
  endLabel?: string;
  gridSize?: { xs?: number; sm?: number; md?: number };
  helperText?: string;
  /**
   * If true, uses date type (YYYY-MM-DD) and automatically adds time.
   * Start date: 00:00:00, End date: 23:59:59
   * If false, uses datetime-local type for full datetime control.
   * Default: true
   */
  dateOnly?: boolean;
  /**
   * Language code for date picker (e.g., 'en', 'ko')
   * Default: 'en'
   */
  lang?: string;
}

/**
 * Reusable date range picker component with modern Google-style design
 * Uses MUI DatePicker for full customization and language support
 *
 * By default (dateOnly=true), only date is selected and time is automatically set:
 * - Start date: 00:00:00
 * - End date: 23:59:59
 *
 * @example
 * ```tsx
 * // Date only mode (default) - common use case
 * <DateRangePicker
 *   label="Search Period"
 *   startDate={criteria.startDate}
 *   endDate={criteria.endDate}
 *   onChange={(start, end) => {
 *     setCriteria({ ...criteria, startDate: start, endDate: end });
 *   }}
 * />
 *
 * // With Korean language
 * <DateRangePicker
 *   label="검색 기간"
 *   startDate={criteria.startDate}
 *   endDate={criteria.endDate}
 *   onChange={(start, end) => {
 *     setCriteria({ ...criteria, startDate: start, endDate: end });
 *   }}
 *   lang="ko"
 * />
 * ```
 */
export default function DateRangePicker({
  label,
  startDate,
  endDate,
  onChange,
  onEnter,
  disabled = false,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  helperText,
  dateOnly = true,
  lang = 'en'
}: DateRangePickerProps) {
  /**
   * Converts datetime string to Dayjs object
   */
  const toDayjs = (datetimeStr: string): Dayjs | null => {
    if (!datetimeStr) return null;
    return dayjs(datetimeStr);
  };

  /**
   * Converts Dayjs object to datetime string with time
   */
  const toDateTimeString = (date: Dayjs | null, isEndDate: boolean): string => {
    if (!date || !date.isValid()) return '';
    if (dateOnly) {
      const time = isEndDate ? '23:59:59' : '00:00:00';
      return date.format('YYYY-MM-DD') + 'T' + time;
    }
    return date.toISOString();
  };

  const handleStartDateChange = (value: Dayjs | null) => {
    const datetimeValue = toDateTimeString(value, false);
    onChange(datetimeValue, endDate);
  };

  const handleEndDateChange = (value: Dayjs | null) => {
    const datetimeValue = toDateTimeString(value, true);
    onChange(startDate, datetimeValue);
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
          <DatePicker
            label={startLabel}
            value={toDayjs(startDate)}
            onChange={(newValue) => handleStartDateChange(newValue as Dayjs | null)}
            disabled={disabled}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                helperText: helperText,
                onKeyDown: handleKeyDown,
                sx: {
                  width: '165px',
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
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    fontWeight: 400,
                  },
                  '& .MuiIconButton-root': {
                    padding: '6px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
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
                  '& .MuiPickersCalendarHeader-root': {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    marginTop: '8px',
                  },
                  '& .MuiPickersCalendarHeader-label': {
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  },
                  '& .MuiDayCalendar-header': {
                    gap: '4px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    width: '36px',
                    height: '36px',
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
                  '& .MuiDayCalendar-monthContainer': {
                    gap: '2px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                  },
                  '& .MuiPickersYear-yearButton': {
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
          <DatePicker
            label={endLabel}
            value={toDayjs(endDate)}
            onChange={(newValue) => handleEndDateChange(newValue as Dayjs | null)}
            disabled={disabled}
            format="YYYY-MM-DD"
            minDate={toDayjs(startDate) || undefined}
            slotProps={{
              textField: {
                size: 'small',
                onKeyDown: handleKeyDown,
                sx: {
                  width: '165px',
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
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    fontWeight: 400,
                  },
                  '& .MuiIconButton-root': {
                    padding: '6px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
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
                  '& .MuiPickersCalendarHeader-root': {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    marginTop: '8px',
                  },
                  '& .MuiPickersCalendarHeader-label': {
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  },
                  '& .MuiDayCalendar-header': {
                    gap: '4px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    width: '36px',
                    height: '36px',
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
                  '& .MuiDayCalendar-monthContainer': {
                    gap: '2px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                  },
                  '& .MuiPickersYear-yearButton': {
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
      </Box>
    </LocalizationProvider>
  );
}
