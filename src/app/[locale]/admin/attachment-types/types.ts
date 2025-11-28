import { MultiLangField } from '@/lib/i18n/multiLang';

export interface AttachmentType {
  id?: string;
  code: string;
  name: MultiLangField;
  description: MultiLangField;
  storagePath: string;
  maxFileCount: number;
  maxFileSize: number;
  maxTotalSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  status: 'active' | 'inactive';
  order: number;
  createdAt?: string;
  updatedAt?: string;
  // Form fields (flattened for editing)
  nameEn?: string;
  nameKo?: string;
  nameZh?: string;
  nameVi?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
}

export interface SearchCriteria {
  code: string;
  name: string;
  status: string;
  [key: string]: string | string[] | undefined;
}
