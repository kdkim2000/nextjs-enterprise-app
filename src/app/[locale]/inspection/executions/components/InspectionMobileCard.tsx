'use client';

import React, { useMemo } from 'react';
import { Typography, Box, useTheme } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
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
import {
  getInspectionStatusLabel,
  getInspectionStatusColor,
  getInspectionStatusIcon,
  InspectionStatus as LibInspectionStatus,
} from '@/lib/inspection';
import { Inspection, InspectionStatus } from '../types';
import { format } from 'date-fns';

export interface InspectionMobileCardProps {
  inspection: Inspection;
  locale?: string;
  onClick?: (inspection: Inspection) => void;
  onEdit?: (inspection: Inspection) => void;
  onDelete?: (inspection: Inspection) => void;
  onStart?: (inspection: Inspection) => void;
  onView?: (inspection: Inspection) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSwipeActions?: boolean;
}

export default function InspectionMobileCard({
  inspection,
  locale = 'ko',
  onClick,
  onEdit,
  onDelete,
  onStart,
  onView,
  selected = false,
  selectable = false,
  onSelectionChange,
  showSwipeActions = true,
}: InspectionMobileCardProps) {
  const t = useI18n();
  const theme = useTheme();
  const isCompleted = inspection.status === 'completed';
  const canStart = inspection.status === 'draft' || inspection.status === 'in_progress';

  // Get avatar color using centralized function
  const avatarColor = getInspectionStatusColor(inspection.status as LibInspectionStatus, theme) || theme.palette.grey[500];

  const avatar: EntityAvatarConfig = useMemo(
    () => ({
      initials: inspection.inspection_code?.substring(0, 2).toUpperCase() || 'IN',
      bgcolor: avatarColor,
      size: 48,
    }),
    [inspection.inspection_code, avatarColor]
  );

  const status: EntityStatusIndicator = useMemo(
    () => ({
      active: isCompleted,
    }),
    [isCompleted]
  );

  // Role badge (status) - using centralized status functions
  const roleBadge: EntityRoleBadge = useMemo(() => {
    const statusBgMap: Record<string, string> = {
      completed: 'success.50',
      in_progress: 'primary.50',
      cancelled: 'error.50',
      draft: 'warning.50',
    };
    const statusColorMap: Record<string, string> = {
      completed: 'success.dark',
      in_progress: 'primary.dark',
      cancelled: 'error.dark',
      draft: 'warning.dark',
    };
    return {
      label: getInspectionStatusLabel(inspection.status as LibInspectionStatus, locale),
      icon: getInspectionStatusIcon(inspection.status as LibInspectionStatus),
      bgcolor: statusBgMap[inspection.status] || 'warning.50',
      color: statusColorMap[inspection.status] || 'warning.dark',
    };
  }, [inspection.status, locale]);

  const featureBadges: EntityFeatureBadge[] = useMemo(
    () => [
      {
        key: 'template',
        label: inspection.template_name || '',
        show: !!inspection.template_name,
      },
      {
        key: 'location',
        label: inspection.location || '',
        show: !!inspection.location,
      },
    ],
    [inspection.template_name, inspection.location]
  );

  const swipeActions: EntitySwipeAction<Inspection>[] = useMemo(() => {
    const actions: EntitySwipeAction<Inspection>[] = [];

    if (onDelete && inspection.status === 'draft') {
      actions.push({
        icon: <DeleteIcon />,
        label: t('common.delete'),
        color: '#fff',
        backgroundColor: '#f44336',
        onClick: onDelete,
      });
    }

    if (onStart && canStart) {
      actions.push({
        icon: <StartIcon />,
        label: getLocalizedValue({ en: 'Start', ko: '시작' }, locale),
        color: '#fff',
        backgroundColor: '#4caf50',
        onClick: onStart,
      });
    }

    if (onEdit && inspection.status === 'draft') {
      actions.push({
        icon: <EditIcon />,
        label: t('common.edit'),
        color: '#fff',
        backgroundColor: '#2196f3',
        onClick: onEdit,
      });
    }

    return actions;
  }, [onDelete, onStart, onEdit, inspection.status, canStart, t, locale]);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd');
    } catch {
      return '-';
    }
  };

  const rightContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
        {formatDate(inspection.inspection_date)}
      </Typography>
      {inspection.inspector_name && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          {inspection.inspector_name}
        </Typography>
      )}
    </Box>
  );

  return (
    <MobileEntityCard
      item={inspection}
      avatar={avatar}
      status={status}
      primaryText={inspection.title}
      roleBadge={roleBadge}
      secondaryText={inspection.inspection_code}
      secondarySubtext={inspection.description}
      featureBadges={featureBadges}
      rightContent={rightContent}
      isActive={isCompleted}
      onClick={onClick}
      swipeActions={swipeActions}
      showSwipeActions={showSwipeActions}
      selected={selected}
      selectable={selectable}
      onSelectionChange={onSelectionChange}
    />
  );
}
