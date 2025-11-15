import { useMemo } from 'react';
import { useProgramPermissions } from '@/contexts/PermissionContext';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

/**
 * usePermissionControl - 프로그램 권한을 편리하게 사용하기 위한 Hook
 *
 * @param programCode - 프로그램 코드 (예: 'PROG-USER-LIST')
 * @returns 권한 체크 함수 및 권한 상태 객체
 *
 * @example
 * ```tsx
 * function UserListPage() {
 *   const { can, permissions } = usePermissionControl('PROG-USER-LIST');
 *
 *   return (
 *     <>
 *       {can('create') && (
 *         <Button onClick={handleAdd}>Add User</Button>
 *       )}
 *       {can('delete') && (
 *         <Button onClick={handleDelete}>Delete</Button>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function usePermissionControl(programCode: string) {
  const permissions = useProgramPermissions(programCode);

  /**
   * 특정 액션에 대한 권한이 있는지 확인
   * @param action - 권한 액션 타입
   * @returns 권한 여부
   */
  const can = useMemo(() => {
    return (action: PermissionAction): boolean => {
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
    };
  }, [permissions]);

  /**
   * 여러 액션에 대한 권한이 모두 있는지 확인
   * @param actions - 권한 액션 타입 배열
   * @returns 모든 권한 여부
   */
  const canAll = useMemo(() => {
    return (...actions: PermissionAction[]): boolean => {
      return actions.every((action) => can(action));
    };
  }, [can]);

  /**
   * 여러 액션 중 하나라도 권한이 있는지 확인
   * @param actions - 권한 액션 타입 배열
   * @returns 하나라도 권한이 있는지 여부
   */
  const canAny = useMemo(() => {
    return (...actions: PermissionAction[]): boolean => {
      return actions.some((action) => can(action));
    };
  }, [can]);

  return {
    // 권한 체크 함수
    can,
    canAll,
    canAny,

    // 개별 권한 상태
    canView: permissions.canView,
    canCreate: permissions.canCreate,
    canUpdate: permissions.canUpdate,
    canDelete: permissions.canDelete,
    hasAccess: permissions.hasAccess,

    // 기타
    loading: permissions.loading,
    permissions: permissions.permissions
  };
}

/**
 * useDataGridPermissions - DataGrid용 권한 설정 Helper
 *
 * @param programCode - 프로그램 코드
 * @returns DataGrid에서 사용할 수 있는 권한 설정 객체
 *
 * @example
 * ```tsx
 * function UserListPage() {
 *   const gridPermissions = useDataGridPermissions('PROG-USER-LIST');
 *
 *   return (
 *     <ExcelDataGrid
 *       rows={users}
 *       columns={columns}
 *       {...gridPermissions}
 *     />
 *   );
 * }
 * ```
 */
export function useDataGridPermissions(programCode: string) {
  const { canCreate, canUpdate, canDelete } = usePermissionControl(programCode);

  return useMemo(
    () => ({
      // Add 버튼 표시 여부
      showAddButton: canCreate,
      // Delete 버튼 표시 여부
      showDeleteButton: canDelete,
      // Edit 기능 사용 여부
      editable: canUpdate,
      // Checkbox 선택 가능 여부 (삭제 권한이 있을 때만)
      checkboxSelection: canDelete
    }),
    [canCreate, canUpdate, canDelete]
  );
}
