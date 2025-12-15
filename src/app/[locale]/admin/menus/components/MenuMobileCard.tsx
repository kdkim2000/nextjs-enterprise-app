'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Smartphone as SmartphoneIcon,
  DesktopWindows as DesktopIcon,
  Folder as FolderIcon,
  SubdirectoryArrowRight as SubIcon,
} from '@mui/icons-material';
import MobileCard, { MobileCardChip } from '@/components/mobile/MobileCard';
import MobileSwipeActions, { SwipeAction } from '@/components/mobile/MobileSwipeActions';
import { useI18n } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { getMenuIcon } from '@/lib/icons/menuIcons';
import { Menu } from '../types';
import { MenuItem as MenuItemType } from '@/types/menu';

export interface MenuMobileCardProps {
  menu: Menu;
  locale?: string;
  allMenus?: MenuItemType[];
  onClick?: (menu: Menu) => void;
  onEdit?: (menu: Menu) => void;
  onDelete?: (menu: Menu) => void;
  onAddChild?: (menu: Menu) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSwipeActions?: boolean;
}

export default function MenuMobileCard({
  menu,
  locale = 'ko',
  allMenus = [],
  onClick,
  onEdit,
  onDelete,
  onAddChild,
  selected = false,
  selectable = false,
  onSelectionChange,
  showSwipeActions = true,
}: MenuMobileCardProps) {
  const t = useI18n();
  const isKorean = locale === 'ko';

  // Get display name
  const getDisplayName = (): string => {
    return getLocalizedValue(menu.name, locale) || menu.code;
  };

  // Get parent menu name
  const getParentName = (): string => {
    if (!menu.parentId) return isKorean ? '최상위 메뉴' : 'Root Menu';
    const parent = allMenus.find((m) => m.id === menu.parentId);
    if (!parent) return '-';
    return getLocalizedValue(parent.name, locale) || parent.code;
  };

  // Get avatar (menu icon)
  const getAvatar = () => {
    const hasChildren = allMenus.some((m) => m.parentId === menu.id);
    if (hasChildren) {
      return (
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.50',
            borderRadius: 1,
            color: 'primary.main',
          }}
        >
          <FolderIcon />
        </Box>
      );
    }
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
          color: 'text.secondary',
        }}
      >
        {getMenuIcon(menu.icon)}
      </Box>
    );
  };

  // Build chips
  const getChips = (): MobileCardChip[] => {
    const chips: MobileCardChip[] = [];

    // Level chip
    chips.push({
      label: `Lv.${menu.level}`,
      color: menu.level === 0 ? 'primary' : 'default',
      size: 'small',
    });

    // Program ID chip
    if (menu.programId) {
      chips.push({
        label: menu.programId,
        color: 'default',
        variant: 'outlined',
        size: 'small',
      });
    }

    return chips;
  };

  // Build badge (visibility icons)
  const getBadge = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Chip
        icon={<DesktopIcon sx={{ fontSize: '14px !important' }} />}
        label=""
        size="small"
        sx={{
          height: 22,
          minWidth: 32,
          bgcolor: menu.desktopEnabled !== false ? 'success.50' : 'grey.100',
          color: menu.desktopEnabled !== false ? 'success.main' : 'text.disabled',
          '& .MuiChip-icon': { ml: 0.5, mr: -0.5 },
          '& .MuiChip-label': { display: 'none' },
        }}
      />
      <Chip
        icon={<SmartphoneIcon sx={{ fontSize: '14px !important' }} />}
        label=""
        size="small"
        sx={{
          height: 22,
          minWidth: 32,
          bgcolor: menu.mobileEnabled !== false ? 'success.50' : 'grey.100',
          color: menu.mobileEnabled !== false ? 'success.main' : 'text.disabled',
          '& .MuiChip-icon': { ml: 0.5, mr: -0.5 },
          '& .MuiChip-label': { display: 'none' },
        }}
      />
    </Box>
  );

  // Build swipe actions
  const rightActions: SwipeAction[] = [];

  if (onDelete) {
    rightActions.push({
      icon: <DeleteIcon />,
      label: t('common.delete'),
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: () => onDelete(menu),
    });
  }

  if (onAddChild) {
    rightActions.push({
      icon: <AddIcon />,
      label: isKorean ? '하위추가' : 'Add Child',
      color: '#fff',
      backgroundColor: '#4caf50',
      onClick: () => onAddChild(menu),
    });
  }

  if (onEdit) {
    rightActions.push({
      icon: <EditIcon />,
      label: t('common.edit'),
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: () => onEdit(menu),
    });
  }

  // Secondary text with parent info for child menus
  const getSecondaryText = (): string => {
    if (menu.level > 0) {
      return `↳ ${getParentName()}`;
    }
    return menu.code;
  };

  const cardContent = (
    <MobileCard
      item={menu}
      primaryText={getDisplayName()}
      secondaryText={getSecondaryText()}
      tertiaryText={menu.path}
      avatar={getAvatar()}
      badge={getBadge()}
      chips={getChips()}
      onClick={onClick ? () => onClick(menu) : undefined}
      selected={selected}
      selectable={selectable}
      onSelectionChange={onSelectionChange}
      divider
    />
  );

  // Wrap with swipe actions if enabled
  if (showSwipeActions && rightActions.length > 0) {
    return (
      <MobileSwipeActions rightActions={rightActions}>
        {cardContent}
      </MobileSwipeActions>
    );
  }

  return cardContent;
}
