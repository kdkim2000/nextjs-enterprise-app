'use client';

import React, { forwardRef } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  /**
   * Input variant
   */
  variant?: 'outlined' | 'filled' | 'standard';

  /**
   * Input type
   */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

  /**
   * Label text
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Helper text below input
   */
  helperText?: React.ReactNode;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Required field
   */
  required?: boolean;

  /**
   * Full width
   */
  fullWidth?: boolean;

  /**
   * Input size
   */
  size?: 'small' | 'medium';

  /**
   * Start adornment (icon/text before input)
   */
  startAdornment?: React.ReactNode;

  /**
   * End adornment (icon/text after input)
   */
  endAdornment?: React.ReactNode;

  /**
   * Multiline input (textarea)
   */
  multiline?: boolean;

  /**
   * Number of rows for multiline
   */
  rows?: number;

  /**
   * Max rows for multiline
   */
  maxRows?: number;

  /**
   * Character counter (show current/max length)
   */
  maxLength?: number;
  showCount?: boolean;

  /**
   * onChange handler
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * onBlur handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Value
   */
  value?: string | number;

  /**
   * Default value
   */
  defaultValue?: string | number;

  /**
   * Name attribute
   */
  name?: string;

  /**
   * Auto focus
   */
  autoFocus?: boolean;

  /**
   * Auto complete
   */
  autoComplete?: string;
}

const Input = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      variant = 'outlined',
      type = 'text',
      label,
      placeholder,
      helperText,
      error = false,
      disabled = false,
      required = false,
      fullWidth = true,
      size = 'medium',
      startAdornment,
      endAdornment,
      multiline = false,
      rows,
      maxRows,
      maxLength,
      showCount = false,
      onChange,
      onBlur,
      value,
      defaultValue,
      name,
      autoFocus = false,
      autoComplete,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [currentLength, setCurrentLength] = React.useState(
      value ? String(value).length : defaultValue ? String(defaultValue).length : 0
    );

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // Enforce maxLength
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      setCurrentLength(newValue.length);
      if (onChange) {
        onChange(event);
      }
    };

    // Build input props
    const inputProps: any = {
      ...(startAdornment && {
        startAdornment: <InputAdornment position="start">{startAdornment}</InputAdornment>
      }),
      ...(maxLength && {
        maxLength
      })
    };

    // Handle password visibility toggle
    if (type === 'password') {
      inputProps.endAdornment = (
        <InputAdornment position="end">
          {endAdornment}
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            edge="end"
            size="small"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      );
    } else if (endAdornment) {
      inputProps.endAdornment = <InputAdornment position="end">{endAdornment}</InputAdornment>;
    }

    return (
      <>
        <TextField
          ref={ref}
          variant={variant}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          label={label}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          size={size}
          multiline={multiline}
          rows={rows}
          maxRows={maxRows}
          onChange={handleChange}
          onBlur={onBlur}
          value={value}
          defaultValue={defaultValue}
          name={name}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          InputProps={inputProps}
          helperText={helperText}
          {...rest}
        />
        {showCount && maxLength && (
          <FormHelperText sx={{ textAlign: 'right', mt: 0.5 }}>
            {currentLength}/{maxLength}
          </FormHelperText>
        )}
      </>
    );
  }
);

Input.displayName = 'Input';

export default Input;
