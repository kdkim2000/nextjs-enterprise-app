'use client';

/**
 * KpiCard — dashboard KPI tile in the new visual language.
 *
 * Replaces card-with-shadow + colored icon circle patterns. The new look:
 *   - No drop shadow. Hairline border only.
 *   - Big tabular-nums value
 *   - ALL CAPS overline label
 *   - Optional trend indicator (delta vs previous period)
 *   - Optional sparkline slot (children)
 *
 * USAGE
 *   <KpiCard
 *     label="Total Sessions"
 *     value={12480}
 *     delta={{ value: 8.2, unit: '%', direction: 'up' }}
 *   />
 */

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export interface KpiDelta {
  value: number;
  unit?: string;        // %, pp, hr…
  direction: 'up' | 'down' | 'flat';
  tone?: 'positive' | 'negative' | 'neutral'; // semantic colorization
}

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  delta?: KpiDelta;
  hint?: string;        // small caption below value
  children?: React.ReactNode; // sparkline slot
  onClick?: () => void;
}

export default function KpiCard({ label, value, delta, hint, children, onClick }: KpiCardProps) {
  const theme = useTheme();

  const deltaColor = () => {
    if (!delta) return undefined;
    const tone = delta.tone ?? (delta.direction === 'up' ? 'positive' : delta.direction === 'down' ? 'negative' : 'neutral');
    if (tone === 'positive') return (theme.palette as any).status?.success;
    if (tone === 'negative') return (theme.palette as any).status?.error;
    return theme.palette.text.tertiary;
  };

  const deltaGlyph = delta?.direction === 'up' ? '↑' : delta?.direction === 'down' ? '↓' : '→';

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        cursor: onClick ? 'pointer' : 'default',
        transition: theme => `border-color ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeOut}`,
        '&:hover': onClick ? { borderColor: 'text.secondary' } : undefined,
      }}
    >
      <Typography
        variant="overline"
        color="text.tertiary"
        sx={{ display: 'block', mb: 1 }}
      >
        {label}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: hint ? 0.5 : 0 }}>
        <Typography
          component="span"
          sx={{
            fontFamily: 'var(--font-mono)',
            fontSize: '2rem',
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>

        {delta && (
          <Typography
            component="span"
            sx={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: deltaColor(),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {deltaGlyph} {Math.abs(delta.value)}{delta.unit ?? ''}
          </Typography>
        )}
      </Box>

      {hint && (
        <Typography variant="caption" color="text.tertiary">
          {hint}
        </Typography>
      )}

      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Box>
  );
}
