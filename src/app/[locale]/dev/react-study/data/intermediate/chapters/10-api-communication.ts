/**
 * Chapter 10: API 통신과 에러 처리
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'api-communication',
  order: 10,
  title: 'API Communication and Error Handling',
  titleKo: 'API 통신과 에러 처리',
  description: 'Learn API communication patterns with Axios, interceptors, and error handling.',
  descriptionKo: 'Axios 인스턴스, 인터셉터, 에러 핸들링 등 API 통신 패턴을 학습합니다.',
  estimatedMinutes: 50,
  objectives: [
    'Configure Axios instances properly',
    'Implement request/response interceptors',
    'Handle token management and refresh',
    'Implement global error handling patterns'
  ],
  objectivesKo: [
    'Axios 인스턴스를 적절히 설정한다',
    '요청/응답 인터셉터를 구현한다',
    '토큰 관리와 갱신을 처리한다',
    '전역 에러 핸들링 패턴을 구현한다'
  ],
  sections: [
    // ============================================
    // Section 1: Axios 인스턴스 설정
    // ============================================
    {
      id: 'axios-instance-setup',
      title: 'Axios 인스턴스 설정',
      titleKo: 'Axios 인스턴스 설정',
      content: `
## Axios란?

Axios는 **Promise 기반 HTTP 클라이언트**입니다.
브라우저와 Node.js에서 모두 사용할 수 있으며, fetch보다 더 많은 기능을 제공합니다.

## fetch vs Axios

| 기능 | fetch | Axios |
|------|-------|-------|
| 자동 JSON 변환 | ❌ 수동 | ✅ 자동 |
| 요청 취소 | AbortController | 내장 지원 |
| 타임아웃 | ❌ 수동 구현 | ✅ 내장 |
| 인터셉터 | ❌ 없음 | ✅ 지원 |
| 요청/응답 변환 | ❌ 수동 | ✅ 자동 |
| 에러 처리 | HTTP 에러 무시 | HTTP 에러 throw |

## Axios 인스턴스 생성

전역 설정을 공유하는 인스턴스를 생성합니다:

\`\`\`tsx
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',  // 기본 URL
  timeout: 30000,                         // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json'
  }
});
\`\`\`

## 왜 인스턴스를 사용하는가?

\`\`\`tsx
// ❌ 안 좋음: 매번 전체 URL과 설정 작성
axios.get('http://localhost:3001/api/users', {
  headers: { Authorization: 'Bearer token' }
});

// ✅ 좋음: 인스턴스로 공통 설정 재사용
axiosInstance.get('/users');  // baseURL 자동 적용, 인터셉터로 토큰 추가
\`\`\`

## 환경 변수로 URL 관리

\`\`\`tsx
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api

// 코드에서 사용
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL
});
\`\`\`

## Helper 함수로 사용 편의성 높이기

\`\`\`tsx
// 매번 .then(res => res.data) 대신 helper 사용
export const api = {
  get: <T>(url: string) =>
    axiosInstance.get<T>(url).then(res => res.data),

  post: <T>(url: string, data?: any) =>
    axiosInstance.post<T>(url, data).then(res => res.data),

  put: <T>(url: string, data?: any) =>
    axiosInstance.put<T>(url, data).then(res => res.data),

  delete: <T>(url: string) =>
    axiosInstance.delete<T>(url).then(res => res.data)
};

// 사용
const users = await api.get<User[]>('/users');
await api.post('/users', { name: 'Kim' });
\`\`\`
`,
      codeExamples: [
        {
          id: 'axios-instance',
          title: '프로젝트 예제: Axios 인스턴스',
          description: '프로젝트에서 사용하는 실제 Axios 인스턴스 설정입니다.',
          language: 'tsx',
          fileName: 'src/lib/axios/index.ts',
          code: `import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
};`
        },
        {
          id: 'api-client',
          title: '프로젝트 예제: API Client Wrapper',
          description: '표준화된 응답 형식을 제공하는 API 클라이언트입니다.',
          language: 'tsx',
          fileName: 'src/lib/api/client.ts',
          code: `import axiosInstance from '@/lib/axios';
import { AxiosRequestConfig } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Helper to extract standardized response from backend
 */
function extractResponse<T>(responseData: any): ApiResponse<T> {
  if (responseData && typeof responseData === 'object' && 'success' in responseData) {
    return {
      success: responseData.success,
      data: responseData.data,
      error: responseData.error,
      message: responseData.message
    };
  }
  return { success: true, data: responseData };
}

export const apiClient = {
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<any>(url, config);
      return extractResponse<T>(response.data);
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Request failed'
      };
    }
  },

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<any>(url, data, config);
      return extractResponse<T>(response.data);
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Request failed'
      };
    }
  }
  // put, patch, delete도 동일한 패턴...
};`
        }
      ],
      tips: [
        'baseURL을 설정하면 모든 요청에서 기본 경로를 생략할 수 있습니다.',
        'timeout을 설정하여 응답이 너무 오래 걸리는 요청을 자동으로 취소합니다.',
        'TypeScript 제네릭을 사용하면 응답 타입을 명시적으로 지정할 수 있습니다.'
      ]
    },

    // ============================================
    // Section 2: 요청/응답 인터셉터
    // ============================================
    {
      id: 'interceptors',
      title: '요청/응답 인터셉터',
      titleKo: '요청/응답 인터셉터',
      content: `
## 인터셉터란?

인터셉터는 **요청이 서버로 가기 전**, 또는 **응답이 컴포넌트에 도착하기 전**에
데이터를 가로채서 처리하는 미들웨어입니다.

\`\`\`
[컴포넌트] → [요청 인터셉터] → [서버]
                                  ↓
[컴포넌트] ← [응답 인터셉터] ← [서버]
\`\`\`

## 요청 인터셉터 (Request Interceptor)

모든 요청에 공통 처리를 추가합니다:

\`\`\`tsx
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 전 처리
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);
\`\`\`

## 요청 인터셉터 활용 사례

### 1. 인증 토큰 자동 추가
\`\`\`tsx
config.headers.Authorization = \`Bearer \${token}\`;
\`\`\`

### 2. 특정 엔드포인트 제외
\`\`\`tsx
const publicEndpoints = ['/auth/login', '/auth/register'];
const isPublic = publicEndpoints.some(ep => config.url?.includes(ep));
if (!isPublic && token) {
  config.headers.Authorization = \`Bearer \${token}\`;
}
\`\`\`

### 3. FormData 처리
\`\`\`tsx
// FormData일 때 Content-Type 자동 설정 (boundary 포함)
if (config.data instanceof FormData) {
  delete config.headers['Content-Type'];
}
\`\`\`

## 응답 인터셉터 (Response Interceptor)

모든 응답에 공통 처리를 추가합니다:

\`\`\`tsx
axiosInstance.interceptors.response.use(
  (response) => {
    // 성공 응답 처리
    return response;
  },
  async (error) => {
    // 에러 응답 처리
    if (error.response?.status === 401) {
      // 토큰 만료 처리
    }
    return Promise.reject(error);
  }
);
\`\`\`

## 응답 인터셉터 활용 사례

### 1. HTTP 상태 코드별 처리
\`\`\`tsx
if (error.response?.status === 401) {
  // 인증 만료 → 토큰 갱신 또는 로그아웃
}
if (error.response?.status === 403) {
  // 권한 없음 → 접근 거부 페이지
}
if (error.response?.status === 500) {
  // 서버 에러 → 에러 페이지
}
\`\`\`

### 2. 네트워크 에러 처리
\`\`\`tsx
if (!error.response) {
  // 네트워크 연결 실패
  console.error('Network error:', error.message);
}
\`\`\`

### 3. 응답 데이터 변환
\`\`\`tsx
(response) => {
  // 날짜 문자열을 Date 객체로 변환
  if (response.data.createdAt) {
    response.data.createdAt = new Date(response.data.createdAt);
  }
  return response;
}
\`\`\`
`,
      codeExamples: [
        {
          id: 'request-interceptor',
          title: '프로젝트 예제: 요청 인터셉터',
          description: '토큰 추가와 FormData 처리를 담당하는 요청 인터셉터입니다.',
          language: 'tsx',
          fileName: 'src/lib/axios/index.ts',
          code: `// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints (login, refresh, etc.)
    const authEndpoints = ['/auth/login', '/auth/refresh', '/auth/sso', '/auth/register'];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));

    // Get token from localStorage
    if (typeof window !== 'undefined' && !isAuthEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
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
);`
        },
        {
          id: 'response-interceptor',
          title: '프로젝트 예제: 응답 인터셉터',
          description: '401 에러 시 토큰 갱신을 시도하는 응답 인터셉터입니다.',
          language: 'tsx',
          fileName: 'src/lib/axios/index.ts',
          code: `// Response interceptor
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
          const response = await axios.post(\`\${API_BASE_URL}/auth/refresh\`, {
            refreshToken
          });

          const { token } = response.data;
          localStorage.setItem('accessToken', token);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = \`Bearer \${token}\`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed - logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
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
);`
        }
      ],
      tips: [
        '요청 인터셉터에서 토큰을 추가하면 모든 API 호출에서 일일이 토큰을 전달할 필요가 없습니다.',
        "_retry 플래그를 사용하여 무한 루프를 방지합니다 (토큰 갱신 실패 시 재시도 방지).",
        'FormData 전송 시 Content-Type을 삭제하면 브라우저가 boundary를 자동으로 설정합니다.'
      ]
    },

    // ============================================
    // Section 3: 토큰 관리와 갱신
    // ============================================
    {
      id: 'token-management',
      title: '토큰 관리와 갱신',
      titleKo: '토큰 관리와 갱신',
      content: `
## JWT 토큰 기반 인증 흐름

\`\`\`
[로그인]
    │
    ▼
┌─────────────────────────────────┐
│  서버가 두 개의 토큰 발급         │
│  • Access Token (짧은 수명: 15분) │
│  • Refresh Token (긴 수명: 7일)  │
└─────────────────────────────────┘
    │
    ▼
[Access Token으로 API 요청]
    │
    ├── 성공 → 응답 반환
    │
    └── 401 에러 (토큰 만료)
            │
            ▼
    [Refresh Token으로 새 Access Token 요청]
            │
            ├── 성공 → 새 토큰 저장, 원래 요청 재시도
            │
            └── 실패 → 로그아웃 (세션 만료)
\`\`\`

## 토큰 저장 위치

| 저장소 | 장점 | 단점 |
|--------|------|------|
| localStorage | 간단, 지속적 | XSS 공격에 취약 |
| sessionStorage | 탭 닫으면 삭제 | XSS 취약, 탭 간 공유 X |
| HTTP-only Cookie | XSS 안전 | CSRF 공격 고려 필요 |
| 메모리 (state) | 가장 안전 | 새로고침 시 삭제 |

## 토큰 갱신 전략

### 1. 요청 실패 후 갱신 (Reactive)
\`\`\`tsx
// 401 에러 발생 시 토큰 갱신 시도
if (error.response?.status === 401) {
  const newToken = await refreshToken();
  // 원래 요청 재시도
  return axiosInstance(originalRequest);
}
\`\`\`

### 2. 만료 전 미리 갱신 (Proactive)
\`\`\`tsx
// 토큰 만료 1분 전에 미리 갱신
const tokenExpiry = jwt.decode(token).exp * 1000;
const oneMinute = 60 * 1000;

if (Date.now() > tokenExpiry - oneMinute) {
  await refreshToken();
}
\`\`\`

### 3. 동시 요청 처리
\`\`\`tsx
let isRefreshing = false;
let refreshSubscribers: Function[] = [];

// 갱신 중이면 대기열에 추가
if (isRefreshing) {
  return new Promise(resolve => {
    refreshSubscribers.push((token: string) => {
      originalRequest.headers.Authorization = \`Bearer \${token}\`;
      resolve(axiosInstance(originalRequest));
    });
  });
}
\`\`\`

## 로그아웃 처리

\`\`\`tsx
const logout = async () => {
  try {
    // 서버에 로그아웃 알림 (Refresh Token 무효화)
    await api.post('/auth/logout');
  } finally {
    // 클라이언트 측 토큰 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }
};
\`\`\`
`,
      codeExamples: [
        {
          id: 'auth-context',
          title: '프로젝트 예제: AuthContext 토큰 관리',
          description: '로그인, 로그아웃, 토큰 갱신을 관리하는 AuthContext입니다.',
          language: 'tsx',
          fileName: 'src/contexts/AuthContext.tsx',
          code: `'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Initialize auth from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        setAuthState({
          user, token, refreshToken,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });

    if (response.mfaRequired) {
      return { mfaRequired: true, userId: response.userId };
    }

    const { token, refreshToken, user } = response;

    // 토큰 저장
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    setAuthState({
      user, token, refreshToken,
      isAuthenticated: true,
      isLoading: false
    });

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      setAuthState({
        user: null, token: null, refreshToken: null,
        isAuthenticated: false, isLoading: false
      });
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) {
      throw new Error('No refresh token');
    }

    const response = await api.post('/auth/refresh', {
      refreshToken: currentRefreshToken
    });

    const { token } = response;
    localStorage.setItem('accessToken', token);
    setAuthState(prev => ({ ...prev, token }));
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}`
        },
        {
          id: 'token-refresh-interceptor',
          title: '자동 토큰 갱신 인터셉터',
          description: '401 에러 시 자동으로 토큰을 갱신하고 요청을 재시도합니다.',
          language: 'tsx',
          code: `// 응답 인터셉터에서 토큰 갱신 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이고 아직 재시도하지 않았으면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        // Refresh Token으로 새 Access Token 요청
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { token: newToken } = response.data;

        // 새 토큰 저장
        localStorage.setItem('accessToken', newToken);

        // 원래 요청에 새 토큰 적용 후 재시도
        originalRequest.headers.Authorization = \`Bearer \${newToken}\`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // 갱신 실패 시 로그아웃
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);`
        }
      ],
      tips: [
        'Access Token은 짧은 수명(15분~1시간), Refresh Token은 긴 수명(7일~30일)을 권장합니다.',
        '_retry 플래그로 무한 루프를 방지하세요. 토큰 갱신 요청이 실패해도 다시 갱신을 시도하지 않습니다.',
        '보안이 중요한 앱에서는 HTTP-only Cookie로 토큰을 저장하는 것을 권장합니다.'
      ]
    },

    // ============================================
    // Section 4: 전역 에러 핸들링
    // ============================================
    {
      id: 'global-error-handling',
      title: '전역 에러 핸들링',
      titleKo: '전역 에러 핸들링',
      content: `
## 에러 핸들링 전략

API 통신 에러는 **여러 계층**에서 처리할 수 있습니다:

\`\`\`
1. 인터셉터 (전역) - 공통 에러 처리
       │
2. API 클라이언트 - 응답 표준화
       │
3. 훅/컴포넌트 (로컬) - 개별 에러 처리
       │
4. Error Boundary - 렌더링 에러
\`\`\`

## HTTP 상태 코드별 처리

\`\`\`tsx
switch (error.response?.status) {
  case 400:
    // Bad Request - 잘못된 요청 (유효성 검사 실패)
    showError('입력값을 확인해주세요.');
    break;
  case 401:
    // Unauthorized - 인증 필요
    logout();
    break;
  case 403:
    // Forbidden - 권한 없음
    showError('접근 권한이 없습니다.');
    break;
  case 404:
    // Not Found - 리소스 없음
    showError('요청한 데이터를 찾을 수 없습니다.');
    break;
  case 500:
    // Internal Server Error - 서버 오류
    showError('서버 오류가 발생했습니다.');
    break;
  default:
    showError('알 수 없는 오류가 발생했습니다.');
}
\`\`\`

## 에러 응답 구조 표준화

\`\`\`tsx
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 성공
{ success: true, data: { users: [...] } }

// 실패
{ success: false, error: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' }
\`\`\`

## 메시지 기반 에러 처리

코드 기반으로 다국어 메시지를 표시합니다:

\`\`\`tsx
// 에러 코드 → 다국어 메시지
const errorMessages = {
  USER_NOT_FOUND: {
    en: 'User not found',
    ko: '사용자를 찾을 수 없습니다'
  },
  INVALID_CREDENTIALS: {
    en: 'Invalid username or password',
    ko: '아이디 또는 비밀번호가 올바르지 않습니다'
  }
};

// 사용
showError(errorMessages[errorCode][locale]);
\`\`\`

## try-catch 패턴

\`\`\`tsx
// ❌ 안 좋음: 에러를 무시
const fetchData = async () => {
  const response = await api.get('/data');
  setData(response);
};

// ✅ 좋음: 에러 처리
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await api.get('/data');
    setData(response);
  } catch (error) {
    const err = error as { response?: { data?: { error?: string } } };
    showError(err.response?.data?.error || '데이터를 불러오지 못했습니다');
  } finally {
    setLoading(false);
  }
};
\`\`\`

## 에러 경계 (Error Boundary)

React 컴포넌트 렌더링 에러를 잡습니다:

\`\`\`tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅 서비스에 전송
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>문제가 발생했습니다.</h1>;
    }
    return this.props.children;
  }
}
\`\`\`
`,
      codeExamples: [
        {
          id: 'use-message',
          title: '프로젝트 예제: useMessage 훅',
          description: '코드 기반 다국어 메시지 표시를 위한 훅입니다.',
          language: 'tsx',
          fileName: 'src/hooks/useMessage.ts',
          code: `import { useState, useCallback, useRef } from 'react';
import { api } from '@/lib/axios';

interface Message {
  id: string;
  code: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: { en: string; ko: string; zh: string; vi: string };
}

export function useMessage(options = {}) {
  const { duration = 10000, locale: defaultLocale = 'en' } = options;
  const messageCache = useRef<Map<string, Message>>(new Map());

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 메시지 코드로 API에서 가져오기
  const fetchMessage = useCallback(async (code: string) => {
    if (messageCache.current.has(code)) {
      return messageCache.current.get(code)!;
    }

    const message = await api.get<Message>(\`/message/code/\${code}\`);
    messageCache.current.set(code, message);
    return message;
  }, []);

  // 플레이스홀더 치환
  // "Deleted {count} user(s)" + {count: 5} => "Deleted 5 user(s)"
  const replacePlaceholders = useCallback((text: string, params?: Record<string, any>) => {
    if (!params) return text;
    return Object.entries(params).reduce((result, [key, value]) => {
      return result.replace(new RegExp(\`\\\\{\${key}\\\\}\`, 'g'), String(value));
    }, text);
  }, []);

  // 성공 메시지 표시
  const showSuccessMessage = useCallback(async (code: string, params?: Record<string, any>) => {
    const message = await fetchMessage(code);
    const text = message?.message[defaultLocale] || code;
    setSuccessMessage(replacePlaceholders(text, params));
  }, [fetchMessage, defaultLocale, replacePlaceholders]);

  // 에러 메시지 표시
  const showErrorMessage = useCallback(async (code: string, params?: Record<string, any>) => {
    const message = await fetchMessage(code);
    const text = message?.message[defaultLocale] || code;
    setErrorMessage(replacePlaceholders(text, params));
  }, [fetchMessage, defaultLocale, replacePlaceholders]);

  return {
    successMessage, errorMessage,
    showSuccessMessage, showErrorMessage,
    setSuccessMessage, setErrorMessage
  };
}`
        },
        {
          id: 'auto-hide-message',
          title: '프로젝트 예제: 자동 숨김 메시지',
          description: '일정 시간 후 자동으로 사라지는 메시지 훅입니다.',
          language: 'tsx',
          fileName: 'src/hooks/useAutoHideMessage.ts',
          code: `import { useState, useEffect, useCallback } from 'react';

export function useAutoHideMessage(options = {}) {
  const { duration = 10000 } = options;

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [successMessage, duration]);

  // Auto-hide error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, duration]);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);  // 에러 메시지 지우기
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);  // 성공 메시지 지우기
  }, []);

  return {
    successMessage, errorMessage,
    showSuccess, showError,
    setSuccessMessage, setErrorMessage
  };
}`
        }
      ],
      tips: [
        '인터셉터에서 공통 에러(401, 403)를 처리하고, 컴포넌트에서는 비즈니스 에러만 처리하세요.',
        '에러 메시지는 사용자가 이해하기 쉬운 문구로 표시하고, 개발자용 상세 정보는 콘솔에 로깅하세요.',
        '프로덕션 환경에서는 에러를 Sentry 같은 모니터링 서비스에 전송하세요.'
      ]
    },

    // ============================================
    // Section 5: 로딩 상태 관리 패턴
    // ============================================
    {
      id: 'loading-state-patterns',
      title: '로딩 상태 관리 패턴',
      titleKo: '로딩 상태 관리 패턴',
      content: `
## 기본 로딩 상태 관리

\`\`\`tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<Data | null>(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const result = await api.get('/data');
    setData(result);
  } catch (err) {
    setError('데이터를 불러오지 못했습니다');
  } finally {
    setLoading(false);
  }
};
\`\`\`

## 다중 로딩 상태

여러 작업의 로딩 상태를 별도로 관리합니다:

\`\`\`tsx
const [searching, setSearching] = useState(false);   // 검색 중
const [saveLoading, setSaveLoading] = useState(false);  // 저장 중
const [deleteLoading, setDeleteLoading] = useState(false);  // 삭제 중

// 검색
const handleSearch = async () => {
  setSearching(true);
  await fetchUsers();
  setSearching(false);
};

// 저장
const handleSave = async () => {
  setSaveLoading(true);
  await api.post('/users', userData);
  setSaveLoading(false);
};

// UI에서 사용
<Button disabled={searching}>검색</Button>
<Button disabled={saveLoading}>저장</Button>
\`\`\`

## 낙관적 업데이트 (Optimistic Update)

응답을 기다리지 않고 UI를 먼저 업데이트합니다:

\`\`\`tsx
const handleLike = async (postId: string) => {
  // 1. UI 먼저 업데이트 (낙관적)
  setLiked(true);
  setLikeCount(prev => prev + 1);

  try {
    // 2. 서버 요청
    await api.post(\`/posts/\${postId}/like\`);
  } catch (error) {
    // 3. 실패 시 롤백
    setLiked(false);
    setLikeCount(prev => prev - 1);
    showError('좋아요에 실패했습니다');
  }
};
\`\`\`

## 스켈레톤 로딩

로딩 중 레이아웃 뼈대를 보여줍니다:

\`\`\`tsx
if (loading) {
  return (
    <Grid container spacing={2}>
      {[1, 2, 3].map(i => (
        <Grid item xs={4} key={i}>
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </Grid>
      ))}
    </Grid>
  );
}
\`\`\`

## 버튼 로딩 상태

\`\`\`tsx
<Button
  disabled={saveLoading}
  onClick={handleSave}
  startIcon={saveLoading ? <CircularProgress size={20} /> : <SaveIcon />}
>
  {saveLoading ? '저장 중...' : '저장'}
</Button>
\`\`\`

## 에러 상태와 재시도

\`\`\`tsx
if (error) {
  return (
    <Alert severity="error">
      {error}
      <Button onClick={handleRetry}>다시 시도</Button>
    </Alert>
  );
}
\`\`\`
`,
      codeExamples: [
        {
          id: 'user-management-loading',
          title: '프로젝트 예제: useUserManagement 로딩 상태',
          description: '검색, 저장, 삭제 등 각 작업별 로딩 상태를 별도로 관리합니다.',
          language: 'tsx',
          fileName: 'src/app/[locale]/admin/users/hooks/useUserManagement.ts',
          code: `export const useUserManagement = (options = {}) => {
  // 작업별 로딩 상태
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // 검색
  const fetchUsers = useCallback(async (page, pageSize, useQuickSearch) => {
    try {
      setSearching(true);
      const params = new URLSearchParams();
      // ... 파라미터 설정
      const response = await api.get(\`/user?\${params.toString()}\`);
      setUsers(response.users || []);
    } catch (error) {
      showErrorMessage('CRUD_USER_LOAD_FAIL');
    } finally {
      setSearching(false);
    }
  }, [/* deps */]);

  // 저장
  const handleSave = useCallback(async () => {
    if (!editingUser) return;

    try {
      setSaveLoading(true);

      if (!editingUser.id) {
        // 신규 생성
        const response = await api.post('/user', editingUser);
        setUsers([...users, response.user]);
        showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
      } else {
        // 수정
        const response = await api.put(\`/user/\${editingUser.id}\`, editingUser);
        setUsers(users.map(u => u.id === editingUser.id ? response.user : u));
        showSuccessMessage('CRUD_USER_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
    } catch (err) {
      showErrorMessage('CRUD_USER_SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingUser, users]);

  // 삭제
  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      for (const id of selectedForDelete) {
        await api.delete(\`/user/\${id}\`);
      }

      setUsers(users.filter(user => !selectedForDelete.includes(user.id)));
      showSuccessMessage('CRUD_USER_DELETE_SUCCESS', { count: selectedForDelete.length });
    } catch (err) {
      showErrorMessage('CRUD_USER_DELETE_FAIL');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, users]);

  return {
    searching, saveLoading, deleteLoading, resetPasswordLoading,
    // ... 기타 반환값
  };
};`
        },
        {
          id: 'board-management-loading',
          title: '프로젝트 예제: useBoardManagement 병렬 삭제',
          description: 'Promise.allSettled로 여러 항목을 병렬 삭제하고 결과를 집계합니다.',
          language: 'tsx',
          fileName: 'src/app/[locale]/boards/[boardTypeId]/hooks/useBoardManagement.ts',
          code: `// 병렬 삭제 처리
const handleConfirmDelete = useCallback(async () => {
  if (deleteTargetIds.length === 0) return;

  try {
    setDeleteLoading(true);

    // 여러 항목 병렬 삭제
    const deletePromises = deleteTargetIds.map(id =>
      apiClient.delete(\`/post/\${id}\`)
    );

    // 모든 결과 수집 (실패해도 계속 진행)
    const results = await Promise.allSettled(deletePromises);

    // 성공/실패 카운트
    const successes = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;
    const failures = results.length - successes;

    // 결과에 따른 메시지
    if (successes > 0) {
      showSuccess(\`Successfully deleted \${successes} post\${successes > 1 ? 's' : ''}\`);
      handleRefresh();  // 목록 새로고침
    }

    if (failures > 0) {
      showError(\`Failed to delete \${failures} post\${failures > 1 ? 's' : ''}\`);
    }

    setDeleteDialogOpen(false);
    setDeleteTargetIds([]);
  } catch (error) {
    showError('Failed to delete posts');
  } finally {
    setDeleteLoading(false);
  }
}, [deleteTargetIds, showSuccess, showError, handleRefresh]);`
        }
      ],
      tips: [
        '작업별로 별도의 로딩 상태를 관리하면 UI가 더 정확하게 사용자에게 피드백을 줄 수 있습니다.',
        'Promise.allSettled를 사용하면 일부 요청이 실패해도 나머지 결과를 받을 수 있습니다.',
        'finally 블록에서 로딩 상태를 해제하면 성공/실패 상관없이 항상 로딩이 끝납니다.',
        '낙관적 업데이트는 좋아요, 즐겨찾기 등 빠른 피드백이 중요한 기능에 적합합니다.'
      ]
    },

    // ============================================
    // Section 6: 실전 API 훅 패턴
    // ============================================
    {
      id: 'api-hook-patterns',
      title: '실전 API 훅 패턴',
      titleKo: '실전 API 훅 패턴',
      content: `
## CRUD 관리 훅 패턴

프로젝트에서 사용하는 표준 관리 훅 구조입니다:

\`\`\`tsx
export const useResourceManagement = (options = {}) => {
  // 1. 페이지 상태 (검색, 페이지네이션)
  const { searchCriteria, paginationModel, data, setData } = usePageState(options);

  // 2. 메시지 시스템
  const { showSuccessMessage, showErrorMessage } = useMessage({ locale });

  // 3. 로딩/UI 상태
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 4. CRUD 함수들
  const fetchData = useCallback(async () => { /* ... */ }, []);
  const handleAdd = useCallback(() => { /* ... */ }, []);
  const handleEdit = useCallback((id) => { /* ... */ }, []);
  const handleSave = useCallback(async () => { /* ... */ }, []);
  const handleDelete = useCallback(async (ids) => { /* ... */ }, []);

  // 5. 검색 핸들러
  const handleQuickSearch = useCallback(() => { /* ... */ }, []);
  const handleAdvancedSearch = useCallback(() => { /* ... */ }, []);

  // 6. 반환
  return {
    // 상태
    data, searchCriteria, paginationModel,
    searching, saveLoading, dialogOpen,
    successMessage, errorMessage,

    // 핸들러
    handleAdd, handleEdit, handleSave, handleDelete,
    handleQuickSearch, handleAdvancedSearch,
    // ...
  };
};
\`\`\`

## 관심사 분리

| 계층 | 역할 | 예시 |
|------|------|------|
| Axios 인스턴스 | 전역 설정 | baseURL, 타임아웃 |
| 인터셉터 | 요청/응답 변환 | 토큰 추가, 에러 처리 |
| API Client | 응답 표준화 | success/error 포맷 |
| 관리 훅 | 비즈니스 로직 | CRUD, 검색, 페이지네이션 |
| 컴포넌트 | UI 표시 | 데이터 렌더링 |

## 재사용 가능한 훅 설계

\`\`\`tsx
// 공통 페이지 상태 훅
const usePageState = ({ storageKey, initialCriteria }) => {
  const [searchCriteria, setSearchCriteria] = useState(initialCriteria);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [data, setData] = useState([]);

  // 상태 저장/복원
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const { criteria, pagination } = JSON.parse(saved);
      setSearchCriteria(criteria);
      setPaginationModel(pagination);
    }
  }, [storageKey]);

  return { searchCriteria, setSearchCriteria, paginationModel, setPaginationModel, data, setData };
};

// 도메인별 관리 훅에서 재사용
const useUserManagement = (options) => {
  const pageState = usePageState({ ...options, initialCriteria: userInitialCriteria });
  // ... 사용자 관련 로직
};

const useBoardManagement = (options) => {
  const pageState = usePageState({ ...options, initialCriteria: boardInitialCriteria });
  // ... 게시판 관련 로직
};
\`\`\`

## 훅 사용 예시

\`\`\`tsx
export default function UsersPage() {
  const {
    users,
    searching,
    saveLoading,
    dialogOpen,
    successMessage,
    errorMessage,
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick
  } = useUserManagement({ storageKey: 'admin-users' });

  return (
    <>
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Button onClick={handleAdd}>추가</Button>

      <DataGrid
        rows={users}
        loading={searching}
        onRowClick={(params) => handleEdit(params.id)}
      />

      <FormDialog
        open={dialogOpen}
        loading={saveLoading}
        onSave={handleSave}
      />
    </>
  );
}
\`\`\`
`,
      codeExamples: [
        {
          id: 'management-hook-structure',
          title: '관리 훅 전체 구조',
          description: 'CRUD 관리 훅의 완전한 구조와 반환 값입니다.',
          language: 'tsx',
          code: `export const useResourceManagement = (options = {}) => {
  const { storageKey = 'resource-page-state' } = options;

  // 페이지 상태 훅
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: items,
    setData: setItems,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, ResourceItem>({
    storageKey,
    initialCriteria: { name: '', status: '' },
    initialPaginationModel: { page: 0, pageSize: 50 }
  });

  // 메시지 시스템
  const locale = useCurrentLocale();
  const { successMessage, errorMessage, showSuccessMessage, showErrorMessage } = useMessage({ locale });

  // UI 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // API 호출
  const fetchItems = useCallback(async (page, pageSize, useQuickSearch) => {
    try {
      setSearching(true);
      const params = buildSearchParams(searchCriteria, quickSearch, useQuickSearch);
      params.append('page', (page + 1).toString());
      params.append('limit', pageSize.toString());

      const response = await api.get(\`/resource?\${params.toString()}\`);
      setItems(response.items || []);
      setRowCount(response.pagination?.totalCount || 0);
    } catch (error) {
      await showErrorMessage('LOAD_FAIL');
      setItems([]);
    } finally {
      setSearching(false);
    }
  }, [searchCriteria, quickSearch, setItems, setRowCount, showErrorMessage]);

  // CRUD 핸들러
  const handleAdd = useCallback(() => {
    setEditingItem({ id: '', name: '', status: 'active' });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setEditingItem(item);
      setDialogOpen(true);
    }
  }, [items]);

  const handleSave = useCallback(async () => {
    if (!editingItem) return;
    try {
      setSaveLoading(true);
      if (!editingItem.id) {
        const response = await api.post('/resource', editingItem);
        setItems([...items, response.item]);
        await showSuccessMessage('CREATE_SUCCESS');
      } else {
        const response = await api.put(\`/resource/\${editingItem.id}\`, editingItem);
        setItems(items.map(i => i.id === editingItem.id ? response.item : i));
        await showSuccessMessage('UPDATE_SUCCESS');
      }
      setDialogOpen(false);
    } catch (err) {
      await showErrorMessage('SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingItem, items, setItems, showSuccessMessage, showErrorMessage]);

  // 반환
  return {
    // 데이터
    items, searchCriteria, quickSearch, paginationModel, rowCount,
    // UI 상태
    dialogOpen, editingItem, searching, saveLoading, deleteLoading,
    // 메시지
    successMessage, errorMessage,
    // 핸들러
    handleAdd, handleEdit, handleSave,
    setDialogOpen, setEditingItem, setQuickSearch,
    fetchItems
  };
};`
        },
        {
          id: 'hook-usage',
          title: '페이지에서 훅 사용',
          description: '관리 훅을 사용하는 페이지 컴포넌트 예시입니다.',
          language: 'tsx',
          code: `'use client';

export default function ResourceManagementPage() {
  const {
    items,
    searching,
    saveLoading,
    dialogOpen,
    editingItem,
    setEditingItem,
    setDialogOpen,
    successMessage,
    errorMessage,
    paginationModel,
    rowCount,
    handleAdd,
    handleEdit,
    handleSave,
    handlePaginationModelChange
  } = useResourceManagement({ storageKey: 'admin-resources' });

  return (
    <PageContainer>
      {/* 메시지 표시 */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
      )}

      {/* 툴바 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleAdd}>
          추가
        </Button>
      </Box>

      {/* 데이터 그리드 */}
      <DataGrid
        rows={items}
        columns={columns}
        loading={searching}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        rowCount={rowCount}
        paginationMode="server"
        onRowClick={(params) => handleEdit(params.id)}
      />

      {/* 편집 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editingItem?.id ? '수정' : '추가'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="이름"
            value={editingItem?.name || ''}
            onChange={(e) => setEditingItem(prev => ({ ...prev!, name: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleSave}
            disabled={saveLoading}
            variant="contained"
          >
            {saveLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}`
        }
      ],
      tips: [
        '관리 훅은 상태, 메시지, 핸들러를 모두 포함하여 컴포넌트를 깔끔하게 유지합니다.',
        'usePageState 같은 공통 훅을 만들어 여러 관리 훅에서 재사용하세요.',
        '훅에서 반환하는 값들은 용도에 따라 그룹화하면 사용하기 편합니다 (상태, 핸들러, 메시지).',
        'TypeScript 제네릭으로 타입 안전성을 확보하면 개발 생산성이 크게 향상됩니다.'
      ]
    }
  ],
  status: 'ready'
};

export default chapter;
