export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  mfaRequired?: boolean;
  userId?: string;
  email?: string;
  devCode?: string;
  token?: string;
  refreshToken?: string;
  user?: User;
}

export interface MFAVerificationRequest {
  userId: string;
  code: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
