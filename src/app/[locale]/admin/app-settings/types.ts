/**
 * App Settings Types
 */

export interface MultiLangText {
  en: string;
  ko: string;
  zh: string;
  vi: string;
}

export type ValueType = 'string' | 'number' | 'boolean' | 'json';

export type CategoryType =
  | 'basic'
  | 'branding'
  | 'localization'
  | 'security'
  | 'authentication'
  | 'notification'
  | 'file_upload'
  | 'operations'
  | 'feature_flags'
  | 'organization';

export interface AppSetting {
  key: string;
  value: string;
  parsedValue: any;
  valueType: ValueType;
  category: CategoryType;
  isReady: boolean;
  isApplied: boolean;
  description: MultiLangText;
  displayOrder: number;
  isSensitive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface CategoryInfo {
  id: CategoryType;
  icon: string;
  label: MultiLangText;
  description: MultiLangText;
}

export interface GroupedSettings {
  [category: string]: AppSetting[];
}

export interface SearchCriteria {
  category: string;
  search: string;
  isReady: string;
  isApplied: string;
}

export interface SettingUpdatePayload {
  key: string;
  value?: string;
  valueType?: ValueType;
  category?: CategoryType;
  isReady?: boolean;
  isApplied?: boolean;
  description?: MultiLangText;
  displayOrder?: number;
  isSensitive?: boolean;
}
