'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Role } from '@/types/role';

export const createColumns = (
  handleEdit: (id: string | number) => void
): GridColDef[] => [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Name', width: 130 },
  { field: 'displayName', headerName: 'Display Name', width: 160 },
  { field: 'description', headerName: 'Description', width: 180, flex: 1 },
  {
    field: 'roleType',
    headerName: 'Type',
    width: 110,
    renderCell: (params) => (
      <Chip
        label={params.value === 'management' ? 'Management' : 'General'}
        size="small"
        color={params.value === 'management' ? 'warning' : 'info'}
        variant="outlined"
      />
    )
  },
  {
    field: 'manager',
    headerName: 'Manager',
    width: 150,
    renderCell: (params) => params.value || '-'
  },
  {
    field: 'representative',
    headerName: 'Representative',
    width: 150,
    renderCell: (params) => params.value || '-'
  },
  {
    field: 'isSystem',
    headerName: 'System',
    width: 90,
    renderCell: (params) =>
      params.value ? <Chip label="System" size="small" color="secondary" /> : null
  },
  {
    field: 'isActive',
    headerName: 'Status',
    width: 90,
    renderCell: (params) => (
      <Chip
        label={params.value ? 'Active' : 'Inactive'}
        size="small"
        color={params.value ? 'success' : 'default'}
      />
    )
  },
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
