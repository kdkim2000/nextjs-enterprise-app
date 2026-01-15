'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CloudDownload as CloudDownloadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

interface BulkDownloadButtonProps {
  locale?: string;
  variant?: 'button' | 'icon' | 'chip';
  size?: 'small' | 'medium' | 'large';
  showLastDownload?: boolean;
  onDownloadComplete?: (success: boolean) => void;
}

export default function BulkDownloadButton({
  locale = 'ko',
  variant = 'button',
  size = 'medium',
  showLastDownload = true,
  onDownloadComplete,
}: BulkDownloadButtonProps) {
  const {
    isNetworkAvailable,
    hasOfflineData,
    downloadedCount,
    lastDownloadTime,
    isDownloading,
    downloadProgress,
    downloadAllData,
    offlineStats,
  } = useOfflineMode();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadResult, setDownloadResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const handleDownloadClick = () => {
    if (!isNetworkAvailable) {
      return;
    }
    setDialogOpen(true);
    setDownloadResult(null);
  };

  const handleConfirmDownload = async () => {
    const result = await downloadAllData();
    setDownloadResult(result);
    onDownloadComplete?.(result.success);
  };

  const handleClose = () => {
    if (!isDownloading) {
      setDialogOpen(false);
      setDownloadResult(null);
    }
  };

  const formatLastDownloadTime = useCallback(() => {
    if (!lastDownloadTime) {
      return getLocalizedValue({ ko: '다운로드 기록 없음', en: 'Never downloaded' }, locale);
    }

    const now = new Date();
    const diff = now.getTime() - lastDownloadTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return getLocalizedValue({ ko: '방금 전', en: 'Just now' }, locale);
    } else if (minutes < 60) {
      return getLocalizedValue(
        { ko: `${minutes}분 전`, en: `${minutes} min ago` },
        locale
      );
    } else if (hours < 24) {
      return getLocalizedValue(
        { ko: `${hours}시간 전`, en: `${hours} hour${hours > 1 ? 's' : ''} ago` },
        locale
      );
    } else {
      return getLocalizedValue(
        { ko: `${days}일 전`, en: `${days} day${days > 1 ? 's' : ''} ago` },
        locale
      );
    }
  }, [lastDownloadTime, locale]);

  const getProgressText = () => {
    if (!downloadProgress) return '';

    switch (downloadProgress.stage) {
      case 'templates':
        return getLocalizedValue(
          { ko: '템플릿 다운로드 중...', en: 'Downloading templates...' },
          locale
        );
      case 'items':
        return getLocalizedValue(
          { ko: '검사 항목 다운로드 중...', en: 'Downloading items...' },
          locale
        );
      case 'inspections':
        return getLocalizedValue(
          { ko: '검사 다운로드 중...', en: 'Downloading inspections...' },
          locale
        );
      case 'results':
        return getLocalizedValue(
          { ko: '검사 결과 다운로드 중...', en: 'Downloading results...' },
          locale
        );
      case 'complete':
        return getLocalizedValue(
          { ko: '다운로드 완료!', en: 'Download complete!' },
          locale
        );
      default:
        return getLocalizedValue(
          { ko: '다운로드 준비 중...', en: 'Preparing download...' },
          locale
        );
    }
  };

  const tooltipText = !isNetworkAvailable
    ? getLocalizedValue(
        { ko: '네트워크 연결이 필요합니다', en: 'Network connection required' },
        locale
      )
    : hasOfflineData
    ? getLocalizedValue(
        { ko: '오프라인 데이터 갱신', en: 'Refresh offline data' },
        locale
      )
    : getLocalizedValue(
        { ko: '오프라인용 데이터 다운로드', en: 'Download data for offline use' },
        locale
      );

  // Render based on variant
  const renderTrigger = () => {
    const isDisabled = !isNetworkAvailable || isDownloading;

    if (variant === 'icon') {
      return (
        <Tooltip title={tooltipText}>
          <span>
            <IconButton
              onClick={handleDownloadClick}
              disabled={isDisabled}
              size={size}
              color={hasOfflineData ? 'primary' : 'default'}
            >
              {hasOfflineData ? <RefreshIcon /> : <CloudDownloadIcon />}
            </IconButton>
          </span>
        </Tooltip>
      );
    }

    if (variant === 'chip') {
      return (
        <Tooltip title={tooltipText}>
          <span>
            <Chip
              icon={hasOfflineData ? <RefreshIcon /> : <CloudDownloadIcon />}
              label={
                hasOfflineData
                  ? getLocalizedValue({ ko: '갱신', en: 'Refresh' }, locale)
                  : getLocalizedValue({ ko: '다운로드', en: 'Download' }, locale)
              }
              onClick={handleDownloadClick}
              disabled={isDisabled}
              color={hasOfflineData ? 'primary' : 'default'}
              size={size === 'large' ? 'medium' : 'small'}
            />
          </span>
        </Tooltip>
      );
    }

    // Default button variant
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
        <Tooltip title={tooltipText}>
          <span>
            <Button
              variant={hasOfflineData ? 'outlined' : 'contained'}
              startIcon={hasOfflineData ? <RefreshIcon /> : <DownloadIcon />}
              onClick={handleDownloadClick}
              disabled={isDisabled}
              size={size}
            >
              {hasOfflineData
                ? getLocalizedValue({ ko: '데이터 갱신', en: 'Refresh Data' }, locale)
                : getLocalizedValue({ ko: '오프라인 데이터 다운로드', en: 'Download Offline Data' }, locale)}
            </Button>
          </span>
        </Tooltip>
        {showLastDownload && hasOfflineData && (
          <Typography variant="caption" color="text.secondary">
            {getLocalizedValue({ ko: '마지막 다운로드: ', en: 'Last download: ' }, locale)}
            {formatLastDownloadTime()}
            {` (${downloadedCount} ${getLocalizedValue({ ko: '건', en: 'items' }, locale)})`}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <>
      {renderTrigger()}

      {/* Download Progress Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={isDownloading}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {getLocalizedValue(
            { ko: '오프라인 데이터 다운로드', en: 'Download Offline Data' },
            locale
          )}
          {!isDownloading && (
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent>
          {!isDownloading && !downloadResult && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {getLocalizedValue(
                  {
                    ko: '다음 데이터를 다운로드합니다:',
                    en: 'The following data will be downloaded:',
                  },
                  locale
                )}
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 2 }}>
                <li>
                  <Typography variant="body2">
                    {getLocalizedValue({ ko: '검사 템플릿', en: 'Inspection templates' }, locale)}
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    {getLocalizedValue({ ko: '검사 항목', en: 'Inspection items' }, locale)}
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    {getLocalizedValue({ ko: '할당된 검사 목록', en: 'Assigned inspections' }, locale)}
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    {getLocalizedValue({ ko: '기존 검사 결과', en: 'Existing inspection results' }, locale)}
                  </Typography>
                </li>
              </Box>
              {hasOfflineData && (
                <Typography variant="body2" color="warning.main">
                  {getLocalizedValue(
                    {
                      ko: '기존 다운로드 데이터가 새 데이터로 교체됩니다.',
                      en: 'Existing downloaded data will be replaced with new data.',
                    },
                    locale
                  )}
                </Typography>
              )}
            </Box>
          )}

          {isDownloading && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {getProgressText()}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  downloadProgress?.total
                    ? (downloadProgress.current / downloadProgress.total) * 100
                    : 0
                }
                sx={{ my: 2, height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {downloadProgress?.total
                  ? Math.round((downloadProgress.current / downloadProgress.total) * 100)
                  : 0}
                %
                {downloadProgress?.current !== undefined &&
                  downloadProgress?.total !== undefined &&
                  ` (${downloadProgress.current}/${downloadProgress.total})`}
              </Typography>
            </Box>
          )}

          {downloadResult && (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              {downloadResult.success ? (
                <>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    {getLocalizedValue(
                      { ko: '다운로드 완료!', en: 'Download Complete!' },
                      locale
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {offlineStats && (
                      <>
                        {getLocalizedValue(
                          {
                            ko: `템플릿 ${offlineStats.templateCount}개, 검사 ${offlineStats.inspectionCount}개, 항목 ${offlineStats.itemCount}개`,
                            en: `${offlineStats.templateCount} templates, ${offlineStats.inspectionCount} inspections, ${offlineStats.itemCount} items`,
                          },
                          locale
                        )}
                      </>
                    )}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" color="error.main" gutterBottom>
                    {getLocalizedValue({ ko: '다운로드 실패', en: 'Download Failed' }, locale)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {downloadResult.error ||
                      getLocalizedValue(
                        { ko: '알 수 없는 오류가 발생했습니다.', en: 'An unknown error occurred.' },
                        locale
                      )}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {!isDownloading && !downloadResult && (
            <>
              <Button onClick={handleClose}>
                {getLocalizedValue({ ko: '취소', en: 'Cancel' }, locale)}
              </Button>
              <Button
                onClick={handleConfirmDownload}
                variant="contained"
                startIcon={<DownloadIcon />}
              >
                {getLocalizedValue({ ko: '다운로드 시작', en: 'Start Download' }, locale)}
              </Button>
            </>
          )}
          {downloadResult && (
            <Button onClick={handleClose} variant="contained">
              {getLocalizedValue({ ko: '확인', en: 'OK' }, locale)}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
