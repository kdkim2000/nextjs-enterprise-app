export interface Department {
  id: string;
  code: string;
  name: {
    en: string;
    ko: string;
  };
  description: {
    en: string;
    ko: string;
  };
  parentId: string | null;
  managerId: string | null;
  level: number;
  order: number;
  status: 'active' | 'inactive';
  email: string;
  phone: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchCriteria {
  code: string;
  name: string;
  parentId: string;
  managerId: string;
  status: string;
  location: string;
  [key: string]: string | string[];
}

export interface DepartmentFormData {
  code: string;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
  parentId: string;
  managerId: string;
  status: 'active' | 'inactive';
  email: string;
  phone: string;
  location: string;
  order: number;
}
