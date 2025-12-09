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
 * Transform database row to API format (snake_case multilang fields to object)
 */
export function transformToAPI<T extends Record<string, any>>(
  row: T | null | undefined,
  fields: string[]
): T | null {
  if (!row) return null;

  const result = { ...row } as T;

  for (const field of fields) {
    (result as any)[field] = {
      en: row[`${field}_en`] || '',
      ko: row[`${field}_ko`] || '',
      zh: row[`${field}_zh`] || '',
      vi: row[`${field}_vi`] || '',
    };

    // Clean up individual language fields
    delete (result as any)[`${field}_en`];
    delete (result as any)[`${field}_ko`];
    delete (result as any)[`${field}_zh`];
    delete (result as any)[`${field}_vi`];
  }

  return result;
}

/**
 * Transform array of database rows to API format
 */
export function transformArrayToAPI<T extends Record<string, any>>(
  rows: T[],
  fields: string[]
): T[] {
  return rows.map(row => transformToAPI(row, fields)).filter((r): r is T => r !== null);
}
