'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import YearPicker from '@/components/common/YearPicker';
import dayjs, { Dayjs } from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';

dayjs.extend(isLeapYear);

export default function YearPickerDemoPage() {
  const [year1, setYear1] = useState<Dayjs | null>(null);
  const [year2, setYear2] = useState<Dayjs | null>(dayjs());
  const [year3, setYear3] = useState<Dayjs | null>(dayjs().year(2020));

  return (
    <PageContainer
      title="Year Picker"
      description="Select year only"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a year only
          </Typography>

          <YearPicker
            value={year1}
            onChange={setYear1}
            label="Select Year"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={year1 ? year1.format('YYYY') : 'Not selected'}
              color={year1 ? 'primary' : 'default'}
            />
          </Box>
        </Paper>

        {/* With Default Value (Current Year) */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Default Value (Current Year)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-populated with current year
          </Typography>

          <YearPicker
            value={year2}
            onChange={setYear2}
            label="Fiscal Year"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected:
            </Typography>
            <Chip
              label={year2 ? year2.format('YYYY') : 'Not selected'}
              color="primary"
            />
            {year2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {year2.year() === dayjs().year() ? 'Current year' : `${Math.abs(dayjs().year() - year2.year())} years ${year2.year() > dayjs().year() ? 'from now' : 'ago'}`}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Historical Year Selection */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Historical Year Selection
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a year from the past
          </Typography>

          <YearPicker
            value={year3}
            onChange={setYear3}
            label="Birth Year"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Year Information:
            </Typography>
            {year3 ? (
              <Stack spacing={1}>
                <Chip label={`Year: ${year3.format('YYYY')}`} variant="outlined" />
                <Chip label={`Decade: ${Math.floor(year3.year() / 10) * 10}s`} variant="outlined" />
                <Chip label={`Century: ${Math.ceil(year3.year() / 100)}${['st', 'nd', 'rd'][((Math.ceil(year3.year() / 100) - 20) % 10) - 1] || 'th'} century`} variant="outlined" />
                <Chip label={`Years ago: ${dayjs().year() - year3.year()}`} variant="outlined" />
                <Chip label={`Leap year: ${year3.isLeapYear() ? 'Yes' : 'No'}`} variant="outlined" />
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
              {`import YearPicker from '@/components/common/YearPicker';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>value</code>: Dayjs | null - The selected year value</li>
            <li><code>onChange</code>: (value: Dayjs | null) =&gt; void - Change handler</li>
            <li><code>label</code>: string - Label for the picker</li>
            <li><code>error</code>: boolean - Error state (optional)</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
            <li><code>minDate</code>: Dayjs - Minimum allowed year (optional)</li>
            <li><code>maxDate</code>: Dayjs - Maximum allowed year (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Format:</strong> YYYY
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Birth year selection</li>
            <li>Fiscal year planning</li>
            <li>Historical data filtering</li>
            <li>Annual report year selection</li>
            <li>Graduation year or anniversary year</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
