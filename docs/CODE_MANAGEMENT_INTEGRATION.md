# 코드 관리 시스템 통합 가이드

## 개요

하드코딩된 상수 값(STATUS_OPTIONS, ROLE_OPTIONS, DEPARTMENT 등)을 데이터베이스 기반 코드 관리 시스템으로 전환하기 위한 가이드입니다.

## 새로 추가된 코드 타입

다음 코드 타입들이 `backend/data/codeTypes.json`에 추가되었습니다:

| 코드 타입 | 설명 | 사용 예시 |
|----------|------|----------|
| `COMMON_STATUS` | 공통 상태 코드 (active, inactive, pending) | 모든 페이지의 상태 필드 |
| `MESSAGE_CATEGORY` | 메시지 카테고리 (common, validation, auth, user, system) | 메시지 관리 |
| `MESSAGE_TYPE` | 메시지 타입 (success, error, warning, info) | 알림 타입 |
| `CODE_TYPE_CATEGORY` | 코드 타입 카테고리 (user, organization, system, workflow, common) | 코드 타입 분류 |
| `DEPARTMENT` | 부서 코드 (ADMIN, DESIGN, ENGINEERING, etc.) | 사용자 부서 필드 |
| `ROLE_CATEGORY` | 역할 카테고리 (general, management) | 역할 분류 |
| `ICON_TYPE` | Material-UI 아이콘 타입 | 메뉴 아이콘 선택 |

기존에 있던 코드 타입:
- `USER_STATUS`, `DEPT_STATUS`, `USER_ROLE`, `MENU_CATEGORY`, `PRIORITY`
- `PROGRAM_STATUS`, `PROGRAM_TYPE`, `PROGRAM_CATEGORY`
- `HELP_STATUS`, `PERMISSION_TYPE`, `LANGUAGE`, `HTTP_METHOD`

## useCodeOptions Hook 사용법

### 1. 기본 사용법

```typescript
import { useCodeOptions } from '@/hooks/useCodeOptions';

function MyComponent() {
  const locale = useCurrentLocale();

  // 코드 옵션 가져오기
  const { codes: statusOptions, loading, error } = useCodeOptions('COMMON_STATUS', locale);

  // loading 상태 처리
  if (loading) return <div>Loading...</div>;

  // error 상태 처리
  if (error) return <div>Error: {error}</div>;

  // statusOptions 사용
  return (
    <Select>
      {statusOptions.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
}
```

### 2. 단일 코드 값 조회

```typescript
import { useCodeOption } from '@/hooks/useCodeOptions';

function StatusDisplay({ status }: { status: string }) {
  const locale = useCurrentLocale();
  const { code, loading } = useCodeOption('COMMON_STATUS', status, locale);

  if (loading) return null;

  return <span>{code?.label || status}</span>;
}
```

### 3. 여러 코드 타입 동시 조회

```typescript
import { useMultipleCodeOptions } from '@/hooks/useCodeOptions';

function MyForm() {
  const locale = useCurrentLocale();
  const { codesMap, loading } = useMultipleCodeOptions(
    ['COMMON_STATUS', 'DEPARTMENT', 'MESSAGE_TYPE'],
    locale
  );

  if (loading) return <div>Loading...</div>;

  const statusOptions = codesMap['COMMON_STATUS'] || [];
  const departmentOptions = codesMap['DEPARTMENT'] || [];
  const messageTypeOptions = codesMap['MESSAGE_TYPE'] || [];

  return (
    <Form>
      {/* Use the options */}
    </Form>
  );
}
```

## 하드코딩 제거 예시

### Before (하드코딩)

**constants.tsx:**
```typescript
export const STATUS_OPTIONS = [
  { value: 'active', labelEn: 'Active', labelKo: '활성' },
  { value: 'inactive', labelEn: 'Inactive', labelKo: '비활성' }
];

export const createColumns = (t: any, handleEdit: Function) => {
  return [
    {
      field: 'status',
      headerName: t('fields.status'),
      renderCell: (params) => {
        const status = params.value;
        const label = STATUS_OPTIONS.find(opt => opt.value === status);
        return <Chip label={label?.labelEn} />;
      }
    }
  ];
};
```

**page.tsx:**
```typescript
export default function MyPage() {
  const columns = useMemo(() => createColumns(t, handleEdit), [t]);

  return <DataGrid columns={columns} />;
}
```

### After (코드 관리 시스템 사용)

**constants.tsx:**
```typescript
import { CodeOption } from '@/hooks/useCodeOptions';

export const createColumns = (
  t: any,
  handleEdit: Function,
  statusOptions: CodeOption[] = []
) => {
  return [
    {
      field: 'status',
      headerName: t('fields.status'),
      renderCell: (params) => {
        const status = params.value;
        const statusOption = statusOptions.find(opt => opt.value === status);
        return <Chip label={statusOption?.label || status} />;
      }
    }
  ];
};
```

**page.tsx:**
```typescript
import { useCodeOptions } from '@/hooks/useCodeOptions';

export default function MyPage() {
  const locale = useCurrentLocale();
  const { codes: statusOptions } = useCodeOptions('COMMON_STATUS', locale);

  const columns = useMemo(
    () => createColumns(t, handleEdit, statusOptions),
    [t, handleEdit, statusOptions]
  );

  return <DataGrid columns={columns} />;
}
```

## 적용 가이드

### 1단계: Hook import 추가

```typescript
import { useCodeOptions } from '@/hooks/useCodeOptions';
```

### 2단계: 컴포넌트에서 코드 가져오기

```typescript
const locale = useCurrentLocale();
const { codes: statusOptions } = useCodeOptions('COMMON_STATUS', locale);
```

### 3단계: 하드코딩된 상수 제거

- `constants.tsx`에서 `STATUS_OPTIONS`, `ROLE_OPTIONS` 등 제거
- 함수가 매개변수로 옵션을 받도록 수정

### 4단계: 옵션을 매개변수로 전달

```typescript
const columns = useMemo(
  () => createColumns(t, handleEdit, statusOptions),
  [t, handleEdit, statusOptions]
);
```

## 주의사항

### 1. Hook은 React 컴포넌트 안에서만 사용

❌ **잘못된 사용:**
```typescript
// constants.tsx
const STATUS_OPTIONS = useCodeOptions('COMMON_STATUS', 'ko'); // Error!
```

✅ **올바른 사용:**
```typescript
// page.tsx
function MyPage() {
  const statusOptions = useCodeOptions('COMMON_STATUS', locale);
  // ...
}
```

### 2. 의존성 배열에 추가

`useMemo`, `useCallback` 사용 시 `statusOptions`를 의존성 배열에 추가해야 합니다.

```typescript
const columns = useMemo(
  () => createColumns(t, handleEdit, statusOptions),
  [t, handleEdit, statusOptions] // statusOptions 추가!
);
```

### 3. Loading 상태 처리

```typescript
const { codes: statusOptions, loading } = useCodeOptions('COMMON_STATUS', locale);

if (loading) {
  return <CircularProgress />;
}
```

### 4. 기본값 제공

```typescript
const createColumns = (statusOptions: CodeOption[] = []) => {
  // statusOptions가 비어있을 때도 동작하도록
  return [...];
};
```

## 코드 값 변환 규칙

코드 관리 시스템에서 반환되는 코드 값은 **소문자**입니다:

| 하드코딩 값 | 코드 시스템 값 | 비고 |
|------------|--------------|------|
| `'active'` | `'active'` | ✅ 동일 |
| `'Active'` | `'active'` | ⚠️ 소문자로 변환 |
| `'ACTIVE'` | `'active'` | ⚠️ 소문자로 변환 |

기존 코드와 호환성을 위해 비교 시 `.toLowerCase()` 사용:

```typescript
if (status.toLowerCase() === option.value) {
  // ...
}
```

## 적용 우선순위

1. **High Priority** - 자주 사용되는 공통 코드
   - `COMMON_STATUS` - 모든 상태 필드
   - `DEPARTMENT` - 사용자 부서
   - `MESSAGE_TYPE` - 알림 타입

2. **Medium Priority** - 특정 기능에서 사용
   - `MESSAGE_CATEGORY` - 메시지 카테고리
   - `ROLE_CATEGORY` - 역할 카테고리
   - `CODE_TYPE_CATEGORY` - 코드 타입 카테고리

3. **Low Priority** - UI 전용
   - `ICON_TYPE` - 아이콘 선택

## 테스트 체크리스트

- [ ] 코드 옵션이 올바르게 로드되는가?
- [ ] 다국어가 올바르게 표시되는가?
- [ ] 필터링/검색이 정상 동작하는가?
- [ ] 기존 데이터와 호환되는가?
- [ ] Loading 상태가 적절히 처리되는가?
- [ ] Error가 발생 시 적절히 처리되는가?

## 추가 코드 타입 생성 방법

새로운 코드 타입이 필요한 경우:

1. 코드 관리 페이지(`/admin/codes`)에서 새 코드 타입 추가
2. 해당 코드 타입에 코드 추가
3. `useCodeOptions` Hook으로 사용

```typescript
const { codes: myNewOptions } = useCodeOptions('MY_NEW_CODE_TYPE', locale);
```

## 문의 및 지원

코드 관리 시스템 관련 문의사항은 개발팀에 문의하세요.

---

**마지막 업데이트**: 2024-11-16
