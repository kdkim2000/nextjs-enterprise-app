'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, ToggleButton, ToggleButtonGroup, Skeleton, Alert } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import PageStateWrapper from '@/components/common/PageStateWrapper';

type PageState = 'normal' | 'loading' | 'error' | 'noPermission' | 'notFound' | 'empty';

export default function PageStateWrapperDemoPage() {
  const [state, setState] = useState<PageState>('normal');
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setState('loading');
    setTimeout(() => setState('normal'), 1500);
  };

  return (
    <PageContainer
      title="Page State Wrapper"
      description="Handles common page states: loading, error, permission, empty"
    >
      <Stack spacing={4}>
        {/* State Selector */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select State to Preview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click a button to see how PageStateWrapper handles different states
          </Typography>

          <ToggleButtonGroup
            value={state}
            exclusive
            onChange={(_, newState) => newState && setState(newState)}
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            <ToggleButton value="normal" color="success">Normal</ToggleButton>
            <ToggleButton value="loading" color="info">Loading</ToggleButton>
            <ToggleButton value="error" color="error">Error</ToggleButton>
            <ToggleButton value="noPermission" color="warning">No Permission</ToggleButton>
            <ToggleButton value="notFound" color="secondary">Not Found</ToggleButton>
            <ToggleButton value="empty" color="primary">Empty</ToggleButton>
          </ToggleButtonGroup>

          {retryCount > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Retry clicked {retryCount} time(s)
            </Alert>
          )}
        </Paper>

        {/* Live Preview */}
        <Paper sx={{ p: 3, minHeight: 300 }}>
          <Typography variant="h6" gutterBottom>
            Live Preview
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2, mt: 2 }}>
            <PageStateWrapper
              loading={state === 'loading'}
              error={state === 'error'}
              errorMessage="Failed to load data. Please try again."
              noPermission={state === 'noPermission'}
              noPermissionMessage="You do not have permission to view this content."
              notFound={state === 'notFound'}
              notFoundMessage="The requested resource was not found."
              empty={state === 'empty'}
              emptyMessage="No items to display."
              onRetry={handleRetry}
              retryLabel="Try Again"
            >
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'success.50', borderRadius: 1 }}>
                <Typography variant="h5" color="success.main" gutterBottom>
                  Content Loaded Successfully!
                </Typography>
                <Typography color="text.secondary">
                  This content is shown when there are no special states active.
                </Typography>
              </Box>
            </PageStateWrapper>
          </Box>
        </Paper>

        {/* Loading Variations */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Loading State Variations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize skeleton appearance for loading state
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Single Skeleton</Typography>
              <PageStateWrapper loading skeletonHeight={100}>
                <div>Content</div>
              </PageStateWrapper>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Multiple Rows</Typography>
              <PageStateWrapper loading skeletonHeight={50} skeletonRows={3}>
                <div>Content</div>
              </PageStateWrapper>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Rounded Skeleton</Typography>
              <PageStateWrapper loading skeletonHeight={100} skeletonVariant="rounded">
                <div>Content</div>
              </PageStateWrapper>
            </Box>
          </Stack>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 3,
              fontSize: '0.875rem',
            }}
          >
            {`<PageStateWrapper
  loading={isLoading}
  skeletonHeight={100}
  skeletonRows={3}
  skeletonVariant="rounded"
>
  <YourContent />
</PageStateWrapper>`}
          </Box>
        </Paper>

        {/* Custom Loading Component */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Loading Component
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Replace default skeleton with custom loading UI
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <PageStateWrapper
              loading
              loadingComponent={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Stack spacing={2}>
                    <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
                  </Stack>
                </Box>
              }
            >
              <div>Content</div>
            </PageStateWrapper>
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 2,
              fontSize: '0.875rem',
            }}
          >
            {`<PageStateWrapper
  loading={isLoading}
  loadingComponent={
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CircularProgress />
      <Typography>Loading...</Typography>
    </Box>
  }
>
  <YourContent />
</PageStateWrapper>`}
          </Box>
        </Paper>

        {/* Practical Example */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Practical Usage Example
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Common pattern for data fetching pages
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
            {`export default function DataPage() {
  const { data, loading, error, refetch } = useDataFetch();
  const { canRead } = usePermissions();

  return (
    <PageStateWrapper
      loading={loading}
      error={!!error}
      errorMessage={error?.message || 'Failed to load data'}
      noPermission={!canRead}
      noPermissionMessage="You don't have access to this page"
      empty={!loading && !error && data?.length === 0}
      emptyMessage="No items found"
      onRetry={refetch}
      retryLabel="Retry"
    >
      <DataTable data={data} />
    </PageStateWrapper>
  );
}`}
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
              {`import PageStateWrapper from '@/components/common/PageStateWrapper';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>children</code>: ReactNode - Content to render in normal state (required)</li>
            <li><code>loading</code>: boolean - Show loading skeleton (default: false)</li>
            <li><code>error</code>: boolean - Show error state (default: false)</li>
            <li><code>errorMessage</code>: string - Error message (default: &quot;An error occurred&quot;)</li>
            <li><code>noPermission</code>: boolean - Show permission denied state (default: false)</li>
            <li><code>noPermissionMessage</code>: string - Permission message</li>
            <li><code>notFound</code>: boolean - Show not found state (default: false)</li>
            <li><code>notFoundMessage</code>: string - Not found message</li>
            <li><code>empty</code>: boolean - Show empty state (default: false)</li>
            <li><code>emptyMessage</code>: string - Empty state message</li>
            <li><code>loadingComponent</code>: ReactNode - Custom loading component</li>
            <li><code>skeletonHeight</code>: number | string - Skeleton height (default: 400)</li>
            <li><code>skeletonVariant</code>: &apos;rectangular&apos; | &apos;rounded&apos; | &apos;circular&apos; | &apos;text&apos; - Skeleton style</li>
            <li><code>skeletonRows</code>: number - Number of skeleton rows (default: 1)</li>
            <li><code>onRetry</code>: () =&gt; void - Retry button handler (shows button when provided)</li>
            <li><code>retryLabel</code>: string - Retry button text (default: &quot;Retry&quot;)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>State Priority:</strong>
          </Typography>
          <Box component="ol" sx={{ mt: 1 }}>
            <li>loading (highest)</li>
            <li>error</li>
            <li>noPermission</li>
            <li>notFound</li>
            <li>empty</li>
            <li>children (lowest - normal state)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Best Practices:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Use as the outermost wrapper for data-driven pages</li>
            <li>Combine with data fetching hooks for clean code</li>
            <li>Provide meaningful error messages for each state</li>
            <li>Include retry functionality for recoverable errors</li>
            <li>Match skeleton height to expected content size</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
