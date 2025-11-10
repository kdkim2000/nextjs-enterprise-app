import { createTheme, ThemeOptions } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { components } from './components';

// Base theme options
const baseThemeOptions: ThemeOptions = {
  typography,
  components,

  // Spacing: 8px base unit
  spacing: 8,

  // Shape
  shape: {
    borderRadius: 8,
  },

  // Breakpoints (default MUI breakpoints)
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  // Z-index
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },

  // Transitions
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: lightPalette,
});

// Dark theme
export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: darkPalette,
});

// Default export
export default lightTheme;

// Theme type for usage in components
export type AppTheme = typeof lightTheme;
