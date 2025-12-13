"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useCurrentLocale } from "@/lib/i18n/client";
import { getCommonApiUrl } from "@/lib/api/config";

/**
 * Public App Settings type
 */
export interface AppSettings {
  // Basic info (by language)
  app_name_en?: string;
  app_name_ko?: string;
  app_name_zh?: string;
  app_name_vi?: string;
  app_description_en?: string;
  app_description_ko?: string;
  app_description_zh?: string;
  app_description_vi?: string;
  app_logo?: string;
  app_logo_dark?: string;
  favicon?: string;
  app_version?: string;
  copyright_text?: string;
  // Organization
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  support_email?: string;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  // Branding
  primary_color?: string;
  secondary_color?: string;
  default_theme?: string;
  login_background?: string;
  // Localization
  default_language?: string;
  supported_languages?: string[];
  // Feature flags
  feature_chat_enabled?: boolean;
  feature_board_enabled?: boolean;
  feature_report_enabled?: boolean;
  feature_beta_enabled?: boolean;
  // Operations
  maintenance_mode?: boolean;
  maintenance_message_en?: string;
  maintenance_message_ko?: string;
  maintenance_message_zh?: string;
  maintenance_message_vi?: string;
  maintenance_end_time?: string;
}

/**
 * Default values for app settings (fallback)
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  app_name_en: "Enterprise App",
  app_name_ko: "기업 어플리케이션",
  app_name_zh: "企业应用",
  app_name_vi: "Ứng dụng Doanh nghiệp",
  app_description_en: "Enterprise management application",
  app_description_ko: "기업 관리 어플리케이션",
  app_description_zh: "企业管理应用",
  app_description_vi: "Ứng dụng quản lý doanh nghiệp",
  app_logo: "/images/logo.png",
  app_logo_dark: "/images/logo-dark.png",
  favicon: "/favicon.ico",
  app_version: "1.0.0",
  copyright_text: "© 2024 Enterprise Corp. All rights reserved.",
  company_name: "Enterprise Corp.",
  company_address: "",
  company_phone: "",
  company_email: "",
  support_email: "support@example.com",
  privacy_policy_url: "/privacy",
  terms_of_service_url: "/terms",
  primary_color: "#1976d2",
  secondary_color: "#dc004e",
  default_theme: "light",
  login_background: "/images/login-bg.jpg",
  default_language: "ko",
  supported_languages: ["ko", "en", "zh", "vi"],
  feature_chat_enabled: false,
  feature_board_enabled: true,
  feature_report_enabled: true,
  feature_beta_enabled: false,
  maintenance_mode: false,
  maintenance_message_en: "System under maintenance. Please try again later.",
  maintenance_message_ko: "시스템 점검 중입니다. 잠시 후 다시 시도해주세요.",
  maintenance_message_zh: "系统维护中，请稍后再试。",
  maintenance_message_vi: "Hệ thống đang bảo trì. Vui lòng thử lại sau.",
  maintenance_end_time: "",
};

/**
 * App Settings Context
 */
interface AppSettingsContextType {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  getSetting: <K extends keyof AppSettings>(
    key: K,
    defaultValue?: AppSettings[K]
  ) => AppSettings[K];
  getLocalizedSetting: (baseKey: string, defaultValue?: string) => string;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

/**
 * App Settings Provider
 */
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useCurrentLocale();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // MSA 환경: core-service (3011)에서 common 모듈 제공
      // getCommonApiUrl()은 개발환경에서는 http://localhost:3011, 운영에서는 /common 반환
      const baseUrl = getCommonApiUrl();

      // MSA 경로: /common/app-settings/public
      // 운영환경: baseUrl이 /common이므로 /app-settings/public만 추가
      // 개발환경: baseUrl이 http://localhost:3011이므로 /common/app-settings/public 추가
      const isProxyPath = baseUrl === '/common' || baseUrl.endsWith('/common');
      const apiPath = isProxyPath
        ? '/app-settings/public'
        : '/common/app-settings/public';

      const response = await fetch(`${baseUrl}${apiPath}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",  // nginx에서 API 요청으로 인식하도록 필수
        },
        credentials: "include",
        cache: "no-store",
      });

      // ✅ 실패 원인 정확히 로그 출력
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ AppSettings API Error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        throw new Error(`Settings fetch failed (${response.status})`);
      }

      const data = await response.json();

      // ✅ API 응답 구조 안전 처리
      setSettings({
        ...DEFAULT_APP_SETTINGS,
        ...(data?.settings || data),
      });
    } catch (err) {
      console.error("❌ Failed to fetch app settings:", err);
      setError(err instanceof Error ? err.message : "Unknown error");

      // ✅ 실패 시에도 기본값 유지 (이미 되어 있음)
      setSettings(DEFAULT_APP_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /**
   * Get a specific setting with optional default value
   */
  const getSetting = useCallback(
    <K extends keyof AppSettings>(
      key: K,
      defaultValue?: AppSettings[K]
    ): AppSettings[K] => {
      const value = settings[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      return DEFAULT_APP_SETTINGS[key] as AppSettings[K];
    },
    [settings]
  );

  /**
   * Get a localized setting (e.g., app_name_ko for Korean locale)
   */
  const getLocalizedSetting = useCallback(
    (baseKey: string, defaultValue?: string): string => {
      const localizedKey = `${baseKey}_${locale}` as keyof AppSettings;
      const fallbackKey = `${baseKey}_en` as keyof AppSettings;

      // Try localized version first
      const localizedValue = settings[localizedKey];
      if (localizedValue && typeof localizedValue === "string") {
        return localizedValue;
      }

      // Fallback to English
      const englishValue = settings[fallbackKey];
      if (englishValue && typeof englishValue === "string") {
        return englishValue;
      }

      // Use provided default or empty string
      return defaultValue || "";
    },
    [settings, locale]
  );

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        getSetting,
        getLocalizedSetting,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

/**
 * Hook to use app settings
 */
export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    // Return a fallback object when used outside provider
    return {
      settings: DEFAULT_APP_SETTINGS,
      loading: false,
      error: null,
      getSetting: <K extends keyof AppSettings>(
        key: K,
        defaultValue?: AppSettings[K]
      ) =>
        defaultValue !== undefined
          ? defaultValue
          : (DEFAULT_APP_SETTINGS[key] as AppSettings[K]),
      getLocalizedSetting: (baseKey: string, defaultValue?: string) =>
        defaultValue || "",
      refreshSettings: async () => {},
    };
  }

  return context;
}

/**
 * Simple hook for getting a single setting (with default)
 */
export function useAppSetting<K extends keyof AppSettings>(
  key: K,
  defaultValue?: AppSettings[K]
): AppSettings[K] {
  const { getSetting } = useAppSettings();
  return getSetting(key, defaultValue);
}

/**
 * Hook for getting localized setting
 */
export function useLocalizedAppSetting(
  baseKey: string,
  defaultValue?: string
): string {
  const { getLocalizedSetting } = useAppSettings();
  return getLocalizedSetting(baseKey, defaultValue);
}
