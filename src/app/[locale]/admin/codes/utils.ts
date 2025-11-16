import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { CodeOption } from '@/hooks/useCodeOptions';

// Re-export common multi-language utilities for convenience
export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  createEmptyMultiLangField,
  multiLangToFormData,
  formDataToMultiLang,
  getLocalizedValue,
  createEmptyMultiLangFormFields,
  multiLangFieldsToFormData,
  formDataToMultiLangFields,
  validateMultiLangField,
  hasAnyValue,
  searchMultiLangField,
  type SupportedLanguage,
  type MultiLangField
} from '@/lib/i18n/multiLang';

export const createFilterFields = (
  t: any,
  locale: string,
  statusOptions: CodeOption[] = []
): FilterFieldConfig[] => {
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
        ...statusOptions.map(opt => ({
          value: opt.value,
          label: opt.label
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
