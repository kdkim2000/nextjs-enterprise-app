'use client';

 
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '@/types/auth';
import { api } from '@/lib/axios';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<any>;
  verifyMFA: (userId: string, code: string) => Promise<void>;
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
      const response = await api.post('/auth/login', { username, password });

      if (response.mfaRequired) {
        // MFA required - return MFA info to component
        return {
          mfaRequired: true,
          userId: response.userId,
          email: response.email,
          devCode: response.devCode
        };
      }

      // No MFA - complete login
      const { token, refreshToken, user } = response;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const verifyMFA = useCallback(async (userId: string, code: string) => {
    try {
      const response = await api.post('/auth/verify-mfa', { userId, code });

      const { token, refreshToken, user } = response;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('MFA verification error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
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

      const response = await api.post('/auth/refresh', {
        refreshToken: currentRefreshToken
      });

      const { token } = response;
      localStorage.setItem('accessToken', token);

      setAuthState((prev) => ({ ...prev, token }));
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  }, [logout]);

  const ssoLogin = useCallback(async () => {
    try {
      const response = await api.post('/auth/sso');

      const { token, refreshToken, user } = response;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
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
