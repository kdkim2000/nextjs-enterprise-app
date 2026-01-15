'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlProps,
} from '@mui/material';
import { CATEGORY_OPTIONS } from '@/lib/inspection/statusOptions';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface CategorySelectProps extends Omit<FormControlProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  locale?: string;
  label?: string;
  includeAll?: boolean;
  allLabel?: Record<string, string>;
}

/**
 * Reusable Category Select Component
 * For inspection template categories with localization
 */
export default function CategorySelect({
  value,
  onChange,
  locale = 'ko',
  label,
  includeAll = false,
  allLabel = { ko: '전체', en: 'All', zh: '全部', vi: 'Tất cả' },
  size = 'small',
  ...formControlProps
}: CategorySelectProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const defaultLabel = getLocalizedValue(
    { ko: '카테고리', en: 'Category', zh: '类别', vi: 'Danh mục' },
    locale
  );

  return (
    <FormControl size={size} {...formControlProps}>
      <InputLabel>{label || defaultLabel}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label={label || defaultLabel}
      >
        {includeAll && (
          <MenuItem value="">
            {getLocalizedValue(allLabel, locale)}
          </MenuItem>
        )}
        {CATEGORY_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {getLocalizedValue(option.label, locale)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
