'use client';

import React from 'react';
import {
  TextField,
  Divider
} from '@mui/material';
import AvatarUpload from '@/components/common/AvatarUpload';
import UserRoleAssignment from '@/components/admin/UserRoleAssignment';
import CodeSelect from '@/components/common/CodeSelect';
import DepartmentTreeSelect from '@/components/common/DepartmentTreeSelect';

export interface UserFormData {
  id?: string;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  password?: string;
  avatarUrl?: string;
}

export interface UserFormFieldsProps {
  user: UserFormData | null;
  onChange: (user: UserFormData) => void;
  onError?: (error: string) => void;
  usernameLabel?: string;
  emailLabel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  departments?: any[];
  locale?: string;
}

export default function UserFormFields({
  user,
  onChange,
  onError,
  usernameLabel = 'Username',
  emailLabel = 'Email',
  departments = [],
  locale = 'en'
}: UserFormFieldsProps) {
  if (!user) return null;

  const handleChange = (field: keyof UserFormData, value: string) => {
    onChange({ ...user, [field]: value });
  };

  return (
    <>
      {/* Avatar Upload */}
      <AvatarUpload
        avatarUrl={user.avatarUrl}
        name={user.name}
        onAvatarChange={(avatarUrl) => handleChange('avatarUrl', avatarUrl)}
        onError={onError}
      />

      <Divider />

      {/* Username */}
      <TextField
        label={usernameLabel}
        fullWidth
        required
        value={user.username || ''}
        onChange={(e) => handleChange('username', e.target.value)}
        disabled={!!user.id}
        helperText={user.id ? 'Username cannot be changed' : ''}
      />

      {/* Password - Only for new users */}
      {!user.id && (
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          value={user.password || ''}
          onChange={(e) => handleChange('password', e.target.value)}
          helperText="Minimum 8 characters"
        />
      )}

      {/* Name */}
      <TextField
        label="Name"
        fullWidth
        required
        value={user.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
      />

      {/* Email */}
      <TextField
        label={emailLabel}
        type="email"
        fullWidth
        required
        value={user.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
      />

      {/* Role */}
      <CodeSelect
        codeType="USER_ROLE"
        value={user.role || 'user'}
        onChange={(value) => handleChange('role', value)}
        label="Role"
        required
      />

      {/* Department */}
      <DepartmentTreeSelect
        value={user.department || ''}
        onChange={(value) => handleChange('department', value)}
        departments={departments}
        locale={locale}
        label="Department"
      />

      {/* Status */}
      <CodeSelect
        codeType="COMMON_STATUS"
        value={user.status || 'active'}
        onChange={(value) => handleChange('status', value)}
        label="Status"
        required
      />

      {/* Role Assignment Section */}
      <Divider sx={{ my: 2 }} />

      <UserRoleAssignment
        userId={user.id}
        onRolesChange={(roleIds) => {
          console.log('[UserFormFields] Roles changed:', roleIds);
        }}
      />
    </>
  );
}
