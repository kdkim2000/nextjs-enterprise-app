'use client';

import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import { Notifications, Circle } from '@mui/icons-material';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  avatar?: string;
  onClick?: () => void;
}

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  maxHeight?: number;
}

export default function NotificationCenter({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onClearAll,
  maxHeight = 400
}: NotificationCenterProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.onClick) {
      notification.onClick();
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      case 'success':
        return 'success.main';
      default:
        return 'info.main';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: maxHeight
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && onMarkAllRead && (
            <Button size="small" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: !notification.read ? 'action.hover' : 'transparent',
                alignItems: 'flex-start',
                py: 1.5
              }}
            >
              <ListItemAvatar>
                {notification.avatar ? (
                  <Avatar src={notification.avatar} />
                ) : (
                  <Avatar sx={{ bgcolor: getTypeColor(notification.type) }}>
                    <Circle sx={{ fontSize: 12 }} />
                  </Avatar>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={!notification.read ? 600 : 400}>
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.timestamp}
                    </Typography>
                  </>
                }
              />
            </MenuItem>
          ))
        )}
        {notifications.length > 0 && onClearAll && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" color="error" onClick={onClearAll}>
                Clear all
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
