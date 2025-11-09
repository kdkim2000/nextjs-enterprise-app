'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Box,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  value: string[]; // Array of selected values
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  allLabel?: string; // Label for "All" option (e.g., "All Methods")
}

/**
 * Reusable multi-select component with modern Google-style design
 * Supports multiple selection with checkboxes and chip display
 *
 * @example
 * ```tsx
 * const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
 *
 * <MultiSelect
 *   label="Method"
 *   value={selectedMethods}
 *   onChange={setSelectedMethods}
 *   options={[
 *     { value: 'GET', label: 'GET' },
 *     { value: 'POST', label: 'POST' },
 *     { value: 'PUT', label: 'PUT' }
 *   ]}
 *   allLabel="All Methods"
 * />
 * ```
 */
export default function MultiSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  helperText,
  fullWidth = true,
  size = 'small',
  allLabel = 'All'
}: MultiSelectProps) {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValue = event.target.value;
    const newValue = typeof selectedValue === 'string' ? selectedValue.split(',') : selectedValue;

    // If "all" is selected, clear all selections (meaning "all")
    if (newValue.includes('')) {
      onChange([]);
      return;
    }

    onChange(newValue);
  };

  const handleDelete = (valueToDelete: string) => {
    onChange(value.filter((v) => v !== valueToDelete));
  };

  // Display text: show "All" if nothing selected, otherwise show count
  const getDisplayText = () => {
    if (value.length === 0) {
      return allLabel;
    }
    return `${value.length} selected`;
  };

  return (
    <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
      <InputLabel
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.secondary',
          '&.Mui-focused': {
            color: 'primary.main',
            fontWeight: 600,
          },
        }}
      >
        {label}
      </InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.length === 0 ? (
              <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{allLabel}</Box>
            ) : (
              selected.map((val) => {
                const option = options.find((opt) => opt.value === val);
                return (
                  <Chip
                    key={val}
                    label={option?.label || val}
                    size="small"
                    onDelete={() => handleDelete(val)}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                    sx={{
                      height: '24px',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: 'primary.main',
                      fontWeight: 500,
                      '& .MuiChip-deleteIcon': {
                        fontSize: '16px',
                        color: 'primary.main',
                        '&:hover': {
                          color: 'primary.dark',
                        },
                      },
                    }}
                  />
                );
              })
            )}
          </Box>
        )}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: '8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'action.hover',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          },
          '&.Mui-focused': {
            backgroundColor: 'background.paper',
            boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.12)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              borderColor: 'primary.main',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .MuiSelect-select': {
            fontSize: '0.875rem',
            fontWeight: 400,
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid',
              borderColor: 'divider',
              marginTop: '4px',
              maxHeight: '300px',
              '& .MuiList-root': {
                padding: '4px',
              },
            },
          },
        }}
      >
        {/* "All" option */}
        <MenuItem
          value=""
          sx={{
            fontSize: '0.875rem',
            borderRadius: '6px',
            margin: '2px 0',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
          }}
        >
          <Checkbox
            checked={value.length === 0}
            sx={{
              padding: '4px',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
          <ListItemText
            primary={allLabel}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: value.length === 0 ? 600 : 400,
            }}
          />
        </MenuItem>

        {/* Individual options */}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              fontSize: '0.875rem',
              borderRadius: '6px',
              margin: '2px 0',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <Checkbox
              checked={value.indexOf(option.value) > -1}
              sx={{
                padding: '4px',
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
            <ListItemText
              primary={option.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: value.indexOf(option.value) > -1 ? 600 : 400,
              }}
            />
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary', ml: 1.5 }}>
          {helperText}
        </Box>
      )}
    </FormControl>
  );
}
