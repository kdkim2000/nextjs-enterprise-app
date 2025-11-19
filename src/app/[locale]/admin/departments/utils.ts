import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { STATUS_OPTIONS } from './constants';
import { SearchCriteria, Department } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  allDepartments: Department[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allUsers: any[],
  currentLocale: string
): FilterFieldConfig[] => [
  {
    name: 'code',
    label: t('code'),
    type: 'text',
    placeholder: t('enterCode') || 'Enter code...'
  },
  {
    name: 'name',
    label: t('name'),
    type: 'text',
    placeholder: t('enterName') || 'Enter name...'
  },
  {
    name: 'parentId',
    label: t('parentDepartment'),
    type: 'select',
    options: [
      { value: '', label: t('all') || 'All' },
      ...allDepartments
        .filter(d => d.level === 0)
        .map(d => ({
          value: d.id,
          label: currentLocale === 'ko' ? d.name?.ko : d.name?.en
        }))
    ]
  },
  {
    name: 'managerId',
    label: t('manager'),
    type: 'select',
    options: [
      { value: '', label: t('all') || 'All' },
      ...allUsers.map(u => ({
        value: u.id,
        label: u.name
      }))
    ]
  },
  {
    name: 'status',
    label: t('status'),
    type: 'select',
    options: [
      { value: '', label: t('all') || 'All' },
      ...STATUS_OPTIONS.map(opt => ({
        value: opt.value,
        label: currentLocale === 'ko' ? opt.labelKo : opt.labelEn
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
