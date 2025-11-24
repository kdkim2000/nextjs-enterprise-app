/**
 * API Client
 *
 * Unified API client for making HTTP requests
 * Wraps axios instance with standardized response format
 */

import axiosInstance from '@/lib/axios';
import { AxiosRequestConfig } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API Client with standardized response format
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<any>(url, config);

      // If backend returns { success, data } format, unwrap it
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return {
          success: response.data.success,
          data: response.data.data,
          error: response.data.error,
          message: response.data.message
        };
      }

      // Otherwise, wrap it
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
      };
    }
  },

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<T>(url, data, config);

      // If backend returns { success, data } format, unwrap it
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return {
          success: response.data.success,
          data: response.data.data,
          error: response.data.error,
          message: response.data.message
        };
      }

      // Otherwise, wrap it
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
      };
    }
  },

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<T>(url, data, config);

      // If backend returns { success, data } format, unwrap it
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return {
          success: response.data.success,
          data: response.data.data,
          error: response.data.error,
          message: response.data.message
        };
      }

      // Otherwise, wrap it
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
      };
    }
  },

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.patch<T>(url, data, config);

      // If backend returns { success, data } format, unwrap it
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return {
          success: response.data.success,
          data: response.data.data,
          error: response.data.error,
          message: response.data.message
        };
      }

      // Otherwise, wrap it
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
      };
    }
  },

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<T>(url, config);

      // If backend returns { success, data } format, unwrap it
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return {
          success: response.data.success,
          data: response.data.data,
          error: response.data.error,
          message: response.data.message
        };
      }

      // Otherwise, wrap it
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed'
      };
    }
  }
};

// Export axios instance for direct use if needed
export { axiosInstance };

// Export default
export default apiClient;
