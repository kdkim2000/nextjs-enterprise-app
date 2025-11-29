/**
 * Chapter 8: Next.js App Router
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'nextjs-app-router',
  order: 8,
  title: 'Next.js App Router',
  titleKo: 'Next.js App Router',
  description: 'Master Next.js App Router including file-based routing, layouts, dynamic routes, and middleware.',
  descriptionKo: '파일 기반 라우팅, 레이아웃, 동적 라우트, 미들웨어 등 Next.js App Router를 마스터합니다.',
  estimatedMinutes: 55,
  objectives: [
    'Understand the file-based routing system in App Router',
    'Create layouts and nested layouts for consistent UI',
    'Implement dynamic routes with parameters',
    'Use route groups, parallel routes, and middleware'
  ],
  objectivesKo: [
    'App Router의 파일 기반 라우팅 시스템을 이해한다',
    '일관된 UI를 위한 레이아웃과 중첩 레이아웃을 만든다',
    '파라미터가 있는 동적 라우트를 구현한다',
    '라우트 그룹, 병렬 라우트, 미들웨어를 사용한다'
  ],
  sections: [
    {
      id: 'file-based-routing',
      title: 'File-based Routing System',
      titleKo: '파일 기반 라우팅 시스템',
      content: `
## App Router 소개

Next.js 13+의 **App Router**는 파일 시스템을 기반으로 라우팅을 정의합니다. \`app\` 디렉토리의 폴더 구조가 URL 경로가 됩니다.

### Pages Router vs App Router

\`\`\`
Pages Router (기존):           App Router (현재):
pages/                         app/
├── index.tsx    → /           ├── page.tsx        → /
├── about.tsx    → /about      ├── about/
├── users/                     │   └── page.tsx    → /about
│   ├── index.tsx  → /users    ├── users/
│   └── [id].tsx   → /users/:id│   ├── page.tsx    → /users
└── _app.tsx     (레이아웃)    │   └── [id]/
                               │       └── page.tsx → /users/:id
                               └── layout.tsx    (루트 레이아웃)
\`\`\`

### 핵심 파일 컨벤션

| 파일 | 역할 |
|------|------|
| \`page.tsx\` | 라우트의 UI를 정의 (필수) |
| \`layout.tsx\` | 공유 레이아웃 (자식 라우트에 적용) |
| \`loading.tsx\` | 로딩 UI (Suspense boundary) |
| \`error.tsx\` | 에러 UI (Error boundary) |
| \`not-found.tsx\` | 404 UI |
| \`template.tsx\` | 매번 재마운트되는 레이아웃 |

### 폴더 구조 = URL 경로

\`\`\`
app/
├── page.tsx                      →  /
├── dashboard/
│   ├── page.tsx                  →  /dashboard
│   ├── settings/
│   │   └── page.tsx              →  /dashboard/settings
│   └── profile/
│       └── page.tsx              →  /dashboard/profile
└── admin/
    ├── page.tsx                  →  /admin
    ├── users/
    │   └── page.tsx              →  /admin/users
    └── roles/
        └── page.tsx              →  /admin/roles
\`\`\`

### page.tsx가 있어야 라우트가 됨

\`\`\`
app/
├── dashboard/
│   ├── page.tsx          ✅ /dashboard 접근 가능
│   └── components/       ❌ URL 없음 (page.tsx 없음)
│       └── Chart.tsx        (컴포넌트 파일만 있음)
├── utils/                ❌ URL 없음 (page.tsx 없음)
│   └── helpers.ts           (유틸리티 파일만 있음)
└── hooks/                ❌ URL 없음 (page.tsx 없음)
    └── useData.ts           (훅 파일만 있음)
\`\`\`

\`page.tsx\`가 없는 폴더는 URL로 접근할 수 없습니다. 이를 이용해 라우트 폴더 내에 컴포넌트, 훅 등을 정리할 수 있습니다.
      `,
      codeExamples: [
        {
          id: 'project-structure',
          title: '프로젝트 라우팅 구조',
          description: '실제 프로젝트의 app 디렉토리 구조',
          language: 'typescript',
          code: `// 프로젝트 app 디렉토리 구조

app/
├── layout.tsx                    // 루트 레이아웃 (html, body)
├── page.tsx                      // / (리다이렉트 등)
├── globals.css                   // 글로벌 스타일
│
└── [locale]/                     // 다국어 동적 라우트
    ├── layout.tsx                // 로케일별 레이아웃 (Provider)
    │
    ├── login/
    │   └── page.tsx              // /en/login, /ko/login
    │
    ├── dashboard/
    │   ├── layout.tsx            // 대시보드 레이아웃 (인증 필요)
    │   ├── page.tsx              // /en/dashboard
    │   ├── not-found.tsx         // 대시보드 404
    │   └── settings/
    │       └── page.tsx          // /en/dashboard/settings
    │
    ├── admin/
    │   ├── layout.tsx            // 관리자 레이아웃 (인증 필요)
    │   ├── page.tsx              // /en/admin
    │   ├── not-found.tsx         // 관리자 404
    │   ├── users/
    │   │   ├── page.tsx          // /en/admin/users
    │   │   ├── constants.tsx     // 컬럼 정의 등
    │   │   └── hooks/
    │   │       └── useUserManagement.ts
    │   ├── roles/
    │   │   └── page.tsx          // /en/admin/roles
    │   ├── departments/
    │   │   └── page.tsx          // /en/admin/departments
    │   └── ... (기타 관리자 페이지)
    │
    ├── boards/
    │   ├── layout.tsx            // 게시판 공통 레이아웃
    │   └── [boardTypeId]/        // 동적: 게시판 종류
    │       ├── page.tsx          // /en/boards/notice
    │       ├── constants.tsx
    │       ├── hooks/
    │       │   └── useBoardManagement.ts
    │       ├── write/
    │       │   └── page.tsx      // /en/boards/notice/write
    │       └── [postId]/         // 동적: 게시글 ID
    │           ├── page.tsx      // /en/boards/notice/123
    │           └── edit/
    │               └── page.tsx  // /en/boards/notice/123/edit
    │
    └── dev/                      // 개발자 도구 (이 학습 앱 등)
        ├── page.tsx
        ├── react-study/
        │   └── page.tsx
        └── components/
            └── page.tsx

// URL 예시:
// /ko/dashboard          → 대시보드
// /en/admin/users        → 사용자 관리
// /ko/boards/notice      → 공지사항 게시판 목록
// /ko/boards/notice/123  → 공지사항 123번 글 상세
// /ko/boards/notice/write → 공지사항 새 글 작성`
        },
        {
          id: 'basic-page',
          title: '기본 페이지 컴포넌트',
          description: 'page.tsx의 기본 구조',
          language: 'tsx',
          code: `// app/dashboard/page.tsx

// 기본 페이지 컴포넌트 (Server Component)
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard</p>
    </div>
  );
}

// 메타데이터 (SEO)
export const metadata = {
  title: 'Dashboard',
  description: 'User dashboard'
};

// ═══════════════════════════════════════════
// Client Component 페이지
// ═══════════════════════════════════════════

// app/[locale]/admin/users/page.tsx
'use client';  // ⭐ Client Component로 전환

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/client';

export default function UsersPage() {
  const t = useI18n();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 클라이언트에서 데이터 페칭
    fetchUsers().then(setUsers);
  }, []);

  return (
    <div>
      <h1>{t('admin.users')}</h1>
      {/* ... */}
    </div>
  );
}

// 💡 Server Component vs Client Component
// - 기본: Server Component (서버에서 렌더링)
// - 'use client' 추가: Client Component (브라우저에서 렌더링)
// - useState, useEffect, 이벤트 핸들러 사용 시 Client Component 필요`
        }
      ],
      tips: [
        '✅ App Router에서 모든 컴포넌트는 기본적으로 Server Component입니다.',
        '✅ useState, useEffect, 이벤트 핸들러가 필요하면 "use client"를 추가하세요.',
        '✅ page.tsx가 없는 폴더는 URL이 생성되지 않으므로 컴포넌트/훅 정리에 활용하세요.',
        'ℹ️ 폴더 구조가 URL이 되므로, 설계 시 URL을 먼저 고려하세요.'
      ]
    },
    {
      id: 'layouts',
      title: 'Layouts and page.tsx',
      titleKo: 'layout.tsx와 page.tsx',
      content: `
## 레이아웃 시스템

\`layout.tsx\`는 **여러 페이지에서 공유**되는 UI를 정의합니다. 레이아웃은 상태를 유지하고, 자식 라우트 간 이동 시 리렌더링되지 않습니다.

### 레이아웃 계층 구조

\`\`\`
app/
├── layout.tsx         ← 루트 레이아웃 (필수, html/body)
├── dashboard/
│   ├── layout.tsx     ← 대시보드 레이아웃
│   ├── page.tsx       ← /dashboard
│   └── settings/
│       └── page.tsx   ← /settings
└── admin/
    ├── layout.tsx     ← 관리자 레이아웃
    └── users/
        └── page.tsx   ← /admin/users

렌더링 결과 (/dashboard/settings):
┌──────────────────────────────────────────┐
│ Root Layout                              │
│ ┌──────────────────────────────────────┐ │
│ │ Dashboard Layout                     │ │
│ │ ┌──────────────────────────────────┐ │ │
│ │ │ Settings Page                    │ │ │
│ │ └──────────────────────────────────┘ │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
\`\`\`

### 루트 레이아웃 (필수)

\`\`\`tsx
// app/layout.tsx - 루트 레이아웃은 필수!
import './globals.css';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
\`\`\`

### 중첩 레이아웃

\`\`\`tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        {children}  {/* page.tsx 또는 하위 layout이 들어감 */}
      </main>
    </div>
  );
}
\`\`\`

### 레이아웃 vs 템플릿

| 특성 | layout.tsx | template.tsx |
|------|-----------|--------------|
| 상태 유지 | ✅ 유지됨 | ❌ 매번 리셋 |
| 리렌더링 | 자식만 | 전체 |
| 애니메이션 | 어려움 | 쉬움 |
| 사용 사례 | 대부분 | 페이지 전환 애니메이션 |

## page.tsx

\`page.tsx\`는 해당 라우트의 **고유한 UI**를 정의합니다.

\`\`\`tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <DashboardWidgets />
    </div>
  );
}

// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <SettingsForm />
    </div>
  );
}
\`\`\`

### 레이아웃과 페이지의 관계

\`\`\`
URL: /dashboard/settings

렌더링 순서:
1. app/layout.tsx (루트)
   └── 2. app/[locale]/layout.tsx (로케일)
       └── 3. app/[locale]/dashboard/layout.tsx (대시보드)
           └── 4. app/[locale]/dashboard/settings/page.tsx (페이지)
\`\`\`
      `,
      codeExamples: [
        {
          id: 'root-layout',
          title: '루트 레이아웃',
          description: 'app/layout.tsx - 전체 앱의 기본 구조',
          fileName: 'src/app/layout.tsx',
          language: 'tsx',
          code: `// 프로젝트 루트 레이아웃

import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';

// 전역 메타데이터
export const metadata: Metadata = {
  title: 'Enterprise App',
  description: 'Next.js Enterprise Application with MUI'
};

// ⭐ 루트 레이아웃은 반드시 html과 body를 포함해야 함
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* MUI 캐시 프로바이더 */}
        <AppRouterCacheProvider>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

// 💡 루트 레이아웃 특징:
// 1. app/layout.tsx는 필수
// 2. html, body 태그 포함 필수
// 3. 전역 CSS, 폰트, 메타데이터 설정
// 4. 전역 Provider (테마, 인증 등) 배치`
        },
        {
          id: 'locale-layout',
          title: '로케일 레이아웃',
          description: 'app/[locale]/layout.tsx - 다국어 Provider 설정',
          fileName: 'src/app/[locale]/layout.tsx',
          language: 'tsx',
          code: `// 프로젝트 로케일 레이아웃

import React from 'react';
import { ClientProviders } from '@/components/providers/ClientProviders';

// ⭐ 정적 파라미터 생성 - 빌드 시 미리 생성할 로케일
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ko' }];
}

// ⭐ 동적 라우트 파라미터를 받는 레이아웃
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;  // Next.js 15+에서 Promise
}) {
  const { locale } = await params;

  // 로케일에 맞는 Provider로 감싸기
  return (
    <ClientProviders locale={locale}>
      {children}
    </ClientProviders>
  );
}

// 💡 이 레이아웃이 하는 일:
// 1. URL에서 locale 파라미터 추출 (/ko/..., /en/...)
// 2. 해당 로케일로 i18n Provider 설정
// 3. 인증, 테마 등 클라이언트 Provider 설정
// 4. 모든 하위 페이지에 적용됨`
        },
        {
          id: 'dashboard-layout',
          title: '대시보드 레이아웃',
          description: 'app/[locale]/dashboard/layout.tsx - 인증된 레이아웃',
          fileName: 'src/app/[locale]/dashboard/layout.tsx',
          language: 'tsx',
          code: `// 프로젝트 대시보드 레이아웃

'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    // ⭐ 인증이 필요한 레이아웃
    <AuthenticatedLayout showAutoLogoutWarning>
      {children}
    </AuthenticatedLayout>
  );
}

// ═══════════════════════════════════════════
// AuthenticatedLayout 내부 구조 (개념)
// ═══════════════════════════════════════════

function AuthenticatedLayout({
  children,
  showAutoLogoutWarning
}: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 인증 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;  // 리다이렉트 중
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* 헤더 */}
      <DashboardHeader onMenuClick={toggleSidebar} />

      {/* 사이드바 */}
      <Sidebar expanded={sidebarExpanded} />

      {/* 메인 콘텐츠 */}
      <Box component="main" sx={{ flex: 1 }}>
        {children}  {/* page.tsx가 여기에 렌더링됨 */}
      </Box>

      {/* 자동 로그아웃 경고 */}
      {showAutoLogoutWarning && <AutoLogoutWarning />}
    </Box>
  );
}

// 💡 레이아웃 계층:
// /ko/dashboard/settings 접근 시:
//
// RootLayout (html, body)
//  └── LocaleLayout (i18n Provider)
//       └── DashboardLayout (인증, 헤더, 사이드바)
//            └── SettingsPage (실제 페이지 내용)`
        },
        {
          id: 'admin-layout',
          title: '관리자 레이아웃',
          description: 'app/[locale]/admin/layout.tsx - 관리자 전용 레이아웃',
          fileName: 'src/app/[locale]/admin/layout.tsx',
          language: 'tsx',
          code: `// 프로젝트 관리자 레이아웃

'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // ⭐ 관리자도 인증 필요 (권한 체크는 각 페이지에서)
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}

// 💡 권한 체크 방식:
// - 레이아웃: 인증 여부만 확인
// - 각 페이지: 프로그램별 권한 확인 (RouteGuard)
//
// 이유: 관리자 메뉴에도 다양한 권한 레벨이 있음
// - 사용자 관리: 인사팀만
// - 로그 조회: 관리자만
// - 코드 관리: 시스템 관리자만`
        }
      ],
      tips: [
        '✅ 루트 레이아웃(app/layout.tsx)은 반드시 html과 body 태그를 포함해야 합니다.',
        '✅ 레이아웃은 상태를 유지하므로, 인증/Provider 설정에 적합합니다.',
        '✅ 중첩 레이아웃을 활용하여 섹션별 공통 UI를 정의하세요.',
        '⚠️ 레이아웃에서 params는 Next.js 15+에서 Promise입니다. await로 받으세요.'
      ]
    },
    {
      id: 'dynamic-routes',
      title: 'Dynamic Routes',
      titleKo: '동적 라우트 ([param])',
      content: `
## 동적 라우트란?

**동적 라우트**는 URL의 일부를 변수로 받아 처리하는 라우트입니다. 대괄호 \`[]\`로 폴더 이름을 감싸면 동적 세그먼트가 됩니다.

### 동적 라우트 문법

| 폴더명 | URL 예시 | params |
|--------|----------|--------|
| \`[id]\` | /users/123 | \`{ id: '123' }\` |
| \`[...slug]\` | /docs/a/b/c | \`{ slug: ['a','b','c'] }\` |
| \`[[...slug]]\` | /docs 또는 /docs/a | \`{ slug: [] }\` 또는 \`{ slug: ['a'] }\` |

### 단일 동적 세그먼트 [param]

\`\`\`
app/users/[id]/page.tsx

URL: /users/123    → params.id = '123'
URL: /users/abc    → params.id = 'abc'
\`\`\`

### 다중 동적 세그먼트

\`\`\`
app/boards/[boardTypeId]/[postId]/page.tsx

URL: /boards/notice/123
→ params.boardTypeId = 'notice'
→ params.postId = '123'
\`\`\`

### Catch-all 세그먼트 [...param]

\`\`\`
app/docs/[...slug]/page.tsx

URL: /docs/a/b/c
→ params.slug = ['a', 'b', 'c']

URL: /docs
→ 404 (빈 경로는 매칭 안 됨)
\`\`\`

### Optional Catch-all [[...param]]

\`\`\`
app/docs/[[...slug]]/page.tsx

URL: /docs
→ params.slug = undefined

URL: /docs/a/b
→ params.slug = ['a', 'b']
\`\`\`

## 파라미터 사용하기

### Server Component에서

\`\`\`tsx
// Server Component (기본)
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>  // Next.js 15+
}) {
  const { id } = await params;

  // 서버에서 데이터 페칭
  const user = await fetchUser(id);

  return <div>{user.name}</div>;
}
\`\`\`

### Client Component에서

\`\`\`tsx
'use client';

import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  // ...
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'boards-dynamic-route',
          title: '게시판 동적 라우트',
          description: '[locale]/boards/[boardTypeId]/page.tsx',
          fileName: 'src/app/[locale]/boards/[boardTypeId]/page.tsx',
          language: 'tsx',
          code: `// 게시판 목록 페이지 - 동적 라우트

'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';  // ⭐ Client Component에서 params 사용
import { Box } from '@mui/material';
import BoardListView from '@/components/boards/BoardListView';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useBoardManagement } from './hooks/useBoardManagement';

export default function BoardListPage() {
  // ⭐ useParams로 동적 세그먼트 값 가져오기
  const params = useParams();
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  // URL: /ko/boards/notice → boardTypeId = 'notice'
  // URL: /ko/boards/qna    → boardTypeId = 'qna'
  const boardTypeId = params.boardTypeId as string;

  // 게시판 종류에 따른 권한 체크
  const { canWrite, canRead, boardType, loading: permLoading } =
    useBoardPermissions(boardTypeId);

  // 게시판 관리 훅 (데이터 페칭, CRUD 등)
  const {
    posts,
    searching,
    handleAdd,
    handlePostClick,
    // ...
  } = useBoardManagement({
    storageKey: \`board-\${boardTypeId}-page-state\`,
    boardTypeId,  // ⭐ 동적 파라미터 전달
    boardType
  });

  return (
    <PageStateWrapper
      loading={permLoading}
      notFound={!boardType && !permLoading}
    >
      <StandardCrudPageLayout /* ... */>
        <BoardListView
          posts={posts}
          loading={searching}
          onRowClick={handlePostClick}
          onAdd={canWrite ? handleAdd : undefined}
          locale={currentLocale}
        />
      </StandardCrudPageLayout>
    </PageStateWrapper>
  );
}

// 💡 URL 예시:
// /ko/boards/notice     → 공지사항 목록
// /ko/boards/qna        → Q&A 목록
// /ko/boards/free       → 자유게시판 목록
// /en/boards/notice     → Notice List (English)`
        },
        {
          id: 'post-detail-dynamic',
          title: '게시글 상세 - 중첩 동적 라우트',
          description: '[locale]/boards/[boardTypeId]/[postId]/page.tsx',
          fileName: 'src/app/[locale]/boards/[boardTypeId]/[postId]/page.tsx',
          language: 'tsx',
          code: `// 게시글 상세 페이지 - 다중 동적 라우트

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useAuth } from '@/contexts/AuthContext';

export default function PostDetailPage() {
  // ⭐ 다중 동적 파라미터 사용
  const params = useParams();
  const router = useRouter();

  // URL: /ko/boards/notice/123
  // → boardTypeId = 'notice', postId = '123'
  const boardTypeId = params.boardTypeId as string;
  const postId = params.postId as string;

  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // 게시판 종류별 권한
  const { boardType, canWrite } = useBoardPermissions(boardTypeId);

  // ⭐ postId로 데이터 페칭
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(\`/post/\${postId}\`);
        if (response.success) {
          setPost(response.data.post);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);  // postId가 변경되면 다시 페칭

  // 편집 페이지로 이동 (다른 동적 라우트)
  const handleEdit = () => {
    // /ko/boards/notice/123/edit
    router.push(\`/\${currentLocale}/boards/\${boardTypeId}/\${postId}/edit\`);
  };

  // 목록으로 돌아가기
  const handleBack = () => {
    // /ko/boards/notice
    router.push(\`/\${currentLocale}/boards/\${boardTypeId}\`);
  };

  const isAuthor = post?.author_id === user?.id;
  const canEdit = isAuthor || user?.role === 'admin';

  return (
    <Box>
      {/* 제목, 본문 등 */}
      <Typography variant="h5">{post?.title}</Typography>
      <SafeHtmlRenderer html={post?.content} />

      {/* 편집/삭제 버튼 (권한 있을 때만) */}
      {canEdit && (
        <Box>
          <Button onClick={handleEdit}>Edit</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </Box>
      )}

      {/* 댓글 섹션 */}
      <CommentsSection postId={postId} />
    </Box>
  );
}

// 💡 라우트 구조:
// /ko/boards/[boardTypeId]/page.tsx           → 목록
// /ko/boards/[boardTypeId]/write/page.tsx     → 작성
// /ko/boards/[boardTypeId]/[postId]/page.tsx  → 상세
// /ko/boards/[boardTypeId]/[postId]/edit/page.tsx → 편집`
        },
        {
          id: 'post-write-page',
          title: '게시글 작성 페이지',
          description: '정적 세그먼트와 동적 세그먼트 조합',
          fileName: 'src/app/[locale]/boards/[boardTypeId]/write/page.tsx',
          language: 'tsx',
          code: `// 게시글 작성 페이지

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PostFormPage from '@/components/boards/PostFormPage';

export default function PostWritePage() {
  const params = useParams();

  // URL: /ko/boards/notice/write
  // → boardTypeId = 'notice'
  // 'write'는 정적 세그먼트 (폴더명 그대로)
  const boardTypeId = params.boardTypeId as string;

  return (
    <PostFormPage
      boardTypeId={boardTypeId}
      mode="create"   // 새 글 작성 모드
      basePath="/boards"
    />
  );
}

// ═══════════════════════════════════════════
// 라우트 매칭 우선순위
// ═══════════════════════════════════════════

// 폴더 구조:
// app/[locale]/boards/[boardTypeId]/
// ├── page.tsx           → /ko/boards/notice
// ├── write/
// │   └── page.tsx       → /ko/boards/notice/write
// └── [postId]/
//     └── page.tsx       → /ko/boards/notice/123

// Next.js는 더 구체적인 경로를 먼저 매칭:
// 1. /boards/notice/write  → write/page.tsx (정적 우선)
// 2. /boards/notice/123    → [postId]/page.tsx (동적)
// 3. /boards/notice        → page.tsx

// 💡 정적 세그먼트(write)가 동적 세그먼트([postId])보다 우선!`
        }
      ],
      tips: [
        '✅ Client Component에서는 useParams()로, Server Component에서는 props.params로 파라미터를 받습니다.',
        '✅ Next.js 15+에서 Server Component의 params는 Promise입니다.',
        '✅ 정적 세그먼트가 동적 세그먼트보다 우선 매칭됩니다.',
        '⚠️ 파라미터는 항상 string입니다. 숫자가 필요하면 parseInt() 등으로 변환하세요.'
      ]
    },
    {
      id: 'route-groups-middleware',
      title: 'Route Groups and Middleware',
      titleKo: '라우트 그룹과 미들웨어',
      content: `
## 라우트 그룹 (Route Groups)

라우트 그룹은 **URL에 영향 없이** 라우트를 조직화하는 방법입니다. 폴더 이름을 괄호로 감싸면 됩니다: \`(folderName)\`

### 기본 사용법

\`\`\`
app/
├── (marketing)/          ← URL에 포함되지 않음
│   ├── about/
│   │   └── page.tsx      → /about
│   └── contact/
│       └── page.tsx      → /contact
├── (app)/                ← URL에 포함되지 않음
│   ├── dashboard/
│   │   └── page.tsx      → /dashboard
│   └── settings/
│       └── page.tsx      → /settings
└── layout.tsx
\`\`\`

### 그룹별 다른 레이아웃

\`\`\`
app/
├── (marketing)/
│   ├── layout.tsx        ← 마케팅용 레이아웃 (헤더만)
│   ├── about/
│   └── pricing/
├── (app)/
│   ├── layout.tsx        ← 앱용 레이아웃 (사이드바 포함)
│   ├── dashboard/
│   └── settings/
└── layout.tsx            ← 루트 레이아웃
\`\`\`

## 병렬 라우트 (Parallel Routes)

**병렬 라우트**는 같은 레이아웃 내에서 여러 페이지를 동시에 렌더링합니다. \`@folder\` 문법을 사용합니다.

\`\`\`
app/
├── @dashboard/
│   └── page.tsx
├── @sidebar/
│   └── page.tsx
├── layout.tsx
└── page.tsx

// layout.tsx
export default function Layout({
  children,
  dashboard,
  sidebar
}: {
  children: React.ReactNode;
  dashboard: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div>
      <main>{children}</main>
      <aside>{sidebar}</aside>
      <section>{dashboard}</section>
    </div>
  );
}
\`\`\`

## 미들웨어 (Middleware)

미들웨어는 **요청이 완료되기 전**에 코드를 실행합니다. 인증, 리다이렉트, 헤더 수정 등에 사용됩니다.

### 미들웨어 파일 위치

\`\`\`
project/
├── src/
│   ├── middleware.ts     ← 여기에 위치
│   └── app/
└── middleware.ts         ← 또는 루트에
\`\`\`

### 미들웨어 기본 구조

\`\`\`tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 요청 처리

  // 1. 리다이렉트
  if (condition) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. 리라이트 (URL은 유지, 다른 페이지 렌더링)
  if (condition) {
    return NextResponse.rewrite(new URL('/other', request.url));
  }

  // 3. 헤더 수정
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'value');
  return response;

  // 4. 그냥 통과
  return NextResponse.next();
}

// 미들웨어가 실행될 경로 지정
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
\`\`\`

### matcher 패턴

| 패턴 | 설명 |
|------|------|
| \`/dashboard\` | 정확히 /dashboard만 |
| \`/dashboard/:path\` | /dashboard/settings (1레벨) |
| \`/dashboard/:path*\` | /dashboard/a/b/c (모든 레벨) |
| \`/((?!api).*)\` | /api로 시작하지 않는 모든 경로 |
      `,
      codeExamples: [
        {
          id: 'middleware-auth',
          title: '인증 미들웨어 예제',
          description: '로그인 상태에 따른 리다이렉트',
          language: 'tsx',
          code: `// src/middleware.ts - 인증 미들웨어 예제

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보호된 경로 (로그인 필요)
const protectedPaths = ['/dashboard', '/admin', '/boards'];

// 공개 경로 (로그인 불필요)
const publicPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로케일 제거 (/ko/dashboard → /dashboard)
  const pathWithoutLocale = pathname.replace(/^\\/[a-z]{2}/, '');

  // 쿠키에서 토큰 확인
  const token = request.cookies.get('token')?.value;

  // ⭐ 보호된 경로에 토큰 없이 접근 시
  const isProtectedPath = protectedPaths.some(path =>
    pathWithoutLocale.startsWith(path)
  );

  if (isProtectedPath && !token) {
    // 로그인 페이지로 리다이렉트
    const locale = pathname.split('/')[1] || 'en';
    const loginUrl = new URL(\`/\${locale}/login\`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ⭐ 로그인 상태로 공개 경로 접근 시
  const isPublicPath = publicPaths.some(path =>
    pathWithoutLocale.startsWith(path)
  );

  if (isPublicPath && token) {
    // 대시보드로 리다이렉트
    const locale = pathname.split('/')[1] || 'en';
    return NextResponse.redirect(new URL(\`/\${locale}/dashboard\`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일, API 제외
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};

// 💡 미들웨어 주의사항:
// 1. Edge Runtime에서 실행 (Node.js API 일부만 사용 가능)
// 2. 무거운 로직은 피하기 (모든 요청에 실행됨)
// 3. 데이터베이스 직접 접근 불가
// 4. 토큰 검증은 간단한 존재 여부만, 상세 검증은 API에서`
        },
        {
          id: 'middleware-i18n',
          title: '다국어 미들웨어',
          description: '로케일 감지 및 리다이렉트',
          language: 'tsx',
          code: `// 다국어 미들웨어 예제

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ko', 'zh', 'vi'];
const defaultLocale = 'ko';

// 브라우저 언어에서 지원 로케일 찾기
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');

  if (!acceptLanguage) return defaultLocale;

  // accept-language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
  const browserLocales = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].split('-')[0]);

  // 지원하는 로케일 중 첫 번째 매칭
  for (const browserLocale of browserLocales) {
    if (locales.includes(browserLocale)) {
      return browserLocale;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 이미 로케일이 있는지 확인
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(\`/\${locale}/\`) || pathname === \`/\${locale}\`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // ⭐ 로케일 없으면 추가하여 리다이렉트
  // / → /ko
  // /dashboard → /ko/dashboard

  // 쿠키에 저장된 선호 로케일 확인
  const preferredLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = preferredLocale && locales.includes(preferredLocale)
    ? preferredLocale
    : getLocale(request);

  const newUrl = new URL(\`/\${locale}\${pathname}\`, request.url);
  newUrl.search = request.nextUrl.search;

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // 정적 파일, API 제외
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\\\.).*)'
  ]
};

// 💡 결과:
// /dashboard     → /ko/dashboard (브라우저 언어 기반)
// /ko/dashboard  → 그대로 통과
// /en/admin      → 그대로 통과`
        },
        {
          id: 'route-group-example',
          title: '라우트 그룹 활용 예제',
          description: '레이아웃 분리를 위한 라우트 그룹',
          language: 'tsx',
          code: `// 라우트 그룹 활용 예제

// ═══════════════════════════════════════════
// 시나리오: 공개 페이지와 앱 페이지 레이아웃 분리
// ═══════════════════════════════════════════

// 폴더 구조:
// app/
// ├── (public)/                  ← 공개 페이지 그룹
// │   ├── layout.tsx             ← 공개 레이아웃 (헤더만)
// │   ├── page.tsx               → / (홈)
// │   ├── about/
// │   │   └── page.tsx           → /about
// │   ├── pricing/
// │   │   └── page.tsx           → /pricing
// │   └── login/
// │       └── page.tsx           → /login
// │
// ├── (authenticated)/           ← 인증 필요 그룹
// │   ├── layout.tsx             ← 인증 레이아웃 (사이드바, 헤더)
// │   ├── dashboard/
// │   │   └── page.tsx           → /dashboard
// │   └── settings/
// │       └── page.tsx           → /settings
// │
// └── layout.tsx                 ← 루트 레이아웃

// ═══════════════════════════════════════════
// (public)/layout.tsx
// ═══════════════════════════════════════════

export default function PublicLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="public-layout">
      {/* 간단한 헤더 */}
      <header>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/login">Login</Link>
        </nav>
      </header>

      <main>
        {children}
      </main>

      <footer>
        © 2024 Company
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════
// (authenticated)/layout.tsx
// ═══════════════════════════════════════════

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';

export default function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) redirect('/login');

  return (
    <div className="authenticated-layout">
      {/* 풀 헤더 */}
      <DashboardHeader user={user} />

      <div className="layout-body">
        {/* 사이드바 */}
        <Sidebar />

        {/* 메인 콘텐츠 */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}

// 💡 라우트 그룹의 장점:
// 1. URL 구조에 영향 없이 코드 조직화
// 2. 섹션별 다른 레이아웃 적용
// 3. 관련 라우트를 논리적으로 그룹화
// 4. 동일 URL 구조에서 다른 레이아웃 가능`
        }
      ],
      tips: [
        '✅ 라우트 그룹 (folder)는 URL에 포함되지 않습니다.',
        '✅ 미들웨어는 Edge Runtime에서 실행되므로 가볍게 유지하세요.',
        '✅ matcher로 미들웨어가 실행될 경로를 제한하세요.',
        '⚠️ 미들웨어에서 무거운 데이터베이스 쿼리는 피하세요.'
      ]
    },
    {
      id: 'special-files',
      title: 'Special Files',
      titleKo: '특수 파일들 (loading, error, not-found)',
      content: `
## 특수 파일들

App Router는 특정 UI를 자동으로 처리하는 특수 파일들을 제공합니다.

### loading.tsx

페이지가 로딩 중일 때 표시되는 UI입니다. React Suspense를 자동으로 감쌉니다.

\`\`\`tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <CircularProgress />
      <span>Loading dashboard...</span>
    </div>
  );
}

// 또는 스켈레톤 UI
export default function Loading() {
  return (
    <div>
      <Skeleton variant="text" width={200} height={40} />
      <Skeleton variant="rectangular" height={300} />
    </div>
  );
}
\`\`\`

### error.tsx

에러 발생 시 표시되는 UI입니다. Error Boundary를 자동으로 감쌉니다.

\`\`\`tsx
// app/dashboard/error.tsx
'use client';  // Error 컴포넌트는 반드시 Client Component

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;  // 에러 복구 시도 함수
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
\`\`\`

### not-found.tsx

페이지를 찾을 수 없을 때 표시되는 UI입니다.

\`\`\`tsx
// app/dashboard/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>The page you requested could not be found.</p>
      <Link href="/dashboard">
        Return to Dashboard
      </Link>
    </div>
  );
}

// 프로그래밍 방식으로 트리거
import { notFound } from 'next/navigation';

async function Page({ params }) {
  const user = await fetchUser(params.id);

  if (!user) {
    notFound();  // not-found.tsx 렌더링
  }

  return <div>{user.name}</div>;
}
\`\`\`

### 파일 적용 범위

\`\`\`
app/
├── layout.tsx        ← 모든 페이지에 적용
├── loading.tsx       ← 모든 페이지 로딩 시
├── error.tsx         ← 모든 페이지 에러 시
├── not-found.tsx     ← 모든 페이지 404 시
├── dashboard/
│   ├── loading.tsx   ← dashboard 하위만 적용 (우선)
│   └── error.tsx     ← dashboard 하위만 적용 (우선)
└── admin/
    └── not-found.tsx ← admin 하위만 적용 (우선)

더 가까운 파일이 우선 적용됨
\`\`\`
      `,
      codeExamples: [
        {
          id: 'not-found-example',
          title: 'not-found.tsx 예제',
          description: '프로젝트의 404 페이지',
          fileName: 'src/app/[locale]/admin/not-found.tsx (개념)',
          language: 'tsx',
          code: `// 관리자 섹션 404 페이지

import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';

export default function AdminNotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        textAlign: 'center',
        gap: 2
      }}
    >
      <SentimentDissatisfied sx={{ fontSize: 80, color: 'grey.400' }} />

      <Typography variant="h4" fontWeight={600}>
        Page Not Found
      </Typography>

      <Typography color="text.secondary">
        The admin page you are looking for does not exist.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          component={Link}
          href="/admin"
          variant="contained"
        >
          Go to Admin Home
        </Button>
        <Button
          component={Link}
          href="/dashboard"
          variant="outlined"
        >
          Go to Dashboard
        </Button>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════
// 동적 라우트에서 not-found 트리거
// ═══════════════════════════════════════════

// app/[locale]/boards/[boardTypeId]/page.tsx
import { notFound } from 'next/navigation';

export default async function BoardPage({ params }) {
  const { boardTypeId } = await params;

  // 게시판 조회
  const boardType = await fetchBoardType(boardTypeId);

  // 게시판이 없으면 404
  if (!boardType) {
    notFound();  // ⭐ 가장 가까운 not-found.tsx 렌더링
  }

  return <BoardList boardType={boardType} />;
}`
        },
        {
          id: 'loading-error-example',
          title: 'loading.tsx와 error.tsx',
          description: '로딩과 에러 UI 예제',
          language: 'tsx',
          code: `// ═══════════════════════════════════════════
// loading.tsx - 로딩 UI
// ═══════════════════════════════════════════

// app/[locale]/admin/users/loading.tsx
import { Box, Skeleton, Stack } from '@mui/material';

export default function UsersLoading() {
  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 스켈레톤 */}
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />

      {/* 검색 바 스켈레톤 */}
      <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />

      {/* 테이블 스켈레톤 */}
      <Stack spacing={1}>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={52} />
        ))}
      </Stack>
    </Box>
  );
}

// ═══════════════════════════════════════════
// error.tsx - 에러 UI
// ═══════════════════════════════════════════

// app/[locale]/admin/error.tsx
'use client';  // ⭐ 필수: Error 컴포넌트는 Client Component

import { useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh, Home } from '@mui/icons-material';

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 에러 로깅
  useEffect(() => {
    console.error('Admin Error:', error);
    // 에러 리포팅 서비스로 전송 가능
    // reportError(error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        gap: 2
      }}
    >
      <Alert severity="error" sx={{ maxWidth: 500 }}>
        <Typography variant="h6" gutterBottom>
          Something went wrong!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message || 'An unexpected error occurred'}
        </Typography>
        {error.digest && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Error ID: {error.digest}
          </Typography>
        )}
      </Alert>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* ⭐ reset()으로 에러 복구 시도 */}
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => reset()}
        >
          Try Again
        </Button>

        <Button
          variant="outlined"
          startIcon={<Home />}
          href="/admin"
        >
          Go to Admin Home
        </Button>
      </Box>
    </Box>
  );
}

// 💡 특수 파일 적용 순서:
// 1. 가장 가까운 파일이 우선 적용
// 2. 없으면 상위 폴더의 파일 사용
// 3. 루트에도 없으면 Next.js 기본 UI`
        }
      ],
      tips: [
        '✅ loading.tsx는 Suspense boundary로, error.tsx는 Error boundary로 동작합니다.',
        '✅ error.tsx는 반드시 "use client"가 필요합니다.',
        '✅ reset() 함수로 에러 복구를 시도할 수 있습니다.',
        'ℹ️ 더 가까운 특수 파일이 우선 적용됩니다.'
      ]
    },
    {
      id: 'navigation',
      title: 'Navigation',
      titleKo: '네비게이션',
      content: `
## 네비게이션 방법

App Router에서 페이지 간 이동하는 방법들입니다.

### 1. Link 컴포넌트

\`\`\`tsx
import Link from 'next/link';

// 기본 사용
<Link href="/dashboard">Dashboard</Link>

// 동적 경로
<Link href={\`/users/\${userId}\`}>User Profile</Link>

// 객체 형태
<Link
  href={{
    pathname: '/search',
    query: { q: 'hello' }
  }}
>
  Search
</Link>

// prefetch 비활성화
<Link href="/heavy-page" prefetch={false}>
  Heavy Page
</Link>
\`\`\`

### 2. useRouter (Client Component)

\`\`\`tsx
'use client';

import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();

  // 페이지 이동
  router.push('/dashboard');

  // 히스토리 대체 (뒤로가기 불가)
  router.replace('/login');

  // 뒤로 가기
  router.back();

  // 앞으로 가기
  router.forward();

  // 새로고침 (서버 컴포넌트 재실행)
  router.refresh();

  // prefetch
  router.prefetch('/about');
}
\`\`\`

### 3. redirect (Server Component)

\`\`\`tsx
import { redirect } from 'next/navigation';

// Server Component에서
async function Page({ params }) {
  const user = await getUser(params.id);

  if (!user) {
    redirect('/login');  // 서버에서 리다이렉트
  }

  return <div>{user.name}</div>;
}

// Server Action에서
async function createPost(data) {
  'use server';

  await savePost(data);
  redirect('/posts');  // 생성 후 리다이렉트
}
\`\`\`

### 4. usePathname, useSearchParams

\`\`\`tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';

function MyComponent() {
  const pathname = usePathname();
  // /en/dashboard/settings

  const searchParams = useSearchParams();
  // ?tab=profile&page=1

  const tab = searchParams.get('tab');  // 'profile'
  const page = searchParams.get('page'); // '1'
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'navigation-patterns',
          title: '네비게이션 패턴',
          description: '다양한 네비게이션 사용 예제',
          language: 'tsx',
          code: `// 네비게이션 패턴 예제

'use client';

import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';

// ═══════════════════════════════════════════
// 패턴 1: 로케일 포함 Link
// ═══════════════════════════════════════════

function LocaleLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
}) {
  const locale = useCurrentLocale();

  // /dashboard → /ko/dashboard
  const localizedHref = href.startsWith('/')
    ? \`/\${locale}\${href}\`
    : href;

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}

// 사용
<LocaleLink href="/dashboard">Dashboard</LocaleLink>
// → /ko/dashboard 또는 /en/dashboard

// ═══════════════════════════════════════════
// 패턴 2: 프로그래밍 방식 네비게이션
// ═══════════════════════════════════════════

function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useCurrentLocale();
  const boardTypeId = params.boardTypeId as string;
  const postId = params.postId as string;

  // 편집 페이지로 이동
  const handleEdit = () => {
    router.push(\`/\${locale}/boards/\${boardTypeId}/\${postId}/edit\`);
  };

  // 목록으로 돌아가기
  const handleBack = () => {
    router.push(\`/\${locale}/boards/\${boardTypeId}\`);
  };

  // 삭제 후 목록으로 (히스토리 대체)
  const handleDelete = async () => {
    await deletePost(postId);
    router.replace(\`/\${locale}/boards/\${boardTypeId}\`);
    // replace: 현재 페이지가 히스토리에서 제거됨
  };

  return (
    <Box>
      <IconButton onClick={handleBack}>
        <ArrowBack />
      </IconButton>
      <Button onClick={handleEdit}>Edit</Button>
      <Button onClick={handleDelete}>Delete</Button>
    </Box>
  );
}

// ═══════════════════════════════════════════
// 패턴 3: 쿼리 파라미터 관리
// ═══════════════════════════════════════════

function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 현재 파라미터 가져오기
  const currentQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  // 검색어 변경
  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query);
    params.set('page', '1');  // 검색 시 1페이지로
    router.push(\`\${pathname}?\${params.toString()}\`);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(\`\${pathname}?\${params.toString()}\`);
  };

  return (
    <Box>
      <TextField
        value={currentQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      <Pagination
        page={currentPage}
        onChange={(_, page) => handlePageChange(page)}
      />
    </Box>
  );
}

// ═══════════════════════════════════════════
// 패턴 4: 조건부 네비게이션
// ═══════════════════════════════════════════

function SaveButton({ onSave }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await onSave();

      if (result.success) {
        // 성공 시 이전 페이지로
        router.back();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button onClick={handleSave} disabled={saving}>
      {saving ? 'Saving...' : 'Save'}
    </Button>
  );
}`
        }
      ],
      tips: [
        '✅ 클릭 가능한 요소에는 Link 컴포넌트를 사용하세요 (SEO, 접근성).',
        '✅ 이벤트 핸들러에서는 useRouter를 사용하세요.',
        '✅ Server Component에서는 redirect()를 사용하세요.',
        '⚠️ useRouter는 Client Component에서만 사용 가능합니다.'
      ]
    }
  ],
  references: [
    {
      title: 'Next.js 공식 문서 - App Router',
      url: 'https://nextjs.org/docs/app',
      type: 'documentation'
    },
    {
      title: 'Next.js 공식 문서 - Routing',
      url: 'https://nextjs.org/docs/app/building-your-application/routing',
      type: 'documentation'
    },
    {
      title: 'Next.js 공식 문서 - Middleware',
      url: 'https://nextjs.org/docs/app/building-your-application/routing/middleware',
      type: 'documentation'
    },
    {
      title: 'Next.js 공식 문서 - Dynamic Routes',
      url: 'https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
