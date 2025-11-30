'use client';

import React, { memo } from 'react';
import { Box, Typography, Skeleton, Avatar, SvgIconProps } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { formatDistanceToNow, Locale } from 'date-fns';
import { ko } from 'date-fns/locale';

// Default colors
const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

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

const defaultTypeConfig: ActivityTypeConfig = {
  icon: Schedule,
  color: COLORS.info,
  bgColor: `${COLORS.info}15`
};

function ActivityTimeline({
  items,
  loading = false,
  emptyMessage = '활동 내역이 없습니다.',
  typeConfig = {},
  defaultConfig = defaultTypeConfig,
  maxItems,
  showTimestamp = true,
  locale = ko,
  formatTimestamp
}: ActivityTimelineProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  const getConfig = (type: string): ActivityTypeConfig => {
    const config = typeConfig[type] || defaultConfig;
    return {
      ...config,
      bgColor: config.bgColor || `${config.color}15`
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
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{emptyMessage}</Typography>
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
                bgcolor: 'rgba(0, 0, 0, 0.02)'
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
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>
                  {activity.user}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {activity.action}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {activity.target && (
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
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
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      fontSize: '0.6rem',
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
                sx={{
                  fontSize: '0.65rem',
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

export { COLORS as ActivityTimelineColors };
export default memo(ActivityTimeline);
