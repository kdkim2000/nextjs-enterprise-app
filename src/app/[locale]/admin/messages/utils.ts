import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { MESSAGE_CATEGORIES, MESSAGE_TYPES } from './types';

export interface SearchCriteria {
  code: string;
  category: string;
  type: string;
  messageText: string;
  status: string;
  [key: string]: string | string[];
}

export const createFilterFields = (locale: string): FilterFieldConfig[] => [
  {
    name: 'code',
    label: locale === 'ko' ? '코드' : 'Code',
    type: 'text',
    placeholder: locale === 'ko' ? '코드로 검색...' : 'Search by code...'
  },
  {
    name: 'category',
    label: locale === 'ko' ? '카테고리' : 'Category',
    type: 'select',
    options: [
      { value: '', label: locale === 'ko' ? '전체 카테고리' : 'All Categories' },
      ...MESSAGE_CATEGORIES.map(cat => ({
        value: cat.value,
        label: locale === 'ko' ? cat.label.ko : cat.label.en
      }))
    ]
  },
  {
    name: 'type',
    label: locale === 'ko' ? '타입' : 'Type',
    type: 'select',
    options: [
      { value: '', label: locale === 'ko' ? '전체 타입' : 'All Types' },
      ...MESSAGE_TYPES.map(type => ({
        value: type.value,
        label: locale === 'ko' ? type.label.ko : type.label.en
      }))
    ]
  },
  {
    name: 'messageText',
    label: locale === 'ko' ? '메시지' : 'Message',
    type: 'text',
    placeholder: locale === 'ko' ? '메시지 내용으로 검색...' : 'Search by message text...'
  },
  {
    name: 'status',
    label: locale === 'ko' ? '상태' : 'Status',
    type: 'select',
    options: [
      { value: '', label: locale === 'ko' ? '전체 상태' : 'All Status' },
      { value: 'active', label: locale === 'ko' ? '활성' : 'Active' },
      { value: 'inactive', label: locale === 'ko' ? '비활성' : 'Inactive' }
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
