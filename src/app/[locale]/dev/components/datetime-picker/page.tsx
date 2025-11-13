'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import DateTimePicker from '@/components/common/DateTimePicker';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

export default function DateTimePickerDemoPage() {
  const [dateTime1, setDateTime1] = useState<string>('');
  const [dateTime2, setDateTime2] = useState<string>(dayjs().format('YYYY-MM-DDTHH:mm:ss'));
  const [dateTime3, setDateTime3] = useState<string>('');

  return (
    <PageContainer
      title="DateTime Picker"
      description="Select date and time combined"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a date and time together
          </Typography>

          <DateTimePicker
            value={dateTime1}
            onChange={setDateTime1}
            label="Select Date & Time"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={dateTime1 ? dateTime1.replace('T', ' ') : 'Not selected'}
              color={dateTime1 ? 'primary' : 'default'}
            />
          </Box>
        </Paper>

        {/* With Default Value */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Default Value
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-populated with current date and time
          </Typography>

          <DateTimePicker
            value={dateTime2}
            onChange={setDateTime2}
            label="Appointment Time"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={dateTime2 ? dateTime2.replace('T', ' ') : 'Not selected'}
              color="primary"
            />
            {dateTime2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {dayjs(dateTime2).isBefore(dayjs()) ? 'Past date' : 'Future date'}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Different Format Display */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Format Display
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display selected datetime in various formats
          </Typography>

          <DateTimePicker
            value={dateTime3}
            onChange={setDateTime3}
            label="Event Date & Time"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Datetime in Different Formats:
            </Typography>
            {dateTime3 ? (
              <Stack spacing={1}>
                <Chip label={`ISO: ${dayjs(dateTime3).toISOString()}`} variant="outlined" />
                <Chip label={`Long: ${dayjs(dateTime3).format('LLLL')}`} variant="outlined" />
                <Chip label={`Short: ${dayjs(dateTime3).format('L LT')}`} variant="outlined" />
                <Chip label={`Custom: ${dayjs(dateTime3).format('MMM DD, YYYY [at] hh:mm A')}`} variant="outlined" />
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
              {`import DateTimePicker from '@/components/common/DateTimePicker';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>value</code>: string - The selected datetime value (format: YYYY-MM-DDTHH:mm:ss)</li>
            <li><code>onChange</code>: (value: string) =&gt; void - Change handler</li>
            <li><code>label</code>: string - Label for the picker (optional)</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
            <li><code>lang</code>: string - Language code (default: 'en')</li>
            <li><code>minDateTime</code>: string - Minimum allowed datetime (optional)</li>
            <li><code>maxDateTime</code>: string - Maximum allowed datetime (optional)</li>
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
