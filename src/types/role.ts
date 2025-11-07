export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  roleType: 'management' | 'general'; // management: 관리용 역할, general: 일반 역할
  manager: string | null; // User ID of the role manager (관리자)
  representative: string | null; // User ID of the role representative (담당자)
  isSystem: boolean; // System roles cannot be deleted
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface RoleFormData {
  name: string;
  displayName: string;
  description: string;
  roleType: 'management' | 'general';
  manager: string | null;
  representative: string | null;
  isActive: boolean;
}
