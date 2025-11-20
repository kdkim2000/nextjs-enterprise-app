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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allDepartments: any[],
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

        // Determine avatar source (priority: avatar_image > avatarUrl)
        let avatarSrc = '';
        if (user.avatar_image) {
          // Use base64 image directly from DB
          avatarSrc = user.avatar_image;
          console.log('[Avatar] Using DB image for user:', user.loginid, 'size:', user.avatar_image.length);
        } else if (user.avatarUrl) {
          // Fallback to avatar URL
          avatarSrc = getAvatarUrl(user.avatarUrl);
          console.log('[Avatar] Using URL for user:', user.loginid);
        }

        // Get avatar text based on available name fields
        let avatarText = '';
        if (!avatarSrc) {
          if (user.name_ko) {
            // For Korean names, show only 1 character (usually the family name)
            avatarText = user.name_ko.substring(0, 1);
          } else if (user.name_en) {
            // For English names, show first 2 characters (initials)
            avatarText = user.name_en.substring(0, 2).toUpperCase();
          } else if (user.name) {
            // Fallback to name field if exists
            avatarText = user.name.substring(0, 1);
          }
        }

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}
          >
            <Avatar
              src={avatarSrc || undefined}
              alt={user.name_ko || user.name || ''}
              sx={{ width: 32, height: 32 }}
            >
              {avatarText}
            </Avatar>
          </Box>
        );
      }
    },
    {
      field: 'loginid',
      headerName: getLocalizedValue({ en: 'Login ID', ko: '로그인 ID', zh: '登录ID', vi: 'ID đăng nhập' }, locale),
      width: 130,
      valueGetter: (_value, row) => row.loginid || row.username // backward compatibility
    },
    {
      field: 'employee_number',
      headerName: getLocalizedValue({ en: 'Employee #', ko: '사번', zh: '员工号', vi: 'Mã NV' }, locale),
      width: 120
    },
    {
      field: 'name_ko',
      headerName: getLocalizedValue({ en: 'Name (KR)', ko: '이름 (한글)', zh: '姓名 (韩)', vi: 'Tên (Hàn)' }, locale),
      width: 130,
      valueGetter: (_value, row) => row.name_ko || row.name // backward compatibility
    },
    {
      field: 'name_en',
      headerName: getLocalizedValue({ en: 'Name (EN)', ko: '이름 (영문)', zh: '姓名 (英)', vi: 'Tên (Anh)' }, locale),
      width: 130
    },
    { field: 'email', headerName: t('auth.email'), width: 200 },
    {
      field: 'phone_number',
      headerName: getLocalizedValue({ en: 'Phone', ko: '전화번호', zh: '电话', vi: 'Điện thoại' }, locale),
      width: 130
    },
    {
      field: 'mobile_number',
      headerName: getLocalizedValue({ en: 'Mobile', ko: '휴대전화', zh: '手机', vi: 'Di động' }, locale),
      width: 130
    },
    {
      field: 'user_category',
      headerName: getLocalizedValue({ en: 'Category', ko: '사용자구분', zh: '类别', vi: 'Loại' }, locale),
      width: 110,
      type: 'singleSelect',
      valueOptions: ['regular', 'contractor', 'temporary', 'external', 'admin']
    },
    {
      field: 'position',
      headerName: getLocalizedValue({ en: 'Position', ko: '직급', zh: '职位', vi: 'Chức vụ' }, locale),
      width: 100
    },
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
      width: 200,
      valueGetter: (_value, row) => {
        if (!row.department) return '-';

        // If departments are still loading, return empty string to avoid showing codes
        if (!allDepartments || allDepartments.length === 0) {
          return '';
        }

        const dept = allDepartments.find(d => d.id === row.department);
        if (!dept) {
          // Department not found - return empty string instead of code
          return '';
        }

        // Check if dept.name is an object (multi-language) or string
        if (typeof dept.name === 'object' && dept.name !== null) {
          return getLocalizedValue(dept.name, locale);
        } else if (typeof dept.name === 'string') {
          return dept.name;
        } else {
          // Fallback: try language-specific fields
          return dept.name_ko || dept.name_en || dept.name_zh || dept.name_vi || '';
        }
      }
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
        console.log('[UserManagement] Rendering actions for user:', params.row.loginid || params.row.username, 'hasResetPassword:', !!handleResetPassword);
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
