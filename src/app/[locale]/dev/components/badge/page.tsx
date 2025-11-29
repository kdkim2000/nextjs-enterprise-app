'use client';

import { Box, Typography, Paper, Stack, Divider } from '@mui/material';
import { Chat, Schedule, CalendarToday, AccountTree, CheckCircle, Warning, Error } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import {
  CategoryBadge,
  DifficultyBadge,
  StatusBadge,
  MetaInfo,
  BranchBadge,
  categoryConfigs,
  difficultyColors
} from '@/components/common/Badge';

export default function BadgeDemoPage() {
  const categories = Object.keys(categoryConfigs);
  const difficulties = Object.keys(difficultyColors);
  const statuses = ['active', 'completed', 'pending', 'error', 'inactive'];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Badge Components
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A collection of badge components for displaying categories, difficulties, statuses, and metadata.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          카테고리, 난이도, 상태, 메타데이터를 표시하기 위한 배지 컴포넌트 모음입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* CategoryBadge */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            CategoryBadge
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Displays a category with icon and color. Supports soft, filled, and outlined variants.
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Soft Variant (Default)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {categories.map((cat) => (
              <CategoryBadge key={cat} category={cat} />
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Filled Variant
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {categories.map((cat) => (
              <CategoryBadge key={cat} category={cat} variant="filled" />
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Outlined Variant
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {categories.map((cat) => (
              <CategoryBadge key={cat} category={cat} variant="outlined" />
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Size Comparison
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Small
              </Typography>
              <CategoryBadge category="feature" size="small" />
            </Box>
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Medium
              </Typography>
              <CategoryBadge category="feature" size="medium" />
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
            {`import { CategoryBadge } from '@/components/common/Badge';

<CategoryBadge category="feature" />
<CategoryBadge category="bug-fix" variant="filled" />
<CategoryBadge category="refactor" variant="outlined" size="medium" />`}
          </Box>
        </Paper>

        {/* DifficultyBadge */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            DifficultyBadge
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Displays difficulty level with color coding (easy=green, medium=yellow, hard=red).
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {difficulties.map((diff) => (
              <DifficultyBadge key={diff} difficulty={diff} />
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Size Comparison
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Small
              </Typography>
              <DifficultyBadge difficulty="medium" size="small" />
            </Box>
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Medium
              </Typography>
              <DifficultyBadge difficulty="medium" size="medium" />
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
            {`import { DifficultyBadge } from '@/components/common/Badge';

<DifficultyBadge difficulty="easy" />
<DifficultyBadge difficulty="medium" />
<DifficultyBadge difficulty="hard" size="medium" />`}
          </Box>
        </Paper>

        {/* StatusBadge */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            StatusBadge
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generic status badge with predefined color mappings.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {statuses.map((status) => (
              <StatusBadge key={status} status={status} />
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
            {`import { StatusBadge } from '@/components/common/Badge';

<StatusBadge status="active" />
<StatusBadge status="completed" />
<StatusBadge status="pending" />
<StatusBadge status="error" />`}
          </Box>
        </Paper>

        {/* MetaInfo */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            MetaInfo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Displays metadata with an icon and value. Useful for dates, counts, and other info.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <MetaInfo icon={<CalendarToday sx={{ fontSize: 14 }} />} value="2024-11-29" />
            <MetaInfo icon={<Chat sx={{ fontSize: 14 }} />} value={42} />
            <MetaInfo icon={<Schedule sx={{ fontSize: 14 }} />} value="30m" />
            <MetaInfo icon={<AccountTree sx={{ fontSize: 14 }} />} value="main" />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Size Comparison
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Small
              </Typography>
              <MetaInfo icon={<Chat sx={{ fontSize: 14 }} />} value={42} size="small" />
            </Box>
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Medium
              </Typography>
              <MetaInfo icon={<Chat sx={{ fontSize: 16 }} />} value={42} size="medium" />
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
            {`import { MetaInfo } from '@/components/common/Badge';
import { Chat, CalendarToday } from '@mui/icons-material';

<MetaInfo icon={<CalendarToday sx={{ fontSize: 14 }} />} value="2024-11-29" />
<MetaInfo icon={<Chat sx={{ fontSize: 14 }} />} value={42} />
<MetaInfo icon={<Chat sx={{ fontSize: 16 }} />} value={42} size="medium" />`}
          </Box>
        </Paper>

        {/* BranchBadge */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            BranchBadge
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Displays git branch name. Returns null for empty or &quot;unknown&quot; branches.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <BranchBadge branch="main" />
            <BranchBadge branch="feature/new-component" />
            <BranchBadge branch="develop" />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Size Comparison
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Small
              </Typography>
              <BranchBadge branch="main" size="small" />
            </Box>
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Medium
              </Typography>
              <BranchBadge branch="main" size="medium" />
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
            {`import { BranchBadge } from '@/components/common/Badge';

<BranchBadge branch="main" />
<BranchBadge branch="feature/new-component" size="medium" />
// Returns null:
<BranchBadge branch="unknown" />
<BranchBadge branch="" />`}
          </Box>
        </Paper>

        {/* Exported Constants */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Exported Constants
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The Badge module exports configuration objects for reuse in custom implementations.
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            categoryConfigs
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.75rem',
              mb: 3
            }}
          >
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(categoryConfigs).map(([key, val]) => [
                  key,
                  { color: val.color, label: val.label }
                ])
              ),
              null,
              2
            )}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            difficultyColors
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.75rem',
              mb: 3
            }}
          >
            {JSON.stringify(difficultyColors, null, 2)}
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
            {`import { categoryConfigs, difficultyColors } from '@/components/common/Badge';

// Use in custom components
const color = categoryConfigs['feature'].color; // '#22c55e'
const label = categoryConfigs['feature'].label; // 'Feature'
const diffColor = difficultyColors['hard']; // '#ef4444'`}
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
            {`import {
  CategoryBadge,
  DifficultyBadge,
  StatusBadge,
  MetaInfo,
  BranchBadge,
  categoryConfigs,
  difficultyColors
} from '@/components/common/Badge';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            CategoryBadge Props
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>category</code>: string - Category key (bug-fix, feature, refactor, debugging, performance, general)
            </li>
            <li>
              <code>size</code>: &apos;small&apos; | &apos;medium&apos; - Badge size (default: small)
            </li>
            <li>
              <code>variant</code>: &apos;soft&apos; | &apos;filled&apos; | &apos;outlined&apos; - Visual style (default: soft)
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            DifficultyBadge Props
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>difficulty</code>: string - Difficulty level (easy, medium, hard)
            </li>
            <li>
              <code>size</code>: &apos;small&apos; | &apos;medium&apos; - Badge size (default: small)
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            StatusBadge Props
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>status</code>: string - Status value (active, completed, pending, error, inactive)
            </li>
            <li>
              <code>size</code>: &apos;small&apos; | &apos;medium&apos; - Badge size (default: small)
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            MetaInfo Props
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>icon</code>: ReactNode - Icon element to display
            </li>
            <li>
              <code>value</code>: string | number - Value to display
            </li>
            <li>
              <code>size</code>: &apos;small&apos; | &apos;medium&apos; - Component size (default: small)
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            BranchBadge Props
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>branch</code>: string - Branch name to display
            </li>
            <li>
              <code>size</code>: &apos;small&apos; | &apos;medium&apos; - Badge size (default: small)
            </li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
