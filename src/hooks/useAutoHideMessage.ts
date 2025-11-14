import { useState, useEffect, useCallback } from 'react';

export interface UseAutoHideMessageOptions {
  duration?: number; // in milliseconds, default 10000 (10 seconds)
}

/**
 * Hook for managing auto-hiding messages (success/error)
 * Automatically hides the message after specified duration
 */
export function useAutoHideMessage(options: UseAutoHideMessageOptions = {}) {
  const { duration = 10000 } = options;

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [successMessage, duration]);

  // Auto-hide error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, duration]);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null); // Clear error when showing success
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null); // Clear success when showing error
  }, []);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  return {
    successMessage,
    errorMessage,
    showSuccess,
    showError,
    clearMessages,
    setSuccessMessage,
    setErrorMessage
  };
}
