import { createI18nServer } from 'next-international/server';

// Server-side utilities (use in server components)
export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } = createI18nServer({
  en: () => import('./locales/en'),
  ko: () => import('./locales/ko')
});
