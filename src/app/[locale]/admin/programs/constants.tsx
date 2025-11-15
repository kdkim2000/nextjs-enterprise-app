'use client';

import { GridColDef } from '@mui/x-data-grid';
import ActionsCell from '@/components/common/ActionsCell';
import { Program } from './types';

export const PROGRAM_CATEGORIES = ['admin', 'user', 'report', 'system', 'analytics', 'configuration'];
export const PROGRAM_TYPES = ['page', 'function', 'api', 'report'] as const;
export const PROGRAM_STATUS = ['active', 'inactive', 'development'] as const;

export const createColumns = (
  locale: string,
  handleEdit: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'code', headerName: 'Program Code', width: 150 },
    {
      field: 'name',
      headerName: 'Program Name',
      width: 200,
      valueGetter: (_value, row) => locale === 'ko' ? row.nameKo : row.nameEn
    },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'type', headerName: 'Type', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      type: 'singleSelect',
      valueOptions: PROGRAM_STATUS as unknown as string[]
    },
    { field: 'version', headerName: 'Version', width: 100 },
    { field: 'author', headerName: 'Author', width: 130 }
  ];

  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
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
