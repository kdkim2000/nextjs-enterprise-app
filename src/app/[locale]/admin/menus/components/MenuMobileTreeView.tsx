'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Smartphone as SmartphoneIcon,
  DesktopWindows as DesktopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MobileCardList from '@/components/mobile/MobileCardList';
import MobileSwipeActions, { SwipeAction } from '@/components/mobile/MobileSwipeActions';
import { useI18n } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { getMenuIcon } from '@/lib/icons/menuIcons';
import { Menu } from '../types';
import { MenuItem as MenuItemType } from '@/types/menu';

export interface MenuMobileTreeViewProps {
  menus: Menu[];
  allMenus: MenuItemType[];
  locale: string;
  loading?: boolean;
  onEdit?: (menu: Menu) => void;
  onDelete?: (menu: Menu) => void;
  onAdd?: (parentId: string | null) => void;
  onRefresh?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canAdd?: boolean;
}

export default function MenuMobileTreeView({
  menus,
  allMenus,
  locale,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  canEdit = true,
  canDelete = true,
  canAdd = true,
}: MenuMobileTreeViewProps) {
  const t = useI18n();
  const theme = useTheme();
  const isKorean = locale === 'ko';

  // Current navigation state - null means root level
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: Menu[] = [];
    let parentId = currentParentId;

    while (parentId) {
      const parent = menus.find((m) => m.id === parentId);
      if (parent) {
        path.unshift(parent);
        parentId = parent.parentId;
      } else {
        break;
      }
    }

    return path;
  }, [currentParentId, menus]);

  // Get current level menus
  const currentMenus = useMemo(() => {
    return menus.filter((m) => m.parentId === currentParentId);
  }, [menus, currentParentId]);

  // Get child count for a menu
  const getChildCount = useCallback(
    (menuId: string): number => {
      return menus.filter((m) => m.parentId === menuId).length;
    },
    [menus]
  );

  // Navigation handlers
  const handleDrillDown = useCallback((menu: Menu) => {
    const childCount = getChildCount(menu.id);
    if (childCount > 0) {
      setCurrentParentId(menu.id);
    } else if (onEdit && canEdit) {
      // If no children, open edit
      onEdit(menu);
    }
  }, [getChildCount, onEdit, canEdit]);

  const handleGoBack = useCallback(() => {
    if (currentParentId) {
      const currentParent = menus.find((m) => m.id === currentParentId);
      setCurrentParentId(currentParent?.parentId || null);
    }
  }, [currentParentId, menus]);

  const handleBreadcrumbClick = useCallback((menu: Menu | null) => {
    setCurrentParentId(menu?.id || null);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Get display name
  const getDisplayName = (menu: Menu): string => {
    return getLocalizedValue(menu.name, locale) || menu.code;
  };

  // Render menu card
  const renderMenuCard = useCallback(
    (menu: Menu) => {
      const childCount = getChildCount(menu.id);
      const hasChildren = childCount > 0;

      // Build swipe actions
      const rightActions: SwipeAction[] = [];

      if (canDelete && onDelete) {
        rightActions.push({
          icon: <DeleteIcon />,
          label: t('common.delete'),
          color: '#fff',
          backgroundColor: '#f44336',
          onClick: () => onDelete(menu),
        });
      }

      if (canAdd && onAdd) {
        rightActions.push({
          icon: <AddIcon />,
          label: isKorean ? '하위추가' : 'Add Child',
          color: '#fff',
          backgroundColor: '#4caf50',
          onClick: () => onAdd(menu.id),
        });
      }

      if (canEdit && onEdit) {
        rightActions.push({
          icon: <EditIcon />,
          label: t('common.edit'),
          color: '#fff',
          backgroundColor: '#2196f3',
          onClick: () => onEdit(menu),
        });
      }

      const cardContent = (
        <Box
          onClick={() => handleDrillDown(menu)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            gap: 1.5,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            '&:active': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: hasChildren ? 'primary.50' : 'grey.100',
              borderRadius: 1.5,
              color: hasChildren ? 'primary.main' : 'text.secondary',
              flexShrink: 0,
            }}
          >
            {hasChildren ? <FolderIcon /> : getMenuIcon(menu.icon)}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: hasChildren ? 600 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getDisplayName(menu)}
              </Typography>
              {hasChildren && (
                <Chip
                  label={childCount}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 24,
                    fontSize: '0.7rem',
                    bgcolor: 'primary.100',
                    color: 'primary.dark',
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {menu.path}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              {menu.programId && (
                <Chip
                  label={menu.programId}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              <DesktopIcon
                sx={{
                  fontSize: 14,
                  color: menu.desktopEnabled !== false ? 'success.main' : 'action.disabled',
                }}
              />
              <SmartphoneIcon
                sx={{
                  fontSize: 14,
                  color: menu.mobileEnabled !== false ? 'success.main' : 'action.disabled',
                }}
              />
            </Box>
          </Box>

          {/* Chevron for folders */}
          {hasChildren && (
            <ChevronRightIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
          )}
        </Box>
      );

      if (rightActions.length > 0) {
        return (
          <MobileSwipeActions key={menu.id} rightActions={rightActions}>
            {cardContent}
          </MobileSwipeActions>
        );
      }

      return <Box key={menu.id}>{cardContent}</Box>;
    },
    [
      getChildCount,
      canDelete,
      canAdd,
      canEdit,
      onDelete,
      onAdd,
      onEdit,
      handleDrillDown,
      theme,
      isKorean,
      locale,
      t,
    ]
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
            {currentParentId
              ? getDisplayName(menus.find((m) => m.id === currentParentId)!)
              : isKorean
              ? '메뉴 관리'
              : 'Menu Management'}
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
                {isKorean ? '홈' : 'Home'}
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
            {isKorean
              ? `${currentMenus.length}개 항목`
              : `${currentMenus.length} items`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isKorean ? '스와이프하여 편집' : 'Swipe for actions'}
          </Typography>
        </Box>
      </Paper>

      {/* Menu List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {isKorean ? '로딩 중...' : 'Loading...'}
            </Typography>
          </Box>
        ) : currentMenus.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <FolderOpenIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography color="text.secondary" gutterBottom>
              {isKorean ? '하위 메뉴가 없습니다' : 'No child menus'}
            </Typography>
            {canAdd && onAdd && (
              <Chip
                icon={<AddIcon />}
                label={isKorean ? '메뉴 추가' : 'Add Menu'}
                color="primary"
                onClick={() => onAdd(currentParentId)}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        ) : (
          <MobileCardList
            data={currentMenus}
            loading={false}
            renderCard={renderMenuCard}
            keyExtractor={(menu) => menu.id}
            onRefresh={handleRefresh}
          />
        )}
      </Box>
    </Box>
  );
}
