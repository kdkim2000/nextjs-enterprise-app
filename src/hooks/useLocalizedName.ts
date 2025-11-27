import { useMemo } from 'react';

/**
 * Object with localized name fields
 */
export interface LocalizedNameObject {
  name?: { en?: string; ko?: string; zh?: string; vi?: string } | string;
  name_en?: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
}

/**
 * Options for useLocalizedName hook
 */
export interface UseLocalizedNameOptions {
  /**
   * Object containing localized name fields
   * Can be any object with name fields (name, name_en, name_ko, etc.)
   */
  object: Record<string, any> | null | undefined;

  /**
   * Current locale (en, ko, zh, vi)
   */
  locale: string;

  /**
   * Fallback value when no name found
   */
  fallback?: string;

  /**
   * Field name prefix for name fields (default: 'name')
   * e.g., 'title' would look for title_en, title_ko, etc.
   */
  fieldPrefix?: string;
}

/**
 * Get localized name from an object with name fields
 *
 * Supports two formats:
 * 1. Object format: { name: { en: 'English', ko: '한국어' } }
 * 2. Flat format: { name_en: 'English', name_ko: '한국어' }
 *
 * @example
 * ```tsx
 * const departmentName = useLocalizedName({
 *   object: department,
 *   locale: currentLocale,
 *   fallback: department?.code
 * });
 * ```
 *
 * @example With custom field prefix
 * ```tsx
 * const title = useLocalizedName({
 *   object: post,
 *   locale: currentLocale,
 *   fieldPrefix: 'title',  // looks for title_en, title_ko, etc.
 *   fallback: 'Untitled'
 * });
 * ```
 */
export function useLocalizedName({
  object,
  locale,
  fallback = '',
  fieldPrefix = 'name'
}: UseLocalizedNameOptions): string {
  return useMemo(() => {
    if (!object) return fallback;

    // Check for object format: { name: { en: '...', ko: '...' } }
    const nameField = (object as any)[fieldPrefix];
    if (nameField && typeof nameField === 'object') {
      return nameField[locale] || nameField.en || fallback;
    }

    // Check for flat format: { name_en: '...', name_ko: '...' }
    const localizedField = `${fieldPrefix}_${locale}`;
    const localizedValue = (object as any)[localizedField];
    if (localizedValue) {
      return localizedValue;
    }

    // Fallback to English
    const enField = `${fieldPrefix}_en`;
    const enValue = (object as any)[enField];
    if (enValue) {
      return enValue;
    }

    return fallback;
  }, [object, locale, fallback, fieldPrefix]);
}

/**
 * Get localized name from an object (non-hook version for use in callbacks)
 *
 * @example
 * ```tsx
 * const name = getLocalizedName(department, currentLocale, department.code);
 * ```
 */
export function getLocalizedName(
  object: Record<string, any> | null | undefined,
  locale: string,
  fallback: string = '',
  fieldPrefix: string = 'name'
): string {
  if (!object) return fallback;

  // Check for object format: { name: { en: '...', ko: '...' } }
  const nameField = (object as any)[fieldPrefix];
  if (nameField && typeof nameField === 'object') {
    return nameField[locale] || nameField.en || fallback;
  }

  // Check for flat format: { name_en: '...', name_ko: '...' }
  const localizedField = `${fieldPrefix}_${locale}`;
  const localizedValue = (object as any)[localizedField];
  if (localizedValue) {
    return localizedValue;
  }

  // Fallback to English
  const enField = `${fieldPrefix}_en`;
  const enValue = (object as any)[enField];
  if (enValue) {
    return enValue;
  }

  return fallback;
}

/**
 * Get multiple localized fields from an object
 *
 * @example
 * ```tsx
 * const { name, description } = useLocalizedFields({
 *   object: program,
 *   locale: currentLocale,
 *   fields: ['name', 'description']
 * });
 * ```
 */
export function useLocalizedFields({
  object,
  locale,
  fields
}: {
  object: Record<string, any> | null | undefined;
  locale: string;
  fields: string[];
}): Record<string, string> {
  return useMemo(() => {
    const result: Record<string, string> = {};

    fields.forEach((field) => {
      result[field] = getLocalizedName(object, locale, '', field);
    });

    return result;
  }, [object, locale, fields]);
}

export default useLocalizedName;
