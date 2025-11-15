import { RoleProgramMapping, SearchCriteria } from './types';

export const createFilterFields = (locale: string) => {
  const isKorean = locale === 'ko';

  return [
    {
      name: 'roleName',
      label: isKorean ? '역할 코드' : 'Role Code',
      type: 'text' as const,
      placeholder: isKorean ? '역할 코드로 검색' : 'Search by role code'
    },
    {
      name: 'roleDisplayName',
      label: isKorean ? '역할명' : 'Role Name',
      type: 'text' as const,
      placeholder: isKorean ? '역할명으로 검색' : 'Search by role name'
    },
    {
      name: 'permissions',
      label: isKorean ? '권한' : 'Permissions',
      type: 'select' as const,
      options: [
        { value: '', label: isKorean ? '전체' : 'All' },
        { value: 'view', label: isKorean ? '조회' : 'View' },
        { value: 'create', label: isKorean ? '생성' : 'Create' },
        { value: 'update', label: isKorean ? '수정' : 'Update' },
        { value: 'delete', label: isKorean ? '삭제' : 'Delete' },
        { value: 'full', label: isKorean ? '전체 권한' : 'Full Access' }
      ]
    }
  ];
};

export const calculateActiveFilterCount = (searchCriteria: SearchCriteria): number => {
  let count = 0;
  if (searchCriteria.roleName) count++;
  if (searchCriteria.roleDisplayName) count++;
  if (searchCriteria.permissions) count++;
  return count;
};

export const applyMappingFilters = (
  mappings: RoleProgramMapping[],
  quickSearch: string,
  searchCriteria: SearchCriteria
): RoleProgramMapping[] => {
  return mappings.filter((mapping) => {
    // Quick search
    if (quickSearch) {
      const search = quickSearch.toLowerCase();

      const searchableFields = [
        mapping.roleName,
        mapping.roleDisplayName
      ];

      const matchesQuickSearch = searchableFields.some(
        field => field?.toLowerCase().includes(search)
      );
      if (!matchesQuickSearch) return false;
    }

    // Advanced filters
    if (searchCriteria.roleName && !mapping.roleName?.toLowerCase().includes(searchCriteria.roleName.toLowerCase())) {
      return false;
    }

    if (searchCriteria.roleDisplayName && !mapping.roleDisplayName?.toLowerCase().includes(searchCriteria.roleDisplayName.toLowerCase())) {
      return false;
    }

    if (searchCriteria.permissions) {
      switch (searchCriteria.permissions) {
        case 'view':
          if (!mapping.canView) return false;
          break;
        case 'create':
          if (!mapping.canCreate) return false;
          break;
        case 'update':
          if (!mapping.canUpdate) return false;
          break;
        case 'delete':
          if (!mapping.canDelete) return false;
          break;
        case 'full':
          if (!(mapping.canView && mapping.canCreate && mapping.canUpdate && mapping.canDelete)) return false;
          break;
      }
    }

    return true;
  });
};
