'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChangeLocale, useCurrentLocale } from '@/lib/i18n/client';
import { isLanguageSupported, type LanguageCode } from '@/lib/i18n/languages';
import { authApi } from '@/lib/axios';

/**
 * LanguageLoader - Automatically loads and applies user's preferred language after login
 *
 * This component:
 * 1. Loads user preferences from backend after login
 * 2. Auto-applies the saved language preference
 * 3. Runs only once per authentication state change
 */
export default function LanguageLoader() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const currentLocale = useCurrentLocale();
  const changeLocale = useChangeLocale();

  useEffect(() => {
    const loadUserLanguage = async () => {
      // Only proceed if user is authenticated and not loading
      if (!isAuthenticated || !user || isLoading) {
        return;
      }

      // Additional safety check: ensure accessToken exists
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('[LanguageLoader] No access token found, skipping preference load');
          return;
        }
      }

      try {
        // Fetch user preferences from backend (auth-service)
        // Note: authApi.get() already returns response.data
        const response = await authApi.get('/auth/user-settings');

        // Extract settings from response - settings.general.language
        const { settings } = response;

        // Check if user has a saved language preference
        if (settings?.general?.language) {
          const savedLanguage = settings.general.language;

          // Only change if different from current and is a supported language
          if (savedLanguage !== currentLocale && isLanguageSupported(savedLanguage)) {
            console.log(`[LanguageLoader] Auto-applying saved language: ${savedLanguage}`);
            changeLocale(savedLanguage as 'en' | 'ko' | 'zh' | 'vi');
          }
        }
      } catch (error: any) {
        // Handle authentication errors silently (expected when not authenticated)
        // Only log non-auth errors for debugging
        if (error?.response?.status !== 403 && error?.response?.status !== 401) {
          console.error('[LanguageLoader] Failed to load user preferences:', {
            error: error?.message,
            status: error?.response?.status
          });
        }
        // Fail silently - don't block user experience
      }
    };

    // Load language after authentication
    loadUserLanguage();
  }, [isAuthenticated, user?.id, isLoading]); // Only re-run when auth state changes

  // This component doesn't render anything
  return null;
}
