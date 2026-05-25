/**
 * Root layout — minimal changes.
 *
 * What changed vs old layout.tsx:
 *  1) Added <head> font preload links for Pretendard Variable, Inter, JetBrains Mono.
 *     These are preloaded as `font` resources so the FCP isn't pushed back by
 *     the language-scoped stacks finally loading from CDN.
 *  2) Added MUI ThemeProvider wrapping AppRouterCacheProvider so child trees
 *     read the new theme directly. (Previously, no ThemeProvider was present at
 *     the root — child layouts had to set it themselves.)
 *  3) Wrapped <body> children with <CssBaseline /> so the MuiCssBaseline override
 *     (which fixes the body font-family) actually applies.
 *
 * NOTE: keep <html lang="en"> as default; the per-locale layout at
 * src/app/[locale]/layout.tsx should override with <html lang={params.locale}>
 * to drive the :lang() CSS selectors in globals.css.
 */

import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from '@/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Enterprise App',
  description: 'Next.js Enterprise Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font preloads — CDN delivery, swap on load */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Pretendard Variable — primary for KR + Latin */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />

        {/* Inter — Latin fallback */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />

        {/* JetBrains Mono — data + code */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
        />

        {/* Per-locale fonts loaded conditionally by [locale]/layout.tsx:
            - Noto Sans SC for zh
            - Be Vietnam Pro for vi
            - Fraunces (serif accent) on demand */}
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
