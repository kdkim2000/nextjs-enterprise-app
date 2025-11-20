'use client';

import React from 'react';
import {
  TextField,
  Divider,
  Grid,
  Typography
} from '@mui/material';
import AvatarUpload from '@/components/common/AvatarUpload';
import UserRoleAssignment from '@/components/admin/UserRoleAssignment';
import CodeSelect from '@/components/common/CodeSelect';
import DepartmentTreeSelect from '@/components/common/DepartmentTreeSelect';

export interface UserFormData {
  id?: string;
  loginid: string;
  username?: string; // backward compatibility
  name_ko: string;
  name_en?: string;
  name?: string; // backward compatibility
  email: string;
  employee_number?: string;
  system_key?: string;
  phone_number?: string;
  mobile_number?: string;
  user_category?: string;
  position?: string;
  role: string;
  department: string;
  status: string;
  password?: string;
  avatarUrl?: string;
  avatar_image?: string; // Base64 encoded image
  lastPasswordChanged?: string;
}

export interface UserFormFieldsProps {
  user: UserFormData | null;
  onChange: (user: UserFormData) => void;
  onError?: (error: string) => void;
  loginidLabel?: string;
  usernameLabel?: string; // backward compatibility
  emailLabel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  departments?: any[];
  locale?: string;
}

export default function UserFormFields({
  user,
  onChange,
  onError,
  loginidLabel,
  usernameLabel, // backward compatibility
  emailLabel = 'Email',
  departments = [],
  locale = 'en'
}: UserFormFieldsProps) {
  if (!user) return null;

  const handleChange = (field: keyof UserFormData, value: string) => {
    onChange({ ...user, [field]: value });
  };

  // Use loginidLabel if provided, otherwise fall back to usernameLabel or default
  const finalLoginidLabel = loginidLabel || usernameLabel || 'Login ID';

  return (
    <>
      {/* Avatar Upload */}
      <AvatarUpload
        avatarUrl={user.avatarUrl}
        avatarImage={user.avatar_image}
        name={user.name_ko || user.name || ''}
        onAvatarChange={(avatarUrl) => handleChange('avatarUrl', avatarUrl)}
        onAvatarImageChange={(base64Image) => handleChange('avatar_image', base64Image)}
        onError={onError}
        useBase64={true}
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Basic Information
      </Typography>

      <Grid container spacing={2}>
        {/* Login ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            label={finalLoginidLabel}
            fullWidth
            required
            value={user.loginid || user.username || ''}
            onChange={(e) => handleChange('loginid', e.target.value)}
            disabled={!!user.id}
            helperText={user.id ? 'Login ID cannot be changed' : ''}
          />
        </Grid>

        {/* Employee Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Employee Number (사번)"
            fullWidth
            value={user.employee_number || ''}
            onChange={(e) => handleChange('employee_number', e.target.value)}
          />
        </Grid>

        {/* Password - Only for new users */}
        {!user.id && (
          <Grid item xs={12}>
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={user.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              helperText="Minimum 8 characters"
            />
          </Grid>
        )}

        {/* System Key - Read only, shown for existing users */}
        {user.id && user.system_key && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="System Key"
              fullWidth
              value={user.system_key || ''}
              disabled
              helperText="Internal system key (read-only)"
            />
          </Grid>
        )}

        {/* Last Password Changed - Read only, shown for existing users */}
        {user.id && user.lastPasswordChanged && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Password Changed"
              fullWidth
              value={user.lastPasswordChanged ? new Date(user.lastPasswordChanged).toLocaleString() : ''}
              disabled
              helperText="Last password change date (read-only)"
            />
          </Grid>
        )}

        {/* Korean Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name (Korean)"
            fullWidth
            required
            value={user.name_ko || user.name || ''}
            onChange={(e) => handleChange('name_ko', e.target.value)}
          />
        </Grid>

        {/* English Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name (English)"
            fullWidth
            value={user.name_en || ''}
            onChange={(e) => handleChange('name_en', e.target.value)}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            label={emailLabel}
            type="email"
            fullWidth
            required
            value={user.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </Grid>

        {/* User Category */}
        <Grid item xs={12} sm={6}>
          <CodeSelect
            codeType="USER_CATEGORY"
            value={user.user_category || 'regular'}
            onChange={(value) => handleChange('user_category', value)}
            label="User Category (사용자구분)"
            required
          />
        </Grid>

        {/* Position */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Position (직급)"
            fullWidth
            value={user.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
            helperText="Job position/title"
          />
        </Grid>

        {/* Phone Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone Number (전화번호)"
            fullWidth
            value={user.phone_number || ''}
            onChange={(e) => handleChange('phone_number', e.target.value)}
            helperText="Office phone number"
          />
        </Grid>

        {/* Mobile Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Mobile Number (휴대전화)"
            fullWidth
            value={user.mobile_number || ''}
            onChange={(e) => handleChange('mobile_number', e.target.value)}
            helperText="Personal mobile number"
          />
        </Grid>

        {/* Role */}
        <Grid item xs={12} sm={6}>
          <CodeSelect
            codeType="USER_ROLE"
            value={user.role || 'user'}
            onChange={(value) => handleChange('role', value)}
            label="Role"
            required
          />
        </Grid>

        {/* Department */}
        <Grid item xs={12} sm={6}>
          <DepartmentTreeSelect
            value={user.department || ''}
            onChange={(value) => handleChange('department', value)}
            departments={departments}
            locale={locale}
            label="Department"
          />
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6}>
          <CodeSelect
            codeType="COMMON_STATUS"
            value={user.status || 'active'}
            onChange={(value) => handleChange('status', value)}
            label="Status"
            required
          />
        </Grid>
      </Grid>

      {/* Role Assignment Section */}
      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Role Assignment
      </Typography>

      <UserRoleAssignment
        userId={user.id}
        onRolesChange={(roleIds) => {
          console.log('[UserFormFields] Roles changed:', roleIds);
        }}
      />
    </>
  );
}
