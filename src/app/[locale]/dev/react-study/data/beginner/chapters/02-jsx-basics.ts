/**
 * Chapter 2: JSX 기초
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'jsx-basics',
  order: 2,
  title: 'JSX Basics',
  titleKo: 'JSX 기초',
  description: 'Learn JSX syntax and how to write UI declaratively.',
  descriptionKo: 'JSX 문법을 배우고 선언적으로 UI를 작성하는 방법을 학습합니다.',
  estimatedMinutes: 45,
  objectives: [
    'Understand what JSX is and how it works',
    'Learn JSX syntax rules',
    'Use JavaScript expressions in JSX',
    'Implement conditional rendering',
    'Render lists with map()'
  ],
  objectivesKo: [
    'JSX가 무엇이고 어떻게 동작하는지 이해한다',
    'JSX 문법 규칙을 학습한다',
    'JSX에서 JavaScript 표현식을 사용한다',
    '조건부 렌더링을 구현한다',
    'map() 으로 리스트를 렌더링한다'
  ],
  sections: [
    {
      id: 'what-is-jsx',
      title: 'JSX란 무엇인가?',
      content: `
JSX는 **JavaScript XML** 의 약자로, JavaScript 안에서 HTML과 유사한 문법을 사용할 수 있게 해주는 **문법 확장(Syntax Extension)** 입니다.

### JSX의 탄생 배경

기존 웹 개발에서는 HTML, CSS, JavaScript를 각각 별도 파일로 분리했습니다. 하지만 React는 **"관심사의 분리"** 를 파일 단위가 아닌 **컴포넌트 단위** 로 적용합니다.

\`\`\`
기존 방식:                    React 방식:
├── index.html               ├── UserCard.tsx (HTML + JS + CSS)
├── styles.css               ├── ProductList.tsx (HTML + JS + CSS)
└── script.js                └── Header.tsx (HTML + JS + CSS)
\`\`\`

### JSX는 JavaScript다

JSX는 브라우저가 직접 이해할 수 없습니다. **Babel** 같은 트랜스파일러가 JSX를 일반 JavaScript로 변환합니다.

\`\`\`jsx
// 우리가 작성하는 JSX
const element = <h1 className="title">안녕하세요!</h1>;

// Babel이 변환한 JavaScript
const element = React.createElement(
  'h1',
  { className: 'title' },
  '안녕하세요!'
);
\`\`\`

### React.createElement 이해하기

모든 JSX는 결국 \`React.createElement()\` 함수 호출로 변환됩니다:

\`\`\`javascript
React.createElement(
  type,      // 'div', 'span' 또는 컴포넌트
  props,     // 속성 객체 { className: 'title', onClick: ... }
  children   // 자식 요소들
);
\`\`\`
      `,
      tips: [
        'JSX 없이도 React를 사용할 수 있지만, JSX를 사용하면 코드가 훨씬 직관적이고 읽기 쉬워집니다.',
        'Next.js 프로젝트에서는 Babel 설정이 이미 되어 있어 JSX를 바로 사용할 수 있습니다.'
      ]
    },
    {
      id: 'jsx-syntax-rules',
      title: 'JSX 문법 규칙',
      content: `
JSX는 HTML과 비슷하지만 몇 가지 중요한 차이점이 있습니다. 이 규칙들을 잘 기억해야 합니다.

### 규칙 1: 반드시 하나의 루트 요소

JSX는 **반드시 하나의 부모 요소** 로 감싸야 합니다.

\`\`\`tsx
// ❌ 오류 - 여러 루트 요소
return (
  <h1>제목</h1>
  <p>내용</p>
);

// ✅ 올바름 - div로 감싸기
return (
  <div>
    <h1>제목</h1>
    <p>내용</p>
  </div>
);

// ✅ 올바름 - Fragment 사용 (불필요한 DOM 노드 방지)
return (
  <>
    <h1>제목</h1>
    <p>내용</p>
  </>
);
\`\`\`

### 규칙 2: 모든 태그는 닫아야 함

HTML에서는 \`<br>\`, \`<img>\` 같은 태그를 닫지 않아도 되지만, JSX에서는 **모든 태그를 닫아야** 합니다.

\`\`\`tsx
// ❌ 오류
<img src="photo.jpg">
<br>
<input type="text">

// ✅ 올바름 - self-closing 태그
<img src="photo.jpg" />
<br />
<input type="text" />
\`\`\`

### 규칙 3: camelCase 속성명

HTML 속성은 **camelCase** 로 작성합니다. JavaScript 예약어와 충돌하는 속성은 다른 이름을 사용합니다.

| HTML | JSX |
|------|-----|
| class | className |
| for | htmlFor |
| onclick | onClick |
| tabindex | tabIndex |
| readonly | readOnly |

\`\`\`tsx
// HTML
<label for="name" class="label">이름</label>
<input type="text" id="name" tabindex="1" readonly>

// JSX
<label htmlFor="name" className="label">이름</label>
<input type="text" id="name" tabIndex={1} readOnly />
\`\`\`

### 규칙 4: style은 객체로

인라인 스타일은 문자열이 아닌 **객체** 로 전달합니다.

\`\`\`tsx
// HTML
<div style="background-color: blue; font-size: 16px;">

// JSX - 객체로, 속성명은 camelCase
<div style={{ backgroundColor: 'blue', fontSize: 16 }}>
\`\`\`
      `,
      tips: [
        'Fragment (<>...</>) 를 사용하면 불필요한 DOM 노드 없이 여러 요소를 그룹화할 수 있습니다.',
        'MUI를 사용할 때는 style 대신 sx prop을 사용하는 것이 더 권장됩니다.'
      ]
    },
    {
      id: 'javascript-expressions',
      title: 'JavaScript 표현식 삽입 {}',
      content: `
JSX에서 **중괄호 {}** 를 사용하면 JavaScript 표현식을 삽입할 수 있습니다. 이것이 JSX의 핵심 기능입니다.

### 표현식 vs 문(Statement)

중괄호 안에는 **표현식(Expression)** 만 들어갈 수 있습니다. 표현식은 값을 반환하는 코드입니다.

\`\`\`tsx
// ✅ 표현식 - 값을 반환
{userName}           // 변수
{2 + 2}              // 연산
{getFullName()}      // 함수 호출
{isAdmin ? '관리자' : '사용자'}  // 삼항 연산자
{items.map(...)}     // 배열 메서드

// ❌ 문(Statement) - 사용 불가
{if (condition) { }}  // if문
{for (let i...) { }}  // for문
{const x = 1}         // 변수 선언
\`\`\`

### 다양한 사용 예시

\`\`\`tsx
function UserProfile({ user }) {
  const fullName = \`\${user.firstName} \${user.lastName}\`;
  const today = new Date().toLocaleDateString('ko-KR');

  return (
    <div>
      {/* 변수 출력 */}
      <h1>{fullName}</h1>

      {/* 연산 */}
      <p>나이: {user.birthYear ? 2024 - user.birthYear : '정보 없음'}세</p>

      {/* 함수 호출 */}
      <p>오늘 날짜: {today}</p>

      {/* 객체 속성 접근 */}
      <p>이메일: {user.contact.email}</p>

      {/* 배열 길이 */}
      <p>게시글 수: {user.posts.length}개</p>
    </div>
  );
}
\`\`\`

### 속성(Props)에서 사용

속성 값에도 중괄호를 사용합니다.

\`\`\`tsx
const buttonStyle = { padding: '10px 20px', borderRadius: 8 };
const handleClick = () => alert('클릭!');

return (
  <button
    className={isActive ? 'active' : 'inactive'}
    style={buttonStyle}
    onClick={handleClick}
    disabled={isLoading}
    aria-label={\`\${userName}의 프로필 버튼\`}
  >
    {isLoading ? '로딩 중...' : '클릭하세요'}
  </button>
);
\`\`\`
      `,
      tips: [
        '문자열 속성은 중괄호 없이 따옴표로 작성해도 됩니다: className="title"',
        '{/* 주석 */} 형태로 JSX 안에 주석을 작성할 수 있습니다.'
      ]
    },
    {
      id: 'conditional-rendering',
      title: '조건부 렌더링',
      content: `
특정 조건에 따라 다른 UI를 보여주는 것을 **조건부 렌더링** 이라고 합니다. JSX에서는 if문을 직접 사용할 수 없으므로 다른 방법을 사용합니다.

### 방법 1: && 연산자 (단축 평가)

조건이 **참일 때만** 렌더링할 때 사용합니다.

\`\`\`tsx
function Notification({ count }) {
  return (
    <div>
      {/* count가 0보다 클 때만 표시 */}
      {count > 0 && (
        <span className="badge">{count}</span>
      )}
    </div>
  );
}

// 실제 프로젝트 예시 - ConversationCard
function ConversationCard({ conversation }) {
  return (
    <CardWrapper>
      {/* duration이 0보다 클 때만 표시 */}
      {conversation.duration_minutes > 0 && (
        <MetaInfo
          icon={<Schedule />}
          value={\`\${conversation.duration_minutes}m\`}
        />
      )}
    </CardWrapper>
  );
}
\`\`\`

### 방법 2: 삼항 연산자

**둘 중 하나** 를 선택해서 렌더링할 때 사용합니다.

\`\`\`tsx
function UserStatus({ isOnline }) {
  return (
    <span className={isOnline ? 'online' : 'offline'}>
      {isOnline ? '온라인' : '오프라인'}
    </span>
  );
}

// 실제 프로젝트 예시 - ChapterCard
function ChapterCard({ chapter, courseColor }) {
  const isReady = chapter.status === 'published' || chapter.status === 'ready';

  return (
    <Paper>
      {isReady ? (
        <Chip label="Ready" sx={{ bgcolor: courseColor }} />
      ) : (
        <Chip label="준비 중" icon={<Lock />} />
      )}
    </Paper>
  );
}
\`\`\`

### 방법 3: 컴포넌트 외부에서 if문

복잡한 조건은 return 전에 처리합니다.

\`\`\`tsx
function Dashboard({ user, data, error, loading }) {
  // 로딩 상태
  if (loading) {
    return <Skeleton />;
  }

  // 에러 상태
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // 데이터 없음
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  // 정상 렌더링
  return (
    <div>
      <h1>{user.name}님의 대시보드</h1>
      {/* ... */}
    </div>
  );
}
\`\`\`

### && 연산자 주의사항

숫자 0은 falsy 값이지만 **렌더링됩니다**.

\`\`\`tsx
// ❌ count가 0이면 "0"이 화면에 표시됨
{count && <span>{count}</span>}

// ✅ 명시적으로 비교
{count > 0 && <span>{count}</span>}

// ✅ Boolean으로 변환
{!!count && <span>{count}</span>}
\`\`\`
      `,
      tips: [
        '&& 연산자는 왼쪽이 truthy면 오른쪽을 반환하고, falsy면 왼쪽을 반환합니다.',
        '조건이 복잡해지면 별도의 변수나 함수로 분리하는 것이 좋습니다.'
      ]
    },
    {
      id: 'list-rendering',
      title: '리스트 렌더링 (map)',
      content: `
배열 데이터를 UI로 변환할 때 **map()** 메서드를 사용합니다. React에서 가장 자주 사용되는 패턴 중 하나입니다.

### 기본 문법

\`\`\`tsx
const fruits = ['사과', '바나나', '오렌지'];

return (
  <ul>
    {fruits.map((fruit, index) => (
      <li key={index}>{fruit}</li>
    ))}
  </ul>
);
\`\`\`

### Key의 중요성

React는 리스트를 효율적으로 업데이트하기 위해 각 항목에 **고유한 key** 가 필요합니다.

\`\`\`tsx
// ❌ index를 key로 사용 (권장하지 않음)
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}

// ✅ 고유 ID를 key로 사용
{items.map((item) => (
  <li key={item.id}>{item.name}</li>
))}
\`\`\`

**Key 규칙:**
- 형제 요소 사이에서 **고유** 해야 함
- **변하지 않는 값** 이어야 함 (index는 순서가 바뀌면 문제됨)
- 데이터베이스 ID, UUID 등을 사용

### 실제 프로젝트 예시: CardGrid

\`\`\`tsx
// src/components/common/CardGrid/index.tsx
export default function CardGrid<T>({
  items,
  renderCard,
  columns = { xs: 12, sm: 6, md: 4 },
  spacing = 2.5
}: CardGridProps<T>) {
  return (
    <Grid container spacing={spacing}>
      {items.map((item, index) => (
        <Grid item key={index} {...columns}>
          {renderCard(item, index)}
        </Grid>
      ))}
    </Grid>
  );
}

// 사용 예시
<CardGrid
  items={conversations}
  renderCard={(conv) => (
    <ConversationCard
      conversation={conv}
      onClick={() => handleCardClick(conv.id)}
    />
  )}
/>
\`\`\`

### map과 조건부 렌더링 조합

\`\`\`tsx
function UserList({ users }) {
  return (
    <ul>
      {users
        .filter(user => user.isActive)  // 먼저 필터링
        .map(user => (
          <li key={user.id}>
            {user.name}
            {user.isAdmin && <span className="badge">관리자</span>}
          </li>
        ))}
    </ul>
  );
}
\`\`\`

### 빈 배열 처리

\`\`\`tsx
function ProductList({ products }) {
  if (products.length === 0) {
    return <p>상품이 없습니다.</p>;
  }

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
\`\`\`
      `,
      tips: [
        'map() 안에서 복잡한 로직이 필요하면 별도의 컴포넌트로 분리하세요.',
        'filter(), sort() 등 다른 배열 메서드와 조합하여 사용할 수 있습니다.'
      ]
    },
    {
      id: 'real-world-example',
      title: '예제: ConversationCard의 JSX 구조',
      content: `
지금까지 배운 내용을 실제 프로젝트 코드에서 확인해봅시다. \`ConversationCard\` 컴포넌트는 이번 챕터의 모든 개념을 포함합니다.

### 전체 구조 분석

\`\`\`tsx
// src/app/[locale]/dev/conversations/page.tsx

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
  // 이벤트 핸들러 정의
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(conversation.id);
  };

  return (
    // CardWrapper에 조건부 onClick
    <CardWrapper onClick={selectionMode ? () => onSelect?.(conversation.id) : onClick}>

      {/* 1. 헤더 영역 - 조건부 렌더링 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

          {/* selectionMode일 때만 체크박스 표시 (&&) */}
          {selectionMode && (
            <Checkbox
              checked={selected}
              onClick={handleCheckboxClick}
              size="small"
            />
          )}

          {/* 표현식으로 props 전달 */}
          <CategoryBadge category={conversation.category} size="small" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DifficultyBadge difficulty={conversation.difficulty_level} />

          {/* selectionMode가 아닐 때만 삭제 버튼 표시 */}
          {!selectionMode && (
            <IconButton onClick={handleDeleteClick}>
              <Delete />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* 2. 제목 - 표현식 삽입 */}
      <Typography variant="subtitle1" fontWeight={600}>
        {conversation.title}
      </Typography>

      {/* 3. 메타 정보 - && 조건부 렌더링 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <MetaInfo icon={<Chat />} value={conversation.total_messages} />

        {/* duration이 있을 때만 표시 */}
        {conversation.duration_minutes > 0 && (
          <MetaInfo
            icon={<Schedule />}
            value={\`\${conversation.duration_minutes}m\`}
          />
        )}
      </Box>

      {/* 4. 푸터 - 템플릿 리터럴 사용 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption">
          {formatDate(conversation.started_at)}
        </Typography>
        <BranchBadge branch={conversation.branch_name} />
      </Box>

    </CardWrapper>
  );
}
\`\`\`

### JSX 개념 정리

| 라인 | 사용된 개념 |
|------|------------|
| \`{selectionMode && (...)}\` | && 조건부 렌더링 |
| \`onClick={selectionMode ? ... : ...}\` | 삼항 연산자 |
| \`{conversation.title}\` | 표현식 삽입 |
| \`{\\\`\${duration}m\\\`}\` | 템플릿 리터럴 |
| \`sx={{ display: 'flex' }}\` | 객체 속성 |
| \`checked={selected}\` | boolean 속성 |
      `,
      codeExamples: [
        {
          id: 'badge-component',
          title: 'CategoryBadge 컴포넌트',
          description: '조건부 스타일링과 객체 조회를 활용한 배지 컴포넌트입니다.',
          fileName: 'src/components/common/Badge/index.tsx',
          language: 'tsx',
          code: `// 카테고리 설정 객체
export const categoryConfigs: Record<string, CategoryConfig> = {
  feature: { label: 'Feature', color: '#10b981', icon: <Rocket /> },
  bugfix: { label: 'Bug Fix', color: '#ef4444', icon: <BugReport /> },
  refactor: { label: 'Refactor', color: '#8b5cf6', icon: <Build /> },
  // ...
};

// CategoryBadge 컴포넌트
export function CategoryBadge({ category, size = 'medium' }) {
  const config = categoryConfigs[category];

  // config가 없으면 기본값 사용
  if (!config) {
    return <Chip label={category} size={size} />;
  }

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size={size}
      sx={{
        bgcolor: \`\${config.color}15\`,  // 15% 투명도
        color: config.color,
        '& .MuiChip-icon': { color: config.color }
      }}
    />
  );
}`
        }
      ],
      tips: [
        '실제 코드를 읽으면서 JSX 패턴을 익히는 것이 가장 효과적입니다.',
        'src/components/common 폴더의 컴포넌트들을 분석해보세요.'
      ]
    },
    {
      id: 'summary',
      title: '정리',
      content: `
### 이번 챕터에서 배운 내용

- **JSX란:** JavaScript에서 HTML을 작성하는 문법 확장
- **문법 규칙:** 단일 루트, 태그 닫기, camelCase 속성
- **표현식 {}:** 변수, 연산, 함수 호출 등 값을 반환하는 코드
- **조건부 렌더링:** &&, 삼항 연산자
- **리스트 렌더링:** map() 과 key

### 핵심 패턴 요약

| 패턴 | 문법 | 사용 시점 |
|------|------|----------|
| 표현식 삽입 | \`{value}\` | 동적 값 출력 |
| 조건부 (참일 때만) | \`{condition && <A />}\` | 하나만 표시/숨김 |
| 조건부 (둘 중 하나) | \`{condition ? <A /> : <B />}\` | 양자택일 |
| 리스트 | \`{items.map(item => <A key={item.id} />)}\` | 배열 렌더링 |

### 실습 과제

1. \`src/app/[locale]/dev/conversations/page.tsx\` 파일을 열어 ConversationCard 컴포넌트 분석하기
2. \`src/components/common/CardGrid/index.tsx\` 에서 map() 사용 패턴 확인하기
3. \`src/components/common/Badge/index.tsx\` 에서 조건부 렌더링 패턴 찾아보기

### 다음 챕터 예고

다음 챕터에서는 **컴포넌트 이해하기** 를 학습합니다. 함수 컴포넌트의 구조와 컴포넌트를 잘 설계하는 방법을 알아보겠습니다.
      `
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - JSX 소개',
      url: 'https://ko.react.dev/learn/writing-markup-with-jsx',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - 조건부 렌더링',
      url: 'https://ko.react.dev/learn/conditional-rendering',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - 리스트 렌더링',
      url: 'https://ko.react.dev/learn/rendering-lists',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
