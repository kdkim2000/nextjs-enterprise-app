'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Button,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Backdrop
} from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';

export default function LoadingDemo() {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Loading Indicators - MUI Direct Usage
        </Typography>
        <Typography variant="body1" color="text.secondary">
          다양한 형태의 로딩 인디케이터를 MUI 컴포넌트로 직접 구현한 예제입니다.
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {/* Circular Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Circular Progress (MUI)</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              CircularProgress component from MUI
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <CircularProgress size={30} />
                <Typography variant="caption">Small</Typography>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <CircularProgress size={40} />
                <Typography variant="caption">Medium</Typography>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <CircularProgress size={50} />
                <Typography variant="caption">Large</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>With Determinate Progress</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', mt: 2 }}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <Box position="relative" display="inline-flex">
                  <CircularProgress variant="determinate" value={25} size={60} />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      25%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption">25%</Typography>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <Box position="relative" display="inline-flex">
                  <CircularProgress variant="determinate" value={65} size={60} color="success" />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      65%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption">Uploading</Typography>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <Box position="relative" display="inline-flex">
                  <CircularProgress variant="determinate" value={90} size={60} color="error" />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      90%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption">Almost done</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Linear Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Linear Progress (MUI)</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              LinearProgress component from MUI
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Indeterminate
                </Typography>
                <LinearProgress />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption">45% complete</Typography>
                  <Typography variant="caption" color="primary">45%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={45} />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption">Success progress</Typography>
                  <Typography variant="caption" color="success.main">80%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={80} color="success" />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption">Warning state</Typography>
                  <Typography variant="caption" color="warning.main">60%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={60} color="warning" />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption">Error state</Typography>
                  <Typography variant="caption" color="error.main">35%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={35} color="error" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Skeleton Loaders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Skeleton (MUI)</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Skeleton component from MUI for content placeholders
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Text Skeleton
              </Typography>
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="80%" />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="90%" />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Rectangular Skeleton
              </Typography>
              <Skeleton variant="rectangular" width="100%" height={118} />
            </Box>

            <Box>
              <Typography variant="caption" display="block" gutterBottom>
                Rounded Skeleton
              </Typography>
              <Skeleton variant="rounded" width="100%" height={60} />
            </Box>
          </Paper>
        </Grid>

        {/* Skeleton with Content */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Skeleton Card Example</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Realistic skeleton placeholder
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
                <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="40%" />
              </Box>
            </Box>
            <Skeleton variant="rectangular" width="100%" height={180} sx={{ mb: 1 }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="80%" />
          </Paper>
        </Grid>

        {/* Loading Overlay */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, position: 'relative', minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>Loading Overlay (MUI Backdrop)</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Backdrop component from MUI for overlay loading states
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography>Content behind overlay. Click the button to toggle the overlay.</Typography>
              <Button variant="contained" onClick={() => setShowOverlay(!showOverlay)}>
                {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
              </Button>
            </Box>
            <Backdrop
              sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                position: 'absolute',
                borderRadius: 'inherit'
              }}
              open={showOverlay}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <CircularProgress color="inherit" />
                <Typography>Processing...</Typography>
              </Box>
            </Backdrop>
          </Paper>
        </Grid>
      </Grid>

      {/* Usage Guide */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>Usage Examples</Typography>
        <Box component="pre" sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`import {
  CircularProgress,
  LinearProgress,
  Skeleton,
  Backdrop
} from '@mui/material';

// Circular Loading
<CircularProgress />
<CircularProgress size={60} />
<CircularProgress variant="determinate" value={75} />

// Linear Progress
<LinearProgress />
<LinearProgress variant="determinate" value={50} />
<LinearProgress color="success" />

// Skeleton
<Skeleton variant="text" />
<Skeleton variant="rectangular" width={210} height={118} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rounded" width={210} height={60} />

// Overlay
<Backdrop open={true}>
  <CircularProgress color="inherit" />
</Backdrop>`}
        </Box>
      </Paper>

      {/* Comparison */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom>Migration Complete</Typography>
        <Typography variant="body2">
          ✅ All loading indicators now use MUI components directly
          <br />
          ✅ CircularProgress replaces custom LoadingSpinner
          <br />
          ✅ LinearProgress replaces custom LoadingBar
          <br />
          ✅ Skeleton replaces custom LoadingSkeleton
          <br />
          ✅ Backdrop replaces custom LoadingOverlay
          <br />
          <br />
          No wrapper components needed - theme system provides consistent styling!
        </Typography>
      </Paper>
    </PageContainer>
  );
}
