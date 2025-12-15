'use client';

import React, { memo, useMemo } from 'react';
import { Grid } from '@mui/material';
import { People, PersonOutline, Article, Comment, Visibility, ErrorOutline } from '@mui/icons-material';
import StatCard, { StatCardGradients } from '@/components/common/StatCard';
import { useMobile } from '@/hooks/useMobile';
import { DashboardSummary } from '../types';

interface KPICardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

function KPICards({ summary, loading }: KPICardsProps) {
  const { isMobileLayout } = useMobile();
  const cards = useMemo(() => {
    if (!summary) return [];
    return [
      {
        title: '총 사용자',
        value: summary.users.total.toLocaleString(),
        subValue: `활성 ${summary.users.active.toLocaleString()}명`,
        icon: People,
        gradient: StatCardGradients.primary,
        trend: { value: summary.users.growth, label: '전월 대비' }
      },
      {
        title: '활성 비율',
        value: `${((summary.users.active / summary.users.total) * 100).toFixed(0)}%`,
        subValue: `${summary.users.active.toLocaleString()}명 활동 중`,
        icon: PersonOutline,
        gradient: StatCardGradients.success
      },
      {
        title: '총 게시글',
        value: summary.posts.total.toLocaleString(),
        subValue: `오늘 +${summary.posts.today}`,
        icon: Article,
        gradient: StatCardGradients.warning
      },
      {
        title: '총 댓글',
        value: summary.comments.total.toLocaleString(),
        subValue: `오늘 +${summary.comments.today}`,
        icon: Comment,
        gradient: StatCardGradients.purple
      },
      {
        title: '오늘 조회수',
        value: summary.views.total.toLocaleString(),
        subValue: `${summary.views.postsViewedToday}개 게시글`,
        icon: Visibility,
        gradient: StatCardGradients.teal
      },
      {
        title: '에러율',
        value: `${summary.errors.rate}%`,
        subValue: `${summary.errors.count}건 / 24h`,
        icon: ErrorOutline,
        gradient: summary.errors.rate > 1 ? StatCardGradients.error : StatCardGradients.info
      }
    ];
  }, [summary]);

  return (
    <Grid container spacing={isMobileLayout ? 1 : 2}>
      {loading
        ? [1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={6} sm={6} md={4} lg={2} key={i}>
              <StatCard title="" value="" loading compact={isMobileLayout} />
            </Grid>
          ))
        : cards.map((card, index) => (
            <Grid item xs={6} sm={6} md={4} lg={2} key={index}>
              <StatCard
                title={card.title}
                value={card.value}
                subValue={card.subValue}
                icon={card.icon}
                gradient={card.gradient}
                trend={card.trend}
                compact={isMobileLayout}
              />
            </Grid>
          ))}
    </Grid>
  );
}

export default memo(KPICards);
