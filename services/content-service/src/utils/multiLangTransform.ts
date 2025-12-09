/**
 * Multi-language Field Transformation Utilities
 */

interface MultiLangField {
  en: string;
  ko: string;
  zh: string;
  vi: string;
}

/**
 * Transform database row with multi-language fields to API format
 * @param row - Database row with fields like name_en, name_ko, etc.
 * @param fields - Array of field names to transform (e.g., ['name', 'description'])
 * @returns Transformed object with multi-language fields as objects
 */
export function transformMultiLangFields<T extends Record<string, any>>(
  row: T,
  fields: string[]
): T & Record<string, MultiLangField> {
  const result = { ...row } as T & Record<string, MultiLangField>;

  for (const field of fields) {
    result[field as keyof typeof result] = {
      en: row[`${field}_en`] || '',
      ko: row[`${field}_ko`] || '',
      zh: row[`${field}_zh`] || '',
      vi: row[`${field}_vi`] || '',
    } as any;

    // Clean up individual language fields
    delete (result as any)[`${field}_en`];
    delete (result as any)[`${field}_ko`];
    delete (result as any)[`${field}_zh`];
    delete (result as any)[`${field}_vi`];
  }

  return result;
}

/**
 * Extract multi-language fields for database update
 * @param data - Input data with multi-language object fields
 * @param field - Field name (e.g., 'name')
 * @returns Object with individual language fields (e.g., { nameEn, nameKo, ... })
 */
export function extractMultiLangFields(
  data: Record<string, any>,
  field: string
): Record<string, string> {
  const result: Record<string, string> = {};
  const value = data[field];

  if (typeof value === 'object' && value !== null) {
    if (value.en !== undefined) result[`${field}En`] = value.en;
    if (value.ko !== undefined) result[`${field}Ko`] = value.ko;
    if (value.zh !== undefined) result[`${field}Zh`] = value.zh;
    if (value.vi !== undefined) result[`${field}Vi`] = value.vi;
  } else if (typeof value === 'string') {
    // If it's a string, use it as the English value
    result[`${field}En`] = value;
  }

  return result;
}

/**
 * Build multi-language search condition for SQL
 * @param field - Base field name (e.g., 'name')
 * @param paramIndex - Current parameter index
 * @returns SQL condition string
 */
export function buildMultiLangSearchCondition(
  field: string,
  paramIndex: number
): string {
  return `(${field}_en ILIKE $${paramIndex} OR ${field}_ko ILIKE $${paramIndex} OR ${field}_zh ILIKE $${paramIndex} OR ${field}_vi ILIKE $${paramIndex})`;
}
