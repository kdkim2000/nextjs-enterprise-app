'use client';

import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, createDynamicTheme } from '@/theme';
import { useAppSettings } from '@/hooks/useAppSettings';

/**
 * Static MUI ThemeProvider — SSR fallback in root layout.
 * No CssBaseline here; DynamicMuiThemeProvider (inside ClientProviders) owns it.
 */
export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={lightTheme}>
      {children}
    </ThemeProvider>
  );
}

/**
 * Dynamic MUI ThemeProvider — reads primary_color / secondary_color / default_theme
 * from AppSettingsContext and rebuilds the MUI theme when they change.
 *
 * Must be placed inside AppSettingsProvider. Owns CssBaseline so global resets
 * always match the active theme (light vs dark).
 */
export function DynamicMuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAppSettings();

  const theme = useMemo(() => createDynamicTheme({
    primaryColor: settings.primary_color,
    secondaryColor: settings.secondary_color,
    mode: settings.default_theme === 'dark' ? 'dark' : 'light',
  }), [settings.primary_color, settings.secondary_color, settings.default_theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
