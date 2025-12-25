export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';
export type ItemType = 'checkbox' | 'text' | 'number' | 'select' | 'photo' | 'signature' | 'date' | 'time';

export interface Inspection {
  id: string;
  template_id: string;
  template_name?: string;
  template_code?: string;
  inspection_code: string;
  title: string;
  description?: string;
  inspector_id: string;
  inspector_name?: string;
  location?: string;
  inspection_date: string;
  status: InspectionStatus;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  results?: InspectionResult[];
}

export interface InspectionResult {
  id: string;
  inspection_id: string;
  item_id: string;
  item_code?: string;
  item_name?: string;
  item_type?: ItemType;
  value: string;
  notes?: string;
  remarks?: string; // Backend uses 'remarks', frontend uses 'notes'
  photo_url?: string;
  photo_urls?: string[]; // Array of photo data URLs or URLs
  created_at: string;
  updated_at: string;
}

export interface ChecksheetItem {
  id: string;
  template_id: string;
  parent_id?: string | null;
  item_code: string;
  item_name: string;
  item_type: ItemType;
  description?: string;
  options?: string | string[];
  required: boolean;
  sort_order: number;
  children?: ChecksheetItem[];
  level?: number;
}

export interface ChecksheetTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  status: string;
}

export interface SearchCriteria {
  inspection_code: string;
  template_id: string;
  inspector_id: string;
  status: string;
  location: string;
  date_from: string;
  date_to: string;
  [key: string]: string | string[] | undefined;
}
