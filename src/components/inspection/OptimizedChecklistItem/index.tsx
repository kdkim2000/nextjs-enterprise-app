'use client';

import React, { memo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  ErrorOutline as RequiredIcon,
} from '@mui/icons-material';
import ChecklistItemInput, { ItemType } from '../ChecklistItemInput';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface ChecklistItemData {
  id: string;
  item_code: string;
  item_name: string;
  item_type: ItemType;
  description?: string;
  options?: string | string[];
  required: boolean;
}

export interface ChecklistResultData {
  value: string;
  notes: string;
  photoData?: string;
  signatureData?: string;
}

export interface OptimizedChecklistItemProps {
  item: ChecklistItemData;
  result: ChecklistResultData;
  onValueChange: (itemId: string, value: string) => void;
  onNotesChange: (itemId: string, notes: string) => void;
  onPhotoCapture?: (itemId: string) => void;
  onSignatureCapture?: (itemId: string) => void;
  locale?: string;
  disabled?: boolean;
}

/**
 * Optimized checklist item component using React.memo
 * Only re-renders when its specific props change
 */
const OptimizedChecklistItem = memo(
  function OptimizedChecklistItem({
    item,
    result,
    onValueChange,
    onNotesChange,
    onPhotoCapture,
    onSignatureCapture,
    locale = 'ko',
    disabled = false,
  }: OptimizedChecklistItemProps) {
    const isCompleted = result.value !== '';

    // Memoized handlers to prevent unnecessary re-renders
    const handleValueChange = useCallback(
      (value: string) => {
        onValueChange(item.id, value);
      },
      [item.id, onValueChange]
    );

    const handleNotesChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onNotesChange(item.id, event.target.value);
      },
      [item.id, onNotesChange]
    );

    const handlePhotoCapture = useCallback(() => {
      onPhotoCapture?.(item.id);
    }, [item.id, onPhotoCapture]);

    const handleSignatureCapture = useCallback(() => {
      onSignatureCapture?.(item.id);
    }, [item.id, onSignatureCapture]);

    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          transition: 'border-color 0.2s',
          borderColor: isCompleted ? 'success.main' : 'divider',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          {/* Status Icon */}
          {isCompleted ? (
            <CompletedIcon color="success" sx={{ mt: 0.3 }} />
          ) : item.required ? (
            <RequiredIcon color="error" sx={{ mt: 0.3 }} />
          ) : (
            <PendingIcon color="disabled" sx={{ mt: 0.3 }} />
          )}

          {/* Item Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary">
                {item.item_code}
              </Typography>
              {item.required && (
                <Chip
                  label={getLocalizedValue({ en: 'Required', ko: '필수' }, locale)}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
            </Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {item.item_name}
            </Typography>
            {item.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {item.description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Input */}
        <Box sx={{ mb: 2 }}>
          <ChecklistItemInput
            itemType={item.item_type}
            value={result.value}
            onChange={handleValueChange}
            options={item.options}
            required={item.required}
            locale={locale}
            disabled={disabled}
            onPhotoCapture={item.item_type === 'photo' ? handlePhotoCapture : undefined}
            onSignatureCapture={item.item_type === 'signature' ? handleSignatureCapture : undefined}
            photoPreview={result.photoData}
            signaturePreview={result.signatureData}
          />
        </Box>

        {/* Notes */}
        <TextField
          fullWidth
          size="small"
          placeholder={getLocalizedValue({ en: 'Notes (optional)', ko: '비고 (선택)' }, locale)}
          value={result.notes}
          onChange={handleNotesChange}
          multiline
          rows={1}
          disabled={disabled}
        />
      </Paper>
    );
  },
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.result.value === nextProps.result.value &&
      prevProps.result.notes === nextProps.result.notes &&
      prevProps.result.photoData === nextProps.result.photoData &&
      prevProps.result.signatureData === nextProps.result.signatureData &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.locale === nextProps.locale
    );
  }
);

export default OptimizedChecklistItem;
