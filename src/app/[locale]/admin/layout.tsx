'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const locale = useCurrentLocale();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      router.push(`/${locale}/dashboard`);
      return;
    }
  }, [isAuthenticated, isLoading, user, router, locale]);

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
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

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar expanded={sidebarExpanded} />

        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0
          }}
        >
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
          <DashboardFooter />
        </Box>
      </Box>
    </Box>
  );
}
