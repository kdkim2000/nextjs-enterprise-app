import { GridColDef } from '@mui/x-data-grid';
import { Chip, Box, Typography } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

export const createColumns = (
  t: (key: string) => string,
  locale: string
): GridColDef[] => {
  return [
    {
      field: 'roleName',
      headerName: locale === 'ko' ? '역할 코드' : 'Role Code',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color="primary"
        />
      )
    },
    {
      field: 'roleDisplayName',
      headerName: locale === 'ko' ? '역할명' : 'Role Name',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'canView',
      headerName: locale === 'ko' ? '조회' : 'View',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? (
          <CheckCircle color="success" fontSize="small" />
        ) : (
          <Cancel color="disabled" fontSize="small" />
        )
    },
    {
      field: 'canCreate',
      headerName: locale === 'ko' ? '생성' : 'Create',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? (
          <CheckCircle color="success" fontSize="small" />
        ) : (
          <Cancel color="disabled" fontSize="small" />
        )
    },
    {
      field: 'canUpdate',
      headerName: locale === 'ko' ? '수정' : 'Update',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? (
          <CheckCircle color="success" fontSize="small" />
        ) : (
          <Cancel color="disabled" fontSize="small" />
        )
    },
    {
      field: 'canDelete',
      headerName: locale === 'ko' ? '삭제' : 'Delete',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? (
          <CheckCircle color="success" fontSize="small" />
        ) : (
          <Cancel color="disabled" fontSize="small" />
        )
    },
    {
      field: 'createdAt',
      headerName: locale === 'ko' ? '생성일' : 'Created',
      width: 120,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString(locale) : '-'
    },
    {
      field: 'createdBy',
      headerName: locale === 'ko' ? '생성자' : 'Created By',
      width: 120
    }
  ];
};
