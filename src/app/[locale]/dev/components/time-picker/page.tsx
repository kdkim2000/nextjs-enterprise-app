'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import TimePicker from '@/components/common/TimePicker';
import dayjs, { Dayjs } from 'dayjs';

export default function TimePickerDemoPage() {
  const [time1, setTime1] = useState<Dayjs | null>(null);
  const [time2, setTime2] = useState<Dayjs | null>(dayjs().hour(9).minute(0).second(0));
  const [time3, setTime3] = useState<Dayjs | null>(dayjs());

  return (
    <PageContainer
      title="Time Picker"
      description="Select time with hour and minute"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a time (24-hour format)
          </Typography>

          <TimePicker
            value={time1}
            onChange={setTime1}
            label="Select Time"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={time1 ? time1.format('HH:mm:ss') : 'Not selected'}
              color={time1 ? 'primary' : 'default'}
            />
          </Box>
        </Paper>

        {/* With Default Value */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Default Value (9:00 AM)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-populated with 09:00:00
          </Typography>

          <TimePicker
            value={time2}
            onChange={setTime2}
            label="Meeting Time"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={time2 ? time2.format('HH:mm:ss') : 'Not selected'}
              color="primary"
            />
          </Box>
        </Paper>

        {/* Different Format Display */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Different Time Formats
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display time in various formats
          </Typography>

          <TimePicker
            value={time3}
            onChange={setTime3}
            label="Current Time"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Time in Different Formats:
            </Typography>
            {time3 ? (
              <Stack spacing={1}>
                <Chip label={`24-hour: ${time3.format('HH:mm:ss')}`} variant="outlined" />
                <Chip label={`12-hour: ${time3.format('hh:mm:ss A')}`} variant="outlined" />
                <Chip label={`Short: ${time3.format('HH:mm')}`} variant="outlined" />
                <Chip label={`Seconds since midnight: ${time3.hour() * 3600 + time3.minute() * 60 + time3.second()}`} variant="outlined" />
              </Stack>
            ) : (
              <Chip label="Not selected" color="default" />
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
              {`import TimePicker from '@/components/common/TimePicker';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>value</code>: Dayjs | null - The selected time value</li>
            <li><code>onChange</code>: (value: Dayjs | null) =&gt; void - Change handler</li>
            <li><code>label</code>: string - Label for the picker</li>
            <li><code>error</code>: boolean - Error state (optional)</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
            <li><code>minTime</code>: Dayjs - Minimum allowed time (optional)</li>
            <li><code>maxTime</code>: Dayjs - Maximum allowed time (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Format:</strong> HH:mm:ss (24-hour format)
          </Typography>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
