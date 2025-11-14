export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  roleType: 'management' | 'general';
  manager: string | null;
  representative: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  managerName?: string;
  representativeName?: string;
}

export interface OtherRole {
  roleId: string;
  roleName?: string;
  roleDisplayName?: string;
}

export interface UserRoleMapping {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
  userName?: string;
  userEmail?: string;
  userDepartment?: string;
  roleName?: string;
  roleDisplayName?: string;
  otherRoles?: OtherRole[]; // User's other active roles
  totalRoleCount?: number; // Total number of active roles for this user
}

export interface SearchCriteria {
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  status: string;
  [key: string]: string | string[];
}
