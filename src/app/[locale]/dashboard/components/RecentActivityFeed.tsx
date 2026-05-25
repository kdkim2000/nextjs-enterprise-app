'use client';

import React, { useState, memo, useMemo, useCallback } from 'react';
import { Box, Typography, Skeleton, SvgIconProps } from '@mui/material';
import { Article, Comment, Error as ErrorIcon, Login, MoreHoriz } from '@mui/icons-material';
import FilterTabs from '@/components/common/FilterTabs';
import ActivityTimeline, { ActivityItem, ActivityTypeConfig } from '@/components/common/ActivityTimeline';
import { RecentActivityItem } from '../types';
import { cardStyle, cardContentStyle } from '../styles';
import { chartColors } from './charts/themeColors';

interface RecentActivityFeedProps {
  data: RecentActivityItem[];
  loading: boolean;
}

type ActivityFilter = 'all' | 'post' | 'comment' | 'error';

const FILTER_TABS: { value: ActivityFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'post', label: '게시글' },
  { value: 'comment', label: '댓글' },
  { value: 'error', label: '시스템' }
];

const ACTIVITY_TYPE_CONFIG: Record<string, ActivityTypeConfig> = {
  post: { icon: Article, color: chartColors.info },
  comment: { icon: Comment, color: chartColors.success },
  error: { icon: ErrorIcon, color: chartColors.danger },
  login: { icon: Login, color: chartColors.warning },
};

function RecentActivityFeed({ data, loading }: RecentActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filteredData = useMemo(() => {
    return filter === 'all' ? data : data.filter((item) => item.type === filter);
  }, [data, filter]);

  const activityItems = useMemo<ActivityItem[]>(() => {
    return filteredData.map((item) => ({
      id: item.id ?? undefined,
      type: item.type,
      user: item.user,
      action: item.action,
      target: item.target,
      meta: item.meta ?? undefined,
      timestamp: item.timestamp
    }));
  }, [filteredData]);

  const handleFilterChange = useCallback((newFilter: ActivityFilter) => {
    setFilter(newFilter);
  }, []);

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <Skeleton variant="text" width={120} height={24} />
          <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 2 }}>
            <FilterTabs tabs={[]} value="all" onChange={() => {}} loading />
          </Box>
          <ActivityTimeline items={[]} loading />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ ...cardContentStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
            최근 활동
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <Typography variant="caption">더보기</Typography>
            <MoreHoriz sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FilterTabs
            tabs={FILTER_TABS}
            value={filter}
            onChange={handleFilterChange}
            activeColor={chartColors.primary[0]}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <ActivityTimeline
            items={activityItems}
            typeConfig={ACTIVITY_TYPE_CONFIG}
            emptyMessage="활동 내역이 없습니다."
          />
        </Box>
      </Box>
    </Box>
  );
}

export default memo(RecentActivityFeed);
