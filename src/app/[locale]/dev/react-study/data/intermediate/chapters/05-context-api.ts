/**
 * Chapter 5: Context API
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'context-api',
  order: 5,
  title: 'Context API',
  titleKo: 'Context API',
  description: 'Learn how to share state across components using React Context API.',
  descriptionKo: 'React Context API를 사용하여 컴포넌트 간 상태를 공유하는 방법을 학습합니다.',
  estimatedMinutes: 55,
  objectives: [
    'Understand Context creation and Provider pattern',
    'Master useContext hook for consuming context',
    'Learn Context separation strategies for performance',
    'Compare Context with Props and global state solutions'
  ],
  objectivesKo: [
    'Context 생성과 Provider 패턴을 이해한다',
    'useContext 훅으로 Context를 소비하는 방법을 익힌다',
    '성능을 고려한 Context 분리 전략을 학습한다',
    'Context와 Props, 전역 상태 솔루션을 비교한다'
  ],
  sections: [
    {
      id: 'context-basics',
      title: 'Context Fundamentals',
      titleKo: 'Context 기본 개념',
      content: `
## Context란?

**Context**는 React에서 컴포넌트 트리 전체에 데이터를 **"전파(broadcast)"** 하는 방법입니다.
일반적으로 Props를 통해 부모→자식으로 데이터를 전달하지만, 중첩이 깊어지면 **Props Drilling** 문제가 발생합니다.

### Props Drilling 문제

\`\`\`
App
 └─ Layout
     └─ Sidebar
         └─ UserPanel
             └─ UserAvatar  ← user 데이터 필요!

// user를 전달하려면 모든 중간 컴포넌트를 거쳐야 함
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserPanel user={user}>
        <UserAvatar user={user} />  ← 드디어 도착!
      </UserPanel>
    </Sidebar>
  </Layout>
</App>
\`\`\`

### Context로 해결

\`\`\`tsx
// Context 사용 시
<AuthProvider>         // ← user 제공
  <App>
    <Layout>
      <Sidebar>
        <UserPanel>
          <UserAvatar />  // ← useAuth()로 직접 접근!
        </UserPanel>
      </Sidebar>
    </Layout>
  </App>
</AuthProvider>
\`\`\`

### Context API의 3요소

| 요소 | 역할 | 예시 |
|------|------|------|
| **createContext** | Context 객체 생성 | \`const AuthContext = createContext()\` |
| **Provider** | Context 값 제공 | \`<AuthContext.Provider value={...}>\` |
| **useContext** | Context 값 소비 | \`const value = useContext(AuthContext)\` |

### 기본 사용법

\`\`\`tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Context 생성 (타입과 기본값)
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. Provider 컴포넌트 생성
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // value를 Provider에 전달
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Custom Hook으로 사용 편의성 제공
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 4. 컴포넌트에서 사용
function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
\`\`\`

### Context 사용이 적합한 경우

| 적합한 경우 | 예시 |
|------------|------|
| 인증/사용자 정보 | 로그인 상태, 사용자 프로필 |
| 테마/스타일 | 다크모드, 색상 테마 |
| 언어/로케일 | 다국어 지원, 날짜 포맷 |
| 권한/설정 | 기능 접근 권한, 앱 설정 |
| 라우팅 정보 | 현재 경로, 네비게이션 상태 |
      `,
      codeExamples: [
        {
          id: 'auth-context-basic',
          title: 'AuthContext - 인증 상태 관리',
          description: '프로젝트의 실제 AuthContext 구조',
          fileName: 'src/contexts/AuthContext.tsx',
          language: 'tsx',
          code: `// AuthContext - 인증 상태 관리의 기본 구조

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '@/types/auth';
import { api } from '@/lib/axios';

// ⭐ 1. Context 타입 정의
// AuthState를 확장하여 메서드도 포함
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<any>;
  verifyMFA: (userId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  ssoLogin: () => Promise<void>;
  updateUser: (user: any) => void;
}

// ⭐ 2. Context 생성 (undefined로 초기화)
// undefined를 사용하면 Provider 없이 사용 시 에러를 발생시킬 수 있음
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ⭐ 3. Provider 컴포넌트
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 인증 상태 관리
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true  // 초기 로딩 상태
  });

  // ⭐ 초기화: localStorage에서 토큰 복원
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
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    initAuth();
  }, []);

  // ⭐ 로그인 함수 (useCallback으로 안정화)
  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });

      // MFA가 필요한 경우
      if (response.mfaRequired) {
        return {
          mfaRequired: true,
          userId: response.userId,
          email: response.email,
          devCode: response.devCode
        };
      }

      // 로그인 성공: 상태 및 스토리지 업데이트
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

  // ⭐ 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 실패해도 로컬 상태는 클리어
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

  // ... 다른 메서드들 (verifyMFA, refreshAccessToken, ssoLogin, updateUser)

  // ⭐ 4. value 객체 구성
  const value: AuthContextType = {
    ...authState,
    login,
    verifyMFA,
    logout,
    refreshAccessToken,
    ssoLogin,
    updateUser
  };

  // ⭐ 5. Provider로 children 래핑
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ⭐ 6. Custom Hook - 안전한 Context 사용
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}`
        },
        {
          id: 'i18n-context',
          title: 'I18n Context - 다국어 지원',
          description: 'next-international 라이브러리를 활용한 다국어 Context',
          fileName: 'src/lib/i18n/client.ts',
          language: 'tsx',
          code: `// I18n Context - next-international 사용

// src/lib/i18n/client.ts
import { createI18nClient } from 'next-international/client';

// ⭐ next-international이 Context를 자동 생성
export const {
  useI18n,              // 번역 함수: t('key')
  I18nProviderClient,   // Provider 컴포넌트
  useCurrentLocale,     // 현재 로케일: 'en' | 'ko' | 'zh' | 'vi'
  useChangeLocale       // 로케일 변경 함수
} = createI18nClient({
  en: () => import('./locales/en'),
  ko: () => import('./locales/ko'),
  zh: () => import('./locales/zh'),
  vi: () => import('./locales/vi')
});

// 사용 예시
function DashboardHeader() {
  // ⭐ 현재 로케일 가져오기
  const locale = useCurrentLocale();      // 'ko'

  // ⭐ 로케일 변경 함수
  const changeLocale = useChangeLocale();

  // ⭐ 번역 함수
  const t = useI18n();

  const handleLanguageChange = (newLocale: string) => {
    changeLocale(newLocale as 'en' | 'ko' | 'zh' | 'vi');
  };

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <span>Current: {locale}</span>
      <button onClick={() => handleLanguageChange('ko')}>한국어</button>
      <button onClick={() => handleLanguageChange('en')}>English</button>
    </div>
  );
}

// locales/ko.ts 예시
export default {
  common: {
    appName: '기업용 앱',
    save: '저장',
    cancel: '취소',
    delete: '삭제'
  },
  header: {
    profile: '프로필',
    settings: '설정',
    logout: '로그아웃',
    language: '언어'
  }
} as const;`
        }
      ],
      tips: [
        '✅ Context는 "전역 상태"가 아닌 "트리 범위 상태"입니다.',
        '✅ createContext의 기본값은 Provider 없이 사용 시의 fallback입니다.',
        '⚠️ undefined 기본값 + 커스텀 훅에서 에러 던지기 = 안전한 패턴',
        'ℹ️ 자주 변경되는 값은 Context보다 다른 상태 관리 도구가 적합할 수 있습니다.'
      ]
    },
    {
      id: 'provider-pattern',
      title: 'Provider Pattern and Composition',
      titleKo: 'Provider 패턴과 조합',
      content: `
## Provider 패턴

Provider는 Context 값을 하위 컴포넌트에 **제공(provide)** 하는 컴포넌트입니다.

### Provider 중첩 구조

실제 앱에서는 여러 Provider가 중첩됩니다:

\`\`\`tsx
// 전형적인 Provider 중첩 구조
<I18nProvider>           // 최상위: 언어
  <ThemeProvider>        // 테마
    <AuthProvider>       // 인증 (I18n 사용 가능)
      <PermissionProvider>  // 권한 (Auth 사용)
        <MenuProvider>       // 메뉴 (Auth, Permission 사용)
          <App />
        </MenuProvider>
      </PermissionProvider>
    </AuthProvider>
  </ThemeProvider>
</I18nProvider>
\`\`\`

### Provider 순서가 중요한 이유

\`\`\`tsx
// ⭐ 하위 Provider는 상위 Context를 사용할 수 있음

function PermissionProvider({ children }) {
  // AuthContext 사용 가능 (AuthProvider 내부에 있으므로)
  const { user, isAuthenticated } = useAuth();

  // 인증된 사용자의 권한만 조회
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPermissions();
    }
  }, [isAuthenticated, user]);

  // ...
}

function MenuProvider({ children }) {
  // AuthContext와 PermissionContext 모두 사용 가능
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMenus();  // 사용자별 메뉴 로드
    }
  }, [isAuthenticated, user?.id]);

  // ...
}
\`\`\`

### Provider 합성 패턴

\`\`\`tsx
// 여러 Provider를 하나로 합치는 패턴

// ❌ 깊은 중첩 - 가독성 나쁨
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
          <MenuProvider>
            <RouterProvider>
              <QueryProvider>
                <Content />
              </QueryProvider>
            </RouterProvider>
          </MenuProvider>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ✅ ComposeProviders 패턴
function composeProviders(...providers: React.FC<{ children: React.ReactNode }>[]) {
  return ({ children }: { children: React.ReactNode }) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}

const AllProviders = composeProviders(
  ThemeProvider,
  AuthProvider,
  PermissionProvider,
  MenuProvider
);

function App() {
  return (
    <AllProviders>
      <Content />
    </AllProviders>
  );
}
\`\`\`

### Provider 값 안정화

\`\`\`tsx
function BadProvider({ children }) {
  const [user, setUser] = useState(null);

  // ❌ 매 렌더링마다 새 객체 생성
  const value = {
    user,
    login: async () => { ... },
    logout: async () => { ... }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function GoodProvider({ children }) {
  const [user, setUser] = useState(null);

  // ✅ useCallback으로 함수 안정화
  const login = useCallback(async () => { ... }, []);
  const logout = useCallback(async () => { ... }, []);

  // ✅ useMemo로 객체 안정화
  const value = useMemo(() => ({
    user,
    login,
    logout
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'client-providers',
          title: 'ClientProviders - Provider 조합',
          description: '프로젝트의 실제 Provider 중첩 구조',
          fileName: 'src/components/providers/ClientProviders.tsx',
          language: 'tsx',
          code: `// ClientProviders - 모든 Client Provider 조합

'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nProviderClient } from '@/lib/i18n/client';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { MenuProvider } from '@/contexts/MenuContext';
import LanguageLoader from './LanguageLoader';
import NoticePopup from '@/components/common/NoticePopup';
import { lightTheme } from '@/theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function ClientProviders({
  children,
  locale
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    // ⭐ 1. I18n Provider (최상위 - 언어 설정)
    <I18nProviderClient locale={locale}>
      {/* ⭐ 2. Theme Provider (MUI 테마) */}
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />

        {/* ⭐ 3. Auth Provider (인증 - I18n 사용 가능) */}
        <AuthProvider>
          {/* 언어 설정 로더 */}
          <LanguageLoader />

          {/* ⭐ 4. Permission Provider (권한 - Auth 필요) */}
          <PermissionProvider>

            {/* ⭐ 5. Menu Provider (메뉴 - Auth, Permission 필요) */}
            <MenuProvider>
              {children}

              {/* 전역 알림 컴포넌트들 */}
              <NoticePopup />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </MenuProvider>

          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProviderClient>
  );
}

/*
Provider 의존성 순서:
1. I18nProviderClient - 독립적 (locale만 필요)
2. ThemeProvider - 독립적 (theme 설정만)
3. AuthProvider - 독립적 (API 호출)
4. PermissionProvider - AuthProvider 의존 (user, isAuthenticated)
5. MenuProvider - AuthProvider 의존 (user, isAuthenticated)

주의사항:
- PermissionProvider와 MenuProvider는 AuthProvider 내부에 있어야 함
- I18nProvider는 최상위에 있어야 모든 곳에서 번역 사용 가능
*/`
        },
        {
          id: 'permission-provider',
          title: 'PermissionProvider - Context 의존성',
          description: 'AuthContext에 의존하는 PermissionProvider',
          fileName: 'src/contexts/PermissionContext.tsx',
          language: 'tsx',
          code: `// PermissionProvider - 다른 Context를 사용하는 Provider

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';  // ⭐ 다른 Context 사용
import { api } from '@/lib/axios';

export interface ProgramPermission {
  programCode: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface PermissionContextType {
  permissions: Map<string, ProgramPermission>;
  loading: boolean;
  hasAccess: (programCode: string) => boolean;
  canView: (programCode: string) => boolean;
  canCreate: (programCode: string) => boolean;
  canUpdate: (programCode: string) => boolean;
  canDelete: (programCode: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  // ⭐ AuthContext에서 인증 상태 가져오기
  const { user, isAuthenticated } = useAuth();

  const [permissions, setPermissions] = useState<Map<string, ProgramPermission>>(new Map());
  const [loading, setLoading] = useState(true);

  // 권한 페칭 함수
  const fetchPermissions = useCallback(async () => {
    // ⭐ 인증 상태에 따라 권한 조회
    if (!isAuthenticated || !user) {
      setPermissions(new Map());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.get<{ permissions: any[] }>('/user/permissions');

      if (!data) {
        console.error('Invalid response from permissions endpoint');
        setPermissions(new Map());
        return;
      }

      const permissionsData = data.permissions || [];
      const permMap = new Map<string, ProgramPermission>();

      permissionsData.forEach((perm: any) => {
        permMap.set(perm.programCode, {
          programCode: perm.programCode,
          canView: perm.canView || false,
          canCreate: perm.canCreate || false,
          canUpdate: perm.canUpdate || false,
          canDelete: perm.canDelete || false
        });
      });

      setPermissions(permMap);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions(new Map());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // ⭐ 인증 상태 변경 시 권한 재조회
  useEffect(() => {
    void fetchPermissions();
  }, [fetchPermissions]);

  // 권한 체크 함수들 (useCallback으로 안정화)
  const hasAccess = useCallback((programCode: string): boolean => {
    return permissions.get(programCode)?.canView || false;
  }, [permissions]);

  const canView = useCallback((programCode: string): boolean => {
    return permissions.get(programCode)?.canView || false;
  }, [permissions]);

  const canCreate = useCallback((programCode: string): boolean => {
    return permissions.get(programCode)?.canCreate || false;
  }, [permissions]);

  const canUpdate = useCallback((programCode: string): boolean => {
    return permissions.get(programCode)?.canUpdate || false;
  }, [permissions]);

  const canDelete = useCallback((programCode: string): boolean => {
    return permissions.get(programCode)?.canDelete || false;
  }, [permissions]);

  const refreshPermissions = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);

  // ⭐ useMemo로 value 객체 안정화
  const value: PermissionContextType = useMemo(() => ({
    permissions,
    loading,
    hasAccess,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    refreshPermissions
  }), [permissions, loading, hasAccess, canView, canCreate, canUpdate, canDelete, refreshPermissions]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// 기본 Hook
export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

// ⭐ 특화 Hook - 특정 프로그램의 권한만 반환
export function useProgramPermissions(programCode: string) {
  const { permissions, loading, hasAccess, canView, canCreate, canUpdate, canDelete } = usePermissions();

  return {
    hasAccess: hasAccess(programCode),
    canView: canView(programCode),
    canCreate: canCreate(programCode),
    canUpdate: canUpdate(programCode),
    canDelete: canDelete(programCode),
    loading,
    permissions: permissions.get(programCode)
  };
}`
        }
      ],
      tips: [
        '✅ Provider 순서는 의존성에 따라 결정됩니다. 의존하는 Provider가 더 안쪽에.',
        '✅ useMemo로 value 객체를 안정화하여 불필요한 리렌더링 방지.',
        '⚠️ 너무 많은 Provider 중첩은 가독성을 해칩니다. 관련 Provider 합치기 고려.',
        'ℹ️ 하위 Provider에서 상위 Context를 사용하면 자연스러운 의존성 주입이 됩니다.'
      ]
    },
    {
      id: 'usecontext-patterns',
      title: 'useContext Advanced Patterns',
      titleKo: 'useContext 고급 활용',
      content: `
## useContext 훅

\`useContext\`는 Context 값을 읽는 React Hook입니다.

### 기본 사용법

\`\`\`tsx
import { useContext } from 'react';

function MyComponent() {
  // Context에서 값 읽기
  const value = useContext(MyContext);

  return <div>{value.data}</div>;
}
\`\`\`

### 안전한 Context 사용 패턴

\`\`\`tsx
// 1. Context 생성 시 undefined 사용
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Custom Hook에서 에러 처리
export function useAuth() {
  const context = useContext(AuthContext);

  // Provider 없이 사용하면 에러
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// 3. 컴포넌트에서 안전하게 사용
function UserProfile() {
  const { user } = useAuth();  // 타입 안전 보장

  return <div>{user.name}</div>;
}
\`\`\`

### 선택적 Context 패턴

\`\`\`tsx
// Provider 없어도 기본값으로 동작하는 패턴

const defaultTheme = { mode: 'light', colors: defaultColors };
const ThemeContext = createContext(defaultTheme);

// 기본값이 있으므로 undefined 체크 불필요
export function useTheme() {
  return useContext(ThemeContext);
}

// Provider 없이도 사용 가능
function SomeComponent() {
  const theme = useTheme();  // defaultTheme 반환
  return <div style={{ color: theme.colors.primary }}>Hello</div>;
}
\`\`\`

### 특화된 Hook 만들기

\`\`\`tsx
// 기본 Hook
export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('...');
  return context;
}

// ⭐ 특화 Hook 1: 특정 프로그램 권한
export function useProgramPermissions(programCode: string) {
  const { canView, canCreate, canUpdate, canDelete, loading } = usePermissions();

  return {
    canView: canView(programCode),
    canCreate: canCreate(programCode),
    canUpdate: canUpdate(programCode),
    canDelete: canDelete(programCode),
    loading
  };
}

// ⭐ 특화 Hook 2: 현재 사용자 정보만
export function useCurrentUser() {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
}

// ⭐ 특화 Hook 3: 로그인/로그아웃만
export function useAuthActions() {
  const { login, logout, verifyMFA } = useAuth();
  return { login, logout, verifyMFA };
}
\`\`\`

### Context와 조건부 렌더링

\`\`\`tsx
function ProtectedContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 미인증
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  // 인증됨
  return <SecureContent />;
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'route-guard-context',
          title: 'RouteGuard - 여러 Context 조합',
          description: 'Auth와 Permission Context를 조합한 라우트 가드',
          fileName: 'src/components/auth/RouteGuard.tsx',
          language: 'tsx',
          code: `// RouteGuard - 여러 Context를 조합하여 접근 제어

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProgramPermissions } from '@/contexts/PermissionContext';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

interface RouteGuardProps {
  children: ReactNode;
  programCode?: string;
  requiredPermission?: 'view' | 'create' | 'update' | 'delete';
  fallbackUrl?: string;
}

export default function RouteGuard({
  children,
  programCode,
  requiredPermission = 'view',
  fallbackUrl = '/dashboard'
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ⭐ 1. AuthContext 사용
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // ⭐ 2. PermissionContext 사용 (programCode가 있을 때만)
  const {
    hasAccess,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    loading: permLoading
  } = useProgramPermissions(programCode || '');

  // ⭐ 인증 리다이렉트
  useEffect(() => {
    // 공개 라우트는 스킵
    const isPublicRoute = pathname.endsWith('/login') ||
                         pathname === '/' ||
                         pathname.match(/^\\/[a-z]{2}$/);
    if (isPublicRoute || authLoading) return;

    // 미인증 시 로그인 페이지로
    if (!isAuthenticated || !user) {
      const localeMatch = pathname.match(/^\\/([a-z]{2})\\//);
      const locale = localeMatch ? localeMatch[1] : 'en';
      router.push(\`/\${locale}/login?redirect=\${encodeURIComponent(pathname)}\`);
    }
  }, [isAuthenticated, user, authLoading, pathname, router]);

  // ⭐ 로딩 상태
  if (authLoading || (programCode && permLoading)) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // 미인증 (리다이렉트 대기)
  if (!isAuthenticated || !user) {
    return null;
  }

  // ⭐ 권한 체크
  if (programCode) {
    let hasRequiredPermission = false;

    switch (requiredPermission) {
      case 'view':
        hasRequiredPermission = canView;
        break;
      case 'create':
        hasRequiredPermission = canCreate;
        break;
      case 'update':
        hasRequiredPermission = canUpdate;
        break;
      case 'delete':
        hasRequiredPermission = canDelete;
        break;
    }

    // 권한 없음: 접근 거부 표시
    if (!hasAccess || !hasRequiredPermission) {
      return (
        <Box sx={{ /* 스타일 */ }}>
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You don't have permission to access this page.
              <br />
              Required: <strong>{requiredPermission}</strong> for <strong>{programCode}</strong>
            </Typography>
            <Button variant="contained" onClick={() => router.push(fallbackUrl)}>
              Go to Dashboard
            </Button>
          </Paper>
        </Box>
      );
    }
  }

  // ⭐ 모든 체크 통과: children 렌더링
  return <>{children}</>;
}

// 사용 예시
function AdminUserPage() {
  return (
    <RouteGuard programCode="PROG-USER-LIST" requiredPermission="view">
      <UserListContent />
    </RouteGuard>
  );
}`
        },
        {
          id: 'dashboard-header-context',
          title: 'DashboardHeader - 다중 Context 사용',
          description: 'Auth, I18n Context를 함께 사용하는 예',
          fileName: 'src/components/layout/DashboardHeader/index.tsx',
          language: 'tsx',
          code: `// DashboardHeader - 여러 Context 조합 사용

'use client';

import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Logout, Settings, Person } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// ⭐ 여러 Context 가져오기
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useChangeLocale, useI18n } from '@/lib/i18n/client';

import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { api } from '@/lib/axios';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();

  // ⭐ I18n Context
  const locale = useCurrentLocale();          // 'ko' | 'en' | 'zh' | 'vi'
  const changeLocale = useChangeLocale();     // 로케일 변경 함수
  const t = useI18n();                        // 번역 함수

  // ⭐ Auth Context
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 언어 변경 핸들러
  const handleLanguageChange = async (newLocale: string) => {
    // 즉시 UI 변경 (UX 개선)
    changeLocale(newLocale as 'en' | 'ko' | 'zh' | 'vi');

    // 백엔드에 비동기로 저장
    try {
      await api.put('/user/preferences', { language: newLocale });
    } catch (error) {
      console.error('Failed to save language preference:', error);
      // 로컬에서는 이미 변경됨 - 에러 표시 안함
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await logout();  // AuthContext의 logout 호출
    router.push(\`/\${locale}/login\`);
  };

  // 사용자 이니셜 (한글/영문 구분)
  const getUserInitials = () => {
    const displayName = user?.name_ko || user?.name_en || user?.name || '';
    if (!displayName) return '?';

    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(displayName);
    if (hasKorean) {
      return displayName.substring(0, 1);  // 한글: 1글자
    } else {
      return displayName.substring(0, 2).toUpperCase();  // 영문: 2글자
    }
  };

  const displayName = user?.name_ko || user?.name_en || user?.name || '';

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          aria-label={t('header.toggleMenu')}  // ⭐ 번역 사용
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('common.appName')}  {/* ⭐ 번역 사용 */}
        </Typography>

        <Avatar sx={{ width: 32, height: 32 }}>
          {getUserInitials()}
        </Avatar>

        <Menu anchorEl={anchorEl} open={open}>
          {/* 프로필 */}
          <MenuItem onClick={() => router.push(\`/\${locale}/dashboard/settings\`)}>
            <Person fontSize="small" />
            {t('header.profile')}  {/* ⭐ 번역 사용 */}
          </MenuItem>

          {/* 언어 선택 */}
          <Typography variant="caption" sx={{ px: 2 }}>
            {t('header.language')}
          </Typography>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={locale === lang.code}
            >
              {lang.nativeName}
            </MenuItem>
          ))}

          {/* 로그아웃 */}
          <MenuItem onClick={handleLogout}>
            <Logout fontSize="small" color="error" />
            {t('header.logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}`
        }
      ],
      tips: [
        '✅ 특화된 Hook을 만들면 Context의 일부만 사용하는 컴포넌트 설계가 쉬워집니다.',
        '✅ 여러 Context를 조합할 때는 각 Context의 로딩 상태를 모두 확인하세요.',
        '⚠️ Context 값이 undefined일 때의 처리를 항상 고려하세요.',
        'ℹ️ useContext는 가장 가까운 상위 Provider의 값을 반환합니다.'
      ]
    },
    {
      id: 'context-performance',
      title: 'Context Performance Optimization',
      titleKo: 'Context 성능 최적화',
      content: `
## Context의 성능 특성

Context는 **값이 변경되면 모든 소비자가 리렌더링**됩니다.

### 리렌더링 문제

\`\`\`tsx
// ❌ 문제: 모든 소비자가 불필요하게 리렌더링

const AppContext = createContext({
  user: null,
  theme: 'light',
  notifications: [],
  settings: {}
});

// theme만 변경되어도 user, notifications, settings를 사용하는
// 모든 컴포넌트가 리렌더링됨
\`\`\`

### 해결 전략

#### 1. Context 분리

\`\`\`tsx
// ✅ 관심사별로 Context 분리

// 인증 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 테마 Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 알림 Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 설정 Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
\`\`\`

#### 2. 상태와 디스패치 분리

\`\`\`tsx
// 상태 Context
const TodoStateContext = createContext<Todo[]>([]);

// 액션 Context (변경되지 않음)
const TodoDispatchContext = createContext<Dispatch | null>(null);

function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  return (
    <TodoStateContext.Provider value={todos}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

// 읽기만 하는 컴포넌트
function TodoList() {
  const todos = useContext(TodoStateContext);  // 상태 변경 시 리렌더링
  return <ul>{todos.map(...)}</ul>;
}

// 쓰기만 하는 컴포넌트
function AddTodoButton() {
  const dispatch = useContext(TodoDispatchContext);  // 리렌더링 안됨!
  return <button onClick={() => dispatch({ type: 'ADD' })}>Add</button>;
}
\`\`\`

#### 3. value 객체 메모이제이션

\`\`\`tsx
// ❌ 매 렌더링마다 새 객체 생성
function BadProvider({ children }) {
  const [count, setCount] = useState(0);

  return (
    <MyContext.Provider value={{ count, setCount }}>
      {children}
    </MyContext.Provider>
  );
}

// ✅ useMemo로 안정화
function GoodProvider({ children }) {
  const [count, setCount] = useState(0);

  const value = useMemo(() => ({
    count,
    setCount
  }), [count]);  // count가 변경될 때만 새 객체

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}
\`\`\`

### Context 분리 기준

| 기준 | 설명 | 예시 |
|------|------|------|
| **변경 빈도** | 자주 변경되는 값 분리 | 알림 카운트 vs 사용자 정보 |
| **사용 범위** | 특정 영역에서만 사용 | 모달 상태 vs 전역 테마 |
| **데이터 관계** | 관련 있는 데이터 함께 | user + permissions |
| **의존성** | 의존하는 Context 고려 | Auth → Permission 순서 |
      `,
      codeExamples: [
        {
          id: 'menu-context-optimized',
          title: 'MenuContext - 최적화된 Context',
          description: 'useMemo와 useCallback으로 최적화된 MenuContext',
          fileName: 'src/contexts/MenuContext.tsx',
          language: 'tsx',
          code: `// MenuContext - 최적화된 Context 구현

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MenuItem } from '@/types/menu';
import { api } from '@/lib/axios';
import { useAuth } from './AuthContext';

interface MenuContextType {
  menus: MenuItem[];
  currentMenu: MenuItem | null;
  favoriteMenus: MenuItem[];
  recentMenus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  fetchMenus: () => Promise<void>;
  getMenuByPath: (path: string) => Promise<MenuItem | null>;
  addToFavorites: (menuId: string) => Promise<void>;
  removeFromFavorites: (menuId: string) => Promise<void>;
  isFavorite: (menuId: string) => boolean;
  refreshMenus: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  // 상태들
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [currentMenu, setCurrentMenu] = useState<MenuItem | null>(null);
  const [favoriteMenus, setFavoriteMenus] = useState<MenuItem[]>([]);
  const [recentMenus, setRecentMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ useRef로 중복 요청 방지
  const lastFetchedPathRef = useRef<string>('');
  const isFetchingByPathRef = useRef<boolean>(false);

  // ⭐ useCallback으로 함수 안정화
  const fetchMenus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setMenus([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get('/menu/user-menus');
      setMenus(response.menus || []);
      setError(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to fetch menus');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // ⭐ 중복 요청 방지 패턴
  const getMenuByPath = useCallback(async (path: string): Promise<MenuItem | null> => {
    // 같은 경로 재요청 방지
    if (path === lastFetchedPathRef.current) {
      return null;
    }

    // 동시 요청 방지
    if (isFetchingByPathRef.current) {
      return null;
    }

    try {
      isFetchingByPathRef.current = true;
      lastFetchedPathRef.current = path;

      const response = await api.get('/menu/by-path', { params: { path } });
      const menu = response.menu || null;
      setCurrentMenu(menu);
      return menu;
    } catch (err) {
      console.error('Error fetching menu by path:', err);
      lastFetchedPathRef.current = '';  // 에러 시 리셋
      return null;
    } finally {
      isFetchingByPathRef.current = false;
    }
  }, []);  // ⭐ 빈 의존성 배열 - 함수 안정화

  // ⭐ 파생 함수도 useCallback으로
  const isFavorite = useCallback((menuId: string) => {
    return favoriteMenus.some((menu) => menu.id === menuId);
  }, [favoriteMenus]);

  // ⭐ useMemo로 value 객체 안정화
  const value: MenuContextType = useMemo(() => ({
    menus,
    currentMenu,
    favoriteMenus,
    recentMenus,
    isLoading,
    error,
    fetchMenus,
    getMenuByPath,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshMenus: fetchMenus
  }), [
    menus,
    currentMenu,
    favoriteMenus,
    recentMenus,
    isLoading,
    error,
    fetchMenus,
    getMenuByPath,
    isFavorite
  ]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
}`
        },
        {
          id: 'context-split-pattern',
          title: 'Context 분리 패턴',
          description: '상태와 액션을 분리하는 패턴',
          language: 'tsx',
          code: `// Context 분리 패턴 - 상태와 액션 분리

import { createContext, useContext, useReducer, useMemo, useCallback, ReactNode } from 'react';

// 타입 정의
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type TodoAction =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: string }
  | { type: 'DELETE'; id: string };

// ⭐ 상태 Context (자주 변경됨)
const TodoStateContext = createContext<Todo[] | undefined>(undefined);

// ⭐ 액션 Context (거의 변경 안됨)
interface TodoActionsType {
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}
const TodoActionsContext = createContext<TodoActionsType | undefined>(undefined);

// Reducer
function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'ADD':
      return [...state, {
        id: Date.now().toString(),
        text: action.text,
        completed: false
      }];
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case 'DELETE':
      return state.filter(todo => todo.id !== action.id);
    default:
      return state;
  }
}

// ⭐ Provider
export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  // 액션 함수들 (안정화)
  const addTodo = useCallback((text: string) => {
    dispatch({ type: 'ADD', text });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE', id });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: 'DELETE', id });
  }, []);

  // 액션 객체 메모이제이션
  const actions = useMemo(() => ({
    addTodo,
    toggleTodo,
    deleteTodo
  }), [addTodo, toggleTodo, deleteTodo]);

  return (
    <TodoStateContext.Provider value={todos}>
      <TodoActionsContext.Provider value={actions}>
        {children}
      </TodoActionsContext.Provider>
    </TodoStateContext.Provider>
  );
}

// ⭐ 상태 Hook
export function useTodoState() {
  const context = useContext(TodoStateContext);
  if (context === undefined) {
    throw new Error('useTodoState must be used within TodoProvider');
  }
  return context;
}

// ⭐ 액션 Hook
export function useTodoActions() {
  const context = useContext(TodoActionsContext);
  if (context === undefined) {
    throw new Error('useTodoActions must be used within TodoProvider');
  }
  return context;
}

// ⭐ 사용 예시

// 리스트 - 상태가 변경될 때만 리렌더링
function TodoList() {
  const todos = useTodoState();
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

// 입력폼 - 액션만 사용하므로 상태 변경에 리렌더링 안됨!
function AddTodoForm() {
  const { addTodo } = useTodoActions();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}`
        }
      ],
      tips: [
        '✅ 자주 변경되는 값과 안정적인 값(함수 등)을 분리하면 리렌더링 최적화가 됩니다.',
        '✅ Provider의 value는 항상 useMemo로 안정화하세요.',
        '⚠️ Context를 너무 많이 분리하면 관리가 어려워집니다. 균형이 중요.',
        'ℹ️ 매우 자주 변경되는 값(마우스 위치 등)은 Context보다 다른 방법을 고려하세요.'
      ]
    },
    {
      id: 'context-vs-alternatives',
      title: 'Context vs Props vs Global State',
      titleKo: 'Context vs Props vs 전역 상태',
      content: `
## 상태 공유 방법 비교

React에서 컴포넌트 간 상태를 공유하는 방법은 여러 가지입니다.

### 1. Props (Props Drilling)

\`\`\`tsx
// 부모 → 자식으로 직접 전달
function Parent() {
  const [user, setUser] = useState(null);

  return (
    <Child user={user} setUser={setUser} />
  );
}
\`\`\`

| 장점 | 단점 |
|------|------|
| 명시적인 데이터 흐름 | 깊은 중첩 시 번거로움 |
| 타입 안전 | 중간 컴포넌트가 불필요한 props 전달 |
| 추적 용이 | 리팩토링 어려움 |

### 2. Context API

\`\`\`tsx
// Provider로 감싸고 useContext로 접근
function App() {
  return (
    <UserProvider>
      <DeepChild />  {/* 중간 컴포넌트 필요 없음 */}
    </UserProvider>
  );
}

function DeepChild() {
  const { user } = useUser();  // 직접 접근
}
\`\`\`

| 장점 | 단점 |
|------|------|
| Props Drilling 해결 | 값 변경 시 모든 소비자 리렌더링 |
| React 내장 | 복잡한 상태에는 부적합 |
| 설정 간단 | 디버깅 도구 부족 |

### 3. 전역 상태 관리 (Redux, Zustand, Jotai 등)

\`\`\`tsx
// Zustand 예시
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

function AnyComponent() {
  const user = useStore((state) => state.user);
}
\`\`\`

| 장점 | 단점 |
|------|------|
| 선택적 구독 (리렌더링 최적화) | 추가 라이브러리 필요 |
| 강력한 디버깅 도구 | 학습 곡선 |
| 미들웨어 지원 | 보일러플레이트 |
| 서버 상태 관리 (React Query) | 과도한 사용 위험 |

### 결정 트리

\`\`\`
데이터를 공유해야 하는가?
├── NO → 로컬 상태 (useState)
└── YES
    └── 몇 개의 컴포넌트가 사용하는가?
        ├── 2-3개, 가까운 위치 → Props
        └── 많거나 멀리 떨어짐
            └── 자주 변경되는가?
                ├── NO → Context
                └── YES
                    └── 선택적 구독이 필요한가?
                        ├── NO → Context + 최적화
                        └── YES → 전역 상태 라이브러리
\`\`\`

### 실제 프로젝트 사용 패턴

| 데이터 | 솔루션 | 이유 |
|--------|--------|------|
| 인증 상태 | Context (AuthContext) | 변경 빈도 낮음, 앱 전체 필요 |
| 테마/언어 | Context (I18nProvider) | 변경 빈도 매우 낮음 |
| 권한 정보 | Context (PermissionContext) | Auth에 의존, 변경 빈도 낮음 |
| 메뉴 데이터 | Context (MenuContext) | 인증에 의존, 캐싱 필요 |
| 폼 상태 | 로컬 상태 | 특정 컴포넌트에서만 사용 |
| 서버 데이터 | React Query/SWR | 캐싱, 재검증, 에러 처리 |
| UI 상태 (모달) | 로컬 상태 또는 Zustand | 단순하면 로컬, 복잡하면 전역 |
      `,
      codeExamples: [
        {
          id: 'props-vs-context',
          title: 'Props vs Context 비교',
          description: '같은 기능을 두 방식으로 구현',
          language: 'tsx',
          code: `// Props vs Context 비교 예제

// =============================================
// 방법 1: Props Drilling
// =============================================

function AppWithProps() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <Layout user={user} theme={theme}>
      <Sidebar user={user} theme={theme}>
        <UserPanel user={user} setUser={setUser} theme={theme} />
      </Sidebar>
      <Main user={user} theme={theme}>
        <Header user={user} theme={theme} setTheme={setTheme} />
        <Content user={user} theme={theme} />
      </Main>
    </Layout>
  );
}

// 문제점:
// 1. Layout, Sidebar, Main은 user, theme을 사용하지 않지만 전달해야 함
// 2. 새로운 prop 추가 시 모든 중간 컴포넌트 수정 필요
// 3. 코드가 장황해짐

// =============================================
// 방법 2: Context 사용
// =============================================

function AppWithContext() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout>
          <Sidebar>
            <UserPanel />
          </Sidebar>
          <Main>
            <Header />
            <Content />
          </Main>
        </Layout>
      </ThemeProvider>
    </AuthProvider>
  );
}

// UserPanel - 필요한 것만 가져옴
function UserPanel() {
  const { user, updateUser } = useAuth();  // 필요한 것만

  return (
    <div>
      <img src={user?.avatar} />
      <span>{user?.name}</span>
    </div>
  );
}

// Header - 테마 변경 기능
function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      <span>Welcome, {user?.name}</span>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
    </header>
  );
}

// Layout - 아무것도 받지 않아도 됨
function Layout({ children }) {
  return <div className="layout">{children}</div>;
}

// 장점:
// 1. 중간 컴포넌트가 깔끔함
// 2. 필요한 컴포넌트만 Context 사용
// 3. 새로운 기능 추가 시 Provider만 수정`
        },
        {
          id: 'when-to-use-what',
          title: '실제 사용 시나리오',
          description: '각 상황에 맞는 상태 관리 방법',
          language: 'tsx',
          code: `// 상황별 상태 관리 방법 선택

// =============================================
// 시나리오 1: 부모-자식 간 단순 데이터 전달
// → Props 사용
// =============================================

function ParentComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Display count={count} />
      <Controls onIncrement={() => setCount(c => c + 1)} />
    </div>
  );
}

// =============================================
// 시나리오 2: 인증 상태 (앱 전체, 변경 빈도 낮음)
// → Context 사용
// =============================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================
// 시나리오 3: 서버 데이터 페칭 (캐싱, 재검증 필요)
// → React Query 또는 SWR 사용
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserList() {
  // 자동 캐싱, 재검증, 에러 처리
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers()
  });

  const queryClient = useQueryClient();

  // 뮤테이션 후 자동 캐시 무효화
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  if (isLoading) return <Loading />;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name}
          <button onClick={() => deleteMutation.mutate(user.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

// =============================================
// 시나리오 4: 빈번한 UI 상태 (선택적 구독 필요)
// → Zustand 사용
// =============================================

import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  modalStack: [],
  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen
  })),
  openModal: (id) => set((state) => ({
    modalStack: [...state.modalStack, id]
  }))
}));

// 사이드바 토글 버튼 - sidebarOpen만 구독
function SidebarToggle() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  // sidebarOpen 변경에 리렌더링 안됨!
  return <button onClick={toggleSidebar}>Toggle</button>;
}

// 사이드바 - sidebarOpen만 구독
function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  // modalStack 변경에 리렌더링 안됨!
  return (
    <aside style={{ width: sidebarOpen ? 240 : 0 }}>
      <nav>...</nav>
    </aside>
  );
}`
        }
      ],
      tips: [
        '✅ 가장 단순한 방법부터 시작하세요: 로컬 상태 → Props → Context → 전역 상태',
        '✅ 서버 상태는 React Query/SWR 같은 전용 라이브러리가 더 적합합니다.',
        '⚠️ Context는 "전역 상태 관리자"가 아닙니다. 변경 빈도가 낮은 데이터에 적합.',
        'ℹ️ 대부분의 앱은 Context + React Query 조합으로 충분합니다.'
      ]
    },
    {
      id: 'best-practices',
      title: 'Context Best Practices',
      titleKo: 'Context 베스트 프랙티스',
      content: `
## Context 베스트 프랙티스

### 1. 타입 안전성 확보

\`\`\`tsx
// ✅ undefined 기본값 + 커스텀 훅 에러 처리
const MyContext = createContext<MyContextType | undefined>(undefined);

export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;  // 타입이 MyContextType으로 확정
}
\`\`\`

### 2. Provider 값 안정화

\`\`\`tsx
// ✅ useCallback + useMemo 조합
function MyProvider({ children }) {
  const [state, setState] = useState(initialState);

  const action1 = useCallback(() => { ... }, []);
  const action2 = useCallback(() => { ... }, []);

  const value = useMemo(() => ({
    state,
    action1,
    action2
  }), [state, action1, action2]);

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}
\`\`\`

### 3. Context 분리 기준

| 분리하면 좋은 경우 | 합치면 좋은 경우 |
|------------------|-----------------|
| 변경 빈도가 다름 | 항상 함께 사용됨 |
| 서로 독립적 | 서로 의존적 |
| 다른 Provider에서 사용 | 같은 데이터 소스 |

### 4. 파일 구조

\`\`\`
src/
├── contexts/
│   ├── AuthContext.tsx        # Context + Provider + Hook
│   ├── PermissionContext.tsx
│   └── MenuContext.tsx
├── components/
│   └── providers/
│       └── ClientProviders.tsx  # Provider 조합
└── hooks/
    └── usePermissionControl.ts  # Context 기반 유틸리티 훅
\`\`\`

### 5. 네이밍 컨벤션

| 항목 | 네이밍 | 예시 |
|------|--------|------|
| Context | PascalCase + Context | AuthContext |
| Provider | PascalCase + Provider | AuthProvider |
| Hook | use + Context명 | useAuth |
| 특화 Hook | use + 도메인명 + 기능 | useProgramPermissions |

### 6. 초기 로딩 상태 처리

\`\`\`tsx
function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true  // ✅ 초기에 true
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await checkAuthStatus();
        setAuthState({
          user,
          isAuthenticated: !!user,
          isLoading: false
        });
      } catch {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };
    initAuth();
  }, []);

  // ...
}

// 사용하는 곳에서 로딩 처리
function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Redirect to="/login" />;

  return <SecureContent />;
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'context-checklist',
          title: 'Context 체크리스트',
          description: 'Context 구현 시 확인할 항목',
          language: 'tsx',
          code: `// Context 구현 체크리스트

// ✅ 1. 타입 정의
interface MyContextType {
  // 상태
  data: Data[];
  loading: boolean;
  error: string | null;

  // 액션
  fetchData: () => Promise<void>;
  updateItem: (id: string, updates: Partial<Data>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

// ✅ 2. undefined 기본값으로 Context 생성
const MyContext = createContext<MyContextType | undefined>(undefined);

// ✅ 3. Provider 구현
export function MyProvider({ children }: { children: ReactNode }) {
  // 상태
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 4. useCallback으로 액션 안정화
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<Data>) => {
    try {
      const updated = await api.updateItem(id, updates);
      setData(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;  // 호출자가 처리할 수 있도록
    }
  }, []);

  // ✅ 5. useMemo로 value 안정화
  const value = useMemo(() => ({
    data,
    loading,
    error,
    fetchData,
    updateItem,
    deleteItem
  }), [data, loading, error, fetchData, updateItem, deleteItem]);

  // ✅ 6. 초기 데이터 로드
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// ✅ 7. 안전한 Hook
export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}

// ✅ 8. 특화 Hook (선택적)
export function useMyData() {
  const { data, loading, error } = useMyContext();
  return { data, loading, error };
}

export function useMyActions() {
  const { fetchData, updateItem, deleteItem } = useMyContext();
  return { fetchData, updateItem, deleteItem };
}`
        },
        {
          id: 'project-context-summary',
          title: '프로젝트 Context 구조 요약',
          description: '실제 프로젝트의 Context 아키텍처',
          language: 'tsx',
          code: `// 프로젝트 Context 구조 요약

// ═══════════════════════════════════════════
// 📁 src/contexts/ - Context 정의
// ═══════════════════════════════════════════

// AuthContext.tsx
// - 인증 상태 관리 (user, token, isAuthenticated)
// - 로그인/로그아웃/토큰 갱신 기능
// - localStorage 연동
export { AuthProvider, useAuth };

// PermissionContext.tsx
// - 프로그램별 권한 관리 (CRUD)
// - AuthContext 의존 (user 필요)
// - Map으로 권한 캐싱
export { PermissionProvider, usePermissions, useProgramPermissions };

// MenuContext.tsx
// - 사용자 메뉴 관리
// - 즐겨찾기, 최근 메뉴
// - AuthContext 의존
export { MenuProvider, useMenuContext };

// ═══════════════════════════════════════════
// 📁 src/lib/i18n/ - 다국어 Context
// ═══════════════════════════════════════════

// client.ts (next-international)
export {
  I18nProviderClient,  // Provider
  useI18n,             // 번역 함수 t()
  useCurrentLocale,    // 현재 로케일
  useChangeLocale      // 로케일 변경
};

// ═══════════════════════════════════════════
// 📁 Provider 중첩 구조
// ═══════════════════════════════════════════

<I18nProviderClient locale={locale}>      {/* 1. 언어 (최상위) */}
  <ThemeProvider theme={lightTheme}>       {/* 2. 테마 */}
    <AuthProvider>                         {/* 3. 인증 */}
      <PermissionProvider>                 {/* 4. 권한 (Auth 의존) */}
        <MenuProvider>                     {/* 5. 메뉴 (Auth 의존) */}
          <App />
        </MenuProvider>
      </PermissionProvider>
    </AuthProvider>
  </ThemeProvider>
</I18nProviderClient>

// ═══════════════════════════════════════════
// 사용 패턴
// ═══════════════════════════════════════════

// 1. 인증이 필요한 컴포넌트
function ProtectedComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  // ...
}

// 2. 권한 체크가 필요한 컴포넌트
function AdminComponent() {
  const { canCreate, canDelete } = useProgramPermissions('PROG-USER-LIST');
  // ...
}

// 3. 다국어 지원
function LocalizedComponent() {
  const t = useI18n();
  const locale = useCurrentLocale();
  // ...
}

// 4. 여러 Context 조합
function ComplexComponent() {
  const { user } = useAuth();
  const { canView } = useProgramPermissions('PROG-DASHBOARD');
  const { menus } = useMenuContext();
  const t = useI18n();
  // ...
}`
        }
      ],
      tips: [
        '✅ Context + Hook 패턴으로 타입 안전하고 사용하기 쉬운 API를 만드세요.',
        '✅ Provider 값은 항상 useMemo와 useCallback으로 안정화하세요.',
        '✅ 로딩/에러 상태를 항상 포함하고, 소비자에서 적절히 처리하세요.',
        '⚠️ Context가 너무 많으면 관리가 어렵습니다. 관련 데이터는 하나로 묶으세요.',
        'ℹ️ 서버 상태는 Context보다 React Query/SWR이 더 적합합니다.'
      ]
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - Passing Data Deeply with Context',
      url: 'https://react.dev/learn/passing-data-deeply-with-context',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - useContext',
      url: 'https://react.dev/reference/react/useContext',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - Scaling Up with Reducer and Context',
      url: 'https://react.dev/learn/scaling-up-with-reducer-and-context',
      type: 'documentation'
    },
    {
      title: 'Kent C. Dodds - How to use React Context effectively',
      url: 'https://kentcdodds.com/blog/how-to-use-react-context-effectively',
      type: 'article'
    }
  ],
  status: 'ready'
};

export default chapter;
