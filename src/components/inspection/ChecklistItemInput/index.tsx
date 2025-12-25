'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Chip,
  FormControlLabel,
  Switch,
  IconButton,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoIcon,
  Draw as SignatureIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export type ItemType = 'checkbox' | 'text' | 'number' | 'select' | 'photo' | 'signature' | 'date' | 'time';

export interface ChecklistItemInputProps {
  itemType: ItemType;
  value: string;
  onChange: (value: string) => void;
  options?: string; // comma-separated for select type
  required?: boolean;
  locale?: string;
  disabled?: boolean;
  onPhotoCapture?: () => void;
  onSignatureCapture?: () => void;
  photoPreview?: string;
  signaturePreview?: string;
}

// Large touch-friendly checkbox
const TouchCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  locale?: string;
}> = ({ checked, onChange, disabled, locale = 'ko' }) => (
  <Box sx={{ display: 'flex', gap: 2 }}>
    <Button
      variant={checked ? 'contained' : 'outlined'}
      color="success"
      size="large"
      onClick={() => !disabled && onChange(true)}
      disabled={disabled}
      sx={{
        flex: 1,
        py: 2,
        fontSize: '1.1rem',
        borderRadius: 2,
      }}
      startIcon={<CheckIcon />}
    >
      {getLocalizedValue({ en: 'OK', ko: '양호', zh: '良好', vi: 'Tốt' }, locale)}
    </Button>
    <Button
      variant={!checked && checked !== undefined ? 'contained' : 'outlined'}
      color="error"
      size="large"
      onClick={() => !disabled && onChange(false)}
      disabled={disabled}
      sx={{
        flex: 1,
        py: 2,
        fontSize: '1.1rem',
        borderRadius: 2,
      }}
      startIcon={<CancelIcon />}
    >
      {getLocalizedValue({ en: 'NG', ko: '불량', zh: '不良', vi: 'Không tốt' }, locale)}
    </Button>
  </Box>
);

// Touch-friendly number input with +/- buttons
const TouchNumberInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  locale?: string;
}> = ({ value, onChange, disabled, locale = 'ko' }) => {
  const numValue = parseFloat(value) || 0;

  const increment = () => onChange(String(numValue + 1));
  const decrement = () => onChange(String(numValue - 1));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        onClick={decrement}
        disabled={disabled}
        sx={{
          width: 56,
          height: 56,
          bgcolor: 'grey.100',
          '&:hover': { bgcolor: 'grey.200' },
        }}
      >
        <RemoveIcon />
      </IconButton>
      <TextField
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        inputProps={{
          style: { textAlign: 'center', fontSize: '1.5rem' },
        }}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            height: 56,
          },
        }}
      />
      <IconButton
        onClick={increment}
        disabled={disabled}
        sx={{
          width: 56,
          height: 56,
          bgcolor: 'grey.100',
          '&:hover': { bgcolor: 'grey.200' },
        }}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
};

// Touch-friendly select with chips
const TouchSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}> = ({ value, onChange, options, disabled }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
    {options.map((option, idx) => (
      <Chip
        key={idx}
        label={option}
        onClick={() => !disabled && onChange(option)}
        color={value === option ? 'primary' : 'default'}
        variant={value === option ? 'filled' : 'outlined'}
        disabled={disabled}
        sx={{
          py: 2.5,
          px: 1,
          fontSize: '1rem',
          height: 'auto',
          '& .MuiChip-label': {
            px: 2,
          },
        }}
      />
    ))}
  </Box>
);

export default function ChecklistItemInput({
  itemType,
  value,
  onChange,
  options,
  required,
  locale = 'ko',
  disabled = false,
  onPhotoCapture,
  onSignatureCapture,
  photoPreview,
  signaturePreview,
}: ChecklistItemInputProps) {
  switch (itemType) {
    case 'checkbox':
      return (
        <TouchCheckbox
          checked={value === 'true' || value === '1'}
          onChange={(checked) => onChange(checked ? 'true' : 'false')}
          disabled={disabled}
          locale={locale}
        />
      );

    case 'number':
      return (
        <TouchNumberInput
          value={value}
          onChange={onChange}
          disabled={disabled}
          locale={locale}
        />
      );

    case 'select':
      const selectOptions = options?.split(',').map((o) => o.trim()) || [];
      return (
        <TouchSelect
          value={value}
          onChange={onChange}
          options={selectOptions}
          disabled={disabled}
        />
      );

    case 'text':
      return (
        <TextField
          fullWidth
          multiline
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={getLocalizedValue(
            { en: 'Enter text...', ko: '텍스트를 입력하세요...', zh: '输入文本...', vi: 'Nhập văn bản...' },
            locale
          )}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
            },
          }}
        />
      );

    case 'date':
      return (
        <TextField
          fullWidth
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 56,
              fontSize: '1.1rem',
            },
          }}
        />
      );

    case 'time':
      return (
        <TextField
          fullWidth
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 56,
              fontSize: '1.1rem',
            },
          }}
        />
      );

    case 'photo':
      return (
        <Box>
          {photoPreview ? (
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                mb: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={photoPreview}
                alt="Captured"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                }}
              />
            </Paper>
          ) : null}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<PhotoIcon />}
            onClick={onPhotoCapture}
            disabled={disabled}
            sx={{
              py: 2,
              fontSize: '1.1rem',
            }}
          >
            {photoPreview
              ? getLocalizedValue({ en: 'Retake Photo', ko: '다시 촬영', zh: '重新拍照', vi: 'Chụp lại' }, locale)
              : getLocalizedValue({ en: 'Take Photo', ko: '사진 촬영', zh: '拍照', vi: 'Chụp ảnh' }, locale)}
          </Button>
        </Box>
      );

    case 'signature':
      return (
        <Box>
          {signaturePreview ? (
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                mb: 1,
                display: 'flex',
                justifyContent: 'center',
                bgcolor: 'grey.50',
              }}
            >
              <img
                src={signaturePreview}
                alt="Signature"
                style={{
                  maxWidth: '100%',
                  maxHeight: 120,
                  objectFit: 'contain',
                }}
              />
            </Paper>
          ) : null}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<SignatureIcon />}
            onClick={onSignatureCapture}
            disabled={disabled}
            sx={{
              py: 2,
              fontSize: '1.1rem',
            }}
          >
            {signaturePreview
              ? getLocalizedValue({ en: 'Re-sign', ko: '다시 서명', zh: '重新签名', vi: 'Ký lại' }, locale)
              : getLocalizedValue({ en: 'Sign', ko: '서명', zh: '签名', vi: 'Ký tên' }, locale)}
          </Button>
        </Box>
      );

    default:
      return (
        <TextField
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 56,
              fontSize: '1.1rem',
            },
          }}
        />
      );
  }
}
