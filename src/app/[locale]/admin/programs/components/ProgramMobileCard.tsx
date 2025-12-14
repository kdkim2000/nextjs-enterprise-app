'use client';

import React from 'react';
import { Typography, Chip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction } from '@/components/mobile/MobileEntityCard';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Program } from '../types';

export interface ProgramMobileCardProps {
  program: Program;
  locale: string;
  onEdit?: (program: Program) => void;
  onDelete?: (program: Program) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function ProgramMobileCard({
  program,
  locale,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: ProgramMobileCardProps) {
  const isKorean = locale === 'ko';
  const name = getLocalizedValue(program.name, locale) || program.code;
  const description = getLocalizedValue(program.description, locale);

  // Build swipe actions
  const swipeActions: EntitySwipeAction<Program>[] = [];

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
      item={program}
      primaryText={name}
      secondaryText={program.code}
      tertiaryText={description}
      status={{
        active: program.isActive !== false,
        activeColor: 'success.main',
        inactiveColor: 'text.disabled',
      }}
      isActive={program.isActive !== false}
      onClick={canEdit && onEdit ? () => onEdit(program) : undefined}
      swipeActions={swipeActions}
      rightContent={
        <Chip
          icon={<CodeIcon sx={{ fontSize: 12 }} />}
          label={program.type || 'SCREEN'}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      }
    />
  );
}
