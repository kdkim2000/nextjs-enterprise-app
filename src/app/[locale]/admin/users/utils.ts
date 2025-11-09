import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { DEPARTMENTS } from './constants';
import { SearchCriteria } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFields = (t: any): FilterFieldConfig[] => [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Search by username...'
  },
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Search by name...'
  },
  {
    name: 'email',
    label: t('auth.email'),
    type: 'text',
    placeholder: 'Search by email...'
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: '', label: 'All Roles' },
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'user', label: 'User' }
    ]
  },
  {
    name: 'department',
    label: 'Department',
    type: 'multi-select',
    options: DEPARTMENTS.map(dept => ({ value: dept, label: dept })),
    allLabel: 'All Departments'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
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
