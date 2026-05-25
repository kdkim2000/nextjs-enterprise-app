import type { Metadata } from 'next';
import React from 'react';
import { ClientProviders } from '@/components/providers/ClientProviders';
import LocaleSync from './LocaleSync';

const FONT_BY_LOCALE: Record<string, string | null> = {
  ko: null,
  en: null,
  zh: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap',
  vi: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ko' }];
}

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
  const extraFont = FONT_BY_LOCALE[locale] ?? null;

  return (
    <ClientProviders locale={locale}>
      <LocaleSync locale={locale} extraFontHref={extraFont} />
      {children}
    </ClientProviders>
  );
}
