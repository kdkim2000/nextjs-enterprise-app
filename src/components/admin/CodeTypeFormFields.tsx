'use client';

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

export interface CodeTypeFormData {
  id?: string;
  code: string;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
  order: number;
  status: 'active' | 'inactive';
  category: string;
}

export interface CodeTypeFormFieldsProps {
  codeType: CodeTypeFormData | null;
  onChange: (codeType: CodeTypeFormData) => void;
  locale?: string;
  labels?: {
    code?: string;
    nameEn?: string;
    nameKo?: string;
    descriptionEn?: string;
    descriptionKo?: string;
    order?: string;
    status?: string;
    category?: string;
  };
}

const CATEGORIES = [
  { value: 'user', labelEn: 'User', labelKo: '사용자' },
  { value: 'organization', labelEn: 'Organization', labelKo: '조직' },
  { value: 'system', labelEn: 'System', labelKo: '시스템' },
  { value: 'workflow', labelEn: 'Workflow', labelKo: '워크플로우' },
  { value: 'common', labelEn: 'Common', labelKo: '공통' }
];

export default function CodeTypeFormFields({
  codeType,
  onChange,
  locale = 'en',
  labels = {}
}: CodeTypeFormFieldsProps) {
  if (!codeType) return null;

  const handleChange = (field: keyof CodeTypeFormData, value: string | number) => {
    onChange({ ...codeType, [field]: value });
  };

  return (
    <>
      {/* Code */}
      <TextField
        label={labels.code || 'Code Type Code'}
        fullWidth
        required
        value={codeType.code || ''}
        onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
        disabled={!!codeType.id}
        placeholder="e.g., USER_STATUS"
        helperText={codeType.id ? 'Code cannot be changed' : 'Unique identifier for this code type'}
      />

      {/* Name (English) */}
      <TextField
        label={labels.nameEn || 'Name (English)'}
        fullWidth
        required
        value={codeType.nameEn || ''}
        onChange={(e) => handleChange('nameEn', e.target.value)}
        placeholder="English display name"
      />

      {/* Name (Korean) */}
      <TextField
        label={labels.nameKo || 'Name (Korean)'}
        fullWidth
        required
        value={codeType.nameKo || ''}
        onChange={(e) => handleChange('nameKo', e.target.value)}
        placeholder="한글 표시 이름"
      />

      {/* Description (English) */}
      <TextField
        label={labels.descriptionEn || 'Description (English)'}
        fullWidth
        multiline
        rows={2}
        value={codeType.descriptionEn || ''}
        onChange={(e) => handleChange('descriptionEn', e.target.value)}
        placeholder="English description"
      />

      {/* Description (Korean) */}
      <TextField
        label={labels.descriptionKo || 'Description (Korean)'}
        fullWidth
        multiline
        rows={2}
        value={codeType.descriptionKo || ''}
        onChange={(e) => handleChange('descriptionKo', e.target.value)}
        placeholder="한글 설명"
      />

      {/* Category */}
      <FormControl fullWidth required>
        <InputLabel>{labels.category || 'Category'}</InputLabel>
        <Select
          value={codeType.category || 'common'}
          label={labels.category || 'Category'}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {locale === 'ko' ? cat.labelKo : cat.labelEn}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Order */}
      <TextField
        label={labels.order || 'Display Order'}
        type="number"
        fullWidth
        required
        value={codeType.order || 1}
        onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
        inputProps={{ min: 1 }}
        helperText="Display order in the list"
      />

      {/* Status */}
      <FormControl fullWidth>
        <InputLabel>{labels.status || 'Status'}</InputLabel>
        <Select
          value={codeType.status || 'active'}
          label={labels.status || 'Status'}
          onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
        >
          <MenuItem value="active">{locale === 'ko' ? '활성' : 'Active'}</MenuItem>
          <MenuItem value="inactive">{locale === 'ko' ? '비활성' : 'Inactive'}</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}
