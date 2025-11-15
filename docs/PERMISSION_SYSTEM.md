# 권한 시스템 (Permission System)

## 개요

이 문서는 프로그램-역할 기반 권한 제어 시스템의 구조와 사용 방법을 설명합니다.

## 시스템 아키텍처

### 1. 데이터 구조

#### 역할-프로그램 매핑 (Role-Program Mapping)
- **파일**: `backend/data/roleProgramMappings.json`
- **구조**:
```json
{
  "roleProgramMappings": [
    {
      "id": "rpm-001",
      "roleId": "role-001",
      "programId": "prog-001",
      "canView": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": true,
      "createdBy": "system",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 프로그램 (Programs)
- **파일**: `backend/data/programs.json`
- 각 프로그램은 고유한 `code`를 가지며, 이를 통해 권한을 체크합니다.
- 예: `PROG-USER-LIST`, `PROG-DASHBOARD`, `PROG-ROLE-MGMT`

#### 사용자-역할 매핑 (User-Role Mapping)
- **파일**: `backend/data/userRoleMappings.json`
- 사용자가 어떤 역할을 가지는지 정의합니다.

### 2. 백엔드 구조

#### 권한 미들웨어 (`backend/middleware/permissionMiddleware.js`)

주요 함수:

1. **`getUserProgramPermissions(userId, programCode)`**
   - 사용자의 특정 프로그램에 대한 권한을 반환
   - 반환값: `{ canView, canCreate, canUpdate, canDelete, hasAccess }`

2. **`requireProgramAccess(programCode)`**
   - Express 미들웨어로 프로그램 접근 권한 확인
   - 접근 불가 시 403 에러 반환

3. **`requirePermission(programCode, permission)`**
   - 특정 권한('view', 'create', 'update', 'delete') 확인
   - 권한 없을 시 403 에러 반환

4. **`getUserAccessiblePrograms(userId)`**
   - 사용자가 접근 가능한 모든 프로그램 목록 반환

#### 사용 예시 (백엔드 라우트)

```javascript
const { requireProgramAccess, requirePermission } = require('../middleware/permissionMiddleware');

// 프로그램 접근 권한만 확인 (최소 view 권한 필요)
router.get('/users', requireProgramAccess('PROG-USER-LIST'), (req, res) => {
  // req.programPermissions에 권한 정보 포함
  res.json({ users: [] });
});

// 특정 작업 권한 확인
router.post('/users', requirePermission('PROG-USER-LIST', 'create'), (req, res) => {
  // 생성 권한이 있는 경우에만 실행
  res.json({ success: true });
});

router.put('/users/:id', requirePermission('PROG-USER-LIST', 'update'), (req, res) => {
  // 수정 권한 확인
});

router.delete('/users/:id', requirePermission('PROG-USER-LIST', 'delete'), (req, res) => {
  // 삭제 권한 확인
});
```

### 3. 프론트엔드 구조

#### 권한 컨텍스트 (`src/contexts/PermissionContext.tsx`)

전역 상태로 사용자의 모든 프로그램 권한을 관리합니다.

주요 함수:

1. **`usePermissions()`**: 전체 권한 컨텍스트 접근
2. **`useProgramPermissions(programCode)`**: 특정 프로그램의 권한 확인

```typescript
const {
  hasAccess,    // 접근 가능 여부 (view 권한)
  canView,      // 조회 권한
  canCreate,    // 생성 권한
  canUpdate,    // 수정 권한
  canDelete,    // 삭제 권한
  loading       // 로딩 상태
} = useProgramPermissions('PROG-USER-LIST');
```

#### RouteGuard 컴포넌트 (`src/components/auth/RouteGuard.tsx`)

페이지 레벨에서 권한을 체크하고 접근을 제어합니다.

```typescript
import RouteGuard from '@/components/auth/RouteGuard';

export default function UserManagementPage() {
  return (
    <RouteGuard
      programCode="PROG-USER-LIST"
      requiredPermission="view"
      fallbackUrl="/dashboard"
    >
      {/* 페이지 컨텐츠 */}
    </RouteGuard>
  );
}
```

#### 컴포넌트 레벨 권한 체크

```typescript
'use client';

import { useProgramPermissions } from '@/contexts/PermissionContext';

export default function UserList() {
  const { canCreate, canUpdate, canDelete } = useProgramPermissions('PROG-USER-LIST');

  return (
    <div>
      {canCreate && <Button>Create User</Button>}

      <DataGrid
        onAdd={canCreate ? handleAdd : undefined}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
      />
    </div>
  );
}
```

## 권한 설정 방법

### 1. 새 프로그램 추가

1. `backend/data/programs.json`에 프로그램 추가:
```json
{
  "id": "prog-018",
  "code": "PROG-NEW-FEATURE",
  "name": {
    "en": "New Feature",
    "ko": "새 기능"
  },
  "permissions": [
    { "code": "READ", "name": { "en": "Read", "ko": "읽기" } },
    { "code": "WRITE", "name": { "en": "Write", "ko": "쓰기" } },
    { "code": "DELETE", "name": { "en": "Delete", "ko": "삭제" } }
  ]
}
```

2. 메뉴에 프로그램 ID 연결 (`backend/data/menus.json`):
```json
{
  "id": "menu-020",
  "code": "new-feature",
  "name": { "en": "New Feature", "ko": "새 기능" },
  "path": "/admin/new-feature",
  "programId": "PROG-NEW-FEATURE"
}
```

### 2. 역할에 프로그램 권한 부여

**관리자 화면 사용 (권장)**:
1. `/admin/role-menu-mapping` 페이지 접속
2. 프로그램 선택
3. 역할 추가 버튼 클릭
4. 권한 설정 (View, Create, Update, Delete)

**수동 설정**:
`backend/data/roleProgramMappings.json` 파일 편집:
```json
{
  "id": "rpm-050",
  "roleId": "role-003",
  "programId": "prog-018",
  "canView": true,
  "canCreate": true,
  "canUpdate": false,
  "canDelete": false,
  "createdBy": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. 사용자에게 역할 부여

**관리자 화면 사용**:
1. `/admin/user-role-mapping` 페이지 접속
2. 역할 선택
3. 사용자 추가

## 권한 체크 로직

### 권한 집계 (Aggregation)

사용자가 여러 역할을 가진 경우, 권한은 **OR 로직**으로 집계됩니다:
- 역할 A: canView=true, canCreate=false
- 역할 B: canView=true, canCreate=true
- **결과**: canView=true, canCreate=true

### 접근 제어 규칙

1. **메뉴 표시**: 프로그램에 대한 권한이 하나라도 있으면 메뉴에 표시
2. **페이지 접근**: 최소 `canView` 권한 필요
3. **작업 수행**: 각 작업에 해당하는 권한 필요
   - Create 버튼: `canCreate` 필요
   - Edit 버튼: `canUpdate` 필요
   - Delete 버튼: `canDelete` 필요

### 공개 프로그램

역할-프로그램 매핑이 없는 프로그램은 **접근 불가**입니다.
모든 사용자에게 공개하려면 "Public" 역할을 만들어 모든 사용자에게 부여해야 합니다.

## Provider 통합

앱의 root layout에 PermissionProvider 추가:

```typescript
// src/app/providers.tsx
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PermissionProvider>
        {children}
      </PermissionProvider>
    </AuthProvider>
  );
}
```

```typescript
// src/app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 테스트 방법

### 1. 권한 확인
```bash
# 백엔드 서버 실행
cd backend
node server.js

# 프론트엔드 서버 실행
npm run dev

# 다른 사용자로 로그인하여 권한 확인
```

### 2. API 테스트
```bash
# 권한 조회
curl -X GET http://localhost:3001/api/user/permissions \
  -H "Cookie: connect.sid=..."

# 프로그램 접근 테스트
curl -X GET http://localhost:3001/api/users \
  -H "Cookie: connect.sid=..."
```

## 문제 해결

### 권한이 반영되지 않을 때
1. 브라우저 새로고침 (F5)
2. 캐시 삭제 후 재로그인
3. 백엔드 서버 재시작
4. `roleProgramMappings.json` 파일 확인

### 메뉴가 표시되지 않을 때
1. 프로그램 코드가 올바른지 확인
2. 역할-프로그램 매핑 존재 여부 확인
3. 사용자-역할 매핑 활성화 상태 확인 (`isActive: true`)

### 403 에러 발생 시
1. 해당 작업에 필요한 권한 확인
2. 백엔드 로그 확인
3. `req.programPermissions` 객체 확인

## 보안 고려사항

1. **백엔드 검증 필수**: 프론트엔드 권한 체크는 UI 편의성을 위한 것이며, 모든 API는 백엔드에서 권한을 다시 확인해야 합니다.

2. **세션 관리**: 권한 정보는 세션 기반으로 관리되므로 세션 타임아웃에 주의합니다.

3. **권한 변경 후 처리**: 권한 변경 후 사용자는 재로그인하거나 페이지를 새로고침해야 합니다.

4. **감사 로그**: 중요한 작업(생성, 수정, 삭제)은 로그로 기록됩니다.

## 추후 개선 사항

1. 실시간 권한 업데이트 (WebSocket)
2. 세밀한 필드 레벨 권한 제어
3. 권한 상속 메커니즘
4. 역할 계층 구조 (Role Hierarchy)
5. 임시 권한 부여 (Time-based permissions)
