'use client';

import React from 'react';
import { Box, CircularProgress, LinearProgress, Skeleton, Typography } from '@mui/material';

export type LoadingType = 'circular' | 'linear' | 'skeleton' | 'overlay';
export type LoadingSize = 'small' | 'medium' | 'large';

export interface LoadingProps {
  /**
   * Type of loading indicator
   */
  type?: LoadingType;

  /**
   * Size of the loading indicator
   */
  size?: LoadingSize;

  /**
   * Loading text to display
   */
  text?: string;

  /**
   * Show loading as fullscreen overlay
   */
  fullscreen?: boolean;

  /**
   * Custom color
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';

  /**
   * Progress value (0-100) for determinate progress
   */
  value?: number;

  /**
   * Number of skeleton lines (for skeleton type)
   */
  lines?: number;

  /**
   * Custom height (for skeleton type)
   */
  height?: number | string;

  /**
   * Custom width (for skeleton type)
   */
  width?: number | string;
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 60
};

export default function Loading({
  type = 'circular',
  size = 'medium',
  text,
  fullscreen = false,
  color = 'primary',
  value,
  lines = 3,
  height,
  width = '100%'
}: LoadingProps) {
  const spinnerSize = sizeMap[size];

  // Circular Progress
  if (type === 'circular') {
    const content = (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <CircularProgress
          color={color}
          size={spinnerSize}
          variant={value !== undefined ? 'determinate' : 'indeterminate'}
          value={value}
        />
        {text && (
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        )}
        {value !== undefined && (
          <Typography variant="caption" color="text.secondary">
            {Math.round(value)}%
          </Typography>
        )}
      </Box>
    );

    if (fullscreen) {
      return (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 9999
          }}
        >
          {content}
        </Box>
      );
    }

    return content;
  }

  // Linear Progress
  if (type === 'linear') {
    return (
      <Box sx={{ width: width }}>
        <LinearProgress
          color={color}
          variant={value !== undefined ? 'determinate' : 'indeterminate'}
          value={value}
        />
        {text && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {text}
          </Typography>
        )}
      </Box>
    );
  }

  // Skeleton
  if (type === 'skeleton') {
    return (
      <Box sx={{ width: width }}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            height={height || 40}
            sx={{ mb: index < lines - 1 ? 1 : 0 }}
          />
        ))}
      </Box>
    );
  }

  // Overlay (full container overlay)
  if (type === 'overlay') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
          gap: 2
        }}
      >
        <CircularProgress color={color} size={spinnerSize} />
        {text && (
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        )}
      </Box>
    );
  }

  return null;
}

// Convenience exports
export const LoadingSpinner = (props: Omit<LoadingProps, 'type'>) => (
  <Loading {...props} type="circular" />
);

export const LoadingBar = (props: Omit<LoadingProps, 'type'>) => (
  <Loading {...props} type="linear" />
);

export const LoadingSkeleton = (props: Omit<LoadingProps, 'type'>) => (
  <Loading {...props} type="skeleton" />
);

export const LoadingOverlay = (props: Omit<LoadingProps, 'type'>) => (
  <Loading {...props} type="overlay" />
);
