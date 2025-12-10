/**
 * User 관련 타입 정의
 */

export interface User {
  id: string;
  loginid: string;
  name_ko: string;
  name_en?: string;
  email: string;
  role: string;
  department_id?: string;
  employee_number?: string;
  phone_number?: string;
  user_category?: string;
  avatar_image?: string;
  position?: string;
  status: UserStatus;
  mfa_enabled?: boolean;
  created_at: Date;
  updated_at: Date;
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserBasic {
  id: string;
  loginid: string;
  name_ko: string;
  name_en?: string;
  email: string;
  role: string;
}

export interface UserProfile extends UserBasic {
  department_id?: string;
  department_name?: string;
  employee_number?: string;
  phone_number?: string;
  avatar_image?: string;
  position?: string;
}

export interface CreateUserDto {
  loginid: string;
  password: string;
  name_ko: string;
  name_en?: string;
  email: string;
  role?: string;
  department_id?: string;
  employee_number?: string;
  phone_number?: string;
  user_category?: string;
  position?: string;
}

export interface UpdateUserDto {
  name_ko?: string;
  name_en?: string;
  email?: string;
  role?: string;
  department_id?: string;
  employee_number?: string;
  phone_number?: string;
  user_category?: string;
  avatar_image?: string;
  position?: string;
  status?: UserStatus;
}
