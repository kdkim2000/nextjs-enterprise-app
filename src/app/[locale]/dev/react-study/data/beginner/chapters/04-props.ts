/**
 * Chapter 4: Props - 데이터 전달하기
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'props',
  order: 4,
  title: 'Props - Passing Data',
  titleKo: 'Props - 데이터 전달하기',
  description: 'Learn how to pass data between components using props.',
  descriptionKo: 'Props를 사용하여 컴포넌트 간 데이터를 전달하는 방법을 학습합니다.',
  estimatedMinutes: 50,
  objectives: [
    'Understand the concept and role of props',
    'Pass and use props correctly',
    'Define props types with TypeScript',
    'Set default values for props',
    'Use children props'
  ],
  objectivesKo: [
    'Props의 개념과 역할을 이해한다',
    'Props를 올바르게 전달하고 사용한다',
    'TypeScript로 Props 타입을 정의한다',
    'Props의 기본값을 설정한다',
    'children props를 사용한다'
  ],
  sections: [
    {
      id: 'props-concept',
      title: 'Props의 개념과 역할',
      content: `
**Props(Properties)** 는 부모 컴포넌트가 자식 컴포넌트에게 **데이터를 전달** 하는 방법입니다.

### Props란?

Props는 컴포넌트의 **입력값** 입니다. 함수의 매개변수와 같은 역할을 합니다.

\`\`\`tsx
// 일반 함수
function greet(name: string) {
  return \`안녕하세요, \${name}님!\`;
}
greet('홍길동');

// React 컴포넌트 - props가 매개변수 역할
function Greeting({ name }: { name: string }) {
  return <h1>안녕하세요, {name}님!</h1>;
}
<Greeting name="홍길동" />
\`\`\`

### Props의 특징

**1. 읽기 전용 (Read-Only)**

Props는 **수정할 수 없습니다**. 자식 컴포넌트에서 props를 변경하면 안 됩니다.

\`\`\`tsx
// ❌ 잘못됨 - props 수정 불가
function UserCard({ name }: { name: string }) {
  name = '다른이름';  // Error!
  return <div>{name}</div>;
}

// ✅ 올바름 - 필요하면 지역 변수 사용
function UserCard({ name }: { name: string }) {
  const displayName = name.toUpperCase();
  return <div>{displayName}</div>;
}
\`\`\`

**2. 단방향 데이터 흐름**

데이터는 **부모 → 자식** 방향으로만 흐릅니다.

\`\`\`
App (데이터 소유)
  ↓ props 전달
UserList ({ users })
  ↓ props 전달
UserCard ({ user })
\`\`\`

**3. 모든 타입 전달 가능**

문자열, 숫자, 배열, 객체, 함수, JSX 등 모든 JavaScript 값을 전달할 수 있습니다.

\`\`\`tsx
<Component
  text="문자열"
  count={42}
  isActive={true}
  items={['a', 'b', 'c']}
  user={{ name: '홍길동', age: 30 }}
  onClick={() => console.log('clicked')}
  icon={<SearchIcon />}
/>
\`\`\`
      `,
      tips: [
        'Props는 "properties"의 줄임말입니다.',
        'Props가 변경되면 React는 자동으로 컴포넌트를 다시 렌더링합니다.'
      ]
    },
    {
      id: 'props-usage',
      title: 'Props 전달 및 사용법',
      content: `
Props를 전달하고 사용하는 다양한 방법을 알아봅시다.

### 기본 전달 방법

\`\`\`tsx
// 부모 컴포넌트
function App() {
  return (
    <UserCard
      name="홍길동"           {/* 문자열 */}
      age={30}               {/* 숫자 */}
      isAdmin={true}         {/* boolean */}
      hobbies={['독서', '운동']}  {/* 배열 */}
    />
  );
}

// 자식 컴포넌트
function UserCard({ name, age, isAdmin, hobbies }) {
  return (
    <div>
      <h2>{name} ({age}세)</h2>
      {isAdmin && <span>관리자</span>}
      <ul>
        {hobbies.map(hobby => <li key={hobby}>{hobby}</li>)}
      </ul>
    </div>
  );
}
\`\`\`

### 구조 분해 할당 (Destructuring)

\`\`\`tsx
// 방법 1: 매개변수에서 바로 구조 분해 (권장)
function UserCard({ name, age, isAdmin }) {
  return <div>{name}</div>;
}

// 방법 2: props 객체로 받아서 분해
function UserCard(props) {
  const { name, age, isAdmin } = props;
  return <div>{name}</div>;
}

// 방법 3: 나머지 연산자 (...rest)
function Button({ children, variant, ...rest }) {
  return (
    <button className={variant} {...rest}>
      {children}
    </button>
  );
}
// 사용: <Button variant="primary" onClick={fn} disabled>클릭</Button>
\`\`\`

### Spread 연산자로 Props 전달

\`\`\`tsx
// 객체의 모든 속성을 props로 전달
const userProps = {
  name: '홍길동',
  age: 30,
  email: 'hong@example.com'
};

// 개별 전달
<UserCard name={userProps.name} age={userProps.age} email={userProps.email} />

// Spread로 한 번에 전달
<UserCard {...userProps} />
\`\`\`

### 함수(콜백) 전달

\`\`\`tsx
// 부모
function App() {
  const handleClick = (id: string) => {
    console.log('클릭된 ID:', id);
  };

  return <UserCard userId="123" onSelect={handleClick} />;
}

// 자식
function UserCard({ userId, onSelect }) {
  return (
    <button onClick={() => onSelect(userId)}>
      선택
    </button>
  );
}
\`\`\`
      `,
      tips: [
        'Spread 연산자는 편리하지만, 어떤 props가 전달되는지 명확하지 않을 수 있으니 주의하세요.',
        '함수를 props로 전달할 때는 on 접두사를 사용하는 것이 관례입니다 (onClick, onSubmit, onChange).'
      ]
    },
    {
      id: 'typescript-props',
      title: 'TypeScript로 Props 타입 정의',
      content: `
TypeScript를 사용하면 Props의 **타입을 명확히 정의** 하여 오류를 방지할 수 있습니다.

### interface로 정의 (권장)

\`\`\`tsx
// Props 인터페이스 정의
interface UserCardProps {
  name: string;
  age: number;
  email?: string;      // 선택적 prop (?)
  isAdmin: boolean;
  onSelect: (id: string) => void;  // 함수 타입
}

// 컴포넌트에 적용
function UserCard({ name, age, email, isAdmin, onSelect }: UserCardProps) {
  return (
    <div>
      <h2>{name}</h2>
      {email && <p>{email}</p>}
    </div>
  );
}
\`\`\`

### type으로 정의

\`\`\`tsx
// type alias 사용
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'danger';  // 유니온 타입
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
};

function Button({ variant, size = 'medium', disabled, children }: ButtonProps) {
  return (
    <button
      className={\`btn-\${variant} btn-\${size}\`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
\`\`\`

### 자주 사용하는 타입들

\`\`\`tsx
interface CommonProps {
  // 기본 타입
  text: string;
  count: number;
  isActive: boolean;

  // 배열
  items: string[];
  users: User[];

  // 객체
  config: { theme: string; language: string };

  // 함수
  onClick: () => void;
  onChange: (value: string) => void;
  onSubmit: (data: FormData) => Promise<void>;

  // React 관련
  children: React.ReactNode;        // 모든 렌더링 가능한 것
  element: React.ReactElement;       // JSX 요소만
  style?: React.CSSProperties;       // 인라인 스타일
  className?: string;

  // MUI 관련
  sx?: SxProps<Theme>;              // MUI sx prop
}
\`\`\`

### Export로 재사용

\`\`\`tsx
// types.ts 또는 컴포넌트 파일 상단
export interface CardGridProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  columns?: { xs?: number; sm?: number; md?: number };
}

// 다른 파일에서 import
import { CardGridProps } from './types';
\`\`\`
      `,
      tips: [
        'interface는 확장(extends)이 쉽고, type은 유니온 타입 정의에 유리합니다.',
        'Props 타입 이름은 컴포넌트명 + Props가 관례입니다 (UserCardProps, ButtonProps).'
      ]
    },
    {
      id: 'default-values',
      title: '기본값 설정',
      content: `
Props에 기본값을 설정하면 해당 prop이 전달되지 않았을 때 기본값이 사용됩니다.

### 구조 분해 기본값 (권장)

가장 간단하고 권장되는 방법입니다.

\`\`\`tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
}

function Button({
  variant = 'primary',    // 기본값: 'primary'
  size = 'medium',        // 기본값: 'medium'
  disabled = false,       // 기본값: false
  children
}: ButtonProps) {
  return (
    <button
      className={\`btn-\${variant} btn-\${size}\`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// 사용
<Button>기본 버튼</Button>
// variant='primary', size='medium', disabled=false

<Button variant="danger" size="large">삭제</Button>
// variant='danger', size='large', disabled=false
\`\`\`

### 실제 프로젝트 예시

\`\`\`tsx
// CardGrid 컴포넌트
function CardGrid<T>({
  items,
  renderCard,
  loading = false,              // 기본값: false
  skeletonCount = 6,            // 기본값: 6
  columns = { xs: 12, sm: 6, md: 4 },  // 기본값: 반응형 그리드
  spacing = 2.5                 // 기본값: 2.5
}: CardGridProps<T>) {
  // ...
}

// QuickSearchBar 컴포넌트
function QuickSearchBar({
  searchValue,
  onSearchChange,
  placeholder = 'Search...',      // 기본값
  searching = false,              // 기본값
  showAdvancedButton = true,      // 기본값
  activeFilterCount = 0           // 기본값
}: QuickSearchBarProps) {
  // ...
}
\`\`\`

### defaultProps (구식, 권장하지 않음)

\`\`\`tsx
// ❌ 구식 방법 - 사용하지 마세요
function Button({ variant, size }: ButtonProps) { ... }
Button.defaultProps = {
  variant: 'primary',
  size: 'medium'
};

// ✅ 권장 - 구조 분해 기본값 사용
function Button({ variant = 'primary', size = 'medium' }: ButtonProps) { ... }
\`\`\`

### 기본값 설정 시 주의점

\`\`\`tsx
// ⚠️ 객체/배열 기본값은 컴포넌트 외부에 정의
const DEFAULT_COLUMNS = { xs: 12, sm: 6, md: 4 };
const DEFAULT_OPTIONS = ['option1', 'option2'];

function Grid({
  columns = DEFAULT_COLUMNS,  // ✅ 외부 상수 참조
  options = DEFAULT_OPTIONS
}: GridProps) { ... }

// ❌ 매번 새 객체가 생성되어 불필요한 리렌더링 발생
function Grid({
  columns = { xs: 12, sm: 6, md: 4 }  // 매 렌더링마다 새 객체
}: GridProps) { ... }
\`\`\`
      `,
      tips: [
        '기본값이 있는 prop은 타입에서 선택적(?)으로 표시하세요.',
        '객체나 배열 기본값은 컴포넌트 외부에 상수로 정의하면 성능에 좋습니다.'
      ]
    },
    {
      id: 'children-props',
      title: 'children Props',
      content: `
**children** 은 컴포넌트 태그 사이에 들어가는 내용을 전달하는 특별한 prop입니다.

### 기본 사용법

\`\`\`tsx
// children 사용
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

// 사용
<Card>
  <h2>제목</h2>
  <p>내용입니다.</p>
</Card>
\`\`\`

### children 타입들

\`\`\`tsx
interface Props {
  // 모든 렌더링 가능한 것 (가장 일반적)
  children: React.ReactNode;

  // JSX 요소만 허용
  children: React.ReactElement;

  // 문자열만 허용
  children: string;

  // 특정 컴포넌트만 허용
  children: React.ReactElement<TabProps>;

  // 함수를 children으로 (Render Props 패턴)
  children: (data: Data) => React.ReactNode;
}
\`\`\`

### 실제 프로젝트 예시: PageContainer

\`\`\`tsx
interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  sx?: SxProps<Theme>;
}

function PageContainer({ children, title, sx }: PageContainerProps) {
  return (
    <Box sx={{ height: '100%', ...sx }}>
      <Container>
        {title && <Typography variant="h4">{title}</Typography>}
        {children}  {/* 여기에 전달된 내용이 렌더링 */}
      </Container>
    </Box>
  );
}

// 사용
<PageContainer title="사용자 관리">
  <SearchBar />
  <UserTable />
  <Pagination />
</PageContainer>
\`\`\`

### 실제 프로젝트 예시: SearchFilterPanel

\`\`\`tsx
interface SearchFilterPanelProps {
  children: React.ReactNode;      // 필터 컨트롤들
  title?: string;
  activeFilterCount?: number;
  onApply?: () => void;
  onClear?: () => void;
}

function SearchFilterPanel({
  children,
  title = 'Filters',
  activeFilterCount = 0,
  onApply,
  onClear
}: SearchFilterPanelProps) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography fontWeight={600}>{title}</Typography>
        {activeFilterCount > 0 && (
          <Chip label={activeFilterCount} size="small" />
        )}
      </Box>

      {/* children: 필터 컨트롤들이 여기에 */}
      {children}

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button onClick={onClear}>초기화</Button>
        <Button variant="contained" onClick={onApply}>적용</Button>
      </Box>
    </Paper>
  );
}

// 사용
<SearchFilterPanel
  activeFilterCount={2}
  onApply={handleApply}
  onClear={handleClear}
>
  <FormControl>
    <Select value={category} onChange={setCategory}>...</Select>
  </FormControl>
  <FormControl>
    <Select value={status} onChange={setStatus}>...</Select>
  </FormControl>
</SearchFilterPanel>
\`\`\`

### children 조작하기

\`\`\`tsx
import { Children, cloneElement, isValidElement } from 'react';

function List({ children }: { children: React.ReactNode }) {
  return (
    <ul>
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          // 각 child에 추가 props 전달
          return cloneElement(child, { index });
        }
        return child;
      })}
    </ul>
  );
}
\`\`\`
      `,
      tips: [
        'children이 없을 수도 있다면 타입을 React.ReactNode로 하면 됩니다 (undefined 허용).',
        'children을 필수로 만들려면 PropsWithChildren 대신 직접 타입을 정의하세요.'
      ]
    },
    {
      id: 'example-quicksearchbar',
      title: '예제: QuickSearchBar Props 구조',
      content: `
**QuickSearchBar** 컴포넌트의 Props를 분석해봅시다.

### Props 인터페이스

\`\`\`tsx
// src/components/common/QuickSearchBar/index.tsx

interface QuickSearchBarProps {
  // 필수 Props
  searchValue: string;                    // 검색어 값 (제어 컴포넌트)
  onSearchChange: (value: string) => void; // 검색어 변경 핸들러

  // 선택적 Props (기본값 있음)
  placeholder?: string;                   // 입력 필드 placeholder
  searching?: boolean;                    // 로딩 상태
  showAdvancedButton?: boolean;           // 고급 필터 버튼 표시
  activeFilterCount?: number;             // 활성화된 필터 수

  // 콜백 함수들 (선택적)
  onSearch?: () => void;                  // 검색 실행
  onClear?: () => void;                   // 검색어 초기화
  onAdvancedFilterClick?: () => void;     // 고급 필터 버튼 클릭
}
\`\`\`

### 컴포넌트 구현

\`\`\`tsx
export default function QuickSearchBar({
  searchValue,
  onSearchChange,
  placeholder = 'Search...',
  searching = false,
  showAdvancedButton = true,
  activeFilterCount = 0,
  onSearch,
  onClear,
  onAdvancedFilterClick
}: QuickSearchBarProps) {

  // Enter 키 핸들링
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* 검색 입력 필드 */}
      <TextField
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon />,
          endAdornment: searching ? <CircularProgress size={20} /> : null
        }}
      />

      {/* 초기화 버튼 - 검색어가 있을 때만 */}
      {searchValue && (
        <IconButton onClick={onClear} size="small">
          <ClearIcon />
        </IconButton>
      )}

      {/* 고급 필터 버튼 */}
      {showAdvancedButton && (
        <Button
          onClick={onAdvancedFilterClick}
          startIcon={<FilterIcon />}
          variant="outlined"
        >
          Filters
          {activeFilterCount > 0 && (
            <Chip label={activeFilterCount} size="small" sx={{ ml: 1 }} />
          )}
        </Button>
      )}
    </Box>
  );
}
\`\`\`

### 사용 예시

\`\`\`tsx
// conversations/page.tsx에서 사용
function ConversationsPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <QuickSearchBar
      searchValue={search}
      onSearchChange={setSearch}
      onSearch={() => fetchData()}
      onClear={() => setSearch('')}
      searching={loading}
      placeholder="Search conversations..."
      showAdvancedButton={true}
      activeFilterCount={3}
      onAdvancedFilterClick={() => setFilterOpen(!filterOpen)}
    />
  );
}
\`\`\`

### Props 설계 포인트

1. **제어 컴포넌트 패턴** - value + onChange로 상태 제어
2. **합리적인 기본값** - 가장 일반적인 사용 케이스에 맞춤
3. **선택적 콜백** - 필요한 기능만 구현 가능
4. **명확한 네이밍** - on 접두사로 이벤트 핸들러 표시
      `,
      tips: [
        '제어 컴포넌트는 value와 onChange를 항상 쌍으로 받습니다.',
        '선택적 콜백은 호출 전에 존재 여부를 확인하세요: onSearch?.()'
      ]
    },
    {
      id: 'example-searchfilterpanel',
      title: '예제: SearchFilterPanel Props 구조',
      content: `
**SearchFilterPanel** 은 children과 다양한 Props를 조합한 예시입니다.

### Props 인터페이스

\`\`\`tsx
interface SearchFilterPanelProps {
  // children - 필터 컨트롤 컴포넌트들
  children: React.ReactNode;

  // 헤더 관련
  title?: string;
  showHeader?: boolean;
  activeFilterCount?: number;

  // 액션 버튼
  onApply?: () => void;
  onClear?: () => void;
  onClose?: () => void;

  // 표시 모드
  mode?: 'inline' | 'advanced';
  expanded?: boolean;
}
\`\`\`

### 컴포넌트 구현

\`\`\`tsx
export default function SearchFilterPanel({
  children,
  title = 'Filters',
  showHeader = true,
  activeFilterCount = 0,
  onApply,
  onClear,
  onClose,
  mode = 'inline',
  expanded = true
}: SearchFilterPanelProps) {

  if (!expanded) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: mode === 'advanced' ? 'grey.50' : 'white'
      }}
    >
      {/* 헤더 */}
      {showHeader && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {title}
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
              />
            )}
          </Box>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}

      {/* 필터 컨트롤들 (children) */}
      <Box sx={{ mb: 2 }}>
        {children}
      </Box>

      {/* 액션 버튼 */}
      {(onApply || onClear) && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {onClear && (
            <Button size="small" onClick={onClear}>
              Clear All
            </Button>
          )}
          {onApply && (
            <Button size="small" variant="contained" onClick={onApply}>
              Apply
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
}
\`\`\`

### 사용 예시

\`\`\`tsx
// 기본 사용
<SearchFilterPanel
  activeFilterCount={activeFilterCount}
  onApply={handleSearch}
  onClear={clearFilters}
>
  <Box sx={{ display: 'flex', gap: 2 }}>
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>Category</InputLabel>
      <Select value={category} onChange={(e) => setCategory(e.target.value)}>
        <MenuItem value="">All</MenuItem>
        <MenuItem value="feature">Feature</MenuItem>
        <MenuItem value="bugfix">Bug Fix</MenuItem>
      </Select>
    </FormControl>

    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel>Difficulty</InputLabel>
      <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <MenuItem value="">All</MenuItem>
        <MenuItem value="easy">Easy</MenuItem>
        <MenuItem value="hard">Hard</MenuItem>
      </Select>
    </FormControl>
  </Box>
</SearchFilterPanel>

// 고급 모드
<SearchFilterPanel
  mode="advanced"
  showHeader={false}
  expanded={advancedFilterOpen}
  onClose={() => setAdvancedFilterOpen(false)}
>
  {/* 더 많은 필터 옵션들 */}
</SearchFilterPanel>
\`\`\`

### 합성(Composition) 패턴의 장점

1. **유연성** - children으로 어떤 필터든 넣을 수 있음
2. **재사용성** - 다양한 페이지에서 다른 필터와 함께 사용
3. **관심사 분리** - 레이아웃과 필터 로직 분리
      `,
      tips: [
        'children을 사용하면 컴포넌트가 더 유연해집니다.',
        '조건부로 섹션을 숨기려면 prop을 받아 처리하세요.'
      ]
    },
    {
      id: 'summary',
      title: '정리',
      content: `
### 이번 챕터에서 배운 내용

- **Props 개념:** 부모 → 자식 데이터 전달, 읽기 전용
- **전달 방법:** 구조 분해, Spread 연산자, 콜백 함수
- **TypeScript:** interface로 타입 정의, 선택적 prop
- **기본값:** 구조 분해 기본값 사용 권장
- **children:** 컴포넌트 사이 내용 전달

### Props 패턴 요약

| 패턴 | 설명 | 예시 |
|------|------|------|
| 필수 prop | 반드시 전달해야 함 | \`name: string\` |
| 선택적 prop | 전달 안 해도 됨 | \`age?: number\` |
| 기본값 | 전달 안 되면 기본값 | \`size = 'medium'\` |
| 콜백 prop | 함수 전달 | \`onClick: () => void\` |
| children | 태그 사이 내용 | \`children: ReactNode\` |

### Props 설계 체크리스트

| 항목 | 체크 |
|------|------|
| 타입이 명확히 정의되어 있는가? | □ |
| 필수/선택적이 적절히 구분되어 있는가? | □ |
| 기본값이 합리적인가? | □ |
| 네이밍이 명확한가? (on 접두사 등) | □ |
| 불필요한 prop은 없는가? | □ |

### 실습 과제

1. \`src/components/common/QuickSearchBar\` 코드 분석
2. \`src/components/common/CardGrid\` 의 제네릭 Props 살펴보기
3. 간단한 Card 컴포넌트 만들어보기

### 다음 챕터 예고

다음 챕터에서는 **State - 상태 관리 기초** 를 학습합니다. 컴포넌트 내부의 동적 데이터를 관리하는 useState 훅을 알아봅니다.
      `
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - Props 전달하기',
      url: 'https://ko.react.dev/learn/passing-props-to-a-component',
      type: 'documentation'
    },
    {
      title: 'TypeScript + React 가이드',
      url: 'https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
