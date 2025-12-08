/**
 * JWT 유틸리티
 */

import jwt from 'jsonwebtoken';
import { JwtPayload, TokenValidationResult } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Access Token 생성
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Refresh Token 생성
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Access Token 검증
 */
export function verifyToken(token: string): TokenValidationResult {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return {
      valid: true,
      user: {
        id: decoded.userId,
        loginid: decoded.loginid,
        name_ko: '', // 필요시 DB에서 조회
        email: '',
        role: decoded.role,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Token verification failed',
    };
  }
}

/**
 * Refresh Token 검증
 */
export function verifyRefreshToken(token: string): TokenValidationResult {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    return {
      valid: true,
      user: {
        id: decoded.userId,
        loginid: decoded.loginid,
        name_ko: '',
        email: '',
        role: decoded.role,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Refresh token verification failed',
    };
  }
}

/**
 * Token에서 Payload 추출 (검증 없이)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Authorization 헤더에서 토큰 추출
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
