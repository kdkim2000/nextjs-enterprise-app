'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Stack,
  Grid2 as Grid,
  Box,
  Tooltip,
  IconButton
} from '@mui/material';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'textarea'
  | 'custom';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  options?: SelectOption[]; // For select type
  gridSize?: { xs?: number; sm?: number; md?: number; lg?: number }; // Grid column span
  render?: (value: any, onChange: (value: any) => void) => React.ReactNode; // For custom type
  tooltip?: string;
  multiline?: boolean;
  rows?: number;
  showOnlyForNew?: boolean; // Only show for new items (not editing)
  showOnlyForEdit?: boolean; // Only show for editing (not new)
  size?: 'small' | 'medium';
}

export interface CrudDialogProps<T = Record<string, any>> {
  open: boolean;
  title?: string;
  data: T | null;
  fields: FormFieldConfig[];
  onClose: () => void;
  onSave: (data: T) => Promise<void>;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  cancelText?: string;
  saveText?: string;
  useGrid?: boolean; // Use Grid layout instead of Stack
}

export default function CrudDialog<T extends Record<string, any>>({
  open,
  title,
  data,
  fields,
  onClose,
  onSave,
  loading = false,
  maxWidth = 'sm',
  cancelText = 'Cancel',
  saveText = 'Save',
  useGrid = false
}: CrudDialogProps<T>) {
  const [formData, setFormData] = React.useState<T | null>(data);
  const isEditing = data && 'id' in data && data.id;

  React.useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [fieldName]: value } : null));
  };

  const handleSave = async () => {
    if (formData) {
      await onSave(formData);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    if (!formData) return null;

    // Check visibility conditions
    if (field.showOnlyForNew && isEditing) return null;
    if (field.showOnlyForEdit && !isEditing) return null;

    const fieldValue = formData[field.name] ?? '';
    const size = field.size || 'medium';

    let fieldElement: React.ReactNode;

    switch (field.type) {
      case 'select':
        fieldElement = (
          <FormControl fullWidth required={field.required} disabled={field.disabled} size={size}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={fieldValue}
              onChange={(e) => handleChange(field.name, e.target.value)}
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

      case 'textarea':
        fieldElement = (
          <TextField
            label={field.label}
            value={fieldValue}
            onChange={(e) => handleChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
            disabled={field.disabled}
            placeholder={field.placeholder}
            helperText={field.helperText}
            multiline
            rows={field.rows || 4}
            size={size}
          />
        );
        break;

      case 'custom':
        if (field.render) {
          fieldElement = field.render(fieldValue, (value) => handleChange(field.name, value));
        } else {
          fieldElement = null;
        }
        break;

      default:
        fieldElement = (
          <TextField
            label={field.label}
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
            disabled={field.disabled}
            placeholder={field.placeholder}
            helperText={field.helperText}
            multiline={field.multiline}
            rows={field.rows}
            size={size}
          />
        );
    }

    // Wrap with tooltip if provided
    if (field.tooltip) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {fieldElement}
          <Tooltip title={field.tooltip} arrow>
            <IconButton size="small">
              <span style={{ fontSize: '16px' }}>?</span>
            </IconButton>
          </Tooltip>
        </Box>
      );
    }

    return fieldElement;
  };

  const dialogTitle = title || (isEditing ? 'Edit Item' : 'Add New Item');

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        {useGrid ? (
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
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {fields.map((field) => {
              const content = renderField(field);
              return content ? <Box key={field.name}>{content}</Box> : null;
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : saveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
