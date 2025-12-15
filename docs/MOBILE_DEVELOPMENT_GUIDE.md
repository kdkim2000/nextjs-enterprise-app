# 모바일 개발 가이드

> 이 문서는 Next.js Enterprise App의 모바일 반응형 개발 가이드입니다.
> 초보 개발자도 쉽게 따라할 수 있도록 단계별로 설명합니다.

## 목차

1. [개요](#1-개요)
2. [핵심 개념](#2-핵심-개념)
3. [레이아웃 시스템](#3-레이아웃-시스템)
4. [모바일 컴포넌트](#4-모바일-컴포넌트)
5. [페이지 개발 가이드](#5-페이지-개발-가이드)
6. [실전 예제](#6-실전-예제)
7. [체크리스트](#7-체크리스트)
8. [트러블슈팅](#8-트러블슈팅)

---

## 1. 개요

### 1.1 반응형 디자인이란?

반응형 디자인은 **하나의 코드**로 다양한 화면 크기(데스크톱, 태블릿, 모바일)에 대응하는 방식입니다.

```
┌─────────────────────────────────────┐
│         데스크톱 (≥900px)            │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │ 카드 1  │ │ 카드 2  │ │ 카드 3 │ │
│  └─────────┘ └─────────┘ └────────┘ │
└─────────────────────────────────────┘

┌───────────────┐
│ 모바일 (<900px)│
│ ┌───────────┐ │
│ │  카드 1   │ │
│ └───────────┘ │
│ ┌───────────┐ │
│ │  카드 2   │ │
│ └───────────┘ │
│ ┌───────────┐ │
│ │  카드 3   │ │
│ └───────────┘ │
└───────────────┘
```

### 1.2 브레이크포인트

이 프로젝트에서 사용하는 화면 크기 기준:

| 구분 | 화면 너비 | 설명 |
|------|----------|------|
| 모바일 | < 600px | 스마트폰 세로 |
| 모바일 레이아웃 | < 900px | 모바일 전용 레이아웃 사용 |
| 태블릿 | 600px ~ 1200px | 태블릿, 작은 노트북 |
| 데스크톱 | ≥ 1200px | 일반 모니터 |

---

## 2. 핵심 개념

### 2.1 useMobile Hook

모바일 여부를 판단하는 **가장 중요한 Hook**입니다.

**파일 위치:** `src/hooks/useMobile.ts`

```typescript
import { useMobile } from '@/hooks/useMobile';

function MyComponent() {
  const { isMobile, isMobileLayout } = useMobile();

  // isMobile: 화면 너비 < 600px (스마트폰)
  // isMobileLayout: 화면 너비 < 900px (모바일 레이아웃 사용)

  if (isMobileLayout) {
    return <MobileView />;
  }
  return <DesktopView />;
}
```

**언제 사용하나요?**

| 속성 | 용도 |
|------|------|
| `isMobile` | 폰트 크기, 버튼 크기, 패딩 등 세부 스타일 조정 |
| `isMobileLayout` | 전체 레이아웃을 모바일/데스크톱으로 분기 |

### 2.2 조건부 렌더링 패턴

모바일과 데스크톱에서 **완전히 다른 UI**를 보여줄 때:

```typescript
function MyPage() {
  const { isMobileLayout } = useMobile();

  // 모바일 레이아웃
  if (isMobileLayout) {
    return (
      <Box sx={{ px: 1.5, py: 1 }}>
        {/* 모바일 전용 UI */}
      </Box>
    );
  }

  // 데스크톱 레이아웃
  return (
    <Box sx={{ height: '100%', overflow: 'hidden' }}>
      {/* 데스크톱 전용 UI */}
    </Box>
  );
}
```

### 2.3 반응형 스타일 패턴

같은 컴포넌트에서 **스타일만 다르게** 할 때:

```typescript
function MyComponent() {
  const { isMobile } = useMobile();

  return (
    <Button
      size={isMobile ? 'small' : 'medium'}
      sx={{
        fontSize: isMobile ? '0.875rem' : '1rem',
        px: isMobile ? 2 : 3,
      }}
    >
      버튼
    </Button>
  );
}
```

---

## 3. 레이아웃 시스템

### 3.1 레이아웃 구조도

```
┌─────────────────────────────────────────────────────────┐
│                    ResponsiveLayout                      │
│  ┌───────────────────┐  ┌─────────────────────────────┐ │
│  │   MobileLayout    │  │   AuthenticatedLayout       │ │
│  │   (< 900px)       │  │   (≥ 900px)                 │ │
│  │                   │  │                             │ │
│  │ ┌───────────────┐ │  │ ┌─────┐ ┌───────────────┐  │ │
│  │ │ MobileHeader  │ │  │ │Side │ │    Content    │  │ │
│  │ ├───────────────┤ │  │ │bar  │ │               │  │ │
│  │ │               │ │  │ │     │ │               │  │ │
│  │ │   Content     │ │  │ │     │ │               │  │ │
│  │ │  (스크롤)     │ │  │ │     │ │               │  │ │
│  │ │               │ │  │ │     │ │               │  │ │
│  │ ├───────────────┤ │  │ └─────┘ └───────────────┘  │ │
│  │ │BottomNav     │ │  │                             │ │
│  │ └───────────────┘ │  └─────────────────────────────┘ │
│  └───────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 MobileLayout

모바일 전용 레이아웃입니다.

**파일 위치:** `src/components/layout/MobileLayout/index.tsx`

**구성 요소:**
- **MobileHeader** (56px): 상단 고정, 햄버거 메뉴 + 앱 로고 + 사용자 아바타
- **Content Area**: 스크롤 가능한 메인 컨텐츠 영역
- **MobileBottomNavigation** (56px): 하단 고정, 주요 메뉴 바로가기

```typescript
// MobileLayout 내부 구조
<Box sx={{ height: '100vh', overflow: 'hidden' }}>
  <MobileHeader />           {/* 고정 헤더 */}

  <Box sx={{
    flex: 1,
    mt: '56px',              {/* 헤더 높이만큼 마진 */}
    mb: '56px',              {/* 하단 네비 높이만큼 마진 */}
    overflowY: 'auto',       {/* 세로 스크롤 */}
  }}>
    {children}               {/* 페이지 컨텐츠 */}
  </Box>

  <MobileBottomNavigation /> {/* 고정 하단 네비게이션 */}
</Box>
```

### 3.3 ResponsiveLayout

화면 크기에 따라 자동으로 레이아웃을 전환합니다.

**파일 위치:** `src/components/layout/ResponsiveLayout/index.tsx`

**사용법:**

```typescript
// layout.tsx
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function DashboardLayout({ children }) {
  return (
    <ResponsiveLayout showAutoLogoutWarning>
      {children}
    </ResponsiveLayout>
  );
}
```

**Props:**

| Prop | 타입 | 설명 |
|------|------|------|
| `requireRole` | `'admin' \| 'manager' \| 'user'` | 접근 권한 제한 |
| `showAutoLogoutWarning` | `boolean` | 자동 로그아웃 경고 표시 |
| `fullBleed` | `boolean` | 패딩 없이 전체 영역 사용 |

### 3.4 ResponsivePageLayout

CRUD 페이지를 위한 반응형 레이아웃입니다.

**파일 위치:** `src/components/common/ResponsivePageLayout/index.tsx`

```typescript
<ResponsivePageLayout
  // 페이지 헤더
  useMenu
  showBreadcrumb

  // 검색
  quickSearch={quickSearch}
  onQuickSearchChange={setQuickSearch}
  onQuickSearch={handleSearch}
  quickSearchPlaceholder="검색어 입력"

  // 고급 필터
  showAdvancedFilter
  filterContent={<FilterFields />}
  onFilterApply={handleFilterApply}

  // 모바일 FAB (플로팅 버튼)
  mobileFab={{
    onClick: handleAdd,
    label: '추가',
  }}

  // 모바일 선택 모드
  mobileSelectionMode={selectionMode}
  mobileSelectedCount={selectedIds.size}
  onMobileSelectionModeToggle={handleToggleSelection}
>
  {/* 데이터 목록 */}
</ResponsivePageLayout>
```

---

## 4. 모바일 컴포넌트

### 4.1 컴포넌트 목록

| 컴포넌트 | 위치 | 용도 |
|----------|------|------|
| `MobileCard` | `src/components/mobile/MobileCard` | 모바일용 카드 (목록 아이템) |
| `MobileCardList` | `src/components/mobile/MobileCardList` | 무한 스크롤 카드 목록 |
| `MobileSearchHeader` | `src/components/mobile/MobileSearchHeader` | 검색 + 필터 + 정렬 헤더 |
| `MobileDetailSheet` | `src/components/mobile/MobileDetailSheet` | 바텀 시트 (상세 정보) |
| `MobileSwipeActions` | `src/components/mobile/MobileSwipeActions` | 스와이프 액션 (삭제, 수정) |
| `MobileFab` | `src/components/mobile/MobileFab` | 플로팅 액션 버튼 |
| `MobileTreeView` | `src/components/mobile/MobileTreeView` | 모바일용 트리뷰 |

### 4.2 MobileCard 사용법

데스크톱의 DataGrid 행을 대체하는 카드 컴포넌트입니다.

```typescript
import MobileCard from '@/components/mobile/MobileCard';

<MobileCard
  item={user}
  primaryText={(u) => u.name}           // 주 텍스트 (제목)
  secondaryText={(u) => u.email}        // 부 텍스트 (설명)
  tertiaryText="2024-01-15"             // 날짜 등 부가 정보
  avatar={<Avatar>{user.name[0]}</Avatar>}
  badge={<StatusBadge status={user.status} />}
  chips={[
    { label: '관리자', color: 'primary' },
    { label: '활성', color: 'success' },
  ]}
  onClick={() => handleClick(user)}
  selected={selectedIds.has(user.id)}
  selectable={selectionMode}
  onSelectionChange={(selected) => handleSelect(user.id, selected)}
  divider
/>
```

### 4.3 MobileCardList 사용법

무한 스크롤을 지원하는 카드 목록입니다.

```typescript
import MobileCardList from '@/components/mobile/MobileCardList';

<MobileCardList
  data={users}
  loading={isLoading}
  emptyMessage="사용자가 없습니다"
  renderCard={(user, index) => (
    <UserMobileCard
      key={user.id}
      user={user}
      rowNumber={index + 1}
      onClick={() => handleClick(user)}
    />
  )}
  keyExtractor={(user) => user.id}
  hasMore={hasMoreData}
  onLoadMore={handleLoadMore}
  onRefresh={handleRefresh}
/>
```

### 4.4 MobileSwipeActions 사용법

좌/우 스와이프로 액션을 실행합니다.

```typescript
import MobileSwipeActions from '@/components/mobile/MobileSwipeActions';

<MobileSwipeActions
  rightActions={[
    {
      icon: <DeleteIcon />,
      label: '삭제',
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: () => handleDelete(item),
    },
    {
      icon: <EditIcon />,
      label: '수정',
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: () => handleEdit(item),
    },
  ]}
>
  <MobileCard item={item} ... />
</MobileSwipeActions>
```

### 4.5 MobileDetailSheet 사용법

바텀에서 올라오는 시트 (모달 대체)입니다.

```typescript
import MobileDetailSheet from '@/components/mobile/MobileDetailSheet';

<MobileDetailSheet
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="상세 정보"
  actions={
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button onClick={handleCancel}>취소</Button>
      <Button variant="contained" onClick={handleSave}>저장</Button>
    </Box>
  }
>
  {/* 시트 내용 */}
  <UserForm user={selectedUser} />
</MobileDetailSheet>
```

---

## 5. 페이지 개발 가이드

### 5.1 새 페이지 만들기 (단계별)

#### Step 1: 페이지 파일 생성

```
src/app/[locale]/my-feature/
├── layout.tsx          # 레이아웃 (ResponsiveLayout 사용)
├── page.tsx            # 메인 페이지
├── components/
│   └── MyMobileCard.tsx  # 모바일 카드 컴포넌트
├── hooks/
│   └── useMyFeature.ts   # 비즈니스 로직 Hook
└── constants.tsx       # 상수, 컬럼 정의
```

#### Step 2: 레이아웃 설정

```typescript
// layout.tsx
'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function MyFeatureLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveLayout>
      {children}
    </ResponsiveLayout>
  );
}
```

#### Step 3: 모바일 카드 컴포넌트 만들기

```typescript
// components/MyMobileCard.tsx
'use client';

import React from 'react';
import { Avatar, Chip, Box, Typography } from '@mui/material';
import MobileCard from '@/components/mobile/MobileCard';
import MobileSwipeActions from '@/components/mobile/MobileSwipeActions';
import { Delete, Edit } from '@mui/icons-material';

interface MyMobileCardProps {
  item: MyItem;
  rowNumber?: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
}

export default function MyMobileCard({
  item,
  rowNumber,
  onClick,
  onEdit,
  onDelete,
  selected = false,
  selectable = false,
  onSelectionChange,
}: MyMobileCardProps) {
  // 스와이프 액션 설정
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
      item={item}
      primaryText={(i) => i.name}
      secondaryText={(i) => i.description}
      avatar={
        <Avatar sx={{ width: 36, height: 36 }}>
          {rowNumber || item.name[0]}
        </Avatar>
      }
      chips={[
        { label: item.status, color: item.status === 'active' ? 'success' : 'default' }
      ]}
      onClick={onClick}
      selected={selected}
      selectable={selectable}
      onSelectionChange={onSelectionChange}
      divider
    />
  );

  // 스와이프 액션이 있으면 감싸기
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

#### Step 4: 메인 페이지 작성

```typescript
// page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import DataGrid from '@/components/common/DataGrid';
import MyMobileCard from './components/MyMobileCard';
import { useMobile } from '@/hooks/useMobile';
import { useMyFeature } from './hooks/useMyFeature';

export default function MyFeaturePage() {
  const { isMobileLayout } = useMobile();
  const {
    items,
    loading,
    searchValue,
    setSearchValue,
    handleSearch,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useMyFeature();

  // 모바일 선택 상태
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);

  return (
    <ResponsivePageLayout
      useMenu
      showBreadcrumb
      quickSearch={searchValue}
      onQuickSearchChange={setSearchValue}
      onQuickSearch={handleSearch}
      quickSearchPlaceholder="검색어 입력..."
      mobileFab={{
        onClick: handleAdd,
        label: '추가',
      }}
      mobileSelectionMode={mobileSelectionMode}
      mobileSelectedCount={mobileSelectedIds.size}
      onMobileSelectionModeToggle={() => {
        setMobileSelectionMode(!mobileSelectionMode);
        if (mobileSelectionMode) setMobileSelectedIds(new Set());
      }}
    >
      {isMobileLayout ? (
        // ===== 모바일 레이아웃 =====
        <MobileCardList
          data={items}
          loading={loading}
          emptyMessage="데이터가 없습니다"
          renderCard={(item, index) => (
            <MyMobileCard
              key={item.id}
              item={item}
              rowNumber={index + 1}
              onClick={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              selected={mobileSelectedIds.has(item.id)}
              selectable={mobileSelectionMode}
              onSelectionChange={(selected) => {
                const newIds = new Set(mobileSelectedIds);
                if (selected) newIds.add(item.id);
                else newIds.delete(item.id);
                setMobileSelectedIds(newIds);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        // ===== 데스크톱 레이아웃 =====
        <DataGrid
          rows={items}
          columns={columns}
          loading={loading}
          // ... 데스크톱 설정
        />
      )}
    </ResponsivePageLayout>
  );
}
```

### 5.2 기존 페이지에 모바일 대응 추가하기

#### Before (데스크톱만 지원)

```typescript
export default function UsersPage() {
  return (
    <StandardCrudPageLayout>
      <DataGrid rows={users} columns={columns} />
    </StandardCrudPageLayout>
  );
}
```

#### After (모바일 + 데스크톱)

```typescript
import { useMobile } from '@/hooks/useMobile';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import UserMobileCard from './components/UserMobileCard';

export default function UsersPage() {
  const { isMobileLayout } = useMobile();

  return (
    <ResponsivePageLayout
      // ... props
    >
      {isMobileLayout ? (
        <MobileCardList
          data={users}
          renderCard={(user) => <UserMobileCard user={user} />}
          keyExtractor={(user) => user.id}
        />
      ) : (
        <DataGrid rows={users} columns={columns} />
      )}
    </ResponsivePageLayout>
  );
}
```

---

## 6. 실전 예제

### 6.1 대시보드 페이지

대시보드는 고정 헤더 없이 전체 스크롤하는 패턴입니다.

```typescript
// src/app/[locale]/dashboard/page.tsx

export default function DashboardPage() {
  const { isMobileLayout } = useMobile();

  // 모바일: 단순 레이아웃 (MobileLayout의 스크롤 사용)
  if (isMobileLayout) {
    return (
      <RouteGuard>
        <Box sx={{ px: 1.5, py: 1 }}>
          {/* 툴바 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <ToggleButtonGroup size="small" ... />
            <IconButton onClick={refresh}><Refresh /></IconButton>
          </Box>

          {/* KPI 카드 */}
          <Box sx={{ mb: 2 }}>
            <KPICards summary={summary} loading={loading} />
          </Box>

          {/* 차트들 - 단일 컬럼 */}
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <ActivityTrendChart data={activityTrend} />
            </Grid>
            <Grid item xs={12}>
              <UserStatusChart data={userStatus} />
            </Grid>
            {/* ... 더 많은 차트 */}
          </Grid>
        </Box>
      </RouteGuard>
    );
  }

  // 데스크톱: 고정 헤더 + 내부 스크롤
  return (
    <RouteGuard>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 고정 헤더 */}
        <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
          <PageHeader useMenu showBreadcrumb />
          {/* 툴바 */}
        </Box>

        {/* 스크롤 영역 */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {/* 컨텐츠 */}
        </Box>
      </Box>
    </RouteGuard>
  );
}
```

### 6.2 상세 페이지 (게시글 상세)

```typescript
// src/app/[locale]/boards/[boardTypeId]/[postId]/page.tsx

export default function PostDetailPage() {
  const { isMobileLayout } = useMobile();

  // 모바일 레이아웃
  if (isMobileLayout) {
    return (
      <Box sx={{ px: 1.5, py: 1 }}>
        {/* 모바일 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <IconButton onClick={goBack} size="small">
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {post.title}
            </Typography>
          </Box>
          {canEdit && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton onClick={handleEdit} size="small"><Edit fontSize="small" /></IconButton>
              <IconButton onClick={handleDelete} size="small"><Delete fontSize="small" /></IconButton>
            </Box>
          )}
        </Box>

        {/* 메타 정보 */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption">{post.author}</Typography>
          <Typography variant="caption">{post.date}</Typography>
        </Box>

        {/* 본문 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <SafeHtmlRenderer html={post.content} sx={{ fontSize: '0.875rem' }} />
        </Paper>

        {/* 댓글 */}
        <Paper sx={{ p: 2 }}>
          {/* 댓글 목록 */}
        </Paper>
      </Box>
    );
  }

  // 데스크톱 레이아웃
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 고정 헤더 */}
      <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        {/* 헤더 내용 */}
      </Box>

      {/* 스크롤 영역 */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* 본문 + 댓글 */}
      </Box>
    </Box>
  );
}
```

### 6.3 폼 페이지 (게시글 작성)

```typescript
// src/components/boards/PostFormPage.tsx

export default function PostFormPage({ mode, postId }) {
  const { isMobileLayout } = useMobile();

  // 모바일 레이아웃
  if (isMobileLayout) {
    return (
      <Box sx={{ px: 1.5, py: 1 }}>
        {/* 모바일 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <IconButton onClick={handleCancel} size="small">
            <ArrowBack fontSize="small" />
          </IconButton>
          <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
            {mode === 'create' ? '새 글 작성' : '글 수정'}
          </Typography>
          <IconButton onClick={handleCancel} size="small" color="error">
            <Close fontSize="small" />
          </IconButton>
          <IconButton onClick={handleSubmit} size="small" color="primary" sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Save fontSize="small" />
          </IconButton>
        </Box>

        {/* 모바일 폼 */}
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField label="제목" size="small" fullWidth />
            <RichTextEditor minHeight={200} />
            {/* ... */}
          </Stack>
        </Paper>
      </Box>
    );
  }

  // 데스크톱 레이아웃
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ... */}
    </Box>
  );
}
```

---

## 7. 체크리스트

### 7.1 새 페이지 개발 체크리스트

- [ ] `useMobile` hook import 추가
- [ ] `isMobileLayout` 조건 분기 추가
- [ ] 모바일 카드 컴포넌트 생성 (`*MobileCard.tsx`)
- [ ] `ResponsivePageLayout` 사용 (목록 페이지)
- [ ] 모바일 FAB 버튼 설정 (추가 기능용)
- [ ] 스와이프 액션 설정 (편집/삭제)
- [ ] 모바일 선택 모드 구현
- [ ] 스크롤 테스트

### 7.2 모바일 스타일 체크리스트

- [ ] 패딩/마진 축소 (`px: 1.5, py: 1`)
- [ ] 폰트 크기 축소 (`0.75rem` ~ `0.875rem`)
- [ ] 버튼 크기 축소 (`size="small"`)
- [ ] 아이콘 크기 축소 (`fontSize="small"`)
- [ ] 입력 필드 축소 (`size="small"`)
- [ ] Grid 단일 컬럼 (`xs={12}`)

### 7.3 테스트 체크리스트

- [ ] 크롬 개발자 도구 모바일 모드 테스트
- [ ] 실제 모바일 기기 테스트
- [ ] 스크롤 동작 확인
- [ ] 터치 인터랙션 확인
- [ ] 스와이프 동작 확인
- [ ] 가로/세로 모드 전환 확인

---

## 8. 트러블슈팅

### 8.1 스크롤이 안 됨

**원인:** 부모 요소에 `height: '100%'`와 `overflow: 'hidden'`이 설정되어 있음

**해결:**
```typescript
// 모바일에서는 고정 높이 없이 사용
if (isMobileLayout) {
  return (
    <Box sx={{ px: 1.5, py: 1 }}>  {/* height 없음! */}
      {/* 컨텐츠 */}
    </Box>
  );
}

// 데스크톱에서만 고정 높이 + 내부 스크롤
return (
  <Box sx={{ height: '100%', overflow: 'hidden' }}>
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      {/* 컨텐츠 */}
    </Box>
  </Box>
);
```

### 8.2 MobileLayout 헤더/하단 네비가 겹침

**원인:** 컨텐츠 영역에 margin-top/bottom이 없음

**해결:**
```typescript
// MobileLayout이 자동으로 처리하므로
// 페이지에서는 padding만 사용
<Box sx={{ px: 1.5, py: 1 }}>
  {/* 컨텐츠 */}
</Box>
```

### 8.3 useMobile이 서버에서 오류 발생

**원인:** 서버 사이드 렌더링에서 `window` 객체 없음

**해결:**
```typescript
// useMobile hook은 'use client' 컴포넌트에서만 사용
'use client';

import { useMobile } from '@/hooks/useMobile';
```

### 8.4 모바일에서 DataGrid가 표시됨

**원인:** `isMobileLayout` 조건 분기 누락

**해결:**
```typescript
const { isMobileLayout } = useMobile();

// 조건 분기 필수!
if (isMobileLayout) {
  return <MobileCardList ... />;
}
return <DataGrid ... />;
```

### 8.5 스와이프가 동작하지 않음

**원인:** `MobileSwipeActions` 컴포넌트 미사용

**해결:**
```typescript
import MobileSwipeActions from '@/components/mobile/MobileSwipeActions';

<MobileSwipeActions rightActions={[...]}>
  <MobileCard ... />
</MobileSwipeActions>
```

---

## 부록: 자주 사용하는 모바일 스타일

### 패딩/마진

```typescript
// 페이지 컨테이너
sx={{ px: 1.5, py: 1 }}

// 카드 내부
sx={{ p: 2 }}

// 요소 간격
sx={{ mb: 1.5 }}
sx={{ gap: 1 }}
```

### 폰트 크기

```typescript
// 제목
variant="subtitle2"  // 0.875rem
fontWeight={600}

// 본문
variant="body2"      // 0.875rem
fontSize="0.8rem"

// 캡션
variant="caption"    // 0.75rem
fontSize="0.65rem"
```

### 버튼/아이콘

```typescript
// 버튼
<Button size="small" />
<IconButton size="small" />

// 아이콘
<Icon fontSize="small" />
<Icon sx={{ fontSize: 16 }} />
```

### Grid

```typescript
// 모바일: 단일 컬럼
<Grid container spacing={1.5}>
  <Grid item xs={12}>...</Grid>
  <Grid item xs={12}>...</Grid>
</Grid>

// 데스크톱: 다중 컬럼
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>...</Grid>
  <Grid item xs={12} md={6}>...</Grid>
</Grid>
```

---

> **문서 버전:** 1.0
> **최종 수정일:** 2024-12-16
> **작성자:** Development Team
