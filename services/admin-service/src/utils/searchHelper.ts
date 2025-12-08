/**
 * Full-Text Search Helper
 */

/**
 * Build user search condition using Full-Text Search
 */
export function buildUserSearchCondition(searchTerm: string, paramIndex: number): { condition: string; param: string | null } {
  if (!searchTerm || searchTerm.trim() === '') {
    return { condition: '', param: null };
  }

  const cleanedTerm = searchTerm.trim();

  const condition = '(' +
    'to_tsvector(\'simple\', ' +
      'COALESCE(loginid, \'\') || \' \' || ' +
      'COALESCE(email, \'\') || \' \' || ' +
      'COALESCE(name_ko, \'\') || \' \' || ' +
      'COALESCE(name_en, \'\') || \' \' || ' +
      'COALESCE(employee_number, \'\')' +
    ') @@ plainto_tsquery(\'simple\', $' + paramIndex + ')' +
  ')';

  return { condition, param: cleanedTerm };
}

/**
 * Build menu search condition
 */
export function buildMenuSearchCondition(searchTerm: string, paramIndex: number): { condition: string; param: string | null } {
  if (!searchTerm || searchTerm.trim() === '') {
    return { condition: '', param: null };
  }

  const cleanedTerm = searchTerm.trim();

  const condition = '(' +
    'to_tsvector(\'simple\', ' +
      'COALESCE(code, \'\') || \' \' || ' +
      'COALESCE(name_ko, \'\') || \' \' || ' +
      'COALESCE(name_en, \'\') || \' \' || ' +
      'COALESCE(path, \'\')' +
    ') @@ plainto_tsquery(\'simple\', $' + paramIndex + ')' +
  ')';

  return { condition, param: cleanedTerm };
}

/**
 * Clean search term
 */
export function cleanSearchTerm(searchTerm: string): string {
  if (!searchTerm) return '';
  return searchTerm.trim().replace(/\s+/g, ' ').substring(0, 100);
}
