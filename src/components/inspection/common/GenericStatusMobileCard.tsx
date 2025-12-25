'use client';

import React, { useMemo } from 'react';
import { useTheme } from '@mui/material';
import MobileEntityCard, {
  MobileEntityCardProps,
  SwipeAction,
  FeatureBadge,
} from '@/components/mobile/MobileEntityCard';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

// ==================== Types ====================

export interface StatusConfig {
  value: string;
  label: Record<string, string>;
  color: string;
  icon?: React.ReactNode;
}

export interface BadgeConfig {
  key: string;
  getValue: (entity: BaseEntity) => string | number | undefined;
  label?: Record<string, string>;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface ActionConfig {
  type: 'edit' | 'delete' | 'clone' | 'view' | 'start' | 'custom';
  label: Record<string, string>;
  icon?: React.ReactNode;
  color?: string;
  show?: (entity: BaseEntity) => boolean;
}

export interface BaseEntity {
  id: string;
  status?: string;
  created_at?: string;
  created_by_name?: string;
  [key: string]: unknown;
}

export interface GenericStatusMobileCardProps<T extends BaseEntity> {
  entity: T;
  locale?: string;

  // Display configuration
  getCode: (entity: T) => string;
  getName: (entity: T) => string;
  getDescription?: (entity: T) => string | undefined;

  // Status configuration
  statusConfigs: StatusConfig[];
  getStatus: (entity: T) => string;

  // Badge configuration
  badges?: BadgeConfig[];

  // Action configuration
  actions?: ActionConfig[];
  onEdit?: (entity: T) => void;
  onDelete?: (entity: T) => void;
  onClone?: (entity: T) => void;
  onView?: (entity: T) => void;
  onStart?: (entity: T) => void;
  onCustomAction?: (entity: T, actionType: string) => void;

  // Selection
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;

  // Click handler
  onClick?: (entity: T) => void;
}

/**
 * Generic Status Mobile Card Component
 * Provides a reusable pattern for entity cards with status indicators
 */
export default function GenericStatusMobileCard<T extends BaseEntity>({
  entity,
  locale = 'ko',
  getCode,
  getName,
  getDescription,
  statusConfigs,
  getStatus,
  badges = [],
  actions = [],
  onEdit,
  onDelete,
  onClone,
  onView,
  onStart,
  onCustomAction,
  selectionMode = false,
  isSelected = false,
  onSelectionChange,
  onClick,
}: GenericStatusMobileCardProps<T>) {
  const theme = useTheme();

  // Get current status config
  const status = getStatus(entity);
  const statusConfig = statusConfigs.find((c) => c.value === status);

  // Generate avatar props
  const code = getCode(entity);
  const avatarLetter = code.charAt(0).toUpperCase();
  const avatarColor = statusConfig?.color || theme.palette.grey[500];

  // Generate role badge (status indicator)
  const roleBadge = statusConfig
    ? {
        text: getLocalizedValue(statusConfig.label, locale),
        color: statusConfig.color,
      }
    : undefined;

  // Generate feature badges
  const featureBadges: FeatureBadge[] = useMemo(() => {
    return badges
      .map((badge) => {
        const value = badge.getValue(entity);
        if (value === undefined || value === null) return null;

        return {
          label: badge.label ? getLocalizedValue(badge.label, locale) : String(value),
          value: String(value),
          color: badge.color || 'default',
        } as FeatureBadge;
      })
      .filter((badge): badge is FeatureBadge => badge !== null);
  }, [badges, entity, locale]);

  // Generate swipe actions
  const swipeActions: SwipeAction[] = useMemo(() => {
    return actions
      .filter((action) => !action.show || action.show(entity))
      .map((action) => {
        let handler: () => void;
        let defaultColor: string;

        switch (action.type) {
          case 'edit':
            handler = () => onEdit?.(entity);
            defaultColor = theme.palette.primary.main;
            break;
          case 'delete':
            handler = () => onDelete?.(entity);
            defaultColor = theme.palette.error.main;
            break;
          case 'clone':
            handler = () => onClone?.(entity);
            defaultColor = theme.palette.info.main;
            break;
          case 'view':
            handler = () => onView?.(entity);
            defaultColor = theme.palette.info.main;
            break;
          case 'start':
            handler = () => onStart?.(entity);
            defaultColor = theme.palette.success.main;
            break;
          case 'custom':
          default:
            handler = () => onCustomAction?.(entity, action.type);
            defaultColor = theme.palette.grey[500];
            break;
        }

        return {
          label: getLocalizedValue(action.label, locale),
          color: action.color || defaultColor,
          icon: action.icon,
          onClick: handler,
        } as SwipeAction;
      });
  }, [actions, entity, locale, theme, onEdit, onDelete, onClone, onView, onStart, onCustomAction]);

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Generate meta info
  const metaItems: string[] = [];
  if (entity.created_at) {
    metaItems.push(formatDate(entity.created_at));
  }
  if (entity.created_by_name) {
    metaItems.push(String(entity.created_by_name));
  }
  const metaInfo = metaItems.join(' • ');

  const handleClick = () => {
    onClick?.(entity);
  };

  const handleSelectionChange = (selected: boolean) => {
    onSelectionChange?.(entity.id, selected);
  };

  return (
    <MobileEntityCard
      code={code}
      name={getName(entity)}
      description={getDescription?.(entity)}
      avatarLetter={avatarLetter}
      avatarColor={avatarColor}
      roleBadge={roleBadge}
      featureBadges={featureBadges}
      metaInfo={metaInfo}
      swipeActions={swipeActions}
      selectionMode={selectionMode}
      isSelected={isSelected}
      onSelectionChange={handleSelectionChange}
      onClick={handleClick}
    />
  );
}
