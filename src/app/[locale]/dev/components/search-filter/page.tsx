'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';

export default function SearchFilterDemoPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [searching, setSearching] = useState(false);

  const getActiveFilterCount = () => {
    let count = 0;
    if (name) count++;
    if (role) count++;
    if (status) count++;
    return count;
  };

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => setSearching(false), 1000);
  };

  const handleClear = () => {
    setName('');
    setRole('');
    setStatus('');
  };

  return (
    <PageContainer title="Search Filter Panel" description="Collapsible panel for search and filtering">
      <Stack spacing={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Standalone Mode
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Collapsible panel with Search and Clear buttons
          </Typography>

          <SearchFilterPanel
            title="Search / Filter"
            activeFilterCount={getActiveFilterCount()}
            onSearch={handleSearch}
            onClear={handleClear}
            searching={searching}
            defaultExpanded={true}
          >
            <Stack spacing={2}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                fullWidth
                placeholder="Search by name"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </SearchFilterPanel>

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
            {`<SearchFilterPanel
  title="Search / Filter"
  activeFilterCount={3}
  onSearch={() => {
    // Perform search
  }}
  onClear={() => {
    // Clear all filters
  }}
  defaultExpanded={true}
>
  <Stack spacing={2}>
    <TextField label="Name" />
    <Select label="Role">...</Select>
  </Stack>
</SearchFilterPanel>`}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Typography variant="body2" component="div">
            <strong>Import:</strong>
            <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 1 }}>
              {`import SearchFilterPanel from '@/components/common/SearchFilterPanel';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>title</code>: string - Panel title (default: &quot;Search / Filter&quot;)</li>
            <li><code>activeFilterCount</code>: number - Number of active filters (required)</li>
            <li><code>onSearch</code>: () =&gt; void - Search button handler (optional)</li>
            <li><code>onClear</code>: () =&gt; void - Clear button handler (optional)</li>
            <li><code>onApply</code>: () =&gt; void - Apply button handler (for advanced mode)</li>
            <li><code>onClose</code>: () =&gt; void - Close button handler (for advanced mode)</li>
            <li><code>searching</code>: boolean - Show searching state (default: false)</li>
            <li><code>disabled</code>: boolean - Disable all actions (default: false)</li>
            <li><code>defaultExpanded</code>: boolean - Initially expanded (default: false)</li>
            <li><code>mode</code>: &quot;standalone&quot; | &quot;advanced&quot; - Display mode (default: standalone)</li>
            <li><code>children</code>: React.ReactNode - Filter form fields (required)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Display Modes:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><strong>standalone</strong>: Clear + Search buttons</li>
            <li><strong>advanced</strong>: Close + Clear + Apply buttons</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Collapsible panel with expand/collapse</li>
            <li>Active filter count badge</li>
            <li>Icon-only buttons with tooltips</li>
            <li>Two operation modes</li>
            <li>Loading state support</li>
            <li>Fully controlled or uncontrolled expand state</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Search panels in list views</li>
            <li>Filter panels in data tables</li>
            <li>Advanced search forms</li>
            <li>Report parameter panels</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
