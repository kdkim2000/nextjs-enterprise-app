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
  Fab,
  Zoom,
  Slide,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Switch,
  FormControlLabel,
  Badge,
  useTheme,
  alpha,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Send as SubmitIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ErrorOutline as RequiredIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  SkipNext as AutoNextIcon,
  TouchApp as SwipeIcon,
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
  const theme = useTheme();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  const containerRef = useRef<HTMLDivElement>(null);

  const { showSuccessMessage, showErrorMessage } = useMessage({
    locale: currentLocale,
  });

  // State
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<ChecksheetItem[]>([]);
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // UX Settings
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Modals & Drawers
  const [menuOpen, setMenuOpen] = useState(false);
  const [itemListOpen, setItemListOpen] = useState(false);
  const [photoCaptureOpen, setPhotoCaptureOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Animation state
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [animating, setAnimating] = useState(false);

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const minSwipeDistance = 50;

  // Snackbar for feedback
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

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

  // Hide swipe hint after first swipe
  useEffect(() => {
    if (!showSwipeHint) return;
    const timer = setTimeout(() => setShowSwipeHint(false), 5000);
    return () => clearTimeout(timer);
  }, [showSwipeHint]);

  // Calculate progress
  const completedItems = Object.values(results).filter((r) => r.value !== '').length;
  const requiredItems = items.filter((i) => i.required);
  const completedRequiredItems = requiredItems.filter((i) => results[i.id]?.value !== '').length;
  const canSubmit = completedRequiredItems === requiredItems.length;
  const itemStatuses = items.map((item) => results[item.id]?.value !== '');

  // Navigation with animation
  const goToItem = useCallback((index: number, direction?: 'left' | 'right') => {
    if (index >= 0 && index < items.length && !animating) {
      setSlideDirection(direction || (index > currentIndex ? 'left' : 'right'));
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setAnimating(false);
        setSwipeOffset(0);
      }, 150);
    }
  }, [items.length, currentIndex, animating]);

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      goToItem(currentIndex + 1, 'left');
      setShowSwipeHint(false);
    }
  }, [currentIndex, items.length, goToItem]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      goToItem(currentIndex - 1, 'right');
      setShowSwipeHint(false);
    }
  }, [currentIndex, goToItem]);

  // Touch handlers for swipe with visual feedback
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    if (touchStart !== null) {
      const diff = touchStart - currentTouch;
      // Limit swipe offset
      const maxOffset = 100;
      setSwipeOffset(Math.max(-maxOffset, Math.min(maxOffset, diff)));
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < items.length - 1) {
      goNext();
    } else if (isRightSwipe && currentIndex > 0) {
      goPrev();
    } else {
      setSwipeOffset(0);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Result handlers with auto-advance
  const handleResultChange = useCallback((itemId: string, newResult: ResultState) => {
    const previousValue = results[itemId]?.value || '';
    setResults((prev) => ({
      ...prev,
      [itemId]: newResult,
    }));

    // Auto-advance if enabled and value changed from empty to filled
    if (autoAdvance && previousValue === '' && newResult.value !== '' && currentIndex < items.length - 1) {
      setTimeout(() => {
        goNext();
        setSnackbar({
          open: true,
          message: getLocalizedValue({ en: 'Moving to next item', ko: '다음 항목으로 이동' }, currentLocale),
        });
      }, 500);
    }
  }, [autoAdvance, currentIndex, items.length, goNext, currentLocale, results]);

  // Photo capture
  const handlePhotoCapture = (itemId: string) => {
    setActiveItemId(itemId);
    setPhotoCaptureOpen(true);
  };

  const handlePhotoCaptured = (imageData: string) => {
    if (activeItemId) {
      handleResultChange(activeItemId, {
        ...results[activeItemId],
        value: 'captured',
        photoData: imageData,
      });
    }
    setPhotoCaptureOpen(false);
    setActiveItemId(null);
  };

  // Signature capture
  const handleSignatureCapture = (itemId: string) => {
    setActiveItemId(itemId);
    setSignaturePadOpen(true);
  };

  const handleSignatureSaved = (signatureData: string) => {
    if (activeItemId) {
      handleResultChange(activeItemId, {
        ...results[activeItemId],
        value: 'signed',
        signatureData: signatureData,
      });
    }
    setSignaturePadOpen(false);
    setActiveItemId(null);
  };

  // Save
  const handleSave = async () => {
    try {
      setSaving(true);

      const resultsToSave = Object.entries(results).map(([itemId, result]) => {
        const photoUrls: string[] = [];
        if (result.photoData) {
          photoUrls.push(result.photoData);
        }
        if (result.signatureData) {
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
      setMenuOpen(false);
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

      const resultsToSave = Object.entries(results).map(([itemId, result]) => {
        const photoUrls: string[] = [];
        if (result.photoData) {
          photoUrls.push(result.photoData);
        }
        if (result.signatureData) {
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          {getLocalizedValue({ en: 'Loading inspection...', ko: '점검 데이터 로딩중...' }, currentLocale)}
        </Typography>
      </Box>
    );
  }

  if (!inspection || items.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {getLocalizedValue({ en: 'Failed to load inspection', ko: '점검을 불러올 수 없습니다' }, currentLocale)}
        </Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          {getLocalizedValue({ en: 'Go Back', ko: '돌아가기' }, currentLocale)}
        </Button>
      </Box>
    );
  }

  const currentItem = items[currentIndex];
  const isCompleted = inspection.status === 'completed' || inspection.status === 'submitted';

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1 }}>
          <IconButton onClick={handleBack} sx={{ color: 'white' }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flex: 1, mx: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {inspection.template_name || inspection.title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {inspection.inspection_code}
            </Typography>
          </Box>
          <IconButton onClick={() => setMenuOpen(true)} sx={{ color: 'white' }}>
            <Badge badgeContent={items.length - completedItems} color="error" max={99}>
              <MenuIcon />
            </Badge>
          </IconButton>
        </Box>

        {/* Progress Section */}
        <Box sx={{ px: 2, pb: 2 }}>
          <MobileInspectionProgress
            totalItems={items.length}
            completedItems={completedItems}
            requiredItems={requiredItems.length}
            completedRequiredItems={completedRequiredItems}
            currentIndex={currentIndex}
            locale={currentLocale}
            variant="detailed"
            itemStatuses={itemStatuses}
            onItemClick={(idx) => goToItem(idx)}
          />
        </Box>
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
          transform: `translateX(${-swipeOffset * 0.3}px)`,
          transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        <Slide direction={slideDirection} in={!animating} mountOnEnter unmountOnExit>
          <Box>
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
                itemNumber={currentIndex + 1}
                totalItems={items.length}
                disabled={isCompleted}
              />
            )}
          </Box>
        </Slide>

        {/* Swipe Hint */}
        <Zoom in={showSwipeHint}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: 3,
              py: 1,
              px: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.1),
            }}
          >
            <SwipeIcon sx={{ fontSize: 20, color: 'info.main' }} />
            <Typography variant="caption" color="info.main">
              {getLocalizedValue(
                { en: 'Swipe left/right to navigate', ko: '좌우로 스와이프하여 이동하세요' },
                currentLocale
              )}
            </Typography>
          </Box>
        </Zoom>
      </Box>

      {/* Bottom Navigation */}
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
          boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <Button
          variant="outlined"
          onClick={goPrev}
          disabled={currentIndex === 0}
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold',
          }}
          startIcon={<PrevIcon />}
        >
          {getLocalizedValue({ en: 'Prev', ko: '이전' }, currentLocale)}
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="primary">
            {currentIndex + 1}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            / {items.length}
          </Typography>
        </Box>

        <Button
          variant={currentIndex === items.length - 1 && canSubmit ? 'contained' : 'outlined'}
          color={currentIndex === items.length - 1 && canSubmit ? 'success' : 'primary'}
          onClick={currentIndex === items.length - 1 && canSubmit && !isCompleted ? handleSubmit : goNext}
          disabled={currentIndex === items.length - 1 && !canSubmit}
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold',
          }}
          endIcon={currentIndex === items.length - 1 && canSubmit ? <SubmitIcon /> : <NextIcon />}
        >
          {currentIndex === items.length - 1 && canSubmit
            ? getLocalizedValue({ en: 'Submit', ko: '제출' }, currentLocale)
            : getLocalizedValue({ en: 'Next', ko: '다음' }, currentLocale)}
        </Button>
      </Box>

      {/* FAB for Save */}
      {!isCompleted && (
        <Zoom in>
          <Fab
            color="primary"
            size="medium"
            onClick={handleSave}
            disabled={saving}
            sx={{
              position: 'fixed',
              right: 16,
              bottom: 'calc(env(safe-area-inset-bottom) + 100px)',
              boxShadow: 3,
            }}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
          </Fab>
        </Zoom>
      )}

      {/* Menu Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: 360,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              {getLocalizedValue({ en: 'Menu', ko: '메뉴' }, currentLocale)}
            </Typography>
            <IconButton onClick={() => setMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ p: 2 }}>
          {!isCompleted && (
            <>
              <Button
                variant="outlined"
                size="large"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                fullWidth
                sx={{ mb: 1.5, py: 1.5, borderRadius: 2 }}
              >
                {getLocalizedValue({ en: 'Save Draft', ko: '임시 저장' }, currentLocale)}
              </Button>
              <Button
                variant="contained"
                size="large"
                color="success"
                startIcon={<SubmitIcon />}
                onClick={handleSubmit}
                disabled={saving || !canSubmit}
                fullWidth
                sx={{ mb: 2, py: 1.5, borderRadius: 2 }}
              >
                {getLocalizedValue({ en: 'Submit Inspection', ko: '점검 제출' }, currentLocale)}
                {!canSubmit && ` (${completedRequiredItems}/${requiredItems.length})`}
              </Button>
            </>
          )}
        </Box>

        <Divider />

        {/* Settings */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <SettingsIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
            {getLocalizedValue({ en: 'Settings', ko: '설정' }, currentLocale)}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  {getLocalizedValue({ en: 'Auto-advance', ko: '자동 다음 이동' }, currentLocale)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue(
                    { en: 'Move to next item after input', ko: '입력 후 자동으로 다음 항목 이동' },
                    currentLocale
                  )}
                </Typography>
              </Box>
            }
            sx={{ ml: 0 }}
          />
        </Box>

        <Divider />

        {/* Item List */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <ListIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
            {getLocalizedValue({ en: 'Item List', ko: '항목 목록' }, currentLocale)} ({completedItems}/{items.length})
          </Typography>
        </Box>
        <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {items.map((item, idx) => {
            const isItemCompleted = results[item.id]?.value !== '';
            const isCurrent = idx === currentIndex;

            return (
              <ListItemButton
                key={item.id}
                selected={isCurrent}
                onClick={() => {
                  goToItem(idx);
                  setMenuOpen(false);
                }}
                sx={{
                  borderLeft: isCurrent ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  bgcolor: isCurrent ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isItemCompleted ? (
                    <CheckIcon color="success" fontSize="small" />
                  ) : item.required ? (
                    <RequiredIcon color="error" fontSize="small" />
                  ) : (
                    <UncheckedIcon color="disabled" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {idx + 1}.
                      </Typography>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: isCurrent ? 'bold' : 'normal',
                          color: isItemCompleted ? 'success.main' : 'text.primary',
                        }}
                      >
                        {item.item_name}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {item.item_code}
                    </Typography>
                  }
                />
                {item.required && !isItemCompleted && (
                  <Typography variant="caption" color="error">
                    {getLocalizedValue({ en: 'Required', ko: '필수' }, currentLocale)}
                  </Typography>
                )}
              </ListItemButton>
            );
          })}
        </List>
      </SwipeableDrawer>

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

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={1500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 140 }}
      />
    </Box>
  );
}
