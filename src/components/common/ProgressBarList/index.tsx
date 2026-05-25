'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography, Skeleton, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/theme';

// Default color palette — sourced from design tokens
const DEFAULT_COLORS = [
  tokens.accent[500],
  tokens.accent[400],
  tokens.accent[300],
  tokens.accent[600],
  tokens.accent[700],
  tokens.status.success,
  tokens.status.warning,
];

export interface ProgressBarItem {
  /** Unique identifier */
  id?: string | number;
  /** Display label */
  label: string;
  /** Secondary label (optional) */
  subLabel?: string;
  /** Current value */
  value: number;
  /** Maximum value (for percentage calculation) */
  max?: number;
  /** Custom color */
  color?: string;
  /** Additional metadata to display */
  meta?: string | number;
}

export interface ProgressBarListProps {
  /** Array of items to display */
  items: ProgressBarItem[];
  /** Loading state */
  loading?: boolean;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show value text */
  showValue?: boolean;
  /** Custom color palette (cycles through) */
  colors?: string[];
  /** Progress bar height */
  barHeight?: number;
  /** Maximum items to show */
  maxItems?: number;
  /** Title for the list */
  title?: string;
  /** Format function for value display */
  formatValue?: (value: number) => string;
  /** Format function for meta display */
  formatMeta?: (meta: string | number) => string;
}

function ProgressBarList({
  items,
  loading = false,
  showPercentage = true,
  showValue = true,
  colors = DEFAULT_COLORS,
  barHeight = 6,
  maxItems,
  title,
  formatValue = (v) => v.toLocaleString(),
  formatMeta
}: ProgressBarListProps) {
  const theme = useTheme();
  const maxValue = useMemo(() => {
    return Math.max(...items.map((item) => item.max ?? item.value), 1);
  }, [items]);

  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  if (loading) {
    return (
      <Box>
        {title && <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />}
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Skeleton variant="text" width="50%" height={18} />
              <Skeleton variant="text" width="15%" height={18} />
            </Box>
            <Skeleton variant="rectangular" height={barHeight} sx={{ borderRadius: barHeight / 2 }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box>
        {title && (
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 2 }}>
            {title}
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center', py: 4 }}>
          데이터가 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {displayItems.map((item, index) => {
          const itemMax = item.max ?? maxValue;
          const percentage = (item.value / itemMax) * 100;
          const color = item.color || colors[index % colors.length];

          return (
            <Box key={item.id ?? index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: color,
                      flexShrink: 0
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.label}
                  </Typography>
                  {item.subLabel && (
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      ({item.subLabel})
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  {item.meta !== undefined && (
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      {formatMeta ? formatMeta(item.meta) : item.meta}
                    </Typography>
                  )}
                  {showValue && (
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color }}>
                      {formatValue(item.value)}
                    </Typography>
                  )}
                  {showPercentage && (
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', minWidth: 40, textAlign: 'right' }}>
                      ({percentage.toFixed(1)}%)
                    </Typography>
                  )}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{
                  height: barHeight,
                  borderRadius: barHeight / 2,
                  bgcolor: theme.palette.action.hover,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: barHeight / 2,
                    bgcolor: color
                  }
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export { DEFAULT_COLORS as ProgressBarColors };
export default memo(ProgressBarList);
