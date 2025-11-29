/**
 * Chapter 6: 상태 관리 패턴
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'state-patterns',
  order: 6,
  title: 'State Management Patterns',
  titleKo: '상태 관리 패턴',
  description: 'Learn effective state management patterns including lifting state, state structure design, and form state management.',
  descriptionKo: '상태 끌어올리기, 상태 구조 설계, 폼 상태 관리 등 효과적인 상태 관리 패턴을 학습합니다.',
  estimatedMinutes: 50,
  objectives: [
    'Master lifting state up pattern for sharing state between components',
    'Design effective and maintainable state structures',
    'Understand when to use derived state vs stored state',
    'Manage form state efficiently in CRUD applications'
  ],
  objectivesKo: [
    '컴포넌트 간 상태 공유를 위한 상태 끌어올리기 패턴을 마스터한다',
    '효과적이고 유지보수 가능한 상태 구조를 설계한다',
    '파생 상태와 저장된 상태의 사용 시점을 이해한다',
    'CRUD 애플리케이션에서 폼 상태를 효율적으로 관리한다'
  ],
  sections: [
    {
      id: 'lifting-state-up',
      title: 'Lifting State Up',
      titleKo: '상태 끌어올리기',
      content: `
## 상태 끌어올리기란?

**상태 끌어올리기(Lifting State Up)** 는 두 개 이상의 컴포넌트가 **같은 데이터를 공유**해야 할 때, 가장 가까운 **공통 부모 컴포넌트**로 상태를 올리는 패턴입니다.

### 왜 상태를 끌어올려야 하는가?

\`\`\`
문제: 형제 컴포넌트가 같은 데이터를 필요로 함

        Parent
       /      \\
   Child A    Child B
   [state]      ?

Child A의 state를 Child B가 직접 접근할 수 없음
→ 해결: state를 Parent로 끌어올림

        Parent
       [state]
       /      \\
   Child A    Child B
   (props)    (props)
\`\`\`

### 기본 패턴

\`\`\`tsx
// ❌ Before: 각 컴포넌트가 독립적인 상태
function SearchInput() {
  const [query, setQuery] = useState('');  // 검색어를 여기서 관리
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

function SearchResults() {
  // query에 접근할 수 없음!
  return <div>검색 결과...</div>;
}

// ✅ After: 부모로 상태 끌어올리기
function SearchPage() {
  const [query, setQuery] = useState('');  // 부모에서 관리

  return (
    <>
      <SearchInput query={query} onQueryChange={setQuery} />
      <SearchResults query={query} />
    </>
  );
}

function SearchInput({ query, onQueryChange }) {
  return (
    <input
      value={query}
      onChange={e => onQueryChange(e.target.value)}
    />
  );
}

function SearchResults({ query }) {
  const results = useSearch(query);  // query를 사용 가능!
  return <div>{results.map(r => ...)}</div>;
}
\`\`\`

### 상태 끌어올리기 결정 기준

| 상황 | 결정 |
|------|------|
| 한 컴포넌트만 사용 | 해당 컴포넌트에 유지 |
| 형제 컴포넌트가 공유 | 공통 부모로 끌어올림 |
| 먼 거리의 컴포넌트가 공유 | Context 또는 전역 상태 사용 |
| prop drilling이 3+ 레벨 | Context 사용 고려 |

### 끌어올릴 때 전달할 것들

1. **상태 값**: 현재 상태를 props로 전달
2. **업데이트 함수**: 상태를 변경할 콜백 함수 전달

\`\`\`tsx
// 부모: 상태와 업데이트 함수 모두 관리
function Parent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <List
        selectedId={selectedId}            {/* 상태 전달 */}
        onSelect={setSelectedId}           {/* 업데이트 함수 전달 */}
      />
      <Detail
        id={selectedId}                    {/* 상태 전달 */}
        onClose={() => setSelectedId(null)} {/* 업데이트 함수 전달 */}
      />
    </>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'lifting-state-board',
          title: '게시판 페이지 예제',
          description: '검색, 목록, 상세 컴포넌트 간 상태 공유',
          fileName: 'src/app/[locale]/boards/[boardTypeId]/page.tsx (개념)',
          language: 'tsx',
          code: `// 상태 끌어올리기 - 게시판 페이지 예제

// 페이지 컴포넌트가 상태를 관리하고 하위 컴포넌트에 전달
function BoardListPage({ boardTypeId }: { boardTypeId: string }) {
  // ⭐ 상태를 페이지 레벨에서 관리 (끌어올림)
  const [searchCriteria, setSearchCriteria] = useState({
    title: '',
    author_name: '',
    status: ''
  });
  const [quickSearch, setQuickSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20
  });
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // 검색 핸들러
  const handleSearchChange = (field: string, value: string) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickSearch = () => {
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    // fetch posts...
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  return (
    <div>
      {/* 검색 컴포넌트: 검색 상태와 핸들러 전달 */}
      <SearchToolbar
        quickSearch={quickSearch}
        onQuickSearchChange={setQuickSearch}
        onSearch={handleQuickSearch}
        searchCriteria={searchCriteria}
        onSearchChange={handleSearchChange}
      />

      {/* 목록 컴포넌트: 데이터와 선택 핸들러 전달 */}
      <PostList
        posts={posts}
        selectedId={selectedPostId}
        onPostClick={handlePostClick}
        paginationModel={paginationModel}
        onPaginationChange={setPaginationModel}
      />

      {/* 상세 컴포넌트: 선택된 ID 전달 */}
      {selectedPostId && (
        <PostDetail
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
}

// 하위 컴포넌트들은 props로 받은 상태를 사용
function SearchToolbar({
  quickSearch,
  onQuickSearchChange,
  onSearch,
  searchCriteria,
  onSearchChange
}: SearchToolbarProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        value={quickSearch}
        onChange={(e) => onQuickSearchChange(e.target.value)}
        placeholder="빠른 검색..."
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      />
      <Button onClick={onSearch}>검색</Button>

      {/* 상세 검색 */}
      <TextField
        label="제목"
        value={searchCriteria.title}
        onChange={(e) => onSearchChange('title', e.target.value)}
      />
      <TextField
        label="작성자"
        value={searchCriteria.author_name}
        onChange={(e) => onSearchChange('author_name', e.target.value)}
      />
    </Box>
  );
}

function PostList({
  posts,
  selectedId,
  onPostClick,
  paginationModel,
  onPaginationChange
}: PostListProps) {
  return (
    <DataGrid
      rows={posts}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationChange}
      onRowClick={(params) => onPostClick(params.row.id)}
      // 선택된 행 하이라이트
      getRowClassName={(params) =>
        params.row.id === selectedId ? 'selected-row' : ''
      }
    />
  );
}`
        },
        {
          id: 'lifting-state-form',
          title: '폼 컴포넌트 예제',
          description: '부모에서 폼 데이터 관리, 자식은 UI만 담당',
          fileName: 'src/components/admin/UserFormFields.tsx (개념)',
          language: 'tsx',
          code: `// 상태 끌어올리기 - 폼 예제

// ⭐ 부모: 폼 데이터 상태 관리
function UserEditDialog({ open, userId, onClose, onSave }: UserEditDialogProps) {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 사용자 데이터 로드
  useEffect(() => {
    if (userId && open) {
      loadUser(userId).then(setFormData);
    }
  }, [userId, open]);

  // 폼 데이터 변경 핸들러 (자식에게 전달)
  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
    // 해당 필드 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!formData) return;

    // 유효성 검사
    const validationErrors = validateUserForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: '저장 실패' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>사용자 편집</DialogTitle>
      <DialogContent>
        {/* ⭐ 자식 컴포넌트에 상태와 핸들러 전달 */}
        <UserFormFields
          user={formData}
          onChange={handleChange}
          errors={errors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ⭐ 자식: UI만 담당, 상태는 props로 받음
function UserFormFields({
  user,
  onChange,
  errors
}: UserFormFieldsProps) {
  if (!user) return null;

  // 로컬 핸들러 - 부모의 onChange를 호출
  const handleChange = (field: keyof UserFormData, value: string) => {
    onChange(field, value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="로그인 ID"
          fullWidth
          required
          value={user.loginid || ''}
          onChange={(e) => handleChange('loginid', e.target.value)}
          error={!!errors?.loginid}
          helperText={errors?.loginid}
          disabled={!!user.id}  // 수정 시 비활성화
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="이름 (한국어)"
          fullWidth
          required
          value={user.name_ko || ''}
          onChange={(e) => handleChange('name_ko', e.target.value)}
          error={!!errors?.name_ko}
          helperText={errors?.name_ko}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="이메일"
          type="email"
          fullWidth
          required
          value={user.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          error={!!errors?.email}
          helperText={errors?.email}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <CodeSelect
          codeType="USER_ROLE"
          value={user.role || 'user'}
          onChange={(value) => handleChange('role', value)}
          label="역할"
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <CodeSelect
          codeType="COMMON_STATUS"
          value={user.status || 'active'}
          onChange={(value) => handleChange('status', value)}
          label="상태"
          required
        />
      </Grid>
    </Grid>
  );
}

// 💡 장점:
// 1. UserFormFields는 재사용 가능 (다른 곳에서도 사용)
// 2. 유효성 검사 로직이 한 곳에 집중
// 3. 부모가 폼 데이터의 전체 흐름을 제어
// 4. 테스트가 쉬움 (부모: 로직 테스트, 자식: UI 테스트)`
        }
      ],
      tips: [
        '✅ 두 컴포넌트가 같은 데이터를 필요로 하면 가장 가까운 공통 부모로 상태를 끌어올리세요.',
        '✅ 상태와 함께 업데이트 함수(핸들러)도 props로 전달하세요.',
        '⚠️ prop drilling이 3레벨 이상이면 Context 사용을 고려하세요.',
        'ℹ️ 끌어올린 후 자식 컴포넌트는 "제어 컴포넌트(Controlled Component)"가 됩니다.'
      ]
    },
    {
      id: 'state-structure',
      title: 'State Structure Design',
      titleKo: '상태 구조 설계 원칙',
      content: `
## 효과적인 상태 구조 설계

상태 구조를 잘 설계하면 버그가 줄고, 코드가 간결해지며, 유지보수가 쉬워집니다.

### 상태 설계 원칙

| 원칙 | 설명 |
|------|------|
| **단일 진실 공급원** | 같은 데이터를 여러 곳에 중복 저장하지 않음 |
| **최소 상태** | 꼭 필요한 것만 상태로 저장 |
| **불변성** | 상태를 직접 변경하지 않고 새 객체로 교체 |
| **정규화** | 중첩된 객체보다 평평한 구조 선호 |
| **관련성 기준 그룹화** | 함께 변경되는 상태를 묶음 |

### 1. 그룹화 vs 분리

\`\`\`tsx
// ❌ 나쁨: 관련 없는 상태를 하나로 묶음
const [state, setState] = useState({
  user: { name: '', email: '' },
  posts: [],
  searchQuery: '',
  isMenuOpen: false
});

// ✅ 좋음: 관련된 것끼리 분리
const [user, setUser] = useState({ name: '', email: '' });
const [posts, setPosts] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [isMenuOpen, setIsMenuOpen] = useState(false);

// ✅ 또는: 함께 변경되는 것끼리 그룹화
const [searchCriteria, setSearchCriteria] = useState({
  query: '',
  category: '',
  sortBy: 'date'
});  // 검색 시 함께 사용되는 값들

const [pagination, setPagination] = useState({
  page: 0,
  pageSize: 20
});  // 페이지네이션 관련
\`\`\`

### 2. 중복 제거

\`\`\`tsx
// ❌ 나쁨: 같은 정보가 두 곳에
const [items, setItems] = useState([...]);
const [selectedItemId, setSelectedItemId] = useState('1');
const [selectedItem, setSelectedItem] = useState(items[0]);  // 중복!

// ✅ 좋음: ID만 저장하고 파생
const [items, setItems] = useState([...]);
const [selectedItemId, setSelectedItemId] = useState('1');
const selectedItem = items.find(item => item.id === selectedItemId);  // 파생
\`\`\`

### 3. 정규화 (Normalization)

\`\`\`tsx
// ❌ 나쁨: 깊게 중첩된 구조
const [posts, setPosts] = useState([
  {
    id: '1',
    title: 'Post 1',
    author: {
      id: 'u1',
      name: 'John',
      // 같은 author가 여러 post에 중복됨
    },
    comments: [
      {
        id: 'c1',
        text: 'Nice!',
        author: { id: 'u2', name: 'Jane' }
      }
    ]
  }
]);

// author 이름 수정 시: 모든 post의 author를 찾아서 수정해야 함

// ✅ 좋음: 정규화된 평평한 구조
const [posts, setPosts] = useState({
  'p1': { id: 'p1', title: 'Post 1', authorId: 'u1', commentIds: ['c1'] },
  'p2': { id: 'p2', title: 'Post 2', authorId: 'u1', commentIds: [] }
});

const [users, setUsers] = useState({
  'u1': { id: 'u1', name: 'John' },
  'u2': { id: 'u2', name: 'Jane' }
});

const [comments, setComments] = useState({
  'c1': { id: 'c1', text: 'Nice!', authorId: 'u2' }
});

// author 이름 수정: 한 곳만 수정
setUsers(prev => ({
  ...prev,
  'u1': { ...prev['u1'], name: 'John Doe' }
}));
\`\`\`

### 4. 불변성 유지

\`\`\`tsx
// ❌ 나쁨: 직접 변경 (mutation)
const handleAddItem = (newItem) => {
  items.push(newItem);  // 기존 배열 변경
  setItems(items);      // React가 변경 감지 못함
};

// ✅ 좋음: 새 배열 생성 (immutable)
const handleAddItem = (newItem) => {
  setItems([...items, newItem]);  // 새 배열 생성
};

const handleUpdateItem = (id, updates) => {
  setItems(items.map(item =>
    item.id === id
      ? { ...item, ...updates }  // 새 객체 생성
      : item
  ));
};

const handleRemoveItem = (id) => {
  setItems(items.filter(item => item.id !== id));  // 새 배열 생성
};
\`\`\`
      `,
      codeExamples: [
        {
          id: 'state-structure-admin',
          title: 'Admin CRUD 페이지 상태 구조',
          description: 'usePageState와 함께 사용하는 구조화된 상태',
          fileName: 'src/app/[locale]/admin/users/hooks/useUserManagement.ts (구조)',
          language: 'tsx',
          code: `// Admin CRUD 페이지의 상태 구조 설계

// ═══════════════════════════════════════════
// 1. 상태 타입 정의
// ═══════════════════════════════════════════

// 검색 조건 - 관련된 필드끼리 그룹화
interface SearchCriteria {
  loginid: string;
  name_ko: string;
  name_en: string;
  email: string;
  employee_number: string;
  phone_number: string;
  mobile_number: string;
  user_category: string;
  position: string;
  role: string;
  department: string;
  status: string;
}

// 페이지네이션 - 함께 변경되는 값
interface PaginationModel {
  page: number;
  pageSize: number;
}

// 사용자 데이터 타입
interface User {
  id: string;
  loginid: string;
  name_ko: string;
  name_en?: string;
  email: string;
  // ... 기타 필드
}

// ═══════════════════════════════════════════
// 2. 상태 구조
// ═══════════════════════════════════════════

export const useUserManagement = (options = {}) => {
  const { storageKey = 'admin-users-page-state' } = options;

  // 📌 그룹 1: 페이지 상태 (usePageState 훅으로 관리)
  // - 함께 변경되고, 세션에 저장되어야 하는 값들
  const {
    searchCriteria,       // 검색 조건 객체
    setSearchCriteria,
    paginationModel,      // 페이지네이션 객체
    setPaginationModel,
    quickSearch,          // 빠른 검색어
    setQuickSearch,
    data: users,          // 사용자 목록
    setData: setUsers,
    rowCount,             // 총 행 수
    setRowCount
  } = usePageState<SearchCriteria, User>({
    storageKey,
    initialCriteria: {
      loginid: '',
      name_ko: '',
      name_en: '',
      email: '',
      employee_number: '',
      phone_number: '',
      mobile_number: '',
      user_category: '',
      position: '',
      role: '',
      department: '',
      status: ''
    },
    initialPaginationModel: {
      page: 0,
      pageSize: 50
    }
  });

  // 📌 그룹 2: UI 상태 (일시적, 세션 저장 불필요)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

  // 📌 그룹 3: 로딩/프로세스 상태
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 📌 그룹 4: 삭제 확인 다이얼로그 상태
  // - 함께 사용되는 관련 값들
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);

  // 📌 그룹 5: 비밀번호 재설정 다이얼로그 상태
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // 📌 그룹 6: 참조 데이터 (드롭다운용)
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);

  // 📌 그룹 7: 메시지 상태 (useMessage 훅으로 관리)
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale });

  // ═══════════════════════════════════════════
  // 3. 파생 상태 (계산으로 얻음, 저장 안 함)
  // ═══════════════════════════════════════════

  // ✅ 저장하지 않고 계산으로 파생
  const hasActiveFilters = useMemo(() => {
    return Object.values(searchCriteria).some(v => v !== '');
  }, [searchCriteria]);

  const activeFilterCount = useMemo(() => {
    return Object.values(searchCriteria).filter(v => v !== '').length;
  }, [searchCriteria]);

  const isEditMode = editingUser?.id !== undefined && editingUser?.id !== '';

  // ═══════════════════════════════════════════
  // 4. 상태 업데이트 패턴
  // ═══════════════════════════════════════════

  // 검색 조건 업데이트 - 불변성 유지
  const handleSearchChange = useCallback((
    field: keyof SearchCriteria,
    value: string
  ) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  // 사용자 저장 후 목록 업데이트 - 불변성 유지
  const handleSaveSuccess = useCallback((savedUser: User) => {
    if (isEditMode) {
      // 수정: 해당 항목만 교체
      setUsers(prev => prev.map(u =>
        u.id === savedUser.id ? savedUser : u
      ));
    } else {
      // 추가: 새 배열 생성
      setUsers(prev => [...prev, savedUser]);
    }
  }, [isEditMode, setUsers]);

  // 삭제 후 목록 업데이트 - 불변성 유지
  const handleDeleteSuccess = useCallback((deletedIds: string[]) => {
    setUsers(prev => prev.filter(u => !deletedIds.includes(u.id)));
    setSelectedForDelete([]);
    setDeleteConfirmOpen(false);
  }, [setUsers]);

  return {
    // 상태
    users,
    searchCriteria,
    paginationModel,
    quickSearch,
    // ... 기타 상태

    // 파생 상태
    hasActiveFilters,
    activeFilterCount,
    isEditMode,

    // 핸들러
    handleSearchChange,
    handleSaveSuccess,
    handleDeleteSuccess,
    // ... 기타 핸들러
  };
};`
        },
        {
          id: 'state-grouping-pattern',
          title: '상태 그룹화 패턴',
          description: '관련 상태를 논리적으로 그룹화',
          language: 'tsx',
          code: `// 상태 그룹화 패턴

// ═══════════════════════════════════════════
// 패턴 1: 단일 책임 원칙에 따른 분리
// ═══════════════════════════════════════════

// ❌ 나쁨: 모든 상태가 하나의 거대한 객체
const [state, setState] = useState({
  users: [],
  selectedUserId: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  page: 0,
  pageSize: 20,
  totalCount: 0,
  isDialogOpen: false,
  editingUser: null,
  // ... 20개 이상의 속성
});

// ✅ 좋음: 책임에 따라 분리
// 데이터 상태
const [users, setUsers] = useState<User[]>([]);
const [totalCount, setTotalCount] = useState(0);

// UI 상태
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [editingUser, setEditingUser] = useState<User | null>(null);

// 검색/필터 상태
const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
  query: '',
  status: '',
  role: ''
});
const [pagination, setPagination] = useState({ page: 0, pageSize: 20 });

// 프로세스 상태
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

// ═══════════════════════════════════════════
// 패턴 2: 커스텀 훅으로 관련 상태 캡슐화
// ═══════════════════════════════════════════

// useDialog: 다이얼로그 관련 상태와 로직
function useDialog<T>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((initialData?: T) => {
    setData(initialData ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close, setData };
}

// useSelection: 선택 관련 상태와 로직
function useSelection<T extends { id: string }>() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const select = useCallback((id: string) => {
    setSelectedIds(prev => [...prev, id]);
  }, []);

  const deselect = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(items.map(i => i.id));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    select,
    deselect,
    toggle,
    selectAll,
    clear,
    isSelected: (id: string) => selectedIds.includes(id),
    selectedCount: selectedIds.length
  };
}

// 사용 예시
function UserListPage() {
  // 관련 상태가 캡슐화됨
  const editDialog = useDialog<User>();
  const deleteDialog = useDialog<User[]>();
  const selection = useSelection<User>();

  return (
    <>
      <DataGrid
        checkboxSelection
        onSelectionModelChange={(ids) =>
          selection.setSelectedIds(ids as string[])
        }
        selectionModel={selection.selectedIds}
      />

      <Button
        onClick={() => editDialog.open()}
        disabled={selection.selectedCount !== 1}
      >
        Edit
      </Button>

      <Button
        onClick={() => deleteDialog.open(
          users.filter(u => selection.selectedIds.includes(u.id))
        )}
        disabled={selection.selectedCount === 0}
      >
        Delete ({selection.selectedCount})
      </Button>

      <UserEditDialog
        open={editDialog.isOpen}
        user={editDialog.data}
        onClose={editDialog.close}
      />

      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        items={deleteDialog.data}
        onClose={deleteDialog.close}
      />
    </>
  );
}`
        }
      ],
      tips: [
        '✅ 함께 변경되는 상태는 그룹화하고, 독립적인 상태는 분리하세요.',
        '✅ 중복된 데이터를 저장하지 마세요. 파생 상태로 계산하세요.',
        '✅ 배열/객체 업데이트 시 항상 새 참조를 생성하세요 (불변성).',
        '⚠️ 상태가 너무 많으면 커스텀 훅으로 분리를 고려하세요.'
      ]
    },
    {
      id: 'derived-vs-stored',
      title: 'Derived State vs Stored State',
      titleKo: '파생 상태 vs 저장된 상태',
      content: `
## 파생 상태란?

**파생 상태(Derived State)** 는 다른 상태로부터 **계산**해서 얻는 값입니다. useState로 저장하지 않고, 렌더링 시마다 계산합니다.

### 저장 vs 파생 결정 기준

| 기준 | 저장 (useState) | 파생 (계산) |
|------|-----------------|-------------|
| **원본 데이터** | ✅ 사용자 입력, API 응답 | ❌ |
| **다른 상태에서 유도 가능** | ❌ | ✅ 필터링, 정렬, 개수 |
| **동기화 필요** | ❌ 버그 위험 | ✅ 항상 최신 |
| **계산 비용** | 높으면 고려 | 낮으면 OK |

### 파생 상태 예시

\`\`\`tsx
// ❌ 나쁨: 중복 저장 (동기화 문제 발생)
const [items, setItems] = useState([...]);
const [filteredItems, setFilteredItems] = useState([...]);
const [itemCount, setItemCount] = useState(0);

// items가 변경되면 filteredItems, itemCount도 수동으로 업데이트해야 함
// → 버그 발생 가능

// ✅ 좋음: 파생 상태 사용
const [items, setItems] = useState([...]);
const [filter, setFilter] = useState('');

// 파생: 매 렌더링마다 자동 계산
const filteredItems = items.filter(item =>
  item.name.includes(filter)
);
const itemCount = items.length;
const filteredCount = filteredItems.length;
const hasItems = items.length > 0;
\`\`\`

### useMemo로 최적화

계산 비용이 높은 파생 상태는 \`useMemo\`로 메모이제이션합니다:

\`\`\`tsx
// 간단한 계산: 그냥 계산
const isEmpty = items.length === 0;
const hasSelection = selectedIds.length > 0;

// 복잡한 계산: useMemo 사용
const filteredItems = useMemo(() => {
  return items.filter(item => {
    if (filter.name && !item.name.includes(filter.name)) return false;
    if (filter.status && item.status !== filter.status) return false;
    if (filter.category && item.category !== filter.category) return false;
    return true;
  });
}, [items, filter]);

const sortedItems = useMemo(() => {
  return [...filteredItems].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}, [filteredItems, sortField, sortOrder]);

const statistics = useMemo(() => {
  return {
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    totalValue: items.reduce((sum, i) => sum + i.value, 0),
    averageValue: items.length > 0
      ? items.reduce((sum, i) => sum + i.value, 0) / items.length
      : 0
  };
}, [items]);
\`\`\`

### 흔한 파생 상태 패턴

\`\`\`tsx
// 1. 선택된 항목 찾기
const selectedItem = items.find(item => item.id === selectedId);

// 2. 필터 활성화 여부
const hasActiveFilters = Object.values(searchCriteria).some(v => v !== '');

// 3. 활성 필터 개수
const activeFilterCount = Object.values(searchCriteria)
  .filter(v => v !== '').length;

// 4. 편집 모드 여부
const isEditMode = editingItem?.id != null;

// 5. 폼 유효성
const isFormValid = formData.name !== '' && formData.email !== '';

// 6. 로딩 상태 통합
const isLoading = fetchLoading || saveLoading || deleteLoading;

// 7. 페이지 정보
const totalPages = Math.ceil(totalCount / pageSize);
const startIndex = page * pageSize;
const endIndex = Math.min(startIndex + pageSize, totalCount);
\`\`\`
      `,
      codeExamples: [
        {
          id: 'derived-state-examples',
          title: '파생 상태 활용 예제',
          description: '실제 프로젝트에서 사용하는 파생 상태 패턴',
          fileName: '다양한 소스 파일에서',
          language: 'tsx',
          code: `// 파생 상태 활용 예제

// ═══════════════════════════════════════════
// 예제 1: 게시판 관리 - useBoardManagement
// ═══════════════════════════════════════════

function useBoardManagement(options) {
  // 저장된 상태 (원본)
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    title: '',
    author_name: '',
    status: '',
    is_pinned: ''
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20
  });
  const [rowCount, setRowCount] = useState(0);

  // ⭐ 파생 상태: 계산으로 얻음

  // 빠른 검색 활성 여부
  const isQuickSearchActive = quickSearch.trim() !== '';

  // 상세 필터 활성 여부
  const hasAdvancedFilters = useMemo(() => {
    return Object.values(searchCriteria).some(v => v !== '');
  }, [searchCriteria]);

  // 활성 필터 개수 (UI 배지에 표시)
  const activeFilterCount = useMemo(() => {
    return Object.entries(searchCriteria)
      .filter(([_, value]) => value !== '')
      .length;
  }, [searchCriteria]);

  // 총 페이지 수
  const totalPages = Math.ceil(rowCount / paginationModel.pageSize);

  // 현재 페이지 범위 (예: "1-20 of 150")
  const pageRange = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize + 1;
    const end = Math.min(
      (paginationModel.page + 1) * paginationModel.pageSize,
      rowCount
    );
    return { start, end, total: rowCount };
  }, [paginationModel, rowCount]);

  // 고정 글과 일반 글 분리
  const { pinnedPosts, normalPosts } = useMemo(() => {
    return {
      pinnedPosts: posts.filter(p => p.is_pinned),
      normalPosts: posts.filter(p => !p.is_pinned)
    };
  }, [posts]);

  return {
    // 저장된 상태
    posts,
    searchCriteria,
    paginationModel,
    rowCount,

    // 파생 상태
    isQuickSearchActive,
    hasAdvancedFilters,
    activeFilterCount,
    totalPages,
    pageRange,
    pinnedPosts,
    normalPosts
  };
}

// ═══════════════════════════════════════════
// 예제 2: 사용자 관리 - useUserManagement
// ═══════════════════════════════════════════

function useUserManagement() {
  // 저장된 상태
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // ⭐ 파생 상태

  // 편집 모드 여부 (새로 추가 vs 수정)
  const isEditMode = editingUser?.id !== undefined && editingUser?.id !== '';

  // 선택된 사용자들 정보
  const selectedUsers = useMemo(() => {
    return users.filter(u => selectedForDelete.includes(u.id));
  }, [users, selectedForDelete]);

  // 삭제 가능 여부 (관리자는 삭제 불가 등)
  const canDeleteSelected = useMemo(() => {
    return selectedUsers.every(u => u.role !== 'admin');
  }, [selectedUsers]);

  // 통합 로딩 상태
  const isLoading = fetchLoading || saveLoading || deleteLoading;

  // 다이얼로그 제목 (편집 모드에 따라)
  const dialogTitle = isEditMode ? 'Edit User' : 'Add New User';

  return {
    // 저장된 상태
    users,
    editingUser,
    selectedForDelete,

    // 파생 상태
    isEditMode,
    selectedUsers,
    canDeleteSelected,
    isLoading,
    dialogTitle
  };
}

// ═══════════════════════════════════════════
// 예제 3: 폼 상태
// ═══════════════════════════════════════════

function useUserForm(initialData?: User) {
  // 저장된 상태: 폼 필드 값
  const [formData, setFormData] = useState<UserFormData>({
    loginid: initialData?.loginid || '',
    name_ko: initialData?.name_ko || '',
    name_en: initialData?.name_en || '',
    email: initialData?.email || '',
    role: initialData?.role || 'user',
    status: initialData?.status || 'active'
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ⭐ 파생 상태: 유효성 검사 결과

  // 필드별 에러 메시지
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!formData.loginid) {
      errs.loginid = '로그인 ID는 필수입니다';
    } else if (formData.loginid.length < 4) {
      errs.loginid = '로그인 ID는 4자 이상이어야 합니다';
    }

    if (!formData.name_ko) {
      errs.name_ko = '이름은 필수입니다';
    }

    if (!formData.email) {
      errs.email = '이메일은 필수입니다';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      errs.email = '유효한 이메일 형식이 아닙니다';
    }

    return errs;
  }, [formData]);

  // 폼 전체 유효성
  const isValid = Object.keys(errors).length === 0;

  // 터치된 필드의 에러만 표시
  const visibleErrors = useMemo(() => {
    const visible: Record<string, string> = {};
    Object.keys(errors).forEach(key => {
      if (touched[key]) {
        visible[key] = errors[key];
      }
    });
    return visible;
  }, [errors, touched]);

  // 변경 여부 (초기값과 비교)
  const isDirty = useMemo(() => {
    if (!initialData) return true;
    return Object.keys(formData).some(
      key => formData[key] !== initialData[key]
    );
  }, [formData, initialData]);

  // 저장 가능 여부
  const canSubmit = isValid && isDirty;

  return {
    formData,
    setFormData,
    touched,
    setTouched,

    // 파생 상태
    errors,
    visibleErrors,
    isValid,
    isDirty,
    canSubmit
  };
}`
        },
        {
          id: 'anti-pattern-duplicated-state',
          title: '안티패턴: 중복 저장',
          description: '파생 상태를 저장할 때 발생하는 문제',
          language: 'tsx',
          code: `// 안티패턴: 파생 상태를 별도로 저장

// ❌ 문제가 있는 코드
function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ⚠️ 안티패턴: 파생 상태를 별도로 저장
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);

  // 문제 1: 동기화 로직이 필요
  useEffect(() => {
    const filtered = users.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
    setUserCount(users.length);
    setActiveUserCount(users.filter(u => u.status === 'active').length);
  }, [users, searchQuery]);

  // 문제 2: 순간적으로 불일치 상태 발생
  // users가 변경된 후 useEffect가 실행되기 전까지
  // filteredUsers, userCount, activeUserCount는 이전 값을 가짐

  // 문제 3: 불필요한 리렌더링
  // users가 변경되면 -> 리렌더 -> useEffect 실행 ->
  // filteredUsers, userCount, activeUserCount 변경 -> 또 리렌더

  const handleAddUser = (newUser: User) => {
    setUsers([...users, newUser]);
    // 문제 4: 다른 상태들은 useEffect가 업데이트할 때까지 오래된 값
  };

  return (
    <div>
      {/* 순간적으로 잘못된 값이 표시될 수 있음 */}
      <p>Total: {userCount}</p>
      <p>Active: {activeUserCount}</p>
      <p>Showing: {filteredUsers.length}</p>
    </div>
  );
}

// ✅ 올바른 코드: 파생 상태 사용
function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 파생 상태: 항상 최신값, 동기화 문제 없음
  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [users, searchQuery]
  );

  const userCount = users.length;  // 간단한 계산은 useMemo 불필요
  const activeUserCount = useMemo(() =>
    users.filter(u => u.status === 'active').length,
    [users]
  );

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    // 다음 렌더에서 모든 파생 상태가 자동으로 최신화됨
  };

  return (
    <div>
      {/* 항상 정확한 값 */}
      <p>Total: {userCount}</p>
      <p>Active: {activeUserCount}</p>
      <p>Showing: {filteredUsers.length}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// 규칙: 언제 useState vs useMemo/계산을 사용할까?
// ═══════════════════════════════════════════

// ✅ useState 사용:
// - 사용자 입력 값
// - API에서 받은 원본 데이터
// - UI 상태 (열림/닫힘, 선택됨 등)

// ✅ 계산/useMemo 사용:
// - 기존 상태에서 파생 가능한 모든 것
// - 필터링, 정렬, 검색 결과
// - 개수, 합계, 평균 등 집계값
// - 유효성 검사 결과
// - 조건부 플래그 (isEmpty, isValid, isEditMode 등)`
        }
      ],
      tips: [
        '✅ "이 값이 다른 상태에서 계산 가능한가?"를 먼저 확인하세요.',
        '✅ 파생 가능하면 useState 대신 계산으로 처리하세요.',
        '✅ 계산 비용이 높으면 useMemo로 최적화하세요.',
        '⚠️ useState + useEffect로 동기화하는 것은 안티패턴입니다.'
      ]
    },
    {
      id: 'form-state-management',
      title: 'Form State Management',
      titleKo: '폼 상태 관리',
      content: `
## 폼 상태 관리 전략

폼은 여러 입력 필드, 유효성 검사, 제출 상태 등 복잡한 상태를 가집니다.

### 기본 폼 상태 구조

\`\`\`tsx
// 폼 상태의 구성 요소
interface FormState<T> {
  // 1. 데이터 값
  values: T;

  // 2. 유효성 검사 에러
  errors: Partial<Record<keyof T, string>>;

  // 3. 터치된 필드 (blur 후)
  touched: Partial<Record<keyof T, boolean>>;

  // 4. 제출 상태
  isSubmitting: boolean;
  submitCount: number;

  // 5. 변경 여부
  isDirty: boolean;
}
\`\`\`

### 제어 컴포넌트 패턴

React에서 폼은 보통 **제어 컴포넌트(Controlled Component)** 패턴을 사용합니다:

\`\`\`tsx
// 제어 컴포넌트: React 상태가 "단일 진실 공급원"
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}                         // 상태 → DOM
      onChange={(e) => setValue(e.target.value)}  // DOM → 상태
    />
  );
}

// 비제어 컴포넌트: DOM이 값을 관리 (ref 사용)
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    console.log(inputRef.current?.value);
  };

  return <input ref={inputRef} />;
}
\`\`\`

### 폼 상태 관리 접근법

| 접근법 | 장점 | 단점 | 적합한 경우 |
|--------|------|------|------------|
| **useState 직접** | 단순, 의존성 없음 | 보일러플레이트 | 간단한 폼 |
| **커스텀 훅** | 로직 재사용 | 직접 구현 필요 | 중간 복잡도 |
| **라이브러리** | 기능 풍부 | 번들 크기, 학습 | 복잡한 폼 |

### useState로 직접 관리

\`\`\`tsx
function SimpleForm() {
  // 폼 값
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // 에러
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 필드 변경 핸들러
  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // 입력 시 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 유효성 검사
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일은 필수입니다';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitForm(formData);
    } catch (error) {
      setErrors({ submit: '제출 실패' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="이름"
        value={formData.name}
        onChange={handleChange('name')}
        error={!!errors.name}
        helperText={errors.name}
      />
      {/* ... */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '제출 중...' : '제출'}
      </Button>
    </form>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'form-state-pattern',
          title: '실제 프로젝트 폼 패턴',
          description: 'UserFormFields의 상태 관리 방식',
          fileName: 'src/components/admin/UserFormFields.tsx',
          language: 'tsx',
          code: `// 폼 상태 관리 패턴 - UserFormFields

// ═══════════════════════════════════════════
// 패턴 1: 부모가 상태 관리, 자식은 UI만
// ═══════════════════════════════════════════

// 폼 데이터 타입 정의
export interface UserFormData {
  id?: string;
  loginid: string;
  name_ko: string;
  name_en?: string;
  email: string;
  employee_number?: string;
  phone_number?: string;
  mobile_number?: string;
  user_category?: string;
  position?: string;
  role: string;
  department: string;
  status: string;
  password?: string;
  avatar_image?: string;
}

// Props: 상태와 핸들러를 받음
export interface UserFormFieldsProps {
  user: UserFormData | null;
  onChange: (user: UserFormData) => void;
  onError?: (error: string) => void;
  departments?: Department[];
  locale?: string;
  errors?: Record<string, string>;  // 유효성 검사 에러
}

// ⭐ 자식 컴포넌트: UI만 담당
export default function UserFormFields({
  user,
  onChange,
  onError,
  departments = [],
  locale = 'en',
  errors = {}
}: UserFormFieldsProps) {
  if (!user) return null;

  // 로컬 변경 핸들러: 부모의 onChange 호출
  const handleChange = (field: keyof UserFormData, value: string) => {
    onChange({ ...user, [field]: value });
  };

  return (
    <>
      <Grid container spacing={2}>
        {/* Login ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Login ID"
            fullWidth
            required
            value={user.loginid || ''}
            onChange={(e) => handleChange('loginid', e.target.value)}
            disabled={!!user.id}  // 수정 시 비활성화
            error={!!errors.loginid}
            helperText={errors.loginid || (user.id ? 'Cannot be changed' : '')}
          />
        </Grid>

        {/* Korean Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name (Korean)"
            fullWidth
            required
            value={user.name_ko || ''}
            onChange={(e) => handleChange('name_ko', e.target.value)}
            error={!!errors.name_ko}
            helperText={errors.name_ko}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={user.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>

        {/* Role - CodeSelect 사용 */}
        <Grid item xs={12} sm={6}>
          <CodeSelect
            codeType="USER_ROLE"
            value={user.role || 'user'}
            onChange={(value) => handleChange('role', value)}
            label="Role"
            required
            error={!!errors.role}
            helperText={errors.role}
          />
        </Grid>

        {/* Department - Tree Select 사용 */}
        <Grid item xs={12} sm={6}>
          <DepartmentTreeSelect
            value={user.department || ''}
            onChange={(value) => handleChange('department', value)}
            departments={departments}
            locale={locale}
            label="Department"
            error={!!errors.department}
            helperText={errors.department}
          />
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6}>
          <CodeSelect
            codeType="COMMON_STATUS"
            value={user.status || 'active'}
            onChange={(value) => handleChange('status', value)}
            label="Status"
            required
          />
        </Grid>
      </Grid>
    </>
  );
}

// ═══════════════════════════════════════════
// 패턴 2: 부모에서 상태 관리와 유효성 검사
// ═══════════════════════════════════════════

function UserEditDialog({ userId, onClose, onSaved }) {
  // 폼 상태
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 사용자 데이터 로드
  useEffect(() => {
    if (userId) {
      setLoading(true);
      api.get(\`/user/\${userId}\`)
        .then(res => setFormData(res.user))
        .finally(() => setLoading(false));
    } else {
      // 새로 추가: 기본값으로 초기화
      setFormData({
        loginid: '',
        name_ko: '',
        email: '',
        role: 'user',
        department: '',
        status: 'active'
      });
    }
  }, [userId]);

  // 유효성 검사
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData) return false;

    if (!formData.loginid?.trim()) {
      newErrors.loginid = 'Login ID is required';
    } else if (formData.loginid.length < 4) {
      newErrors.loginid = 'Login ID must be at least 4 characters';
    }

    if (!formData.name_ko?.trim()) {
      newErrors.name_ko = 'Name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 폼 변경 핸들러
  const handleChange = useCallback((updatedData: UserFormData) => {
    setFormData(updatedData);
    // 변경된 필드의 에러 클리어
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updatedData).forEach(key => {
        if (newErrors[key]) delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!validate() || !formData) return;

    setSaving(true);
    try {
      if (userId) {
        await api.put(\`/user/\${userId}\`, formData);
      } else {
        await api.post('/user', formData);
      }
      onSaved();
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to save user' });
    } finally {
      setSaving(false);
    }
  }, [formData, userId, validate, onSaved, onClose]);

  // 파생 상태
  const isEditMode = !!userId;
  const dialogTitle = isEditMode ? 'Edit User' : 'Add New User';

  if (loading) return <CircularProgress />;

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {/* 폼 컴포넌트에 상태와 핸들러 전달 */}
        <UserFormFields
          user={formData}
          onChange={handleChange}
          errors={errors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}`
        },
        {
          id: 'form-validation-pattern',
          title: '폼 유효성 검사 패턴',
          description: '다양한 유효성 검사 접근법',
          language: 'tsx',
          code: `// 폼 유효성 검사 패턴

// ═══════════════════════════════════════════
// 패턴 1: 즉시 검사 (onChange)
// ═══════════════════════════════════════════

function InstantValidation() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // 입력할 때마다 검사
    if (value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
      setError('Invalid email format');
    } else {
      setError('');
    }
  };

  return (
    <TextField
      value={email}
      onChange={handleChange}
      error={!!error}
      helperText={error}
    />
  );
}

// ═══════════════════════════════════════════
// 패턴 2: 포커스 해제 시 검사 (onBlur)
// ═══════════════════════════════════════════

function BlurValidation() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validate = (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return '';
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(email));
  };

  return (
    <TextField
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        // 이미 터치된 후에는 즉시 검사
        if (touched) {
          setError(validate(e.target.value));
        }
      }}
      onBlur={handleBlur}
      error={touched && !!error}
      helperText={touched ? error : ''}
    />
  );
}

// ═══════════════════════════════════════════
// 패턴 3: 제출 시 검사 (onSubmit)
// ═══════════════════════════════════════════

function SubmitValidation() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // 제출 로직
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        value={formData.name}
        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        value={formData.email}
        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
        error={!!errors.email}
        helperText={errors.email}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

// ═══════════════════════════════════════════
// 패턴 4: 파생 상태로 유효성 관리
// ═══════════════════════════════════════════

function DerivedValidation() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ⭐ 파생 상태: 에러 계산
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      errs.email = 'Invalid email format';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  }, [formData]);

  // 터치된 필드의 에러만
  const visibleErrors = useMemo(() => {
    const visible: Record<string, string> = {};
    Object.keys(errors).forEach(key => {
      if (touched[key]) {
        visible[key] = errors[key];
      }
    });
    return visible;
  }, [errors, touched]);

  // 전체 유효성
  const isValid = Object.keys(errors).length === 0;

  // 모든 필드 터치 여부
  const allTouched = ['name', 'email', 'password', 'confirmPassword']
    .every(f => touched[f]);

  // 제출 가능 여부
  const canSubmit = isValid;

  const handleBlur = (field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필드 터치 처리
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (isValid) {
      // 제출
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Name"
        value={formData.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={!!visibleErrors.name}
        helperText={visibleErrors.name}
      />
      {/* ... 다른 필드들 ... */}
      <Button type="submit" disabled={!canSubmit}>
        Submit
      </Button>
    </form>
  );
}`
        }
      ],
      tips: [
        '✅ 간단한 폼은 useState로, 복잡한 폼은 커스텀 훅이나 라이브러리를 사용하세요.',
        '✅ 유효성 검사 결과는 파생 상태로 계산하면 항상 최신 상태입니다.',
        '✅ touched 상태를 추적하여 사용자 경험을 개선하세요 (blur 후에만 에러 표시).',
        '⚠️ 폼 상태는 부모에서 관리하고, 자식 컴포넌트는 UI만 담당하게 하세요.'
      ]
    },
    {
      id: 'crud-page-state-design',
      title: 'CRUD Page State Design',
      titleKo: 'Admin CRUD 페이지 상태 설계',
      content: `
## Admin CRUD 페이지의 상태 설계

이 프로젝트의 Admin 페이지들은 일관된 상태 설계 패턴을 따릅니다.

### CRUD 페이지 상태 구조

\`\`\`
┌─────────────────────────────────────────────────────┐
│                    Page Component                    │
├─────────────────────────────────────────────────────┤
│  useXxxManagement Hook                              │
│  ┌─────────────────────────────────────────────────┐│
│  │ usePageState                                    ││
│  │ - searchCriteria   (검색 조건)                  ││
│  │ - paginationModel  (페이지네이션)               ││
│  │ - quickSearch      (빠른 검색어)                ││
│  │ - data            (목록 데이터)                 ││
│  │ - rowCount        (총 행 수)                    ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │ useMessage                                      ││
│  │ - successMessage  (성공 메시지)                 ││
│  │ - errorMessage    (에러 메시지)                 ││
│  │ - showSuccess()   (성공 표시)                   ││
│  │ - showError()     (에러 표시)                   ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │ Local States                                    ││
│  │ - dialogOpen      (다이얼로그 열림)             ││
│  │ - editingItem     (편집 중인 항목)              ││
│  │ - searching       (검색 중)                     ││
│  │ - saveLoading     (저장 중)                     ││
│  │ - deleteDialogOpen (삭제 확인 열림)             ││
│  │ - selectedForDelete (삭제 대상)                 ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │ Handlers                                        ││
│  │ - handleAdd()      (추가)                       ││
│  │ - handleEdit()     (편집)                       ││
│  │ - handleSave()     (저장)                       ││
│  │ - handleDelete()   (삭제)                       ││
│  │ - handleRefresh()  (새로고침)                   ││
│  │ - handleSearch()   (검색)                       ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
\`\`\`

### 공통 CRUD 상태 패턴

| 상태 그룹 | 상태들 | 설명 |
|-----------|--------|------|
| **데이터** | items, rowCount | API에서 받은 목록과 총 개수 |
| **검색** | searchCriteria, quickSearch | 검색/필터 조건 |
| **페이지** | paginationModel | 현재 페이지, 페이지 크기 |
| **편집** | dialogOpen, editingItem | 추가/수정 다이얼로그 |
| **삭제** | deleteDialogOpen, selectedForDelete | 삭제 확인 다이얼로그 |
| **로딩** | searching, saveLoading, deleteLoading | 각 작업의 로딩 상태 |
| **메시지** | successMessage, errorMessage | 사용자 피드백 |

### 상태 흐름

\`\`\`
사용자 액션                상태 변경                      UI 업데이트
───────────────────────────────────────────────────────────────────
[검색]
Quick Search 입력     → quickSearch 변경
Enter/버튼 클릭       → searching=true
                      → API 호출
                      → items 업데이트              → 목록 리렌더
                      → searching=false

[추가]
Add 버튼 클릭        → editingItem=빈 객체
                     → dialogOpen=true             → 다이얼로그 열림
폼 입력               → editingItem 업데이트
Save 클릭            → saveLoading=true
                     → API 호출
                     → items에 추가                → 목록에 새 항목
                     → dialogOpen=false            → 다이얼로그 닫힘
                     → successMessage 설정         → 성공 메시지 표시

[수정]
Row 클릭/Edit 클릭   → editingItem=선택된 항목
                     → dialogOpen=true             → 다이얼로그 열림
폼 수정               → editingItem 업데이트
Save 클릭            → saveLoading=true
                     → API 호출
                     → items 해당 항목 교체        → 목록 업데이트
                     → dialogOpen=false
                     → successMessage 설정

[삭제]
체크박스 선택         → selectedForDelete 업데이트
Delete 버튼 클릭      → deleteDialogOpen=true      → 확인 다이얼로그
Confirm 클릭         → deleteLoading=true
                     → API 호출
                     → items에서 제거              → 목록에서 삭제됨
                     → deleteDialogOpen=false
                     → selectedForDelete=[]
                     → successMessage 설정
\`\`\`
      `,
      codeExamples: [
        {
          id: 'crud-management-hook',
          title: '전체 CRUD 관리 훅 구조',
          description: 'useUserManagement의 전체 구조',
          fileName: 'src/app/[locale]/admin/users/hooks/useUserManagement.ts',
          language: 'tsx',
          code: `// CRUD 관리 훅 전체 구조

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';

interface UseUserManagementOptions {
  storageKey?: string;
}

export const useUserManagement = (options: UseUserManagementOptions = {}) => {
  const { storageKey = 'admin-users-page-state' } = options;
  const locale = useCurrentLocale();

  // ═══════════════════════════════════════════
  // 1. 페이지 상태 (usePageState 훅)
  // ═══════════════════════════════════════════
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: users,
    setData: setUsers,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, User>({
    storageKey,
    initialCriteria: {
      loginid: '',
      name_ko: '',
      email: '',
      department: '',
      status: ''
    },
    initialPaginationModel: { page: 0, pageSize: 50 }
  });

  // ═══════════════════════════════════════════
  // 2. 메시지 상태 (useMessage 훅)
  // ═══════════════════════════════════════════
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale });

  // ═══════════════════════════════════════════
  // 3. UI 상태 (로컬)
  // ═══════════════════════════════════════════

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

  // 삭제 확인 상태
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  // 로딩 상태
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 참조 데이터
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);

  // ═══════════════════════════════════════════
  // 4. 데이터 페칭
  // ═══════════════════════════════════════════
  const fetchUsers = useCallback(async (
    page: number = 0,
    pageSize: number = 50,
    useQuickSearch: boolean = false
  ) => {
    try {
      setSearching(true);

      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        params.append('search', quickSearch);
      } else {
        Object.entries(searchCriteria).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      params.append('page', (page + 1).toString());
      params.append('limit', pageSize.toString());

      const response = await api.get(\`/user?\${params.toString()}\`);

      setUsers(response.users || []);
      setRowCount(response.pagination?.totalCount || 0);
    } catch (error) {
      await showErrorMessage('CRUD_USER_LOAD_FAIL');
      setUsers([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setUsers, setRowCount, showErrorMessage]);

  // ═══════════════════════════════════════════
  // 5. CRUD 핸들러
  // ═══════════════════════════════════════════

  // 추가 시작
  const handleAdd = useCallback(() => {
    setEditingUser({
      id: '',
      loginid: '',
      name_ko: '',
      email: '',
      role: 'user',
      department: '',
      status: 'active',
      password: ''
    });
    setDialogOpen(true);
  }, []);

  // 수정 시작
  const handleEdit = useCallback((id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setEditingUser(user);
      setDialogOpen(true);
    }
  }, [users]);

  // 저장 (추가/수정)
  const handleSave = useCallback(async () => {
    if (!editingUser) return;

    try {
      setSaveLoading(true);

      if (!editingUser.id) {
        // 새로 추가
        const response = await api.post('/user', editingUser);
        setUsers(prev => [...prev, response.user]);
        await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
      } else {
        // 수정
        const response = await api.put(\`/user/\${editingUser.id}\`, editingUser);
        setUsers(prev => prev.map(u =>
          u.id === editingUser.id ? response.user : u
        ));
        await showSuccessMessage('CRUD_USER_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      await showErrorMessage('CRUD_USER_SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingUser, setUsers, showSuccessMessage, showErrorMessage]);

  // 삭제 시작 (확인 다이얼로그)
  const handleDeleteClick = useCallback((ids: string[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  // 삭제 확인
  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      for (const id of selectedForDelete) {
        await api.delete(\`/user/\${id}\`);
      }

      setUsers(prev => prev.filter(u => !selectedForDelete.includes(u.id)));
      await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', {
        count: selectedForDelete.length
      });

      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (error) {
      await showErrorMessage('CRUD_USER_DELETE_FAIL');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, setUsers, showSuccessMessage, showErrorMessage]);

  // 삭제 취소
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // ═══════════════════════════════════════════
  // 6. 검색 핸들러
  // ═══════════════════════════════════════════
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchUsers(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchUsers, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((
    field: keyof SearchCriteria,
    value: string
  ) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    fetchUsers(0, paginationModel.pageSize, true);
  }, [fetchUsers, paginationModel.pageSize, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setUsers([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setUsers, setRowCount, setPaginationModel, storageKey]);

  const handlePaginationModelChange = useCallback((
    newModel: { page: number; pageSize: number }
  ) => {
    setPaginationModel(newModel);
    const useQuickSearch = quickSearch.trim() !== '';
    fetchUsers(newModel.page, newModel.pageSize, useQuickSearch);
  }, [fetchUsers, quickSearch, setPaginationModel]);

  // ═══════════════════════════════════════════
  // 7. 초기 로드
  // ═══════════════════════════════════════════
  useEffect(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchUsers(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchUsers, quickSearch, paginationModel.page, paginationModel.pageSize]);

  // ═══════════════════════════════════════════
  // 8. 반환
  // ═══════════════════════════════════════════
  return {
    // 데이터 상태
    users,
    rowCount,
    allDepartments,

    // 검색 상태
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,

    // UI 상태
    dialogOpen,
    editingUser,
    setEditingUser,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,

    // 로딩 상태
    searching,
    saveLoading,
    deleteLoading,

    // 메시지 상태
    successMessage,
    errorMessage,

    // 핸들러
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handlePaginationModelChange,
    setDialogOpen
  };
};`
        },
        {
          id: 'crud-page-component',
          title: 'CRUD 페이지 컴포넌트',
          description: '훅을 사용하는 페이지 컴포넌트',
          language: 'tsx',
          code: `// CRUD 페이지 컴포넌트 - 훅 사용

'use client';

import { useUserManagement } from './hooks/useUserManagement';
import { usePermissionControl } from '@/hooks/usePermissionControl';
import { useCurrentLocale } from '@/lib/i18n/client';
import StandardCrudPageLayout from '@/components/layout/StandardCrudPageLayout';
import UserFormFields from '@/components/admin/UserFormFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { createColumns } from './constants';

export default function UsersPage() {
  const locale = useCurrentLocale();

  // 권한 체크
  const { canCreate, canUpdate, canDelete, loading: permLoading } =
    usePermissionControl('PROG-USER-LIST');

  // ⭐ 모든 상태와 핸들러를 훅에서 가져옴
  const {
    users,
    rowCount,
    allDepartments,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    dialogOpen,
    editingUser,
    setEditingUser,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    searching,
    saveLoading,
    deleteLoading,
    successMessage,
    errorMessage,
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handlePaginationModelChange,
    setDialogOpen
  } = useUserManagement();

  // 컬럼 정의 (다국어, 부서 목록 포함)
  const columns = createColumns(locale, allDepartments);

  // 권한에 따른 기능 표시
  const showAddButton = canCreate;
  const showDeleteButton = canDelete && selectedForDelete.length > 0;

  if (permLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {/* 메인 레이아웃 */}
      <StandardCrudPageLayout
        title="Users"
        successMessage={successMessage}
        errorMessage={errorMessage}
        quickSearch={quickSearch}
        onQuickSearchChange={setQuickSearch}
        onQuickSearch={handleQuickSearch}
        onQuickSearchClear={handleQuickSearchClear}
        onRefresh={handleRefresh}
        onAdd={showAddButton ? handleAdd : undefined}
        advancedFilterOpen={advancedFilterOpen}
        onAdvancedFilterToggle={() => setAdvancedFilterOpen(!advancedFilterOpen)}
        searchCriteria={searchCriteria}
        onSearchChange={handleSearchChange}
      >
        {/* 데이터 그리드 */}
        <DataGrid
          rows={users}
          columns={columns}
          loading={searching}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          rowCount={rowCount}
          paginationMode="server"
          checkboxSelection={canDelete}
          onRowSelectionModelChange={(ids) =>
            handleDeleteClick(ids as string[])
          }
          onRowClick={(params) => canUpdate && handleEdit(params.row.id)}
        />

        {/* 삭제 버튼 */}
        {showDeleteButton && (
          <Button
            color="error"
            onClick={() => handleDeleteClick(selectedForDelete)}
          >
            Delete ({selectedForDelete.length})
          </Button>
        )}
      </StandardCrudPageLayout>

      {/* 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editingUser?.id ? 'Edit User' : 'Add User'}
        </DialogTitle>
        <DialogContent>
          <UserFormFields
            user={editingUser}
            onChange={setEditingUser}
            departments={allDepartments}
            locale={locale}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Users"
        message={\`Are you sure you want to delete \${selectedForDelete.length} user(s)?\`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </>
  );
}

// 💡 페이지 컴포넌트의 역할:
// 1. 훅에서 상태와 핸들러 가져오기
// 2. 권한에 따른 UI 조건부 렌더링
// 3. 컴포넌트 조합 및 props 전달
// 4. 레이아웃 구성

// 💡 비즈니스 로직은 모두 훅에 있으므로:
// - 페이지 컴포넌트는 깔끔하게 유지됨
// - 테스트가 쉬움 (훅만 테스트)
// - 재사용 가능 (다른 페이지에서 훅 사용)`
        }
      ],
      tips: [
        '✅ CRUD 페이지는 일관된 상태 구조를 따르면 유지보수가 쉬워집니다.',
        '✅ usePageState로 검색/페이지네이션 상태를 재사용하세요.',
        '✅ 비즈니스 로직은 커스텀 훅에, 페이지 컴포넌트는 UI만 담당하게 하세요.',
        'ℹ️ 삭제는 항상 확인 다이얼로그를 거치는 것이 좋습니다.'
      ]
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - Sharing State Between Components',
      url: 'https://react.dev/learn/sharing-state-between-components',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - Choosing the State Structure',
      url: 'https://react.dev/learn/choosing-the-state-structure',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - Extracting State Logic into a Reducer',
      url: 'https://react.dev/learn/extracting-state-logic-into-a-reducer',
      type: 'documentation'
    },
    {
      title: 'Kent C. Dodds - State Colocation',
      url: 'https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster',
      type: 'article'
    }
  ],
  status: 'ready'
};

export default chapter;
