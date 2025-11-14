export interface Message {
  id: string;
  code: string;
  category: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: {
    en: string;
    ko: string;
  };
  description: {
    en: string;
    ko: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface MessageCategory {
  value: string;
  label: {
    en: string;
    ko: string;
  };
}

export const MESSAGE_CATEGORIES: MessageCategory[] = [
  { value: 'common', label: { en: 'Common', ko: '공통' } },
  { value: 'validation', label: { en: 'Validation', ko: '검증' } },
  { value: 'auth', label: { en: 'Authentication', ko: '인증' } },
  { value: 'user', label: { en: 'User', ko: '사용자' } },
  { value: 'system', label: { en: 'System', ko: '시스템' } }
];

export const MESSAGE_TYPES: { value: Message['type']; label: { en: string; ko: string } }[] = [
  { value: 'success', label: { en: 'Success', ko: '성공' } },
  { value: 'error', label: { en: 'Error', ko: '오류' } },
  { value: 'warning', label: { en: 'Warning', ko: '경고' } },
  { value: 'info', label: { en: 'Info', ko: '정보' } }
];
