/**
 * Chapter 7: 조건부 렌더링 심화
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'conditional-rendering',
  order: 7,
  title: 'Advanced Conditional Rendering',
  titleKo: '조건부 렌더링 심화',
  description: 'Master various conditional rendering patterns in React.',
  descriptionKo: 'React의 다양한 조건부 렌더링 패턴을 마스터합니다.',
  estimatedMinutes: 40,
  objectives: [
    'Master various conditional rendering patterns',
    'Handle loading, error, and empty states effectively',
    'Apply conditional styles dynamically',
    'Implement early return pattern'
  ],
  objectivesKo: [
    '다양한 조건부 렌더링 패턴을 마스터한다',
    '로딩, 에러, 빈 상태를 효과적으로 처리한다',
    '조건부 스타일을 동적으로 적용한다',
    'Early return 패턴을 구현한다'
  ],
  sections: [
    {
      id: 'conditional-patterns',
      title: 'Conditional Rendering Patterns',
      titleKo: '다양한 조건부 렌더링 패턴',
      content: `
## 조건부 렌더링 기본 패턴

React에서 조건에 따라 다른 UI를 렌더링하는 여러 가지 방법이 있습니다.
상황에 맞는 패턴을 선택하는 것이 중요합니다.

### 1. 삼항 연산자 (Ternary Operator)

두 가지 중 하나를 선택해야 할 때 사용합니다:

\`\`\`tsx
// 조건 ? 참일 때 : 거짓일 때
{isLoggedIn ? <UserProfile /> : <LoginButton />}

// 중첩 삼항 (가독성 주의!)
{status === 'loading'
  ? <Spinner />
  : status === 'error'
    ? <ErrorMessage />
    : <Content />
}
\`\`\`

### 2. 논리 AND 연산자 (&&)

조건이 참일 때만 렌더링할 때 사용합니다:

\`\`\`tsx
// 조건 && 렌더링할 요소
{isAdmin && <AdminPanel />}
{items.length > 0 && <ItemList items={items} />}
{error && <ErrorAlert message={error} />}
\`\`\`

### 3. 논리 OR 연산자 (||)

기본값이나 대체 콘텐츠를 보여줄 때 사용합니다:

\`\`\`tsx
// 값 || 기본값
{user.nickname || user.email || 'Anonymous'}
{items.length || 'No items'}
\`\`\`

### 4. Early Return 패턴

특정 조건에서 일찍 반환하여 메인 로직을 깔끔하게 유지합니다:

\`\`\`tsx
function UserProfile({ user }: { user: User | null }) {
  // 조건 불충족 시 일찍 반환
  if (!user) {
    return <div>Please log in</div>;
  }

  // 메인 렌더링 로직
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

### 5. 즉시 실행 함수 (IIFE)

복잡한 조건 로직이 필요할 때 사용합니다:

\`\`\`tsx
{(() => {
  switch (status) {
    case 'loading': return <Spinner />;
    case 'error': return <ErrorMessage />;
    case 'empty': return <EmptyState />;
    default: return <Content />;
  }
})()}
\`\`\`

### 패턴 선택 가이드

| 상황 | 권장 패턴 |
|------|----------|
| A 또는 B 중 선택 | 삼항 연산자 |
| 조건 충족 시만 표시 | && 연산자 |
| 기본값 제공 | \|\| 연산자 |
| 여러 조건 순차 체크 | Early Return |
| 3개 이상 분기 | switch 또는 객체 매핑 |
      `,
      codeExamples: [
        {
          id: 'selection-mode-conditional',
          title: 'ConversationCard의 조건부 렌더링',
          description: 'selectionMode에 따라 다른 UI를 보여주는 패턴',
          code: `function ConversationCard({
  conversation,
  onClick,
  selectionMode = false,
  selected = false,
  onSelect,
  onDelete
}: ConversationCardProps) {
  return (
    <CardWrapper
      // 삼항 연산자: 모드에 따라 다른 클릭 핸들러
      onClick={selectionMode
        ? () => onSelect?.(conversation.id)
        : onClick
      }
      // && 연산자: selected일 때만 selected prop 전달
      selected={selectionMode && selected}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* && 연산자: selectionMode일 때만 체크박스 표시 */}
        {selectionMode && (
          <Checkbox
            checked={selected}
            onClick={handleCheckboxClick}
            size="small"
          />
        )}
        <CategoryBadge category={conversation.category} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <DifficultyBadge difficulty={conversation.difficulty_level} />

        {/* && 연산자 + !조건: selectionMode가 아닐 때만 삭제 버튼 */}
        {!selectionMode && (
          <IconButton onClick={handleDeleteClick}>
            <Delete />
          </IconButton>
        )}
      </Box>
    </CardWrapper>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '⚠️ && 연산자 사용 시 주의: 0 && <Component />는 0을 렌더링합니다. Boolean(value) && 또는 value > 0 &&을 사용하세요.',
        '✅ 중첩 삼항 연산자는 가독성이 떨어집니다. 3개 이상 분기는 Early Return이나 switch를 사용하세요.'
      ]
    },
    {
      id: 'loading-error-empty',
      title: 'Loading, Error, Empty States',
      titleKo: '로딩/에러/빈 상태 처리',
      content: `
## 상태별 UI 처리

데이터를 다루는 컴포넌트는 일반적으로 4가지 상태를 처리해야 합니다:

### 4가지 데이터 상태

| 상태 | 설명 | UI |
|------|------|-----|
| Loading | 데이터 로딩 중 | 스켈레톤, 스피너 |
| Error | 에러 발생 | 에러 메시지, 재시도 버튼 |
| Empty | 데이터 없음 | 빈 상태 안내 |
| Success | 데이터 있음 | 실제 콘텐츠 |

### Early Return 순서

상태 처리는 **우선순위** 에 따라 순차적으로 체크합니다:

\`\`\`tsx
function DataList({ data, loading, error }) {
  // 1. 로딩 상태 (최우선)
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. 에러 상태
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // 3. 빈 상태
  if (data.length === 0) {
    return <EmptyState />;
  }

  // 4. 성공 상태 (데이터 렌더링)
  return (
    <ul>
      {data.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
\`\`\`

### 로딩 UI 패턴

**스켈레톤 (Skeleton)** - 콘텐츠 모양을 미리 보여줌:

\`\`\`tsx
// 스켈레톤은 실제 콘텐츠와 유사한 레이아웃
function CardSkeleton() {
  return (
    <Paper sx={{ p: 2 }}>
      <Skeleton variant="rounded" width={80} height={24} />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="60%" />
    </Paper>
  );
}
\`\`\`

**스피너 (Spinner)** - 단순 로딩 표시:

\`\`\`tsx
{loading && <CircularProgress />}
\`\`\`

### 에러 UI 패턴

\`\`\`tsx
function ErrorState({ error, onRetry }) {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>오류가 발생했습니다</AlertTitle>
      {error}
      {onRetry && (
        <Button onClick={onRetry} sx={{ mt: 1 }}>
          다시 시도
        </Button>
      )}
    </Alert>
  );
}
\`\`\`

### 빈 상태 UI 패턴

\`\`\`tsx
function EmptyState({ icon, title, description }) {
  return (
    <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
      <Box sx={{ color: 'grey.400', mb: 2 }}>
        {icon || <SentimentDissatisfied sx={{ fontSize: 64 }} />}
      </Box>
      <Typography variant="h6" color="text.secondary">
        {title || 'No items found'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description || 'Try adjusting your search or filters'}
      </Typography>
    </Paper>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'cardgrid-states',
          title: 'CardGrid의 상태별 렌더링',
          description: '로딩, 빈 상태, 데이터 상태를 처리하는 실제 패턴',
          code: `// CardGrid 컴포넌트 - Early Return 패턴 적용
export default function CardGrid<T>({
  items,
  renderCard,
  loading = false,
  skeletonCount = 6,
  renderSkeleton,
  columns = { xs: 12, sm: 6, md: 4 },
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: CardGridProps<T>) {

  // 1. 로딩 상태 - 스켈레톤 렌더링
  if (loading) {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <Grid item key={idx} {...columns}>
            {renderSkeleton ? renderSkeleton() : <DefaultSkeleton />}
          </Grid>
        ))}
      </Grid>
    );
  }

  // 2. 빈 상태 - Empty UI 렌더링
  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  // 3. 성공 상태 - 실제 카드 렌더링
  return (
    <Grid container spacing={2.5}>
      {items.map((item, index) => (
        <Grid item key={index} {...columns}>
          {renderCard(item, index)}
        </Grid>
      ))}
    </Grid>
  );
}`,
          language: 'tsx'
        },
        {
          id: 'conversations-page-states',
          title: 'ConversationsPage의 상태 처리',
          description: '로딩, 에러, 데이터를 함께 관리하는 페이지 레벨 패턴',
          code: `function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 fetch
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/conversation');
      setConversations(response.data.data);
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PageContainer>
      {/* 에러 상태 - Alert로 표시 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* CardGrid가 loading과 empty 상태를 내부적으로 처리 */}
      <CardGrid
        items={conversations}
        loading={loading}
        skeletonCount={pageSize}
        renderCard={(conv) => (
          <ConversationCard
            conversation={conv}
            onClick={() => handleCardClick(conv.id)}
          />
        )}
        emptyIcon={<Chat sx={{ fontSize: 64 }} />}
        emptyTitle="No conversations found"
        emptyDescription="Try adjusting your search or filters"
      />
    </PageContainer>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ 스켈레톤은 실제 콘텐츠와 유사한 레이아웃을 사용하면 UX가 좋아집니다.',
        '✅ 빈 상태에는 사용자가 다음에 할 수 있는 행동(CTA)을 안내하세요.'
      ]
    },
    {
      id: 'conditional-styles',
      title: 'Conditional Styles',
      titleKo: '조건에 따른 스타일 적용',
      content: `
## 조건부 스타일링

React에서 조건에 따라 스타일을 다르게 적용하는 여러 방법이 있습니다.

### 1. 조건부 className

\`\`\`tsx
// 단순 조건
<div className={isActive ? 'active' : ''}>

// 여러 클래스 조합
<div className={\`card \${isSelected ? 'selected' : ''} \${isDisabled ? 'disabled' : ''}\`}>

// clsx 라이브러리 사용 (권장)
import clsx from 'clsx';
<div className={clsx('card', { selected: isSelected, disabled: isDisabled })}>
\`\`\`

### 2. 인라인 스타일 객체

\`\`\`tsx
<div
  style={{
    color: isError ? 'red' : 'black',
    opacity: isDisabled ? 0.5 : 1,
    cursor: isClickable ? 'pointer' : 'default'
  }}
>
\`\`\`

### 3. MUI sx prop (권장)

MUI를 사용할 때 가장 강력한 방법입니다:

\`\`\`tsx
<Box
  sx={{
    // 조건부 값
    bgcolor: isSelected ? 'primary.50' : 'white',
    borderColor: isSelected ? 'primary.main' : 'grey.200',
    opacity: isDisabled ? 0.6 : 1,
    cursor: isReady ? 'pointer' : 'default',

    // 조건부 객체 (스프레드 활용)
    ...(isHoverable && {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      }
    })
  }}
>
\`\`\`

### 4. 조건부 스타일 객체 병합

복잡한 조건부 스타일은 객체로 분리 후 병합합니다:

\`\`\`tsx
const baseStyles = {
  p: 2,
  borderRadius: 2,
  border: '1px solid'
};

const selectedStyles = {
  borderColor: 'primary.main',
  bgcolor: 'primary.50'
};

const disabledStyles = {
  opacity: 0.5,
  pointerEvents: 'none'
};

<Box
  sx={{
    ...baseStyles,
    ...(isSelected && selectedStyles),
    ...(isDisabled && disabledStyles)
  }}
>
\`\`\`
      `,
      codeExamples: [
        {
          id: 'cardwrapper-conditional-styles',
          title: 'CardWrapper의 조건부 스타일',
          description: 'selected와 hoverEffect에 따른 동적 스타일링',
          code: `// CardWrapper - MUI sx prop으로 조건부 스타일 적용
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

        // 조건부 스타일 (삼항 연산자)
        borderColor: selected ? 'primary.main' : 'grey.200',
        bgcolor: selected ? 'primary.50' : 'white',
        cursor: onClick ? 'pointer' : 'default',

        transition: 'all 0.2s ease',

        // 조건부 hover 효과 (스프레드 연산자)
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
          language: 'tsx'
        },
        {
          id: 'chapter-card-conditional-styles',
          title: 'ChapterCard의 상태별 스타일',
          description: 'ready/draft 상태에 따른 스타일 분기',
          code: `// ChapterCard - 챕터 상태에 따른 조건부 스타일
function ChapterCard({
  chapter,
  index,
  courseColor,
  onClick
}: ChapterCardProps) {
  // 상태 계산
  const isReady = chapter.status === 'published' || chapter.status === 'ready';

  return (
    <Paper
      elevation={0}
      onClick={isReady ? onClick : undefined}
      sx={{
        height: '100%',
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: 'white',

        // 조건부 스타일
        opacity: isReady ? 1 : 0.6,
        cursor: isReady ? 'pointer' : 'default',
        transition: 'all 0.2s ease',

        // 조건부 hover (isReady일 때만)
        '&:hover': isReady ? {
          borderColor: courseColor,
          transform: 'translateY(-2px)',
          boxShadow: \`0 8px 24px \${courseColor}20\`
        } : {}
      }}
    >
      {/* Avatar 배경색도 조건부 */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: isReady ? courseColor : 'grey.300',
          fontWeight: 700
        }}
      >
        {index + 1}
      </Avatar>

      {/* 제목 색상도 조건부 */}
      <Typography
        sx={{
          color: isReady ? 'grey.800' : 'grey.500'
        }}
      >
        {chapter.titleKo}
      </Typography>

      {/* 상태 Chip (조건부 렌더링 + 조건부 스타일) */}
      {isReady ? (
        <Chip
          label="Ready"
          sx={{
            bgcolor: \`\${courseColor}15\`,
            color: courseColor,
            fontWeight: 600
          }}
        />
      ) : (
        <Chip
          icon={<Lock />}
          label="준비 중"
          sx={{
            bgcolor: 'grey.100',
            color: 'grey.500'
          }}
        />
      )}
    </Paper>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ MUI sx prop에서 조건부 객체는 스프레드 연산자 ...(condition && { styles })를 사용하세요.',
        'ℹ️ 복잡한 조건부 스타일은 별도 객체로 분리하면 가독성이 좋아집니다.'
      ]
    },
    {
      id: 'nullish-coalescing',
      title: 'Nullish Coalescing and Optional Chaining',
      titleKo: 'Null 병합 연산자와 옵셔널 체이닝',
      content: `
## 안전한 값 접근 패턴

TypeScript/JavaScript에서 null이나 undefined를 안전하게 처리하는 연산자들입니다.

### Optional Chaining (?.)

객체 속성에 안전하게 접근합니다:

\`\`\`tsx
// 기존 방식 (장황함)
const name = user && user.profile && user.profile.name;

// Optional Chaining (간결함)
const name = user?.profile?.name;

// 배열, 함수 호출에도 사용 가능
const first = items?.[0];
const result = callback?.();
\`\`\`

### Nullish Coalescing (??)

null 또는 undefined일 때만 기본값을 사용합니다:

\`\`\`tsx
// || 연산자: falsy 값(0, '', false)도 기본값으로 대체
const count = value || 10;  // value가 0이면 10이 됨

// ?? 연산자: null/undefined일 때만 기본값 사용
const count = value ?? 10;  // value가 0이면 0 유지
\`\`\`

### 실전 활용 예시

\`\`\`tsx
// Props 기본값
function Card({ title, subtitle }: CardProps) {
  return (
    <div>
      <h1>{title}</h1>
      {/* subtitle이 있을 때만 렌더링 */}
      <p>{subtitle ?? 'No description'}</p>
    </div>
  );
}

// API 응답 안전 처리
const userName = response?.data?.user?.name ?? 'Unknown';
const items = response?.data?.items ?? [];

// 선택적 콜백 호출
const handleClick = () => {
  onClick?.();  // onClick이 있을 때만 호출
  onSelect?.(id);
};
\`\`\`

### || vs ?? 비교

| 연산자 | 대체 조건 | 예시 |
|--------|----------|------|
| \|\| | falsy (false, 0, '', null, undefined, NaN) | \`'' \|\| 'default'\` → 'default' |
| ?? | nullish (null, undefined) | \`'' ?? 'default'\` → '' |
      `,
      codeExamples: [
        {
          id: 'optional-callback-pattern',
          title: 'ConversationCard의 선택적 콜백 패턴',
          description: '옵셔널 체이닝으로 선택적 Props 안전하게 호출',
          code: `function ConversationCard({
  conversation,
  onClick,
  onSelect,   // 선택적
  onDelete    // 선택적
}: ConversationCardProps) {

  // 선택적 콜백을 옵셔널 체이닝으로 안전하게 호출
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(conversation.id);  // onSelect가 없으면 무시
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(conversation.id);  // onDelete가 없으면 무시
  };

  return (
    <CardWrapper onClick={onClick}>
      {/* ... */}
    </CardWrapper>
  );
}

// 사용처에서 필요한 Props만 전달
<ConversationCard
  conversation={conv}
  onClick={() => navigate(conv.id)}
  onDelete={handleDelete}
  // onSelect는 전달 안 함 → undefined → ?. 덕분에 안전
/>`,
          language: 'tsx'
        },
        {
          id: 'default-values-pattern',
          title: 'EmptyState의 기본값 처리',
          description: '|| 연산자로 기본 UI 제공',
          code: `// EmptyState - 기본값 처리 패턴
function EmptyState({
  icon,
  title,
  description
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: 3,
        bgcolor: 'grey.50',
        border: '1px dashed',
        borderColor: 'grey.300'
      }}
    >
      {/* || 연산자: icon이 없으면 기본 아이콘 사용 */}
      <Box sx={{ color: 'grey.400', mb: 2 }}>
        {icon || <SentimentDissatisfied sx={{ fontSize: 64 }} />}
      </Box>

      {/* || 연산자: title이 없으면 기본 텍스트 */}
      <Typography variant="h6" color="text.secondary">
        {title || 'No items found'}
      </Typography>

      {/* || 연산자: description이 없으면 기본 안내 */}
      <Typography variant="body2" color="text.secondary">
        {description || 'Try adjusting your search or filters'}
      </Typography>
    </Paper>
  );
}

// 사용 예시
<CardGrid
  items={[]}
  emptyIcon={<Chat sx={{ fontSize: 64 }} />}
  emptyTitle="No conversations"
  // emptyDescription 생략 → 기본값 사용
/>`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ 0, false, \'\'를 유효한 값으로 취급해야 하면 ?? 연산자를 사용하세요.',
        '✅ 선택적 콜백 Props는 항상 ?.()로 호출하세요.'
      ]
    },
    {
      id: 'render-helpers',
      title: 'Render Helper Functions',
      titleKo: '렌더 헬퍼 함수',
      content: `
## 렌더 헬퍼 함수로 가독성 높이기

JSX 내부에 복잡한 조건 로직이 있으면 가독성이 떨어집니다.
별도의 렌더 헬퍼 함수로 분리하면 깔끔해집니다.

### 문제: 복잡한 인라인 조건

\`\`\`tsx
// ❌ 가독성이 떨어지는 코드
return (
  <div>
    {status === 'loading' ? (
      <Spinner />
    ) : status === 'error' ? (
      <Alert severity="error">{error}</Alert>
    ) : items.length === 0 ? (
      <EmptyState />
    ) : (
      <List items={items} />
    )}
  </div>
);
\`\`\`

### 해결: 렌더 헬퍼 함수

\`\`\`tsx
// ✅ 헬퍼 함수로 분리
function MyComponent() {
  const renderContent = () => {
    if (loading) return <Spinner />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (items.length === 0) return <EmptyState />;
    return <List items={items} />;
  };

  return (
    <div>
      <Header />
      {renderContent()}
      <Footer />
    </div>
  );
}
\`\`\`

### 객체 매핑 패턴

상태별 컴포넌트를 객체로 매핑할 수도 있습니다:

\`\`\`tsx
const statusComponents = {
  loading: <Spinner />,
  error: <ErrorMessage />,
  empty: <EmptyState />,
  success: <DataList />
};

return (
  <div>
    {statusComponents[status]}
  </div>
);
\`\`\`

### 컴포넌트 분리

복잡한 조건부 렌더링은 별도 컴포넌트로 추출합니다:

\`\`\`tsx
// 상태별 렌더링을 전담하는 컴포넌트
function DataRenderer({ loading, error, data, render }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data || data.length === 0) return <EmptyState />;
  return render(data);
}

// 사용
<DataRenderer
  loading={loading}
  error={error}
  data={items}
  render={(items) => <ItemList items={items} />}
/>
\`\`\`
      `,
      codeExamples: [
        {
          id: 'cardgrid-render-pattern',
          title: 'CardGrid의 렌더 패턴',
          description: 'Early Return으로 상태별 렌더링 분리',
          code: `// CardGrid - Early Return 패턴으로 깔끔한 구조
export default function CardGrid<T>({
  items,
  renderCard,
  loading = false,
  skeletonCount = 6,
  renderSkeleton,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  pagination,
  pageSize
}: CardGridProps<T>) {

  // 렌더 헬퍼: 스켈레톤 그리드
  const renderSkeletons = () => (
    <Grid container spacing={2.5}>
      {Array.from({ length: skeletonCount }).map((_, idx) => (
        <Grid item key={idx} xs={12} sm={6} md={4}>
          {renderSkeleton ? renderSkeleton() : <DefaultSkeleton />}
        </Grid>
      ))}
    </Grid>
  );

  // 렌더 헬퍼: 아이템 그리드
  const renderItems = () => (
    <Grid container spacing={2.5}>
      {items.map((item, index) => (
        <Grid item key={index} xs={12} sm={6} md={4}>
          {renderCard(item, index)}
        </Grid>
      ))}
    </Grid>
  );

  // 렌더 헬퍼: 페이지네이션
  const renderPagination = () => {
    if (!pagination && !pageSize) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        {/* pagination UI */}
      </Box>
    );
  };

  // Early Return 패턴
  if (loading) return renderSkeletons();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  // 메인 렌더링
  return (
    <Box>
      {renderItems()}
      {renderPagination()}
    </Box>
  );
}`,
          language: 'tsx'
        }
      ],
      tips: [
        '✅ JSX 내 조건이 3줄 이상이면 렌더 헬퍼 함수로 분리하세요.',
        '✅ 동일한 조건부 렌더링 패턴이 반복되면 재사용 가능한 컴포넌트로 추출하세요.'
      ]
    },
    {
      id: 'summary',
      title: 'Chapter Summary',
      titleKo: '요약',
      content: `
## Chapter 7 핵심 정리

### 조건부 렌더링 패턴

| 패턴 | 사용 시점 | 예시 |
|------|----------|------|
| 삼항 연산자 | A 또는 B | \`{isA ? <A/> : <B/>}\` |
| && 연산자 | 조건 충족 시만 | \`{show && <Comp/>}\` |
| \|\| 연산자 | 기본값 제공 | \`{value \|\| 'default'}\` |
| Early Return | 여러 조건 체크 | \`if (!data) return null;\` |

### 상태별 UI 처리

\`\`\`tsx
if (loading) return <Skeleton />;
if (error) return <ErrorAlert />;
if (items.length === 0) return <EmptyState />;
return <DataList items={items} />;
\`\`\`

### 조건부 스타일 (MUI sx)

\`\`\`tsx
sx={{
  // 삼항 연산자
  bgcolor: selected ? 'primary.50' : 'white',

  // 조건부 객체 스프레드
  ...(hoverable && {
    '&:hover': { transform: 'translateY(-2px)' }
  })
}}
\`\`\`

### 안전한 값 접근

\`\`\`tsx
// Optional Chaining
user?.profile?.name
callback?.()

// Nullish Coalescing
value ?? 'default'  // null/undefined만 대체
value || 'default'  // 모든 falsy 값 대체
\`\`\`

### 가독성 향상

- 복잡한 조건은 **렌더 헬퍼 함수** 로 분리
- 반복되는 패턴은 **재사용 컴포넌트** 로 추출
- **Early Return** 으로 메인 로직 깔끔하게 유지

### 다음 단계
- **Chapter 8** : 리스트 렌더링과 Key
- **Chapter 9** : useEffect로 사이드 이펙트 관리
      `
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - Conditional Rendering',
      url: 'https://react.dev/learn/conditional-rendering',
      type: 'documentation'
    },
    {
      title: 'MDN - Nullish Coalescing',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing',
      type: 'documentation'
    },
    {
      title: 'MDN - Optional Chaining',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
