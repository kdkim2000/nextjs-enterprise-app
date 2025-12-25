'use client';

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { StatusSelect } from '@/components/inspection/common';
import { Inspection, InspectionStatus, ChecksheetTemplate } from '../types';

export interface InspectionFormFieldsProps {
  inspection: Inspection;
  onChange: (inspection: Inspection) => void;
  templates: ChecksheetTemplate[];
  locale?: string;
  isNew?: boolean;
}

export default function InspectionFormFields({
  inspection,
  onChange,
  templates,
  locale = 'ko',
  isNew = false,
}: InspectionFormFieldsProps) {
  const handleChange = (field: keyof Inspection, value: any) => {
    onChange({ ...inspection, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Template Selection */}
      <FormControl fullWidth required>
        <InputLabel>
          {getLocalizedValue({ en: 'Template', ko: '템플릿', zh: '模板', vi: 'Mẫu' }, locale)}
        </InputLabel>
        <Select
          value={inspection.template_id || ''}
          onChange={(e) => handleChange('template_id', e.target.value)}
          label={getLocalizedValue({ en: 'Template', ko: '템플릿', zh: '模板', vi: 'Mẫu' }, locale)}
          disabled={!isNew}
        >
          <MenuItem value="">
            {getLocalizedValue({ en: 'Select template', ko: '템플릿 선택', zh: '选择模板', vi: 'Chọn mẫu' }, locale)}
          </MenuItem>
          {templates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              {template.code} - {template.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Title */}
      <TextField
        label={getLocalizedValue({ en: 'Title', ko: '제목', zh: '标题', vi: 'Tiêu đề' }, locale)}
        value={inspection.title || ''}
        onChange={(e) => handleChange('title', e.target.value)}
        required
        fullWidth
        placeholder={getLocalizedValue(
          { en: 'Enter inspection title', ko: '검사 제목 입력', zh: '输入检查标题', vi: 'Nhập tiêu đề kiểm tra' },
          locale
        )}
      />

      {/* Description */}
      <TextField
        label={getLocalizedValue({ en: 'Description', ko: '설명', zh: '描述', vi: 'Mô tả' }, locale)}
        value={inspection.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        fullWidth
        multiline
        rows={2}
        placeholder={getLocalizedValue(
          { en: 'Enter description', ko: '설명 입력', zh: '输入描述', vi: 'Nhập mô tả' },
          locale
        )}
      />

      {/* Location */}
      <TextField
        label={getLocalizedValue({ en: 'Location', ko: '위치', zh: '位置', vi: 'Vị trí' }, locale)}
        value={inspection.location || ''}
        onChange={(e) => handleChange('location', e.target.value)}
        fullWidth
        placeholder={getLocalizedValue(
          { en: 'Enter location', ko: '위치 입력', zh: '输入位置', vi: 'Nhập vị trí' },
          locale
        )}
      />

      {/* Inspection Date */}
      <TextField
        label={getLocalizedValue({ en: 'Inspection Date', ko: '검사일', zh: '检查日期', vi: 'Ngày kiểm tra' }, locale)}
        type="date"
        value={inspection.inspection_date?.split('T')[0] || ''}
        onChange={(e) => handleChange('inspection_date', e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      {/* Status (only for existing inspections) - using common component */}
      {!isNew && (
        <StatusSelect
          value={inspection.status || 'draft'}
          onChange={(value) => handleChange('status', value as InspectionStatus)}
          statusType="inspection"
          locale={locale}
          fullWidth
        />
      )}
    </Box>
  );
}
