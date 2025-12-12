'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '@/types/auth';
import { authApi } from '@/lib/axios';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<any>;
  verifyMFA: (mfaToken: string, code: string) => Promise<void>;
  resendMFA: (mfaToken: string) => Promise<{ devCode?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  ssoLogin: () => Promise<void>;
  updateUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            setAuthState({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            console.error('Failed to parse user data:', error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await authApi.post('/login', { username, password });

      // Check for MFA required
      if (response.requireMFA || response.data?.requireMFA) {
        return {
          mfaRequired: true,
          mfaToken: response.mfaToken || response.data?.mfaToken,
          message: response.message
        };
      }

      // Extract data from response (handle both old and new API format)
      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  }, []);

  const verifyMFA = useCallback(async (mfaToken: string, code: string) => {
    try {
      const response = await authApi.post('/verify-mfa', { mfaToken, code });

      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('MFA verification error:', error);
      const message = error.response?.data?.message || error.message || 'MFA verification failed';
      throw new Error(message);
    }
  }, []);

  const resendMFA = useCallback(async (mfaToken: string) => {
    try {
      const response = await authApi.post('/resend-mfa', { mfaToken });
      return {
        devCode: response.devCode || response.data?.devCode
      };
    } catch (error: any) {
      console.error('Resend MFA error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to resend MFA code';
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token) {
        await authApi.post('/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.post('/refresh', {
        refreshToken: currentRefreshToken
      });

      const data = response.data || response;
      const newAccessToken = data.accessToken || data.token;
      const newRefreshToken = data.refreshToken;

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      setAuthState((prev) => ({
        ...prev,
        token: newAccessToken,
        refreshToken: newRefreshToken || prev.refreshToken
      }));
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  }, [logout]);

  const ssoLogin = useCallback(async () => {
    try {
      const response = await authApi.post('/sso');

      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('SSO login error:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback((updatedUser: any) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuthState((prev) => ({
      ...prev,
      user: updatedUser
    }));
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    verifyMFA,
    resendMFA,
    logout,
    refreshAccessToken,
    ssoLogin,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
