'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Button,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  NotificationsActive as ActiveIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationType, NotificationPriority } from '@/lib/notifications/notificationService';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useRouter } from 'next/navigation';

export interface NotificationPanelProps {
  locale?: string;
  onSettingsClick?: () => void;
}

export default function NotificationPanel({
  locale = 'ko',
  onSettingsClick,
}: NotificationPanelProps) {
  const theme = useTheme();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications(locale);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tab, setTab] = useState(0);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      handleClose();
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'inspection_assigned':
        return <AssignmentIcon color="primary" />;
      case 'inspection_due_soon':
        return <ScheduleIcon color="warning" />;
      case 'inspection_overdue':
        return <WarningIcon color="error" />;
      case 'inspection_completed':
        return <CompletedIcon color="success" />;
      case 'inspection_rejected':
        return <ErrorIcon color="error" />;
      case 'sync_completed':
        return <SyncIcon color="success" />;
      case 'sync_failed':
        return <SyncIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority): string => {
    switch (priority) {
      case 'urgent':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'normal':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return getLocalizedValue({ en: 'Just now', ko: '방금' }, locale);
    if (minutes < 60) return `${minutes}${getLocalizedValue({ en: 'm ago', ko: '분 전' }, locale)}`;
    if (hours < 24) return `${hours}${getLocalizedValue({ en: 'h ago', ko: '시간 전' }, locale)}`;
    return `${days}${getLocalizedValue({ en: 'd ago', ko: '일 전' }, locale)}`;
  };

  const open = Boolean(anchorEl);
  const filteredNotifications = tab === 0
    ? notifications
    : notifications.filter((n) => !n.read);

  return (
    <>
      {/* Bell Icon Button */}
      <Tooltip title={getLocalizedValue({ en: 'Notifications', ko: '알림' }, locale)}>
        <IconButton onClick={handleOpen} color="inherit">
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? <ActiveIcon /> : <NotificationIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Notification Panel Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 380, maxHeight: 500 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">
            {getLocalizedValue({ en: 'Notifications', ko: '알림' }, locale)}
          </Typography>
          <Box>
            {onSettingsClick && (
              <IconButton size="small" onClick={onSettingsClick}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={getLocalizedValue({ en: 'All', ko: '전체' }, locale)}
            sx={{ flex: 1 }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getLocalizedValue({ en: 'Unread', ko: '읽지 않음' }, locale)}
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" color="error" sx={{ height: 18 }} />
                )}
              </Box>
            }
            sx={{ flex: 1 }}
          />
        </Tabs>

        {/* Notification List */}
        <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">
                {getLocalizedValue({ en: 'No notifications', ko: '알림이 없습니다' }, locale)}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderLeft: 3,
                      borderColor: getPriorityColor(notification.priority),
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={notification.read ? 'normal' : 'bold'}
                          noWrap
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                            {formatTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 1,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              {getLocalizedValue({ en: 'Mark all read', ko: '모두 읽음' }, locale)}
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={clearAll}
            >
              {getLocalizedValue({ en: 'Clear all', ko: '모두 삭제' }, locale)}
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
}
