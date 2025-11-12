import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria } from './types';
import { AVAILABLE_ICONS } from './constants';
import { MenuItem as MenuItemType } from '@/types/menu';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  allMenus: MenuItemType[],
  locale: string
): FilterFieldConfig[] => [
  {
    name: 'code',
    label: t('menuManagement.menuCode'),
    type: 'text',
    placeholder: 'Search by menu code...'
  },
  {
    name: 'name',
    label: t('menuManagement.menuName'),
    type: 'text',
    placeholder: 'Search by menu name...'
  },
  {
    name: 'path',
    label: t('menuManagement.path'),
    type: 'text',
    placeholder: 'Search by path...'
  },
  {
    name: 'icon',
    label: t('menuManagement.icon'),
    type: 'select',
    options: [
      { value: '', label: 'All Icons' },
      ...AVAILABLE_ICONS.map(icon => ({ value: icon, label: icon }))
    ]
  },
  {
    name: 'level',
    label: t('menuManagement.level'),
    type: 'select',
    options: [
      { value: '', label: 'All Levels' },
      { value: '0', label: 'Level 0' },
      { value: '1', label: 'Level 1' },
      { value: '2', label: 'Level 2' },
      { value: '3', label: 'Level 3' }
    ]
  },
  {
    name: 'parentId',
    label: t('menuManagement.parent'),
    type: 'select',
    options: [
      { value: '', label: 'All Parents' },
      { value: 'null', label: t('menuManagement.rootMenu') },
      ...allMenus.map(menu => ({
        value: menu.id,
        label: locale === 'ko' ? menu.name.ko : menu.name.en
      }))
    ]
  },
  {
    name: 'programId',
    label: t('menuManagement.programId'),
    type: 'text',
    placeholder: 'Search by program ID...'
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
