'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { Role } from '@/types/role';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createColumns = (
  locale: string,
  handleEdit: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: getLocalizedValue({ en: 'ID', ko: 'ID', zh: 'ID', vi: 'ID' }, locale),
      width: 100
    },
    {
      field: 'name',
      headerName: getLocalizedValue({ en: 'Name', ko: '이름', zh: '名称', vi: 'Tên' }, locale),
      width: 130
    },
    {
      field: 'displayName',
      headerName: getLocalizedValue({ en: 'Display Name', ko: '표시명', zh: '显示名称', vi: 'Tên hiển thị' }, locale),
      width: 160
    },
    {
      field: 'description',
      headerName: getLocalizedValue({ en: 'Description', ko: '설명', zh: '描述', vi: 'Mô tả' }, locale),
      width: 180,
      flex: 1
    },
    {
      field: 'roleType',
      headerName: getLocalizedValue({ en: 'Type', ko: '타입', zh: '类型', vi: 'Loại' }, locale),
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value === 'management'
            ? getLocalizedValue({ en: 'Management', ko: '관리', zh: '管理', vi: 'Quản lý' }, locale)
            : getLocalizedValue({ en: 'General', ko: '일반', zh: '一般', vi: 'Chung' }, locale)
          }
          size="small"
          color={params.value === 'management' ? 'warning' : 'info'}
          variant="outlined"
        />
      )
    },
    {
      field: 'manager',
      headerName: getLocalizedValue({ en: 'Manager', ko: '담당자', zh: '管理者', vi: 'Người quản lý' }, locale),
      width: 150,
      valueGetter: (_value, row: Role) => row.managerName || '-'
    },
    {
      field: 'representative',
      headerName: getLocalizedValue({ en: 'Representative', ko: '대표자', zh: '代表', vi: 'Đại diện' }, locale),
      width: 150,
      valueGetter: (_value, row: Role) => row.representativeName || '-'
    },
    {
      field: 'isSystem',
      headerName: getLocalizedValue({ en: 'System', ko: '시스템', zh: '系统', vi: 'Hệ thống' }, locale),
      width: 90,
      renderCell: (params) =>
        params.value ? (
          <Chip
            label={getLocalizedValue({ en: 'System', ko: '시스템', zh: '系统', vi: 'Hệ thống' }, locale)}
            size="small"
            color="secondary"
          />
        ) : null
    },
    {
      field: 'isActive',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value
            ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale)
            : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale)
          }
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    }
  ];

  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale),
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <ActionsCell
            onEdit={() => handleEdit(params.row.id)}
            editTooltip={getLocalizedValue({ en: 'Edit Role', ko: '역할 수정', zh: '编辑角色', vi: 'Sửa vai trò' }, locale)}
            showMore={false}
          />
        );
      }
    });
  }

  return columns;
};
