import { createI18nClient } from 'next-international/client';

// Client-side hooks (use in client components)
export const { useI18n, I18nProviderClient, useCurrentLocale, useChangeLocale } = createI18nClient({
  en: () => import('./locales/en'),
  ko: () => import('./locales/ko'),
  zh: () => import('./locales/zh'),
  vi: () => import('./locales/vi')
});
