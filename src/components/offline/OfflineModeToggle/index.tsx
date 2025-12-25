'use client';

import React, { useState } from 'react';
import {
  Box,
  Switch,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

interface OfflineModeToggleProps {
  locale?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium';
  onModeChange?: (isOffline: boolean) => void;
}

export default function OfflineModeToggle({
  locale = 'ko',
  showLabel = true,
  size = 'medium',
  onModeChange,
}: OfflineModeToggleProps) {
  const {
    isOfflineModeEnabled,
    isNetworkAvailable,
    hasOfflineData,
    isDownloading,
    downloadAllData,
    enableOfflineMode,
    disableOfflineMode,
  } = useOfflineMode();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleClick = async () => {
    if (isOfflineModeEnabled) {
      // Turning off offline mode
      setLoading(true);
      try {
        await disableOfflineMode();
        onModeChange?.(false);
      } finally {
        setLoading(false);
      }
    } else {
      // Turning on offline mode
      if (!hasOfflineData) {
        // No data downloaded - ask to download first
        setDownloadDialogOpen(true);
      } else {
        // Data exists - confirm to enable
        setConfirmDialogOpen(true);
      }
    }
  };

  const handleConfirmEnable = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);
    try {
      await enableOfflineMode();
      onModeChange?.(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAndEnable = async () => {
    setDownloadDialogOpen(false);
    setLoading(true);
    try {
      const result = await downloadAllData();
      if (result.success) {
        await enableOfflineMode();
        onModeChange?.(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const tooltipText = isOfflineModeEnabled
    ? getLocalizedValue(
        {
          ko: '오프라인 모드 활성화됨 - 클릭하여 해제',
          en: 'Offline mode enabled - Click to disable',
        },
        locale
      )
    : getLocalizedValue(
        {
          ko: '오프라인 모드로 전환 - 네트워크 없이 작업',
          en: 'Switch to offline mode - Work without network',
        },
        locale
      );

  const isDisabled = loading || isDownloading || (!isNetworkAvailable && !isOfflineModeEnabled);

  return (
    <>
      <Tooltip title={tooltipText}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          {isOfflineModeEnabled ? (
            <CloudOffIcon
              fontSize={size}
              sx={{ color: 'warning.main' }}
            />
          ) : (
            <CloudIcon
              fontSize={size}
              sx={{ color: isNetworkAvailable ? 'success.main' : 'error.main' }}
            />
          )}
          {showLabel && (
            <Typography
              variant={size === 'small' ? 'caption' : 'body2'}
              sx={{ color: isOfflineModeEnabled ? 'warning.main' : 'text.secondary' }}
            >
              {isOfflineModeEnabled
                ? getLocalizedValue({ ko: '오프라인', en: 'Offline' }, locale)
                : getLocalizedValue({ ko: '온라인', en: 'Online' }, locale)}
            </Typography>
          )}
          <Switch
            checked={isOfflineModeEnabled}
            onChange={handleToggleClick}
            disabled={isDisabled}
            size={size}
            color="warning"
          />
          {(loading || isDownloading) && <CircularProgress size={16} />}
        </Box>
      </Tooltip>

      {/* Confirm Enable Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          {getLocalizedValue(
            { ko: '오프라인 모드 활성화', en: 'Enable Offline Mode' },
            locale
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getLocalizedValue(
              {
                ko: '오프라인 모드를 활성화하면 다운로드된 데이터만 사용합니다. 새로운 데이터를 불러오려면 온라인 모드로 전환해야 합니다.',
                en: 'Enabling offline mode will use only downloaded data. To fetch new data, you need to switch back to online mode.',
              },
              locale
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            {getLocalizedValue({ ko: '취소', en: 'Cancel' }, locale)}
          </Button>
          <Button onClick={handleConfirmEnable} variant="contained" color="warning">
            {getLocalizedValue({ ko: '활성화', en: 'Enable' }, locale)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Required Dialog */}
      <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)}>
        <DialogTitle>
          {getLocalizedValue(
            { ko: '데이터 다운로드 필요', en: 'Data Download Required' },
            locale
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getLocalizedValue(
              {
                ko: '오프라인 모드를 사용하려면 먼저 검사 데이터를 다운로드해야 합니다. 지금 다운로드하시겠습니까?',
                en: 'To use offline mode, you need to download inspection data first. Would you like to download now?',
              },
              locale
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadDialogOpen(false)}>
            {getLocalizedValue({ ko: '취소', en: 'Cancel' }, locale)}
          </Button>
          <Button
            onClick={handleDownloadAndEnable}
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            {getLocalizedValue({ ko: '다운로드', en: 'Download' }, locale)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
