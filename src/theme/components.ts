import { Components, Theme } from '@mui/material/styles';

export const components: Components<Theme> & Record<string, any> = {
  // Button
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        padding: '8px 16px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
      sizeLarge: {
        padding: '12px 24px',
        fontSize: '1rem',
      },
      sizeSmall: {
        padding: '4px 12px',
        fontSize: '0.8125rem',
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },

  // IconButton
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },

  // Card
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.10)',
        },
      },
    },
  },

  // Paper
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      },
    },
  },

  // TextField
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
    defaultProps: {
      size: 'small',
      variant: 'outlined',
    },
  },

  // Dialog
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },

  // Chip
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },

  // Alert
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      standardSuccess: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
      },
      standardError: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
      },
      standardWarning: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
      },
      standardInfo: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
      },
    },
  },

  // Tooltip
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '8px 12px',
      },
    },
  },

  // Menu
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      },
    },
  },

  // MenuItem
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '4px 8px',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
        },
      },
    },
  },

  // Select
  MuiSelect: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      select: {
        borderRadius: 8,
      },
    },
  },

  // Switch
  MuiSwitch: {
    styleOverrides: {
      root: {
        padding: 8,
      },
      track: {
        borderRadius: 12,
      },
      thumb: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
    },
  },

  // Tabs
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 48,
      },
      indicator: {
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },

  // Tab
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        minHeight: 48,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },

  // Table
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
      },
      head: {
        fontWeight: 600,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      },
    },
  },

  // DataGrid
  MuiDataGrid: {
    styleOverrides: {
      root: {
        border: 'none',
        borderRadius: 12,
        '& .MuiDataGrid-cell': {
          borderColor: 'rgba(224, 224, 224, 0.8)',
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px 12px 0 0',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 600,
        },
      },
    },
  },

  // Accordion
  MuiAccordion: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        '&:before': {
          display: 'none',
        },
        '&:first-of-type': {
          borderRadius: 12,
        },
        '&:last-of-type': {
          borderRadius: 12,
        },
      },
    },
  },

  // Badge
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: 600,
      },
    },
  },

  // Breadcrumbs
  MuiBreadcrumbs: {
    styleOverrides: {
      separator: {
        marginLeft: 12,
        marginRight: 12,
      },
    },
  },

  // Stepper
  MuiStepLabel: {
    styleOverrides: {
      label: {
        fontWeight: 500,
      },
    },
  },
};
