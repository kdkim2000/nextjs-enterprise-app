# 사용자 선택 컴포넌트 가이드

## 개요

사용자 선택을 위한 두 가지 컴포넌트가 제공됩니다. 사용 사례에 따라 적절한 컴포넌트를 선택하세요.

## 컴포넌트 비교

### UserSearchDialog vs UserSelector

| 특성 | UserSearchDialog | UserSelector |
|------|------------------|--------------|
| **UI 형태** | Dialog (모달 팝업) | TextField (폼 필드) |
| **표시 방식** | 버튼 클릭 시 열림 | 항상 화면에 표시됨 |
| **사용 목적** | 검색 및 선택 | 폼 입력 필드 |
| **단독 사용** | ✅ 독립 사용 가능 | ✅ 독립 사용 가능 |
| **다중 선택** | ✅ 지원 | ❌ 단일만 |
| **고급 검색** | ✅ 지원 | ✅ 지원 (내부적으로) |
| **선택 결과** | 콜백 반환 후 닫힘 | TextField에 계속 표시 |
| **유효성 검사** | ❌ 없음 | ✅ required, error 지원 |
| **적합한 경우** | 일괄 작업, 다중 선택 | 폼 필드, 단일 선택 |

## 언제 어떤 컴포넌트를 사용할까?

### UserSearchDialog 사용 ✅

다음 경우에 UserSearchDialog를 **직접** 사용하세요:

#### 1. 다중 사용자 선택이 필요한 경우
```tsx
// ✅ 역할에 여러 사용자 할당
<Button onClick={() => setDialogOpen(true)}>
  Add Users to Role
</Button>

<UserSearchDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onSelectMultiple={(users) => {
    users.forEach(user => assignToRole(user.id));
  }}
  multiSelect={true}
  showAdvancedSearch={true}
  excludedUserIds={existingUserIds}
/>
```

#### 2. 버튼 트리거 일괄 작업
```tsx
// ✅ 메시지 수신자 선택
<Button onClick={openRecipientDialog}>
  Select Recipients
</Button>

<UserSearchDialog
  open={recipientDialogOpen}
  onClose={closeRecipientDialog}
  onSelectMultiple={setRecipients}
  multiSelect={true}
  locale="ko"
/>
```

#### 3. 화면 공간이 제한적인 경우
```tsx
// ✅ 팝업에서만 필요한 선택
<IconButton onClick={() => setSearchOpen(true)}>
  <AddIcon />
</IconButton>

<UserSearchDialog
  open={searchOpen}
  onClose={() => setSearchOpen(false)}
  onSelect={(user) => addToList(user)}
/>
```

### UserSelector 사용 ✅

다음 경우에 UserSelector를 사용하세요:

#### 1. 폼 필드로 사용
```tsx
// ✅ 작업 할당 폼
<form onSubmit={handleSubmit}>
  <TextField label="Title" />

  <UserSelector
    label="Assignee"
    value={assigneeId}
    onChange={(id, user) => setAssigneeId(id)}
    required
    error={!assigneeId && submitted}
    helperText="Select task assignee"
  />

  <Button type="submit">Create Task</Button>
</form>
```

#### 2. 단일 사용자 선택 (계속 표시)
```tsx
// ✅ 프로젝트 관리자 지정
<UserSelector
  label="Project Manager"
  value={managerId}
  onChange={(id, user) => {
    setManagerId(id);
    setManagerName(user?.name);
  }}
  showAdvancedSearch={true}
  locale="ko"
/>
```

#### 3. 유효성 검사가 필요한 경우
```tsx
// ✅ 필수 승인자 선택
<UserSelector
  label="Approver"
  value={approverId}
  onChange={setApproverId}
  required
  error={errors.approver}
  helperText={errors.approver ? "Approver is required" : ""}
/>
```

## 잘못된 사용 사례 ❌

### 안티패턴 1: 다중 선택에 UserSelector 사용

```tsx
// ❌ 잘못된 사용 - UserSelector는 다중 선택 불가
{users.map((user, index) => (
  <UserSelector
    key={index}
    label={`User ${index + 1}`}
    value={user}
    onChange={(id) => updateUser(index, id)}
  />
))}

// ✅ 올바른 사용 - UserSearchDialog로 다중 선택
<Button onClick={openDialog}>Select Multiple Users</Button>
<UserSearchDialog
  open={open}
  onSelectMultiple={setUsers}
  multiSelect={true}
/>
```

### 안티패턴 2: 폼 필드에 UserSearchDialog 직접 사용

```tsx
// ❌ 잘못된 사용 - Dialog는 폼 필드가 아님
<form>
  <TextField label="Title" />
  <Button onClick={() => setDialogOpen(true)}>
    Select User
  </Button>
  {/* 선택된 사용자를 어디에 표시? */}
</form>

// ✅ 올바른 사용 - UserSelector가 폼 필드 + 검색 통합
<form>
  <TextField label="Title" />
  <UserSelector
    label="Assignee"
    value={userId}
    onChange={setUserId}
  />
</form>
```

## 컴포넌트 관계

```
UserSelector (폼 필드)
  ├── TextField (선택된 사용자 표시)
  ├── Search IconButton (검색 트리거)
  └── UserSearchDialog (검색 인터페이스)
        ├── Quick Search (빠른 검색)
        ├── Advanced Search (고급 검색)
        └── User List (결과 목록)
```

**핵심**: UserSelector는 UserSearchDialog를 **내부적으로 사용**합니다.
- UserSelector = TextField + UserSearchDialog
- 두 컴포넌트는 **보완 관계**, 경쟁 관계 아님

## 혼합 사용 패턴

실제 화면에서는 두 컴포넌트를 **함께** 사용하는 것이 일반적입니다.

### 패턴 1: 팀 관리 화면

```tsx
function TeamManagement() {
  const [teamLeaderId, setTeamLeaderId] = useState<string | null>(null);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [addMembersOpen, setAddMembersOpen] = useState(false);

  return (
    <Box>
      {/* 팀장 선택 - 단일 선택, 폼 필드 */}
      <UserSelector
        label="Team Leader"
        value={teamLeaderId}
        onChange={setTeamLeaderId}
        required
      />

      {/* 팀원 목록 표시 */}
      <List>
        {members.map(member => (
          <ListItem key={member.id}>
            <ListItemText primary={member.name} />
          </ListItem>
        ))}
      </List>

      {/* 팀원 추가 - 다중 선택, 버튼 트리거 */}
      <Button onClick={() => setAddMembersOpen(true)}>
        Add Team Members
      </Button>

      <UserSearchDialog
        open={addMembersOpen}
        onClose={() => setAddMembersOpen(false)}
        onSelectMultiple={(users) => {
          setMemberIds([...memberIds, ...users.map(u => u.id)]);
        }}
        multiSelect={true}
        excludedUserIds={[teamLeaderId, ...memberIds].filter(Boolean)}
        showAdvancedSearch={true}
      />
    </Box>
  );
}
```

### 패턴 2: 작업 생성 폼

```tsx
function CreateTaskForm() {
  const [formData, setFormData] = useState({
    title: '',
    assigneeId: null,
    reviewerId: null
  });

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Task Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      {/* 담당자 - 폼 필드 */}
      <UserSelector
        label="Assignee"
        value={formData.assigneeId}
        onChange={(id) => setFormData({ ...formData, assigneeId: id })}
        required
      />

      {/* 검토자 - 폼 필드 */}
      <UserSelector
        label="Reviewer"
        value={formData.reviewerId}
        onChange={(id) => setFormData({ ...formData, reviewerId: id })}
      />

      <Button type="submit">Create Task</Button>
    </form>
  );
}
```

### 패턴 3: 권한 관리

```tsx
function PermissionManagement() {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

  return (
    <Box>
      {/* 단일 관리자 지정 */}
      <UserSelector
        label="Administrator"
        value={adminId}
        onChange={setAdminId}
        showAdvancedSearch={true}
      />

      {/* 여러 사용자에게 권한 일괄 부여 */}
      <Button onClick={() => setBulkAssignOpen(true)}>
        Grant Permissions to Multiple Users
      </Button>

      <UserSearchDialog
        open={bulkAssignOpen}
        onClose={() => setBulkAssignOpen(false)}
        onSelectMultiple={(users) => {
          users.forEach(user => grantPermission(user.id));
        }}
        multiSelect={true}
      />
    </Box>
  );
}
```

## 기능 비교 매트릭스

| 기능 | UserSearchDialog | UserSelector |
|------|------------------|--------------|
| 빠른 검색 | ✅ | ✅ (내부적으로) |
| 고급 검색 | ✅ | ✅ (prop 전달) |
| 다국어 지원 | ✅ | ✅ |
| 부서 표시 | ✅ | ✅ |
| 단일 선택 | ✅ | ✅ |
| 다중 선택 | ✅ | ❌ |
| 폼 필드로 사용 | ❌ | ✅ |
| required 속성 | ❌ | ✅ |
| error 상태 | ❌ | ✅ |
| helperText | ❌ | ✅ |
| disabled 상태 | ❌ | ✅ |
| 제외 사용자 | ✅ | ✅ (prop 전달) |
| 자동 로드 | ❌ | ✅ |

## 선택 가이드 플로우차트

```
사용자 선택이 필요한가?
  │
  ├─ 예 → 다중 선택인가?
  │       │
  │       ├─ 예 → UserSearchDialog 사용
  │       │
  │       └─ 아니오 → 폼 필드인가?
  │                  │
  │                  ├─ 예 → UserSelector 사용
  │                  │
  │                  └─ 아니오 → 버튼 트리거인가?
  │                             │
  │                             ├─ 예 → UserSearchDialog 사용
  │                             │
  │                             └─ 아니오 → UserSelector 사용 (기본)
```

## 빠른 참조

### UserSearchDialog
- **파일**: `src/components/common/UserSearchDialog/index.tsx`
- **용도**: 모달 팝업으로 사용자 검색/선택
- **키워드**: Dialog, Modal, Popup, Multiple, Bulk, Batch

### UserSelector
- **파일**: `src/components/common/UserSelector/index.tsx`
- **용도**: 폼 필드로 사용자 선택
- **키워드**: Form, Field, Input, Single, Required, Validation

## 결론

1. **두 컴포넌트는 서로 다른 역할**을 합니다
2. **UserSelector는 UserSearchDialog를 내부에서 사용**합니다
3. **통합할 필요 없음** - 각자의 사용 사례에 최적화되어 있음
4. **함께 사용**하는 것이 일반적입니다

사용 사례에 맞는 컴포넌트를 선택하면 됩니다!
