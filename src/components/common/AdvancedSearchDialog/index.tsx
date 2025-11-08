'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid2 as Grid
} from '@mui/material';
import UserSelector from '@/components/common/UserSelector';

export type FilterFieldType =
  | 'text'
  | 'select'
  | 'userSelector'
  | 'custom';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterFieldConfig {
  name: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  helperText?: string;
  options?: SelectOption[]; // For select type
  gridSize?: { xs?: number; sm?: number; md?: number; lg?: number };
  render?: (value: string, onChange: (value: string) => void) => React.ReactNode; // For custom type
  size?: 'small' | 'medium';
}

export interface AdvancedSearchDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  fields: FilterFieldConfig[];
  filters: Record<string, string>;
  onFilterChange: (field: string, value: string) => void;
  onClear: () => void;
  onApply: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  clearText?: string;
  cancelText?: string;
  applyText?: string;
}

export default function AdvancedSearchDialog({
  open,
  onClose,
  title = 'Advanced Search',
  fields,
  filters,
  onFilterChange,
  onClear,
  onApply,
  maxWidth = 'sm',
  clearText = 'Clear All',
  cancelText = 'Cancel',
  applyText = 'Apply'
}: AdvancedSearchDialogProps) {
  const renderField = (field: FilterFieldConfig) => {
    const fieldValue = filters[field.name] ?? '';
    const size = field.size || 'small';

    let fieldElement: React.ReactNode;

    switch (field.type) {
      case 'select':
        fieldElement = (
          <FormControl fullWidth size={size}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={fieldValue}
              onChange={(e) => onFilterChange(field.name, e.target.value)}
              label={field.label}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        break;

      case 'userSelector':
        fieldElement = (
          <UserSelector
            label={field.label}
            value={fieldValue}
            onChange={(userId) => onFilterChange(field.name, userId || '')}
            helperText={field.helperText}
          />
        );
        break;

      case 'custom':
        if (field.render) {
          fieldElement = field.render(fieldValue, (value) => onFilterChange(field.name, value));
        } else {
          fieldElement = null;
        }
        break;

      case 'text':
      default:
        fieldElement = (
          <TextField
            label={field.label}
            type="text"
            value={fieldValue}
            onChange={(e) => onFilterChange(field.name, e.target.value)}
            fullWidth
            placeholder={field.placeholder}
            helperText={field.helperText}
            size={size}
          />
        );
    }

    return fieldElement;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {fields.map((field) => {
            const content = renderField(field);
            if (!content) return null;

            const gridSize = field.gridSize || { xs: 12 };
            return (
              <Grid key={field.name} size={gridSize}>
                {content}
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClear} color="inherit">
          {clearText}
        </Button>
        <Button onClick={onClose}>
          {cancelText}
        </Button>
        <Button onClick={onApply} variant="contained">
          {applyText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
