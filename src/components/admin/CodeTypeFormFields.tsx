'use client';

import React from 'react';
import {
  TextField
} from '@mui/material';
import CodeSelect from '@/components/common/CodeSelect';

export interface CodeTypeFormData {
  id?: string;
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
    nameZh?: string;
    nameVi?: string;
    descriptionEn?: string;
    descriptionKo?: string;
    descriptionZh?: string;
    descriptionVi?: string;
    order?: string;
    status?: string;
    category?: string;
  };
}

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

      {/* Name (Chinese) */}
      <TextField
        label={labels.nameZh || 'Name (Chinese)'}
        fullWidth
        required
        value={codeType.nameZh || ''}
        onChange={(e) => handleChange('nameZh', e.target.value)}
        placeholder="中文显示名称"
      />

      {/* Name (Vietnamese) */}
      <TextField
        label={labels.nameVi || 'Name (Vietnamese)'}
        fullWidth
        required
        value={codeType.nameVi || ''}
        onChange={(e) => handleChange('nameVi', e.target.value)}
        placeholder="Tên hiển thị tiếng Việt"
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

      {/* Description (Chinese) */}
      <TextField
        label={labels.descriptionZh || 'Description (Chinese)'}
        fullWidth
        multiline
        rows={2}
        value={codeType.descriptionZh || ''}
        onChange={(e) => handleChange('descriptionZh', e.target.value)}
        placeholder="中文说明"
      />

      {/* Description (Vietnamese) */}
      <TextField
        label={labels.descriptionVi || 'Description (Vietnamese)'}
        fullWidth
        multiline
        rows={2}
        value={codeType.descriptionVi || ''}
        onChange={(e) => handleChange('descriptionVi', e.target.value)}
        placeholder="Mô tả tiếng Việt"
      />

      {/* Category */}
      <CodeSelect
        codeType="CODE_TYPE_CATEGORY"
        value={codeType.category || 'common'}
        onChange={(value) => handleChange('category', value)}
        label={labels.category || 'Category'}
        required
        locale={locale}
      />

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
      <CodeSelect
        codeType="COMMON_STATUS"
        value={codeType.status || 'active'}
        onChange={(value) => handleChange('status', value as 'active' | 'inactive')}
        label={labels.status || 'Status'}
        required
        locale={locale}
      />
    </>
  );
}
