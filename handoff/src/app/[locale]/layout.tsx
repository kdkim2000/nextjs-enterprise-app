/**
 * Per-locale layout — sets <html lang> so globals.css :lang() rules apply,
 * and conditionally loads the right CJK / Vietnamese font for the active locale.
 *
 * Place this content into src/app/[locale]/layout.tsx (existing 453-byte file).
 *
 * What changed:
 *  - Was: minimal pass-through wrapper.
 *  - Now: dynamically renders <html lang={locale}> and inlines the relevant
 *    locale-specific font stylesheet.
 *
 * IMPORTANT — Next.js 15 App Router doesn't let nested layouts override <html>,
 * but it DOES let you set lang via React.useEffect or middleware. The cleanest way
 * is to set lang in the ROOT layout based on the URL segment via middleware OR
 * pass it down. Below is the pattern using a Client Component to update <html lang>.
 *
 * Alternative (preferred for SSR): remove <html> from src/app/layout.tsx,
 * keep it here only, and let this layout render the full document shell.
 * That requires moving AppRouterCacheProvider here. See README §4 for the
 * full pattern.
 */

import type { Metadata } from 'next';
import LocaleSync from './LocaleSync';

const FONT_BY_LOCALE: Record<string, string | null> = {
  ko: null, // covered by Pretendard in root layout
  en: null, // covered by Inter in root layout
  zh: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap',
  vi: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap',
};

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Enterprise App',
    other: locale ? { 'content-language': locale } : undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const extraFont = FONT_BY_LOCALE[locale];

  return (
    <>
      {/* Sync <html lang> + per-locale font stylesheet */}
      <LocaleSync locale={locale} extraFontHref={extraFont} />
      {children}
    </>
  );
}
