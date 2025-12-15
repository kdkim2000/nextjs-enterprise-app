'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function LoginPage() {
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile, isMobileLayout } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin();
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.ssoLoginFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
