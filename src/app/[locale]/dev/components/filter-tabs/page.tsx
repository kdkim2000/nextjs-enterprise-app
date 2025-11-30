'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Switch, FormControlLabel } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import FilterTabs, { FilterTab } from '@/components/common/FilterTabs';

type StatusFilter = 'all' | 'active' | 'pending' | 'completed';
type PriorityFilter = 'low' | 'medium' | 'high' | 'critical';

export default function FilterTabsDemoPage() {
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('medium');
  const [sizeDemo, setSizeDemo] = useState<'small' | 'medium'>('small');

  const statusTabs: FilterTab<StatusFilter>[] = [
    { value: 'all', label: '전체' },
    { value: 'active', label: '활성' },
    { value: 'pending', label: '대기중' },
    { value: 'completed', label: '완료' }
  ];

  const tabsWithCount: FilterTab<StatusFilter>[] = [
    { value: 'all', label: '전체', count: 156 },
    { value: 'active', label: '활성', count: 42 },
    { value: 'pending', label: '대기중', count: 23 },
    { value: 'completed', label: '완료', count: 91 }
  ];

  const priorityTabs: FilterTab<PriorityFilter>[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical', disabled: true }
  ];

  const sizeTabs: FilterTab<'small' | 'medium'>[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' }
  ];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          FilterTabs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A generic filter tab component with TypeScript generics support for type-safe filtering.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          TypeScript 제네릭을 지원하는 타입 안전한 필터 탭 컴포넌트입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Simple filter tabs with active state management.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FilterTabs
              tabs={statusTabs}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected: <strong>{statusFilter}</strong>
            </Typography>
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import FilterTabs, { FilterTab } from '@/components/common/FilterTabs';

type StatusFilter = 'all' | 'active' | 'pending' | 'completed';

const [filter, setFilter] = useState<StatusFilter>('all');

const tabs: FilterTab<StatusFilter>[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'pending', label: '대기중' },
  { value: 'completed', label: '완료' }
];

<FilterTabs
  tabs={tabs}
  value={filter}
  onChange={setFilter}
/>`}
          </Box>
        </Paper>

        {/* With Count Badge */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Count Badge
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display count badges next to tab labels.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FilterTabs
              tabs={tabsWithCount}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`const tabsWithCount: FilterTab<StatusFilter>[] = [
  { value: 'all', label: '전체', count: 156 },
  { value: 'active', label: '활성', count: 42 },
  { value: 'pending', label: '대기중', count: 23 },
  { value: 'completed', label: '완료', count: 91 }
];

<FilterTabs tabs={tabsWithCount} value={filter} onChange={setFilter} />`}
          </Box>
        </Paper>

        {/* Custom Active Color */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Active Color
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize the active tab background color.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Primary (Default)
              </Typography>
              <FilterTabs
                tabs={statusTabs}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Success (#10b981)
              </Typography>
              <FilterTabs
                tabs={statusTabs}
                value={statusFilter}
                onChange={setStatusFilter}
                activeColor="#10b981"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Warning (#f59e0b)
              </Typography>
              <FilterTabs
                tabs={statusTabs}
                value={statusFilter}
                onChange={setStatusFilter}
                activeColor="#f59e0b"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Error (#ef4444)
              </Typography>
              <FilterTabs
                tabs={statusTabs}
                value={statusFilter}
                onChange={setStatusFilter}
                activeColor="#ef4444"
              />
            </Box>
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<FilterTabs
  tabs={tabs}
  value={filter}
  onChange={setFilter}
  activeColor="#10b981"
/>`}
          </Box>
        </Paper>

        {/* Size Variants */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Size Variants
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose between small and medium sizes.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Small (Default)
              </Typography>
              <FilterTabs
                tabs={sizeTabs}
                value={sizeDemo}
                onChange={setSizeDemo}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Medium
              </Typography>
              <FilterTabs
                tabs={sizeTabs}
                value={sizeDemo}
                onChange={setSizeDemo}
                size="medium"
              />
            </Box>
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<FilterTabs tabs={tabs} value={filter} onChange={setFilter} size="small" />
<FilterTabs tabs={tabs} value={filter} onChange={setFilter} size="medium" />`}
          </Box>
        </Paper>

        {/* Disabled Tabs */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disabled Tabs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Individual tabs can be disabled.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FilterTabs
              tabs={priorityTabs}
              value={priorityFilter}
              onChange={setPriorityFilter}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Note: &quot;Critical&quot; tab is disabled
            </Typography>
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`const tabs: FilterTab<PriorityFilter>[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical', disabled: true }
];`}
          </Box>
        </Paper>

        {/* Full Width */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Full Width
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tabs can stretch to fill the container width.
          </Typography>

          <Box sx={{ mb: 3, maxWidth: 500 }}>
            <FilterTabs
              tabs={statusTabs}
              value={statusFilter}
              onChange={setStatusFilter}
              fullWidth
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<FilterTabs
  tabs={tabs}
  value={filter}
  onChange={setFilter}
  fullWidth
/>`}
          </Box>
        </Paper>

        {/* Loading State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Loading State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show skeleton placeholders while loading.
          </Typography>

          <FormControlLabel
            control={<Switch checked={loading} onChange={(e) => setLoading(e.target.checked)} />}
            label="Toggle Loading"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 3 }}>
            <FilterTabs
              tabs={statusTabs}
              value={statusFilter}
              onChange={setStatusFilter}
              loading={loading}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<FilterTabs
  tabs={tabs}
  value={filter}
  onChange={setFilter}
  loading={true}
/>`}
          </Box>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mb: 3
            }}
          >
            {`import FilterTabs, { FilterTab, FilterTabsProps } from '@/components/common/FilterTabs';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            FilterTab&lt;T&gt; Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>value</code>: T - Unique value for the tab (generic type)
            </li>
            <li>
              <code>label</code>: string - Display text
            </li>
            <li>
              <code>count</code>?: number - Optional count badge
            </li>
            <li>
              <code>disabled</code>?: boolean - Disable the tab
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            FilterTabsProps&lt;T&gt;
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>tabs</code>: FilterTab&lt;T&gt;[] - Array of tab items
            </li>
            <li>
              <code>value</code>: T - Currently selected value
            </li>
            <li>
              <code>onChange</code>: (value: T) =&gt; void - Change handler
            </li>
            <li>
              <code>size</code>?: &apos;small&apos; | &apos;medium&apos; - Size variant (default: small)
            </li>
            <li>
              <code>activeColor</code>?: string - Active tab color (default: #6366f1)
            </li>
            <li>
              <code>loading</code>?: boolean - Loading state
            </li>
            <li>
              <code>fullWidth</code>?: boolean - Stretch tabs to fill width
            </li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
