# CodeSelect & CodeMultiSelect 공통 컴포넌트 사용 가이드

## 개요

코드 관리 시스템과 통합된 Select 컴포넌트로, 코드 타입만 지정하면 자동으로 옵션을 가져와 표시합니다.

## 컴포넌트

### 1. CodeSelect (단일 선택)
### 2. CodeMultiSelect (다중 선택)

---

## CodeSelect - 단일 선택

### 기본 사용법

```tsx
import CodeSelect from '@/components/common/CodeSelect';

<CodeSelect
  codeType="COMMON_STATUS"
  value={formData.status}
  onChange={(value) => setFormData({ ...formData, status: value })}
  label="Status"
  required
/>
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `codeType` | `string` | ✅ Yes | - | 코드 타입 (e.g., 'COMMON_STATUS', 'DEPARTMENT') |
| `value` | `string` | ✅ Yes | - | 현재 선택된 값 |
| `onChange` | `(value: string) => void` | ✅ Yes | - | 값 변경 핸들러 |
| `label` | `string` | ✅ Yes | - | 필드 라벨 |
| `placeholder` | `string` | ❌ No | - | Placeholder 텍스트 |
| `required` | `boolean` | ❌ No | `false` | 필수 입력 여부 |
| `disabled` | `boolean` | ❌ No | `false` | 비활성화 여부 |
| `error` | `boolean` | ❌ No | `false` | 에러 상태 |
| `helperText` | `string` | ❌ No | - | 도움말 텍스트 |
| `fullWidth` | `boolean` | ❌ No | `true` | 전체 너비 사용 |
| `size` | `'small' \| 'medium'` | ❌ No | `'medium'` | 크기 |
| `showEmpty` | `boolean` | ❌ No | `false` | 빈 옵션 표시 ("All" / "None") |
| `emptyLabel` | `string` | ❌ No | `'All'` | 빈 옵션 라벨 |
| `locale` | `string` | ❌ No | 현재 locale | 언어 설정 |

### 사용 예시

#### 1. 기본 사용 (상태 선택)

```tsx
<CodeSelect
  codeType="COMMON_STATUS"
  value={user.status}
  onChange={(value) => setUser({ ...user, status: value })}
  label="Status"
  required
/>
```

#### 2. 빈 옵션 포함 (부서 선택)

```tsx
<CodeSelect
  codeType="DEPARTMENT"
  value={user.department}
  onChange={(value) => setUser({ ...user, department: value })}
  label="Department"
  showEmpty
  emptyLabel="None"
/>
```

#### 3. 에러 상태 표시

```tsx
<CodeSelect
  codeType="USER_ROLE"
  value={user.role}
  onChange={(value) => setUser({ ...user, role: value })}
  label="Role"
  required
  error={!user.role}
  helperText={!user.role ? "Role is required" : ""}
/>
```

#### 4. 작은 크기 (Small)

```tsx
<CodeSelect
  codeType="COMMON_STATUS"
  value={status}
  onChange={setStatus}
  label="Status"
  size="small"
/>
```

---

## CodeMultiSelect - 다중 선택

### 기본 사용법

```tsx
import CodeMultiSelect from '@/components/common/CodeMultiSelect';

<CodeMultiSelect
  codeType="DEPARTMENT"
  value={selectedDepartments}
  onChange={setSelectedDepartments}
  label="Departments"
  showCheckbox
  renderChips
/>
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `codeType` | `string` | ✅ Yes | - | 코드 타입 |
| `value` | `string[]` | ✅ Yes | - | 현재 선택된 값들 (배열) |
| `onChange` | `(value: string[]) => void` | ✅ Yes | - | 값 변경 핸들러 |
| `label` | `string` | ✅ Yes | - | 필드 라벨 |
| `placeholder` | `string` | ❌ No | - | Placeholder 텍스트 |
| `required` | `boolean` | ❌ No | `false` | 필수 입력 여부 |
| `disabled` | `boolean` | ❌ No | `false` | 비활성화 여부 |
| `error` | `boolean` | ❌ No | `false` | 에러 상태 |
| `helperText` | `string` | ❌ No | - | 도움말 텍스트 |
| `fullWidth` | `boolean` | ❌ No | `true` | 전체 너비 사용 |
| `size` | `'small' \| 'medium'` | ❌ No | `'medium'` | 크기 |
| `showCheckbox` | `boolean` | ❌ No | `true` | 체크박스 표시 |
| `renderChips` | `boolean` | ❌ No | `true` | 선택된 항목을 Chip으로 표시 |
| `maxChipsDisplay` | `number` | ❌ No | `2` | 최대 표시 Chip 개수 |
| `locale` | `string` | ❌ No | 현재 locale | 언어 설정 |

### 사용 예시

#### 1. 기본 사용 (부서 다중 선택)

```tsx
<CodeMultiSelect
  codeType="DEPARTMENT"
  value={user.departments}
  onChange={(value) => setUser({ ...user, departments: value })}
  label="Departments"
  showCheckbox
  renderChips
/>
```

#### 2. 체크박스 없이

```tsx
<CodeMultiSelect
  codeType="USER_ROLE"
  value={selectedRoles}
  onChange={setSelectedRoles}
  label="Roles"
  showCheckbox={false}
  renderChips
/>
```

#### 3. Chip 대신 텍스트로 표시

```tsx
<CodeMultiSelect
  codeType="MESSAGE_CATEGORY"
  value={categories}
  onChange={setCategories}
  label="Categories"
  renderChips={false}
/>
```

#### 4. Chip 표시 개수 제한

```tsx
<CodeMultiSelect
  codeType="DEPARTMENT"
  value={departments}
  onChange={setDepartments}
  label="Departments"
  renderChips
  maxChipsDisplay={3}  // 3개까지만 표시, 나머지는 "+X more"
/>
```

---

## 사용 가능한 코드 타입

| 코드 타입 | 설명 | 사용 예시 |
|----------|------|----------|
| `COMMON_STATUS` | 공통 상태 (active, inactive, pending) | 모든 상태 필드 |
| `USER_ROLE` | 사용자 역할 (admin, manager, user) | 역할 선택 |
| `DEPARTMENT` | 부서 (Admin, Design, Engineering, ...) | 부서 선택 |
| `MESSAGE_CATEGORY` | 메시지 카테고리 | 메시지 분류 |
| `MESSAGE_TYPE` | 메시지 타입 (success, error, warning, info) | 알림 타입 |
| `CODE_TYPE_CATEGORY` | 코드 타입 카테고리 | 코드 타입 분류 |
| `PROGRAM_CATEGORY` | 프로그램 카테고리 | 프로그램 분류 |
| `PROGRAM_TYPE` | 프로그램 타입 | 프로그램 유형 |
| `PROGRAM_STATUS` | 프로그램 상태 | 프로그램 상태 |
| `HELP_STATUS` | 도움말 상태 (draft, published) | 도움말 문서 상태 |
| `LANGUAGE` | 언어 (en, ko, zh, vi) | 언어 선택 |
| `ROLE_CATEGORY` | 역할 카테고리 (general, management) | 역할 분류 |
| `ICON_TYPE` | Material-UI 아이콘 타입 | 아이콘 선택 |

---

## 기존 하드코딩 Select 교체하기

### Before (하드코딩)

```tsx
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

<FormControl fullWidth>
  <InputLabel>Status</InputLabel>
  <Select
    value={user.status || 'active'}
    label="Status"
    onChange={(e) => setUser({ ...user, status: e.target.value })}
  >
    <MenuItem value="active">Active</MenuItem>
    <MenuItem value="inactive">Inactive</MenuItem>
  </Select>
</FormControl>
```

### After (CodeSelect 사용)

```tsx
import CodeSelect from '@/components/common/CodeSelect';

<CodeSelect
  codeType="COMMON_STATUS"
  value={user.status || 'active'}
  onChange={(value) => setUser({ ...user, status: value })}
  label="Status"
  required
/>
```

**코드 줄 수**: 13줄 → 6줄 (50% 감소!)

---

## 장점

### ✅ **간단한 사용법**
- 코드 타입만 지정하면 자동으로 옵션 로드
- 하드코딩된 MenuItem 제거

### ✅ **자동 다국어 지원**
- 현재 locale에 맞는 라벨 자동 표시
- 언어 변경 시 자동 업데이트

### ✅ **자동 로딩 상태**
- 데이터 로딩 중 자동으로 CircularProgress 표시
- disabled 상태 자동 처리

### ✅ **일관된 UX**
- 모든 Select가 동일한 스타일과 동작
- Material-UI 테마 자동 적용

### ✅ **유지보수 용이**
- 코드 추가/수정이 DB에서만 가능
- 컴포넌트 코드 수정 불필요

---

## 주의사항

### 1. 초기값 설정

빈 문자열이나 undefined는 에러를 발생시킬 수 있습니다.

```tsx
// ❌ Bad
<CodeSelect
  value={user.status}  // undefined일 수 있음
  ...
/>

// ✅ Good
<CodeSelect
  value={user.status || 'active'}  // 기본값 제공
  ...
/>
```

### 2. MultiSelect의 초기값은 배열

```tsx
// ❌ Bad
<CodeMultiSelect
  value={user.departments}  // undefined or null
  ...
/>

// ✅ Good
<CodeMultiSelect
  value={user.departments || []}  // 빈 배열로 초기화
  ...
/>
```

### 3. onChange 핸들러

CodeSelect는 값을 직접 전달합니다 (event 객체 아님).

```tsx
// ❌ Bad
onChange={(e) => setStatus(e.target.value)}

// ✅ Good
onChange={(value) => setStatus(value)}
```

---

## Form 통합 예시

### UserFormFields 예시

```tsx
'use client';

import React from 'react';
import { TextField, Divider } from '@mui/material';
import CodeSelect from '@/components/common/CodeSelect';

export default function UserFormFields({ user, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...user, [field]: value });
  };

  return (
    <>
      <TextField
        label="Username"
        value={user.username || ''}
        onChange={(e) => handleChange('username', e.target.value)}
        required
      />

      <TextField
        label="Email"
        type="email"
        value={user.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
        required
      />

      {/* Role - CodeSelect 사용 */}
      <CodeSelect
        codeType="USER_ROLE"
        value={user.role || 'user'}
        onChange={(value) => handleChange('role', value)}
        label="Role"
        required
      />

      {/* Department - CodeSelect with empty option */}
      <CodeSelect
        codeType="DEPARTMENT"
        value={user.department || ''}
        onChange={(value) => handleChange('department', value)}
        label="Department"
        showEmpty
        emptyLabel="None"
      />

      {/* Status - CodeSelect */}
      <CodeSelect
        codeType="COMMON_STATUS"
        value={user.status || 'active'}
        onChange={(value) => handleChange('status', value)}
        label="Status"
        required
      />
    </>
  );
}
```

---

## 적용 완료된 컴포넌트

✅ **UserFormFields.tsx**
- Role: `USER_ROLE`
- Department: `DEPARTMENT`
- Status: `COMMON_STATUS`

✅ **CodeFormFields.tsx**
- Status: `COMMON_STATUS`

✅ **DepartmentFormFields.tsx**
- Status: `COMMON_STATUS`

✅ **MessageFormFields.tsx**
- Status: `COMMON_STATUS`

✅ **CodeTypeFormFields.tsx**
- Category: `CODE_TYPE_CATEGORY`
- Status: `COMMON_STATUS`

---

## FAQ

### Q1: 새로운 코드 타입을 만들려면?

코드 관리 페이지(`/admin/codes`)에서 새 코드 타입을 추가하면 즉시 사용 가능합니다.

### Q2: 코드 순서를 변경하려면?

코드 관리 페이지에서 `order` 필드를 수정하면 Select에서 자동으로 반영됩니다.

### Q3: 특정 코드를 비활성화하려면?

코드의 `status`를 'inactive'로 변경하면 Select에서 자동으로 제외됩니다.

### Q4: 커스텀 스타일을 적용하려면?

Material-UI의 sx prop를 사용할 수 없으므로, 별도의 wrapper를 만들어 사용하세요.

---

**마지막 업데이트**: 2024-11-16
