/**
 * Inspection Service - Type Definitions
 */

// ==========================================
// Checksheet Template Types
// ==========================================
export interface ChecksheetTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  version: number;
  status: 'active' | 'inactive' | 'archived';
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChecksheetTemplateCreateRequest {
  code: string;
  name: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface ChecksheetTemplateUpdateRequest {
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
}

// ==========================================
// Checksheet Item Types
// ==========================================
export type ItemType = 'checkbox' | 'text' | 'number' | 'select' | 'photo' | 'signature' | 'date' | 'time';

export interface ChecksheetItem {
  id: string;
  template_id: string;
  parent_id?: string;
  sort_order: number;
  item_code?: string;
  item_name: string;
  item_type: ItemType;
  options?: ItemOptions;
  required: boolean;
  description?: string;
  created_at: Date;
}

export interface ItemOptions {
  // For select type
  choices?: { value: string; label: string }[];
  // For number type
  min?: number;
  max?: number;
  unit?: string;
  // For text type
  maxLength?: number;
  placeholder?: string;
  // For photo type
  maxPhotos?: number;
  // Common
  defaultValue?: any;
}

export interface ChecksheetItemCreateRequest {
  template_id: string;
  parent_id?: string;
  sort_order: number;
  item_code?: string;
  item_name: string;
  item_type: ItemType;
  options?: ItemOptions;
  required?: boolean;
  description?: string;
}

export interface ChecksheetItemUpdateRequest {
  parent_id?: string;
  sort_order?: number;
  item_code?: string;
  item_name?: string;
  item_type?: ItemType;
  options?: ItemOptions;
  required?: boolean;
  description?: string;
}

// ==========================================
// Inspection Types
// ==========================================
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'submitted';
export type SyncStatus = 'synced' | 'pending' | 'conflict';

export interface Inspection {
  id: string;
  template_id: string;
  inspection_code: string;
  target_name?: string;
  target_id?: string;
  inspector_id?: string;
  status: InspectionStatus;
  started_at?: Date;
  completed_at?: Date;
  submitted_at?: Date;
  location?: string;
  notes?: string;
  sync_status: SyncStatus;
  client_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InspectionCreateRequest {
  template_id: string;
  inspection_code?: string;
  target_name?: string;
  target_id?: string;
  location?: string;
  notes?: string;
  client_id?: string;
}

export interface InspectionUpdateRequest {
  target_name?: string;
  target_id?: string;
  status?: InspectionStatus;
  location?: string;
  notes?: string;
}

// ==========================================
// Inspection Result Types
// ==========================================
export interface InspectionResult {
  id: string;
  inspection_id: string;
  item_id: string;
  value?: string;
  value_type?: 'text' | 'number' | 'boolean' | 'json';
  is_passed?: boolean;
  remarks?: string;
  photo_urls?: string[];
  recorded_at: Date;
  offline_created_at?: Date;
  sync_version: number;
}

export interface InspectionResultCreateRequest {
  item_id: string;
  value?: string;
  value_type?: 'text' | 'number' | 'boolean' | 'json';
  is_passed?: boolean;
  remarks?: string;
  photo_urls?: string[];
  offline_created_at?: Date;
}

export interface InspectionResultUpdateRequest {
  value?: string;
  value_type?: 'text' | 'number' | 'boolean' | 'json';
  is_passed?: boolean;
  remarks?: string;
  photo_urls?: string[];
}

// ==========================================
// Sync Types
// ==========================================
export interface SyncDownloadRequest {
  template_ids?: string[];
  include_items?: boolean;
}

export interface SyncDownloadResponse {
  templates: ChecksheetTemplate[];
  items: ChecksheetItem[];
  sync_timestamp: Date;
}

export interface SyncUploadRequest {
  client_id: string;
  inspections: OfflineInspection[];
}

export interface OfflineInspection {
  local_id: string;
  template_id: string;
  inspection_code: string;
  target_name?: string;
  target_id?: string;
  location?: string;
  notes?: string;
  status: InspectionStatus;
  started_at?: Date;
  completed_at?: Date;
  results: OfflineInspectionResult[];
  created_at: Date;
}

export interface OfflineInspectionResult {
  local_id: string;
  item_id: string;
  value?: string;
  value_type?: 'text' | 'number' | 'boolean' | 'json';
  is_passed?: boolean;
  remarks?: string;
  photo_urls?: string[];
  recorded_at: Date;
}

export interface SyncUploadResponse {
  synced_count: number;
  failed_count: number;
  conflicts: SyncConflict[];
  id_mappings: { local_id: string; server_id: string }[];
}

export interface SyncConflict {
  local_id: string;
  server_id?: string;
  entity_type: 'inspection' | 'result';
  conflict_type: 'duplicate' | 'version_mismatch' | 'deleted';
  message: string;
}

// ==========================================
// API Response Types
// ==========================================
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
