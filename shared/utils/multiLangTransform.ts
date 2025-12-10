/**
 * Multi-language field transformation utility
 * 다국어 필드 변환 유틸리티
 */

/**
 * 지원 언어 목록
 */
export const SUPPORTED_LANGUAGES = ['en', 'ko', 'zh', 'vi'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * 다국어 필드 타입
 */
export interface MultiLangField {
  en: string;
  ko: string;
  zh?: string;
  vi?: string;
}

/**
 * DB 레코드의 다국어 필드를 API 형식으로 변환
 *
 * @example
 * // Input: { name_en: 'Hello', name_ko: '안녕', name_zh: '', name_vi: '' }
 * // Output: { name: { en: 'Hello', ko: '안녕', zh: '', vi: '' } }
 */
export function transformMultiLangFields(
  dbRecord: any,
  fieldNames: string[]
): any {
  if (!dbRecord) return null;

  const transformed = { ...dbRecord };

  fieldNames.forEach(fieldName => {
    transformed[fieldName] = {
      en: dbRecord[`${fieldName}_en`] || '',
      ko: dbRecord[`${fieldName}_ko`] || '',
      zh: dbRecord[`${fieldName}_zh`] || '',
      vi: dbRecord[`${fieldName}_vi`] || '',
    };

    // 원본 필드 삭제
    delete transformed[`${fieldName}_en`];
    delete transformed[`${fieldName}_ko`];
    delete transformed[`${fieldName}_zh`];
    delete transformed[`${fieldName}_vi`];
  });

  return transformed;
}

/**
 * API 형식의 다국어 필드를 DB 형식으로 변환 (flatten)
 *
 * @example
 * // Input: { name: { en: 'Hello', ko: '안녕' } }
 * // Output: { name_en: 'Hello', name_ko: '안녕', name_zh: '', name_vi: '' }
 */
export function flattenMultiLangFields(
  apiRecord: any,
  fieldNames: string[]
): any {
  if (!apiRecord) return null;

  const flattened = { ...apiRecord };

  fieldNames.forEach(fieldName => {
    const multiLangValue = apiRecord[fieldName];

    if (multiLangValue && typeof multiLangValue === 'object') {
      flattened[`${fieldName}_en`] = multiLangValue.en || '';
      flattened[`${fieldName}_ko`] = multiLangValue.ko || '';
      flattened[`${fieldName}_zh`] = multiLangValue.zh || '';
      flattened[`${fieldName}_vi`] = multiLangValue.vi || '';

      delete flattened[fieldName];
    }
  });

  return flattened;
}

/**
 * snake_case를 camelCase로 변환
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * camelCase를 snake_case로 변환
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * DB 레코드의 키를 snake_case에서 camelCase로 변환
 */
export function transformKeysToCamelCase(dbRecord: any): any {
  if (!dbRecord || typeof dbRecord !== 'object') return dbRecord;
  if (Array.isArray(dbRecord)) {
    return dbRecord.map(item => transformKeysToCamelCase(item));
  }

  const transformed: any = {};
  for (const [key, value] of Object.entries(dbRecord)) {
    const camelKey = snakeToCamel(key);
    transformed[camelKey] = value;
  }
  return transformed;
}

/**
 * API 레코드의 키를 camelCase에서 snake_case로 변환
 */
export function transformKeysToSnakeCase(apiRecord: any): any {
  if (!apiRecord || typeof apiRecord !== 'object') return apiRecord;
  if (Array.isArray(apiRecord)) {
    return apiRecord.map(item => transformKeysToSnakeCase(item));
  }

  const transformed: any = {};
  for (const [key, value] of Object.entries(apiRecord)) {
    const snakeKey = camelToSnake(key);
    transformed[snakeKey] = value;
  }
  return transformed;
}

/**
 * 특정 언어의 값 가져오기 (fallback 지원)
 */
export function getLocalizedValue(
  multiLangField: MultiLangField | undefined,
  language: SupportedLanguage = 'ko',
  fallbackLanguage: SupportedLanguage = 'en'
): string {
  if (!multiLangField) return '';

  return multiLangField[language] || multiLangField[fallbackLanguage] || '';
}

export default {
  transformMultiLangFields,
  flattenMultiLangFields,
  snakeToCamel,
  camelToSnake,
  transformKeysToCamelCase,
  transformKeysToSnakeCase,
  getLocalizedValue,
  SUPPORTED_LANGUAGES,
};
