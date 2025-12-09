/**
 * API Client
 *
 * MSA Service-specific API clients with standardized response format
 * Routes to appropriate microservices based on endpoint
 */

import { contentApi, adminApi, authApi, commonApi, commApi } from '@/lib/axios';
import { AxiosRequestConfig } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Helper to extract standardized response from backend response
 */
function extractResponse<T>(responseData: any): ApiResponse<T> {
  if (responseData && typeof responseData === 'object' && 'success' in responseData) {
    const resp = responseData as BackendResponse<T>;
    return {
      success: resp.success,
      data: resp.data,
      error: resp.error,
      message: resp.message
    };
  }
  return {
    success: true,
    data: responseData
  };
}

/**
 * Create API client wrapper with standardized response format
 */
function createApiClientWrapper(api: typeof contentApi) {
  return {
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      try {
        const response = await api.get<any>(url, config);
        return extractResponse<T>(response);
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
        };
      }
    },

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      try {
        const response = await api.post<any>(url, data, config);
        return extractResponse<T>(response);
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
        };
      }
    },

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      try {
        const response = await api.put<any>(url, data, config);
        return extractResponse<T>(response);
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
        };
      }
    },

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      try {
        const response = await api.patch<any>(url, data, config);
        return extractResponse<T>(response);
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
        };
      }
    },

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      try {
        const response = await api.delete<any>(url, config);
        return extractResponse<T>(response);
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
        };
      }
    }
  };
}

/**
 * Content Service API Client (board-types, posts, comments, qna, help)
 * Routes: /content/board-types, /content/posts, /content/comments, /content/qna, /content/help
 */
export const contentApiClient = createApiClientWrapper(contentApi);

/**
 * Admin Service API Client (users, roles, menus, departments, programs)
 * Routes: /admin/users, /admin/roles, /admin/menus, /admin/departments, /admin/programs
 */
export const adminApiClient = createApiClientWrapper(adminApi);

/**
 * Auth Service API Client (auth, user-settings)
 * Routes: /auth, /auth/user-settings
 */
export const authApiClient = createApiClientWrapper(authApi);

/**
 * Common Service API Client (codes, attachments, logs, app-settings, dashboard)
 * Routes: /common/codes, /common/attachments, /common/logs, /common/app-settings, /common/dashboard
 */
export const commonApiClient = createApiClientWrapper(commonApi);

/**
 * Communication Service API Client (mail, messages, conversations)
 * Routes: /comm/mail, /comm/messages, /comm/conversations
 */
export const commApiClient = createApiClientWrapper(commApi);

/**
 * Legacy API Client - Routes to appropriate service based on URL
 * @deprecated Use service-specific clients (contentApiClient, adminApiClient, etc.) instead
 */
export const apiClient = {
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const client = getClientForUrl(url);
    return client.get<T>(transformUrl(url), config);
  },

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const client = getClientForUrl(url);
    return client.post<T>(transformUrl(url), data, config);
  },

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const client = getClientForUrl(url);
    return client.put<T>(transformUrl(url), data, config);
  },

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const client = getClientForUrl(url);
    return client.patch<T>(transformUrl(url), data, config);
  },

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const client = getClientForUrl(url);
    return client.delete<T>(transformUrl(url), config);
  }
};

/**
 * Determine which service client to use based on URL
 */
function getClientForUrl(url: string): ReturnType<typeof createApiClientWrapper> {
  // Content service routes
  if (url.startsWith('/board-type') || url.startsWith('/post') || url.startsWith('/comment') ||
      url.startsWith('/qna') || url.startsWith('/help')) {
    return contentApiClient;
  }

  // Admin service routes
  if (url.startsWith('/user') || url.startsWith('/role') || url.startsWith('/menu') ||
      url.startsWith('/department') || url.startsWith('/program')) {
    return adminApiClient;
  }

  // Auth service routes
  if (url.startsWith('/auth')) {
    return authApiClient;
  }

  // Common service routes
  if (url.startsWith('/code') || url.startsWith('/attachment') || url.startsWith('/log') ||
      url.startsWith('/app-setting') || url.startsWith('/dashboard')) {
    return commonApiClient;
  }

  // Communication service routes
  if (url.startsWith('/mail') || url.startsWith('/message') || url.startsWith('/conversation')) {
    return commApiClient;
  }

  // Default to content service (most common use case)
  return contentApiClient;
}

/**
 * Transform legacy URL to new MSA URL format
 */
function transformUrl(url: string): string {
  // Board type routes
  if (url.startsWith('/board-type')) {
    return `/content${url.replace('/board-type', '/board-types')}`;
  }

  // Post routes
  if (url.startsWith('/post')) {
    return `/content${url.replace('/post', '/posts')}`;
  }

  // Comment routes
  if (url.startsWith('/comment')) {
    return `/content${url.replace('/comment', '/comments')}`;
  }

  // QnA routes
  if (url.startsWith('/qna')) {
    return `/content${url}`;
  }

  // Help routes (already correct)
  if (url.startsWith('/help')) {
    return `/content${url}`;
  }

  // User routes
  if (url.startsWith('/user')) {
    return `/admin${url.replace('/user', '/users')}`;
  }

  // Role routes
  if (url.startsWith('/role')) {
    return `/admin${url.replace('/role', '/roles')}`;
  }

  // Menu routes
  if (url.startsWith('/menu')) {
    return `/admin${url.replace('/menu', '/menus')}`;
  }

  // Department routes
  if (url.startsWith('/department')) {
    return `/admin${url.replace('/department', '/departments')}`;
  }

  // Program routes
  if (url.startsWith('/program')) {
    return `/admin${url.replace('/program', '/programs')}`;
  }

  // Code routes
  if (url.startsWith('/code')) {
    return `/common${url.replace('/code', '/codes')}`;
  }

  // Attachment routes
  if (url.startsWith('/attachment')) {
    return `/common${url.replace('/attachment', '/attachments')}`;
  }

  // Log routes
  if (url.startsWith('/log')) {
    return `/common${url.replace('/log', '/logs')}`;
  }

  // App settings routes
  if (url.startsWith('/app-setting')) {
    return `/common${url.replace('/app-setting', '/app-settings')}`;
  }

  // Dashboard routes
  if (url.startsWith('/dashboard')) {
    return `/common${url}`;
  }

  // Message routes (communication service)
  if (url.startsWith('/message')) {
    return `/comm${url.replace('/message', '/messages')}`;
  }

  // Mail routes
  if (url.startsWith('/mail')) {
    return `/comm${url}`;
  }

  // Conversation routes
  if (url.startsWith('/conversation')) {
    return `/comm${url.replace('/conversation', '/conversations')}`;
  }

  // Return as-is if no transformation needed
  return url;
}

// Export default
export default apiClient;
