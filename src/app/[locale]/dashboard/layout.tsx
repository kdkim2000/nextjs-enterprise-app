'use client';

import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import { Menu as MenuIcon, Logout } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useChangeLocale } from '@/lib/i18n/client';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/common/Footer';
import AutoLogoutWarning from '@/components/common/AutoLogoutWarning';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const changeLocale = useChangeLocale();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ko' : 'en';
    changeLocale(newLocale);
  };

  if (isLoading || !isAuthenticated) {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Enterprise App
          </Typography>

          <Button color="inherit" onClick={toggleLanguage} sx={{ mr: 2 }}>
            {locale.toUpperCase()}
          </Button>

          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>

          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            ml: sidebarExpanded ? 0 : `-${DRAWER_WIDTH - DRAWER_WIDTH_COLLAPSED}px`,
          }}
        >
          {children}
        </Box>
      </Box>

      <Footer />
      <AutoLogoutWarning />
    </Box>
  );
}
