'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  // Check if current page is login page (should not show notices)
  const isLoginPage = pathname?.includes('/login');

  // Fetch popup notifications when user is authenticated
  useEffect(() => {
    // Don't show notices on login page
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // Wait for auth to load
    if (authLoading) {
      return;
    }

    // Only fetch if user is fully authenticated
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        console.log('[NoticePopup] Fetching popup notifications...');
        const response = await apiClient.get<{ notifications: Notice[] }>('/post/popup-notifications');
        console.log('[NoticePopup] Response:', response);

        if (response.success && response.data?.notifications && response.data.notifications.length > 0) {
          // Filter out notifications that user chose to hide today
          const now = new Date();
          const hiddenNotices = JSON.parse(localStorage.getItem('hiddenNotices') || '{}');

          const visibleNotifications = response.data.notifications.filter(notice => {
            const hideUntil = hiddenNotices[notice.id];
            if (hideUntil) {
              const hideDate = new Date(hideUntil);
              // If hide period has expired, show the notice
              if (now >= hideDate) {
                delete hiddenNotices[notice.id];
                localStorage.setItem('hiddenNotices', JSON.stringify(hiddenNotices));
                return true;
              }
              // Still hidden
              return false;
            }
            return true;
          });

          console.log('[NoticePopup] Found', response.data.notifications.length, 'notifications,', visibleNotifications.length, 'visible');

          if (visibleNotifications.length > 0) {
            setNotices(visibleNotifications);
            setOpen(true);
          } else {
            console.log('[NoticePopup] All notifications are hidden by user preference');
          }
        } else {
          console.log('[NoticePopup] No notifications to display');
        }
      } catch (error) {
        console.error('[NoticePopup] Error fetching popup notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, isAuthenticated, authLoading, isLoginPage]);

  const handleClose = () => {
    if (dontShowToday && notices[selectedTab]) {
      // Hide current notice until tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const hiddenNotices = JSON.parse(localStorage.getItem('hiddenNotices') || '{}');
      hiddenNotices[notices[selectedTab].id] = tomorrow.toISOString();
      localStorage.setItem('hiddenNotices', JSON.stringify(hiddenNotices));

      console.log('[NoticePopup] Hiding notice', notices[selectedTab].id, 'until', tomorrow.toISOString());
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
