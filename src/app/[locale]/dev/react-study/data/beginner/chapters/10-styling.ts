/**
 * Chapter 10: 스타일링
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'styling',
  order: 10,
  title: 'Styling Components',
  titleKo: '스타일링',
  description: 'Learn how to style React components using MUI sx prop and theme.',
  descriptionKo: 'MUI sx prop과 테마를 사용하여 React 컴포넌트를 스타일링하는 방법을 학습합니다.',
  estimatedMinutes: 50,
  objectives: [
    'Master MUI sx prop syntax',
    'Apply conditional and dynamic styles',
    'Use theme values and breakpoints',
    'Build reusable style patterns'
  ],
  objectivesKo: [
    'MUI sx prop 문법을 마스터한다',
    '조건부 및 동적 스타일을 적용한다',
    '테마 값과 브레이크포인트를 사용한다',
    '재사용 가능한 스타일 패턴을 만든다'
  ],
  sections: [
    {
      id: 'sx-prop-basics',
      title: 'MUI sx Prop Basics',
      titleKo: 'sx prop 기초',
      content: `
## sx prop이란?

MUI의 \`sx\` prop은 인라인 스타일을 강력하게 작성할 수 있는 시스템 속성입니다.
CSS-in-JS 방식으로 컴포넌트에 직접 스타일을 적용합니다.

### sx prop의 장점

- **테마 통합**: 테마 값을 직접 참조
- **반응형 지원**: 브레이크포인트 기반 스타일
- **단축 속성**: p, m, bgcolor 등 축약형
- **중첩 선택자**: &:hover 등 가상 선택자

### 기본 문법

\`\`\`tsx
<Box
  sx={{
    width: 100,           // 100px
    height: '50%',        // 50%
    p: 2,                 // padding: 16px (theme.spacing(2))
    m: 1,                 // margin: 8px
    bgcolor: 'grey.100',  // 테마 팔레트 참조
    color: 'primary.main' // 테마 primary 색상
  }}
/>
\`\`\`
`,
      codeExamples: [
        {
          id: 'sx-prop-common',
          title: '자주 사용하는 sx 속성',
          language: 'tsx',
          code: `// 자주 사용하는 sx prop 속성들

<Box
  sx={{
    // 📦 Box Model
    width: 200,              // width: 200px
    height: '100%',          // height: 100%
    minWidth: 0,             // 텍스트 오버플로우 방지
    maxWidth: 600,           // max-width: 600px

    // 📏 Spacing (theme.spacing 기반, 1 = 8px)
    p: 2,                    // padding: 16px (all)
    px: 2,                   // padding-left/right: 16px
    py: 1,                   // padding-top/bottom: 8px
    pt: 1, pb: 2, pl: 1, pr: 1, // 개별 패딩
    m: 2,                    // margin: 16px
    mx: 'auto',              // margin-left/right: auto (가운데 정렬)
    mt: 2, mb: 1,            // 개별 마진
    gap: 2,                  // flex/grid gap: 16px

    // 🎨 Colors (테마 팔레트 참조)
    color: 'text.primary',       // 텍스트 색상
    bgcolor: 'background.paper', // 배경색
    borderColor: 'grey.300',     // 테두리 색상

    // 📐 Display & Flex
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    flexShrink: 0,
    flexWrap: 'wrap',

    // 🔲 Border & Shadow
    border: '1px solid',
    borderRadius: 2,         // 8px (theme.shape.borderRadius * 2)
    boxShadow: 1,            // theme.shadows[1]

    // 📝 Typography
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.5,
    textAlign: 'center',

    // 🔄 Transition
    transition: 'all 0.2s ease',

    // 📍 Position
    position: 'relative',
    top: 0,
    left: 0,
    zIndex: 10,

    // 📜 Overflow
    overflow: 'hidden',
    overflowY: 'auto',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }}
>
  Content
</Box>`,
          description: 'sx prop에서 자주 사용하는 속성들의 모음입니다.'
        }
      ],
      tips: [
        '💡 숫자값은 spacing 기반 (1 = 8px), 문자열은 그대로 사용',
        '✅ 테마 색상: "primary.main", "grey.500", "error.light" 등',
        'ℹ️ borderRadius 숫자는 theme.shape.borderRadius의 배수'
      ]
    },
    {
      id: 'color-patterns',
      title: 'Color and Style Patterns',
      titleKo: '색상과 스타일 패턴',
      content: `
## 색상 매핑 패턴

Badge 컴포넌트에서 카테고리나 상태에 따라 다른 색상을 적용하는 패턴입니다.

### Record 타입으로 색상 매핑

\`\`\`tsx
// 키-값 매핑 객체 정의
const colors: Record<string, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444'
};

// 사용
const color = colors[difficulty] || colors.medium;
\`\`\`

### 투명도가 있는 배경색

\`\`\`tsx
// 색상 + 투명도 (16진수)
bgcolor: \`\${color}15\`  // 15 = 약 8% 투명도
bgcolor: \`\${color}20\`  // 20 = 약 12% 투명도
bgcolor: \`\${color}30\`  // 30 = 약 19% 투명도
\`\`\`
`,
      codeExamples: [
        {
          id: 'category-configs',
          title: 'categoryConfigs 정의',
          language: 'tsx',
          code: `// src/components/common/Badge/index.tsx

// 카테고리별 설정 인터페이스
export interface CategoryConfig {
  icon: ReactNode;
  color: string;
  label: string;
}

// 카테고리 설정 매핑 객체
export const categoryConfigs: Record<string, CategoryConfig> = {
  'bug-fix': {
    icon: <BugReport sx={{ fontSize: 16 }} />,
    color: '#ef4444',  // 빨강
    label: 'Bug Fix'
  },
  feature: {
    icon: <Build sx={{ fontSize: 16 }} />,
    color: '#22c55e',  // 초록
    label: 'Feature'
  },
  refactor: {
    icon: <Code sx={{ fontSize: 16 }} />,
    color: '#a855f7',  // 보라
    label: 'Refactor'
  },
  debugging: {
    icon: <Psychology sx={{ fontSize: 16 }} />,
    color: '#f97316',  // 주황
    label: 'Debugging'
  },
  performance: {
    icon: <Speed sx={{ fontSize: 16 }} />,
    color: '#06b6d4',  // 청록
    label: 'Performance'
  },
  general: {
    icon: <Chat sx={{ fontSize: 16 }} />,
    color: '#6b7280',  // 회색 (기본값)
    label: 'General'
  }
};

// 난이도별 색상 매핑
export const difficultyColors: Record<string, string> = {
  easy: '#22c55e',    // 초록
  medium: '#eab308',  // 노랑
  hard: '#ef4444'     // 빨강
};`,
          description: '카테고리와 난이도에 따른 색상 매핑 정의입니다.'
        },
        {
          id: 'category-badge-impl',
          title: 'CategoryBadge 구현',
          language: 'tsx',
          code: `// src/components/common/Badge/index.tsx

interface CategoryBadgeProps {
  category: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined' | 'soft';
}

export function CategoryBadge({
  category,
  size = 'small',
  variant = 'soft'
}: CategoryBadgeProps) {
  // 설정 조회 (없으면 general 사용)
  const config = categoryConfigs[category] || categoryConfigs.general;

  // soft variant: 투명 배경 + 색상 텍스트
  if (variant === 'soft') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          // size에 따른 패딩
          px: size === 'small' ? 1.25 : 1.5,
          py: size === 'small' ? 0.375 : 0.5,
          borderRadius: 2,
          // 👇 투명도 있는 배경: color + '12' (약 7% 투명)
          bgcolor: \`\${config.color}12\`,
          // 👇 텍스트/아이콘 색상
          color: config.color
        }}
      >
        <Box sx={{ display: 'flex', fontSize: size === 'small' ? 14 : 16 }}>
          {config.icon}
        </Box>
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ fontSize: size === 'small' ? '0.7rem' : '0.75rem' }}
        >
          {config.label}
        </Typography>
      </Box>
    );
  }

  // filled/outlined variant: MUI Chip 사용
  return (
    <Chip
      icon={config.icon as React.ReactElement}
      label={config.label}
      size={size}
      variant={variant === 'outlined' ? 'outlined' : 'filled'}
      sx={{
        bgcolor: variant === 'filled' ? config.color : 'transparent',
        color: variant === 'filled' ? 'white' : config.color,
        borderColor: config.color,
        // 👇 내부 아이콘 색상도 변경
        '& .MuiChip-icon': {
          color: variant === 'filled' ? 'white' : config.color
        }
      }}
    />
  );
}`,
          description: 'variant에 따라 다른 스타일을 적용하는 CategoryBadge입니다.'
        },
        {
          id: 'difficulty-badge-impl',
          title: 'DifficultyBadge 구현',
          language: 'tsx',
          code: `// src/components/common/Badge/index.tsx

interface DifficultyBadgeProps {
  difficulty: string;
  size?: 'small' | 'medium';
}

export function DifficultyBadge({
  difficulty,
  size = 'small'
}: DifficultyBadgeProps) {
  // 색상 조회 (없으면 medium 사용)
  const color = difficultyColors[difficulty] || difficultyColors.medium;

  return (
    <Chip
      label={difficulty}
      size={size}
      sx={{
        // 👇 size에 따른 높이
        height: size === 'small' ? 22 : 28,
        // 👇 size에 따른 폰트 크기
        fontSize: size === 'small' ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        // 👇 투명도 있는 배경 (15 = 약 8%)
        bgcolor: \`\${color}15\`,
        // 👇 텍스트 색상
        color: color,
        // 👇 첫 글자 대문자
        textTransform: 'capitalize',
        // 👇 테두리 제거
        border: 'none'
      }}
    />
  );
}

// 사용 예시
<DifficultyBadge difficulty="easy" />   // 초록 배경
<DifficultyBadge difficulty="medium" /> // 노랑 배경
<DifficultyBadge difficulty="hard" />   // 빨강 배경`,
          description: 'DifficultyBadge는 난이도에 따라 색상이 변합니다.'
        }
      ],
      tips: [
        '💡 Record<string, T>로 타입 안전한 매핑 객체 정의',
        '✅ fallback 값 제공: colors[key] || colors.default',
        'ℹ️ 투명도 16진수: 00(0%), 80(50%), FF(100%)'
      ]
    },
    {
      id: 'conditional-styling',
      title: 'Conditional Styling',
      titleKo: '조건부 스타일링',
      content: `
## 조건에 따른 스타일 적용

React에서 조건부 스타일을 적용하는 여러 방법이 있습니다.

### 방법 1: 삼항 연산자

\`\`\`tsx
sx={{
  color: isActive ? 'primary.main' : 'grey.500',
  bgcolor: selected ? 'primary.50' : 'white'
}}
\`\`\`

### 방법 2: 스프레드 연산자

\`\`\`tsx
sx={{
  ...baseStyles,
  ...(condition && { additionalStyles })
}}
\`\`\`

### 방법 3: 함수로 계산

\`\`\`tsx
const getStyles = () => ({
  color: isActive ? 'blue' : 'gray'
});

sx={getStyles()}
\`\`\`
`,
      codeExamples: [
        {
          id: 'conditional-card-wrapper',
          title: 'CardWrapper 조건부 스타일',
          language: 'tsx',
          code: `// src/components/common/CardGrid/index.tsx

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
        // 👇 삼항 연산자: selected 여부에 따른 스타일
        borderColor: selected ? 'primary.main' : 'grey.200',
        bgcolor: selected ? 'primary.50' : 'white',
        // 👇 삼항 연산자: onClick 유무에 따른 커서
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        // 👇 스프레드 연산자: 조건부 hover 효과
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
          description: 'selected와 hoverEffect에 따라 스타일이 변경됩니다.'
        },
        {
          id: 'chapter-card-conditional',
          title: 'ChapterCard 조건부 스타일',
          language: 'tsx',
          code: `// ChapterCard에서 ready 상태에 따른 스타일
function ChapterCard({
  chapter,
  index,
  courseColor,
  onClick
}: {
  chapter: ChapterMeta;
  index: number;
  courseColor: string;
  onClick: () => void;
}) {
  // 준비 상태 확인
  const isReady = chapter.status === 'published' || chapter.status === 'ready';

  return (
    <Paper
      elevation={0}
      // 👇 조건부 onClick: ready일 때만 클릭 가능
      onClick={isReady ? onClick : undefined}
      sx={{
        height: '100%',
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: 'white',
        // 👇 조건부 투명도: not ready면 흐리게
        opacity: isReady ? 1 : 0.6,
        // 👇 조건부 커서
        cursor: isReady ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        // 👇 조건부 hover: ready일 때만 효과
        '&:hover': isReady ? {
          borderColor: courseColor,
          transform: 'translateY(-2px)',
          boxShadow: \`0 8px 24px \${courseColor}20\`
        } : {}
      }}
    >
      {/* Avatar 색상도 조건부 */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          // 👇 ready 상태에 따른 배경색
          bgcolor: isReady ? courseColor : 'grey.300',
          fontSize: '0.95rem',
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
    </Paper>
  );
}`,
          description: 'isReady 상태에 따라 전체 카드 스타일이 변경됩니다.'
        },
        {
          id: 'quick-filter-conditional',
          title: 'Quick Filter 조건부 스타일',
          language: 'tsx',
          code: `// ConversationsPage의 카테고리 Quick Filter
const [category, setCategory] = useState('');

{Object.entries(stats.byCategory).map(([cat, count]) => (
  <Chip
    key={cat}
    icon={categoryConfigs[cat]?.icon as React.ReactElement}
    label={\`\${categoryConfigs[cat]?.label || cat} (\${count})\`}
    onClick={() => setCategory(category === cat ? '' : cat)}
    size="small"
    sx={{
      // 👇 선택 여부에 따른 배경색
      bgcolor: category === cat
        ? categoryConfigs[cat]?.color  // 선택됨: 진한 색
        : 'white',                      // 미선택: 흰색
      // 👇 선택 여부에 따른 텍스트 색상
      color: category === cat
        ? 'white'                       // 선택됨: 흰색
        : categoryConfigs[cat]?.color,  // 미선택: 카테고리 색상
      // 👇 테두리는 항상 카테고리 색상
      borderColor: categoryConfigs[cat]?.color,
      border: '1px solid',
      fontWeight: 500,
      // 👇 아이콘 색상도 조건부
      '& .MuiChip-icon': {
        color: category === cat
          ? 'white'
          : categoryConfigs[cat]?.color
      },
      // 👇 hover 효과도 조건부
      '&:hover': {
        bgcolor: category === cat
          ? categoryConfigs[cat]?.color     // 선택됨: 유지
          : \`\${categoryConfigs[cat]?.color}10\`  // 미선택: 살짝 색상
      }
    }}
  />
))}`,
          description: '선택된 카테고리에 따라 Chip 스타일이 토글됩니다.'
        }
      ],
      tips: [
        '💡 삼항 연산자는 true/false 두 경우에 사용',
        '✅ 스프레드는 조건이 true일 때만 스타일 추가',
        '⚠️ undefined/false는 스프레드해도 무시됨: ...false → 무시'
      ]
    },
    {
      id: 'pseudo-selectors',
      title: 'Pseudo Selectors and Nested Styles',
      titleKo: '가상 선택자와 중첩 스타일',
      content: `
## &로 시작하는 선택자

MUI sx prop에서는 CSS 가상 선택자와 중첩 선택자를 \`&\`로 작성합니다.

### 자주 사용하는 가상 선택자

\`\`\`tsx
sx={{
  '&:hover': { ... },      // 마우스 오버
  '&:focus': { ... },      // 포커스
  '&:active': { ... },     // 클릭 중
  '&:disabled': { ... },   // 비활성화
  '&::before': { ... },    // 가상 요소 before
  '&::after': { ... },     // 가상 요소 after
  '&:first-of-type': { ... },  // 첫 번째 요소
  '&:last-child': { ... }      // 마지막 요소
}}
\`\`\`

### MUI 내부 컴포넌트 선택

\`\`\`tsx
sx={{
  '& .MuiChip-icon': { ... },        // Chip 아이콘
  '& .MuiButton-startIcon': { ... }, // Button 시작 아이콘
  '& .MuiInputBase-input': { ... },  // Input 내부
  '& .MuiSelect-select': { ... }     // Select 내부
}}
\`\`\`
`,
      codeExamples: [
        {
          id: 'hover-effects',
          title: 'hover 효과 패턴',
          language: 'tsx',
          code: `// 다양한 hover 효과 예시

// 1. 버튼 hover
<Button
  sx={{
    bgcolor: 'primary.main',
    color: 'white',
    '&:hover': {
      bgcolor: 'primary.dark',  // 더 진한 색
      transform: 'scale(1.02)'  // 살짝 확대
    }
  }}
/>

// 2. 카드 hover
<Paper
  sx={{
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',  // 살짝 올라감
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
    }
  }}
/>

// 3. 리스트 아이템 hover
<ListItem
  sx={{
    '&:hover': {
      bgcolor: 'action.hover',  // MUI 표준 hover 색상
      cursor: 'pointer'
    }
  }}
/>

// 4. 아이콘 버튼 hover
<IconButton
  sx={{
    color: 'grey.400',
    '&:hover': {
      color: 'error.main',      // 삭제 버튼 스타일
      bgcolor: 'error.lighter'  // 연한 빨강 배경
    }
  }}
>
  <Delete />
</IconButton>

// 5. 링크 hover
<Typography
  component="a"
  sx={{
    color: 'primary.main',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }}
/>`,
          description: '다양한 hover 효과 패턴들입니다.'
        },
        {
          id: 'internal-component-styling',
          title: 'MUI 내부 컴포넌트 스타일링',
          language: 'tsx',
          code: `// MUI 컴포넌트 내부 스타일 커스터마이징

// 1. Chip 아이콘 색상 변경
<Chip
  icon={<BugReport />}
  label="Bug Fix"
  sx={{
    bgcolor: '#ef4444',
    color: 'white',
    // 👇 Chip 내부 아이콘 선택
    '& .MuiChip-icon': {
      color: 'white'  // 아이콘도 흰색으로
    }
  }}
/>

// 2. Select 내부 스타일
<Select
  sx={{
    minWidth: 70,
    // 👇 Select 내부 값 영역
    '& .MuiSelect-select': {
      py: 0.5,
      fontSize: '0.875rem'
    }
  }}
/>

// 3. TextField 라벨과 input
<TextField
  sx={{
    // 라벨 색상
    '& .MuiInputLabel-root': {
      color: 'grey.600',
      '&.Mui-focused': {
        color: 'primary.main'
      }
    },
    // input 밑줄
    '& .MuiInput-underline:before': {
      borderColor: 'grey.300'
    },
    '& .MuiInput-underline:after': {
      borderColor: 'primary.main'
    }
  }}
/>

// 4. Alert 메시지 영역
<Alert
  severity="info"
  sx={{
    bgcolor: '#fffbeb',
    border: '1px solid #fde68a',
    // 👇 Alert 메시지 텍스트
    '& .MuiAlert-message': {
      color: '#92400e'
    }
  }}
/>

// 5. Pagination 아이템
<Pagination
  sx={{
    '& .MuiPaginationItem-root': {
      borderRadius: 2,
      '&.Mui-selected': {
        bgcolor: 'primary.main',
        color: 'white'
      }
    }
  }}
/>`,
          description: 'MUI 컴포넌트 내부 요소를 커스터마이징합니다.'
        },
        {
          id: 'disabled-state',
          title: 'disabled 상태 스타일',
          language: 'tsx',
          code: `// disabled 상태 스타일링

// 1. 버튼 disabled
<Button
  disabled={isLoading}
  sx={{
    bgcolor: 'primary.main',
    color: 'white',
    '&:hover': {
      bgcolor: 'primary.dark'
    },
    // 👇 disabled 상태
    '&.Mui-disabled': {
      bgcolor: 'action.disabledBackground',
      color: 'action.disabled'
    }
  }}
/>

// 2. IconButton disabled
<IconButton
  disabled={activeFilterCount === 0}
  sx={{
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      borderColor: 'warning.main',
      bgcolor: 'warning.50'
    },
    // 👇 disabled 시 hover 효과 제거
    '&.Mui-disabled': {
      opacity: 0.5,
      '&:hover': {
        borderColor: 'divider',
        bgcolor: 'transparent'
      }
    }
  }}
/>

// 3. span 래핑으로 Tooltip 유지
// (disabled 요소에 Tooltip 적용 시)
<Tooltip title="Clear filters">
  <span>  {/* 👈 span으로 감싸야 disabled에서도 Tooltip 작동 */}
    <IconButton
      disabled={disabled}
      onClick={onClear}
    >
      <RestartAlt />
    </IconButton>
  </span>
</Tooltip>`,
          description: 'disabled 상태의 스타일을 커스터마이징합니다.'
        }
      ],
      tips: [
        '💡 MUI 클래스명은 DevTools에서 확인: .MuiButton-root 등',
        '✅ .Mui-selected, .Mui-disabled 등 상태 클래스 활용',
        '⚠️ 가상 선택자는 반드시 &로 시작해야 합니다'
      ]
    },
    {
      id: 'responsive-styles',
      title: 'Responsive Styles',
      titleKo: '반응형 스타일',
      content: `
## 브레이크포인트 기반 스타일

MUI sx prop에서 객체 형태로 브레이크포인트별 스타일을 정의합니다.

### MUI 기본 브레이크포인트

\`\`\`tsx
// xs: 0px 이상
// sm: 600px 이상
// md: 900px 이상
// lg: 1200px 이상
// xl: 1536px 이상
\`\`\`

### 반응형 문법

\`\`\`tsx
sx={{
  // 객체 형태: 브레이크포인트별 값
  width: { xs: '100%', md: '50%' },

  // 배열 형태: [xs, sm, md, lg, xl]
  p: [1, 2, 3],  // xs: 8px, sm: 16px, md: 24px

  // display 조건부
  display: { xs: 'none', md: 'block' }
}}
\`\`\`
`,
      codeExamples: [
        {
          id: 'responsive-layout',
          title: '반응형 레이아웃',
          language: 'tsx',
          code: `// 반응형 레이아웃 예시

// 1. 컬럼 레이아웃 → 로우 레이아웃
<Box
  sx={{
    display: 'flex',
    // 👇 xs: 세로, md: 가로
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, md: 4 },
    // 👇 xs: 전체, md: 절반
    '& > div': {
      width: { xs: '100%', md: '50%' }
    }
  }}
>
  <Box>Left Content</Box>
  <Box>Right Content</Box>
</Box>

// 2. 사이드바 숨김
<Box
  sx={{
    width: 250,
    // 👇 sm 이하에서 숨김
    display: { xs: 'none', sm: 'block' }
  }}
>
  <Sidebar />
</Box>

// 3. 카드 그리드 컬럼 수
<Grid container spacing={2}>
  <Grid
    item
    xs={12}    // 모바일: 1열
    sm={6}     // 태블릿: 2열
    md={4}     // 데스크탑: 3열
  >
    <Card />
  </Grid>
</Grid>

// 4. 패딩/마진 반응형
<Box
  sx={{
    // 👇 화면 크기에 따라 패딩 증가
    p: { xs: 2, sm: 3, md: 4 },
    mx: { xs: 1, md: 'auto' },
    maxWidth: { md: 900, lg: 1200 }
  }}
>
  Content
</Box>`,
          description: '브레이크포인트별 레이아웃 변경 예시입니다.'
        },
        {
          id: 'responsive-text',
          title: '반응형 텍스트',
          language: 'tsx',
          code: `// 반응형 텍스트 스타일

// 1. 폰트 크기 반응형
<Typography
  sx={{
    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
    fontWeight: { xs: 500, md: 600 }
  }}
>
  Responsive Title
</Typography>

// 2. 텍스트 숨김/표시
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
  <Typography variant="h6" fontWeight={600}>
    {displayTitle}
  </Typography>
  {displayDescription && (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        ml: 1,
        // 👇 모바일에서 설명 숨김
        display: { xs: 'none', sm: 'inline' }
      }}
    >
      {displayDescription}
    </Typography>
  )}
</Box>

// 3. 텍스트 줄 수 반응형
<Typography
  sx={{
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    // 👇 모바일: 3줄, 데스크탑: 2줄
    WebkitLineClamp: { xs: 3, md: 2 },
    WebkitBoxOrient: 'vertical'
  }}
>
  Long text content...
</Typography>

// 4. 버튼 텍스트 반응형
<Button
  variant="contained"
  startIcon={<Add />}
  sx={{
    // 👇 모바일에서 텍스트 숨기고 아이콘만
    '& .MuiButton-startIcon': {
      mr: { xs: 0, sm: 1 }
    }
  }}
>
  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
    Add New
  </Box>
</Button>`,
          description: '텍스트 크기와 표시 여부를 반응형으로 처리합니다.'
        }
      ],
      tips: [
        '💡 { xs: value }는 xs 이상 모든 크기에 적용',
        '✅ 모바일 퍼스트: xs부터 정의하고 필요 시 상위 브레이크포인트 추가',
        'ℹ️ useMediaQuery 훅으로 JS에서 브레이크포인트 감지 가능'
      ]
    },
    {
      id: 'theme-values',
      title: 'Using Theme Values',
      titleKo: '테마 값 활용',
      content: `
## 테마 참조 방법

MUI 테마의 값들을 sx prop에서 직접 참조할 수 있습니다.

### 색상 팔레트

\`\`\`tsx
// theme.palette 참조
color: 'primary.main'       // 기본 primary
color: 'primary.light'      // 밝은 primary
color: 'primary.dark'       // 어두운 primary
color: 'secondary.main'     // secondary
color: 'error.main'         // 에러 빨강
color: 'warning.main'       // 경고 노랑
color: 'success.main'       // 성공 초록
color: 'info.main'          // 정보 파랑
color: 'text.primary'       // 기본 텍스트
color: 'text.secondary'     // 보조 텍스트
color: 'grey.500'           // 회색 계열
bgcolor: 'background.paper' // 카드 배경
bgcolor: 'background.default' // 페이지 배경
borderColor: 'divider'      // 구분선 색상
bgcolor: 'action.hover'     // hover 배경
\`\`\`

### 함수로 테마 접근

\`\`\`tsx
sx={{
  // 함수로 theme 객체 접근
  zIndex: (theme) => theme.zIndex.drawer + 1,
  bgcolor: (theme) =>
    theme.palette.mode === 'light'
      ? theme.palette.grey[200]
      : theme.palette.grey[800]
}}
\`\`\`
`,
      codeExamples: [
        {
          id: 'theme-palette-usage',
          title: '테마 팔레트 활용',
          language: 'tsx',
          code: `// 테마 팔레트 값 활용 예시

// 1. 텍스트 색상
<Typography color="text.primary">주요 텍스트</Typography>
<Typography color="text.secondary">보조 텍스트</Typography>
<Typography sx={{ color: 'grey.600' }}>회색 텍스트</Typography>

// 2. 배경색
<Box sx={{ bgcolor: 'background.paper' }}>카드 배경</Box>
<Box sx={{ bgcolor: 'background.default' }}>페이지 배경</Box>
<Box sx={{ bgcolor: 'grey.50' }}>연한 회색 배경</Box>

// 3. 테두리와 구분선
<Box sx={{
  border: '1px solid',
  borderColor: 'grey.200',   // 연한 테두리
  borderBottom: '1px solid',
  borderBottomColor: 'divider'  // 구분선
}} />

// 4. 상태별 색상
<Chip
  label="Active"
  sx={{
    bgcolor: 'success.lighter',  // 연한 초록
    color: 'success.main'        // 진한 초록
  }}
/>

<Alert
  severity="error"
  sx={{
    bgcolor: 'error.lighter',
    color: 'error.dark',
    '& .MuiAlert-icon': {
      color: 'error.main'
    }
  }}
/>

// 5. primary 색상 변형
<Button
  sx={{
    bgcolor: 'primary.main',
    color: 'white',
    '&:hover': {
      bgcolor: 'primary.dark'
    },
    '&:active': {
      bgcolor: 'primary.darker'
    }
  }}
/>`,
          description: '테마 팔레트의 다양한 색상 값을 활용합니다.'
        },
        {
          id: 'theme-function-access',
          title: '함수로 테마 접근',
          language: 'tsx',
          code: `// 함수로 테마 객체 접근하기

// 1. zIndex 계산
<AppBar
  position="static"
  sx={{
    // 👇 함수로 theme 접근
    zIndex: (theme) => theme.zIndex.drawer + 1
  }}
>
  <Toolbar />
</AppBar>

// 2. 다크/라이트 모드 분기
<Box
  sx={{
    bgcolor: (theme) =>
      theme.palette.mode === 'light'
        ? theme.palette.grey[200]  // 라이트 모드
        : theme.palette.grey[800]  // 다크 모드
  }}
/>

// 3. 트랜지션 설정
<Drawer
  sx={{
    '& .MuiDrawer-paper': {
      width: DRAWER_WIDTH,
      transition: (theme) =>
        theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        })
    }
  }}
/>

// 4. useTheme 훅으로 접근
import { useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        // 👇 훅으로 가져온 theme 사용
        p: theme.spacing(2),
        color: theme.palette.primary.main,
        borderRadius: theme.shape.borderRadius
      }}
    />
  );
}

// 5. alpha 함수로 투명도 적용
import { alpha } from '@mui/material';

<Box
  sx={{
    // 👇 alpha로 색상에 투명도 적용
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
    '&:hover': {
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12)
    }
  }}
/>`,
          description: '함수 형태로 테마 객체에 접근하는 고급 패턴입니다.'
        }
      ],
      tips: [
        '💡 문자열로 참조: "primary.main" - 간단한 경우',
        '✅ 함수로 참조: (theme) => ... - 계산이 필요한 경우',
        'ℹ️ alpha(color, opacity)로 투명도가 있는 색상 생성'
      ]
    },
    {
      id: 'reusable-style-patterns',
      title: 'Reusable Style Patterns',
      titleKo: '재사용 가능한 스타일 패턴',
      content: `
## 스타일 패턴 추출

반복되는 스타일을 변수나 함수로 추출하여 재사용합니다.

### 스타일 객체 추출

\`\`\`tsx
// 공통 스타일 객체
const cardStyles = {
  p: 2.5,
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'grey.200'
};

// 사용
<Paper sx={cardStyles} />
<Paper sx={{ ...cardStyles, bgcolor: 'primary.50' }} />
\`\`\`

### 스타일 팩토리 함수

\`\`\`tsx
// 파라미터로 스타일 생성
const getBadgeStyles = (color: string) => ({
  bgcolor: \`\${color}15\`,
  color: color,
  fontWeight: 600
});

// 사용
<Chip sx={getBadgeStyles('#22c55e')} />
\`\`\`
`,
      codeExamples: [
        {
          id: 'text-overflow-pattern',
          title: '텍스트 오버플로우 패턴',
          language: 'tsx',
          code: `// 텍스트 오버플로우 스타일 패턴

// 1. 한 줄 말줄임 (ellipsis)
const singleLineEllipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

<Typography sx={singleLineEllipsis}>
  Very long text that will be truncated...
</Typography>

// 2. 여러 줄 말줄임 (line-clamp)
const multiLineClamp = (lines: number) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  lineHeight: 1.4,
  minHeight: lines * 1.4 + 'em'  // 최소 높이 확보
});

<Typography sx={multiLineClamp(2)}>
  Long text that spans multiple lines and will be
  truncated after the specified number of lines...
</Typography>

// 3. ConversationCard에서 사용
<Typography
  variant="subtitle1"
  fontWeight={600}
  sx={{
    mb: 1.5,
    ...multiLineClamp(2),
    color: 'grey.800'
  }}
>
  {conversation.title}
</Typography>`,
          description: '텍스트 오버플로우 처리를 위한 재사용 패턴입니다.'
        },
        {
          id: 'card-style-pattern',
          title: '카드 스타일 패턴',
          language: 'tsx',
          code: `// 카드 스타일 패턴 모음

// 기본 카드 스타일
const baseCardStyles = {
  p: 2.5,
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'grey.200',
  bgcolor: 'white',
  transition: 'all 0.2s ease'
};

// 호버 효과 추가
const hoverCardStyles = {
  ...baseCardStyles,
  cursor: 'pointer',
  '&:hover': {
    borderColor: 'primary.light',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  }
};

// 선택 상태 스타일 팩토리
const getSelectableCardStyles = (selected: boolean) => ({
  ...baseCardStyles,
  cursor: 'pointer',
  borderColor: selected ? 'primary.main' : 'grey.200',
  bgcolor: selected ? 'primary.50' : 'white',
  '&:hover': {
    borderColor: selected ? 'primary.main' : 'primary.light',
    transform: 'translateY(-2px)'
  }
});

// 색상 커스텀 카드 팩토리
const getColoredCardStyles = (color: string) => ({
  ...baseCardStyles,
  '&:hover': {
    borderColor: color,
    transform: 'translateY(-2px)',
    boxShadow: \`0 8px 24px \${color}20\`
  }
});

// 사용 예시
<Paper sx={baseCardStyles}>Basic Card</Paper>
<Paper sx={hoverCardStyles}>Hoverable Card</Paper>
<Paper sx={getSelectableCardStyles(isSelected)}>Selectable</Paper>
<Paper sx={getColoredCardStyles('#22c55e')}>Green Hover</Paper>`,
          description: '카드 스타일을 패턴화하여 재사용합니다.'
        },
        {
          id: 'badge-style-factory',
          title: 'Badge 스타일 팩토리',
          language: 'tsx',
          code: `// Badge 스타일 팩토리 함수들

// 1. 투명 배경 + 색상 텍스트 (soft variant)
const getSoftBadgeStyles = (color: string, size: 'small' | 'medium' = 'small') => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: size === 'small' ? 1.25 : 1.5,
  py: size === 'small' ? 0.375 : 0.5,
  borderRadius: 2,
  bgcolor: \`\${color}12\`,
  color: color,
  fontWeight: 600,
  fontSize: size === 'small' ? '0.7rem' : '0.75rem'
});

// 2. Chip 스타일 (filled variant)
const getFilledChipStyles = (color: string) => ({
  bgcolor: color,
  color: 'white',
  '& .MuiChip-icon': {
    color: 'white'
  }
});

// 3. Chip 스타일 (outlined variant)
const getOutlinedChipStyles = (color: string) => ({
  bgcolor: 'transparent',
  color: color,
  borderColor: color,
  '& .MuiChip-icon': {
    color: color
  }
});

// 4. 상태 Badge 스타일 맵
const statusStylesMap: Record<string, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: '#16a34a' },
  pending: { bg: '#fef3c7', color: '#d97706' },
  completed: { bg: '#dbeafe', color: '#2563eb' },
  error: { bg: '#fee2e2', color: '#dc2626' },
  inactive: { bg: '#f3f4f6', color: '#6b7280' }
};

const getStatusBadgeStyles = (status: string) => {
  const { bg, color } = statusStylesMap[status] || statusStylesMap.inactive;
  return {
    bgcolor: bg,
    color: color,
    fontWeight: 500,
    textTransform: 'capitalize'
  };
};

// 사용
<Box sx={getSoftBadgeStyles('#ef4444')}>Bug Fix</Box>
<Chip sx={getFilledChipStyles('#22c55e')} label="Feature" />
<Chip sx={getStatusBadgeStyles('active')} label="Active" />`,
          description: 'Badge와 Chip 스타일을 팩토리 함수로 생성합니다.'
        }
      ],
      tips: [
        '💡 반복되는 스타일은 변수로 추출하여 일관성 유지',
        '✅ 파라미터가 필요하면 팩토리 함수로',
        'ℹ️ 스프레드로 기본 스타일 확장: { ...base, ...custom }'
      ]
    }
  ],
  status: 'ready'
};

export default chapter;
