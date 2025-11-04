import React from 'react';
import { ClientProviders } from '@/components/providers/ClientProviders';

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ko' }];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ClientProviders locale={locale}>{children}</ClientProviders>;
}
