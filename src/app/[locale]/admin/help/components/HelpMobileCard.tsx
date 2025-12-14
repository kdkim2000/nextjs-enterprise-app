'use client';

import React from 'react';
import { Chip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction } from '@/components/mobile/MobileEntityCard';
import { HelpContent } from '../types';

export interface HelpMobileCardProps {
  help: HelpContent;
  locale: string;
  onEdit?: (help: HelpContent) => void;
  onDelete?: (help: HelpContent) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function HelpMobileCard({
  help,
  locale,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: HelpMobileCardProps) {
  const isKorean = locale === 'ko';

  // Build swipe actions
  const swipeActions: EntitySwipeAction<HelpContent>[] = [];

  if (canDelete && onDelete) {
    swipeActions.push({
      icon: <DeleteIcon />,
      label: isKorean ? '삭제' : 'Delete',
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: onDelete,
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

  return (
    <MobileEntityCard
      item={help}
      avatar={{
        initials: help.programId.substring(0, 2).toUpperCase(),
        bgcolor: 'info.main',
        size: 44,
      }}
      primaryText={help.title}
      secondaryText={help.programId}
      tertiaryText={help.status === 'published' ? (isKorean ? '게시됨' : 'Published') : (isKorean ? '초안' : 'Draft')}
      onClick={canEdit && onEdit ? () => onEdit(help) : undefined}
      swipeActions={swipeActions}
      rightContent={
        <Chip
          label={help.language?.toUpperCase() || 'EN'}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      }
    />
  );
}
