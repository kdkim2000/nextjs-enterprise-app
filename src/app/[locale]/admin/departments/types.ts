import { MultiLangField } from '@/lib/i18n/multiLang';

export interface Department {
  id: string;
  code: string;
  name: MultiLangField;
  description: MultiLangField;
  parentId: string | null;
  managerId: string | null;
  level: number;
  order: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface SearchCriteria {
  code: string;
  name: string;
  parentId: string;
  managerId: string;
  status: string;
  [key: string]: string | string[];
}

export interface DepartmentFormData {
  code: string;
  nameEn: string;
  nameKo: string;
  nameZh: string;
  nameVi: string;
  descriptionEn: string;
  descriptionKo: string;
  descriptionZh: string;
  descriptionVi: string;
  parentId: string;
  managerId: string;
  status: 'active' | 'inactive';
  order: number;
}
