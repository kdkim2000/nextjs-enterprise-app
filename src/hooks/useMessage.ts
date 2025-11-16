import { useState, useCallback, useRef } from 'react';
import { api } from '@/lib/axios';
import { useAutoHideMessage } from './useAutoHideMessage';
import { MultiLangField } from '@/lib/i18n/multiLang';

interface Message {
  id: string;
  code: string;
  category: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: MultiLangField;
  description: MultiLangField;
  status: 'active' | 'inactive';
}

interface UseMessageOptions {
  duration?: number; // Auto-hide duration in milliseconds
  locale?: string; // Default locale
}

/**
 * Unified message management hook
 * Provides centralized message retrieval and display
 */
export function useMessage(options: UseMessageOptions = {}) {
  const { duration = 10000, locale: defaultLocale = 'en' } = options;

  // Use existing auto-hide message hook
  const {
    successMessage,
    errorMessage,
    showSuccess,
    showError,
    clearMessages,
    setSuccessMessage,
    setErrorMessage
  } = useAutoHideMessage({ duration });

  // Cache for messages to avoid repeated API calls
  const messageCache = useRef<Map<string, Message>>(new Map());
  const [loading, setLoading] = useState(false);

  /**
   * Fetch message by code from API
   */
  const fetchMessage = useCallback(async (code: string): Promise<Message | null> => {
    try {
      // Check cache first
      if (messageCache.current.has(code)) {
        return messageCache.current.get(code)!;
      }

      // Fetch from API
      const message = await api.get<Message>(`/message/code/${code}`);

      // Cache the message
      messageCache.current.set(code, message);

      return message;
    } catch (error) {
      console.error(`Failed to fetch message with code: ${code}`, error);
      return null;
    }
  }, []);

  /**
   * Replace placeholders in message text with actual values
   * Example: "Successfully deleted {count} user(s)" with {count: 5} => "Successfully deleted 5 user(s)"
   */
  const replacePlaceholders = useCallback((text: string, params?: Record<string, any>): string => {
    if (!params) return text;

    return Object.entries(params).reduce((result, [key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      return result.replace(regex, String(value));
    }, text);
  }, []);

  /**
   * Get message text by code
   * @param code Message code (e.g., 'CRUD_USER_CREATE_SUCCESS')
   * @param params Optional parameters to replace in message
   * @param locale Language code (en, ko, zh, vi)
   * @returns Localized message text or fallback
   */
  const getMessage = useCallback(async (
    code: string,
    params?: Record<string, any>,
    locale: string = defaultLocale
  ): Promise<string> => {
    try {
      const message = await fetchMessage(code);

      if (!message) {
        // Fallback to code if message not found
        return code;
      }

      // Get localized message
      let text = message.message[locale as keyof MultiLangField] ||
                 message.message.en ||
                 code;

      // Replace placeholders if params provided
      if (params) {
        text = replacePlaceholders(text, params);
      }

      return text;
    } catch (error) {
      console.error(`Error getting message: ${code}`, error);
      return code;
    }
  }, [defaultLocale, fetchMessage, replacePlaceholders]);

  /**
   * Show message with auto-hide
   * @param code Message code
   * @param type Message type (success or error)
   * @param params Optional parameters to replace in message
   * @param locale Language code
   */
  const showMessage = useCallback(async (
    code: string,
    type: 'success' | 'error' = 'success',
    params?: Record<string, any>,
    locale: string = defaultLocale
  ): Promise<void> => {
    setLoading(true);
    try {
      const text = await getMessage(code, params, locale);

      if (type === 'success') {
        showSuccess(text);
      } else {
        showError(text);
      }
    } catch (error) {
      console.error('Error showing message:', error);
      showError('An error occurred');
    } finally {
      setLoading(false);
    }
  }, [defaultLocale, getMessage, showSuccess, showError]);

  /**
   * Show success message by code
   */
  const showSuccessMessage = useCallback(async (
    code: string,
    params?: Record<string, any>,
    locale: string = defaultLocale
  ): Promise<void> => {
    await showMessage(code, 'success', params, locale);
  }, [defaultLocale, showMessage]);

  /**
   * Show error message by code
   */
  const showErrorMessage = useCallback(async (
    code: string,
    params?: Record<string, any>,
    locale: string = defaultLocale
  ): Promise<void> => {
    await showMessage(code, 'error', params, locale);
  }, [defaultLocale, showMessage]);

  /**
   * Clear message cache (useful after updating messages in admin)
   */
  const clearCache = useCallback(() => {
    messageCache.current.clear();
  }, []);

  /**
   * Preload messages (useful for frequently used messages)
   */
  const preloadMessages = useCallback(async (codes: string[]): Promise<void> => {
    await Promise.all(codes.map(code => fetchMessage(code)));
  }, [fetchMessage]);

  return {
    // Message retrieval
    getMessage,

    // Message display (with auto-hide)
    showMessage,
    showSuccessMessage,
    showErrorMessage,

    // Current displayed messages
    successMessage,
    errorMessage,

    // Message state management
    clearMessages,
    setSuccessMessage,
    setErrorMessage,

    // Cache management
    clearCache,
    preloadMessages,

    // Loading state
    loading,

    // Legacy support - direct show functions (for backward compatibility)
    showSuccess,
    showError
  };
}
