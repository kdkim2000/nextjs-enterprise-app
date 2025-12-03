'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Box, Avatar, Chip, Tooltip } from '@mui/material';
import { Security, VpnKey } from '@mui/icons-material';
import { getAvatarUrl } from '@/lib/config';
import ActionsCell from '@/components/common/ActionsCell';
import { User } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createColumns = (
  t: any,
  locale: string,
  allDepartments: any[],
  handleEdit: (id: string | number) => void,
  handleResetPassword?: (id: string | number) => void,
  canUpdate: boolean = true,
  onToggleField?: (id: string | number, field: string, value: boolean) => void
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
          avatarSrc = getAvatarUrl(user.avatarUrl) || '';
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
      editable: true,
      valueGetter: (_value, row) => row.loginid || row.username // backward compatibility
    },
    {
      field: 'employee_number',
      headerName: getLocalizedValue({ en: 'Employee #', ko: '사번', zh: '员工号', vi: 'Mã NV' }, locale),
      width: 120,
      editable: true
    },
    {
      field: 'name_ko',
      headerName: getLocalizedValue({ en: 'Name (KR)', ko: '이름 (한글)', zh: '姓名 (韩)', vi: 'Tên (Hàn)' }, locale),
      width: 130,
      editable: true,
      valueGetter: (_value, row) => row.name_ko || row.name // backward compatibility
    },
    {
      field: 'name_en',
      headerName: getLocalizedValue({ en: 'Name (EN)', ko: '이름 (영문)', zh: '姓名 (英)', vi: 'Tên (Anh)' }, locale),
      width: 130,
      editable: true
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
      width: 130,
      editable: true
    },
    {
      field: 'user_category',
      headerName: getLocalizedValue({ en: 'Category', ko: '사용자구분', zh: '类别', vi: 'Loại' }, locale),
      width: 110,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['regular', 'contractor', 'temporary', 'external', 'admin']
    },
    {
      field: 'position',
      headerName: getLocalizedValue({ en: 'Position', ko: '직급', zh: '职位', vi: 'Chức vụ' }, locale),
      width: 100,
      editable: true
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
      editable: true,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive'],
      renderCell: (params) => {
        const isActive = params.value === 'active';
        return (
          <Chip
            label={isActive
              ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale)
              : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale)
            }
            size="small"
            color={isActive ? 'success' : 'default'}
          />
        );
      }
    },
    {
      field: 'mfaEnabled',
      headerName: 'MFA',
      width: 80,
      type: 'boolean',
      renderCell: (params) => {
        const isEnabled = params.value === true;
        const canToggle = canUpdate && onToggleField;
        return (
          <Tooltip title={
            canToggle
              ? getLocalizedValue({ en: 'Click to toggle MFA', ko: '클릭하여 MFA 토글', zh: '点击切换MFA', vi: 'Nhấp để bật/tắt MFA' }, locale)
              : (isEnabled
                ? getLocalizedValue({ en: 'MFA Enabled', ko: 'MFA 활성화', zh: 'MFA已启用', vi: 'MFA đã bật' }, locale)
                : getLocalizedValue({ en: 'MFA Disabled', ko: 'MFA 비활성화', zh: 'MFA已禁用', vi: 'MFA đã tắt' }, locale))
          }>
            <Box
              onClick={canToggle ? () => onToggleField(params.row.id, 'mfaEnabled', !isEnabled) : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                cursor: canToggle ? 'pointer' : 'default',
                borderRadius: 1,
                transition: 'background-color 0.2s',
                '&:hover': canToggle ? { bgcolor: 'action.hover' } : {}
              }}
            >
              <Security
                fontSize="small"
                sx={{
                  color: isEnabled ? 'success.main' : 'action.disabled',
                  opacity: isEnabled ? 1 : 0.4
                }}
              />
            </Box>
          </Tooltip>
        );
      }
    },
    {
      field: 'ssoEnabled',
      headerName: 'SSO',
      width: 80,
      type: 'boolean',
      renderCell: (params) => {
        const isEnabled = params.value === true;
        const canToggle = canUpdate && onToggleField;
        return (
          <Tooltip title={
            canToggle
              ? getLocalizedValue({ en: 'Click to toggle SSO', ko: '클릭하여 SSO 토글', zh: '点击切换SSO', vi: 'Nhấp để bật/tắt SSO' }, locale)
              : (isEnabled
                ? getLocalizedValue({ en: 'SSO Enabled', ko: 'SSO 활성화', zh: 'SSO已启用', vi: 'SSO đã bật' }, locale)
                : getLocalizedValue({ en: 'SSO Disabled', ko: 'SSO 비활성화', zh: 'SSO已禁用', vi: 'SSO đã tắt' }, locale))
          }>
            <Box
              onClick={canToggle ? () => onToggleField(params.row.id, 'ssoEnabled', !isEnabled) : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                cursor: canToggle ? 'pointer' : 'default',
                borderRadius: 1,
                transition: 'background-color 0.2s',
                '&:hover': canToggle ? { bgcolor: 'action.hover' } : {}
              }}
            >
              <VpnKey
                fontSize="small"
                sx={{
                  color: isEnabled ? 'info.main' : 'action.disabled',
                  opacity: isEnabled ? 1 : 0.4
                }}
              />
            </Box>
          </Tooltip>
        );
      }
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
