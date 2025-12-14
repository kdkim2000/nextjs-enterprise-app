'use client';

import React from 'react';
import { Typography, Chip, Box } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction, EntityFeatureBadge } from '@/components/mobile/MobileEntityCard';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { BoardType } from '../types';

export interface BoardTypeMobileCardProps {
  boardType: BoardType;
  locale: string;
  onEdit?: (boardType: BoardType) => void;
  onDelete?: (boardType: BoardType) => void;
  onViewStats?: (boardType: BoardType) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function BoardTypeMobileCard({
  boardType,
  locale,
  onEdit,
  onDelete,
  onViewStats,
  canEdit = true,
  canDelete = true,
}: BoardTypeMobileCardProps) {
  const isKorean = locale === 'ko';

  // Get localized name
  let name = '';
  if (boardType.name && typeof boardType.name === 'object') {
    name = boardType.name[locale as keyof typeof boardType.name] || boardType.name.en || '';
  } else {
    name = (boardType as any)[`name_${locale}`] || (boardType as any).name_en || '';
  }
  name = name || boardType.code;

  // Get description
  let description = '';
  if (boardType.description && typeof boardType.description === 'object') {
    description = boardType.description[locale as keyof typeof boardType.description] || boardType.description.en || '';
  }

  // Build swipe actions
  const swipeActions: EntitySwipeAction<BoardType>[] = [];

  if (canDelete && onDelete) {
    swipeActions.push({
      icon: <DeleteIcon />,
      label: isKorean ? '삭제' : 'Delete',
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: onDelete,
    });
  }

  if (onViewStats) {
    swipeActions.push({
      icon: <StatsIcon />,
      label: isKorean ? '통계' : 'Stats',
      color: '#fff',
      backgroundColor: '#9c27b0',
      onClick: onViewStats,
    });
  }

  if (canEdit && onEdit) {
    swipeActions.push({
      icon: <EditIcon />,
      label: isKorean ? '편집' : 'Edit',
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: onEdit,
    });
  }

  // Feature badges
  const featureBadges: EntityFeatureBadge[] = [
    {
      key: 'allowComments',
      label: isKorean ? '댓글' : 'Comments',
      show: boardType.settings?.allowComments,
      bgcolor: 'info.50',
      color: 'info.dark',
    },
    {
      key: 'allowAttachments',
      label: isKorean ? '첨부' : 'Attach',
      show: boardType.settings?.allowAttachments,
      bgcolor: 'warning.50',
      color: 'warning.dark',
    },
    {
      key: 'requireApproval',
      label: isKorean ? '승인' : 'Approval',
      show: boardType.settings?.requireApproval,
      bgcolor: 'error.50',
      color: 'error.dark',
    },
  ];

  return (
    <MobileEntityCard
      item={boardType}
      avatar={{
        initials: boardType.code.substring(0, 2).toUpperCase(),
        bgcolor: boardType.status === 'active' ? 'primary.main' : 'grey.400',
        size: 44,
      }}
      primaryText={name}
      secondaryText={boardType.code}
      tertiaryText={description}
      status={{
        active: boardType.status === 'active',
        activeColor: 'success.main',
        inactiveColor: 'text.disabled',
      }}
      isActive={boardType.status === 'active'}
      featureBadges={featureBadges}
      onClick={canEdit && onEdit ? () => onEdit(boardType) : undefined}
      swipeActions={swipeActions}
    />
  );
}
