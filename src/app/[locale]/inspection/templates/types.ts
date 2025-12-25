export type TemplateStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface ChecksheetTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  version: number;
  status: TemplateStatus;
  item_count?: number;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchCriteria {
  code: string;
  name: string;
  category: string;
  status: string;
  created_by: string;
  [key: string]: string | string[] | undefined;
}
