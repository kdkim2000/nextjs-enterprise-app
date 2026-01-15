'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  FormControlProps,
} from '@mui/material';
import { ITEM_TYPE_OPTIONS, ItemType } from '@/lib/inspection/statusOptions';
import { getItemTypeIcon } from '@/lib/inspection/statusIcons';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface ItemTypeSelectProps extends Omit<FormControlProps, 'onChange'> {
  value: ItemType | '';
  onChange: (value: ItemType) => void;
  locale?: string;
  label?: string;
  showIcon?: boolean;
  includeAll?: boolean;
  allLabel?: Record<string, string>;
}

/**
 * Reusable Item Type Select Component
 * For inspection checksheet item types with localization
 */
export default function ItemTypeSelect({
  value,
  onChange,
  locale = 'ko',
  label,
  showIcon = true,
  includeAll = false,
  allLabel = { ko: '전체', en: 'All', zh: '全部', vi: 'Tất cả' },
  size = 'small',
  ...formControlProps
}: ItemTypeSelectProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as ItemType);
  };

  const defaultLabel = getLocalizedValue(
    { ko: '항목 유형', en: 'Item Type', zh: '项目类型', vi: 'Loại mục' },
    locale
  );

  const renderValue = (selected: string) => {
    if (!selected || selected === '') {
      return getLocalizedValue(allLabel, locale);
    }

    const option = ITEM_TYPE_OPTIONS.find((opt) => opt.value === selected);
    if (!option) return selected;

    const typeLabel = getLocalizedValue(option.label, locale);

    if (showIcon) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getItemTypeIcon(selected as ItemType)}
          {typeLabel}
        </Box>
      );
    }

    return typeLabel;
  };

  return (
    <FormControl size={size} {...formControlProps}>
      <InputLabel>{label || defaultLabel}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label={label || defaultLabel}
        renderValue={renderValue}
      >
        {includeAll && (
          <MenuItem value="">
            {getLocalizedValue(allLabel, locale)}
          </MenuItem>
        )}
        {ITEM_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showIcon && getItemTypeIcon(option.value)}
              {getLocalizedValue(option.label, locale)}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
