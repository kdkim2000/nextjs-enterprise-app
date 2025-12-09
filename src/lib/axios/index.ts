import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiConfig, getEnvironment } from '../api/config';

// Get base URL based on environment
const getBaseUrl = (): string => {
  const config = getApiConfig();
  // In development, auth endpoints go to auth service, others to legacy
  // In production, all go through API Gateway (relative paths)
  return config.legacy;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Get the appropriate base URL for auth endpoints
 */
const getAuthBaseUrl = (): string => {
  const config = getApiConfig();
  const env = getEnvironment();

  if (env === 'development') {
    // In development, use auth service directly
    return config.auth;
  }
  // In production, use relative path (via API Gateway)
  return '';
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints (login, refresh, etc.)
    const authEndpoints = ['/auth/login', '/auth/refresh', '/auth/sso', '/auth/register', '/auth/verify-mfa', '/auth/resend-mfa'];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));

    // Get token from localStorage or cookie
    if (typeof window !== 'undefined' && !isAuthEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // For FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const authBaseUrl = getAuthBaseUrl();
          const refreshUrl = authBaseUrl ? `${authBaseUrl}/auth/refresh` : `${API_BASE_URL}/auth/refresh`;

          const response = await axios.post(refreshUrl, {
            refreshToken
          });

          const { data } = response.data;
          const newAccessToken = data?.accessToken || response.data.token;
          const newRefreshToken = data?.refreshToken || response.data.refreshToken;

          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
          }
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed - logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/en/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.warn('Access denied to:', originalRequest.url);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Helper functions for common HTTP methods
export const api = {

  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config).then((res) => res.data),


  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config).then((res) => res.data),


  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, data, config).then((res) => res.data),


  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(url, data, config).then((res) => res.data),


  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config).then((res) => res.data)
};

/**
 * Create API client for specific service
 */
export const createServiceApi = (baseUrl: string) => {
  console.log('[createServiceApi] Creating instance with baseUrl:', baseUrl);

  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Apply same interceptors
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        console.log('[createServiceApi] Request to:', config.url, 'Token exists:', !!token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        console.log('[createServiceApi] Request to:', config.url, 'SSR mode - no window');
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  return {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
      instance.get<T>(url, config).then((res) => res.data),
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      instance.post<T>(url, data, config).then((res) => res.data),
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      instance.put<T>(url, data, config).then((res) => res.data),
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      instance.patch<T>(url, data, config).then((res) => res.data),
    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
      instance.delete<T>(url, config).then((res) => res.data),
  };
};

// Service-specific API clients with lazy initialization
let _adminApiInstance: ReturnType<typeof createServiceApi> | null = null;
let _authApiInstance: ReturnType<typeof createServiceApi> | null = null;
let _contentApiInstance: ReturnType<typeof createServiceApi> | null = null;
let _commonApiInstance: ReturnType<typeof createServiceApi> | null = null;
let _commApiInstance: ReturnType<typeof createServiceApi> | null = null;

const getAdminBaseUrl = (): string => {
  const config = getApiConfig();
  const env = getEnvironment();
  if (env === 'development') {
    return config.admin;
  }
  return '';
};

const getAuthServiceUrl = (): string => {
  const config = getApiConfig();
  const env = getEnvironment();
  if (env === 'development') {
    return config.auth;
  }
  return '';
};

const getContentBaseUrl = (): string => {
  const config = getApiConfig();
  const env = getEnvironment();
  if (env === 'development') {
    return config.content;
  }
  return '';
};

const getCommonBaseUrl = (): string => {
  const config = getApiConfig();
  const env = getEnvironment();
  if (env === 'development') {
    return config.common;
  }
  return '';
};

const getCommBaseUrl = (): string => {
  const config = getApiConfig();
  const env = getEnvironment();
  if (env === 'development') {
    return config.comm;
  }
  return '';
};

// Admin service API client (for menus, users, roles, permissions)
// Lazy initialization to ensure proper URL resolution at runtime
export const adminApi = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_adminApiInstance) {
      _adminApiInstance = createServiceApi(getAdminBaseUrl());
    }
    return _adminApiInstance.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_adminApiInstance) {
      _adminApiInstance = createServiceApi(getAdminBaseUrl());
    }
    return _adminApiInstance.post<T>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_adminApiInstance) {
      _adminApiInstance = createServiceApi(getAdminBaseUrl());
    }
    return _adminApiInstance.put<T>(url, data, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_adminApiInstance) {
      _adminApiInstance = createServiceApi(getAdminBaseUrl());
    }
    return _adminApiInstance.patch<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_adminApiInstance) {
      _adminApiInstance = createServiceApi(getAdminBaseUrl());
    }
    return _adminApiInstance.delete<T>(url, config);
  },
};

// Auth service API client
export const authApi = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_authApiInstance) {
      _authApiInstance = createServiceApi(getAuthServiceUrl());
    }
    return _authApiInstance.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_authApiInstance) {
      _authApiInstance = createServiceApi(getAuthServiceUrl());
    }
    return _authApiInstance.post<T>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_authApiInstance) {
      _authApiInstance = createServiceApi(getAuthServiceUrl());
    }
    return _authApiInstance.put<T>(url, data, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_authApiInstance) {
      _authApiInstance = createServiceApi(getAuthServiceUrl());
    }
    return _authApiInstance.patch<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_authApiInstance) {
      _authApiInstance = createServiceApi(getAuthServiceUrl());
    }
    return _authApiInstance.delete<T>(url, config);
  },
};

// Content service API client (for posts, boards, comments)
export const contentApi = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_contentApiInstance) {
      _contentApiInstance = createServiceApi(getContentBaseUrl());
    }
    return _contentApiInstance.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_contentApiInstance) {
      _contentApiInstance = createServiceApi(getContentBaseUrl());
    }
    return _contentApiInstance.post<T>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_contentApiInstance) {
      _contentApiInstance = createServiceApi(getContentBaseUrl());
    }
    return _contentApiInstance.put<T>(url, data, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_contentApiInstance) {
      _contentApiInstance = createServiceApi(getContentBaseUrl());
    }
    return _contentApiInstance.patch<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_contentApiInstance) {
      _contentApiInstance = createServiceApi(getContentBaseUrl());
    }
    return _contentApiInstance.delete<T>(url, config);
  },
};

// Common service API client (for dashboard, logs, settings)
export const commonApi = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_commonApiInstance) {
      _commonApiInstance = createServiceApi(getCommonBaseUrl());
    }
    return _commonApiInstance.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_commonApiInstance) {
      _commonApiInstance = createServiceApi(getCommonBaseUrl());
    }
    return _commonApiInstance.post<T>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_commonApiInstance) {
      _commonApiInstance = createServiceApi(getCommonBaseUrl());
    }
    return _commonApiInstance.put<T>(url, data, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_commonApiInstance) {
      _commonApiInstance = createServiceApi(getCommonBaseUrl());
    }
    return _commonApiInstance.patch<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_commonApiInstance) {
      _commonApiInstance = createServiceApi(getCommonBaseUrl());
    }
    return _commonApiInstance.delete<T>(url, config);
  },
};

// Communication service API client (for mail, messages, conversations)
export const commApi = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_commApiInstance) {
      _commApiInstance = createServiceApi(getCommBaseUrl());
    }
    return _commApiInstance.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_commApiInstance) {
      _commApiInstance = createServiceApi(getCommBaseUrl());
    }
    return _commApiInstance.post<T>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_commApiInstance) {
      _commApiInstance = createServiceApi(getCommBaseUrl());
    }
    return _commApiInstance.put<T>(url, data, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    if (!_commApiInstance) {
      _commApiInstance = createServiceApi(getCommBaseUrl());
    }
    return _commApiInstance.patch<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    if (!_commApiInstance) {
      _commApiInstance = createServiceApi(getCommBaseUrl());
    }
    return _commApiInstance.delete<T>(url, config);
  },
};
