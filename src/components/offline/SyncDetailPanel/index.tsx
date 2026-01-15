'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Sync as SyncIcon,
  CloudDone as SyncedIcon,
  CloudOff as OfflineIcon,
  CloudQueue as PendingIcon,
  Error as ErrorIcon,
  Refresh as RetryIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { inspectionStore, SyncQueueItem } from '@/lib/offline/inspectionStore';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface SyncDetailPanelProps {
  open: boolean;
  onClose: () => void;
  locale?: string;
}

export default function SyncDetailPanel({
  open,
  onClose,
  locale = 'ko',
}: SyncDetailPanelProps) {
  const { status, progress, sync, retryFailed, clearFailed } = useSyncStatus();
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);

  // Fetch queue items
  useEffect(() => {
    const fetchItems = async () => {
      const items = await inspectionStore.getAllSyncItems();
      setQueueItems(items.sort((a, b) => b.timestamp - a.timestamp));
    };

    if (open) {
      fetchItems();
      const interval = setInterval(fetchItems, 2000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (itemStatus: SyncQueueItem['status']) => {
    switch (itemStatus) {
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'syncing':
        return <SyncIcon color="primary" sx={{ animation: 'spin 1s linear infinite' }} />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <SyncedIcon color="success" />;
    }
  };

  const getStatusLabel = (itemStatus: SyncQueueItem['status']) => {
    switch (itemStatus) {
      case 'pending':
        return getLocalizedValue({ en: 'Pending', ko: '대기 중' }, locale);
      case 'syncing':
        return getLocalizedValue({ en: 'Syncing', ko: '동기화 중' }, locale);
      case 'failed':
        return getLocalizedValue({ en: 'Failed', ko: '실패' }, locale);
      default:
        return getLocalizedValue({ en: 'Unknown', ko: '알 수 없음' }, locale);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await inspectionStore.removeSyncItem(itemId);
    setQueueItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SyncIcon />
            <Typography variant="h6">
              {getLocalizedValue({ en: 'Sync Status', ko: '동기화 상태' }, locale)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Status Overview */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {status.isOnline ? (
              <SyncedIcon color="success" sx={{ fontSize: 40 }} />
            ) : (
              <OfflineIcon color="warning" sx={{ fontSize: 40 }} />
            )}
            <Box>
              <Typography variant="h6">
                {status.isOnline
                  ? getLocalizedValue({ en: 'Online', ko: '온라인' }, locale)
                  : getLocalizedValue({ en: 'Offline', ko: '오프라인' }, locale)}
              </Typography>
              {status.lastSyncTime && (
                <Typography variant="body2" color="text.secondary">
                  {getLocalizedValue({ en: 'Last sync:', ko: '마지막 동기화:' }, locale)}{' '}
                  {formatTime(status.lastSyncTime)}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              icon={<PendingIcon />}
              label={`${getLocalizedValue({ en: 'Pending', ko: '대기' }, locale)}: ${status.pendingCount}`}
              color={status.pendingCount > 0 ? 'warning' : 'default'}
              variant="outlined"
            />
            <Chip
              icon={<ErrorIcon />}
              label={`${getLocalizedValue({ en: 'Failed', ko: '실패' }, locale)}: ${status.failedCount}`}
              color={status.failedCount > 0 ? 'error' : 'default'}
              variant="outlined"
            />
          </Box>

          {/* Sync Progress */}
          {status.isSyncing && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {getLocalizedValue({ en: 'Syncing', ko: '동기화 중' }, locale)}... ({progress.completed}/
                {progress.total})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}
              />
            </Box>
          )}
        </Paper>

        {/* Queue Items */}
        <Typography variant="subtitle2" gutterBottom>
          {getLocalizedValue({ en: 'Sync Queue', ko: '동기화 대기열' }, locale)} ({queueItems.length})
        </Typography>

        {queueItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SyncedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              {getLocalizedValue({ en: 'No items in queue', ko: '대기열이 비어있습니다' }, locale)}
            </Typography>
          </Box>
        ) : (
          <List dense>
            {queueItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem>
                  <ListItemIcon>{getStatusIcon(item.status)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" noWrap>
                          {item.method} {item.endpoint}
                        </Typography>
                        <Chip
                          label={getStatusLabel(item.status)}
                          size="small"
                          color={
                            item.status === 'failed'
                              ? 'error'
                              : item.status === 'syncing'
                                ? 'primary'
                                : 'default'
                          }
                          sx={{ height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption">{formatTime(item.timestamp)}</Typography>
                        {item.retryCount > 0 && (
                          <Typography variant="caption" color="error">
                            ({getLocalizedValue({ en: 'retries', ko: '재시도' }, locale)}: {item.retryCount})
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {item.error && (
                  <Box sx={{ pl: 9, pr: 2, pb: 1 }}>
                    <Typography variant="caption" color="error">
                      {item.error}
                    </Typography>
                  </Box>
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        {status.failedCount > 0 && (
          <>
            <Button startIcon={<DeleteIcon />} onClick={clearFailed} color="error">
              {getLocalizedValue({ en: 'Clear Failed', ko: '실패 항목 삭제' }, locale)}
            </Button>
            <Button startIcon={<RetryIcon />} onClick={retryFailed}>
              {getLocalizedValue({ en: 'Retry Failed', ko: '실패 항목 재시도' }, locale)}
            </Button>
          </>
        )}
        <Button
          variant="contained"
          startIcon={<SyncIcon />}
          onClick={sync}
          disabled={!status.isOnline || status.isSyncing || status.pendingCount === 0}
        >
          {getLocalizedValue({ en: 'Sync Now', ko: '지금 동기화' }, locale)}
        </Button>
      </DialogActions>

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
    </Dialog>
  );
}
