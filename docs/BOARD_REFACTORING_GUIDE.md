# 게시판 시스템 리팩토링 가이드

## 📋 개요

아직 **개선이 완료되지 않았습니다**. 현재 write와 edit 페이지에 심각한 코드 중복이 존재합니다.

### 현재 상태
- ❌ **코드 중복**: 622줄 (write 280줄 + edit 342줄)
- ❌ **중복률**: 90% 이상
- ❌ **Locale 라우팅 문제**: 모든 페이지에서 locale 누락

### 개선 후 예상
- ✅ **코드 감소**: 622줄 → 약 430줄 (30% 감소)
- ✅ **유지보수성**: 1곳만 수정하면 모든 페이지 반영
- ✅ **Locale 라우팅**: 자동으로 locale 포함

## 🎯 생성된 파일

### 1. 공통 컴포넌트 (✅ 완료)
```
src/components/boards/PostFormPage.tsx
```
Write와 Edit 로직을 통합한 재사용 가능한 컴포넌트

### 2. 리팩토링 스크립트
```
scripts/refactor-board-pages.bat   # Windows용
scripts/refactor-board-pages.sh    # Linux/Mac용
```

### 3. 문서
```
docs/board-refactoring-plan.md          # 상세 리팩토링 계획
docs/BOARD_REFACTORING_GUIDE.md         # 이 파일
```

## 🚀 적용 방법

### 방법 1: 자동 스크립트 사용 (권장)

#### Windows:
```bash
# 1. 개발 서버 중지 (Ctrl+C)

# 2. 스크립트 실행
scripts\refactor-board-pages.bat

# 3. 개발 서버 재시작
npm run dev
```

#### Linux/Mac:
```bash
# 1. 개발 서버 중지 (Ctrl+C)

# 2. 스크립트 실행 권한 부여
chmod +x scripts/refactor-board-pages.sh

# 3. 스크립트 실행
./scripts/refactor-board-pages.sh

# 4. 개발 서버 재시작
npm run dev
```

### 방법 2: 수동 적용

#### Step 1: Write 페이지 교체

**파일: `src/app/[locale]/boards/[boardTypeId]/write/page.tsx`**

기존 280줄을 다음 15줄로 교체:

```typescript
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PostFormPage from '@/components/boards/PostFormPage';

export default function PostWritePage() {
  const params = useParams();
  const boardTypeId = params.boardTypeId as string;

  return (
    <PostFormPage
      boardTypeId={boardTypeId}
      mode="create"
      basePath="/boards"
    />
  );
}
```

#### Step 2: Edit 페이지 교체

**파일: `src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx`**

기존 342줄을 다음 17줄로 교체:

```typescript
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PostFormPage from '@/components/boards/PostFormPage';

export default function PostEditPage() {
  const params = useParams();
  const boardTypeId = params.boardTypeId as string;
  const postId = params.postId as string;

  return (
    <PostFormPage
      boardTypeId={boardTypeId}
      postId={postId}
      mode="edit"
      basePath="/boards"
    />
  );
}
```

## 🧪 테스트 체크리스트

리팩토링 후 다음을 확인하세요:

### 기본 기능
- [ ] 게시글 작성 페이지 접속 (`/ko/boards/BOARD-TYPE-NOTICE/write`)
- [ ] 제목 입력 가능
- [ ] 내용 입력 가능 (RichTextEditor)
- [ ] 태그 추가/삭제 가능
- [ ] 파일 첨부 가능 (설정된 경우)
- [ ] 비밀글 체크박스 동작
- [ ] "Save Post" 버튼 클릭 시 게시글 생성
- [ ] 생성 후 상세 페이지로 리다이렉트

### 편집 기능
- [ ] 게시글 편집 페이지 접속 (`/ko/boards/BOARD-TYPE-NOTICE/{postId}/edit`)
- [ ] 기존 데이터 로드 (제목, 내용, 태그)
- [ ] 데이터 수정 가능
- [ ] "Update Post" 버튼 클릭 시 게시글 업데이트
- [ ] 업데이트 후 상세 페이지로 리다이렉트

### Breadcrumb 및 네비게이션
- [ ] Breadcrumb 정상 표시
- [ ] Home 버튼 클릭 시 홈으로 이동 (locale 포함)
- [ ] 게시판 이름 클릭 시 목록으로 이동 (locale 포함)
- [ ] Cancel 버튼 클릭 시 확인 대화상자 표시
- [ ] Cancel 확인 시 이전 페이지로 이동 (locale 포함)

### Locale 라우팅
- [ ] 모든 라우팅에 locale 포함 확인 (`/ko/`, `/en/`, `/zh/`, `/vi/`)
- [ ] 다국어 전환 시 정상 동작
- [ ] 게시판 이름 다국어 표시

### 에러 처리
- [ ] 제목 미입력 시 에러 메시지
- [ ] 내용 미입력 시 에러 메시지
- [ ] 네트워크 에러 처리
- [ ] 404 에러 처리 (존재하지 않는 게시글)

## 🔄 롤백 방법

### 스크립트 사용 시
백업 파일이 `backup/YYYYMMDD_HHMMSS/` 디렉토리에 저장됩니다.

```bash
# Windows
copy backup\20250124_123456\write-page.tsx.backup src\app\[locale]\boards\[boardTypeId]\write\page.tsx
copy backup\20250124_123456\edit-page.tsx.backup src\app\[locale]\boards\[boardTypeId]\[postId]\edit\page.tsx

# Linux/Mac
cp backup/20250124_123456/write-page.tsx.backup src/app/[locale]/boards/[boardTypeId]/write/page.tsx
cp backup/20250124_123456/edit-page.tsx.backup src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx
```

### Git 사용 시
```bash
git checkout -- src/app/[locale]/boards/[boardTypeId]/write/page.tsx
git checkout -- src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx
```

## 📊 Before & After 비교

### 코드 라인 수
| 항목 | Before | After | 감소율 |
|------|--------|-------|--------|
| Write 페이지 | 280줄 | 15줄 | 94% ↓ |
| Edit 페이지 | 342줄 | 17줄 | 95% ↓ |
| 공통 컴포넌트 | 0줄 | 400줄 | - |
| **총합** | **622줄** | **432줄** | **30% ↓** |

### 유지보수성
| 항목 | Before | After |
|------|--------|-------|
| 버그 수정 | 2곳 수정 필요 | 1곳만 수정 |
| 기능 추가 | 2곳 추가 필요 | 1곳만 추가 |
| 새 게시판 추가 | 280+342줄 복사 | 15+17줄만 작성 |

### Locale 라우팅
| 항목 | Before | After |
|------|--------|-------|
| Write 페이지 | ❌ 4곳 누락 | ✅ 자동 처리 |
| Edit 페이지 | ❌ 5곳 누락 | ✅ 자동 처리 |

## 🔧 고급 사용법

### Admin 페이지 생성

관리자 전용 write/edit 페이지도 동일한 컴포넌트로 쉽게 생성:

```typescript
// src/app/[locale]/admin/boards/[boardTypeId]/write/page.tsx
'use client';
import { useParams } from 'next/navigation';
import PostFormPage from '@/components/boards/PostFormPage';

export default function AdminPostWritePage() {
  const params = useParams();
  return (
    <PostFormPage
      boardTypeId={params.boardTypeId as string}
      mode="create"
      basePath="/admin/boards"
      pageTitle="관리자 공지사항 작성"
      submitButtonText="공지 등록"
    />
  );
}
```

### 커스터마이징

PostFormPage는 다양한 props를 지원합니다:

```typescript
<PostFormPage
  boardTypeId="BOARD-TYPE-NOTICE"
  postId="POST-123"              // 편집 모드일 때만
  mode="create"                  // 'create' | 'edit'
  basePath="/boards"             // 기본 경로
  pageTitle="커스텀 제목"         // 페이지 제목 오버라이드
  submitButtonText="커스텀 버튼"  // 제출 버튼 텍스트 오버라이드
/>
```

## 📝 다음 단계

1. ✅ PostFormPage 컴포넌트 생성 완료
2. ⏳ **Write 페이지 리팩토링** ← 현재 단계
3. ⏳ Edit 페이지 리팩토링
4. ⏳ 테스트 및 검증
5. ⏳ Locale 라우팅 문제 전체 수정
6. ⏳ Admin 페이지 생성 (필요시)

## 🐛 문제 해결

### Q: 타입 에러가 발생합니다
A: PostFormPage 컴포넌트가 제대로 생성되었는지 확인하세요.
```bash
ls -la src/components/boards/PostFormPage.tsx
```

### Q: 페이지가 빈 화면으로 나옵니다
A: 다음을 확인하세요:
1. Board Type status가 'active'인지
2. 사용자가 로그인되어 있는지
3. 사용자에게 해당 게시판 read 권한이 있는지

### Q: 라우팅이 제대로 동작하지 않습니다
A: PostFormPage 컴포넌트 내부에서 모든 라우팅은 locale을 포함합니다. 브라우저 콘솔에서 에러를 확인하세요.

## 📚 관련 문서

- [상세 리팩토링 계획](./board-refactoring-plan.md)
- [게시판 시스템 구현 완료 문서](./board-system-implementation-complete.md)

## ✅ 적용 완료 확인

다음 명령어로 현재 상태를 확인할 수 있습니다:

```bash
# Write 페이지 라인 수 확인 (15줄이면 적용 완료)
wc -l src/app/[locale]/boards/[boardTypeId]/write/page.tsx

# Edit 페이지 라인 수 확인 (17줄이면 적용 완료)
wc -l src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx

# Windows에서는
type src\app\[locale]\boards\[boardTypeId]\write\page.tsx | find /c /v ""
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. TypeScript 에러 확인: `npx tsc --noEmit`
2. ESLint 에러 확인: `npm run lint`
3. 브라우저 콘솔 에러 확인
4. 백업 파일로 롤백

---

**마지막 업데이트**: 2025-01-23
**작성자**: Claude Code
**버전**: 1.0.0
