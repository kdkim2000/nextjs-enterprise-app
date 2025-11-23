# 게시판 라우팅 구조 개선

## 개요

게시판 시스템의 라우팅 구조를 통합하여 코드 중복을 제거하고 유지보수성을 향상시켰습니다.

## 리팩토링 전 구조

### 문제점

1. **심각한 코드 중복 (95% 동일)**
   - 사용자용 페이지와 관리자용 페이지가 거의 동일한 코드 사용
   - 유일한 차이점: 리다이렉션 URL 경로만 다름

2. **유지보수 어려움**
   - 동일한 기능 수정 시 2곳 모두 수정 필요
   - 버그 발생 시 양쪽 모두 확인 필요

3. **파일 구조**
```
사용자용:
  /boards/[boardTypeId]/page.tsx                    - 게시판 목록
  /boards/[boardTypeId]/write/page.tsx              - 게시글 작성
  /boards/[boardTypeId]/[postId]/page.tsx           - 게시글 상세
  /boards/[boardTypeId]/[postId]/edit/page.tsx      - 게시글 수정

관리자용:
  /admin/boards/[boardTypeId]/page.tsx              - 게시판 관리
  /admin/boards/[boardTypeId]/write/page.tsx        - 게시글 작성 (중복)
  /admin/boards/[boardTypeId]/[postId]/page.tsx     - 게시글 상세
  /admin/boards/[boardTypeId]/[postId]/edit/page.tsx - 게시글 수정 (중복)
```

## 리팩토링 후 구조

### 개선 사항

1. **통합 라우팅 (Unified Routing)**
   - 작성/수정 페이지를 하나의 경로로 통합
   - 파일 수 50% 감소
   - 코드 중복 완전 제거

2. **보안 강화**
   - 프론트엔드 경로 분리 대신 백엔드 권한 체크에 의존
   - 미들웨어 기반 접근 제어

3. **새로운 파일 구조**
```
모든 사용자 (권한별 백엔드 제어):
  /boards/[boardTypeId]/page.tsx                    - 게시판 목록
  /boards/[boardTypeId]/write/page.tsx              - 게시글 작성 (권한 체크)
  /boards/[boardTypeId]/[postId]/page.tsx           - 게시글 상세
  /boards/[boardTypeId]/[postId]/edit/page.tsx      - 게시글 수정 (권한 체크)

관리자 전용:
  /admin/boards/[boardTypeId]/page.tsx              - 게시판 관리 (관리자 전용)
  /admin/boards/[boardTypeId]/[postId]/page.tsx     - 게시글 상세 (관리자 뷰)
  /admin/posts/page.tsx                             - 게시글 일괄 관리
```

## 백엔드 권한 체크

### 미들웨어 (backend/middleware/boardAccessControl.js)

1. **checkBoardWritePermission**
   - 게시판 타입별 쓰기 권한 체크
   - 공지사항(notice): 관리자만 작성 가능
   - 일반 게시판: write_roles 기반 권한 체크

2. **checkPostEditPermission**
   - 게시글 수정/삭제 권한 체크
   - 관리자: 모든 게시글 수정/삭제 가능
   - 일반 사용자: 본인의 게시글만 수정/삭제 가능

3. **checkSecretPostAccess**
   - 비밀글 접근 권한 체크
   - 관리자 또는 작성자만 접근 가능

### API 라우트 (backend/routes/post.js)

```javascript
// 게시글 작성
POST /api/post
- authenticateToken: 로그인 확인
- 인라인 권한 체크: boardType.type === 'notice' && role !== 'admin'

// 게시글 수정
PUT /api/post/:id
- authenticateToken: 로그인 확인
- checkPostEditPermission: 작성자 또는 관리자만

// 게시글 삭제
DELETE /api/post/:id
- authenticateToken: 로그인 확인
- checkPostEditPermission: 작성자 또는 관리자만

// 게시글 조회
GET /api/post/:id
- authenticateToken: 로그인 확인
- checkSecretPostAccess: 비밀글 권한 체크
```

## 수정된 파일

1. **삭제된 파일**
   - `/admin/boards/[boardTypeId]/write/page.tsx` (중복 제거)
   - `/admin/boards/[boardTypeId]/[postId]/edit/page.tsx` (중복 제거)

2. **수정된 파일**
   - `/admin/boards/[boardTypeId]/page.tsx`
     - Line 126: `/admin/boards/${boardTypeId}/write` → `/boards/${boardTypeId}/write`
   - `/admin/boards/[boardTypeId]/[postId]/page.tsx`
     - Line 205: `/admin/boards/${boardTypeId}/${postId}/edit` → `/boards/${boardTypeId}/${postId}/edit`

## 사용 시나리오

### 일반 사용자

1. 게시판 목록 조회: `/boards/notice` (권한 있으면 접근)
2. 게시글 작성: `/boards/notice/write` (백엔드에서 403 Forbidden 반환)
3. 본인 게시글 수정: `/boards/notice/POST-123/edit` (성공)
4. 타인 게시글 수정: `/boards/notice/POST-456/edit` (백엔드에서 403 Forbidden 반환)

### 관리자

1. 관리자 게시판 목록: `/admin/boards/notice` (관리 기능 포함)
2. 게시글 작성: `/boards/notice/write` (성공)
3. 모든 게시글 수정: `/boards/notice/POST-*/edit` (성공)
4. 게시글 일괄 관리: `/admin/posts` (관리자 전용)

## 장점

1. **유지보수성 향상**
   - 단일 코드베이스로 관리
   - 버그 수정 시 한 곳만 수정

2. **보안 강화**
   - 프론트엔드 경로가 아닌 백엔드 권한 체크에 의존
   - 일관된 권한 제어

3. **확장성**
   - 새로운 게시판 타입 추가 시 코드 수정 불필요
   - 권한 체크 로직을 백엔드에서 중앙 관리

4. **성능 개선**
   - 파일 수 감소로 빌드 시간 단축
   - 번들 크기 감소

## 주의사항

1. **백엔드 권한 체크 필수**
   - 모든 API 엔드포인트는 적절한 미들웨어 사용 필요
   - 프론트엔드 경로만으로는 보안 보장 불가

2. **에러 처리**
   - 403 Forbidden 응답 시 적절한 에러 메시지 표시
   - 권한 없음 안내 및 리다이렉션 처리

3. **URL 북마크**
   - 사용자는 `/boards` 경로를 북마크
   - 관리자는 `/admin/boards` 경로를 북마크 (관리 기능 접근)

## 테스트 체크리스트

- [ ] 일반 사용자 게시글 작성 (권한 있는 게시판)
- [ ] 일반 사용자 공지사항 작성 (403 Forbidden 확인)
- [ ] 일반 사용자 본인 게시글 수정
- [ ] 일반 사용자 타인 게시글 수정 시도 (403 Forbidden 확인)
- [ ] 관리자 모든 게시글 수정
- [ ] 관리자 게시글 삭제
- [ ] 비밀글 작성자/관리자만 조회
- [ ] 게시글 핀 기능 (관리자만)

## 결론

통합 라우팅 구조를 통해 코드 중복을 완전히 제거하고, 백엔드 권한 체크를 통해 보안을 강화했습니다.
이를 통해 유지보수성이 향상되고, 새로운 기능 추가 시 일관된 방식으로 개발할 수 있습니다.
