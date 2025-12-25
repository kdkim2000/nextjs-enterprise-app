'use client';

import React, { useMemo } from 'react';
import { Typography, Box, useTheme } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CloneIcon,
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
  getTemplateStatusLabel,
  getTemplateStatusColor,
  getTemplateStatusIcon,
} from '@/lib/inspection';
import { ChecksheetTemplate, TemplateStatus } from '../types';
import { format } from 'date-fns';

export interface TemplateMobileCardProps {
  template: ChecksheetTemplate;
  locale?: string;
  onClick?: (template: ChecksheetTemplate) => void;
  onEdit?: (template: ChecksheetTemplate) => void;
  onDelete?: (template: ChecksheetTemplate) => void;
  onClone?: (template: ChecksheetTemplate) => void;
  onView?: (template: ChecksheetTemplate) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSwipeActions?: boolean;
}

export default function TemplateMobileCard({
  template,
  locale = 'ko',
  onClick,
  onEdit,
  onDelete,
  onClone,
  onView,
  selected = false,
  selectable = false,
  onSelectionChange,
  showSwipeActions = true,
}: TemplateMobileCardProps) {
  const t = useI18n();
  const theme = useTheme();
  const isActive = template.status === 'active';

  // Get avatar color using centralized function
  const avatarColor = getTemplateStatusColor(template.status as TemplateStatus, theme) || theme.palette.grey[500];

  // Avatar config
  const avatar: EntityAvatarConfig = useMemo(
    () => ({
      initials: template.code?.substring(0, 2).toUpperCase() || 'T',
      bgcolor: avatarColor,
      size: 48,
    }),
    [template.code, avatarColor]
  );

  // Status indicator
  const status: EntityStatusIndicator = useMemo(
    () => ({
      active: isActive,
    }),
    [isActive]
  );

  // Role badge (status) - using centralized status functions
  const roleBadge: EntityRoleBadge = useMemo(() => {
    const statusBgMap: Record<string, string> = {
      active: 'success.50',
      draft: 'warning.50',
      archived: 'error.50',
      inactive: 'grey.100',
    };
    const statusColorMap: Record<string, string> = {
      active: 'success.dark',
      draft: 'warning.dark',
      archived: 'error.dark',
      inactive: 'text.secondary',
    };
    return {
      label: getTemplateStatusLabel(template.status as TemplateStatus, locale),
      icon: getTemplateStatusIcon(template.status as TemplateStatus),
      bgcolor: statusBgMap[template.status] || 'grey.100',
      color: statusColorMap[template.status] || 'text.secondary',
    };
  }, [template.status, locale]);

  // Feature badges
  const featureBadges: EntityFeatureBadge[] = useMemo(
    () => [
      {
        key: 'version',
        label: `v${template.version}`,
        show: true,
      },
      {
        key: 'items',
        label: `${template.item_count || 0} ${getLocalizedValue({ en: 'items', ko: '항목', zh: '项', vi: 'mục' }, locale)}`,
        show: (template.item_count || 0) > 0,
      },
      {
        key: 'category',
        label: template.category || '',
        show: !!template.category,
      },
    ],
    [template.version, template.item_count, template.category, locale]
  );

  // Swipe actions
  const swipeActions: EntitySwipeAction<ChecksheetTemplate>[] = useMemo(() => {
    const actions: EntitySwipeAction<ChecksheetTemplate>[] = [];

    if (onDelete) {
      actions.push({
        icon: <DeleteIcon />,
        label: t('common.delete'),
        color: '#fff',
        backgroundColor: '#f44336',
        onClick: onDelete,
      });
    }

    if (onClone) {
      actions.push({
        icon: <CloneIcon />,
        label: getLocalizedValue({ en: 'Clone', ko: '복제', zh: '克隆', vi: 'Nhân bản' }, locale),
        color: '#fff',
        backgroundColor: '#9c27b0',
        onClick: onClone,
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
  }, [onDelete, onClone, onEdit, t, locale]);

  // Format date
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd');
    } catch {
      return '-';
    }
  };

  // Right content
  const rightContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
        {formatDate(template.created_at)}
      </Typography>
      {template.created_by_name && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          {template.created_by_name}
        </Typography>
      )}
    </Box>
  );

  return (
    <MobileEntityCard
      item={template}
      avatar={avatar}
      status={status}
      primaryText={template.name}
      roleBadge={roleBadge}
      secondaryText={template.code}
      secondarySubtext={template.description}
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
