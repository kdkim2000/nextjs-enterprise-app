'use client';

import React, { memo, useCallback } from 'react';
import { Box, Skeleton } from '@mui/material';

const DEFAULT_ACTIVE_COLOR = '#6366f1';

export interface FilterTab<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterTabsProps<T extends string = string> {
  /** Array of tab items */
  tabs: FilterTab<T>[];
  /** Currently selected value */
  value: T;
  /** Change handler */
  onChange: (value: T) => void;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Active tab color */
  activeColor?: string;
  /** Loading state */
  loading?: boolean;
  /** Full width tabs */
  fullWidth?: boolean;
}

function FilterTabs<T extends string = string>({
  tabs,
  value,
  onChange,
  size = 'small',
  activeColor = DEFAULT_ACTIVE_COLOR,
  loading = false,
  fullWidth = false
}: FilterTabsProps<T>) {
  const handleClick = useCallback(
    (tabValue: T, disabled?: boolean) => {
      if (!disabled) {
        onChange(tabValue);
      }
    },
    [onChange]
  );

  const sizeStyles = {
    small: {
      px: 1.25,
      py: 0.5,
      fontSize: '0.7rem',
      gap: 0.75
    },
    medium: {
      px: 2,
      py: 0.75,
      fontSize: '0.8rem',
      gap: 1
    }
  };

  const styles = sizeStyles[size];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: styles.gap }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width={size === 'small' ? 60 : 80}
            height={size === 'small' ? 28 : 34}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: styles.gap,
        ...(fullWidth && {
          width: '100%',
          '& > *': { flex: 1 }
        })
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        const isDisabled = tab.disabled;

        return (
          <Box
            key={tab.value}
            onClick={() => handleClick(tab.value, isDisabled)}
            sx={{
              px: styles.px,
              py: styles.py,
              borderRadius: 2,
              fontSize: styles.fontSize,
              fontWeight: 500,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              opacity: isDisabled ? 0.5 : 1,
              bgcolor: isActive ? activeColor : 'rgba(0, 0, 0, 0.04)',
              color: isActive ? '#fff' : 'text.secondary',
              '&:hover': {
                bgcolor: isDisabled
                  ? isActive
                    ? activeColor
                    : 'rgba(0, 0, 0, 0.04)'
                  : isActive
                    ? activeColor
                    : 'rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  px: 0.5,
                  py: 0.125,
                  borderRadius: 1,
                  fontSize: '0.6rem',
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)'
                }}
              >
                {tab.count}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default memo(FilterTabs) as <T extends string = string>(
  props: FilterTabsProps<T>
) => React.ReactElement;
