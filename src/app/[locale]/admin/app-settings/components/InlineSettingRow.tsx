'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Undo as UndoIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { AppSetting, CategoryType } from '../types';
import { getLocalizedText, CATEGORY_COLORS } from '../constants';

interface InlineSettingRowProps {
  setting: AppSetting;
  locale: string;
  onSave: (key: string, value: string) => Promise<any>;
  onDelete?: (setting: AppSetting) => void;
  onToggleReady: (key: string, isReady: boolean) => void;
  onToggleApplied: (key: string, isApplied: boolean) => void;
  saving?: boolean;
}

export default function InlineSettingRow({
  setting,
  locale,
  onSave,
  onDelete,
  onToggleReady,
  onToggleApplied,
  saving = false
}: InlineSettingRowProps) {
  const theme = useTheme();
  const categoryColor = CATEGORY_COLORS[setting.category as CategoryType] || theme.palette.primary.main;

  const [editValue, setEditValue] = useState(setting.value || '');
  const [isModified, setIsModified] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);

  // Sync value when setting changes from server
  useEffect(() => {
    setEditValue(setting.value || '');
    setIsModified(false);
  }, [setting.value]);

  const handleValueChange = useCallback((newValue: string) => {
    setEditValue(newValue);
    setIsModified(newValue !== (setting.value || ''));
  }, [setting.value]);

  const handleSave = useCallback(async () => {
    if (!isModified) return;
    setLocalSaving(true);
    try {
      await onSave(setting.key, editValue);
      setIsModified(false);
    } finally {
      setLocalSaving(false);
    }
  }, [isModified, setting.key, editValue, onSave]);

  const handleRevert = useCallback(() => {
    setEditValue(setting.value || '');
    setIsModified(false);
  }, [setting.value]);

  const handleCopyKey = useCallback(() => {
    navigator.clipboard.writeText(setting.key);
  }, [setting.key]);

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
    switch (setting.valueType) {
      case 'boolean': return 'secondary';
      case 'number': return 'info';
      case 'json': return 'warning';
      default: return 'default';
    }
  };

  const description = getLocalizedText(setting.description, locale);
  const isLoading = saving || localSaving;

  // Render value input based on type
  const renderValueInput = () => {
    if (setting.isSensitive) {
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

    if (setting.valueType === 'boolean') {
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

    if (setting.valueType === 'number') {
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

    if (setting.valueType === 'json') {
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

  // Border color: Applied (green) > Ready (blue) > Not Ready (grey)
  const getBorderColor = () => {
    if (setting.isApplied) return theme.palette.success.main;
    if (setting.isReady) return theme.palette.info.main;
    return theme.palette.grey[400];
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderLeft: `3px solid ${getBorderColor()}`,
        backgroundColor: isModified
          ? alpha(theme.palette.warning.main, 0.05)
          : 'transparent',
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: isModified
            ? alpha(theme.palette.warning.main, 0.08)
            : alpha(theme.palette.action.hover, 0.04)
        }
      }}
    >
      {/* Key & Description */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Tooltip title={getLocalizedText({ en: 'Copy key', ko: '키 복사', zh: '复制键', vi: 'Sao chép' }, locale)}>
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
              {setting.key}
            </Typography>
          </Tooltip>
          {setting.isSensitive && (
            <Tooltip title={getLocalizedText({ en: 'Sensitive', ko: '민감', zh: '敏感', vi: 'Nhạy cảm' }, locale)}>
              <LockIcon sx={{ fontSize: 14, color: theme.palette.warning.main }} />
            </Tooltip>
          )}
        </Box>
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
      </Box>

      {/* Type Badge */}
      <Box sx={{ width: 70, flexShrink: 0, pt: 0.5 }}>
        <Chip
          label={setting.valueType}
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

      {/* Value Input */}
      <Box sx={{ flex: 1, minWidth: 200 }}>
        {renderValueInput()}
      </Box>

      {/* Ready Toggle */}
      <Box sx={{ width: 50, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <Tooltip
          title={
            setting.isReady
              ? getLocalizedText({ en: 'Ready', ko: '준비됨', zh: '已就绪', vi: 'Sẵn sàng' }, locale)
              : getLocalizedText({ en: 'Not Ready', ko: '미준비', zh: '未就绪', vi: 'Chưa sẵn sàng' }, locale)
          }
        >
          <Switch
            size="small"
            checked={setting.isReady}
            onChange={(e) => onToggleReady(setting.key, e.target.checked)}
            disabled={isLoading}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: theme.palette.info.main
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: theme.palette.info.main
              }
            }}
          />
        </Tooltip>
      </Box>

      {/* Applied Toggle */}
      <Box sx={{ width: 50, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <Tooltip
          title={
            !setting.isReady
              ? getLocalizedText({ en: 'Must be ready first', ko: '먼저 준비 상태로 변경 필요', zh: '需要先设为就绪', vi: 'Cần sẵn sàng trước' }, locale)
              : setting.isApplied
                ? getLocalizedText({ en: 'Applied', ko: '적용됨', zh: '已应用', vi: 'Đã áp dụng' }, locale)
                : getLocalizedText({ en: 'Not Applied', ko: '미적용', zh: '未应用', vi: 'Chưa áp dụng' }, locale)
          }
        >
          <Switch
            size="small"
            checked={setting.isApplied}
            onChange={(e) => onToggleApplied(setting.key, e.target.checked)}
            disabled={isLoading || !setting.isReady}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: theme.palette.success.main
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: theme.palette.success.main
              }
            }}
          />
        </Tooltip>
      </Box>

      {/* Actions */}
      <Box sx={{ width: 60, flexShrink: 0, display: 'flex', justifyContent: 'center', gap: 0.25 }}>
        {/* Save/Revert when modified */}
        {isModified ? (
          <>
            <Tooltip title={getLocalizedText({ en: 'Save', ko: '저장', zh: '保存', vi: 'Lưu' }, locale)}>
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
            <Tooltip title={getLocalizedText({ en: 'Revert', ko: '취소', zh: '撤销', vi: 'Hủy' }, locale)}>
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
          <Tooltip title={getLocalizedText({ en: 'Delete', ko: '삭제', zh: '删除', vi: 'Xóa' }, locale)}>
            <IconButton
              size="small"
              onClick={() => onDelete(setting)}
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
