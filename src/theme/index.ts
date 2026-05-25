/**
 * Theme entry — composes palette + typography + components into MUI themes.
 *
 * Changes from old index.ts:
 *  - spacing base: kept at 8 (compatible with all existing sx={{ p: 2 }} call sites)
 *  - shape.borderRadius: 8 → 6 (matches tokens.radius.md, applied to all components)
 *  - transitions: durations now read from tokens.motion so designers can tune in one place
 *  - exports: tokens re-exported so call sites can grab raw values when MUI's scoping
 *    doesn't reach (e.g. plain Recharts components, TipTap inline styles)
 */

import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { components } from './components';
import { tokens } from './tokens';

const baseThemeOptions: ThemeOptions = {
  typography,
  components,
  spacing: 8,
  shape: {
    borderRadius: 6, // was 8 — now matches tokens.radius.md so EVERY component is consistent
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: tokens.zIndex.header,
    drawer: tokens.zIndex.sidebar,
    modal: tokens.zIndex.modal,
    snackbar: tokens.zIndex.toast,
    tooltip: tokens.zIndex.tooltip,
  },
  transitions: {
    duration: {
      shortest: 80,    // tokens.motion.instant
      shorter: 120,
      short: 160,      // tokens.motion.smooth
      standard: 240,   // tokens.motion.deliberate
      complex: 320,
      enteringScreen: 240,
      leavingScreen: 200,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: lightPalette,
});

export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: darkPalette,
});

const isValidHex = (c?: string) => /^#[0-9a-fA-F]{3,8}$/.test(c ?? '');

export function createDynamicTheme(options: {
  primaryColor?: string;
  secondaryColor?: string;
  mode?: 'light' | 'dark';
}): Theme {
  const { primaryColor, secondaryColor, mode = 'light' } = options;
  const base = mode === 'dark' ? darkTheme : lightTheme;

  const paletteOverride: Record<string, unknown> = {};
  if (isValidHex(primaryColor)) paletteOverride.primary = { main: primaryColor };
  if (isValidHex(secondaryColor)) paletteOverride.secondary = { main: secondaryColor };

  if (Object.keys(paletteOverride).length === 0 && mode === 'light') return base;

  return createTheme(base, { palette: paletteOverride });
}

export { tokens };
export default lightTheme;
export type AppTheme = typeof lightTheme;
