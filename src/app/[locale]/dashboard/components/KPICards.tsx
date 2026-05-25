'use client';

import React, { memo, useMemo } from 'react';
import { Grid, Skeleton, Box } from '@mui/material';
import KpiCard from '@/components/common/KpiCard';
import { DashboardSummary } from '../types';

interface KPICardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

function KPICards({ summary, loading }: KPICardsProps) {
  const cards = useMemo(() => {
    if (!summary) return [];

    const activeRatio =
      summary.users.total > 0
        ? ((summary.users.active / summary.users.total) * 100).toFixed(0)
        : '0';

    return [
      {
        label: '총 사용자',
        value: summary.users.total.toLocaleString(),
        hint: `활성 ${summary.users.active.toLocaleString()}명`,
        delta: summary.users.growth !== undefined
          ? {
              value: Math.abs(summary.users.growth),
              unit: '%',
              direction: (summary.users.growth >= 0 ? 'up' : 'down') as 'up' | 'down' | 'flat',
              tone: (summary.users.growth >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
            }
          : undefined,
      },
      {
        label: '활성 비율',
        value: `${activeRatio}%`,
        hint: `${summary.users.active.toLocaleString()}명 활동 중`,
      },
      {
        label: '총 게시글',
        value: summary.posts.total.toLocaleString(),
        hint: `오늘 +${summary.posts.today}`,
      },
      {
        label: '총 댓글',
        value: summary.comments.total.toLocaleString(),
        hint: `오늘 +${summary.comments.today}`,
      },
      {
        label: '오늘 조회수',
        value: summary.views.total.toLocaleString(),
        hint: `${summary.views.postsViewedToday}개 게시글`,
      },
      {
        label: '에러율',
        value: `${summary.errors.rate}%`,
        hint: `${summary.errors.count}건 / 24h`,
        delta: summary.errors.rate > 0
          ? {
              value: summary.errors.rate,
              unit: '%',
              direction: 'up' as 'up' | 'down' | 'flat',
              tone: (summary.errors.rate > 1 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral',
            }
          : undefined,
      },
    ];
  }, [summary]);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={6} sm={6} md={4} lg={2} key={i}>
            <Box sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
              <Skeleton variant="text" width={80} height={16} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={100} height={40} />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid item xs={6} sm={6} md={4} lg={2} key={index}>
          <KpiCard
            label={card.label}
            value={card.value}
            delta={card.delta}
            hint={card.hint}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default memo(KPICards);
