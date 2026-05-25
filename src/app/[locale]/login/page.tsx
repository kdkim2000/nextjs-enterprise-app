'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { getEpTrayLoginId } from '@/lib/eptray';

import BrandPanel from './components/BrandPanel';
import LoginStep from './components/LoginStep';
import MfaStep from './components/MfaStep';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const { login, verifyMFA, ssoLogin, isAuthenticated } = useAuth();

  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);

  // MFA state
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  // Auto-login dedup guard
  const autoLoginAttempted = useRef(false);

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setLoginError(null);
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } };
      const errorMessage = anyErr.message || anyErr.response?.data?.message || t('auth.ssoLoginFailed');
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // EpTray auto-login
  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    if (autoLoginAttempted.current) {
      return;
    }

    const attemptAutoSSO = async () => {
      autoLoginAttempted.current = true;

      try {
        const eptrayLoginId = await getEpTrayLoginId();

        if (eptrayLoginId) {
          await handleSSOLogin(eptrayLoginId);
          return;
        }

        const sso = searchParams.get('sso');
        const loginid = searchParams.get('loginid');

        if (sso === 'true' && loginid) {
          await handleSSOLogin(loginid);
        }
      } catch {
        setTimeout(() => {
          autoLoginAttempted.current = false;
        }, 5000);
      }
    };

    attemptAutoSSO();
  }, [isAuthenticated, searchParams, handleSSOLogin, router, locale]);

  // Called by LoginStep when credentials are submitted
  const handleLoginSuccess = async (credentials: { username: string; password: string }) => {
    setLoginError(null);
    setLoading(true);

    try {
      const result = await login(credentials.username, credentials.password);

      if (result.mfaRequired) {
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
        setStep('mfa');
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setLoginError(anyErr.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  // Called by LoginStep's SSO button — delegated back here since page owns SSO logic
  const handleSSO = async () => {
    setLoginError(null);
    setLoading(true);

    try {
      const eptrayLoginId = await getEpTrayLoginId();

      if (eptrayLoginId) {
        await handleSSOLogin(eptrayLoginId);
      } else {
        const loginid = searchParams.get('loginid');
        if (loginid) {
          await handleSSOLogin(loginid);
        } else {
          setLoginError('SSO login requires loginid parameter');
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } };
      const errorMessage = anyErr.message || anyErr.response?.data?.message || 'SSO login failed';
      setLoginError(errorMessage);
      setLoading(false);
    }
  };

  // Called by MfaStep to verify the OTP code
  const verifyMfaCode = async (code: string) => {
    setMfaError(null);
    await verifyMFA(mfaUserId, code);
  };

  // Called by MfaStep on successful verification
  const handleMfaSuccess = () => {
    router.push(`/${locale}/dashboard`);
  };

  // Called by MfaStep to resend the code — re-invoke login with stored creds isn't available
  // so we go back to login step to let user re-login (triggers new MFA send)
  const handleResendMfa = () => {
    setStep('login');
    setMfaError(null);
  };

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <BrandPanel />

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 4, md: 8 },
      }}>
        {step === 'login' && (
          <LoginStep
            onSuccess={handleLoginSuccess}
            onSsoClick={handleSSO}
            isLoading={loading}
            error={loginError}
          />
        )}
        {step === 'mfa' && (
          <MfaStep
            onSuccess={handleMfaSuccess}
            onResend={handleResendMfa}
            verifyMfa={verifyMfaCode}
            isLoading={loading}
            error={mfaError}
            email={mfaEmail}
            devCode={devCode}
          />
        )}
      </Box>
    </Box>
  );
}
