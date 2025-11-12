import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { PROGRAM_CATEGORIES, PROGRAM_TYPES, PROGRAM_STATUS } from './constants';
import { SearchCriteria } from './types';

export const createFilterFields = (): FilterFieldConfig[] => [
  {
    name: 'code',
    label: 'Program Code',
    type: 'text',
    placeholder: 'Search by program code...'
  },
  {
    name: 'name',
    label: 'Program Name',
    type: 'text',
    placeholder: 'Search by program name...'
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: '', label: 'All Categories' },
      ...PROGRAM_CATEGORIES.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))
    ]
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { value: '', label: 'All Types' },
      ...PROGRAM_TYPES.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All Status' },
      ...PROGRAM_STATUS.map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))
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
