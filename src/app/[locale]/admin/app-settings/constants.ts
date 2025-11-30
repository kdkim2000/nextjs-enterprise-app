/**
 * App Settings Constants
 */

import React from 'react';
import {
  Info,
  Palette,
  Language,
  Security,
  VpnKey,
  Notifications,
  CloudUpload,
  Build,
  Flag,
  Business,
  Settings
} from '@mui/icons-material';
import { CategoryInfo, CategoryType, MultiLangText } from './types';
import { CategoryItem } from '@/components/common/CategoryNavPanel';

// Re-export CategoryType for convenience
export type { CategoryType } from './types';

// Category information with icons and labels
export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'basic',
    icon: 'Info',
    label: { en: 'Basic Information', ko: '기본 정보', zh: '基本信息', vi: 'Thông tin cơ bản' },
    description: { en: 'Application name, logo, version', ko: '어플리케이션 명, 로고, 버전', zh: '应用名称、标志、版本', vi: 'Tên ứng dụng, logo, phiên bản' }
  },
  {
    id: 'branding',
    icon: 'Palette',
    label: { en: 'Branding / UI', ko: '브랜딩 / UI', zh: '品牌 / UI', vi: 'Thương hiệu / UI' },
    description: { en: 'Theme colors, styles', ko: '테마 색상, 스타일', zh: '主题颜色、样式', vi: 'Màu chủ đề, kiểu dáng' }
  },
  {
    id: 'localization',
    icon: 'Language',
    label: { en: 'Localization', ko: '지역화 설정', zh: '本地化', vi: 'Bản địa hóa' },
    description: { en: 'Language, timezone, formats', ko: '언어, 시간대, 형식', zh: '语言、时区、格式', vi: 'Ngôn ngữ, múi giờ, định dạng' }
  },
  {
    id: 'security',
    icon: 'Security',
    label: { en: 'Security', ko: '보안 설정', zh: '安全设置', vi: 'Bảo mật' },
    description: { en: 'Password policies, session, 2FA', ko: '비밀번호 정책, 세션, 2FA', zh: '密码策略、会话、双因素', vi: 'Chính sách mật khẩu, phiên, 2FA' }
  },
  {
    id: 'authentication',
    icon: 'VpnKey',
    label: { en: 'Authentication', ko: '인증 설정', zh: '认证设置', vi: 'Xác thực' },
    description: { en: 'SSO, LDAP, OAuth', ko: 'SSO, LDAP, OAuth', zh: 'SSO、LDAP、OAuth', vi: 'SSO, LDAP, OAuth' }
  },
  {
    id: 'notification',
    icon: 'Notifications',
    label: { en: 'Notifications', ko: '알림 설정', zh: '通知设置', vi: 'Thông báo' },
    description: { en: 'Email, push notifications', ko: '이메일, 푸시 알림', zh: '邮件、推送通知', vi: 'Email, thông báo đẩy' }
  },
  {
    id: 'file_upload',
    icon: 'CloudUpload',
    label: { en: 'File Upload', ko: '파일 업로드', zh: '文件上传', vi: 'Tải lên tệp' },
    description: { en: 'File size limits, allowed types', ko: '파일 크기 제한, 허용 유형', zh: '文件大小限制、允许类型', vi: 'Giới hạn kích thước, loại cho phép' }
  },
  {
    id: 'operations',
    icon: 'Build',
    label: { en: 'Operations', ko: '시스템 운영', zh: '系统运维', vi: 'Vận hành' },
    description: { en: 'Maintenance mode, logging, rate limits', ko: '점검 모드, 로깅, 요청 제한', zh: '维护模式、日志、速率限制', vi: 'Chế độ bảo trì, nhật ký, giới hạn' }
  },
  {
    id: 'feature_flags',
    icon: 'Flag',
    label: { en: 'Feature Flags', ko: '기능 플래그', zh: '功能开关', vi: 'Cờ tính năng' },
    description: { en: 'Enable/disable features', ko: '기능 활성화/비활성화', zh: '启用/禁用功能', vi: 'Bật/tắt tính năng' }
  },
  {
    id: 'organization',
    icon: 'Business',
    label: { en: 'Organization', ko: '회사/조직 정보', zh: '组织信息', vi: 'Tổ chức' },
    description: { en: 'Company info, contact, policies', ko: '회사 정보, 연락처, 정책', zh: '公司信息、联系方式、政策', vi: 'Thông tin công ty, liên hệ, chính sách' }
  }
];

// Value type options
export const VALUE_TYPE_OPTIONS = [
  { value: 'string', label: { en: 'String', ko: '문자열', zh: '字符串', vi: 'Chuỗi' } },
  { value: 'number', label: { en: 'Number', ko: '숫자', zh: '数字', vi: 'Số' } },
  { value: 'boolean', label: { en: 'Boolean', ko: '불리언', zh: '布尔值', vi: 'Boolean' } },
  { value: 'json', label: { en: 'JSON', ko: 'JSON', zh: 'JSON', vi: 'JSON' } }
];

// Get category info by id
export const getCategoryInfo = (categoryId: CategoryType): CategoryInfo | undefined => {
  return CATEGORIES.find(c => c.id === categoryId);
};

// Get localized value
export const getLocalizedText = (text: MultiLangText, locale: string): string => {
  const lang = locale as keyof MultiLangText;
  return text[lang] || text.en || '';
};

// Ready status options
export const READY_STATUS_OPTIONS = [
  { value: '', label: { en: 'All', ko: '전체', zh: '全部', vi: 'Tất cả' } },
  { value: 'true', label: { en: 'Ready', ko: '준비됨', zh: '已就绪', vi: 'Sẵn sàng' } },
  { value: 'false', label: { en: 'Not Ready', ko: '준비안됨', zh: '未就绪', vi: 'Chưa sẵn sàng' } }
];

// Category colors for visual distinction
export const CATEGORY_COLORS: Record<CategoryType, string> = {
  basic: '#2196f3',
  branding: '#9c27b0',
  localization: '#00bcd4',
  security: '#f44336',
  authentication: '#ff9800',
  notification: '#4caf50',
  file_upload: '#795548',
  operations: '#607d8b',
  feature_flags: '#e91e63',
  organization: '#3f51b5'
};

// Icon mapping for category icons
export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Info,
  Palette,
  Language,
  Security,
  VpnKey,
  Notifications,
  CloudUpload,
  Build,
  Flag,
  Business,
  Settings
};

/**
 * Convert CATEGORIES to CategoryItem format for CategoryNavPanel
 */
export const getCategoryItems = (locale: string): CategoryItem[] => {
  return CATEGORIES.map(cat => ({
    id: cat.id,
    label: getLocalizedText(cat.label, locale),
    icon: CATEGORY_ICONS[cat.icon] || Settings,
    color: CATEGORY_COLORS[cat.id as CategoryType],
    description: getLocalizedText(cat.description, locale)
  }));
};
