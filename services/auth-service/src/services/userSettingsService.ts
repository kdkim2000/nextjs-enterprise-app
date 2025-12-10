/**
 * User Settings Service Layer
 * Adapted to work with existing user_preferences table schema (flat columns)
 */

import { query } from '../utils/database';

export const DEFAULT_SETTINGS = {
  general: { language: 'en', timezone: 'Asia/Seoul', dateFormat: 'YYYY-MM-DD', timeFormat: '24h' },
  appearance: { theme: 'light', fontSize: 'medium', compactMode: false, sidebarCollapsed: false },
  notifications: { email: true, push: true, desktop: false, sound: true },
  dataGrid: { defaultPageSize: 50, showDensitySelector: true, showColumnSelector: true, showFilterPanel: true, autoRefresh: false, autoRefreshInterval: 30 },
  privacy: { showOnlineStatus: true, showActivity: true, allowAnalytics: true },
  advanced: { enableDebugMode: false, enableBetaFeatures: false, enableKeyboardShortcuts: true }
};

export interface UserSettings { userId: string; general?: any; appearance?: any; notifications?: any; dataGrid?: any; privacy?: any; advanced?: any; createdAt?: Date; updatedAt?: Date; }

function dbRowToPrefs(row: any): any {
  if (!row) return null;
  return {
    user_id: row.user_id,
    preferences: {
      general: { language: row.language || DEFAULT_SETTINGS.general.language, timezone: DEFAULT_SETTINGS.general.timezone, dateFormat: DEFAULT_SETTINGS.general.dateFormat, timeFormat: DEFAULT_SETTINGS.general.timeFormat },
      appearance: { theme: row.theme || DEFAULT_SETTINGS.appearance.theme, fontSize: DEFAULT_SETTINGS.appearance.fontSize, compactMode: DEFAULT_SETTINGS.appearance.compactMode, sidebarCollapsed: DEFAULT_SETTINGS.appearance.sidebarCollapsed },
      notifications: { email: row.email_notifications ?? DEFAULT_SETTINGS.notifications.email, push: DEFAULT_SETTINGS.notifications.push, desktop: DEFAULT_SETTINGS.notifications.desktop, sound: row.system_notifications ?? DEFAULT_SETTINGS.notifications.sound },
      dataGrid: { defaultPageSize: row.rows_per_page || DEFAULT_SETTINGS.dataGrid.defaultPageSize, showDensitySelector: DEFAULT_SETTINGS.dataGrid.showDensitySelector, showColumnSelector: DEFAULT_SETTINGS.dataGrid.showColumnSelector, showFilterPanel: DEFAULT_SETTINGS.dataGrid.showFilterPanel, autoRefresh: DEFAULT_SETTINGS.dataGrid.autoRefresh, autoRefreshInterval: DEFAULT_SETTINGS.dataGrid.autoRefreshInterval },
      privacy: DEFAULT_SETTINGS.privacy,
      advanced: DEFAULT_SETTINGS.advanced
    },
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export async function getUserPreferences(userId: string): Promise<any | null> {
  const result = await query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
  return dbRowToPrefs(result.rows[0]);
}

export async function createUserPreferences(data: { userId: string; preferences: any }): Promise<any> {
  const { userId, preferences } = data;
  const queryText = `INSERT INTO user_preferences (user_id, language, theme, rows_per_page, email_notifications, system_notifications, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) ON CONFLICT (user_id) DO UPDATE SET language = COALESCE($2, user_preferences.language), theme = COALESCE($3, user_preferences.theme), rows_per_page = COALESCE($4, user_preferences.rows_per_page), email_notifications = COALESCE($5, user_preferences.email_notifications), system_notifications = COALESCE($6, user_preferences.system_notifications), updated_at = NOW() RETURNING *`;
  const result = await query(queryText, [userId, preferences.general?.language || null, preferences.appearance?.theme || null, preferences.dataGrid?.defaultPageSize || null, preferences.notifications?.email ?? null, preferences.notifications?.sound ?? null]);
  return dbRowToPrefs(result.rows[0]);
}

export async function updateUserPreferences(userId: string, updates: { preferences: any }): Promise<any | null> {
  const prefs = updates.preferences;
  const setClauses: string[] = [];
  const values: any[] = [];
  let i = 1;
  if (prefs.general?.language !== undefined) { setClauses.push('language = $' + i++); values.push(prefs.general.language); }
  if (prefs.appearance?.theme !== undefined) { setClauses.push('theme = $' + i++); values.push(prefs.appearance.theme); }
  if (prefs.dataGrid?.defaultPageSize !== undefined) { setClauses.push('rows_per_page = $' + i++); values.push(prefs.dataGrid.defaultPageSize); }
  if (prefs.notifications?.email !== undefined) { setClauses.push('email_notifications = $' + i++); values.push(prefs.notifications.email); }
  if (prefs.notifications?.sound !== undefined) { setClauses.push('system_notifications = $' + i++); values.push(prefs.notifications.sound); }
  if (setClauses.length === 0) { return getUserPreferences(userId); }
  setClauses.push('updated_at = NOW()');
  values.push(userId);
  const queryText = 'UPDATE user_preferences SET ' + setClauses.join(', ') + ' WHERE user_id = $' + i + ' RETURNING *';
  const result = await query(queryText, values);
  if (result.rows.length === 0) { return null; }
  return dbRowToPrefs(result.rows[0]);
}

export async function deleteUserPreferences(userId: string): Promise<boolean> {
  const result = await query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function getAllUserPreferences(): Promise<any[]> {
  const result = await query('SELECT * FROM user_preferences ORDER BY updated_at DESC');
  return result.rows.map((row: any) => dbRowToPrefs(row));
}

export function mergeWithDefaults(current: any, updates: any): any {
  return {
    general: updates.general ? { ...current.general, ...updates.general } : current.general,
    appearance: updates.appearance ? { ...current.appearance, ...updates.appearance } : current.appearance,
    notifications: updates.notifications ? { ...current.notifications, ...updates.notifications } : current.notifications,
    dataGrid: updates.dataGrid ? { ...current.dataGrid, ...updates.dataGrid } : current.dataGrid,
    privacy: updates.privacy ? { ...current.privacy, ...updates.privacy } : current.privacy,
    advanced: updates.advanced ? { ...current.advanced, ...updates.advanced } : current.advanced
  };
}

export function formatSettings(userSettings: any): UserSettings {
  if (!userSettings) { return { userId: '', ...DEFAULT_SETTINGS }; }
  return { userId: userSettings.user_id, ...userSettings.preferences, createdAt: userSettings.created_at, updatedAt: userSettings.updated_at };
}
