'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { Close as CloseIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import SafeHtmlRenderer from '@/components/common/SafeHtmlRenderer';
import { apiClient } from '@/lib/api/client';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  displayStartDate?: string | null;
  displayEndDate?: string | null;
}

interface NoticePopupProps {
  onClose?: () => void;
}

export default function NoticePopup({ onClose }: NoticePopupProps) {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  // Fetch popup notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Check if user has chosen "Don't show today"
        const hideUntil = localStorage.getItem('noticePopupHideUntil');
        if (hideUntil) {
          const hideDate = new Date(hideUntil);
          const now = new Date();
          if (now < hideDate) {
            setLoading(false);
            return;
          }
        }

        const response = await apiClient.get('/post/popup-notifications');

        if (response.success && response.notifications && response.notifications.length > 0) {
          setNotices(response.notifications);
          setOpen(true);
        }
      } catch (error) {
        console.error('Error fetching popup notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      // Hide until tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      localStorage.setItem('noticePopupHideUntil', tomorrow.toISOString());
    }

    setOpen(false);
    onClose?.();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (loading || notices.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '400px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon color="primary" />
          <Typography variant="h6" component="div">
            공지사항
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {notices.length > 1 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 3 }}
          >
            {notices.map((notice, index) => (
              <Tab
                key={notice.id}
                label={`공지 ${index + 1}`}
                sx={{ minWidth: 100 }}
              />
            ))}
          </Tabs>
        </Box>
      )}

      <DialogContent dividers sx={{ minHeight: '300px' }}>
        {notices[selectedTab] && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {notices[selectedTab].title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {new Date(notices[selectedTab].createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <SafeHtmlRenderer html={notices[selectedTab].content} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              오늘 하루 보지 않기
            </Typography>
          }
        />
        <Button onClick={handleClose} variant="contained" color="primary">
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
