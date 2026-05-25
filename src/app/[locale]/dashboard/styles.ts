// Modern Dashboard Design System
import { SxProps, Theme } from '@mui/material';

// Color Palette - Modern & Soft
export const COLORS = {
  primary: '#6366f1',      // Indigo
  secondary: '#8b5cf6',    // Purple
  success: '#10b981',      // Emerald
  warning: '#f59e0b',      // Amber
  error: '#ef4444',        // Red
  info: '#3b82f6',         // Blue

  // Chart Colors - Gradient friendly
  chart: [
    '#6366f1',  // Indigo
    '#8b5cf6',  // Purple
    '#ec4899',  // Pink
    '#f43f5e',  // Rose
    '#f59e0b',  // Amber
    '#10b981',  // Emerald
    '#06b6d4',  // Cyan
    '#3b82f6',  // Blue
  ],

  // Status Colors
  status: {
    active: '#10b981',
    inactive: '#94a3b8',
    pending: '#f59e0b',
    suspended: '#ef4444'
  },

  // Background gradients
  gradients: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    teal: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
  }
};

// Card Styles
export const cardStyle: SxProps<Theme> = {
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  overflow: 'hidden',
};

export const cardContentStyle: SxProps<Theme> = {
  p: 2.5,
  '&:last-child': { pb: 2.5 }
};

// Chart Common Styles
export const chartTooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  border: 'none',
  borderRadius: 12,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  padding: '12px 16px'
};

export const chartGridStyle = {
  stroke: '#f1f5f9',
  strokeDasharray: 'none'
};

// Typography Styles
export const titleStyle: SxProps<Theme> = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'text.secondary',
  letterSpacing: '0.025em',
  textTransform: 'uppercase' as const
};

export const valueStyle: SxProps<Theme> = {
  fontSize: '1.75rem',
  fontWeight: 700,
  letterSpacing: '-0.025em',
  lineHeight: 1.2
};

export const subtitleStyle: SxProps<Theme> = {
  fontSize: '0.75rem',
  color: 'text.secondary',
  fontWeight: 500
};
