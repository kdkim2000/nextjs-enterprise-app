/**
 * Token 관련 타입 정의
 * 서비스에서 사용하는 JWT 토큰 관련 타입
 */

/**
 * JWT 토큰 페이로드
 */
export interface TokenPayload {
  userId: string;
  loginid: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * 토큰 검증 결과
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * 토큰 쌍 (Access + Refresh)
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * 토큰 블랙리스트 엔트리
 */
export interface TokenBlacklistEntry {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}
