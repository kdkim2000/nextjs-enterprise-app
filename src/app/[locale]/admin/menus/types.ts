import { MultiLangField } from '@/lib/i18n/multiLang';

export interface Menu {
  id: string;
  code: string;
  name: MultiLangField;
  path: string;
  icon: string;
  order: number;
  parentId: string | null;
  level: number;
  programId: string;
  description: MultiLangField;
}

export interface MenuFormData {
  id?: string;
  code: string;
  nameEn: string;
  nameKo: string;
  nameZh: string;
  nameVi: string;
  path: string;
  icon: string;
  order: number;
  parentId: string | null;
  level: number;
  programId: string;
  descriptionEn: string;
  descriptionKo: string;
  descriptionZh: string;
  descriptionVi: string;
}

export interface SearchCriteria {
  code: string;
  name: string;
  path: string;
  icon: string;
  level: string;
  parentId: string;
  programId: string;
  [key: string]: string | string[];
}
