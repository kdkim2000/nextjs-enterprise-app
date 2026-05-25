/**
 * MUI Palette — maps tokens → MUI's expected palette shape.
 *
 * Changes from old palette.ts:
 *  - primary: was #1976d2 (MUI default blue) → now slate blue from tokens.accent[600]
 *  - secondary: was #9c27b0 (MUI default purple, never explicitly used in UI) → removed gradient,
 *    now reuses accent[400] so it doesn't introduce a third hue
 *  - status[] palette: kept (admin views use it) but values now read from tokens.status
 *  - role[] palette: kept (preserved domain model) but rebalanced to lower chroma in tokens.role
 *  - REMOVED redundant duplication between status.success/error/warning/info and
 *    palette.success/error/warning/info — they now share tokens.status
 *  - dark mode: NOW COMPLETE — error/warning/info/success are defined (previously missing)
 */

import type { PaletteOptions } from '@mui/material/styles';
import { tokens } from './tokens';

declare module '@mui/material/styles' {
  interface Palette {
    status: {
      active: string;
      inactive: string;
      pending: string;
      success: string;
      error: string;
      warning: string;
      info: string;
    };
    role: {
      admin: string;
      manager: string;
      moderator: string;
      user: string;
      guest: string;
    };
    line: {
      subtle: string;
      default: string;
      strong: string;
    };
    surface: {
      bg: string;
      canvas: string;
      sunken: string;
    };
  }

  interface TypeText {
    tertiary: string;
  }

  interface PaletteOptions {
    status?: Partial<Palette['status']>;
    role?: Partial<Palette['role']>;
    line?: Partial<Palette['line']>;
    surface?: Partial<Palette['surface']>;
  }
}

export const lightPalette: PaletteOptions = {
  mode: 'light',

  primary: {
    main: tokens.accent[600],
    light: tokens.accent[400],
    dark: tokens.accent[800],
    contrastText: tokens.ink.inverse,
  },

  // Secondary now reuses the accent scale instead of a random purple.
  // Use sparingly — most "secondary" needs should go to text.secondary or default button.
  secondary: {
    main: tokens.accent[800],
    light: tokens.accent[600],
    dark: tokens.accent[950],
    contrastText: tokens.ink.inverse,
  },

  error: {
    main: tokens.status.danger,
    light: tokens.caution[400],
    dark: tokens.caution[800],
    contrastText: tokens.ink.inverse,
  },
  warning: {
    main: tokens.status.warning,
    light: '#e8aa4e',
    dark: '#8d5500',
    contrastText: tokens.ink.primary,
  },
  info: {
    main: tokens.status.info,
    light: tokens.accent[400],
    dark: tokens.accent[800],
    contrastText: tokens.ink.inverse,
  },
  success: {
    main: tokens.status.success,
    light: '#6fb07d',
    dark: '#195c2e',
    contrastText: tokens.ink.inverse,
  },

  status: {
    active: tokens.status.success,
    inactive: tokens.status.neutral,
    pending: tokens.status.warning,
    success: tokens.status.success,
    error: tokens.status.danger,
    warning: tokens.status.warning,
    info: tokens.status.info,
  },

  role: {
    admin: tokens.role.admin,
    manager: tokens.role.manager,
    moderator: tokens.role.moderator,
    user: tokens.role.user,
    guest: tokens.role.guest,
  },

  line: {
    subtle: tokens.line.subtle,
    default: tokens.line.default,
    strong: tokens.line.strong,
  },

  surface: {
    bg: tokens.surface.bg,
    canvas: tokens.surface.canvas,
    sunken: tokens.surface.sunken,
  },

  background: {
    default: tokens.surface.bg,
    paper: tokens.surface.canvas,
  },

  text: {
    primary: tokens.ink.primary,
    secondary: tokens.ink.secondary,
    disabled: tokens.ink.disabled,
    tertiary: tokens.ink.tertiary,
  },

  divider: tokens.line.default,

  action: {
    active: tokens.ink.secondary,
    hover: 'rgba(20, 17, 13, 0.04)',
    selected: 'rgba(44, 98, 141, 0.08)',
    disabled: tokens.ink.disabled,
    disabledBackground: tokens.surface.sunken,
    focus: 'rgba(44, 98, 141, 0.16)',
  },
};

/**
 * Dark mode — previously had error/warning/success/info MISSING (theme would fall
 * back to MUI defaults and look inconsistent). All status colors are now defined.
 */
export const darkPalette: PaletteOptions = {
  mode: 'dark',

  primary: {
    main: tokens.accent[400],
    light: tokens.accent[300],
    dark: tokens.accent[600],
    contrastText: '#040301',
  },
  secondary: {
    main: tokens.accent[300],
    light: tokens.accent[200],
    dark: tokens.accent[500],
    contrastText: '#040301',
  },

  error:   { main: '#e0615c', light: '#f58b84', dark: '#ac3031', contrastText: '#040301' },
  warning: { main: '#dea143', light: '#eeba70', dark: '#a66d00', contrastText: '#040301' },
  info:    { main: tokens.accent[400],  light: tokens.accent[300],  dark: tokens.accent[600],  contrastText: '#040301' },
  success: { main: '#60a06e', light: '#7fc08c', dark: '#337344', contrastText: '#040301' },

  status: {
    active: '#60a06e',
    inactive: '#898680',
    pending: '#dea143',
    success: '#60a06e',
    error: '#e0615c',
    warning: '#dea143',
    info: tokens.accent[400],
  },

  role: {
    admin: '#d76963',
    manager: '#e28d4f',
    moderator: '#a777ca',
    user: tokens.accent[400],
    guest: '#898680',
  },

  line: {
    subtle: '#24211c',
    default: '#302d28',
    strong: '#4b4742',
  },

  surface: {
    bg: '#090704',
    canvas: '#120f0b',
    sunken: '#040301',
  },

  background: {
    default: '#090704',
    paper: '#120f0b',
  },

  text: {
    primary: '#f0eeeb',
    secondary: '#a6a4a1',
    disabled: '#5f5d5a',
    tertiary: '#73716e',
  },

  divider: '#302d28',

  action: {
    active: 'rgba(166, 164, 161, 1)',
    hover: 'rgba(240, 238, 235, 0.06)',
    selected: 'rgba(64, 119, 163, 0.16)',
    disabled: '#5f5d5a',
    disabledBackground: '#181611',
    focus: 'rgba(64, 119, 163, 0.24)',
  },
};
