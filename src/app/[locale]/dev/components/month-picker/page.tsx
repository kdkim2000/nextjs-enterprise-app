'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import MonthPicker from '@/components/common/MonthPicker';
import dayjs, { Dayjs } from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(quarterOfYear);
dayjs.extend(localizedFormat);

export default function MonthPickerDemoPage() {
  const [month1, setMonth1] = useState<Dayjs | null>(null);
  const [month2, setMonth2] = useState<Dayjs | null>(dayjs());
  const [month3, setMonth3] = useState<Dayjs | null>(dayjs().subtract(1, 'month'));

  return (
    <PageContainer
      title="Month Picker"
      description="Select year and month"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a year and month
          </Typography>

          <MonthPicker
            value={month1}
            onChange={setMonth1}
            label="Select Month"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={month1 ? month1.format('YYYY-MM') : 'Not selected'}
              color={month1 ? 'primary' : 'default'}
            />
          </Box>
        </Paper>

        {/* With Default Value (Current Month) */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Default Value (Current Month)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-populated with current month
          </Typography>

          <MonthPicker
            value={month2}
            onChange={setMonth2}
            label="Report Month"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={month2 ? month2.format('YYYY-MM') : 'Not selected'}
              color="primary"
            />
            {month2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {month2.format('MMMM YYYY')}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Different Format Display */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Different Month Formats
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display month in various formats
          </Typography>

          <MonthPicker
            value={month3}
            onChange={setMonth3}
            label="Billing Period"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Month in Different Formats:
            </Typography>
            {month3 ? (
              <Stack spacing={1}>
                <Chip label={`Standard: ${month3.format('YYYY-MM')}`} variant="outlined" />
                <Chip label={`Long: ${month3.format('MMMM YYYY')}`} variant="outlined" />
                <Chip label={`Short: ${month3.format('MMM YY')}`} variant="outlined" />
                <Chip label={`Localized: ${month3.format('LL').substring(0, month3.format('LL').lastIndexOf(' '))}`} variant="outlined" />
                <Chip label={`Quarter: Q${month3.quarter()} ${month3.year()}`} variant="outlined" />
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
              {`import MonthPicker from '@/components/common/MonthPicker';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>value</code>: Dayjs | null - The selected month value</li>
            <li><code>onChange</code>: (value: Dayjs | null) =&gt; void - Change handler</li>
            <li><code>label</code>: string - Label for the picker</li>
            <li><code>error</code>: boolean - Error state (optional)</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
            <li><code>minDate</code>: Dayjs - Minimum allowed month (optional)</li>
            <li><code>maxDate</code>: Dayjs - Maximum allowed month (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Format:</strong> YYYY-MM
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Monthly reports and billing periods</li>
            <li>Subscription start/end months</li>
            <li>Financial quarter selection</li>
            <li>Project timeline planning</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
