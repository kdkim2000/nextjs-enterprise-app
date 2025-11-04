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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const changeLocale = useChangeLocale();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setSidebarOpen(true)}
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

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box component="main" sx={{ flex: 1, p: 3 }}>
        {children}
      </Box>

      <Footer />
      <AutoLogoutWarning />
    </Box>
  );
}
