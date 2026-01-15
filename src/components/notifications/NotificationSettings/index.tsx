'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  NotificationsOff as NotificationsOffIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType } from '@/lib/notifications/notificationService';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
  locale?: string;
}

const NOTIFICATION_TYPES: { type: NotificationType; labelEn: string; labelKo: string }[] = [
  { type: 'inspection_assigned', labelEn: 'Inspection Assigned', labelKo: '검사 배정' },
  { type: 'inspection_due_soon', labelEn: 'Due Date Reminder', labelKo: '마감일 알림' },
  { type: 'inspection_overdue', labelEn: 'Overdue Alert', labelKo: '지연 알림' },
  { type: 'inspection_completed', labelEn: 'Completion Notice', labelKo: '완료 알림' },
  { type: 'inspection_rejected', labelEn: 'Rejection Notice', labelKo: '반려 알림' },
  { type: 'sync_completed', labelEn: 'Sync Completed', labelKo: '동기화 완료' },
  { type: 'sync_failed', labelEn: 'Sync Failed', labelKo: '동기화 실패' },
  { type: 'system', labelEn: 'System Notices', labelKo: '시스템 알림' },
];

export default function NotificationSettings({
  open,
  onClose,
  locale = 'ko',
}: NotificationSettingsProps) {
  const { preferences, updatePreferences, requestPushPermission } = useNotifications(locale);

  const handleToggleEnabled = () => {
    updatePreferences({ enabled: !preferences.enabled });
  };

  const handleTogglePush = async () => {
    if (!preferences.pushEnabled) {
      const granted = await requestPushPermission();
      if (!granted) {
        return;
      }
    }
    updatePreferences({ pushEnabled: !preferences.pushEnabled });
  };

  const handleToggleType = (type: NotificationType) => {
    updatePreferences({
      types: {
        ...preferences.types,
        [type]: !preferences.types[type],
      },
    });
  };

  const handleToggleQuietHours = () => {
    updatePreferences({
      quietHours: {
        ...preferences.quietHours,
        enabled: !preferences.quietHours?.enabled,
        start: preferences.quietHours?.start || '22:00',
        end: preferences.quietHours?.end || '07:00',
      },
    });
  };

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    updatePreferences({
      quietHours: {
        ...preferences.quietHours,
        enabled: preferences.quietHours?.enabled || false,
        start: field === 'start' ? value : (preferences.quietHours?.start || '22:00'),
        end: field === 'end' ? value : (preferences.quietHours?.end || '07:00'),
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationIcon />
            <Typography variant="h6">
              {getLocalizedValue({ en: 'Notification Settings', ko: '알림 설정' }, locale)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Master Toggle */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.enabled}
                onChange={handleToggleEnabled}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {getLocalizedValue({ en: 'Enable Notifications', ko: '알림 사용' }, locale)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue(
                    { en: 'Receive in-app notifications', ko: '앱 내 알림을 받습니다' },
                    locale
                  )}
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Push Notifications */}
        <Box sx={{ mb: 3, opacity: preferences.enabled ? 1 : 0.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.pushEnabled}
                onChange={handleTogglePush}
                disabled={!preferences.enabled}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {getLocalizedValue({ en: 'Push Notifications', ko: '푸시 알림' }, locale)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue(
                    { en: 'Show browser notifications', ko: '브라우저 푸시 알림을 표시합니다' },
                    locale
                  )}
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Notification Types */}
        <Box sx={{ mb: 3, opacity: preferences.enabled ? 1 : 0.5 }}>
          <Typography variant="subtitle2" gutterBottom>
            {getLocalizedValue({ en: 'Notification Types', ko: '알림 유형' }, locale)}
          </Typography>
          <List dense disablePadding>
            {NOTIFICATION_TYPES.map(({ type, labelEn, labelKo }) => (
              <ListItem key={type} disableGutters>
                <ListItemText
                  primary={getLocalizedValue({ en: labelEn, ko: labelKo }, locale)}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={preferences.types[type]}
                    onChange={() => handleToggleType(type)}
                    disabled={!preferences.enabled}
                    size="small"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Quiet Hours */}
        <Box sx={{ opacity: preferences.enabled ? 1 : 0.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.quietHours?.enabled || false}
                onChange={handleToggleQuietHours}
                disabled={!preferences.enabled}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {getLocalizedValue({ en: 'Quiet Hours', ko: '방해금지 시간' }, locale)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue(
                    { en: "Don't show notifications during this time", ko: '이 시간에는 알림을 표시하지 않습니다' },
                    locale
                  )}
                </Typography>
              </Box>
            }
          />

          {preferences.quietHours?.enabled && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2, pl: 4 }}>
              <TextField
                label={getLocalizedValue({ en: 'Start', ko: '시작' }, locale)}
                type="time"
                value={preferences.quietHours.start}
                onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                disabled={!preferences.enabled}
              />
              <TextField
                label={getLocalizedValue({ en: 'End', ko: '종료' }, locale)}
                type="time"
                value={preferences.quietHours.end}
                onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                disabled={!preferences.enabled}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {getLocalizedValue({ en: 'Close', ko: '닫기' }, locale)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
