import { MultiLangField } from '@/lib/i18n/multiLang';

export interface Message {
  id: string;
  code: string;
  category: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: MultiLangField;
  description: MultiLangField;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface MessageCategory {
  value: string;
  label: MultiLangField;
}

export const MESSAGE_CATEGORIES: MessageCategory[] = [
  { value: 'common', label: { en: 'Common', ko: '공통', zh: '通用', vi: 'Chung' } },
  { value: 'validation', label: { en: 'Validation', ko: '검증', zh: '验证', vi: 'Xác thực' } },
  { value: 'auth', label: { en: 'Authentication', ko: '인증', zh: '认证', vi: 'Xác thực' } },
  { value: 'user', label: { en: 'User', ko: '사용자', zh: '用户', vi: 'Người dùng' } },
  { value: 'system', label: { en: 'System', ko: '시스템', zh: '系统', vi: 'Hệ thống' } }
];

export const MESSAGE_TYPES: { value: Message['type']; label: { en: string; ko: string; zh: string; vi: string } }[] = [
  { value: 'success', label: { en: 'Success', ko: '성공', zh: '成功', vi: 'Thành công' } },
  { value: 'error', label: { en: 'Error', ko: '오류', zh: '错误', vi: 'Lỗi' } },
  { value: 'warning', label: { en: 'Warning', ko: '경고', zh: '警告', vi: 'Cảnh báo' } },
  { value: 'info', label: { en: 'Info', ko: '정보', zh: '信息', vi: 'Thông tin' } }
];
