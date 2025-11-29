/**
 * Chapter 5: State - 상태 관리 기초
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'state',
  order: 5,
  title: 'State - Basic State Management',
  titleKo: 'State - 상태 관리 기초',
  description: 'Learn how to manage component state with useState hook.',
  descriptionKo: 'useState 훅으로 컴포넌트 상태를 관리하는 방법을 학습합니다.',
  estimatedMinutes: 60,
  objectives: [
    'Understand what state is and how it differs from props',
    'Use the useState hook correctly',
    'Follow state update rules and immutability principle',
    'Manage multiple states efficiently'
  ],
  objectivesKo: [
    'State가 무엇이고 Props와 어떻게 다른지 이해한다',
    'useState 훅을 올바르게 사용한다',
    'State 업데이트 규칙과 불변성 원칙을 따른다',
    '여러 개의 State를 효율적으로 관리한다'
  ],
  sections: [
    {
      id: 'what-is-state',
      title: 'What is State?',
      titleKo: 'State란 무엇인가?',
      content: `
## State: 컴포넌트의 "기억"

**State** 는 컴포넌트가 "기억"해야 하는 데이터입니다.
사용자 상호작용, API 응답, 시간 경과 등에 따라 변할 수 있는 값들을 State로 관리합니다.

### Props vs State 비교

| 특성 | Props | State |
|------|-------|-------|
| 데이터 흐름 | 부모 → 자식 전달 | 컴포넌트 내부 관리 |
| 변경 가능성 | 읽기 전용 (수정 불가) | 변경 가능 |
| 소유권 | 부모 컴포넌트 | 해당 컴포넌트 |
| 역할 | 컴포넌트 구성/설정 | 동적 데이터 관리 |

\`\`\`tsx
// Props: 외부에서 받은 설정값 (변경 불가)
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// State: 내부에서 관리하는 값 (변경 가능)
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

### 언제 State를 사용하는가?

1. **사용자 입력값** : 검색어, 폼 데이터, 체크박스 상태
2. **UI 상태** : 모달 열림/닫힘, 로딩 중, 선택된 탭
3. **서버 데이터** : API에서 가져온 목록, 상세 정보
4. **계산된 결과** : 필터링된 목록, 페이지네이션 정보

### State가 변경되면?

State가 변경되면 React는 해당 컴포넌트를 **다시 렌더링** 합니다.
이것이 React의 핵심 동작 원리입니다.

\`\`\`tsx
function Toggle() {
  const [isOn, setIsOn] = useState(false);

  // isOn이 바뀔 때마다 이 컴포넌트가 다시 렌더링됨
  console.log('렌더링! isOn:', isOn);

  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'state-vs-props-example',
          title: 'State vs Props 실전 비교',
          description: '같은 데이터를 Props와 State로 다루는 방식의 차이',
          code: `// 부모 컴포넌트: title을 State로 관리
function App() {
  const [title, setTitle] = useState('초기 제목');

  return (
    <div>
      <Header title={title} />  {/* Props로 전달 */}
      <button onClick={() => setTitle('변경된 제목')}>
        제목 변경
      </button>
    </div>
  );
}

// 자식 컴포넌트: title을 Props로 받음
function Header({ title }: { title: string }) {
  // title = '다른 값';  // ❌ Error! Props는 수정 불가
  return <h1>{title}</h1>;  // ✅ 읽기만 가능
}`,
          language: 'tsx'
        }
      ]
    },
    {
      id: 'usestate-basics',
      title: 'useState Hook Usage',
      titleKo: 'useState Hook 사용법',
      content: `
## useState Hook

\`useState\` 는 React에서 State를 사용하기 위한 가장 기본적인 Hook입니다.

### 기본 문법

\`\`\`tsx
import { useState } from 'react';

function Component() {
  // [현재값, 업데이트함수] = useState(초기값)
  const [state, setState] = useState(initialValue);
}
\`\`\`

### 구조 분해 할당

\`useState\` 는 배열을 반환합니다:
- **첫 번째 요소** : 현재 State 값
- **두 번째 요소** : State를 업데이트하는 함수

\`\`\`tsx
// 배열 구조 분해 사용
const [count, setCount] = useState(0);

// 실제로 useState가 반환하는 것
// const stateArray = useState(0);
// const count = stateArray[0];      // 0
// const setCount = stateArray[1];   // 함수
\`\`\`

### 다양한 타입의 State

\`\`\`tsx
// 숫자
const [count, setCount] = useState(0);

// 문자열
const [name, setName] = useState('');

// 불리언
const [isOpen, setIsOpen] = useState(false);

// 배열
const [items, setItems] = useState<string[]>([]);

// 객체
const [user, setUser] = useState({ name: '', age: 0 });

// null 허용
const [data, setData] = useState<User | null>(null);
\`\`\`

### TypeScript 타입 지정

복잡한 타입이나 null을 허용할 때는 제네릭으로 타입을 명시합니다:

\`\`\`tsx
interface User {
  id: string;
  name: string;
  email: string;
}

// 초기값이 null이면 타입 명시 필요
const [user, setUser] = useState<User | null>(null);

// 빈 배열도 타입 명시 권장
const [users, setUsers] = useState<User[]>([]);

// 복잡한 객체
interface FilterState {
  search: string;
  category: string;
  page: number;
}

const [filters, setFilters] = useState<FilterState>({
  search: '',
  category: '',
  page: 1
});
\`\`\`
      `,
      codeExamples: [
        {
          id: 'basic-counter',
          title: '기본 Counter 예제',
          description: 'useState의 가장 기본적인 사용 예시',
          code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
      <button onClick={increment}>+</button>
    </div>
  );
}`,
          language: 'tsx'
        },
        {
          id: 'search-input-form',
          title: '입력 폼 예제',
          description: '문자열 State로 입력값 관리',
          code: `function SearchInput() {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('검색어:', query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="검색어 입력..."
      />
      <button type="submit">검색</button>
    </form>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '⚠️ useState는 반드시 컴포넌트 최상위 레벨에서 호출해야 합니다. 조건문이나 반복문 안에서 호출하면 안 됩니다.',
        'ℹ️ State 변수 이름은 관례적으로 [something, setSomething] 형태를 사용합니다.'
      ]
    },
    {
      id: 'state-update-rules',
      title: 'State Update Rules',
      titleKo: 'State 업데이트 규칙 (불변성)',
      content: `
## State 업데이트의 핵심 규칙

React에서 State를 업데이트할 때는 **불변성(Immutability)** 을 지켜야 합니다.
기존 State를 직접 수정하지 않고, 새로운 값으로 교체해야 합니다.

### 왜 불변성이 중요한가?

React는 State의 **참조(reference)가 변경** 되었는지 확인하여 리렌더링 여부를 결정합니다.
직접 수정하면 참조가 같아서 React가 변경을 감지하지 못합니다.

\`\`\`tsx
// ❌ 잘못된 방법: 직접 수정
const [user, setUser] = useState({ name: 'Kim', age: 25 });
user.name = 'Lee';  // React가 변경을 감지 못함!
setUser(user);      // 같은 참조라서 리렌더링 안 됨

// ✅ 올바른 방법: 새 객체 생성
setUser({ ...user, name: 'Lee' });  // 새 객체라서 변경 감지됨
\`\`\`

### 원시 타입 업데이트

숫자, 문자열, 불리언은 원래 불변이므로 단순히 새 값을 전달합니다:

\`\`\`tsx
const [count, setCount] = useState(0);
setCount(count + 1);  // ✅ 새 숫자 값

const [name, setName] = useState('Kim');
setName('Lee');  // ✅ 새 문자열 값

const [isOpen, setIsOpen] = useState(false);
setIsOpen(!isOpen);  // ✅ 새 불리언 값
\`\`\`

### 객체 업데이트

스프레드 연산자로 복사 후 원하는 속성만 덮어씁니다:

\`\`\`tsx
const [user, setUser] = useState({ name: 'Kim', age: 25, email: '' });

// 특정 필드만 업데이트
setUser({ ...user, name: 'Lee' });

// 여러 필드 업데이트
setUser({ ...user, name: 'Lee', age: 26 });

// 중첩 객체 업데이트
const [profile, setProfile] = useState({
  user: { name: 'Kim', age: 25 },
  settings: { theme: 'dark' }
});

setProfile({
  ...profile,
  user: { ...profile.user, name: 'Lee' }
});
\`\`\`

### 배열 업데이트

배열도 직접 수정(push, pop 등) 대신 새 배열을 만들어야 합니다:

\`\`\`tsx
const [items, setItems] = useState(['A', 'B', 'C']);

// ❌ 잘못된 방법
items.push('D');
setItems(items);

// ✅ 추가 (concat 또는 spread)
setItems([...items, 'D']);

// ✅ 삭제 (filter)
setItems(items.filter(item => item !== 'B'));

// ✅ 수정 (map)
setItems(items.map(item => item === 'A' ? 'A-modified' : item));

// ✅ 삽입 (slice + spread)
const insertAt = 1;
setItems([...items.slice(0, insertAt), 'NEW', ...items.slice(insertAt)]);
\`\`\`

### 함수형 업데이트

이전 State 값을 기반으로 업데이트할 때는 함수형 업데이트를 사용합니다:

\`\`\`tsx
// ❌ 연속 호출 시 문제 발생 가능
setCount(count + 1);
setCount(count + 1);  // 여전히 이전 count 참조

// ✅ 함수형 업데이트로 안전하게 처리
setCount(prev => prev + 1);
setCount(prev => prev + 1);  // 최신 값 기반으로 계산
\`\`\`
      `,
      codeExamples: [
        {
          id: 'array-state-crud',
          title: '배열 State CRUD 예제',
          description: '배열에서 추가, 수정, 삭제를 불변성 유지하며 처리',
          code: `interface Todo {
  id: number;
  text: string;
  done: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextId, setNextId] = useState(1);

  // 추가
  const addTodo = (text: string) => {
    setTodos([...todos, { id: nextId, text, done: false }]);
    setNextId(prev => prev + 1);
  };

  // 수정 (완료 토글)
  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  // 삭제
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{
            textDecoration: todo.done ? 'line-through' : 'none'
          }}>
            {todo.text}
          </span>
          <button onClick={() => deleteTodo(todo.id)}>삭제</button>
        </li>
      ))}
    </ul>
  );
}`,
          language: 'tsx'
        },
        {
          id: 'object-state-update',
          title: '객체 State 업데이트 예제',
          description: '폼 데이터를 객체 State로 관리',
          code: `interface FormData {
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

  // 초기화
  const handleReset = () => {
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <form>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="이름"
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="이메일"
      />
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="메시지"
      />
      <button type="button" onClick={handleReset}>초기화</button>
    </form>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '🚫 배열의 push(), pop(), splice(), sort() 메서드는 원본을 수정합니다. State 업데이트에 직접 사용하면 안 됩니다!',
        '✅ 이전 State 값을 기반으로 업데이트할 때는 항상 함수형 업데이트 (prev => ...) 를 사용하세요.'
      ]
    },
    {
      id: 'multiple-states',
      title: 'Managing Multiple States',
      titleKo: '여러 State 관리하기',
      content: `
## 여러 State를 효과적으로 관리하는 방법

컴포넌트가 복잡해지면 여러 개의 State가 필요합니다.
어떻게 구성할지는 상황에 따라 달라집니다.

### 개별 State vs 객체 State

**개별 State 사용 (권장 시나리오):**
- 서로 독립적으로 변경되는 값들
- 간단하고 명확한 업데이트 로직

\`\`\`tsx
// ✅ 서로 독립적인 값들
const [search, setSearch] = useState('');
const [category, setCategory] = useState('');
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
\`\`\`

**객체 State 사용 (권장 시나리오):**
- 항상 함께 변경되는 관련 값들
- 폼 데이터처럼 하나의 "덩어리"로 취급되는 데이터

\`\`\`tsx
// ✅ 폼 데이터는 하나의 객체로
const [form, setForm] = useState({
  name: '',
  email: '',
  phone: ''
});

// ✅ 좌표는 항상 함께 변경됨
const [position, setPosition] = useState({ x: 0, y: 0 });
\`\`\`

### 관련 State 그룹화

기능별로 State를 논리적으로 그룹화하면 코드를 이해하기 쉽습니다:

\`\`\`tsx
function DataPage() {
  // 📦 데이터 관련
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 필터 관련
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // 📄 페이지네이션 관련
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 🎛️ UI 상태 관련
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
}
\`\`\`

### State 끌어올리기 (Lifting State Up)

여러 컴포넌트가 같은 State를 공유해야 할 때,
공통 부모 컴포넌트로 State를 옮깁니다:

\`\`\`tsx
// 부모: State를 관리
function Parent() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <Sidebar selected={selected} onSelect={setSelected} />
      <Content selected={selected} />
    </div>
  );
}

// 자식들: Props로 받아서 사용
function Sidebar({ selected, onSelect }: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <nav>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={selected === item.id ? 'active' : ''}
        >
          {item.name}
        </button>
      ))}
    </nav>
  );
}

function Content({ selected }: { selected: string | null }) {
  if (!selected) return <p>항목을 선택하세요</p>;
  return <Detail id={selected} />;
}
\`\`\`

### 파생 상태 (Derived State)

기존 State에서 계산할 수 있는 값은 별도 State로 만들지 않습니다:

\`\`\`tsx
function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState('');

  // ❌ 불필요한 State
  // const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  // ✅ 렌더링 시 계산 (파생 상태)
  const filteredItems = items.filter(item =>
    item.name.includes(filter)
  );

  // ✅ 개수도 파생 상태
  const itemCount = filteredItems.length;

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <p>{itemCount}개 항목</p>
      {filteredItems.map(item => <Item key={item.id} item={item} />)}
    </div>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'state-grouping-pattern',
          title: 'State 그룹화 패턴',
          description: '기능별로 State를 논리적으로 분류',
          code: `interface DataState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

interface FilterState {
  search: string;
  category: string;
  status: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

function AdvancedList() {
  // 데이터 상태 (객체로 묶음)
  const [dataState, setDataState] = useState<DataState>({
    items: [],
    loading: true,
    error: null
  });

  // 필터 상태 (객체로 묶음)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    status: ''
  });

  // 페이지네이션 상태 (객체로 묶음)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // 업데이트 함수들
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // 필터 변경시 첫 페이지로
  };

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (/* ... */);
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ State가 5개 이상으로 늘어나면 useReducer나 커스텀 훅으로 분리하는 것을 고려하세요.',
        'ℹ️ 기존 State에서 계산할 수 있는 값(파생 상태)은 별도 State로 만들지 마세요. 불필요한 동기화 문제가 발생합니다.'
      ]
    },
    {
      id: 'real-world-example',
      title: 'Real-World Example: ConversationsPage',
      titleKo: '실전 예제: ConversationsPage의 필터 상태 관리',
      content: `
## 실제 프로젝트 분석: ConversationsPage

우리 프로젝트의 \`src/app/[locale]/dev/conversations/page.tsx\` 를 분석해봅시다.
이 페이지는 Claude 대화 목록을 보여주며, 복잡한 필터링과 상태 관리를 수행합니다.

### State 구조 분석

\`\`\`tsx
// 📦 데이터 관련 State
const [conversations, setConversations] = useState<Conversation[]>([]);
const [stats, setStats] = useState<Stats | null>(null);
const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// 🔍 필터 관련 State
const [search, setSearch] = useState('');
const [category, setCategory] = useState('');
const [difficulty, setDifficulty] = useState('');
const [branch, setBranch] = useState('');

// 📄 페이지네이션 State
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(6);
const [totalPages, setTotalPages] = useState(1);
const [total, setTotal] = useState(0);

// 🎛️ UI 상태
const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
const [selectionMode, setSelectionMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// 🗑️ 삭제 관련 State
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
const [deleting, setDeleting] = useState(false);

// 💬 피드백 State
const [snackbar, setSnackbar] = useState<{
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}>({
  open: false,
  message: '',
  severity: 'success'
});
\`\`\`

### 상태 관리 패턴 분석

#### 1. 검색 디바운싱

실시간 검색 시 API 호출을 최적화하기 위해 디바운싱을 적용합니다:

\`\`\`tsx
const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);  // 300ms 후에 실제 검색 실행
  }, 300);
  return () => clearTimeout(timer);
}, [search]);
\`\`\`

#### 2. Set을 활용한 선택 관리

다중 선택을 Set 자료구조로 효율적으로 관리합니다:

\`\`\`tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// 토글 선택
const handleToggleSelection = (id: string) => {
  setSelectedIds((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;  // 새 Set 반환 (불변성!)
  });
};

// 전체 선택
const handleSelectAll = () => {
  if (selectedIds.size === conversations.length) {
    setSelectedIds(new Set());  // 전체 해제
  } else {
    setSelectedIds(new Set(conversations.map(c => c.id)));  // 전체 선택
  }
};
\`\`\`

#### 3. 파생 상태 계산

활성 필터 개수는 기존 State에서 계산합니다:

\`\`\`tsx
// ✅ useMemo로 파생 상태 계산
const activeFilterCount = useMemo(() => {
  let count = 0;
  if (category) count++;
  if (difficulty) count++;
  if (branch) count++;
  return count;
}, [category, difficulty, branch]);
\`\`\`

#### 4. 필터 초기화

모든 필터 State를 한 번에 초기화하는 함수:

\`\`\`tsx
const clearFilters = () => {
  setSearch('');
  setCategory('');
  setDifficulty('');
  setBranch('');
};
\`\`\`

#### 5. 연관된 상태 동기화

필터가 변경되면 페이지를 1로 리셋합니다:

\`\`\`tsx
useEffect(() => {
  setPage(1);  // 필터 변경 시 첫 페이지로 이동
}, [debouncedSearch, category, difficulty, branch, pageSize]);
\`\`\`
      `,
      codeExamples: [
        {
          id: 'conversations-page-patterns',
          title: 'ConversationsPage 핵심 패턴 요약',
          description: '실제 프로젝트에서 사용하는 상태 관리 패턴',
          code: `// 1. 관련 State 그룹화
// 데이터 | 필터 | 페이지네이션 | UI | 삭제 | 피드백

// 2. 디바운싱으로 검색 최적화
const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 300);
  return () => clearTimeout(timer);
}, [search]);

// 3. Set으로 다중 선택 관리
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const toggleSelection = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};

// 4. useMemo로 파생 상태 계산
const activeFilterCount = useMemo(() => {
  return [category, difficulty, branch].filter(Boolean).length;
}, [category, difficulty, branch]);

// 5. 연관 상태 동기화 (필터 변경 → 페이지 리셋)
useEffect(() => {
  setPage(1);
}, [debouncedSearch, category, difficulty, branch]);

// 6. 복잡한 객체 State 업데이트
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' as const
});

const showSuccess = (message: string) => {
  setSnackbar({ open: true, message, severity: 'success' });
};

const closeSnackbar = () => {
  setSnackbar(prev => ({ ...prev, open: false }));
};`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ 검색 입력에는 디바운싱을 적용하여 불필요한 API 호출을 줄이세요. 300ms 정도가 적당합니다.',
        'ℹ️ Set 자료구조는 다중 선택 기능에 적합합니다. has(), add(), delete() 메서드로 효율적으로 관리할 수 있습니다.'
      ]
    },
    {
      id: 'common-mistakes',
      title: 'Common Mistakes and Best Practices',
      titleKo: '흔한 실수와 모범 사례',
      content: `
## State 사용 시 주의사항

### 실수 1: State 직접 수정

\`\`\`tsx
// ❌ 잘못된 예
const [items, setItems] = useState(['A', 'B']);
items.push('C');  // 직접 수정
setItems(items);  // 같은 참조라서 리렌더링 안 됨!

// ✅ 올바른 예
setItems([...items, 'C']);
\`\`\`

### 실수 2: 오래된 State 참조

\`\`\`tsx
// ❌ 잘못된 예 - 클로저로 인한 오래된 값 참조
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setTimeout(() => {
      setCount(count + 1);  // 클릭 시점의 count 값 사용
    }, 1000);
  };
}

// ✅ 올바른 예 - 함수형 업데이트
const handleClick = () => {
  setTimeout(() => {
    setCount(prev => prev + 1);  // 항상 최신 값 기반
  }, 1000);
};
\`\`\`

### 실수 3: 불필요한 State

\`\`\`tsx
// ❌ 파생 가능한 값을 State로 관리
const [items, setItems] = useState([...]);
const [itemCount, setItemCount] = useState(0);

// items가 바뀔 때마다 itemCount도 수동으로 업데이트해야 함

// ✅ 렌더링 시 계산
const [items, setItems] = useState([...]);
const itemCount = items.length;  // 자동으로 동기화됨
\`\`\`

### 실수 4: 조건문 안에서 useState 호출

\`\`\`tsx
// ❌ Hook은 조건문 안에서 호출 불가
function Component({ isAdmin }) {
  if (isAdmin) {
    const [adminData, setAdminData] = useState(null);  // 에러!
  }
}

// ✅ 항상 최상위에서 호출
function Component({ isAdmin }) {
  const [adminData, setAdminData] = useState(null);  // OK

  if (!isAdmin) return null;
  // adminData 사용...
}
\`\`\`

### 실수 5: 렌더링 중 State 업데이트

\`\`\`tsx
// ❌ 무한 루프 발생
function BadComponent() {
  const [count, setCount] = useState(0);
  setCount(count + 1);  // 렌더링마다 호출되어 무한 루프!
  return <div>{count}</div>;
}

// ✅ 이벤트 핸들러나 useEffect에서 업데이트
function GoodComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 마운트 시 1회만 실행
    setCount(1);
  }, []);

  return <div>{count}</div>;
}
\`\`\`

### 모범 사례 체크리스트

1. **State 선언**
   - ✅ 컴포넌트 최상위에서만 useState 호출
   - ✅ 복잡한 타입은 제네릭으로 명시
   - ✅ 의미 있는 초기값 설정

2. **State 업데이트**
   - ✅ 항상 새로운 값/객체/배열 전달 (불변성)
   - ✅ 이전 State 기반 업데이트는 함수형 사용
   - ✅ 배열: map, filter, spread 사용 (push, pop 금지)

3. **State 구조**
   - ✅ 파생 가능한 값은 State로 만들지 않음
   - ✅ 관련 State끼리 논리적으로 그룹화
   - ✅ 필요시 객체로 묶거나 커스텀 훅으로 분리

4. **성능**
   - ✅ 검색 입력에 디바운싱 적용
   - ✅ 파생 상태는 useMemo 고려
   - ✅ 불필요한 State 제거
      `,
      codeExamples: [
        {
          id: 'best-practices-list-component',
          title: '모범 사례를 적용한 리스트 컴포넌트',
          description: '여러 모범 사례를 적용한 종합 예제',
          code: `import { useState, useMemo, useCallback } from 'react';

interface Item {
  id: string;
  name: string;
  category: string;
}

function ItemListPage() {
  // ✅ 명확한 타입과 초기값
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // ✅ 파생 상태는 useMemo로 계산
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory = category === 'all'
        || item.category === category;
      return matchSearch && matchCategory;
    });
  }, [items, search, category]);

  // ✅ 추가: 불변성 유지, 함수형 업데이트
  const addItem = useCallback((newItem: Omit<Item, 'id'>) => {
    setItems(prev => [...prev, {
      ...newItem,
      id: crypto.randomUUID()
    }]);
  }, []);

  // ✅ 삭제: filter 사용
  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // ✅ 수정: map 사용
  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="검색..."
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
      >
        <option value="all">전체</option>
        <option value="A">카테고리 A</option>
        <option value="B">카테고리 B</option>
      </select>

      {/* ✅ 파생 상태 사용 */}
      <p>{filteredItems.length}개 항목</p>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <ul>
          {filteredItems.map(item => (
            <li key={item.id}>
              {item.name}
              <button onClick={() => deleteItem(item.id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '🚫 렌더링 중(컴포넌트 함수 본문)에서 setState를 직접 호출하면 무한 루프가 발생합니다!',
        '✅ State 수가 많아지면 useReducer나 커스텀 훅으로 로직을 분리하세요. 다음 챕터에서 배웁니다.'
      ]
    },
    {
      id: 'summary',
      title: 'Chapter Summary',
      titleKo: '요약',
      content: `
## Chapter 5 핵심 정리

### State의 개념
- **State** 는 컴포넌트가 기억해야 하는 동적 데이터
- Props는 외부에서 받는 읽기 전용 값, State는 내부에서 관리하는 변경 가능한 값
- State가 변경되면 컴포넌트가 **리렌더링** 됨

### useState 사용법
\`\`\`tsx
const [value, setValue] = useState(initialValue);
const [data, setData] = useState<Type | null>(null);
\`\`\`

### 불변성 규칙
- 원시 타입: 새 값 전달 → \`setValue(newValue)\`
- 객체: 스프레드로 복사 → \`setObj({ ...obj, key: value })\`
- 배열: map, filter, spread 사용 → \`setArr([...arr, newItem])\`
- 이전 값 기반: 함수형 업데이트 → \`setValue(prev => prev + 1)\`

### 여러 State 관리
- 독립적인 값들은 개별 State로
- 관련된 값들은 객체로 그룹화
- 파생 상태는 State가 아닌 계산으로
- State가 많아지면 커스텀 훅으로 분리

### 핵심 실수 피하기
- ❌ State 직접 수정 (obj.key = value)
- ❌ 조건문/반복문 안에서 useState 호출
- ❌ 렌더링 중 setState 호출
- ❌ 파생 가능한 값을 State로 만들기

### 다음 단계
- **Chapter 6** : useEffect로 사이드 이펙트 관리
- **Chapter 7** : 이벤트 핸들링 심화
- **Chapter 8** : 커스텀 훅 만들기
      `
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - State: A Component\'s Memory',
      url: 'https://react.dev/learn/state-a-components-memory',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - useState',
      url: 'https://react.dev/reference/react/useState',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - Updating Objects in State',
      url: 'https://react.dev/learn/updating-objects-in-state',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - Updating Arrays in State',
      url: 'https://react.dev/learn/updating-arrays-in-state',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
