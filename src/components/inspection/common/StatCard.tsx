'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
  CardProps,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface StatCardProps extends Omit<CardProps, 'title'> {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
  loading?: boolean;
  locale?: string;
  onClick?: () => void;
}

/**
 * Reusable Stat Card Component for Dashboards
 * Displays KPI with optional trend indicator
 */
export default function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  trendLabel,
  subtitle,
  loading = false,
  locale = 'ko',
  onClick,
  sx,
  ...cardProps
}: StatCardProps) {
  const defaultTrendLabel = getLocalizedValue(
    { ko: '전 기간 대비', en: 'vs last period', zh: '与上期相比', vi: 'so với kỳ trước' },
    locale
  );

  if (loading) {
    return (
      <Card sx={{ height: '100%', ...sx }} {...cardProps}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={80} height={40} />
              <Skeleton variant="text" width={120} height={16} />
            </Box>
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          : {},
        ...sx,
      }}
      onClick={onClick}
      {...cardProps}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            {/* Title */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>

            {/* Value */}
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
              {typeof value === 'number' ? value.toLocaleString(locale) : value}
            </Typography>

            {/* Subtitle */}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}

            {/* Trend Indicator */}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend >= 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend >= 0 ? 'success.main' : 'error.main',
                    ml: 0.5,
                  }}
                >
                  {Math.abs(trend)}% {trendLabel || defaultTrendLabel}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Icon */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
