'use client';

import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import MobileLayout from '@/components/layout/MobileLayout';
import AutoLogoutWarning from '@/components/common/AutoLogoutWarning';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'manager' | 'user';
  showAutoLogoutWarning?: boolean;
  /** When true, removes padding and scroll from content wrapper - children manage their own layout */
  fullBleed?: boolean;
}

export default function ResponsiveLayout({
  children,
  requireRole,
  showAutoLogoutWarning = false,
  fullBleed = false
}: ResponsiveLayoutProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isMobileLayout } = useMobile();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!isLoading && isAuthenticated && requireRole) {
      if (requireRole === 'admin' && user?.role !== 'admin') {
        router.push(`/${locale}/dashboard`);
        return;
      }
      if (requireRole === 'manager' && user?.role !== 'admin' && user?.role !== 'manager') {
        router.push(`/${locale}/dashboard`);
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, locale, requireRole]);

  // Show loading or check role requirements
  const shouldShowLoading = isLoading || !isAuthenticated ||
    (requireRole === 'admin' && user?.role !== 'admin') ||
    (requireRole === 'manager' && user?.role !== 'admin' && user?.role !== 'manager');

  if (shouldShowLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Mobile layout (< 900px)
  if (isMobileLayout) {
    return (
      <>
        <MobileLayout>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              ...(fullBleed ? {} : { px: 2, py: 2 }),
            }}
          >
            {children}
          </Box>
        </MobileLayout>
        {showAutoLogoutWarning && <AutoLogoutWarning />}
      </>
    );
  }

  // Desktop layout (>= 900px)
  return (
    <AuthenticatedLayout
      requireRole={requireRole}
      showAutoLogoutWarning={showAutoLogoutWarning}
      fullBleed={fullBleed}
    >
      {children}
    </AuthenticatedLayout>
  );
}
