# 게시글 작성 오류 수정

## 🐛 문제 상황

**에러 메시지**:
```
POST http://localhost:3001/api/post 400 (Bad Request)
Error creating post: Error: Missing required fields: boardTypeId, title, content
```

**날짜**: 2025-11-23
**파일**: `src/components/boards/PostFormPage.tsx`

---

## 🔍 원인 분석

### 1. 필드명 불일치 (Snake Case vs Camel Case)

**프론트엔드 (Before)**:
```typescript
// src/components/boards/PostFormPage.tsx (Line 175)
const postData = {
  board_type_id: boardType!.id,  // ❌ snake_case
  title: title.trim(),
  content,
  tags,
  is_secret: isSecret             // ❌ snake_case
};
```

**백엔드 (Expected)**:
```javascript
// backend/routes/post.js (Line 185)
const {
  boardTypeId,  // ✅ camelCase
  title,
  content,
  postType,
  status,
  isSecret,     // ✅ camelCase
  isPinned,
  pinnedUntil,
  tags,
  metadata
} = req.body;

// Validation (Line 191)
if (!boardTypeId || !title || !content) {
  return res.status(400).json({
    error: 'Missing required fields: boardTypeId, title, content'
  });
}
```

**문제**:
- 프론트엔드가 `board_type_id`를 보냈지만 백엔드는 `boardTypeId`를 기대
- 프론트엔드가 `is_secret`를 보냈지만 백엔드는 `isSecret`를 기대
- 필드명이 일치하지 않아 백엔드에서 `undefined`로 인식
- Validation에서 400 에러 발생

### 2. 응답 데이터 구조 불일치

**백엔드 응답**:
```javascript
// backend/routes/post.js (Line 240)
res.status(201).json({ post: newPost });
```

**프론트엔드 (Before)**:
```typescript
// PostFormPage.tsx (Line 191)
finalPostId = postResponse.data.id;  // ❌ data.id
```

**문제**:
- 백엔드가 `{ post: { id, ... } }` 형식으로 응답
- 프론트엔드가 `response.data.id`를 기대했지만 실제로는 `response.data.post.id`

---

## ✅ 해결 방법

### 수정 1: 필드명을 camelCase로 변경

**파일**: `src/components/boards/PostFormPage.tsx` (Line 174-180)

**Before**:
```typescript
const postData = {
  ...(mode === 'create' && { board_type_id: boardType!.id }),
  title: title.trim(),
  content,
  tags,
  is_secret: isSecret
};
```

**After**:
```typescript
const postData = {
  ...(mode === 'create' && { boardTypeId: boardType!.id }),
  title: title.trim(),
  content,
  tags,
  isSecret: isSecret
};
```

**변경 사항**:
- `board_type_id` → `boardTypeId`
- `is_secret` → `isSecret`

### 수정 2: 응답 데이터 경로 수정

**파일**: `src/components/boards/PostFormPage.tsx` (Line 191)

**Before**:
```typescript
finalPostId = postResponse.data.id;
```

**After**:
```typescript
finalPostId = postResponse.data.post.id;
```

**변경 사항**:
- `response.data.id` → `response.data.post.id`

---

## 📋 수정 내역

| 항목 | Before | After | 위치 |
|------|--------|-------|------|
| **필드명 1** | `board_type_id` | `boardTypeId` | Line 175 |
| **필드명 2** | `is_secret` | `isSecret` | Line 179 |
| **응답 경로** | `data.id` | `data.post.id` | Line 191 |

---

## 🧪 테스트 방법

### 1. 게시글 작성 테스트

```
http://localhost:3000/ko/boards/BOARD-TYPE-NOTICE/write
```

**단계**:
1. "Write Post" 버튼 클릭
2. 제목 입력: "테스트 게시글"
3. 내용 입력: "테스트 내용입니다."
4. (선택) 태그 추가
5. (선택) 비밀글 체크
6. "Save Post" 버튼 클릭

**예상 결과**:
- ✅ 게시글 생성 성공
- ✅ "Post created successfully!" 메시지 표시
- ✅ 게시글 상세 페이지로 자동 리다이렉트
- ✅ 게시글 목록에서 새 게시글 확인 가능

### 2. 개발자 도구 확인

**Console (F12)**:
```
✅ 에러 메시지 없어야 함
✅ "Error creating post" 로그 없음
```

**Network 탭**:
```
POST /api/post
Status: 201 Created ✅
Request Payload: {
  "boardTypeId": "BOARD-TYPE-NOTICE",
  "title": "테스트 게시글",
  "content": "<p>테스트 내용입니다.</p>",
  "tags": [],
  "isSecret": false
}
Response: {
  "post": {
    "id": "POST-123...",
    "title": "테스트 게시글",
    ...
  }
}
```

### 3. 게시글 편집 테스트

```
http://localhost:3000/ko/boards/BOARD-TYPE-NOTICE/{postId}/edit
```

**단계**:
1. 기존 게시글 열기
2. "Edit" 버튼 클릭
3. 제목 또는 내용 수정
4. "Update Post" 버튼 클릭

**예상 결과**:
- ✅ 게시글 업데이트 성공
- ✅ "Post updated successfully!" 메시지 표시
- ✅ 게시글 상세 페이지로 자동 리다이렉트

---

## 🔄 API 명세 정리

### POST /api/post

#### Request Body (camelCase)
```json
{
  "boardTypeId": "BOARD-TYPE-NOTICE",
  "title": "게시글 제목",
  "content": "<p>게시글 내용</p>",
  "postType": "normal",
  "status": "published",
  "isSecret": false,
  "isPinned": false,
  "pinnedUntil": null,
  "tags": ["tag1", "tag2"],
  "metadata": {}
}
```

**필수 필드**:
- `boardTypeId` (string)
- `title` (string)
- `content` (string)

**선택 필드**:
- `postType` (string, default: 'normal')
- `status` (string, default: 'published')
- `isSecret` (boolean, default: false)
- `isPinned` (boolean, admin only)
- `pinnedUntil` (date, admin only)
- `tags` (array)
- `metadata` (object)

#### Response (201 Created)
```json
{
  "post": {
    "id": "POST-123...",
    "boardTypeId": "BOARD-TYPE-NOTICE",
    "title": "게시글 제목",
    "content": "<p>게시글 내용</p>",
    "authorId": "1",
    "authorName": "홍길동",
    "authorDepartment": "DEPT-131",
    "departmentName": "개발팀",
    "isAnonymous": false,
    "postType": "normal",
    "status": "published",
    "isSecret": false,
    "isPinned": false,
    "pinnedUntil": null,
    "isApproved": true,
    "approvedBy": null,
    "approvedAt": null,
    "viewCount": 0,
    "commentCount": 0,
    "likeCount": 0,
    "attachmentCount": 0,
    "tags": ["tag1", "tag2"],
    "metadata": {},
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z",
    "publishedAt": "2025-11-23T10:00:00.000Z",
    "deletedAt": null
  }
}
```

### PUT /api/post/:id

#### Request Body
```json
{
  "title": "수정된 제목",
  "content": "<p>수정된 내용</p>",
  "postType": "normal",
  "status": "published",
  "isSecret": false,
  "tags": ["tag1", "tag2"],
  "metadata": {}
}
```

**선택 필드** (모두 선택):
- `title`
- `content`
- `postType`
- `status`
- `isSecret`
- `isPinned` (admin only)
- `pinnedUntil` (admin only)
- `tags`
- `metadata`

#### Response (200 OK)
```json
{
  "post": { ... }
}
```

---

## 🎯 Naming Convention 통일

### 백엔드 응답 형식

모든 백엔드 API는 **camelCase**를 사용:

```javascript
// ✅ Good (camelCase)
{
  boardTypeId: "...",
  isSecret: false,
  createdAt: "...",
  authorName: "..."
}

// ❌ Bad (snake_case)
{
  board_type_id: "...",
  is_secret: false,
  created_at: "...",
  author_name: "..."
}
```

### 프론트엔드 요청 형식

프론트엔드도 백엔드와 동일하게 **camelCase** 사용:

```typescript
// ✅ Good
const postData = {
  boardTypeId: boardType!.id,
  title: title.trim(),
  content,
  isSecret: isSecret
};

// ❌ Bad
const postData = {
  board_type_id: boardType!.id,
  title: title.trim(),
  content,
  is_secret: isSecret
};
```

### 데이터베이스

데이터베이스는 **snake_case** 유지:
- 테이블명: `board_types`, `posts`, `comments`
- 컬럼명: `board_type_id`, `is_secret`, `created_at`

**변환 계층**:
```
Database (snake_case)
    ↓
Backend Service Layer (변환)
    ↓
Backend API (camelCase)
    ↓
Frontend (camelCase)
```

---

## 💡 교훈

### 1. API 명세 문서화
- 프론트엔드-백엔드 필드명 불일치 방지
- Swagger/OpenAPI 사용 권장
- TypeScript 타입 정의로 컴파일 시점 체크

### 2. 일관된 Naming Convention
- 백엔드 API: camelCase
- 데이터베이스: snake_case
- 변환 로직: Service Layer에서 처리

### 3. 응답 형식 표준화
```typescript
// 표준 응답 형식
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### 4. 에러 처리 개선
```typescript
// 백엔드 에러 응답
{
  success: false,
  error: "Missing required fields: boardTypeId, title, content",
  code: "VALIDATION_ERROR"
}
```

---

## 🔗 관련 문서

- [게시판 Layout 수정](./BOARD_LAYOUT_FIX.md)
- [빈 페이지 문제 해결](./BLANK_PAGE_FIX.md)
- [게시판 리팩토링 완료](./REFACTORING_COMPLETE.md)

---

## ✅ 수정 완료 체크리스트

- [x] 필드명 camelCase로 변경 (`boardTypeId`, `isSecret`)
- [x] 응답 데이터 경로 수정 (`data.post.id`)
- [x] 문서 작성
- [ ] 게시글 작성 테스트
- [ ] 게시글 편집 테스트
- [ ] Admin 사용자 테스트
- [ ] 일반 사용자 테스트

---

**수정 날짜**: 2025-11-23
**수정 파일**: `src/components/boards/PostFormPage.tsx`
**수정 라인**: Line 175, 179, 191
**테스트 URL**: http://localhost:3000/ko/boards/BOARD-TYPE-NOTICE/write
