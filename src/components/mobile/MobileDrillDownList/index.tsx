'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import MobileCardList from '@/components/mobile/MobileCardList';
import MobileSwipeActions from '@/components/mobile/MobileSwipeActions';
import {
  BaseDrillDownNode,
  MobileDrillDownListProps,
  DrillDownCardContext,
} from './types';

// Re-export types
export * from './types';

/**
 * MobileDrillDownList - A generic drill-down navigation component for hierarchical data on mobile
 *
 * Features:
 * - Drill-down navigation (tap folder to navigate into)
 * - Breadcrumb navigation
 * - Back button
 * - Swipe actions
 * - Pull-to-refresh
 * - Empty state
 *
 * @example
 * ```tsx
 * <MobileDrillDownList
 *   data={menus}
 *   title="Menu Management"
 *   homeLabel="Home"
 *   getDisplayName={(item) => item.name}
 *   renderCard={({ item, hasChildren, childCount, onDrillDown }) => (
 *     <Box onClick={onDrillDown}>
 *       {item.name} {hasChildren && `(${childCount})`}
 *     </Box>
 *   )}
 *   keyExtractor={(item) => item.id}
 *   getSwipeActions={(item) => [
 *     { icon: <EditIcon />, label: 'Edit', ... }
 *   ]}
 *   onAdd={(parentId) => console.log('Add to', parentId)}
 * />
 * ```
 */
export default function MobileDrillDownList<T extends BaseDrillDownNode>({
  data,
  loading = false,
  title,
  homeLabel = 'Home',
  getDisplayName,
  renderCard,
  keyExtractor,
  getSwipeActions,
  onAdd,
  onRefresh,
  canAdd = true,
  emptyIcon,
  emptyMessage = 'No items',
  emptyAddLabel = 'Add Item',
  swipeHint = 'Swipe for actions',
  itemCountFormat = (count) => `${count} items`,
  onNavigationChange,
  headerActions,
}: MobileDrillDownListProps<T>) {
  // Current navigation state - null means root level
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: T[] = [];
    let parentId = currentParentId;

    while (parentId) {
      const parent = data.find((item) => item.id === parentId);
      if (parent) {
        path.unshift(parent);
        parentId = parent.parentId;
      } else {
        break;
      }
    }

    return path;
  }, [currentParentId, data]);

  // Get current level items
  const currentItems = useMemo(() => {
    return data.filter((item) => item.parentId === currentParentId);
  }, [data, currentParentId]);

  // Get child count for an item
  const getChildCount = useCallback(
    (itemId: string): number => {
      return data.filter((item) => item.parentId === itemId).length;
    },
    [data]
  );

  // Notify parent of navigation changes
  useEffect(() => {
    if (onNavigationChange) {
      onNavigationChange(currentParentId, breadcrumbPath);
    }
  }, [currentParentId, breadcrumbPath, onNavigationChange]);

  // Navigation handlers
  const handleDrillDown = useCallback(
    (item: T) => {
      const childCount = getChildCount(item.id);
      if (childCount > 0) {
        setCurrentParentId(item.id);
      }
    },
    [getChildCount]
  );

  const handleGoBack = useCallback(() => {
    if (currentParentId) {
      const currentParent = data.find((item) => item.id === currentParentId);
      setCurrentParentId(currentParent?.parentId || null);
    }
  }, [currentParentId, data]);

  const handleBreadcrumbClick = useCallback((item: T | null) => {
    setCurrentParentId(item?.id || null);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Get current parent name
  const currentParentName = useMemo(() => {
    if (!currentParentId) return title;
    const parent = data.find((item) => item.id === currentParentId);
    return parent ? getDisplayName(parent) : title;
  }, [currentParentId, data, getDisplayName, title]);

  // Render item card
  const renderItemCard = useCallback(
    (item: T) => {
      const childCount = getChildCount(item.id);
      const hasChildren = childCount > 0;

      // Build card context
      const context: DrillDownCardContext<T> = {
        item,
        childCount,
        hasChildren,
        onDrillDown: () => handleDrillDown(item),
      };

      // Get swipe actions if provided
      const swipeActions = getSwipeActions ? getSwipeActions(item, childCount) : [];

      const cardContent = renderCard(context);

      if (swipeActions.length > 0) {
        return (
          <MobileSwipeActions
            key={keyExtractor(item)}
            rightActions={swipeActions.map((action) => ({
              icon: action.icon,
              label: action.label,
              color: action.color,
              backgroundColor: action.backgroundColor,
              onClick: () => action.onClick(item),
            }))}
          >
            {cardContent}
          </MobileSwipeActions>
        );
      }

      return <Box key={keyExtractor(item)}>{cardContent}</Box>;
    },
    [getChildCount, handleDrillDown, renderCard, getSwipeActions, keyExtractor]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Navigation Header */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Back button & Current location */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1,
            py: 1,
            gap: 1,
          }}
        >
          {currentParentId && (
            <IconButton size="small" onClick={handleGoBack} sx={{ mr: 0.5 }}>
              <ArrowBackIcon />
            </IconButton>
          )}

          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
            {currentParentName}
          </Typography>

          {canAdd && onAdd && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => onAdd(currentParentId)}
              sx={{ bgcolor: 'primary.50' }}
            >
              <AddIcon />
            </IconButton>
          )}

          {headerActions}
        </Box>

        {/* Breadcrumb */}
        {breadcrumbPath.length > 0 && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Breadcrumbs
              separator={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{ fontSize: '0.75rem' }}
            >
              <Link
                component="button"
                underline="hover"
                color="text.secondary"
                onClick={() => handleBreadcrumbClick(null)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: 'inherit',
                }}
              >
                <HomeIcon sx={{ fontSize: 14 }} />
                {homeLabel}
              </Link>
              {breadcrumbPath.map((item, index) => {
                const isLast = index === breadcrumbPath.length - 1;
                return isLast ? (
                  <Typography
                    key={item.id}
                    color="text.primary"
                    sx={{ fontSize: 'inherit', fontWeight: 500 }}
                  >
                    {getDisplayName(item)}
                  </Typography>
                ) : (
                  <Link
                    key={item.id}
                    component="button"
                    underline="hover"
                    color="text.secondary"
                    onClick={() => handleBreadcrumbClick(item)}
                    sx={{ fontSize: 'inherit' }}
                  >
                    {getDisplayName(item)}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
        )}

        {/* Current level info */}
        <Divider />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 0.75,
            bgcolor: 'grey.50',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {itemCountFormat(currentItems.length)}
          </Typography>
          {getSwipeActions && (
            <Typography variant="caption" color="text.secondary">
              {swipeHint}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Item List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        ) : currentItems.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            {emptyIcon || (
              <FolderOpenIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            )}
            <Typography color="text.secondary" gutterBottom>
              {emptyMessage}
            </Typography>
            {canAdd && onAdd && (
              <Chip
                icon={<AddIcon />}
                label={emptyAddLabel}
                color="primary"
                onClick={() => onAdd(currentParentId)}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        ) : (
          <MobileCardList
            data={currentItems}
            loading={false}
            renderCard={renderItemCard}
            keyExtractor={keyExtractor}
            onRefresh={handleRefresh}
          />
        )}
      </Box>
    </Box>
  );
}
