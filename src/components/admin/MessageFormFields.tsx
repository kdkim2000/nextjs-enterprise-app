'use client';

import React from 'react';
import {
  TextField,
  Stack
} from '@mui/material';
import CodeSelect from '@/components/common/CodeSelect';

export interface MessageFormData {
  id?: string;
  code: string;
  category: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: {
    en: string;
    ko: string;
    zh: string;
    vi: string;
  };
  description: {
    en: string;
    ko: string;
    zh: string;
    vi: string;
  };
  status: 'active' | 'inactive';
}

interface MessageFormFieldsProps {
  data: MessageFormData;
  onChange: (data: MessageFormData) => void;
  mode: 'add' | 'edit';
  locale: string;
}

export default function MessageFormFields({
  data,
  onChange,
  mode,
  locale
}: MessageFormFieldsProps) {
  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onChange({
        ...data,
        [parent]: {
          ...(data[parent as keyof MessageFormData] as any),
          [child]: value
        }
      });
    } else {
      onChange({ ...data, [field]: value });
    }
  };

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label={locale === 'ko' ? '코드' : 'Code'}
        value={data.code}
        onChange={(e) => handleChange('code', e.target.value)}
        disabled={mode === 'edit'}
        required
        placeholder="COMMON_SAVE_SUCCESS"
      />

      <CodeSelect
        codeType="MESSAGE_CATEGORY"
        value={data.category}
        onChange={(value) => handleChange('category', value)}
        label={locale === 'ko' ? '카테고리' : 'Category'}
        required
        locale={locale}
      />

      <CodeSelect
        codeType="MESSAGE_TYPE"
        value={data.type}
        onChange={(value) => handleChange('type', value)}
        label={locale === 'ko' ? '타입' : 'Type'}
        required
        locale={locale}
      />

      <TextField
        fullWidth
        label={locale === 'ko' ? '메시지 (영문)' : 'Message (English)'}
        value={data.message.en}
        onChange={(e) => handleChange('message.en', e.target.value)}
        required
        placeholder="Saved successfully"
      />

      <TextField
        fullWidth
        label={locale === 'ko' ? '메시지 (한글)' : 'Message (Korean)'}
        value={data.message.ko}
        onChange={(e) => handleChange('message.ko', e.target.value)}
        required
        placeholder="저장되었습니다"
      />

      <TextField
        fullWidth
        label={locale === 'ko' ? '메시지 (중국어)' : locale === 'zh' ? '消息（中文）' : locale === 'vi' ? 'Tin nhắn (Tiếng Trung)' : 'Message (Chinese)'}
        value={data.message.zh}
        onChange={(e) => handleChange('message.zh', e.target.value)}
        required
        placeholder="保存成功"
      />

      <TextField
        fullWidth
        label={locale === 'ko' ? '메시지 (베트남어)' : locale === 'zh' ? '消息（越南语）' : locale === 'vi' ? 'Tin nhắn (Tiếng Việt)' : 'Message (Vietnamese)'}
        value={data.message.vi}
        onChange={(e) => handleChange('message.vi', e.target.value)}
        required
        placeholder="Đã lưu thành công"
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label={locale === 'ko' ? '설명 (영문)' : 'Description (English)'}
        value={data.description.en}
        onChange={(e) => handleChange('description.en', e.target.value)}
        required
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label={locale === 'ko' ? '설명 (한글)' : 'Description (Korean)'}
        value={data.description.ko}
        onChange={(e) => handleChange('description.ko', e.target.value)}
        required
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label={locale === 'ko' ? '설명 (중국어)' : locale === 'zh' ? '描述（中文）' : locale === 'vi' ? 'Mô tả (Tiếng Trung)' : 'Description (Chinese)'}
        value={data.description.zh}
        onChange={(e) => handleChange('description.zh', e.target.value)}
        required
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label={locale === 'ko' ? '설명 (베트남어)' : locale === 'zh' ? '描述（越南语）' : locale === 'vi' ? 'Mô tả (Tiếng Việt)' : 'Description (Vietnamese)'}
        value={data.description.vi}
        onChange={(e) => handleChange('description.vi', e.target.value)}
        required
      />

      <CodeSelect
        codeType="COMMON_STATUS"
        value={data.status}
        onChange={(value) => handleChange('status', value)}
        label={locale === 'ko' ? '상태' : 'Status'}
        required
        locale={locale}
      />
    </Stack>
  );
}
