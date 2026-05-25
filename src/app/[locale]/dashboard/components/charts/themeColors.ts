/**
 * Recharts color palette — derived from design tokens.
 * Recharts does not read MUI theme automatically; pass these as explicit props.
 * Usage: <Bar fill={chartColors.primary[0]} />
 */
import { tokens } from '@/theme';

export const chartColors = {
  primary: [
    tokens.accent[500],
    tokens.accent[400],
    tokens.accent[300],
    tokens.accent[600],
    tokens.accent[700],
  ],
  success: tokens.status.success,
  warning: tokens.status.warning,
  danger:  tokens.status.danger,
  info:    tokens.status.info,
  neutral: tokens.status.neutral,
  grid:    tokens.line.subtle,
  text:    tokens.ink.tertiary,
} as const;
