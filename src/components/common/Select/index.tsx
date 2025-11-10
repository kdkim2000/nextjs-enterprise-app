'use client';

import React, { forwardRef } from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  SelectProps as MuiSelectProps,
  Chip,
  Box
} from '@mui/material';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<MuiSelectProps, 'variant'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  onChange?: (event: any) => void;
  value?: string | number | string[] | number[];
  multiple?: boolean;
  showChips?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder = 'Select an option',
      helperText,
      error = false,
      required = false,
      fullWidth = true,
      size = 'medium',
      variant = 'outlined',
      onChange,
      value,
      multiple = false,
      showChips = true,
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const labelId = `select-label-${label?.replace(/\s/g, '-')}`;

    return (
      <FormControl
        ref={ref}
        fullWidth={fullWidth}
        size={size}
        error={error}
        required={required}
        variant={variant}
        disabled={disabled}
      >
        {label && <InputLabel id={labelId}>{label}</InputLabel>}
        <MuiSelect
          labelId={label ? labelId : undefined}
          label={label}
          value={value || (multiple ? [] : '')}
          onChange={onChange}
          displayEmpty
          multiple={multiple}
          renderValue={(selected) => {
            if (!selected || (Array.isArray(selected) && selected.length === 0)) {
              return <Box sx={{ color: 'text.secondary' }}>{placeholder}</Box>;
            }

            if (multiple && Array.isArray(selected) && showChips) {
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val) => {
                    const option = options.find((opt) => opt.value === val);
                    return (
                      <Chip
                        key={val}
                        label={option?.label || val}
                        size="small"
                      />
                    );
                  })}
                </Box>
              );
            }

            if (multiple && Array.isArray(selected)) {
              return selected
                .map((val) => options.find((opt) => opt.value === val)?.label || val)
                .join(', ');
            }

            const option = options.find((opt) => opt.value === selected);
            return option?.label || selected;
          }}
          {...rest}
        >
          {placeholder && !multiple && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.icon && (
                <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  {option.icon}
                </Box>
              )}
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

Select.displayName = 'Select';

export default Select;
