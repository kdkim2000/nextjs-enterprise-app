/**
 * Notification Service for Inspection Module
 * Handles in-app notifications, push notifications, and notification preferences
 */

export type NotificationType =
  | 'inspection_assigned'
  | 'inspection_due_soon'
  | 'inspection_overdue'
  | 'inspection_completed'
  | 'inspection_rejected'
  | 'sync_completed'
  | 'sync_failed'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: number;
  data?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  types: Record<NotificationType, boolean>;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

type NotificationCallback = (notification: Notification) => void;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  pushEnabled: false,
  emailEnabled: false,
  types: {
    inspection_assigned: true,
    inspection_due_soon: true,
    inspection_overdue: true,
    inspection_completed: true,
    inspection_rejected: true,
    sync_completed: false,
    sync_failed: true,
    system: true,
  },
};

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<NotificationCallback> = new Set();
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private storageKey = 'inspection_notifications';
  private preferencesKey = 'inspection_notification_preferences';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load notifications from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.notifications = JSON.parse(stored);
      }

      const storedPrefs = localStorage.getItem(this.preferencesKey);
      if (storedPrefs) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(storedPrefs) };
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }

  /**
   * Save notifications to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Keep only last 100 notifications
      const toStore = this.notifications.slice(0, 100);
      localStorage.setItem(this.storageKey, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.preferencesKey, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(notification: Notification): void {
    this.listeners.forEach((callback) => callback(notification));
  }

  /**
   * Check if notification should be shown based on preferences
   */
  private shouldShowNotification(type: NotificationType): boolean {
    if (!this.preferences.enabled) return false;
    if (!this.preferences.types[type]) return false;

    // Check quiet hours
    if (this.preferences.quietHours?.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = this.preferences.quietHours;

      if (start <= end) {
        if (currentTime >= start && currentTime <= end) return false;
      } else {
        // Overnight quiet hours (e.g., 22:00 - 06:00)
        if (currentTime >= start || currentTime <= end) return false;
      }
    }

    return true;
  }

  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Subscribe to new notifications
   */
  subscribe(callback: NotificationCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Add a new notification
   */
  add(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification | null {
    if (!this.shouldShowNotification(notification.type)) {
      return null;
    }

    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      read: false,
      createdAt: Date.now(),
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();
    this.notifyListeners(newNotification);

    // Show browser notification if push is enabled
    if (this.preferences.pushEnabled) {
      this.showPushNotification(newNotification);
    }

    return newNotification;
  }

  /**
   * Show browser push notification
   */
  private async showPushNotification(notification: Notification): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/inspection-icon.png',
        tag: notification.id,
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/inspection-icon.png',
          tag: notification.id,
        });
      }
    }
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get unread notifications
   */
  getUnread(): Notification[] {
    return this.notifications.filter((n) => !n.read);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.saveToStorage();
  }

  /**
   * Delete notification
   */
  delete(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveToStorage();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.saveToStorage();
  }

  /**
   * Get preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences
   */
  updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  /**
   * Request push notification permission
   */
  async requestPushPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // ==================== Convenience methods for common notifications ====================

  /**
   * Notify about assigned inspection
   */
  notifyInspectionAssigned(inspection: {
    id: string;
    title: string;
    scheduledDate?: string;
  }, locale: string = 'ko'): void {
    this.add({
      type: 'inspection_assigned',
      title: locale === 'ko' ? '새 검사 배정' : 'New Inspection Assigned',
      message: locale === 'ko'
        ? `"${inspection.title}" 검사가 배정되었습니다.`
        : `Inspection "${inspection.title}" has been assigned to you.`,
      priority: 'normal',
      data: { inspectionId: inspection.id },
      actionUrl: `/${locale}/inspection/executions/${inspection.id}`,
      actionLabel: locale === 'ko' ? '검사 보기' : 'View Inspection',
    });
  }

  /**
   * Notify about upcoming due date
   */
  notifyInspectionDueSoon(inspection: {
    id: string;
    title: string;
    dueDate: string;
  }, locale: string = 'ko'): void {
    this.add({
      type: 'inspection_due_soon',
      title: locale === 'ko' ? '검사 마감 임박' : 'Inspection Due Soon',
      message: locale === 'ko'
        ? `"${inspection.title}" 검사 마감일이 다가옵니다. (${inspection.dueDate})`
        : `Inspection "${inspection.title}" is due on ${inspection.dueDate}.`,
      priority: 'high',
      data: { inspectionId: inspection.id },
      actionUrl: `/${locale}/inspection/executions/${inspection.id}/execute`,
      actionLabel: locale === 'ko' ? '검사 시작' : 'Start Inspection',
    });
  }

  /**
   * Notify about overdue inspection
   */
  notifyInspectionOverdue(inspection: {
    id: string;
    title: string;
    dueDate: string;
  }, locale: string = 'ko'): void {
    this.add({
      type: 'inspection_overdue',
      title: locale === 'ko' ? '검사 지연' : 'Inspection Overdue',
      message: locale === 'ko'
        ? `"${inspection.title}" 검사가 지연되었습니다. (마감: ${inspection.dueDate})`
        : `Inspection "${inspection.title}" is overdue. (Due: ${inspection.dueDate})`,
      priority: 'urgent',
      data: { inspectionId: inspection.id },
      actionUrl: `/${locale}/inspection/executions/${inspection.id}/execute`,
      actionLabel: locale === 'ko' ? '지금 시작' : 'Start Now',
    });
  }

  /**
   * Notify about completed inspection
   */
  notifyInspectionCompleted(inspection: {
    id: string;
    title: string;
  }, locale: string = 'ko'): void {
    this.add({
      type: 'inspection_completed',
      title: locale === 'ko' ? '검사 완료' : 'Inspection Completed',
      message: locale === 'ko'
        ? `"${inspection.title}" 검사가 완료되었습니다.`
        : `Inspection "${inspection.title}" has been completed.`,
      priority: 'low',
      data: { inspectionId: inspection.id },
      actionUrl: `/${locale}/inspection/executions/${inspection.id}`,
      actionLabel: locale === 'ko' ? '결과 보기' : 'View Results',
    });
  }

  /**
   * Notify about sync status
   */
  notifySyncCompleted(count: number, locale: string = 'ko'): void {
    this.add({
      type: 'sync_completed',
      title: locale === 'ko' ? '동기화 완료' : 'Sync Completed',
      message: locale === 'ko'
        ? `${count}개 항목이 성공적으로 동기화되었습니다.`
        : `${count} items have been synced successfully.`,
      priority: 'low',
    });
  }

  /**
   * Notify about sync failure
   */
  notifySyncFailed(count: number, locale: string = 'ko'): void {
    this.add({
      type: 'sync_failed',
      title: locale === 'ko' ? '동기화 실패' : 'Sync Failed',
      message: locale === 'ko'
        ? `${count}개 항목 동기화에 실패했습니다. 재시도해 주세요.`
        : `${count} items failed to sync. Please retry.`,
      priority: 'high',
    });
  }
}

// Singleton instance
export const notificationService = new NotificationService();
export default notificationService;
