'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import ProgressBarList, { ProgressBarItem } from '@/components/common/ProgressBarList';
import { MenuUsageItem } from '../types';
import { COLORS, cardStyle, cardContentStyle } from '../styles';

interface MenuUsageChartProps {
  data: MenuUsageItem[];
  loading: boolean;
}

function MenuUsageChart({ data, loading }: MenuUsageChartProps) {
  const progressItems = useMemo<ProgressBarItem[]>(() => {
    return data.slice(0, 8).map((item) => ({
      id: item.programId,
      label: item.name || item.programId,
      value: item.accessCount,
      meta: `${item.uniqueUsers}명`
    }));
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <ProgressBarList items={[]} loading />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardStyle, height: '100%' }}>
      <Box sx={cardContentStyle}>
        <ProgressBarList
          items={progressItems}
          title="메뉴 접근 빈도"
          showPercentage={false}
          colors={COLORS.chart}
          barHeight={6}
        />
      </Box>
    </Box>
  );
}

export default memo(MenuUsageChart);
