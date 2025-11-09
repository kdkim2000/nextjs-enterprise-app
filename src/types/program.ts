/**
 * Program Type Definitions
 *
 * Programs represent functional units in the application that can have permissions,
 * configurations, and be linked to menus. Each program can define specific access
 * controls and operational parameters.
 */

export interface Program {
  id: string;
  code: string; // Unique program code (e.g., PROG-USER-MGMT)
  name: {
    en: string;
    ko: string;
  };
  description: {
    en: string;
    ko: string;
  };
  category: string; // Program category (e.g., 'admin', 'user', 'report')
  type: 'page' | 'function' | 'api' | 'report'; // Program type
  status: 'active' | 'inactive' | 'development'; // Program status
  permissions: ProgramPermission[]; // Available permissions for this program
  config?: ProgramConfig; // Optional configuration
  metadata?: {
    version?: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
  };
}

export interface ProgramPermission {
  code: string; // Permission code (e.g., 'READ', 'WRITE', 'DELETE')
  name: {
    en: string;
    ko: string;
  };
  description: {
    en: string;
    ko: string;
  };
  isDefault?: boolean; // Whether this permission is granted by default
}

export interface ProgramConfig {
  // UI Configuration
  ui?: {
    icon?: string;
    color?: string;
    layout?: string;
  };

  // Access Control
  access?: {
    requiresAuth?: boolean;
    requiresMFA?: boolean;
    allowedRoles?: string[];
    ipWhitelist?: string[];
  };

  // Feature Flags
  features?: {
    export?: boolean;
    import?: boolean;
    bulkOperation?: boolean;
    advancedSearch?: boolean;
  };

  // API Configuration
  api?: {
    endpoint?: string;
    method?: string;
    timeout?: number;
    rateLimit?: number;
  };

  // Additional settings
  settings?: Record<string, unknown>;
}

export interface ProgramFormData {
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

export interface ProgramSearchCriteria {
  code: string;
  name: string;
  category: string;
  type: string;
  status: string;
  [key: string]: string | string[];
}

// Program Categories
export const PROGRAM_CATEGORIES = [
  'admin',
  'user',
  'report',
  'system',
  'dashboard',
  'analytics',
  'configuration'
] as const;

// Program Types
export const PROGRAM_TYPES = [
  'page',
  'function',
  'api',
  'report'
] as const;

// Program Status
export const PROGRAM_STATUS = [
  'active',
  'inactive',
  'development'
] as const;

// Default Permissions
export const DEFAULT_PERMISSIONS = [
  { code: 'READ', nameEn: 'Read', nameKo: '읽기', descriptionEn: 'View data', descriptionKo: '데이터 조회' },
  { code: 'WRITE', nameEn: 'Write', nameKo: '쓰기', descriptionEn: 'Create and update data', descriptionKo: '데이터 생성 및 수정' },
  { code: 'DELETE', nameEn: 'Delete', nameKo: '삭제', descriptionEn: 'Delete data', descriptionKo: '데이터 삭제' },
  { code: 'EXPORT', nameEn: 'Export', nameKo: '내보내기', descriptionEn: 'Export data', descriptionKo: '데이터 내보내기' },
  { code: 'IMPORT', nameEn: 'Import', nameKo: '가져오기', descriptionEn: 'Import data', descriptionKo: '데이터 가져오기' },
  { code: 'ADMIN', nameEn: 'Admin', nameKo: '관리', descriptionEn: 'Full administrative access', descriptionKo: '전체 관리 권한' }
] as const;
