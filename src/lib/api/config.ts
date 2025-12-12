/**
 * 환경별 API 설정
 *
 * 로컬 개발: Frontend에서 Backend 서비스 직접 호출
 * 서버 운영: API Gateway (Nginx) 경유
 *
 * MSA 구조 (통합):
 *   - core-service (Port 3011): Auth + Admin + Common
 *   - app-service (Port 3012): Content + Communication
 */

type Environment = 'development' | 'production';

interface ApiEndpoints {
  auth: string;
  admin: string;
  content: string;
  comm: string;
  common: string;
  legacy: string;
}

interface ApiConfig {
  development: ApiEndpoints;
  production: ApiEndpoints;
}

const API_CONFIG: ApiConfig = {
  // 로컬 개발 환경: 직접 호출 (서비스 경로 포함)
  // core-service (3011): auth, admin, common
  // app-service (3012): content, comm
  development: {
    auth: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3011/auth',
    admin: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3011/admin',
    content: process.env.NEXT_PUBLIC_CONTENT_API_URL || 'http://localhost:3012/content',
    comm: process.env.NEXT_PUBLIC_COMM_API_URL || 'http://localhost:3012/comm',
    common: process.env.NEXT_PUBLIC_COMMON_API_URL || 'http://localhost:3011/common',
    legacy: process.env.NEXT_PUBLIC_LEGACY_API_URL || 'http://localhost:3001/api',
  },

  // 서버 운영 환경: Nginx Reverse Proxy 경유 (상대 경로)
  production: {
    auth: '/auth',
    admin: '/admin',
    content: '/content',
    comm: '/comm',
    common: '/common',
    legacy: '/api',
  },
};

/**
 * 현재 환경 가져오기
 */
export const getEnvironment = (): Environment => {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';
  return env === 'production' ? 'production' : 'development';
};

/**
 * 현재 환경의 API 설정 가져오기
 */
export const getApiConfig = (): ApiEndpoints => {
  const env = getEnvironment();
  return API_CONFIG[env];
};

/**
 * 개별 서비스 URL 가져오기
 */
export const getAuthApiUrl = (): string => getApiConfig().auth;
export const getAdminApiUrl = (): string => getApiConfig().admin;
export const getContentApiUrl = (): string => getApiConfig().content;
export const getCommApiUrl = (): string => getApiConfig().comm;
export const getCommonApiUrl = (): string => getApiConfig().common;
export const getLegacyApiUrl = (): string => getApiConfig().legacy;

/**
 * 환경 정보 확인 (디버깅용)
 */
export const getApiConfigInfo = () => ({
  environment: getEnvironment(),
  config: getApiConfig(),
  isDevelopment: getEnvironment() === 'development',
  isProduction: getEnvironment() === 'production',
});

export default API_CONFIG;
