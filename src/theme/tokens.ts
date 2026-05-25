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
 * Color space: hex/rgba — converted from oklch for MUI compatibility.
 * CSS variables in globals.css may still use oklch (modern browsers support it).
 */

export const tokens = {
  // -----------------------------------------------------------------------
  // SURFACES — warm neutral palette
  // -----------------------------------------------------------------------
  surface: {
    bg: '#f7f5f1',        // page background — warm off-white
    canvas: '#fdfcf9',     // elevated card / paper
    sunken: '#edebe7',     // sidebar background, table stripes
    overlay: 'rgba(20, 17, 13, 0.55)', // modal backdrop
  },

  // -----------------------------------------------------------------------
  // INK — text + iconography
  // -----------------------------------------------------------------------
  ink: {
    primary: '#14110d',     // headlines, primary text
    secondary: '#403d37',   // body, secondary text
    tertiary: '#6c6863',    // captions, labels, hints
    disabled: '#a6a4a1',
    inverse: '#f7f5f1',    // text on dark surfaces
  },

  // -----------------------------------------------------------------------
  // LINES — borders, dividers, rules
  // -----------------------------------------------------------------------
  line: {
    subtle: '#e6e4e1',
    default: '#d3d1cd',
    strong: '#b0adaa',
    inverse: '#302d28',
  },

  // -----------------------------------------------------------------------
  // ACCENT — slate blue (information, interactive)
  // -----------------------------------------------------------------------
  accent: {
    50:  '#f0f6fc',
    100: '#dae6f1',
    200: '#b9d1e7',
    300: '#92b6d5',
    400: '#6898c0',
    500: '#4077a3',
    600: '#2c628d',   // ★ primary
    700: '#1c4b70',
    800: '#15364f',
    900: '#072135',
    950: '#030e19',
  },

  // -----------------------------------------------------------------------
  // CAUTION — burnt sienna (destructive, irreversible)
  // -----------------------------------------------------------------------
  caution: {
    50:  '#fcf3f0',
    100: '#fbe2d9',
    200: '#f8c8b7',
    300: '#eda78f',
    400: '#d88669',
    500: '#ca6b49',
    600: '#b95c3a',   // ★ destructive
    700: '#974426',
    800: '#733119',
    900: '#511f0c',
    950: '#2b0f05',
  },

  // -----------------------------------------------------------------------
  // STATUS — single source. Replaces old status + role + error/warning/etc.
  // Use semantic name, not literal color.
  // -----------------------------------------------------------------------
  status: {
    success: '#428252',
    warning: '#bd821a',
    danger:  '#bd413f',
    info:    '#2c628d',
    neutral: '#6c6863',
  },

  // -----------------------------------------------------------------------
  // ROLE — preserved from old palette but rebalanced (lower chroma)
  // Used in user/role admin views and chips. NOT used as primary accents.
  // -----------------------------------------------------------------------
  role: {
    admin:     '#a43b38',  // muted red
    manager:   '#c16e2d',  // amber
    moderator: '#7a4b9a',  // muted purple
    user:      '#2c628d',  // slate blue (same as accent)
    guest:     '#6c6863',  // neutral gray
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
    sm: '0 1px 2px rgba(20, 17, 13, 0.06)',
    md: '0 2px 8px rgba(20, 17, 13, 0.08)',
    lg: '0 8px 24px rgba(20, 17, 13, 0.1)',
    xl: '0 16px 48px rgba(20, 17, 13, 0.14)',
    focus: '0 0 0 3px rgba(44, 98, 141, 0.25)', // focus ring
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
