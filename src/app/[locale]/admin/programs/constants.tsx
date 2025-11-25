'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { Program } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

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
      valueGetter: (_value, row) => getLocalizedValue(row.name, locale)
    },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'type', headerName: 'Type', width: 100 },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 100,
      type: 'singleSelect',
      valueOptions: PROGRAM_STATUS as unknown as string[],
      renderCell: (params) => {
        const status = params.value as string;
        const isActive = status === 'active';
        const isDevelopment = status === 'development';
        return (
          <Chip
            label={isActive
              ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale)
              : isDevelopment
                ? getLocalizedValue({ en: 'Dev', ko: '개발', zh: '开发', vi: 'Phát triển' }, locale)
                : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale)
            }
            size="small"
            color={isActive ? 'success' : isDevelopment ? 'warning' : 'default'}
          />
        );
      }
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
