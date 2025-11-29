'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale } from '@/lib/i18n/client';
import DashboardHeader from '@/components/layout/DashboardHeader';
import Sidebar from '@/components/layout/Sidebar';
import AutoLogoutWarning from '@/components/common/AutoLogoutWarning';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'manager' | 'user';
  showAutoLogoutWarning?: boolean;
  /** When true, removes padding and scroll from content wrapper - children manage their own layout */
  fullBleed?: boolean;
}

export default function AuthenticatedLayout({
  children,
  requireRole,
  showAutoLogoutWarning = false,
  fullBleed = false
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <DashboardHeader onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar expanded={sidebarExpanded} />

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0
          }}
        >
          {fullBleed ? (
            // Full bleed mode: children manage their own scroll and padding
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {children}
            </Box>
          ) : (
            // Default mode: wrapper provides scroll and padding
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                px: 2,
                py: 2
              }}
            >
              {children}
            </Box>
          )}
        </Box>
      </Box>

      {showAutoLogoutWarning && <AutoLogoutWarning />}
    </Box>
  );
}
