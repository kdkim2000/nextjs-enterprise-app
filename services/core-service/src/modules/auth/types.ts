/**
 * Auth Module Types
 */

export interface User {
  id: string;
  loginid: string;
  password: string;
  name_ko?: string;
  name_en?: string;
  email?: string;
  role?: string;
  department?: string;
  position?: string;
  phone_number?: string;
  mobile_number?: string;
  status?: string;
  mfa_enabled?: boolean;
  sso_enabled?: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
  employee_number?: string;
  avatar_url?: string;
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
  name_ko?: string;
  name_en?: string;
  email?: string;
  role?: string;
  department?: string;
  position?: string;
  avatarUrl?: string;
  employee_number?: string;
  phone_number?: string;
  mobile_number?: string;
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
