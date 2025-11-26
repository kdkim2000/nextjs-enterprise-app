/**
 * Language Configuration
 *
 * Centralized language settings for the application.
 * Add new languages here to enable them throughout the app.
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr'
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    direction: 'ltr'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    direction: 'ltr'
  }
];

export const DEFAULT_LANGUAGE = 'en';

export const LANGUAGE_CODES = ['en', 'ko', 'zh', 'vi'] as const;
export type LanguageCode = typeof LANGUAGE_CODES[number];

/**
 * Get language config by code
 */
export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(code: string): code is LanguageCode {
  return LANGUAGE_CODES.includes(code as LanguageCode);
}

/**
 * Get language display name (native name + English name)
 */
export function getLanguageDisplayName(code: string): string {
  const config = getLanguageConfig(code);
  if (!config) return code;
  return `${config.nativeName} (${config.name})`;
}
