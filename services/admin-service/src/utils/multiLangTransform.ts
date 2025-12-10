/**
 * Multi-language field transformation utility
 */

/**
 * Transform multilingual fields from DB format to API format
 */
export function transformMultiLangFields(dbRecord: any, fieldNames: string[]): any {
  if (!dbRecord) return null;

  const transformed = { ...dbRecord };

  fieldNames.forEach(fieldName => {
    transformed[fieldName] = {
      en: dbRecord[fieldName + '_en'] || '',
      ko: dbRecord[fieldName + '_ko'] || '',
      zh: dbRecord[fieldName + '_zh'] || '',
      vi: dbRecord[fieldName + '_vi'] || ''
    };

    delete transformed[fieldName + '_en'];
    delete transformed[fieldName + '_ko'];
    delete transformed[fieldName + '_zh'];
    delete transformed[fieldName + '_vi'];
  });

  return transformed;
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform database record keys from snake_case to camelCase
 */
export function transformKeysToCamelCase(dbRecord: any): any {
  if (!dbRecord || typeof dbRecord !== 'object') return dbRecord;

  const transformed: any = {};
  for (const [key, value] of Object.entries(dbRecord)) {
    transformed[snakeToCamel(key)] = value;
  }
  return transformed;
}
