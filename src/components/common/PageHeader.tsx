'use client';

/**
 * PageHeader — the new top-of-page pattern for every admin/content surface.
 *
 * Replaces the ad-hoc `<Typography variant="h4">Title</Typography>` pattern
 * found across the 20+ admin pages. Standardizes:
 *   - Breadcrumb (ALL CAPS overline)
 *   - Page title (h2)
 *   - Subtitle (optional)
 *   - KPI strip (optional) — small numbers + labels inline
 *   - Right-side actions (slot for Primary button + secondary actions)
 *
 * BACKWARD COMPATIBILITY:
 *   Also accepts the legacy props from PageHeader/index.tsx
 *   (useMenu, showBreadcrumb, compact, description) so existing callers
 *   don't need to be updated immediately.
 *
 * USAGE (new design system style)
 *   <PageHeader
 *     breadcrumb={['Admin', '사용자']}
 *     title="사용자 관리"
 *     subtitle="역할 매핑, 부서 이동, 권한 회수"
 *     kpis={[
 *       { label: 'Total', value: 248 },
 *       { label: 'Active', value: 231, tone: 'success' },
 *       { label: 'Suspended', value: 17, tone: 'danger' },
 *     ]}
 *     actions={<Button variant="contained">+ 추가</Button>}
 *   />
 *
 * USAGE (legacy style — still works)
 *   <PageHeader useMenu showBreadcrumb />
 *   <PageHeader title="My Page" description="Some description" />
 */

import React, { useEffect } from 'react';
import { Box, Stack, Typography, Breadcrumbs, Link, useTheme } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import { useMenu } from '@/hooks/useMenu';
import type { MenuItem } from '@/types/menu';

export interface PageHeaderKpi {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface PageHeaderProps {
  // New design system props
  breadcrumb?: string[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  kpis?: PageHeaderKpi[];
  actions?: React.ReactNode;
  meta?: React.ReactNode; // updated-at, owner, etc — small right-aligned text

  // Legacy props (backward compat with PageHeader/index.tsx callers)
  description?: string;
  useMenu?: boolean;
  menu?: MenuItem;
  showBreadcrumb?: boolean;
  compact?: boolean;
}

export default function PageHeader({
  breadcrumb,
  title,
  subtitle,
  kpis,
  actions,
  meta,
  description,
  useMenu: useMenuMode = false,
  menu: menuProp,
  showBreadcrumb = false,
  compact = false,
}: PageHeaderProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const locale = useCurrentLocale();
  const { getMenuByPath, menus, currentMenu } = useMenu();

  // Legacy: auto-fetch menu based on current path
  useEffect(() => {
    if (useMenuMode && pathname) {
      const cleanPath = pathname.replace(`/${locale}`, '');
      void getMenuByPath(cleanPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMenuMode, pathname, locale]);

  // Legacy: determine which menu to use
  const activeMenu = menuProp || currentMenu;

  // Resolve title: new prop > legacy menu > legacy title prop
  const resolvedTitle = title ?? (activeMenu
    ? activeMenu.name[locale as 'en' | 'ko']
    : undefined);

  // Resolve subtitle/description
  const resolvedSubtitle = subtitle ?? (activeMenu
    ? activeMenu.description[locale as 'en' | 'ko']
    : description);

  const toneColor = (tone?: PageHeaderKpi['tone']) => {
    switch (tone) {
      case 'success': return (theme.palette as any).status?.success;
      case 'warning': return (theme.palette as any).status?.warning;
      case 'danger':  return (theme.palette as any).status?.error;
      case 'info':    return (theme.palette as any).status?.info;
      default:        return theme.palette.text.primary;
    }
  };

  // Legacy: build breadcrumb from menu tree
  const getLegacyBreadcrumb = () => {
    if (!activeMenu || !showBreadcrumb) return null;
    const breadcrumbItems: MenuItem[] = [];
    const findParents = (menu: MenuItem) => {
      if (menu.parentId) {
        const parent = menus.find(m => m.id === menu.parentId);
        if (parent) {
          breadcrumbItems.unshift(parent);
          findParents(parent);
        }
      }
    };
    if (activeMenu.parentId) findParents(activeMenu);
    breadcrumbItems.push(activeMenu);
    return (
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" sx={{ fontSize: compact ? 14 : 16 }} />}
        sx={{ mb: compact ? 0 : 1 }}
      >
        {breadcrumbItems.map((item, index) =>
          index === breadcrumbItems.length - 1 ? (
            <Typography key={item.id} color="text.primary" fontSize={compact ? '0.75rem' : '0.875rem'}>
              {item.name[locale as 'en' | 'ko']}
            </Typography>
          ) : (
            <Link key={item.id} color="inherit" href={`/${locale}${item.path}`} underline="hover" fontSize={compact ? '0.75rem' : '0.875rem'}>
              {item.name[locale as 'en' | 'ko']}
            </Link>
          )
        )}
      </Breadcrumbs>
    );
  };

  // Legacy compact mode: only breadcrumb
  if (compact) {
    return (
      <Box sx={{ mb: 0.5, flexShrink: 0 }}>
        {showBreadcrumb && getLegacyBreadcrumb()}
      </Box>
    );
  }

  // Legacy mode: useMenu/showBreadcrumb without new-style breadcrumb array
  if (useMenuMode && !breadcrumb) {
    return (
      <Box sx={{ mb: 1.5, flexShrink: 0 }}>
        {showBreadcrumb && getLegacyBreadcrumb()}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                {resolvedTitle}
              </Typography>
              {resolvedSubtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: { xs: 'none', sm: 'inline' } }}>
                  {String(resolvedSubtitle)}
                </Typography>
              )}
            </Box>
          </Box>
          {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
        </Box>
      </Box>
    );
  }

  // New design system render
  return (
    <Box
      sx={{
        py: 3,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <Typography variant="overline" color="text.secondary">
          {breadcrumb.join('  ／  ')}
        </Typography>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="h2" sx={{ mb: resolvedSubtitle ? 0.5 : 0 }}>
            {resolvedTitle}
          </Typography>
          {resolvedSubtitle && (
            <Typography variant="body1" color="text.secondary">
              {resolvedSubtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
      </Stack>

      {(kpis || meta) && (
        <Stack direction="row" alignItems="baseline" gap={3} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {kpis?.map((k, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
              <Typography
                component="span"
                sx={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                  color: toneColor(k.tone),
                  letterSpacing: '-0.01em',
                }}
              >
                {k.value}
              </Typography>
              <Typography variant="caption" color="text.tertiary" sx={{ textTransform: 'lowercase' }}>
                {k.label}
              </Typography>
            </Box>
          ))}
          <Box sx={{ flex: 1 }} />
          {meta && (
            <Typography variant="overline" color="text.tertiary" sx={{ fontFamily: 'var(--font-mono)' }}>
              {meta}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}
