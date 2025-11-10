import { PaletteOptions } from '@mui/material/styles';

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
  }

  interface PaletteOptions {
    status?: {
      active?: string;
      inactive?: string;
      pending?: string;
      success?: string;
      error?: string;
      warning?: string;
      info?: string;
    };
    role?: {
      admin?: string;
      manager?: string;
      moderator?: string;
      user?: string;
      guest?: string;
    };
  }
}

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#fff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#fff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },

  // Custom status colors
  status: {
    active: '#4caf50',
    inactive: '#9e9e9e',
    pending: '#ff9800',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  },

  // Custom role colors
  role: {
    admin: '#d32f2f',
    manager: '#f57c00',
    moderator: '#7b1fa2',
    user: '#1976d2',
    guest: '#616161',
  },

  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },

  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },

  divider: 'rgba(0, 0, 0, 0.12)',
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  secondary: {
    main: '#ce93d8',
    light: '#f3e5f5',
    dark: '#ab47bc',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },

  // Custom colors remain the same
  status: {
    active: '#66bb6a',
    inactive: '#bdbdbd',
    pending: '#ffa726',
    success: '#66bb6a',
    error: '#ef5350',
    warning: '#ffa726',
    info: '#42a5f5',
  },

  role: {
    admin: '#ef5350',
    manager: '#ff9800',
    moderator: '#ab47bc',
    user: '#42a5f5',
    guest: '#9e9e9e',
  },

  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },

  text: {
    primary: '#fff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },

  divider: 'rgba(255, 255, 255, 0.12)',
};
