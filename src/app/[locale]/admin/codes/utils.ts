import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { STATUS_OPTIONS } from './constants';
import { SearchCriteria } from './types';

export const createFilterFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
): FilterFieldConfig[] => {
  const locale = t('common.appName') === '엔터프라이즈 앱' ? 'ko' : 'en';

  return [
    {
      name: 'codeType',
      label: t('fields.codeType'),
      type: 'text',
      placeholder: t('placeholders.enterCodeType')
    },
    {
      name: 'code',
      label: t('fields.code'),
      type: 'text',
      placeholder: t('placeholders.enterCode')
    },
    {
      name: 'status',
      label: t('fields.status'),
      type: 'select',
      options: [
        { value: '', label: t('common.all') },
        ...STATUS_OPTIONS.map(opt => ({
          value: opt.value,
          label: locale === 'ko' ? opt.labelKo : opt.labelEn
        }))
      ]
    }
  ];
};

export const calculateActiveFilterCount = (searchCriteria: SearchCriteria): number => {
  return Object.entries(searchCriteria).filter(([_key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '';
  }).length;
};
