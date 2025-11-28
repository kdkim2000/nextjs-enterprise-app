'use client';

import React from 'react';
import {
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  InputAdornment,
  Divider
} from '@mui/material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface AttachmentTypeFormData {
  id?: string;
  code: string;
  nameEn?: string;
  nameKo?: string;
  nameZh?: string;
  nameVi?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
  storagePath: string;
  maxFileCount: number;
  maxFileSize: number;
  maxTotalSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  status: string;
  order: number;
}

export interface AttachmentTypeFormFieldsProps {
  data: AttachmentTypeFormData | null;
  onChange: (data: AttachmentTypeFormData) => void;
  locale?: string;
}

// Common file extensions
const COMMON_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'csv', 'hwp', 'zip', 'rar', '7z'
];

export default function AttachmentTypeFormFields({
  data,
  onChange,
  locale = 'en'
}: AttachmentTypeFormFieldsProps) {
  if (!data) return null;

  const handleChange = (field: keyof AttachmentTypeFormData, value: string | number | string[]) => {
    onChange({ ...data, [field]: value });
  };

  // Convert bytes to MB for display
  const bytesToMB = (bytes: number) => Math.round(bytes / 1048576);
  const mbToBytes = (mb: number) => mb * 1048576;

  // Labels
  const labels = {
    basicInfo: getLocalizedValue({ en: 'Basic Information', ko: '기본 정보', zh: '基本信息', vi: 'Thông tin cơ bản' }, locale),
    code: getLocalizedValue({ en: 'Code', ko: '코드', zh: '代码', vi: 'Mã' }, locale),
    storagePath: getLocalizedValue({ en: 'Storage Path', ko: '저장 경로', zh: '存储路径', vi: 'Đường dẫn lưu trữ' }, locale),
    order: getLocalizedValue({ en: 'Order', ko: '순서', zh: '顺序', vi: 'Thứ tự' }, locale),
    status: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
    active: getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Hoạt động' }, locale),
    inactive: getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale),
    multiLangName: getLocalizedValue({ en: 'Multi-language Name', ko: '다국어 이름', zh: '多语言名称', vi: 'Tên đa ngôn ngữ' }, locale),
    nameEn: getLocalizedValue({ en: 'Name (English)', ko: '이름 (영어)', zh: '名称 (英文)', vi: 'Tên (Tiếng Anh)' }, locale),
    nameKo: getLocalizedValue({ en: 'Name (Korean)', ko: '이름 (한국어)', zh: '名称 (韩文)', vi: 'Tên (Tiếng Hàn)' }, locale),
    nameZh: getLocalizedValue({ en: 'Name (Chinese)', ko: '이름 (중국어)', zh: '名称 (中文)', vi: 'Tên (Tiếng Trung)' }, locale),
    nameVi: getLocalizedValue({ en: 'Name (Vietnamese)', ko: '이름 (베트남어)', zh: '名称 (越南文)', vi: 'Tên (Tiếng Việt)' }, locale),
    multiLangDesc: getLocalizedValue({ en: 'Multi-language Description', ko: '다국어 설명', zh: '多语言描述', vi: 'Mô tả đa ngôn ngữ' }, locale),
    descEn: getLocalizedValue({ en: 'Description (English)', ko: '설명 (영어)', zh: '描述 (英文)', vi: 'Mô tả (Tiếng Anh)' }, locale),
    descKo: getLocalizedValue({ en: 'Description (Korean)', ko: '설명 (한국어)', zh: '描述 (韩文)', vi: 'Mô tả (Tiếng Hàn)' }, locale),
    descZh: getLocalizedValue({ en: 'Description (Chinese)', ko: '설명 (중국어)', zh: '描述 (中文)', vi: 'Mô tả (Tiếng Trung)' }, locale),
    descVi: getLocalizedValue({ en: 'Description (Vietnamese)', ko: '설명 (베트남어)', zh: '描述 (越南文)', vi: 'Mô tả (Tiếng Việt)' }, locale),
    fileSettings: getLocalizedValue({ en: 'File Settings', ko: '파일 설정', zh: '文件设置', vi: 'Cài đặt tệp' }, locale),
    maxFileCount: getLocalizedValue({ en: 'Max File Count', ko: '최대 파일 개수', zh: '最大文件数', vi: 'Số file tối đa' }, locale),
    maxFileSize: getLocalizedValue({ en: 'Max File Size', ko: '최대 파일 크기', zh: '最大文件大小', vi: 'Kích thước file tối đa' }, locale),
    maxTotalSize: getLocalizedValue({ en: 'Max Total Size', ko: '최대 총 용량', zh: '最大总大小', vi: 'Tổng dung lượng tối đa' }, locale),
    allowedExtensions: getLocalizedValue({ en: 'Allowed Extensions', ko: '허용 확장자', zh: '允许的扩展名', vi: 'Phần mở rộng được phép' }, locale)
  };

  return (
    <>
      {/* Basic Information */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {labels.basicInfo}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.code}
            fullWidth
            required
            value={data.code || ''}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            disabled={!!data.id}
            helperText={data.id ? getLocalizedValue({ en: 'Code cannot be changed', ko: '코드는 변경할 수 없습니다', zh: '代码不可更改', vi: 'Không thể thay đổi mã' }, locale) : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.storagePath}
            fullWidth
            required
            value={data.storagePath || ''}
            onChange={(e) => handleChange('storagePath', e.target.value)}
            placeholder="/uploads/example"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.order}
            fullWidth
            type="number"
            value={data.order || 0}
            onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>{labels.status}</InputLabel>
            <Select
              value={data.status || 'active'}
              label={labels.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <MenuItem value="active">{labels.active}</MenuItem>
              <MenuItem value="inactive">{labels.inactive}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Multi-language Name */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {labels.multiLangName}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.nameEn}
            fullWidth
            value={data.nameEn || ''}
            onChange={(e) => handleChange('nameEn', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.nameKo}
            fullWidth
            value={data.nameKo || ''}
            onChange={(e) => handleChange('nameKo', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.nameZh}
            fullWidth
            value={data.nameZh || ''}
            onChange={(e) => handleChange('nameZh', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.nameVi}
            fullWidth
            value={data.nameVi || ''}
            onChange={(e) => handleChange('nameVi', e.target.value)}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Multi-language Description */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {labels.multiLangDesc}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.descEn}
            fullWidth
            multiline
            rows={2}
            value={data.descriptionEn || ''}
            onChange={(e) => handleChange('descriptionEn', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.descKo}
            fullWidth
            multiline
            rows={2}
            value={data.descriptionKo || ''}
            onChange={(e) => handleChange('descriptionKo', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.descZh}
            fullWidth
            multiline
            rows={2}
            value={data.descriptionZh || ''}
            onChange={(e) => handleChange('descriptionZh', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={labels.descVi}
            fullWidth
            multiline
            rows={2}
            value={data.descriptionVi || ''}
            onChange={(e) => handleChange('descriptionVi', e.target.value)}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* File Settings */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {labels.fileSettings}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label={labels.maxFileCount}
            fullWidth
            type="number"
            value={data.maxFileCount || 5}
            onChange={(e) => handleChange('maxFileCount', parseInt(e.target.value) || 5)}
            slotProps={{
              input: {
                inputProps: { min: 1, max: 100 }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label={labels.maxFileSize}
            fullWidth
            type="number"
            value={bytesToMB(data.maxFileSize || 10485760)}
            onChange={(e) => handleChange('maxFileSize', mbToBytes(parseInt(e.target.value) || 10))}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                inputProps: { min: 1, max: 500 }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label={labels.maxTotalSize}
            fullWidth
            type="number"
            value={bytesToMB(data.maxTotalSize || 52428800)}
            onChange={(e) => handleChange('maxTotalSize', mbToBytes(parseInt(e.target.value) || 50))}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                inputProps: { min: 1, max: 5000 }
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>{labels.allowedExtensions}</InputLabel>
            <Select
              multiple
              value={data.allowedExtensions || []}
              label={labels.allowedExtensions}
              onChange={(e) => handleChange('allowedExtensions', e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {COMMON_EXTENSIONS.map((ext) => (
                <MenuItem key={ext} value={ext}>
                  {ext}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
