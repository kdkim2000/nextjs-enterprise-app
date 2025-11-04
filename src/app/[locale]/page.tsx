'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function LocaleRoot() {
  const router = useRouter();
  const locale = useCurrentLocale();

  useEffect(() => {
    router.push(`/${locale}/login`);
  }, [router, locale]);

  return null;
}
