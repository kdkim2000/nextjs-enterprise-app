'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { LoginStatsItem } from '../types';
import { COLORS, cardStyle, cardContentStyle, chartTooltipStyle } from '../styles';

interface LoginStatsChartProps {
  data: LoginStatsItem[];
  loading: boolean;
}

function LoginStatsChart({ data, loading }: LoginStatsChartProps) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      displayDate: format(parseISO(item.date), 'M/d', { locale: ko })
    }));
  }, [data]);

  const { totalSuccess, totalFailed } = useMemo(() => {
    return {
      totalSuccess: data.reduce((sum, item) => sum + item.success, 0),
      totalFailed: data.reduce((sum, item) => sum + item.failed, 0)
    };
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <Skeleton variant="text" width={120} height={24} />
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
            로그인 통계
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.success }} />
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                성공 <strong style={{ color: COLORS.success }}>{totalSuccess.toLocaleString()}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.error }} />
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                실패 <strong style={{ color: COLORS.error }}>{totalFailed.toLocaleString()}</strong>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                dx={-10}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()}회`,
                  name === 'success' ? '성공' : '실패'
                ]}
                labelFormatter={(label) => `날짜: ${label}`}
                contentStyle={chartTooltipStyle}
              />
              <Legend
                wrapperStyle={{ paddingTop: 15 }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: '#64748b', fontSize: 12, marginLeft: 4 }}>
                    {value === 'success' ? '성공' : '실패'}
                  </span>
                )}
              />
              <Bar dataKey="success" name="success" fill={COLORS.success} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="failed" name="failed" fill={COLORS.error} radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(LoginStatsChart);
