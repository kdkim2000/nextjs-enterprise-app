/**
 * Chapter 8: 리스트와 Key
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'lists-and-keys',
  order: 8,
  title: 'Lists and Keys',
  titleKo: '리스트와 Key',
  description: 'Learn how to render arrays and understand the importance of keys in React.',
  descriptionKo: '배열 데이터 렌더링 방법과 React에서 Key의 중요성을 이해합니다.',
  estimatedMinutes: 35,
  objectives: [
    'Render arrays using the map() method',
    'Understand the role and importance of keys',
    'Apply proper key selection criteria',
    'Handle various list rendering patterns'
  ],
  objectivesKo: [
    'map() 메서드로 배열 데이터를 렌더링한다',
    'Key의 역할과 중요성을 이해한다',
    '올바른 Key 선택 기준을 적용한다',
    '다양한 리스트 렌더링 패턴을 다룬다'
  ],
  sections: [
    {
      id: 'array-rendering-basics',
      title: 'Array Rendering Basics',
      titleKo: '배열 렌더링 기초',
      content: `
## 배열 데이터를 UI로 변환하기

React에서 배열 데이터를 렌더링할 때는 JavaScript의 \`map()\` 메서드를 사용합니다.
map()은 배열의 각 요소를 JSX 요소로 변환합니다.

### 기본 문법

\`\`\`tsx
// 배열.map((요소, 인덱스) => JSX)
{items.map((item) => (
  <Component key={item.id} data={item} />
))}
\`\`\`

### 왜 map()을 사용할까?

- **선언적 접근**: 무엇을 렌더링할지 선언
- **불변성 유지**: 원본 배열을 변경하지 않음
- **간결한 코드**: for 루프보다 읽기 쉬움
`,
      codeExamples: [
        {
          id: 'basic-map-example',
          title: '기본 map() 사용',
          language: 'tsx',
          code: `// 간단한 문자열 배열 렌더링
const fruits = ['🍎 Apple', '🍌 Banana', '🍊 Orange'];

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}

// 객체 배열 렌더링
interface Category {
  id: string;
  label: string;
  icon: ReactNode;
}

const categories: Category[] = [
  { id: 'react', label: 'React', icon: <Code /> },
  { id: 'nextjs', label: 'Next.js', icon: <Web /> },
  { id: 'typescript', label: 'TypeScript', icon: <TypeScript /> }
];

function CategoryList() {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {categories.map((cat) => (
        <Chip
          key={cat.id}  // ✅ 고유 id 사용
          icon={cat.icon}
          label={cat.label}
        />
      ))}
    </Box>
  );
}`,
          description: '문자열 배열과 객체 배열의 기본 렌더링 패턴입니다.'
        }
      ],
      tips: [
        '💡 map()은 항상 새 배열을 반환하므로 원본 데이터가 변경되지 않습니다.',
        '⚠️ map() 콜백에서 반드시 JSX를 return 해야 합니다. 중괄호 {}를 쓰면 return 필수!'
      ]
    },
    {
      id: 'filterOptions-pattern',
      title: 'filterOptions.map() Pattern',
      titleKo: 'filterOptions.map() 패턴',
      content: `
## 실제 프로젝트의 필터 옵션 렌더링

ConversationsPage에서 사용하는 \`filterOptions.categories.map()\` 패턴을 살펴봅니다.
API에서 받은 필터 옵션을 동적으로 Select 메뉴에 렌더링합니다.

### filterOptions 구조

\`\`\`tsx
interface FilterOptions {
  categories: string[];      // ['feature', 'bug-fix', 'refactor', ...]
  difficulties: string[];    // ['easy', 'medium', 'hard', 'expert']
  branches: string[];        // ['main', '13-claude', ...]
}
\`\`\`

### Optional Chaining과 함께 사용

API 응답이 아직 없을 수 있으므로 \`?.\` (옵셔널 체이닝)과 함께 사용합니다:

\`\`\`tsx
{filterOptions?.categories.map((cat) => (
  <MenuItem key={cat} value={cat}>
    {cat}
  </MenuItem>
))}
\`\`\`
`,
      codeExamples: [
        {
          id: 'filter-options-select',
          title: 'ConversationsPage 필터 Select',
          language: 'tsx',
          code: `// src/app/[locale]/dev/conversations/page.tsx
const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
const [category, setCategory] = useState('');

// API에서 필터 옵션 로드
useEffect(() => {
  const fetchFilters = async () => {
    const res = await fetch('/api/conversations/filters');
    const data = await res.json();
    setFilterOptions(data);
  };
  fetchFilters();
}, []);

// 렌더링
<FormControl size="small" sx={{ minWidth: 160 }}>
  <InputLabel>Category</InputLabel>
  <Select
    value={category}
    label="Category"
    onChange={(e) => setCategory(e.target.value)}
  >
    <MenuItem value="">All</MenuItem>
    {/* ✅ Optional chaining으로 안전하게 접근 */}
    {filterOptions?.categories.map((cat) => (
      <MenuItem key={cat} value={cat}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: categoryConfigs[cat]?.color }}>
            {categoryConfigs[cat]?.icon}
          </Box>
          <Typography variant="body2">
            {categoryConfigs[cat]?.label || cat}
          </Typography>
        </Box>
      </MenuItem>
    ))}
  </Select>
</FormControl>`,
          description: 'API 응답 데이터를 동적으로 Select 옵션으로 렌더링합니다.'
        },
        {
          id: 'difficulty-filter',
          title: 'Difficulty 필터 렌더링',
          language: 'tsx',
          code: `// 난이도별 색상 매핑
const difficultyColors: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
  expert: '#8b5cf6'
};

// Difficulty Select
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
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: \`\${difficultyColors[diff]}15\`,  // 15 = 투명도
            color: difficultyColors[diff],
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'capitalize'
          }}
        >
          {diff}
        </Box>
      </MenuItem>
    ))}
  </Select>
</FormControl>`,
          description: '각 옵션에 스타일을 적용한 고급 렌더링 패턴입니다.'
        }
      ],
      tips: [
        '✅ filterOptions가 null일 수 있으므로 항상 optional chaining (?.) 사용',
        '💡 문자열 자체가 고유하다면 key로 사용 가능 (key={cat})',
        'ℹ️ fallback 값 제공: categoryConfigs[cat]?.label || cat'
      ]
    },
    {
      id: 'key-importance',
      title: 'The Role of Keys',
      titleKo: 'Key의 역할과 중요성',
      content: `
## Key가 왜 중요한가?

React는 Key를 사용하여 어떤 요소가 변경, 추가, 삭제되었는지 식별합니다.
Key는 React의 재조정(Reconciliation) 알고리즘의 핵심입니다.

### Key 없이 렌더링하면?

\`\`\`tsx
// ❌ Key 없음 - 경고 발생!
{items.map((item) => (
  <div>{item.name}</div>
))}
// Warning: Each child in a list should have a unique "key" prop.
\`\`\`

### Key의 역할

1. **요소 식별**: 배열의 각 요소를 고유하게 식별
2. **효율적 업데이트**: 변경된 요소만 업데이트
3. **상태 유지**: 컴포넌트의 상태를 올바르게 유지

### Key가 없으면 생기는 문제

\`\`\`
초기 상태:   [A, B, C]
새 상태:     [A, X, B, C]

Key 없을 때 React의 인식:
- B가 X로 변경됨
- C가 B로 변경됨
- C가 새로 추가됨
→ 3개 요소 모두 다시 렌더링! 😰

Key 있을 때:
- A 유지
- X가 새로 추가됨
- B 유지, C 유지
→ 1개만 추가! 🚀
\`\`\`
`,
      codeExamples: [
        {
          id: 'key-comparison',
          title: 'Key 유무에 따른 동작 차이',
          language: 'tsx',
          code: `// ❌ 잘못된 예: Key 없음
function BadList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li>{item.name}</li>  // 경고 발생!
      ))}
    </ul>
  );
}

// ⚠️ 위험한 예: index를 Key로 사용
function RiskyList({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item.name}</li>  // 순서 변경 시 문제!
      ))}
    </ul>
  );
}

// ✅ 올바른 예: 고유 ID를 Key로 사용
function GoodList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>  // 완벽!
      ))}
    </ul>
  );
}`,
          description: 'Key 사용 방법에 따른 차이를 보여줍니다.'
        },
        {
          id: 'key-state-problem',
          title: 'index Key의 상태 문제',
          language: 'tsx',
          code: `// index를 Key로 사용할 때 발생하는 문제
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build App' },
    { id: 3, text: 'Deploy' }
  ]);

  const addFirst = () => {
    setTodos([
      { id: Date.now(), text: 'New Task' },
      ...todos  // 맨 앞에 추가
    ]);
  };

  return (
    <div>
      <button onClick={addFirst}>Add First</button>

      {/* ❌ index Key: 모든 input의 상태가 뒤섞임! */}
      {todos.map((todo, index) => (
        <div key={index}>
          <input defaultValue={todo.text} />
        </div>
      ))}

      {/* ✅ ID Key: 상태가 올바르게 유지됨 */}
      {todos.map((todo) => (
        <div key={todo.id}>
          <input defaultValue={todo.text} />
        </div>
      ))}
    </div>
  );
}`,
          description: '맨 앞에 항목 추가 시 index key는 상태를 잘못 매칭합니다.'
        }
      ],
      tips: [
        '🚫 Key는 형제 요소 간에만 고유하면 됩니다. 전역적으로 고유할 필요 없음!',
        '⚠️ index를 Key로 쓰면: 추가/삭제/정렬 시 버그 발생 가능',
        '✅ DB의 id, uuid, 또는 고유한 비즈니스 키 사용 권장'
      ]
    },
    {
      id: 'key-selection-criteria',
      title: 'Key Selection Criteria',
      titleKo: 'Key 선택 기준',
      content: `
## 올바른 Key 선택하기

### Key 선택 우선순위

1. **데이터의 고유 ID** (가장 권장)
   - DB의 primary key
   - API 응답의 id 필드
   - UUID

2. **비즈니스적으로 고유한 값**
   - 이메일 주소
   - 사용자명
   - 파일 경로

3. **조합 키**
   - 여러 필드를 조합 (category + name)

4. **index** (마지막 수단)
   - 정적 리스트만
   - 재정렬/필터링이 없을 때만

### Key로 사용하면 안 되는 것

\`\`\`tsx
// ❌ 매 렌더링마다 새 값 생성
key={Math.random()}
key={Date.now()}
key={uuid()}  // 렌더링마다 호출 시

// ❌ 안정적이지 않은 값
key={item.name}  // 이름이 변경될 수 있음
\`\`\`
`,
      codeExamples: [
        {
          id: 'key-selection-examples',
          title: '다양한 Key 선택 예시',
          language: 'tsx',
          code: `// ✅ DB ID 사용 (가장 좋음)
interface Conversation {
  id: number;           // ← Key로 사용
  title: string;
  category: string;
}

{conversations.map((conv) => (
  <ConversationCard key={conv.id} conversation={conv} />
))}

// ✅ 문자열 고유값 사용
interface Branch {
  name: string;  // 'main', '13-claude' 등 고유
}

{filterOptions?.branches.map((br) => (
  <MenuItem key={br} value={br}>
    {br}
  </MenuItem>
))}

// ✅ 조합 키 사용
interface MenuItem {
  category: string;
  name: string;
}

{menuItems.map((item) => (
  <ListItem key={\`\${item.category}-\${item.name}\`}>
    {item.name}
  </ListItem>
))}

// ⚠️ index 사용 (정적 리스트만!)
const staticTabs = ['Overview', 'Details', 'Settings'];

{staticTabs.map((tab, index) => (
  <Tab key={index} label={tab} />  // 순서 변경 없으면 OK
))}`,
          description: '상황에 맞는 Key 선택 방법입니다.'
        },
        {
          id: 'cardgrid-key-pattern',
          title: 'CardGrid의 Key 사용',
          language: 'tsx',
          code: `// src/components/common/CardGrid/index.tsx
export default function CardGrid<T>({
  items,
  renderCard,
  ...
}: CardGridProps<T>) {
  return (
    <Box sx={sx}>
      <Grid container spacing={spacing}>
        {items.map((item, index) => (
          <Grid item key={index} {...columns}>
            {/* renderCard에서 item의 고유성 보장 필요 */}
            {renderCard(item, index)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// 사용 예시 - ChapterCard
<CardGrid
  items={chapters}
  renderCard={(chapter, index) => (
    // CardGrid는 index를 key로 사용하지만,
    // 실제 데이터(chapters)는 재정렬되지 않으므로 안전
    <ChapterCard
      chapter={chapter}
      index={index}
      courseColor={courseMeta.color}
      onClick={() => handleChapterClick(chapter.id)}
    />
  )}
/>`,
          description: 'CardGrid 컴포넌트의 Key 사용 패턴입니다.'
        }
      ],
      tips: [
        '💡 Key는 props로 전달되지 않습니다. 컴포넌트 내에서 사용 불가!',
        '✅ Key가 필요하면 별도 prop으로 전달: <Component key={id} id={id} />',
        'ℹ️ 같은 배열 내에서만 고유하면 됩니다. 다른 배열과 중복 OK'
      ]
    },
    {
      id: 'object-entries-pattern',
      title: 'Object.entries() Pattern',
      titleKo: 'Object.entries() 패턴',
      content: `
## 객체를 리스트로 렌더링하기

배열이 아닌 객체 데이터를 렌더링할 때는 \`Object.entries()\`, \`Object.keys()\`,
\`Object.values()\`를 사용합니다.

### Object 메서드 비교

\`\`\`tsx
const stats = { react: 10, nextjs: 5, typescript: 8 };

Object.keys(stats)     // ['react', 'nextjs', 'typescript']
Object.values(stats)   // [10, 5, 8]
Object.entries(stats)  // [['react', 10], ['nextjs', 5], ['typescript', 8]]
\`\`\`

### ConversationsPage의 Quick Filters

stats.byCategory 객체를 Chip 리스트로 렌더링합니다:

\`\`\`tsx
interface Stats {
  byCategory: Record<string, number>;  // { feature: 15, bug-fix: 8, ... }
}
\`\`\`
`,
      codeExamples: [
        {
          id: 'object-entries-quick-filter',
          title: 'Category Quick Filters',
          language: 'tsx',
          code: `// src/app/[locale]/dev/conversations/page.tsx
const [stats, setStats] = useState<Stats | null>(null);
const [category, setCategory] = useState('');

// Object.entries()로 객체를 [key, value] 배열로 변환
{stats && (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
    {Object.entries(stats.byCategory).map(([cat, count]) => (
      <Chip
        key={cat}  // key는 객체의 key (카테고리명)
        icon={categoryConfigs[cat]?.icon as React.ReactElement}
        label={\`\${categoryConfigs[cat]?.label || cat} (\${count})\`}
        onClick={() => setCategory(category === cat ? '' : cat)}
        size="small"
        sx={{
          // 선택 상태에 따른 스타일
          bgcolor: category === cat
            ? categoryConfigs[cat]?.color
            : 'white',
          color: category === cat
            ? 'white'
            : categoryConfigs[cat]?.color,
          borderColor: categoryConfigs[cat]?.color,
          border: '1px solid',
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: category === cat
              ? 'white'
              : categoryConfigs[cat]?.color
          }
        }}
      />
    ))}
  </Box>
)}`,
          description: 'Object.entries()로 카테고리별 통계를 Chip으로 렌더링합니다.'
        },
        {
          id: 'stat-cards-grid',
          title: 'StatCard Grid 렌더링',
          language: 'tsx',
          code: `// 통계 데이터 객체
const statsData = {
  total: { value: 156, label: 'Total', color: 'primary' },
  published: { value: 142, label: 'Published', color: 'success' },
  draft: { value: 14, label: 'Draft', color: 'warning' }
};

// Object.entries()로 렌더링
<Grid container spacing={2}>
  {Object.entries(statsData).map(([key, stat]) => (
    <Grid item xs={12} sm={4} key={key}>
      <StatCard
        value={stat.value}
        label={stat.label}
        color={stat.color as 'primary' | 'success' | 'warning'}
      />
    </Grid>
  ))}
</Grid>

// Object.values()도 가능 (key 불필요 시)
<Grid container spacing={2}>
  {Object.values(statsData).map((stat, index) => (
    <Grid item xs={12} sm={4} key={index}>
      <StatCard {...stat} />
    </Grid>
  ))}
</Grid>`,
          description: '객체의 values를 순회하며 카드를 렌더링합니다.'
        }
      ],
      tips: [
        '💡 Object.entries()는 [key, value] 튜플을 반환합니다. 구조분해로 받으세요!',
        '✅ 객체의 key가 고유하다면 그대로 React key로 사용 가능',
        'ℹ️ TypeScript에서 Record<K, V> 타입을 활용하면 타입 안전성 확보'
      ]
    },
    {
      id: 'nested-lists',
      title: 'Nested Lists and Fragments',
      titleKo: '중첩 리스트와 Fragment',
      content: `
## 중첩된 리스트 렌더링

리스트 안에 리스트가 있는 경우, 각 레벨마다 적절한 Key를 부여해야 합니다.

### Fragment와 Key

여러 요소를 그룹으로 반환할 때 Fragment에 Key를 부여할 수 있습니다:

\`\`\`tsx
// <> </> 축약형은 key 불가!
{items.map((item) => (
  <>  {/* ❌ key 지정 불가 */}
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </>
))}

// React.Fragment는 key 가능!
{items.map((item) => (
  <React.Fragment key={item.id}>  {/* ✅ */}
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </React.Fragment>
))}
\`\`\`
`,
      codeExamples: [
        {
          id: 'nested-list-example',
          title: '중첩 리스트 예시',
          language: 'tsx',
          code: `// 카테고리 > 서브카테고리 구조
interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

const categories: Category[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    subcategories: [
      { id: 'react', name: 'React' },
      { id: 'vue', name: 'Vue' }
    ]
  },
  {
    id: 'backend',
    name: 'Backend',
    subcategories: [
      { id: 'node', name: 'Node.js' },
      { id: 'python', name: 'Python' }
    ]
  }
];

function CategoryTree() {
  return (
    <List>
      {categories.map((cat) => (
        <React.Fragment key={cat.id}>
          {/* 카테고리 헤더 */}
          <ListSubheader>{cat.name}</ListSubheader>

          {/* 서브카테고리 리스트 */}
          {cat.subcategories.map((sub) => (
            <ListItem key={sub.id}>
              <ListItemText primary={sub.name} />
            </ListItem>
          ))}
        </React.Fragment>
      ))}
    </List>
  );
}`,
          description: '중첩된 데이터 구조를 렌더링할 때 각 레벨에 key를 부여합니다.'
        },
        {
          id: 'skeleton-list-pattern',
          title: 'Skeleton 로딩 리스트',
          language: 'tsx',
          code: `// CardGrid의 Skeleton 렌더링
// Array.from()으로 고정 개수 배열 생성

function CardGrid<T>({
  loading = false,
  skeletonCount = 6,
  renderSkeleton,
  ...
}: CardGridProps<T>) {

  // 로딩 스켈레톤 렌더링
  if (loading) {
    return (
      <Box sx={sx}>
        <Grid container spacing={spacing}>
          {/* Array.from으로 지정된 개수만큼 생성 */}
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <Grid item key={idx} {...columns}>
              {renderSkeleton ? renderSkeleton() : <DefaultSkeleton />}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // 실제 데이터 렌더링...
}

// 사용 예시
<CardGrid
  items={conversations}
  loading={isLoading}
  skeletonCount={12}  // 12개의 스켈레톤 표시
  renderCard={(conv) => (
    <ConversationCard conversation={conv} />
  )}
/>`,
          description: 'Array.from()을 사용한 스켈레톤 로딩 패턴입니다.'
        }
      ],
      tips: [
        '⚠️ <> </> Fragment 축약형에는 key를 사용할 수 없습니다!',
        '✅ key가 필요하면 <React.Fragment key={...}> 전체 형태 사용',
        '💡 Array.from({ length: n })으로 고정 개수 배열 생성 가능'
      ]
    },
    {
      id: 'filter-sort-map',
      title: 'Filter, Sort, and Map',
      titleKo: '필터, 정렬, 그리고 매핑',
      content: `
## 데이터 변환 체인

실제 애플리케이션에서는 데이터를 필터링하고 정렬한 후 렌더링하는 경우가 많습니다.
JavaScript의 배열 메서드를 체인으로 연결합니다.

### 일반적인 패턴

\`\`\`tsx
{items
  .filter((item) => /* 필터 조건 */)
  .sort((a, b) => /* 정렬 기준 */)
  .map((item) => /* JSX 변환 */)}
\`\`\`

### 주의: Key 위치

filter나 sort 후에도 Key는 map의 결과에만 필요합니다:

\`\`\`tsx
{items
  .filter(item => item.active)  // Key 불필요
  .sort((a, b) => a.name.localeCompare(b.name))  // Key 불필요
  .map(item => (
    <Card key={item.id} />  // ✅ 여기만 Key 필요
  ))}
\`\`\`
`,
      codeExamples: [
        {
          id: 'filter-sort-map-example',
          title: '필터링 및 정렬 후 렌더링',
          language: 'tsx',
          code: `// ConversationsPage의 데이터 변환 체인
const [conversations, setConversations] = useState<Conversation[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [category, setCategory] = useState('');
const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

// 필터링된 데이터
const filteredConversations = conversations
  // 1. 검색어 필터
  .filter((conv) =>
    searchQuery === '' ||
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  // 2. 카테고리 필터
  .filter((conv) =>
    category === '' ||
    conv.category === category
  )
  // 3. 정렬
  .sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.title.localeCompare(b.title);
  });

// 렌더링
<CardGrid
  items={filteredConversations}
  renderCard={(conv) => (
    <ConversationCard
      key={conv.id}  // 실제로 CardGrid 내부에서 처리
      conversation={conv}
    />
  )}
/>`,
          description: 'filter → sort → map 체인 패턴입니다.'
        },
        {
          id: 'usememo-optimization',
          title: 'useMemo로 최적화',
          language: 'tsx',
          code: `// 불필요한 재계산 방지
import { useMemo } from 'react';

function ConversationList({ conversations, category, searchQuery }) {
  // 의존성이 변경될 때만 재계산
  const filteredConversations = useMemo(() => {
    console.log('Filtering conversations...');  // 필터링 실행 확인

    return conversations
      .filter((conv) =>
        category === '' || conv.category === category
      )
      .filter((conv) =>
        searchQuery === '' ||
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [conversations, category, searchQuery]);  // 의존성 배열

  return (
    <div>
      <Typography>
        {filteredConversations.length} results
      </Typography>
      {filteredConversations.map((conv) => (
        <ConversationCard key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}`,
          description: 'useMemo로 복잡한 계산을 메모이제이션합니다.'
        }
      ],
      tips: [
        '💡 filter, sort는 새 배열을 반환하므로 원본 불변',
        '✅ 복잡한 필터/정렬 로직은 useMemo로 최적화 고려',
        'ℹ️ 체인이 길어지면 별도 변수로 분리하여 가독성 확보'
      ]
    }
  ],
  status: 'ready'
};

export default chapter;
