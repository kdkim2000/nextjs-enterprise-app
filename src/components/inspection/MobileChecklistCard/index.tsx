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
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  ErrorOutline as RequiredIcon,
  Notes as NotesIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import ChecklistItemInput, { ItemType } from '../ChecklistItemInput';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface ChecklistItem {
  id: string;
  item_code: string;
  item_name: string;
  item_type: ItemType;
  description?: string;
  options?: string | string[];
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
  itemNumber?: number;
  totalItems?: number;
  showAnimation?: boolean;
}

// Get item type label and icon color
const getItemTypeInfo = (
  itemType: ItemType,
  locale: string
): { label: string; color: string } => {
  const types: Record<ItemType, { label: Record<string, string>; color: string }> = {
    checkbox: { label: { en: 'Check', ko: '확인' }, color: '#4caf50' },
    text: { label: { en: 'Text', ko: '텍스트' }, color: '#2196f3' },
    number: { label: { en: 'Number', ko: '숫자' }, color: '#ff9800' },
    select: { label: { en: 'Select', ko: '선택' }, color: '#9c27b0' },
    photo: { label: { en: 'Photo', ko: '사진' }, color: '#e91e63' },
    signature: { label: { en: 'Signature', ko: '서명' }, color: '#00bcd4' },
    date: { label: { en: 'Date', ko: '날짜' }, color: '#795548' },
    time: { label: { en: 'Time', ko: '시간' }, color: '#607d8b' },
  };

  const info = types[itemType] || types.text;
  return {
    label: getLocalizedValue(info.label, locale),
    color: info.color,
  };
};

export default function MobileChecklistCard({
  item,
  result,
  onChange,
  onPhotoCapture,
  onSignatureCapture,
  locale = 'ko',
  disabled = false,
  isActive = false,
  itemNumber,
  totalItems,
  showAnimation = true,
}: MobileChecklistCardProps) {
  const theme = useTheme();
  const [notesExpanded, setNotesExpanded] = useState(result.notes !== '');
  const [showDescription, setShowDescription] = useState(false);

  const isCompleted = result.value !== '';
  const typeInfo = getItemTypeInfo(item.item_type, locale);

  const handleValueChange = (value: string) => {
    onChange({ ...result, value });
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...result, notes });
  };

  return (
    <Fade in={showAnimation} timeout={300}>
      <Paper
        elevation={isActive ? 6 : 2}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: isActive ? `2px solid ${theme.palette.primary.main}` : '1px solid',
          borderColor: isActive ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease',
          transform: isActive ? 'scale(1)' : 'scale(0.98)',
        }}
      >
        {/* Header with gradient */}
        <Box
          sx={{
            background: isCompleted
              ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`
              : item.required
                ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.error.light, 0.03)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.05)} 0%, transparent 100%)`,
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {/* Top Row - Item number and type */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Status Icon */}
              {isCompleted ? (
                <CompletedIcon sx={{ fontSize: 20, color: 'success.main' }} />
              ) : item.required ? (
                <RequiredIcon sx={{ fontSize: 20, color: 'error.main' }} />
              ) : (
                <PendingIcon sx={{ fontSize: 20, color: 'grey.400' }} />
              )}

              {/* Item Code */}
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: alpha(typeInfo.color, 0.15),
                  color: typeInfo.color,
                }}
              >
                {item.item_code}
              </Typography>

              {/* Required Badge */}
              {item.required && (
                <Chip
                  label={getLocalizedValue({ en: 'Required', ko: '필수' }, locale)}
                  size="small"
                  color="error"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                  }}
                />
              )}
            </Box>

            {/* Item number */}
            {itemNumber !== undefined && totalItems !== undefined && (
              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                {itemNumber}/{totalItems}
              </Typography>
            )}
          </Box>

          {/* Item Name */}
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              lineHeight: 1.3,
              color: isCompleted ? 'success.dark' : 'text.primary',
            }}
          >
            {item.item_name}
          </Typography>

          {/* Description toggle */}
          {item.description && (
            <Box
              onClick={() => setShowDescription(!showDescription)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.5,
                cursor: 'pointer',
                color: 'text.secondary',
              }}
            >
              <InfoIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">
                {getLocalizedValue({ en: 'Description', ko: '설명' }, locale)}
              </Typography>
              {showDescription ? <CollapseIcon sx={{ fontSize: 14 }} /> : <ExpandIcon sx={{ fontSize: 14 }} />}
            </Box>
          )}
          <Collapse in={showDescription}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, pl: 0.5 }}>
              {item.description}
            </Typography>
          </Collapse>
        </Box>

        {/* Input Section */}
        <Box sx={{ p: 2 }}>
          {/* Type indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box
              sx={{
                width: 4,
                height: 16,
                borderRadius: 2,
                bgcolor: typeInfo.color,
              }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
              {typeInfo.label}
            </Typography>
          </Box>

          {/* Main Input */}
          <Box
            sx={{
              '& .MuiButton-root': {
                minHeight: 56,
              },
              '& .MuiChip-root': {
                minHeight: 44,
              },
            }}
          >
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

          {/* Completion indicator */}
          {isCompleted && (
            <Fade in>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  mt: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                }}
              >
                <CompletedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" fontWeight="medium">
                  {getLocalizedValue({ en: 'Completed', ko: '입력 완료' }, locale)}
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>

        {/* Notes Section */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.grey[500], 0.03),
          }}
        >
          <Box
            onClick={() => setNotesExpanded(!notesExpanded)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1.5,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[500], 0.05),
              },
            }}
          >
            <NotesIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {getLocalizedValue({ en: 'Notes', ko: '비고' }, locale)}
              {result.notes && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, color: 'primary.main' }}
                >
                  ({result.notes.length}{getLocalizedValue({ en: ' chars', ko: '자' }, locale)})
                </Typography>
              )}
            </Typography>
            <IconButton size="small">
              {notesExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          </Box>
          <Collapse in={notesExpanded}>
            <Box sx={{ px: 2, pb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder={getLocalizedValue(
                  { en: 'Enter additional notes (optional)', ko: '추가 비고를 입력하세요 (선택)' },
                  locale
                )}
                value={result.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                disabled={disabled}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                  },
                }}
              />
            </Box>
          </Collapse>
        </Box>
      </Paper>
    </Fade>
  );
}
