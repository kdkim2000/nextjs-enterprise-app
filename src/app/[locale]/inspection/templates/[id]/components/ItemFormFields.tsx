'use client';

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { ChecksheetItem, ItemType, ITEM_TYPE_OPTIONS } from '../types';

export interface ItemFormFieldsProps {
  item: ChecksheetItem;
  onChange: (item: ChecksheetItem) => void;
  locale?: string;
  parentItems?: ChecksheetItem[];
}

export default function ItemFormFields({
  item,
  onChange,
  locale = 'ko',
  parentItems = [],
}: ItemFormFieldsProps) {
  const handleChange = (field: keyof ChecksheetItem, value: any) => {
    onChange({ ...item, [field]: value });
  };

  const handleOptionsChange = (optionsStr: string) => {
    handleChange('options', optionsStr);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Parent Item (for hierarchical structure) */}
      {parentItems.length > 0 && (
        <FormControl fullWidth>
          <InputLabel>
            {getLocalizedValue({ en: 'Parent Item', ko: '상위 항목', zh: '父项', vi: 'Mục cha' }, locale)}
          </InputLabel>
          <Select
            value={item.parent_id || ''}
            onChange={(e) => handleChange('parent_id', e.target.value || null)}
            label={getLocalizedValue({ en: 'Parent Item', ko: '상위 항목', zh: '父项', vi: 'Mục cha' }, locale)}
          >
            <MenuItem value="">
              {getLocalizedValue({ en: 'None (Top Level)', ko: '없음 (최상위)', zh: '无 (顶级)', vi: 'Không (Cấp cao nhất)' }, locale)}
            </MenuItem>
            {parentItems.map((pi) => (
              <MenuItem key={pi.id} value={pi.id}>
                {pi.item_code} - {pi.item_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Item Code */}
      <TextField
        label={getLocalizedValue({ en: 'Item Code', ko: '항목 코드', zh: '项目代码', vi: 'Mã mục' }, locale)}
        value={item.item_code || ''}
        onChange={(e) => handleChange('item_code', e.target.value)}
        required
        fullWidth
        placeholder={getLocalizedValue(
          { en: 'e.g., 1.1, A, Q1', ko: '예: 1.1, A, Q1', zh: '例如: 1.1, A, Q1', vi: 'VD: 1.1, A, Q1' },
          locale
        )}
      />

      {/* Item Name */}
      <TextField
        label={getLocalizedValue({ en: 'Item Name', ko: '항목명', zh: '项目名称', vi: 'Tên mục' }, locale)}
        value={item.item_name || ''}
        onChange={(e) => handleChange('item_name', e.target.value)}
        required
        fullWidth
        placeholder={getLocalizedValue(
          { en: 'Enter item name', ko: '항목 이름 입력', zh: '输入项目名称', vi: 'Nhập tên mục' },
          locale
        )}
      />

      {/* Description */}
      <TextField
        label={getLocalizedValue({ en: 'Description', ko: '설명', zh: '描述', vi: 'Mô tả' }, locale)}
        value={item.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        fullWidth
        multiline
        rows={2}
        placeholder={getLocalizedValue(
          { en: 'Enter item description or instructions', ko: '항목 설명 또는 지침 입력', zh: '输入项目描述或说明', vi: 'Nhập mô tả hoặc hướng dẫn' },
          locale
        )}
      />

      {/* Item Type */}
      <FormControl fullWidth required>
        <InputLabel>
          {getLocalizedValue({ en: 'Item Type', ko: '항목 유형', zh: '项目类型', vi: 'Loại mục' }, locale)}
        </InputLabel>
        <Select
          value={item.item_type || 'checkbox'}
          onChange={(e) => handleChange('item_type', e.target.value as ItemType)}
          label={getLocalizedValue({ en: 'Item Type', ko: '항목 유형', zh: '项目类型', vi: 'Loại mục' }, locale)}
        >
          {ITEM_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getLocalizedValue(option.label, locale)}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Options (for select type) */}
      {item.item_type === 'select' && (
        <TextField
          label={getLocalizedValue({ en: 'Options', ko: '선택 옵션', zh: '选项', vi: 'Tùy chọn' }, locale)}
          value={item.options || ''}
          onChange={(e) => handleOptionsChange(e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder={getLocalizedValue(
            {
              en: 'Enter options separated by comma (e.g., Good, Fair, Poor)',
              ko: '옵션을 쉼표로 구분하여 입력 (예: 양호, 보통, 불량)',
              zh: '用逗号分隔输入选项（例如：好、一般、差）',
              vi: 'Nhập các tùy chọn cách nhau bằng dấu phẩy (VD: Tốt, Trung bình, Kém)',
            },
            locale
          )}
          helperText={getLocalizedValue(
            { en: 'Comma-separated values', ko: '쉼표로 구분된 값', zh: '逗号分隔值', vi: 'Các giá trị phân cách bằng dấu phẩy' },
            locale
          )}
        />
      )}

      {/* Preview select options */}
      {item.item_type === 'select' && item.options && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {item.options.split(',').map((opt, idx) => (
            <Chip key={idx} label={opt.trim()} size="small" variant="outlined" />
          ))}
        </Box>
      )}

      {/* Required Switch */}
      <FormControlLabel
        control={
          <Switch
            checked={item.required}
            onChange={(e) => handleChange('required', e.target.checked)}
          />
        }
        label={getLocalizedValue({ en: 'Required', ko: '필수', zh: '必填', vi: 'Bắt buộc' }, locale)}
      />

      {/* Sort Order */}
      <TextField
        label={getLocalizedValue({ en: 'Sort Order', ko: '정렬 순서', zh: '排序', vi: 'Thứ tự' }, locale)}
        type="number"
        value={item.sort_order || 1}
        onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 1)}
        fullWidth
        inputProps={{ min: 1 }}
      />
    </Box>
  );
}
