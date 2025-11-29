'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Alert } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import { formatDate, formatRelativeTime, formatDuration, DateFormatStyle } from '@/lib/utils/date';

export default function DateUtilsDemoPage() {
  const [customDate, setCustomDate] = useState('2024-11-29T10:30:00');
  const [locale, setLocale] = useState('ko-KR');
  const [style, setStyle] = useState<DateFormatStyle>('medium');

  const sampleDates = [
    new Date().toISOString(),
    new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days ago
    '2024-01-15T14:30:00Z',
    '2023-06-20T09:00:00Z'
  ];

  const durations = [15, 30, 45, 60, 90, 120, 180, 240];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Date Utilities
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Utility functions for formatting dates, relative times, and durations.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          날짜, 상대 시간, 기간을 포맷팅하기 위한 유틸리티 함수들입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* formatDate */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            formatDate
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Formats a date string or Date object to a localized string with various styles.
          </Typography>

          {/* Interactive Demo */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Date"
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Locale</InputLabel>
              <Select value={locale} label="Locale" onChange={(e) => setLocale(e.target.value)}>
                <MenuItem value="ko-KR">ko-KR</MenuItem>
                <MenuItem value="en-US">en-US</MenuItem>
                <MenuItem value="ja-JP">ja-JP</MenuItem>
                <MenuItem value="zh-CN">zh-CN</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Style</InputLabel>
              <Select
                value={style}
                label="Style"
                onChange={(e) => setStyle(e.target.value as DateFormatStyle)}
              >
                <MenuItem value="short">short</MenuItem>
                <MenuItem value="medium">medium</MenuItem>
                <MenuItem value="long">long</MenuItem>
                <MenuItem value="full">full</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Result:</strong> {formatDate(customDate, { locale, style })}
            </Typography>
            <Typography variant="body2">
              <strong>With Time:</strong> {formatDate(customDate, { locale, style, includeTime: true })}
            </Typography>
          </Alert>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Style Examples
          </Typography>
          <Box sx={{ mb: 3 }}>
            {(['short', 'medium', 'long', 'full'] as const).map((s) => (
              <Box key={s} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                <Chip label={s} size="small" sx={{ minWidth: 70 }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {formatDate('2024-11-29T10:30:00', { style: s })}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import { formatDate } from '@/lib/utils/date';

// Basic usage
formatDate('2024-11-29'); // '2024. 11. 29.'

// With options
formatDate('2024-11-29', { locale: 'en-US' }); // 'Nov 29, 2024'
formatDate('2024-11-29', { style: 'long' }); // '2024년 11월 29일'
formatDate('2024-11-29', { style: 'full' }); // '2024년 11월 29일 금요일'
formatDate('2024-11-29T10:30:00', { includeTime: true }); // '2024. 11. 29. 오전 10:30'

// Handles null/undefined safely
formatDate(null); // ''
formatDate(undefined); // ''`}
          </Box>
        </Paper>

        {/* formatRelativeTime */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            formatRelativeTime
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Formats a date to relative time (e.g., &quot;2 hours ago&quot;, &quot;3 days ago&quot;). Falls back to formatted date for times older than 30 days.
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Live Examples
          </Typography>
          <Box sx={{ mb: 3 }}>
            {sampleDates.map((date, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 1,
                  alignItems: 'center',
                  py: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'grey.100'
                }}
              >
                <Typography variant="caption" sx={{ minWidth: 180, fontFamily: 'monospace', color: 'grey.600' }}>
                  {date.substring(0, 19)}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatRelativeTime(date)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import { formatRelativeTime } from '@/lib/utils/date';

// Recent times
formatRelativeTime(new Date(Date.now() - 5000)); // '5초 전'
formatRelativeTime(new Date(Date.now() - 60000)); // '1분 전'
formatRelativeTime(new Date(Date.now() - 3600000)); // '1시간 전'
formatRelativeTime(new Date(Date.now() - 86400000)); // '어제'

// Older than 30 days: falls back to formatted date
formatRelativeTime('2024-01-15'); // '2024. 1. 15.'

// Custom locale
formatRelativeTime(new Date(), 'en-US'); // uses English

// Handles null/undefined safely
formatRelativeTime(null); // ''`}
          </Box>
        </Paper>

        {/* formatDuration */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            formatDuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Formats duration in minutes to a readable string (e.g., &quot;1h 30m&quot;, &quot;45m&quot;).
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Examples
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {durations.map((min) => (
              <Box
                key={min}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  minWidth: 80
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {min} min
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDuration(min)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import { formatDuration } from '@/lib/utils/date';

formatDuration(15);  // '15m'
formatDuration(45);  // '45m'
formatDuration(60);  // '1h'
formatDuration(90);  // '1h 30m'
formatDuration(120); // '2h'
formatDuration(180); // '3h'

// Handles null/undefined/zero safely
formatDuration(null); // ''
formatDuration(0);    // ''`}
          </Box>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mb: 3
            }}
          >
            {`import {
  formatDate,
  formatRelativeTime,
  formatDuration,
  DateFormatStyle
} from '@/lib/utils/date';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            formatDate(date, options?)
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>date</code>: string | Date | null | undefined - Date to format
            </li>
            <li>
              <code>options.locale</code>: string - Locale string (default: &apos;ko-KR&apos;)
            </li>
            <li>
              <code>options.style</code>: &apos;short&apos; | &apos;medium&apos; | &apos;long&apos; | &apos;full&apos; - Format style (default: &apos;medium&apos;)
            </li>
            <li>
              <code>options.includeTime</code>: boolean - Include time in output (default: false)
            </li>
            <li>
              <strong>Returns:</strong> string - Formatted date string
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            formatRelativeTime(date, locale?)
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>date</code>: string | Date | null | undefined - Date to format
            </li>
            <li>
              <code>locale</code>: string - Locale string (default: &apos;ko-KR&apos;)
            </li>
            <li>
              <strong>Returns:</strong> string - Relative time string or formatted date if &gt; 30 days
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            formatDuration(minutes)
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>minutes</code>: number | null | undefined - Duration in minutes
            </li>
            <li>
              <strong>Returns:</strong> string - Formatted duration (e.g., &apos;1h 30m&apos;)
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            DateFormatStyle (Type)
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>&apos;short&apos;</code> - Numeric format (2024. 11. 29.)
            </li>
            <li>
              <code>&apos;medium&apos;</code> - Short month name (2024년 11월 29일)
            </li>
            <li>
              <code>&apos;long&apos;</code> - Long month name (2024년 11월 29일)
            </li>
            <li>
              <code>&apos;full&apos;</code> - Full format with weekday (2024년 11월 29일 금요일)
            </li>
          </Box>
        </Paper>

        {/* Best Practices */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Best Practices
          </Typography>
          <Box component="ul">
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Use <code>formatDate</code> for displaying fixed dates (created_at, updated_at, etc.)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Use <code>formatRelativeTime</code> for recent activity timestamps (comments, messages, etc.)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Use <code>formatDuration</code> for displaying time spans (session duration, reading time, etc.)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                All functions handle null/undefined gracefully, returning empty strings
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Consider user locale when displaying dates in multilingual applications
              </Typography>
            </li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
