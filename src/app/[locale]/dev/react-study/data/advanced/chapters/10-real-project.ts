/**
 * Chapter 10: 실전 프로젝트 - 관리자 대시보드
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'real-project',
  order: 10,
  title: 'Real Project - Admin Dashboard',
  titleKo: '실전 프로젝트 - 관리자 대시보드',
  description: 'Comprehensive analysis of the current admin dashboard project architecture.',
  descriptionKo: '현재 관리자 대시보드 프로젝트의 전체 아키텍처를 종합적으로 분석합니다.',
  estimatedMinutes: 90,
  objectives: [
    'Review overall architecture',
    'Understand authentication system',
    'Analyze CRUD management patterns',
    'Implement role-based UI control',
    'Support internationalization (i18n)'
  ],
  objectivesKo: [
    '전체 아키텍처를 리뷰한다',
    '인증 시스템 구현을 이해한다',
    'CRUD 관리 화면 패턴을 분석한다',
    '권한 기반 UI 제어를 구현한다',
    '다국어(i18n) 지원을 적용한다'
  ],
  sections: [
    {
      id: 'architecture-review',
      title: 'Architecture Review',
      titleKo: '전체 아키텍처 리뷰',
      content: `
## 프로젝트 개요

**nextjs-enterprise-app**은 엔터프라이즈급 관리자 대시보드 템플릿입니다.

### 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **UI** | MUI (Material-UI) v6 |
| **상태관리** | React Context, Custom Hooks |
| **스타일링** | Emotion (MUI 내장) |
| **API** | Axios, REST API |
| **인증** | JWT, Context API |
| **다국어** | 커스텀 i18n 시스템 |
| **백엔드** | Express.js, PostgreSQL |

### 폴더 구조

\`\`\`
nextjs-enterprise-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── [locale]/           # 다국어 동적 라우트
│   │       ├── admin/          # 관리자 페이지들
│   │       ├── boards/         # 게시판 기능
│   │       └── dev/            # 개발자 도구
│   │
│   ├── components/             # 공유 컴포넌트
│   │   ├── common/             # 범용 UI 컴포넌트
│   │   ├── admin/              # Admin 전용 컴포넌트
│   │   └── layout/             # 레이아웃 컴포넌트
│   │
│   ├── hooks/                  # 공유 커스텀 훅
│   ├── lib/                    # 유틸리티, 설정
│   ├── providers/              # Context Providers
│   └── types/                  # TypeScript 타입
│
├── backend/                    # Express.js API 서버
│   ├── routes/                 # API 라우트
│   ├── services/               # 비즈니스 로직
│   └── middlewares/            # 미들웨어
│
└── public/                     # 정적 파일
\`\`\`
      `,
      codeExamples: [
        {
          id: 'architecture-layers',
          title: '아키텍처 계층',
          description: '계층별 책임과 의존성',
          language: 'typescript',
          code: `// 아키텍처 계층 분석

/*
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  app/[locale]/admin/*/page.tsx                              │
│  - UI 렌더링                                                 │
│  - 사용자 상호작용                                            │
│  - 레이아웃 구성                                              │
├─────────────────────────────────────────────────────────────┤
│                     Component Layer                          │
│  components/common/, components/admin/                       │
│  - 재사용 가능한 UI 컴포넌트                                   │
│  - DataGrid, FormDialog, Badge 등                           │
├─────────────────────────────────────────────────────────────┤
│                     Business Logic Layer                     │
│  hooks/, app/[locale]/admin/*/hooks/                        │
│  - 상태 관리 (CRUD 로직)                                     │
│  - useUserManagement, useDepartmentManagement 등            │
├─────────────────────────────────────────────────────────────┤
│                     Data Access Layer                        │
│  lib/axios/                                                  │
│  - API 클라이언트                                            │
│  - 요청/응답 인터셉터                                         │
├─────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                     │
│  lib/, providers/, types/                                    │
│  - 설정, 유틸리티                                            │
│  - Context Providers                                        │
│  - 타입 정의                                                 │
└─────────────────────────────────────────────────────────────┘
*/

// 의존성 방향 예시
// page.tsx → hooks → lib/axios → backend API
// (상위 → 하위로만 의존)

// app/[locale]/admin/users/page.tsx
import { useUserManagement } from './hooks/useUserManagement';  // ↓
import { DataGrid } from '@/components/common';                  // ↓
import { columns } from './constants';                           // →

// hooks/useUserManagement.ts
import { axiosInstance } from '@/lib/axios';                     // ↓
import { User } from '@/types';                                  // ↓

// lib/axios/index.ts
import axios from 'axios';                                       // 외부
// (가장 하위 계층 - 내부 모듈 의존성 없음)`
        },
        {
          id: 'feature-structure',
          title: 'Feature 구조',
          description: '관리자 기능별 파일 구조',
          language: 'typescript',
          code: `// 관리자 기능별 일관된 구조

/*
src/app/[locale]/admin/users/        # 사용자 관리
├── page.tsx                         # 페이지 컴포넌트
├── hooks/
│   └── useUserManagement.ts         # CRUD 비즈니스 로직
├── constants.tsx                    # DataGrid 컬럼, 상수
└── components/                      # 기능 전용 컴포넌트 (옵션)
    └── UserFormFields.tsx

src/app/[locale]/admin/departments/  # 부서 관리 (동일 구조)
├── page.tsx
├── hooks/
│   └── useDepartmentManagement.ts
└── constants.tsx

src/app/[locale]/admin/roles/        # 역할 관리 (동일 구조)
├── page.tsx
├── hooks/
│   └── useRoleManagement.ts
└── constants.tsx
*/

// 이 일관된 구조의 장점:
// 1. 예측 가능성: 어디서 무엇을 찾을지 명확
// 2. 복사-붙여넣기: 새 기능 빠른 시작
// 3. 코드 리뷰: 패턴이 익숙하여 효율적
// 4. 온보딩: 새 팀원이 구조를 빠르게 파악

// 패턴 요약
// - page.tsx: UI 렌더링, 훅 사용
// - hooks/useXXXManagement.ts: CRUD 상태와 로직
// - constants.tsx: 설정 데이터 (컬럼 정의 등)`
        }
      ],
      tips: [
        '✅ 새 기능 추가 시 기존 패턴을 따라 일관성을 유지하세요.',
        '✅ 공통 컴포넌트는 components/common에, 기능 전용은 해당 폴더에 배치하세요.',
        'ℹ️ 의존성은 항상 상위 → 하위 방향으로 유지하세요.'
      ]
    },
    {
      id: 'auth-system',
      title: 'Authentication System',
      titleKo: '인증 시스템 구현',
      content: `
## 인증 흐름

\`\`\`
[로그인 페이지]
     │
     ↓ 이메일/비밀번호
[POST /api/auth/login]
     │
     ↓ JWT 토큰 발급
[토큰 저장 (localStorage)]
     │
     ↓ AuthContext 업데이트
[보호된 페이지 접근 가능]
\`\`\`

### AuthContext 구조

| 상태/메서드 | 설명 |
|-------------|------|
| user | 현재 로그인한 사용자 |
| isLoading | 인증 상태 로딩 중 |
| isAuthenticated | 로그인 여부 |
| login() | 로그인 처리 |
| logout() | 로그아웃 처리 |
| hasPermission() | 권한 확인 |
      `,
      codeExamples: [
        {
          id: 'auth-provider',
          title: 'AuthProvider 분석',
          description: '인증 컨텍스트 구현',
          fileName: 'src/providers/AuthProvider.tsx',
          language: 'tsx',
          code: `// providers/AuthProvider.tsx 분석

// 인증 상태 타입
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Context 타입
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // 1. 초기 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token');

      if (token) {
        try {
          // 토큰 유효성 검증
          const response = await axiosInstance.get('/auth/me');
          setState({
            user: response.data,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch {
          // 토큰 만료/무효
          localStorage.removeItem('auth-token');
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  // 2. 로그인
  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;
    localStorage.setItem('auth-token', token);

    setState({
      user,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  // 3. 로그아웃
  const logout = async () => {
    localStorage.removeItem('auth-token');
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  // 4. 권한 확인
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

// 훅으로 간편하게 사용
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}`
        },
        {
          id: 'protected-route',
          title: '보호된 라우트',
          description: '인증 필요 페이지 처리',
          language: 'tsx',
          code: `// 인증이 필요한 페이지 보호

// 1. 레이아웃 레벨 보호
// app/[locale]/admin/layout.tsx
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <AdminSidebar />
      <main>{children}</main>
    </AuthGuard>
  );
}

// 2. AuthGuard 컴포넌트
function AuthGuard({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: string;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [isLoading, isAuthenticated, router]);

  // 로딩 중
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // 미인증
  if (!isAuthenticated) {
    return null; // 리다이렉트 중
  }

  // 권한 부족
  if (requiredRole && user?.role !== requiredRole) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

// 3. 미들웨어 레벨 보호 (선택)
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};`
        }
      ],
      tips: [
        '✅ 인증 상태는 전역 Context로 관리하여 어디서든 접근 가능하게 하세요.',
        '✅ 보호된 라우트는 레이아웃 레벨에서 처리하면 중복을 줄일 수 있습니다.',
        '⚠️ 토큰은 localStorage보다 httpOnly 쿠키가 더 안전합니다.',
        'ℹ️ isLoading 상태로 인증 확인 중 깜빡임을 방지하세요.'
      ]
    },
    {
      id: 'crud-patterns',
      title: 'CRUD Patterns',
      titleKo: 'CRUD 관리 화면 패턴',
      content: `
## 관리 화면 구성 요소

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  [제목]                              [추가 버튼]        │
├─────────────────────────────────────────────────────────┤
│  [검색] [필터...]                                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────┬──────────┬──────────┬─────────────────────┐   │
│  │ ID  │ 이름      │ 상태     │ 액션                │   │
│  ├─────┼──────────┼──────────┼─────────────────────┤   │
│  │ 1   │ Kim      │ 활성     │ [수정] [삭제]       │   │
│  │ 2   │ Lee      │ 비활성   │ [수정] [삭제]       │   │
│  └─────┴──────────┴──────────┴─────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  [페이지네이션]                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 표준 패턴

1. **DataGrid**: 목록 표시
2. **FormDialog**: 생성/수정 모달
3. **ConfirmDialog**: 삭제 확인
4. **QuickSearchBar**: 검색 및 필터
      `,
      codeExamples: [
        {
          id: 'crud-hook',
          title: 'useXXXManagement 패턴',
          description: '표준 CRUD 훅 구조',
          fileName: 'src/app/[locale]/admin/users/hooks/useUserManagement.ts',
          language: 'typescript',
          code: `// 표준 CRUD 관리 훅 패턴

export function useUserManagement() {
  // ========================================
  // 1. 상태 정의
  // ========================================
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  // 선택된 항목 (수정/삭제용)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ========================================
  // 2. 공통 훅 사용
  // ========================================
  const { showSuccess, showError } = useMessage();
  const { page, pageSize, setPage, handlePageChange } = usePageState();

  // ========================================
  // 3. CRUD 함수
  // ========================================

  // Read: 목록 조회
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/user', {
        params: { page, limit: pageSize },
      });
      setUsers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      showError('사용자 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, showError]);

  // Create: 생성
  const createUser = async (data: CreateUserDto) => {
    const response = await axiosInstance.post('/user', data);
    setUsers(prev => [...prev, response.data]);
    showSuccess('사용자가 생성되었습니다');
    return response.data;
  };

  // Update: 수정
  const updateUser = async (id: number, data: UpdateUserDto) => {
    const response = await axiosInstance.patch(\`/user/\${id}\`, data);
    setUsers(prev =>
      prev.map(user => (user.id === id ? response.data : user))
    );
    showSuccess('사용자 정보가 수정되었습니다');
    return response.data;
  };

  // Delete: 삭제
  const deleteUser = async () => {
    if (!selectedUser) return;
    await axiosInstance.delete(\`/user/\${selectedUser.id}\`);
    setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
    showSuccess('사용자가 삭제되었습니다');
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // ========================================
  // 4. 핸들러 함수
  // ========================================

  const handleAdd = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (data: CreateUserDto | UpdateUserDto) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      await createUser(data as CreateUserDto);
    }
    handleDialogClose();
  };

  // ========================================
  // 5. 초기 데이터 로드
  // ========================================
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ========================================
  // 6. Public API 반환
  // ========================================
  return {
    // 상태
    users,
    loading,
    totalPages,
    page,
    pageSize,
    selectedUser,
    dialogOpen,
    deleteDialogOpen,

    // 핸들러
    handleAdd,
    handleEdit,
    handleDelete,
    handleDialogClose,
    handleSubmit,
    handlePageChange,
    handleDeleteConfirm: deleteUser,

    // 유틸리티
    setPage,
    fetchUsers,
  };
}`
        },
        {
          id: 'crud-page',
          title: '관리 페이지 구현',
          description: '훅을 사용하는 페이지',
          fileName: 'src/app/[locale]/admin/users/page.tsx',
          language: 'tsx',
          code: `// 표준 관리 페이지 구현
'use client';

import { DataGrid } from '@/components/common/DataGrid';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { useUserManagement } from './hooks/useUserManagement';
import { columns } from './constants';
import { UserFormFields } from './components/UserFormFields';

export default function UsersPage() {
  const {
    // 상태
    users,
    loading,
    totalPages,
    page,
    pageSize,
    selectedUser,
    dialogOpen,
    deleteDialogOpen,

    // 핸들러
    handleAdd,
    handleEdit,
    handleDelete,
    handleDialogClose,
    handleSubmit,
    handlePageChange,
    handleDeleteConfirm,
  } = useUserManagement();

  return (
    <>
      {/* 페이지 헤더 */}
      <PageHeader
        title="사용자 관리"
        subtitle="시스템 사용자를 관리합니다"
        action={
          <Button variant="contained" onClick={handleAdd}>
            사용자 추가
          </Button>
        }
      />

      {/* 데이터 그리드 */}
      <DataGrid
        rows={users}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          pageSize,
          totalPages,
          onPageChange: handlePageChange,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 생성/수정 다이얼로그 */}
      <FormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        title={selectedUser ? '사용자 수정' : '사용자 추가'}
        initialData={selectedUser}
      >
        <UserFormFields />
      </FormDialog>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="사용자 삭제"
        message={\`\${selectedUser?.name}을(를) 삭제하시겠습니까?\`}
      />
    </>
  );
}`
        },
        {
          id: 'columns-config',
          title: '컬럼 설정',
          description: 'DataGrid 컬럼 정의',
          fileName: 'src/app/[locale]/admin/users/constants.tsx',
          language: 'tsx',
          code: `// 컬럼 정의 패턴
import { ColumnDef } from '@/components/common/DataGrid';
import { Badge } from '@/components/common/Badge';
import { User } from '@/types';

export const columns: ColumnDef<User>[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 80,
  },
  {
    field: 'username',
    headerName: '아이디',
    width: 150,
  },
  {
    field: 'name',
    headerName: '이름',
    width: 150,
  },
  {
    field: 'email',
    headerName: '이메일',
    width: 200,
  },
  {
    field: 'role',
    headerName: '역할',
    width: 120,
    renderCell: (row) => (
      <Badge variant={row.role === 'admin' ? 'primary' : 'default'}>
        {row.role}
      </Badge>
    ),
  },
  {
    field: 'status',
    headerName: '상태',
    width: 100,
    renderCell: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'error'}>
        {row.status === 'active' ? '활성' : '비활성'}
      </Badge>
    ),
  },
  {
    field: 'createdAt',
    headerName: '생성일',
    width: 150,
    valueGetter: (row) => new Date(row.createdAt).toLocaleDateString('ko-KR'),
  },
];

// 폼 필드 설정
export const formFields = [
  { name: 'username', label: '아이디', required: true },
  { name: 'name', label: '이름', required: true },
  { name: 'email', label: '이메일', type: 'email', required: true },
  { name: 'role', label: '역할', type: 'select', options: ['user', 'admin'] },
];`
        }
      ],
      tips: [
        '✅ 모든 관리 페이지에서 동일한 훅 패턴을 사용하여 일관성을 유지하세요.',
        '✅ 컬럼 정의는 별도 파일로 분리하여 가독성을 높이세요.',
        '⚠️ 비즈니스 로직은 훅에, UI 로직은 페이지에 분리하세요.',
        'ℹ️ 새 관리 기능 추가 시 기존 패턴을 복사하여 빠르게 시작하세요.'
      ]
    },
    {
      id: 'permission-control',
      title: 'Permission-based UI',
      titleKo: '권한 기반 UI 제어',
      content: `
## 권한 기반 UI 제어

사용자 권한에 따라 **UI 요소를 동적으로** 표시/숨김합니다.

### 권한 체계

\`\`\`
역할(Role)
├── admin
│   ├── users:read
│   ├── users:write
│   ├── users:delete
│   └── ...
└── user
    ├── profile:read
    ├── profile:write
    └── ...
\`\`\`

### 구현 패턴

1. **컴포넌트 레벨**: 권한에 따라 렌더링
2. **라우트 레벨**: 페이지 접근 제어
3. **API 레벨**: 서버에서 최종 검증
      `,
      codeExamples: [
        {
          id: 'permission-component',
          title: '권한 기반 컴포넌트',
          description: 'Permission 컴포넌트',
          language: 'tsx',
          code: `// 권한 체크 컴포넌트

// 1. Permission 래퍼 컴포넌트
interface PermissionProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

function Permission({ permission, children, fallback = null }: PermissionProps) {
  const { hasPermission } = useAuth();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = permissions.some((p) => hasPermission(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 2. 사용 예시
function UserActions({ user }: { user: User }) {
  return (
    <Box>
      <Permission permission="users:read">
        <Button onClick={() => viewUser(user.id)}>보기</Button>
      </Permission>

      <Permission permission="users:write">
        <Button onClick={() => editUser(user.id)}>수정</Button>
      </Permission>

      <Permission permission="users:delete">
        <Button color="error" onClick={() => deleteUser(user.id)}>
          삭제
        </Button>
      </Permission>
    </Box>
  );
}

// 3. 여러 권한 중 하나 (OR)
<Permission permission={['users:write', 'users:admin']}>
  <AdminPanel />
</Permission>

// 4. 모든 권한 필요 (AND)
function RequireAllPermissions({
  permissions,
  children,
}: {
  permissions: string[];
  children: ReactNode;
}) {
  const { hasPermission } = useAuth();
  const hasAll = permissions.every((p) => hasPermission(p));

  if (!hasAll) return null;
  return <>{children}</>;
}

// 5. 폴백 UI 제공
<Permission
  permission="premium:feature"
  fallback={<UpgradePrompt />}
>
  <PremiumFeature />
</Permission>`
        },
        {
          id: 'permission-hook',
          title: '권한 훅',
          description: 'usePermissions 커스텀 훅',
          language: 'typescript',
          code: `// hooks/usePermissions.ts

interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isAdmin: boolean;
  canAccess: (resource: string, action: string) => boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    return new Set(user?.permissions ?? []);
  }, [user?.permissions]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    // 관리자는 모든 권한
    if (user.role === 'admin') return true;

    // 와일드카드 체크 (users:* → users:read, users:write 등)
    const [resource] = permission.split(':');
    if (permissions.has(\`\${resource}:*\`)) return true;

    return permissions.has(permission);
  }, [user, permissions]);

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    return perms.some(hasPermission);
  }, [hasPermission]);

  const hasAllPermissions = useCallback((perms: string[]): boolean => {
    return perms.every(hasPermission);
  }, [hasPermission]);

  const isAdmin = user?.role === 'admin';

  const canAccess = useCallback((resource: string, action: string): boolean => {
    return hasPermission(\`\${resource}:\${action}\`);
  }, [hasPermission]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    canAccess,
  };
}

// 사용 예시
function UsersPage() {
  const { canAccess, isAdmin } = usePermissions();

  return (
    <div>
      {canAccess('users', 'write') && (
        <Button onClick={handleAdd}>추가</Button>
      )}

      {isAdmin && (
        <Button onClick={handleBulkDelete}>일괄 삭제</Button>
      )}
    </div>
  );
}`
        }
      ],
      tips: [
        '✅ 프론트엔드 권한 체크는 UX용입니다. 반드시 서버에서도 검증하세요.',
        '✅ 권한 체크를 컴포넌트로 분리하면 재사용성이 높아집니다.',
        '⚠️ 관리자(admin)는 모든 권한을 가진다고 가정하면 로직이 단순해집니다.',
        'ℹ️ 권한이 없으면 버튼을 숨기거나 비활성화하여 UX를 개선하세요.'
      ]
    },
    {
      id: 'i18n-support',
      title: 'Internationalization',
      titleKo: '다국어(i18n) 지원',
      content: `
## 다국어 지원 구조

\`\`\`
app/
└── [locale]/          # 동적 로케일 라우트
    ├── layout.tsx     # 로케일별 레이아웃
    └── page.tsx

lib/i18n/
├── locales/
│   ├── en.ts
│   ├── ko.ts
│   ├── zh.ts
│   └── vi.ts
└── index.ts           # useTranslation 훅
\`\`\`

### 지원 언어

| 코드 | 언어 |
|------|------|
| en | English |
| ko | 한국어 |
| zh | 中文 |
| vi | Tiếng Việt |
      `,
      codeExamples: [
        {
          id: 'i18n-system',
          title: '다국어 시스템',
          description: '번역 훅 구현',
          fileName: 'src/lib/i18n/index.ts',
          language: 'typescript',
          code: `// lib/i18n/index.ts
import { useParams } from 'next/navigation';
import en from './locales/en';
import ko from './locales/ko';
import zh from './locales/zh';
import vi from './locales/vi';

// 지원 로케일
export const locales = ['en', 'ko', 'zh', 'vi'] as const;
export type Locale = typeof locales[number];

// 기본 로케일
export const defaultLocale: Locale = 'ko';

// 번역 데이터
const translations: Record<Locale, typeof en> = {
  en,
  ko,
  zh,
  vi,
};

// 번역 훅
export function useTranslation() {
  const params = useParams();
  const locale = (params?.locale as Locale) || defaultLocale;
  const t = translations[locale];

  return {
    t,
    locale,
    locales,
  };
}

// 서버 컴포넌트용
export function getTranslation(locale: Locale) {
  return translations[locale] || translations[defaultLocale];
}

// 로케일 검증
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}`
        },
        {
          id: 'translation-file',
          title: '번역 파일 구조',
          description: '타입 안전한 번역',
          fileName: 'src/lib/i18n/locales/ko.ts',
          language: 'typescript',
          code: `// lib/i18n/locales/ko.ts
const ko = {
  common: {
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    edit: '수정',
    add: '추가',
    search: '검색',
    loading: '로딩 중...',
    noData: '데이터가 없습니다',
    confirm: '확인',
    success: '성공',
    error: '오류',
  },

  auth: {
    login: '로그인',
    logout: '로그아웃',
    email: '이메일',
    password: '비밀번호',
    loginFailed: '로그인에 실패했습니다',
    logoutSuccess: '로그아웃되었습니다',
  },

  users: {
    title: '사용자 관리',
    subtitle: '시스템 사용자를 관리합니다',
    addUser: '사용자 추가',
    editUser: '사용자 수정',
    deleteConfirm: '{name}을(를) 삭제하시겠습니까?',
    fields: {
      username: '아이디',
      name: '이름',
      email: '이메일',
      role: '역할',
      status: '상태',
      createdAt: '생성일',
    },
  },

  departments: {
    title: '부서 관리',
    subtitle: '조직 부서를 관리합니다',
    // ...
  },

  validation: {
    required: '{field}은(는) 필수입니다',
    email: '유효한 이메일을 입력하세요',
    minLength: '{field}은(는) {min}자 이상이어야 합니다',
    maxLength: '{field}은(는) {max}자 이하여야 합니다',
  },
};

export default ko;

// lib/i18n/locales/en.ts
const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    // ...
  },
  // ... 동일 구조
};

export default en;`
        },
        {
          id: 'i18n-usage',
          title: '다국어 사용 예시',
          description: '컴포넌트에서 번역 사용',
          language: 'tsx',
          code: `// 번역 사용 예시

// 1. 클라이언트 컴포넌트
'use client';

import { useTranslation } from '@/lib/i18n';

function UsersPage() {
  const { t, locale } = useTranslation();

  return (
    <div>
      <h1>{t.users.title}</h1>
      <p>{t.users.subtitle}</p>

      <Button>{t.users.addUser}</Button>

      {/* 동적 값 포함 */}
      <p>
        {t.users.deleteConfirm.replace('{name}', selectedUser?.name || '')}
      </p>
    </div>
  );
}

// 2. 서버 컴포넌트
import { getTranslation, type Locale } from '@/lib/i18n';

async function UsersPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslation(params.locale);

  return (
    <div>
      <h1>{t.users.title}</h1>
    </div>
  );
}

// 3. 언어 선택기
function LocaleSwitcher() {
  const { locale, locales } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // /ko/admin/users → /en/admin/users
    const newPath = pathname.replace(\`/\${locale}\`, \`/\${newLocale}\`);
    router.push(newPath);
  };

  return (
    <Select value={locale} onChange={(e) => handleChange(e.target.value)}>
      {locales.map((loc) => (
        <MenuItem key={loc} value={loc}>
          {loc.toUpperCase()}
        </MenuItem>
      ))}
    </Select>
  );
}

// 4. 폼 검증 메시지
function validateField(field: string, value: string, rules: any) {
  const { t } = useTranslation();

  if (rules.required && !value) {
    return t.validation.required.replace('{field}', field);
  }

  if (rules.minLength && value.length < rules.minLength) {
    return t.validation.minLength
      .replace('{field}', field)
      .replace('{min}', rules.minLength);
  }

  return null;
}`
        }
      ],
      tips: [
        '✅ 번역 키는 계층적으로 구성하여 관리하기 쉽게 하세요.',
        '✅ TypeScript로 번역 객체 타입을 정의하면 자동완성이 가능합니다.',
        '⚠️ 동적 값({name} 등)은 replace로 처리하거나 포맷 함수를 만드세요.',
        'ℹ️ 서버 컴포넌트에서는 params.locale로 직접 번역을 가져오세요.'
      ]
    }
  ],
  references: [
    {
      title: 'Next.js App Router',
      url: 'https://nextjs.org/docs/app',
      type: 'documentation'
    },
    {
      title: 'MUI Components',
      url: 'https://mui.com/material-ui/',
      type: 'documentation'
    },
    {
      title: 'React Patterns',
      url: 'https://www.patterns.dev/react',
      type: 'article'
    }
  ],
  status: 'ready'
};

export default chapter;
