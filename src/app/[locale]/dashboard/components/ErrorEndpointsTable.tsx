'use client';

import React, { memo } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { Warning, CheckCircle } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ErrorEndpointItem } from '../types';
import { cardStyle, cardContentStyle } from '../styles';
import { chartColors } from './charts/themeColors';

interface ErrorEndpointsTableProps {
  data: ErrorEndpointItem[];
  loading: boolean;
}

function ErrorEndpointsTable({ data, loading }: ErrorEndpointsTableProps) {
  const getStatusConfig = (statusCode: number) => {
    if (statusCode >= 500) return { color: chartColors.danger, label: 'Server' };
    if (statusCode >= 400) return { color: chartColors.warning, label: 'Client' };
    return { color: chartColors.info, label: 'Info' };
  };

  if (loading) {
    return (
      <Box sx={{ ...cardStyle, height: '100%' }}>
        <Box sx={cardContentStyle}>
          <Skeleton variant="text" width={160} height={24} />
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1.5 }} />
            ))}
          </Box>
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
            에러 엔드포인트 Top 5
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            24시간
          </Typography>
        </Box>

        {data.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              gap: 1
            }}
          >
            <CheckCircle sx={{ fontSize: 40, color: chartColors.success, opacity: 0.7 }} />
            <Typography sx={{ fontSize: '0.8rem', color: chartColors.success, fontWeight: 500 }}>
              에러가 없습니다
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {data.map((item, index) => {
              const config = getStatusConfig(item.statusCode);
              return (
                <Box
                  key={item.endpoint}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: index === 0 ? `${chartColors.danger}30` : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      borderColor: `${config.color}40`
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: index === 0 ? `${chartColors.danger}15` : 'rgba(0, 0, 0, 0.06)',
                      color: index === 0 ? chartColors.danger : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Warning sx={{ fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5
                      }}
                    >
                      {item.endpoint}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                          bgcolor: `${config.color}15`,
                          color: config.color,
                          fontSize: '0.65rem',
                          fontWeight: 600
                        }}
                      >
                        {item.statusCode}
                      </Box>
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                        {formatDistanceToNow(new Date(item.lastError), { addSuffix: true, locale: ko })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      flexShrink: 0
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: chartColors.danger,
                        lineHeight: 1
                      }}
                    >
                      {item.errorCount}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                      에러
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default memo(ErrorEndpointsTable);
