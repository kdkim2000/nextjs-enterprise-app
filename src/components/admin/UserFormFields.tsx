'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Divider,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Box,
  Chip,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Smartphone as SmartphoneIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import AvatarUpload from '@/components/common/AvatarUpload';
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
  mfaEnabled?: boolean;
  ssoEnabled?: boolean;
}

export interface ValidationErrors {
  loginid?: string;
  password?: string;
  name_ko?: string;
  email?: string;
  user_category?: string;
}

export interface UserFormFieldsProps {
  user: UserFormData | null;
  onChange: (user: UserFormData) => void;
  onError?: (error: string) => void;
  onValidationChange?: (isValid: boolean, errors: ValidationErrors) => void;
  loginidLabel?: string;
  usernameLabel?: string; // backward compatibility
  emailLabel?: string;
  departments?: any[];
  locale?: string;
}

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateLoginId = (loginid: string): boolean => {
  // Login ID: alphanumeric, dots, underscores, hyphens, 3-50 chars
  const loginIdRegex = /^[a-zA-Z0-9._-]{3,50}$/;
  return loginIdRegex.test(loginid);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export default function UserFormFields({
  user,
  onChange,
  onError,
  onValidationChange,
  loginidLabel,
  usernameLabel, // backward compatibility
  emailLabel = 'Email',
  departments = [],
  locale = 'en'
}: UserFormFieldsProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isNewUser = !user?.id;

  // Validate all fields
  const validateForm = useCallback((): ValidationErrors => {
    if (!user) return {};

    const newErrors: ValidationErrors = {};

    const loginid = user.loginid || user.username || '';
    if (!loginid) {
      newErrors.loginid = 'Login ID is required';
    } else if (!validateLoginId(loginid)) {
      newErrors.loginid = 'Login ID must be 3-50 characters (letters, numbers, ., _, -)';
    }

    if (isNewUser) {
      if (!user.password) {
        newErrors.password = 'Password is required';
      } else if (!validatePassword(user.password)) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    const name_ko = user.name_ko || user.name || '';
    if (!name_ko) {
      newErrors.name_ko = 'Korean name is required';
    }

    if (!user.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(user.email)) {
      newErrors.email = 'Invalid email format';
    }

    return newErrors;
  }, [user, isNewUser]);

  // Update validation when user changes
  useEffect(() => {
    if (!user) return;
    const newErrors = validateForm();
    setErrors(newErrors);
    onValidationChange?.(Object.keys(newErrors).length === 0, newErrors);
  }, [user, validateForm, onValidationChange]);

  // Early return AFTER all hooks
  if (!user) return null;

  const handleChange = (field: keyof UserFormData, value: string | boolean) => {
    onChange({ ...user, [field]: value });
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: keyof ValidationErrors): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  // Use loginidLabel if provided, otherwise fall back to usernameLabel or default
  const finalLoginidLabel = loginidLabel || usernameLabel || 'Login ID (로그인 ID)';

  // Required field indicator
  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <Box component="span">
      {children}
      <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>*</Typography>
    </Box>
  );

  return (
    <>
      {/* Validation Summary for new users */}
      {isNewUser && Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please fill in all required fields correctly before saving.
        </Alert>
      )}

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

      {/* Required Fields Notice */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">
          Account Information
        </Typography>
        <Typography variant="caption" color="text.secondary">
          (<Typography component="span" color="error.main">*</Typography> Required fields)
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Login ID - Required */}
        <Grid item xs={12} sm={6}>
          <TextField
            label={<RequiredLabel>{finalLoginidLabel}</RequiredLabel>}
            fullWidth
            value={user.loginid || user.username || ''}
            onChange={(e) => handleChange('loginid', e.target.value)}
            onBlur={() => handleBlur('loginid')}
            disabled={!isNewUser}
            error={!!getFieldError('loginid')}
            helperText={getFieldError('loginid') || (isNewUser ? 'Unique login ID (3-50 characters)' : 'Login ID cannot be changed')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color={getFieldError('loginid') ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Employee Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Employee Number (사번)"
            fullWidth
            value={user.employee_number || ''}
            onChange={(e) => handleChange('employee_number', e.target.value)}
            helperText="Internal employee number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Password - Only for new users, Required */}
        {isNewUser && (
          <Grid item xs={12} sm={6}>
            <TextField
              label={<RequiredLabel>Password</RequiredLabel>}
              type="password"
              fullWidth
              value={user.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={!!getFieldError('password')}
              helperText={getFieldError('password') || 'Minimum 8 characters'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color={getFieldError('password') ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        {/* Email - Required */}
        <Grid item xs={12} sm={6}>
          <TextField
            label={<RequiredLabel>{emailLabel}</RequiredLabel>}
            type="email"
            fullWidth
            value={user.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={!!getFieldError('email')}
            helperText={getFieldError('email') || 'User email address'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color={getFieldError('email') ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* System Key - Read only, shown for existing users */}
        {!isNewUser && user.system_key && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="System Key"
              fullWidth
              value={user.system_key || ''}
              disabled
              helperText="Auto-generated system key (read-only)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        {/* Last Password Changed - Read only, shown for existing users */}
        {!isNewUser && user.lastPasswordChanged && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Password Changed"
              fullWidth
              value={user.lastPasswordChanged ? new Date(user.lastPasswordChanged).toLocaleString() : ''}
              disabled
              helperText="Last password change date"
            />
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Personal Information Section */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Personal Information
      </Typography>

      <Grid container spacing={2}>
        {/* Korean Name - Required */}
        <Grid item xs={12} sm={6}>
          <TextField
            label={<RequiredLabel>Name (Korean) 이름</RequiredLabel>}
            fullWidth
            value={user.name_ko || user.name || ''}
            onChange={(e) => handleChange('name_ko', e.target.value)}
            onBlur={() => handleBlur('name_ko')}
            error={!!getFieldError('name_ko')}
            helperText={getFieldError('name_ko') || 'Full name in Korean'}
          />
        </Grid>

        {/* English Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name (English)"
            fullWidth
            value={user.name_en || ''}
            onChange={(e) => handleChange('name_en', e.target.value)}
            helperText="Full name in English (optional)"
          />
        </Grid>

        {/* Position */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Position (직급)"
            fullWidth
            value={user.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
            helperText="Job title/position"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* User Category - Required with valid values */}
        <Grid item xs={12} sm={6}>
          <CodeSelect
            codeType="USER_CATEGORY"
            value={user.user_category || 'regular'}
            onChange={(value) => handleChange('user_category', value)}
            label="User Category (사용자구분)"
            required
            helperText="regular, contractor, temporary, external, admin"
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SmartphoneIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Organization & Access Section */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Organization & Access
      </Typography>

      <Grid container spacing={2}>
        {/* Role */}
        <Grid item xs={12} sm={6}>
          <CodeSelect
            codeType="USER_ROLE"
            value={user.role || 'user'}
            onChange={(value) => handleChange('role', value)}
            label="Role"
            required
            helperText="User role for access control"
          />
        </Grid>

        {/* Department */}
        <Grid item xs={12} sm={6}>
          <DepartmentTreeSelect
            value={user.department || ''}
            onChange={(value) => handleChange('department', value)}
            departments={departments}
            locale={locale}
            label="Department (부서)"
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
            helperText="Account status"
          />
        </Grid>
      </Grid>

      {/* Security Settings Section - Only for existing users */}
      {!isNewUser && (
        <>
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Security Settings
          </Typography>

          <Grid container spacing={2}>
            {/* MFA Enabled */}
            <Grid item xs={12} sm={6}>
              <Box sx={{
                p: 2,
                border: '1px solid',
                borderColor: user.mfaEnabled ? 'success.main' : 'divider',
                borderRadius: 1,
                bgcolor: user.mfaEnabled ? 'success.50' : 'grey.50',
                transition: 'all 0.2s'
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={user.mfaEnabled || false}
                      onChange={(e) => handleChange('mfaEnabled', e.target.checked)}
                      color="success"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>MFA (Multi-Factor Authentication)</span>
                      <Chip
                        label={user.mfaEnabled ? 'Enabled' : 'Disabled'}
                        size="small"
                        color={user.mfaEnabled ? 'success' : 'default'}
                      />
                    </Box>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 4 }}>
                  {user.mfaEnabled
                    ? '✓ User must verify with email code when logging in'
                    : '○ User can login with password only'}
                </Typography>
              </Box>
            </Grid>

            {/* SSO Enabled */}
            <Grid item xs={12} sm={6}>
              <Box sx={{
                p: 2,
                border: '1px solid',
                borderColor: user.ssoEnabled ? 'info.main' : 'divider',
                borderRadius: 1,
                bgcolor: user.ssoEnabled ? 'info.50' : 'grey.50',
                transition: 'all 0.2s'
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={user.ssoEnabled || false}
                      onChange={(e) => handleChange('ssoEnabled', e.target.checked)}
                      color="info"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>SSO (Single Sign-On)</span>
                      <Chip
                        label={user.ssoEnabled ? 'Enabled' : 'Disabled'}
                        size="small"
                        color={user.ssoEnabled ? 'info' : 'default'}
                      />
                    </Box>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 4 }}>
                  {user.ssoEnabled
                    ? '✓ User can login via corporate SSO provider'
                    : '○ User must login with local credentials'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </>
      )}

    </>
  );
}
