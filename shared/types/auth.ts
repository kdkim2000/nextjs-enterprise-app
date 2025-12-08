/**
 * Auth 관련 타입 정의
 */

import { UserBasic } from './user';

export interface LoginRequest {
  loginid: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserBasic;
  mfaRequired?: boolean;
  mfaUserId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface MfaVerifyRequest {
  userId: string;
  code: string;
}

export interface MfaVerifyResponse {
  token: string;
  refreshToken: string;
  user: UserBasic;
}

export interface JwtPayload {
  userId: string;
  loginid: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenValidationResult {
  valid: boolean;
  user?: UserBasic;
  error?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}
