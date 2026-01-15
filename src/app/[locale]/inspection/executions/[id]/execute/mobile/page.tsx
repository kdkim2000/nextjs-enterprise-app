'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  LinearProgress,
  useTheme,
  alpha,
  TextField,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  CheckCircle as CheckIcon,
  Send as SubmitIcon,
  CameraAlt as CameraIcon,
  Draw as SignatureIcon,
  CloudOff as OfflineIcon,
  Cloud as OnlineIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as SyncIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import PhotoCapture from '@/components/inspection/PhotoCapture';
import SignaturePad from '@/components/inspection/SignaturePad';
import { inspectionApi } from '@/lib/axios';
import { useCurrentLocale } from '@/lib/i18n/client';
import { useMessage } from '@/hooks/useMessage';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { syncService, SyncStatus } from '@/lib/offline/syncService';
import { inspectionStore } from '@/lib/offline/inspectionStore';
import { Inspection, ChecksheetItem, InspectionResult } from '../../../types';

interface ResultState {
  value: string;
  notes: string;
  photoData?: string;
  signatureData?: string;
}

export default function MobileInspectionExecutePage() {
  const theme = useTheme();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  const { isOnline } = useNetworkStatus();

  const { showSuccessMessage, showErrorMessage } = useMessage({ locale: currentLocale });

  // State
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<ChecksheetItem[]>([]);
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Offline state
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);

  // Modals
  const [photoCaptureOpen, setPhotoCaptureOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Initialize sync service
  useEffect(() => {
    syncService.init();
    const unsubscribe = syncService.onStatusChange((status) => setSyncStatus(status));
    return () => unsubscribe();
  }, []);

  // Check if data is downloaded for offline
  useEffect(() => {
    const checkOfflineData = async () => {
      try {
        await inspectionStore.init();
        const offlineInspection = await inspectionStore.getInspection(inspectionId);
        setIsDownloaded(!!offlineInspection);
      } catch (error) {
        console.error('Failed to check offline data:', error);
      }
    };
    checkOfflineData();
  }, [inspectionId]);

  // Fetch data (online or offline)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Try offline data first if not online
      if (!isOnline) {
        const offlineData = await syncService.getInspectionData(inspectionId);
        if (offlineData) {
          setInspection(offlineData.inspection as Inspection);
          setItems(offlineData.items as ChecksheetItem[]);
          setIsOfflineMode(true);

          // Load offline results
          const resultsState: Record<string, ResultState> = {};
          (offlineData.results as Array<{ item_id: string; value: string; notes?: string }>).forEach((r) => {
            resultsState[r.item_id] = {
              value: r.value || '',
              notes: r.notes || '',
            };
          });
          (offlineData.items as ChecksheetItem[]).forEach((item) => {
            if (!resultsState[item.id]) {
              resultsState[item.id] = { value: '', notes: '' };
            }
          });
          setResults(resultsState);
          return;
        }
      }

      // Online fetch
      const inspectionResponse = await inspectionApi.get(`/executions/${inspectionId}`);
      setInspection(inspectionResponse.inspection);

      const itemsResponse = await inspectionApi.get(`/items?template_id=${inspectionResponse.inspection.template_id}`);
      const fetchedItems = (itemsResponse.items || [])
        .filter((i: ChecksheetItem) => !i.parent_id)
        .sort((a: ChecksheetItem, b: ChecksheetItem) => a.sort_order - b.sort_order);
      setItems(fetchedItems);

      const resultsResponse = await inspectionApi.get(`/executions/${inspectionId}/results`);
      const existingResults: InspectionResult[] = resultsResponse.results || [];

      const resultsState: Record<string, ResultState> = {};
      existingResults.forEach((r) => {
        const photoUrls = r.photo_urls || [];
        const photoData = photoUrls.find((url: string) => url && !url.startsWith('signature:'));
        const signatureEntry = photoUrls.find((url: string) => url && url.startsWith('signature:'));
        const signatureData = signatureEntry ? signatureEntry.replace('signature:', '') : undefined;
        resultsState[r.item_id] = {
          value: r.value || '',
          notes: r.remarks || r.notes || '',
          photoData: photoData || undefined,
          signatureData: signatureData,
        };
      });

      fetchedItems.forEach((item: ChecksheetItem) => {
        if (!resultsState[item.id]) {
          resultsState[item.id] = { value: '', notes: '' };
        }
      });
      setResults(resultsState);
      setIsOfflineMode(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);

      // Try offline as fallback
      const offlineData = await syncService.getInspectionData(inspectionId);
      if (offlineData) {
        setInspection(offlineData.inspection as Inspection);
        setItems(offlineData.items as ChecksheetItem[]);
        setIsOfflineMode(true);
        setSnackbar({
          open: true,
          message: getLocalizedValue({ en: 'Loaded from offline storage', ko: '오프라인 데이터를 불러왔습니다' }, currentLocale),
          severity: 'info',
        });
      } else {
        await showErrorMessage('COMMON_LOAD_FAIL');
      }
    } finally {
      setLoading(false);
    }
  }, [inspectionId, isOnline, showErrorMessage, currentLocale]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Download for offline
  const handleDownloadForOffline = async () => {
    if (!isOnline) {
      setSnackbar({
        open: true,
        message: getLocalizedValue({ en: 'Cannot download while offline', ko: '오프라인 상태에서는 다운로드할 수 없습니다' }, currentLocale),
        severity: 'error',
      });
      return;
    }

    try {
      setDownloading(true);
      await syncService.downloadForOffline(inspectionId);
      setIsDownloaded(true);
      setSnackbar({
        open: true,
        message: getLocalizedValue({ en: 'Downloaded for offline use', ko: '오프라인 사용을 위해 다운로드되었습니다' }, currentLocale),
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to download:', error);
      setSnackbar({
        open: true,
        message: getLocalizedValue({ en: 'Download failed', ko: '다운로드 실패' }, currentLocale),
        severity: 'error',
      });
    } finally {
      setDownloading(false);
    }
  };

  // Manual sync
  const handleSync = async () => {
    if (!isOnline) {
      setSnackbar({
        open: true,
        message: getLocalizedValue({ en: 'Cannot sync while offline', ko: '오프라인 상태에서는 동기화할 수 없습니다' }, currentLocale),
        severity: 'warning',
      });
      return;
    }

    try {
      const result = await syncService.sync();
      if (result.synced > 0) {
        setSnackbar({
          open: true,
          message: getLocalizedValue(
            { en: `Synced ${result.synced} items`, ko: `${result.synced}개 항목 동기화 완료` },
            currentLocale
          ),
          severity: 'success',
        });
        // Refresh data after sync
        await fetchData();
      } else {
        setSnackbar({
          open: true,
          message: getLocalizedValue({ en: 'Nothing to sync', ko: '동기화할 항목이 없습니다' }, currentLocale),
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSnackbar({
        open: true,
        message: getLocalizedValue({ en: 'Sync failed', ko: '동기화 실패' }, currentLocale),
        severity: 'error',
      });
    }
  };

  // Progress calculation
  const completedItems = Object.values(results).filter((r) => r.value !== '').length;
  const requiredItems = items.filter((i) => i.required);
  const completedRequiredItems = requiredItems.filter((i) => results[i.id]?.value !== '').length;
  const canSubmit = requiredItems.length === 0 || completedRequiredItems === requiredItems.length;
  const progressPercent = items.length > 0 ? (completedItems / items.length) * 100 : 0;

  // Navigation
  const goNext = () => currentIndex < items.length - 1 && setCurrentIndex(currentIndex + 1);
  const goPrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

  // Result change handler
  const handleResultChange = (value: string) => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;
    setResults((prev) => ({
      ...prev,
      [currentItem.id]: { ...prev[currentItem.id], value },
    }));
  };

  // Photo/Signature handlers
  const handlePhotoCaptured = (imageData: string) => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;
    setResults((prev) => ({
      ...prev,
      [currentItem.id]: { ...prev[currentItem.id], value: 'captured', photoData: imageData },
    }));
    setPhotoCaptureOpen(false);
  };

  const handleSignatureSaved = (signatureData: string) => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;
    setResults((prev) => ({
      ...prev,
      [currentItem.id]: { ...prev[currentItem.id], value: 'signed', signatureData: signatureData },
    }));
    setSignaturePadOpen(false);
  };

  // Save (with offline support)
  const handleSave = async () => {
    try {
      setSaving(true);
      const resultsToSave = Object.entries(results).map(([itemId, result]) => {
        const photoUrls: string[] = [];
        if (result.photoData) photoUrls.push(result.photoData);
        if (result.signatureData) photoUrls.push(`signature:${result.signatureData}`);
        return {
          item_id: itemId,
          value: result.value,
          remarks: result.notes,
          photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        };
      });

      if (isOnline && !isOfflineMode) {
        // Direct save when online
        await inspectionApi.put(`/executions/${inspectionId}/results`, { results: resultsToSave });
        await showSuccessMessage('COMMON_SAVE_SUCCESS');
      } else {
        // Offline save - queue for sync
        await syncService.saveResults(
          inspectionId,
          resultsToSave.map((r) => ({
            item_id: r.item_id,
            value: r.value,
            notes: r.remarks,
          }))
        );
        setSnackbar({
          open: true,
          message: getLocalizedValue({ en: 'Saved offline (will sync when online)', ko: '오프라인 저장됨 (온라인시 동기화)' }, currentLocale),
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('Failed to save:', error);
      // Try offline save as fallback
      try {
        await syncService.saveResults(
          inspectionId,
          Object.entries(results).map(([itemId, result]) => ({
            item_id: itemId,
            value: result.value,
            notes: result.notes,
          }))
        );
        setSnackbar({
          open: true,
          message: getLocalizedValue({ en: 'Saved offline (will sync when online)', ko: '오프라인 저장됨 (온라인시 동기화)' }, currentLocale),
          severity: 'warning',
        });
      } catch (offlineError) {
        await showErrorMessage('COMMON_SAVE_FAIL');
      }
    } finally {
      setSaving(false);
    }
  };

  // Submit (with offline support)
  const handleSubmit = async () => {
    if (!isOnline) {
      setShowOfflineDialog(true);
      return;
    }

    try {
      setSaving(true);
      const resultsToSave = Object.entries(results).map(([itemId, result]) => {
        const photoUrls: string[] = [];
        if (result.photoData) photoUrls.push(result.photoData);
        if (result.signatureData) photoUrls.push(`signature:${result.signatureData}`);
        return {
          item_id: itemId,
          value: result.value,
          remarks: result.notes,
          photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        };
      });
      await inspectionApi.put(`/executions/${inspectionId}/results`, { results: resultsToSave });
      await inspectionApi.post(`/executions/${inspectionId}/submit`);
      await showSuccessMessage('COMMON_SUBMIT_SUCCESS');
      router.push(`/${currentLocale}/inspection/executions`);
    } catch (error) {
      console.error('Failed to submit:', error);
      await showErrorMessage('COMMON_SUBMIT_FAIL');
    } finally {
      setSaving(false);
    }
  };

  // Offline submit (queue for later)
  const handleOfflineSubmit = async () => {
    try {
      setSaving(true);
      await syncService.saveResults(
        inspectionId,
        Object.entries(results).map(([itemId, result]) => ({
          item_id: itemId,
          value: result.value,
          notes: result.notes,
        }))
      );
      await syncService.submitInspection(inspectionId);
      setShowOfflineDialog(false);
      setSnackbar({
        open: true,
        message: getLocalizedValue({ en: 'Queued for submission (will submit when online)', ko: '제출 대기중 (온라인시 제출됨)' }, currentLocale),
        severity: 'info',
      });
      router.push(`/${currentLocale}/inspection/executions`);
    } catch (error) {
      console.error('Failed to queue submission:', error);
      setSnackbar({
        open: true,
        message: getLocalizedValue({ en: 'Failed to queue submission', ko: '제출 대기 실패' }, currentLocale),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => router.push(`/${currentLocale}/inspection/executions`);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!inspection || items.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {isOnline
            ? getLocalizedValue({ en: 'Failed to load inspection', ko: '점검을 불러올 수 없습니다' }, currentLocale)
            : getLocalizedValue({ en: 'No offline data available. Please download while online.', ko: '오프라인 데이터가 없습니다. 온라인에서 먼저 다운로드해주세요.' }, currentLocale)}
        </Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>{getLocalizedValue({ en: 'Back', ko: '돌아가기' }, currentLocale)}</Button>
      </Box>
    );
  }

  const currentItem = items[currentIndex];
  const currentResult = results[currentItem?.id] || { value: '', notes: '' };
  const isCompleted = inspection.status === 'completed' || inspection.status === 'submitted';

  // Parse options for select type
  const getOptions = (item: ChecksheetItem): string[] => {
    if (!item.options) return [];
    if (Array.isArray(item.options)) return item.options;
    try {
      const parsed = JSON.parse(item.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return item.options.split(',').map((o) => o.trim()).filter(Boolean);
    }
  };

  // Render input based on item type
  const renderInput = () => {
    if (!currentItem) return null;

    switch (currentItem.item_type) {
      case 'checkbox':
        return (
          <ToggleButtonGroup
            value={currentResult.value}
            exclusive
            onChange={(_, val) => val && handleResultChange(val)}
            fullWidth
            sx={{ mt: 2 }}
          >
            <ToggleButton value="OK" sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold' }} color="success">
              OK
            </ToggleButton>
            <ToggleButton value="NG" sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold' }} color="error">
              NG
            </ToggleButton>
          </ToggleButtonGroup>
        );

      case 'select':
        const options = getOptions(currentItem);
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {options.map((option) => (
              <Chip
                key={option}
                label={option}
                onClick={() => handleResultChange(option)}
                color={currentResult.value === option ? 'primary' : 'default'}
                variant={currentResult.value === option ? 'filled' : 'outlined'}
                sx={{ py: 2.5, px: 1, fontSize: '1rem', fontWeight: currentResult.value === option ? 'bold' : 'normal' }}
              />
            ))}
          </Box>
        );

      case 'number':
        return (
          <TextField
            type="number"
            value={currentResult.value}
            onChange={(e) => handleResultChange(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder={getLocalizedValue({ en: 'Enter number', ko: '숫자 입력' }, currentLocale)}
            disabled={isCompleted}
            sx={{ mt: 2, '& input': { fontSize: '1.5rem', textAlign: 'center', py: 2 } }}
          />
        );

      case 'text':
        return (
          <TextField
            value={currentResult.value}
            onChange={(e) => handleResultChange(e.target.value)}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder={getLocalizedValue({ en: 'Enter text', ko: '텍스트 입력' }, currentLocale)}
            disabled={isCompleted}
            sx={{ mt: 2 }}
          />
        );

      case 'photo':
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {currentResult.photoData && (
              <Box sx={{ mb: 2 }}>
                <img src={currentResult.photoData} alt="captured" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
              </Box>
            )}
            <Button
              variant="contained"
              size="large"
              startIcon={<CameraIcon />}
              onClick={() => setPhotoCaptureOpen(true)}
              disabled={isCompleted}
              fullWidth
              sx={{ py: 2 }}
            >
              {currentResult.photoData
                ? getLocalizedValue({ en: 'Retake Photo', ko: '다시 촬영' }, currentLocale)
                : getLocalizedValue({ en: 'Take Photo', ko: '사진 촬영' }, currentLocale)}
            </Button>
          </Box>
        );

      case 'signature':
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {currentResult.signatureData && (
              <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
                <img src={currentResult.signatureData} alt="signature" style={{ maxWidth: '100%', maxHeight: 150 }} />
              </Box>
            )}
            <Button
              variant="contained"
              size="large"
              startIcon={<SignatureIcon />}
              onClick={() => setSignaturePadOpen(true)}
              disabled={isCompleted}
              fullWidth
              sx={{ py: 2 }}
            >
              {currentResult.signatureData
                ? getLocalizedValue({ en: 'Re-sign', ko: '다시 서명' }, currentLocale)
                : getLocalizedValue({ en: 'Sign', ko: '서명하기' }, currentLocale)}
            </Button>
          </Box>
        );

      default:
        return (
          <TextField
            value={currentResult.value}
            onChange={(e) => handleResultChange(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder={getLocalizedValue({ en: 'Enter value', ko: '값 입력' }, currentLocale)}
            disabled={isCompleted}
            sx={{ mt: 2 }}
          />
        );
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
      {/* Header with Network Status */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', pt: 'env(safe-area-inset-top)' }}>
        {/* Network Status Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 0.75,
            bgcolor: isOnline ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.15),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isOnline ? (
              <OnlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <OfflineIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            )}
            <Typography variant="caption" fontWeight="medium" color={isOnline ? 'success.main' : 'warning.main'}>
              {isOnline
                ? getLocalizedValue({ en: 'Online', ko: '온라인' }, currentLocale)
                : getLocalizedValue({ en: 'Offline', ko: '오프라인' }, currentLocale)}
              {isOfflineMode && ` (${getLocalizedValue({ en: 'offline data', ko: '오프라인 데이터' }, currentLocale)})`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isOnline && !isDownloaded && (
              <Button
                size="small"
                startIcon={downloading ? <CircularProgress size={14} /> : <DownloadIcon />}
                onClick={handleDownloadForOffline}
                disabled={downloading}
                sx={{ fontSize: '0.7rem', py: 0.25, minWidth: 0 }}
              >
                {getLocalizedValue({ en: 'Download', ko: '다운로드' }, currentLocale)}
              </Button>
            )}
            {isDownloaded && (
              <Chip
                label={getLocalizedValue({ en: 'Offline Ready', ko: '오프라인 준비됨' }, currentLocale)}
                size="small"
                color="success"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
            {isOnline && syncStatus && syncStatus.pendingCount > 0 && (
              <Button
                size="small"
                startIcon={<SyncIcon />}
                onClick={handleSync}
                color="primary"
                sx={{ fontSize: '0.7rem', py: 0.25, minWidth: 0 }}
              >
                {getLocalizedValue({ en: `Sync (${syncStatus.pendingCount})`, ko: `동기화 (${syncStatus.pendingCount})` }, currentLocale)}
              </Button>
            )}
          </Box>
        </Box>

        {/* Title Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1.5 }}>
          <IconButton onClick={handleBack}>
            <BackIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }} noWrap>
            {inspection.template_name || inspection.title}
          </Typography>
          <Chip
            label={`${completedItems}/${items.length}`}
            size="small"
            color={canSubmit ? 'success' : 'default'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 3 }} />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Item Card */}
        <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, boxShadow: 1 }}>
          {/* Item Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 1, fontWeight: 'bold' }}>
                {currentIndex + 1}/{items.length}
              </Typography>
              {currentItem?.required && (
                <Chip label={getLocalizedValue({ en: 'Required', ko: '필수' }, currentLocale)} size="small" color="error" />
              )}
            </Box>
            {currentResult.value && <CheckIcon color="success" />}
          </Box>

          {/* Item Name */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            {currentItem?.item_name}
          </Typography>

          {/* Item Description */}
          {currentItem?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentItem.description}
            </Typography>
          )}

          {/* Input */}
          {renderInput()}
        </Box>
      </Box>

      {/* Bottom Action Bar */}
      <Box sx={{ bgcolor: 'white', borderTop: 1, borderColor: 'divider', pb: 'env(safe-area-inset-bottom)' }}>
        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Button variant="text" startIcon={<PrevIcon />} onClick={goPrev} disabled={currentIndex === 0} sx={{ minWidth: 80 }}>
            {getLocalizedValue({ en: 'Prev', ko: '이전' }, currentLocale)}
          </Button>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {currentIndex + 1} / {items.length}
          </Typography>
          <Button variant="text" endIcon={<NextIcon />} onClick={goNext} disabled={currentIndex === items.length - 1} sx={{ minWidth: 80 }}>
            {getLocalizedValue({ en: 'Next', ko: '다음' }, currentLocale)}
          </Button>
        </Box>

        {/* Submit Area */}
        {!isCompleted && (
          <Box sx={{ px: 2, pb: 2 }}>
            {canSubmit ? (
              <Button
                variant="contained"
                color={isOnline ? 'success' : 'warning'}
                size="large"
                fullWidth
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : isOnline ? <SubmitIcon /> : <WarningIcon />}
                onClick={handleSubmit}
                disabled={saving}
                sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 3, boxShadow: 4 }}
              >
                {isOnline
                  ? getLocalizedValue({ en: 'Submit Inspection', ko: '점검 제출' }, currentLocale)
                  : getLocalizedValue({ en: 'Submit (Offline)', ko: '제출 (오프라인)' }, currentLocale)}
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ flex: 1, py: 1.5, borderRadius: 2 }}
                >
                  {saving ? <CircularProgress size={20} /> : getLocalizedValue({ en: 'Save', ko: '저장' }, currentLocale)}
                </Button>
                <Button variant="contained" color="inherit" size="large" disabled sx={{ flex: 2, py: 1.5, borderRadius: 2, bgcolor: 'grey.200' }}>
                  {getLocalizedValue({ en: `Required ${completedRequiredItems}/${requiredItems.length}`, ko: `필수 ${completedRequiredItems}/${requiredItems.length}` }, currentLocale)}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Completed State */}
        {isCompleted && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
              <CheckIcon color="success" />
              <Typography color="success.main" fontWeight="bold">
                {getLocalizedValue({ en: 'Inspection Completed', ko: '점검 완료됨' }, currentLocale)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Offline Submit Dialog */}
      <Dialog open={showOfflineDialog} onClose={() => setShowOfflineDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfflineIcon color="warning" />
          {getLocalizedValue({ en: 'Offline Submission', ko: '오프라인 제출' }, currentLocale)}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {getLocalizedValue(
              {
                en: 'You are currently offline. The inspection will be saved and submitted automatically when you are back online.',
                ko: '현재 오프라인 상태입니다. 점검 결과가 저장되고 온라인이 되면 자동으로 제출됩니다.',
              },
              currentLocale
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOfflineDialog(false)}>
            {getLocalizedValue({ en: 'Cancel', ko: '취소' }, currentLocale)}
          </Button>
          <Button variant="contained" onClick={handleOfflineSubmit} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : getLocalizedValue({ en: 'Save for Later', ko: '나중에 제출' }, currentLocale)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Capture */}
      <PhotoCapture open={photoCaptureOpen} onClose={() => setPhotoCaptureOpen(false)} onCapture={handlePhotoCaptured} locale={currentLocale} />

      {/* Signature Pad */}
      <SignaturePad open={signaturePadOpen} onClose={() => setSignaturePadOpen(false)} onSave={handleSignatureSaved} locale={currentLocale} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 100 }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
