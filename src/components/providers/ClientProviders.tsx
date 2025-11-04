'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nProviderClient } from '@/lib/i18n/client';
import { AuthProvider } from '@/contexts/AuthContext';
import { lightTheme } from '@/styles/theme';

export function ClientProviders({
  children,
  locale
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <I18nProviderClient locale={locale}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </I18nProviderClient>
  );
}
