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
import { SystemPerformanceItem } from '../types';
import { COLORS, cardStyle, cardContentStyle, chartTooltipStyle } from '../styles';

interface SystemPerformanceChartProps {
  data: SystemPerformanceItem[];
  loading: boolean;
}

function SystemPerformanceChart({ data, loading }: SystemPerformanceChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => {
      const date = new Date(item.hour);
      return {
        ...item,
        hour: `${date.getHours()}:00`
      };
    });
  }, [data]);

  const { totalRequests, avgResponseTime } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.requests, 0);
    const avg = data.length > 0
      ? Math.round(data.reduce((sum, item) => sum + item.avgResponseTime, 0) / data.length)
      : 0;
    return { totalRequests: total, avgResponseTime: avg };
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="rectangular" height={260} sx={{ mt: 2, borderRadius: 2 }} />
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
            시스템 성능 (24h)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.info }} />
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                요청 <strong style={{ color: COLORS.info }}>{totalRequests.toLocaleString()}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.secondary }} />
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                응답 <strong style={{ color: COLORS.secondary }}>{avgResponseTime}ms</strong>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.info} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.error} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                dx={-10}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value: number, name: string) => {
                  if (name === 'requests') return [`${value.toLocaleString()}건`, '요청 수'];
                  if (name === 'errors') return [`${value}건`, '에러'];
                  return [value, name];
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 15 }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: '#64748b', fontSize: 12, marginLeft: 4 }}>{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="requests"
                name="요청 수"
                stroke={COLORS.info}
                strokeWidth={2}
                fill="url(#colorRequests)"
                dot={false}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="errors"
                name="에러"
                stroke={COLORS.error}
                strokeWidth={2}
                fill="url(#colorErrors)"
                dot={false}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(SystemPerformanceChart);
