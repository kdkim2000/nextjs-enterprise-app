import { MultiLangField } from '@/lib/i18n/multiLang';

// Local types for program management page
export interface ProgramPermission {
  code: string;
  name: MultiLangField;
  description: MultiLangField;
  isDefault?: boolean;
}

export interface Program {
  id?: string;
  code: string;
  name: MultiLangField;
  description: MultiLangField;
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
