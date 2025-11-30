'use client';

import React, { memo, ReactNode } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';

// Default ranking colors (Gold, Silver, Bronze, then gray)
const DEFAULT_RANK_COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];
const DEFAULT_OTHER_COLOR = 'rgba(0, 0, 0, 0.08)';

export interface RankedItem {
  /** Unique identifier */
  id: string | number;
  /** Primary display text */
  title: string;
  /** Secondary info (e.g., category, author) */
  subtitle?: string;
  /** Tertiary info */
  meta?: string;
  /** Primary metric value */
  value?: number | string;
  /** Secondary metric value */
  secondaryValue?: number | string;
}

export interface RankedListProps<T extends RankedItem = RankedItem> {
  /** Array of items to display (already sorted by rank) */
  items: T[];
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of top items to highlight (default: 3) */
  topHighlight?: number;
  /** Colors for top ranks */
  rankColors?: string[];
  /** Color for non-highlighted items */
  otherColor?: string;
  /** Title for the list */
  title?: string;
  /** Custom render function for item content */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Custom render function for metrics section */
  renderMetrics?: (item: T) => ReactNode;
  /** Format function for primary value */
  formatValue?: (value: number | string) => string;
  /** Format function for secondary value */
  formatSecondaryValue?: (value: number | string) => string;
  /** Click handler */
  onItemClick?: (item: T) => void;
}

function RankedList<T extends RankedItem = RankedItem>({
  items,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  topHighlight = 3,
  rankColors = DEFAULT_RANK_COLORS,
  otherColor = DEFAULT_OTHER_COLOR,
  title,
  renderItem,
  renderMetrics,
  formatValue = (v) => (typeof v === 'number' ? v.toLocaleString() : v),
  formatSecondaryValue = (v) => (typeof v === 'number' ? v.toLocaleString() : v),
  onItemClick
}: RankedListProps<T>) {
  const getRankColor = (index: number) => {
    if (index < topHighlight && index < rankColors.length) {
      return rankColors[index];
    }
    return otherColor;
  };

  const isHighlighted = (index: number) => index < topHighlight;

  if (loading) {
    return (
      <Box>
        {title && <Skeleton variant="text" width={140} height={24} sx={{ mb: 2 }} />}
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" height={56} sx={{ mb: 1, borderRadius: 1.5 }} />
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
          {emptyMessage}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item, index) => {
          const rankColor = getRankColor(index);
          const highlighted = isHighlighted(index);

          return (
            <Box
              key={item.id}
              onClick={() => onItemClick?.(item)}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s',
                cursor: onItemClick ? 'pointer' : 'default',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {/* Rank Badge */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: rankColor,
                  color: highlighted ? '#fff' : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {index + 1}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {renderItem ? (
                  renderItem(item, index)
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {item.subtitle && (
                        <Typography
                          sx={{
                            fontSize: '0.65rem',
                            color: 'text.secondary',
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                          }}
                        >
                          {item.subtitle}
                        </Typography>
                      )}
                      {item.meta && (
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                          {item.meta}
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </Box>

              {/* Metrics */}
              {renderMetrics ? (
                renderMetrics(item)
              ) : (
                (item.value !== undefined || item.secondaryValue !== undefined) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    {item.value !== undefined && (
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>
                        {formatValue(item.value)}
                      </Typography>
                    )}
                    {item.secondaryValue !== undefined && (
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {formatSecondaryValue(item.secondaryValue)}
                      </Typography>
                    )}
                  </Box>
                )
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export { DEFAULT_RANK_COLORS as RankedListColors };
export default memo(RankedList) as <T extends RankedItem = RankedItem>(
  props: RankedListProps<T>
) => React.ReactElement;
