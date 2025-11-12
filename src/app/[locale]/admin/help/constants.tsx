'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { HelpContent } from './types';

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' }
];

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' }
];

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  handleEdit: (id: string | number) => void
): GridColDef[] => [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'programId', headerName: 'Program ID', width: 180 },
  { field: 'title', headerName: 'Title', width: 250, flex: 1 },
  {
    field: 'language',
    headerName: 'Language',
    width: 100,
    renderCell: (params) => {
      const lang = LANGUAGES.find(l => l.value === params.value);
      return <Chip label={lang?.label || params.value} size="small" />;
    }
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color={params.value === 'published' ? 'success' : 'default'}
      />
    )
  },
  {
    field: 'version',
    headerName: 'Version',
    width: 90,
    type: 'number'
  },
  {
    field: 'updatedAt',
    headerName: 'Last Updated',
    width: 180,
    valueFormatter: (value) => value ? new Date(value).toLocaleString() : ''
  },
  {
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
  }
];
