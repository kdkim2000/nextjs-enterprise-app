'use client';

import React from 'react';
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps, styled } from '@mui/material';

export interface TooltipProps extends Omit<MuiTooltipProps, 'title'> {
  /**
   * Tooltip content
   */
  title: React.ReactNode;

  /**
   * Element to attach tooltip to
   */
  children: React.ReactElement;

  /**
   * Tooltip placement
   */
  placement?: MuiTooltipProps['placement'];

  /**
   * Arrow indicator
   */
  arrow?: boolean;

  /**
   * Delay before showing (ms)
   */
  enterDelay?: number;

  /**
   * Delay before hiding (ms)
   */
  leaveDelay?: number;

  /**
   * Max width of tooltip
   */
  maxWidth?: number | string;

  /**
   * Variant style
   */
  variant?: 'default' | 'light' | 'dark';
}

const StyledTooltip = styled(
  ({ className, variant, maxWidth, ...props }: TooltipProps & { className?: string }) => (
    <MuiTooltip {...props} classes={{ popper: className }} />
  )
)(({ theme, variant = 'default', maxWidth = 300 }) => ({
  '& .MuiTooltip-tooltip': {
    maxWidth: maxWidth,
    fontSize: theme.typography.pxToRem(13),
    ...(variant === 'light' && {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.text.primary,
      boxShadow: theme.shadows[3],
      border: `1px solid ${theme.palette.divider}`
    }),
    ...(variant === 'dark' && {
      backgroundColor: theme.palette.grey[900],
      color: theme.palette.common.white
    }),
    ...(variant === 'default' && {
      backgroundColor: theme.palette.grey[700],
      color: theme.palette.common.white
    })
  },
  '& .MuiTooltip-arrow': {
    ...(variant === 'light' && {
      color: theme.palette.common.white,
      '&::before': {
        border: `1px solid ${theme.palette.divider}`
      }
    }),
    ...(variant === 'dark' && {
      color: theme.palette.grey[900]
    }),
    ...(variant === 'default' && {
      color: theme.palette.grey[700]
    })
  }
}));

export default function Tooltip({
  title,
  children,
  placement = 'top',
  arrow = true,
  enterDelay = 200,
  leaveDelay = 0,
  maxWidth = 300,
  variant = 'default',
  ...rest
}: TooltipProps) {
  // Don't render tooltip if title is empty
  if (!title) {
    return children;
  }

  return (
    <StyledTooltip
      title={title}
      placement={placement}
      arrow={arrow}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      maxWidth={maxWidth}
      variant={variant}
      {...rest}
    >
      {children}
    </StyledTooltip>
  );
}

// Convenience exports for common variants
export const LightTooltip = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="light" />
);

export const DarkTooltip = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="dark" />
);
