# 권한 기반 UI 컨트롤 사용 가이드

프로그램별 세부 권한(조회, 생성, 수정, 삭제)에 따라 UI를 동적으로 제어하는 방법입니다.

## 목차

1. [권한 시스템 개요](#권한-시스템-개요)
2. [컴포넌트 사용법](#컴포넌트-사용법)
3. [Hook 사용법](#hook-사용법)
4. [실제 적용 예제](#실제-적용-예제)

---

## 권한 시스템 개요

### 권한 체계

- **프로그램 기반**: 각 프로그램(화면)마다 독립적인 권한 관리
- **4가지 액션**: `view`, `create`, `update`, `delete`
- **역할별 설정**: Role-Menu-Mapping 화면에서 설정
- **OR 병합**: 사용자가 여러 역할을 가질 경우, 권한은 OR 연산으로 병합

### 권한 흐름

```
1. 로그인 → 2. /user/permissions API 호출 → 3. PermissionContext에 저장
→ 4. 각 컴포넌트에서 권한 확인 → 5. UI 동적 제어
```

---

## 컴포넌트 사용법

### 1. PermissionButton

권한에 따라 버튼을 자동으로 제어하는 컴포넌트입니다.

#### 기본 사용법

```tsx
import PermissionButton from '@/components/common/PermissionButton';

function MyPage() {
  return (
    <PermissionButton
      programCode="PROG-USER-LIST"
      action="create"
      variant="contained"
      onClick={handleAdd}
    >
      사용자 추가
    </PermissionButton>
  );
}
```

#### 권한 없을 때 숨김

```tsx
<PermissionButton
  programCode="PROG-USER-LIST"
  action="delete"
  variant="outlined"
  color="error"
  onClick={handleDelete}
  hideIfNoPermission  // 권한 없으면 버튼 자체를 숨김
>
  삭제
</PermissionButton>
```

#### 툴팁과 함께 비활성화

```tsx
<PermissionButton
  programCode="PROG-USER-LIST"
  action="update"
  variant="contained"
  onClick={handleEdit}
  disableTooltip="수정 권한이 필요합니다"  // 비활성화 시 툴팁 표시
>
  수정
</PermissionButton>
```

#### Props

| Prop                   | Type                               | Required | Description                              |
| ---------------------- | ---------------------------------- | -------- | ---------------------------------------- |
| `programCode`          | `string`                           | ✅       | 프로그램 코드 (예: 'PROG-USER-LIST')   |
| `action`               | `'view' \| 'create' \| 'update' \| 'delete'` | ✅       | 필요한 권한 타입                        |
| `hideIfNoPermission`   | `boolean`                          | ❌       | 권한 없을 때 숨김 (기본값: false)       |
| `disableTooltip`       | `string`                           | ❌       | 비활성화 시 툴팁 메시지                 |
| `forceDisabled`        | `boolean`                          | ❌       | 강제 비활성화 (권한 무관)               |
| ...ButtonProps         | MUI ButtonProps                    | ❌       | MUI Button의 모든 props 사용 가능      |

---

### 2. PermissionGuard

권한에 따라 자식 컴포넌트를 조건부 렌더링하는 컴포넌트입니다.

#### 기본 사용법

```tsx
import PermissionGuard from '@/components/common/PermissionGuard';

function MyPage() {
  return (
    <PermissionGuard programCode="PROG-USER-LIST" action="delete">
      <Button onClick={handleDelete} color="error">
        삭제
      </Button>
    </PermissionGuard>
  );
}
```

#### 권한 없을 때 다른 컴포넌트 표시

```tsx
<PermissionGuard
  programCode="PROG-USER-LIST"
  action="create"
  fallback={<Typography color="text.secondary">추가 권한이 없습니다</Typography>}
>
  <Button onClick={handleAdd}>추가</Button>
</PermissionGuard>
```

#### 권한 없을 때 경고 메시지

```tsx
<PermissionGuard
  programCode="PROG-USER-LIST"
  action="update"
  showAccessDenied  // Alert 컴포넌트로 "권한 없음" 메시지 표시
>
  <FormFields ... />
</PermissionGuard>
```

#### Props

| Prop                | Type                                        | Required | Description                          |
| ------------------- | ------------------------------------------- | -------- | ------------------------------------ |
| `programCode`       | `string`                                    | ✅       | 프로그램 코드                        |
| `action`            | `'view' \| 'create' \| 'update' \| 'delete'` | ✅       | 필요한 권한 타입                     |
| `children`          | `ReactNode`                                 | ✅       | 권한 있을 때 표시할 컴포넌트         |
| `fallback`          | `ReactNode`                                 | ❌       | 권한 없을 때 표시할 컴포넌트         |
| `showAccessDenied`  | `boolean`                                   | ❌       | 권한 없을 때 경고 메시지 (기본값: false) |

---

## Hook 사용법

### 1. usePermissionControl

프로그램 권한을 편리하게 사용하기 위한 Hook입니다.

#### 기본 사용법

```tsx
import { usePermissionControl } from '@/hooks/usePermissionControl';

function UserListPage() {
  const { can, canCreate, canDelete } = usePermissionControl('PROG-USER-LIST');

  return (
    <>
      {/* 단순 권한 체크 */}
      {canCreate && <Button onClick={handleAdd}>추가</Button>}
      {canDelete && <Button onClick={handleDelete}>삭제</Button>}

      {/* 함수로 권한 체크 */}
      {can('update') && <Button onClick={handleEdit}>수정</Button>}
    </>
  );
}
```

#### 복합 권한 체크

```tsx
function UserListPage() {
  const { canAll, canAny } = usePermissionControl('PROG-USER-LIST');

  return (
    <>
      {/* 모든 권한이 있을 때만 표시 */}
      {canAll('update', 'delete') && (
        <Button onClick={handleBulkDelete}>일괄 삭제</Button>
      )}

      {/* 하나라도 권한이 있으면 표시 */}
      {canAny('create', 'update') && (
        <Button onClick={handleManage}>관리</Button>
      )}
    </>
  );
}
```

#### 반환값

```typescript
{
  // 권한 체크 함수
  can: (action: PermissionAction) => boolean;
  canAll: (...actions: PermissionAction[]) => boolean;
  canAny: (...actions: PermissionAction[]) => boolean;

  // 개별 권한 상태
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  hasAccess: boolean;

  // 기타
  loading: boolean;
  permissions: ProgramPermission | undefined;
}
```

---

### 2. useDataGridPermissions

DataGrid에 권한을 쉽게 적용하기 위한 Helper Hook입니다.

#### 사용법

```tsx
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import ExcelDataGrid from '@/components/common/DataGrid';

function UserListPage() {
  const gridPermissions = useDataGridPermissions('PROG-USER-LIST');

  return (
    <ExcelDataGrid
      rows={users}
      columns={columns}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
      {...gridPermissions}  // 권한 설정 자동 적용
    />
  );
}
```

#### 반환값

```typescript
{
  showAddButton: boolean;      // Add 버튼 표시 여부 (create 권한)
  showDeleteButton: boolean;   // Delete 버튼 표시 여부 (delete 권한)
  editable: boolean;           // Edit 기능 사용 여부 (update 권한)
  checkboxSelection: boolean;  // Checkbox 선택 가능 (delete 권한)
}
```

---

## 실제 적용 예제

### 예제 1: 사용자 관리 페이지

```tsx
'use client';

import React from 'react';
import { Box, Paper, Button } from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionGuard from '@/components/common/PermissionGuard';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { usePermissionControl, useDataGridPermissions } from '@/hooks/usePermissionControl';

const PROGRAM_CODE = 'PROG-USER-LIST';

export default function UserListPage() {
  const { can, canCreate, canDelete } = usePermissionControl(PROGRAM_CODE);
  const gridPermissions = useDataGridPermissions(PROGRAM_CODE);

  // ... 데이터 및 핸들러 로직

  return (
    <StandardCrudPageLayout
      programId={PROGRAM_CODE}
      successMessage={successMessage}
      errorMessage={errorMessage}
      // ...
    >
      {/* 헤더 액션 버튼들 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {/* 생성 권한이 있을 때만 표시 */}
        <PermissionButton
          programCode={PROGRAM_CODE}
          action="create"
          variant="contained"
          onClick={handleAdd}
        >
          사용자 추가
        </PermissionButton>

        {/* 권한 없으면 숨김 */}
        <PermissionButton
          programCode={PROGRAM_CODE}
          action="delete"
          variant="outlined"
          color="error"
          onClick={handleBulkDelete}
          hideIfNoPermission
        >
          일괄 삭제
        </PermissionButton>

        {/* 조건부로 표시 */}
        {can('update') && (
          <Button variant="outlined" onClick={handleBulkEdit}>
            일괄 수정
          </Button>
        )}
      </Box>

      {/* 데이터 그리드 */}
      <Paper sx={{ p: 1.5, flex: 1 }}>
        <ExcelDataGrid
          rows={users}
          columns={columns}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          {...gridPermissions}  // 권한 자동 적용
        />
      </Paper>

      {/* 수정 폼 - update 권한 필요 */}
      <PermissionGuard
        programCode={PROGRAM_CODE}
        action="update"
        showAccessDenied
      >
        <EditDrawer
          open={editOpen}
          onClose={handleCloseEdit}
          onSave={handleSave}
        >
          <UserFormFields ... />
        </EditDrawer>
      </PermissionGuard>
    </StandardCrudPageLayout>
  );
}
```

### 예제 2: 부서 관리 페이지에 적용

```tsx
'use client';

import React from 'react';
import { usePermissionControl } from '@/hooks/usePermissionControl';
import PermissionButton from '@/components/common/PermissionButton';

export default function DepartmentPage() {
  const { can, canCreate, canDelete } = usePermissionControl('PROG-DEPT-MGMT');

  return (
    <>
      {/* 툴바에 권한 기반 버튼들 */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {canCreate && (
          <PermissionButton
            programCode="PROG-DEPT-MGMT"
            action="create"
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            부서 추가
          </PermissionButton>
        )}

        {canDelete && (
          <PermissionButton
            programCode="PROG-DEPT-MGMT"
            action="delete"
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteSelected}
            disabled={selectedRows.length === 0}
            disableTooltip="선택된 부서가 없습니다"
          >
            선택 삭제
          </PermissionButton>
        )}
      </Box>

      {/* DataGrid - editable은 update 권한에 따라 제어됨 */}
      <ExcelDataGrid
        rows={departments}
        columns={columns}
        editable={can('update')}
        checkboxSelection={canDelete}
        onRowEdit={can('update') ? handleEdit : undefined}
      />
    </>
  );
}
```

### 예제 3: 조건부 필드 렌더링

```tsx
function UserFormFields() {
  const { can } = usePermissionControl('PROG-USER-LIST');

  return (
    <Box>
      <TextField label="Username" {...register('username')} />
      <TextField label="Email" {...register('email')} />

      {/* 관리자만 역할 변경 가능 */}
      {can('update') && (
        <Select label="Role" {...register('role')}>
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      )}
    </Box>
  );
}
```

---

## 권한 설정 방법

### 1. Role-Menu-Mapping 화면에서 설정

1. `/admin/role-menu-mapping` 페이지 접속 (admin 권한 필요)
2. 왼쪽에서 프로그램 선택
3. 오른쪽에서 역할별 권한 확인
4. **작업(Actions)** 컬럼의 수정 버튼 클릭
5. 조회/생성/수정/삭제 권한 체크박스 설정
6. 저장 버튼 클릭

### 2. 백엔드 데이터 직접 수정

`backend/data/roleProgramMappings.json` 파일:

```json
{
  "roleProgramMappings": [
    {
      "id": "rpm-001",
      "roleId": "role-001",
      "programId": "prog-001",
      "canView": true,
      "canCreate": true,
      "canUpdate": false,
      "canDelete": false
    }
  ]
}
```

---

## 베스트 프랙티스

### 1. 프로그램 코드는 상수로 관리

```tsx
// constants.ts
export const PROGRAM_CODES = {
  USER_LIST: 'PROG-USER-LIST',
  DEPT_MGMT: 'PROG-DEPT-MGMT',
  ROLE_MGMT: 'PROG-ROLE-MGMT'
} as const;

// page.tsx
import { PROGRAM_CODES } from './constants';

const { can } = usePermissionControl(PROGRAM_CODES.USER_LIST);
```

### 2. 공통 툴바 컴포넌트 만들기

```tsx
// components/CrudToolbar.tsx
interface CrudToolbarProps {
  programCode: string;
  onAdd?: () => void;
  onDelete?: () => void;
  selectedCount?: number;
}

export function CrudToolbar({ programCode, onAdd, onDelete, selectedCount = 0 }: CrudToolbarProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {onAdd && (
        <PermissionButton
          programCode={programCode}
          action="create"
          onClick={onAdd}
        >
          추가
        </PermissionButton>
      )}
      {onDelete && (
        <PermissionButton
          programCode={programCode}
          action="delete"
          onClick={onDelete}
          disabled={selectedCount === 0}
        >
          삭제 ({selectedCount})
        </PermissionButton>
      )}
    </Box>
  );
}
```

### 3. 권한 로딩 처리

```tsx
function MyPage() {
  const { loading, canView } = usePermissionControl('PROG-USER-LIST');

  if (loading) {
    return <CircularProgress />;
  }

  if (!canView) {
    return <Alert severity="error">접근 권한이 없습니다</Alert>;
  }

  return <div>...</div>;
}
```

---

## 트러블슈팅

### Q1. 권한이 제대로 작동하지 않아요

**확인 사항:**
1. `/user/permissions` API가 정상적으로 호출되는지 확인
2. `PermissionProvider`가 App 최상위에 있는지 확인
3. 브라우저 콘솔에서 권한 데이터 확인: `usePermissions().permissions`

### Q2. 권한을 변경했는데 반영이 안돼요

**해결 방법:**
- 로그아웃 후 다시 로그인 (권한은 로그인 시 캐싱됨)
- 또는 `refreshPermissions()` 함수 호출

```tsx
const { refreshPermissions } = usePermissions();
await refreshPermissions();
```

### Q3. 페이지는 보이는데 버튼이 모두 비활성화돼요

**원인:**
- RouteGuard는 `view` 권한만 체크
- 버튼은 `create`, `update`, `delete` 권한 필요

**해결:**
- Role-Menu-Mapping에서 해당 역할에 필요한 권한 추가

---

## 관련 파일

- `src/contexts/PermissionContext.tsx` - 권한 컨텍스트
- `src/components/common/PermissionButton/index.tsx` - 권한 버튼
- `src/components/common/PermissionGuard/index.tsx` - 권한 가드
- `src/hooks/usePermissionControl.ts` - 권한 Hook
- `backend/routes/user.js` - `/user/permissions` API
- `backend/data/roleProgramMappings.json` - 권한 데이터
