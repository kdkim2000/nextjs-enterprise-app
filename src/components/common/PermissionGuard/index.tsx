'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';

export interface PermissionGuardProps {
  /**
   * Required permission(s)
   */
  permission?: string | string[];

  /**
   * Required role(s)
   */
  role?: string | string[];

  /**
   * User's permissions
   */
  userPermissions?: string[];

  /**
   * User's roles
   */
  userRoles?: string[];

  /**
   * Children to render if authorized
   */
  children: React.ReactNode;

  /**
   * Fallback content when not authorized
   */
  fallback?: React.ReactNode;

  /**
   * Hide instead of showing fallback
   */
  hideOnUnauthorized?: boolean;

  /**
   * Require all permissions/roles (AND logic) or any (OR logic)
   */
  requireAll?: boolean;
}

export default function PermissionGuard({
  permission,
  role,
  userPermissions = [],
  userRoles = [],
  children,
  fallback,
  hideOnUnauthorized = false,
  requireAll = false
}: PermissionGuardProps) {
  // Check permissions
  const hasPermission = () => {
    if (!permission) return true;

    const requiredPermissions = Array.isArray(permission) ? permission : [permission];

    if (requireAll) {
      return requiredPermissions.every((p) => userPermissions.includes(p));
    } else {
      return requiredPermissions.some((p) => userPermissions.includes(p));
    }
  };

  // Check roles
  const hasRole = () => {
    if (!role) return true;

    const requiredRoles = Array.isArray(role) ? role : [role];

    if (requireAll) {
      return requiredRoles.every((r) => userRoles.includes(r));
    } else {
      return requiredRoles.some((r) => userRoles.includes(r));
    }
  };

  const isAuthorized = hasPermission() && hasRole();

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (hideOnUnauthorized) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default unauthorized UI
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Lock sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body2" color="text.secondary">
        You don&apos;t have permission to view this content.
      </Typography>
    </Box>
  );
}

// Hook version for programmatic checks
export function usePermission(
  permission: string | string[],
  userPermissions: string[] = [],
  requireAll: boolean = false
): boolean {
  const requiredPermissions = Array.isArray(permission) ? permission : [permission];

  if (requireAll) {
    return requiredPermissions.every((p) => userPermissions.includes(p));
  } else {
    return requiredPermissions.some((p) => userPermissions.includes(p));
  }
}

export function useRole(
  role: string | string[],
  userRoles: string[] = [],
  requireAll: boolean = false
): boolean {
  const requiredRoles = Array.isArray(role) ? role : [role];

  if (requireAll) {
    return requiredRoles.every((r) => userRoles.includes(r));
  } else {
    return requiredRoles.some((r) => userRoles.includes(r));
  }
}
