'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Box, Avatar } from '@mui/material';
import { getAvatarUrl } from '@/lib/config';
import ActionsCell from '@/components/common/ActionsCell';
import { User } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const DEPARTMENTS = [
  'Admin', 'Design', 'Engineering', 'Finance', 'HR', 'IT',
  'Legal', 'Marketing', 'Operations', 'Product', 'Sales', 'Support'
];

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: string,
  handleEdit: (id: string | number) => void,
  handleResetPassword?: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: getLocalizedValue({ en: 'ID', ko: 'ID', zh: 'ID', vi: 'ID' }, locale),
      width: 70
    },
    {
      field: 'avatarUrl',
      headerName: getLocalizedValue({ en: 'Avatar', ko: '아바타', zh: '头像', vi: 'Ảnh đại diện' }, locale),
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const user = params.row as User;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}
          >
            <Avatar
              src={getAvatarUrl(user.avatarUrl)}
              alt={user.name}
              sx={{ width: 32, height: 32 }}
            >
              {!user.avatarUrl && user.name?.substring(0, 2).toUpperCase()}
            </Avatar>
          </Box>
        );
      }
    },
    { field: 'username', headerName: t('auth.username'), width: 130 },
    {
      field: 'name',
      headerName: getLocalizedValue({ en: 'Name', ko: '이름', zh: '姓名', vi: 'Tên' }, locale),
      width: 150
    },
    { field: 'email', headerName: t('auth.email'), width: 200 },
    {
      field: 'role',
      headerName: getLocalizedValue({ en: 'Role', ko: '역할', zh: '角色', vi: 'Vai trò' }, locale),
      width: 120,
      type: 'singleSelect',
      valueOptions: ['admin', 'manager', 'user']
    },
    {
      field: 'department',
      headerName: getLocalizedValue({ en: 'Department', ko: '부서', zh: '部门', vi: 'Phòng ban' }, locale),
      width: 130
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 100,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive']
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
        console.log('[UserManagement] Rendering actions for user:', params.row.username, 'hasResetPassword:', !!handleResetPassword);
        return (
          <ActionsCell
            onEdit={() => handleEdit(params.row.id)}
            onResetPassword={handleResetPassword ? () => handleResetPassword(params.row.id) : undefined}
            editTooltip={getLocalizedValue({ en: 'Edit User', ko: '사용자 수정', zh: '编辑用户', vi: 'Sửa người dùng' }, locale)}
            resetPasswordTooltip={getLocalizedValue({ en: 'Reset Password', ko: '비밀번호 재설정', zh: '重置密码', vi: 'Đặt lại mật khẩu' }, locale)}
            showMore={false}
          />
        );
      }
    });
  }

  return columns;
};
