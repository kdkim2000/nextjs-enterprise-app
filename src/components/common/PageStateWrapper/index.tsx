'use client';

import React, { ReactNode } from 'react';
import { Box, Alert, Skeleton, Typography, Button } from '@mui/material';
import { ErrorOutline, LockOutlined, SearchOff } from '@mui/icons-material';

export interface PageStateWrapperProps {
  /**
   * Loading state - shows skeleton when true
   */
  loading?: boolean;

  /**
   * Error state - shows error message when true
   */
  error?: boolean;

  /**
   * Error message to display
   */
  errorMessage?: string;

  /**
   * No permission state - shows permission denied message when true
   */
  noPermission?: boolean;

  /**
   * Permission denied message
   */
  noPermissionMessage?: string;

  /**
   * Not found state - shows not found message when true
   */
  notFound?: boolean;

  /**
   * Not found message
   */
  notFoundMessage?: string;

  /**
   * Empty state - shows empty message when true
   */
  empty?: boolean;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;

  /**
   * Skeleton height for loading state
   */
  skeletonHeight?: number | string;

  /**
   * Skeleton variant
   */
  skeletonVariant?: 'rectangular' | 'rounded' | 'circular' | 'text';

  /**
   * Number of skeleton rows
   */
  skeletonRows?: number;

  /**
   * Retry callback for error state
   */
  onRetry?: () => void;

  /**
   * Retry button label
   */
  retryLabel?: string;

  /**
   * Children to render when no special state
   */
  children: ReactNode;
}

/**
 * PageStateWrapper - Handles common page states (loading, error, permission, empty)
 *
 * Usage:
 * ```tsx
 * <PageStateWrapper
 *   loading={isLoading}
 *   error={hasError}
 *   errorMessage="Failed to load data"
 *   noPermission={!canRead}
 *   noPermissionMessage="You don't have permission to view this page"
 *   onRetry={handleRefresh}
 * >
 *   <YourPageContent />
 * </PageStateWrapper>
 * ```
 */
export default function PageStateWrapper({
  loading = false,
  error = false,
  errorMessage = 'An error occurred',
  noPermission = false,
  noPermissionMessage = 'You do not have permission to access this page',
  notFound = false,
  notFoundMessage = 'The requested resource was not found',
  empty = false,
  emptyMessage = 'No data available',
  loadingComponent,
  skeletonHeight = 400,
  skeletonVariant = 'rectangular',
  skeletonRows = 1,
  onRetry,
  retryLabel = 'Retry',
  children
}: PageStateWrapperProps) {
  // Loading state
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <Box sx={{ py: 4, width: '100%' }}>
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Skeleton
            key={index}
            variant={skeletonVariant}
            height={skeletonHeight}
            sx={{ mb: index < skeletonRows - 1 ? 2 : 0, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <ErrorOutline sx={{ fontSize: 64, color: 'error.main', opacity: 0.7 }} />
        <Typography variant="h6" color="text.secondary">
          {errorMessage}
        </Typography>
        {onRetry && (
          <Button variant="outlined" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </Box>
    );
  }

  // No permission state
  if (noPermission) {
    return (
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <LockOutlined sx={{ fontSize: 64, color: 'warning.main', opacity: 0.7 }} />
        <Typography variant="h6" color="text.secondary">
          {noPermissionMessage}
        </Typography>
      </Box>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <SearchOff sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography variant="h6" color="text.secondary">
          {notFoundMessage}
        </Typography>
      </Box>
    );
  }

  // Empty state
  if (empty) {
    return (
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <SearchOff sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // Normal state - render children
  return <>{children}</>;
}
