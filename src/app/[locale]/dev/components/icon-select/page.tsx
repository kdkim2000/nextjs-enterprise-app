'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Grid, Card, CardContent } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import IconSelect from '@/components/common/IconSelect';
import { getMenuIcon } from '@/lib/icons/menuIcons';

export default function IconSelectDemoPage() {
  const [icon1, setIcon1] = useState('Dashboard');
  const [icon2, setIcon2] = useState('Settings');
  const [icon3, setIcon3] = useState('');

  return (
    <PageContainer
      title="Icon Select"
      description="Dropdown component for selecting MUI icons with preview"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select an icon from the dropdown with search functionality
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <IconSelect
                value={icon1}
                onChange={setIcon1}
                label="Menu Icon"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Selected Icon</Typography>
                  <Box sx={{ fontSize: 48, color: 'primary.main', mt: 1 }}>
                    {getMenuIcon(icon1)}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>{icon1}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
            {`const [icon, setIcon] = useState('Dashboard');

<IconSelect
  value={icon}
  onChange={setIcon}
  label="Menu Icon"
/>`}
          </Box>
        </Paper>

        {/* With Validation */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Validation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Required field with error state
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <IconSelect
                value={icon3}
                onChange={setIcon3}
                label="Required Icon"
                required
                error={!icon3}
                helperText={!icon3 ? 'Please select an icon' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <IconSelect
                value={icon2}
                onChange={setIcon2}
                label="Settings Icon"
                size="small"
              />
            </Grid>
          </Grid>

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
            {`<IconSelect
  value={icon}
  onChange={setIcon}
  label="Required Icon"
  required
  error={!icon}
  helperText={!icon ? 'Please select an icon' : ''}
/>`}
          </Box>
        </Paper>

        {/* Available Icons Preview */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Icons (Sample)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The dropdown includes search functionality to filter through all available icons
          </Typography>

          <Grid container spacing={2}>
            {['Dashboard', 'Settings', 'People', 'Folder', 'Description', 'BarChart', 'Security', 'Help', 'Notifications', 'Email', 'ShoppingCart', 'Build'].map((iconName) => (
              <Grid item xs={4} sm={3} md={2} key={iconName}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Box sx={{ fontSize: 32, color: 'text.secondary' }}>
                    {getMenuIcon(iconName)}
                  </Box>
                  <Typography variant="caption" noWrap>{iconName}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Use Case Example */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Use Case: Menu Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Common usage in admin menu configuration forms
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
            {`// In a Menu Form Component
function MenuFormFields({ menu, onChange }) {
  return (
    <Stack spacing={3}>
      <TextField
        label="Menu Name"
        value={menu.name}
        onChange={(e) => onChange({ ...menu, name: e.target.value })}
      />

      <IconSelect
        value={menu.icon || 'Folder'}
        onChange={(icon) => onChange({ ...menu, icon })}
        label="Menu Icon"
        required
      />

      <TextField
        label="URL Path"
        value={menu.path}
        onChange={(e) => onChange({ ...menu, path: e.target.value })}
      />
    </Stack>
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
              {`import IconSelect from '@/components/common/IconSelect';
import { getMenuIcon } from '@/lib/icons/menuIcons';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>value</code>: string - Selected icon name (required)</li>
            <li><code>onChange</code>: (value: string) =&gt; void - Change handler (required)</li>
            <li><code>label</code>: string - Field label (required)</li>
            <li><code>required</code>: boolean - Mark as required (default: false)</li>
            <li><code>disabled</code>: boolean - Disable the field (default: false)</li>
            <li><code>error</code>: boolean - Show error state (default: false)</li>
            <li><code>helperText</code>: string - Helper/error text</li>
            <li><code>fullWidth</code>: boolean - Full width (default: true)</li>
            <li><code>size</code>: &apos;small&apos; | &apos;medium&apos; - Field size (default: &apos;medium&apos;)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Helper Function:</strong>
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 1,
              fontSize: '0.875rem',
            }}
          >
            {`// Get icon component by name
import { getMenuIcon } from '@/lib/icons/menuIcons';

const IconComponent = getMenuIcon('Dashboard');
// Returns: <DashboardIcon />

// Use in JSX
<Box sx={{ fontSize: 24 }}>{getMenuIcon(iconName)}</Box>`}
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Search filter to find icons by name</li>
            <li>Shows icon preview in selected value</li>
            <li>Supports all standard MUI icons</li>
            <li>Grouped/categorized icon list</li>
            <li>Scrollable dropdown for large icon sets</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Admin menu configuration</li>
            <li>Category icon selection</li>
            <li>Program/module icon assignment</li>
            <li>Navigation item customization</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
