/**
 * Chapter 9: 컴포넌트 합성
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'composition',
  order: 9,
  title: 'Component Composition',
  titleKo: '컴포넌트 합성',
  description: 'Learn composition patterns for building flexible and reusable components.',
  descriptionKo: '유연하고 재사용 가능한 컴포넌트를 만들기 위한 합성 패턴을 학습합니다.',
  estimatedMinutes: 45,
  objectives: [
    'Understand composition vs inheritance',
    'Build layout components with children',
    'Implement slot patterns for multiple content areas',
    'Apply render props pattern'
  ],
  objectivesKo: [
    '합성과 상속의 차이를 이해한다',
    'children을 활용한 레이아웃 컴포넌트를 만든다',
    '여러 콘텐츠 영역을 위한 슬롯 패턴을 구현한다',
    'Render props 패턴을 적용한다'
  ],
  sections: [
    {
      id: 'composition-vs-inheritance',
      title: 'Composition vs Inheritance',
      titleKo: '합성 vs 상속',
      content: `
## 합성(Composition)이란?

React에서는 상속(Inheritance) 대신 **합성(Composition)**을 사용하여
컴포넌트를 조합합니다. 합성은 컴포넌트를 조립하여 더 복잡한 UI를 만드는 방식입니다.

### 왜 합성인가?

- **유연성**: 필요한 부분만 조합 가능
- **재사용성**: 다양한 맥락에서 재사용
- **명시성**: 무엇이 렌더링되는지 명확
- **테스트 용이성**: 개별 컴포넌트 테스트 가능

### 상속의 문제점

\`\`\`tsx
// ❌ 상속 방식 - 권장하지 않음
class SpecialButton extends Button {
  render() {
    return super.render() + 'Special';
  }
}

// ✅ 합성 방식 - React의 권장 방식
function SpecialButton({ children }) {
  return (
    <Button>
      {children} Special
    </Button>
  );
}
\`\`\`
`,
      codeExamples: [
        {
          id: 'composition-basic',
          title: '합성의 기본 개념',
          language: 'tsx',
          code: `// 합성: 작은 컴포넌트를 조립하여 큰 컴포넌트 만들기

// 1. 기본 컴포넌트들
function Avatar({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="avatar" />;
}

function UserName({ name }: { name: string }) {
  return <Typography fontWeight={600}>{name}</Typography>;
}

function UserBio({ bio }: { bio: string }) {
  return <Typography color="text.secondary">{bio}</Typography>;
}

// 2. 합성으로 만든 복합 컴포넌트
function UserProfile({ user }: { user: User }) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Avatar src={user.avatarUrl} alt={user.name} />
      <Box>
        <UserName name={user.name} />
        <UserBio bio={user.bio} />
      </Box>
    </Box>
  );
}

// 3. 또 다른 합성 - 같은 컴포넌트를 다르게 조합
function UserCard({ user }: { user: User }) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Avatar src={user.avatarUrl} alt={user.name} />
      <UserName name={user.name} />
      {/* UserBio 생략 - 카드에서는 필요 없음 */}
    </Paper>
  );
}`,
          description: '작은 컴포넌트들을 조립하여 다양한 복합 컴포넌트를 만듭니다.'
        }
      ],
      tips: [
        '💡 React 팀은 상속 대신 합성을 권장합니다 (React 공식 문서)',
        '✅ "Has-a" 관계(합성)가 "Is-a" 관계(상속)보다 유연합니다',
        'ℹ️ 상속은 클래스 기반이며, 함수형 컴포넌트에서는 합성이 자연스럽습니다'
      ]
    },
    {
      id: 'children-prop',
      title: 'The children Prop',
      titleKo: 'children Props 이해하기',
      content: `
## children이란?

\`children\`은 React의 특별한 prop으로, 컴포넌트 태그 사이에 있는
내용을 자동으로 전달받습니다.

### children 타입

\`\`\`tsx
// TypeScript에서 children 타입
interface Props {
  children: React.ReactNode;  // 모든 렌더링 가능한 값
}

// 더 구체적인 타입도 가능
interface Props {
  children: React.ReactElement;     // JSX 요소만
  children: React.ReactElement[];   // 요소 배열
  children: string;                 // 문자열만
  children: (data: T) => ReactNode; // 함수 (Render Props)
}
\`\`\`

### children 사용법

\`\`\`tsx
// 컴포넌트 정의
function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="wrapper">{children}</div>;
}

// 사용
<Wrapper>
  <h1>제목</h1>
  <p>내용</p>
</Wrapper>

// children으로 전달되는 것:
// <>
//   <h1>제목</h1>
//   <p>내용</p>
// </>
\`\`\`
`,
      codeExamples: [
        {
          id: 'children-examples',
          title: 'children의 다양한 형태',
          language: 'tsx',
          code: `// children은 다양한 형태가 될 수 있습니다

interface BoxProps {
  children: React.ReactNode;
}

function FlexBox({ children }: BoxProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {children}
    </Box>
  );
}

// 1. 단일 요소
<FlexBox>
  <Button>Click</Button>
</FlexBox>

// 2. 여러 요소
<FlexBox>
  <Button>Save</Button>
  <Button>Cancel</Button>
</FlexBox>

// 3. 텍스트
<FlexBox>
  Hello World
</FlexBox>

// 4. 혼합
<FlexBox>
  <Icon />
  텍스트
  <Button>액션</Button>
</FlexBox>

// 5. 조건부 children
<FlexBox>
  {isLoading && <Spinner />}
  {!isLoading && <Content />}
</FlexBox>

// 6. 빈 children (null, undefined)
<FlexBox>
  {showContent ? <Content /> : null}
</FlexBox>`,
          description: 'children prop은 다양한 형태의 값을 받을 수 있습니다.'
        }
      ],
      tips: [
        '💡 children은 React.ReactNode 타입이 가장 유연합니다',
        '⚠️ children이 없을 수 있으면 optional로: children?: ReactNode',
        '✅ 빈 children도 정상 작동합니다 (null, undefined 렌더링 안 함)'
      ]
    },
    {
      id: 'layout-components',
      title: 'Layout Components',
      titleKo: '레이아웃 컴포넌트',
      content: `
## children을 활용한 레이아웃 컴포넌트

레이아웃 컴포넌트는 **껍데기**를 제공하고, 내용물은 children으로 받습니다.
이 패턴으로 일관된 레이아웃을 재사용할 수 있습니다.

### 레이아웃 컴포넌트의 특징

1. **구조 제공**: 헤더, 사이드바, 푸터 등의 골격
2. **스타일 적용**: 여백, 배경색, 그림자 등
3. **내용 위임**: 실제 콘텐츠는 children으로 위임
4. **Props로 커스터마이징**: 옵션으로 동작 변경

### 프로젝트의 레이아웃 컴포넌트

- \`PageContainer\`: 페이지 전체를 감싸는 컨테이너
- \`AuthenticatedLayout\`: 인증된 사용자용 레이아웃
- \`CardWrapper\`: 카드 스타일 래퍼
- \`FormDialog\`: 폼을 위한 다이얼로그 레이아웃
`,
      codeExamples: [
        {
          id: 'page-container',
          title: 'PageContainer 컴포넌트',
          language: 'tsx',
          code: `// src/components/common/PageContainer/index.tsx
interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  sx?: SxProps<Theme>;
}

export default function PageContainer({
  children,
  title,
  description,
  fullHeight = true,
  noPadding = true,
  maxWidth = false,
  sx = {}
}: PageContainerProps) {
  const defaultSx: SxProps<Theme> = {
    maxWidth: '100%',
    px: noPadding ? 0 : 2,
    ...(fullHeight && {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    })
  };

  return (
    <Container
      maxWidth={maxWidth}
      sx={{ ...defaultSx, ...sx }}
    >
      {/* 선택적 타이틀 영역 */}
      {(title || description) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      )}
      {/* children이 실제 페이지 콘텐츠 */}
      {children}
    </Container>
  );
}`,
          description: 'PageContainer는 페이지 레이아웃의 기본 골격을 제공합니다.'
        },
        {
          id: 'page-container-usage',
          title: 'PageContainer 사용 예시',
          language: 'tsx',
          code: `// 사용 예시 1: 기본 사용
function ConversationsPage() {
  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />
      <CardGrid items={conversations} renderCard={...} />
    </PageContainer>
  );
}

// 사용 예시 2: 제목 포함
function DashboardPage() {
  return (
    <PageContainer
      title="대시보드"
      description="시스템 현황을 확인하세요"
    >
      <StatsGrid />
      <RecentActivity />
    </PageContainer>
  );
}

// 사용 예시 3: 커스텀 스타일
function SettingsPage() {
  return (
    <PageContainer
      maxWidth="md"
      sx={{ py: 4, bgcolor: 'grey.50' }}
    >
      <SettingsForm />
    </PageContainer>
  );
}`,
          description: 'PageContainer를 다양한 페이지에서 재사용합니다.'
        }
      ],
      tips: [
        '💡 레이아웃 컴포넌트는 "어디에" 렌더링할지, children은 "무엇을" 렌더링할지',
        '✅ Props로 레이아웃 변형을 지원하면 재사용성이 높아집니다',
        'ℹ️ MUI의 Container, Box 등도 레이아웃 컴포넌트 패턴입니다'
      ]
    },
    {
      id: 'authenticated-layout-pattern',
      title: 'AuthenticatedLayout Pattern',
      titleKo: 'AuthenticatedLayout 패턴',
      content: `
## 복합 레이아웃 컴포넌트

AuthenticatedLayout은 레이아웃 + 비즈니스 로직(인증)을 결합한 예입니다.
children을 감싸면서 인증, 권한, 사이드바 등을 관리합니다.

### AuthenticatedLayout의 구조

\`\`\`
┌────────────────────────────────────────┐
│  DashboardHeader (상단 헤더)            │
├──────────┬─────────────────────────────┤
│          │                             │
│ Sidebar  │     children               │
│ (사이드바)│     (메인 콘텐츠 영역)        │
│          │                             │
│          │                             │
└──────────┴─────────────────────────────┘
\`\`\`

### 주요 특징

- **인증 체크**: 로그인 여부 확인
- **권한 체크**: requireRole로 접근 제한
- **레이아웃 모드**: fullBleed 옵션으로 스크롤 제어
`,
      codeExamples: [
        {
          id: 'authenticated-layout',
          title: 'AuthenticatedLayout 구현',
          language: 'tsx',
          code: `// src/components/layout/AuthenticatedLayout/index.tsx
interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'manager' | 'user';
  showAutoLogoutWarning?: boolean;
  fullBleed?: boolean;  // children이 자체 스크롤 관리
}

export default function AuthenticatedLayout({
  children,
  requireRole,
  showAutoLogoutWarning = false,
  fullBleed = false
}: AuthenticatedLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // 인증 체크 로직
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(\`/\${locale}/login\`);
    }
    // 권한 체크...
  }, [isAuthenticated, isLoading, user]);

  // 로딩 상태
  if (shouldShowLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 헤더 */}
      <DashboardHeader onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 사이드바 */}
        <Sidebar expanded={sidebarExpanded} />

        {/* 메인 콘텐츠 영역 */}
        <Box component="main" sx={{ flex: 1, overflow: 'hidden' }}>
          {fullBleed ? (
            // children이 자체 스크롤 관리
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {children}
            </Box>
          ) : (
            // 기본: 래퍼가 스크롤 관리
            <Box sx={{ overflowY: 'auto', px: 2, py: 2 }}>
              {children}
            </Box>
          )}
        </Box>
      </Box>

      {showAutoLogoutWarning && <AutoLogoutWarning />}
    </Box>
  );
}`,
          description: 'AuthenticatedLayout은 인증과 레이아웃을 함께 처리합니다.'
        },
        {
          id: 'authenticated-layout-usage',
          title: 'AuthenticatedLayout 사용',
          language: 'tsx',
          code: `// app/[locale]/admin/layout.tsx - 관리자 전용 레이아웃
export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout
      requireRole="admin"  // 관리자만 접근
      showAutoLogoutWarning
    >
      {children}
    </AuthenticatedLayout>
  );
}

// app/[locale]/dev/conversations/page.tsx - fullBleed 사용
export default function ConversationsPage() {
  return (
    <AuthenticatedLayout fullBleed>
      {/* 이 컴포넌트가 자체 스크롤 관리 */}
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PageHeader />
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <CardGrid ... />
        </Box>
      </Box>
    </AuthenticatedLayout>
  );
}`,
          description: 'requireRole과 fullBleed 옵션으로 동작을 커스터마이징합니다.'
        }
      ],
      tips: [
        '💡 Next.js의 layout.tsx와 결합하면 폴더 단위로 레이아웃 적용 가능',
        '✅ fullBleed 패턴으로 children이 레이아웃 제어권을 가져갈 수 있음',
        '⚠️ 레이아웃에 로직이 많으면 커스텀 훅으로 분리 권장'
      ]
    },
    {
      id: 'slot-pattern',
      title: 'Slot Pattern',
      titleKo: '슬롯 패턴',
      content: `
## 여러 children을 위한 슬롯 패턴

하나의 children 대신 **여러 개의 콘텐츠 영역**이 필요할 때 슬롯 패턴을 사용합니다.
각 슬롯은 별도의 prop으로 정의됩니다.

### 슬롯 패턴 vs children

\`\`\`tsx
// children만 사용: 하나의 콘텐츠 영역
<Card>
  {/* 전체 내용 */}
</Card>

// 슬롯 패턴: 여러 콘텐츠 영역
<Card
  header={<CardHeader />}      // 슬롯 1
  footer={<CardFooter />}      // 슬롯 2
>
  {/* children = 본문 영역 */}  // 슬롯 3
</Card>
\`\`\`

### 슬롯 이름 규칙

- 영역 이름: \`header\`, \`footer\`, \`sidebar\`
- 액션 영역: \`actions\`, \`additionalActions\`
- 아이콘: \`icon\`, \`startIcon\`, \`endIcon\`
`,
      codeExamples: [
        {
          id: 'page-header-slots',
          title: 'PageHeader의 actions 슬롯',
          language: 'tsx',
          code: `// src/components/common/PageHeader/index.tsx
interface PageHeaderProps {
  title?: string;
  description?: string;
  useMenu?: boolean;
  showBreadcrumb?: boolean;
  actions?: React.ReactNode;  // 👈 슬롯 prop
}

export default function PageHeader({
  title,
  description,
  actions,  // 액션 버튼 영역
  ...
}: PageHeaderProps) {
  return (
    <Box sx={{ mb: 1.5 }}>
      {showBreadcrumb && <Breadcrumbs ... />}

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* 왼쪽: 제목과 설명 */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">{displayTitle}</Typography>
          {displayDescription && (
            <Typography color="text.secondary">
              {displayDescription}
            </Typography>
          )}
        </Box>

        {/* 오른쪽: actions 슬롯 */}
        {actions && (
          <Box sx={{ flexShrink: 0 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}`,
          description: 'actions prop으로 헤더 오른쪽에 버튼을 배치합니다.'
        },
        {
          id: 'page-header-slots-usage',
          title: 'PageHeader 슬롯 사용',
          language: 'tsx',
          code: `// 사용 예시: actions 슬롯에 버튼 전달
function UsersPage() {
  return (
    <PageContainer>
      <PageHeader
        useMenu
        showBreadcrumb
        actions={
          // 👇 actions 슬롯에 들어갈 내용
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleFilter}
            >
              필터
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
            >
              사용자 추가
            </Button>
          </Box>
        }
      />
      <UserTable />
    </PageContainer>
  );
}`,
          description: 'PageHeader의 actions 슬롯을 활용한 사용 예시입니다.'
        },
        {
          id: 'form-dialog-slots',
          title: 'FormDialog의 여러 슬롯',
          language: 'tsx',
          code: `// src/components/common/FormDialog/index.tsx
interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  title: string;
  children: ReactNode;           // 👈 메인 콘텐츠 슬롯
  additionalActions?: ReactNode; // 👈 추가 액션 슬롯
  // ... other props
}

export default function FormDialog({
  children,
  additionalActions,
  ...
}: FormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      {/* Header 슬롯 - title prop으로 */}
      <DialogTitle>{title}</DialogTitle>

      {/* Content 슬롯 - children */}
      <DialogContent>
        {children}
      </DialogContent>

      {/* Footer 슬롯 */}
      <DialogActions>
        {/* 추가 액션 슬롯 - 취소/저장 앞에 표시 */}
        {additionalActions}

        <Button onClick={onClose}>Cancel</Button>
        {onSave && (
          <Button onClick={onSave} variant="contained">
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// 사용
<FormDialog
  open={open}
  title="사용자 편집"
  onSave={handleSave}
  additionalActions={
    <Button color="error" onClick={handleDelete}>
      삭제
    </Button>
  }
>
  <UserForm user={selectedUser} />
</FormDialog>`,
          description: 'FormDialog는 children과 additionalActions 두 개의 슬롯을 제공합니다.'
        }
      ],
      tips: [
        '💡 슬롯 이름은 영역의 목적을 명확히 표현해야 합니다',
        '✅ 슬롯이 비어있을 수 있다면 조건부 렌더링: {slot && <Box>{slot}</Box>}',
        'ℹ️ Vue의 named slots, Angular의 ng-content와 유사한 개념입니다'
      ]
    },
    {
      id: 'search-filter-panel',
      title: 'SearchFilterPanel Pattern',
      titleKo: 'SearchFilterPanel 패턴',
      content: `
## 컨테이너 컴포넌트 패턴

SearchFilterPanel은 **컨테이너 역할**을 하며, 필터 UI는 children으로 위임합니다.
컨테이너는 공통 기능(접기/펼치기, 버튼)만 처리합니다.

### 패턴의 장점

- **내용 독립**: 어떤 필터든 넣을 수 있음
- **일관된 UX**: 모든 페이지에서 같은 접기/펼치기 동작
- **로직 재사용**: 검색, 초기화 버튼 로직 공유
`,
      codeExamples: [
        {
          id: 'search-filter-panel-impl',
          title: 'SearchFilterPanel 구현',
          language: 'tsx',
          code: `// src/components/common/SearchFilterPanel/index.tsx
interface SearchFilterPanelProps {
  title?: string;
  activeFilterCount: number;
  onSearch?: () => void;
  onClear?: () => void;
  defaultExpanded?: boolean;
  children: React.ReactNode;  // 👈 필터 UI는 children으로
}

export default function SearchFilterPanel({
  title = 'Search / Filter',
  activeFilterCount,
  onSearch,
  onClear,
  defaultExpanded = false,
  children
}: SearchFilterPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Paper sx={{ mb: 1 }}>
      {/* 헤더: 제목 + 활성 필터 수 + 토글 */}
      <Box
        sx={{ p: 1.5, cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            {title}
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={\`\${activeFilterCount} active\`}
              size="small"
              color="primary"
            />
          )}
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* 콘텐츠: children + 버튼 */}
      <Collapse in={expanded}>
        <Box sx={{ p: 1.5 }}>
          {/* 👇 필터 UI는 children으로 받음 */}
          {children}

          {/* 공통 액션 버튼 */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
            <IconButton onClick={onClear}>
              <RestartAlt />
            </IconButton>
            <IconButton onClick={onSearch} sx={{ bgcolor: 'primary.main' }}>
              <Search />
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}`,
          description: 'SearchFilterPanel은 껍데기만 제공하고 필터 UI는 children으로 받습니다.'
        },
        {
          id: 'search-filter-panel-usage',
          title: 'SearchFilterPanel 사용',
          language: 'tsx',
          code: `// ConversationsPage에서 사용
function ConversationsPage() {
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [branch, setBranch] = useState('');

  const activeFilterCount = [category, difficulty, branch]
    .filter(Boolean).length;

  return (
    <SearchFilterPanel
      activeFilterCount={activeFilterCount}
      onSearch={handleSearch}
      onClear={() => {
        setCategory('');
        setDifficulty('');
        setBranch('');
      }}
      showHeader={false}  // 헤더 없이 필터만
    >
      {/* 👇 이 부분이 children으로 전달됨 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* Category Select */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={e => setCategory(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {filterOptions?.categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Difficulty Select */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Difficulty</InputLabel>
          <Select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {filterOptions?.difficulties.map((diff) => (
              <MenuItem key={diff} value={diff}>{diff}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Branch Select */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Branch</InputLabel>
          <Select value={branch} onChange={e => setBranch(e.target.value)}>
            ...
          </Select>
        </FormControl>
      </Box>
    </SearchFilterPanel>
  );
}`,
          description: '다양한 필터 조합을 SearchFilterPanel에 넣어 사용합니다.'
        }
      ],
      tips: [
        '💡 컨테이너는 "어떻게" 표시할지, children은 "무엇을" 표시할지 담당',
        '✅ activeFilterCount를 prop으로 받아 상태 표시',
        'ℹ️ 같은 패널에 다른 필터 조합을 넣어 재사용'
      ]
    },
    {
      id: 'card-wrapper-pattern',
      title: 'CardWrapper Pattern',
      titleKo: 'CardWrapper 패턴',
      content: `
## 스타일 래퍼 컴포넌트

CardWrapper는 일관된 카드 스타일을 제공하는 래퍼입니다.
children의 내용과 관계없이 동일한 외관을 보장합니다.

### CardWrapper의 역할

- 일관된 테두리, 그림자, radius
- hover 효과
- 선택 상태 스타일
- 클릭 가능 여부
`,
      codeExamples: [
        {
          id: 'card-wrapper-impl',
          title: 'CardWrapper 구현',
          language: 'tsx',
          code: `// src/components/common/CardGrid/index.tsx 내부
export function CardWrapper({
  children,
  onClick,
  selected = false,
  hoverEffect = true
}: {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  hoverEffect?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        height: '100%',
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        // 선택 상태에 따른 스타일
        borderColor: selected ? 'primary.main' : 'grey.200',
        bgcolor: selected ? 'primary.50' : 'white',
        // 클릭 가능 여부에 따른 커서
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        // hover 효과 (옵션)
        ...(hoverEffect && onClick && {
          '&:hover': {
            borderColor: 'primary.light',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
          }
        })
      }}
    >
      {children}
    </Paper>
  );
}`,
          description: 'CardWrapper는 스타일만 제공하고 내용은 children으로 받습니다.'
        },
        {
          id: 'card-wrapper-usage',
          title: 'CardWrapper 사용',
          language: 'tsx',
          code: `// 사용 예시 1: 선택 가능한 카드
function SelectableCard({ item, isSelected, onSelect }) {
  return (
    <CardWrapper
      onClick={() => onSelect(item.id)}
      selected={isSelected}
      hoverEffect
    >
      <Typography variant="h6">{item.title}</Typography>
      <Typography color="text.secondary">{item.description}</Typography>
    </CardWrapper>
  );
}

// 사용 예시 2: 정보 표시 카드 (클릭 불가)
function InfoCard({ stats }) {
  return (
    <CardWrapper hoverEffect={false}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3">{stats.value}</Typography>
        <Typography color="text.secondary">{stats.label}</Typography>
      </Box>
    </CardWrapper>
  );
}

// 사용 예시 3: ChapterCard에서 활용
function ChapterCard({ chapter, index, courseColor, onClick }) {
  const isReady = chapter.status === 'ready';

  return (
    <Paper
      elevation={0}
      onClick={isReady ? onClick : undefined}
      sx={{
        // CardWrapper와 유사한 패턴
        height: '100%',
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        opacity: isReady ? 1 : 0.6,
        cursor: isReady ? 'pointer' : 'default',
        '&:hover': isReady ? {
          borderColor: courseColor,
          transform: 'translateY(-2px)'
        } : {}
      }}
    >
      {/* 카드 내용 */}
    </Paper>
  );
}`,
          description: 'CardWrapper 패턴을 다양한 상황에서 활용합니다.'
        }
      ],
      tips: [
        '💡 스타일 래퍼는 시각적 일관성을 보장합니다',
        '✅ 조건부 스타일은 props(selected, hoverEffect)로 제어',
        'ℹ️ 같은 패턴을 여러 컴포넌트에 적용하면 일관된 디자인 시스템 구축'
      ]
    },
    {
      id: 'render-props-pattern',
      title: 'Render Props Pattern',
      titleKo: 'Render Props 패턴',
      content: `
## Render Props란?

Render Props는 함수를 children이나 prop으로 전달하여
**렌더링 로직을 외부에서 제어**하는 패턴입니다.

### 왜 Render Props를 사용할까?

- 로직 재사용: 상태 관리 로직을 공유
- 유연한 렌더링: 호출자가 UI를 결정
- 데이터 전달: 내부 상태를 외부로 전달

### 기본 문법

\`\`\`tsx
// Render Props 컴포넌트
<DataProvider>
  {(data) => <MyComponent data={data} />}
</DataProvider>

// 또는 render prop으로
<DataProvider render={(data) => <MyComponent data={data} />} />
\`\`\`
`,
      codeExamples: [
        {
          id: 'cardgrid-render-props',
          title: 'CardGrid의 renderCard',
          language: 'tsx',
          code: `// src/components/common/CardGrid/index.tsx
interface CardGridProps<T> {
  items: T[];
  // 👇 Render Prop: 각 아이템을 어떻게 렌더링할지 외부에서 결정
  renderCard: (item: T, index: number) => ReactNode;
  loading?: boolean;
  skeletonCount?: number;
  renderSkeleton?: () => ReactNode;  // 스켈레톤도 Render Prop
  // ...
}

export default function CardGrid<T>({
  items,
  renderCard,
  loading,
  skeletonCount = 6,
  renderSkeleton,
  columns,
  ...
}: CardGridProps<T>) {
  // 로딩 상태
  if (loading) {
    return (
      <Grid container spacing={spacing}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <Grid item key={idx} {...columns}>
            {/* 👇 renderSkeleton이 있으면 사용, 없으면 기본값 */}
            {renderSkeleton ? renderSkeleton() : <DefaultSkeleton />}
          </Grid>
        ))}
      </Grid>
    );
  }

  // 실제 데이터 렌더링
  return (
    <Grid container spacing={spacing}>
      {items.map((item, index) => (
        <Grid item key={index} {...columns}>
          {/* 👇 renderCard로 렌더링 위임 */}
          {renderCard(item, index)}
        </Grid>
      ))}
    </Grid>
  );
}`,
          description: 'CardGrid는 renderCard prop으로 카드 렌더링을 외부에 위임합니다.'
        },
        {
          id: 'cardgrid-render-props-usage',
          title: 'CardGrid Render Props 사용',
          language: 'tsx',
          code: `// 사용 예시 1: ConversationCard 렌더링
<CardGrid
  items={conversations}
  loading={isLoading}
  columns={{ xs: 12, sm: 6, md: 4 }}
  renderCard={(conversation) => (
    // 👇 conversation 데이터를 받아서 원하는 UI 렌더링
    <ConversationCard
      conversation={conversation}
      onClick={() => handleClick(conversation.id)}
      onDelete={() => handleDelete(conversation.id)}
    />
  )}
/>

// 사용 예시 2: ChapterCard 렌더링
<CardGrid
  items={chapters}
  loading={false}
  columns={{ xs: 12, sm: 6, md: 4 }}
  renderCard={(chapter, index) => (
    // 👇 index도 활용 가능
    <ChapterCard
      chapter={chapter}
      index={index}
      courseColor={courseMeta.color}
      onClick={() => handleChapterClick(chapter.id)}
    />
  )}
/>

// 사용 예시 3: 커스텀 스켈레톤
<CardGrid
  items={users}
  loading={isLoading}
  skeletonCount={8}
  renderSkeleton={() => (
    // 👇 커스텀 스켈레톤 UI
    <Paper sx={{ p: 2, height: 200 }}>
      <Skeleton variant="circular" width={60} height={60} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </Paper>
  )}
  renderCard={(user) => <UserCard user={user} />}
/>`,
          description: 'renderCard prop으로 다양한 카드 UI를 같은 그리드 레이아웃에 렌더링합니다.'
        },
        {
          id: 'custom-render-props',
          title: '커스텀 Render Props 컴포넌트',
          language: 'tsx',
          code: `// Render Props로 마우스 위치 공유
interface MouseTrackerProps {
  children: (position: { x: number; y: number }) => ReactNode;
}

function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // 👇 children 함수를 호출하며 position 전달
  return <>{children(position)}</>;
}

// 사용
<MouseTracker>
  {({ x, y }) => (
    <Box sx={{
      position: 'fixed',
      left: x + 10,
      top: y + 10,
      bgcolor: 'primary.main',
      color: 'white',
      p: 1,
      borderRadius: 1
    }}>
      마우스 위치: {x}, {y}
    </Box>
  )}
</MouseTracker>`,
          description: 'Render Props로 내부 상태를 외부에서 활용할 수 있습니다.'
        }
      ],
      tips: [
        '💡 Render Props는 HOC의 대안으로 더 명시적입니다',
        '✅ 현대 React에서는 Custom Hooks가 더 선호되지만, UI 재사용에는 Render Props가 유용',
        '⚠️ 과도한 중첩(Render Props Hell)에 주의하세요'
      ]
    }
  ],
  status: 'ready'
};

export default chapter;
