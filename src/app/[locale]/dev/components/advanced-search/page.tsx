'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, Alert, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import AdvancedSearchDialog, { FilterFieldConfig } from '@/components/common/AdvancedSearchDialog';

export default function AdvancedSearchDemoPage() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({
    name: '',
    role: '',
    status: '',
    department: ''
  });
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});

  const filterFields: FilterFieldConfig[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Search by name',
      gridSize: { xs: 12, sm: 6 }
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'manager', label: 'Manager' }
      ],
      gridSize: { xs: 12, sm: 6 }
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      gridSize: { xs: 12, sm: 6 }
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'engineering', label: 'Engineering' },
        { value: 'sales', label: 'Sales' },
        { value: 'marketing', label: 'Marketing' }
      ],
      gridSize: { xs: 12, sm: 6 }
    }
  ];

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFilters({
      name: '',
      role: '',
      status: '',
      department: ''
    });
  };

  const handleApply = () => {
    setAppliedFilters(filters);
    setOpen(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(appliedFilters).filter(v => v !== '').length;
  };

  return (
    <PageContainer title="Advanced Search Dialog" description="Dialog with multiple filter fields">
      <Stack spacing={4}>
        {getActiveFilterCount() > 0 && (
          <Alert severity="info">
            <Typography variant="body2" gutterBottom>
              Active Filters ({getActiveFilterCount()}):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {Object.entries(appliedFilters).map(([key, value]) =>
                value ? (
                  <Chip key={key} label={`${key}: ${value}`} size="small" color="primary" />
                ) : null
              )}
            </Stack>
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Search Dialog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Dialog with multiple filter fields arranged in a grid layout
          </Typography>

          <Button variant="contained" onClick={() => setOpen(true)}>
            Open Advanced Search
          </Button>

          <AdvancedSearchDialog
            open={open}
            onClose={() => setOpen(false)}
            title="Advanced Search"
            fields={filterFields}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClear}
            onApply={handleApply}
            maxWidth="md"
          />

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
            {`const filterFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    gridSize: { xs: 12, sm: 6 }
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' }
    ],
    gridSize: { xs: 12, sm: 6 }
  }
];

<AdvancedSearchDialog
  open={open}
  onClose={() => setOpen(false)}
  fields={filterFields}
  filters={filters}
  onFilterChange={(field, value) =>
    setFilters(prev => ({ ...prev, [field]: value }))
  }
  onClear={() => setFilters({})}
  onApply={() => {
    // Apply filters
    setOpen(false);
  }}
/>`}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Typography variant="body2" component="div">
            <strong>Import:</strong>
            <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 1 }}>
              {`import AdvancedSearchDialog from '@/components/common/AdvancedSearchDialog';
import type { FilterFieldConfig } from '@/components/common/AdvancedSearchDialog';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>open</code>: boolean - Dialog open state (required)</li>
            <li><code>onClose</code>: () =&gt; void - Close handler (required)</li>
            <li><code>title</code>: string - Dialog title (default: &quot;Advanced Search&quot;)</li>
            <li><code>fields</code>: FilterFieldConfig[] - Field configurations (required)</li>
            <li><code>filters</code>: Record&lt;string, string&gt; - Current filter values (required)</li>
            <li><code>onFilterChange</code>: (field: string, value: string) =&gt; void - Filter change handler (required)</li>
            <li><code>onClear</code>: () =&gt; void - Clear all filters handler (required)</li>
            <li><code>onApply</code>: () =&gt; void - Apply filters handler (required)</li>
            <li><code>maxWidth</code>: xs | sm | md | lg | xl - Dialog width (default: sm)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Supported Field Types:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>text</code>: Text input field</li>
            <li><code>select</code>: Dropdown select (requires options)</li>
            <li><code>userSelector</code>: User search and selection</li>
            <li><code>custom</code>: Custom render function</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Grid layout for responsive design</li>
            <li>Multiple field types support</li>
            <li>Clear all filters button</li>
            <li>Apply/Cancel actions</li>
            <li>Customizable field sizes</li>
            <li>Type-safe filter values</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Advanced search in data tables</li>
            <li>Complex filtering interfaces</li>
            <li>Report parameter selection</li>
            <li>Multi-criteria searches</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
