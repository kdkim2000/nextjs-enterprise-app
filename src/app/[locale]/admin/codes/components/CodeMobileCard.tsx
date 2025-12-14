'use client';

import React from 'react';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import MobileCard, { MobileCardChip } from '@/components/mobile/MobileCard';
import MobileSwipeActions, { SwipeAction } from '@/components/mobile/MobileSwipeActions';
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

  // Get display name
  const getDisplayName = (): string => {
    return getLocalizedValue(code.name, locale) || code.code;
  };

  // Get description
  const getDescription = (): string => {
    return getLocalizedValue(code.description, locale) || '';
  };

  // Get avatar
  const getAvatar = () => (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: code.status === 'active' ? 'primary.main' : 'grey.400',
      }}
    >
      <CodeIcon />
    </Avatar>
  );

  // Build badge (status)
  const getBadge = () => (
    <Chip
      label={
        code.status === 'active'
          ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale)
          : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale)
      }
      size="small"
      color={code.status === 'active' ? 'success' : 'default'}
      sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
    />
  );

  // Build chips
  const getChips = (): MobileCardChip[] => {
    const chips: MobileCardChip[] = [];

    // Order chip
    if (code.order !== undefined) {
      chips.push({
        label: `#${code.order}`,
        color: 'default',
        variant: 'outlined',
      });
    }

    // Parent code chip
    if (code.parentCode) {
      chips.push({
        label: `↑ ${code.parentCode}`,
        color: 'secondary',
        variant: 'outlined',
      });
    }

    return chips;
  };

  // Build swipe actions
  const rightActions: SwipeAction[] = [];

  if (onDelete) {
    rightActions.push({
      icon: <DeleteIcon />,
      label: t('common.delete'),
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: () => onDelete(code),
    });
  }

  if (onEdit) {
    rightActions.push({
      icon: <EditIcon />,
      label: t('common.edit'),
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: () => onEdit(code),
    });
  }

  const cardContent = (
    <MobileCard
      item={code}
      primaryText={getDisplayName()}
      secondaryText={code.code}
      tertiaryText={getDescription()}
      avatar={getAvatar()}
      badge={getBadge()}
      chips={getChips()}
      onClick={onClick ? () => onClick(code) : undefined}
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
