/**
 * User Settings Service Layer
 */

import { query } from '../utils/database';

// Default settings for new users
export const DEFAULT_SETTINGS = {
  general: {
    language: 'en',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h'
  },
  appearance: {
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
    sidebarCollapsed: false
  },
  notifications: {
    email: true,
    push: true,
    desktop: false,
    sound: true
  },
  dataGrid: {
    defaultPageSize: 50,
    showDensitySelector: true,
    showColumnSelector: true,
    showFilterPanel: true,
    autoRefresh: false,
    autoRefreshInterval: 30
  },
  privacy: {
    showOnlineStatus: true,
    showActivity: true,
    allowAnalytics: true
  },
  advanced: {
    enableDebugMode: false,
    enableBetaFeatures: false,
    enableKeyboardShortcuts: true
  }
};

export interface UserSettings {
  userId: string;
  general?: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
  };
  appearance?: {
    theme?: string;
    fontSize?: string;
    compactMode?: boolean;
    sidebarCollapsed?: boolean;
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    desktop?: boolean;
    sound?: boolean;
  };
  dataGrid?: {
    defaultPageSize?: number;
    showDensitySelector?: boolean;
    showColumnSelector?: boolean;
    showFilterPanel?: boolean;
    autoRefresh?: boolean;
    autoRefreshInterval?: number;
  };
  privacy?: {
    showOnlineStatus?: boolean;
    showActivity?: boolean;
    allowAnalytics?: boolean;
  };
  advanced?: {
    enableDebugMode?: boolean;
    enableBetaFeatures?: boolean;
    enableKeyboardShortcuts?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get user preferences by user ID
 */
export async function getUserPreferences(userId: string): Promise<any | null> {
  const result = await query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
}

/**
 * Create user preferences
 */
export async function createUserPreferences(data: {
  userId: string;
  preferences: any;
}): Promise<any> {
  const { userId, preferences } = data;

  const queryText = `
    INSERT INTO user_preferences (
      user_id,
      preferences,
      created_at,
      updated_at
    )
    VALUES ($1, $2, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET
      preferences = $2,
      updated_at = NOW()
    RETURNING *
  `;

  const result = await query(queryText, [
    userId,
    JSON.stringify(preferences)
  ]);

  return result.rows[0];
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: { preferences: any }
): Promise<any | null> {
  const queryText = `
    UPDATE user_preferences
    SET preferences = $1, updated_at = NOW()
    WHERE user_id = $2
    RETURNING *
  `;

  const result = await query(queryText, [
    JSON.stringify(updates.preferences),
    userId
  ]);

  return result.rows[0] || null;
}

/**
 * Delete user preferences
 */
export async function deleteUserPreferences(userId: string): Promise<boolean> {
  const result = await query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get all user preferences (admin only)
 */
export async function getAllUserPreferences(): Promise<any[]> {
  const result = await query('SELECT * FROM user_preferences ORDER BY updated_at DESC');
  return result.rows;
}

/**
 * Deep merge settings with defaults
 */
export function mergeWithDefaults(
  current: any,
  updates: any
): any {
  return {
    general: updates.general
      ? { ...current.general, ...updates.general }
      : current.general,
    appearance: updates.appearance
      ? { ...current.appearance, ...updates.appearance }
      : current.appearance,
    notifications: updates.notifications
      ? { ...current.notifications, ...updates.notifications }
      : current.notifications,
    dataGrid: updates.dataGrid
      ? { ...current.dataGrid, ...updates.dataGrid }
      : current.dataGrid,
    privacy: updates.privacy
      ? { ...current.privacy, ...updates.privacy }
      : current.privacy,
    advanced: updates.advanced
      ? { ...current.advanced, ...updates.advanced }
      : current.advanced
  };
}

/**
 * Format settings for response
 */
export function formatSettings(userSettings: any): UserSettings {
  return {
    userId: userSettings.user_id,
    ...userSettings.preferences,
    createdAt: userSettings.created_at,
    updatedAt: userSettings.updated_at
  };
}
