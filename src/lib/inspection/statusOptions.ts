/**
 * Centralized Status Options for Inspection Module
 * Single source of truth for all status-related options
 */

import { getLocalizedValue } from '@/lib/i18n/multiLang';

// ==================== Types ====================

export type TemplateStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';
export type ItemType = 'checkbox' | 'text' | 'number' | 'select' | 'photo' | 'signature' | 'date' | 'time';

export interface StatusOption<T extends string = string> {
  value: T;
  label: Record<string, string>;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  bgColor?: string;
}

export interface CategoryOption {
  value: string;
  label: Record<string, string>;
}

export interface ItemTypeOption {
  value: ItemType;
  label: Record<string, string>;
  icon?: string;
}

// ==================== Template Status Options ====================

export const TEMPLATE_STATUS_OPTIONS: StatusOption<TemplateStatus>[] = [
  {
    value: 'draft',
    label: { ko: '초안', en: 'Draft', zh: '草稿', vi: 'Bản nháp' },
    color: 'default',
    bgColor: '#9e9e9e',
  },
  {
    value: 'active',
    label: { ko: '활성', en: 'Active', zh: '活动', vi: 'Hoạt động' },
    color: 'success',
    bgColor: '#4caf50',
  },
  {
    value: 'inactive',
    label: { ko: '비활성', en: 'Inactive', zh: '不活动', vi: 'Không hoạt động' },
    color: 'warning',
    bgColor: '#ff9800',
  },
  {
    value: 'archived',
    label: { ko: '보관됨', en: 'Archived', zh: '已归档', vi: 'Đã lưu trữ' },
    color: 'error',
    bgColor: '#f44336',
  },
];

// ==================== Inspection Status Options ====================

export const INSPECTION_STATUS_OPTIONS: StatusOption<InspectionStatus>[] = [
  {
    value: 'draft',
    label: { ko: '초안', en: 'Draft', zh: '草稿', vi: 'Bản nháp' },
    color: 'default',
    bgColor: '#9e9e9e',
  },
  {
    value: 'in_progress',
    label: { ko: '진행중', en: 'In Progress', zh: '进行中', vi: 'Đang tiến hành' },
    color: 'info',
    bgColor: '#2196f3',
  },
  {
    value: 'completed',
    label: { ko: '완료', en: 'Completed', zh: '已完成', vi: 'Hoàn thành' },
    color: 'success',
    bgColor: '#4caf50',
  },
  {
    value: 'cancelled',
    label: { ko: '취소', en: 'Cancelled', zh: '已取消', vi: 'Đã hủy' },
    color: 'error',
    bgColor: '#f44336',
  },
];

// ==================== Category Options ====================

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'safety', label: { ko: '안전 점검', en: 'Safety', zh: '安全检查', vi: 'An toàn' } },
  { value: 'quality', label: { ko: '품질 검사', en: 'Quality', zh: '质量检查', vi: 'Chất lượng' } },
  { value: 'equipment', label: { ko: '설비 점검', en: 'Equipment', zh: '设备检查', vi: 'Thiết bị' } },
  { value: 'environment', label: { ko: '환경 점검', en: 'Environment', zh: '环境检查', vi: 'Môi trường' } },
  { value: 'maintenance', label: { ko: '유지보수', en: 'Maintenance', zh: '维护', vi: 'Bảo trì' } },
  { value: 'compliance', label: { ko: '규정 준수', en: 'Compliance', zh: '合规', vi: 'Tuân thủ' } },
  { value: 'other', label: { ko: '기타', en: 'Other', zh: '其他', vi: 'Khác' } },
];

// ==================== Item Type Options ====================

export const ITEM_TYPE_OPTIONS: ItemTypeOption[] = [
  { value: 'checkbox', label: { ko: '체크박스', en: 'Checkbox', zh: '复选框', vi: 'Hộp kiểm' } },
  { value: 'text', label: { ko: '텍스트', en: 'Text', zh: '文本', vi: 'Văn bản' } },
  { value: 'number', label: { ko: '숫자', en: 'Number', zh: '数字', vi: 'Số' } },
  { value: 'select', label: { ko: '선택', en: 'Select', zh: '选择', vi: 'Chọn' } },
  { value: 'date', label: { ko: '날짜', en: 'Date', zh: '日期', vi: 'Ngày' } },
  { value: 'time', label: { ko: '시간', en: 'Time', zh: '时间', vi: 'Thời gian' } },
  { value: 'photo', label: { ko: '사진', en: 'Photo', zh: '照片', vi: 'Ảnh' } },
  { value: 'signature', label: { ko: '서명', en: 'Signature', zh: '签名', vi: 'Chữ ký' } },
];

// ==================== Utility Functions ====================

/**
 * Get status option by value
 */
export function getStatusOption<T extends string>(
  options: StatusOption<T>[],
  value: T
): StatusOption<T> | undefined {
  return options.find((opt) => opt.value === value);
}

/**
 * Get localized status label
 */
export function getStatusLabel<T extends string>(
  options: StatusOption<T>[],
  value: T,
  locale: string
): string {
  const option = getStatusOption(options, value);
  return option ? getLocalizedValue(option.label, locale) : value;
}

/**
 * Get status color
 */
export function getStatusColor<T extends string>(
  options: StatusOption<T>[],
  value: T
): StatusOption['color'] {
  const option = getStatusOption(options, value);
  return option?.color || 'default';
}

/**
 * Get status background color
 */
export function getStatusBgColor<T extends string>(
  options: StatusOption<T>[],
  value: T
): string {
  const option = getStatusOption(options, value);
  return option?.bgColor || '#9e9e9e';
}

/**
 * Get template status label
 */
export function getTemplateStatusLabel(status: TemplateStatus, locale: string): string {
  return getStatusLabel(TEMPLATE_STATUS_OPTIONS, status, locale);
}

/**
 * Get inspection status label
 */
export function getInspectionStatusLabel(status: InspectionStatus, locale: string): string {
  return getStatusLabel(INSPECTION_STATUS_OPTIONS, status, locale);
}

/**
 * Get category label
 */
export function getCategoryLabel(category: string, locale: string): string {
  const option = CATEGORY_OPTIONS.find((opt) => opt.value === category);
  return option ? getLocalizedValue(option.label, locale) : category;
}

/**
 * Get item type label
 */
export function getItemTypeLabel(itemType: ItemType, locale: string): string {
  const option = ITEM_TYPE_OPTIONS.find((opt) => opt.value === itemType);
  return option ? getLocalizedValue(option.label, locale) : itemType;
}

// ==================== Form Select Options (for MUI Select) ====================

/**
 * Convert options to MUI Select MenuItems format
 */
export function toSelectOptions<T extends string>(
  options: StatusOption<T>[],
  locale: string
): Array<{ value: T; label: string }> {
  return options.map((opt) => ({
    value: opt.value,
    label: getLocalizedValue(opt.label, locale),
  }));
}

/**
 * Convert category options to MUI Select MenuItems format
 */
export function toCategorySelectOptions(locale: string): Array<{ value: string; label: string }> {
  return CATEGORY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: getLocalizedValue(opt.label, locale),
  }));
}

/**
 * Convert item type options to MUI Select MenuItems format
 */
export function toItemTypeSelectOptions(locale: string): Array<{ value: ItemType; label: string }> {
  return ITEM_TYPE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: getLocalizedValue(opt.label, locale),
  }));
}

export default {
  TEMPLATE_STATUS_OPTIONS,
  INSPECTION_STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  ITEM_TYPE_OPTIONS,
  getStatusOption,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  getTemplateStatusLabel,
  getInspectionStatusLabel,
  getCategoryLabel,
  getItemTypeLabel,
  toSelectOptions,
  toCategorySelectOptions,
  toItemTypeSelectOptions,
};
