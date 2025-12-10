/**
 * 유효성 검증 유틸리티
 */

/**
 * 이메일 유효성 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * UUID 유효성 검증
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 전화번호 유효성 검증 (한국)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(01[016789]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
}

/**
 * 필수 필드 검증
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === ''
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * 문자열 길이 검증
 */
export function validateLength(
  value: string,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (value.length < min) {
    return { valid: false, error: `최소 ${min}자 이상이어야 합니다.` };
  }
  if (value.length > max) {
    return { valid: false, error: `최대 ${max}자를 초과할 수 없습니다.` };
  }
  return { valid: true };
}

/**
 * 숫자 범위 검증
 */
export function validateRange(
  value: number,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (value < min) {
    return { valid: false, error: `최소값은 ${min}입니다.` };
  }
  if (value > max) {
    return { valid: false, error: `최대값은 ${max}입니다.` };
  }
  return { valid: true };
}

/**
 * XSS 방지를 위한 문자열 이스케이프
 */
export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => escapeMap[char]);
}

/**
 * SQL Injection 방지를 위한 문자열 검증
 */
export function isSafeString(str: string): boolean {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
    /(--)|(;)|(\/\*)/,
    /(\bOR\b|\bAND\b).*=/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(str));
}

/**
 * 페이지네이션 파라미터 정규화
 */
export function normalizePagination(
  page?: number | string,
  limit?: number | string,
  maxLimit: number = 100
): { page: number; limit: number; offset: number } {
  const normalizedPage = Math.max(1, parseInt(String(page)) || 1);
  const normalizedLimit = Math.min(maxLimit, Math.max(1, parseInt(String(limit)) || 20));
  const offset = (normalizedPage - 1) * normalizedLimit;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset,
  };
}
