'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  ErrorOutline as RequiredIcon,
} from '@mui/icons-material';
import ChecklistItemInput, { ItemType } from '../ChecklistItemInput';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface ChecklistItem {
  id: string;
  item_code: string;
  item_name: string;
  item_type: ItemType;
  description?: string;
  options?: string;
  required: boolean;
}

export interface ChecklistResult {
  value: string;
  notes: string;
  photoData?: string;
  signatureData?: string;
}

export interface MobileChecklistCardProps {
  item: ChecklistItem;
  result: ChecklistResult;
  onChange: (result: ChecklistResult) => void;
  onPhotoCapture?: () => void;
  onSignatureCapture?: () => void;
  locale?: string;
  disabled?: boolean;
  isActive?: boolean;
}

export default function MobileChecklistCard({
  item,
  result,
  onChange,
  onPhotoCapture,
  onSignatureCapture,
  locale = 'ko',
  disabled = false,
  isActive = false,
}: MobileChecklistCardProps) {
  const [notesExpanded, setNotesExpanded] = useState(false);

  const isCompleted = result.value !== '';

  const handleValueChange = (value: string) => {
    onChange({ ...result, value });
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...result, notes });
  };

  return (
    <Paper
      elevation={isActive ? 4 : 1}
      sx={{
        p: 2,
        borderRadius: 2,
        border: isActive ? 2 : 1,
        borderColor: isActive ? 'primary.main' : 'divider',
        transition: 'all 0.2s',
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
      <Box sx={{ mb: 1 }}>
        <ChecklistItemInput
          itemType={item.item_type}
          value={result.value}
          onChange={handleValueChange}
          options={item.options}
          required={item.required}
          locale={locale}
          disabled={disabled}
          onPhotoCapture={onPhotoCapture}
          onSignatureCapture={onSignatureCapture}
          photoPreview={result.photoData}
          signaturePreview={result.signatureData}
        />
      </Box>

      {/* Notes Section */}
      <Box>
        <Box
          onClick={() => setNotesExpanded(!notesExpanded)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            py: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {getLocalizedValue({ en: 'Notes', ko: '비고' }, locale)}
            {result.notes && ` (${result.notes.length})`}
          </Typography>
          <IconButton size="small" sx={{ ml: 'auto' }}>
            {notesExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Box>
        <Collapse in={notesExpanded}>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder={getLocalizedValue(
              { en: 'Enter notes (optional)', ko: '비고 입력 (선택)' },
              locale
            )}
            value={result.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={disabled}
            sx={{ mt: 1 }}
          />
        </Collapse>
      </Box>
    </Paper>
  );
}
