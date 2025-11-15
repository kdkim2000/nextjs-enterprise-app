'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/axios';

export interface ProgramPermission {
  programCode: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface PermissionContextType {
  permissions: Map<string, ProgramPermission>;
  loading: boolean;
  hasAccess: (programCode: string) => boolean;
  canView: (programCode: string) => boolean;
  canCreate: (programCode: string) => boolean;
  canUpdate: (programCode: string) => boolean;
  canDelete: (programCode: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Map<string, ProgramPermission>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions(new Map());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // api.get already returns response.data, not the full response object
      const data = await api.get<{ permissions: any[] }>('/user/permissions');

      // Add defensive check for response data
      if (!data) {
        console.error('Invalid response from permissions endpoint:', data);
        setPermissions(new Map());
        return;
      }

      const permissionsData = data.permissions || [];

      const permMap = new Map<string, ProgramPermission>();
      permissionsData.forEach((perm: any) => {
        permMap.set(perm.programCode, {
          programCode: perm.programCode,
          canView: perm.canView || false,
          canCreate: perm.canCreate || false,
          canUpdate: perm.canUpdate || false,
          canDelete: perm.canDelete || false
        });
      });

      setPermissions(permMap);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions(new Map());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    void fetchPermissions();
  }, [fetchPermissions]);

  const hasAccess = useCallback((programCode: string): boolean => {
    const perm = permissions.get(programCode);
    return perm?.canView || false;
  }, [permissions]);

  const canView = useCallback((programCode: string): boolean => {
    const perm = permissions.get(programCode);
    return perm?.canView || false;
  }, [permissions]);

  const canCreate = useCallback((programCode: string): boolean => {
    const perm = permissions.get(programCode);
    return perm?.canCreate || false;
  }, [permissions]);

  const canUpdate = useCallback((programCode: string): boolean => {
    const perm = permissions.get(programCode);
    return perm?.canUpdate || false;
  }, [permissions]);

  const canDelete = useCallback((programCode: string): boolean => {
    const perm = permissions.get(programCode);
    return perm?.canDelete || false;
  }, [permissions]);

  const refreshPermissions = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);

  const value: PermissionContextType = useMemo(() => ({
    permissions,
    loading,
    hasAccess,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    refreshPermissions
  }), [permissions, loading, hasAccess, canView, canCreate, canUpdate, canDelete, refreshPermissions]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

/**
 * Hook to check program permissions
 * @param programCode - Program code to check permissions for
 * @returns Object with permission flags
 */
export function useProgramPermissions(programCode: string) {
  const { permissions, loading, hasAccess, canView, canCreate, canUpdate, canDelete } = usePermissions();

  return {
    hasAccess: hasAccess(programCode),
    canView: canView(programCode),
    canCreate: canCreate(programCode),
    canUpdate: canUpdate(programCode),
    canDelete: canDelete(programCode),
    loading,
    permissions: permissions.get(programCode)
  };
}
