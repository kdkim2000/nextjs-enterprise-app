'use client';

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import AvatarUpload from '@/components/common/AvatarUpload';

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
  departments?: string[];
}

const DEFAULT_DEPARTMENTS = [
  'Admin', 'Design', 'Engineering', 'Finance', 'HR', 'IT',
  'Legal', 'Marketing', 'Operations', 'Product', 'Sales', 'Support'
];

export default function UserFormFields({
  user,
  onChange,
  onError,
  usernameLabel = 'Username',
  emailLabel = 'Email',
  departments = DEFAULT_DEPARTMENTS
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
      <FormControl fullWidth>
        <InputLabel>Role</InputLabel>
        <Select
          value={user.role || 'user'}
          label="Role"
          onChange={(e) => handleChange('role', e.target.value)}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="user">User</MenuItem>
        </Select>
      </FormControl>

      {/* Department */}
      <FormControl fullWidth>
        <InputLabel>Department</InputLabel>
        <Select
          value={user.department || ''}
          label="Department"
          onChange={(e) => handleChange('department', e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Status */}
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          value={user.status || 'active'}
          label="Status"
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}
