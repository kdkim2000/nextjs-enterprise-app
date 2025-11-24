import { PostSearchCriteria } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFields = (
  t: any,
  currentLocale: string,
  boardTypes: Array<{ id: string; code: string; name_en: string; name_ko: string }>
) => [
  {
    name: 'board_type_id',
    label: 'Board Type',
    type: 'select' as const,
    options: boardTypes.map((bt) => ({
      value: bt.id,
      label: currentLocale === 'ko' ? bt.name_ko : bt.name_en
    }))
  },
  {
    name: 'title',
    label: t('common.title') || 'Title',
    type: 'text' as const,
    placeholder: 'Search by title...'
  },
  {
    name: 'author_id',
    label: 'Author ID',
    type: 'text' as const,
    placeholder: 'Enter author ID...'
  },
  {
    name: 'is_approved',
    label: 'Approval Status',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Approved' },
      { value: 'false', label: 'Pending' }
    ]
  },
  {
    name: 'is_pinned',
    label: 'Pinned',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]
  },
  {
    name: 'is_secret',
    label: 'Secret',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]
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
    name: 'tags',
    label: 'Tags',
    type: 'text' as const,
    placeholder: 'Enter tags (comma-separated)...'
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

export const calculateActiveFilterCount = (criteria: PostSearchCriteria): number => {
  return Object.entries(criteria).filter(
    ([key, value]) =>
      value !== undefined && value !== null && value !== '' && key !== 'page' && key !== 'page_size'
  ).length;
};

export const buildQueryParams = (
  quickSearch: string,
  searchCriteria: PostSearchCriteria,
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
