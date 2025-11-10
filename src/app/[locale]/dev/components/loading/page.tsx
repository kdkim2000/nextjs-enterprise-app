'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Grid, Button } from '@mui/material';
import Loading, { LoadingSpinner, LoadingBar, LoadingSkeleton, LoadingOverlay } from '@/components/common/Loading';

export default function LoadingDemo() {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Loading Component</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        다양한 형태의 로딩 인디케이터를 제공하는 컴포넌트입니다.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Circular Loading</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <LoadingSpinner size="small" />
              <LoadingSpinner size="medium" text="Loading..." />
              <LoadingSpinner size="large" value={65} text="Uploading" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Linear Progress</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <LoadingBar />
              <LoadingBar value={45} text="45% complete" />
              <LoadingBar value={80} color="success" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Skeleton</Typography>
            <LoadingSkeleton lines={4} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, position: 'relative', minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>Overlay</Typography>
            <Typography>Content behind overlay</Typography>
            <Button onClick={() => setShowOverlay(!showOverlay)} sx={{ mt: 2 }}>
              Toggle Overlay
            </Button>
            {showOverlay && <LoadingOverlay text="Processing..." />}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>Usage</Typography>
        <Box component="pre" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, overflow: 'auto' }}>
{`import Loading from '@/components/common/Loading';

<Loading type="circular" size="medium" text="Loading..." />
<Loading type="linear" value={50} />
<Loading type="skeleton" lines={3} />
<Loading type="overlay" fullscreen />`}
        </Box>
      </Paper>
    </Box>
  );
}
