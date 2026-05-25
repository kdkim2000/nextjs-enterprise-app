/**
 * Design Tokens — single source of truth.
 *
 * These are the raw values that every other layer reads from:
 *   - palette.ts   → maps these to MUI Palette
 *   - typography.ts → reads font stacks
 *   - components.ts → reads radius, shadow, motion
 *   - globals.css   → mirrors these as CSS variables for non-MUI surfaces
 *
 * RULE: never use raw hex codes in component files. Always import from here
 * or read from the MUI theme (which is built from these).
 *
 * Color space: oklch — perceptually uniform, future-proof. MUI accepts oklch().
 * Fallback hex values are provided where build tooling might choke.
 */

export const tokens = {
  // -----------------------------------------------------------------------
  // SURFACES — warm neutral palette
  // -----------------------------------------------------------------------
  surface: {
    bg: 'oklch(0.97 0.005 80)',        // page background — warm off-white
    canvas: 'oklch(0.99 0.003 80)',     // elevated card / paper
    sunken: 'oklch(0.94 0.006 80)',     // sidebar background, table stripes
    overlay: 'oklch(0.18 0.01 80 / 0.55)', // modal backdrop
  },

  // -----------------------------------------------------------------------
  // INK — text + iconography
  // -----------------------------------------------------------------------
  ink: {
    primary: 'oklch(0.18 0.01 80)',     // headlines, primary text
    secondary: 'oklch(0.36 0.01 80)',   // body, secondary text
    tertiary: 'oklch(0.52 0.01 80)',    // captions, labels, hints
    disabled: 'oklch(0.72 0.005 80)',
    inverse: 'oklch(0.97 0.005 80)',    // text on dark surfaces
  },

  // -----------------------------------------------------------------------
  // LINES — borders, dividers, rules
  // -----------------------------------------------------------------------
  line: {
    subtle: 'oklch(0.92 0.005 80)',
    default: 'oklch(0.86 0.006 80)',
    strong: 'oklch(0.75 0.006 80)',
    inverse: 'oklch(0.30 0.01 80)',
  },

  // -----------------------------------------------------------------------
  // ACCENT — slate blue (information, interactive)
  // -----------------------------------------------------------------------
  accent: {
    50:  'oklch(0.97 0.01 245)',
    100: 'oklch(0.92 0.02 245)',
    200: 'oklch(0.85 0.04 245)',
    300: 'oklch(0.76 0.06 245)',
    400: 'oklch(0.66 0.08 245)',
    500: 'oklch(0.55 0.09 245)',
    600: 'oklch(0.48 0.09 245)',   // ★ primary
    700: 'oklch(0.40 0.08 245)',
    800: 'oklch(0.32 0.06 245)',
    900: 'oklch(0.24 0.05 245)',
    950: 'oklch(0.16 0.03 245)',
  },

  // -----------------------------------------------------------------------
  // CAUTION — burnt sienna (destructive, irreversible)
  // -----------------------------------------------------------------------
  caution: {
    50:  'oklch(0.97 0.01 40)',
    100: 'oklch(0.93 0.03 40)',
    200: 'oklch(0.87 0.06 40)',
    300: 'oklch(0.79 0.09 40)',
    400: 'oklch(0.70 0.11 40)',
    500: 'oklch(0.63 0.13 40)',
    600: 'oklch(0.58 0.13 40)',   // ★ destructive
    700: 'oklch(0.49 0.12 40)',
    800: 'oklch(0.40 0.10 40)',
    900: 'oklch(0.31 0.08 40)',
    950: 'oklch(0.21 0.05 40)',
  },

  // -----------------------------------------------------------------------
  // STATUS — single source. Replaces old status + role + error/warning/etc.
  // Use semantic name, not literal color.
  // -----------------------------------------------------------------------
  status: {
    success: 'oklch(0.55 0.10 150)',
    warning: 'oklch(0.65 0.13 75)',
    danger:  'oklch(0.55 0.16 25)',
    info:    'oklch(0.48 0.09 245)',
    neutral: 'oklch(0.52 0.01 80)',
  },

  // -----------------------------------------------------------------------
  // ROLE — preserved from old palette but rebalanced (lower chroma)
  // Used in user/role admin views and chips. NOT used as primary accents.
  // -----------------------------------------------------------------------
  role: {
    admin:     'oklch(0.50 0.14 25)',  // muted red
    manager:   'oklch(0.62 0.13 55)',  // amber
    moderator: 'oklch(0.50 0.13 310)', // muted purple
    user:      'oklch(0.48 0.09 245)', // slate blue (same as accent)
    guest:     'oklch(0.52 0.01 80)',  // neutral gray
  },

  // -----------------------------------------------------------------------
  // TYPOGRAPHY — multi-language font stacks
  //
  // CRITICAL: each language uses a different primary font so glyph metrics
  // match. The :lang() CSS selector and a small runtime helper switch
  // stacks. See typography.ts and globals.css.
  // -----------------------------------------------------------------------
  font: {
    sans: {
      // Korean-first stack — Pretendard handles KR+EN well
      ko: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", system-ui, sans-serif',
      // English / Latin
      en: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      // Chinese
      zh: '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", -apple-system, sans-serif',
      // Vietnamese
      vi: '"Be Vietnam Pro", "Inter", -apple-system, sans-serif',
      // Universal default
      default: '"Pretendard Variable", "Inter", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Segoe UI", system-ui, sans-serif',
    },
    mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    serif: '"Fraunces", Georgia, serif', // editorial use only
  },

  // Type scale — 1.25 ratio (perfect fourth), capped at 64
  size: {
    xs: '0.75rem',    // 12 — caption, footnote
    sm: '0.8125rem',  // 13 — meta, table footer
    base: '0.9375rem',// 15 — table cell, default input  ← was 16, tightened for density
    md: '1rem',       // 16 — body
    lg: '1.125rem',   // 18 — subtitle
    xl: '1.375rem',   // 22 — section title
    '2xl': '1.75rem', // 28 — page title
    '3xl': '2.25rem', // 36 — display
    '4xl': '3rem',    // 48 — hero
    '5xl': '4rem',    // 64 — splash
  },

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  leading: {
    tight: 1.15,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
  },

  tracking: {
    tight: '-0.02em',
    normal: '-0.005em',
    wide: '0.04em',
    wider: '0.08em',
    widest: '0.16em', // for ALL CAPS labels
  },

  // -----------------------------------------------------------------------
  // SPACE — 4px grid
  // -----------------------------------------------------------------------
  space: {
    px: '1px',
    0: '0',
    1: '0.25rem', // 4
    2: '0.5rem',  // 8
    3: '0.75rem', // 12
    4: '1rem',    // 16
    5: '1.25rem', // 20
    6: '1.5rem',  // 24
    8: '2rem',    // 32
    10: '2.5rem', // 40
    12: '3rem',   // 48
    16: '4rem',   // 64
    20: '5rem',   // 80
    24: '6rem',   // 96
  },

  // -----------------------------------------------------------------------
  // RADIUS — UNIFIED to two values. Was 4 (sidebar) / 8 / 12 / 16. Now 6 / 0.
  // Rule: data surfaces are sharp (0). Tappable surfaces are 6.
  // -----------------------------------------------------------------------
  radius: {
    none: 0,
    sm: '4px',     // chips, inline tags
    md: '6px',     // ★ buttons, inputs, cards, dialogs — UNIFIED
    full: 9999,
  },

  // -----------------------------------------------------------------------
  // SHADOW — softer, more restrained. Hover shadows REMOVED on buttons.
  // -----------------------------------------------------------------------
  shadow: {
    none: 'none',
    sm: '0 1px 2px oklch(0.18 0.01 80 / 0.06)',
    md: '0 2px 8px oklch(0.18 0.01 80 / 0.08)',
    lg: '0 8px 24px oklch(0.18 0.01 80 / 0.10)',
    xl: '0 16px 48px oklch(0.18 0.01 80 / 0.14)',
    focus: '0 0 0 3px oklch(0.48 0.09 245 / 0.25)', // focus ring
  },

  // -----------------------------------------------------------------------
  // MOTION — 4 named durations. See deck slide 12.
  // -----------------------------------------------------------------------
  motion: {
    instant: '80ms',
    smooth: '160ms',
    deliberate: '240ms',
    consequential: '440ms',
    ease: {
      out: 'cubic-bezier(0.16, 1, 0.3, 1)',           // soft landing
      inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',    // consequential actions
    },
  },

  // -----------------------------------------------------------------------
  // LAYOUT — sidebar widths, header height, max content
  // -----------------------------------------------------------------------
  layout: {
    sidebarExpanded: 256,    // was 280 — tighter
    sidebarCollapsed: 64,    // was 72
    headerHeight: 56,        // was 64 — tighter
    contentMax: 1440,
    readMax: 720,            // for Read Dialect (posts, mail)
  },

  // -----------------------------------------------------------------------
  // Z-INDEX
  // -----------------------------------------------------------------------
  zIndex: {
    base: 0,
    raised: 1,
    sticky: 100,
    header: 1100,
    sidebar: 1200,
    overlay: 1300,
    modal: 1400,
    toast: 1500,
    tooltip: 1600,
  },
} as const;

export type Tokens = typeof tokens;
