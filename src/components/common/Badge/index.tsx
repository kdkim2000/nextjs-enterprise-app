'use client';

import React, { ReactNode } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  BugReport,
  Build,
  Code,
  Psychology,
  Speed,
  Chat
} from '@mui/icons-material';

// Category configuration
export interface CategoryConfig {
  icon: ReactNode;
  color: string;
  label: string;
}

export const categoryConfigs: Record<string, CategoryConfig> = {
  'bug-fix': { icon: <BugReport sx={{ fontSize: 16 }} />, color: '#ef4444', label: 'Bug Fix' },
  feature: { icon: <Build sx={{ fontSize: 16 }} />, color: '#22c55e', label: 'Feature' },
  refactor: { icon: <Code sx={{ fontSize: 16 }} />, color: '#a855f7', label: 'Refactor' },
  debugging: { icon: <Psychology sx={{ fontSize: 16 }} />, color: '#f97316', label: 'Debugging' },
  performance: { icon: <Speed sx={{ fontSize: 16 }} />, color: '#06b6d4', label: 'Performance' },
  general: { icon: <Chat sx={{ fontSize: 16 }} />, color: '#6b7280', label: 'General' }
};

// Difficulty colors
export const difficultyColors: Record<string, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444'
};

// Props
interface CategoryBadgeProps {
  category: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined' | 'soft';
}

interface DifficultyBadgeProps {
  difficulty: string;
  size?: 'small' | 'medium';
}

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

// Category Badge Component
export function CategoryBadge({ category, size = 'small', variant = 'soft' }: CategoryBadgeProps) {
  const config = categoryConfigs[category] || categoryConfigs.general;

  if (variant === 'soft') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: size === 'small' ? 1.25 : 1.5,
          py: size === 'small' ? 0.375 : 0.5,
          borderRadius: 2,
          bgcolor: `${config.color}12`,
          color: config.color
        }}
      >
        <Box sx={{ display: 'flex', fontSize: size === 'small' ? 14 : 16 }}>
          {config.icon}
        </Box>
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ fontSize: size === 'small' ? '0.7rem' : '0.75rem' }}
        >
          {config.label}
        </Typography>
      </Box>
    );
  }

  return (
    <Chip
      icon={config.icon as React.ReactElement}
      label={config.label}
      size={size}
      variant={variant === 'outlined' ? 'outlined' : 'filled'}
      sx={{
        bgcolor: variant === 'filled' ? config.color : 'transparent',
        color: variant === 'filled' ? 'white' : config.color,
        borderColor: config.color,
        '& .MuiChip-icon': {
          color: variant === 'filled' ? 'white' : config.color
        }
      }}
    />
  );
}

// Difficulty Badge Component
export function DifficultyBadge({ difficulty, size = 'small' }: DifficultyBadgeProps) {
  const color = difficultyColors[difficulty] || difficultyColors.medium;

  return (
    <Chip
      label={difficulty}
      size={size}
      sx={{
        height: size === 'small' ? 22 : 28,
        fontSize: size === 'small' ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        bgcolor: `${color}15`,
        color: color,
        textTransform: 'capitalize',
        border: 'none'
      }}
    />
  );
}

// Generic Status Badge Component
const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: '#16a34a' },
  completed: { bg: '#dbeafe', color: '#2563eb' },
  pending: { bg: '#fef3c7', color: '#d97706' },
  error: { bg: '#fee2e2', color: '#dc2626' },
  inactive: { bg: '#f3f4f6', color: '#6b7280' }
};

export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const colors = statusColors[status.toLowerCase()] || statusColors.inactive;

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        height: size === 'small' ? 22 : 28,
        fontSize: size === 'small' ? '0.7rem' : '0.75rem',
        fontWeight: 500,
        bgcolor: colors.bg,
        color: colors.color,
        textTransform: 'capitalize',
        border: 'none'
      }}
    />
  );
}

// Meta Info Display Component
interface MetaInfoProps {
  icon: ReactNode;
  value: string | number;
  size?: 'small' | 'medium';
}

export function MetaInfo({ icon, value, size = 'small' }: MetaInfoProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        color: 'grey.500'
      }}
    >
      <Box sx={{ display: 'flex', fontSize: size === 'small' ? 14 : 16 }}>
        {icon}
      </Box>
      <Typography variant="caption" sx={{ fontSize: size === 'small' ? '0.75rem' : '0.8rem' }}>
        {value}
      </Typography>
    </Box>
  );
}

// Branch Badge Component
interface BranchBadgeProps {
  branch: string;
  size?: 'small' | 'medium';
}

export function BranchBadge({ branch, size = 'small' }: BranchBadgeProps) {
  if (!branch || branch === 'unknown') return null;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: size === 'small' ? 1 : 1.25,
        py: size === 'small' ? 0.25 : 0.375,
        borderRadius: 1,
        bgcolor: 'grey.100',
        color: 'grey.600'
      }}
    >
      <Code sx={{ fontSize: size === 'small' ? 12 : 14 }} />
      <Typography variant="caption" sx={{ fontSize: size === 'small' ? '0.65rem' : '0.7rem' }}>
        {branch}
      </Typography>
    </Box>
  );
}
