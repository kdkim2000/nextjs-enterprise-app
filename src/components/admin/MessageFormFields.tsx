'use client';

import React from 'react';
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack
} from '@mui/material';
import { MESSAGE_CATEGORIES, MESSAGE_TYPES } from '@/app/[locale]/admin/messages/types';

export interface MessageFormData {
  id?: string;
  code: string;
  category: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: {
    en: string;
    ko: string;
  };
  description: {
    en: string;
    ko: string;
  };
  status: 'active' | 'inactive';
}

interface MessageFormFieldsProps {
  data: MessageFormData;
  onChange: (data: MessageFormData) => void;
  mode: 'add' | 'edit';
  locale: string;
}

export default function MessageFormFields({
  data,
  onChange,
  mode,
  locale
}: MessageFormFieldsProps) {
  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onChange({
        ...data,
        [parent]: {
          ...(data[parent as keyof MessageFormData] as any),
          [child]: value
        }
      });
    } else {
      onChange({ ...data, [field]: value });
    }
  };

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label={locale === 'ko' ? '코드' : 'Code'}
        value={data.code}
        onChange={(e) => handleChange('code', e.target.value)}
        disabled={mode === 'edit'}
        required
        placeholder="COMMON_SAVE_SUCCESS"
      />

      <FormControl fullWidth required>
        <InputLabel>{locale === 'ko' ? '카테고리' : 'Category'}</InputLabel>
        <Select
          value={data.category}
          onChange={(e) => handleChange('category', e.target.value)}
          label={locale === 'ko' ? '카테고리' : 'Category'}
        >
          {MESSAGE_CATEGORIES.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {locale === 'ko' ? cat.label.ko : cat.label.en}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required>
        <InputLabel>{locale === 'ko' ? '타입' : 'Type'}</InputLabel>
        <Select
          value={data.type}
          onChange={(e) => handleChange('type', e.target.value)}
          label={locale === 'ko' ? '타입' : 'Type'}
        >
          {MESSAGE_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {locale === 'ko' ? type.label.ko : type.label.en}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label={locale === 'ko' ? '메시지 (영문)' : 'Message (English)'}
        value={data.message.en}
        onChange={(e) => handleChange('message.en', e.target.value)}
        required
        placeholder="Saved successfully"
      />

      <TextField
        fullWidth
        label={locale === 'ko' ? '메시지 (한글)' : 'Message (Korean)'}
        value={data.message.ko}
        onChange={(e) => handleChange('message.ko', e.target.value)}
        required
        placeholder="저장되었습니다"
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label={locale === 'ko' ? '설명 (영문)' : 'Description (English)'}
        value={data.description.en}
        onChange={(e) => handleChange('description.en', e.target.value)}
        required
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label={locale === 'ko' ? '설명 (한글)' : 'Description (Korean)'}
        value={data.description.ko}
        onChange={(e) => handleChange('description.ko', e.target.value)}
        required
      />

      <FormControl fullWidth required>
        <InputLabel>{locale === 'ko' ? '상태' : 'Status'}</InputLabel>
        <Select
          value={data.status}
          onChange={(e) => handleChange('status', e.target.value)}
          label={locale === 'ko' ? '상태' : 'Status'}
        >
          <MenuItem value="active">{locale === 'ko' ? '활성' : 'Active'}</MenuItem>
          <MenuItem value="inactive">{locale === 'ko' ? '비활성' : 'Inactive'}</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
