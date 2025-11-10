'use client';

import React from 'react';
import {
  Box,
  LinearProgress as MuiLinearProgress,
  CircularProgress as MuiCircularProgress,
  Typography,
  styled
} from '@mui/material';

export type ProgressType = 'linear' | 'circular';
export type ProgressVariant = 'determinate' | 'indeterminate';
export type ProgressSize = 'small' | 'medium' | 'large';

export interface ProgressProps {
  /**
   * Progress type
   */
  type?: ProgressType;

  /**
   * Progress variant
   */
  variant?: ProgressVariant;

  /**
   * Progress value (0-100)
   */
  value?: number;

  /**
   * Size of progress indicator
   */
  size?: ProgressSize;

  /**
   * Color
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';

  /**
   * Show percentage label
   */
  showLabel?: boolean;

  /**
   * Custom label
   */
  label?: string;

  /**
   * Height for linear progress
   */
  height?: number;

  /**
   * Show steps (e.g., "3/5")
   */
  currentStep?: number;
  totalSteps?: number;

  /**
   * Custom styling
   */
  sx?: object;
}

const sizeMap = {
  small: { circular: 24, linear: 4 },
  medium: { circular: 40, linear: 6 },
  large: { circular: 60, linear: 8 }
};

const StyledLinearProgress = styled(MuiLinearProgress)<{ height?: number }>(
  ({ height }) => ({
    height: height,
    borderRadius: height ? height / 2 : 3
  })
);

export default function Progress({
  type = 'linear',
  variant = 'determinate',
  value = 0,
  size = 'medium',
  color = 'primary',
  showLabel = false,
  label,
  height,
  currentStep,
  totalSteps,
  sx
}: ProgressProps) {
  const progressValue = Math.min(100, Math.max(0, value));

  // Calculate step-based progress
  const stepProgress = currentStep && totalSteps
    ? (currentStep / totalSteps) * 100
    : progressValue;

  // Linear Progress
  if (type === 'linear') {
    const linearHeight = height || sizeMap[size].linear;

    return (
      <Box sx={{ width: '100%', ...sx }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: showLabel || label ? 0.5 : 0 }}>
          {(showLabel || label) && (
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
              {label || `${Math.round(stepProgress)}%`}
            </Typography>
          )}
          {currentStep !== undefined && totalSteps !== undefined && (
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
              ({currentStep}/{totalSteps})
            </Typography>
          )}
        </Box>
        <StyledLinearProgress
          variant={variant}
          value={variant === 'determinate' ? stepProgress : undefined}
          color={color}
          height={linearHeight}
        />
      </Box>
    );
  }

  // Circular Progress
  if (type === 'circular') {
    const circularSize = sizeMap[size].circular;

    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          ...sx
        }}
      >
        <MuiCircularProgress
          variant={variant}
          value={variant === 'determinate' ? stepProgress : undefined}
          size={circularSize}
          color={color}
        />
        {showLabel && variant === 'determinate' && (
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12 }}
            >
              {label || `${Math.round(stepProgress)}%`}
            </Typography>
          </Box>
        )}
        {currentStep !== undefined && totalSteps !== undefined && (
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12 }}
            >
              {currentStep}/{totalSteps}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return null;
}

// Convenience exports
export const LinearProgress = (props: Omit<ProgressProps, 'type'>) => (
  <Progress {...props} type="linear" />
);

export const CircularProgress = (props: Omit<ProgressProps, 'type'>) => (
  <Progress {...props} type="circular" />
);
