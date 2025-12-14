'use client';

import React, { useCallback } from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Smartphone as SmartphoneIcon,
  DesktopWindows as DesktopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MobileDrillDownList, {
  DrillDownCardContext,
  DrillDownSwipeAction,
} from '@/components/mobile/MobileDrillDownList';
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

  // Get display name for a menu
  const getDisplayName = useCallback(
    (menu: Menu): string => {
      return getLocalizedValue(menu.name, locale) || menu.code;
    },
    [locale]
  );

  // Build swipe actions for a menu
  const getSwipeActions = useCallback(
    (menu: Menu): DrillDownSwipeAction<Menu>[] => {
      const actions: DrillDownSwipeAction<Menu>[] = [];

      if (canDelete && onDelete) {
        actions.push({
          icon: <DeleteIcon />,
          label: t('common.delete'),
          color: '#fff',
          backgroundColor: '#f44336',
          onClick: onDelete,
        });
      }

      if (canAdd && onAdd) {
        actions.push({
          icon: <AddIcon />,
          label: isKorean ? '하위추가' : 'Add Child',
          color: '#fff',
          backgroundColor: '#4caf50',
          onClick: (item) => onAdd(item.id),
        });
      }

      if (canEdit && onEdit) {
        actions.push({
          icon: <EditIcon />,
          label: t('common.edit'),
          color: '#fff',
          backgroundColor: '#2196f3',
          onClick: onEdit,
        });
      }

      return actions;
    },
    [canDelete, canAdd, canEdit, onDelete, onAdd, onEdit, t, isKorean]
  );

  // Render menu card
  const renderMenuCard = useCallback(
    ({ item: menu, hasChildren, childCount, onDrillDown }: DrillDownCardContext<Menu>) => {
      const handleClick = () => {
        if (hasChildren) {
          onDrillDown();
        } else if (onEdit && canEdit) {
          // If no children, open edit
          onEdit(menu);
        }
      };

      return (
        <Box
          onClick={handleClick}
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
    },
    [getDisplayName, onEdit, canEdit, theme]
  );

  return (
    <MobileDrillDownList
      data={menus}
      loading={loading}
      title={isKorean ? '메뉴 관리' : 'Menu Management'}
      homeLabel={isKorean ? '홈' : 'Home'}
      getDisplayName={getDisplayName}
      renderCard={renderMenuCard}
      keyExtractor={(menu) => menu.id}
      getSwipeActions={getSwipeActions}
      onAdd={canAdd ? onAdd : undefined}
      onRefresh={onRefresh}
      canAdd={canAdd}
      emptyMessage={isKorean ? '하위 메뉴가 없습니다' : 'No child menus'}
      emptyAddLabel={isKorean ? '메뉴 추가' : 'Add Menu'}
      swipeHint={isKorean ? '스와이프하여 편집' : 'Swipe for actions'}
      itemCountFormat={(count) => (isKorean ? `${count}개 항목` : `${count} items`)}
    />
  );
}
