'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ProgressBarList, { ProgressBarItem } from '@/components/common/ProgressBarList';
import { HttpStatusItem } from '../types';
import { cardStyle, cardContentStyle } from '../styles';
import { chartColors } from './charts/themeColors';

interface HttpStatusChartProps {
  data: HttpStatusItem[];
  loading: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  '2xx': { color: chartColors.success, label: '성공' },
  '3xx': { color: chartColors.info, label: '리다이렉트' },
  '4xx': { color: chartColors.warning, label: '클라이언트 에러' },
  '5xx': { color: chartColors.danger, label: '서버 에러' },
};

function HttpStatusChart({ data, loading }: HttpStatusChartProps) {
  const totalCount = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data]);

  const progressItems = useMemo<ProgressBarItem[]>(() => {
    return data.map((item) => {
      const config = STATUS_CONFIG[item.status] || { color: chartColors.neutral, label: item.status };
      return {
        id: item.status,
        label: config.label,
        subLabel: item.status,
        value: item.count,
        max: totalCount || 1,
        color: config.color
      };
    });
  }, [data, totalCount]);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            HTTP 상태 분포
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>24시간</Typography>
        </Box>
        <ProgressBarList
          items={progressItems}
          showPercentage
          showValue
          barHeight={6}
        />
        {totalCount === 0 && (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 3, textAlign: 'center' }}>
            데이터가 없습니다.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default memo(HttpStatusChart);
