'use client';

import React, { ReactNode } from 'react';
import { Box, Chip, Typography } from '@mui/material';

// Filter option type
export interface FilterOption {
  key: string;
  label: string;
  icon?: ReactNode;
  color?: string;
  count?: number;
}

// Props
interface FilterChipsProps {
  options: FilterOption[];
  selected: string | string[];
  onChange: (value: string) => void;
  multiple?: boolean;
  size?: 'small' | 'medium';
  showCount?: boolean;
  variant?: 'filled' | 'outlined';
}

// Single select filter chips
export function FilterChips({
  options,
  selected,
  onChange,
  multiple = false,
  size = 'small',
  showCount = true,
  variant = 'outlined'
}: FilterChipsProps) {
  const isSelected = (key: string) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(key);
    }
    return selected === key;
  };

  const handleClick = (key: string) => {
    if (isSelected(key)) {
      onChange(''); // Deselect
    } else {
      onChange(key);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {options.map((option) => {
        const active = isSelected(option.key);
        const color = option.color || '#6b7280';

        return (
          <Chip
            key={option.key}
            icon={option.icon as React.ReactElement | undefined}
            label={
              showCount && option.count !== undefined
                ? `${option.label} (${option.count})`
                : option.label
            }
            onClick={() => handleClick(option.key)}
            size={size}
            sx={{
              bgcolor: active ? color : 'white',
              color: active ? 'white' : color,
              borderColor: color,
              border: variant === 'outlined' ? '1px solid' : 'none',
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: active ? 'white' : color
              },
              '&:hover': {
                bgcolor: active ? color : `${color}10`
              }
            }}
          />
        );
      })}
    </Box>
  );
}

// Category filter chips (with predefined colors/icons)
interface CategoryFilterChipsProps {
  categories: Record<string, number>;
  selected: string;
  onChange: (value: string) => void;
  categoryConfig: Record<string, { icon: ReactNode; color: string; label: string }>;
  size?: 'small' | 'medium';
}

export function CategoryFilterChips({
  categories,
  selected,
  onChange,
  categoryConfig,
  size = 'small'
}: CategoryFilterChipsProps) {
  const options: FilterOption[] = Object.entries(categories).map(([key, count]) => ({
    key,
    label: categoryConfig[key]?.label || key,
    icon: categoryConfig[key]?.icon,
    color: categoryConfig[key]?.color,
    count
  }));

  return (
    <FilterChips
      options={options}
      selected={selected}
      onChange={onChange}
      size={size}
      showCount={true}
    />
  );
}

// Toggle button group style filter
interface ToggleFilterProps {
  options: Array<{ value: string; label: string }>;
  selected: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium';
}

export function ToggleFilter({ options, selected, onChange, size = 'small' }: ToggleFilterProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        bgcolor: 'grey.100',
        borderRadius: 2,
        p: 0.5
      }}
    >
      {options.map((option) => (
        <Box
          key={option.value}
          onClick={() => onChange(option.value)}
          sx={{
            px: size === 'small' ? 1.5 : 2,
            py: size === 'small' ? 0.5 : 0.75,
            borderRadius: 1.5,
            cursor: 'pointer',
            bgcolor: selected === option.value ? 'white' : 'transparent',
            boxShadow: selected === option.value ? 1 : 0,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: selected === option.value ? 'white' : 'grey.200'
            }
          }}
        >
          <Typography
            variant="body2"
            fontWeight={selected === option.value ? 600 : 400}
            sx={{
              fontSize: size === 'small' ? '0.75rem' : '0.8rem',
              color: selected === option.value ? 'grey.800' : 'grey.600'
            }}
          >
            {option.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// Removable filter chips (for showing active filters)
interface ActiveFiltersProps {
  filters: Array<{ key: string; label: string; value: string }>;
  onRemove: (key: string) => void;
  onClearAll?: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
      {filters.map((filter) => (
        <Chip
          key={filter.key}
          label={`${filter.label}: ${filter.value}`}
          size="small"
          onDelete={() => onRemove(filter.key)}
          sx={{
            bgcolor: 'primary.50',
            color: 'primary.main',
            '& .MuiChip-deleteIcon': {
              color: 'primary.main',
              '&:hover': { color: 'primary.dark' }
            }
          }}
        />
      ))}
      {onClearAll && filters.length > 1 && (
        <Chip
          label="Clear all"
          size="small"
          onClick={onClearAll}
          sx={{
            bgcolor: 'grey.100',
            color: 'grey.600',
            '&:hover': { bgcolor: 'grey.200' }
          }}
        />
      )}
    </Box>
  );
}

export default FilterChips;
