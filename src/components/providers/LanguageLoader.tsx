'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChangeLocale, useCurrentLocale } from '@/lib/i18n/client';
import { isLanguageSupported, type LanguageCode } from '@/lib/i18n/languages';
import { api } from '@/lib/axios';

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

      try {
        // Fetch user preferences from backend
        const response = await api.get('/user/preferences');
        const { preferences } = response;

        // Check if user has a saved language preference
        if (preferences?.language) {
          const savedLanguage = preferences.language;

          // Only change if different from current and is a supported language
          if (savedLanguage !== currentLocale && isLanguageSupported(savedLanguage)) {
            console.log(`[LanguageLoader] Auto-applying saved language: ${savedLanguage}`);
            changeLocale(savedLanguage as LanguageCode);
          }
        }
      } catch (error) {
        console.error('[LanguageLoader] Failed to load user preferences:', error);
        // Fail silently - don't block user experience
      }
    };

    // Load language after authentication
    loadUserLanguage();
  }, [isAuthenticated, user?.id, isLoading]); // Only re-run when auth state changes

  // This component doesn't render anything
  return null;
}
