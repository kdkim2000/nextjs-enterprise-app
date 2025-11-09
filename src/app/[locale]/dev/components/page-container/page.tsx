'use client';

import { Box, Typography, Paper, Stack } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';

export default function PageContainerDemoPage() {
  return (
    <PageContainer>
      <Stack spacing={4}>
        <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
          <Typography variant="h5" gutterBottom>
            Page Container
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Layout wrapper providing consistent page structure. This demo page uses PageContainer!
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`<PageContainer>
  <YourPageContent />
</PageContainer>`}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Typography variant="body2" component="div">
            <strong>Import:</strong>
            <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 1 }}>
              {`import PageContainer from '@/components/common/PageContainer';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>children</code>: React.ReactNode - Page content (required)</li>
            <li><code>fullHeight</code>: boolean - Fill viewport height (default: true)</li>
            <li><code>noPadding</code>: boolean - Remove horizontal padding (default: true)</li>
            <li><code>maxWidth</code>: false | xs | sm | md | lg | xl - Max width (default: false)</li>
            <li><code>sx</code>: SxProps - Custom styles (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Examples:</strong>
          </Typography>
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 1, fontSize: '0.875rem' }}>
            {`// Full-width (default)
<PageContainer>
  <Content />
</PageContainer>

// With max-width
<PageContainer maxWidth="lg">
  <Content />
</PageContainer>

// With padding
<PageContainer noPadding={false}>
  <Content />
</PageContainer>`}
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
