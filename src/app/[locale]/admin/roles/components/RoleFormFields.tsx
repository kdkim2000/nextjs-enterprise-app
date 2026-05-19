'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Divider,
  Typography,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
} from '@mui/material';
import { PersonSearch, Clear } from '@mui/icons-material';
import CodeSelect from '@/components/common/CodeSelect';
import UserSearchDialog, { User } from '@/components/common/UserSearchDialog';
import { Role } from '@/types/role';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface RoleFormFieldsProps {
  role: Role | null;
  onChange: (role: Role | null) => void;
  locale: string;
}

export default function RoleFormFields({
  role,
  onChange,
  locale,
}: RoleFormFieldsProps) {
  const isKorean = locale === 'ko';

  // User search dialog state
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchType, setUserSearchType] = useState<'manager' | 'representative' | null>(null);
  const [managerName, setManagerName] = useState<string>('');
  const [representativeName, setRepresentativeName] = useState<string>('');

  // Initialize user names when editing role
  useEffect(() => {
    const timer = setTimeout(() => {
      if (role) {
        setManagerName(role.managerName || '');
        setRepresentativeName(role.representativeName || '');
      } else {
        setManagerName('');
        setRepresentativeName('');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [role]);

  const handleUserSelect = (user: User) => {
    if (!role) return;

    if (userSearchType === 'manager') {
      onChange({ ...role, manager: user.id, managerName: user.name });
      setManagerName(user.name);
    } else if (userSearchType === 'representative') {
      onChange({ ...role, representative: user.id, representativeName: user.name });
      setRepresentativeName(user.name);
    }
    setUserSearchOpen(false);
    setUserSearchType(null);
  };

  if (!role) return null;

  return (
    <>
      <Stack spacing={3}>
        {/* ID (read-only for edit) */}
        {role.id && (
          <TextField
            label="ID"
            value={role.id}
            disabled
            fullWidth
            size="small"
          />
        )}

        {/* Role Name */}
        <TextField
          label={`${getLocalizedValue({ en: 'Role Name', ko: '역할 이름', zh: '角色名称', vi: 'Tên vai trò' }, locale)} *`}
          value={role.name || ''}
          onChange={(e) => onChange({ ...role, name: e.target.value })}
          fullWidth
          required
          helperText={getLocalizedValue({
            en: 'Unique identifier (e.g., admin, manager)',
            ko: '고유 식별자 (예: admin, manager)',
            zh: '唯一标识符（例如：admin, manager）',
            vi: 'Định danh duy nhất (ví dụ: admin, manager)'
          }, locale)}
        />

        {/* Display Name */}
        <TextField
          label={`${getLocalizedValue({ en: 'Display Name', ko: '표시명', zh: '显示名称', vi: 'Tên hiển thị' }, locale)} *`}
          value={role.displayName || ''}
          onChange={(e) => onChange({ ...role, displayName: e.target.value })}
          fullWidth
          required
          helperText={getLocalizedValue({
            en: 'User-friendly name shown in UI',
            ko: 'UI에 표시되는 사용자 친화적인 이름',
            zh: '在UI中显示的用户友好名称',
            vi: 'Tên thân thiện hiển thị trong UI'
          }, locale)}
        />

        {/* Description */}
        <TextField
          label={getLocalizedValue({ en: 'Description', ko: '설명', zh: '描述', vi: 'Mô tả' }, locale)}
          value={role.description || ''}
          onChange={(e) => onChange({ ...role, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
          helperText={getLocalizedValue({
            en: "Brief description of this role's purpose",
            ko: '이 역할의 목적에 대한 간단한 설명',
            zh: '此角色目的的简要描述',
            vi: 'Mô tả ngắn gọn về mục đích của vai trò này'
          }, locale)}
        />

        <Divider />

        {/* Role Type */}
        <CodeSelect
          codeType="ROLE_TYPE"
          value={role.roleType || 'general'}
          onChange={(value) => onChange({ ...role, roleType: value as 'management' | 'general' })}
          label={`${getLocalizedValue({ en: 'Role Type', ko: '역할 타입', zh: '角色类型', vi: 'Loại vai trò' }, locale)} *`}
          required
          locale={locale}
          helperText={getLocalizedValue({
            en: 'General: Users can request | Management: Admin-only',
            ko: '일반: 사용자 요청 가능 | 관리: 관리자 전용',
            zh: '一般: 用户可请求 | 管理: 仅管理员',
            vi: 'Chung: Người dùng có thể yêu cầu | Quản lý: Chỉ admin'
          }, locale)}
        />

        {/* Manager */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {getLocalizedValue({ en: 'Manager', ko: '담당자', zh: '管理者', vi: 'Người quản lý' }, locale)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<PersonSearch />}
              onClick={() => {
                setUserSearchType('manager');
                setUserSearchOpen(true);
              }}
              fullWidth
            >
              {managerName || role.managerName || getLocalizedValue({
                en: 'Select Manager',
                ko: '담당자 선택',
                zh: '选择管理者',
                vi: 'Chọn người quản lý'
              }, locale)}
            </Button>
            {(role.manager || managerName) && (
              <IconButton
                size="small"
                onClick={() => {
                  onChange({ ...role, manager: null, managerName: null });
                  setManagerName('');
                }}
              >
                <Clear />
              </IconButton>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5, display: 'block' }}>
            {getLocalizedValue({
              en: 'User who manages this role',
              ko: '이 역할을 관리하는 사용자',
              zh: '管理此角色的用户',
              vi: 'Người dùng quản lý vai trò này'
            }, locale)}
          </Typography>
        </Box>

        {/* Representative */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {getLocalizedValue({ en: 'Representative', ko: '대표자', zh: '代表', vi: 'Đại diện' }, locale)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<PersonSearch />}
              onClick={() => {
                setUserSearchType('representative');
                setUserSearchOpen(true);
              }}
              fullWidth
            >
              {representativeName || role.representativeName || getLocalizedValue({
                en: 'Select Representative',
                ko: '대표자 선택',
                zh: '选择代表',
                vi: 'Chọn đại diện'
              }, locale)}
            </Button>
            {(role.representative || representativeName) && (
              <IconButton
                size="small"
                onClick={() => {
                  onChange({ ...role, representative: null, representativeName: null });
                  setRepresentativeName('');
                }}
              >
                <Clear />
              </IconButton>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5, display: 'block' }}>
            {getLocalizedValue({
              en: 'Main contact person for this role',
              ko: '이 역할의 주요 연락 담당자',
              zh: '此角色的主要联系人',
              vi: 'Người liên hệ chính cho vai trò này'
            }, locale)}
          </Typography>
        </Box>

        <Divider />

        {/* System Role - Switch */}
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={role.isSystem || false}
                onChange={(e) => onChange({ ...role, isSystem: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  {getLocalizedValue({ en: 'System Role', ko: '시스템 역할', zh: '系统角色', vi: 'Vai trò hệ thống' }, locale)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue({
                    en: 'System roles cannot be deleted',
                    ko: '시스템 역할은 삭제할 수 없습니다',
                    zh: '系统角色无法删除',
                    vi: 'Vai trò hệ thống không thể xóa'
                  }, locale)}
                </Typography>
              </Box>
            }
          />
          {role.isSystem && (
            <Chip
              label={getLocalizedValue({ en: 'Protected', ko: '보호됨', zh: '受保护', vi: 'Được bảo vệ' }, locale)}
              size="small"
              color="secondary"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        {/* Active Status - Switch */}
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={role.isActive !== false}
                onChange={(e) => onChange({ ...role, isActive: e.target.checked })}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  {getLocalizedValue({ en: 'Active Status', ko: '활성 상태', zh: '激活状态', vi: 'Trạng thái hoạt động' }, locale)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue({
                    en: 'Inactive roles cannot be assigned to users',
                    ko: '비활성 역할은 사용자에게 할당할 수 없습니다',
                    zh: '非激活角色无法分配给用户',
                    vi: 'Vai trò không hoạt động không thể gán cho người dùng'
                  }, locale)}
                </Typography>
              </Box>
            }
          />
          <Chip
            label={role.isActive !== false
              ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Hoạt động' }, locale)
              : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale)
            }
            size="small"
            color={role.isActive !== false ? 'success' : 'default'}
            sx={{ ml: 2 }}
          />
        </Box>
      </Stack>

      {/* User Search Dialog */}
      <UserSearchDialog
        open={userSearchOpen}
        onClose={() => {
          setUserSearchOpen(false);
          setUserSearchType(null);
        }}
        onSelect={handleUserSelect}
        title={userSearchType === 'manager'
          ? getLocalizedValue({ en: 'Select Manager', ko: '담당자 선택', zh: '选择管理者', vi: 'Chọn người quản lý' }, locale)
          : getLocalizedValue({ en: 'Select Representative', ko: '대표자 선택', zh: '选择代表', vi: 'Chọn đại diện' }, locale)
        }
        locale={locale}
        multiSelect={false}
      />
    </>
  );
}
