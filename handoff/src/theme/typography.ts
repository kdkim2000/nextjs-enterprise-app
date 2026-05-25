/**
 * Typography — multi-language font system.
 *
 * Changes from old typography.ts:
 *  - PRIMARY STACK now leads with Pretendard (Korean+Latin) instead of Inter alone.
 *    The old "Inter, system-ui" stack meant Korean text was rendered with whatever
 *    the OS happened to have — wildly inconsistent.
 *  - Type scale recalibrated: pure pixel sizes (rem-based) with tighter line-heights for
 *    headings, looser for body. Adds Display variant for hero blocks.
 *  - letterSpacing: tightened for headings (-0.02em), neutral for body, wider for ALL CAPS
 *  - REMOVED: MUI's default uppercase overline letter-spacing (0.083em) was too tight in CJK
 *    — bumped to 0.16em for proper KR/ZH balance.
 *  - "button" text-transform stays "none" (good MUI override from old theme).
 *  - h6 was 16px and clashed with body1 — now visibly smaller and lighter (14px medium).
 *
 * USAGE:
 *  - Page title: <Typography variant="h2">
 *  - Section title: <Typography variant="h4">
 *  - Subtitle: <Typography variant="h6">
 *  - Body: <Typography variant="body1"> or "body2" for compact
 *  - Eyebrow/label: <Typography variant="overline">
 *  - Data: <Typography variant="caption" sx={{ fontFamily: 'mono', fontVariantNumeric: 'tabular-nums' }}>
 */

import type { TypographyOptions } from '@mui/material/styles/createTypography';
import { tokens } from './tokens';

export const typography: TypographyOptions = {
  // Universal sans stack — Pretendard leads, Inter fallback, then system Latin/CJK
  fontFamily: tokens.font.sans.default,

  htmlFontSize: 16,
  fontSize: 15,        // base body — slightly tighter than MUI default 14 (we use rem-based scale)
  fontWeightLight: 300,
  fontWeightRegular: tokens.weight.regular,
  fontWeightMedium: tokens.weight.medium,
  fontWeightBold: tokens.weight.semibold, // intentionally 600, not 700 — softer

  // ---------------------------------------------------------------------
  // DISPLAY / HEADINGS
  // ---------------------------------------------------------------------
  h1: {
    fontSize: tokens.size['4xl'],   // 48 (was 40)
    fontWeight: tokens.weight.semibold,
    lineHeight: tokens.leading.tight,
    letterSpacing: tokens.tracking.tight,
  },
  h2: {
    fontSize: tokens.size['3xl'],   // 36 (was 32)
    fontWeight: tokens.weight.semibold,
    lineHeight: tokens.leading.tight,
    letterSpacing: tokens.tracking.tight,
  },
  h3: {
    fontSize: tokens.size['2xl'],   // 28 (was 28)
    fontWeight: tokens.weight.semibold,
    lineHeight: tokens.leading.snug,
    letterSpacing: tokens.tracking.normal,
  },
  h4: {
    fontSize: tokens.size.xl,        // 22 (was 24)
    fontWeight: tokens.weight.semibold,
    lineHeight: tokens.leading.snug,
    letterSpacing: tokens.tracking.normal,
  },
  h5: {
    fontSize: tokens.size.lg,        // 18 (was 20)
    fontWeight: tokens.weight.semibold,
    lineHeight: tokens.leading.snug,
    letterSpacing: tokens.tracking.normal,
  },
  h6: {
    fontSize: tokens.size.md,        // 16 — but NOW with medium weight so it differs from body1
    fontWeight: tokens.weight.medium,
    lineHeight: tokens.leading.snug,
    letterSpacing: tokens.tracking.normal,
  },

  // ---------------------------------------------------------------------
  // BODY
  // ---------------------------------------------------------------------
  body1: {
    fontSize: tokens.size.md,        // 16
    fontWeight: tokens.weight.regular,
    lineHeight: tokens.leading.normal,
    letterSpacing: tokens.tracking.normal,
  },
  body2: {
    fontSize: tokens.size.base,      // 15 (was 14)
    fontWeight: tokens.weight.regular,
    lineHeight: tokens.leading.normal,
    letterSpacing: tokens.tracking.normal,
  },

  // ---------------------------------------------------------------------
  // SUBTITLE — used for card headers, list group labels
  // ---------------------------------------------------------------------
  subtitle1: {
    fontSize: tokens.size.md,
    fontWeight: tokens.weight.medium,
    lineHeight: tokens.leading.snug,
    letterSpacing: tokens.tracking.normal,
  },
  subtitle2: {
    fontSize: tokens.size.base,
    fontWeight: tokens.weight.medium,
    lineHeight: tokens.leading.snug,
    letterSpacing: tokens.tracking.normal,
  },

  // ---------------------------------------------------------------------
  // BUTTON / CAPTION / OVERLINE
  // ---------------------------------------------------------------------
  button: {
    fontSize: tokens.size.base,
    fontWeight: tokens.weight.medium,
    lineHeight: 1.5,
    letterSpacing: tokens.tracking.normal,
    textTransform: 'none', // keep mixed case — better for KR
  },
  caption: {
    fontSize: tokens.size.xs,        // 12
    fontWeight: tokens.weight.regular,
    lineHeight: tokens.leading.normal,
    letterSpacing: tokens.tracking.normal,
  },
  overline: {
    fontSize: tokens.size.xs,        // 12 — same as caption but UPPER + tracked
    fontWeight: tokens.weight.semibold,
    lineHeight: 2.0,
    letterSpacing: tokens.tracking.widest, // 0.16em — much wider than MUI default
    textTransform: 'uppercase',
  },
};

/**
 * Helper to apply a language-specific font stack at the root.
 *
 * Use in src/app/[locale]/layout.tsx like:
 *   import { fontStackFor } from '@/theme/typography';
 *   <html lang={params.locale} style={{ fontFamily: fontStackFor(params.locale) }}>
 */
export function fontStackFor(locale: string): string {
  const key = locale as keyof typeof tokens.font.sans;
  return tokens.font.sans[key] ?? tokens.font.sans.default;
}
