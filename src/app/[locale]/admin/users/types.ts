export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  mfaEnabled?: boolean;
  ssoEnabled?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
  avatarUrl?: string;
  password?: string;
}

export interface SearchCriteria {
  username: string;
  name: string;
  email: string;
  role: string;
  department: string[];
  status: string;
  [key: string]: string | string[];
}
