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
 * USAGE
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
 */

import React from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';

export interface PageHeaderKpi {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface PageHeaderProps {
  breadcrumb?: string[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  kpis?: PageHeaderKpi[];
  actions?: React.ReactNode;
  meta?: React.ReactNode; // updated-at, owner, etc — small right-aligned text
}

export default function PageHeader({
  breadcrumb,
  title,
  subtitle,
  kpis,
  actions,
  meta,
}: PageHeaderProps) {
  const theme = useTheme();

  const toneColor = (tone?: PageHeaderKpi['tone']) => {
    switch (tone) {
      case 'success': return (theme.palette as any).status?.success;
      case 'warning': return (theme.palette as any).status?.warning;
      case 'danger':  return (theme.palette as any).status?.error;
      case 'info':    return (theme.palette as any).status?.info;
      default:        return theme.palette.text.primary;
    }
  };

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
          <Typography variant="h2" sx={{ mb: subtitle ? 0.5 : 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
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
            <Typography
              variant="overline"
              color="text.tertiary"
              sx={{ fontFamily: 'var(--font-mono)' }}
            >
              {meta}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}
