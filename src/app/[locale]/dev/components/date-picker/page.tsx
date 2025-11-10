'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import DatePicker from '@/components/common/DatePicker';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(relativeTime);
dayjs.extend(dayOfYear);
dayjs.extend(weekOfYear);

export default function DatePickerDemoPage() {
  const [date1, setDate1] = useState<string>('');
  const [date2, setDate2] = useState<string>(dayjs().format('YYYY-MM-DD') + 'T00:00:00');
  const [date3, setDate3] = useState<string>(dayjs().add(7, 'day').format('YYYY-MM-DD') + 'T00:00:00');

  return (
    <PageContainer
      title="Date Picker"
      description="Single date selection with calendar interface"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a single date from the calendar
          </Typography>

          <DatePicker
            value={date1}
            onChange={setDate1}
            label="Select Date"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={date1 ? date1.split('T')[0] : 'Not selected'}
              color={date1 ? 'primary' : 'default'}
            />
          </Box>
        </Paper>

        {/* With Default Value (Today) */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Default Value (Today)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-populated with today's date
          </Typography>

          <DatePicker
            value={date2}
            onChange={setDate2}
            label="Delivery Date"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={date2 ? date2.split('T')[0] : 'Not selected'}
              color="primary"
            />
            {date2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {dayjs(date2).format('dddd, MMMM D, YYYY')}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Different Format Display */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Different Date Formats
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display date in various formats (default: 7 days from today)
          </Typography>

          <DatePicker
            value={date3}
            onChange={setDate3}
            label="Deadline"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Date in Different Formats:
            </Typography>
            {date3 ? (
              <Stack spacing={1}>
                <Chip label={`ISO: ${date3.split('T')[0]}`} variant="outlined" />
                <Chip label={`Long: ${dayjs(date3).format('dddd, MMMM D, YYYY')}`} variant="outlined" />
                <Chip label={`Short: ${dayjs(date3).format('MM/DD/YYYY')}`} variant="outlined" />
                <Chip label={`Relative: ${dayjs(date3).fromNow()}`} variant="outlined" />
                <Chip label={`Day of year: ${dayjs(date3).dayOfYear()}`} variant="outlined" />
                <Chip label={`Week number: Week ${dayjs(date3).week()}`} variant="outlined" />
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
              {`import DatePicker from '@/components/common/DatePicker';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>value</code>: string - The selected date value (format: YYYY-MM-DDTHH:mm:ss)</li>
            <li><code>onChange</code>: (value: string) =&gt; void - Change handler</li>
            <li><code>label</code>: string - Label for the picker (optional)</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
            <li><code>dateOnly</code>: boolean - Date only mode (default: true)</li>
            <li><code>lang</code>: string - Language code (default: 'en')</li>
            <li><code>minDate</code>: string - Minimum allowed date (optional)</li>
            <li><code>maxDate</code>: string - Maximum allowed date (optional)</li>
            <li><code>onEnter</code>: () =&gt; void - Enter key handler (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Format:</strong> YYYY-MM-DD
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Birthday or anniversary selection</li>
            <li>Appointment scheduling</li>
            <li>Deadline or due date setting</li>
            <li>Event date selection</li>
            <li>Filter by date in reports</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
