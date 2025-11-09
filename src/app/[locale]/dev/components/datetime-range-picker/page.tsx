'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import DateTimeRangePicker from '@/components/common/DateTimeRangePicker';
import dayjs, { Dayjs } from 'dayjs';

export default function DateTimeRangePickerDemoPage() {
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(null);
  const [endDateTime, setEndDateTime] = useState<Dayjs | null>(null);

  const [startDateTime2, setStartDateTime2] = useState<Dayjs | null>(dayjs().startOf('day'));
  const [endDateTime2, setEndDateTime2] = useState<Dayjs | null>(dayjs().endOf('day'));

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
            onStartChange={setStartDateTime}
            onEndChange={setEndDateTime}
            startLabel="Start Date & Time"
            endLabel="End Date & Time"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Range:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={startDateTime ? startDateTime.format('YYYY-MM-DD HH:mm:ss') : 'Not selected'}
                color={startDateTime ? 'primary' : 'default'}
              />
              <Typography sx={{ alignSelf: 'center' }}>~</Typography>
              <Chip
                label={endDateTime ? endDateTime.format('YYYY-MM-DD HH:mm:ss') : 'Not selected'}
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
            onStartChange={setStartDateTime2}
            onEndChange={setEndDateTime2}
            startLabel="From"
            endLabel="To"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Range:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={startDateTime2 ? startDateTime2.format('YYYY-MM-DD HH:mm:ss') : 'Not selected'}
                color="primary"
              />
              <Typography sx={{ alignSelf: 'center' }}>~</Typography>
              <Chip
                label={endDateTime2 ? endDateTime2.format('YYYY-MM-DD HH:mm:ss') : 'Not selected'}
                color="primary"
              />
            </Stack>
            {startDateTime2 && endDateTime2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Duration: {endDateTime2.diff(startDateTime2, 'hour')} hours
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
            <li><code>startDateTime</code>: Dayjs | null - Start date and time value</li>
            <li><code>endDateTime</code>: Dayjs | null - End date and time value</li>
            <li><code>onStartChange</code>: (value: Dayjs | null) =&gt; void - Start change handler</li>
            <li><code>onEndChange</code>: (value: Dayjs | null) =&gt; void - End change handler</li>
            <li><code>startLabel</code>: string - Label for start picker</li>
            <li><code>endLabel</code>: string - Label for end picker</li>
            <li><code>error</code>: boolean - Error state (optional)</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
