# 통합 메시지 시스템 마이그레이션 가이드

## 📋 개요

이 가이드는 기존 하드코딩된 메시지를 통합 메시지 시스템으로 마이그레이션하는 방법을 설명합니다.

## ✅ 완료된 마이그레이션

### 1. 사용자 관리 (`src/app/[locale]/admin/users`)

✅ **완전히 마이그레이션 완료**

#### Before & After

**Before (하드코딩):**
```typescript
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';

const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

// 하드코딩된 메시지
showSuccess('User created successfully');
showError('Failed to save user');
showSuccess(`Successfully deleted ${count} user${count > 1 ? 's' : ''}`);
```

**After (통합 시스템):**
```typescript
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';

const locale = useCurrentLocale();
const {
  successMessage,
  errorMessage,
  showSuccessMessage,
  showErrorMessage
} = useMessage({ locale });

// 메시지 코드 사용
await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
await showErrorMessage('CRUD_USER_SAVE_FAIL');
await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', { count });
```

#### 변경 사항

1. **Import 교체**:
   - `useAutoHideMessage` → `useMessage`
   - `useCurrentLocale` 추가

2. **Hook 초기화**:
   - `locale` 가져오기
   - `showSuccess/showError` → `showSuccessMessage/showErrorMessage`

3. **메시지 코드 매핑**:
   - `'User created successfully'` → `'CRUD_USER_CREATE_SUCCESS'`
   - `'User updated successfully'` → `'CRUD_USER_UPDATE_SUCCESS'`
   - `'Failed to load users'` → `'CRUD_USER_LOAD_FAIL'`
   - `'Failed to save user'` → `'CRUD_USER_SAVE_FAIL'`
   - `'Failed to delete users'` → `'CRUD_USER_DELETE_FAIL'`
   - `'Password reset ...'` → `'USER_PASSWORD_RESET_SUCCESS'` (with params)
   - `'Failed to reset password'` → `'USER_PASSWORD_RESET_FAIL'`

## 🔄 마이그레이션 단계 (다른 페이지용)

### Step 1: Import 교체

```typescript
// ❌ Before
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';

// ✅ After
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
```

### Step 2: Hook 사용 변경

```typescript
// ❌ Before
const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

// ✅ After
const locale = useCurrentLocale();
const {
  successMessage,
  errorMessage,
  showSuccessMessage,
  showErrorMessage
} = useMessage({ locale });
```

### Step 3: 메시지 호출 변경

```typescript
// ❌ Before (동기)
showSuccess('Role created successfully');
showError('Failed to save role');

// ✅ After (비동기 + 코드)
await showSuccessMessage('CRUD_ROLE_CREATE_SUCCESS');
await showErrorMessage('CRUD_ROLE_SAVE_FAIL');
```

### Step 4: 동적 파라미터 처리

```typescript
// ❌ Before
const count = selectedForDelete.length;
showSuccess(`Successfully deleted ${count} role${count > 1 ? 's' : ''}`);

// ✅ After
const count = selectedForDelete.length;
await showSuccessMessage('CRUD_ROLE_DELETE_SUCCESS', { count });
```

### Step 5: Dependency 배열 업데이트

```typescript
// ❌ Before
}, [users, setUsers, showSuccess, showError]);

// ✅ After
}, [users, setUsers, showSuccessMessage, showErrorMessage]);
```

## 📝 엔티티별 메시지 코드 매핑

### Role Management (역할 관리)

| 하드코딩 메시지 | 메시지 코드 | 파라미터 |
|---------------|------------|---------|
| "Role created successfully" | `CRUD_ROLE_CREATE_SUCCESS` | - |
| "Role updated successfully" | `CRUD_ROLE_UPDATE_SUCCESS` | - |
| "Successfully deleted {count} role(s)" | `CRUD_ROLE_DELETE_SUCCESS` | {count} |
| "Failed to save role" | `CRUD_ROLE_SAVE_FAIL` | - |
| "Failed to delete roles" | `CRUD_ROLE_DELETE_FAIL` | - |
| "Failed to load roles" | `CRUD_ROLE_LOAD_FAIL` | - |

### Code Management (코드 관리)

| 하드코딩 메시지 | 메시지 코드 | 파라미터 |
|---------------|------------|---------|
| "Code created successfully" | `CRUD_CODE_CREATE_SUCCESS` | - |
| "Code updated successfully" | `CRUD_CODE_UPDATE_SUCCESS` | - |
| "Successfully deleted {count} code(s)" | `CRUD_CODE_DELETE_SUCCESS` | {count} |
| "Failed to save code" | `CRUD_CODE_SAVE_FAIL` | - |
| "Failed to delete codes" | `CRUD_CODE_DELETE_FAIL` | - |
| "Failed to load codes" | `CRUD_CODE_LOAD_FAIL` | - |
| "Invalid JSON format in attributes" | `VALIDATION_JSON_INVALID` | - |

### Department Management (부서 관리)

| 하드코딩 메시지 | 메시지 코드 | 파라미터 |
|---------------|------------|---------|
| "Department created successfully" | `CRUD_DEPARTMENT_CREATE_SUCCESS` | - |
| "Department updated successfully" | `CRUD_DEPARTMENT_UPDATE_SUCCESS` | - |
| "Successfully deleted {count} department(s)" | `CRUD_DEPARTMENT_DELETE_SUCCESS` | {count} |
| "Failed to save department" | `CRUD_DEPARTMENT_SAVE_FAIL` | - |
| "Failed to delete departments" | `CRUD_DEPARTMENT_DELETE_FAIL` | - |
| "Failed to load departments" | `CRUD_DEPARTMENT_LOAD_FAIL` | - |

### Menu Management (메뉴 관리)

| 하드코딩 메시지 | 메시지 코드 | 파라미터 |
|---------------|------------|---------|
| "Menu created successfully" | `CRUD_MENU_CREATE_SUCCESS` | - |
| "Menu updated successfully" | `CRUD_MENU_UPDATE_SUCCESS` | - |
| "Successfully deleted {count} menu(s)" | `CRUD_MENU_DELETE_SUCCESS` | {count} |
| "Failed to save menu" | `CRUD_MENU_SAVE_FAIL` | - |
| "Failed to delete menus" | `CRUD_MENU_DELETE_FAIL` | - |
| "Failed to load menus" | `CRUD_MENU_LOAD_FAIL` | - |

### Message Management (메시지 관리)

| 하드코딩 메시지 | 메시지 코드 | 파라미터 |
|---------------|------------|---------|
| "Message created successfully" | `CRUD_MESSAGE_CREATE_SUCCESS` | - |
| "Message updated successfully" | `CRUD_MESSAGE_UPDATE_SUCCESS` | - |
| "{count} message(s) deleted successfully" | `CRUD_MESSAGE_DELETE_SUCCESS` | {count} |
| "Failed to save message" | `CRUD_MESSAGE_SAVE_FAIL` | - |
| "Failed to delete messages" | `CRUD_MESSAGE_DELETE_FAIL` | - |
| "Failed to load messages" | `CRUD_MESSAGE_LOAD_FAIL` | - |
| "Please fill in all required fields" | `VALIDATION_REQUIRED_FIELDS` | - |

### Program Management (프로그램 관리)

| 하드코딩 메시지 | 메시지 코드 | 파라미터 |
|---------------|------------|---------|
| "Program created successfully" | `CRUD_PROGRAM_CREATE_SUCCESS` | - |
| "Program updated successfully" | `CRUD_PROGRAM_UPDATE_SUCCESS` | - |
| "Successfully deleted {count} program(s)" | `CRUD_PROGRAM_DELETE_SUCCESS` | {count} |
| "Failed to save program" | `CRUD_PROGRAM_SAVE_FAIL` | - |
| "Failed to delete programs" | `CRUD_PROGRAM_DELETE_FAIL` | - |
| "Failed to load programs" | `CRUD_PROGRAM_LOAD_FAIL` | - |

### Help Management (도움말 관리)

| 하드코딩 메시지 | 메시지 코드 | 파라미터 |
|---------------|------------|---------|
| "Help content created successfully" | `CRUD_HELP_CREATE_SUCCESS` | - |
| "Help content updated successfully" | `CRUD_HELP_UPDATE_SUCCESS` | - |
| "Successfully deleted {count} help content(s)" | `CRUD_HELP_DELETE_SUCCESS` | {count} |
| "Failed to save help content" | `CRUD_HELP_SAVE_FAIL` | - |
| "Failed to delete help content" | `CRUD_HELP_DELETE_FAIL` | - |
| "Failed to load help content" | `CRUD_HELP_LOAD_FAIL` | - |

## 🎯 실전 마이그레이션 예제

### 예제 1: Role Management Hook

**파일**: `src/app/[locale]/admin/roles/hooks/useRoleManagement.ts`

```typescript
// Step 1: Import 변경
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';

export const useRoleManagement = (options: UseRoleManagementOptions = {}) => {
  // Step 2: Hook 사용
  const locale = useCurrentLocale();
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale });

  // Step 3: fetchRoles 에러 처리
  const fetchRoles = useCallback(async (...) => {
    try {
      // ... API call
    } catch (error) {
      await showErrorMessage('CRUD_ROLE_LOAD_FAIL');
      // ...
    }
  }, [..., showErrorMessage]);

  // Step 4: handleSave 성공/실패 처리
  const handleSave = useCallback(async () => {
    try {
      if (!editingRole.id) {
        await api.post('/role', editingRole);
        await showSuccessMessage('CRUD_ROLE_CREATE_SUCCESS');
      } else {
        await api.put(`/role/${editingRole.id}`, editingRole);
        await showSuccessMessage('CRUD_ROLE_UPDATE_SUCCESS');
      }
    } catch (error) {
      await showErrorMessage('CRUD_ROLE_SAVE_FAIL');
    }
  }, [..., showSuccessMessage, showErrorMessage]);

  // Step 5: handleDeleteConfirm with 동적 파라미터
  const handleDeleteConfirm = useCallback(async () => {
    try {
      // ... delete logic
      const count = selectedForDelete.length;
      await showSuccessMessage('CRUD_ROLE_DELETE_SUCCESS', { count });
    } catch (error) {
      await showErrorMessage('CRUD_ROLE_DELETE_FAIL');
    }
  }, [..., showSuccessMessage, showErrorMessage]);
};
```

### 예제 2: Code Management Hook

**파일**: `src/app/[locale]/admin/codes/hooks/useCodeManagement.ts`

```typescript
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';

export const useCodeManagement = (options: UseCodeManagementOptions = {}) => {
  const locale = useCurrentLocale();
  const {
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale });

  // JSON 검증 에러 처리
  const handleSave = useCallback(async () => {
    try {
      // Validate JSON
      if (editingCode.attributes) {
        try {
          JSON.parse(editingCode.attributes);
        } catch {
          await showErrorMessage('VALIDATION_JSON_INVALID');
          return;
        }
      }

      // Save logic...
      if (!editingCode.id) {
        await showSuccessMessage('CRUD_CODE_CREATE_SUCCESS');
      } else {
        await showSuccessMessage('CRUD_CODE_UPDATE_SUCCESS');
      }
    } catch (error) {
      await showErrorMessage('CRUD_CODE_SAVE_FAIL');
    }
  }, [..., showSuccessMessage, showErrorMessage]);
};
```

## ✅ 마이그레이션 체크리스트

각 페이지를 마이그레이션할 때 다음 체크리스트를 사용하세요:

- [ ] Import 문 업데이트
  - [ ] `useMessage` import
  - [ ] `useCurrentLocale` import
  - [ ] `useAutoHideMessage` 제거

- [ ] Hook 초기화
  - [ ] `locale` 가져오기
  - [ ] `useMessage({ locale })` 호출
  - [ ] `showSuccessMessage`, `showErrorMessage` 사용

- [ ] 메시지 호출 변경
  - [ ] `showSuccess()` → `await showSuccessMessage(CODE)`
  - [ ] `showError()` → `await showErrorMessage(CODE)`

- [ ] 동적 메시지 처리
  - [ ] 문자열 템플릿 → 파라미터 객체
  - [ ] `{count}`, `{username}` 등 파라미터 전달

- [ ] Dependency 배열 업데이트
  - [ ] `showSuccess` → `showSuccessMessage`
  - [ ] `showError` → `showErrorMessage`

- [ ] 테스트
  - [ ] 생성 메시지 확인
  - [ ] 수정 메시지 확인
  - [ ] 삭제 메시지 확인 (count)
  - [ ] 오류 메시지 확인
  - [ ] 다국어 전환 테스트

## 🚀 마이그레이션 우선순위

### ✅ Phase 1: 완료
- [x] User Management (사용자 관리)

### 🔄 Phase 2: 진행 예정
- [ ] Role Management (역할 관리)
- [ ] Code Management (코드 관리)
- [ ] Department Management (부서 관리)
- [ ] Menu Management (메뉴 관리)
- [ ] Message Management (메시지 관리)
- [ ] Program Management (프로그램 관리)
- [ ] Help Management (도움말 관리)

### 📅 Phase 3: 추후 예정
- [ ] Settings Page (설정 페이지)
- [ ] Dashboard (대시보드)
- [ ] DataGrid Component (데이터그리드 컴포넌트)
- [ ] Other Components (기타 컴포넌트)

## 💡 팁 & 모범 사례

### 1. Async/Await 사용
```typescript
// ✅ Good
await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');

// ❌ Bad (비동기 처리 누락)
showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
```

### 2. 에러 메시지 처리
```typescript
// ✅ Good - 특정 엔티티 메시지 사용
await showErrorMessage('CRUD_USER_SAVE_FAIL');

// ⚠️ OK - 공통 메시지 사용
await showErrorMessage('COMMON_SAVE_FAIL');

// ❌ Bad - 하드코딩
showError('Failed to save user');
```

### 3. 동적 파라미터 사용
```typescript
// ✅ Good - 파라미터 객체 전달
await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', { count: 5 });

// ❌ Bad - 문자열 템플릿
showSuccess(`Successfully deleted ${count} user(s)`);
```

### 4. 로케일 일관성
```typescript
// ✅ Good - 로케일 전달
const locale = useCurrentLocale();
const { showSuccessMessage } = useMessage({ locale });

// ❌ Bad - 로케일 누락
const { showSuccessMessage } = useMessage(); // 기본값 'en' 사용
```

## 🐛 문제 해결

### 문제 1: 메시지가 영어로만 표시됨
**원인**: 로케일이 전달되지 않음
**해결**: `useCurrentLocale()`로 로케일 가져와서 전달

### 문제 2: 메시지 코드가 그대로 표시됨
**원인**: 메시지 데이터베이스에 코드가 없음
**해결**: `/admin/messages`에서 메시지 추가

### 문제 3: 동적 파라미터가 대체되지 않음
**원인**: 파라미터 객체를 전달하지 않음
**해결**: 두 번째 인자로 파라미터 객체 전달

## 📊 마이그레이션 진행 현황

### 메시지 데이터
- 총 메시지: **78개**
- 카테고리: 8개 (CRUD, Validation, Auth, User, System, Common)
- 언어: 4개 (en, ko, zh, vi)

### 페이지 마이그레이션
- 완료: **1/8** (12.5%)
- 진행 중: 0
- 대기 중: 7

### 예상 완료 시간
- 페이지당 평균: 15-20분
- 총 예상 시간: 2-3시간

## 📚 참고 자료

- [메시지 시스템 가이드](./message-system-guide.md)
- [구현 요약](./message-system-implementation-summary.md)
- [데모 페이지](/ko/dev/components/message-system)
- [useMessage Hook](../src/hooks/useMessage.ts)

---

**마지막 업데이트**: 2024
**작성자**: AI Assistant
