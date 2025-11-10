'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import DateTimeRangePicker from '@/components/common/DateTimeRangePicker';
import dayjs from 'dayjs';

export default function DateTimeRangePickerDemoPage() {
  const [startDateTime, setStartDateTime] = useState<string>('');
  const [endDateTime, setEndDateTime] = useState<string>('');

  const [startDateTime2, setStartDateTime2] = useState<string>(dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss'));
  const [endDateTime2, setEndDateTime2] = useState<string>(dayjs().endOf('day').format('YYYY-MM-DDTHH:mm:ss'));

  return (
    <PageContainer
      title="DateTime Range Picker"
      description="Select date and time ranges"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a start and end date with time
          </Typography>

          <DateTimeRangePicker
            startDateTime={startDateTime}
            endDateTime={endDateTime}
            onChange={(start, end) => {
              setStartDateTime(start);
              setEndDateTime(end);
            }}
            startLabel="Start Date & Time"
            endLabel="End Date & Time"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Range:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={startDateTime ? startDateTime.replace('T', ' ') : 'Not selected'}
                color={startDateTime ? 'primary' : 'default'}
              />
              <Typography sx={{ alignSelf: 'center' }}>~</Typography>
              <Chip
                label={endDateTime ? endDateTime.replace('T', ' ') : 'Not selected'}
                color={endDateTime ? 'primary' : 'default'}
              />
            </Stack>
          </Box>
        </Paper>

        {/* With Default Values */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Default Values
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-populated with today's start and end times
          </Typography>

          <DateTimeRangePicker
            startDateTime={startDateTime2}
            endDateTime={endDateTime2}
            onChange={(start, end) => {
              setStartDateTime2(start);
              setEndDateTime2(end);
            }}
            startLabel="From"
            endLabel="To"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Range:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={startDateTime2 ? startDateTime2.replace('T', ' ') : 'Not selected'}
                color="primary"
              />
              <Typography sx={{ alignSelf: 'center' }}>~</Typography>
              <Chip
                label={endDateTime2 ? endDateTime2.replace('T', ' ') : 'Not selected'}
                color="primary"
              />
            </Stack>
            {startDateTime2 && endDateTime2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Duration: {dayjs(endDateTime2).diff(dayjs(startDateTime2), 'hour')} hours
              </Typography>
            )}
          </Box>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Import:</strong>
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                mt: 1,
              }}
            >
              {`import DateTimeRangePicker from '@/components/common/DateTimeRangePicker';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>startDateTime</code>: string - Start date and time value (format: YYYY-MM-DDTHH:mm:ss)</li>
            <li><code>endDateTime</code>: string - End date and time value (format: YYYY-MM-DDTHH:mm:ss)</li>
            <li><code>onChange</code>: (startDateTime: string, endDateTime: string) =&gt; void - Change handler for both values</li>
            <li><code>label</code>: string - Label for the range picker (optional)</li>
            <li><code>startLabel</code>: string - Label for start picker (optional)</li>
            <li><code>endLabel</code>: string - Label for end picker (optional)</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
            <li><code>lang</code>: string - Language code (default: 'en')</li>
            <li><code>onEnter</code>: () =&gt; void - Enter key handler (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Format:</strong> YYYY-MM-DDTHH:mm:ss
          </Typography>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
