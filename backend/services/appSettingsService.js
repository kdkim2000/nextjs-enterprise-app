/**
 * App Settings Service Layer
 *
 * Provides data access methods for application settings.
 * Key-Value based storage with category grouping.
 */

const db = require('../config/database');

/**
 * Get all settings
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of settings objects
 */
async function getAllSettings(options = {}) {
  const { category, isReady, isApplied, search } = options;

  let query = 'SELECT * FROM app_settings WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (isReady !== undefined) {
    query += ` AND is_ready = $${paramIndex}`;
    params.push(isReady);
    paramIndex++;
  }

  if (isApplied !== undefined) {
    query += ` AND is_applied = $${paramIndex}`;
    params.push(isApplied);
    paramIndex++;
  }

  if (search) {
    query += ` AND (key ILIKE $${paramIndex} OR description_en ILIKE $${paramIndex} OR description_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  query += ' ORDER BY category, display_order, key';

  const result = await db.query(query, params);
  return result.rows.map(transformSetting);
}

/**
 * Get settings grouped by category
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Settings grouped by category
 */
async function getSettingsByCategory(options = {}) {
  const { isReady, isApplied } = options;

  let query = 'SELECT * FROM app_settings WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (isReady !== undefined) {
    query += ` AND is_ready = $${paramIndex}`;
    params.push(isReady);
    paramIndex++;
  }

  if (isApplied !== undefined) {
    query += ` AND is_applied = $${paramIndex}`;
    params.push(isApplied);
    paramIndex++;
  }

  query += ' ORDER BY category, display_order, key';

  const result = await db.query(query, params);
  const settings = result.rows.map(transformSetting);

  // Group by category
  const grouped = {};
  for (const setting of settings) {
    if (!grouped[setting.category]) {
      grouped[setting.category] = [];
    }
    grouped[setting.category].push(setting);
  }

  return grouped;
}

/**
 * Get setting by key
 * @param {string} key - Setting key
 * @returns {Promise<Object|null>} Setting object or null
 */
async function getSettingByKey(key) {
  const query = 'SELECT * FROM app_settings WHERE key = $1';
  const result = await db.query(query, [key]);
  return result.rows[0] ? transformSetting(result.rows[0]) : null;
}

/**
 * Get multiple settings by keys
 * @param {Array<string>} keys - Array of setting keys
 * @returns {Promise<Object>} Key-value map of settings
 */
async function getSettingsByKeys(keys) {
  if (!Array.isArray(keys) || keys.length === 0) {
    return {};
  }

  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `SELECT * FROM app_settings WHERE key IN (${placeholders})`;
  const result = await db.query(query, keys);

  const settingsMap = {};
  for (const row of result.rows) {
    const setting = transformSetting(row);
    settingsMap[setting.key] = setting;
  }

  return settingsMap;
}

/**
 * Get settings by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of settings in the category
 */
async function getSettingsByCategoryName(category) {
  const query = 'SELECT * FROM app_settings WHERE category = $1 ORDER BY display_order, key';
  const result = await db.query(query, [category]);
  return result.rows.map(transformSetting);
}

/**
 * Get all categories
 * @returns {Promise<Array>} Array of category names
 */
async function getCategories() {
  const query = 'SELECT DISTINCT category FROM app_settings ORDER BY category';
  const result = await db.query(query);
  return result.rows.map(row => row.category);
}

/**
 * Create a new setting
 * @param {Object} settingData - Setting data
 * @returns {Promise<Object>} Created setting object
 */
async function createSetting(settingData) {
  const {
    key,
    value,
    valueType = 'string',
    category,
    isReady = false,
    isApplied = false,
    descriptionEn,
    descriptionKo,
    descriptionZh,
    descriptionVi,
    displayOrder = 0,
    isSensitive = false,
    updatedBy
  } = settingData;

  const query = `
    INSERT INTO app_settings (
      key, value, value_type, category, is_ready, is_applied,
      description_en, description_ko, description_zh, description_vi,
      display_order, is_sensitive, updated_by, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    key, value, valueType, category, isReady, isApplied,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    displayOrder, isSensitive, updatedBy
  ];

  const result = await db.query(query, params);
  return transformSetting(result.rows[0]);
}

/**
 * Update a setting
 * @param {string} key - Setting key
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated setting object
 */
async function updateSetting(key, updates) {
  const allowedFields = [
    'value', 'value_type', 'category', 'is_ready', 'is_applied',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'display_order', 'is_sensitive', 'updated_by'
  ];

  const setClause = [];
  const params = [];
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

  const query = `UPDATE app_settings SET ${setClause.join(', ')} WHERE key = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] ? transformSetting(result.rows[0]) : null;
}

/**
 * Update multiple settings at once
 * @param {Array<Object>} settings - Array of {key, value, ...} objects
 * @param {string} updatedBy - User who updated
 * @returns {Promise<Array>} Array of updated settings
 */
async function updateMultipleSettings(settings, updatedBy) {
  const updatedSettings = [];

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

/**
 * Update is_ready status for a setting
 * @param {string} key - Setting key
 * @param {boolean} isReady - Ready status
 * @param {string} updatedBy - User who updated
 * @returns {Promise<Object|null>} Updated setting object
 */
async function updateSettingReadyStatus(key, isReady, updatedBy) {
  const query = `
    UPDATE app_settings
    SET is_ready = $1, updated_by = $2, updated_at = NOW()
    WHERE key = $3
    RETURNING *
  `;

  const result = await db.query(query, [isReady, updatedBy, key]);
  return result.rows[0] ? transformSetting(result.rows[0]) : null;
}

/**
 * Update is_applied status for a setting
 * @param {string} key - Setting key
 * @param {boolean} isApplied - Applied status
 * @param {string} updatedBy - User who updated
 * @returns {Promise<Object|null>} Updated setting object
 */
async function updateSettingAppliedStatus(key, isApplied, updatedBy) {
  const query = `
    UPDATE app_settings
    SET is_applied = $1, updated_by = $2, updated_at = NOW()
    WHERE key = $3
    RETURNING *
  `;

  const result = await db.query(query, [isApplied, updatedBy, key]);
  return result.rows[0] ? transformSetting(result.rows[0]) : null;
}

/**
 * Delete a setting
 * @param {string} key - Setting key
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteSetting(key) {
  const query = 'DELETE FROM app_settings WHERE key = $1';
  const result = await db.query(query, [key]);
  return result.rowCount > 0;
}

/**
 * Get count of settings
 * @param {Object} options - Query options
 * @returns {Promise<number>} Count of settings
 */
async function getSettingsCount(options = {}) {
  const { category, isReady, isApplied, search } = options;

  let query = 'SELECT COUNT(*) FROM app_settings WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (isReady !== undefined) {
    query += ` AND is_ready = $${paramIndex}`;
    params.push(isReady);
    paramIndex++;
  }

  if (isApplied !== undefined) {
    query += ` AND is_applied = $${paramIndex}`;
    params.push(isApplied);
    paramIndex++;
  }

  if (search) {
    query += ` AND (key ILIKE $${paramIndex} OR description_en ILIKE $${paramIndex} OR description_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
}

/**
 * Get only ready settings as a key-value map (for admin preview)
 * @returns {Promise<Object>} Key-value map of ready settings
 */
async function getReadySettingsMap() {
  const query = 'SELECT * FROM app_settings WHERE is_ready = true';
  const result = await db.query(query);

  const settingsMap = {};
  for (const row of result.rows) {
    settingsMap[row.key] = parseValue(row.value, row.value_type);
  }

  return settingsMap;
}

/**
 * Get only applied settings as a key-value map (for public/application use)
 * Settings must be both ready AND applied to be returned
 * JSON settings with locale keys are flattened (e.g., app_name.en -> app_name_en)
 * @returns {Promise<Object>} Key-value map of applied settings
 */
async function getAppliedSettingsMap() {
  const query = 'SELECT * FROM app_settings WHERE is_ready = true AND is_applied = true';
  const result = await db.query(query);

  const settingsMap = {};
  for (const row of result.rows) {
    const parsedValue = parseValue(row.value, row.value_type);

    // Flatten JSON locale objects (e.g., app_name: {en: "...", ko: "..."} -> app_name_en, app_name_ko)
    if (row.value_type === 'json' && parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)) {
      // Check if it's a locale object (has en, ko, zh, vi keys)
      const localeKeys = ['en', 'ko', 'zh', 'vi'];
      const hasLocaleKeys = localeKeys.some(key => key in parsedValue);

      if (hasLocaleKeys) {
        // Flatten locale keys
        for (const [locale, value] of Object.entries(parsedValue)) {
          if (localeKeys.includes(locale)) {
            settingsMap[`${row.key}_${locale}`] = value;
          }
        }
      } else {
        // Keep as-is for non-locale JSON
        settingsMap[row.key] = parsedValue;
      }
    } else {
      settingsMap[row.key] = parsedValue;
    }
  }

  return settingsMap;
}

/**
 * Transform database row to API response format
 * @param {Object} row - Database row
 * @returns {Object} Transformed setting object
 */
function transformSetting(row) {
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

/**
 * Parse value based on type
 * @param {string} value - Raw value string
 * @param {string} valueType - Value type
 * @returns {any} Parsed value
 */
function parseValue(value, valueType) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (valueType) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === true;
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

module.exports = {
  getAllSettings,
  getSettingsByCategory,
  getSettingByKey,
  getSettingsByKeys,
  getSettingsByCategoryName,
  getCategories,
  createSetting,
  updateSetting,
  updateMultipleSettings,
  updateSettingReadyStatus,
  updateSettingAppliedStatus,
  deleteSetting,
  getSettingsCount,
  getReadySettingsMap,
  getAppliedSettingsMap
};
