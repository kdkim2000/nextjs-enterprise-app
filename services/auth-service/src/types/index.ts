/**
 * Auth Service Types
 */

export interface User {
  id: string;
  loginid: string;
  password: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  phone?: string;
  status: string;
  mfa_enabled: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
  requireMFA?: boolean;
  mfaToken?: string;
}

export interface UserInfo {
  id: string;
  loginid: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  permissions?: string[];
}

export interface MFAVerifyRequest {
  mfaToken: string;
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  loginid: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface MFACode {
  id: string;
  user_id: string;
  code: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface TokenBlacklist {
  id: string;
  token: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: TokenPayload;
}
