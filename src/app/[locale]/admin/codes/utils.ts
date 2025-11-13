import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { STATUS_OPTIONS } from './constants';
import { SearchCriteria } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  currentLocale: string
): FilterFieldConfig[] => [
  {
    name: 'codeType',
    label: t('codeType'),
    type: 'text',
    placeholder: t('enterCodeType') || 'Enter code type...'
  },
  {
    name: 'code',
    label: t('code'),
    type: 'text',
    placeholder: t('enterCode') || 'Enter code...'
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
