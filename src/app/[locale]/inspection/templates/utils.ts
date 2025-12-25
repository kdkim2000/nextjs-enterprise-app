import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createFilterFields = (t: any, locale: string): FilterFieldConfig[] => [
  {
    name: 'code',
    label: getLocalizedValue({ en: 'Code', ko: '코드', zh: '编码', vi: 'Mã' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by code...', ko: '코드로 검색...', zh: '按编码搜索...', vi: 'Tìm theo mã...' }, locale),
  },
  {
    name: 'name',
    label: getLocalizedValue({ en: 'Template Name', ko: '템플릿명', zh: '模板名称', vi: 'Tên mẫu' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by name...', ko: '이름으로 검색...', zh: '按名称搜索...', vi: 'Tìm theo tên...' }, locale),
  },
  {
    name: 'category',
    label: getLocalizedValue({ en: 'Category', ko: '카테고리', zh: '类别', vi: 'Danh mục' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by category...', ko: '카테고리로 검색...', zh: '按类别搜索...', vi: 'Tìm theo danh mục...' }, locale),
  },
  {
    name: 'status',
    label: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Status', ko: '전체 상태', zh: '所有状态', vi: 'Tất cả trạng thái' }, locale) },
      { value: 'draft', label: getLocalizedValue({ en: 'Draft', ko: '초안', zh: '草稿', vi: 'Bản nháp' }, locale) },
      { value: 'active', label: getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Hoạt động' }, locale) },
      { value: 'inactive', label: getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale) },
      { value: 'archived', label: getLocalizedValue({ en: 'Archived', ko: '보관', zh: '已归档', vi: 'Đã lưu trữ' }, locale) },
    ],
  },
];

export const calculateActiveFilterCount = (searchCriteria: SearchCriteria): number => {
  return Object.entries(searchCriteria).filter(([_key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '';
  }).length;
};
