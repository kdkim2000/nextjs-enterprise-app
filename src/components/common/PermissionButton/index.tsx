'use client';

import React, { ReactNode } from 'react';
import { Button, ButtonProps, Tooltip } from '@mui/material';
import { useProgramPermissions } from '@/contexts/PermissionContext';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

export interface PermissionButtonProps extends Omit<ButtonProps, 'disabled'> {
  programCode: string;
  action: PermissionAction;
  children: ReactNode;
  disableTooltip?: string;
  hideIfNoPermission?: boolean;
  forceDisabled?: boolean;
}

/**
 * PermissionButton - 권한에 따라 버튼을 제어하는 컴포넌트
 *
 * @param programCode - 프로그램 코드 (예: 'PROG-USER-LIST')
 * @param action - 필요한 권한 타입 ('view' | 'create' | 'update' | 'delete')
 * @param hideIfNoPermission - true면 권한 없을 때 숨김, false면 비활성화 (기본값: false)
 * @param disableTooltip - 비활성화 시 표시할 툴팁 메시지
 * @param forceDisabled - 강제로 비활성화 (권한과 무관하게)
 *
 * @example
 * ```tsx
 * <PermissionButton
 *   programCode="PROG-USER-LIST"
 *   action="create"
 *   onClick={handleAdd}
 *   variant="contained"
 * >
 *   Add User
 * </PermissionButton>
 * ```
 */
export default function PermissionButton({
  programCode,
  action,
  children,
  disableTooltip,
  hideIfNoPermission = false,
  forceDisabled = false,
  ...buttonProps
}: PermissionButtonProps) {
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

  // 권한 없을 때 숨김 처리
  if (hideIfNoPermission && !hasPermission) {
    return null;
  }

  // 비활성화 여부
  const isDisabled = forceDisabled || !hasPermission;

  // 비활성화된 버튼
  const button = (
    <Button {...buttonProps} disabled={isDisabled}>
      {children}
    </Button>
  );

  // 툴팁 표시
  if (isDisabled && disableTooltip) {
    return (
      <Tooltip title={disableTooltip} arrow>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
}
