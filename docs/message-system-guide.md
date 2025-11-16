# Unified Message System Guide

## 개요

통합 메시지 시스템은 애플리케이션 전체에서 일관된 메시지 관리를 제공합니다. 하드코딩된 메시지를 중앙화된 메시지 관리 시스템으로 대체하여 다국어 지원과 유지보수를 용이하게 합니다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│           통합 메시지 시스템 아키텍처                      │
└─────────────────────────────────────────────────────────┘

1. 메시지 저장소 (Message Store)
   └─ Database: backend/data/messages.json
   └─ API: /api/message/code/:code

2. 프론트엔드 훅
   └─ useMessage() - 메시지 조회 및 표시

3. 메시지 코드 체계
   Format: {CATEGORY}_{ENTITY}_{ACTION}_{TYPE}
   예시:
   - CRUD_USER_CREATE_SUCCESS
   - VALIDATION_PASSWORD_LENGTH
   - SYSTEM_EXPORT_SUCCESS
```

## 메시지 카테고리

현재 지원하는 카테고리:

- **common**: 공통 메시지 (저장, 삭제, 업데이트 등)
- **crud**: CRUD 작업 메시지 (엔티티별)
- **validation**: 검증 오류 메시지
- **auth**: 인증/인가 메시지
- **user**: 사용자 관련 메시지
- **system**: 시스템 작업 메시지 (export, import 등)

## 사용법

### 1. 기본 사용법

```tsx
import { useMessage } from '@/hooks/useMessage';

function MyComponent() {
  const {
    showSuccessMessage,
    showErrorMessage,
    successMessage,
    errorMessage
  } = useMessage({ locale: 'ko' });

  const handleSave = async () => {
    try {
      await api.post('/user', userData);
      // 코드로 성공 메시지 표시
      await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
    } catch (error) {
      // 코드로 오류 메시지 표시
      await showErrorMessage('CRUD_USER_SAVE_FAIL');
    }
  };

  return (
    <div>
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### 2. 동적 파라미터 사용

메시지에 동적 값을 삽입할 수 있습니다:

```tsx
// 메시지 데이터: "Successfully deleted {count} user(s)"
await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', { count: 5 });
// 결과: "Successfully deleted 5 user(s)"

// 메시지 데이터: "Password must be at least {min} characters"
await showErrorMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 });
// 결과: "Password must be at least 8 characters"
```

### 3. 메시지 조회만 하기 (표시하지 않음)

```tsx
const { getMessage } = useMessage({ locale: 'ko' });

const message = await getMessage('CRUD_USER_CREATE_SUCCESS');
console.log(message); // "사용자가 생성되었습니다"
```

### 4. 다국어 지원

```tsx
// 로케일별 메시지 조회
const { getMessage } = useMessage();

const enMessage = await getMessage('CRUD_USER_CREATE_SUCCESS', {}, 'en');
// "User created successfully"

const koMessage = await getMessage('CRUD_USER_CREATE_SUCCESS', {}, 'ko');
// "사용자가 생성되었습니다"

const zhMessage = await getMessage('CRUD_USER_CREATE_SUCCESS', {}, 'zh');
// "用户创建成功"

const viMessage = await getMessage('CRUD_USER_CREATE_SUCCESS', {}, 'vi');
// "Người dùng đã được tạo thành công"
```

### 5. 메시지 프리로드 (성능 최적화)

자주 사용하는 메시지를 미리 로드하여 성능을 향상시킬 수 있습니다:

```tsx
const { preloadMessages } = useMessage();

useEffect(() => {
  // 자주 사용하는 메시지 프리로드
  preloadMessages([
    'CRUD_USER_CREATE_SUCCESS',
    'CRUD_USER_UPDATE_SUCCESS',
    'CRUD_USER_DELETE_SUCCESS',
    'CRUD_USER_SAVE_FAIL'
  ]);
}, []);
```

### 6. 캐시 관리

메시지 관리 페이지에서 메시지를 업데이트한 후 캐시를 지워야 할 수 있습니다:

```tsx
const { clearCache } = useMessage();

const handleMessageUpdate = () => {
  // 메시지 업데이트 후 캐시 지우기
  clearCache();
};
```

## 실제 사용 예제

### 예제 1: 사용자 관리 페이지

```tsx
import { useMessage } from '@/hooks/useMessage';

function UserManagement() {
  const {
    showSuccessMessage,
    showErrorMessage,
    successMessage,
    errorMessage
  } = useMessage({ locale: 'ko', duration: 5000 });

  const handleCreate = async (userData: any) => {
    try {
      await api.post('/user', userData);
      await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
    } catch (error) {
      await showErrorMessage('CRUD_USER_SAVE_FAIL');
    }
  };

  const handleDelete = async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/user/${id}`)));
      await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', {
        count: selectedIds.length
      });
    } catch (error) {
      await showErrorMessage('CRUD_USER_DELETE_FAIL');
    }
  };

  return (
    <StandardCrudPageLayout
      successMessage={successMessage}
      errorMessage={errorMessage}
    >
      {/* 페이지 내용 */}
    </StandardCrudPageLayout>
  );
}
```

### 예제 2: 폼 검증

```tsx
import { useMessage } from '@/hooks/useMessage';

function LoginForm() {
  const { showErrorMessage, errorMessage } = useMessage({ locale: 'ko' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필드 검증
    if (!username || !password) {
      await showErrorMessage('VALIDATION_REQUIRED_FIELDS');
      return;
    }

    if (password.length < 8) {
      await showErrorMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 });
      return;
    }

    // 로그인 처리
    try {
      await api.post('/auth/login', { username, password });
    } catch (error) {
      await showErrorMessage('AUTH_LOGIN_FAIL');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {/* 폼 필드 */}
    </form>
  );
}
```

### 예제 3: 데이터 내보내기/가져오기

```tsx
import { useMessage } from '@/hooks/useMessage';

function DataGrid() {
  const { showSuccessMessage, showErrorMessage } = useMessage({ locale: 'ko' });

  const handleExport = async () => {
    try {
      await exportToExcel(data);
      await showSuccessMessage('SYSTEM_EXPORT_SUCCESS');
    } catch (error) {
      await showErrorMessage('SYSTEM_EXPORT_FAIL');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const rows = await importFromExcel(file);
      await showSuccessMessage('SYSTEM_IMPORT_SUCCESS', { count: rows.length });
    } catch (error) {
      await showErrorMessage('SYSTEM_IMPORT_FAIL');
    }
  };

  return (
    <div>
      <button onClick={handleExport}>Export</button>
      <input type="file" onChange={(e) => handleImport(e.target.files[0])} />
    </div>
  );
}
```

## 기존 코드 마이그레이션 가이드

### Before (하드코딩)

```tsx
// ❌ 하드코딩된 메시지
showSuccess('User created successfully');
showError('Failed to save user');
```

### After (통합 메시지 시스템)

```tsx
// ✅ 메시지 코드 사용
await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
await showErrorMessage('CRUD_USER_SAVE_FAIL');
```

### 마이그레이션 단계

1. **메시지 코드 확인**: 메시지 관리 페이지에서 사용 가능한 메시지 코드 확인
2. **메시지 추가**: 필요한 메시지가 없으면 메시지 관리 페이지에서 추가
3. **코드 교체**: 하드코딩된 메시지를 메시지 코드로 교체
4. **테스트**: 다국어 및 동적 파라미터 동작 확인

## API 레퍼런스

### useMessage Hook

#### Parameters

```typescript
interface UseMessageOptions {
  duration?: number;  // Auto-hide duration (default: 10000ms)
  locale?: string;    // Default locale (default: 'en')
}
```

#### Returns

```typescript
interface UseMessageReturn {
  // 메시지 조회
  getMessage: (code: string, params?: Record<string, any>, locale?: string) => Promise<string>;

  // 메시지 표시 (자동 숨김)
  showMessage: (code: string, type: 'success' | 'error', params?: Record<string, any>, locale?: string) => Promise<void>;
  showSuccessMessage: (code: string, params?: Record<string, any>, locale?: string) => Promise<void>;
  showErrorMessage: (code: string, params?: Record<string, any>, locale?: string) => Promise<void>;

  // 현재 표시된 메시지
  successMessage: string | null;
  errorMessage: string | null;

  // 메시지 관리
  clearMessages: () => void;
  setSuccessMessage: (message: string | null) => void;
  setErrorMessage: (message: string | null) => void;

  // 캐시 관리
  clearCache: () => void;
  preloadMessages: (codes: string[]) => Promise<void>;

  // 로딩 상태
  loading: boolean;

  // 레거시 지원
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}
```

## 현재 사용 가능한 메시지 코드

### Common (공통)
- `COMMON_SAVE_SUCCESS` - 저장 성공
- `COMMON_DELETE_SUCCESS` - 삭제 성공
- `COMMON_UPDATE_SUCCESS` - 수정 성공
- `COMMON_CREATE_SUCCESS` - 생성 성공
- `COMMON_LOAD_FAIL` - 로드 실패
- `COMMON_SAVE_FAIL` - 저장 실패
- `COMMON_DELETE_FAIL` - 삭제 실패
- `COMMON_REQUIRED_FIELD` - 필수 항목
- `COMMON_INVALID_EMAIL` - 이메일 형식 오류
- `COMMON_CONFIRM_DELETE` - 삭제 확인
- `COMMON_NO_DATA` - 데이터 없음

### CRUD - User (사용자)
- `CRUD_USER_CREATE_SUCCESS` - 사용자 생성 성공
- `CRUD_USER_UPDATE_SUCCESS` - 사용자 수정 성공
- `CRUD_USER_DELETE_SUCCESS` - 사용자 삭제 성공 (count 파라미터)
- `CRUD_USER_SAVE_FAIL` - 사용자 저장 실패
- `CRUD_USER_DELETE_FAIL` - 사용자 삭제 실패
- `CRUD_USER_LOAD_FAIL` - 사용자 로드 실패

### CRUD - Role (역할)
- `CRUD_ROLE_CREATE_SUCCESS` - 역할 생성 성공
- `CRUD_ROLE_UPDATE_SUCCESS` - 역할 수정 성공
- `CRUD_ROLE_DELETE_SUCCESS` - 역할 삭제 성공 (count 파라미터)
- `CRUD_ROLE_SAVE_FAIL` - 역할 저장 실패
- `CRUD_ROLE_DELETE_FAIL` - 역할 삭제 실패
- `CRUD_ROLE_LOAD_FAIL` - 역할 로드 실패

### Validation (검증)
- `VALIDATION_PASSWORD_LENGTH` - 비밀번호 길이 (min 파라미터)
- `VALIDATION_PASSWORD_MISMATCH` - 비밀번호 불일치
- `VALIDATION_REQUIRED_FIELDS` - 필수 필드 미입력

### System (시스템)
- `SYSTEM_EXPORT_SUCCESS` - 데이터 내보내기 성공
- `SYSTEM_EXPORT_FAIL` - 데이터 내보내기 실패
- `SYSTEM_IMPORT_SUCCESS` - 데이터 가져오기 성공 (count 파라미터)
- `SYSTEM_IMPORT_FAIL` - 데이터 가져오기 실패

### User (사용자 작업)
- `USER_PASSWORD_RESET_SUCCESS` - 비밀번호 재설정 성공 (resetMethod, username 파라미터)
- `USER_PASSWORD_RESET_FAIL` - 비밀번호 재설정 실패
- `USER_NOT_FOUND` - 사용자 미발견
- `USER_ALREADY_EXISTS` - 사용자 중복

### Auth (인증)
- `AUTH_LOGIN_SUCCESS` - 로그인 성공
- `AUTH_LOGIN_FAIL` - 로그인 실패
- `AUTH_LOGOUT_SUCCESS` - 로그아웃 성공
- `AUTH_SESSION_EXPIRED` - 세션 만료
- `AUTH_PERMISSION_DENIED` - 권한 거부

### System (시스템 오류)
- `NETWORK_ERROR` - 네트워크 오류
- `SERVER_ERROR` - 서버 오류

## 메시지 추가 방법

1. **메시지 관리 페이지 접속**: `/admin/messages`
2. **새 메시지 추가 버튼 클릭**
3. **메시지 정보 입력**:
   - 코드: `CATEGORY_ENTITY_ACTION_TYPE` 형식
   - 카테고리: crud, validation, auth, user, system 중 선택
   - 타입: success, error, warning, info 중 선택
   - 메시지: 4개 언어(en, ko, zh, vi)로 입력
   - 설명: 메시지 용도 설명
   - 상태: active (활성) / inactive (비활성)
4. **저장**

## 베스트 프랙티스

1. **메시지 코드 명명 규칙 준수**: `{CATEGORY}_{ENTITY}_{ACTION}_{TYPE}` 형식 사용
2. **동적 파라미터 사용**: 재사용 가능한 메시지를 위해 `{param}` 플레이스홀더 활용
3. **메시지 프리로드**: 자주 사용하는 메시지는 컴포넌트 마운트 시 프리로드
4. **일관된 로케일 사용**: 컴포넌트 전체에서 동일한 로케일 사용
5. **메시지 중앙 관리**: 하드코딩 금지, 모든 메시지는 메시지 관리 시스템 사용

## 문제 해결

### 메시지가 표시되지 않음

- 메시지 코드가 올바른지 확인
- 백엔드 서버가 실행 중인지 확인
- 브라우저 콘솔에서 API 오류 확인
- 메시지 상태가 'active'인지 확인

### 잘못된 언어로 표시됨

- `useMessage` 훅에 올바른 `locale` 전달
- 메시지 데이터에 해당 언어가 포함되어 있는지 확인

### 메시지 캐싱 문제

- `clearCache()` 함수 호출하여 캐시 초기화
- 페이지 새로고침

## 향후 계획

- [ ] 더 많은 엔티티 메시지 추가 (Codes, Departments, Menus, Programs, Help)
- [ ] 메시지 버전 관리
- [ ] 메시지 사용 통계
- [ ] A/B 테스팅 지원
- [ ] 메시지 템플릿 시스템
