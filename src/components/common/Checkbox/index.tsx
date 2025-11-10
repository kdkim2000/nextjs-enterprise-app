'use client';

import React, { forwardRef } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Checkbox as MuiCheckbox,
  Radio,
  RadioGroup as MuiRadioGroup,
  CheckboxProps as MuiCheckboxProps
} from '@mui/material';

export interface CheckboxOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  type?: 'checkbox' | 'radio';
  label?: string;
  options: CheckboxOption[];
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  error?: boolean;
  helperText?: React.ReactNode;
  required?: boolean;
  row?: boolean;
  disabled?: boolean;
  name?: string;
}

export interface SingleCheckboxProps extends Omit<MuiCheckboxProps, 'onChange'> {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  helperText?: React.ReactNode;
  error?: boolean;
}

// Single Checkbox Component
export const Checkbox = forwardRef<HTMLButtonElement, SingleCheckboxProps>(
  ({ label, checked, onChange, helperText, error, disabled, ...rest }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.checked);
      }
    };

    const checkbox = (
      <MuiCheckbox
        ref={ref}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        {...rest}
      />
    );

    if (!label && !helperText) {
      return checkbox;
    }

    return (
      <FormControl error={error} disabled={disabled}>
        <FormControlLabel control={checkbox} label={label || ''} />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Checkbox/Radio Group Component
export default function CheckboxGroup({
  type = 'checkbox',
  label,
  options,
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  row = false,
  disabled = false,
  name
}: CheckboxGroupProps) {
  const handleCheckboxChange = (optionValue: string | number) => {
    if (!onChange) return;

    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];

    onChange(newValues);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  if (type === 'radio') {
    return (
      <FormControl error={error} required={required} disabled={disabled} component="fieldset">
        {label && <FormLabel component="legend">{label}</FormLabel>}
        <MuiRadioGroup
          name={name}
          value={value || ''}
          onChange={handleRadioChange}
          row={row}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={option.disabled || disabled}
            />
          ))}
        </MuiRadioGroup>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  // Checkbox group
  return (
    <FormControl error={error} required={required} disabled={disabled} component="fieldset">
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <FormGroup row={row}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <MuiCheckbox
                checked={Array.isArray(value) && value.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
                disabled={option.disabled || disabled}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

// Radio Group convenience export
export const RadioGroup = (props: Omit<CheckboxGroupProps, 'type'>) => (
  <CheckboxGroup {...props} type="radio" />
);
