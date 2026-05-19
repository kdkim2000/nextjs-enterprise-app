'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  notificationService,
  Notification,
  NotificationPreferences,
  NotificationType,
} from '@/lib/notifications/notificationService';

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  requestPushPermission: () => Promise<boolean>;
  // Convenience methods
  notifyInspectionAssigned: (inspection: { id: string; title: string; scheduledDate?: string }) => void;
  notifyInspectionDueSoon: (inspection: { id: string; title: string; dueDate: string }) => void;
  notifyInspectionOverdue: (inspection: { id: string; title: string; dueDate: string }) => void;
  notifyInspectionCompleted: (inspection: { id: string; title: string }) => void;
}

/**
 * Hook for managing notifications
 */
export function useNotifications(locale: string = 'ko'): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );

  // Update state from service
  const refreshState = useCallback(() => {
    setNotifications(notificationService.getAll());
    setUnreadCount(notificationService.getUnreadCount());
    setPreferences(notificationService.getPreferences());
  }, []);

  // Subscribe to new notifications
  useEffect(() => {
    const initTimer = setTimeout(refreshState, 0);

    const unsubscribe = notificationService.subscribe(() => {
      refreshState();
    });

    return () => {
      clearTimeout(initTimer);
      unsubscribe();
    };
  }, [refreshState]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
    refreshState();
  }, [refreshState]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
    refreshState();
  }, [refreshState]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    notificationService.delete(id);
    refreshState();
  }, [refreshState]);

  // Clear all
  const clearAll = useCallback(() => {
    notificationService.clearAll();
    refreshState();
  }, [refreshState]);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    notificationService.updatePreferences(updates);
    refreshState();
  }, [refreshState]);

  // Request push permission
  const requestPushPermission = useCallback(async () => {
    const granted = await notificationService.requestPushPermission();
    if (granted) {
      updatePreferences({ pushEnabled: true });
    }
    return granted;
  }, [updatePreferences]);

  // Convenience methods
  const notifyInspectionAssigned = useCallback(
    (inspection: { id: string; title: string; scheduledDate?: string }) => {
      notificationService.notifyInspectionAssigned(inspection, locale);
    },
    [locale]
  );

  const notifyInspectionDueSoon = useCallback(
    (inspection: { id: string; title: string; dueDate: string }) => {
      notificationService.notifyInspectionDueSoon(inspection, locale);
    },
    [locale]
  );

  const notifyInspectionOverdue = useCallback(
    (inspection: { id: string; title: string; dueDate: string }) => {
      notificationService.notifyInspectionOverdue(inspection, locale);
    },
    [locale]
  );

  const notifyInspectionCompleted = useCallback(
    (inspection: { id: string; title: string }) => {
      notificationService.notifyInspectionCompleted(inspection, locale);
    },
    [locale]
  );

  return {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    requestPushPermission,
    notifyInspectionAssigned,
    notifyInspectionDueSoon,
    notifyInspectionOverdue,
    notifyInspectionCompleted,
  };
}

export default useNotifications;
