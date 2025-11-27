import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

 
export const createFilterFields = (t: any, locale: string): FilterFieldConfig[] => {
  // Category options with i18n
  const categoryOptions = [
    { value: '', label: getLocalizedValue({ en: 'All Categories', ko: '전체 카테고리', zh: '所有分类', vi: 'Tất cả danh mục' }, locale) },
    { value: 'admin', label: getLocalizedValue({ en: 'Admin', ko: '관리자', zh: '管理', vi: 'Quản trị' }, locale) },
    { value: 'user', label: getLocalizedValue({ en: 'User', ko: '사용자', zh: '用户', vi: 'Người dùng' }, locale) },
    { value: 'report', label: getLocalizedValue({ en: 'Report', ko: '리포트', zh: '报表', vi: 'Báo cáo' }, locale) },
    { value: 'system', label: getLocalizedValue({ en: 'System', ko: '시스템', zh: '系统', vi: 'Hệ thống' }, locale) },
    { value: 'analytics', label: getLocalizedValue({ en: 'Analytics', ko: '분석', zh: '分析', vi: 'Phân tích' }, locale) },
    { value: 'configuration', label: getLocalizedValue({ en: 'Configuration', ko: '설정', zh: '配置', vi: 'Cấu hình' }, locale) }
  ];

  // Type options with i18n
  const typeOptions = [
    { value: '', label: getLocalizedValue({ en: 'All Types', ko: '전체 유형', zh: '所有类型', vi: 'Tất cả loại' }, locale) },
    { value: 'page', label: getLocalizedValue({ en: 'Page', ko: '페이지', zh: '页面', vi: 'Trang' }, locale) },
    { value: 'function', label: getLocalizedValue({ en: 'Function', ko: '기능', zh: '功能', vi: 'Chức năng' }, locale) },
    { value: 'api', label: getLocalizedValue({ en: 'API', ko: 'API', zh: 'API', vi: 'API' }, locale) },
    { value: 'report', label: getLocalizedValue({ en: 'Report', ko: '리포트', zh: '报表', vi: 'Báo cáo' }, locale) }
  ];

  // Status options with i18n
  const statusOptions = [
    { value: '', label: getLocalizedValue({ en: 'All Status', ko: '전체 상태', zh: '所有状态', vi: 'Tất cả trạng thái' }, locale) },
    { value: 'active', label: getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Hoạt động' }, locale) },
    { value: 'inactive', label: getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale) },
    { value: 'development', label: getLocalizedValue({ en: 'Development', ko: '개발중', zh: '开发中', vi: 'Đang phát triển' }, locale) }
  ];

  return [
    {
      name: 'code',
      label: getLocalizedValue({ en: 'Program Code', ko: '프로그램 코드', zh: '程序代码', vi: 'Mã chương trình' }, locale),
      type: 'text',
      placeholder: getLocalizedValue({ en: 'Search by program code...', ko: '프로그램 코드로 검색...', zh: '按程序代码搜索...', vi: 'Tìm theo mã chương trình...' }, locale)
    },
    {
      name: 'name',
      label: getLocalizedValue({ en: 'Program Name', ko: '프로그램명', zh: '程序名称', vi: 'Tên chương trình' }, locale),
      type: 'text',
      placeholder: getLocalizedValue({ en: 'Search by program name...', ko: '프로그램명으로 검색...', zh: '按程序名称搜索...', vi: 'Tìm theo tên chương trình...' }, locale)
    },
    {
      name: 'category',
      label: getLocalizedValue({ en: 'Category', ko: '카테고리', zh: '分类', vi: 'Danh mục' }, locale),
      type: 'select',
      options: categoryOptions
    },
    {
      name: 'type',
      label: getLocalizedValue({ en: 'Type', ko: '유형', zh: '类型', vi: 'Loại' }, locale),
      type: 'select',
      options: typeOptions
    },
    {
      name: 'status',
      label: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      type: 'select',
      options: statusOptions
    }
  ];
};

export const calculateActiveFilterCount = (searchCriteria: SearchCriteria): number => {
  return Object.entries(searchCriteria).filter(([_key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '';
  }).length;
};
