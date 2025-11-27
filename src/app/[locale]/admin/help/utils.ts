import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { LANGUAGES, STATUS_OPTIONS } from './constants';
import { SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

 
export const createFilterFields = (t: any, locale: string): FilterFieldConfig[] => [
  {
    name: 'programId',
    label: getLocalizedValue({ en: 'Program ID', ko: '프로그램 ID', zh: '程序 ID', vi: 'ID Chương trình' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by program ID...', ko: '프로그램 ID로 검색...', zh: '按程序 ID 搜索...', vi: 'Tìm theo ID chương trình...' }, locale)
  },
  {
    name: 'title',
    label: getLocalizedValue({ en: 'Title', ko: '제목', zh: '标题', vi: 'Tiêu đề' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by title...', ko: '제목으로 검색...', zh: '按标题搜索...', vi: 'Tìm theo tiêu đề...' }, locale)
  },
  {
    name: 'language',
    label: getLocalizedValue({ en: 'Language', ko: '언어', zh: '语言', vi: 'Ngôn ngữ' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Languages', ko: '전체 언어', zh: '所有语言', vi: 'Tất cả ngôn ngữ' }, locale) },
      ...LANGUAGES
    ]
  },
  {
    name: 'status',
    label: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Status', ko: '전체 상태', zh: '所有状态', vi: 'Tất cả trạng thái' }, locale) },
      ...STATUS_OPTIONS.map(opt => ({
        value: opt.value,
        label: getLocalizedValue({ en: opt.labelEn, ko: opt.labelKo, zh: opt.labelZh, vi: opt.labelVi }, locale)
      }))
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
