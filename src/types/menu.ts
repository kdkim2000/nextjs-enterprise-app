export interface MenuItem {
  id: string;
  code: string;
  name: {
    en: string;
    ko: string;
    zh: string;
    vi: string;
  };
  path: string;
  icon: string;
  order: number;
  parentId: string | null;
  level: number;
  programId: string | null;
  description: {
    en: string;
    ko: string;
    zh: string;
    vi: string;
  };
  children?: MenuItem[];
}

export interface MenuPermission {
  userId: string;
  role: string;
  permissions: string[];
  menuAccess: string[];
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  favoriteMenus: string[];
  recentMenus: string[];
  language: 'en' | 'ko' | 'zh' | 'vi';
  theme: 'light' | 'dark';
  updatedAt?: string;
}
