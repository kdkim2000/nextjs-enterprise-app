/**
 * User Settings Types
 * These types define the structure of user-specific configuration and preferences
 */

/**
 * General settings
 */
export interface GeneralSettings {
  /** User's preferred language (e.g., 'en', 'ko') */
  language: string;
  /** User's timezone (e.g., 'Asia/Seoul', 'America/New_York') */
  timezone: string;
  /** Date format preference (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY') */
  dateFormat: string;
  /** Time format preference ('12h' or '24h') */
  timeFormat: '12h' | '24h';
}

/**
 * Appearance settings
 */
export interface AppearanceSettings {
  /** UI theme ('light' or 'dark') */
  theme: 'light' | 'dark';
  /** Font size preference */
  fontSize: 'small' | 'medium' | 'large';
  /** Enable compact mode for denser UI */
  compactMode: boolean;
  /** Whether sidebar is collapsed by default */
  sidebarCollapsed: boolean;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  /** Enable email notifications */
  email: boolean;
  /** Enable push notifications */
  push: boolean;
  /** Enable desktop notifications */
  desktop: boolean;
  /** Enable notification sounds */
  sound: boolean;
}

/**
 * DataGrid settings
 */
export interface DataGridSettings {
  /** Default number of rows per page */
  defaultPageSize: number;
  /** Show density selector button */
  showDensitySelector: boolean;
  /** Show column selector button */
  showColumnSelector: boolean;
  /** Show filter panel */
  showFilterPanel: boolean;
  /** Enable auto-refresh */
  autoRefresh: boolean;
  /** Auto-refresh interval in seconds */
  autoRefreshInterval: number;
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  /** Show online status to other users */
  showOnlineStatus: boolean;
  /** Show activity to other users */
  showActivity: boolean;
  /** Allow usage analytics */
  allowAnalytics: boolean;
}

/**
 * Advanced settings
 */
export interface AdvancedSettings {
  /** Enable debug mode */
  enableDebugMode: boolean;
  /** Enable beta features */
  enableBetaFeatures: boolean;
  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts: boolean;
}

/**
 * Complete user settings structure
 */
export interface UserSettings {
  /** User ID this settings belong to */
  userId: string;
  /** General settings */
  general: GeneralSettings;
  /** Appearance settings */
  appearance: AppearanceSettings;
  /** Notification settings */
  notifications: NotificationSettings;
  /** DataGrid settings */
  dataGrid: DataGridSettings;
  /** Privacy settings */
  privacy: PrivacySettings;
  /** Advanced settings */
  advanced: AdvancedSettings;
  /** When settings were created */
  createdAt: string;
  /** When settings were last updated */
  updatedAt: string;
}

/**
 * Partial settings update
 */
export type UserSettingsUpdate = Partial<Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'>>;

/**
 * Settings section names
 */
export type SettingsSection =
  | 'general'
  | 'appearance'
  | 'notifications'
  | 'dataGrid'
  | 'privacy'
  | 'advanced';

/**
 * API response for getting settings
 */
export interface GetUserSettingsResponse {
  settings: UserSettings;
}

/**
 * API response for updating settings
 */
export interface UpdateUserSettingsResponse {
  message: string;
  settings: UserSettings;
}

/**
 * API response for getting all settings (admin only)
 */
export interface GetAllUserSettingsResponse {
  settings: UserSettings[];
}
