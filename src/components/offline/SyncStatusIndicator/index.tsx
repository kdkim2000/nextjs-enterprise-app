'use client';

import React from 'react';
import {
  Box,
  Badge,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  CloudDone as SyncedIcon,
  CloudOff as OfflineIcon,
  CloudSync as SyncingIcon,
  CloudQueue as PendingIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface SyncStatusIndicatorProps {
  onClick?: () => void;
  locale?: string;
  showBadge?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function SyncStatusIndicator({
  onClick,
  locale = 'ko',
  showBadge = true,
  size = 'medium',
}: SyncStatusIndicatorProps) {
  const { status, hasPending, hasFailed } = useSyncStatus();

  const getIcon = () => {
    if (!status.isOnline) {
      return <OfflineIcon />;
    }
    if (status.isSyncing) {
      return <SyncingIcon />;
    }
    if (hasFailed) {
      return <ErrorIcon color="error" />;
    }
    if (hasPending) {
      return <PendingIcon />;
    }
    return <SyncedIcon color="success" />;
  };

  const getTooltip = () => {
    if (!status.isOnline) {
      return getLocalizedValue(
        { en: 'Offline - changes will sync when back online', ko: '오프라인 - 온라인 시 동기화됩니다' },
        locale
      );
    }
    if (status.isSyncing) {
      return getLocalizedValue({ en: 'Syncing...', ko: '동기화 중...' }, locale);
    }
    if (hasFailed) {
      return getLocalizedValue(
        { en: `${status.failedCount} items failed to sync`, ko: `${status.failedCount}개 항목 동기화 실패` },
        locale
      );
    }
    if (hasPending) {
      return getLocalizedValue(
        { en: `${status.pendingCount} items pending sync`, ko: `${status.pendingCount}개 항목 동기화 대기 중` },
        locale
      );
    }
    return getLocalizedValue({ en: 'All changes synced', ko: '모든 변경사항 동기화됨' }, locale);
  };

  const getBadgeContent = () => {
    if (hasFailed) return status.failedCount;
    if (hasPending) return status.pendingCount;
    return 0;
  };

  const getBadgeColor = (): 'error' | 'warning' | 'default' => {
    if (hasFailed) return 'error';
    if (hasPending) return 'warning';
    return 'default';
  };

  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;

  return (
    <Tooltip title={getTooltip()}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {status.isSyncing && (
          <CircularProgress
            size={iconSize + 8}
            sx={{
              position: 'absolute',
              top: -4,
              left: -4,
              zIndex: 1,
            }}
          />
        )}
        <IconButton onClick={onClick} size={size}>
          {showBadge && getBadgeContent() > 0 ? (
            <Badge badgeContent={getBadgeContent()} color={getBadgeColor()}>
              {getIcon()}
            </Badge>
          ) : (
            getIcon()
          )}
        </IconButton>
      </Box>
    </Tooltip>
  );
}
