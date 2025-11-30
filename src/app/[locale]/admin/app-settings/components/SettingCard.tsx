'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { AppSetting, CategoryType } from '../types';
import { getLocalizedText, CATEGORY_COLORS } from '../constants';

interface SettingCardProps {
  setting: AppSetting;
  locale: string;
  onEdit: (setting: AppSetting) => void;
  onDelete?: (setting: AppSetting) => void;
  onToggleReady: (key: string, isReady: boolean) => void;
  loading?: boolean;
}

export default function SettingCard({
  setting,
  locale,
  onEdit,
  onDelete,
  onToggleReady,
  loading = false
}: SettingCardProps) {
  const theme = useTheme();
  const categoryColor = CATEGORY_COLORS[setting.category as CategoryType] || theme.palette.primary.main;

  // Copy key to clipboard
  const handleCopyKey = () => {
    navigator.clipboard.writeText(setting.key);
  };

  // Format display value
  const getDisplayValue = () => {
    if (setting.isSensitive) {
      return '••••••••';
    }

    if (setting.valueType === 'boolean') {
      return setting.parsedValue ? 'true' : 'false';
    }

    if (setting.valueType === 'json') {
      try {
        const parsed = typeof setting.parsedValue === 'object'
          ? setting.parsedValue
          : JSON.parse(setting.value);

        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }

        if (typeof parsed === 'object' && parsed !== null) {
          // Multi-lang object
          if (parsed[locale]) {
            return parsed[locale];
          }
          return JSON.stringify(parsed, null, 2);
        }

        return String(parsed);
      } catch {
        return setting.value || '-';
      }
    }

    return setting.value || '-';
  };

  // Get value type chip color
  const getTypeChipColor = () => {
    switch (setting.valueType) {
      case 'boolean':
        return 'secondary';
      case 'number':
        return 'info';
      case 'json':
        return 'warning';
      default:
        return 'default';
    }
  };

  const displayValue = getDisplayValue();
  const description = getLocalizedText(setting.description, locale);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        borderLeft: `4px solid ${setting.isReady ? categoryColor : theme.palette.grey[400]}`,
        opacity: setting.isReady ? 1 : 0.85,
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
          '& .actions-container': {
            opacity: 1
          }
        }
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1, pt: 1.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Tooltip title={getLocalizedText({ en: 'Copy key', ko: '키 복사', zh: '复制键', vi: 'Sao chép' }, locale)}>
                <Typography
                  variant="subtitle2"
                  onClick={handleCopyKey}
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {setting.key}
                </Typography>
              </Tooltip>
              {setting.isSensitive && (
                <Tooltip title={getLocalizedText({ en: 'Sensitive data', ko: '민감 데이터', zh: '敏感数据', vi: 'Nhạy cảm' }, locale)}>
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

          {/* Action Buttons */}
          <Box
            className="actions-container"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              ml: 1,
              opacity: 0.6,
              transition: 'opacity 0.2s'
            }}
          >
            <Tooltip title={getLocalizedText({ en: 'Edit', ko: '편집', zh: '编辑', vi: 'Sửa' }, locale)}>
              <IconButton
                size="small"
                onClick={() => onEdit(setting)}
                sx={{
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            {onDelete && (
              <Tooltip title={getLocalizedText({ en: 'Delete', ko: '삭제', zh: '删除', vi: 'Xóa' }, locale)}>
                <IconButton
                  size="small"
                  onClick={() => onDelete(setting)}
                  sx={{
                    p: 0.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main
                    }
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Value */}
        <Box
          sx={{
            backgroundColor: alpha(theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100], 0.5),
            borderRadius: 1,
            p: 1,
            mb: 1.5,
            minHeight: 36,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: setting.valueType === 'json' || setting.valueType === 'number' ? 'monospace' : 'inherit',
              fontSize: '0.78rem',
              wordBreak: 'break-word',
              color: setting.isSensitive ? theme.palette.text.disabled : theme.palette.text.primary,
              whiteSpace: 'pre-wrap',
              maxHeight: 60,
              overflow: 'auto',
              width: '100%'
            }}
          >
            {displayValue}
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={setting.valueType}
              size="small"
              color={getTypeChipColor() as any}
              variant="outlined"
              sx={{ fontSize: '0.6rem', height: 18, '& .MuiChip-label': { px: 0.75 } }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip
              title={
                setting.isReady
                  ? getLocalizedText({ en: 'Applied (click to disable)', ko: '적용됨 (클릭하여 비활성화)', zh: '已应用 (点击禁用)', vi: 'Đã áp dụng (nhấp để tắt)' }, locale)
                  : getLocalizedText({ en: 'Not Applied (click to enable)', ko: '미적용 (클릭하여 활성화)', zh: '未应用 (点击启用)', vi: 'Chưa áp dụng (nhấp để bật)' }, locale)
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {setting.isReady ? (
                  <CheckCircleIcon sx={{ fontSize: 15, color: theme.palette.success.main, mr: 0.25 }} />
                ) : (
                  <CancelIcon sx={{ fontSize: 15, color: theme.palette.grey[400], mr: 0.25 }} />
                )}
                <Switch
                  size="small"
                  checked={setting.isReady}
                  onChange={(e) => onToggleReady(setting.key, e.target.checked)}
                  disabled={loading}
                  sx={{
                    transform: 'scale(0.8)',
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.success.main
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: theme.palette.success.main
                    }
                  }}
                />
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
