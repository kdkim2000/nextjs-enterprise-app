/**
 * Chapter 6: 이벤트 처리
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'events',
  order: 6,
  title: 'Event Handling',
  titleKo: '이벤트 처리',
  description: 'Learn how to handle user interactions in React.',
  descriptionKo: 'React에서 사용자 상호작용을 처리하는 방법을 학습합니다.',
  estimatedMinutes: 45,
  objectives: [
    'Understand event handling in React',
    'Write event handlers with TypeScript',
    'Use event objects and their properties',
    'Handle form inputs effectively',
    'Control event propagation'
  ],
  objectivesKo: [
    'React의 이벤트 처리 방식을 이해한다',
    'TypeScript로 이벤트 핸들러를 작성한다',
    '이벤트 객체와 속성을 활용한다',
    '폼 입력을 효과적으로 처리한다',
    '이벤트 전파를 제어한다'
  ],
  sections: [
    {
      id: 'event-handler-basics',
      title: 'Event Handler Basics',
      titleKo: '이벤트 핸들러 작성법',
      content: `
## React의 이벤트 처리

React에서 이벤트 처리는 HTML과 유사하지만 몇 가지 차이점이 있습니다.

### HTML vs React 이벤트 비교

| 특성 | HTML | React |
|------|------|-------|
| 이벤트 이름 | 소문자 (onclick) | camelCase (onClick) |
| 핸들러 전달 | 문자열 | 함수 |
| 기본 동작 방지 | return false | e.preventDefault() |

\`\`\`tsx
// HTML 방식
<button onclick="handleClick()">클릭</button>

// React 방식
<button onClick={handleClick}>클릭</button>
\`\`\`

### 이벤트 핸들러 정의 방법

**1. 인라인 화살표 함수**

\`\`\`tsx
<button onClick={() => console.log('클릭!')}>
  클릭
</button>
\`\`\`

**2. 별도 함수로 정의 (권장)**

\`\`\`tsx
function MyButton() {
  const handleClick = () => {
    console.log('버튼 클릭됨!');
  };

  return <button onClick={handleClick}>클릭</button>;
}
\`\`\`

**3. 매개변수가 필요한 경우**

\`\`\`tsx
function ItemList() {
  const handleItemClick = (id: string) => {
    console.log('선택된 항목:', id);
  };

  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

### 자주 사용하는 이벤트

| 이벤트 | 설명 | 사용 예 |
|--------|------|---------|
| onClick | 클릭 | 버튼, 카드, 링크 |
| onChange | 값 변경 | 입력 필드, 셀렉트 |
| onSubmit | 폼 제출 | 검색, 로그인 폼 |
| onKeyDown | 키보드 누름 | 단축키, Enter 검색 |
| onFocus/onBlur | 포커스 | 입력 필드 상태 |
| onMouseEnter/Leave | 마우스 진입/이탈 | 호버 효과 |
      `,
      codeExamples: [
        {
          id: 'basic-event-handler',
          title: '기본 이벤트 핸들러 예제',
          description: 'ConversationsPage의 카드 클릭 핸들러',
          code: `// ConversationsPage에서 카드 클릭 처리
function ConversationsPage() {
  const router = useRouter();
  const locale = useCurrentLocale();

  // 카드 클릭 핸들러 - 상세 페이지로 이동
  const handleCardClick = (id: string) => {
    router.push(\`/\${locale}/dev/conversations/\${id}\`);
  };

  return (
    <CardGrid
      items={conversations}
      renderCard={(conv) => (
        <ConversationCard
          conversation={conv}
          onClick={() => handleCardClick(conv.id)}
        />
      )}
    />
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ 이벤트 핸들러 함수 이름은 handle + 이벤트명 형태로 작성하세요. (예: handleClick, handleSubmit)',
        'ℹ️ 매개변수 없는 핸들러는 onClick={handleClick}처럼 직접 전달하고, 매개변수가 필요하면 onClick={() => handleClick(id)} 형태를 사용하세요.'
      ]
    },
    {
      id: 'event-object',
      title: 'Using Event Objects',
      titleKo: '이벤트 객체 사용',
      content: `
## 이벤트 객체 (Event Object)

이벤트 핸들러는 자동으로 **이벤트 객체(e)** 를 첫 번째 매개변수로 받습니다.
React는 브라우저 간 호환성을 위해 **SyntheticEvent** 를 사용합니다.

### TypeScript 이벤트 타입

\`\`\`tsx
// 마우스 이벤트
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log('클릭 좌표:', e.clientX, e.clientY);
};

// 키보드 이벤트
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    console.log('Enter 키 누름');
  }
};

// 폼 이벤트
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // 페이지 새로고침 방지
};

// 변경 이벤트
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log('입력값:', e.target.value);
};
\`\`\`

### 자주 사용하는 이벤트 객체 속성

**공통 속성**
- \`e.target\` - 이벤트가 발생한 요소
- \`e.currentTarget\` - 핸들러가 연결된 요소
- \`e.preventDefault()\` - 기본 동작 방지
- \`e.stopPropagation()\` - 이벤트 전파 중단

**마우스 이벤트 (MouseEvent)**
- \`e.clientX, e.clientY\` - 뷰포트 기준 좌표
- \`e.button\` - 클릭된 마우스 버튼

**키보드 이벤트 (KeyboardEvent)**
- \`e.key\` - 눌린 키 이름 ('Enter', 'Escape' 등)
- \`e.ctrlKey, e.shiftKey, e.altKey\` - 조합 키

**폼 요소 이벤트 (ChangeEvent)**
- \`e.target.value\` - 입력 필드의 값
- \`e.target.name\` - 입력 필드의 name 속성
- \`e.target.checked\` - 체크박스 체크 상태
      `,
      codeExamples: [
        {
          id: 'keyboard-event-example',
          title: 'QuickSearchBar의 키보드 이벤트',
          description: 'Enter 키로 검색 실행하는 패턴',
          code: `// QuickSearchBar - Enter 키로 검색
function QuickSearchBar({
  searchValue,
  onSearchChange,
  onSearch,
  disabled = false,
  searching = false
}: QuickSearchBarProps) {
  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && !searching) {
      onSearch();
    }
  };

  return (
    <TextField
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled || searching}
      placeholder="Search conversations..."
    />
  );
}`,
          language: 'tsx'
        },
        {
          id: 'mouse-event-types',
          title: 'TypeScript 이벤트 타입 예제',
          description: '다양한 이벤트 타입 활용',
          code: `// 마우스 이벤트
const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.backgroundColor = '#f0f0f0';
};

// 키보드 이벤트 - 조합 키 처리
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Ctrl + Enter 조합
  if (e.ctrlKey && e.key === 'Enter') {
    handleSubmit();
  }
  // ESC 키로 취소
  if (e.key === 'Escape') {
    handleCancel();
  }
};

// 변경 이벤트 - target 속성 활용
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
};`,
          language: 'tsx'
        }
      ],
      tips: [
        'ℹ️ TypeScript에서는 정확한 이벤트 타입을 지정하면 e.target 속성에 대한 자동완성을 받을 수 있습니다.',
        '⚠️ e.target과 e.currentTarget의 차이: target은 실제 클릭된 요소, currentTarget은 핸들러가 연결된 요소입니다.'
      ]
    },
    {
      id: 'form-handling',
      title: 'Form Input Handling',
      titleKo: '폼 입력 처리',
      content: `
## 폼 입력 처리

React에서 폼 입력은 **Controlled Component** 패턴으로 처리합니다.
입력값을 State로 관리하고, onChange로 업데이트합니다.

### Controlled Component 패턴

\`\`\`tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지!
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">로그인</button>
    </form>
  );
}
\`\`\`

### 다양한 입력 타입 처리

**텍스트 입력**
\`\`\`tsx
<input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
\`\`\`

**체크박스**
\`\`\`tsx
<input
  type="checkbox"
  checked={isAgree}
  onChange={(e) => setIsAgree(e.target.checked)}
/>
\`\`\`

**셀렉트**
\`\`\`tsx
<select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="">선택하세요</option>
  <option value="feature">Feature</option>
  <option value="bugfix">Bug Fix</option>
</select>
\`\`\`

### 범용 핸들러 패턴

여러 입력 필드를 하나의 핸들러로 처리할 수 있습니다:

\`\`\`tsx
interface FormData {
  name: string;
  email: string;
  message: string;
}

function ContactForm() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  // 범용 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
      <textarea name="message" value={form.message} onChange={handleChange} />
    </form>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'search-filter-form',
          title: 'ConversationsPage의 필터 폼',
          description: 'Select 컴포넌트로 필터 값 변경 처리',
          code: `// ConversationsPage - 필터 처리
function ConversationsPage() {
  // 필터 State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [branch, setBranch] = useState('');

  // 필터 초기화
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setBranch('');
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Category Select */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {filterOptions?.categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {categoryConfigs[cat]?.label || cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Difficulty Select */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Difficulty</InputLabel>
        <Select
          value={difficulty}
          label="Difficulty"
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {filterOptions?.difficulties.map((diff) => (
            <MenuItem key={diff} value={diff}>
              {diff}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button onClick={clearFilters}>Clear</Button>
    </Box>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '🚫 폼 제출 시 반드시 e.preventDefault()를 호출하세요. 그렇지 않으면 페이지가 새로고침됩니다!',
        '✅ 여러 입력 필드는 name 속성을 활용한 범용 핸들러로 코드 중복을 줄일 수 있습니다.'
      ]
    },
    {
      id: 'event-propagation',
      title: 'Event Propagation Control',
      titleKo: '이벤트 전파 제어 (stopPropagation)',
      content: `
## 이벤트 전파 (Event Propagation)

DOM에서 이벤트는 **버블링(Bubbling)** 방식으로 전파됩니다.
자식 요소에서 발생한 이벤트가 부모 요소로 전달됩니다.

### 이벤트 전파 흐름

\`\`\`
클릭: Button → Card → Container → Body
       ↑ 이벤트가 위로 "버블" 됨
\`\`\`

### 문제 상황

카드 안에 삭제 버튼이 있을 때, 버튼을 클릭하면:
1. 버튼의 onClick (삭제) 실행
2. 카드의 onClick (상세보기) 도 실행됨 ← 의도하지 않음!

\`\`\`tsx
// 문제: 삭제 버튼 클릭 시 카드 클릭 이벤트도 발생
<Card onClick={handleCardClick}>
  <h3>{title}</h3>
  <button onClick={handleDelete}>삭제</button>
</Card>
\`\`\`

### 해결: stopPropagation()

\`e.stopPropagation()\` 으로 이벤트 전파를 중단합니다:

\`\`\`tsx
const handleDelete = (e: React.MouseEvent) => {
  e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
  deleteItem(id);
};
\`\`\`

### stopPropagation vs preventDefault

| 메서드 | 역할 | 사용 예 |
|--------|------|---------|
| stopPropagation() | 부모로 이벤트 전파 중단 | 카드 내부 버튼 클릭 |
| preventDefault() | 기본 동작 방지 | 폼 제출, 링크 클릭 |

\`\`\`tsx
// stopPropagation: 부모로 전파 중단
const handleButtonClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  doSomething();
};

// preventDefault: 브라우저 기본 동작 방지
const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  router.push('/custom-route');
};

// 둘 다 필요한 경우
const handleFormButtonClick = (e: React.MouseEvent) => {
  e.preventDefault();    // 폼 제출 방지
  e.stopPropagation();   // 부모 이벤트 방지
  customAction();
};
\`\`\`
      `,
      codeExamples: [
        {
          id: 'conversation-card-events',
          title: 'ConversationCard의 이벤트 전파 제어',
          description: '카드 클릭과 내부 버튼 클릭을 분리하는 실제 패턴',
          code: `// ConversationCard - stopPropagation 활용
function ConversationCard({
  conversation,
  onClick,
  selectionMode = false,
  selected = false,
  onSelect,
  onDelete
}: {
  conversation: Conversation;
  onClick: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  // 체크박스 클릭 - 카드 클릭 이벤트 전파 방지
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();  // ← 핵심!
    onSelect?.(conversation.id);
  };

  // 삭제 버튼 클릭 - 카드 클릭 이벤트 전파 방지
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();  // ← 핵심!
    onDelete?.(conversation.id);
  };

  return (
    <CardWrapper
      onClick={selectionMode
        ? () => onSelect?.(conversation.id)
        : onClick
      }
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectionMode && (
            <Checkbox
              checked={selected}
              onClick={handleCheckboxClick}  // stopPropagation 적용
              size="small"
            />
          )}
          <CategoryBadge category={conversation.category} />
        </Box>

        {!selectionMode && (
          <IconButton
            size="small"
            onClick={handleDeleteClick}  // stopPropagation 적용
          >
            <Delete sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Typography>{conversation.title}</Typography>
    </CardWrapper>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ 카드 내부에 클릭 가능한 요소(버튼, 체크박스, 링크)가 있을 때는 반드시 stopPropagation()을 고려하세요.',
        'ℹ️ MUI의 Checkbox, IconButton 등은 자체적으로 이벤트를 처리하므로, 수동으로 stopPropagation을 호출해야 합니다.'
      ]
    },
    {
      id: 'real-world-patterns',
      title: 'Real-World Event Patterns',
      titleKo: '실전 이벤트 패턴',
      content: `
## 실제 프로젝트에서 사용하는 이벤트 패턴

### 1. 선택 모드 토글

여러 항목을 선택/해제하는 패턴:

\`\`\`tsx
const [selectionMode, setSelectionMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// 선택 모드 토글
const toggleSelectionMode = () => {
  setSelectionMode(!selectionMode);
  setSelectedIds(new Set()); // 모드 변경 시 선택 초기화
};

// 개별 항목 선택/해제
const handleToggleSelection = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
};

// 전체 선택/해제
const handleSelectAll = () => {
  if (selectedIds.size === items.length) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(items.map(item => item.id)));
  }
};
\`\`\`

### 2. 삭제 확인 다이얼로그

삭제 전 확인을 받는 패턴:

\`\`\`tsx
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

// 삭제 버튼 클릭 → 다이얼로그 열기
const handleDeleteClick = (id: string) => {
  setDeleteTargetId(id);
  setDeleteDialogOpen(true);
};

// 삭제 확인
const handleDeleteConfirm = async () => {
  if (!deleteTargetId) return;

  try {
    await deleteItem(deleteTargetId);
    showSuccess('삭제되었습니다.');
  } catch (err) {
    showError('삭제에 실패했습니다.');
  } finally {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  }
};
\`\`\`

### 3. 디바운스된 검색

입력할 때마다 API 호출을 방지하는 패턴:

\`\`\`tsx
const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

// 디바운싱 처리
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

// debouncedSearch가 변경될 때만 API 호출
useEffect(() => {
  fetchData(debouncedSearch);
}, [debouncedSearch]);
\`\`\`
      `,
      codeExamples: [
        {
          id: 'delete-flow-example',
          title: '삭제 플로우 전체 구현',
          description: 'ConversationsPage의 삭제 기능 전체 흐름',
          code: `// 삭제 관련 State
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' as const
});

// Step 1: 삭제 버튼 클릭 → 다이얼로그 열기
const handleDeleteClick = (id: string) => {
  setDeleteTargetId(id);
  setDeleteDialogOpen(true);
};

// Step 2: 다이얼로그에서 확인 클릭 → 실제 삭제 수행
const handleDeleteConfirm = async () => {
  if (!deleteTargetId) return;

  setDeleting(true);
  try {
    await axiosInstance.delete(\`/conversation/\${deleteTargetId}\`);
    setSnackbar({
      open: true,
      message: 'Conversation deleted successfully',
      severity: 'success'
    });
    fetchConversations(); // 목록 새로고침
  } catch (err) {
    console.error('Failed to delete:', err);
    setSnackbar({
      open: true,
      message: 'Failed to delete conversation',
      severity: 'error'
    });
  } finally {
    setDeleting(false);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  }
};

// Step 3: 스낵바 닫기
const handleSnackbarClose = () => {
  setSnackbar(prev => ({ ...prev, open: false }));
};

// UI 렌더링
return (
  <>
    <CardGrid
      renderCard={(conv) => (
        <ConversationCard
          conversation={conv}
          onDelete={handleDeleteClick}  // Step 1 연결
        />
      )}
    />

    {/* 삭제 확인 다이얼로그 */}
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
      <DialogTitle>Delete Conversation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDeleteConfirm}  // Step 2 연결
          color="error"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* 피드백 스낵바 */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={handleSnackbarClose}  // Step 3 연결
    >
      <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
    </Snackbar>
  </>
);`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ 위험한 작업(삭제, 초기화)은 항상 확인 다이얼로그를 사용하세요.',
        '✅ 작업 완료 후에는 Snackbar나 Toast로 사용자에게 피드백을 제공하세요.'
      ]
    },
    {
      id: 'event-handler-props',
      title: 'Passing Event Handlers as Props',
      titleKo: 'Props로 이벤트 핸들러 전달하기',
      content: `
## 이벤트 핸들러를 Props로 전달

컴포넌트 간에 이벤트를 전달하는 것은 React의 핵심 패턴입니다.
자식에서 발생한 이벤트를 부모가 처리할 수 있게 합니다.

### 이벤트 핸들러 Props 명명 규칙

| Props 이름 | 역할 | 예시 |
|------------|------|------|
| onClick | 클릭 시 호출 | \`onClick={() => handleClick(id)}\` |
| onChange | 값 변경 시 호출 | \`onChange={handleChange}\` |
| onSelect | 선택 시 호출 | \`onSelect={(id) => setSelected(id)}\` |
| onDelete | 삭제 시 호출 | \`onDelete={(id) => handleDelete(id)}\` |
| onClose | 닫을 때 호출 | \`onClose={() => setOpen(false)}\` |
| onSubmit | 제출 시 호출 | \`onSubmit={handleSubmit}\` |

### 선택적 콜백 처리

콜백이 전달되지 않을 수도 있을 때 **Optional Chaining** 을 사용:

\`\`\`tsx
interface CardProps {
  item: Item;
  onClick?: () => void;       // 선택적
  onDelete?: (id: string) => void;  // 선택적
}

function Card({ item, onClick, onDelete }: CardProps) {
  const handleClick = () => {
    onClick?.();  // onClick이 있을 때만 호출
  };

  const handleDelete = () => {
    onDelete?.(item.id);  // onDelete가 있을 때만 호출
  };

  return (
    <div onClick={handleClick}>
      <span>{item.name}</span>
      <button onClick={handleDelete}>삭제</button>
    </div>
  );
}
\`\`\`

### 부모-자식 이벤트 흐름

\`\`\`
[Parent Component]
    │
    │ onClick, onDelete Props 전달
    ↓
[Child Component]
    │
    │ 사용자 클릭 발생
    ↓
  handleClick() 실행
    │
    │ onClick?.() 호출
    ↓
[Parent Component]
  handleCardClick() 실행
\`\`\`
      `,
      codeExamples: [
        {
          id: 'props-event-handler-types',
          title: 'TypeScript로 이벤트 핸들러 Props 타입 정의',
          description: '실제 프로젝트에서 사용하는 타입 정의 패턴',
          code: `// ConversationCard의 Props 타입 정의
interface ConversationCardProps {
  conversation: Conversation;
  onClick: () => void;                    // 필수
  selectionMode?: boolean;                // 선택적 (기본값 사용)
  selected?: boolean;                     // 선택적
  onSelect?: (id: string) => void;        // 선택적
  onDelete?: (id: string) => void;        // 선택적
}

function ConversationCard({
  conversation,
  onClick,
  selectionMode = false,  // 기본값 설정
  selected = false,
  onSelect,
  onDelete
}: ConversationCardProps) {
  // 선택적 콜백 안전하게 호출
  const handleSelect = () => {
    onSelect?.(conversation.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(conversation.id);
  };

  return (
    <CardWrapper onClick={selectionMode ? handleSelect : onClick}>
      {/* ... */}
    </CardWrapper>
  );
}

// 부모에서 사용
<ConversationCard
  conversation={conv}
  onClick={() => router.push(\`/conversations/\${conv.id}\`)}
  onDelete={handleDeleteClick}
  // onSelect는 전달 안 함 → undefined
/>`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ 이벤트 핸들러 Props는 on + 동사 형태로 명명하세요. (onClick, onSelect, onDelete)',
        'ℹ️ 선택적 콜백은 optional chaining (?.)으로 안전하게 호출하세요.'
      ]
    },
    {
      id: 'summary',
      title: 'Chapter Summary',
      titleKo: '요약',
      content: `
## Chapter 6 핵심 정리

### 이벤트 핸들러 작성
- React는 **camelCase** 이벤트 이름 사용 (onClick, onChange)
- 핸들러는 **함수로 전달** (문자열 아님)
- 함수명은 \`handle + 이벤트명\` 규칙 권장

### 이벤트 객체
- TypeScript 타입: \`React.MouseEvent\`, \`React.KeyboardEvent\`, \`React.ChangeEvent\` 등
- 주요 속성: \`e.target\`, \`e.currentTarget\`, \`e.key\`
- 주요 메서드: \`preventDefault()\`, \`stopPropagation()\`

### 폼 처리
- **Controlled Component** 패턴 사용
- \`value\` + \`onChange\`로 입력값 관리
- 폼 제출 시 \`e.preventDefault()\` 필수

### 이벤트 전파 제어
- **stopPropagation()** : 부모로 이벤트 전파 중단
- **preventDefault()** : 브라우저 기본 동작 방지
- 카드 내부 버튼 클릭 시 \`stopPropagation()\` 필수

### Props로 이벤트 전달
- \`on + 동사\` 형태로 명명 (onSelect, onDelete)
- 선택적 콜백은 \`callback?.()\` 로 안전하게 호출
- TypeScript로 정확한 타입 지정

### 다음 단계
- **Chapter 7** : useEffect로 사이드 이펙트 관리
- **Chapter 8** : 조건부 렌더링과 리스트
      `
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - Responding to Events',
      url: 'https://react.dev/learn/responding-to-events',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - SyntheticEvent',
      url: 'https://react.dev/reference/react-dom/components/common#react-event-object',
      type: 'documentation'
    },
    {
      title: 'MDN - Event.stopPropagation()',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
