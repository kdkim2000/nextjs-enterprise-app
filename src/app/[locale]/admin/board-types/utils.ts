import { BoardTypeSearchCriteria } from './types';
import { BOARD_TYPE_OPTIONS, CATEGORY_OPTIONS } from './constants';

 
export const createFilterFields = (t: any, currentLocale: string) => [
  {
    name: 'code',
    label: t('common.code'),
    type: 'text' as const,
    placeholder: 'Enter code...'
  },
  {
    name: 'name',
    label: t('common.name'),
    type: 'text' as const,
    placeholder: 'Enter name...'
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select' as const,
    options: BOARD_TYPE_OPTIONS
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select' as const,
    options: CATEGORY_OPTIONS
  },
  {
    name: 'status',
    label: t('common.status'),
    type: 'select' as const,
    options: [
      { value: 'active', label: t('common.active') },
      { value: 'inactive', label: t('common.inactive') }
    ]
  },
  {
    name: 'created_at_from',
    label: 'Created From',
    type: 'datetime-local' as const
  },
  {
    name: 'created_at_to',
    label: 'Created To',
    type: 'datetime-local' as const
  }
];

export const calculateActiveFilterCount = (criteria: BoardTypeSearchCriteria): number => {
  return Object.entries(criteria).filter(
    ([key, value]) =>
      value !== undefined && value !== null && value !== '' && key !== 'page' && key !== 'page_size'
  ).length;
};

export const buildQueryParams = (
  quickSearch: string,
  searchCriteria: BoardTypeSearchCriteria,
  paginationModel: { page: number; pageSize: number }
): string => {
  const params = new URLSearchParams();

  if (quickSearch) {
    params.append('search', quickSearch);
  }

  Object.entries(searchCriteria).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  params.append('page', String(paginationModel.page + 1));
  params.append('page_size', String(paginationModel.pageSize));

  return params.toString();
};
