import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria } from './types';

export const createFilterFields = (): FilterFieldConfig[] => [
  {
    name: 'name',
    label: 'Role Name',
    type: 'text',
    placeholder: 'Search by role name...'
  },
  {
    name: 'displayName',
    label: 'Display Name',
    type: 'text',
    placeholder: 'Search by display name...'
  },
  {
    name: 'roleType',
    label: 'Role Type',
    type: 'select',
    options: [
      { value: '', label: 'All Types' },
      { value: 'general', label: 'General' },
      { value: 'management', label: 'Management' }
    ]
  },
  {
    name: 'isActive',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All Status' },
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ]
  },
  {
    name: 'isSystem',
    label: 'System Role',
    type: 'select',
    options: [
      { value: '', label: 'All' },
      { value: 'true', label: 'System' },
      { value: 'false', label: 'Custom' }
    ]
  },
  {
    name: 'manager',
    label: 'Manager',
    type: 'userSelector',
    placeholder: 'Filter by manager...'
  },
  {
    name: 'representative',
    label: 'Representative',
    type: 'userSelector',
    placeholder: 'Filter by representative...'
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
