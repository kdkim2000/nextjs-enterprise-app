export interface User {
  id: string;
  loginid: string;
  username?: string; // backward compatibility
  name_ko: string;
  name_en?: string;
  name?: string; // backward compatibility
  email: string;
  employee_number?: string;
  system_key?: string;
  phone_number?: string;
  mobile_number?: string;
  user_category?: 'regular' | 'contractor' | 'temporary' | 'external' | 'admin';
  position?: string;
  role: string;
  department: string;
  status: string;
  mfaEnabled?: boolean;
  ssoEnabled?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
  lastPasswordChanged?: string | null;
  avatarUrl?: string;
  avatar_image?: string; // Base64 encoded image from DB
  password?: string;
}

export interface SearchCriteria {
  loginid: string;
  username?: string; // backward compatibility
  name_ko: string;
  name_en: string;
  name?: string; // backward compatibility
  email: string;
  employee_number: string;
  phone_number?: string;
  mobile_number?: string;
  position: string;
  role: string;
  department: string; // Single department selection
  status: string;
  user_category: string;
  [key: string]: string | string[] | undefined;
}
