'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  SxProps,
  Theme
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Undo as UndoIcon
} from '@mui/icons-material';

/**
 * Value type for the field
 */
export type InlineEditValueType = 'string' | 'number' | 'boolean' | 'json' | 'password';

/**
 * Toggle configuration for status switches
 */
export interface ToggleConfig {
  /** Current value */
  value: boolean;
  /** Callback when toggled */
  onChange: (value: boolean) => void;
  /** Tooltip when enabled */
  enabledTooltip?: string;
  /** Tooltip when disabled */
  disabledTooltip?: string;
  /** Whether this toggle is disabled */
  disabled?: boolean;
  /** Color when enabled */
  color?: string;
}

/**
 * Props for InlineEditRow
 */
interface InlineEditRowProps {
  /** Unique identifier/key */
  id: string;
  /** Display label (shown in first column) */
  label: string;
  /** Description text */
  description?: string;
  /** Current value */
  value: string;
  /** Value type for appropriate input rendering */
  valueType?: InlineEditValueType;
  /** Whether this is a sensitive field (shows as password) */
  isSensitive?: boolean;
  /** Callback when value is saved */
  onSave: (id: string, value: string) => Promise<any>;
  /** Callback when delete is clicked */
  onDelete?: () => void;
  /** Array of toggle configurations */
  toggles?: ToggleConfig[];
  /** Whether currently saving */
  saving?: boolean;
  /** Label column width */
  labelWidth?: number | string;
  /** Type badge column width */
  typeWidth?: number | string;
  /** Whether to show type badge */
  showType?: boolean;
  /** Border color */
  borderColor?: string;
  /** Custom content to render after value input */
  extraContent?: ReactNode;
  /** Copy tooltip text */
  copyTooltip?: string;
  /** Save tooltip text */
  saveTooltip?: string;
  /** Revert tooltip text */
  revertTooltip?: string;
  /** Delete tooltip text */
  deleteTooltip?: string;
  /** Custom sx props */
  sx?: SxProps<Theme>;
}

/**
 * InlineEditRow - Reusable inline editing row for key-value pairs
 *
 * Features:
 * - Supports string, number, boolean, json, password types
 * - Enter to save, Escape to cancel
 * - Multiple toggle switches support
 * - Visual indication of modified state
 *
 * Use cases:
 * - App settings
 * - Environment variables
 * - Configuration editors
 * - Metadata editors
 */
export default function InlineEditRow({
  id,
  label,
  description,
  value,
  valueType = 'string',
  isSensitive = false,
  onSave,
  onDelete,
  toggles = [],
  saving = false,
  labelWidth = 280,
  typeWidth = 70,
  showType = true,
  borderColor,
  extraContent,
  copyTooltip = 'Copy',
  saveTooltip = 'Save',
  revertTooltip = 'Revert',
  deleteTooltip = 'Delete',
  sx
}: InlineEditRowProps) {
  const theme = useTheme();

  const [editValue, setEditValue] = useState(value || '');
  const [isModified, setIsModified] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);

  // Sync value when prop changes
  useEffect(() => {
    setEditValue(value || '');
    setIsModified(false);
  }, [value]);

  const handleValueChange = useCallback((newValue: string) => {
    setEditValue(newValue);
    setIsModified(newValue !== (value || ''));
  }, [value]);

  const handleSave = useCallback(async () => {
    if (!isModified) return;
    setLocalSaving(true);
    try {
      await onSave(id, editValue);
      setIsModified(false);
    } finally {
      setLocalSaving(false);
    }
  }, [isModified, id, editValue, onSave]);

  const handleRevert = useCallback(() => {
    setEditValue(value || '');
    setIsModified(false);
  }, [value]);

  const handleCopyKey = useCallback(() => {
    navigator.clipboard.writeText(id);
  }, [id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isModified) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleRevert();
    }
  }, [isModified, handleSave, handleRevert]);

  // Get type chip color
  const getTypeChipColor = () => {
    switch (valueType) {
      case 'boolean': return 'secondary';
      case 'number': return 'info';
      case 'json': return 'warning';
      case 'password': return 'error';
      default: return 'default';
    }
  };

  const isLoading = saving || localSaving;
  const effectiveBorderColor = borderColor || theme.palette.grey[400];

  // Render value input based on type
  const renderValueInput = () => {
    if (isSensitive || valueType === 'password') {
      return (
        <TextField
          fullWidth
          size="small"
          type="password"
          value={editValue}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }
          }}
        />
      );
    }

    if (valueType === 'boolean') {
      return (
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={editValue}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={isLoading}
            sx={{ fontSize: '0.85rem' }}
          >
            <MenuItem value="true">true</MenuItem>
            <MenuItem value="false">false</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (valueType === 'number') {
      return (
        <TextField
          fullWidth
          size="small"
          type="number"
          value={editValue}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }
          }}
        />
      );
    }

    if (valueType === 'json') {
      return (
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={1}
          maxRows={4}
          value={editValue}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: 1.4
            }
          }}
        />
      );
    }

    // Default: string
    return (
      <TextField
        fullWidth
        size="small"
        value={editValue}
        onChange={(e) => handleValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        sx={{
          '& .MuiInputBase-input': {
            fontSize: '0.85rem'
          }
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderLeft: `3px solid ${effectiveBorderColor}`,
        backgroundColor: isModified
          ? alpha(theme.palette.warning.main, 0.05)
          : 'transparent',
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: isModified
            ? alpha(theme.palette.warning.main, 0.08)
            : alpha(theme.palette.action.hover, 0.04)
        },
        ...sx
      }}
    >
      {/* Label & Description */}
      <Box sx={{ width: labelWidth, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Tooltip title={copyTooltip}>
            <Typography
              variant="subtitle2"
              onClick={handleCopyKey}
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: theme.palette.text.primary,
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              {label}
            </Typography>
          </Tooltip>
          {isSensitive && (
            <Tooltip title="Sensitive">
              <LockIcon sx={{ fontSize: 14, color: theme.palette.warning.main }} />
            </Tooltip>
          )}
        </Box>
        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              fontSize: '0.7rem'
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Type Badge */}
      {showType && (
        <Box sx={{ width: typeWidth, flexShrink: 0, pt: 0.5 }}>
          <Chip
            label={valueType}
            size="small"
            color={getTypeChipColor() as any}
            variant="outlined"
            sx={{
              fontSize: '0.65rem',
              height: 20,
              '& .MuiChip-label': { px: 0.75 }
            }}
          />
        </Box>
      )}

      {/* Value Input */}
      <Box sx={{ flex: 1, minWidth: 200 }}>
        {renderValueInput()}
      </Box>

      {/* Toggle Switches */}
      {toggles.map((toggle, index) => (
        <Box
          key={index}
          sx={{ width: 50, flexShrink: 0, display: 'flex', justifyContent: 'center' }}
        >
          <Tooltip
            title={toggle.value ? (toggle.enabledTooltip || '') : (toggle.disabledTooltip || '')}
          >
            <Switch
              size="small"
              checked={toggle.value}
              onChange={(e) => toggle.onChange(e.target.checked)}
              disabled={isLoading || toggle.disabled}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: toggle.color || theme.palette.primary.main
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: toggle.color || theme.palette.primary.main
                }
              }}
            />
          </Tooltip>
        </Box>
      ))}

      {/* Extra Content */}
      {extraContent}

      {/* Actions */}
      <Box sx={{ width: 60, flexShrink: 0, display: 'flex', justifyContent: 'center', gap: 0.25 }}>
        {isModified ? (
          <>
            <Tooltip title={saveTooltip}>
              <IconButton
                size="small"
                onClick={handleSave}
                disabled={isLoading}
                sx={{
                  p: 0.5,
                  color: theme.palette.success.main,
                  '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) }
                }}
              >
                {isLoading ? <CircularProgress size={16} /> : <SaveIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title={revertTooltip}>
              <IconButton
                size="small"
                onClick={handleRevert}
                disabled={isLoading}
                sx={{
                  p: 0.5,
                  color: theme.palette.text.secondary,
                  '&:hover': { backgroundColor: alpha(theme.palette.action.active, 0.1) }
                }}
              >
                <UndoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </>
        ) : onDelete ? (
          <Tooltip title={deleteTooltip}>
            <IconButton
              size="small"
              onClick={onDelete}
              disabled={isLoading}
              sx={{
                p: 0.5,
                opacity: 0.5,
                '&:hover': {
                  opacity: 1,
                  color: theme.palette.error.main,
                  backgroundColor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  );
}
