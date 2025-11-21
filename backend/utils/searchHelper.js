/**
 * Full-Text Search Helper
 *
 * Provides utilities for efficient PostgreSQL full-text search using GIN indexes.
 *
 * Performance Comparison:
 * - ILIKE '%search%': O(n) - scans every row
 * - Full-Text Search with GIN: O(log n) - uses index
 * - Speed improvement: 100x-1000x for large tables
 */

/**
 * Build full-text search condition for users table
 * Uses the idx_users_search_gin index
 *
 * @param {string} searchTerm - Search term from user
 * @param {number} paramIndex - Current parameter index for query
 * @returns {Object} { condition, param }
 */
function buildUserSearchCondition(searchTerm, paramIndex) {
  if (!searchTerm || searchTerm.trim() === '') {
    return { condition: '', param: null };
  }

  // Clean and prepare search term
  const cleanedTerm = searchTerm.trim();

  // Use ts_query for full-text search with ranking
  // plainto_tsquery automatically handles AND logic for multiple words
  const condition = `
    (
      to_tsvector('simple',
        COALESCE(loginid, '') || ' ' ||
        COALESCE(email, '') || ' ' ||
        COALESCE(name_ko, '') || ' ' ||
        COALESCE(name_en, '') || ' ' ||
        COALESCE(employee_number, '')
      ) @@ plainto_tsquery('simple', $${paramIndex})
    )
  `.trim();

  return {
    condition,
    param: cleanedTerm
  };
}

/**
 * Build full-text search with ranking for users table
 * Returns relevance score for sorting
 *
 * @param {string} searchTerm - Search term from user
 * @param {number} paramIndex - Current parameter index for query
 * @returns {Object} { selectClause, whereCondition, param }
 */
function buildUserSearchWithRanking(searchTerm, paramIndex) {
  if (!searchTerm || searchTerm.trim() === '') {
    return { selectClause: '', whereCondition: '', orderByClause: '', param: null };
  }

  const cleanedTerm = searchTerm.trim();

  // ts_rank provides relevance scoring
  const selectClause = `
    ts_rank(
      to_tsvector('simple',
        COALESCE(loginid, '') || ' ' ||
        COALESCE(email, '') || ' ' ||
        COALESCE(name_ko, '') || ' ' ||
        COALESCE(name_en, '') || ' ' ||
        COALESCE(employee_number, '')
      ),
      plainto_tsquery('simple', $${paramIndex})
    ) as search_rank
  `.trim();

  const whereCondition = `
    (
      to_tsvector('simple',
        COALESCE(loginid, '') || ' ' ||
        COALESCE(email, '') || ' ' ||
        COALESCE(name_ko, '') || ' ' ||
        COALESCE(name_en, '') || ' ' ||
        COALESCE(employee_number, '')
      ) @@ plainto_tsquery('simple', $${paramIndex})
    )
  `.trim();

  const orderByClause = 'search_rank DESC';

  return {
    selectClause,
    whereCondition,
    orderByClause,
    param: cleanedTerm
  };
}

/**
 * Build ILIKE pattern for exact field search
 * Use this for specific field searches, not general search
 *
 * @param {string} value - Search value
 * @returns {string} ILIKE pattern
 */
function buildILikePattern(value) {
  if (!value) return null;
  return `%${value}%`;
}

/**
 * Build full-text search for departments
 *
 * @param {string} searchTerm - Search term
 * @param {number} paramIndex - Parameter index
 * @returns {Object} { condition, param }
 */
function buildDepartmentSearchCondition(searchTerm, paramIndex) {
  if (!searchTerm || searchTerm.trim() === '') {
    return { condition: '', param: null };
  }

  const cleanedTerm = searchTerm.trim();

  const condition = `
    (
      to_tsvector('simple',
        COALESCE(code, '') || ' ' ||
        COALESCE(name_ko, '') || ' ' ||
        COALESCE(name_en, '') || ' ' ||
        COALESCE(name_zh, '') || ' ' ||
        COALESCE(name_vi, '')
      ) @@ plainto_tsquery('simple', $${paramIndex})
    )
  `.trim();

  return { condition, param: cleanedTerm };
}

/**
 * Build full-text search for menus
 *
 * @param {string} searchTerm - Search term
 * @param {number} paramIndex - Parameter index
 * @returns {Object} { condition, param }
 */
function buildMenuSearchCondition(searchTerm, paramIndex) {
  if (!searchTerm || searchTerm.trim() === '') {
    return { condition: '', param: null };
  }

  const cleanedTerm = searchTerm.trim();

  const condition = `
    (
      to_tsvector('simple',
        COALESCE(code, '') || ' ' ||
        COALESCE(name_ko, '') || ' ' ||
        COALESCE(name_en, '') || ' ' ||
        COALESCE(path, '')
      ) @@ plainto_tsquery('simple', $${paramIndex})
    )
  `.trim();

  return { condition, param: cleanedTerm };
}

/**
 * Build full-text search for programs
 *
 * @param {string} searchTerm - Search term
 * @param {number} paramIndex - Parameter index
 * @returns {Object} { condition, param }
 */
function buildProgramSearchCondition(searchTerm, paramIndex) {
  if (!searchTerm || searchTerm.trim() === '') {
    return { condition: '', param: null };
  }

  const cleanedTerm = searchTerm.trim();

  const condition = `
    (
      to_tsvector('simple',
        COALESCE(code, '') || ' ' ||
        COALESCE(name_ko, '') || ' ' ||
        COALESCE(name_en, '') || ' ' ||
        COALESCE(description_ko, '') || ' ' ||
        COALESCE(description_en, '')
      ) @@ plainto_tsquery('simple', $${paramIndex})
    )
  `.trim();

  return { condition, param: cleanedTerm };
}

/**
 * Escape special characters for ILIKE search
 * Prevents SQL injection in ILIKE patterns
 *
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeILike(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')  // Escape backslash
    .replace(/%/g, '\\%')    // Escape %
    .replace(/_/g, '\\_');   // Escape _
}

/**
 * Parse and clean search term
 * Removes special characters, extra spaces
 *
 * @param {string} searchTerm - Raw search term
 * @returns {string} Cleaned search term
 */
function cleanSearchTerm(searchTerm) {
  if (!searchTerm) return '';

  return searchTerm
    .trim()
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .substring(0, 100);     // Limit length to prevent abuse
}

/**
 * Check if search should use full-text search
 * Full-text search is beneficial for:
 * - Multi-word searches
 * - General searches across multiple fields
 * - Large result sets
 *
 * Use ILIKE for:
 * - Single exact field searches
 * - Prefix searches
 *
 * @param {string} searchTerm - Search term
 * @param {boolean} isGeneralSearch - Is this a general search across fields?
 * @returns {boolean} True if should use full-text search
 */
function shouldUseFullTextSearch(searchTerm, isGeneralSearch = true) {
  if (!searchTerm) return false;

  // Always use FTS for general searches
  if (isGeneralSearch) return true;

  // Use FTS for multi-word searches
  const words = searchTerm.trim().split(/\s+/);
  if (words.length > 1) return true;

  // Use FTS for longer terms (> 2 characters)
  if (searchTerm.trim().length > 2) return true;

  return false;
}

module.exports = {
  buildUserSearchCondition,
  buildUserSearchWithRanking,
  buildDepartmentSearchCondition,
  buildMenuSearchCondition,
  buildProgramSearchCondition,
  buildILikePattern,
  escapeILike,
  cleanSearchTerm,
  shouldUseFullTextSearch,
};
