'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProgramPermissions } from '@/contexts/PermissionContext';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

interface RouteGuardProps {
  children: ReactNode;
  programCode?: string;
  requiredPermission?: 'view' | 'create' | 'update' | 'delete';
  fallbackUrl?: string;
}

export default function RouteGuard({
  children,
  programCode,
  requiredPermission = 'view',
  fallbackUrl = '/dashboard'
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    hasAccess,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    loading: permLoading
  } = useProgramPermissions(programCode || '');


  // Only redirect to login if not authenticated - NO OTHER REDIRECTS
  useEffect(() => {
    // Skip auth check for public routes
    const isPublicRoute = pathname.endsWith('/login') || pathname === '/' || pathname.match(/^\/[a-z]{2}$/);
    if (isPublicRoute || authLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : 'en';
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, user, authLoading, pathname, router]);

  // Show loading while checking auth/permissions
  if (authLoading || (programCode && permLoading)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, don't render children (will redirect in useEffect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // If programCode specified, check permissions and show error if no access
  if (programCode) {
    let hasRequiredPermission = false;

    switch (requiredPermission) {
      case 'view':
        hasRequiredPermission = canView;
        break;
      case 'create':
        hasRequiredPermission = canCreate;
        break;
      case 'update':
        hasRequiredPermission = canUpdate;
        break;
      case 'delete':
        hasRequiredPermission = canDelete;
        break;
    }

    // Show access denied message instead of redirecting
    if (!hasAccess || !hasRequiredPermission) {
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : 'en';

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3
          }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500
            }}
          >
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You don't have permission to access this page.
              <br />
              Required: <strong>{requiredPermission}</strong> permission for <strong>{programCode}</strong>
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(`/${locale}${fallbackUrl}`)}
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Box>
      );
    }
  }

  return <>{children}</>;
}
