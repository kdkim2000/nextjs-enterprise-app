'use client';

import React, { memo } from 'react';
import { Box, Typography, Skeleton, Avatar, SvgIconProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Schedule } from '@mui/icons-material';
import { formatDistanceToNow, Locale } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface ActivityItem {
  /** Unique identifier */
  id?: string | number;
  /** Activity type for icon/color mapping */
  type: string;
  /** Main actor/user name */
  user: string;
  /** Action description */
  action: string;
  /** Target of the action */
  target?: string;
  /** Additional metadata (e.g., category, status) */
  meta?: string;
  /** Timestamp */
  timestamp: string | Date;
}

export interface ActivityTypeConfig {
  icon: React.ComponentType<SvgIconProps>;
  color: string;
  bgColor?: string;
}

export interface ActivityTimelineProps {
  /** Array of activity items */
  items: ActivityItem[];
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Type to icon/color configuration */
  typeConfig?: Record<string, ActivityTypeConfig>;
  /** Default config for unknown types */
  defaultConfig?: ActivityTypeConfig;
  /** Maximum items to show */
  maxItems?: number;
  /** Show timestamps */
  showTimestamp?: boolean;
  /** Locale for date formatting */
  locale?: Locale;
  /** Custom timestamp formatter */
  formatTimestamp?: (date: Date) => string;
}

function ActivityTimeline({
  items,
  loading = false,
  emptyMessage = '활동 내역이 없습니다.',
  typeConfig = {},
  defaultConfig,
  maxItems,
  showTimestamp = true,
  locale = ko,
  formatTimestamp
}: ActivityTimelineProps) {
  const theme = useTheme();
  const p = theme.palette as any;

  const resolvedDefaultConfig: ActivityTypeConfig = defaultConfig ?? {
    icon: Schedule,
    color: p.status?.info ?? theme.palette.info.main,
    bgColor: theme.palette.action.hover,
  };

  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  const getActivityColor = (type: string): string => {
    const t = type.toLowerCase();
    if (t === 'create' || t === 'add' || t === 'success') return p.status?.success ?? theme.palette.success.main;
    if (t === 'update' || t === 'edit' || t === 'modify') return theme.palette.primary.main;
    if (t === 'delete' || t === 'remove' || t === 'danger') return p.status?.error ?? theme.palette.error.main;
    if (t === 'warning' || t === 'alert') return p.status?.warning ?? theme.palette.warning.main;
    if (t === 'info' || t === 'view' || t === 'read') return p.status?.info ?? theme.palette.info.main;
    return theme.palette.text.secondary;
  };

  const getConfig = (type: string): ActivityTypeConfig => {
    const knownColor = getActivityColor(type);
    const config = typeConfig[type] || { ...resolvedDefaultConfig, color: knownColor };
    return {
      ...config,
      bgColor: config.bgColor || theme.palette.action.hover
    };
  };

  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (formatTimestamp) {
      return formatTimestamp(date);
    }
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  if (loading) {
    return (
      <Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={16} />
              <Skeleton variant="text" width="50%" height={14} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {displayItems.map((activity, index) => {
        const config = getConfig(activity.type);
        const IconComponent = config.icon;

        return (
          <Box
            key={activity.id ?? index}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              p: 1.25,
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: theme.palette.action.hover
              }
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: config.bgColor,
                color: config.color
              }}
            >
              <IconComponent sx={{ fontSize: 16 }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {activity.user}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {activity.action}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {activity.target && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 180
                    }}
                  >
                    {activity.target}
                  </Typography>
                )}
                {activity.meta && (
                  <Box
                    component="span"
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: theme.palette.action.hover,
                      fontSize: '0.65rem',
                      color: 'text.secondary'
                    }}
                  >
                    {activity.meta}
                  </Box>
                )}
              </Box>
            </Box>
            {showTimestamp && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                {formatTime(activity.timestamp)}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

import { tokens } from '@/theme';

// Exported color palette for demo/reference pages — sourced from design tokens
export const ActivityTimelineColors = {
  primary: tokens.accent[600] as string,
  success: tokens.status.success,
  warning: tokens.status.warning,
  error:   tokens.status.danger,
  info:    tokens.status.info,
};

export default memo(ActivityTimeline);
