'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Switch, FormControlLabel } from '@mui/material';
import {
  People,
  Article,
  Business,
  Assessment,
  Settings,
  Shield,
  Dashboard,
  ShoppingCart,
  Inventory,
  Payment,
  LocalShipping,
  Support,
  Analytics,
  Build,
  Mail,
  Notifications
} from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import QuickActionGrid, { QuickAction } from '@/components/common/QuickActionGrid';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function QuickActionGridDemoPage() {
  const locale = useCurrentLocale();
  const [loading, setLoading] = useState(false);

  const basicActions: QuickAction[] = [
    {
      id: 'users',
      title: '사용자 관리',
      description: '사용자 목록 및 권한',
      icon: People,
      href: `/${locale}/admin/users`,
      color: '#3b82f6'
    },
    {
      id: 'boards',
      title: '게시판 관리',
      description: '게시판 유형 설정',
      icon: Article,
      href: `/${locale}/admin/board-types`,
      color: '#f59e0b'
    },
    {
      id: 'departments',
      title: '부서 관리',
      description: '조직 구조 관리',
      icon: Business,
      href: `/${locale}/admin/departments`,
      color: '#10b981'
    },
    {
      id: 'logs',
      title: '로그 분석',
      description: '시스템 로그 조회',
      icon: Assessment,
      href: `/${locale}/admin/logs`,
      color: '#8b5cf6'
    },
    {
      id: 'roles',
      title: '권한 관리',
      description: '역할 및 메뉴 권한',
      icon: Shield,
      href: `/${locale}/admin/roles`,
      color: '#6366f1'
    },
    {
      id: 'settings',
      title: '시스템 설정',
      description: '앱 환경 설정',
      icon: Settings,
      href: `/${locale}/dashboard/settings`,
      color: '#64748b'
    }
  ];

  const ecommerceActions: QuickAction[] = [
    { id: 'dashboard', title: 'Dashboard', icon: Dashboard, href: '#', color: '#6366f1' },
    { id: 'orders', title: 'Orders', icon: ShoppingCart, href: '#', color: '#10b981' },
    { id: 'products', title: 'Products', icon: Inventory, href: '#', color: '#f59e0b' },
    { id: 'payments', title: 'Payments', icon: Payment, href: '#', color: '#3b82f6' },
    { id: 'shipping', title: 'Shipping', icon: LocalShipping, href: '#', color: '#8b5cf6' },
    { id: 'support', title: 'Support', icon: Support, href: '#', color: '#ef4444' }
  ];

  const toolsActions: QuickAction[] = [
    { id: 'analytics', title: 'Analytics', description: 'View statistics', icon: Analytics, href: '#', color: '#6366f1' },
    { id: 'builder', title: 'Page Builder', description: 'Create pages', icon: Build, href: '#', color: '#10b981' },
    { id: 'emails', title: 'Email Templates', description: 'Manage emails', icon: Mail, href: '#', color: '#f59e0b' },
    { id: 'notifications', title: 'Push Notifications', description: 'Send alerts', icon: Notifications, href: '#', color: '#ef4444' }
  ];

  const withDisabledActions: QuickAction[] = [
    { id: 'active1', title: 'Active Action', icon: Dashboard, href: '#', color: '#6366f1' },
    { id: 'active2', title: 'Active Action', icon: Settings, href: '#', color: '#10b981' },
    { id: 'disabled1', title: 'Coming Soon', description: 'Feature in development', icon: Build, href: '#', color: '#8b5cf6', disabled: true },
    { id: 'disabled2', title: 'Premium Only', description: 'Upgrade required', icon: Shield, href: '#', color: '#f59e0b', disabled: true }
  ];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          QuickActionGrid
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A grid component for displaying quick action buttons with icons and descriptions.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          아이콘과 설명이 포함된 빠른 작업 버튼을 표시하는 그리드 컴포넌트입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display a grid of quick action buttons with icons and descriptions.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <QuickActionGrid
              actions={basicActions}
              title="빠른 작업"
              columns={{ xs: 6, sm: 4, md: 4 }}
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
            {`import QuickActionGrid, { QuickAction } from '@/components/common/QuickActionGrid';
import { People, Article, Business } from '@mui/icons-material';

const actions: QuickAction[] = [
  {
    id: 'users',
    title: '사용자 관리',
    description: '사용자 목록 및 권한',
    icon: People,
    href: '/admin/users',
    color: '#3b82f6'
  },
  {
    id: 'boards',
    title: '게시판 관리',
    description: '게시판 유형 설정',
    icon: Article,
    href: '/admin/board-types',
    color: '#f59e0b'
  }
];

<QuickActionGrid
  actions={actions}
  title="빠른 작업"
  columns={{ xs: 6, sm: 4, md: 4 }}
/>`}
          </Box>
        </Paper>

        {/* Without Description */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Without Description
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Compact version without descriptions.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <QuickActionGrid
              actions={ecommerceActions}
              title="E-commerce"
              columns={{ xs: 4, sm: 4, md: 2 }}
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
            {`const actions: QuickAction[] = [
  { id: 'dashboard', title: 'Dashboard', icon: Dashboard, href: '#', color: '#6366f1' },
  { id: 'orders', title: 'Orders', icon: ShoppingCart, href: '#', color: '#10b981' }
];

<QuickActionGrid actions={actions} columns={{ xs: 4, sm: 4, md: 2 }} />`}
          </Box>
        </Paper>

        {/* Column Configuration */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Column Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize grid columns for different screen sizes using MUI Grid breakpoints (xs=12, sm=6, md=4, lg=3).
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              columns: {'{ xs: 12, sm: 6, md: 4, lg: 3 }'} (1 per row on mobile, 2 on tablet, 3 on desktop, 4 on large)
            </Typography>
            <QuickActionGrid
              actions={toolsActions}
              columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              columns: {'{ xs: 6, sm: 3 }'} (2 per row on mobile, 4 on tablet+)
            </Typography>
            <QuickActionGrid
              actions={toolsActions}
              columns={{ xs: 6, sm: 3 }}
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
            {`// MUI Grid breakpoints (out of 12 columns)
// xs: 12 = 1 item per row
// xs: 6 = 2 items per row
// xs: 4 = 3 items per row
// xs: 3 = 4 items per row

<QuickActionGrid
  actions={actions}
  columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
/>`}
          </Box>
        </Paper>

        {/* Grid Spacing */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Grid Spacing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Adjust spacing between grid items.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                spacing: 1
              </Typography>
              <QuickActionGrid
                actions={ecommerceActions.slice(0, 4)}
                columns={{ xs: 6, sm: 3 }}
                spacing={1}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                spacing: 2 (Default: 1.5)
              </Typography>
              <QuickActionGrid
                actions={ecommerceActions.slice(0, 4)}
                columns={{ xs: 6, sm: 3 }}
                spacing={2}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                spacing: 3
              </Typography>
              <QuickActionGrid
                actions={ecommerceActions.slice(0, 4)}
                columns={{ xs: 6, sm: 3 }}
                spacing={3}
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
            {`<QuickActionGrid actions={actions} spacing={2} />`}
          </Box>
        </Paper>

        {/* Disabled Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disabled Actions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Mark certain actions as disabled.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <QuickActionGrid
              actions={withDisabledActions}
              columns={{ xs: 6, sm: 3 }}
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
            {`const actions: QuickAction[] = [
  { id: 'active', title: 'Active Action', icon: Dashboard, href: '#' },
  {
    id: 'disabled',
    title: 'Coming Soon',
    description: 'Feature in development',
    icon: Build,
    href: '#',
    disabled: true  // Prevents click and shows disabled style
  }
];`}
          </Box>
        </Paper>

        {/* Default Color */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Default Color
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Set a default color for actions without a custom color.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <QuickActionGrid
              actions={[
                { id: '1', title: 'Action 1', icon: Dashboard, href: '#' },
                { id: '2', title: 'Action 2', icon: Settings, href: '#' },
                { id: '3', title: 'Custom Color', icon: Shield, href: '#', color: '#ef4444' },
                { id: '4', title: 'Action 4', icon: Build, href: '#' }
              ]}
              columns={{ xs: 6, sm: 3 }}
              defaultColor="#10b981"
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
            {`<QuickActionGrid
  actions={actions}
  defaultColor="#10b981"  // Applied to actions without color prop
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
            <QuickActionGrid
              actions={basicActions}
              title="빠른 작업"
              columns={{ xs: 6, sm: 4 }}
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
            {`<QuickActionGrid actions={actions} loading={true} />`}
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
            {`import QuickActionGrid, { QuickAction } from '@/components/common/QuickActionGrid';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            QuickAction Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>id</code>?: string - Unique identifier</li>
            <li><code>title</code>: string - Action title</li>
            <li><code>description</code>?: string - Optional description text</li>
            <li><code>icon</code>: ComponentType - MUI icon component</li>
            <li><code>href</code>: string - Navigation link</li>
            <li><code>color</code>?: string - Accent color</li>
            <li><code>disabled</code>?: boolean - Disable the action</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            QuickActionGridProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>actions</code>: QuickAction[] - Array of actions</li>
            <li><code>loading</code>?: boolean - Loading state</li>
            <li><code>title</code>?: string - Grid title</li>
            <li><code>columns</code>?: {'{ xs?: number; sm?: number; md?: number; lg?: number }'} - Grid columns (default: {'{ xs: 6, sm: 4 }'})</li>
            <li><code>spacing</code>?: number - Grid spacing (default: 1.5)</li>
            <li><code>defaultColor</code>?: string - Default action color (default: #6366f1)</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
