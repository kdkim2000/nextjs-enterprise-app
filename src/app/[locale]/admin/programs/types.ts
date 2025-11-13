// Local types for program management page
export interface ProgramPermission {
  code: string;
  name: { en: string; ko: string };
  description: { en: string; ko: string };
  isDefault?: boolean;
}

export interface Program {
  id?: string;
  code: string;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
  category: string;
  type: 'page' | 'function' | 'api' | 'report';
  status: 'active' | 'inactive' | 'development';
  version?: string;
  author?: string;
  tags?: string;
  permissions?: ProgramPermission[];
}

export interface SearchCriteria {
  code: string;
  name: string;
  category: string;
  type: string;
  status: string;
  [key: string]: string | string[];
}
