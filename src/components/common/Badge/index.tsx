'use client';

import React, { ReactNode } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

export function useCategoryConfigs(): Record<string, CategoryConfig> {
  const theme = useTheme();
  const p = theme.palette as any;
  return {
    'bug-fix': { icon: <BugReport sx={{ fontSize: 16 }} />, color: p.status?.error ?? theme.palette.error.main, label: 'Bug Fix' },
    feature: { icon: <Build sx={{ fontSize: 16 }} />, color: p.status?.success ?? theme.palette.success.main, label: 'Feature' },
    refactor: { icon: <Code sx={{ fontSize: 16 }} />, color: p.role?.moderator ?? theme.palette.secondary.main, label: 'Refactor' },
    debugging: { icon: <Psychology sx={{ fontSize: 16 }} />, color: p.status?.warning ?? theme.palette.warning.main, label: 'Debugging' },
    performance: { icon: <Speed sx={{ fontSize: 16 }} />, color: p.status?.info ?? theme.palette.info.main, label: 'Performance' },
    general: { icon: <Chat sx={{ fontSize: 16 }} />, color: theme.palette.text.secondary, label: 'General' }
  };
}

// Keep static export for backward-compat (uses raw tokens as fallback)
import { tokens } from '@/theme';
export const categoryConfigs: Record<string, CategoryConfig> = {
  'bug-fix': { icon: <BugReport sx={{ fontSize: 16 }} />, color: tokens.status.danger, label: 'Bug Fix' },
  feature: { icon: <Build sx={{ fontSize: 16 }} />, color: tokens.status.success, label: 'Feature' },
  refactor: { icon: <Code sx={{ fontSize: 16 }} />, color: tokens.role.moderator, label: 'Refactor' },
  debugging: { icon: <Psychology sx={{ fontSize: 16 }} />, color: tokens.status.warning, label: 'Debugging' },
  performance: { icon: <Speed sx={{ fontSize: 16 }} />, color: tokens.status.info, label: 'Performance' },
  general: { icon: <Chat sx={{ fontSize: 16 }} />, color: tokens.ink.tertiary, label: 'General' }
};

// Difficulty colors (static for non-component use — uses tokens)
export const difficultyColors: Record<string, string> = {
  easy: tokens.status.success,
  medium: tokens.status.warning,
  hard: tokens.status.danger
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
  const configs = useCategoryConfigs();
  const config = configs[category] || configs.general;

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
  const theme = useTheme();
  const p = theme.palette as any;
  const themeDifficultyColors: Record<string, string> = {
    easy: p.status?.success ?? theme.palette.success.main,
    medium: p.status?.warning ?? theme.palette.warning.main,
    hard: p.status?.error ?? theme.palette.error.main
  };
  const color = themeDifficultyColors[difficulty] || themeDifficultyColors.medium;

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
export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const theme = useTheme();
  const p = theme.palette as any;
  const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: `${p.status?.success ?? theme.palette.success.main}20`, color: p.status?.success ?? theme.palette.success.main },
    completed: { bg: `${theme.palette.primary.main}20`, color: theme.palette.primary.main },
    pending: { bg: `${p.status?.warning ?? theme.palette.warning.main}20`, color: p.status?.warning ?? theme.palette.warning.main },
    error: { bg: `${p.status?.error ?? theme.palette.error.main}20`, color: p.status?.error ?? theme.palette.error.main },
    inactive: { bg: theme.palette.action.hover, color: theme.palette.text.secondary }
  };
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
