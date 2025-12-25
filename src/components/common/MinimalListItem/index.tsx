'use client';

import React, { ReactNode } from 'react';
import { Box, Typography, IconButton, alpha, useTheme } from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';

export interface MinimalListItemProps {
  /** Primary text (title) */
  title: string;
  /** Secondary text (subtitle) */
  subtitle?: string;
  /** Optional caption text */
  caption?: string;
  /** Left content (icon, avatar, etc.) */
  leftContent?: ReactNode;
  /** Right content (badge, action, etc.) */
  rightContent?: ReactNode;
  /** Status indicator color */
  statusColor?: 'success' | 'warning' | 'error' | 'info' | 'default';
  /** Show chevron arrow */
  showChevron?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Dense padding */
  dense?: boolean;
  /** Action buttons to show on hover (desktop) or always (mobile) */
  actions?: ReactNode;
}

const statusColors = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  default: '#9ca3af',
};

/**
 * MinimalListItem - A clean, minimal list item component
 *
 * Inspired by iOS design language with focus on:
 * - Clean typography hierarchy
 * - Subtle visual indicators
 * - Minimal visual noise
 * - Touch-friendly tap targets
 */
export default function MinimalListItem({
  title,
  subtitle,
  caption,
  leftContent,
  rightContent,
  statusColor,
  showChevron = false,
  onClick,
  disabled = false,
  selected = false,
  dense = false,
  actions,
}: MinimalListItemProps) {
  const theme = useTheme();

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: dense ? 1 : 1.5,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.06)
          : 'transparent',
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.5),
        cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s ease',
        '&:hover': onClick && !disabled ? {
          bgcolor: alpha(theme.palette.action.hover, 0.04),
        } : {},
        '&:active': onClick && !disabled ? {
          bgcolor: alpha(theme.palette.action.hover, 0.08),
        } : {},
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      {/* Status indicator dot */}
      {statusColor && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: statusColors[statusColor],
            flexShrink: 0,
          }}
        />
      )}

      {/* Left content */}
      {leftContent && (
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {leftContent}
        </Box>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: dense ? '0.8125rem' : '0.875rem',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mt: 0.25,
              fontSize: '0.75rem',
            }}
          >
            {subtitle}
          </Typography>
        )}
        {caption && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              display: 'block',
              fontSize: '0.6875rem',
              mt: 0.25,
            }}
          >
            {caption}
          </Typography>
        )}
      </Box>

      {/* Right content */}
      {rightContent && (
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {rightContent}
        </Box>
      )}

      {/* Actions */}
      {actions && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </Box>
      )}

      {/* Chevron */}
      {showChevron && onClick && (
        <ChevronRightIcon
          sx={{
            color: 'text.disabled',
            fontSize: 20,
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  );
}

/**
 * MinimalListSection - Section header for grouping list items
 */
export function MinimalListSection({
  title,
  action
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: 'text.secondary',
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </Typography>
      {action}
    </Box>
  );
}

/**
 * MinimalBadge - Small badge for status/count display
 */
export function MinimalBadge({
  label,
  color = 'default',
}: {
  label: string | number;
  color?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
}) {
  const theme = useTheme();

  const colorMap = {
    success: { bg: alpha('#22c55e', 0.1), text: '#16a34a' },
    warning: { bg: alpha('#f59e0b', 0.1), text: '#d97706' },
    error: { bg: alpha('#ef4444', 0.1), text: '#dc2626' },
    info: { bg: alpha('#3b82f6', 0.1), text: '#2563eb' },
    primary: { bg: alpha(theme.palette.primary.main, 0.1), text: theme.palette.primary.main },
    default: { bg: alpha('#6b7280', 0.1), text: '#4b5563' },
  };

  const colors = colorMap[color];

  return (
    <Box
      sx={{
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        bgcolor: colors.bg,
        color: colors.text,
        fontSize: '0.6875rem',
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      {label}
    </Box>
  );
}
