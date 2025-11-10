'use client';

import React from 'react';
import { Alert as MuiAlert, AlertTitle, AlertProps as MuiAlertProps, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

export interface AlertProps extends Omit<MuiAlertProps, 'variant'> {
  type?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'standard';
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function Alert({
  type = 'info',
  title,
  message,
  variant = 'standard',
  closable = false,
  onClose,
  icon,
  action,
  ...rest
}: AlertProps) {
  return (
    <MuiAlert
      severity={type}
      variant={variant}
      icon={icon}
      action={
        action || (closable && onClose && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <Close fontSize="inherit" />
          </IconButton>
        ))
      }
      {...rest}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </MuiAlert>
  );
}
