'use client';

import React from 'react';
import { Box, TextField, FormHelperText } from '@mui/material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { StatusSelect, CategorySelect } from '@/components/inspection/common';
import { ChecksheetTemplate, TemplateStatus } from '../types';

export interface TemplateFormFieldsProps {
  template: ChecksheetTemplate;
  onChange: (template: ChecksheetTemplate) => void;
  locale?: string;
  isNew?: boolean;
}

export default function TemplateFormFields({
  template,
  onChange,
  locale = 'ko',
  isNew = false,
}: TemplateFormFieldsProps) {
  const handleChange = (field: keyof ChecksheetTemplate, value: any) => {
    onChange({ ...template, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Code */}
      <TextField
        label={getLocalizedValue({ en: 'Code', ko: '코드', zh: '编码', vi: 'Mã' }, locale)}
        value={template.code || ''}
        onChange={(e) => handleChange('code', e.target.value)}
        required
        fullWidth
        placeholder={getLocalizedValue(
          { en: 'e.g., SAFETY-001', ko: '예: SAFETY-001', zh: '例如: SAFETY-001', vi: 'VD: SAFETY-001' },
          locale
        )}
        helperText={getLocalizedValue(
          { en: 'Unique template code', ko: '고유한 템플릿 코드', zh: '唯一模板代码', vi: 'Mã mẫu duy nhất' },
          locale
        )}
      />

      {/* Name */}
      <TextField
        label={getLocalizedValue({ en: 'Template Name', ko: '템플릿명', zh: '模板名称', vi: 'Tên mẫu' }, locale)}
        value={template.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
        required
        fullWidth
        placeholder={getLocalizedValue(
          { en: 'Enter template name', ko: '템플릿 이름 입력', zh: '输入模板名称', vi: 'Nhập tên mẫu' },
          locale
        )}
      />

      {/* Description */}
      <TextField
        label={getLocalizedValue({ en: 'Description', ko: '설명', zh: '描述', vi: 'Mô tả' }, locale)}
        value={template.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        fullWidth
        multiline
        rows={3}
        placeholder={getLocalizedValue(
          { en: 'Enter template description', ko: '템플릿 설명 입력', zh: '输入模板描述', vi: 'Nhập mô tả mẫu' },
          locale
        )}
      />

      {/* Category - using common component */}
      <CategorySelect
        value={template.category || ''}
        onChange={(value) => handleChange('category', value)}
        locale={locale}
        fullWidth
      />

      {/* Status - using common component */}
      <Box>
        <StatusSelect
          value={template.status || 'draft'}
          onChange={(value) => handleChange('status', value as TemplateStatus)}
          statusType="template"
          locale={locale}
          fullWidth
          required
        />
        <FormHelperText>
          {getLocalizedValue(
            {
              en: 'Draft templates can be edited. Active templates are used for inspections.',
              ko: '초안 템플릿은 수정 가능합니다. 활성 템플릿은 검사에 사용됩니다.',
              zh: '草稿模板可编辑。激活的模板用于检查。',
              vi: 'Mẫu nháp có thể chỉnh sửa. Mẫu hoạt động được sử dụng để kiểm tra.',
            },
            locale
          )}
        </FormHelperText>
      </Box>

      {/* Version (read-only for existing templates) */}
      {!isNew && (
        <TextField
          label={getLocalizedValue({ en: 'Version', ko: '버전', zh: '版本', vi: 'Phiên bản' }, locale)}
          value={template.version || 1}
          InputProps={{ readOnly: true }}
          fullWidth
          helperText={getLocalizedValue(
            {
              en: 'Version is automatically incremented on updates',
              ko: '버전은 수정 시 자동으로 증가합니다',
              zh: '版本在更新时自动递增',
              vi: 'Phiên bản tự động tăng khi cập nhật',
            },
            locale
          )}
        />
      )}
    </Box>
  );
}
