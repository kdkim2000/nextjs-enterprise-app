'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Box, IconButton, Typography } from '@mui/material';

export interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  backgroundColor: string;
  onClick: () => void;
}

export interface MobileSwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  actionWidth?: number;
  threshold?: number;
  disabled?: boolean;
}

const ACTION_WIDTH = 72;
const SWIPE_THRESHOLD = 0.3; // 30% of action width to trigger

export default function MobileSwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  actionWidth = ACTION_WIDTH,
  threshold = SWIPE_THRESHOLD,
  disabled = false,
}: MobileSwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const leftActionsWidth = leftActions.length * actionWidth;
  const rightActionsWidth = rightActions.length * actionWidth;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startX === null || !isDragging || disabled) return;

    const diff = e.touches[0].clientX - startX;

    // Limit the swipe distance
    let newX = diff;
    if (diff > 0) {
      // Swiping right (reveal left actions)
      newX = Math.min(diff, leftActionsWidth);
    } else {
      // Swiping left (reveal right actions)
      newX = Math.max(diff, -rightActionsWidth);
    }

    // Add resistance at boundaries
    if (diff > leftActionsWidth) {
      newX = leftActionsWidth + (diff - leftActionsWidth) * 0.2;
    } else if (diff < -rightActionsWidth) {
      newX = -rightActionsWidth + (diff + rightActionsWidth) * 0.2;
    }

    setCurrentX(newX);
  }, [startX, isDragging, disabled, leftActionsWidth, rightActionsWidth]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    // Snap to position
    let finalX = 0;

    if (currentX > leftActionsWidth * threshold) {
      finalX = leftActionsWidth;
    } else if (currentX < -rightActionsWidth * threshold) {
      finalX = -rightActionsWidth;
    }

    setCurrentX(finalX);
    setStartX(null);
    setIsDragging(false);
  }, [isDragging, currentX, leftActionsWidth, rightActionsWidth, threshold]);

  const handleActionClick = useCallback((action: SwipeAction) => {
    action.onClick();
    // Reset position after action
    setCurrentX(0);
  }, []);

  const handleContentClick = useCallback(() => {
    // Reset if actions are visible
    if (currentX !== 0) {
      setCurrentX(0);
    }
  }, [currentX]);

  // No actions, just render children
  if (leftActions.length === 0 && rightActions.length === 0) {
    return <>{children}</>;
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left Actions (revealed when swiping right) */}
      {leftActions.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            width: leftActionsWidth,
          }}
        >
          {leftActions.map((action, index) => (
            <Box
              key={index}
              onClick={() => handleActionClick(action)}
              sx={{
                width: actionWidth,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: action.backgroundColor,
                color: action.color,
                cursor: 'pointer',
                '&:active': {
                  opacity: 0.8,
                },
              }}
            >
              <IconButton
                size="small"
                sx={{ color: 'inherit' }}
              >
                {action.icon}
              </IconButton>
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                {action.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {rightActions.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            width: rightActionsWidth,
          }}
        >
          {rightActions.map((action, index) => (
            <Box
              key={index}
              onClick={() => handleActionClick(action)}
              sx={{
                width: actionWidth,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: action.backgroundColor,
                color: action.color,
                cursor: 'pointer',
                '&:active': {
                  opacity: 0.8,
                },
              }}
            >
              <IconButton
                size="small"
                sx={{ color: 'inherit' }}
              >
                {action.icon}
              </IconButton>
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                {action.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Main Content */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={handleContentClick}
        sx={{
          position: 'relative',
          backgroundColor: 'background.paper',
          transform: `translateX(${currentX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
