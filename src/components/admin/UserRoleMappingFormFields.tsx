'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  FormControlLabel,
  Switch
} from '@mui/material';
import { api } from '@/lib/axios';

export interface UserRoleMappingFormData {
  id?: string;
  userId: string;
  roleId: string;
  expiresAt: string;
  isActive: boolean;
}

export interface UserRoleMappingFormFieldsProps {
  mapping: UserRoleMappingFormData | null;
  onChange: (mapping: UserRoleMappingFormData) => void;
  onError?: (error: string) => void;
  locale?: string;
  labels?: {
    userId?: string;
    roleId?: string;
    expiresAt?: string;
    isActive?: string;
  };
  selectedRoleId?: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
}

export default function UserRoleMappingFormFields({
  mapping,
  onChange,
  locale = 'en',
  labels = {},
  selectedRoleId
}: UserRoleMappingFormFieldsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          api.get('/user'),
          api.get('/role')
        ]);
        setUsers(usersResponse.users || []);
        setRoles(rolesResponse.roles || []);
      } catch (error) {
        console.error('Failed to fetch users or roles:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (!mapping) return null;

  const handleChange = (field: keyof UserRoleMappingFormData, value: string | boolean) => {
    onChange({ ...mapping, [field]: value });
  };

  const selectedUser = users.find(u => u.id === mapping.userId);
  const selectedRole = roles.find(r => r.id === (selectedRoleId || mapping.roleId));

  return (
    <>
      {/* User Selection */}
      <Autocomplete
        options={users}
        getOptionLabel={(option) => `${option.name} (${option.email})`}
        value={selectedUser || null}
        onChange={(_event, newValue) => {
          handleChange('userId', newValue?.id || '');
        }}
        loading={loading}
        disabled={!!mapping.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label={labels.userId || 'User'}
            required
            helperText={mapping.id ? 'User cannot be changed' : 'Select a user to assign the role'}
          />
        )}
      />

      {/* Role Selection */}
      <FormControl fullWidth required>
        <InputLabel>{labels.roleId || 'Role'}</InputLabel>
        <Select
          value={selectedRoleId || mapping.roleId || ''}
          label={labels.roleId || 'Role'}
          onChange={(e) => handleChange('roleId', e.target.value)}
          disabled={!!selectedRoleId || !!mapping.id}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.displayName} ({role.name})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Expires At */}
      <TextField
        label={labels.expiresAt || 'Expires At'}
        type="datetime-local"
        fullWidth
        value={mapping.expiresAt || ''}
        onChange={(e) => handleChange('expiresAt', e.target.value)}
        InputLabelProps={{
          shrink: true
        }}
        helperText={locale === 'ko' ? '만료 날짜 (선택사항)' : 'Expiration date (optional)'}
      />

      {/* Is Active */}
      <FormControlLabel
        control={
          <Switch
            checked={mapping.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
          />
        }
        label={labels.isActive || (locale === 'ko' ? '활성 상태' : 'Active Status')}
      />
    </>
  );
}
