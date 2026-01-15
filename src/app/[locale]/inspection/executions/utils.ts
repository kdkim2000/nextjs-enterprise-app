import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria, ChecksheetTemplate } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createFilterFields = (t: any, locale: string, templates: ChecksheetTemplate[] = []): FilterFieldConfig[] => [
  {
    name: 'inspection_code',
    label: getLocalizedValue({ en: 'Inspection Code', ko: '검사코드', zh: '检查代码', vi: 'Mã kiểm tra' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by code...', ko: '코드로 검색...', zh: '按代码搜索...', vi: 'Tìm theo mã...' }, locale),
  },
  {
    name: 'template_id',
    label: getLocalizedValue({ en: 'Template', ko: '템플릿', zh: '模板', vi: 'Mẫu' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Templates', ko: '전체 템플릿', zh: '所有模板', vi: 'Tất cả mẫu' }, locale) },
      ...templates.map((t) => ({ value: t.id, label: `${t.code} - ${t.name}` })),
    ],
  },
  {
    name: 'status',
    label: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Status', ko: '전체 상태', zh: '所有状态', vi: 'Tất cả trạng thái' }, locale) },
      { value: 'draft', label: getLocalizedValue({ en: 'Draft', ko: '초안', zh: '草稿', vi: 'Bản nháp' }, locale) },
      { value: 'in_progress', label: getLocalizedValue({ en: 'In Progress', ko: '진행중', zh: '进行中', vi: 'Đang tiến hành' }, locale) },
      { value: 'completed', label: getLocalizedValue({ en: 'Completed', ko: '완료', zh: '已完成', vi: 'Đã hoàn thành' }, locale) },
      { value: 'cancelled', label: getLocalizedValue({ en: 'Cancelled', ko: '취소', zh: '已取消', vi: 'Đã hủy' }, locale) },
    ],
  },
  {
    name: 'location',
    label: getLocalizedValue({ en: 'Location', ko: '위치', zh: '位置', vi: 'Vị trí' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by location...', ko: '위치로 검색...', zh: '按位置搜索...', vi: 'Tìm theo vị trí...' }, locale),
  },
  {
    name: 'date_from',
    label: getLocalizedValue({ en: 'Date From', ko: '시작일', zh: '开始日期', vi: 'Từ ngày' }, locale),
    type: 'datetime-local',
  },
  {
    name: 'date_to',
    label: getLocalizedValue({ en: 'Date To', ko: '종료일', zh: '结束日期', vi: 'Đến ngày' }, locale),
    type: 'datetime-local',
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
