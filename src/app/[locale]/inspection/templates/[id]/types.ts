export type ItemType = 'checkbox' | 'text' | 'number' | 'select' | 'photo' | 'signature' | 'date' | 'time';

export interface ChecksheetItem {
  id: string;
  template_id: string;
  parent_id?: string | null;
  item_code: string;
  item_name: string;
  item_type: ItemType;
  description?: string;
  options?: string; // JSON string for select options
  required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  children?: ChecksheetItem[];
  level?: number;
}

export interface ChecksheetTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  version: number;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  item_count?: number;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  items?: ChecksheetItem[];
}

export const ITEM_TYPE_OPTIONS: { value: ItemType; label: Record<string, string>; icon: string }[] = [
  { value: 'checkbox', label: { ko: '체크박스', en: 'Checkbox', zh: '复选框', vi: 'Hộp kiểm' }, icon: 'CheckBox' },
  { value: 'text', label: { ko: '텍스트', en: 'Text', zh: '文本', vi: 'Văn bản' }, icon: 'TextFields' },
  { value: 'number', label: { ko: '숫자', en: 'Number', zh: '数字', vi: 'Số' }, icon: 'Numbers' },
  { value: 'select', label: { ko: '선택', en: 'Select', zh: '选择', vi: 'Chọn' }, icon: 'ListAlt' },
  { value: 'photo', label: { ko: '사진', en: 'Photo', zh: '照片', vi: 'Ảnh' }, icon: 'PhotoCamera' },
  { value: 'signature', label: { ko: '서명', en: 'Signature', zh: '签名', vi: 'Chữ ký' }, icon: 'Draw' },
  { value: 'date', label: { ko: '날짜', en: 'Date', zh: '日期', vi: 'Ngày' }, icon: 'CalendarToday' },
  { value: 'time', label: { ko: '시간', en: 'Time', zh: '时间', vi: 'Giờ' }, icon: 'AccessTime' },
];
