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
    light: 'oklch(0.78 0.13 75)',
    dark: 'oklch(0.50 0.13 75)',
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
    light: 'oklch(0.70 0.10 150)',
    dark: 'oklch(0.42 0.10 150)',
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
  },

  divider: tokens.line.default,

  action: {
    active: tokens.ink.secondary,
    hover: 'oklch(0.18 0.01 80 / 0.04)',
    selected: 'oklch(0.48 0.09 245 / 0.08)',
    disabled: tokens.ink.disabled,
    disabledBackground: tokens.surface.sunken,
    focus: 'oklch(0.48 0.09 245 / 0.16)',
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
    contrastText: 'oklch(0.10 0.01 80)',
  },
  secondary: {
    main: tokens.accent[300],
    light: tokens.accent[200],
    dark: tokens.accent[500],
    contrastText: 'oklch(0.10 0.01 80)',
  },

  error:   { main: 'oklch(0.65 0.16 25)', light: 'oklch(0.75 0.13 25)', dark: 'oklch(0.50 0.16 25)' },
  warning: { main: 'oklch(0.75 0.13 75)', light: 'oklch(0.82 0.11 75)', dark: 'oklch(0.58 0.13 75)' },
  info:    { main: tokens.accent[400],     light: tokens.accent[300],   dark: tokens.accent[600] },
  success: { main: 'oklch(0.65 0.10 150)', light: 'oklch(0.75 0.10 150)', dark: 'oklch(0.50 0.10 150)' },

  status: {
    active: 'oklch(0.65 0.10 150)',
    inactive: 'oklch(0.62 0.01 80)',
    pending: 'oklch(0.75 0.13 75)',
    success: 'oklch(0.65 0.10 150)',
    error: 'oklch(0.65 0.16 25)',
    warning: 'oklch(0.75 0.13 75)',
    info: tokens.accent[400],
  },

  role: {
    admin: 'oklch(0.65 0.14 25)',
    manager: 'oklch(0.72 0.13 55)',
    moderator: 'oklch(0.65 0.13 310)',
    user: tokens.accent[400],
    guest: 'oklch(0.62 0.01 80)',
  },

  line: {
    subtle: 'oklch(0.25 0.01 80)',
    default: 'oklch(0.30 0.01 80)',
    strong: 'oklch(0.40 0.01 80)',
  },

  surface: {
    bg: 'oklch(0.13 0.01 80)',
    canvas: 'oklch(0.17 0.01 80)',
    sunken: 'oklch(0.10 0.01 80)',
  },

  background: {
    default: 'oklch(0.13 0.01 80)',
    paper: 'oklch(0.17 0.01 80)',
  },

  text: {
    primary: 'oklch(0.95 0.005 80)',
    secondary: 'oklch(0.72 0.005 80)',
    disabled: 'oklch(0.48 0.005 80)',
  },

  divider: 'oklch(0.30 0.01 80)',

  action: {
    active: 'oklch(0.72 0.005 80)',
    hover: 'oklch(0.95 0.005 80 / 0.06)',
    selected: 'oklch(0.55 0.09 245 / 0.16)',
    disabled: 'oklch(0.48 0.005 80)',
    disabledBackground: 'oklch(0.20 0.01 80)',
    focus: 'oklch(0.55 0.09 245 / 0.24)',
  },
};
