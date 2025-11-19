/**
 * Multi-language field transformation utility
 * Converts PostgreSQL flat structure to nested API format
 */

/**
 * Transform multilingual fields from DB format to API format
 * @param {Object} dbRecord - Database record with flat multilingual fields
 * @param {Array<string>} fieldNames - Names of multilingual fields (e.g., ['name', 'description'])
 * @returns {Object} Transformed record with nested multilingual objects
 */
function transformMultiLangFields(dbRecord, fieldNames) {
  if (!dbRecord) return null;

  const transformed = { ...dbRecord };

  fieldNames.forEach(fieldName => {
    // Create nested object for multilingual field
    transformed[fieldName] = {
      en: dbRecord[`${fieldName}_en`] || '',
      ko: dbRecord[`${fieldName}_ko`] || '',
      zh: dbRecord[`${fieldName}_zh`] || '',
      vi: dbRecord[`${fieldName}_vi`] || ''
    };

    // Remove flat fields from result
    delete transformed[`${fieldName}_en`];
    delete transformed[`${fieldName}_ko`];
    delete transformed[`${fieldName}_zh`];
    delete transformed[`${fieldName}_vi`];
  });

  return transformed;
}

/**
 * Transform an array of records with multilingual fields
 * @param {Array<Object>} records - Array of database records
 * @param {Array<string>} fieldNames - Names of multilingual fields
 * @returns {Array<Object>} Transformed records
 */
function transformMultiLangArray(records, fieldNames) {
  if (!Array.isArray(records)) return [];
  return records.map(record => transformMultiLangFields(record, fieldNames));
}

/**
 * Convert snake_case to camelCase
 * @param {string} str - Snake case string
 * @returns {string} Camel case string
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform database record keys from snake_case to camelCase
 * @param {Object} dbRecord - Database record
 * @returns {Object} Transformed record with camelCase keys
 */
function transformKeysToCamelCase(dbRecord) {
  if (!dbRecord || typeof dbRecord !== 'object') return dbRecord;

  const transformed = {};
  for (const [key, value] of Object.entries(dbRecord)) {
    transformed[snakeToCamel(key)] = value;
  }
  return transformed;
}

/**
 * Full transformation: multilingual fields + camelCase conversion
 * @param {Object} dbRecord - Database record
 * @param {Array<string>} multiLangFields - Names of multilingual fields
 * @returns {Object} Fully transformed record
 */
function transformToAPI(dbRecord, multiLangFields = []) {
  if (!dbRecord) return null;

  // First transform multilingual fields
  let transformed = multiLangFields.length > 0
    ? transformMultiLangFields(dbRecord, multiLangFields)
    : { ...dbRecord };

  // Then convert keys to camelCase
  transformed = transformKeysToCamelCase(transformed);

  return transformed;
}

/**
 * Transform array of records to API format
 * @param {Array<Object>} records - Array of database records
 * @param {Array<string>} multiLangFields - Names of multilingual fields
 * @returns {Array<Object>} Transformed records
 */
function transformArrayToAPI(records, multiLangFields = []) {
  if (!Array.isArray(records)) return [];
  return records.map(record => transformToAPI(record, multiLangFields));
}

module.exports = {
  transformMultiLangFields,
  transformMultiLangArray,
  snakeToCamel,
  transformKeysToCamelCase,
  transformToAPI,
  transformArrayToAPI
};
