/**
 * App Settings Service Layer - Common Module
 */

import { query } from '../../../utils/database';
import { AppSetting, AppSettingQueryOptions } from '../types';

function parseValue(value: string | null, valueType: string): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (valueType) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === 'TRUE' || value === '1';
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

function transformSetting(row: any): AppSetting {
  return {
    key: row.key,
    value: row.value,
    parsedValue: parseValue(row.value, row.value_type),
    valueType: row.value_type,
    category: row.category,
    isReady: row.is_ready,
    isApplied: row.is_applied ?? false,
    description: {
      en: row.description_en || '',
      ko: row.description_ko || '',
      zh: row.description_zh || '',
      vi: row.description_vi || ''
    },
    displayOrder: row.display_order,
    isSensitive: row.is_sensitive,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by
  };
}

export async function getAllSettings(options: AppSettingQueryOptions = {}): Promise<AppSetting[]> {
  const { category, isReady, isApplied, search } = options;

  let queryText = 'SELECT * FROM app_settings WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (category) {
    queryText += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (isReady !== undefined) {
    queryText += ` AND is_ready = $${paramIndex}`;
    params.push(isReady);
    paramIndex++;
  }

  if (isApplied !== undefined) {
    queryText += ` AND is_applied = $${paramIndex}`;
    params.push(isApplied);
    paramIndex++;
  }

  if (search) {
    queryText += ` AND (key ILIKE $${paramIndex} OR description_en ILIKE $${paramIndex} OR description_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  queryText += ' ORDER BY category, display_order, key';

  const result = await query(queryText, params);
  return result.rows.map(transformSetting);
}

export async function getSettingsByCategory(options: { isReady?: boolean; isApplied?: boolean } = {}): Promise<Record<string, AppSetting[]>> {
  const { isReady, isApplied } = options;

  let queryText = 'SELECT * FROM app_settings WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (isReady !== undefined) {
    queryText += ` AND is_ready = $${paramIndex}`;
    params.push(isReady);
    paramIndex++;
  }

  if (isApplied !== undefined) {
    queryText += ` AND is_applied = $${paramIndex}`;
    params.push(isApplied);
    paramIndex++;
  }

  queryText += ' ORDER BY category, display_order, key';

  const result = await query(queryText, params);
  const settings = result.rows.map(transformSetting);

  const grouped: Record<string, AppSetting[]> = {};
  for (const setting of settings) {
    if (!grouped[setting.category]) {
      grouped[setting.category] = [];
    }
    grouped[setting.category].push(setting);
  }

  return grouped;
}

export async function getSettingByKey(key: string): Promise<AppSetting | null> {
  const queryText = 'SELECT * FROM app_settings WHERE key = $1';
  const result = await query(queryText, [key]);
  return result.rows[0] ? transformSetting(result.rows[0]) : null;
}

export async function getSettingsByKeys(keys: string[]): Promise<Record<string, AppSetting>> {
  if (!Array.isArray(keys) || keys.length === 0) {
    return {};
  }

  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const queryText = `SELECT * FROM app_settings WHERE key IN (${placeholders})`;
  const result = await query(queryText, keys);

  const settingsMap: Record<string, AppSetting> = {};
  for (const row of result.rows) {
    const setting = transformSetting(row);
    settingsMap[setting.key] = setting;
  }

  return settingsMap;
}

export async function getSettingsByCategoryName(category: string): Promise<AppSetting[]> {
  const queryText = 'SELECT * FROM app_settings WHERE category = $1 ORDER BY display_order, key';
  const result = await query(queryText, [category]);
  return result.rows.map(transformSetting);
}

export async function getCategories(): Promise<string[]> {
  const queryText = 'SELECT DISTINCT category FROM app_settings ORDER BY category';
  const result = await query(queryText);
  return result.rows.map((row: any) => row.category);
}

export async function createSetting(data: {
  key: string;
  value: string;
  valueType?: string;
  category: string;
  isReady?: boolean;
  isApplied?: boolean;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
  displayOrder?: number;
  isSensitive?: boolean;
  updatedBy?: string;
}): Promise<AppSetting> {
  const queryText = `
    INSERT INTO app_settings (
      key, value, value_type, category, is_ready, is_applied,
      description_en, description_ko, description_zh, description_vi,
      display_order, is_sensitive, updated_by, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    data.key,
    data.value || '',
    data.valueType || 'string',
    data.category,
    data.isReady || false,
    data.isApplied || false,
    data.descriptionEn || '',
    data.descriptionKo || '',
    data.descriptionZh || '',
    data.descriptionVi || '',
    data.displayOrder || 0,
    data.isSensitive || false,
    data.updatedBy
  ];

  const result = await query(queryText, params);
  return transformSetting(result.rows[0]);
}

export async function updateSetting(key: string, updates: Record<string, any>): Promise<AppSetting | null> {
  const allowedFields = [
    'value', 'value_type', 'category', 'is_ready', 'is_applied',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'display_order', 'is_sensitive', 'updated_by'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [fieldKey, fieldValue] of Object.entries(updates)) {
    const dbField = fieldKey.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField) && fieldValue !== undefined) {
      setClause.push(`${dbField} = $${paramIndex}`);
      params.push(fieldValue);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(key);

  const queryText = `UPDATE app_settings SET ${setClause.join(', ')} WHERE key = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] ? transformSetting(result.rows[0]) : null;
}

export async function updateMultipleSettings(settings: Array<{ key: string } & Record<string, any>>, updatedBy?: string): Promise<AppSetting[]> {
  const updatedSettings: AppSetting[] = [];

  for (const setting of settings) {
    const { key, ...updates } = setting;
    if (key) {
      updates.updatedBy = updatedBy;
      const updated = await updateSetting(key, updates);
      if (updated) {
        updatedSettings.push(updated);
      }
    }
  }

  return updatedSettings;
}

export async function updateSettingReadyStatus(key: string, isReady: boolean, updatedBy?: string): Promise<AppSetting | null> {
  const queryText = `
    UPDATE app_settings
    SET is_ready = $1, updated_by = $2, updated_at = NOW()
    WHERE key = $3
    RETURNING *
  `;

  const result = await query(queryText, [isReady, updatedBy, key]);
  return result.rows[0] ? transformSetting(result.rows[0]) : null;
}

export async function updateSettingAppliedStatus(key: string, isApplied: boolean, updatedBy?: string): Promise<AppSetting | null> {
  const queryText = `
    UPDATE app_settings
    SET is_applied = $1, updated_by = $2, updated_at = NOW()
    WHERE key = $3
    RETURNING *
  `;

  const result = await query(queryText, [isApplied, updatedBy, key]);
  return result.rows[0] ? transformSetting(result.rows[0]) : null;
}

export async function deleteSetting(key: string): Promise<boolean> {
  const queryText = 'DELETE FROM app_settings WHERE key = $1';
  const result = await query(queryText, [key]);
  return (result.rowCount ?? 0) > 0;
}

export async function getSettingsCount(options: AppSettingQueryOptions = {}): Promise<number> {
  const { category, isReady, isApplied, search } = options;

  let queryText = 'SELECT COUNT(*) FROM app_settings WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (category) {
    queryText += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (isReady !== undefined) {
    queryText += ` AND is_ready = $${paramIndex}`;
    params.push(isReady);
    paramIndex++;
  }

  if (isApplied !== undefined) {
    queryText += ` AND is_applied = $${paramIndex}`;
    params.push(isApplied);
    paramIndex++;
  }

  if (search) {
    queryText += ` AND (key ILIKE $${paramIndex} OR description_en ILIKE $${paramIndex} OR description_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count);
}

export async function getReadySettingsMap(): Promise<Record<string, any>> {
  const queryText = 'SELECT * FROM app_settings WHERE is_ready = true';
  const result = await query(queryText);

  const settingsMap: Record<string, any> = {};
  for (const row of result.rows) {
    settingsMap[row.key] = parseValue(row.value, row.value_type);
  }

  return settingsMap;
}

export async function getAppliedSettingsMap(): Promise<Record<string, any>> {
  const queryText = 'SELECT * FROM app_settings WHERE is_ready = true AND is_applied = true';
  const result = await query(queryText);

  const settingsMap: Record<string, any> = {};
  for (const row of result.rows) {
    const parsedValue = parseValue(row.value, row.value_type);

    if (row.value_type === 'json' && parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)) {
      const localeKeys = ['en', 'ko', 'zh', 'vi'];
      const hasLocaleKeys = localeKeys.some(key => key in parsedValue);

      if (hasLocaleKeys) {
        for (const [locale, value] of Object.entries(parsedValue)) {
          if (localeKeys.includes(locale)) {
            settingsMap[`${row.key}_${locale}`] = value;
          }
        }
      } else {
        settingsMap[row.key] = parsedValue;
      }
    } else {
      settingsMap[row.key] = parsedValue;
    }
  }

  return settingsMap;
}
