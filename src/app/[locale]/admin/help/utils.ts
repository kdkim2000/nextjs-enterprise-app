import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { LANGUAGES, STATUS_OPTIONS } from './constants';
import { SearchCriteria } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFields = (t: any): FilterFieldConfig[] => [
  {
    name: 'programId',
    label: 'Program ID',
    type: 'text',
    placeholder: 'Search by program ID...'
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Search by title...'
  },
  {
    name: 'language',
    label: 'Language',
    type: 'select',
    options: [
      { value: '', label: 'All Languages' },
      ...LANGUAGES
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All Status' },
      ...STATUS_OPTIONS
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
