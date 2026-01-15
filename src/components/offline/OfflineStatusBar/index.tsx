'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Collapse,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  CloudOff as OfflineIcon,
  Sync as SyncIcon,
  Refresh as RetryIcon,
  Delete as ClearIcon,
} from '@mui/icons-material';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface OfflineStatusBarProps {
  locale?: string;
  showProgress?: boolean;
}

export default function OfflineStatusBar({
  locale = 'ko',
  showProgress = true,
}: OfflineStatusBarProps) {
  const { status, progress, sync, retryFailed, clearFailed, hasPending, hasFailed } = useSyncStatus();

  const showOfflineBar = !status.isOnline;
  const showSyncingBar = status.isSyncing && showProgress;
  const showFailedBar = hasFailed && !status.isSyncing;

  if (!showOfflineBar && !showSyncingBar && !showFailedBar) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Offline Banner */}
      <Collapse in={showOfflineBar}>
        <Alert
          severity="warning"
          icon={<OfflineIcon />}
          sx={{
            borderRadius: 0,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box>
              <AlertTitle sx={{ mb: 0 }}>
                {getLocalizedValue({ en: 'You are offline', ko: '오프라인 상태입니다' }, locale)}
              </AlertTitle>
              <Typography variant="body2">
                {hasPending
                  ? getLocalizedValue(
                      {
                        en: `${status.pendingCount} changes will sync when back online`,
                        ko: `${status.pendingCount}개 변경사항이 온라인 시 동기화됩니다`,
                      },
                      locale
                    )
                  : getLocalizedValue(
                      { en: 'Changes will be saved locally', ko: '변경사항은 로컬에 저장됩니다' },
                      locale
                    )}
              </Typography>
            </Box>
          </Box>
        </Alert>
      </Collapse>

      {/* Syncing Progress */}
      <Collapse in={showSyncingBar}>
        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SyncIcon sx={{ fontSize: 18, animation: 'spin 1s linear infinite' }} />
            <Typography variant="body2">
              {getLocalizedValue({ en: 'Syncing...', ko: '동기화 중...' }, locale)}{' '}
              ({progress.completed}/{progress.total})
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}
            sx={{
              bgcolor: 'primary.dark',
              '& .MuiLinearProgress-bar': { bgcolor: 'primary.contrastText' },
            }}
          />
        </Box>
      </Collapse>

      {/* Failed Items Banner */}
      <Collapse in={showFailedBar}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 0,
            '& .MuiAlert-message': { width: '100%' },
          }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                startIcon={<RetryIcon />}
                onClick={retryFailed}
              >
                {getLocalizedValue({ en: 'Retry', ko: '재시도' }, locale)}
              </Button>
              <Button
                color="inherit"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFailed}
              >
                {getLocalizedValue({ en: 'Clear', ko: '삭제' }, locale)}
              </Button>
            </Box>
          }
        >
          <AlertTitle sx={{ mb: 0 }}>
            {getLocalizedValue(
              { en: `${status.failedCount} items failed to sync`, ko: `${status.failedCount}개 항목 동기화 실패` },
              locale
            )}
          </AlertTitle>
        </Alert>
      </Collapse>

      {/* CSS for spin animation */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}
