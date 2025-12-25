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
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  CheckCircle as CheckIcon,
  Send as SubmitIcon,
  CameraAlt as CameraIcon,
  Draw as SignatureIcon,
} from '@mui/icons-material';
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

  const { showSuccessMessage, showErrorMessage } = useMessage({ locale: currentLocale });

  // State
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<ChecksheetItem[]>([]);
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modals
  const [photoCaptureOpen, setPhotoCaptureOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
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

  // Save & Submit
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
      await inspectionApi.put(`/executions/${inspectionId}/results`, { results: resultsToSave });
      await showSuccessMessage('COMMON_SAVE_SUCCESS');
    } catch (error) {
      console.error('Failed to save:', error);
      await showErrorMessage('COMMON_SAVE_FAIL');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
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
          {getLocalizedValue({ en: 'Failed to load inspection', ko: '점검을 불러올 수 없습니다' }, currentLocale)}
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
            {currentResult.photoData ? (
              <Box sx={{ mb: 2 }}>
                <img src={currentResult.photoData} alt="captured" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
              </Box>
            ) : null}
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
            {currentResult.signatureData ? (
              <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
                <img src={currentResult.signatureData} alt="signature" style={{ maxWidth: '100%', maxHeight: 150 }} />
              </Box>
            ) : null}
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
      {/* Simple Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', pt: 'env(safe-area-inset-top)' }}>
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
          <Button
            variant="text"
            startIcon={<PrevIcon />}
            onClick={goPrev}
            disabled={currentIndex === 0}
            sx={{ minWidth: 80 }}
          >
            {getLocalizedValue({ en: 'Prev', ko: '이전' }, currentLocale)}
          </Button>

          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {currentIndex + 1} / {items.length}
          </Typography>

          <Button
            variant="text"
            endIcon={<NextIcon />}
            onClick={goNext}
            disabled={currentIndex === items.length - 1}
            sx={{ minWidth: 80 }}
          >
            {getLocalizedValue({ en: 'Next', ko: '다음' }, currentLocale)}
          </Button>
        </Box>

        {/* Submit Area - Always Visible */}
        {!isCompleted && (
          <Box sx={{ px: 2, pb: 2 }}>
            {canSubmit ? (
              // Ready to submit - prominent green button
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SubmitIcon />}
                onClick={handleSubmit}
                disabled={saving}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  boxShadow: 4,
                }}
              >
                {getLocalizedValue({ en: 'Submit Inspection', ko: '점검 제출' }, currentLocale)}
              </Button>
            ) : (
              // Not ready - show save button with progress hint
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
                <Button
                  variant="contained"
                  color="inherit"
                  size="large"
                  disabled
                  sx={{ flex: 2, py: 1.5, borderRadius: 2, bgcolor: 'grey.200' }}
                >
                  {getLocalizedValue(
                    { en: `Required ${completedRequiredItems}/${requiredItems.length}`, ko: `필수 ${completedRequiredItems}/${requiredItems.length}` },
                    currentLocale
                  )}
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

      {/* Photo Capture */}
      <PhotoCapture
        open={photoCaptureOpen}
        onClose={() => setPhotoCaptureOpen(false)}
        onCapture={handlePhotoCaptured}
        locale={currentLocale}
      />

      {/* Signature Pad */}
      <SignaturePad
        open={signaturePadOpen}
        onClose={() => setSignaturePadOpen(false)}
        onSave={handleSignatureSaved}
        locale={currentLocale}
      />
    </Box>
  );
}
