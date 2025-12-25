'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Fab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Send as SubmitIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import MobileDetailSheet from '@/components/mobile/MobileDetailSheet';
import MobileInspectionProgress from '@/components/inspection/MobileInspectionProgress';
import MobileChecklistCard from '@/components/inspection/MobileChecklistCard';
import PhotoCapture from '@/components/inspection/PhotoCapture';
import SignaturePad from '@/components/inspection/SignaturePad';
import { inspectionApi } from '@/lib/axios';
import { useCurrentLocale } from '@/lib/i18n/client';
import { useMessage } from '@/hooks/useMessage';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Inspection, ChecksheetItem, InspectionResult } from '../../../types';

interface ResultState {
  value: string;
  notes: string;
  photoData?: string;
  signatureData?: string;
}

export default function MobileInspectionExecutePage() {
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  const containerRef = useRef<HTMLDivElement>(null);

  const { successMessage, errorMessage, showSuccessMessage, showErrorMessage } = useMessage({
    locale: currentLocale,
  });

  // State
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<ChecksheetItem[]>([]);
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoCaptureOpen, setPhotoCaptureOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const inspectionResponse = await inspectionApi.get(`/executions/${inspectionId}`);
      setInspection(inspectionResponse.inspection);

      const itemsResponse = await inspectionApi.get(
        `/items?template_id=${inspectionResponse.inspection.template_id}`
      );
      const fetchedItems = (itemsResponse.items || [])
        .filter((i: ChecksheetItem) => !i.parent_id)
        .sort((a: ChecksheetItem, b: ChecksheetItem) => a.sort_order - b.sort_order);
      setItems(fetchedItems);

      const resultsResponse = await inspectionApi.get(`/executions/${inspectionId}/results`);
      const existingResults: InspectionResult[] = resultsResponse.results || [];

      const resultsState: Record<string, ResultState> = {};
      existingResults.forEach((r) => {
        resultsState[r.item_id] = {
          value: r.value || '',
          notes: r.notes || '',
          photoData: r.photo_url,
        };
      });

      fetchedItems.forEach((item: ChecksheetItem) => {
        if (!resultsState[item.id]) {
          resultsState[item.id] = { value: '', notes: '' };
        }
      });

      setResults(resultsState);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      await showErrorMessage('COMMON_LOAD_FAIL');
    } finally {
      setLoading(false);
    }
  }, [inspectionId, showErrorMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate progress
  const completedItems = Object.values(results).filter((r) => r.value !== '').length;
  const requiredItems = items.filter((i) => i.required);
  const completedRequiredItems = requiredItems.filter((i) => results[i.id]?.value !== '').length;
  const canSubmit = completedRequiredItems === requiredItems.length;

  // Navigation
  const goToItem = (index: number) => {
    if (index >= 0 && index < items.length) {
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

  // Result handlers
  const handleResultChange = (itemId: string, newResult: ResultState) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: newResult,
    }));
  };

  // Photo capture
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
    setActiveItemId(null);
  };

  // Signature capture
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
    setActiveItemId(null);
  };

  // Save
  const handleSave = async () => {
    try {
      setSaving(true);

      const resultsToSave = Object.entries(results).map(([itemId, result]) => ({
        item_id: itemId,
        value: result.value,
        notes: result.notes,
        photo_url: result.photoData,
      }));

      await inspectionApi.put(`/executions/${inspectionId}/results`, { results: resultsToSave });
      await showSuccessMessage('COMMON_SAVE_SUCCESS');
    } catch (error) {
      console.error('Failed to save:', error);
      await showErrorMessage('COMMON_SAVE_FAIL');
    } finally {
      setSaving(false);
    }
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setSaving(true);

      const resultsToSave = Object.entries(results).map(([itemId, result]) => ({
        item_id: itemId,
        value: result.value,
        notes: result.notes,
        photo_url: result.photoData,
      }));

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

  const handleBack = () => {
    router.push(`/${currentLocale}/inspection/executions`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!inspection || items.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {getLocalizedValue({ en: 'Failed to load inspection', ko: '검사를 불러올 수 없습니다' }, currentLocale)}
        </Alert>
      </Box>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.100',
      }}
    >
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={handleBack}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flex: 1, mx: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {inspection.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {inspection.inspection_code}
            </Typography>
          </Box>
          <IconButton onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Progress */}
      <Box sx={{ px: 2, py: 1, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <MobileInspectionProgress
          totalItems={items.length}
          completedItems={completedItems}
          requiredItems={requiredItems.length}
          completedRequiredItems={completedRequiredItems}
          currentIndex={currentIndex}
          locale={currentLocale}
        />
      </Box>

      {/* Main Content - Swipeable */}
      <Box
        ref={containerRef}
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
            onChange={(result) => handleResultChange(currentItem.id, result)}
            onPhotoCapture={
              currentItem.item_type === 'photo' ? () => handlePhotoCapture(currentItem.id) : undefined
            }
            onSignatureCapture={
              currentItem.item_type === 'signature' ? () => handleSignatureCapture(currentItem.id) : undefined
            }
            locale={currentLocale}
            isActive
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
          {currentIndex + 1} / {items.length}
        </Typography>

        <Button
          variant="outlined"
          endIcon={<NextIcon />}
          onClick={goNext}
          disabled={currentIndex === items.length - 1}
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
        </Box>

        {/* Quick Jump to Items */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {getLocalizedValue({ en: 'Jump to Item', ko: '항목으로 이동' }, currentLocale)}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {items.map((item, idx) => {
              const isCompleted = results[item.id]?.value !== '';
              return (
                <Button
                  key={item.id}
                  variant={idx === currentIndex ? 'contained' : 'outlined'}
                  size="small"
                  color={isCompleted ? 'success' : item.required ? 'error' : 'inherit'}
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
    </Box>
  );
}
