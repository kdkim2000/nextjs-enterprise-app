/**
 * Multi-Language Transform Utilities - Admin Module
 */

/**
 * Transform multi-language fields from flat DB columns to nested object format
 * e.g., { name_en: 'Test', name_ko: '테스트' } -> { name: { en: 'Test', ko: '테스트' } }
 */
export function transformMultiLangFields(dbRecord: any, fieldNames: string[]): any {
  if (!dbRecord) return null;

  const result = { ...dbRecord };

  for (const fieldName of fieldNames) {
    const langObject: { en: string; ko: string; zh: string; vi: string } = {
      en: dbRecord[`${fieldName}_en`] || '',
      ko: dbRecord[`${fieldName}_ko`] || '',
      zh: dbRecord[`${fieldName}_zh`] || '',
      vi: dbRecord[`${fieldName}_vi`] || ''
    };

    result[fieldName] = langObject;

    // Remove original flat fields
    delete result[`${fieldName}_en`];
    delete result[`${fieldName}_ko`];
    delete result[`${fieldName}_zh`];
    delete result[`${fieldName}_vi`];
  }

  return result;
}

/**
 * Flatten multi-language fields from nested object to flat DB columns
 * e.g., { name: { en: 'Test', ko: '테스트' } } -> { name_en: 'Test', name_ko: '테스트' }
 */
export function flattenMultiLangFields(apiRecord: any, fieldNames: string[]): any {
  if (!apiRecord) return null;

  const result = { ...apiRecord };

  for (const fieldName of fieldNames) {
    const langObject = apiRecord[fieldName];
    if (langObject && typeof langObject === 'object') {
      result[`${fieldName}_en`] = langObject.en || '';
      result[`${fieldName}_ko`] = langObject.ko || '';
      result[`${fieldName}_zh`] = langObject.zh || '';
      result[`${fieldName}_vi`] = langObject.vi || '';
      delete result[fieldName];
    }
  }

  return result;
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform all keys from snake_case to camelCase
 */
export function transformKeysToCamelCase(dbRecord: any): any {
  if (!dbRecord) return null;
  if (Array.isArray(dbRecord)) {
    return dbRecord.map(item => transformKeysToCamelCase(item));
  }
  if (typeof dbRecord !== 'object') {
    return dbRecord;
  }

  const result: any = {};
  for (const [key, value] of Object.entries(dbRecord)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = value;
  }
  return result;
}
