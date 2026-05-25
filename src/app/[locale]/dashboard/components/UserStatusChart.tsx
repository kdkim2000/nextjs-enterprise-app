'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { UserStatusItem } from '../types';
import { cardStyle, cardContentStyle, chartTooltipStyle } from '../styles';
import { chartColors } from './charts/themeColors';

interface UserStatusChartProps {
  data: UserStatusItem[];
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: chartColors.success,
  inactive: chartColors.neutral,
  pending: chartColors.warning,
  suspended: chartColors.danger,
};

const STATUS_LABELS: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
  pending: '대기',
  suspended: '정지'
};

function UserStatusChart({ data, loading }: UserStatusChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      name: STATUS_LABELS[item.status] || item.status,
      color: STATUS_COLORS[item.status] || chartColors.neutral
    }));
  }, [data]);

  const totalUsers = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <Skeleton variant="text" width={100} height={24} />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Skeleton variant="circular" width={180} height={180} />
          </Box>
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
            mb: 1
          }}
        >
          사용자 현황
        </Typography>
        <Box sx={{ width: '100%', height: 280, position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()}명 (${((value / totalUsers) * 100).toFixed(1)}%)`,
                  name
                ]}
                contentStyle={chartTooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1
              }}
            >
              {totalUsers.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.5 }}>
              전체 사용자
            </Typography>
          </Box>
          {/* Legend */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mt: -4
            }}
          >
            {chartData.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: item.color
                  }}
                />
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>
                  {item.count.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(UserStatusChart);
