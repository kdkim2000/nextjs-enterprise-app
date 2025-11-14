'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { UserRoleMapping } from './types';

export const STATUS_OPTIONS = [
  { value: 'active', labelEn: 'Active', labelKo: '활성' },
  { value: 'inactive', labelEn: 'Inactive', labelKo: '비활성' }
];

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: string
): GridColDef[] => {
  return [
    {
      field: 'id',
      headerName: 'ID',
      width: 100
    },
    {
      field: 'userId',
      headerName: t('fields.userId'),
      width: 120,
      sortable: true
    },
    {
      field: 'userName',
      headerName: t('fields.userName'),
      width: 130,
      sortable: true
    },
    {
      field: 'userDepartment',
      headerName: t('fields.department'),
      width: 120,
      sortable: true
    },
    {
      field: 'userEmail',
      headerName: t('fields.userEmail'),
      width: 200,
      sortable: true
    },
    {
      field: 'assignedBy',
      headerName: t('fields.assignedBy'),
      width: 130,
      sortable: true
    },
    {
      field: 'assignedAt',
      headerName: t('fields.assignedAt'),
      width: 180,
      sortable: true,
      valueGetter: (_value, row: UserRoleMapping) => {
        return row.assignedAt ? new Date(row.assignedAt).toLocaleString(locale) : '';
      }
    },
    {
      field: 'expiresAt',
      headerName: t('fields.expiresAt'),
      width: 180,
      sortable: true,
      valueGetter: (_value, row: UserRoleMapping) => {
        return row.expiresAt ? new Date(row.expiresAt).toLocaleString(locale) : locale === 'ko' ? '무제한' : 'Unlimited';
      }
    },
    {
      field: 'isActive',
      headerName: t('fields.status'),
      width: 100,
      sortable: true,
      renderCell: (params) => {
        const isActive = params.value as boolean;
        const color = isActive ? 'success' : 'default';
        const label = isActive
          ? (locale === 'ko' ? '활성' : 'Active')
          : (locale === 'ko' ? '비활성' : 'Inactive');
        return (
          <Chip
            label={label}
            color={color}
            size="small"
          />
        );
      }
    }
  ];
};
