'use client';

import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Language as IpIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import type { LogEntry } from '@/types/log';

export interface LogMobileCardProps {
  log: LogEntry;
  locale: string;
  onClick?: (log: LogEntry) => void;
}

export default function LogMobileCard({
  log,
  locale,
  onClick,
}: LogMobileCardProps) {
  const theme = useTheme();
  const isKorean = locale === 'ko';

  // Get status color
  const getStatusColor = (statusCode: number): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'info';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    if (statusCode >= 500) return 'error';
    return 'default';
  };

  // Get method color
  const getMethodColor = (method: string): 'primary' | 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (method) {
      case 'MENU': return 'info';
      case 'GET': return 'primary';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'PATCH': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(isKorean ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get border color based on status
  const statusColor = getStatusColor(log.statusCode);
  const borderColor = statusColor === 'success' ? theme.palette.success.main
    : statusColor === 'error' ? theme.palette.error.main
    : statusColor === 'warning' ? theme.palette.warning.main
    : statusColor === 'info' ? theme.palette.info.main
    : theme.palette.grey[400];

  return (
    <Box
      onClick={() => onClick?.(log)}
      sx={{
        p: 1.5,
        backgroundColor: 'background.paper',
        borderLeft: `3px solid ${borderColor}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        } : {},
        '&:active': onClick ? {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        } : {},
      }}
    >
      {/* Top Row: Method, Path, Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip
          label={log.method}
          size="small"
          color={getMethodColor(log.method)}
          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
          }}
        >
          {log.path}
        </Typography>
        <Chip
          label={log.statusCode}
          size="small"
          color={getStatusColor(log.statusCode)}
          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
        />
      </Box>

      {/* Middle Row: Program, Duration */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        {log.programId && (
          <Chip
            label={log.programId}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        )}
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {log.duration}
        </Typography>
      </Box>

      {/* Bottom Row: Time, User, IP */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {formatTimestamp(log.timestamp)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PersonIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {log.userName || log.userId || 'N/A'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IpIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {log.ip}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
