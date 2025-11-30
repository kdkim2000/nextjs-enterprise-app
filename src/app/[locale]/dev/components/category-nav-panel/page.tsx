'use client';

import { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Settings,
  Person,
  Security,
  Notifications,
  Palette,
  Storage,
  Code,
  Build
} from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import CategoryNavPanel, { CategoryItem, CategoryStats } from '@/components/common/CategoryNavPanel';

export default function CategoryNavPanelDemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');

  // Example 1: Basic categories with icons
  const basicCategories: CategoryItem[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: Person },
    { id: 'security', label: 'Security', icon: Security },
    { id: 'notifications', label: 'Notifications', icon: Notifications }
  ];

  // Example 2: Categories with colors
  const coloredCategories: CategoryItem[] = [
    { id: 'design', label: 'Design', icon: Palette, color: '#9c27b0' },
    { id: 'development', label: 'Development', icon: Code, color: '#2196f3' },
    { id: 'database', label: 'Database', icon: Storage, color: '#4caf50' },
    { id: 'build', label: 'Build', icon: Build, color: '#ff9800' }
  ];

  // Mock data for stats
  const mockData: Record<string, { total: number; ready: number; active: number }> = {
    general: { total: 12, ready: 10, active: 8 },
    profile: { total: 8, ready: 6, active: 4 },
    security: { total: 15, ready: 12, active: 10 },
    notifications: { total: 6, ready: 5, active: 3 },
    design: { total: 20, ready: 18, active: 15 },
    development: { total: 35, ready: 30, active: 25 },
    database: { total: 10, ready: 8, active: 6 },
    build: { total: 8, ready: 7, active: 5 }
  };

  // Stats getter
  const getStats = useCallback((categoryId: string): CategoryStats => {
    const data = mockData[categoryId] || { total: 0, ready: 0, active: 0 };
    return {
      total: data.total,
      primary: data.ready,
      secondary: data.active
    };
  }, []);

  // Total stats
  const totalStats = useMemo((): CategoryStats => {
    const allData = Object.values(mockData);
    return {
      total: allData.reduce((sum, d) => sum + d.total, 0),
      primary: allData.reduce((sum, d) => sum + d.ready, 0),
      secondary: allData.reduce((sum, d) => sum + d.active, 0)
    };
  }, []);

  // Format functions
  const formatStats = (stats: CategoryStats) => `${stats.secondary}/${stats.primary}/${stats.total}`;
  const formatTotalStats = (stats: CategoryStats) =>
    `Total ${stats.total} (Ready: ${stats.primary}, Active: ${stats.secondary})`;

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          CategoryNavPanel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A reusable category navigation panel with icons, colors, and statistics display.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          아이콘, 색상, 통계를 지원하는 재사용 가능한 카테고리 네비게이션 패널입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Simple category navigation with icons and stats.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ height: 400 }}>
                <CategoryNavPanel
                  title="Settings"
                  categories={basicCategories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  getCategoryStats={getStats}
                  totalStats={totalStats}
                  allItem={{ label: 'All Settings', icon: Settings }}
                  formatStats={formatStats}
                  formatTotalStats={formatTotalStats}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, height: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Category: <strong>{selectedCategory || 'All'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click on a category to select it. The panel supports &quot;All&quot; item and individual categories.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mt: 3
            }}
          >
            {`import CategoryNavPanel, { CategoryItem, CategoryStats } from '@/components/common/CategoryNavPanel';
import { Settings, Person, Security } from '@mui/icons-material';

const categories: CategoryItem[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'profile', label: 'Profile', icon: Person },
  { id: 'security', label: 'Security', icon: Security }
];

const getStats = (categoryId: string): CategoryStats => ({
  total: 10,
  primary: 8,   // e.g., ready count
  secondary: 6  // e.g., active count
});

<CategoryNavPanel
  title="Settings"
  categories={categories}
  selectedCategory={selectedCategory}
  onSelectCategory={setSelectedCategory}
  getCategoryStats={getStats}
  totalStats={{ total: 30, primary: 24, secondary: 18 }}
  allItem={{ label: 'All Settings', icon: Settings }}
  formatStats={(stats) => \`\${stats.secondary}/\${stats.primary}/\${stats.total}\`}
  formatTotalStats={(stats) => \`Total \${stats.total}\`}
/>`}
          </Box>
        </Paper>

        {/* With Custom Colors */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Colors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Categories can have individual colors for visual distinction.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ height: 350 }}>
                <CategoryNavPanel
                  title="Modules"
                  categories={coloredCategories}
                  selectedCategory={selectedModule}
                  onSelectCategory={setSelectedModule}
                  getCategoryStats={getStats}
                  totalStats={{
                    total: 73,
                    primary: 63,
                    secondary: 51
                  }}
                  allItem={{ label: 'All Modules', icon: Code }}
                  formatStats={(stats) => stats.total.toString()}
                  formatTotalStats={(stats) => `${stats.total} modules`}
                  showStatsHeader={false}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Each category can have its own color. When selected, the border and highlight use the category color.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mt: 3
            }}
          >
            {`const categories: CategoryItem[] = [
  { id: 'design', label: 'Design', icon: Palette, color: '#9c27b0' },
  { id: 'development', label: 'Development', icon: Code, color: '#2196f3' },
  { id: 'database', label: 'Database', icon: Storage, color: '#4caf50' }
];`}
          </Box>
        </Paper>

        {/* Without All Item */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Without &quot;All&quot; Item
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hide the &quot;All&quot; option when not needed.
          </Typography>

          <Box sx={{ height: 250, maxWidth: 300 }}>
            <CategoryNavPanel
              title="Quick Access"
              categories={basicCategories.slice(0, 3)}
              selectedCategory={selectedCategory || 'general'}
              onSelectCategory={setSelectedCategory}
              getCategoryStats={getStats}
              totalStats={totalStats}
              showAllItem={false}
              showStatsHeader={false}
              formatStats={(stats) => stats.total.toString()}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mt: 3
            }}
          >
            {`<CategoryNavPanel
  ...
  showAllItem={false}
  showStatsHeader={false}
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
            {`import CategoryNavPanel, { CategoryItem, CategoryStats } from '@/components/common/CategoryNavPanel';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            CategoryItem Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>id</code>: string - Unique category ID</li>
            <li><code>label</code>: string - Display label</li>
            <li><code>icon</code>?: React.ElementType - MUI icon component</li>
            <li><code>color</code>?: string - Custom color (hex)</li>
            <li><code>description</code>?: string - Optional description</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            CategoryStats Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>total</code>: number - Total count</li>
            <li><code>primary</code>?: number - Primary stat (e.g., ready count)</li>
            <li><code>secondary</code>?: number - Secondary stat (e.g., active count)</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            CategoryNavPanelProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>title</code>: string - Panel title</li>
            <li><code>categories</code>: CategoryItem[] - Array of categories</li>
            <li><code>selectedCategory</code>: string - Selected category ID (empty for &quot;all&quot;)</li>
            <li><code>onSelectCategory</code>: (id: string) =&gt; void - Selection handler</li>
            <li><code>getCategoryStats</code>: (id: string) =&gt; CategoryStats - Stats getter</li>
            <li><code>totalStats</code>: CategoryStats - Stats for &quot;All&quot; item</li>
            <li><code>allItem</code>?: {'{ label: string; icon?: ElementType }'} - &quot;All&quot; item config</li>
            <li><code>formatStats</code>?: (stats) =&gt; string - Format category badge</li>
            <li><code>formatTotalStats</code>?: (stats) =&gt; string - Format header stats</li>
            <li><code>showAllItem</code>?: boolean - Show &quot;All&quot; item (default: true)</li>
            <li><code>showStatsHeader</code>?: boolean - Show stats header (default: true)</li>
            <li><code>defaultColor</code>?: string - Default category color</li>
          </Box>
        </Paper>

        {/* Use Cases */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Use Cases
          </Typography>
          <Box component="ul">
            <li>App Settings - Category navigation for different setting groups</li>
            <li>Menu Management - Navigate between menu categories</li>
            <li>Document Management - Folder/category navigation</li>
            <li>Code Management - Code group navigation</li>
            <li>Role-based Navigation - Navigate between role configurations</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
