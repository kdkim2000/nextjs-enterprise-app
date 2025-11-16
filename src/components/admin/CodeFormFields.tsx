'use client';

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

export interface CodeFormData {
  id?: string;
  codeType: string;
  code: string;
  nameEn: string;
  nameKo: string;
  nameZh: string;
  nameVi: string;
  descriptionEn: string;
  descriptionKo: string;
  descriptionZh: string;
  descriptionVi: string;
  order: number;
  status: 'active' | 'inactive';
  parentCode: string;
  attributes: string; // JSON string
}

export interface CodeFormFieldsProps {
  code: CodeFormData | null;
  onChange: (code: CodeFormData) => void;
  onError?: (error: string) => void;
  locale?: string;
  labels?: {
    codeType?: string;
    code?: string;
    nameEn?: string;
    nameKo?: string;
    nameZh?: string;
    nameVi?: string;
    descriptionEn?: string;
    descriptionKo?: string;
    descriptionZh?: string;
    descriptionVi?: string;
    order?: string;
    status?: string;
    parentCode?: string;
    attributes?: string;
  };
}

export default function CodeFormFields({
  code,
  onChange,
  locale = 'en',
  labels = {}
}: CodeFormFieldsProps) {
  if (!code) return null;

  const handleChange = (field: keyof CodeFormData, value: string | number) => {
    onChange({ ...code, [field]: value });
  };

  return (
    <>
      {/* Code Type */}
      <TextField
        label={labels.codeType || 'Code Type'}
        fullWidth
        required
        value={code.codeType || ''}
        onChange={(e) => handleChange('codeType', e.target.value)}
        placeholder="e.g., USER_STATUS, DEPT_STATUS"
        helperText="Group identifier for related codes"
      />

      {/* Code */}
      <TextField
        label={labels.code || 'Code'}
        fullWidth
        required
        value={code.code || ''}
        onChange={(e) => handleChange('code', e.target.value)}
        disabled={!!code.id}
        placeholder="e.g., ACTIVE, INACTIVE"
        helperText={code.id ? 'Code cannot be changed' : 'Unique identifier within code type'}
      />

      {/* Name (English) */}
      <TextField
        label={labels.nameEn || 'Name (English)'}
        fullWidth
        required
        value={code.nameEn || ''}
        onChange={(e) => handleChange('nameEn', e.target.value)}
        placeholder="English display name"
      />

      {/* Name (Korean) */}
      <TextField
        label={labels.nameKo || 'Name (Korean)'}
        fullWidth
        required
        value={code.nameKo || ''}
        onChange={(e) => handleChange('nameKo', e.target.value)}
        placeholder="한글 표시 이름"
      />

      {/* Name (Chinese) */}
      <TextField
        label={labels.nameZh || 'Name (Chinese)'}
        fullWidth
        required
        value={code.nameZh || ''}
        onChange={(e) => handleChange('nameZh', e.target.value)}
        placeholder="中文显示名称"
      />

      {/* Name (Vietnamese) */}
      <TextField
        label={labels.nameVi || 'Name (Vietnamese)'}
        fullWidth
        required
        value={code.nameVi || ''}
        onChange={(e) => handleChange('nameVi', e.target.value)}
        placeholder="Tên hiển thị tiếng Việt"
      />

      {/* Description (English) */}
      <TextField
        label={labels.descriptionEn || 'Description (English)'}
        fullWidth
        multiline
        rows={2}
        value={code.descriptionEn || ''}
        onChange={(e) => handleChange('descriptionEn', e.target.value)}
        placeholder="English description"
      />

      {/* Description (Korean) */}
      <TextField
        label={labels.descriptionKo || 'Description (Korean)'}
        fullWidth
        multiline
        rows={2}
        value={code.descriptionKo || ''}
        onChange={(e) => handleChange('descriptionKo', e.target.value)}
        placeholder="한글 설명"
      />

      {/* Description (Chinese) */}
      <TextField
        label={labels.descriptionZh || 'Description (Chinese)'}
        fullWidth
        multiline
        rows={2}
        value={code.descriptionZh || ''}
        onChange={(e) => handleChange('descriptionZh', e.target.value)}
        placeholder="中文说明"
      />

      {/* Description (Vietnamese) */}
      <TextField
        label={labels.descriptionVi || 'Description (Vietnamese)'}
        fullWidth
        multiline
        rows={2}
        value={code.descriptionVi || ''}
        onChange={(e) => handleChange('descriptionVi', e.target.value)}
        placeholder="Mô tả tiếng Việt"
      />

      {/* Order */}
      <TextField
        label={labels.order || 'Display Order'}
        type="number"
        fullWidth
        required
        value={code.order || 1}
        onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
        inputProps={{ min: 1 }}
        helperText="Display order within code type"
      />

      {/* Status */}
      <FormControl fullWidth>
        <InputLabel>{labels.status || 'Status'}</InputLabel>
        <Select
          value={code.status || 'active'}
          label={labels.status || 'Status'}
          onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
        >
          <MenuItem value="active">{locale === 'ko' ? '활성' : 'Active'}</MenuItem>
          <MenuItem value="inactive">{locale === 'ko' ? '비활성' : 'Inactive'}</MenuItem>
        </Select>
      </FormControl>

      {/* Parent Code */}
      <TextField
        label={labels.parentCode || 'Parent Code'}
        fullWidth
        value={code.parentCode || ''}
        onChange={(e) => handleChange('parentCode', e.target.value)}
        placeholder="Parent code ID (optional)"
        helperText="For hierarchical code structures"
      />

      {/* Attributes */}
      <TextField
        label={labels.attributes || 'Attributes (JSON)'}
        fullWidth
        multiline
        rows={3}
        value={code.attributes || '{}'}
        onChange={(e) => handleChange('attributes', e.target.value)}
        placeholder='{"key": "value"}'
        helperText="Additional attributes in JSON format"
      />
    </>
  );
}
