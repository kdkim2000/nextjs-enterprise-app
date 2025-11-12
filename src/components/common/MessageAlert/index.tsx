'use client';

import React from 'react';
import { Alert, AlertColor, Box } from '@mui/material';

export interface MessageAlertProps {
  successMessage?: string | null;
  errorMessage?: string | null;
  warningMessage?: string | null;
  infoMessage?: string | null;
  sx?: any;
}

/**
 * MessageAlert - Standardized alert message display component
 *
 * Displays success, error, warning, or info messages with consistent styling.
 * Automatically handles null/undefined messages.
 *
 * @example
 * ```tsx
 * const { successMessage, errorMessage } = useAutoHideMessage();
 *
 * <MessageAlert
 *   successMessage={successMessage}
 *   errorMessage={errorMessage}
 * />
 * ```
 */
export default function MessageAlert({
  successMessage,
  errorMessage,
  warningMessage,
  infoMessage,
  sx = {}
}: MessageAlertProps) {
  const messages: Array<{ message: string | null | undefined; severity: AlertColor }> = [
    { message: errorMessage, severity: 'error' },
    { message: warningMessage, severity: 'warning' },
    { message: successMessage, severity: 'success' },
    { message: infoMessage, severity: 'info' }
  ];

  // Filter out null/undefined messages
  const activeMessages = messages.filter(({ message }) => message);

  if (activeMessages.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 1, flexShrink: 0, ...sx }}>
      {activeMessages.map(({ message, severity }, index) => (
        <Alert
          key={`${severity}-${index}`}
          severity={severity}
          sx={{ mb: activeMessages.length > 1 && index < activeMessages.length - 1 ? 1 : 0 }}
        >
          {message}
        </Alert>
      ))}
    </Box>
  );
}
