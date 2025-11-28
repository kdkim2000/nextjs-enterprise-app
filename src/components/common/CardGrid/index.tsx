'use client';

import React, { ReactNode } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Pagination,
  Skeleton
} from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';

// Grid column configuration by breakpoint
export interface GridColumns {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

// Card Grid Props
export interface CardGridProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  loading?: boolean;
  skeletonCount?: number;
  renderSkeleton?: () => ReactNode;
  columns?: GridColumns;
  spacing?: number;
  // Pagination
  pagination?: {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
  };
  // Empty state
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  // Container style
  sx?: object;
}

// Default skeleton card
function DefaultSkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={60} height={24} />
      </Box>
      <Skeleton variant="text" width="90%" height={28} />
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="rounded" width={70} height={20} />
        <Skeleton variant="rounded" width={70} height={20} />
      </Box>
    </Paper>
  );
}

// Empty state component
function EmptyState({
  icon,
  title,
  description
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: 3,
        bgcolor: 'grey.50',
        border: '1px dashed',
        borderColor: 'grey.300'
      }}
    >
      <Box sx={{ color: 'grey.400', mb: 2 }}>
        {icon || <SentimentDissatisfied sx={{ fontSize: 64 }} />}
      </Box>
      <Typography variant="h6" color="text.secondary" fontWeight={500} gutterBottom>
        {title || 'No items found'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description || 'Try adjusting your search or filters'}
      </Typography>
    </Paper>
  );
}

export default function CardGrid<T>({
  items,
  renderCard,
  loading = false,
  skeletonCount = 6,
  renderSkeleton,
  columns = { xs: 12, sm: 6, md: 4 },
  spacing = 2.5,
  pagination,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  sx
}: CardGridProps<T>) {
  // Render loading skeletons
  if (loading) {
    return (
      <Box sx={sx}>
        <Grid container spacing={spacing}>
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <Grid item key={idx} {...columns}>
              {renderSkeleton ? renderSkeleton() : <DefaultSkeleton />}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Render empty state
  if (items.length === 0) {
    return (
      <Box sx={sx}>
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      </Box>
    );
  }

  // Render items
  return (
    <Box sx={sx}>
      <Grid container spacing={spacing}>
        {items.map((item, index) => (
          <Grid item key={index} {...columns}>
            {renderCard(item, index)}
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(_, value) => pagination.onChange(value)}
            color="primary"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}

// Export a styled card wrapper for consistency
export function CardWrapper({
  children,
  onClick,
  selected = false,
  hoverEffect = true
}: {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  hoverEffect?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        height: '100%',
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'grey.200',
        bgcolor: selected ? 'primary.50' : 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...(hoverEffect &&
          onClick && {
            '&:hover': {
              borderColor: 'primary.light',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
            }
          })
      }}
    >
      {children}
    </Paper>
  );
}

// Stat card component for dashboard-style displays
export function StatCard({
  value,
  label,
  icon,
  color = 'primary'
}: {
  value: string | number;
  label: string;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}) {
  const colorMap = {
    primary: { bg: '#eff6ff', text: '#3b82f6' },
    success: { bg: '#f0fdf4', text: '#22c55e' },
    warning: { bg: '#fffbeb', text: '#f59e0b' },
    error: { bg: '#fef2f2', text: '#ef4444' },
    info: { bg: '#f0f9ff', text: '#0ea5e9' }
  };

  const colors = colorMap[color];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.100',
        bgcolor: colors.bg,
        textAlign: 'center'
      }}
    >
      {icon && (
        <Box sx={{ color: colors.text, mb: 1 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: 'grey.600', mt: 0.5 }}>
        {label}
      </Typography>
    </Paper>
  );
}
