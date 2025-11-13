// User-Role Mapping Types
export interface UserRoleMapping {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  // Joined fields (optional, for display purposes)
  userName?: string;
  roleName?: string;
  roleDisplayName?: string;
}

// Role-Menu Mapping Types
export interface RoleMenuMapping {
  id: string;
  roleId: string;
  menuId: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  // Joined fields (optional, for display purposes)
  roleName?: string;
  roleDisplayName?: string;
  menuCode?: string;
  menuName?: string;
  menuPath?: string;
}
