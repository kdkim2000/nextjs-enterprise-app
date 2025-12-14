'use client';

import React, { useMemo } from 'react';
import { Typography, useTheme } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Folder as FolderIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import MobileEntityCard, {
  EntityAvatarConfig,
  EntityStatusIndicator,
  EntityRoleBadge,
  EntityFeatureBadge,
  EntitySwipeAction,
} from '@/components/mobile/MobileEntityCard';
import { useI18n } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { CodeType } from '../types';

export interface CodeTypeMobileCardProps {
  codeType: CodeType;
  locale?: string;
  codeCount?: number; // Number of codes in this type
  onClick?: (codeType: CodeType) => void;
  onEdit?: (codeType: CodeType) => void;
  onDelete?: (codeType: CodeType) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSwipeActions?: boolean;
}

export default function CodeTypeMobileCard({
  codeType,
  locale = 'ko',
  codeCount,
  onClick,
  onEdit,
  onDelete,
  selected = false,
  selectable = false,
  onSelectionChange,
  showSwipeActions = true,
}: CodeTypeMobileCardProps) {
  const t = useI18n();
  const theme = useTheme();
  const isKorean = locale === 'ko';
  const isActive = codeType.status === 'active';

  // Get display name
  const getDisplayName = (): string => {
    return getLocalizedValue(codeType.name, locale) || codeType.code;
  };

  // Get description
  const getDescription = (): string => {
    return getLocalizedValue(codeType.description, locale) || '';
  };

  // Avatar config - folder style for code types
  const avatar: EntityAvatarConfig = useMemo(
    () => ({
      initials: codeType.code.substring(0, 2).toUpperCase(),
      bgcolor: isActive ? theme.palette.primary.main : theme.palette.grey[400],
      size: 48,
    }),
    [codeType.code, isActive, theme]
  );

  // Status indicator
  const status: EntityStatusIndicator = useMemo(
    () => ({
      active: isActive,
    }),
    [isActive]
  );

  // Role badge - shows code count if available
  const roleBadge: EntityRoleBadge | undefined = useMemo(() => {
    if (codeCount !== undefined) {
      return {
        label: isKorean ? `${codeCount}개` : `${codeCount}`,
        icon: <FolderIcon sx={{ fontSize: 12 }} />,
        bgcolor: 'primary.50',
        color: 'primary.dark',
      };
    }
    return undefined;
  }, [codeCount, isKorean]);

  // Feature badges
  const featureBadges: EntityFeatureBadge[] = useMemo(() => {
    const badges: EntityFeatureBadge[] = [];

    if (codeType.category) {
      badges.push({
        key: 'category',
        label: codeType.category,
        bgcolor: 'grey.100',
        color: 'text.secondary',
        show: true,
      });
    }

    return badges;
  }, [codeType.category]);

  // Swipe actions
  const swipeActions: EntitySwipeAction<CodeType>[] = useMemo(() => {
    const actions: EntitySwipeAction<CodeType>[] = [];

    if (onDelete) {
      actions.push({
        icon: <DeleteIcon />,
        label: t('common.delete'),
        color: '#fff',
        backgroundColor: '#f44336',
        onClick: onDelete,
      });
    }

    if (onEdit) {
      actions.push({
        icon: <EditIcon />,
        label: t('common.edit'),
        color: '#fff',
        backgroundColor: '#2196f3',
        onClick: onEdit,
      });
    }

    return actions;
  }, [onDelete, onEdit, t]);

  // Right content - chevron to indicate drill-down
  const rightContent = onClick ? (
    <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
  ) : undefined;

  return (
    <MobileEntityCard
      item={codeType}
      avatar={avatar}
      status={status}
      primaryText={getDisplayName()}
      roleBadge={roleBadge}
      secondaryText={codeType.code}
      tertiaryText={getDescription() || undefined}
      featureBadges={featureBadges}
      rightContent={rightContent}
      isActive={isActive}
      onClick={onClick}
      swipeActions={swipeActions}
      showSwipeActions={showSwipeActions}
      selected={selected}
      selectable={selectable}
      onSelectionChange={onSelectionChange}
    />
  );
}
