'use client';

import React, { useState } from 'react';
import {
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  ButtonProps,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  CloudDone as DownloadedIcon,
  CloudOff as OfflineIcon,
} from '@mui/icons-material';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface DownloadOfflineButtonProps extends Omit<ButtonProps, 'onClick' | 'variant' | 'onError'> {
  inspectionId: string;
  isDownloaded?: boolean;
  onDownloaded?: () => void;
  /** Callback when download fails */
  onError?: (error: Error) => void;
  locale?: string;
  /** Render mode: 'button' for full button, 'icon' for icon-only button */
  variant?: 'button' | 'icon';
}

export default function DownloadOfflineButton({
  inspectionId,
  isDownloaded = false,
  onDownloaded,
  onError,
  locale = 'ko',
  variant = 'button',
  ...buttonProps
}: DownloadOfflineButtonProps) {
  const { status, downloadForOffline } = useSyncStatus();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(isDownloaded);

  const handleDownload = async () => {
    if (!status.isOnline) {
      return;
    }

    try {
      setDownloading(true);
      await downloadForOffline(inspectionId);
      setDownloaded(true);
      onDownloaded?.();
    } catch (error) {
      console.error('Failed to download for offline:', error);
      onError?.(error instanceof Error ? error : new Error('Download failed'));
    } finally {
      setDownloading(false);
    }
  };

  const getTooltip = () => {
    if (!status.isOnline) {
      return getLocalizedValue({ en: 'Offline - cannot download', ko: '오프라인 - 다운로드 불가' }, locale);
    }
    if (downloading) {
      return getLocalizedValue({ en: 'Downloading...', ko: '다운로드 중...' }, locale);
    }
    if (downloaded) {
      return getLocalizedValue({ en: 'Available offline', ko: '오프라인 사용 가능' }, locale);
    }
    return getLocalizedValue({ en: 'Download for offline use', ko: '오프라인 사용을 위해 다운로드' }, locale);
  };

  const getIcon = () => {
    if (downloading) {
      return <CircularProgress size={20} color="inherit" />;
    }
    if (!status.isOnline) {
      return <OfflineIcon />;
    }
    if (downloaded) {
      return <DownloadedIcon color="success" />;
    }
    return <DownloadIcon />;
  };

  if (variant === 'icon') {
    return (
      <Tooltip title={getTooltip()}>
        <span>
          <IconButton
            onClick={handleDownload}
            disabled={downloading || !status.isOnline || downloaded}
            {...(buttonProps as unknown as React.ComponentProps<typeof IconButton>)}
          >
            {getIcon()}
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={getTooltip()}>
      <span>
        <Button
          onClick={handleDownload}
          disabled={downloading || !status.isOnline || downloaded}
          startIcon={getIcon()}
          {...buttonProps}
        >
          {downloaded
            ? getLocalizedValue({ en: 'Offline Ready', ko: '오프라인 준비됨' }, locale)
            : getLocalizedValue({ en: 'Download', ko: '다운로드' }, locale)}
        </Button>
      </span>
    </Tooltip>
  );
}
