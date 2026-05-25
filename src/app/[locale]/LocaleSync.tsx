'use client';

/**
 * LocaleSync — small client component that:
 *   1) Updates document.documentElement.lang on locale change,
 *      so the :lang(ko)/:lang(en)/etc. CSS rules in globals.css repaint.
 *   2) Injects an extra font stylesheet for locales whose font isn't in
 *      the root preload set (zh, vi).
 *
 * Renders nothing.
 */

import { useEffect } from 'react';

interface Props {
  locale: string;
  extraFontHref: string | null;
}

export default function LocaleSync({ locale, extraFontHref }: Props) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1) Lang attr
    document.documentElement.lang = locale;

    // 2) Per-locale font
    if (!extraFontHref) return;

    const id = `locale-font-${locale}`;
    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = extraFontHref;
    document.head.appendChild(link);
  }, [locale, extraFontHref]);

  return null;
}
