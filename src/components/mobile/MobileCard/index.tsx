'use client';

import React, { useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Chip,
  Checkbox,
  IconButton,
  Divider,
  ChipProps
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

export interface MobileCardChip {
  label: string;
  color?: ChipProps['color'];
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
}

export interface MobileCardAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export interface MobileCardProps<T = unknown> {
  item: T;
  primaryText: string | ((item: T) => string);
  secondaryText?: string | ((item: T) => string);
  tertiaryText?: string | ((item: T) => string);
  avatar?: React.ReactNode | ((item: T) => React.ReactNode);
  badge?: React.ReactNode | ((item: T) => React.ReactNode);
  chips?: MobileCardChip[] | ((item: T) => MobileCardChip[]);
  actions?: MobileCardAction[];
  onClick?: (item: T) => void;
  onLongPress?: (item: T) => void;
  onMoreClick?: (item: T, anchorEl: HTMLElement) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  divider?: boolean;
  disabled?: boolean;
}

const LONG_PRESS_DURATION = 500;

export default function MobileCard<T = unknown>({
  item,
  primaryText,
  secondaryText,
  tertiaryText,
  avatar,
  badge,
  chips,
  actions,
  onClick,
  onLongPress,
  onMoreClick,
  selected = false,
  selectable = false,
  onSelectionChange,
  divider = true,
  disabled = false,
}: MobileCardProps<T>) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // Helper to resolve value or function
  const resolve = <V,>(value: V | ((item: T) => V)): V => {
    return typeof value === 'function' ? (value as (item: T) => V)(item) : value;
  };

  const resolvedPrimaryText = resolve(primaryText);
  const resolvedSecondaryText = secondaryText ? resolve(secondaryText) : undefined;
  const resolvedTertiaryText = tertiaryText ? resolve(tertiaryText) : undefined;
  const resolvedAvatar = avatar ? resolve(avatar) : undefined;
  const resolvedBadge = badge ? resolve(badge) : undefined;
  const resolvedChips = chips ? resolve(chips) : undefined;

  const handleTouchStart = useCallback(() => {
    if (!onLongPress) return;
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress(item);
    }, LONG_PRESS_DURATION);
  }, [item, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    if (selectable && onSelectionChange) {
      onSelectionChange(!selected);
    } else if (onClick) {
      onClick(item);
    }
  }, [item, onClick, selectable, selected, onSelectionChange]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange?.(!selected);
  }, [selected, onSelectionChange]);

  const handleMoreClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onMoreClick?.(item, e.currentTarget);
  }, [item, onMoreClick]);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          backgroundColor: selected ? 'action.selected' : 'transparent',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: disabled ? 'transparent' : 'action.hover',
          },
        }}
      >
        <CardActionArea
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          disabled={disabled}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            p: 1.5,
            gap: 1.5,
          }}
        >
          {/* Selection Checkbox */}
          {selectable && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'center',
              }}
              onClick={handleCheckboxClick}
            >
              <Checkbox
                checked={selected}
                size="small"
                sx={{ p: 0 }}
              />
            </Box>
          )}

          {/* Avatar Area */}
          {resolvedAvatar && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {resolvedAvatar}
            </Box>
          )}

          {/* Content Area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Primary Text + Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <Typography
                variant="body1"
                fontWeight={500}
                noWrap
                sx={{ flex: 1, minWidth: 0 }}
              >
                {resolvedPrimaryText}
              </Typography>
              {resolvedBadge && (
                <Box sx={{ flexShrink: 0 }}>
                  {resolvedBadge}
                </Box>
              )}
            </Box>

            {/* Secondary Text */}
            {resolvedSecondaryText && (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ mb: 0.25 }}
              >
                {resolvedSecondaryText}
              </Typography>
            )}

            {/* Tertiary Text */}
            {resolvedTertiaryText && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                {resolvedTertiaryText}
              </Typography>
            )}

            {/* Chips */}
            {resolvedChips && resolvedChips.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
                {resolvedChips.map((chip, index) => (
                  <Chip
                    key={index}
                    label={chip.label}
                    color={chip.color || 'default'}
                    size={chip.size || 'small'}
                    variant={chip.variant || 'outlined'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Action Area */}
          {(actions || onMoreClick) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                alignSelf: 'center',
              }}
            >
              {actions?.map((action, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  aria-label={action.label}
                >
                  {action.icon}
                </IconButton>
              ))}
              {onMoreClick && (
                <IconButton
                  size="small"
                  onClick={handleMoreClick}
                  aria-label="more options"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </CardActionArea>
      </Card>
      {divider && <Divider />}
    </>
  );
}
