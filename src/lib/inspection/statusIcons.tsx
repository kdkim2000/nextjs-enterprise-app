/**
 * Centralized Status Icons for Inspection Module
 * Provides consistent icons and colors for status indicators
 */

import React from 'react';
import {
  Edit as DraftIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon,
  Archive as ArchivedIcon,
  PlayArrow as InProgressIcon,
  Done as CompletedIcon,
  Cancel as CancelledIcon,
  Warning as OverdueIcon,
  Schedule as PendingIcon,
  CheckBox as CheckboxIcon,
  TextFields as TextIcon,
  Numbers as NumberIcon,
  List as SelectIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon,
  PhotoCamera as PhotoIcon,
  Draw as SignatureIcon,
} from '@mui/icons-material';
import { Theme } from '@mui/material';
import { TemplateStatus, InspectionStatus, ItemType } from './statusOptions';

// ==================== Template Status Icons ====================

export function getTemplateStatusIcon(status: TemplateStatus): React.ReactNode {
  switch (status) {
    case 'draft':
      return <DraftIcon />;
    case 'active':
      return <ActiveIcon />;
    case 'inactive':
      return <InactiveIcon />;
    case 'archived':
      return <ArchivedIcon />;
    default:
      return <PendingIcon />;
  }
}

export function getTemplateStatusColor(status: TemplateStatus, theme: Theme): string {
  switch (status) {
    case 'draft':
      return theme.palette.grey[500];
    case 'active':
      return theme.palette.success.main;
    case 'inactive':
      return theme.palette.warning.main;
    case 'archived':
      return theme.palette.error.main;
    default:
      return theme.palette.grey[500];
  }
}

// ==================== Inspection Status Icons ====================

export function getInspectionStatusIcon(status: InspectionStatus): React.ReactNode {
  switch (status) {
    case 'draft':
      return <DraftIcon />;
    case 'in_progress':
      return <InProgressIcon />;
    case 'completed':
      return <CompletedIcon />;
    case 'cancelled':
      return <CancelledIcon />;
    default:
      return <PendingIcon />;
  }
}

export function getInspectionStatusColor(status: InspectionStatus, theme: Theme): string {
  switch (status) {
    case 'draft':
      return theme.palette.grey[500];
    case 'in_progress':
      return theme.palette.info.main;
    case 'completed':
      return theme.palette.success.main;
    case 'cancelled':
      return theme.palette.error.main;
    default:
      return theme.palette.grey[500];
  }
}

// ==================== Item Type Icons ====================

export function getItemTypeIcon(itemType: ItemType): React.ReactNode {
  switch (itemType) {
    case 'checkbox':
      return <CheckboxIcon />;
    case 'text':
      return <TextIcon />;
    case 'number':
      return <NumberIcon />;
    case 'select':
      return <SelectIcon />;
    case 'date':
      return <DateIcon />;
    case 'time':
      return <TimeIcon />;
    case 'photo':
      return <PhotoIcon />;
    case 'signature':
      return <SignatureIcon />;
    default:
      return <TextIcon />;
  }
}

// ==================== Generic Status Helpers ====================

export interface StatusIconConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function getTemplateStatusConfig(status: TemplateStatus, theme: Theme): StatusIconConfig {
  return {
    icon: getTemplateStatusIcon(status),
    color: getTemplateStatusColor(status, theme),
    bgColor: `${getTemplateStatusColor(status, theme)}20`,
  };
}

export function getInspectionStatusConfig(status: InspectionStatus, theme: Theme): StatusIconConfig {
  return {
    icon: getInspectionStatusIcon(status),
    color: getInspectionStatusColor(status, theme),
    bgColor: `${getInspectionStatusColor(status, theme)}20`,
  };
}

// ==================== Priority Icons ====================

export function getPriorityIcon(priority: 'low' | 'normal' | 'high' | 'urgent'): React.ReactNode {
  switch (priority) {
    case 'urgent':
      return <OverdueIcon color="error" />;
    case 'high':
      return <OverdueIcon color="warning" />;
    case 'normal':
      return <PendingIcon color="info" />;
    case 'low':
      return <PendingIcon color="disabled" />;
    default:
      return <PendingIcon />;
  }
}

export function getPriorityColor(priority: 'low' | 'normal' | 'high' | 'urgent', theme: Theme): string {
  switch (priority) {
    case 'urgent':
      return theme.palette.error.main;
    case 'high':
      return theme.palette.warning.main;
    case 'normal':
      return theme.palette.info.main;
    case 'low':
      return theme.palette.grey[500];
    default:
      return theme.palette.grey[500];
  }
}

export default {
  getTemplateStatusIcon,
  getTemplateStatusColor,
  getTemplateStatusConfig,
  getInspectionStatusIcon,
  getInspectionStatusColor,
  getInspectionStatusConfig,
  getItemTypeIcon,
  getPriorityIcon,
  getPriorityColor,
};
