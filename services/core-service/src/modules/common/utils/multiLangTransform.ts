/**
 * Multi-language Field Transformation Utilities - Common Module
 */

import { MultiLangField } from '../types';

/**
 * Transform database fields with language suffixes to MultiLangField object
 */
export function transformMultiLangFields<T extends Record<string, any>>(
  row: T,
  fields: string[]
): T & Record<string, MultiLangField> {
  if (!row) return row;

  const result = { ...row } as any;

  for (const field of fields) {
    result[field] = {
      en: row[`${field}_en`] || '',
      ko: row[`${field}_ko`] || '',
      zh: row[`${field}_zh`] || '',
      vi: row[`${field}_vi`] || '',
    };

    // Remove original fields
    delete result[`${field}_en`];
    delete result[`${field}_ko`];
    delete result[`${field}_zh`];
    delete result[`${field}_vi`];
  }

  return result;
}

/**
 * Transform array of database rows
 */
export function transformMultiLangArray<T extends Record<string, any>>(
  rows: T[],
  fields: string[]
): Array<T & Record<string, MultiLangField>> {
  return rows.map(row => transformMultiLangFields(row, fields));
}

/**
 * Transform to API format (camelCase)
 */
export function transformToAPI<T extends Record<string, any>>(
  row: T | null | undefined,
  multiLangFields: string[] = []
): any {
  if (!row) return null;

  const result: any = {};

  for (const [key, value] of Object.entries(row)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }

  // Transform multi-language fields
  for (const field of multiLangFields) {
    const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[field] = {
      en: row[`${snakeField}_en`] || row[`${field}_en`] || '',
      ko: row[`${snakeField}_ko`] || row[`${field}_ko`] || '',
      zh: row[`${snakeField}_zh`] || row[`${field}_zh`] || '',
      vi: row[`${snakeField}_vi`] || row[`${field}_vi`] || '',
    };
  }

  return result;
}

/**
 * Transform array to API format
 */
export function transformArrayToAPI<T extends Record<string, any>>(
  rows: T[],
  multiLangFields: string[] = []
): any[] {
  return rows.map(row => transformToAPI(row, multiLangFields));
}
