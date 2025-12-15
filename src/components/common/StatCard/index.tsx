'use client';

import React, { memo } from 'react';
import { Box, Typography, Skeleton, SvgIconProps } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

// Color Palette
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  gradients: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    teal: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)'
  }
};

export interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle/description */
  subValue?: string;
  /** Icon component to display */
  icon?: React.ComponentType<SvgIconProps>;
  /** Gradient background for accent (top border and icon) */
  gradient?: string;
  /** Solid color for accent (alternative to gradient) */
  color?: string;
  /** Trend indicator */
  trend?: {
    value: number;
    label?: string;
  };
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Compact mode for mobile */
  compact?: boolean;
}

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  gradient,
  color,
  trend,
  loading = false,
  onClick,
  compact = false
}: StatCardProps) {
  const accentGradient = gradient || (color ? `linear-gradient(135deg, ${color} 0%, ${color}99 100%)` : COLORS.gradients.primary);

  if (loading) {
    return (
      <Box
        sx={{
          p: compact ? 1.5 : 2.5,
          borderRadius: compact ? 2 : 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Skeleton variant="text" width={compact ? 60 : 80} height={compact ? 16 : 20} />
        <Skeleton variant="text" width={compact ? 70 : 100} height={compact ? 28 : 40} sx={{ my: compact ? 0.5 : 1 }} />
        <Skeleton variant="text" width={compact ? 50 : 60} height={compact ? 14 : 16} />
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        p: compact ? 1.5 : 2.5,
        borderRadius: compact ? 2 : 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: compact ? 'none' : 'translateY(-4px)',
          boxShadow: compact ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: compact ? 3 : 4,
          background: accentGradient
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: compact ? '0.6rem' : '0.7rem',
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              mb: compact ? 0.25 : 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: compact ? '1.1rem' : '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              mb: compact ? 0.25 : 0.5
            }}
          >
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            {trend !== undefined && !compact && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.25,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: trend.value >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                }}
              >
                {trend.value >= 0 ? (
                  <TrendingUp sx={{ fontSize: 12, color: COLORS.success }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 12, color: COLORS.error }} />
                )}
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: trend.value >= 0 ? COLORS.success : COLORS.error
                  }}
                >
                  {trend.value >= 0 ? '+' : ''}
                  {trend.value}%
                </Typography>
              </Box>
            )}
            {subValue && (
              <Typography
                sx={{
                  fontSize: compact ? '0.6rem' : '0.7rem',
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {subValue}
              </Typography>
            )}
          </Box>
        </Box>
        {Icon && !compact && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: accentGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Export preset gradients for convenience
export const StatCardGradients = COLORS.gradients;
export const StatCardColors = COLORS;

export default memo(StatCard);
