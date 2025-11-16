import { RoleProgramMapping, SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createFilterFields = (locale: string) => {
  return [
    {
      name: 'roleName',
      label: getLocalizedValue({ en: 'Role Code', ko: '역할 코드', zh: '角色代码', vi: 'Mã vai trò' }, locale),
      type: 'text' as const,
      placeholder: getLocalizedValue({ en: 'Search by role code', ko: '역할 코드로 검색', zh: '按角色代码搜索', vi: 'Tìm theo mã vai trò' }, locale)
    },
    {
      name: 'roleDisplayName',
      label: getLocalizedValue({ en: 'Role Name', ko: '역할명', zh: '角色名称', vi: 'Tên vai trò' }, locale),
      type: 'text' as const,
      placeholder: getLocalizedValue({ en: 'Search by role name', ko: '역할명으로 검색', zh: '按角色名称搜索', vi: 'Tìm theo tên vai trò' }, locale)
    },
    {
      name: 'permissions',
      label: getLocalizedValue({ en: 'Permissions', ko: '권한', zh: '权限', vi: 'Quyền' }, locale),
      type: 'select' as const,
      options: [
        { value: '', label: getLocalizedValue({ en: 'All', ko: '전체', zh: '全部', vi: 'Tất cả' }, locale) },
        { value: 'view', label: getLocalizedValue({ en: 'View', ko: '조회', zh: '查看', vi: 'Xem' }, locale) },
        { value: 'create', label: getLocalizedValue({ en: 'Create', ko: '생성', zh: '创建', vi: 'Tạo' }, locale) },
        { value: 'update', label: getLocalizedValue({ en: 'Update', ko: '수정', zh: '更新', vi: 'Cập nhật' }, locale) },
        { value: 'delete', label: getLocalizedValue({ en: 'Delete', ko: '삭제', zh: '删除', vi: 'Xóa' }, locale) },
        { value: 'full', label: getLocalizedValue({ en: 'Full Access', ko: '전체 권한', zh: '完全访问', vi: 'Toàn quyền' }, locale) }
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
