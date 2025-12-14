'use client';

import React, { useMemo } from 'react';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Tag as TagIcon,
  SubdirectoryArrowRight as ChildIcon,
} from '@mui/icons-material';
import MobileEntityCard, {
  EntityStatusIndicator,
  EntityRoleBadge,
  EntityFeatureBadge,
  EntitySwipeAction,
} from '@/components/mobile/MobileEntityCard';
import { useI18n } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Code } from '../types';

export interface CodeMobileCardProps {
  code: Code;
  locale?: string;
  onClick?: (code: Code) => void;
  onEdit?: (code: Code) => void;
  onDelete?: (code: Code) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSwipeActions?: boolean;
}

export default function CodeMobileCard({
  code,
  locale = 'ko',
  onClick,
  onEdit,
  onDelete,
  selected = false,
  selectable = false,
  onSelectionChange,
  showSwipeActions = true,
}: CodeMobileCardProps) {
  const t = useI18n();
  const isActive = code.status === 'active';

  // Get display name
  const getDisplayName = (): string => {
    return getLocalizedValue(code.name, locale) || code.code;
  };

  // Get description
  const getDescription = (): string => {
    return getLocalizedValue(code.description, locale) || '';
  };

  // No avatar for codes - code management doesn't need visual avatars

  // Status indicator
  const status: EntityStatusIndicator = useMemo(
    () => ({
      active: isActive,
    }),
    [isActive]
  );

  // Role badge - shows order number
  const roleBadge: EntityRoleBadge | undefined = useMemo(() => {
    if (code.order !== undefined) {
      return {
        label: `#${code.order}`,
        icon: <TagIcon sx={{ fontSize: 12 }} />,
        bgcolor: 'grey.100',
        color: 'text.secondary',
      };
    }
    return undefined;
  }, [code.order]);

  // Feature badges
  const featureBadges: EntityFeatureBadge[] = useMemo(() => {
    const badges: EntityFeatureBadge[] = [];

    // Parent code badge
    if (code.parentCode) {
      badges.push({
        key: 'parent',
        label: code.parentCode,
        icon: <ChildIcon sx={{ fontSize: '12px !important' }} />,
        bgcolor: 'info.50',
        color: 'info.dark',
        show: true,
      });
    }

    return badges;
  }, [code.parentCode]);

  // Swipe actions
  const swipeActions: EntitySwipeAction<Code>[] = useMemo(() => {
    const actions: EntitySwipeAction<Code>[] = [];

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

  // Build secondary text
  const secondaryText = code.code;

  // Build tertiary text (description)
  const tertiaryText = getDescription() || undefined;

  return (
    <MobileEntityCard
      item={code}
      status={status}
      primaryText={getDisplayName()}
      roleBadge={roleBadge}
      secondaryText={secondaryText}
      tertiaryText={tertiaryText}
      featureBadges={featureBadges}
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
