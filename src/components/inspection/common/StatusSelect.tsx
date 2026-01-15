'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Box,
  FormControlProps,
} from '@mui/material';
import {
  TEMPLATE_STATUS_OPTIONS,
  INSPECTION_STATUS_OPTIONS,
  StatusOption,
  TemplateStatus,
  InspectionStatus,
  getStatusLabel,
  getStatusColor,
} from '@/lib/inspection/statusOptions';
import {
  getTemplateStatusIcon,
  getInspectionStatusIcon,
} from '@/lib/inspection/statusIcons';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export type StatusType = 'template' | 'inspection';

export interface StatusSelectProps extends Omit<FormControlProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  statusType: StatusType;
  locale?: string;
  label?: string;
  showIcon?: boolean;
  showChip?: boolean;
  includeAll?: boolean;
  allLabel?: Record<string, string>;
}

/**
 * Reusable Status Select Component
 * Supports template and inspection statuses with localization
 */
export default function StatusSelect({
  value,
  onChange,
  statusType,
  locale = 'ko',
  label,
  showIcon = false,
  showChip = false,
  includeAll = false,
  allLabel = { ko: '전체', en: 'All', zh: '全部', vi: 'Tất cả' },
  size = 'small',
  ...formControlProps
}: StatusSelectProps) {
  const options: StatusOption[] =
    statusType === 'template' ? TEMPLATE_STATUS_OPTIONS : INSPECTION_STATUS_OPTIONS;

  const getIcon = (status: string) => {
    if (statusType === 'template') {
      return getTemplateStatusIcon(status as TemplateStatus);
    }
    return getInspectionStatusIcon(status as InspectionStatus);
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const defaultLabel = getLocalizedValue(
    { ko: '상태', en: 'Status', zh: '状态', vi: 'Trạng thái' },
    locale
  );

  const renderValue = (selected: string) => {
    if (!selected || selected === '') {
      return getLocalizedValue(allLabel, locale);
    }

    const selectedOption = options.find((opt) => opt.value === selected);
    if (!selectedOption) return selected;

    const statusLabel = getLocalizedValue(selectedOption.label, locale);

    if (showChip) {
      return (
        <Chip
          label={statusLabel}
          size="small"
          color={selectedOption.color}
          icon={showIcon ? (getIcon(selected) as React.ReactElement) : undefined}
          sx={{ height: 24 }}
        />
      );
    }

    if (showIcon) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getIcon(selected)}
          {statusLabel}
        </Box>
      );
    }

    return statusLabel;
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
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showIcon && getIcon(option.value)}
              {getLocalizedValue(option.label, locale)}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
