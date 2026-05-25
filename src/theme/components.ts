/**
 * Component overrides — refined from MUI defaults using design tokens.
 *
 * Key changes vs old components.ts:
 *  - RADIUS UNIFIED: was 4 different radii (8/12/16/1.5). Now everything reads
 *    tokens.radius.md (6px). Cards, dialogs, buttons, inputs share the same curvature.
 *  - HOVER SHADOWS REMOVED on buttons. The old "boxShadow on hover" was distracting in
 *    an admin tool where you hover hundreds of times per session.
 *  - DataGrid: rounded corners removed (now 0), hairline borders, dense header.
 *  - TableCell: hairlines use tokens.line.default instead of rgba.
 *  - Chip / Alert: backgrounds derived from semantic palette tokens with alpha.
 *  - AppBar: NEW override. Was using primary blue full bleed → now neutral with hairline.
 *  - Drawer/Sidebar: NEW override. Sets background to surface.sunken.
 *  - ListItemButton: NEW override. Selected state uses subtle accent tint instead of
 *    solid primary fill (which made the active menu item visually dominate the canvas).
 *  - Tooltip: bg from ink.primary so it contrasts cleanly on both modes.
 *  - Focus ring globally: all focused elements get tokens.shadow.focus.
 */

import type { Components, Theme } from '@mui/material/styles';
import { tokens } from './tokens';

export const components: Components<Theme> = {
  // ----------------------------------------------------------------------
  // BASELINE — fix the Arial leak. globals.css used to set body { font-family: Arial }
  // which beat the MUI theme for any non-Typography element. We re-assert here.
  // ----------------------------------------------------------------------
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      body: {
        fontFamily: theme.typography.fontFamily,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      },
      // Make number-heavy table cells use tabular figures by default
      'td.num, .num': {
        fontVariantNumeric: 'tabular-nums',
      },
      // Global focus-visible ring
      '*:focus-visible': {
        outline: 'none',
        boxShadow: tokens.shadow.focus,
        borderRadius: tokens.radius.md,
      },
    }),
  },

  // ----------------------------------------------------------------------
  // APP BAR — was MUI default primary blue full bleed. Now neutral, hairline.
  // ----------------------------------------------------------------------
  MuiAppBar: {
    defaultProps: {
      color: 'transparent',
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }),
    },
  },

  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: tokens.layout.headerHeight,
        '@media (min-width: 600px)': {
          minHeight: tokens.layout.headerHeight,
        },
      },
    },
  },

  // ----------------------------------------------------------------------
  // DRAWER (Sidebar) — neutral sunken bg, hairline right border, no shadow
  // ----------------------------------------------------------------------
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.surface?.sunken ?? theme.palette.background.default,
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        backgroundImage: 'none',
      }),
    },
  },

  // ----------------------------------------------------------------------
  // BUTTON — radius unified, hover shadow REMOVED
  // ----------------------------------------------------------------------
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      disableRipple: false,
    },
    styleOverrides: {
      root: {
        borderRadius: tokens.radius.md,
        fontWeight: tokens.weight.medium,
        padding: '8px 16px',
        boxShadow: 'none',
        textTransform: 'none',
        transition: `background-color ${tokens.motion.smooth} ${tokens.motion.ease.out}, color ${tokens.motion.smooth} ${tokens.motion.ease.out}`,
        '&:hover': {
          boxShadow: 'none',          // ← removed shadow on hover
        },
        '&:active': {
          transform: 'translateY(0.5px)',
        },
      },
      sizeLarge: { padding: '12px 20px', fontSize: tokens.size.md },
      sizeSmall: { padding: '4px 12px', fontSize: tokens.size.sm },
      // Outlined button: hairline border
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
        '&:hover': {
          borderColor: theme.palette.text.secondary,
          backgroundColor: theme.palette.action.hover,
        },
      }),
      // Text button: no padding bloat
      text: {
        padding: '6px 10px',
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: tokens.radius.md,
        transition: `background-color ${tokens.motion.instant} linear`,
      },
    },
  },

  // ----------------------------------------------------------------------
  // CARD / PAPER — unified radius 6 (was 12), softer default shadow
  // ----------------------------------------------------------------------
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: tokens.radius.md,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        backgroundImage: 'none',
        '&:hover': {
          // No automatic hover shadow — let consumers opt in
        },
      }),
    },
  },

  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: tokens.radius.md,
        backgroundImage: 'none',
      },
      elevation1: { boxShadow: tokens.shadow.sm },
      elevation2: { boxShadow: tokens.shadow.md },
      elevation3: { boxShadow: tokens.shadow.lg },
      elevation4: { boxShadow: tokens.shadow.xl },
    },
  },

  // ----------------------------------------------------------------------
  // TEXT FIELD — radius unified, hairline border, focused state uses accent
  // ----------------------------------------------------------------------
  MuiTextField: {
    defaultProps: {
      size: 'small',
      variant: 'outlined',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: tokens.radius.md,
          backgroundColor: theme.palette.background.paper,
          '& fieldset': {
            borderColor: theme.palette.divider,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.text.secondary,
          },
          '&.Mui-focused fieldset': {
            borderWidth: 1,
            borderColor: theme.palette.primary.main,
          },
        },
      }),
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.text.secondary,
        fontSize: tokens.size.base,
      }),
    },
  },

  MuiSelect: {
    defaultProps: { size: 'small' },
    styleOverrides: {
      select: { borderRadius: tokens.radius.md },
    },
  },

  // ----------------------------------------------------------------------
  // DIALOG — radius matches the rest, soft overlay
  // ----------------------------------------------------------------------
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: tokens.radius.md,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: tokens.shadow.xl,
        backgroundImage: 'none',
      }),
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: tokens.size.lg,
        fontWeight: tokens.weight.semibold,
        padding: '20px 24px 8px',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }),
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: { padding: '20px 24px' },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: '12px 20px',
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 8,
      }),
    },
  },

  // ----------------------------------------------------------------------
  // CHIP — smaller radius, status-color aware backgrounds
  // ----------------------------------------------------------------------
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: tokens.radius.sm,
        fontWeight: tokens.weight.medium,
        fontSize: tokens.size.xs,
        height: 22,
      },
    },
  },

  // ----------------------------------------------------------------------
  // ALERT — subtle tints, hairline border
  // ----------------------------------------------------------------------
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: tokens.radius.md,
        border: '1px solid transparent',
      },
      standardSuccess: ({ theme }) => ({
        backgroundColor: 'rgba(66, 130, 82, 0.08)',
        borderColor: 'rgba(66, 130, 82, 0.24)',
        color: theme.palette.text.primary,
      }),
      standardError: ({ theme }) => ({
        backgroundColor: 'rgba(189, 65, 63, 0.08)',
        borderColor: 'rgba(189, 65, 63, 0.24)',
        color: theme.palette.text.primary,
      }),
      standardWarning: ({ theme }) => ({
        backgroundColor: 'rgba(189, 130, 26, 0.08)',
        borderColor: 'rgba(189, 130, 26, 0.24)',
        color: theme.palette.text.primary,
      }),
      standardInfo: ({ theme }) => ({
        backgroundColor: 'rgba(44, 98, 141, 0.08)',
        borderColor: 'rgba(44, 98, 141, 0.24)',
        color: theme.palette.text.primary,
      }),
    },
  },

  // ----------------------------------------------------------------------
  // TOOLTIP — dark ink bg, readable on both light & dark modes
  // ----------------------------------------------------------------------
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: tokens.ink.primary,
        color: tokens.ink.inverse,
        borderRadius: tokens.radius.sm,
        fontSize: tokens.size.xs,
        fontWeight: tokens.weight.medium,
        padding: '6px 10px',
      },
      arrow: { color: tokens.ink.primary },
    },
  },

  // ----------------------------------------------------------------------
  // MENU / MENU ITEM
  // ----------------------------------------------------------------------
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: tokens.radius.md,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: tokens.shadow.lg,
        backgroundImage: 'none',
      }),
      list: { padding: 4 },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: tokens.radius.sm,
        margin: '1px 4px',
        fontSize: tokens.size.base,
        minHeight: 36,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,
          fontWeight: tokens.weight.medium,
          '&:hover': {
            backgroundColor: theme.palette.action.selected,
          },
        },
      }),
    },
  },

  // ----------------------------------------------------------------------
  // LIST (Sidebar uses this) — selected state is now subtle accent tint,
  // not solid primary fill. Plus a 2px left accent rule for the selected row.
  // ----------------------------------------------------------------------
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: tokens.radius.sm,
        minHeight: 36,
        paddingLeft: 12,
        paddingRight: 12,
        position: 'relative',
        '&:hover': { backgroundColor: theme.palette.action.hover },
        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,
          color: theme.palette.primary.main,
          '&:hover': { backgroundColor: theme.palette.action.selected },
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: -4,
            top: 6,
            bottom: 6,
            width: 2,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1,
          },
        },
      }),
    },
  },

  MuiListItemIcon: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.text.secondary,
        minWidth: 32,
      }),
    },
  },

  // ----------------------------------------------------------------------
  // TABS — thinner indicator, no rounded indicator caps
  // ----------------------------------------------------------------------
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: 40 },
      indicator: {
        height: 2,
        borderRadius: 0,
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: tokens.weight.medium,
        fontSize: tokens.size.base,
        minHeight: 40,
        padding: '8px 14px',
      },
    },
  },

  // ----------------------------------------------------------------------
  // TABLE — hairlines from divider token, dense header
  // ----------------------------------------------------------------------
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontSize: tokens.size.base,
        padding: '10px 14px',
      }),
      head: ({ theme }) => ({
        fontWeight: tokens.weight.semibold,
        fontSize: tokens.size.xs,
        textTransform: 'uppercase',
        letterSpacing: tokens.tracking.widest,
        color: theme.palette.text.secondary,
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${theme.palette.line?.strong ?? theme.palette.divider}`,
      }),
    },
  },

  // ----------------------------------------------------------------------
  // DATA GRID — radius removed (sharp data table), hairlines, dense header
  // Premium overrides go through MuiDataGrid root class.
  // ----------------------------------------------------------------------
  // @ts-expect-error — MuiDataGrid is from X package, not in core Components<Theme>
  MuiDataGrid: {
    defaultProps: {
      density: 'compact',
      disableColumnMenu: false,
    },
    styleOverrides: {
      root: ({ theme }: any) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 0,            // ← was 12, now sharp
        backgroundColor: theme.palette.background.paper,
        '& .MuiDataGrid-cell': {
          borderColor: theme.palette.divider,
          fontSize: tokens.size.base,
        },
        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
          outline: 'none',
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: theme.palette.surface?.sunken ?? 'transparent',
          borderBottom: `1px solid ${theme.palette.line?.strong ?? theme.palette.divider}`,
          borderRadius: 0,
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: tokens.weight.semibold,
          fontSize: tokens.size.xs,
          textTransform: 'uppercase',
          letterSpacing: tokens.tracking.widest,
          color: theme.palette.text.secondary,
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: `1px solid ${theme.palette.divider}`,
        },
      }),
    },
  },

  // ----------------------------------------------------------------------
  // SWITCH — flatter, no shadow on thumb
  // ----------------------------------------------------------------------
  MuiSwitch: {
    styleOverrides: {
      root: { padding: 8 },
      track: { borderRadius: 10, opacity: 1, backgroundColor: tokens.line.strong },
      thumb: { boxShadow: 'none' },
    },
  },

  // ----------------------------------------------------------------------
  // ACCORDION — sharp, hairline
  // ----------------------------------------------------------------------
  MuiAccordion: {
    defaultProps: { disableGutters: true, elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 0,
        border: 'none',
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        '&:before': { display: 'none' },
        '&:last-of-type': {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      }),
    },
  },

  // ----------------------------------------------------------------------
  // BADGE / BREADCRUMBS / STEPPER
  // ----------------------------------------------------------------------
  MuiBadge: {
    styleOverrides: {
      badge: { fontWeight: tokens.weight.semibold, fontSize: tokens.size.xs },
    },
  },

  MuiBreadcrumbs: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: tokens.size.xs,
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: tokens.tracking.widest,
      }),
      separator: { marginLeft: 8, marginRight: 8 },
    },
  },

  MuiStepLabel: {
    styleOverrides: {
      label: { fontWeight: tokens.weight.medium },
    },
  },

  // ----------------------------------------------------------------------
  // LINK
  // ----------------------------------------------------------------------
  MuiLink: {
    defaultProps: { underline: 'hover' },
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.primary.main,
        textUnderlineOffset: 3,
      }),
    },
  },
};
