export interface User {
  id: string;
  loginid: string;
  username?: string; // backward compatibility
  name_ko: string;
  name_en?: string;
  name?: string; // backward compatibility
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  avatarUrl?: string;
  avatar_image?: string;
  employee_number?: string;
  phone_number?: string;
  mobile_number?: string;
  user_category?: 'regular' | 'contractor' | 'temporary' | 'external' | 'admin';
  position?: string;
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
