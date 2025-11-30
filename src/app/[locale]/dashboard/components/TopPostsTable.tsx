'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Visibility, ThumbUp } from '@mui/icons-material';
import RankedList, { RankedItem } from '@/components/common/RankedList';
import { TopPostItem } from '../types';
import { COLORS, cardStyle, cardContentStyle } from '../styles';

interface TopPostsTableProps {
  data: TopPostItem[];
  loading: boolean;
}

interface TopPostRankedItem extends RankedItem {
  views: number;
  likes: number;
}

function TopPostsTable({ data, loading }: TopPostsTableProps) {
  const rankedItems = useMemo<TopPostRankedItem[]>(() => {
    return data.map((post) => ({
      id: post.id,
      title: post.title,
      subtitle: post.board,
      meta: post.author,
      views: post.views,
      likes: post.likes
    }));
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <RankedList items={[]} loading />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardStyle, height: '100%' }}>
      <Box sx={cardContentStyle}>
        <RankedList
          items={rankedItems}
          title="인기 게시글"
          rankColors={COLORS.chart.slice(0, 3)}
          renderMetrics={(item) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  {item.views.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThumbUp sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  {item.likes}
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Box>
    </Box>
  );
}

export default memo(TopPostsTable);
