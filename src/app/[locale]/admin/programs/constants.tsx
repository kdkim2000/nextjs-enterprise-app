'use client';

import { GridColDef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { PROGRAM_STATUS } from '@/types/program';

export const createColumns = (
  locale: string,
  handleEdit: (id: string | number) => void
): GridColDef[] => [
  { field: 'code', headerName: 'Program Code', width: 150 },
  {
    field: 'name',
    headerName: 'Program Name',
    width: 180,
    valueGetter: (_value, row) => locale === 'ko' ? row.nameKo : row.nameEn
  },
  { field: 'category', headerName: 'Category', width: 120 },
  { field: 'type', headerName: 'Type', width: 100 },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    type: 'singleSelect',
    valueOptions: PROGRAM_STATUS as unknown as string[]
  },
  { field: 'version', headerName: 'Version', width: 100 },
  { field: 'author', headerName: 'Author', width: 120 },
  {
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
  }
];
