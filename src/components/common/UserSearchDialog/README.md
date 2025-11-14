# UserSearchDialog 공통 컴포넌트

사용자 검색 및 선택을 위한 범용 Dialog 컴포넌트입니다. 단일/다중 선택, 빠른 검색/고급 검색, 제외 사용자 표시 등 다양한 기능을 지원합니다.

## 주요 기능

### 1. **단일/다중 선택 모드**
- `multiSelect={false}`: 단일 사용자 선택 (기본값)
- `multiSelect={true}`: 여러 사용자 동시 선택 (체크박스)

### 2. **빠른 검색 / 고급 검색**
- `showAdvancedSearch={false}`: 빠른 검색만 제공 (기본값)
- `showAdvancedSearch={true}`: 고급 검색 패널 제공 (이름, 사용자명, 이메일, 부서 개별 필터)

### 3. **검색 최적화**
- `minSearchLength`: 최소 검색 길이 설정 (기본값: 2)
- `maxResults`: 최대 검색 결과 개수 (기본값: 200)
- 300ms 디바운스로 API 호출 최적화
- 서버 사이드 검색으로 대용량 데이터 처리

### 4. **제외 사용자 표시**
- `excludedUserIds`: 이미 할당된 사용자 목록 전달
- 제외된 사용자는 "이미 할당됨" 섹션에 비활성화 상태로 표시

### 5. **다국어 지원**
- `locale="ko" | "en"`: 한국어/영어 UI 자동 전환

### 6. **상태 필터링**
- `filterByStatus="active"`: 활성 사용자만 검색

## Props 인터페이스

```typescript
interface UserSearchDialogProps {
  // 필수 Props
  open: boolean;                              // Dialog 열림/닫힘 상태
  onClose: () => void;                        // Dialog 닫기 콜백

  // 선택 모드 Props (둘 중 하나 필수)
  onSelect?: (user: User) => void;            // 단일 선택 콜백
  onSelectMultiple?: (users: User[]) => void; // 다중 선택 콜백

  // 선택적 Props
  title?: string;                             // Dialog 제목
  selectedUserId?: string | null;             // 기본 선택된 사용자 ID (단일 선택)
  selectedUserIds?: string[];                 // 기본 선택된 사용자 IDs (다중 선택)
  excludedUserIds?: string[];                 // 제외할 사용자 IDs
  locale?: string;                            // 언어 ('ko' | 'en')
  multiSelect?: boolean;                      // 다중 선택 모드 (기본: false)
  showAdvancedSearch?: boolean;               // 고급 검색 표시 (기본: false)
  minSearchLength?: number;                   // 최소 검색 길이 (기본: 2)
  maxResults?: number;                        // 최대 결과 개수 (기본: 200)
  filterByStatus?: string;                    // 상태 필터 (기본: 'active')
}
```

## 사용 예시

### 1. 기본 단일 선택

```tsx
import UserSearchDialog, { User } from '@/components/common/UserSearchDialog';

function MyComponent() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectUser = (user: User) => {
    console.log('Selected user:', user);
    // 사용자 선택 후 처리
  };

  return (
    <UserSearchDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onSelect={handleSelectUser}
      title="Select User"
      locale="en"
    />
  );
}
```

### 2. 다중 선택 (역할 할당 등)

```tsx
import UserSearchDialog, { User } from '@/components/common/UserSearchDialog';

function RoleAssignment() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [existingUserIds, setExistingUserIds] = useState<string[]>([]);

  const handleSelectUsers = async (users: User[]) => {
    // 선택된 사용자들을 역할에 할당
    for (const user of users) {
      await assignUserToRole(user.id);
    }
  };

  return (
    <UserSearchDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onSelectMultiple={handleSelectUsers}
      title="Assign Users to Role"
      excludedUserIds={existingUserIds}
      multiSelect={true}
      showAdvancedSearch={true}
      locale="ko"
    />
  );
}
```

### 3. 고급 검색 활성화

```tsx
<UserSearchDialog
  open={open}
  onClose={onClose}
  onSelectMultiple={handleSelectUsers}
  title="Search Users"
  multiSelect={true}
  showAdvancedSearch={true}    // 고급 검색 버튼 표시
  minSearchLength={2}           // 2글자 이상 입력 시 검색
  maxResults={200}              // 최대 200명 표시
  filterByStatus="active"       // 활성 사용자만
  locale="ko"
/>
```

### 4. UserSelector와 함께 사용 (TextField 형태)

```tsx
import UserSelector from '@/components/common/UserSelector';

// UserSelector는 내부적으로 UserSearchDialog를 사용
// TextField + 검색 버튼 형태의 UI 제공

<UserSelector
  label="Assignee"
  value={assigneeId}
  onChange={(userId, user) => {
    setAssigneeId(userId);
    console.log('Selected user:', user);
  }}
  required
/>
```

## 활용 사례

### 1. **사용자-역할 매핑 (User-Role Mapping)**
- 역할에 여러 사용자 할당
- 이미 할당된 사용자 제외 표시
- 부서별 고급 검색

### 2. **작업 할당 (Task Assignment)**
- 프로젝트/작업에 담당자 지정
- 활성 사용자만 필터링

### 3. **권한 부여 (Permission Granting)**
- 특정 리소스에 여러 사용자 권한 부여
- 사용자명, 이메일, 부서로 검색

### 4. **팀 구성 (Team Building)**
- 팀에 여러 멤버 추가
- 중복 방지를 위한 제외 목록

### 5. **승인자 선택 (Approver Selection)**
- 워크플로우 승인자 지정
- 단일 선택 모드 사용

## 성능 최적화

1. **서버 사이드 검색**: 대용량 사용자 데이터도 빠르게 처리
2. **디바운스**: 300ms 디바운스로 불필요한 API 호출 방지
3. **결과 제한**: maxResults로 결과 개수 제한
4. **최소 검색 길이**: minSearchLength로 의미 있는 검색만 수행
5. **메모이제이션**: useMemo로 불필요한 재계산 방지

## 주의사항

1. **API 엔드포인트**: `/api/user` 엔드포인트가 다음 쿼리 파라미터를 지원해야 합니다:
   - `name`, `username`, `email`, `department`: 검색 필터
   - `limit`, `page`: 페이지네이션
   - `status`: 상태 필터

2. **User 인터페이스**: 백엔드가 다음 필드를 반환해야 합니다:
   ```typescript
   {
     id: string;
     username: string;
     name: string;
     email: string;
     role?: string;
     department?: string;
     status?: string;
     isActive?: boolean;
   }
   ```

3. **다중 선택 시**: `onSelectMultiple` 콜백에서 선택된 사용자 배열을 받습니다.

4. **단일 선택 시**: `onSelect` 콜백에서 선택된 사용자 객체를 받습니다.

## 기존 UserSearchDialog와의 차이점

### 개선 사항
- ✅ 다중 선택 모드 추가
- ✅ 고급 검색 기능 추가
- ✅ 서버 사이드 검색으로 변경 (성능 개선)
- ✅ 제외 사용자 목록 표시 기능
- ✅ 검색 최소 길이 설정 가능
- ✅ 검색 결과 개수 제한 가능
- ✅ 부서 정보 표시

### 하위 호환성
- 기존 단일 선택 모드는 그대로 동작
- 기본 Props만 사용하면 기존 동작과 동일
- 새로운 기능은 opt-in 방식 (필요할 때만 활성화)

## 마이그레이션 가이드

기존 UserSearchDialog 사용 코드는 수정 없이 그대로 동작합니다:

```tsx
// 기존 코드 - 그대로 동작
<UserSearchDialog
  open={open}
  onClose={onClose}
  onSelect={handleSelect}
  title="Select User"
/>

// 새로운 기능 추가 시
<UserSearchDialog
  open={open}
  onClose={onClose}
  onSelectMultiple={handleSelectMultiple}  // 다중 선택
  multiSelect={true}                       // 모드 변경
  showAdvancedSearch={true}                // 고급 검색 추가
  excludedUserIds={existing}               // 제외 목록
  locale="ko"
/>
```
