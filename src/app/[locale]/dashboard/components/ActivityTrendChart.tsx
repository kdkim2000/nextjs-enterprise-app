'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ActivityTrendItem } from '../types';
import { cardStyle, cardContentStyle, chartTooltipStyle } from '../styles';
import { chartColors } from './charts/themeColors';

interface ActivityTrendChartProps {
  data: ActivityTrendItem[];
  loading: boolean;
}

function ActivityTrendChart({ data, loading }: ActivityTrendChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => {
      const date = new Date(item.date);
      return {
        ...item,
        date: `${date.getMonth() + 1}/${date.getDate()}`
      };
    });
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="rectangular" height={280} sx={{ mt: 2, borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardStyle, height: '100%' }}>
      <Box sx={cardContentStyle}>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          활동 추이
        </Typography>
        <Box sx={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.primary[0]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartColors.primary[0]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartColors.success} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.warning} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartColors.warning} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke={chartColors.grid} vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: chartColors.text }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: chartColors.text }}
                dx={-10}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelStyle={{ color: '#1e293b', fontWeight: 600, marginBottom: 8 }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: '#64748b', fontSize: 12, marginLeft: 4 }}>{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="posts"
                name="게시글"
                stroke={chartColors.primary[0]}
                strokeWidth={2}
                fill="url(#colorPosts)"
                dot={false}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="comments"
                name="댓글"
                stroke={chartColors.success}
                strokeWidth={2}
                fill="url(#colorComments)"
                dot={false}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="조회수"
                stroke={chartColors.warning}
                strokeWidth={2}
                fill="url(#colorViews)"
                dot={false}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ActivityTrendChart);
