'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { Department } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const STATUS_OPTIONS = [
  { value: 'active', labelEn: 'Active', labelKo: '활성' },
  { value: 'inactive', labelEn: 'Inactive', labelKo: '비활성' }
];

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: string,
  allDepartments: Department[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allUsers: any[],
  handleEdit: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 70
  },
  {
    field: 'code',
    headerName: t('code'),
    width: 120,
    sortable: true
  },
  {
    field: 'name',
    headerName: t('name'),
    width: 200,
    sortable: true,
    valueGetter: (_value, row) => {
      return getLocalizedValue(row.name, locale);
    }
  },
  {
    field: 'description',
    headerName: t('description'),
    width: 250,
    sortable: false,
    valueGetter: (_value, row) => {
      return getLocalizedValue(row.description, locale);
    }
  },
  {
    field: 'parentId',
    headerName: t('parentDepartment'),
    width: 180,
    sortable: true,
    valueGetter: (_value, row) => {
      if (!row.parentId) return '-';
      const parent = allDepartments.find(d => d.id === row.parentId);
      return parent ? getLocalizedValue(parent.name, locale) : '-';
    }
  },
  {
    field: 'managerId',
    headerName: t('manager'),
    width: 150,
    sortable: true,
    valueGetter: (_value, row) => {
      if (!row.managerId) return '-';
      const manager = allUsers.find(u => u.id === row.managerId);
      return manager ? manager.name : '-';
    }
  },
  {
    field: 'level',
    headerName: t('level'),
    width: 80,
    sortable: true,
    align: 'center',
    headerAlign: 'center'
  },
  {
    field: 'status',
    headerName: t('status'),
    width: 100,
    sortable: true,
    type: 'singleSelect',
    valueOptions: ['active', 'inactive'],
    renderCell: (params) => {
      const status = params.value as string;
      const color = status === 'active' ? 'success' : 'default';
      const label = STATUS_OPTIONS.find(opt => opt.value === status);
      const labelText = label ? getLocalizedValue({ en: label.labelEn, ko: label.labelKo, zh: label.labelEn, vi: label.labelEn }, locale) : status;
      return (
        <Chip
          label={labelText}
          color={color}
          size="small"
        />
      );
    }
  }
];

  // Add actions column only if user has update permission
  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: t('actions'),
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          showMore={false}
        />
      )
    });
  }

  return columns;
};
