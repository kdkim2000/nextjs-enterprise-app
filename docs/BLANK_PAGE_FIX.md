# 빈 페이지 문제 해결

## 🐛 문제 상황

**URL**: `http://localhost:3000/ko/boards/BOARD-TYPE-NOTICE`
**증상**: 빈 페이지 표시
**날짜**: 2025-11-23

---

## 🔍 원인 분석

### 근본 원인: API 응답 데이터 구조 불일치

**백엔드 API 응답 형식**:
```json
{
  "success": true,
  "data": {
    "id": "BOARD-TYPE-NOTICE",
    "code": "NOTICE",
    "name_en": "Notice",
    "type": "notice",
    "readRoles": ["admin", "manager", "user"],
    "writeRoles": ["admin"],
    ...
  }
}
```

**문제가 있던 코드** (`src/hooks/useBoardPermissions.ts:78`):
```typescript
// ❌ 잘못된 코드
if (response.success) {
  setBoardType(response.data.boardType);  // undefined!
}
```

**설명**:
- `response.data`가 이미 boardType 객체임
- `response.data.boardType`을 참조하면 `undefined`가 됨
- `boardType`이 `null`이면 페이지가 "Board not found" 또는 로딩 상태로 유지됨

### 진단 과정

1. **Board Type Status 확인** ✅
   ```sql
   SELECT id, code, status FROM board_types WHERE id = 'BOARD-TYPE-NOTICE';
   -- Result: status = 'active' (이미 수정됨)
   ```

2. **API 엔드포인트 확인** ✅
   ```
   GET /api/board-type/BOARD-TYPE-NOTICE
   ```
   - 라우트 등록 확인: `backend/server.js:113`
   - 백엔드 정상 동작

3. **useBoardPermissions 훅 분석** ❌
   - API 응답 파싱 오류 발견
   - `response.data.boardType` → `response.data`로 수정 필요

---

## ✅ 해결 방법

### 수정된 코드

**파일**: `src/hooks/useBoardPermissions.ts`

**Before (Line 75-81)**:
```typescript
const response = await apiClient.get(endpoint);

if (response.success) {
  setBoardType(response.data.boardType);  // ❌ 잘못됨
} else {
  setError(response.error || 'Failed to fetch board type');
}
```

**After (Line 75-81)**:
```typescript
const response = await apiClient.get(endpoint);

if (response.success && response.data) {
  setBoardType(response.data);  // ✅ 올바름
} else {
  setError(response.error || 'Failed to fetch board type');
}
```

### 변경 사항
1. `response.data.boardType` → `response.data`
2. 추가 체크: `response.data` 존재 확인

---

## 🧪 테스트 방법

### 1. 브라우저 새로고침
```
http://localhost:3000/ko/boards/BOARD-TYPE-NOTICE
```

**예상 결과**:
- ✅ 게시판 목록 페이지 정상 표시
- ✅ "Notice" 제목 표시
- ✅ "Write Post" 버튼 표시 (admin인 경우)
- ✅ 게시글 목록 표시

### 2. 개발자 도구 확인

**Console (F12)**:
```javascript
// 에러 메시지가 없어야 함
// "Error fetching board type" 같은 로그 없음
```

**Network 탭**:
```
GET /api/board-type/BOARD-TYPE-NOTICE
Status: 200 OK
Response: {
  "success": true,
  "data": { ... }
}
```

### 3. 권한 테스트

**Admin 사용자**:
- ✅ 페이지 조회 가능
- ✅ "Write Post" 버튼 표시
- ✅ 게시글 작성 가능

**일반 사용자**:
- ✅ 페이지 조회 가능
- ❌ "Write Post" 버튼 숨김 (notice 게시판은 admin만 작성)
- ✅ 게시글 읽기 가능

**권한 없는 사용자**:
- ❌ "You do not have permission to access this board." 메시지 표시

---

## 🔄 관련 파일

### 수정된 파일
```
src/hooks/useBoardPermissions.ts (Line 78)
```

### 관련 파일 (수정 없음)
```
backend/routes/boardType.js          - API 엔드포인트
backend/services/boardTypeService.js - 데이터베이스 쿼리
src/app/[locale]/boards/[boardTypeId]/page.tsx - 게시판 목록 페이지
src/lib/api/client.ts                - API 클라이언트
```

---

## 📊 API 응답 형식 정리

### 모든 Board Type API 엔드포인트

#### 1. GET /api/board-type/:id
```json
{
  "success": true,
  "data": {
    "id": "BOARD-TYPE-NOTICE",
    "code": "NOTICE",
    "name_en": "Notice",
    "name_ko": "공지사항",
    ...
  }
}
```

#### 2. GET /api/board-type/code/:code
```json
{
  "success": true,
  "data": {
    "id": "BOARD-TYPE-NOTICE",
    "code": "NOTICE",
    ...
  }
}
```

#### 3. GET /api/board-type (목록)
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {...}
  }
}
```

**중요**:
- 단일 항목 조회: `response.data`가 직접 객체
- 목록 조회: `response.data.items`가 배열

---

## 🐛 비슷한 버그 방지

### 체크리스트

다른 곳에서도 비슷한 문제가 있는지 확인:

- [x] `useBoardPermissions.ts` - ✅ 수정 완료
- [ ] `PostFormPage.tsx` - ✅ 문제 없음 (response.data 직접 사용)
- [ ] `usePostManagement.ts` - 확인 필요
- [ ] `useBoardTypeManagement.ts` - 확인 필요

### 올바른 패턴

```typescript
// ✅ 단일 항목 조회
const response = await apiClient.get('/api/board-type/:id');
if (response.success && response.data) {
  const boardType = response.data;  // 직접 사용
}

// ✅ 목록 조회
const response = await apiClient.get('/api/board-type');
if (response.success && response.data) {
  const items = response.data.items;  // items 사용
  const pagination = response.data.pagination;
}
```

---

## 🎯 교훈

### 문제 발생 이유
1. **API 응답 형식 가정**: `response.data.boardType`을 가정했지만 실제로는 `response.data`
2. **타입 안전성 부족**: TypeScript 타입이 있었다면 컴파일 시점에 발견 가능
3. **테스트 부족**: API 응답 형식에 대한 단위 테스트 필요

### 개선 방안
1. **명확한 API 응답 타입 정의**:
   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
   }

   interface BoardTypeResponse {
     // Board type fields
   }

   const response: ApiResponse<BoardTypeResponse> = await apiClient.get(...);
   ```

2. **API 응답 문서화**:
   - 각 엔드포인트의 응답 형식 명시
   - Swagger/OpenAPI 사용 고려

3. **단위 테스트**:
   ```typescript
   describe('useBoardPermissions', () => {
     it('should parse board type from response.data', async () => {
       const mockResponse = {
         success: true,
         data: { id: 'BOARD-TYPE-NOTICE', ... }
       };
       // ...
     });
   });
   ```

---

## 📝 타임라인

| 시간 | 이벤트 |
|------|--------|
| 초기 | Board Type status가 'inactive'였음 |
| Step 1 | status를 'active'로 변경 |
| Step 2 | 여전히 빈 페이지 문제 지속 |
| Step 3 | useBoardPermissions 훅 분석 |
| **Step 4** | **API 응답 파싱 오류 발견 및 수정** ✅ |
| Step 5 | 테스트 및 검증 필요 |

---

## ✅ 해결 완료 체크리스트

- [x] 원인 파악: API 응답 데이터 구조 불일치
- [x] 코드 수정: `response.data.boardType` → `response.data`
- [x] 문서 작성: 이 파일
- [ ] 브라우저 테스트: 페이지 새로고침 후 확인
- [ ] 권한 테스트: Admin/일반 사용자 확인
- [ ] 다국어 테스트: ko/en/zh/vi 확인

---

## 🔗 관련 문서

- [게시판 시스템 리팩토링 완료](./REFACTORING_COMPLETE.md)
- [게시판 라우팅 리팩토링](./board-routing-refactoring.md)
- [게시판 시스템 구현 완료](./board-system-implementation-complete.md)

---

**수정 날짜**: 2025-11-23
**수정 파일**: `src/hooks/useBoardPermissions.ts`
**수정 라인**: Line 78
**테스트 URL**: http://localhost:3000/ko/boards/BOARD-TYPE-NOTICE
