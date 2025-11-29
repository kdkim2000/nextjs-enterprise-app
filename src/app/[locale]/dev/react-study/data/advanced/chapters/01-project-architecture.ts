/**
 * Chapter 1: 프로젝트 아키텍처 설계
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'project-architecture',
  order: 1,
  title: 'Project Architecture Design',
  titleKo: '프로젝트 아키텍처 설계',
  description: 'Learn how to design scalable and maintainable project structures for enterprise React applications.',
  descriptionKo: '대규모 React 애플리케이션을 위한 확장 가능하고 유지보수하기 쉬운 프로젝트 구조를 설계하는 방법을 학습합니다.',
  estimatedMinutes: 60,
  objectives: [
    'Understand different folder structure strategies',
    'Apply separation of concerns principles',
    'Design module boundaries and public APIs',
    'Manage dependency directions effectively'
  ],
  objectivesKo: [
    '다양한 폴더 구조 전략을 이해한다',
    '관심사 분리 원칙을 적용한다',
    '모듈 경계와 public API를 설계한다',
    '의존성 방향을 효과적으로 관리한다'
  ],
  sections: [
    {
      id: 'folder-structure-strategies',
      title: 'Folder Structure Strategies',
      titleKo: '폴더 구조 전략 (Feature-based vs Layer-based)',
      content: `
## 폴더 구조의 중요성

프로젝트 폴더 구조는 코드의 **발견 가능성(Discoverability)** 과 **유지보수성**에 직접적인 영향을 미칩니다.

### 두 가지 주요 전략

| 전략 | 특징 | 적합한 경우 |
|------|------|------------|
| **Layer-based** | 기술적 역할로 분류 (components, hooks, utils) | 소규모 프로젝트, 팀 초기 |
| **Feature-based** | 비즈니스 기능으로 분류 (users, products, orders) | 대규모 프로젝트, 다수 팀 |

### Layer-based 구조

\`\`\`
src/
├── components/     # 모든 컴포넌트
│   ├── Button/
│   ├── Modal/
│   └── DataGrid/
├── hooks/          # 모든 훅
│   ├── useAuth.ts
│   └── useForm.ts
├── utils/          # 모든 유틸리티
├── services/       # API 서비스
└── types/          # 타입 정의
\`\`\`

**장점:**
- 직관적이고 배우기 쉬움
- 재사용 컴포넌트 발견 용이

**단점:**
- 기능별 관련 코드가 분산됨
- 대규모 프로젝트에서 파일 찾기 어려움

### Feature-based 구조

\`\`\`
src/
├── features/
│   ├── auth/           # 인증 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   ├── users/          # 사용자 관리
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   └── products/       # 상품 관리
├── shared/             # 공통 모듈
│   ├── components/
│   ├── hooks/
│   └── utils/
└── app/                # 라우팅/페이지
\`\`\`

**장점:**
- 관련 코드가 한 곳에 모임
- 기능 단위로 팀 분업 용이
- 코드 삭제/이동이 쉬움

**단점:**
- 초기 설계 비용
- 기능 간 공유 코드 관리 필요
      `,
      codeExamples: [
        {
          id: 'current-project-structure',
          title: '현재 프로젝트의 하이브리드 구조',
          description: 'Layer-based와 Feature-based를 혼합한 실용적 접근',
          language: 'typescript',
          code: `// 현재 프로젝트 구조 분석
src/
├── app/                          # Next.js App Router
│   └── [locale]/                 # 다국어 지원
│       ├── admin/                # Feature: 관리자 기능
│       │   ├── users/            # Sub-feature
│       │   │   ├── page.tsx
│       │   │   ├── hooks/
│       │   │   │   └── useUserManagement.ts
│       │   │   └── constants.tsx
│       │   ├── departments/
│       │   ├── roles/
│       │   └── ...
│       ├── boards/               # Feature: 게시판
│       └── dev/                  # Feature: 개발자 도구
│
├── components/                   # Layer: 공통 컴포넌트
│   ├── common/                   # 범용 UI 컴포넌트
│   │   ├── DataGrid/
│   │   ├── FormDialog/
│   │   └── Badge/
│   ├── admin/                    # Admin 전용 컴포넌트
│   └── layout/                   # 레이아웃 컴포넌트
│
├── hooks/                        # Layer: 공통 훅
│   ├── usePageState.ts
│   ├── useMessage.ts
│   └── ...
│
├── lib/                          # Layer: 라이브러리/유틸
│   ├── axios/
│   ├── i18n/
│   └── auth/
│
└── types/                        # Layer: 타입 정의
    └── index.ts

// 핵심: Feature 내부는 자체 구조, 공유 코드는 Layer로 분리`
        }
      ],
      tips: [
        '✅ 프로젝트 규모와 팀 구성에 맞는 전략을 선택하세요.',
        '✅ 100% 순수한 구조보다 실용적인 하이브리드가 효과적입니다.',
        'ℹ️ 시작은 단순하게, 필요에 따라 점진적으로 구조화하세요.'
      ]
    },
    {
      id: 'separation-of-concerns',
      title: 'Separation of Concerns',
      titleKo: '모듈화와 관심사 분리',
      content: `
## 관심사 분리 (Separation of Concerns)

각 모듈이 **하나의 책임**만 갖도록 분리합니다.

### 관심사 분리의 계층

\`\`\`
┌─────────────────────────────────────┐
│           Presentation Layer         │  UI 렌더링, 사용자 상호작용
├─────────────────────────────────────┤
│           Business Logic Layer       │  비즈니스 규칙, 상태 관리
├─────────────────────────────────────┤
│           Data Access Layer          │  API 호출, 데이터 변환
├─────────────────────────────────────┤
│           Infrastructure Layer       │  설정, 유틸리티, 타입
└─────────────────────────────────────┘
\`\`\`

### 실제 적용 예시

| 계층 | 현재 프로젝트 위치 | 역할 |
|------|-------------------|------|
| Presentation | \`components/\`, \`page.tsx\` | UI 컴포넌트, 페이지 |
| Business Logic | \`hooks/\`, \`features/*/hooks/\` | 상태 관리, 비즈니스 로직 |
| Data Access | \`lib/axios/\`, \`services/\` | API 클라이언트, 데이터 페칭 |
| Infrastructure | \`lib/\`, \`types/\`, \`config/\` | 공통 유틸, 설정 |

### 분리의 핵심 원칙

1. **단일 책임 원칙 (SRP)**: 하나의 모듈은 하나의 변경 이유만 가진다
2. **캡슐화**: 내부 구현을 숨기고 필요한 것만 노출
3. **낮은 결합도**: 모듈 간 의존성 최소화
4. **높은 응집도**: 관련 코드는 함께 배치
      `,
      codeExamples: [
        {
          id: 'soc-user-management',
          title: '사용자 관리 기능의 관심사 분리',
          description: 'hooks, components, types로 관심사 분리',
          fileName: 'src/app/[locale]/admin/users/hooks/useUserManagement.ts',
          language: 'tsx',
          code: `// =============================================
// Data Access Layer - API 서비스
// =============================================
// lib/axios/index.ts
export const axiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// =============================================
// Business Logic Layer - Custom Hook
// =============================================
// hooks/useUserManagement.ts
export function useUserManagement() {
  // 상태 관리
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 비즈니스 로직
  const fetchUsers = async (filters: UserFilters) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/user', { params: filters });
      setUsers(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserDto) => {
    const response = await axiosInstance.post('/user', data);
    setUsers(prev => [...prev, response.data]);
    return response.data;
  };

  // Public API만 노출
  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
}

// =============================================
// Presentation Layer - Page Component
// =============================================
// app/[locale]/admin/users/page.tsx
export default function UsersPage() {
  const { users, loading, fetchUsers, createUser } = useUserManagement();

  // UI 로직만 담당
  return (
    <AdminPageLayout title="사용자 관리">
      <DataGrid
        rows={users}
        loading={loading}
        columns={columns}
      />
      <UserFormDialog onSubmit={createUser} />
    </AdminPageLayout>
  );
}`
        },
        {
          id: 'colocation-pattern',
          title: 'Co-location 패턴',
          description: '관련 파일을 가까이 배치',
          language: 'typescript',
          code: `// Co-location: 관련 파일을 함께 배치
src/app/[locale]/admin/users/
├── page.tsx              # 페이지 컴포넌트
├── hooks/
│   └── useUserManagement.ts  # 비즈니스 로직
├── constants.tsx         # 컬럼 정의, 상수
├── components/           # 이 기능 전용 컴포넌트
│   ├── UserFormFields.tsx
│   └── UserRoleSelect.tsx
└── types.ts             # 이 기능 전용 타입

// 장점:
// 1. 기능 관련 모든 것이 한 폴더에
// 2. 기능 삭제 시 폴더만 삭제하면 됨
// 3. 다른 기능에 영향 없이 수정 가능

// vs 전통적 구조 (관련 파일이 분산됨)
src/
├── components/UserFormFields.tsx
├── hooks/useUserManagement.ts
├── constants/userConstants.ts
└── types/user.ts`
        }
      ],
      tips: [
        '✅ 한 파일이 너무 많은 일을 하면 분리를 고려하세요.',
        '✅ import 경로가 복잡하면 구조 개선 신호입니다.',
        '⚠️ 과도한 분리는 오히려 복잡도를 높입니다. 균형이 중요합니다.'
      ]
    },
    {
      id: 'barrel-exports',
      title: 'Barrel Exports',
      titleKo: 'Barrel exports와 public API',
      content: `
## Barrel Export 패턴

**Barrel**은 여러 모듈을 하나의 진입점으로 모아서 re-export하는 패턴입니다.

### index.ts를 통한 Public API

\`\`\`typescript
// components/common/index.ts (Barrel file)
export { Badge } from './Badge';
export { DataGrid } from './DataGrid';
export { FormDialog } from './FormDialog';

// 사용 시
import { Badge, DataGrid, FormDialog } from '@/components/common';
// vs
import { Badge } from '@/components/common/Badge';
import { DataGrid } from '@/components/common/DataGrid';
import { FormDialog } from '@/components/common/FormDialog';
\`\`\`

### Public API vs Internal

\`\`\`
components/
├── common/
│   ├── index.ts          # Public API (외부 노출)
│   ├── DataGrid/
│   │   ├── index.tsx     # Public: DataGrid
│   │   ├── DataGridHeader.tsx    # Internal
│   │   ├── DataGridRow.tsx       # Internal
│   │   └── useDataGrid.ts        # Internal
\`\`\`

### Barrel Export의 장단점

| 장점 | 단점 |
|------|------|
| 깔끔한 import 문 | Tree-shaking 영향 가능 |
| 캡슐화 (내부 숨김) | 순환 의존성 위험 |
| 리팩토링 용이 | 빌드 속도 저하 가능 |
| API 명시적 정의 | 과도한 re-export |
      `,
      codeExamples: [
        {
          id: 'barrel-export-example',
          title: '현재 프로젝트의 Barrel Export',
          description: 'components/common/index.ts 패턴',
          fileName: 'src/components/common/index.ts',
          language: 'typescript',
          code: `// src/components/common/index.ts
// Public API - 외부에서 사용 가능한 컴포넌트만 export

// UI 컴포넌트
export { Badge } from './Badge';
export { DataGrid } from './DataGrid';
export { FormDialog } from './FormDialog';
export { QuickSearchBar } from './QuickSearchBar';
export { CardGrid } from './CardGrid';
export { PageHeader } from './PageHeader';
export { ConfirmDialog } from './ConfirmDialog';

// 타입도 함께 export
export type { BadgeProps, BadgeVariant } from './Badge';
export type { DataGridProps, ColumnDef } from './DataGrid';
export type { FormDialogProps } from './FormDialog';

// 사용 예시
import {
  Badge,
  DataGrid,
  FormDialog,
  type ColumnDef
} from '@/components/common';`
        },
        {
          id: 'feature-barrel',
          title: 'Feature 모듈의 Barrel Export',
          description: '기능 단위로 public API 정의',
          language: 'typescript',
          code: `// features/auth/index.ts
// Auth 기능의 Public API

// 컴포넌트
export { LoginForm } from './components/LoginForm';
export { SignupForm } from './components/SignupForm';
export { ProtectedRoute } from './components/ProtectedRoute';

// 훅
export { useAuth } from './hooks/useAuth';
export { usePermissions } from './hooks/usePermissions';

// 컨텍스트
export { AuthProvider, useAuthContext } from './context/AuthContext';

// 타입
export type { User, AuthState, LoginCredentials } from './types';

// ❌ 내부 구현은 export하지 않음
// - AuthService (내부 API 호출)
// - tokenStorage (내부 토큰 관리)
// - authReducer (내부 상태 관리)

// 사용
import { useAuth, AuthProvider, type User } from '@/features/auth';`
        },
        {
          id: 'avoid-barrel-pitfalls',
          title: 'Barrel Export 주의사항',
          description: '순환 의존성과 Tree-shaking 문제',
          language: 'typescript',
          code: `// ❌ 순환 의존성 문제
// components/index.ts
export { Button } from './Button';
export { Modal } from './Modal';  // Modal이 Button을 import

// components/Modal/index.tsx
import { Button } from '../';  // 순환 의존성!

// ✅ 해결: 직접 import
// components/Modal/index.tsx
import { Button } from '../Button';

// ❌ Tree-shaking 문제 (모든 것을 import)
import { Button } from '@/components';  // 전체 번들 포함 가능

// ✅ 해결: 필요한 것만 직접 import (성능 중요 시)
import { Button } from '@/components/Button';

// 또는 package.json에 sideEffects 설정
{
  "sideEffects": false
}`
        }
      ],
      tips: [
        '✅ 모듈의 public API를 명시적으로 정의하세요.',
        '✅ 내부 구현은 index.ts에서 export하지 마세요.',
        '⚠️ 순환 의존성이 발생하면 직접 import로 해결하세요.',
        'ℹ️ 성능이 중요한 경우 barrel 대신 직접 import를 사용하세요.'
      ]
    },
    {
      id: 'dependency-direction',
      title: 'Dependency Direction',
      titleKo: '의존성 방향 설계',
      content: `
## 의존성 방향의 원칙

좋은 아키텍처는 **의존성이 한 방향으로** 흐릅니다.

### 의존성 규칙 (Dependency Rule)

\`\`\`
         ┌─────────────────────┐
         │   Presentation      │  pages, components
         │   (UI Layer)        │
         └──────────┬──────────┘
                    │ depends on
         ┌──────────▼──────────┐
         │   Business Logic    │  hooks, services
         │   (Domain Layer)    │
         └──────────┬──────────┘
                    │ depends on
         ┌──────────▼──────────┐
         │   Infrastructure    │  lib, utils, types
         │   (Core Layer)      │
         └─────────────────────┘

Rule: 화살표는 항상 아래 방향으로!
      (상위 계층 → 하위 계층)
\`\`\`

### 의존성 방향 원칙

| 규칙 | 설명 |
|------|------|
| **단방향 의존성** | A → B면 B → A 금지 |
| **상위 → 하위** | UI → Logic → Infra |
| **구체 → 추상** | 구현체는 인터페이스에 의존 |
| **Feature 독립** | Feature 간 직접 의존 금지 |

### Feature 간 의존성 관리

\`\`\`
❌ 잘못된 의존성 (Feature 간 직접 의존)
features/
├── orders/
│   └── OrderList.tsx  →  import { UserBadge } from '../users/...'
└── users/
    └── UserBadge.tsx

✅ 올바른 의존성 (공유 모듈 활용)
features/
├── orders/
│   └── OrderList.tsx  →  import { Badge } from '@/components/common'
├── users/
│   └── UserList.tsx   →  import { Badge } from '@/components/common'
└── shared/
    └── components/
        └── Badge.tsx
\`\`\`
      `,
      codeExamples: [
        {
          id: 'dependency-layers',
          title: '현재 프로젝트의 의존성 계층',
          description: '실제 import 패턴 분석',
          language: 'tsx',
          code: `// =============================================
// 의존성 계층 분석 (좋은 예)
// =============================================

// 1. Infrastructure Layer (최하위 - 의존성 없음)
// lib/axios/index.ts
import axios from 'axios';  // 외부 라이브러리만 의존
export const axiosInstance = axios.create({ baseURL: '/api' });

// types/index.ts
export interface User { id: number; name: string; }  // 의존성 없음

// 2. Business Logic Layer (Infrastructure에만 의존)
// hooks/useUserManagement.ts
import { axiosInstance } from '@/lib/axios';      // Infra
import { User, UserFilters } from '@/types';       // Infra

export function useUserManagement() {
  // UI 컴포넌트에 의존하지 않음!
  const fetchUsers = async () => {
    const response = await axiosInstance.get('/user');
    return response.data;
  };
  return { fetchUsers, ... };
}

// 3. Presentation Layer (모든 계층에 의존 가능)
// app/[locale]/admin/users/page.tsx
import { useUserManagement } from './hooks/useUserManagement';  // Logic
import { DataGrid } from '@/components/common';                  // UI
import { User } from '@/types';                                  // Infra

export default function UsersPage() {
  const { users, fetchUsers } = useUserManagement();
  return <DataGrid rows={users} />;
}

// ❌ 잘못된 의존성 (역방향)
// lib/axios/index.ts
import { showError } from '@/components/common/Toast';  // UI에 의존!`
        },
        {
          id: 'dependency-inversion',
          title: '의존성 역전 원칙 (DIP)',
          description: '인터페이스를 통한 의존성 관리',
          language: 'typescript',
          code: `// 의존성 역전 원칙 (Dependency Inversion Principle)

// ❌ 직접 의존 - 구현체에 의존
// hooks/useUserManagement.ts
import { axiosInstance } from '@/lib/axios';  // 구체적인 구현에 의존

const fetchUsers = async () => {
  return await axiosInstance.get('/users');  // axios에 강하게 결합
};

// ✅ 의존성 역전 - 인터페이스에 의존
// types/api.ts
export interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
}

// lib/axios/index.ts
import { ApiClient } from '@/types/api';

export const axiosClient: ApiClient = {
  get: (url) => axiosInstance.get(url).then(r => r.data),
  post: (url, data) => axiosInstance.post(url, data).then(r => r.data),
};

// hooks/useUserManagement.ts
import { ApiClient } from '@/types/api';

// 인터페이스에만 의존 - 테스트 시 Mock 주입 가능!
export function createUserManagement(api: ApiClient) {
  return {
    fetchUsers: () => api.get<User[]>('/users'),
  };
}

// 사용
import { axiosClient } from '@/lib/axios';
const userManagement = createUserManagement(axiosClient);

// 테스트
const mockApi: ApiClient = { get: jest.fn(), post: jest.fn() };
const userManagement = createUserManagement(mockApi);`
        }
      ],
      tips: [
        '✅ import 문을 보고 의존성 방향을 확인하세요.',
        '✅ 순환 참조가 발생하면 아키텍처 설계를 재검토하세요.',
        '⚠️ Feature 간 직접 의존은 shared 모듈로 분리하세요.',
        'ℹ️ 의존성 분석 도구(madge, dependency-cruiser)를 활용하세요.'
      ]
    },
    {
      id: 'project-analysis',
      title: 'Project Analysis',
      titleKo: '예제: 현재 프로젝트의 폴더 구조 분석',
      content: `
## 현재 프로젝트 아키텍처 분석

### 전체 구조 개요

\`\`\`
nextjs-enterprise-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── [locale]/           # i18n 동적 라우트
│   │       ├── admin/          # 관리자 영역
│   │       ├── boards/         # 게시판 영역
│   │       └── dev/            # 개발자 도구
│   │
│   ├── components/             # 공유 컴포넌트
│   │   ├── common/             # 범용 UI
│   │   ├── admin/              # Admin 전용
│   │   └── layout/             # 레이아웃
│   │
│   ├── hooks/                  # 공유 훅
│   ├── lib/                    # 라이브러리/설정
│   ├── types/                  # 타입 정의
│   └── providers/              # Context Providers
│
├── backend/                    # Express.js API 서버
│   ├── routes/
│   ├── services/
│   └── middlewares/
│
└── public/                     # 정적 파일
\`\`\`

### 아키텍처 패턴 분석

| 영역 | 패턴 | 설명 |
|------|------|------|
| **라우팅** | App Router + Dynamic Routes | \`[locale]\` 기반 i18n |
| **상태 관리** | Custom Hooks + Context | Feature별 hook 분리 |
| **스타일링** | MUI + Theme | 일관된 디자인 시스템 |
| **API** | REST + Axios | 중앙화된 API 클라이언트 |
| **인증** | JWT + Context | AuthProvider 활용 |
      `,
      codeExamples: [
        {
          id: 'admin-feature-structure',
          title: 'Admin Feature 구조 상세',
          description: '관리자 기능의 일관된 패턴',
          language: 'typescript',
          code: `// Admin Feature 일관된 구조
src/app/[locale]/admin/
├── users/                    # 사용자 관리
│   ├── page.tsx             # 메인 페이지
│   ├── hooks/
│   │   └── useUserManagement.ts   # CRUD 로직
│   ├── constants.tsx        # DataGrid 컬럼 정의
│   └── components/          # 전용 컴포넌트
│       └── UserFormFields.tsx
│
├── departments/             # 부서 관리 (동일 구조)
│   ├── page.tsx
│   ├── hooks/
│   │   └── useDepartmentManagement.ts
│   └── constants.tsx
│
├── roles/                   # 역할 관리 (동일 구조)
└── ...

// 일관된 패턴의 장점:
// 1. 새 기능 추가 시 복사-붙여넣기로 빠른 시작
// 2. 팀원 누구나 구조를 예측 가능
// 3. 코드 리뷰 효율성 증가`
        },
        {
          id: 'hook-pattern',
          title: '관리 페이지 Hook 패턴',
          description: 'useXXXManagement 일관된 패턴',
          fileName: 'src/app/[locale]/admin/users/hooks/useUserManagement.ts',
          language: 'tsx',
          code: `// 모든 Admin 페이지가 동일한 hook 패턴 사용

export function useUserManagement() {
  // 1. 상태 정의 (항상 동일한 구조)
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 2. 공통 훅 사용
  const { showSuccess, showError } = useMessage();
  const { page, pageSize, setPage, handlePageChange } = usePageState();

  // 3. CRUD 메서드 (Create, Read, Update, Delete)
  const fetchItems = useCallback(async () => { /* ... */ }, []);
  const createItem = async (data: CreateUserDto) => { /* ... */ };
  const updateItem = async (id: number, data: UpdateUserDto) => { /* ... */ };
  const deleteItem = async () => { /* ... */ };

  // 4. 핸들러 함수들
  const handleAdd = () => { /* ... */ };
  const handleEdit = (item: User) => { /* ... */ };
  const handleDelete = (item: User) => { /* ... */ };
  const handleDialogClose = () => { /* ... */ };
  const handleSubmit = async (data: CreateUserDto) => { /* ... */ };

  // 5. useEffect for data fetching
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // 6. Return public API
  return {
    // 상태
    items, loading, selectedItem,
    dialogOpen, deleteDialogOpen,
    page, pageSize, totalPages,

    // 핸들러
    handleAdd, handleEdit, handleDelete,
    handleDialogClose, handleSubmit,
    handlePageChange, handleDeleteConfirm,

    // 유틸리티
    setPage, fetchItems
  };
}`
        },
        {
          id: 'architecture-principles',
          title: '프로젝트 아키텍처 원칙 요약',
          description: '이 프로젝트에서 적용된 원칙들',
          language: 'typescript',
          code: `// 현재 프로젝트의 아키텍처 원칙

// 1. Co-location (관련 코드 함께 배치)
// - 각 admin 페이지는 자체 hooks/, constants.tsx 보유
// - 기능 추가/삭제가 폴더 단위로 가능

// 2. 공유 코드 중앙화
// - components/common: 모든 Feature에서 사용
// - hooks/: useMessage, usePageState 등 공통 훅
// - lib/axios: API 클라이언트 단일화

// 3. 일관된 패턴 (Convention over Configuration)
// - 모든 관리 페이지: page.tsx + hooks/useXXXManagement.ts
// - 모든 CRUD: create, read, update, delete 메서드명 통일
// - 모든 Dialog: FormDialog 컴포넌트 재사용

// 4. 관심사 분리
// - page.tsx: UI 렌더링만
// - hooks/: 비즈니스 로직
// - constants.tsx: 설정 데이터
// - components/: 재사용 UI

// 5. 타입 안전성
// - types/index.ts: 공유 타입
// - Feature별 types.ts: 로컬 타입
// - Generic 활용: DataGrid<T>, FormDialog<T>

// 개선 가능한 영역:
// - Feature 모듈화 강화 (features/ 도입)
// - API 레이어 추상화
// - 더 엄격한 의존성 규칙 적용`
        }
      ],
      tips: [
        '✅ 기존 패턴을 따라 새 기능을 추가하세요.',
        '✅ 패턴에서 벗어날 때는 팀과 상의하고 문서화하세요.',
        'ℹ️ 아키텍처는 진화합니다. 필요에 따라 점진적으로 개선하세요.',
        '⚠️ 과도한 추상화는 피하고, 실제 필요가 있을 때 도입하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'Bulletproof React - Project Structure',
      url: 'https://github.com/alan2207/bulletproof-react',
      type: 'github'
    },
    {
      title: 'Next.js Project Structure',
      url: 'https://nextjs.org/docs/app/building-your-application/routing',
      type: 'documentation'
    },
    {
      title: 'Clean Architecture in React',
      url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
      type: 'article'
    }
  ],
  status: 'ready'
};

export default chapter;
