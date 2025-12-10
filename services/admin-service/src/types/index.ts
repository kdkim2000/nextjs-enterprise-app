/**
 * Admin Service Types
 */

// User Types
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
  employee_number?: string;
  user_category?: string;
  status?: string;
  mfa_enabled?: boolean;
  sso_enabled?: boolean;
  avatar_url?: string;
  avatar_image?: string;
  last_login?: Date;
  last_password_changed?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreateRequest {
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
  employee_number?: string;
  user_category?: string;
  status?: string;
  avatar_url?: string;
  avatar_image?: string;
}

export interface UserUpdateRequest {
  name_ko?: string;
  name_en?: string;
  email?: string;
  role?: string;
  department?: string;
  position?: string;
  phone_number?: string;
  mobile_number?: string;
  employee_number?: string;
  user_category?: string;
  status?: string;
  mfa_enabled?: boolean;
  sso_enabled?: boolean;
  avatar_url?: string;
  avatar_image?: string;
}

// Role Types
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  role_type?: string;
  manager?: string;
  representative?: string;
  is_system?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export interface RoleCreateRequest {
  name: string;
  displayName: string;
  description?: string;
  roleType?: string;
  manager?: string;
  representative?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

export interface RoleUpdateRequest {
  name?: string;
  displayName?: string;
  description?: string;
  roleType?: string;
  manager?: string;
  representative?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

// Menu Types
export interface Menu {
  id: string;
  code: string;
  name_en?: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
  path?: string;
  icon?: string;
  parent_id?: string;
  level?: number;
  order?: number;
  program_id?: string;
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_vi?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface MenuCreateRequest {
  code: string;
  name: {
    en?: string;
    ko?: string;
    zh?: string;
    vi?: string;
  };
  path: string;
  icon?: string;
  parentId?: string;
  level: number;
  order: number;
  programId?: string;
  description?: {
    en?: string;
    ko?: string;
    zh?: string;
    vi?: string;
  };
}

export interface MenuUpdateRequest {
  code?: string;
  name?: {
    en?: string;
    ko?: string;
    zh?: string;
    vi?: string;
  };
  path?: string;
  icon?: string;
  parentId?: string;
  level?: number;
  order?: number;
  programId?: string;
  description?: {
    en?: string;
    ko?: string;
    zh?: string;
    vi?: string;
  };
}

// API Response Types
export interface MenuApiResponse {
  id: string;
  code: string;
  name: {
    en: string;
    ko: string;
    zh: string;
    vi: string;
  };
  path?: string;
  icon?: string;
  parentId?: string;
  level: number;
  order: number;
  programId?: string;
  description?: {
    en: string;
    ko: string;
    zh: string;
    vi: string;
  };
}

// Token Payload
export interface TokenPayload {
  userId: string;
  loginid: string;
  role: string;
  type: 'access' | 'refresh';
}

// Pagination
export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}
