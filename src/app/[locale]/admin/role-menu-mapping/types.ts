// Program-Role Mapping Types

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
}

export interface Program {
  id: string;
  code: string;
  name: {
    en: string;
    ko: string;
  };
  description?: {
    en: string;
    ko: string;
  };
  category: string;
  type: string;
  status: string;
  permissions?: Array<{
    code: string;
    name: { en: string; ko: string };
    description?: { en: string; ko: string };
    isDefault?: boolean;
  }>;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface Menu {
  id: string;
  code: string;
  name: {
    en: string;
    ko: string;
  };
  path?: string;
  icon?: string;
  parentId?: string | null;
  order?: number;
  isActive: boolean;
  programId?: string;
  children?: Menu[];
}

export interface RoleProgramMapping {
  id: string;
  roleId: string;
  programId: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;

  // Extended fields from API
  roleName?: string;
  roleDisplayName?: string;
  programCode?: string;
  programName?: {
    en: string;
    ko: string;
  };
}

export interface SearchCriteria {
  roleName: string;
  roleDisplayName: string;
  permissions: string; // 'view', 'create', 'update', 'delete', 'full'
}

export interface PermissionFormData {
  id: string;
  roleId: string;
  roleName: string;
  roleDisplayName: string;
  programId: string;
  programCode: string;
  programName: {
    en: string;
    ko: string;
  };
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}
