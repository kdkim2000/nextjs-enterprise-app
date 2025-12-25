'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Send as SubmitIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  PhotoCamera as PhotoIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import MobileDetailSheet from '@/components/mobile/MobileDetailSheet';
import MobileInspectionProgress from '@/components/inspection/MobileInspectionProgress';
import MobileChecklistCard from '@/components/inspection/MobileChecklistCard';
import PhotoCapture from '@/components/inspection/PhotoCapture';
import SignaturePad from '@/components/inspection/SignaturePad';
import { OfflineStatusBar, DownloadOfflineButton, SyncStatusIndicator, SyncDetailPanel } from '@/components/offline';
import { inspectionApi } from '@/lib/axios';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { useMessage } from '@/hooks/useMessage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineInspection } from '@/hooks/useOfflineInspection';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Inspection, InspectionResult, ChecksheetItem } from '../../types';

interface InspectionData {
  inspection: Inspection;
  items: ChecksheetItem[];
  results: Record<string, InspectionResult>;
}

interface SelectOption {
  value: string;
  label: string;
}

// Parse options from various formats to SelectOption[]
const parseSelectOptions = (options?: string | string[] | object): SelectOption[] => {
  if (!options) return [];

  // Already an array
  if (Array.isArray(options)) {
    if (options.length > 0 && typeof options[0] === 'object' && 'value' in options[0]) {
      return options as SelectOption[];
    }
    return options.map(o => ({ value: String(o), label: String(o) }));
  }

  // Object with choices property (JSON format from DB)
  if (typeof options === 'object' && options !== null) {
    const obj = options as any;
    if (obj.choices && Array.isArray(obj.choices)) {
      return obj.choices.map((c: any) => ({
        value: c.value || c.label || String(c),
        label: c.label || c.value || String(c),
      }));
    }
    return Object.entries(options).map(([key, val]) => ({
      value: key,
      label: String(val),
    }));
  }

  // String - could be JSON or comma-separated
  if (typeof options === 'string') {
    const trimmed = options.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'object' && 'value' in parsed[0]) {
            return parsed as SelectOption[];
          }
          return parsed.map(o => ({ value: String(o), label: String(o) }));
        }
        if (parsed.choices && Array.isArray(parsed.choices)) {
          return parsed.choices.map((c: any) => ({
            value: c.value || c.label || String(c),
            label: c.label || c.value || String(c),
          }));
        }
        return Object.entries(parsed).map(([key, val]) => ({
          value: key,
          label: String(val),
        }));
      } catch (e) {
        console.warn('Failed to parse options JSON:', e);
      }
    }
    return trimmed.split(',').map(o => {
      const val = o.trim();
      return { value: val, label: val };
    });
  }

  return [];
};

interface ResultState {
  value: string;
  notes: string;
  photoData?: string;
  signatureData?: string;
}

export default function InspectionExecutePage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  const { isMobileLayout } = useMobile();

  const { successMessage, errorMessage, showSuccessMessage, showErrorMessage } = useMessage({
    locale: currentLocale,
  });

  const [data, setData] = useState<InspectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<Record<string, ResultState>>({});

  // Offline status
  const { isOnline } = useOnlineStatus();
  const [syncDetailOpen, setSyncDetailOpen] = useState(false);

  // Mobile-specific state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoCaptureOpen, setPhotoCaptureOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Fetch inspection data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch inspection details
      const inspectionResponse = await inspectionApi.get(`/executions/${inspectionId}`);
      const inspection = inspectionResponse.inspection;

      // Fetch template items
      const itemsResponse = await inspectionApi.get(`/items?template_id=${inspection.template_id}`);
      const items = itemsResponse.items || [];

      // Fetch existing results
      const resultsResponse = await inspectionApi.get(`/executions/${inspectionId}/results`);
      const existingResults: InspectionResult[] = resultsResponse.results || [];

      // Convert results to lookup map
      const resultsMap: Record<string, InspectionResult> = {};
      const resultsState: Record<string, ResultState> = {};

      existingResults.forEach((r) => {
        resultsMap[r.item_id] = r;
        // Extract photo/signature data from photo_urls
        const photoUrls = r.photo_urls || [];
        const photoData = photoUrls.find((url: string) => url && !url.startsWith('signature:'));
        const signatureEntry = photoUrls.find((url: string) => url && url.startsWith('signature:'));
        // Remove 'signature:' prefix from signature data
        const signatureData = signatureEntry ? signatureEntry.replace('signature:', '') : undefined;

        resultsState[r.item_id] = {
          value: r.value || '',
          notes: r.remarks || '',
          photoData: photoData || undefined,
          signatureData: signatureData,
        };
      });

      // Initialize empty results for items without existing results
      items.forEach((item: ChecksheetItem) => {
        if (!resultsState[item.id]) {
          resultsState[item.id] = { value: '', notes: '' };
        }
      });

      setData({ inspection, items, results: resultsMap });
      setResults(resultsState);
    } catch (error) {
      console.error('Failed to fetch inspection data:', error);
      await showErrorMessage('COMMON_LOAD_FAIL');
    } finally {
      setLoading(false);
    }
  }, [inspectionId, showErrorMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle result change
  const handleResultChange = (itemId: string, field: 'value' | 'notes', value: string) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  // Save results (draft)
  const handleSave = async () => {
    try {
      setSaving(true);

      const resultsToSave = Object.entries(results).map(([itemId, result]) => {
        // Build photo_urls array from photoData and signatureData
        const photoUrls: string[] = [];
        if (result.photoData) {
          photoUrls.push(result.photoData);
        }
        if (result.signatureData) {
          // Mark signature data for identification
          photoUrls.push(`signature:${result.signatureData}`);
        }

        return {
          item_id: itemId,
          value: result.value,
          remarks: result.notes,
          photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        };
      });

      await inspectionApi.put(`/executions/${inspectionId}/results`, { results: resultsToSave });
      await showSuccessMessage('COMMON_SAVE_SUCCESS');
    } catch (error) {
      console.error('Failed to save results:', error);
      await showErrorMessage('COMMON_SAVE_FAIL');
    } finally {
      setSaving(false);
    }
  };

  // Submit inspection (complete)
  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Save results first (with photo/signature data)
      const resultsToSave = Object.entries(results).map(([itemId, result]) => {
        // Build photo_urls array from photoData and signatureData
        const photoUrls: string[] = [];
        if (result.photoData) {
          photoUrls.push(result.photoData);
        }
        if (result.signatureData) {
          // Mark signature data for identification
          photoUrls.push(`signature:${result.signatureData}`);
        }

        return {
          item_id: itemId,
          value: result.value,
          remarks: result.notes,
          photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        };
      });

      await inspectionApi.put(`/executions/${inspectionId}/results`, { results: resultsToSave });

      // Submit (complete) inspection
      await inspectionApi.post(`/executions/${inspectionId}/submit`);
      await showSuccessMessage('COMMON_SUBMIT_SUCCESS');

      router.push(`/${currentLocale}/inspection/executions`);
    } catch (error) {
      console.error('Failed to submit inspection:', error);
      await showErrorMessage('COMMON_SUBMIT_FAIL');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/${currentLocale}/inspection/executions`);
  };

  // Mobile navigation
  const sortedItems = data?.items.filter((item) => !item.parent_id).sort((a, b) => a.sort_order - b.sort_order) || [];
  const currentItem = sortedItems[currentIndex];

  const goToItem = (index: number) => {
    if (index >= 0 && index < sortedItems.length) {
      setCurrentIndex(index);
    }
  };

  const goNext = () => goToItem(currentIndex + 1);
  const goPrev = () => goToItem(currentIndex - 1);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
  };

  // Mobile result change handler
  const handleMobileResultChange = (itemId: string, newResult: ResultState) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: newResult,
    }));
  };

  // Photo capture handlers
  const handlePhotoCapture = (itemId: string) => {
    setActiveItemId(itemId);
    setPhotoCaptureOpen(true);
  };

  const handlePhotoCaptured = (imageData: string) => {
    if (activeItemId) {
      setResults((prev) => ({
        ...prev,
        [activeItemId]: {
          ...prev[activeItemId],
          value: 'captured',
          photoData: imageData,
        },
      }));
    }
    setPhotoCaptureOpen(false);
    setActiveItemId(null);
  };

  // Signature capture handlers
  const handleSignatureCapture = (itemId: string) => {
    setActiveItemId(itemId);
    setSignaturePadOpen(true);
  };

  const handleSignatureSaved = (signatureData: string) => {
    if (activeItemId) {
      setResults((prev) => ({
        ...prev,
        [activeItemId]: {
          ...prev[activeItemId],
          value: 'signed',
          signatureData: signatureData,
        },
      }));
    }
    setSignaturePadOpen(false);
    setActiveItemId(null);
  };

  // Calculate mobile progress
  const completedItems = Object.values(results).filter((r) => r.value !== '').length;
  const requiredItems = sortedItems.filter((i) => i.required);
  const completedRequiredItems = requiredItems.filter((i) => results[i.id]?.value !== '').length;
  const canSubmit = completedRequiredItems === requiredItems.length;

  // Calculate progress
  const calculateProgress = (): number => {
    if (!data) return 0;
    const requiredItems = data.items.filter((i) => i.required);
    if (requiredItems.length === 0) return 100;

    const filledRequired = requiredItems.filter((item) => {
      const result = results[item.id];
      return result && result.value !== '';
    });

    return Math.round((filledRequired.length / requiredItems.length) * 100);
  };

  // Render item input based on type
  const renderItemInput = (item: ChecksheetItem) => {
    const result = results[item.id] || { value: '', notes: '' };

    switch (item.item_type) {
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={result.value === 'true' || result.value === '1'}
                onChange={(e) => handleResultChange(item.id, 'value', e.target.checked ? 'true' : 'false')}
                icon={<UncheckedIcon />}
                checkedIcon={<CheckIcon color="success" />}
              />
            }
            label={getLocalizedValue({ en: 'Checked', ko: '확인됨' }, currentLocale)}
          />
        );

      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            value={result.value}
            onChange={(e) => handleResultChange(item.id, 'value', e.target.value)}
            placeholder={getLocalizedValue({ en: 'Enter text', ko: '텍스트 입력' }, currentLocale)}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            value={result.value}
            onChange={(e) => handleResultChange(item.id, 'value', e.target.value)}
            placeholder={getLocalizedValue({ en: 'Enter number', ko: '숫자 입력' }, currentLocale)}
          />
        );

      case 'select':
        const selectOptions = parseSelectOptions(item.options);
        return (
          <FormControl fullWidth size="small">
            <Select
              value={result.value}
              onChange={(e) => handleResultChange(item.id, 'value', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                {getLocalizedValue({ en: 'Select option', ko: '옵션 선택' }, currentLocale)}
              </MenuItem>
              {selectOptions.map((opt, idx) => (
                <MenuItem key={idx} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <TextField
            fullWidth
            size="small"
            type="date"
            value={result.value}
            onChange={(e) => handleResultChange(item.id, 'value', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'time':
        return (
          <TextField
            fullWidth
            size="small"
            type="time"
            value={result.value}
            onChange={(e) => handleResultChange(item.id, 'value', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'photo':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PhotoIcon />}
              size="small"
              onClick={() => handlePhotoCapture(item.id)}
            >
              {getLocalizedValue({ en: 'Take Photo', ko: '사진 촬영' }, currentLocale)}
            </Button>
            {result.photoData && (
              <Box
                component="img"
                src={result.photoData}
                alt="Captured"
                sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
              />
            )}
          </Box>
        );

      case 'signature':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSignatureCapture(item.id)}
            >
              {getLocalizedValue({ en: 'Sign', ko: '서명' }, currentLocale)}
            </Button>
            {result.signatureData && (
              <Box
                component="img"
                src={result.signatureData}
                alt="Signature"
                sx={{ width: 100, height: 40, objectFit: 'contain', border: 1, borderColor: 'divider', borderRadius: 1 }}
              />
            )}
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            value={result.value}
            onChange={(e) => handleResultChange(item.id, 'value', e.target.value)}
          />
        );
    }
  };

  if (loading) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </StandardCrudPageLayout>
    );
  }

  if (!data) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Alert severity="error">
          {getLocalizedValue({ en: 'Failed to load inspection data', ko: '검사 데이터를 불러오지 못했습니다' }, currentLocale)}
        </Alert>
      </StandardCrudPageLayout>
    );
  }

  const progress = calculateProgress();
  const isCompleted = data.inspection.status === 'completed';

  // Mobile Layout
  if (isMobileLayout) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'grey.100',
        }}
      >
        {/* Offline Status Bar */}
        <OfflineStatusBar locale={currentLocale} />

        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton edge="start" onClick={handleBack}>
              <BackIcon />
            </IconButton>
            <Box sx={{ flex: 1, mx: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {data.inspection.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.inspection.inspection_code}
              </Typography>
            </Box>
            <SyncStatusIndicator
              onClick={() => setSyncDetailOpen(true)}
              locale={currentLocale}
              size="small"
            />
            <IconButton onClick={() => setMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Progress */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <MobileInspectionProgress
            totalItems={sortedItems.length}
            completedItems={completedItems}
            requiredItems={requiredItems.length}
            completedRequiredItems={completedRequiredItems}
            currentIndex={currentIndex}
            locale={currentLocale}
          />
        </Box>

        {/* Main Content - Swipeable */}
        <Box
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {currentItem && (
            <MobileChecklistCard
              item={currentItem}
              result={results[currentItem.id] || { value: '', notes: '' }}
              onChange={(result) => handleMobileResultChange(currentItem.id, result)}
              onPhotoCapture={
                currentItem.item_type === 'photo' ? () => handlePhotoCapture(currentItem.id) : undefined
              }
              onSignatureCapture={
                currentItem.item_type === 'signature' ? () => handleSignatureCapture(currentItem.id) : undefined
              }
              locale={currentLocale}
              isActive
              disabled={isCompleted}
            />
          )}

          {/* Swipe Hint */}
          <Typography
            variant="caption"
            color="text.disabled"
            align="center"
            sx={{ display: 'block', mt: 2 }}
          >
            {getLocalizedValue(
              { en: '← Swipe to navigate →', ko: '← 스와이프하여 이동 →' },
              currentLocale
            )}
          </Typography>
        </Box>

        {/* Navigation Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            pb: 'calc(env(safe-area-inset-bottom) + 16px)',
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<PrevIcon />}
            onClick={goPrev}
            disabled={currentIndex === 0}
            sx={{ flex: 1 }}
          >
            {getLocalizedValue({ en: 'Prev', ko: '이전' }, currentLocale)}
          </Button>

          <Typography variant="body2" sx={{ px: 2 }}>
            {currentIndex + 1} / {sortedItems.length}
          </Typography>

          <Button
            variant="outlined"
            endIcon={<NextIcon />}
            onClick={goNext}
            disabled={currentIndex === sortedItems.length - 1}
            sx={{ flex: 1 }}
          >
            {getLocalizedValue({ en: 'Next', ko: '다음' }, currentLocale)}
          </Button>
        </Box>

        {/* Menu Sheet */}
        <MobileDetailSheet
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          title={getLocalizedValue({ en: 'Actions', ko: '작업' }, currentLocale)}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!isCompleted && (
              <>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={() => {
                    handleSave();
                    setMenuOpen(false);
                  }}
                  disabled={saving}
                  fullWidth
                >
                  {getLocalizedValue({ en: 'Save Draft', ko: '임시 저장' }, currentLocale)}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  color="success"
                  startIcon={<SubmitIcon />}
                  onClick={() => {
                    handleSubmit();
                    setMenuOpen(false);
                  }}
                  disabled={saving || !canSubmit}
                  fullWidth
                >
                  {getLocalizedValue({ en: 'Submit', ko: '제출' }, currentLocale)}
                  {!canSubmit && ` (${completedRequiredItems}/${requiredItems.length})`}
                </Button>
              </>
            )}
          </Box>

          {/* Quick Jump to Items */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {getLocalizedValue({ en: 'Jump to Item', ko: '항목으로 이동' }, currentLocale)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {sortedItems.map((item, idx) => {
                const itemCompleted = results[item.id]?.value !== '';
                return (
                  <Button
                    key={item.id}
                    variant={idx === currentIndex ? 'contained' : 'outlined'}
                    size="small"
                    color={itemCompleted ? 'success' : item.required ? 'error' : 'inherit'}
                    onClick={() => {
                      goToItem(idx);
                      setMenuOpen(false);
                    }}
                    sx={{ minWidth: 40 }}
                  >
                    {idx + 1}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </MobileDetailSheet>

        {/* Photo Capture Dialog */}
        <PhotoCapture
          open={photoCaptureOpen}
          onClose={() => {
            setPhotoCaptureOpen(false);
            setActiveItemId(null);
          }}
          onCapture={handlePhotoCaptured}
          locale={currentLocale}
        />

        {/* Signature Pad Dialog */}
        <SignaturePad
          open={signaturePadOpen}
          onClose={() => {
            setSignaturePadOpen(false);
            setActiveItemId(null);
          }}
          onSave={handleSignatureSaved}
          locale={currentLocale}
        />

        {/* Sync Detail Panel */}
        <SyncDetailPanel
          open={syncDetailOpen}
          onClose={() => setSyncDetailOpen(false)}
          locale={currentLocale}
        />
      </Box>
    );
  }

  // Desktop Layout
  return (
    <StandardCrudPageLayout useMenu showBreadcrumb successMessage={successMessage} errorMessage={errorMessage}>
      {/* Offline Status Bar */}
      <OfflineStatusBar locale={currentLocale} />

      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleBack}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6">{data.inspection.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {data.inspection.inspection_code}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SyncStatusIndicator
              onClick={() => setSyncDetailOpen(true)}
              locale={currentLocale}
            />
            <DownloadOfflineButton
              inspectionId={inspectionId}
              locale={currentLocale}
              variant="icon"
              size="small"
            />
            {!isCompleted && (
              <>
                <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                  {t('common.save')}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SubmitIcon />}
                  onClick={handleSubmit}
                  disabled={saving || progress < 100}
                >
                  {getLocalizedValue({ en: 'Submit', ko: '제출' }, currentLocale)}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {getLocalizedValue({ en: 'Progress', ko: '진행률' }, currentLocale)}:
          </Typography>
          <Box sx={{ flex: 1 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          <Typography variant="body2" fontWeight="bold">
            {progress}%
          </Typography>
        </Box>
      </Paper>

      {/* Checksheet Items */}
      <Paper sx={{ p: 2 }}>
        {sortedItems.map((item, index) => (
          <Box key={item.id}>
            {index > 0 && <Divider sx={{ my: 2 }} />}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              {/* Item Code & Name */}
              <Box sx={{ minWidth: 60 }}>
                <Typography variant="body2" fontWeight="bold">
                  {item.item_code}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body1">{item.item_name}</Typography>
                  {item.required && (
                    <Chip
                      label={getLocalizedValue({ en: 'Required', ko: '필수' }, currentLocale)}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.6rem' }}
                    />
                  )}
                </Box>
                {item.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {item.description}
                  </Typography>
                )}
                {/* Input */}
                <Box sx={{ mb: 1 }}>{renderItemInput(item)}</Box>
                {/* Notes */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder={getLocalizedValue({ en: 'Notes (optional)', ko: '비고 (선택)' }, currentLocale)}
                  value={results[item.id]?.notes || ''}
                  onChange={(e) => handleResultChange(item.id, 'notes', e.target.value)}
                  multiline
                  rows={1}
                  sx={{ mt: 1 }}
                  disabled={isCompleted}
                />
              </Box>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Photo Capture Dialog (Desktop) */}
      <PhotoCapture
        open={photoCaptureOpen}
        onClose={() => {
          setPhotoCaptureOpen(false);
          setActiveItemId(null);
        }}
        onCapture={handlePhotoCaptured}
        locale={currentLocale}
      />

      {/* Signature Pad Dialog (Desktop) */}
      <SignaturePad
        open={signaturePadOpen}
        onClose={() => {
          setSignaturePadOpen(false);
          setActiveItemId(null);
        }}
        onSave={handleSignatureSaved}
        locale={currentLocale}
      />

      {/* Sync Detail Panel */}
      <SyncDetailPanel
        open={syncDetailOpen}
        onClose={() => setSyncDetailOpen(false)}
        locale={currentLocale}
      />
    </StandardCrudPageLayout>
  );
}
