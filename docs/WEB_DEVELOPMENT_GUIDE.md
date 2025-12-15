# 웹 개발 가이드

> 이 문서는 Next.js Enterprise App의 웹 개발 전반에 대한 가이드입니다.
> 프로젝트 구조부터 페이지 개발, API 연동까지 단계별로 설명합니다.

## 목차

1. [프로젝트 구조](#1-프로젝트-구조)
2. [기술 스택](#2-기술-스택)
3. [개발 환경 설정](#3-개발-환경-설정)
4. [라우팅 시스템](#4-라우팅-시스템)
5. [레이아웃 시스템](#5-레이아웃-시스템)
6. [공통 컴포넌트](#6-공통-컴포넌트)
7. [페이지 개발 가이드](#7-페이지-개발-가이드)
8. [상태 관리](#8-상태-관리)
9. [API 연동](#9-api-연동)
10. [인증 시스템](#10-인증-시스템)
11. [다국어(i18n)](#11-다국어i18n)
12. [스타일링](#12-스타일링)
13. [폼 처리](#13-폼-처리)
14. [테이블과 데이터 그리드](#14-테이블과-데이터-그리드)
15. [모달과 다이얼로그](#15-모달과-다이얼로그)
16. [알림 시스템](#16-알림-시스템)
17. [권한 관리](#17-권한-관리)
18. [코딩 컨벤션](#18-코딩-컨벤션)
19. [성능 최적화](#19-성능-최적화)
20. [배포](#20-배포)

---

## 1. 프로젝트 구조

### 1.1 디렉토리 구조

```
nextjs-enterprise-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # 다국어 라우팅
│   │   │   ├── admin/          # 관리자 페이지
│   │   │   ├── dashboard/      # 대시보드
│   │   │   ├── boards/         # 게시판
│   │   │   ├── login/          # 로그인
│   │   │   └── layout.tsx      # 로케일 레이아웃
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   └── page.tsx            # 루트 페이지 (리다이렉트)
│   │
│   ├── components/             # 공통 컴포넌트
│   │   ├── common/             # 범용 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── mobile/             # 모바일 전용 컴포넌트
│   │   ├── auth/               # 인증 관련 컴포넌트
│   │   └── providers/          # Context Providers
│   │
│   ├── contexts/               # React Context
│   │   ├── AuthContext.tsx     # 인증 컨텍스트
│   │   └── PermissionContext.tsx # 권한 컨텍스트
│   │
│   ├── hooks/                  # 커스텀 Hooks
│   │   ├── useMobile.ts        # 모바일 감지
│   │   ├── useAuth.ts          # 인증 훅
│   │   └── ...
│   │
│   ├── lib/                    # 유틸리티 라이브러리
│   │   ├── api/                # API 클라이언트
│   │   ├── axios/              # Axios 설정
│   │   ├── i18n/               # 다국어 설정
│   │   └── utils/              # 유틸리티 함수
│   │
│   ├── types/                  # TypeScript 타입 정의
│   │
│   └── styles/                 # 글로벌 스타일
│
├── public/                     # 정적 파일
├── docs/                       # 문서
├── infrastructure/             # 인프라 설정 (Docker, nginx)
└── package.json
```

### 1.2 페이지 디렉토리 구조

각 페이지는 다음 구조를 따릅니다:

```
src/app/[locale]/admin/users/
├── page.tsx                    # 메인 페이지 (목록)
├── layout.tsx                  # 레이아웃 (선택)
├── [id]/
│   └── page.tsx                # 상세/수정 페이지
├── create/
│   └── page.tsx                # 생성 페이지
├── components/                 # 페이지 전용 컴포넌트
│   ├── UserMobileCard.tsx      # 모바일 카드
│   ├── UserFormFields.tsx      # 폼 필드
│   └── UserDetailView.tsx      # 상세 뷰
├── hooks/                      # 페이지 전용 훅
│   └── useUserManagement.ts    # 비즈니스 로직
├── constants.tsx               # 상수 (컬럼 정의 등)
└── utils.ts                    # 유틸리티 함수
```

---

## 2. 기술 스택

### 2.1 핵심 기술

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15.x | React 프레임워크 |
| React | 19.x | UI 라이브러리 |
| TypeScript | 5.x | 타입 안정성 |
| MUI (Material-UI) | 6.x | UI 컴포넌트 |
| Axios | 1.x | HTTP 클라이언트 |

### 2.2 주요 라이브러리

| 라이브러리 | 용도 |
|------------|------|
| `@mui/x-data-grid` | 데이터 테이블 |
| `@mui/x-date-pickers` | 날짜/시간 선택 |
| `recharts` | 차트 |
| `tiptap` | 리치 텍스트 에디터 |
| `dompurify` | XSS 방지 |

---

## 3. 개발 환경 설정

### 3.1 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Docker (백엔드 실행용)

### 3.2 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

### 3.3 환경 변수

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3011
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:3012
```

---

## 4. 라우팅 시스템

### 4.1 App Router 기본

Next.js 15의 App Router를 사용합니다.

```
URL: /ko/admin/users
파일: src/app/[locale]/admin/users/page.tsx
```

### 4.2 동적 라우팅

```typescript
// src/app/[locale]/admin/users/[id]/page.tsx

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { locale, id } = await params;

  return <UserDetail userId={id} />;
}
```

### 4.3 라우팅 패턴

| 패턴 | 파일 경로 | URL 예시 |
|------|----------|----------|
| 목록 | `users/page.tsx` | `/ko/admin/users` |
| 상세 | `users/[id]/page.tsx` | `/ko/admin/users/123` |
| 생성 | `users/create/page.tsx` | `/ko/admin/users/create` |
| 수정 | `users/[id]/edit/page.tsx` | `/ko/admin/users/123/edit` |

### 4.4 네비게이션

```typescript
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';

function MyComponent() {
  const router = useRouter();
  const locale = useCurrentLocale();

  const handleNavigate = () => {
    // 로케일 포함 경로로 이동
    router.push(`/${locale}/admin/users`);
  };

  const handleBack = () => {
    router.back();
  };
}
```

---

## 5. 레이아웃 시스템

### 5.1 레이아웃 계층 구조

```
RootLayout (src/app/layout.tsx)
└── LocaleLayout (src/app/[locale]/layout.tsx)
    └── ClientProviders
        └── ResponsiveLayout / AuthenticatedLayout
            └── Page Content
```

### 5.2 ResponsiveLayout

반응형 레이아웃 (모바일/데스크톱 자동 전환):

```typescript
// layout.tsx
'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveLayout requireRole="admin" showAutoLogoutWarning>
      {children}
    </ResponsiveLayout>
  );
}
```

### 5.3 AuthenticatedLayout (데스크톱)

데스크톱 전용 레이아웃 구조:

```
┌─────────────────────────────────────────────────────────┐
│                      Header (64px)                       │
├───────────┬─────────────────────────────────────────────┤
│           │                                             │
│  Sidebar  │              Content Area                   │
│  (280px)  │            (스크롤 가능)                     │
│           │                                             │
│  - 메뉴   │                                             │
│  - 트리   │                                             │
│           │                                             │
└───────────┴─────────────────────────────────────────────┘
```

### 5.4 페이지 내부 레이아웃 패턴

#### 패턴 1: 고정 헤더 + 스크롤 컨텐츠

```typescript
<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
  {/* 고정 헤더 */}
  <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
    <PageHeader />
    <Toolbar />
  </Box>

  {/* 스크롤 컨텐츠 */}
  <Box sx={{ flex: 1, overflowY: 'auto' }}>
    <Content />
  </Box>
</Box>
```

#### 패턴 2: 전체 스크롤

```typescript
<Box sx={{ p: 3 }}>
  <PageHeader />
  <Content />
</Box>
```

---

## 6. 공통 컴포넌트

### 6.1 컴포넌트 목록

| 컴포넌트 | 위치 | 용도 |
|----------|------|------|
| `PageHeader` | `common/PageHeader` | 페이지 헤더 (제목, 브레드크럼) |
| `PageContainer` | `common/PageContainer` | 페이지 컨테이너 |
| `StandardCrudPageLayout` | `common/StandardCrudPageLayout` | CRUD 페이지 레이아웃 |
| `ResponsivePageLayout` | `common/ResponsivePageLayout` | 반응형 CRUD 레이아웃 |
| `SearchFilterFields` | `common/SearchFilterFields` | 검색 필터 필드 |
| `DeleteConfirmDialog` | `common/DeleteConfirmDialog` | 삭제 확인 다이얼로그 |
| `StatCard` | `common/StatCard` | 통계 카드 |
| `RichTextEditor` | `common/RichTextEditor` | WYSIWYG 에디터 |
| `SafeHtmlRenderer` | `common/SafeHtmlRenderer` | 안전한 HTML 렌더링 |
| `AttachmentUpload` | `common/AttachmentUpload` | 파일 업로드 |
| `TagInput` | `common/TagInput` | 태그 입력 |

### 6.2 PageHeader 사용법

```typescript
import PageHeader from '@/components/common/PageHeader';

<PageHeader
  useMenu                    // 메뉴에서 제목 가져오기
  showBreadcrumb             // 브레드크럼 표시
  compact                    // 컴팩트 모드
/>

// 또는 직접 지정
<PageHeader
  title="사용자 관리"
  description="시스템 사용자를 관리합니다"
/>
```

### 6.3 StandardCrudPageLayout 사용법

```typescript
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';

<StandardCrudPageLayout
  // 헤더
  useMenu
  showBreadcrumb

  // 메시지
  successMessage={successMessage}
  errorMessage={errorMessage}

  // 검색
  quickSearch={searchValue}
  onQuickSearchChange={setSearchValue}
  onQuickSearch={handleSearch}
  onQuickSearchClear={handleClear}
  quickSearchPlaceholder="검색어 입력"
  searching={isSearching}

  // 고급 필터
  showAdvancedFilter
  advancedFilterOpen={filterOpen}
  onAdvancedFilterClick={() => setFilterOpen(!filterOpen)}
  activeFilterCount={3}
  filterTitle="검색 필터"
  filterContent={<FilterFields />}
  onFilterApply={handleFilterApply}
  onFilterClear={handleFilterClear}
  onFilterClose={() => setFilterOpen(false)}

  // 도움말
  programId="ADMIN_USERS"
>
  {/* 컨텐츠 */}
</StandardCrudPageLayout>
```

### 6.4 SearchFilterFields 사용법

```typescript
import SearchFilterFields, { FilterField } from '@/components/common/SearchFilterFields';

const filterFields: FilterField[] = [
  {
    name: 'status',
    label: '상태',
    type: 'select',
    options: [
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' },
    ],
  },
  {
    name: 'keyword',
    label: '검색어',
    type: 'text',
    placeholder: '이름 또는 이메일',
  },
  {
    name: 'dateRange',
    label: '기간',
    type: 'dateRange',
  },
];

<SearchFilterFields
  fields={filterFields}
  values={filterValues}
  onChange={handleFilterChange}
  onEnter={handleSearch}
  locale={currentLocale}
/>
```

---

## 7. 페이지 개발 가이드

### 7.1 새 CRUD 페이지 만들기

#### Step 1: 디렉토리 구조 생성

```bash
mkdir -p src/app/[locale]/admin/products
mkdir -p src/app/[locale]/admin/products/components
mkdir -p src/app/[locale]/admin/products/hooks
mkdir -p src/app/[locale]/admin/products/[id]
```

#### Step 2: 타입 정의

```typescript
// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchCriteria {
  keyword?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}
```

#### Step 3: 상수 정의 (컬럼, 필터)

```typescript
// constants.tsx
import { GridColDef } from '@mui/x-data-grid';
import { FilterField } from '@/components/common/SearchFilterFields';
import { Chip } from '@mui/material';

export const createColumns = (t: any): GridColDef[] => [
  {
    field: 'rowNumber',
    headerName: 'No',
    width: 60,
    sortable: false,
  },
  {
    field: 'name',
    headerName: t('product.name'),
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'price',
    headerName: t('product.price'),
    width: 120,
    renderCell: (params) => `₩${params.value.toLocaleString()}`,
  },
  {
    field: 'status',
    headerName: t('product.status'),
    width: 100,
    renderCell: (params) => (
      <Chip
        size="small"
        label={params.value === 'active' ? '활성' : '비활성'}
        color={params.value === 'active' ? 'success' : 'default'}
      />
    ),
  },
];

export const createFilterFields = (t: any): FilterField[] => [
  {
    name: 'keyword',
    label: t('common.keyword'),
    type: 'text',
    placeholder: t('product.searchPlaceholder'),
  },
  {
    name: 'status',
    label: t('product.status'),
    type: 'select',
    options: [
      { value: '', label: t('common.all') },
      { value: 'active', label: t('product.active') },
      { value: 'inactive', label: t('product.inactive') },
    ],
  },
];
```

#### Step 4: 비즈니스 로직 Hook

```typescript
// hooks/useProductManagement.ts
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { contentApiClient } from '@/lib/api/client';
import { Product, ProductSearchCriteria } from '@/types/product';

interface UseProductManagementProps {
  storageKey?: string;
}

export function useProductManagement({ storageKey }: UseProductManagementProps = {}) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n();

  // 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<ProductSearchCriteria>({});
  const [quickSearch, setQuickSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [rowCount, setRowCount] = useState(0);

  // 메시지
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 삭제 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 데이터 조회
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contentApiClient.get('/products', {
        params: {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          ...searchCriteria,
        },
      });

      if (response.success) {
        setProducts(response.data.products || []);
        setRowCount(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setErrorMessage(t('common.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [paginationModel, searchCriteria, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    setSearchCriteria((prev) => ({ ...prev, keyword: quickSearch }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [quickSearch]);

  const handleSearchClear = useCallback(() => {
    setQuickSearch('');
    setSearchCriteria({});
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  // CRUD 핸들러
  const handleAdd = useCallback(() => {
    router.push(`/${locale}/admin/products/create`);
  }, [router, locale]);

  const handleEdit = useCallback((id: string) => {
    router.push(`/${locale}/admin/products/${id}`);
  }, [router, locale]);

  const handleDelete = useCallback((ids: string[]) => {
    setDeleteTargetIds(ids);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      setDeleteLoading(true);
      await Promise.all(
        deleteTargetIds.map((id) => contentApiClient.delete(`/products/${id}`))
      );
      setSuccessMessage(t('common.deleteSuccess'));
      setDeleteDialogOpen(false);
      fetchProducts();
    } catch (error) {
      setErrorMessage(t('common.deleteError'));
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTargetIds, fetchProducts, t]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteTargetIds([]);
  }, []);

  // 메시지 자동 클리어
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return {
    // 데이터
    products,
    loading,
    rowCount,

    // 검색
    searchCriteria,
    setSearchCriteria,
    quickSearch,
    setQuickSearch,
    handleSearch,
    handleSearchClear,

    // 페이지네이션
    paginationModel,
    setPaginationModel,

    // 메시지
    successMessage,
    errorMessage,

    // CRUD
    handleAdd,
    handleEdit,
    handleDelete,
    handleRefresh: fetchProducts,

    // 삭제 다이얼로그
    deleteDialogOpen,
    deleteTargetIds,
    deleteLoading,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
```

#### Step 5: 모바일 카드 컴포넌트

```typescript
// components/ProductMobileCard.tsx
'use client';

import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { Inventory } from '@mui/icons-material';
import MobileCard from '@/components/mobile/MobileCard';
import MobileSwipeActions from '@/components/mobile/MobileSwipeActions';
import { Delete, Edit } from '@mui/icons-material';
import { Product } from '@/types/product';

interface ProductMobileCardProps {
  product: Product;
  rowNumber?: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
}

export default function ProductMobileCard({
  product,
  rowNumber,
  onClick,
  onEdit,
  onDelete,
  selected = false,
  selectable = false,
  onSelectionChange,
}: ProductMobileCardProps) {
  const rightActions = [];

  if (onDelete) {
    rightActions.push({
      icon: <Delete />,
      label: '삭제',
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: onDelete,
    });
  }

  if (onEdit) {
    rightActions.push({
      icon: <Edit />,
      label: '수정',
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: onEdit,
    });
  }

  const cardContent = (
    <MobileCard
      item={product}
      primaryText={(p) => p.name}
      secondaryText={(p) => `₩${p.price.toLocaleString()}`}
      avatar={
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
          {rowNumber || <Inventory fontSize="small" />}
        </Avatar>
      }
      chips={[
        {
          label: product.status === 'active' ? '활성' : '비활성',
          color: product.status === 'active' ? 'success' : 'default',
        },
      ]}
      onClick={onClick}
      selected={selected}
      selectable={selectable}
      onSelectionChange={onSelectionChange}
      divider
    />
  );

  if (rightActions.length > 0) {
    return (
      <MobileSwipeActions rightActions={rightActions}>
        {cardContent}
      </MobileSwipeActions>
    );
  }

  return cardContent;
}
```

#### Step 6: 메인 페이지

```typescript
// page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import MobileCardList from '@/components/mobile/MobileCardList';
import ProductMobileCard from './components/ProductMobileCard';
import RouteGuard from '@/components/auth/RouteGuard';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { useProductManagement } from './hooks/useProductManagement';
import { createColumns, createFilterFields } from './constants';

export default function ProductsPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // 비즈니스 로직
  const {
    products,
    loading,
    rowCount,
    searchCriteria,
    setSearchCriteria,
    quickSearch,
    setQuickSearch,
    handleSearch,
    handleSearchClear,
    paginationModel,
    setPaginationModel,
    successMessage,
    errorMessage,
    handleAdd,
    handleEdit,
    handleDelete,
    handleRefresh,
    deleteDialogOpen,
    deleteTargetIds,
    deleteLoading,
    handleConfirmDelete,
    handleCancelDelete,
  } = useProductManagement({ storageKey: 'products-page-state' });

  // 선택 상태 (데스크톱)
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);

  // 모바일 선택 상태
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);

  // 컬럼, 필터 필드
  const columns = useMemo(() => createColumns(t), [t]);
  const filterFields = useMemo(() => createFilterFields(t), [t]);

  // 행 번호 추가
  const rowsWithNumber = useMemo(() =>
    products.map((product, index) => ({
      ...product,
      rowNumber: paginationModel.page * paginationModel.pageSize + index + 1,
    })),
    [products, paginationModel]
  );

  return (
    <RouteGuard requiredProgram="ADMIN_PRODUCTS">
      <ResponsivePageLayout
        // 헤더
        useMenu
        showBreadcrumb

        // 메시지
        successMessage={successMessage}
        errorMessage={errorMessage}

        // 검색
        quickSearch={quickSearch}
        onQuickSearchChange={setQuickSearch}
        onQuickSearch={handleSearch}
        onQuickSearchClear={handleSearchClear}
        quickSearchPlaceholder={t('product.searchPlaceholder')}
        searching={loading}

        // 필터
        showAdvancedFilter
        filterTitle={t('common.filter')}
        filterContent={
          <SearchFilterFields
            fields={filterFields}
            values={searchCriteria}
            onChange={(name, value) => setSearchCriteria((prev) => ({ ...prev, [name]: value }))}
            onEnter={handleSearch}
            locale={locale}
          />
        }
        onFilterApply={handleSearch}
        onFilterClear={handleSearchClear}

        // 모바일
        mobileFab={{ onClick: handleAdd, label: t('common.add') }}
        mobileSelectionMode={mobileSelectionMode}
        mobileSelectedCount={mobileSelectedIds.size}
        onMobileSelectionModeToggle={() => {
          setMobileSelectionMode(!mobileSelectionMode);
          if (mobileSelectionMode) setMobileSelectedIds(new Set());
        }}
        onMobileDeleteSelected={() => handleDelete(Array.from(mobileSelectedIds))}
      >
        {isMobileLayout ? (
          // ===== 모바일 =====
          <MobileCardList
            data={products}
            loading={loading}
            emptyMessage={t('product.noProducts')}
            renderCard={(product, index) => (
              <ProductMobileCard
                key={product.id}
                product={product}
                rowNumber={paginationModel.page * paginationModel.pageSize + index + 1}
                onClick={() => handleEdit(product.id)}
                onDelete={() => handleDelete([product.id])}
                selected={mobileSelectedIds.has(product.id)}
                selectable={mobileSelectionMode}
                onSelectionChange={(selected) => {
                  const newIds = new Set(mobileSelectedIds);
                  if (selected) newIds.add(product.id);
                  else newIds.delete(product.id);
                  setMobileSelectedIds(newIds);
                }}
              />
            )}
            keyExtractor={(product) => product.id}
          />
        ) : (
          // ===== 데스크톱 =====
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <DataGrid
              rows={rowsWithNumber}
              columns={columns}
              loading={loading}
              rowCount={rowCount}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 50, 100]}
              checkboxSelection
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={setSelectedIds}
              onRowClick={(params) => handleEdit(params.row.id)}
              disableRowSelectionOnClick
              sx={{ flex: 1 }}
            />
          </Box>
        )}
      </ResponsivePageLayout>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemCount={deleteTargetIds.length}
        itemName="product"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </RouteGuard>
  );
}
```

#### Step 7: 레이아웃

```typescript
// layout.tsx
'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
```

---

## 8. 상태 관리

### 8.1 Context API

전역 상태는 React Context를 사용합니다.

```typescript
// contexts/MyContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface MyContextType {
  data: any;
  setData: (data: any) => void;
  refresh: () => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(null);

  const refresh = useCallback(() => {
    // 데이터 새로고침 로직
  }, []);

  return (
    <MyContext.Provider value={{ data, setData, refresh }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}
```

### 8.2 페이지 상태 관리 패턴

```typescript
// 커스텀 훅으로 비즈니스 로직 분리
function usePageState() {
  // 데이터 상태
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 검색 상태
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});

  // 페이지네이션
  const [pagination, setPagination] = useState({ page: 0, pageSize: 20 });

  // 선택 상태
  const [selectedIds, setSelectedIds] = useState([]);

  // 모달/다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);

  // 메시지 상태
  const [message, setMessage] = useState({ type: null, text: null });

  // API 호출 및 핸들러...

  return {
    data, loading,
    searchValue, setSearchValue, filters, setFilters,
    pagination, setPagination,
    selectedIds, setSelectedIds,
    dialogOpen, setDialogOpen,
    message,
    // 핸들러들...
  };
}
```

### 8.3 localStorage 상태 유지

```typescript
import { useState, useEffect } from 'react';

function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

// 사용
const [filters, setFilters] = usePersistedState('page-filters', {});
```

---

## 9. API 연동

### 9.1 API 클라이언트 구조

```
src/lib/api/
├── client.ts        # API 클라이언트 인스턴스
└── fileUtils.ts     # 파일 관련 유틸리티

src/lib/axios/
└── index.ts         # Axios 설정 및 인터셉터
```

### 9.2 API 클라이언트 사용

```typescript
import { contentApiClient, commonApiClient, authApi } from '@/lib/api/client';

// GET 요청
const response = await contentApiClient.get('/products', {
  params: { page: 1, limit: 20 }
});

// POST 요청
const response = await contentApiClient.post('/products', {
  name: '상품명',
  price: 10000,
});

// PUT 요청
const response = await contentApiClient.put(`/products/${id}`, {
  name: '수정된 상품명',
});

// DELETE 요청
const response = await contentApiClient.delete(`/products/${id}`);
```

### 9.3 응답 처리

```typescript
try {
  const response = await contentApiClient.get('/products');

  if (response.success) {
    // 성공
    const products = response.data.products;
    const total = response.data.total;
  } else {
    // API 에러
    console.error(response.error);
  }
} catch (error) {
  // 네트워크 에러
  console.error('Network error:', error);
}
```

### 9.4 API 클라이언트 종류

| 클라이언트 | 용도 | 베이스 URL |
|------------|------|-----------|
| `authApi` | 인증 API | `/auth` |
| `contentApiClient` | 컨텐츠 API | `/content` |
| `commonApiClient` | 공통 API | `/api` |

---

## 10. 인증 시스템

### 10.1 AuthContext

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const {
    user,              // 현재 사용자 정보
    isAuthenticated,   // 로그인 여부
    isLoading,         // 로딩 중
    login,             // 로그인 함수
    logout,            // 로그아웃 함수
    updateUser,        // 사용자 정보 업데이트
  } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Redirect to="/login" />;

  return <div>Hello, {user.name}</div>;
}
```

### 10.2 RouteGuard

페이지 접근 권한을 제어합니다.

```typescript
import RouteGuard from '@/components/auth/RouteGuard';

// 프로그램 권한 체크
<RouteGuard requiredProgram="ADMIN_USERS">
  <UsersPage />
</RouteGuard>

// 역할 체크
<RouteGuard requiredRole="admin">
  <AdminPage />
</RouteGuard>
```

### 10.3 로그인 플로우

```
1. 사용자가 로그인 폼 제출
2. authApi.post('/login', { username, password })
3. MFA 필요시 → MFA 코드 입력 화면
4. 로그인 성공 → 토큰 저장 (localStorage)
5. AuthContext 상태 업데이트
6. 대시보드로 리다이렉트
```

---

## 11. 다국어(i18n)

### 11.1 설정

지원 언어: 한국어(ko), 영어(en), 중국어(zh), 베트남어(vi)

### 11.2 사용법

```typescript
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';

function MyComponent() {
  const t = useI18n();
  const locale = useCurrentLocale();

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('greeting', { name: 'John' })}</p>
      <p>Current locale: {locale}</p>
    </div>
  );
}
```

### 11.3 번역 파일 구조

```
src/lib/i18n/
├── locales/
│   ├── en.ts
│   ├── ko.ts
│   ├── zh.ts
│   └── vi.ts
└── client.ts
```

### 11.4 번역 추가

```typescript
// locales/ko.ts
export default {
  common: {
    save: '저장',
    cancel: '취소',
    delete: '삭제',
  },
  product: {
    name: '상품명',
    price: '가격',
    status: '상태',
    searchPlaceholder: '상품 검색...',
  },
};
```

---

## 12. 스타일링

### 12.1 MUI Theme

```typescript
// src/styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Roboto", sans-serif',
  },
});
```

### 12.2 sx prop 사용

```typescript
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 1,
    '&:hover': {
      boxShadow: 3,
    },
  }}
>
  Content
</Box>
```

### 12.3 반응형 스타일

```typescript
<Box
  sx={{
    // 기본값 (모바일)
    fontSize: '0.875rem',
    p: 1,

    // sm 이상 (600px+)
    '@media (min-width: 600px)': {
      fontSize: '1rem',
      p: 2,
    },

    // md 이상 (900px+)
    '@media (min-width: 900px)': {
      fontSize: '1.125rem',
      p: 3,
    },
  }}
/>

// 또는 MUI breakpoints 사용
<Box
  sx={{
    p: { xs: 1, sm: 2, md: 3 },
    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
  }}
/>
```

### 12.4 공통 스타일 패턴

```typescript
// 카드 스타일
const cardSx = {
  p: 3,
  borderRadius: 2,
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
};

// 플렉스 센터
const flexCenterSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// 말줄임
const ellipsisSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
```

---

## 13. 폼 처리

### 13.1 기본 폼 패턴

```typescript
function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 에러 클리어
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = '이름을 입력하세요';
    if (!formData.email) newErrors.email = '이메일을 입력하세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await api.post('/users', formData);
      // 성공 처리
    } catch (error) {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        name="name"
        label="이름"
        value={formData.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
        required
      />
      <TextField
        name="email"
        label="이메일"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : '저장'}
      </Button>
    </form>
  );
}
```

### 13.2 RichTextEditor 사용

```typescript
import RichTextEditor from '@/components/common/RichTextEditor';

<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="내용을 입력하세요"
  minHeight={300}
  disabled={loading}
/>
```

### 13.3 파일 업로드

```typescript
import AttachmentUpload from '@/components/common/AttachmentUpload';

<AttachmentUpload
  attachmentTypeCode="BOARD_GENERAL"
  referenceType="post"
  referenceId={postId}
  locale={locale}
  autoFetch={mode === 'edit'}
  onUploadComplete={(id) => setAttachmentId(id)}
  helperText="최대 5개 파일"
  compact
/>
```

---

## 14. 테이블과 데이터 그리드

### 14.1 DataGrid 기본 사용

```typescript
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: '이름', flex: 1 },
  {
    field: 'status',
    headerName: '상태',
    width: 100,
    renderCell: (params) => <StatusChip status={params.value} />,
  },
  {
    field: 'actions',
    headerName: '작업',
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Box>
        <IconButton onClick={() => handleEdit(params.row.id)}>
          <Edit />
        </IconButton>
        <IconButton onClick={() => handleDelete(params.row.id)}>
          <Delete />
        </IconButton>
      </Box>
    ),
  },
];

<DataGrid
  rows={data}
  columns={columns}
  loading={loading}
  // 서버 사이드 페이지네이션
  rowCount={totalCount}
  paginationMode="server"
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
  pageSizeOptions={[10, 20, 50, 100]}
  // 선택
  checkboxSelection
  rowSelectionModel={selectedIds}
  onRowSelectionModelChange={setSelectedIds}
  // 클릭
  onRowClick={(params) => handleRowClick(params.row)}
  disableRowSelectionOnClick
  // 스타일
  sx={{ flex: 1, minHeight: 400 }}
/>
```

### 14.2 컬럼 정의 패턴

```typescript
export const createColumns = (
  t: TranslationFunction,
  locale: string,
  handlers: { onEdit: Function; onDelete: Function }
): GridColDef[] => [
  // 순번
  {
    field: 'rowNumber',
    headerName: 'No',
    width: 60,
    sortable: false,
    filterable: false,
  },
  // 텍스트
  {
    field: 'name',
    headerName: t('common.name'),
    flex: 1,
    minWidth: 150,
  },
  // 날짜
  {
    field: 'createdAt',
    headerName: t('common.createdAt'),
    width: 180,
    valueFormatter: (value) => formatDate(value, locale),
  },
  // 상태 (Chip)
  {
    field: 'status',
    headerName: t('common.status'),
    width: 100,
    renderCell: (params) => (
      <Chip
        size="small"
        label={t(`status.${params.value}`)}
        color={params.value === 'active' ? 'success' : 'default'}
      />
    ),
  },
  // 액션 버튼
  {
    field: 'actions',
    headerName: t('common.actions'),
    width: 100,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title={t('common.edit')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(params.row.id);
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];
```

---

## 15. 모달과 다이얼로그

### 15.1 기본 Dialog

```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
  <DialogTitle>제목</DialogTitle>
  <DialogContent>
    내용
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>취소</Button>
    <Button variant="contained" onClick={handleConfirm}>확인</Button>
  </DialogActions>
</Dialog>
```

### 15.2 DeleteConfirmDialog

```typescript
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

<DeleteConfirmDialog
  open={deleteDialogOpen}
  itemCount={deleteTargetIds.length}
  itemName="user"
  itemsList={['홍길동', '김철수']}  // 선택사항
  onCancel={handleCancelDelete}
  onConfirm={handleConfirmDelete}
  loading={deleteLoading}
  title="삭제 확인"
  confirmText="삭제"
  cancelText="취소"
/>
```

### 15.3 폼 다이얼로그 패턴

```typescript
function FormDialog({ open, onClose, item, onSuccess }) {
  const [formData, setFormData] = useState(item || initialData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (item) {
        await api.put(`/items/${item.id}`, formData);
      } else {
        await api.post('/items', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{item ? '수정' : '추가'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField ... />
          <TextField ... />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>취소</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 16. 알림 시스템

### 16.1 페이지 내 메시지

```typescript
import { Alert, Snackbar } from '@mui/material';

// Alert (페이지 내)
{successMessage && (
  <Alert severity="success" sx={{ mb: 2 }}>
    {successMessage}
  </Alert>
)}

{errorMessage && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {errorMessage}
  </Alert>
)}

// Snackbar (플로팅)
<Snackbar
  open={!!message}
  autoHideDuration={3000}
  onClose={() => setMessage(null)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert severity={message?.type} onClose={() => setMessage(null)}>
    {message?.text}
  </Alert>
</Snackbar>
```

### 16.2 메시지 자동 클리어

```typescript
// 커스텀 훅
function useMessage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showSuccess = (text: string) => setMessage({ type: 'success', text });
  const showError = (text: string) => setMessage({ type: 'error', text });
  const clear = () => setMessage(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(clear, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return { message, showSuccess, showError, clear };
}
```

---

## 17. 권한 관리

### 17.1 PermissionContext

```typescript
import { usePermissions } from '@/contexts/PermissionContext';

function MyComponent() {
  const { hasPermission, hasAnyPermission, loading } = usePermissions();

  // 특정 프로그램 권한 체크
  if (hasPermission('ADMIN_USERS', 'write')) {
    // 쓰기 권한 있음
  }

  // 여러 프로그램 중 하나라도 권한 있는지 체크
  if (hasAnyPermission(['ADMIN_USERS', 'ADMIN_ROLES'])) {
    // 하나라도 권한 있음
  }
}
```

### 17.2 권한별 UI 표시

```typescript
function UserListPage() {
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('ADMIN_USERS', 'write');
  const canDelete = hasPermission('ADMIN_USERS', 'delete');

  return (
    <div>
      {/* 추가 버튼 - 쓰기 권한 필요 */}
      {canWrite && (
        <Button onClick={handleAdd}>추가</Button>
      )}

      {/* 삭제 버튼 - 삭제 권한 필요 */}
      {canDelete && (
        <Button onClick={handleDelete} color="error">삭제</Button>
      )}

      {/* DataGrid - 쓰기 권한에 따라 체크박스 표시 */}
      <DataGrid
        checkboxSelection={canWrite}
        ...
      />
    </div>
  );
}
```

---

## 18. 코딩 컨벤션

### 18.1 파일 명명 규칙

```
컴포넌트: PascalCase.tsx (UserList.tsx)
훅: camelCase.ts (useUserManagement.ts)
유틸리티: camelCase.ts (formatDate.ts)
상수: camelCase.tsx (constants.tsx)
타입: camelCase.ts (types.ts)
```

### 18.2 컴포넌트 구조

```typescript
'use client';

import React, { useState, useCallback, useMemo } from 'react';
// 외부 라이브러리
import { Box, Typography } from '@mui/material';
// 내부 컴포넌트
import MyComponent from '@/components/MyComponent';
// 훅
import { useMyHook } from '@/hooks/useMyHook';
// 타입
import { MyType } from '@/types/myType';

interface Props {
  title: string;
  onSubmit: (data: MyType) => void;
}

export default function MyPage({ title, onSubmit }: Props) {
  // 훅 호출
  const { data, loading } = useMyHook();

  // 상태
  const [value, setValue] = useState('');

  // 메모이제이션
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  // 핸들러
  const handleSubmit = useCallback(() => {
    onSubmit({ value });
  }, [value, onSubmit]);

  // 조건부 렌더링
  if (loading) return <Loading />;

  // 렌더링
  return (
    <Box>
      <Typography variant="h1">{title}</Typography>
      {/* ... */}
    </Box>
  );
}
```

### 18.3 훅 구조

```typescript
import { useState, useCallback, useEffect } from 'react';

interface UseMyHookProps {
  initialValue?: string;
}

interface UseMyHookReturn {
  value: string;
  setValue: (value: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMyHook({ initialValue = '' }: UseMyHookProps = {}): UseMyHookReturn {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // 로직
    } catch (e) {
      setError('에러 발생');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { value, setValue, loading, error, refresh };
}
```

### 18.4 TypeScript 타입

```typescript
// 인터페이스 사용 (객체)
interface User {
  id: string;
  name: string;
  email: string;
}

// 타입 별칭 (유니온, 인터섹션)
type UserStatus = 'active' | 'inactive' | 'pending';

type UserWithStatus = User & {
  status: UserStatus;
};

// 제네릭
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Partial, Pick, Omit
type UserUpdate = Partial<User>;
type UserSummary = Pick<User, 'id' | 'name'>;
type UserWithoutId = Omit<User, 'id'>;
```

---

## 19. 성능 최적화

### 19.1 메모이제이션

```typescript
// useMemo - 계산 결과 캐싱
const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'active');
}, [data]);

// useCallback - 함수 캐싱
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// React.memo - 컴포넌트 리렌더링 방지
const MyComponent = React.memo(function MyComponent({ data }) {
  return <div>{data.name}</div>;
});
```

### 19.2 코드 스플리팅

```typescript
// 동적 임포트
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <CircularProgress />,
  ssr: false,
});
```

### 19.3 이미지 최적화

```typescript
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // LCP 이미지
/>
```

---

## 20. 배포

### 20.1 Docker 빌드

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### 20.2 Docker Compose

```yaml
# docker-compose.yml
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3011
    depends_on:
      - api
```

### 20.3 환경 변수

```bash
# 프로덕션 환경 변수
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_CONTENT_API_URL=https://content.example.com
```

---

## 부록: 자주 사용하는 코드 스니펫

### A. 페이지 스켈레톤

```typescript
'use client';

import React from 'react';
import { Box } from '@mui/material';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function MyPage() {
  const t = useI18n();
  const { isMobileLayout } = useMobile();

  return (
    <RouteGuard requiredProgram="MY_PROGRAM">
      <ResponsivePageLayout useMenu showBreadcrumb>
        {isMobileLayout ? (
          <MobileContent />
        ) : (
          <DesktopContent />
        )}
      </ResponsivePageLayout>
    </RouteGuard>
  );
}
```

### B. API 호출 패턴

```typescript
const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await contentApiClient.get('/endpoint', {
      params: { page, limit, ...filters },
    });

    if (response.success) {
      setData(response.data.items);
      setTotal(response.data.total);
    } else {
      throw new Error(response.error);
    }
  } catch (error: any) {
    setError(error.message || 'Failed to fetch data');
  } finally {
    setLoading(false);
  }
}, [page, limit, filters]);
```

### C. 폼 필드 공통 Props

```typescript
const textFieldProps = {
  fullWidth: true,
  size: isMobile ? 'small' : 'medium',
  disabled: loading,
};

<TextField
  {...textFieldProps}
  label="이름"
  name="name"
  value={formData.name}
  onChange={handleChange}
  error={!!errors.name}
  helperText={errors.name}
  required
/>
```

---

> **문서 버전:** 1.0
> **최종 수정일:** 2024-12-16
> **작성자:** Development Team
