'use client';

import React from 'react';
import { Alert, AlertColor, Box } from '@mui/material';

type MessageType = string | { code?: string; message: string; timestamp?: string } | null;

export interface MessageAlertProps {
  successMessage?: MessageType;
  errorMessage?: MessageType;
  warningMessage?: MessageType;
  infoMessage?: MessageType;
  sx?: any;
}

/**
 * Helper function to extract message string from various formats
 */
function getMessageString(message: MessageType): string | null {
  if (!message) return null;
  if (typeof message === 'string') return message;
  if (typeof message === 'object' && 'message' in message) return message.message;
  return null;
}

/**
 * MessageAlert - Standardized alert message display component
 *
 * Displays success, error, warning, or info messages with consistent styling.
 * Automatically handles null/undefined messages and message objects.
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
  const messages: Array<{ message: MessageType; severity: AlertColor }> = [
    { message: errorMessage, severity: 'error' },
    { message: warningMessage, severity: 'warning' },
    { message: successMessage, severity: 'success' },
    { message: infoMessage, severity: 'info' }
  ];

  // Filter out null/undefined messages and convert to strings
  const activeMessages = messages
    .map(({ message, severity }) => ({
      message: getMessageString(message),
      severity
    }))
    .filter(({ message }) => message);

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
