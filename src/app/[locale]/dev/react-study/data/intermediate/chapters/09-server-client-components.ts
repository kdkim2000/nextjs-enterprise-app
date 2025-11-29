/**
 * Chapter 9: Server vs Client Components
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'server-client-components',
  order: 9,
  title: 'Server vs Client Components',
  titleKo: 'Server vs Client Components',
  description: 'Understand the difference between Server and Client Components in Next.js.',
  descriptionKo: 'Next.js에서 Server Component와 Client Component의 차이를 이해합니다.',
  estimatedMinutes: 45,
  objectives: [
    'Understand use client directive',
    'Learn Server Component principles',
    'Design component boundaries effectively',
    'Apply streaming and Suspense'
  ],
  objectivesKo: [
    "'use client' 지시어를 이해한다",
    'Server Component 원칙을 학습한다',
    '컴포넌트 경계를 효과적으로 설계한다',
    'Streaming과 Suspense를 적용한다'
  ],
  sections: [
    // ============================================
    // Section 1: 'use client' 지시어
    // ============================================
    {
      id: 'use-client-directive',
      title: "'use client' 지시어",
      titleKo: "'use client' 지시어",
      content: `
## 'use client' 지시어란?

Next.js App Router에서 **모든 컴포넌트는 기본적으로 Server Component**입니다.
Client Component로 만들려면 파일 최상단에 \`'use client'\` 지시어를 추가해야 합니다.

\`\`\`tsx
// ✅ Client Component
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

\`\`\`tsx
// ✅ Server Component (기본값 - 지시어 없음)
export default function UserList() {
  // 서버에서 데이터를 직접 가져올 수 있음
  return <div>Users...</div>;
}
\`\`\`

## 'use client'가 필요한 경우

다음 기능을 사용할 때는 반드시 Client Component가 필요합니다:

| 기능 | 예시 |
|------|------|
| **React Hooks** | useState, useEffect, useContext 등 |
| **이벤트 핸들러** | onClick, onChange, onSubmit 등 |
| **브라우저 API** | localStorage, window, document |
| **상호작용** | 폼 입력, 토글, 애니메이션 |
| **클라이언트 라이브러리** | MUI, Framer Motion 등 |

## 경계(Boundary)의 의미

\`'use client'\`는 **경계**를 만듭니다.
이 컴포넌트와 그 자식들은 모두 클라이언트에서 렌더링됩니다.

\`\`\`
Server Component (기본)
    │
    ├── Server Component
    │
    └── 'use client' ← 경계
            │
            ├── Client Component (자동)
            │
            └── Client Component (자동)
\`\`\`

## 잘못된 사용 예

\`\`\`tsx
// ❌ 잘못됨: 'use client'가 import 뒤에 있음
import { useState } from 'react';
'use client';  // 에러!

// ❌ 잘못됨: 함수 내부에 있음
export default function App() {
  'use client';  // 에러!
}
\`\`\`

\`'use client'\`는 반드시 **파일 최상단, import 문 이전**에 위치해야 합니다.
`,
      codeExamples: [
        {
          id: 'client-providers',
          title: '프로젝트 예제: ClientProviders',
          description: '여러 Provider를 묶어 Client Component로 만든 예제입니다. 모든 하위 컴포넌트가 클라이언트 기능을 사용할 수 있게 됩니다.',
          language: 'tsx',
          fileName: 'src/components/providers/ClientProviders.tsx',
          code: `'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nProviderClient } from '@/lib/i18n/client';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { MenuProvider } from '@/contexts/MenuContext';
import { lightTheme } from '@/theme';
import { ToastContainer } from 'react-toastify';

export function ClientProviders({
  children,
  locale
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <I18nProviderClient locale={locale}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <AuthProvider>
          <PermissionProvider>
            <MenuProvider>
              {children}
              <ToastContainer position="top-right" />
            </MenuProvider>
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProviderClient>
  );
}`
        },
        {
          id: 'dashboard-page',
          title: '프로젝트 예제: Dashboard Page',
          description: "Hook과 이벤트 핸들러를 사용하므로 'use client'가 필요합니다.",
          language: 'tsx',
          fileName: 'src/app/[locale]/dashboard/page.tsx',
          code: `'use client';

import React from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import { useI18n } from '@/lib/i18n/client';  // Hook 사용

export default function DashboardPage() {
  const t = useI18n();  // 클라이언트 Hook

  const stats = [
    { title: t('dashboard.totalUsers'), value: '1,234' },
    { title: t('dashboard.reports'), value: '89' }
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Typography>{stat.title}</Typography>
              <Typography variant="h4">{stat.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}`
        }
      ],
      tips: [
        "'use client'는 파일 맨 첫 줄에 작성합니다. 주석도 그 위에 있으면 안 됩니다.",
        "Server Component에서 Client Component를 import해서 사용하는 것은 가능합니다.",
        "가능한 'use client' 경계를 아래로 내려서 더 많은 코드가 서버에서 실행되게 하세요."
      ]
    },

    // ============================================
    // Section 2: Server Component 기본 원칙
    // ============================================
    {
      id: 'server-component-principles',
      title: 'Server Component 기본 원칙',
      titleKo: 'Server Component 기본 원칙',
      content: `
## Server Component란?

Server Component는 **서버에서만 렌더링**되는 컴포넌트입니다.
HTML이 생성되어 클라이언트로 전송되므로 JavaScript 번들 크기가 줄어듭니다.

## Server Component의 장점

### 1. JavaScript 번들 감소
\`\`\`tsx
// Server Component에서 사용하는 라이브러리
import { format } from 'date-fns';
import { marked } from 'marked';

// 이 라이브러리들은 클라이언트로 전송되지 않음!
export default function Article({ content }) {
  return <div>{marked(content)}</div>;
}
\`\`\`

### 2. 서버 리소스 직접 접근
\`\`\`tsx
// 데이터베이스 직접 쿼리 가능
import { db } from '@/lib/database';

export default async function UserProfile({ userId }) {
  const user = await db.user.findUnique({ where: { id: userId } });
  return <div>{user.name}</div>;
}
\`\`\`

### 3. 보안 강화
\`\`\`tsx
// API 키가 클라이언트에 노출되지 않음
const API_KEY = process.env.SECRET_API_KEY;

export default async function Data() {
  const res = await fetch('https://api.example.com', {
    headers: { 'Authorization': API_KEY }
  });
  // ...
}
\`\`\`

## Server Component에서 할 수 없는 것

| 불가능한 기능 | 이유 |
|--------------|------|
| useState, useEffect | React 상태는 클라이언트 개념 |
| onClick 등 이벤트 | 이벤트는 브라우저에서 발생 |
| localStorage, window | 서버에는 브라우저 API 없음 |
| useRouter (navigation) | 클라이언트 라우터 기능 |

## Server Component vs Client Component 비교

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Server Component                          │
├─────────────────────────────────────────────────────────────┤
│  ✅ async/await 직접 사용                                    │
│  ✅ 데이터베이스/파일시스템 직접 접근                          │
│  ✅ API 키, 비밀 정보 안전하게 사용                           │
│  ✅ 큰 의존성이 번들에 포함되지 않음                          │
│  ❌ Hook, 이벤트 핸들러, 브라우저 API 사용 불가                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Client Component                          │
├─────────────────────────────────────────────────────────────┤
│  ✅ useState, useEffect 등 모든 Hook 사용                    │
│  ✅ onClick, onChange 등 이벤트 처리                         │
│  ✅ localStorage, window 등 브라우저 API                     │
│  ✅ 상호작용이 필요한 UI 구현                                 │
│  ❌ 서버 리소스 직접 접근 불가                                │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 렌더링 흐름 이해

\`\`\`
[서버]                              [클라이언트]
   │                                     │
   │  1. Server Component 렌더링          │
   │     (HTML + RSC Payload)            │
   │  ─────────────────────────────────► │
   │                                     │
   │                                     │  2. HTML 표시 (빠른 초기 로딩)
   │                                     │
   │  3. Client Component JS 전송         │
   │  ─────────────────────────────────► │
   │                                     │
   │                                     │  4. Hydration (상호작용 활성화)
   │                                     │
\`\`\`
`,
      codeExamples: [
        {
          id: 'server-locale-layout',
          title: '프로젝트 예제: Server Component Layout',
          description: "locale 파라미터를 받아 Server Component로 처리합니다. 'use client' 없이 async/await를 사용합니다.",
          language: 'tsx',
          fileName: 'src/app/[locale]/layout.tsx',
          code: `// 'use client' 없음 = Server Component
import React from 'react';
import { ClientProviders } from '@/components/providers/ClientProviders';

// Server Component에서 정적 파라미터 생성
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ko' }];
}

// async 함수로 params 처리 - Server Component만 가능
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // await 사용 - Server Component의 특징
  const { locale } = await params;

  // Server Component에서 Client Component로 데이터 전달
  return <ClientProviders locale={locale}>{children}</ClientProviders>;
}`
        },
        {
          id: 'server-data-fetching',
          title: '서버에서 데이터 가져오기',
          description: 'Server Component에서 직접 async/await로 데이터를 가져오는 패턴입니다.',
          language: 'tsx',
          code: `// Server Component - 데이터 직접 페칭
import { db } from '@/lib/database';

// 이 함수는 서버에서만 실행됨
async function getUsers() {
  // 데이터베이스 직접 쿼리
  return await db.user.findMany({
    select: { id: true, name: true, email: true }
  });
}

export default async function UsersPage() {
  // await 직접 사용
  const users = await getUsers();

  return (
    <div>
      <h1>사용자 목록</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}`
        }
      ],
      tips: [
        "Server Component는 브라우저로 JavaScript가 전송되지 않아 성능상 이점이 큽니다.",
        "민감한 데이터(API 키 등)는 반드시 Server Component에서 처리하세요.",
        "Server Component에서 console.log를 찍으면 브라우저가 아닌 서버 터미널에 출력됩니다."
      ]
    },

    // ============================================
    // Section 3: 컴포넌트 경계 설계
    // ============================================
    {
      id: 'component-boundary-design',
      title: '컴포넌트 경계 설계',
      titleKo: '컴포넌트 경계 설계',
      content: `
## 경계 설계가 중요한 이유

잘못된 경계 설계는 불필요하게 많은 코드가 클라이언트로 전송되게 합니다.
\`'use client'\` 경계를 **최대한 아래로 내리는 것**이 핵심 전략입니다.

## 패턴 1: Provider는 최상위에서 한 번만

\`\`\`tsx
// ❌ 안 좋음: 모든 페이지에서 'use client'
'use client';
export default function Page() {
  const theme = useTheme();  // Provider 필요
  return <div>...</div>;
}

// ✅ 좋음: Layout에서 Provider 래핑
// layout.tsx (Server Component)
export default function Layout({ children }) {
  return <ClientProviders>{children}</ClientProviders>;
}

// ClientProviders.tsx (Client Component)
'use client';
export function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
\`\`\`

## 패턴 2: 상호작용 부분만 분리

페이지의 대부분이 정적이고 일부만 상호작용이 필요할 때:

\`\`\`tsx
// page.tsx (Server Component)
export default function ProductPage({ product }) {
  return (
    <div>
      {/* 정적 콘텐츠 - 서버에서 렌더링 */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <img src={product.image} alt={product.name} />

      {/* 상호작용 필요 - 작은 Client Component */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// AddToCartButton.tsx (Client Component)
'use client';
export function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await addToCart(productId);
    setLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? '추가 중...' : '장바구니에 추가'}
    </button>
  );
}
\`\`\`

## 패턴 3: Server Component를 children으로 전달

Client Component에서 Server Component를 직접 import하면
그 Server Component도 클라이언트 번들에 포함됩니다.
대신 children이나 props로 전달하면 됩니다.

\`\`\`tsx
// ❌ 안 좋음: Client Component에서 Server Component import
'use client';
import ServerComponent from './ServerComponent';  // 서버 코드가 클라이언트로!

export function ClientWrapper() {
  return <ServerComponent />;
}

// ✅ 좋음: children으로 전달
// page.tsx (Server Component)
export default function Page() {
  return (
    <ClientWrapper>
      <ServerComponent />  {/* 서버에서 렌더링됨 */}
    </ClientWrapper>
  );
}

// ClientWrapper.tsx
'use client';
export function ClientWrapper({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && children}  {/* Server Component 렌더링 결과를 받음 */}
    </div>
  );
}
\`\`\`

## 프로젝트의 경계 설계

\`\`\`
app/[locale]/layout.tsx (Server)
    │
    └── ClientProviders (Client) ← 경계
            │
            ├── ThemeProvider
            ├── AuthProvider
            ├── PermissionProvider
            └── MenuProvider
                    │
                    └── {children}
                            │
                            ├── dashboard/layout.tsx (Client)
                            │       └── AuthenticatedLayout
                            │
                            └── admin/layout.tsx (Client)
                                    └── AuthenticatedLayout
\`\`\`
`,
      codeExamples: [
        {
          id: 'authenticated-layout',
          title: '프로젝트 예제: AuthenticatedLayout',
          description: '인증이 필요한 페이지들을 감싸는 Client Component입니다. useAuth Hook 사용으로 클라이언트 경계가 됩니다.',
          language: 'tsx',
          fileName: 'src/components/layout/AuthenticatedLayout/index.tsx',
          code: `'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale } from '@/lib/i18n/client';
import DashboardHeader from '@/components/layout/DashboardHeader';
import Sidebar from '@/components/layout/Sidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'manager' | 'user';
  fullBleed?: boolean;
}

export default function AuthenticatedLayout({
  children,
  requireRole,
  fullBleed = false
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // 클라이언트에서 인증 확인
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(\`/\${locale}/login\`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  if (isLoading || !isAuthenticated) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <DashboardHeader onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar expanded={sidebarExpanded} />
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}`
        },
        {
          id: 'layout-boundary',
          title: '프로젝트 예제: Layout 경계 설계',
          description: 'Server Component인 locale layout이 Client Component를 감싸는 구조입니다.',
          language: 'tsx',
          code: `// 1. app/[locale]/layout.tsx - Server Component
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  // Server에서 locale 처리 후 Client로 전달
  return <ClientProviders locale={locale}>{children}</ClientProviders>;
}

// 2. app/[locale]/dashboard/layout.tsx - Client Component
'use client';
export default function DashboardLayout({ children }) {
  // 인증이 필요하므로 Client Component
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}

// 3. app/[locale]/admin/layout.tsx - Client Component
'use client';
export default function AdminLayout({ children }) {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}`
        }
      ],
      tips: [
        "'use client' 경계는 최대한 leaf(말단) 컴포넌트에 가깝게 설정하세요.",
        "정적 콘텐츠가 많은 페이지에서 상호작용 부분만 작은 Client Component로 분리하면 성능이 크게 향상됩니다.",
        "Server Component의 렌더링 결과를 children으로 Client Component에 전달하는 패턴을 적극 활용하세요."
      ]
    },

    // ============================================
    // Section 4: 데이터 페칭 전략
    // ============================================
    {
      id: 'data-fetching-strategies',
      title: '데이터 페칭 전략',
      titleKo: '데이터 페칭 전략',
      content: `
## Server Component에서의 데이터 페칭

Server Component의 가장 큰 장점은 **async/await를 직접 사용**할 수 있다는 것입니다.

\`\`\`tsx
// Server Component
export default async function PostsPage() {
  // 직접 await - useEffect 불필요!
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json());

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Client Component에서의 데이터 페칭

Client Component에서는 전통적인 useEffect 또는 SWR/React Query를 사용합니다.

\`\`\`tsx
'use client';

import { useState, useEffect } from 'react';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return <ul>{posts.map(post => <li key={post.id}>{post.title}</li>)}</ul>;
}
\`\`\`

## 권장 패턴: Server에서 페칭, Client에서 상호작용

\`\`\`tsx
// page.tsx (Server Component)
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function Page() {
  const posts = await getPosts();  // 서버에서 데이터 가져옴

  return (
    <div>
      <h1>게시글</h1>
      {/* 데이터를 Client Component에 전달 */}
      <PostList initialPosts={posts} />
    </div>
  );
}

// PostList.tsx (Client Component)
'use client';

export function PostList({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState('');

  const filteredPosts = posts.filter(p =>
    p.title.includes(filter)
  );

  return (
    <>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="검색..."
      />
      <ul>
        {filteredPosts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </>
  );
}
\`\`\`

## fetch 캐싱 옵션

Next.js에서 fetch는 자동 캐싱됩니다:

\`\`\`tsx
// 기본: 캐시됨 (정적)
fetch('https://api.example.com/data');

// 매 요청마다 새로 가져옴
fetch('https://api.example.com/data', { cache: 'no-store' });

// 일정 시간마다 갱신
fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }  // 1시간마다
});

// 태그로 수동 갱신
fetch('https://api.example.com/data', {
  next: { tags: ['posts'] }
});
\`\`\`

## Server Actions로 데이터 수정

Server Actions를 사용하면 클라이언트에서 서버 함수를 직접 호출할 수 있습니다:

\`\`\`tsx
// actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.post.create({ data: { title } });
  revalidatePath('/posts');
}

// page.tsx
import { createPost } from './actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">생성</button>
    </form>
  );
}
\`\`\`
`,
      codeExamples: [
        {
          id: 'client-data-fetching',
          title: '프로젝트 예제: AuthContext 데이터 페칭',
          description: 'Client Component에서 API 호출과 localStorage를 활용한 데이터 페칭 패턴입니다.',
          language: 'tsx',
          fileName: 'src/contexts/AuthContext.tsx',
          code: `'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  // 클라이언트에서 localStorage 초기화
  useEffect(() => {
    const initAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, user } = response;

    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    setAuthState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login }}>
      {children}
    </AuthContext.Provider>
  );
}`
        },
        {
          id: 'mixed-fetching',
          title: '하이브리드 데이터 페칭 패턴',
          description: 'Server Component에서 초기 데이터를 가져오고 Client Component에서 상호작용을 처리합니다.',
          language: 'tsx',
          code: `// page.tsx - Server Component
import { BoardList } from './BoardList';

// 서버에서 초기 데이터 가져오기
async function getInitialPosts(boardTypeId: string) {
  const res = await fetch(
    \`\${process.env.API_URL}/posts?boardTypeId=\${boardTypeId}\`,
    { cache: 'no-store' }  // 동적 데이터
  );
  return res.json();
}

export default async function BoardPage({ params }) {
  const { boardTypeId } = await params;
  const initialPosts = await getInitialPosts(boardTypeId);

  return (
    <div>
      <h1>게시판</h1>
      {/* 초기 데이터를 Client Component에 전달 */}
      <BoardList
        boardTypeId={boardTypeId}
        initialPosts={initialPosts}
      />
    </div>
  );
}

// BoardList.tsx - Client Component
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';

export function BoardList({ boardTypeId, initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);

  // 페이지네이션은 클라이언트에서 처리
  const loadMore = async () => {
    const newPosts = await api.get(\`/posts?boardTypeId=\${boardTypeId}&page=\${page + 1}\`);
    setPosts(prev => [...prev, ...newPosts]);
    setPage(prev => prev + 1);
  };

  return (
    <>
      <ul>
        {posts.map(post => <li key={post.id}>{post.title}</li>)}
      </ul>
      <button onClick={loadMore}>더 보기</button>
    </>
  );
}`
        }
      ],
      tips: [
        "Server Component에서 데이터를 가져오면 API 키가 클라이언트에 노출되지 않습니다.",
        "초기 데이터는 Server Component에서, 후속 상호작용은 Client Component에서 처리하는 것이 좋습니다.",
        "fetch의 캐싱 옵션을 적절히 설정하여 성능과 데이터 신선도의 균형을 맞추세요."
      ]
    },

    // ============================================
    // Section 5: Streaming과 Suspense
    // ============================================
    {
      id: 'streaming-and-suspense',
      title: 'Streaming과 Suspense',
      titleKo: 'Streaming과 Suspense',
      content: `
## Streaming이란?

Streaming은 페이지를 **점진적으로 렌더링**하는 기술입니다.
느린 데이터를 기다리지 않고 준비된 부분부터 사용자에게 보여줍니다.

\`\`\`
[전통적 렌더링]
│ 모든 데이터 로딩 완료... │ → 전체 페이지 표시
│        (3초 대기)        │

[Streaming]
│ 헤더 표시 (즉시) │
│ 메인 콘텐츠 표시 (0.5초) │
│ 댓글 표시 (2초) │
│ 추천 표시 (3초) │
\`\`\`

## React Suspense 사용법

\`\`\`tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>게시글</h1>

      {/* 느린 컴포넌트를 Suspense로 감싸기 */}
      <Suspense fallback={<div>댓글 로딩 중...</div>}>
        <Comments />  {/* 느린 데이터 페칭 */}
      </Suspense>

      <Suspense fallback={<div>추천 로딩 중...</div>}>
        <Recommendations />
      </Suspense>
    </div>
  );
}

// 각 컴포넌트는 독립적으로 로딩됨
async function Comments() {
  const comments = await fetchComments();  // 2초 걸림
  return <ul>{comments.map(c => <li key={c.id}>{c.text}</li>)}</ul>;
}

async function Recommendations() {
  const recs = await fetchRecommendations();  // 3초 걸림
  return <ul>{recs.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
\`\`\`

## loading.tsx로 자동 Suspense

Next.js의 \`loading.tsx\` 파일은 자동으로 Suspense 경계를 만듭니다:

\`\`\`
app/
  └── posts/
      ├── loading.tsx    ← page.tsx 로딩 중 표시
      └── page.tsx
\`\`\`

\`\`\`tsx
// loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}
\`\`\`

## Suspense 중첩 전략

\`\`\`tsx
export default function DashboardPage() {
  return (
    <div>
      {/* 외부 Suspense: 전체 대시보드 */}
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard>
          {/* 내부 Suspense: 개별 위젯 */}
          <Suspense fallback={<ChartSkeleton />}>
            <RevenueChart />
          </Suspense>

          <Suspense fallback={<TableSkeleton />}>
            <RecentOrders />
          </Suspense>

          <Suspense fallback={<ListSkeleton />}>
            <TopProducts />
          </Suspense>
        </Dashboard>
      </Suspense>
    </div>
  );
}
\`\`\`

## 병렬 데이터 페칭

여러 데이터를 동시에 가져오면 더 빠릅니다:

\`\`\`tsx
// ❌ 순차적 (느림)
async function Page() {
  const user = await fetchUser();      // 1초
  const posts = await fetchPosts();    // 1초
  const comments = await fetchComments(); // 1초
  // 총 3초
}

// ✅ 병렬 (빠름)
async function Page() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  // 총 1초 (가장 느린 것 기준)
}
\`\`\`

## Streaming + Client Hydration 흐름

\`\`\`
1. 서버에서 HTML 생성 시작
   │
2. 준비된 부분 먼저 전송 (Streaming)
   │
   ├── <header> 즉시 표시
   ├── <main> 0.5초 후 표시
   └── <Suspense> fallback 표시
   │
3. 느린 컴포넌트 완료되면 교체
   │
   └── fallback → 실제 콘텐츠
   │
4. Client Component Hydration
   │
   └── 상호작용 활성화
\`\`\`
`,
      codeExamples: [
        {
          id: 'suspense-pattern',
          title: '대시보드 Suspense 패턴',
          description: '여러 위젯을 독립적으로 로딩하는 Suspense 패턴입니다.',
          language: 'tsx',
          code: `import { Suspense } from 'react';

// 스켈레톤 컴포넌트들
function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
  );
}

// 데이터 페칭 컴포넌트들
async function StatsCard() {
  const stats = await fetchStats();  // 느린 API
  return (
    <div className="p-4 bg-white rounded-lg">
      <h3>총 사용자</h3>
      <p className="text-2xl font-bold">{stats.totalUsers}</p>
    </div>
  );
}

async function RevenueChart() {
  const data = await fetchRevenueData();  // 더 느린 API
  return <Chart data={data} />;
}

// 페이지 컴포넌트
export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1>대시보드</h1>

      {/* 통계 카드들 - 개별 로딩 */}
      <div className="grid grid-cols-4 gap-4">
        <Suspense fallback={<CardSkeleton />}>
          <StatsCard type="users" />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <StatsCard type="orders" />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <StatsCard type="revenue" />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <StatsCard type="growth" />
        </Suspense>
      </div>

      {/* 차트 - 별도 로딩 */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  );
}`
        },
        {
          id: 'loading-file',
          title: 'loading.tsx 예제',
          description: 'Next.js의 loading.tsx 파일을 사용한 자동 Suspense 경계입니다.',
          language: 'tsx',
          fileName: 'app/dashboard/loading.tsx',
          code: `// loading.tsx - page.tsx 로딩 중 자동 표시
import { Box, Skeleton, Grid, Paper } from '@mui/material';

export default function DashboardLoading() {
  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 스켈레톤 */}
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />

      {/* 통계 카드 스켈레톤 */}
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={60} height={32} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 메인 컨텐츠 스켈레톤 */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Skeleton variant="rectangular" height="100%" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Skeleton variant="rectangular" height="100%" />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}`
        }
      ],
      tips: [
        "Suspense는 Server Component에서만 실제 스트리밍 효과를 냅니다. Client Component에서는 동기적으로 로딩됩니다.",
        "loading.tsx를 사용하면 별도의 Suspense 래핑 없이도 자동으로 로딩 상태를 처리할 수 있습니다.",
        "독립적인 데이터를 가져오는 컴포넌트들은 각각 Suspense로 감싸서 병렬 로딩하세요.",
        "Promise.all을 사용하면 여러 데이터를 동시에 가져와서 총 로딩 시간을 줄일 수 있습니다."
      ]
    },

    // ============================================
    // Section 6: 실전 렌더링 전략
    // ============================================
    {
      id: 'practical-rendering-strategy',
      title: '실전 렌더링 전략',
      titleKo: '실전 렌더링 전략',
      content: `
## 페이지 유형별 렌더링 전략

### 1. 정적 콘텐츠 페이지 (마케팅, 블로그)

\`\`\`tsx
// 완전 Server Component - 상호작용 없음
export default async function AboutPage() {
  const content = await fetchCMSContent('about');

  return (
    <article>
      <h1>{content.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content.body }} />
    </article>
  );
}
\`\`\`

### 2. 대시보드 (인증 + 실시간 데이터)

\`\`\`tsx
// Layout: Client (인증 체크)
// Page: Client (실시간 상호작용)
'use client';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  return <DashboardGrid stats={stats} />;
}
\`\`\`

### 3. 게시판 (목록 + 상세 + 작성)

\`\`\`tsx
// 목록: Server로 초기 데이터, Client로 필터/페이징
// 상세: Server (SEO 중요)
// 작성/수정: Client (폼 상호작용)
\`\`\`

## 프로젝트 렌더링 전략 분석

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ app/[locale]/layout.tsx                                     │
│ 타입: Server Component                                       │
│ 이유: locale 파라미터 처리, 정적 생성                         │
│                                                             │
│   └── ClientProviders.tsx                                   │
│       타입: Client Component                                 │
│       이유: Theme, Auth, i18n Provider들이 Context 사용       │
│                                                             │
│         └── dashboard/layout.tsx                            │
│             타입: Client Component                           │
│             이유: useAuth로 인증 체크, useRouter 사용          │
│                                                             │
│               └── dashboard/page.tsx                        │
│                   타입: Client Component                     │
│                   이유: useI18n Hook, 동적 데이터 표시         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ boards/[boardTypeId]/page.tsx                               │
│ 타입: Client Component                                       │
│ 이유: useParams, 목록 필터링, 페이지네이션 상호작용            │
│                                                             │
│   └── boards/[boardTypeId]/[postId]/page.tsx                │
│       타입: Client Component                                 │
│       이유: 댓글 작성, 좋아요 등 상호작용 필요                  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 최적화 체크리스트

### Server Component 사용이 적합한 경우
- [ ] 데이터 페칭만 하고 상호작용 없음
- [ ] SEO가 중요한 페이지
- [ ] 큰 라이브러리를 사용하지만 클라이언트 필요 없음
- [ ] 민감한 데이터(API 키 등) 사용

### Client Component 사용이 적합한 경우
- [ ] useState, useEffect 등 Hook 사용
- [ ] onClick, onChange 등 이벤트 핸들링
- [ ] localStorage, sessionStorage 접근
- [ ] 실시간 업데이트가 필요한 UI

### 하이브리드 접근이 적합한 경우
- [ ] 정적 레이아웃 + 동적 위젯
- [ ] 서버에서 초기 데이터 + 클라이언트에서 상호작용
- [ ] 대부분 정적이지만 일부 상호작용 필요

## 결정 흐름도

\`\`\`
시작
  │
  ├─ Hook 사용? ──────────────────────► Client Component
  │      │
  │      No
  │      │
  ├─ 이벤트 핸들러? ──────────────────► Client Component
  │      │
  │      No
  │      │
  ├─ 브라우저 API? ───────────────────► Client Component
  │      │
  │      No
  │      │
  ├─ async 데이터 페칭? ──────────────► Server Component
  │      │
  │      No
  │      │
  └─ 정적 콘텐츠 ─────────────────────► Server Component
\`\`\`
`,
      codeExamples: [
        {
          id: 'chapter-page-analysis',
          title: '프로젝트 예제: React Study ChapterPage 분석',
          description: "여러 Hook과 상호작용이 필요해서 'use client'를 사용하는 페이지입니다.",
          language: 'tsx',
          fileName: 'src/app/[locale]/dev/react-study/[courseId]/[chapterId]/page.tsx',
          code: `'use client';

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';  // ← Hook 필요
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import Link from 'next/link';
import { useCurrentLocale } from '@/lib/i18n/client';  // ← Hook 필요

export default function ChapterPage() {
  const params = useParams();  // ← Client Hook
  const locale = useCurrentLocale();  // ← Client Hook
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;

  // 상태 관리 - Client Component 필요
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(chapter?.sections.map(s => s.id) || [])
  );

  // 이벤트 핸들러 - Client Component 필요
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  return (
    <Box>
      {/* 클릭 이벤트 - Client Component 필요 */}
      <IconButton onClick={() => toggleSection(section.id)}>
        Toggle
      </IconButton>

      {/* Collapse 애니메이션 - Client 라이브러리 */}
      <Collapse in={expandedSections.has(section.id)}>
        <Box>{/* 섹션 내용 */}</Box>
      </Collapse>
    </Box>
  );
}

/*
 * 이 페이지가 Client Component인 이유:
 * 1. useParams() - 동적 라우트 파라미터 접근
 * 2. useState() - 섹션 펼침/접힘 상태 관리
 * 3. useCallback() - 이벤트 핸들러 최적화
 * 4. onClick - 사용자 상호작용 처리
 * 5. MUI Collapse - 클라이언트 애니메이션
 */`
        },
        {
          id: 'optimization-example',
          title: '최적화된 구조 예제',
          description: '불필요한 Client Component를 줄이고 Server Component를 최대화한 구조입니다.',
          language: 'tsx',
          code: `// 최적화 전: 전체 페이지가 Client
'use client';
export default function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(\`/api/products/\${productId}\`)
      .then(res => res.json())
      .then(setProduct);
  }, [productId]);

  return (
    <div>
      <h1>{product?.name}</h1>
      <p>{product?.description}</p>
      <AddToCartButton productId={productId} />
    </div>
  );
}

// 최적화 후: Server에서 데이터, 작은 Client Component만
// page.tsx (Server Component)
export default async function ProductPage({ params }) {
  // 서버에서 데이터 가져오기 - 빠르고 안전
  const product = await db.product.findUnique({
    where: { id: params.productId }
  });

  return (
    <div>
      {/* 정적 콘텐츠 - 서버 렌더링 */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <img src={product.image} alt={product.name} />

      {/* 상호작용만 Client Component */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// AddToCartButton.tsx (작은 Client Component)
'use client';
export function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={() => addToCart(productId)}
      disabled={loading}
    >
      장바구니에 추가
    </button>
  );
}

/*
 * 최적화 효과:
 * - 데이터 페칭이 서버에서 실행되어 API 키 노출 없음
 * - 제품 정보가 서버 렌더링되어 SEO 개선
 * - 클라이언트로 전송되는 JS 크기 감소
 * - 초기 페이지 로딩 속도 향상
 */`
        }
      ],
      tips: [
        "현재 프로젝트는 대부분 Client Component를 사용합니다. 이는 인증, 권한, i18n이 전역적으로 필요하기 때문입니다.",
        "순수 Server Component의 장점을 활용하려면 정적 페이지(마케팅, 블로그 등)를 별도로 구성하는 것이 좋습니다.",
        "점진적으로 데이터 페칭을 Server Component로 이동하고, 상호작용 부분만 작은 Client Component로 분리하면 성능이 향상됩니다.",
        "Server/Client 경계 결정 시 '이 기능이 서버에서 실행될 수 있는가?'를 먼저 질문하세요."
      ]
    }
  ],
  status: 'ready'
};

export default chapter;
