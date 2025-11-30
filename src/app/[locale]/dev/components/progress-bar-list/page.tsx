'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Switch, FormControlLabel } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import ProgressBarList, { ProgressBarItem, ProgressBarColors } from '@/components/common/ProgressBarList';

export default function ProgressBarListDemoPage() {
  const [loading, setLoading] = useState(false);

  const basicItems: ProgressBarItem[] = [
    { id: 1, label: 'JavaScript', value: 45 },
    { id: 2, label: 'TypeScript', value: 32 },
    { id: 3, label: 'Python', value: 28 },
    { id: 4, label: 'Java', value: 15 },
    { id: 5, label: 'Go', value: 8 }
  ];

  const httpStatusItems: ProgressBarItem[] = [
    { id: '2xx', label: '성공', subLabel: '2xx', value: 1234, color: '#10b981' },
    { id: '3xx', label: '리다이렉트', subLabel: '3xx', value: 89, color: '#3b82f6' },
    { id: '4xx', label: '클라이언트 에러', subLabel: '4xx', value: 56, color: '#f59e0b' },
    { id: '5xx', label: '서버 에러', subLabel: '5xx', value: 12, color: '#ef4444' }
  ];

  const menuUsageItems: ProgressBarItem[] = [
    { id: 1, label: '대시보드', value: 1543, meta: '342명' },
    { id: 2, label: '사용자 관리', value: 982, meta: '156명' },
    { id: 3, label: '게시판', value: 756, meta: '234명' },
    { id: 4, label: '보고서', value: 521, meta: '89명' },
    { id: 5, label: '설정', value: 234, meta: '45명' }
  ];

  const customColorItems: ProgressBarItem[] = [
    { id: 1, label: 'Sales', value: 85, max: 100, color: '#ec4899' },
    { id: 2, label: 'Marketing', value: 72, max: 100, color: '#8b5cf6' },
    { id: 3, label: 'Development', value: 93, max: 100, color: '#06b6d4' },
    { id: 4, label: 'Support', value: 68, max: 100, color: '#f97316' }
  ];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          ProgressBarList
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A list component for displaying progress bars with labels, values, and percentages.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          레이블, 값, 백분율과 함께 프로그레스 바를 표시하는 목록 컴포넌트입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display a list of items with progress bars showing relative values.
          </Typography>

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <ProgressBarList items={basicItems} title="Programming Languages" />
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
            {`import ProgressBarList, { ProgressBarItem } from '@/components/common/ProgressBarList';

const items: ProgressBarItem[] = [
  { id: 1, label: 'JavaScript', value: 45 },
  { id: 2, label: 'TypeScript', value: 32 },
  { id: 3, label: 'Python', value: 28 }
];

<ProgressBarList items={items} title="Programming Languages" />`}
          </Box>
        </Paper>

        {/* With Sub-labels */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Sub-labels and Custom Colors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add sub-labels and custom colors for each item.
          </Typography>

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <ProgressBarList
              items={httpStatusItems}
              title="HTTP 상태 분포"
              showPercentage
              showValue
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
            {`const items: ProgressBarItem[] = [
  { id: '2xx', label: '성공', subLabel: '2xx', value: 1234, color: '#10b981' },
  { id: '3xx', label: '리다이렉트', subLabel: '3xx', value: 89, color: '#3b82f6' },
  { id: '4xx', label: '클라이언트 에러', subLabel: '4xx', value: 56, color: '#f59e0b' },
  { id: '5xx', label: '서버 에러', subLabel: '5xx', value: 12, color: '#ef4444' }
];

<ProgressBarList
  items={items}
  title="HTTP 상태 분포"
  showPercentage
  showValue
/>`}
          </Box>
        </Paper>

        {/* With Meta Information */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Meta Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display additional metadata (like user count) next to values.
          </Typography>

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <ProgressBarList
              items={menuUsageItems}
              title="메뉴 접근 빈도"
              showPercentage={false}
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
            {`const items: ProgressBarItem[] = [
  { id: 1, label: '대시보드', value: 1543, meta: '342명' },
  { id: 2, label: '사용자 관리', value: 982, meta: '156명' },
  { id: 3, label: '게시판', value: 756, meta: '234명' }
];

<ProgressBarList
  items={items}
  title="메뉴 접근 빈도"
  showPercentage={false}
/>`}
          </Box>
        </Paper>

        {/* With Max Values */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Max Values (Goal-based)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Set individual max values for goal-based progress display.
          </Typography>

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <ProgressBarList
              items={customColorItems}
              title="Department Goals"
              showPercentage
              showValue={false}
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
            {`const items: ProgressBarItem[] = [
  { id: 1, label: 'Sales', value: 85, max: 100, color: '#ec4899' },
  { id: 2, label: 'Marketing', value: 72, max: 100, color: '#8b5cf6' },
  { id: 3, label: 'Development', value: 93, max: 100, color: '#06b6d4' }
];

<ProgressBarList
  items={items}
  title="Department Goals"
  showPercentage
  showValue={false}
/>`}
          </Box>
        </Paper>

        {/* Bar Height */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bar Height Variants
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize the progress bar height.
          </Typography>

          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Height: 4px
              </Typography>
              <ProgressBarList
                items={basicItems.slice(0, 3)}
                barHeight={4}
                showPercentage={false}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Height: 6px (Default)
              </Typography>
              <ProgressBarList
                items={basicItems.slice(0, 3)}
                barHeight={6}
                showPercentage={false}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Height: 10px
              </Typography>
              <ProgressBarList
                items={basicItems.slice(0, 3)}
                barHeight={10}
                showPercentage={false}
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
            {`<ProgressBarList items={items} barHeight={4} />
<ProgressBarList items={items} barHeight={6} />  // Default
<ProgressBarList items={items} barHeight={10} />`}
          </Box>
        </Paper>

        {/* Custom Formatters */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Value Formatters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use custom formatters for values and metadata.
          </Typography>

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <ProgressBarList
              items={[
                { id: 1, label: 'Revenue', value: 125430, meta: 12.5 },
                { id: 2, label: 'Expenses', value: 89560, meta: -3.2 },
                { id: 3, label: 'Profit', value: 35870, meta: 8.7 }
              ]}
              title="Financial Overview"
              formatValue={(v) => `$${v.toLocaleString()}`}
              formatMeta={(m) => `${Number(m) >= 0 ? '+' : ''}${m}%`}
              showPercentage={false}
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
            {`<ProgressBarList
  items={items}
  formatValue={(v) => \`$\${v.toLocaleString()}\`}
  formatMeta={(m) => \`\${Number(m) >= 0 ? '+' : ''}\${m}%\`}
/>`}
          </Box>
        </Paper>

        {/* Loading State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Loading State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show skeleton placeholders while data is loading.
          </Typography>

          <FormControlLabel
            control={<Switch checked={loading} onChange={(e) => setLoading(e.target.checked)} />}
            label="Toggle Loading"
            sx={{ mb: 2 }}
          />

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <ProgressBarList
              items={basicItems}
              title="Programming Languages"
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
            {`<ProgressBarList items={items} loading={true} />`}
          </Box>
        </Paper>

        {/* Color Palette */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Default Color Palette
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Items without custom colors cycle through the default palette.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {ProgressBarColors.map((color, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: color }} />
                <Typography variant="caption">{color}</Typography>
              </Box>
            ))}
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
            {`import { ProgressBarColors } from '@/components/common/ProgressBarList';

// Custom color palette
<ProgressBarList
  items={items}
  colors={['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0']}
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
            {`import ProgressBarList, { ProgressBarItem, ProgressBarColors } from '@/components/common/ProgressBarList';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            ProgressBarItem Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>id</code>?: string | number - Unique identifier</li>
            <li><code>label</code>: string - Display label</li>
            <li><code>subLabel</code>?: string - Secondary label</li>
            <li><code>value</code>: number - Current value</li>
            <li><code>max</code>?: number - Maximum value for percentage</li>
            <li><code>color</code>?: string - Custom bar color</li>
            <li><code>meta</code>?: string | number - Additional metadata</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            ProgressBarListProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>items</code>: ProgressBarItem[] - Array of items</li>
            <li><code>loading</code>?: boolean - Loading state</li>
            <li><code>showPercentage</code>?: boolean - Show percentage (default: true)</li>
            <li><code>showValue</code>?: boolean - Show value (default: true)</li>
            <li><code>colors</code>?: string[] - Color palette</li>
            <li><code>barHeight</code>?: number - Bar height in px (default: 6)</li>
            <li><code>maxItems</code>?: number - Limit displayed items</li>
            <li><code>title</code>?: string - List title</li>
            <li><code>formatValue</code>?: (value: number) =&gt; string - Value formatter</li>
            <li><code>formatMeta</code>?: (meta: string | number) =&gt; string - Meta formatter</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
