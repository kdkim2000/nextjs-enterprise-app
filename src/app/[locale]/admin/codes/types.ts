export interface CodeType {
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
  order: number;
  status: 'active' | 'inactive';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Code {
  id: string;
  codeType: string;
  code: string;
  name: {
    en: string;
    ko: string;
  };
  description: {
    en: string;
    ko: string;
  };
  order: number;
  status: 'active' | 'inactive';
  parentCode: string | null;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchCriteria {
  codeType: string;
  code: string;
  status: string;
  [key: string]: string | string[];
}
