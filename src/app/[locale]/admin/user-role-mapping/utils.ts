import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { STATUS_OPTIONS } from './constants';
import { SearchCriteria, UserRoleMapping } from './types';

export const createFilterFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: string
): FilterFieldConfig[] => {
  return [
    {
      name: 'userId',
      label: t('fields.userId'),
      type: 'text',
      placeholder: locale === 'ko' ? '사용자 ID 입력...' : 'Enter user ID...'
    },
    {
      name: 'userName',
      label: t('fields.userName'),
      type: 'text',
      placeholder: locale === 'ko' ? '사용자 이름 입력...' : 'Enter user name...'
    },
    {
      name: 'userEmail',
      label: t('fields.userEmail'),
      type: 'text',
      placeholder: locale === 'ko' ? '사용자 이메일 입력...' : 'Enter user email...'
    },
    {
      name: 'userDepartment',
      label: t('fields.department'),
      type: 'text',
      placeholder: locale === 'ko' ? '부서 입력...' : 'Enter department...'
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

// Consolidated filter function for better performance
export const applyMappingFilters = (
  mappings: UserRoleMapping[],
  quickSearch: string,
  searchCriteria: SearchCriteria
): UserRoleMapping[] => {
  return mappings.filter((mapping) => {
    // Quick search - searches across all user fields
    if (quickSearch) {
      const search = quickSearch.toLowerCase();
      const searchableFields = [
        mapping.userName,
        mapping.userEmail,
        mapping.userDepartment,
        mapping.userId
      ];
      
      const matchesQuickSearch = searchableFields.some(
        field => field?.toLowerCase().includes(search)
      );
      
      if (!matchesQuickSearch) return false;
    }

    // Advanced search filters
    const criteriaFields = [
      { value: searchCriteria.userId, field: mapping.userId },
      { value: searchCriteria.userName, field: mapping.userName },
      { value: searchCriteria.userEmail, field: mapping.userEmail },
      { value: searchCriteria.userDepartment, field: mapping.userDepartment }
    ];

    for (const check of criteriaFields) {
      if (check.value && !check.field?.toLowerCase().includes(check.value.toLowerCase())) {
        return false;
      }
    }

    // Status filter
    if (searchCriteria.status === 'active' && !mapping.isActive) return false;
    if (searchCriteria.status === 'inactive' && mapping.isActive) return false;

    return true;
  });
};
