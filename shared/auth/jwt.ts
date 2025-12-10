/**
 * JWT Token Utilities
 * 서비스에서 사용하는 토큰 생성/검증 유틸리티
 */

import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/token';

// 환경 변수에서 시크릿 및 만료 시간 로드
const getJwtSecret = () => process.env.JWT_SECRET || 'your-jwt-secret-key';
const getJwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret-key';

const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Access Token 생성
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
  );
}

/**
 * Refresh Token 생성
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    getJwtRefreshSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
  );
}

/**
 * Access Token 검증
 */
export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

/**
 * Refresh Token 검증
 */
export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getJwtRefreshSecret()) as TokenPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

/**
 * 토큰 디코드 (검증 없이)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * 토큰 만료 시간 (초) 반환
 */
export function getTokenExpirationSeconds(token: string): number {
  const decoded = jwt.decode(token) as { exp?: number };
  if (!decoded?.exp) return 0;
  return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
}

/**
 * Authorization 헤더에서 토큰 추출
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * 토큰 쌍 생성 (Access + Refresh)
 */
export function generateTokenPair(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpirationSeconds,
  extractTokenFromHeader,
  generateTokenPair,
};
