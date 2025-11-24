# 게시판 시스템 코드 중복 제거 및 개선 계획

## 현재 문제점

### 1. 코드 중복 (Code Duplication)

#### 파일 분석:
- **`src/app/[locale]/boards/[boardTypeId]/write/page.tsx`** (280줄)
- **`src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx`** (342줄)

**중복률: 90% 이상**

#### 중복되는 내용:
- 동일한 imports (React, MUI, hooks)
- 동일한 interface 정의 (BoardType)
- 동일한 state 관리 (title, content, tags, files, isSecret)
- 동일한 폼 컴포넌트 (TextField, RichTextEditor, FileUploadZone, TagInput)
- 동일한 validation 로직
- 동일한 UI 레이아웃
- 거의 동일한 에러 처리

#### 차이점만 추출:
| 항목 | Write Page | Edit Page |
|------|------------|-----------|
| 데이터 로딩 | Board type만 | Board type + Post data |
| API 호출 | POST /post | PUT /post/:id |
| Breadcrumb | Home > Board > Write | Home > Board > Post > Edit |
| 버튼 텍스트 | "Save Post" | "Update Post" |

### 2. 라우팅 Locale 누락 문제

#### 문제 코드:
```typescript
// ❌ 잘못된 코드 (locale 누락)
router.push(`/boards/${boardTypeId}/write`);
router.push(`/boards/${boardTypeId}/${postId}/edit`);
router.push(`/boards/${boardTypeId}/${postId}`);
router.push(`/boards/${boardTypeId}`);
router.push('/');
```

#### 수정 필요:
```typescript
// ✅ 올바른 코드 (locale 포함)
router.push(`/${currentLocale}/boards/${boardTypeId}/write`);
router.push(`/${currentLocale}/boards/${boardTypeId}/${postId}/edit`);
router.push(`/${currentLocale}/boards/${boardTypeId}/${postId}`);
router.push(`/${currentLocale}/boards/${boardTypeId}`);
router.push(`/${currentLocale}`);
```

#### 영향받는 파일:
- `src/app/[locale]/boards/[boardTypeId]/write/page.tsx` (4곳)
- `src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx` (5곳)
- `src/app/[locale]/boards/[boardTypeId]/page.tsx` (2곳)

### 3. Admin 영역 페이지 구조

현재 구조:
```
src/app/[locale]/
├── boards/                    # 사용자 영역
│   └── [boardTypeId]/
│       ├── page.tsx          # 게시글 목록
│       ├── write/page.tsx    # 글쓰기
│       ├── [postId]/
│       │   ├── page.tsx      # 게시글 상세
│       │   └── edit/page.tsx # 편집
│
└── admin/
    ├── posts/page.tsx        # 관리자 게시글 관리
    └── boards/
        └── [boardTypeId]/
            ├── page.tsx      # 관리자 게시판 목록
            └── [postId]/page.tsx  # 관리자 게시글 상세
```

**부족한 부분:**
- ❌ Admin write 페이지 없음
- ❌ Admin edit 페이지 없음
- ℹ️ admin/posts에서 통합 관리 중

## 개선 솔루션

### 1. 공통 컴포넌트 생성 ✅ 완료

**파일: `src/components/boards/PostFormPage.tsx`**

```typescript
interface PostFormPageProps {
  boardTypeId: string;
  postId?: string;
  mode: 'create' | 'edit';
  basePath?: string;  // '/boards' or '/admin/boards'
  pageTitle?: string;
  submitButtonText?: string;
}
```

**장점:**
- ✅ Write와 Edit 로직을 하나로 통합
- ✅ 280+342줄 → 약 400줄로 축소 (50% 코드 감소)
- ✅ Props로 동작 모드 제어
- ✅ 사용자/관리자 영역 모두 사용 가능
- ✅ locale 라우팅 자동 처리
- ✅ 유지보수 용이성 향상

### 2. 페이지 리팩토링 계획

#### Step 1: Write 페이지 간소화
**Before (280줄):**
```typescript
// src/app/[locale]/boards/[boardTypeId]/write/page.tsx
export default function PostWritePage() {
  // 280 lines of code...
}
```

**After (15줄):**
```typescript
// src/app/[locale]/boards/[boardTypeId]/write/page.tsx
'use client';
import { useParams } from 'next/navigation';
import PostFormPage from '@/components/boards/PostFormPage';

export default function PostWritePage() {
  const params = useParams();
  return (
    <PostFormPage
      boardTypeId={params.boardTypeId as string}
      mode="create"
      basePath="/boards"
    />
  );
}
```

#### Step 2: Edit 페이지 간소화
**Before (342줄):**
```typescript
// src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx
export default function PostEditPage() {
  // 342 lines of code...
}
```

**After (16줄):**
```typescript
// src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx
'use client';
import { useParams } from 'next/navigation';
import PostFormPage from '@/components/boards/PostFormPage';

export default function PostEditPage() {
  const params = useParams();
  return (
    <PostFormPage
      boardTypeId={params.boardTypeId as string}
      postId={params.postId as string}
      mode="edit"
      basePath="/boards"
    />
  );
}
```

#### Step 3: Admin 페이지 생성 (선택사항)

필요시 Admin 전용 write/edit 페이지도 쉽게 생성 가능:

```typescript
// src/app/[locale]/admin/boards/[boardTypeId]/write/page.tsx
export default function AdminPostWritePage() {
  const params = useParams();
  return (
    <PostFormPage
      boardTypeId={params.boardTypeId as string}
      mode="create"
      basePath="/admin/boards"
      pageTitle="관리자 공지사항 작성"
    />
  );
}
```

### 3. 라우팅 수정 계획

**수정 대상 파일:**
1. `src/app/[locale]/boards/[boardTypeId]/page.tsx`
   - handleWriteClick
   - Home 버튼 클릭

2. `src/components/boards/PostFormPage.tsx` (이미 수정됨 ✅)
   - 모든 router.push에 locale 포함

3. `src/components/common/PostDetailDrawer/index.tsx`
   - 있다면 라우팅 확인 필요

## 적용 방법

### 방법 1: 개발 서버 중지 후 수정 (권장)

```bash
# 1. 개발 서버 중지
# Ctrl+C 또는 터미널 종료

# 2. 파일 백업
cp src/app/[locale]/boards/[boardTypeId]/write/page.tsx src/app/[locale]/boards/[boardTypeId]/write/page.tsx.backup
cp src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx.backup

# 3. 파일 수정 (위의 After 코드로 교체)

# 4. 개발 서버 재시작
npm run dev
```

### 방법 2: 점진적 마이그레이션

1. 새 파일 이름으로 생성 후 테스트
2. 문제없으면 원본 파일 교체
3. 한 번에 하나씩 적용

### 방법 3: Feature Flag 사용

```typescript
// 환경 변수로 제어
const USE_NEW_POST_FORM = process.env.NEXT_PUBLIC_USE_NEW_POST_FORM === 'true';

export default function PostWritePage() {
  if (USE_NEW_POST_FORM) {
    return <PostFormPage {...props} />;
  }
  return <OldPostWritePage />; // 기존 코드
}
```

## 기대 효과

### 코드 품질
- ✅ 코드 중복 제거: 622줄 → 약 430줄 (30% 감소)
- ✅ 유지보수성 향상: 1곳만 수정하면 모든 페이지 반영
- ✅ 버그 감소: 동일 로직 공유로 일관성 향상
- ✅ 테스트 용이성: 공통 컴포넌트 1개만 테스트

### 개발 생산성
- ✅ 새 게시판 타입 추가 시 페이지 자동 생성 (15줄만 작성)
- ✅ 기능 추가 시 1곳만 수정
- ✅ Admin 페이지도 동일 컴포넌트 재사용

### 성능
- ℹ️ 번들 크기 감소 (중복 코드 제거)
- ℹ️ 로딩 속도 향상

## 다음 단계

1. ✅ PostFormPage 컴포넌트 생성 완료
2. ⏳ Write 페이지 리팩토링
3. ⏳ Edit 페이지 리팩토링
4. ⏳ Locale 라우팅 문제 수정
5. ⏳ Admin 페이지 필요 시 생성
6. ⏳ 테스트 및 검증

## 참고사항

- 기존 파일 백업 필수
- git commit 전에 테스트 필수
- 한 번에 하나씩 적용 권장
- 문제 발생 시 즉시 롤백 가능하도록 준비
