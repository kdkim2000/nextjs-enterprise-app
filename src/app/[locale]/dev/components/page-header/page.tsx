'use client';

import { Box, Typography, Paper, Stack, Button, IconButton } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import { Add, Refresh, Settings, Download } from '@mui/icons-material';

export default function PageHeaderDemoPage() {
  return (
    <PageContainer
      title="Page Header"
      description="Standardized page header with breadcrumb, title, and actions"
    >
      <Stack spacing={4}>
        {/* Auto Mode (Current Page) */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Auto Mode (Current Page)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Automatically fetches menu information based on current path
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <PageHeader useMenu showBreadcrumb />
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
            {`<PageHeader useMenu showBreadcrumb />`}
          </Box>
        </Paper>

        {/* Manual Mode - Basic */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Manual Mode - Basic
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manually provide title and description
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <PageHeader
              title="User Management"
              description="Manage users, roles, and permissions"
            />
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
            {`<PageHeader
  title="User Management"
  description="Manage users, roles, and permissions"
/>`}
          </Box>
        </Paper>

        {/* Manual Mode - With Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Manual Mode - With Action Buttons
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Include action buttons for common operations
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <PageHeader
              title="Products"
              description="Manage your product catalog"
              actions={
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" startIcon={<Refresh />}>
                    Refresh
                  </Button>
                  <Button variant="contained" size="small" startIcon={<Add />}>
                    Add Product
                  </Button>
                </Stack>
              }
            />
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
            {`<PageHeader
  title="Products"
  description="Manage your product catalog"
  actions={
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" size="small" startIcon={<Refresh />}>
        Refresh
      </Button>
      <Button variant="contained" size="small" startIcon={<Add />}>
        Add Product
      </Button>
    </Stack>
  }
/>`}
          </Box>
        </Paper>

        {/* Manual Mode - With Icon Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Manual Mode - With Icon Actions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use icon buttons for a more compact layout
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <PageHeader
              title="Dashboard"
              description="Overview of your system metrics"
              actions={
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small">
                    <Download fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <Refresh fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <Settings fontSize="small" />
                  </IconButton>
                </Stack>
              }
            />
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
            {`<PageHeader
  title="Dashboard"
  description="Overview of your system metrics"
  actions={
    <Stack direction="row" spacing={0.5}>
      <IconButton size="small"><Download /></IconButton>
      <IconButton size="small"><Refresh /></IconButton>
      <IconButton size="small"><Settings /></IconButton>
    </Stack>
  }
/>`}
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
              {`import PageHeader from '@/components/common/PageHeader';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>useMenu</code>: boolean - Auto mode: fetch menu by current path</li>
            <li><code>menu</code>: MenuItem - Menu object mode: provide menu object directly</li>
            <li><code>title</code>: string - Manual mode: page title</li>
            <li><code>description</code>: string - Manual mode: page description</li>
            <li><code>actions</code>: React.ReactNode - Action buttons/icons (optional)</li>
            <li><code>showBreadcrumb</code>: boolean - Show breadcrumb navigation (default: false)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Usage Modes:</strong>
          </Typography>
          <Box component="ol" sx={{ mt: 1 }}>
            <li><strong>Auto mode:</strong> {`<PageHeader useMenu showBreadcrumb />`}</li>
            <li><strong>Menu object mode:</strong> {`<PageHeader menu={menuObject} />`}</li>
            <li><strong>Manual mode:</strong> {`<PageHeader title="..." description="..." />`}</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Three flexible usage modes</li>
            <li>Automatic menu integration with i18n support</li>
            <li>Breadcrumb navigation with parent hierarchy</li>
            <li>Flexible action area for buttons or icons</li>
            <li>Responsive design with mobile-friendly layout</li>
            <li>Consistent styling across all pages</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Page titles in admin panels</li>
            <li>Section headers with navigation</li>
            <li>List views with action buttons</li>
            <li>Dashboard headers with quick actions</li>
            <li>Settings pages with breadcrumbs</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
