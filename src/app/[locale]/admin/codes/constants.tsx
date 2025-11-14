'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { Code } from './types';

export const STATUS_OPTIONS = [
  { value: 'active', labelEn: 'Active', labelKo: '활성' },
  { value: 'inactive', labelEn: 'Inactive', labelKo: '비활성' }
];

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  handleEdit: (id: string | number) => void
): GridColDef[] => {
  const locale = t('common.appName') === '엔터프라이즈 앱' ? 'ko' : 'en';

  return [
    {
      field: 'id',
      headerName: 'ID',
      width: 70
    },
    {
      field: 'codeType',
      headerName: t('fields.codeType'),
      width: 150,
      sortable: true
    },
    {
      field: 'code',
      headerName: t('fields.code'),
      width: 150,
      sortable: true
    },
    {
      field: 'name',
      headerName: t('fields.name'),
      width: 200,
      sortable: true,
      valueGetter: (_value, row: Code) => {
        return locale === 'ko' ? row.name?.ko : row.name?.en;
      }
    },
    {
      field: 'description',
      headerName: t('fields.description'),
      width: 250,
      sortable: false,
      valueGetter: (_value, row: Code) => {
        return locale === 'ko' ? row.description?.ko : row.description?.en;
      }
    },
    {
      field: 'order',
      headerName: t('fields.order'),
      width: 80,
      sortable: true,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'status',
      headerName: t('fields.status'),
      width: 100,
      sortable: true,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive'],
      renderCell: (params) => {
        const status = params.value as string;
        const color = status === 'active' ? 'success' : 'default';
        const label = STATUS_OPTIONS.find(opt => opt.value === status);
        return (
          <Chip
            label={locale === 'ko' ? label?.labelKo : label?.labelEn}
            color={color}
            size="small"
          />
        );
      }
    },
    {
      field: 'parentCode',
      headerName: t('fields.parentCode'),
      width: 130,
      sortable: true
    },
    {
      field: 'actions',
      headerName: t('fields.actions'),
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          showMore={false}
        />
      )
    }
  ];
};
