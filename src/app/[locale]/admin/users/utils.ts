import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { DEPARTMENTS } from './constants';
import { SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFields = (t: any, locale: string): FilterFieldConfig[] => [
  {
    name: 'username',
    label: getLocalizedValue({ en: 'Username', ko: '사용자명', zh: '用户名', vi: 'Tên đăng nhập' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by username...', ko: '사용자명으로 검색...', zh: '按用户名搜索...', vi: 'Tìm theo tên đăng nhập...' }, locale)
  },
  {
    name: 'name',
    label: getLocalizedValue({ en: 'Name', ko: '이름', zh: '姓名', vi: 'Tên' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by name...', ko: '이름으로 검색...', zh: '按姓名搜索...', vi: 'Tìm theo tên...' }, locale)
  },
  {
    name: 'email',
    label: t('auth.email'),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by email...', ko: '이메일로 검색...', zh: '按邮箱搜索...', vi: 'Tìm theo email...' }, locale)
  },
  {
    name: 'role',
    label: getLocalizedValue({ en: 'Role', ko: '역할', zh: '角色', vi: 'Vai trò' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Roles', ko: '전체 역할', zh: '所有角色', vi: 'Tất cả vai trò' }, locale) },
      { value: 'admin', label: getLocalizedValue({ en: 'Admin', ko: '관리자', zh: '管理员', vi: 'Quản trị viên' }, locale) },
      { value: 'manager', label: getLocalizedValue({ en: 'Manager', ko: '매니저', zh: '经理', vi: 'Người quản lý' }, locale) },
      { value: 'user', label: getLocalizedValue({ en: 'User', ko: '사용자', zh: '用户', vi: 'Người dùng' }, locale) }
    ]
  },
  {
    name: 'department',
    label: getLocalizedValue({ en: 'Department', ko: '부서', zh: '部门', vi: 'Phòng ban' }, locale),
    type: 'multi-select',
    options: DEPARTMENTS.map(dept => ({ value: dept, label: dept })),
    allLabel: getLocalizedValue({ en: 'All Departments', ko: '전체 부서', zh: '所有部门', vi: 'Tất cả phòng ban' }, locale)
  },
  {
    name: 'status',
    label: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Status', ko: '전체 상태', zh: '所有状态', vi: 'Tất cả trạng thái' }, locale) },
      { value: 'active', label: getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale) },
      { value: 'inactive', label: getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale) }
    ]
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
