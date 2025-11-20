import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { DEPARTMENTS } from './constants';
import { SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFields = (t: any, locale: string): FilterFieldConfig[] => [
  {
    name: 'loginid',
    label: getLocalizedValue({ en: 'Login ID', ko: '로그인 ID', zh: '登录ID', vi: 'ID đăng nhập' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by login ID...', ko: '로그인 ID로 검색...', zh: '按登录ID搜索...', vi: 'Tìm theo ID đăng nhập...' }, locale)
  },
  {
    name: 'employee_number',
    label: getLocalizedValue({ en: 'Employee #', ko: '사번', zh: '员工号', vi: 'Mã NV' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by employee number...', ko: '사번으로 검색...', zh: '按员工号搜索...', vi: 'Tìm theo mã NV...' }, locale)
  },
  {
    name: 'name_ko',
    label: getLocalizedValue({ en: 'Name (Korean)', ko: '이름 (한글)', zh: '姓名 (韩)', vi: 'Tên (Hàn)' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by Korean name...', ko: '한글 이름으로 검색...', zh: '按韩文名搜索...', vi: 'Tìm theo tên Hàn...' }, locale)
  },
  {
    name: 'name_en',
    label: getLocalizedValue({ en: 'Name (English)', ko: '이름 (영문)', zh: '姓名 (英)', vi: 'Tên (Anh)' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by English name...', ko: '영문 이름으로 검색...', zh: '按英文名搜索...', vi: 'Tìm theo tên Anh...' }, locale)
  },
  {
    name: 'email',
    label: t('auth.email'),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by email...', ko: '이메일로 검색...', zh: '按邮箱搜索...', vi: 'Tìm theo email...' }, locale)
  },
  {
    name: 'phone_number',
    label: getLocalizedValue({ en: 'Phone', ko: '전화번호', zh: '电话', vi: 'Điện thoại' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by phone...', ko: '전화번호로 검색...', zh: '按电话搜索...', vi: 'Tìm theo điện thoại...' }, locale)
  },
  {
    name: 'mobile_number',
    label: getLocalizedValue({ en: 'Mobile', ko: '휴대전화', zh: '手机', vi: 'Di động' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by mobile...', ko: '휴대전화로 검색...', zh: '按手机搜索...', vi: 'Tìm theo di động...' }, locale)
  },
  {
    name: 'user_category',
    label: getLocalizedValue({ en: 'Category', ko: '사용자구분', zh: '类别', vi: 'Loại' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Categories', ko: '전체 구분', zh: '所有类别', vi: 'Tất cả loại' }, locale) },
      { value: 'regular', label: getLocalizedValue({ en: 'Regular', ko: '정규직', zh: '正式', vi: 'Chính thức' }, locale) },
      { value: 'contractor', label: getLocalizedValue({ en: 'Contractor', ko: '계약직', zh: '合同工', vi: 'Hợp đồng' }, locale) },
      { value: 'temporary', label: getLocalizedValue({ en: 'Temporary', ko: '임시직', zh: '临时工', vi: 'Tạm thời' }, locale) },
      { value: 'external', label: getLocalizedValue({ en: 'External', ko: '외부인', zh: '外部人员', vi: 'Bên ngoài' }, locale) },
      { value: 'admin', label: getLocalizedValue({ en: 'Admin', ko: '관리자', zh: '管理员', vi: 'Quản trị' }, locale) }
    ]
  },
  {
    name: 'position',
    label: getLocalizedValue({ en: 'Position', ko: '직급', zh: '职位', vi: 'Chức vụ' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by position...', ko: '직급으로 검색...', zh: '按职位搜索...', vi: 'Tìm theo chức vụ...' }, locale)
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
