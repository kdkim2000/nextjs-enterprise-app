'use client';

import React from 'react';
import { Box, Typography, Avatar, Chip, alpha, useTheme } from '@mui/material';
import {
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import MobileSwipeActions from '@/components/mobile/MobileSwipeActions';
import { MobileEntityCardProps } from './types';

// Re-export types
export * from './types';

/**
 * MobileEntityCard - A mobile-optimized card for displaying entity information
 *
 * Features:
 * - Avatar with status indicator
 * - Role badge next to name
 * - Information hierarchy (primary, secondary, tertiary)
 * - Feature badges (MFA, SSO, etc.)
 * - Swipe actions
 * - Selection mode with custom checkbox
 * - Visual distinction for inactive entities
 *
 * @example
 * ```tsx
 * <MobileEntityCard
 *   item={user}
 *   avatar={{
 *     src: user.avatarUrl,
 *     initials: 'JD',
 *     bgcolor: 'primary.main',
 *   }}
 *   status={{ active: user.isActive }}
 *   primaryText={user.name}
 *   roleBadge={{
 *     label: 'Admin',
 *     icon: <AdminIcon />,
 *     bgcolor: 'error.50',
 *     color: 'error.dark',
 *   }}
 *   secondaryText={user.email}
 *   tertiaryText={user.department}
 *   featureBadges={[
 *     { key: 'mfa', label: 'MFA', icon: <SecurityIcon />, show: user.mfaEnabled },
 *   ]}
 *   swipeActions={[
 *     { icon: <EditIcon />, label: 'Edit', ... },
 *   ]}
 * />
 * ```
 */
export default function MobileEntityCard<T = unknown>({
  item,
  avatar,
  status,
  primaryText,
  roleBadge,
  secondaryText,
  secondarySubtext,
  tertiaryText,
  featureBadges,
  rightContent,
  isActive = true,
  onClick,
  swipeActions,
  showSwipeActions = true,
  selected = false,
  selectable = false,
  onSelectionChange,
}: MobileEntityCardProps<T>) {
  const theme = useTheme();

  const handleClick = () => {
    if (selectable && onSelectionChange) {
      onSelectionChange(!selected);
    } else if (onClick) {
      onClick(item);
    }
  };

  // Filter visible feature badges
  const visibleBadges = featureBadges?.filter((badge) => badge.show !== false) || [];

  const cardContent = (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        p: 1.5,
        gap: 1.5,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.08)
          : isActive
          ? 'background.paper'
          : alpha(theme.palette.action.disabled, 0.04),
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        '&:active': {
          bgcolor: alpha(theme.palette.primary.main, 0.12),
        },
      }}
    >
      {/* Selection checkbox area */}
      {selectable && (
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: selected ? 'primary.main' : 'divider',
            bgcolor: selected ? 'primary.main' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mt: 1,
          }}
        >
          {selected && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'white',
              }}
            />
          )}
        </Box>
      )}

      {/* Avatar with status indicator (only shown when avatar is provided) */}
      {avatar ? (
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            src={avatar.src || undefined}
            sx={{
              width: avatar.size || 48,
              height: avatar.size || 48,
              bgcolor: avatar.bgcolor || 'primary.main',
              fontSize: '1rem',
              fontWeight: 600,
              opacity: isActive ? 1 : 0.6,
            }}
          >
            {avatar.initials}
          </Avatar>
          {/* Status indicator */}
          {status && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            >
              {status.active ? (
                status.activeIcon || (
                  <ActiveIcon
                    sx={{
                      fontSize: 14,
                      color: status.activeColor || 'success.main',
                    }}
                  />
                )
              ) : (
                status.inactiveIcon || (
                  <InactiveIcon
                    sx={{
                      fontSize: 14,
                      color: status.inactiveColor || 'text.disabled',
                    }}
                  />
                )
              )}
            </Box>
          )}
        </Box>
      ) : status ? (
        /* Show only status indicator when no avatar but status is provided */
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {status.active ? (
            status.activeIcon || (
              <ActiveIcon
                sx={{
                  fontSize: 18,
                  color: status.activeColor || 'success.main',
                }}
              />
            )
          ) : (
            status.inactiveIcon || (
              <InactiveIcon
                sx={{
                  fontSize: 18,
                  color: status.inactiveColor || 'text.disabled',
                }}
              />
            )
          )}
        </Box>
      ) : null}

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Name + Role Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: isActive ? 'text.primary' : 'text.secondary',
            }}
          >
            {primaryText}
          </Typography>
          {roleBadge && (
            <Chip
              icon={roleBadge.icon as React.ReactElement | undefined}
              label={roleBadge.label}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: roleBadge.bgcolor || 'grey.100',
                color: roleBadge.color || 'text.secondary',
                '& .MuiChip-icon': {
                  ml: 0.5,
                  mr: -0.5,
                  color: 'inherit',
                  fontSize: 12,
                },
              }}
            />
          )}
        </Box>

        {/* Secondary text + subtext */}
        {secondaryText && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.25,
            }}
          >
            {secondaryText}
            {secondarySubtext && (
              <Typography
                component="span"
                variant="caption"
                sx={{ color: 'text.disabled', ml: 0.5 }}
              >
                ({secondarySubtext})
              </Typography>
            )}
          </Typography>
        )}

        {/* Tertiary text */}
        {tertiaryText && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.disabled',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.5,
            }}
          >
            {tertiaryText}
          </Typography>
        )}

        {/* Feature badges */}
        {visibleBadges.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {visibleBadges.map((badge) => (
              <Chip
                key={badge.key}
                icon={badge.icon as React.ReactElement | undefined}
                label={badge.label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  bgcolor: badge.bgcolor || 'grey.100',
                  color: badge.color || 'text.secondary',
                  '& .MuiChip-icon': {
                    ml: 0.5,
                    mr: -0.5,
                    color: 'inherit',
                    fontSize: '12px !important',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Right side content */}
      {!selectable && rightContent && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.5,
            pt: 0.5,
          }}
        >
          {rightContent}
        </Box>
      )}
    </Box>
  );

  // Wrap with swipe actions if enabled
  if (showSwipeActions && swipeActions && swipeActions.length > 0) {
    return (
      <MobileSwipeActions
        rightActions={swipeActions.map((action) => ({
          icon: action.icon,
          label: action.label,
          color: action.color,
          backgroundColor: action.backgroundColor,
          onClick: () => action.onClick(item),
        }))}
      >
        {cardContent}
      </MobileSwipeActions>
    );
  }

  return cardContent;
}
