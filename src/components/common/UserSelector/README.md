# UserSelector 공통 컴포넌트

TextField 형태의 사용자 선택 컴포넌트입니다. 검색 버튼을 클릭하면 UserSearchDialog가 열려 사용자를 검색하고 선택할 수 있습니다.

## 주요 기능

### 1. **TextField 기반 UI**
- 읽기 전용 TextField에 검색 아이콘 버튼 제공
- 선택된 사용자 정보를 TextField에 표시
- 부서 및 역할 Chip으로 시각적 구분

### 2. **자동 사용자 정보 로딩**
- `value` prop으로 userId가 전달되면 자동으로 사용자 정보 로드
- 선택된 사용자의 이름, 이메일, 부서, 역할 표시

### 3. **통합된 검색 경험**
- UserSearchDialog 내장
- 빠른 검색 / 고급 검색 지원
- 다국어 지원 (한국어/영어)

### 4. **선택 해제 기능**
- Clear 버튼으로 선택 해제
- disabled 상태에서는 Clear 버튼 숨김

### 5. **부서 정보 표시**
- 선택된 사용자의 부서를 Chip으로 표시
- 역할과 함께 표시되어 사용자 구분 용이

## Props 인터페이스

```typescript
interface UserSelectorProps {
  // 필수 Props
  label: string;                              // TextField 라벨
  value: string | null;                       // 선택된 사용자 ID
  onChange: (userId: string | null, user?: User) => void; // 변경 콜백

  // 선택적 Props
  helperText?: string;                        // 도움말 텍스트
  error?: boolean;                            // 에러 상태
  required?: boolean;                         // 필수 입력 여부
  disabled?: boolean;                         // 비활성화 여부
  locale?: string;                            // 언어 ('ko' | 'en')
  showAdvancedSearch?: boolean;               // 고급 검색 표시
  minSearchLength?: number;                   // 최소 검색 길이 (기본: 2)
  maxResults?: number;                        // 최대 결과 개수 (기본: 200)
  filterByStatus?: string;                    // 상태 필터 (기본: 'active')
  excludedUserIds?: string[];                 // 제외할 사용자 IDs
}
```

## 사용 예시

### 1. 기본 사용

```tsx
import UserSelector from '@/components/common/UserSelector';
import { useState } from 'react';

function MyForm() {
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  return (
    <UserSelector
      label="Assignee"
      value={assigneeId}
      onChange={(userId, user) => {
        setAssigneeId(userId);
        console.log('Selected user:', user);
      }}
      required
    />
  );
}
```

### 2. 고급 검색 활성화

```tsx
<UserSelector
  label="담당자"
  value={managerId}
  onChange={(userId, user) => setManagerId(userId)}
  locale="ko"
  showAdvancedSearch={true}  // 고급 검색 활성화
  helperText="프로젝트 담당자를 선택하세요"
  required
/>
```

### 3. 유효성 검사와 함께 사용

```tsx
import { useState } from 'react';

function TaskForm() {
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [errors, setErrors] = useState({ assignee: false });

  const handleSubmit = () => {
    if (!assigneeId) {
      setErrors({ assignee: true });
      return;
    }
    // Submit logic...
  };

  return (
    <UserSelector
      label="Assignee"
      value={assigneeId}
      onChange={(userId) => {
        setAssigneeId(userId);
        setErrors({ assignee: false });
      }}
      error={errors.assignee}
      helperText={errors.assignee ? 'Assignee is required' : 'Select task assignee'}
      required
    />
  );
}
```

### 4. 제외 사용자와 함께 사용

```tsx
// 현재 프로젝트 팀원을 제외하고 새 팀원 추가
<UserSelector
  label="New Team Member"
  value={newMemberId}
  onChange={(userId) => setNewMemberId(userId)}
  excludedUserIds={currentTeamMemberIds}
  showAdvancedSearch={true}
  locale="en"
/>
```

### 5. 다국어 지원

```tsx
import { useParams } from 'next/navigation';

function LocalizedForm() {
  const params = useParams();
  const locale = params.locale as string;
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <UserSelector
      label={locale === 'ko' ? '승인자' : 'Approver'}
      value={userId}
      onChange={(id) => setUserId(id)}
      locale={locale}
      showAdvancedSearch={true}
    />
  );
}
```

## 개선 사항

### Before (기존 버전)
- 단순 검색만 지원
- 다국어 미지원
- 부서 정보 미표시
- 고급 검색 불가
- 제외 사용자 처리 불가

### After (개선된 버전)
- ✅ 빠른 검색 / 고급 검색 선택 가능
- ✅ 한국어/영어 자동 전환
- ✅ 부서 정보 Chip 표시
- ✅ 역할과 부서 동시 표시
- ✅ 제외 사용자 목록 지원
- ✅ 최소 검색 길이 설정 가능
- ✅ 최대 결과 개수 제한
- ✅ 사용자 정보 자동 로드

## 활용 사례

### 1. **작업 할당 폼**
```tsx
<UserSelector
  label="Assignee"
  value={task.assigneeId}
  onChange={(userId) => updateTask({ assigneeId: userId })}
  showAdvancedSearch={true}
  required
/>
```

### 2. **승인자 선택**
```tsx
<UserSelector
  label="Approver"
  value={workflow.approverId}
  onChange={(userId) => setWorkflow({ ...workflow, approverId: userId })}
  filterByStatus="active"
  required
/>
```

### 3. **프로젝트 관리자 지정**
```tsx
<UserSelector
  label="Project Manager"
  value={project.managerId}
  onChange={(userId, user) => {
    setProject({
      ...project,
      managerId: userId,
      managerName: user?.name
    });
  }}
  showAdvancedSearch={true}
/>
```

### 4. **팀원 추가 (현재 팀원 제외)**
```tsx
<UserSelector
  label="Add Team Member"
  value={null}
  onChange={(userId) => addTeamMember(userId)}
  excludedUserIds={currentTeam.map(m => m.userId)}
  showAdvancedSearch={true}
/>
```

### 5. **필터 조건**
```tsx
// 특정 역할의 사용자만 선택
<UserSelector
  label="Admin User"
  value={adminId}
  onChange={setAdminId}
  filterByStatus="active"
  showAdvancedSearch={true}
/>
```

## 스타일 커스터마이징

TextField를 감싸는 Box에 sx prop 전달:

```tsx
<Box sx={{ width: '300px' }}>
  <UserSelector
    label="User"
    value={userId}
    onChange={setUserId}
  />
</Box>
```

## 주의사항

1. **onChange 콜백**: 두 개의 파라미터를 받습니다
   - `userId`: 선택된 사용자 ID (또는 null)
   - `user`: 선택된 사용자 전체 객체 (선택적)

2. **value prop**:
   - 초기값으로 userId를 전달하면 자동으로 사용자 정보 로드
   - null이면 선택되지 않은 상태

3. **UserSearchDialog**:
   - 내부적으로 UserSearchDialog를 사용
   - showAdvancedSearch, minSearchLength 등의 props가 그대로 전달됨

4. **API 요구사항**:
   - GET `/api/user?id={userId}`: 단일 사용자 정보 조회
   - GET `/api/user`: 사용자 검색 (UserSearchDialog가 사용)

## 하위 호환성

기존 코드는 수정 없이 그대로 동작합니다:

```tsx
// 기존 코드 - 그대로 동작
<UserSelector
  label="User"
  value={userId}
  onChange={(id) => setUserId(id)}
/>

// 새로운 기능 추가
<UserSelector
  label="User"
  value={userId}
  onChange={(id, user) => {
    setUserId(id);
    console.log('User details:', user);
  }}
  locale="ko"
  showAdvancedSearch={true}
/>
```

## UserSearchDialog vs UserSelector

| 특징 | UserSearchDialog | UserSelector |
|------|------------------|--------------|
| UI 형태 | Dialog (팝업) | TextField + 버튼 |
| 사용 시점 | 버튼 클릭 시 열림 | 폼 입력 필드로 사용 |
| 다중 선택 | 가능 | 불가 (단일 선택만) |
| 사용 사례 | 역할 할당, 일괄 작업 | 폼 필드, 단일 선택 |
| 자동 표시 | 조건부 | 항상 표시 |

## 통합 예시

UserSelector와 UserSearchDialog를 함께 사용:

```tsx
function TeamManagement() {
  const [teamLeaderId, setTeamLeaderId] = useState<string | null>(null);
  const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);

  return (
    <>
      {/* 팀장 선택 - 단일 선택 */}
      <UserSelector
        label="Team Leader"
        value={teamLeaderId}
        onChange={setTeamLeaderId}
        showAdvancedSearch={true}
        required
      />

      {/* 팀원 추가 버튼 */}
      <Button onClick={() => setAddMembersDialogOpen(true)}>
        Add Team Members
      </Button>

      {/* 팀원 일괄 추가 - 다중 선택 */}
      <UserSearchDialog
        open={addMembersDialogOpen}
        onClose={() => setAddMembersDialogOpen(false)}
        onSelectMultiple={(users) => {
          const newMemberIds = users.map(u => u.id);
          setTeamMemberIds([...teamMemberIds, ...newMemberIds]);
        }}
        multiSelect={true}
        showAdvancedSearch={true}
        excludedUserIds={[teamLeaderId, ...teamMemberIds].filter(Boolean)}
      />
    </>
  );
}
```
