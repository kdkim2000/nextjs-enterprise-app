'use client';

import { GridColDef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { MenuItem as MenuItemType } from '@/types/menu';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const AVAILABLE_ICONS = [
  'Dashboard', 'People', 'Assessment', 'Settings', 'List',
  'AdminPanelSettings', 'GridOn', 'TrendingUp', 'Widgets',
  'Description', 'Folder', 'Assignment', 'Build', 'Code',
  'Security', 'Help', 'Link', 'AccountTree', 'School', 'Palette'
];

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: string,
  allMenus: MenuItemType[],
  handleEdit: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: 'code', headerName: t('menuManagement.menuCode'), width: 130 },
    {
      field: 'name',
      headerName: t('menuManagement.menuName'),
      width: 180,
      valueGetter: (_value, row) => {
        return getLocalizedValue(row.name, locale);
      }
    },
    { field: 'path', headerName: t('menuManagement.path'), width: 220, flex: 1 },
    { field: 'icon', headerName: t('menuManagement.icon'), width: 100 },
    { field: 'order', headerName: t('menuManagement.order'), width: 70, type: 'number' },
    { field: 'level', headerName: t('menuManagement.level'), width: 70, type: 'number' },
    {
      field: 'parentId',
      headerName: t('menuManagement.parent'),
      width: 150,
      valueGetter: (_value, row) => {
        if (!row.parentId) return t('menuManagement.rootMenu');
        const parent = allMenus.find(m => m.id === row.parentId);
        return parent ? getLocalizedValue(parent.name, locale) : '-';
      }
    },
    { field: 'programId', headerName: t('menuManagement.programId'), width: 140 }
  ];

  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleEdit(params.row.id)}
          color="primary"
        >
          <Edit fontSize="small" />
        </IconButton>
      )
    });
  }

  return columns;
};
