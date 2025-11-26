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
 * API Client with standardized response format
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<any>(url, config);
      return extractResponse<T>(response.data);
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
      const response = await axiosInstance.post<any>(url, data, config);
      return extractResponse<T>(response.data);
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
      const response = await axiosInstance.put<any>(url, data, config);
      return extractResponse<T>(response.data);
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
      const response = await axiosInstance.patch<any>(url, data, config);
      return extractResponse<T>(response.data);
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
      const response = await axiosInstance.delete<any>(url, config);
      return extractResponse<T>(response.data);
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
