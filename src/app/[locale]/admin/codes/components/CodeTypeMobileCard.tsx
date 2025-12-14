'use client';

import React from 'react';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import MobileCard from '@/components/mobile/MobileCard';
import MobileSwipeActions, { SwipeAction } from '@/components/mobile/MobileSwipeActions';
import { useI18n } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { CodeType } from '../types';

export interface CodeTypeMobileCardProps {
  codeType: CodeType;
  locale?: string;
  onClick?: (codeType: CodeType) => void;
  onEdit?: (codeType: CodeType) => void;
  onDelete?: (codeType: CodeType) => void;
  selected?: boolean;
  showSwipeActions?: boolean;
}

export default function CodeTypeMobileCard({
  codeType,
  locale = 'ko',
  onClick,
  onEdit,
  onDelete,
  selected = false,
  showSwipeActions = true,
}: CodeTypeMobileCardProps) {
  const t = useI18n();

  // Get display name
  const getDisplayName = (): string => {
    return getLocalizedValue(codeType.name, locale) || codeType.code;
  };

  // Get description
  const getDescription = (): string => {
    return getLocalizedValue(codeType.description, locale) || '';
  };

  // Get avatar
  const getAvatar = () => (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: codeType.status === 'active' ? 'primary.main' : 'grey.400',
      }}
    >
      <CategoryIcon />
    </Avatar>
  );

  // Build badge (status)
  const getBadge = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Chip
        label={
          codeType.status === 'active'
            ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale)
            : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale)
        }
        size="small"
        color={codeType.status === 'active' ? 'success' : 'default'}
        sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
      />
      <ChevronRightIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
    </Box>
  );

  // Build chips
  const getChips = () => {
    const chips = [];

    if (codeType.category) {
      chips.push({
        label: codeType.category,
        color: 'default' as const,
        variant: 'outlined' as const,
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
      onClick: () => onDelete(codeType),
    });
  }

  if (onEdit) {
    rightActions.push({
      icon: <EditIcon />,
      label: t('common.edit'),
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: () => onEdit(codeType),
    });
  }

  const cardContent = (
    <MobileCard
      item={codeType}
      primaryText={getDisplayName()}
      secondaryText={`${codeType.code}`}
      tertiaryText={getDescription()}
      avatar={getAvatar()}
      badge={getBadge()}
      chips={getChips()}
      onClick={onClick ? () => onClick(codeType) : undefined}
      selected={selected}
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
