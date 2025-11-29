/**
 * Chapter 3: 컴포넌트 이해하기
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'components',
  order: 3,
  title: 'Understanding Components',
  titleKo: '컴포넌트 이해하기',
  description: 'Learn how to create and organize React components.',
  descriptionKo: 'React 컴포넌트를 생성하고 구성하는 방법을 학습합니다.',
  estimatedMinutes: 40,
  objectives: [
    'Write functional components',
    'Understand when to split components',
    'Design file and folder structure',
    'Follow component naming conventions'
  ],
  objectivesKo: [
    '함수형 컴포넌트를 작성한다',
    '컴포넌트를 언제 분리해야 하는지 이해한다',
    '파일과 폴더 구조를 설계한다',
    '컴포넌트 명명 규칙을 따른다'
  ],
  sections: [
    {
      id: 'functional-components',
      title: '함수형 컴포넌트 작성법',
      content: `
React 컴포넌트는 **UI의 독립적인 조각** 입니다. 현대 React에서는 **함수형 컴포넌트** 를 사용합니다.

### 컴포넌트란?

컴포넌트는 **재사용 가능한 UI 단위** 입니다. 버튼, 카드, 헤더 등 UI를 작은 조각으로 나누어 관리합니다.

\`\`\`
전체 페이지
├── Header (컴포넌트)
│   ├── Logo
│   └── Navigation
├── Main (컴포넌트)
│   ├── Sidebar
│   └── Content
│       ├── CardGrid (컴포넌트)
│       │   └── Card (컴포넌트) × N
│       └── Pagination
└── Footer (컴포넌트)
\`\`\`

### 함수형 컴포넌트 기본 구조

\`\`\`tsx
// 1. 가장 기본적인 형태
function Greeting() {
  return <h1>안녕하세요!</h1>;
}

// 2. 화살표 함수 형태
const Greeting = () => {
  return <h1>안녕하세요!</h1>;
};

// 3. 암시적 반환 (한 줄일 때)
const Greeting = () => <h1>안녕하세요!</h1>;
\`\`\`

### TypeScript와 함께 사용

\`\`\`tsx
// Props 타입 정의
interface GreetingProps {
  name: string;
  age?: number;  // 선택적 prop
}

// 방법 1: 인라인 타입
function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <h1>안녕하세요, {name}님!</h1>
      {age && <p>나이: {age}세</p>}
    </div>
  );
}

// 방법 2: React.FC 사용 (권장하지 않음)
const Greeting: React.FC<GreetingProps> = ({ name, age }) => {
  return <h1>안녕하세요, {name}님!</h1>;
};
\`\`\`

### export 패턴

\`\`\`tsx
// Default export - 파일당 하나
export default function PageHeader() { ... }

// Named export - 여러 개 가능
export function CategoryBadge() { ... }
export function DifficultyBadge() { ... }

// 사용할 때
import PageHeader from './PageHeader';  // default
import { CategoryBadge, DifficultyBadge } from './Badge';  // named
\`\`\`
      `,
      tips: [
        '컴포넌트 이름은 반드시 **대문자** 로 시작해야 합니다 (PascalCase).',
        'React.FC는 children 타입 문제와 제네릭 사용 어려움으로 권장하지 않습니다.'
      ]
    },
    {
      id: 'component-splitting',
      title: '컴포넌트 분리의 기준',
      content: `
컴포넌트를 **언제, 어떻게** 분리해야 할까요? 몇 가지 기준을 알아봅시다.

### 분리해야 하는 신호들

**1. 재사용이 필요할 때**

\`\`\`tsx
// ❌ 같은 코드가 여러 곳에 반복
function UserList() {
  return (
    <div>
      <div className="badge">관리자</div>  {/* 여기도 */}
      <div className="badge">일반</div>    {/* 여기도 */}
    </div>
  );
}

// ✅ 컴포넌트로 분리
function Badge({ label, color }) {
  return <span className="badge" style={{ color }}>{label}</span>;
}

function UserList() {
  return (
    <div>
      <Badge label="관리자" color="red" />
      <Badge label="일반" color="gray" />
    </div>
  );
}
\`\`\`

**2. 복잡도가 높아질 때**

한 컴포넌트가 100줄을 넘거나, 너무 많은 일을 할 때 분리합니다.

\`\`\`tsx
// ❌ 한 컴포넌트가 너무 많은 일을 함
function Dashboard() {
  // 사용자 정보 로직 50줄...
  // 차트 로직 50줄...
  // 알림 로직 50줄...
  return (/* 200줄의 JSX */);
}

// ✅ 역할별로 분리
function Dashboard() {
  return (
    <div>
      <UserInfo />
      <ChartSection />
      <NotificationPanel />
    </div>
  );
}
\`\`\`

**3. 독립적인 관심사일 때**

\`\`\`tsx
// 각각 독립적인 기능
function ConversationsPage() {
  return (
    <div>
      <SearchBar />        {/* 검색 관심사 */}
      <FilterPanel />      {/* 필터링 관심사 */}
      <CardGrid />         {/* 데이터 표시 관심사 */}
      <Pagination />       {/* 페이징 관심사 */}
    </div>
  );
}
\`\`\`

### 분리하지 않아도 되는 경우

- 한 번만 사용되고 간단한 경우
- 분리하면 오히려 코드를 이해하기 어려워지는 경우
- Props drilling이 심해지는 경우

### 컴포넌트 크기 가이드라인

| 크기 | 줄 수 | 예시 |
|------|-------|------|
| 작음 | ~50줄 | Badge, Button, Icon |
| 중간 | 50~150줄 | Card, Form, Modal |
| 큼 | 150줄+ | Page, Dashboard (분리 고려) |
      `,
      tips: [
        '**"한 컴포넌트 = 한 가지 역할"** 원칙을 기억하세요.',
        '과도한 분리는 오히려 복잡도를 높입니다. 균형이 중요합니다.'
      ]
    },
    {
      id: 'file-folder-structure',
      title: '파일/폴더 구조 설계',
      content: `
잘 설계된 폴더 구조는 프로젝트의 유지보수성을 크게 높입니다.

### 본 프로젝트의 구조

\`\`\`
src/
├── app/                        # Next.js App Router (페이지)
│   └── [locale]/
│       ├── admin/              # 관리자 페이지들
│       │   ├── users/
│       │   │   ├── page.tsx    # 페이지 컴포넌트
│       │   │   ├── hooks/      # 페이지 전용 훅
│       │   │   └── constants.tsx
│       │   └── ...
│       └── dev/
│           └── conversations/
│               └── page.tsx
│
├── components/                 # 재사용 컴포넌트
│   ├── common/                 # 범용 공통 컴포넌트
│   │   ├── PageContainer/
│   │   │   └── index.tsx
│   │   ├── PageHeader/
│   │   │   └── index.tsx
│   │   ├── CardGrid/
│   │   │   └── index.tsx
│   │   └── Badge/
│   │       └── index.tsx
│   │
│   ├── layout/                 # 레이아웃 컴포넌트
│   │   ├── Sidebar/
│   │   └── AuthenticatedLayout/
│   │
│   └── boards/                 # 도메인별 컴포넌트
│       ├── PostFormFields.tsx
│       └── PostFormPage.tsx
│
├── hooks/                      # 전역 커스텀 훅
│   └── useAuth.ts
│
└── lib/                        # 유틸리티
    ├── axios/
    └── i18n/
\`\`\`

### 컴포넌트 폴더 패턴

**패턴 1: 단일 파일 (간단한 컴포넌트)**

\`\`\`
components/common/
└── Badge/
    └── index.tsx      # 모든 코드가 여기에
\`\`\`

**패턴 2: 분리된 파일 (복잡한 컴포넌트)**

\`\`\`
components/common/
└── DataGrid/
    ├── index.tsx      # 메인 컴포넌트
    ├── types.ts       # 타입 정의
    ├── constants.ts   # 상수
    ├── utils.ts       # 유틸리티 함수
    └── hooks.ts       # 커스텀 훅
\`\`\`

### 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | \`UserCard\`, \`PageHeader\` |
| 파일명 | PascalCase 또는 index | \`UserCard.tsx\`, \`index.tsx\` |
| 훅 | camelCase + use 접두사 | \`useAuth\`, \`useUserData\` |
| 유틸리티 | camelCase | \`formatDate\`, \`parseQuery\` |
| 상수 | UPPER_SNAKE_CASE | \`MAX_PAGE_SIZE\`, \`API_URL\` |
      `,
      tips: [
        'index.tsx를 사용하면 import 경로가 깔끔해집니다: \`import PageHeader from "./PageHeader"\`',
        '도메인별로 폴더를 나누면 관련 코드를 찾기 쉽습니다.'
      ]
    },
    {
      id: 'example-pagecontainer',
      title: '예제: PageContainer 컴포넌트',
      content: `
본 프로젝트의 **PageContainer** 컴포넌트를 분석해봅시다. 모든 페이지를 감싸는 레이아웃 컴포넌트입니다.

### 역할

- 페이지의 **일관된 레이아웃** 제공
- 패딩, 최대 너비 등 **공통 스타일** 적용
- 선택적으로 **제목과 설명** 표시

### 코드 분석

\`\`\`tsx
// src/components/common/PageContainer/index.tsx
import { Box, Container, Typography, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

// 1. Props 타입 정의
export interface PageContainerProps {
  children: ReactNode;           // 필수: 내부 콘텐츠
  title?: string;                // 선택: 페이지 제목
  description?: string;          // 선택: 페이지 설명
  fullHeight?: boolean;          // 선택: 전체 높이 사용
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;           // 선택: 추가 스타일
}

// 2. 컴포넌트 정의
export default function PageContainer({
  children,
  title,
  description,
  fullHeight = true,
  maxWidth = false,
  sx
}: PageContainerProps) {
  return (
    // 3. 외부 Box - 전체 레이아웃 제어
    <Box
      sx={{
        height: fullHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: fullHeight ? 'hidden' : 'visible',
        ...sx  // 외부에서 전달된 스타일 병합
      }}
    >
      {/* 4. Container - 최대 너비 제한 */}
      <Container
        maxWidth={maxWidth}
        sx={{
          flex: 1,
          py: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 5. 조건부 렌더링 - 제목/설명 */}
        {title && (
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
        )}
        {description && (
          <Typography color="text.secondary" paragraph>
            {description}
          </Typography>
        )}

        {/* 6. children 렌더링 */}
        {children}
      </Container>
    </Box>
  );
}
\`\`\`

### 사용 예시

\`\`\`tsx
// 기본 사용
<PageContainer>
  <div>페이지 내용</div>
</PageContainer>

// 제목과 함께
<PageContainer title="사용자 관리" description="시스템 사용자를 관리합니다.">
  <UserList />
</PageContainer>

// 스타일 커스터마이징
<PageContainer sx={{ bgcolor: 'grey.50', py: 4 }}>
  <Dashboard />
</PageContainer>
\`\`\`
      `,
      codeExamples: [
        {
          id: 'pagecontainer-usage',
          title: '실제 페이지에서의 사용',
          description: 'conversations 페이지에서 PageContainer를 사용하는 패턴입니다.',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `export default function ConversationsPage() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 고정 헤더 영역 */}
      <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <PageContainer sx={{ pb: 0, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb />
          <QuickSearchBar ... />
        </PageContainer>
      </Box>

      {/* 스크롤 콘텐츠 영역 */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <PageContainer sx={{ py: 2 }}>
          <CardGrid ... />
        </PageContainer>
      </Box>
    </Box>
  );
}`
        }
      ],
      tips: [
        'children prop은 컴포넌트 사이에 들어가는 모든 내용을 받습니다.',
        'sx prop을 지원하면 사용하는 쪽에서 유연하게 스타일을 조정할 수 있습니다.'
      ]
    },
    {
      id: 'example-pageheader',
      title: '예제: PageHeader 컴포넌트',
      content: `
**PageHeader** 는 페이지 상단에 표시되는 네비게이션 컴포넌트입니다.

### 역할

- **Breadcrumb** (경로 표시) 렌더링
- **메뉴 버튼** 표시 (사이드바 토글)
- 일관된 헤더 스타일 제공

### 코드 구조

\`\`\`tsx
// src/components/common/PageHeader/index.tsx
interface PageHeaderProps {
  useMenu?: boolean;        // 메뉴 버튼 표시 여부
  showBreadcrumb?: boolean; // Breadcrumb 표시 여부
}

export default function PageHeader({
  useMenu = false,
  showBreadcrumb = false
}: PageHeaderProps) {
  // 사이드바 컨텍스트에서 토글 함수 가져오기
  const { toggleSidebar } = useSidebar();

  // 현재 경로 정보
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {/* 메뉴 버튼 - 조건부 렌더링 */}
      {useMenu && (
        <IconButton onClick={toggleSidebar} size="small">
          <Menu />
        </IconButton>
      )}

      {/* Breadcrumb - 조건부 렌더링 */}
      {showBreadcrumb && breadcrumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={crumb.path}
              href={crumb.path}
              style={{
                color: index === breadcrumbs.length - 1 ? 'inherit' : 'gray'
              }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
    </Box>
  );
}
\`\`\`

### 설계 포인트

1. **Boolean Props로 기능 토글**
   - \`useMenu\`, \`showBreadcrumb\`으로 필요한 기능만 활성화

2. **기본값 설정**
   - \`useMenu = false\`로 기본은 메뉴 버튼 숨김

3. **Context 활용**
   - \`useSidebar()\` 훅으로 전역 상태 접근
      `,
      tips: [
        'Boolean prop 이름은 is, has, show, use 등의 접두사를 사용하면 의미가 명확해집니다.',
        '기본값은 가장 일반적인 사용 케이스에 맞춰 설정하세요.'
      ]
    },
    {
      id: 'example-badge',
      title: '예제: Badge 컴포넌트',
      content: `
**Badge** 컴포넌트는 여러 종류의 배지를 제공하는 **Named Export** 패턴의 예시입니다.

### 파일 구조

\`\`\`
components/common/Badge/
└── index.tsx    # 여러 컴포넌트를 named export
\`\`\`

### 설정 객체 패턴

\`\`\`tsx
// 1. 설정 데이터 정의
export const categoryConfigs: Record<string, CategoryConfig> = {
  feature: {
    label: 'Feature',
    color: '#10b981',
    icon: <Rocket sx={{ fontSize: 14 }} />
  },
  bugfix: {
    label: 'Bug Fix',
    color: '#ef4444',
    icon: <BugReport sx={{ fontSize: 14 }} />
  },
  refactor: {
    label: 'Refactor',
    color: '#8b5cf6',
    icon: <Build sx={{ fontSize: 14 }} />
  }
};

export const difficultyColors: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444'
};
\`\`\`

### 컴포넌트들

\`\`\`tsx
// 2. CategoryBadge - 설정 객체 조회
export function CategoryBadge({ category, size = 'medium' }: CategoryBadgeProps) {
  const config = categoryConfigs[category];

  if (!config) {
    return <Chip label={category} size={size} />;
  }

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size={size}
      sx={{
        bgcolor: \`\${config.color}15\`,
        color: config.color,
        fontWeight: 600
      }}
    />
  );
}

// 3. DifficultyBadge - 간단한 색상 매핑
export function DifficultyBadge({ difficulty, size = 'medium' }: DifficultyBadgeProps) {
  const color = difficultyColors[difficulty] || '#6b7280';

  return (
    <Chip
      label={difficulty}
      size={size}
      sx={{
        bgcolor: \`\${color}15\`,
        color: color,
        textTransform: 'capitalize'
      }}
    />
  );
}

// 4. MetaInfo - 아이콘 + 값 조합
export function MetaInfo({ icon, value }: MetaInfoProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
      {icon}
      <Typography variant="caption">{value}</Typography>
    </Box>
  );
}
\`\`\`

### 사용 예시

\`\`\`tsx
import { CategoryBadge, DifficultyBadge, MetaInfo } from '@/components/common/Badge';

function ConversationCard({ conversation }) {
  return (
    <Card>
      <CategoryBadge category={conversation.category} />
      <DifficultyBadge difficulty={conversation.difficulty} />
      <MetaInfo icon={<Chat />} value={conversation.messageCount} />
    </Card>
  );
}
\`\`\`

### 설계 포인트

1. **설정 객체 분리** - 데이터와 로직 분리로 유지보수 용이
2. **Fallback 처리** - 알 수 없는 값에 대한 기본 동작
3. **일관된 스타일** - 15% 투명도 배경 패턴 통일
      `,
      tips: [
        'Named Export로 관련 컴포넌트들을 하나의 파일에서 관리하면 import가 편리합니다.',
        '설정 객체를 export하면 다른 곳에서도 재사용할 수 있습니다.'
      ]
    },
    {
      id: 'summary',
      title: '정리',
      content: `
### 이번 챕터에서 배운 내용

- **함수형 컴포넌트:** 함수로 UI를 정의하고, Props로 데이터를 받음
- **분리 기준:** 재사용성, 복잡도, 관심사 분리
- **폴더 구조:** common, layout, 도메인별 분류
- **실제 예제:** PageContainer, PageHeader, Badge

### 컴포넌트 설계 체크리스트

| 항목 | 체크 |
|------|------|
| 이름이 역할을 명확히 나타내는가? | □ |
| 한 가지 역할만 수행하는가? | □ |
| Props 타입이 명확히 정의되어 있는가? | □ |
| 기본값이 적절히 설정되어 있는가? | □ |
| 재사용 가능한가? | □ |

### 좋은 컴포넌트의 특징

1. **명확한 이름** - 역할을 바로 알 수 있음
2. **단일 책임** - 한 가지 일만 잘 함
3. **명시적 Props** - 필요한 데이터가 명확함
4. **적절한 기본값** - 사용하기 편리함
5. **독립성** - 다른 컴포넌트에 의존하지 않음

### 실습 과제

1. \`src/components/common/PageContainer/index.tsx\` 코드 분석
2. \`src/components/common/Badge/index.tsx\` 에서 Named Export 패턴 확인
3. \`src/components/common/CardGrid/index.tsx\` 의 제네릭 타입 사용법 살펴보기

### 다음 챕터 예고

다음 챕터에서는 **Props - 데이터 전달하기** 를 학습합니다. 부모에서 자식으로 데이터를 전달하는 방법과 다양한 Props 패턴을 알아봅니다.
      `
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - 컴포넌트와 Props',
      url: 'https://ko.react.dev/learn/passing-props-to-a-component',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - 컴포넌트 구성',
      url: 'https://ko.react.dev/learn/thinking-in-react',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
