'use client';

import React, { forwardRef } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
  Box,
  Typography
} from '@mui/material';

export interface SwitchProps extends Omit<MuiSwitchProps, 'onChange'> {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  helperText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
  onLabel?: string;
  offLabel?: string;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      label,
      checked,
      onChange,
      helperText,
      error = false,
      disabled = false,
      labelPlacement = 'end',
      onLabel,
      offLabel,
      ...rest
    },
    ref
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.checked);
      }
    };

    const switchElement = (
      <MuiSwitch
        ref={ref}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        {...rest}
      />
    );

    // Simple switch without labels
    if (!label && !onLabel && !offLabel && !helperText) {
      return switchElement;
    }

    // Switch with on/off labels
    if (onLabel || offLabel) {
      return (
        <FormControl error={error} disabled={disabled}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {offLabel && (
              <Typography
                variant="body2"
                color={!checked ? 'text.primary' : 'text.secondary'}
              >
                {offLabel}
              </Typography>
            )}
            {switchElement}
            {onLabel && (
              <Typography
                variant="body2"
                color={checked ? 'text.primary' : 'text.secondary'}
              >
                {onLabel}
              </Typography>
            )}
          </Box>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );
    }

    // Switch with label
    return (
      <FormControl error={error} disabled={disabled}>
        <FormControlLabel
          control={switchElement}
          label={label || ''}
          labelPlacement={labelPlacement}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
