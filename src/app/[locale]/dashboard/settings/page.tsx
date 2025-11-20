'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  Grid,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Person,
  Security,
  Palette,
  Phone,
  PhoneAndroid,
  Badge,
  Business,
  Work
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useChangeLocale } from '@/lib/i18n/client';
import { api } from '@/lib/axios';
import { useMessage } from '@/hooks/useMessage';
import PageHeader from '@/components/common/PageHeader';
import RouteGuard from '@/components/auth/RouteGuard';
import AvatarUpload from '@/components/common/AvatarUpload';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Department {
  id: string;
  name_ko: string;
  name_en: string;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const locale = useCurrentLocale();
  const changeLocale = useChangeLocale();
  const {
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale });
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Profile Settings - Simplified to use only avatar_image
  const [profileData, setProfileData] = useState({
    name_ko: user?.name_ko || '',
    name_en: user?.name_en || '',
    email: user?.email || '',
    employee_number: user?.employee_number || '',
    phone_number: user?.phone_number || '',
    mobile_number: user?.mobile_number || '',
    position: user?.position || '',
    user_category: user?.user_category || 'regular',
    department: user?.department || '',
    avatar_image: user?.avatar_image || '',
    avatarUrl: user?.avatarUrl || '' // Keep as fallback only
  });

  // Security Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Preference Settings
  const [preferences, setPreferences] = useState({
    language: locale,
    theme: 'light',
    rowsPerPage: 10,
    emailNotifications: true,
    systemNotifications: true,
    sessionTimeout: 30
  });

  // Sync profileData with user when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name_ko: user.name_ko || '',
        name_en: user.name_en || '',
        email: user.email || '',
        employee_number: user.employee_number || '',
        phone_number: user.phone_number || '',
        mobile_number: user.mobile_number || '',
        position: user.position || '',
        user_category: user.user_category || 'regular',
        department: user.department || '',
        avatar_image: user.avatar_image || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  useEffect(() => {
    loadPreferences();
    loadDepartments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/department/all');
      setDepartments(response.departments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await api.get('/user/preferences');
      if (response.preferences) {
        setPreferences({
          language: response.preferences.language || locale,
          theme: response.preferences.theme || 'light',
          rowsPerPage: response.preferences.rowsPerPage || 10,
          emailNotifications: response.preferences.emailNotifications ?? true,
          systemNotifications: response.preferences.systemNotifications ?? true,
          sessionTimeout: response.preferences.sessionTimeout || 30
        });
        setMfaEnabled(response.preferences.mfaEnabled || false);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAvatarChange = (base64Image: string) => {
    setProfileData({ ...profileData, avatar_image: base64Image });
  };

  const handleAvatarDelete = () => {
    setProfileData({ ...profileData, avatar_image: '', avatarUrl: '' });
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await api.put('/user/profile', profileData);
      // Update user in AuthContext
      if (response.user && updateUser) {
        updateUser(response.user);
      }
      await showSuccessMessage('SETTINGS_PROFILE_UPDATE_SUCCESS');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage('SETTINGS_PROFILE_UPDATE_FAIL');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      await showErrorMessage('VALIDATION_PASSWORD_MISMATCH');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      await showErrorMessage('VALIDATION_PASSWORD_LENGTH');
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      await showSuccessMessage('SETTINGS_PASSWORD_CHANGE_SUCCESS');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage('SETTINGS_PASSWORD_CHANGE_FAIL');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      await api.post('/user/mfa-toggle', { enabled });
      setMfaEnabled(enabled);
      const status = enabled ? 'enabled' : 'disabled';
      await showSuccessMessage('SETTINGS_MFA_TOGGLE_SUCCESS', { status });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage('SETTINGS_MFA_TOGGLE_FAIL');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/user/preferences', preferences);

      // Apply language change
      if (preferences.language !== locale) {
        changeLocale(preferences.language);
      }

      await showSuccessMessage('SETTINGS_PREFERENCES_SAVE_SUCCESS');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage('SETTINGS_PREFERENCES_SAVE_FAIL');
    } finally {
      setLoading(false);
    }
  };

  const userCategoryOptions = [
    { value: 'regular', label: locale === 'ko' ? '정규직' : 'Regular' },
    { value: 'contractor', label: locale === 'ko' ? '계약직' : 'Contractor' },
    { value: 'temporary', label: locale === 'ko' ? '임시직' : 'Temporary' },
    { value: 'external', label: locale === 'ko' ? '외부인력' : 'External' },
    { value: 'admin', label: locale === 'ko' ? '관리자' : 'Admin' }
  ];

  return (
    <RouteGuard programCode="PROG-SETTINGS" requiredPermission="view" fallbackUrl="/dashboard">
      <Box>
        <PageHeader useMenu showBreadcrumb />

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="settings tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<Person />} label={locale === 'ko' ? '프로필' : 'Profile'} />
            <Tab icon={<Security />} label={locale === 'ko' ? '보안' : 'Security'} />
            <Tab icon={<Palette />} label={locale === 'ko' ? '환경설정' : 'Preferences'} />
          </Tabs>

        {/* Profile Tab */}
        <TabPanel value={currentTab} index={0}>
          <Stack spacing={3}>
            <Typography variant="h6">{locale === 'ko' ? '프로필 정보' : 'Profile Information'}</Typography>

            {/* Avatar Upload Section - Using Common Component */}
            <AvatarUpload
              avatarImage={profileData.avatar_image}
              avatarUrl={profileData.avatarUrl}
              name={profileData.name_ko || profileData.name_en || 'User'}
              onAvatarImageChange={handleAvatarChange}
              onDelete={handleAvatarDelete}
              onError={(error) => showErrorMessage('VALIDATION_FILE_SIZE_EXCEEDED')}
              label={locale === 'ko' ? '프로필 사진' : 'Profile Picture'}
              uploadButtonText={locale === 'ko' ? '업로드' : 'Upload'}
              deleteButtonText={locale === 'ko' ? '삭제' : 'Delete'}
              maxSizeText={locale === 'ko' ? 'JPG, PNG, GIF, WEBP 형식 지원 (최대 10MB)' : 'Supports JPG, PNG, GIF, WEBP (Max 10MB)'}
              useBase64={true}
              showDelete={true}
            />

            <Divider />

            {/* Basic Information */}
            <Typography variant="subtitle1" fontWeight={600}>
              {locale === 'ko' ? '기본 정보' : 'Basic Information'}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={locale === 'ko' ? '한글 이름' : 'Korean Name'}
                  fullWidth
                  value={profileData.name_ko}
                  onChange={(e) => setProfileData({ ...profileData, name_ko: e.target.value })}
                  placeholder={locale === 'ko' ? '홍길동' : 'Hong Gildong'}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={locale === 'ko' ? '영문 이름' : 'English Name'}
                  fullWidth
                  value={profileData.name_en}
                  onChange={(e) => setProfileData({ ...profileData, name_en: e.target.value })}
                  placeholder="Hong Gildong"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={locale === 'ko' ? '사번' : 'Employee Number'}
                  fullWidth
                  value={profileData.employee_number}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    )
                  }}
                  helperText={locale === 'ko' ? '사번은 수정할 수 없습니다' : 'Employee number cannot be changed'}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{locale === 'ko' ? '사용자 유형' : 'User Category'}</InputLabel>
                  <Select
                    value={profileData.user_category}
                    label={locale === 'ko' ? '사용자 유형' : 'User Category'}
                    onChange={(e) => setProfileData({ ...profileData, user_category: e.target.value })}
                  >
                    {userCategoryOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={locale === 'ko' ? '직위/직급' : 'Position'}
                  fullWidth
                  value={profileData.position}
                  onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                  placeholder={locale === 'ko' ? '대리, 과장, 부장 등' : 'Manager, Director, etc.'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={departments}
                  getOptionLabel={(option) =>
                    locale === 'ko'
                      ? `${option.name_ko} (${option.id})`
                      : `${option.name_en} (${option.id})`
                  }
                  value={departments.find(d => d.id === profileData.department) || null}
                  onChange={(event, newValue) => {
                    setProfileData({ ...profileData, department: newValue?.id || '' });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={locale === 'ko' ? '부서' : 'Department'}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <Business />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Contact Information */}
            <Typography variant="subtitle1" fontWeight={600}>
              {locale === 'ko' ? '연락처 정보' : 'Contact Information'}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label={locale === 'ko' ? '이메일' : 'Email'}
                  fullWidth
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="example@company.com"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={locale === 'ko' ? '사무실 전화번호' : 'Office Phone'}
                  fullWidth
                  value={profileData.phone_number}
                  onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                  placeholder="02-1234-5678"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={locale === 'ko' ? '휴대전화' : 'Mobile Phone'}
                  fullWidth
                  value={profileData.mobile_number}
                  onChange={(e) => setProfileData({ ...profileData, mobile_number: e.target.value })}
                  placeholder="010-1234-5678"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneAndroid />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ pt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleProfileUpdate}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  locale === 'ko' ? '프로필 저장' : 'Save Profile'
                )}
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={currentTab} index={1}>
          <Stack spacing={4}>
            {/* Password Change */}
            <Box>
              <Typography variant="h6" gutterBottom>
                {locale === 'ko' ? '비밀번호 변경' : 'Change Password'}
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label={locale === 'ko' ? '현재 비밀번호' : 'Current Password'}
                  type="password"
                  fullWidth
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                />
                <TextField
                  label={locale === 'ko' ? '새 비밀번호' : 'New Password'}
                  type="password"
                  fullWidth
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  helperText={locale === 'ko' ? '8자 이상 입력하세요' : 'At least 8 characters'}
                />
                <TextField
                  label={locale === 'ko' ? '새 비밀번호 확인' : 'Confirm New Password'}
                  type="password"
                  fullWidth
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
                <Box>
                  <Button
                    variant="contained"
                    onClick={handlePasswordChange}
                    disabled={loading}
                  >
                    {locale === 'ko' ? '비밀번호 변경' : 'Change Password'}
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* MFA Settings */}
            <Box>
              <Typography variant="h6" gutterBottom>
                {locale === 'ko' ? '2단계 인증 (MFA)' : 'Two-Factor Authentication (MFA)'}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={mfaEnabled}
                    onChange={(e) => handleMfaToggle(e.target.checked)}
                    disabled={loading}
                  />
                }
                label={
                  mfaEnabled
                    ? locale === 'ko' ? 'MFA 활성화됨' : 'MFA Enabled'
                    : locale === 'ko' ? 'MFA 비활성화됨' : 'MFA Disabled'
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {locale === 'ko'
                  ? '2단계 인증을 활성화하면 로그인 시 추가 보안 코드가 필요합니다.'
                  : 'Enable two-factor authentication for additional security when logging in.'}
              </Typography>
            </Box>
          </Stack>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={currentTab} index={2}>
          <Stack spacing={3}>
            <Typography variant="h6">{locale === 'ko' ? '환경 설정' : 'Preferences'}</Typography>

            {/* Language */}
            <FormControl fullWidth>
              <InputLabel>{locale === 'ko' ? '언어' : 'Language'}</InputLabel>
              <Select
                value={preferences.language}
                label={locale === 'ko' ? '언어' : 'Language'}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value as 'en' | 'ko' })}
              >
                <MenuItem value="ko">한국어 (Korean)</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>

            {/* Theme */}
            <FormControl fullWidth>
              <InputLabel>{locale === 'ko' ? '테마' : 'Theme'}</InputLabel>
              <Select
                value={preferences.theme}
                label={locale === 'ko' ? '테마' : 'Theme'}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              >
                <MenuItem value="light">{locale === 'ko' ? '라이트' : 'Light'}</MenuItem>
                <MenuItem value="dark">{locale === 'ko' ? '다크' : 'Dark'}</MenuItem>
              </Select>
            </FormControl>

            {/* Rows Per Page */}
            <FormControl fullWidth>
              <InputLabel>{locale === 'ko' ? '페이지당 행 수' : 'Rows Per Page'}</InputLabel>
              <Select
                value={preferences.rowsPerPage}
                label={locale === 'ko' ? '페이지당 행 수' : 'Rows Per Page'}
                onChange={(e) =>
                  setPreferences({ ...preferences, rowsPerPage: Number(e.target.value) })
                }
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>

            {/* Session Timeout */}
            <FormControl fullWidth>
              <InputLabel>{locale === 'ko' ? '세션 타임아웃 (분)' : 'Session Timeout (minutes)'}</InputLabel>
              <Select
                value={preferences.sessionTimeout}
                label={locale === 'ko' ? '세션 타임아웃 (분)' : 'Session Timeout (minutes)'}
                onChange={(e) =>
                  setPreferences({ ...preferences, sessionTimeout: Number(e.target.value) })
                }
              >
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={60}>60</MenuItem>
                <MenuItem value={120}>120</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            {/* Notifications */}
            <Box>
              <Typography variant="h6" gutterBottom>
                {locale === 'ko' ? '알림 설정' : 'Notifications'}
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={(e) =>
                        setPreferences({ ...preferences, emailNotifications: e.target.checked })
                      }
                    />
                  }
                  label={locale === 'ko' ? '이메일 알림' : 'Email Notifications'}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.systemNotifications}
                      onChange={(e) =>
                        setPreferences({ ...preferences, systemNotifications: e.target.checked })
                      }
                    />
                  }
                  label={locale === 'ko' ? '시스템 알림' : 'System Notifications'}
                />
              </Stack>
            </Box>

            <Box>
              <Button
                variant="contained"
                onClick={handlePreferencesUpdate}
                disabled={loading}
              >
                {locale === 'ko' ? '저장' : 'Save Preferences'}
              </Button>
            </Box>
          </Stack>
        </TabPanel>
      </Paper>
    </Box>
    </RouteGuard>
  );
}
