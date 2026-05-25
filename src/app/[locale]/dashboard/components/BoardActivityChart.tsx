'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography, Skeleton, LinearProgress } from '@mui/material';
import { BoardActivityItem } from '../types';
import { cardStyle, cardContentStyle } from '../styles';
import { chartColors } from './charts/themeColors';

interface BoardActivityChartProps {
  data: BoardActivityItem[];
  loading: boolean;
}

function BoardActivityChart({ data, loading }: BoardActivityChartProps) {
  const maxPosts = useMemo(() => Math.max(...data.map((item) => item.postCount), 1), [data]);

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <Skeleton variant="text" width={150} height={24} />
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" width="23%" height={120} sx={{ borderRadius: 2 }} />
            ))}
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
            mb: 2
          }}
        >
          게시판별 활동
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
          {data.map((item, index) => {
            const percentage = (item.postCount / maxPosts) * 100;
            const color = chartColors.primary[index % chartColors.primary.length];

            return (
              <Box
                key={item.id}
                sx={{
                  flex: '0 0 auto',
                  minWidth: 140,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: color
                  }
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: color,
                    mb: 1.5
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1
                  }}
                >
                  {item.postCount.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mb: 1.5 }}>
                  게시글
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      bgcolor: color
                    }
                  }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 1 }}>
                  조회 {item.totalViews.toLocaleString()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(BoardActivityChart);
