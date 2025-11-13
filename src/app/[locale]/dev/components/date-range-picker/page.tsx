'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import DateRangePicker from '@/components/common/DateRangePicker';
import dayjs from 'dayjs';

export default function DateRangePickerDemoPage() {
  const [startDate1, setStartDate1] = useState('');
  const [endDate1, setEndDate1] = useState('');

  const [startDate2, setStartDate2] = useState(dayjs().startOf('month').format('YYYY-MM-DDTHH:mm:ss'));
  const [endDate2, setEndDate2] = useState(dayjs().endOf('month').format('YYYY-MM-DDTHH:mm:ss'));

  const [startDate3, setStartDate3] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DDTHH:mm:ss'));
  const [endDate3, setEndDate3] = useState(dayjs().format('YYYY-MM-DDTHH:mm:ss'));

  return (
    <PageContainer
      title="Date Range Picker"
      description="Select date ranges with calendar interface"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a date range with automatic time setting (00:00:00 ~ 23:59:59)
          </Typography>

          <DateRangePicker
            label="Date Range"
            startDate={startDate1}
            endDate={endDate1}
            onChange={(start, end) => {
              setStartDate1(start);
              setEndDate1(end);
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
                label={startDate1 ? dayjs(startDate1).format('YYYY-MM-DD HH:mm:ss') : 'Not selected'}
                color={startDate1 ? 'primary' : 'default'}
              />
              <Typography sx={{ alignSelf: 'center' }}>~</Typography>
              <Chip
                label={endDate1 ? dayjs(endDate1).format('YYYY-MM-DD HH:mm:ss') : 'Not selected'}
                color={endDate1 ? 'primary' : 'default'}
              />
            </Stack>
          </Box>
        </Paper>

        {/* With Default Values (Current Month) */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Default Values (Current Month)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-populated with start and end of current month
          </Typography>

          <DateRangePicker
            label="Report Period"
            startDate={startDate2}
            endDate={endDate2}
            onChange={(start, end) => {
              setStartDate2(start);
              setEndDate2(end);
            }}
            startLabel="Start Date"
            endLabel="End Date"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Range:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={dayjs(startDate2).format('YYYY-MM-DD HH:mm:ss')}
                color="primary"
              />
              <Typography sx={{ alignSelf: 'center' }}>~</Typography>
              <Chip
                label={dayjs(endDate2).format('YYYY-MM-DD HH:mm:ss')}
                color="primary"
              />
            </Stack>
            {startDate2 && endDate2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Duration: {dayjs(endDate2).diff(dayjs(startDate2), 'day') + 1} days
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Last 7 Days */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Last 7 Days Range
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-populated with last 7 days (common use case)
          </Typography>

          <DateRangePicker
            label="Search Period"
            startDate={startDate3}
            endDate={endDate3}
            onChange={(start, end) => {
              setStartDate3(start);
              setEndDate3(end);
            }}
            startLabel="From"
            endLabel="To"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Range Information:
            </Typography>
            <Stack spacing={1}>
              <Chip
                label={`Start: ${dayjs(startDate3).format('YYYY-MM-DD HH:mm:ss')}`}
                variant="outlined"
              />
              <Chip
                label={`End: ${dayjs(endDate3).format('YYYY-MM-DD HH:mm:ss')}`}
                variant="outlined"
              />
              <Chip
                label={`Duration: ${dayjs(endDate3).diff(dayjs(startDate3), 'day') + 1} days`}
                variant="outlined"
              />
              <Chip
                label={`Hours: ${dayjs(endDate3).diff(dayjs(startDate3), 'hour')} hours`}
                variant="outlined"
              />
            </Stack>
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
              {`import DateRangePicker from '@/components/common/DateRangePicker';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>label</code>: string - Label above the pickers (optional)</li>
            <li><code>startDate</code>: string - Start date value (ISO format)</li>
            <li><code>endDate</code>: string - End date value (ISO format)</li>
            <li><code>onChange</code>: (startDate: string, endDate: string) =&gt; void - Change handler</li>
            <li><code>startLabel</code>: string - Label for start picker (default: "Start Date")</li>
            <li><code>endLabel</code>: string - Label for end picker (default: "End Date")</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
            <li><code>dateOnly</code>: boolean - If true, time is auto-set (00:00:00 ~ 23:59:59). Default: true</li>
            <li><code>lang</code>: string - Language code ('en', 'ko'). Default: 'en'</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>onEnter</code>: () =&gt; void - Enter key handler (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Date Format:</strong> YYYY-MM-DDTHH:mm:ss (ISO 8601)
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Google-style modern design with smooth animations</li>
            <li>Automatic time setting in dateOnly mode (default)</li>
            <li>End date min constraint based on start date</li>
            <li>Multi-language support (en, ko)</li>
            <li>Enter key support for quick submission</li>
            <li>Accessible and keyboard-friendly</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Search filters with date range</li>
            <li>Report generation periods</li>
            <li>Event scheduling date ranges</li>
            <li>Data analysis time windows</li>
            <li>Booking or reservation periods</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
