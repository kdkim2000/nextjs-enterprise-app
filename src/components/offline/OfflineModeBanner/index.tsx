'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Collapse,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  CloudOff as CloudOffIcon,
  Cloud as CloudIcon,
  Sync as SyncIcon,
  Storage as StorageIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

interface OfflineModeBannerProps {
  locale?: string;
  onSyncClick?: () => void;
  showDetails?: boolean;
  dismissible?: boolean;
}

export default function OfflineModeBanner({
  locale = 'ko',
  onSyncClick,
  showDetails = true,
  dismissible = false,
}: OfflineModeBannerProps) {
  const {
    isOfflineModeEnabled,
    isEffectivelyOffline,
    isNetworkAvailable,
    hasOfflineData,
    offlineStats,
    disableOfflineMode,
  } = useOfflineMode();

  const { status: syncStatus, progress: syncProgressData, sync } = useSyncStatus();
  const { isSyncing, pendingCount } = syncStatus;
  const syncProgress = syncProgressData.total > 0
    ? (syncProgressData.completed / syncProgressData.total) * 100
    : 0;

  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not effectively offline or dismissed
  if (!isEffectivelyOffline || dismissed) {
    return null;
  }

  const handleSwitchToOnline = async () => {
    if (isNetworkAvailable) {
      await disableOfflineMode();
    }
  };

  const handleSync = async () => {
    if (onSyncClick) {
      onSyncClick();
    } else {
      await sync();
    }
  };

  const getBannerColor = () => {
    if (!isNetworkAvailable) {
      return 'error.main'; // Red for no network
    }
    if (pendingCount > 0) {
      return 'warning.main'; // Orange for pending sync
    }
    return 'info.main'; // Blue for manual offline mode
  };

  const getBannerBgColor = () => {
    if (!isNetworkAvailable) {
      return 'error.light';
    }
    if (pendingCount > 0) {
      return 'warning.light';
    }
    return 'info.light';
  };

  const getStatusText = () => {
    if (!isNetworkAvailable && !isOfflineModeEnabled) {
      return getLocalizedValue(
        { ko: '네트워크 연결 끊김 - 오프라인 데이터 사용 중', en: 'Network disconnected - Using offline data' },
        locale
      );
    }
    if (isOfflineModeEnabled) {
      return getLocalizedValue(
        { ko: '오프라인 모드 활성화됨', en: 'Offline mode enabled' },
        locale
      );
    }
    return getLocalizedValue(
      { ko: '오프라인 상태', en: 'Offline' },
      locale
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: getBannerBgColor(),
        borderLeft: 4,
        borderColor: getBannerColor(),
        mb: 2,
      }}
    >
      {/* Main Banner Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Left Section - Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudOffIcon sx={{ color: getBannerColor() }} />
          <Typography variant="body2" fontWeight="medium" sx={{ color: 'text.primary' }}>
            {getStatusText()}
          </Typography>
        </Box>

        {/* Middle Section - Stats Chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {hasOfflineData && offlineStats && (
            <>
              <Tooltip title={getLocalizedValue({ ko: '다운로드된 검사', en: 'Downloaded inspections' }, locale)}>
                <Chip
                  size="small"
                  icon={<StorageIcon />}
                  label={`${offlineStats.inspectionCount} ${getLocalizedValue({ ko: '검사', en: 'inspections' }, locale)}`}
                  variant="outlined"
                />
              </Tooltip>
              {pendingCount > 0 && (
                <Tooltip title={getLocalizedValue({ ko: '동기화 대기 중', en: 'Pending sync' }, locale)}>
                  <Chip
                    size="small"
                    icon={<WarningIcon />}
                    label={`${pendingCount} ${getLocalizedValue({ ko: '대기', en: 'pending' }, locale)}`}
                    color="warning"
                  />
                </Tooltip>
              )}
            </>
          )}
        </Box>

        {/* Right Section - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isNetworkAvailable && pendingCount > 0 && (
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={<SyncIcon />}
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing
                ? getLocalizedValue({ ko: '동기화 중...', en: 'Syncing...' }, locale)
                : getLocalizedValue({ ko: '동기화', en: 'Sync' }, locale)}
            </Button>
          )}
          {isNetworkAvailable && isOfflineModeEnabled && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudIcon />}
              onClick={handleSwitchToOnline}
            >
              {getLocalizedValue({ ko: '온라인 전환', en: 'Go Online' }, locale)}
            </Button>
          )}
          {showDetails && (
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
          {dismissible && (
            <IconButton size="small" onClick={() => setDismissed(true)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Sync Progress */}
      {isSyncing && (
        <Box sx={{ px: 2, pb: 1 }}>
          <LinearProgress
            variant={syncProgress > 0 ? 'determinate' : 'indeterminate'}
            value={syncProgress}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>
      )}

      {/* Expandable Details */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2,
            pb: 2,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 1 }}>
            {getLocalizedValue({ ko: '오프라인 데이터 상세', en: 'Offline Data Details' }, locale)}
          </Typography>

          {hasOfflineData && offlineStats ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue({ ko: '템플릿', en: 'Templates' }, locale)}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {offlineStats.templateCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue({ ko: '검사 항목', en: 'Items' }, locale)}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {offlineStats.itemCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue({ ko: '검사', en: 'Inspections' }, locale)}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {offlineStats.inspectionCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue({ ko: '결과 데이터', en: 'Results' }, locale)}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {offlineStats.resultCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue({ ko: '동기화 대기', en: 'Pending Sync' }, locale)}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color={offlineStats.pendingSyncCount > 0 ? 'warning.main' : 'text.primary'}
                >
                  {offlineStats.pendingSyncCount}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {getLocalizedValue(
                { ko: '다운로드된 데이터가 없습니다.', en: 'No downloaded data available.' },
                locale
              )}
            </Typography>
          )}

          {/* Network Status */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ ko: '네트워크 상태:', en: 'Network status:' }, locale)}
            </Typography>
            <Chip
              size="small"
              label={
                isNetworkAvailable
                  ? getLocalizedValue({ ko: '연결됨', en: 'Connected' }, locale)
                  : getLocalizedValue({ ko: '연결 안됨', en: 'Disconnected' }, locale)
              }
              color={isNetworkAvailable ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
