'use client';

import { ReactNode } from 'react';

/**
 * Status indicator configuration
 */
export interface EntityStatusIndicator {
  /** Whether entity is active */
  active: boolean;
  /** Custom active icon (default: CheckCircle) */
  activeIcon?: ReactNode;
  /** Custom inactive icon (default: Cancel) */
  inactiveIcon?: ReactNode;
  /** Active color (default: success.main) */
  activeColor?: string;
  /** Inactive color (default: text.disabled) */
  inactiveColor?: string;
}

/**
 * Role badge configuration
 */
export interface EntityRoleBadge {
  /** Role label */
  label: string;
  /** Role icon */
  icon?: ReactNode;
  /** Background color */
  bgcolor?: string;
  /** Text color */
  color?: string;
}

/**
 * Security/feature badge
 */
export interface EntityFeatureBadge {
  /** Unique key */
  key: string;
  /** Badge label */
  label: string;
  /** Badge icon */
  icon?: ReactNode;
  /** Background color */
  bgcolor?: string;
  /** Text color */
  color?: string;
  /** Show only if true */
  show?: boolean;
}

/**
 * Swipe action definition
 */
export interface EntitySwipeAction<T> {
  /** Action icon */
  icon: ReactNode;
  /** Action label */
  label: string;
  /** Text color */
  color: string;
  /** Background color */
  backgroundColor: string;
  /** Click handler */
  onClick: (item: T) => void;
}

/**
 * Avatar configuration
 */
export interface EntityAvatarConfig {
  /** Avatar image URL */
  src?: string;
  /** Avatar initials (fallback when no image) */
  initials?: string;
  /** Avatar background color */
  bgcolor?: string;
  /** Avatar size (default: 48) */
  size?: number;
}

/**
 * Props for MobileEntityCard component
 */
export interface MobileEntityCardProps<T = unknown> {
  /** The data item */
  item: T;

  /** Avatar configuration (optional - card can be displayed without avatar) */
  avatar?: EntityAvatarConfig;

  /** Status indicator (shown on avatar) */
  status?: EntityStatusIndicator;

  /** Primary text (name) */
  primaryText: string;

  /** Role badge (shown next to name) */
  roleBadge?: EntityRoleBadge;

  /** Secondary text (ID, email, etc.) */
  secondaryText?: string;

  /** Additional text after secondary (e.g., employee number) */
  secondarySubtext?: string;

  /** Tertiary text (department, position, etc.) */
  tertiaryText?: string;

  /** Feature badges (MFA, SSO, etc.) */
  featureBadges?: EntityFeatureBadge[];

  /** Right side content */
  rightContent?: ReactNode;

  /** Whether entity is active (affects visual styling) */
  isActive?: boolean;

  /** Click handler */
  onClick?: (item: T) => void;

  /** Swipe actions */
  swipeActions?: EntitySwipeAction<T>[];

  /** Whether swipe actions are enabled */
  showSwipeActions?: boolean;

  /** Selection state */
  selected?: boolean;

  /** Whether selection mode is active */
  selectable?: boolean;

  /** Selection change handler */
  onSelectionChange?: (selected: boolean) => void;
}
