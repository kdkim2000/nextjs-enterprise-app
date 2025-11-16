'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nProviderClient } from '@/lib/i18n/client';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { MenuProvider } from '@/contexts/MenuContext';
import LanguageLoader from './LanguageLoader';
import { lightTheme } from '@/theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        <AuthProvider>
          <LanguageLoader />
          <PermissionProvider>
            <MenuProvider>
              {children}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </MenuProvider>
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProviderClient>
  );
}
