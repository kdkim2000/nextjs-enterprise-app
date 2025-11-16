import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createFilterFields = (locale: string): FilterFieldConfig[] => [
  {
    name: 'name',
    label: getLocalizedValue({ en: 'Role Name', ko: '역할 이름', zh: '角色名称', vi: 'Tên vai trò' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by role name...', ko: '역할 이름으로 검색...', zh: '按角色名称搜索...', vi: 'Tìm theo tên vai trò...' }, locale)
  },
  {
    name: 'displayName',
    label: getLocalizedValue({ en: 'Display Name', ko: '표시명', zh: '显示名称', vi: 'Tên hiển thị' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by display name...', ko: '표시명으로 검색...', zh: '按显示名称搜索...', vi: 'Tìm theo tên hiển thị...' }, locale)
  },
  {
    name: 'roleType',
    label: getLocalizedValue({ en: 'Role Type', ko: '역할 타입', zh: '角色类型', vi: 'Loại vai trò' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Types', ko: '전체 타입', zh: '所有类型', vi: 'Tất cả loại' }, locale) },
      { value: 'general', label: getLocalizedValue({ en: 'General', ko: '일반', zh: '一般', vi: 'Chung' }, locale) },
      { value: 'management', label: getLocalizedValue({ en: 'Management', ko: '관리', zh: '管理', vi: 'Quản lý' }, locale) }
    ]
  },
  {
    name: 'isActive',
    label: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Status', ko: '전체 상태', zh: '所有状态', vi: 'Tất cả trạng thái' }, locale) },
      { value: 'true', label: getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale) },
      { value: 'false', label: getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale) }
    ]
  },
  {
    name: 'isSystem',
    label: getLocalizedValue({ en: 'System Role', ko: '시스템 역할', zh: '系统角色', vi: 'Vai trò hệ thống' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All', ko: '전체', zh: '全部', vi: 'Tất cả' }, locale) },
      { value: 'true', label: getLocalizedValue({ en: 'System', ko: '시스템', zh: '系统', vi: 'Hệ thống' }, locale) },
      { value: 'false', label: getLocalizedValue({ en: 'Custom', ko: '커스텀', zh: '自定义', vi: 'Tùy chỉnh' }, locale) }
    ]
  },
  {
    name: 'manager',
    label: getLocalizedValue({ en: 'Manager', ko: '담당자', zh: '管理者', vi: 'Người quản lý' }, locale),
    type: 'userSelector',
    placeholder: getLocalizedValue({ en: 'Filter by manager...', ko: '담당자로 필터...', zh: '按管理者筛选...', vi: 'Lọc theo người quản lý...' }, locale)
  },
  {
    name: 'representative',
    label: getLocalizedValue({ en: 'Representative', ko: '대표자', zh: '代表', vi: 'Đại diện' }, locale),
    type: 'userSelector',
    placeholder: getLocalizedValue({ en: 'Filter by representative...', ko: '대표자로 필터...', zh: '按代表筛选...', vi: 'Lọc theo đại diện...' }, locale)
  }
];

export const calculateActiveFilterCount = (searchCriteria: SearchCriteria): number => {
  return Object.entries(searchCriteria).filter(([_key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '';
  }).length;
};
