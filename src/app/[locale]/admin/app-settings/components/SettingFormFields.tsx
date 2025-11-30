'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Box,
  Typography,
  Divider,
  Chip,
  Alert,
  Button,
  useTheme
} from '@mui/material';
import { AppSetting, ValueType, CategoryType } from '../types';
import { CATEGORIES, VALUE_TYPE_OPTIONS, getLocalizedText } from '../constants';

export interface SettingFormData {
  key: string;
  value: string;
  valueType: ValueType;
  category: CategoryType;
  isReady: boolean;
  isSensitive: boolean;
  descriptionEn: string;
  descriptionKo: string;
  descriptionZh: string;
  descriptionVi: string;
  displayOrder: number;
}

interface SettingFormFieldsProps {
  setting: SettingFormData | null;
  onChange: (setting: SettingFormData) => void;
  locale: string;
  mode?: 'edit' | 'create';
}

export default function SettingFormFields({
  setting,
  onChange,
  locale,
  mode = 'edit'
}: SettingFormFieldsProps) {
  const theme = useTheme();
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Validate JSON
  const validateJson = (val: string, type: ValueType) => {
    if (type !== 'json' || !val) {
      setJsonError(null);
      return true;
    }

    try {
      JSON.parse(val);
      setJsonError(null);
      return true;
    } catch {
      setJsonError('Invalid JSON format');
      return false;
    }
  };

  // Handle field change
  const handleChange = (field: keyof SettingFormData, value: any) => {
    if (!setting) return;

    const newSetting = { ...setting, [field]: value };

    // Validate JSON when value or valueType changes
    if (field === 'value' || field === 'valueType') {
      validateJson(
        field === 'value' ? value : setting.value,
        field === 'valueType' ? value : setting.valueType
      );
    }

    onChange(newSetting);
  };

  // Format JSON
  const handleFormatJson = () => {
    if (!setting || setting.valueType !== 'json') return;
    try {
      const formatted = JSON.stringify(JSON.parse(setting.value), null, 2);
      handleChange('value', formatted);
    } catch {
      // ignore
    }
  };

  if (!setting) return null;

  // Render value input based on type
  const renderValueInput = () => {
    switch (setting.valueType) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={setting.value === 'true'}
                onChange={(e) => handleChange('value', e.target.checked ? 'true' : 'false')}
              />
            }
            label={setting.value === 'true' ? 'True' : 'False'}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={getLocalizedText({ en: 'Value', ko: '값', zh: '值', vi: 'Giá trị' }, locale)}
            value={setting.value}
            onChange={(e) => handleChange('value', e.target.value)}
            size="small"
          />
        );

      case 'json':
        return (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              label={getLocalizedText({ en: 'Value (JSON)', ko: '값 (JSON)', zh: '值 (JSON)', vi: 'Giá trị (JSON)' }, locale)}
              value={setting.value}
              onChange={(e) => handleChange('value', e.target.value)}
              error={!!jsonError}
              helperText={jsonError}
              size="small"
              InputProps={{
                sx: { fontFamily: 'monospace', fontSize: '0.85rem' }
              }}
            />
            {!jsonError && setting.value && (
              <Button size="small" sx={{ mt: 0.5 }} onClick={handleFormatJson}>
                Format JSON
              </Button>
            )}
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            label={getLocalizedText({ en: 'Value', ko: '값', zh: '值', vi: 'Giá trị' }, locale)}
            value={setting.value}
            onChange={(e) => handleChange('value', e.target.value)}
            size="small"
            type={setting.isSensitive ? 'password' : 'text'}
            multiline={setting.value.length > 100}
            rows={setting.value.length > 100 ? 3 : 1}
          />
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Key (only for create mode) */}
      {mode === 'create' && (
        <TextField
          fullWidth
          required
          label={getLocalizedText({ en: 'Setting Key', ko: '설정 키', zh: '设置键', vi: 'Khóa cài đặt' }, locale)}
          value={setting.key}
          onChange={(e) => handleChange('key', e.target.value.replace(/\s/g, '_').toLowerCase())}
          size="small"
          helperText="Use snake_case (e.g., my_setting_key)"
          InputProps={{
            sx: { fontFamily: 'monospace' }
          }}
        />
      )}

      {/* Key display for edit mode */}
      {mode === 'edit' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {getLocalizedText({ en: 'Setting Key:', ko: '설정 키:', zh: '设置键:', vi: 'Khóa:' }, locale)}
          </Typography>
          <Chip
            label={setting.key}
            size="small"
            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
          />
        </Box>
      )}

      <Divider />

      {/* Category & Value Type */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>
            {getLocalizedText({ en: 'Category', ko: '카테고리', zh: '分类', vi: 'Danh mục' }, locale)}
          </InputLabel>
          <Select
            value={setting.category}
            label={getLocalizedText({ en: 'Category', ko: '카테고리', zh: '分类', vi: 'Danh mục' }, locale)}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {getLocalizedText(cat.label, locale)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>
            {getLocalizedText({ en: 'Value Type', ko: '값 타입', zh: '值类型', vi: 'Loại giá trị' }, locale)}
          </InputLabel>
          <Select
            value={setting.valueType}
            label={getLocalizedText({ en: 'Value Type', ko: '값 타입', zh: '值类型', vi: 'Loại giá trị' }, locale)}
            onChange={(e) => handleChange('valueType', e.target.value)}
          >
            {VALUE_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {getLocalizedText(opt.label, locale)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Value */}
      {renderValueInput()}

      <Divider />

      {/* Descriptions */}
      <Typography variant="subtitle2" color="text.secondary">
        {getLocalizedText({ en: 'Descriptions', ko: '설명', zh: '说明', vi: 'Mô tả' }, locale)}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="English"
          value={setting.descriptionEn}
          onChange={(e) => handleChange('descriptionEn', e.target.value)}
        />
        <TextField
          fullWidth
          size="small"
          label="한국어"
          value={setting.descriptionKo}
          onChange={(e) => handleChange('descriptionKo', e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="中文"
          value={setting.descriptionZh}
          onChange={(e) => handleChange('descriptionZh', e.target.value)}
        />
        <TextField
          fullWidth
          size="small"
          label="Tiếng Việt"
          value={setting.descriptionVi}
          onChange={(e) => handleChange('descriptionVi', e.target.value)}
        />
      </Box>

      <Divider />

      {/* Options */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          type="number"
          size="small"
          label={getLocalizedText({ en: 'Display Order', ko: '표시 순서', zh: '显示顺序', vi: 'Thứ tự' }, locale)}
          value={setting.displayOrder}
          onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
          sx={{ width: 120 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={setting.isSensitive}
              onChange={(e) => handleChange('isSensitive', e.target.checked)}
            />
          }
          label={getLocalizedText({ en: 'Sensitive', ko: '민감 데이터', zh: '敏感', vi: 'Nhạy cảm' }, locale)}
        />

        <FormControlLabel
          control={
            <Switch
              checked={setting.isReady}
              onChange={(e) => handleChange('isReady', e.target.checked)}
              color="success"
            />
          }
          label={getLocalizedText({ en: 'Ready to Apply', ko: '적용 준비됨', zh: '准备应用', vi: 'Sẵn sàng' }, locale)}
        />
      </Box>

      {!setting.isReady && (
        <Alert severity="info" sx={{ mt: 1 }}>
          {getLocalizedText({
            en: 'This setting will not be applied until marked as "Ready"',
            ko: '이 설정은 "준비됨"으로 표시될 때까지 적용되지 않습니다',
            zh: '此设置在标记为"就绪"之前不会应用',
            vi: 'Cài đặt này sẽ không được áp dụng cho đến khi được đánh dấu là "Sẵn sàng"'
          }, locale)}
        </Alert>
      )}
    </Box>
  );
}
