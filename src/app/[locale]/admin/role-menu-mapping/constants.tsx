import { GridColDef } from '@mui/x-data-grid';
import { Chip, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { CheckCircle, Cancel, Edit } from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createColumns = (
  t: (key: string) => string,
  locale: string,
  onEdit?: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'roleName',
      headerName: getLocalizedValue({ en: 'Role Code', ko: '역할 코드', zh: '角色代码', vi: 'Mã vai trò' }, locale),
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
      headerName: getLocalizedValue({ en: 'Role Name', ko: '역할명', zh: '角色名称', vi: 'Tên vai trò' }, locale),
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'canView',
      headerName: getLocalizedValue({ en: 'View', ko: '조회', zh: '查看', vi: 'Xem' }, locale),
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
      headerName: getLocalizedValue({ en: 'Create', ko: '생성', zh: '创建', vi: 'Tạo' }, locale),
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
      headerName: getLocalizedValue({ en: 'Update', ko: '수정', zh: '更新', vi: 'Cập nhật' }, locale),
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
      headerName: getLocalizedValue({ en: 'Delete', ko: '삭제', zh: '删除', vi: 'Xóa' }, locale),
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
      headerName: getLocalizedValue({ en: 'Created', ko: '생성일', zh: '创建日期', vi: 'Ngày tạo' }, locale),
      width: 120,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString(locale) : '-'
    },
    {
      field: 'createdBy',
      headerName: getLocalizedValue({ en: 'Created By', ko: '생성자', zh: '创建者', vi: 'Người tạo' }, locale),
      width: 120
    }
  ];

  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale),
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title={getLocalizedValue({ en: 'Edit Permissions', ko: '권한 수정', zh: '编辑权限', vi: 'Sửa quyền' }, locale)}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) {
                onEdit(params.row.id);
              }
            }}
            sx={{
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.50'
              }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    });
  }

  return columns;
};
