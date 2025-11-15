'use client';

import React, { ReactNode } from 'react';
import { useProgramPermissions } from '@/contexts/PermissionContext';
import { Alert, Box } from '@mui/material';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

export interface PermissionGuardProps {
  programCode: string;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

/**
 * PermissionGuard - 권한에 따라 컴포넌트를 조건부 렌더링
 *
 * @param programCode - 프로그램 코드 (예: 'PROG-USER-LIST')
 * @param action - 필요한 권한 타입 ('view' | 'create' | 'update' | 'delete')
 * @param children - 권한이 있을 때 표시할 컴포넌트
 * @param fallback - 권한이 없을 때 표시할 컴포넌트 (기본값: null)
 * @param showAccessDenied - 권한 없을 때 "접근 권한 없음" 메시지 표시 (기본값: false)
 *
 * @example
 * ```tsx
 * <PermissionGuard programCode="PROG-USER-LIST" action="create">
 *   <Button onClick={handleAdd}>Add User</Button>
 * </PermissionGuard>
 * ```
 *
 * @example
 * ```tsx
 * <PermissionGuard
 *   programCode="PROG-USER-LIST"
 *   action="delete"
 *   showAccessDenied
 * >
 *   <Button onClick={handleDelete}>Delete</Button>
 * </PermissionGuard>
 * ```
 */
export default function PermissionGuard({
  programCode,
  action,
  children,
  fallback = null,
  showAccessDenied = false
}: PermissionGuardProps) {
  const permissions = useProgramPermissions(programCode);

  // 권한 체크
  const hasPermission = React.useMemo(() => {
    switch (action) {
      case 'view':
        return permissions.canView;
      case 'create':
        return permissions.canCreate;
      case 'update':
        return permissions.canUpdate;
      case 'delete':
        return permissions.canDelete;
      default:
        return false;
    }
  }, [action, permissions]);

  // 로딩 중
  if (permissions.loading) {
    return null;
  }

  // 권한 없음
  if (!hasPermission) {
    if (showAccessDenied) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="warning">
            이 기능을 사용할 권한이 없습니다.
          </Alert>
        </Box>
      );
    }
    return <>{fallback}</>;
  }

  // 권한 있음
  return <>{children}</>;
}
