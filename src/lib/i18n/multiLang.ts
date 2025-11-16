/**
 * Multi-language Utilities
 *
 * Common utilities for managing multi-language fields across the application.
 * This library provides type-safe helpers for converting between different
 * multi-language data formats.
 *
 * @example Adding a new language
 * ```typescript
 * // 1. Add to SUPPORTED_LANGUAGES array
 * export const SUPPORTED_LANGUAGES = ['en', 'ko', 'zh', 'vi', 'ja'];
 *
 * // 2. Update SupportedLanguage type
 * export type SupportedLanguage = 'en' | 'ko' | 'zh' | 'vi' | 'ja';
 *
 * // That's it! All helper functions will automatically support the new language
 * ```
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Supported languages in the application
 * Add new languages here to enable them throughout the app
 */
export type SupportedLanguage = 'en' | 'ko' | 'zh' | 'vi';

/**
 * Multi-language field type
 * Represents a field that has values in all supported languages
 */
export type MultiLangField = Record<SupportedLanguage, string>;

/**
 * Optional multi-language field type
 * Useful for fields that might not have all language translations
 */
export type PartialMultiLangField = Partial<Record<SupportedLanguage, string>>;

// ============================================================================
// Constants
// ============================================================================

/**
 * Array of all supported languages
 * This is the single source of truth for supported languages
 */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'ko', 'zh', 'vi'];

/**
 * Language display names in their native language
 */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  ko: '한국어',
  zh: '中文',
  vi: 'Tiếng Việt'
};

/**
 * Language codes mapping (for compatibility)
 */
export const LANGUAGE_CODES: Record<string, SupportedLanguage> = {
  en: 'en',
  'en-US': 'en',
  ko: 'ko',
  'ko-KR': 'ko',
  zh: 'zh',
  'zh-CN': 'zh',
  vi: 'vi',
  'vi-VN': 'vi'
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates an empty multi-language field with empty strings for all languages
 *
 * @returns Empty multi-language field object
 *
 * @example
 * ```typescript
 * const emptyField = createEmptyMultiLangField();
 * // Returns: { en: '', ko: '', zh: '', vi: '' }
 * ```
 */
export const createEmptyMultiLangField = (): MultiLangField => {
  return SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang] = '';
    return acc;
  }, {} as MultiLangField);
};

/**
 * Converts a multi-language field object to flattened form data
 *
 * @param multiLangField - Multi-language field object
 * @param fieldPrefix - Prefix for the flattened field names
 * @returns Flattened object with language-suffixed keys
 *
 * @example
 * ```typescript
 * const name = { en: 'Hello', ko: '안녕', zh: '你好', vi: 'Xin chào' };
 * const formData = multiLangToFormData(name, 'name');
 * // Returns: { nameEn: 'Hello', nameKo: '안녕', nameZh: '你好', nameVi: 'Xin chào' }
 * ```
 */
export const multiLangToFormData = <T extends string>(
  multiLangField: MultiLangField | PartialMultiLangField,
  fieldPrefix: T
): Record<string, string> => {
  return SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    const key = `${fieldPrefix}${lang.charAt(0).toUpperCase()}${lang.slice(1)}`;
    acc[key] = multiLangField[lang] || '';
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Converts flattened form data back to multi-language field object
 *
 * @param formData - Flattened form data object
 * @param fieldPrefix - Prefix used in the flattened field names
 * @returns Multi-language field object
 *
 * @example
 * ```typescript
 * const formData = { nameEn: 'Hello', nameKo: '안녕', nameZh: '你好', nameVi: 'Xin chào' };
 * const name = formDataToMultiLang(formData, 'name');
 * // Returns: { en: 'Hello', ko: '안녕', zh: '你好', vi: 'Xin chào' }
 * ```
 */
export const formDataToMultiLang = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any,
  fieldPrefix: string
): MultiLangField => {
  return SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    const key = `${fieldPrefix}${lang.charAt(0).toUpperCase()}${lang.slice(1)}`;
    acc[lang] = formData[key] || '';
    return acc;
  }, {} as MultiLangField);
};

/**
 * Gets the localized value from a multi-language field with fallback
 * Falls back to English if the requested language is not available
 *
 * @param multiLangField - Multi-language field object
 * @param locale - Requested locale
 * @returns Localized string value
 *
 * @example
 * ```typescript
 * const name = { en: 'Hello', ko: '안녕', zh: '', vi: '' };
 * getLocalizedValue(name, 'zh'); // Returns: 'Hello' (fallback to English)
 * getLocalizedValue(name, 'ko'); // Returns: '안녕'
 * ```
 */
export const getLocalizedValue = (
  multiLangField: MultiLangField | PartialMultiLangField,
  locale: string
): string => {
  const supportedLocale = LANGUAGE_CODES[locale] || (locale as SupportedLanguage);
  return multiLangField[supportedLocale] || multiLangField.en || '';
};

/**
 * Creates empty multi-language fields for a form in flattened format
 * Useful for initializing form state with empty values
 *
 * @returns Object with empty name and description fields
 *
 * @example
 * ```typescript
 * const emptyFields = createEmptyMultiLangFormFields();
 * // Returns: { nameEn: '', nameKo: '', nameZh: '', nameVi: '',
 * //            descriptionEn: '', descriptionKo: '', descriptionZh: '', descriptionVi: '' }
 * ```
 */
export const createEmptyMultiLangFormFields = () => {
  const empty = createEmptyMultiLangField();
  return multiLangFieldsToFormData(empty, empty);
};

/**
 * Converts multi-language name and description fields to form data format
 *
 * @param name - Multi-language name field
 * @param description - Multi-language description field
 * @returns Flattened form data object
 *
 * @example
 * ```typescript
 * const name = { en: 'Hello', ko: '안녕', zh: '你好', vi: 'Xin chào' };
 * const desc = { en: 'World', ko: '세계', zh: '世界', vi: 'Thế giới' };
 * const formData = multiLangFieldsToFormData(name, desc);
 * // Returns: { nameEn: 'Hello', nameKo: '안녕', ..., descriptionEn: 'World', ... }
 * ```
 */
export const multiLangFieldsToFormData = (
  name: MultiLangField | PartialMultiLangField,
  description: MultiLangField | PartialMultiLangField
): Record<string, string> => {
  return {
    ...multiLangToFormData(name, 'name'),
    ...multiLangToFormData(description, 'description')
  };
};

/**
 * Converts form data to multi-language name and description fields format
 *
 * @param formData - Flattened form data object
 * @returns Object with name and description multi-language fields
 *
 * @example
 * ```typescript
 * const formData = { nameEn: 'Hello', nameKo: '안녕', descriptionEn: 'World', ... };
 * const { name, description } = formDataToMultiLangFields(formData);
 * // name: { en: 'Hello', ko: '안녕', ... }
 * // description: { en: 'World', ... }
 * ```
 */
export const formDataToMultiLangFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any
): { name: MultiLangField; description: MultiLangField } => {
  return {
    name: formDataToMultiLang(formData, 'name'),
    description: formDataToMultiLang(formData, 'description')
  };
};

/**
 * Validates that all required languages have non-empty values
 *
 * @param multiLangField - Multi-language field to validate
 * @param requiredLanguages - Array of required languages (defaults to all)
 * @returns True if all required languages have values
 *
 * @example
 * ```typescript
 * const name = { en: 'Hello', ko: '', zh: '', vi: '' };
 * validateMultiLangField(name, ['en', 'ko']); // Returns: false (ko is empty)
 * validateMultiLangField(name, ['en']); // Returns: true
 * ```
 */
export const validateMultiLangField = (
  multiLangField: MultiLangField | PartialMultiLangField,
  requiredLanguages: SupportedLanguage[] = SUPPORTED_LANGUAGES
): boolean => {
  return requiredLanguages.every((lang) => {
    const value = multiLangField[lang];
    return value !== undefined && value !== null && value.trim() !== '';
  });
};

/**
 * Checks if a multi-language field has any non-empty value
 *
 * @param multiLangField - Multi-language field to check
 * @returns True if at least one language has a value
 *
 * @example
 * ```typescript
 * const name = { en: '', ko: '', zh: '你好', vi: '' };
 * hasAnyValue(name); // Returns: true (zh has a value)
 * ```
 */
export const hasAnyValue = (
  multiLangField: MultiLangField | PartialMultiLangField
): boolean => {
  return SUPPORTED_LANGUAGES.some((lang) => {
    const value = multiLangField[lang];
    return value !== undefined && value !== null && value.trim() !== '';
  });
};

/**
 * Copies values from source language to target language
 * Useful for quick translations or placeholders
 *
 * @param multiLangField - Multi-language field to modify
 * @param sourceLang - Source language to copy from
 * @param targetLang - Target language to copy to
 * @returns New multi-language field with copied value
 *
 * @example
 * ```typescript
 * const name = { en: 'Hello', ko: '', zh: '', vi: '' };
 * const updated = copyLanguageValue(name, 'en', 'ko');
 * // Returns: { en: 'Hello', ko: 'Hello', zh: '', vi: '' }
 * ```
 */
export const copyLanguageValue = (
  multiLangField: MultiLangField | PartialMultiLangField,
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage
): MultiLangField => {
  return {
    ...multiLangField,
    [targetLang]: multiLangField[sourceLang] || ''
  } as MultiLangField;
};

/**
 * Fills empty language fields with English value as fallback
 *
 * @param multiLangField - Multi-language field to fill
 * @returns New multi-language field with filled values
 *
 * @example
 * ```typescript
 * const name = { en: 'Hello', ko: '', zh: '', vi: '' };
 * const filled = fillEmptyWithEnglish(name);
 * // Returns: { en: 'Hello', ko: 'Hello', zh: 'Hello', vi: 'Hello' }
 * ```
 */
export const fillEmptyWithEnglish = (
  multiLangField: MultiLangField | PartialMultiLangField
): MultiLangField => {
  const englishValue = multiLangField.en || '';
  return SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang] = multiLangField[lang] || englishValue;
    return acc;
  }, {} as MultiLangField);
};

/**
 * Searches a multi-language field for a query string
 * Returns true if any language contains the query (case-insensitive)
 *
 * @param multiLangField - Multi-language field to search
 * @param query - Search query string
 * @returns True if query found in any language
 *
 * @example
 * ```typescript
 * const name = { en: 'Hello', ko: '안녕', zh: '你好', vi: 'Xin chào' };
 * searchMultiLangField(name, 'hello'); // Returns: true
 * searchMultiLangField(name, '안녕'); // Returns: true
 * searchMultiLangField(name, 'goodbye'); // Returns: false
 * ```
 */
export const searchMultiLangField = (
  multiLangField: MultiLangField | PartialMultiLangField,
  query: string
): boolean => {
  if (!query) return true;
  const lowerQuery = query.toLowerCase();
  return SUPPORTED_LANGUAGES.some((lang) => {
    const value = multiLangField[lang];
    return value && value.toLowerCase().includes(lowerQuery);
  });
};

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid MultiLangField
 *
 * @param value - Value to check
 * @returns True if value is a valid MultiLangField
 */
export const isMultiLangField = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
): value is MultiLangField => {
  if (!value || typeof value !== 'object') return false;
  return SUPPORTED_LANGUAGES.every((lang) =>
    typeof value[lang] === 'string'
  );
};

/**
 * Type guard to check if a value is a valid SupportedLanguage
 *
 * @param value - Value to check
 * @returns True if value is a valid SupportedLanguage
 */
export const isSupportedLanguage = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
): value is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
};
