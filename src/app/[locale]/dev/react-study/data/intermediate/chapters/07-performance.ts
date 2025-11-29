/**
 * Chapter 7: 성능 최적화
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'performance',
  order: 7,
  title: 'Performance Optimization',
  titleKo: '성능 최적화',
  description: 'Optimize React applications with React.memo, useMemo, useCallback, code splitting, and virtualization.',
  descriptionKo: 'React.memo, useMemo, useCallback, 코드 스플리팅, 가상화 등으로 React 애플리케이션을 최적화합니다.',
  estimatedMinutes: 55,
  objectives: [
    'Prevent unnecessary re-renders with React.memo and memoization hooks',
    'Measure and diagnose rendering performance with React DevTools',
    'Implement virtualization for large lists and data grids',
    'Apply code splitting and lazy loading for faster initial loads'
  ],
  objectivesKo: [
    'React.memo와 메모이제이션 훅으로 불필요한 리렌더링을 방지한다',
    'React DevTools로 렌더링 성능을 측정하고 진단한다',
    '대용량 리스트와 데이터 그리드에 가상화를 적용한다',
    '코드 스플리팅과 Lazy Loading으로 초기 로딩을 최적화한다'
  ],
  sections: [
    {
      id: 'react-memo',
      title: 'React.memo and Memoization',
      titleKo: 'React.memo와 메모이제이션',
      content: `
## 리렌더링의 이해

React에서 컴포넌트가 리렌더링되는 경우:
1. **자신의 state**가 변경될 때
2. **props**가 변경될 때
3. **부모 컴포넌트**가 리렌더링될 때 (props가 변경되지 않아도!)

### 문제: 불필요한 리렌더링

\`\`\`tsx
// 부모가 리렌더되면 자식도 모두 리렌더됨
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      {/* count와 무관한데도 매번 리렌더됨 */}
      <ExpensiveChild data={staticData} />
    </>
  );
}
\`\`\`

## React.memo

\`React.memo\`는 컴포넌트의 props가 변경되지 않으면 리렌더링을 건너뛰는 **고차 컴포넌트(HOC)** 입니다.

\`\`\`tsx
// ✅ memo로 감싸기
const ExpensiveChild = memo(function ExpensiveChild({ data }) {
  // props가 변경되지 않으면 리렌더링 안 됨
  return <div>{/* 복잡한 렌더링 */}</div>;
});

// 또는 화살표 함수
const ExpensiveChild = memo(({ data }) => {
  return <div>{/* 복잡한 렌더링 */}</div>;
});
\`\`\`

### memo의 비교 방식

기본적으로 **얕은 비교(shallow comparison)** 를 수행합니다:

\`\`\`tsx
// 원시값: 값이 같으면 통과
<Child count={5} />  // count가 5로 같으면 리렌더 안 됨

// 객체/배열: 참조가 같아야 통과!
<Child user={{ name: 'John' }} />  // ❌ 매번 새 객체 → 리렌더
<Child items={[1, 2, 3]} />         // ❌ 매번 새 배열 → 리렌더

// 함수: 참조가 같아야 통과!
<Child onClick={() => doSomething()} />  // ❌ 매번 새 함수 → 리렌더
\`\`\`

### 커스텀 비교 함수

\`\`\`tsx
const Child = memo(
  function Child({ user, items }) {
    return <div>{user.name}</div>;
  },
  // 두 번째 인자: 커스텀 비교 함수
  (prevProps, nextProps) => {
    // true를 반환하면 리렌더 건너뜀
    return prevProps.user.id === nextProps.user.id;
  }
);
\`\`\`

## useMemo: 값 메모이제이션

\`useMemo\`는 **계산 비용이 높은 값**을 메모이제이션합니다:

\`\`\`tsx
// ❌ 매 렌더마다 필터링 수행
function UserList({ users, filter }) {
  const filteredUsers = users.filter(u => u.name.includes(filter));
  return <List items={filteredUsers} />;
}

// ✅ users나 filter가 변경될 때만 필터링
function UserList({ users, filter }) {
  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.includes(filter));
  }, [users, filter]);  // 의존성 배열

  return <List items={filteredUsers} />;
}
\`\`\`

### useMemo 사용 기준

| 상황 | useMemo 사용 |
|------|-------------|
| 간단한 계산 (length, includes) | ❌ 불필요 |
| 복잡한 필터링/정렬 (1000+ 항목) | ✅ 권장 |
| 객체/배열을 memo 자식에게 전달 | ✅ 필수 |
| 다른 useMemo/useEffect의 의존성 | ✅ 권장 |

## useCallback: 함수 메모이제이션

\`useCallback\`은 **함수 참조**를 메모이제이션합니다:

\`\`\`tsx
// ❌ 매 렌더마다 새 함수 생성
function Parent() {
  const handleClick = () => {
    console.log('clicked');
  };

  return <MemoizedChild onClick={handleClick} />;  // memo 무효화
}

// ✅ 함수 참조 유지
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);  // 의존성이 없으면 항상 같은 함수

  return <MemoizedChild onClick={handleClick} />;  // memo 동작
}
\`\`\`

### useCallback 사용 기준

| 상황 | useCallback 사용 |
|------|-----------------|
| 일반 자식에게 전달 | ❌ 불필요 |
| memo된 자식에게 전달 | ✅ 필수 |
| useEffect의 의존성으로 사용 | ✅ 권장 |
| 이벤트 핸들러 (부모에서만 사용) | ❌ 불필요 |

## 정리: 메모이제이션 사용 전략

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    최적화 결정 트리                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  자식 컴포넌트가 무거운가?                              │
│      │                                                  │
│      ├── No → 최적화 불필요                             │
│      │                                                  │
│      └── Yes → React.memo 적용                          │
│              │                                          │
│              ├── props가 객체/배열? → useMemo            │
│              │                                          │
│              └── props가 함수? → useCallback             │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`
      `,
      codeExamples: [
        {
          id: 'memo-markdown-renderer',
          title: 'MarkdownRenderer - memo 적용 예제',
          description: '복잡한 렌더링 컴포넌트의 memo 적용',
          fileName: 'src/components/common/MarkdownRenderer/index.tsx',
          language: 'tsx',
          code: `// 프로젝트 실제 코드: MarkdownRenderer

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface MarkdownRendererProps {
  content: string;
  searchTerm?: string;
}

// ⭐ 코드 블록 컴포넌트 - memo 적용
// 이유: 복잡한 syntax highlighting 렌더링이 비용이 큼
const CodeBlock = memo(function CodeBlock({
  language,
  children
}: {
  language: string;
  children: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative', my: 2 }}>
      {/* 언어 표시 및 복사 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', ... }}>
        <Typography variant="caption">{language || 'plaintext'}</Typography>
        <IconButton onClick={handleCopy}>
          {copied ? <Check /> : <ContentCopy />}
        </IconButton>
      </Box>

      {/* ⭐ 비용이 큰 Syntax Highlighting */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        showLineNumbers={children.split('\\n').length > 5}
        wrapLines
        wrapLongLines
      >
        {children}
      </SyntaxHighlighter>
    </Box>
  );
});

// ⭐ 메인 컴포넌트도 memo 적용
// 이유: markdown 파싱과 렌더링이 비용이 큼
const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  searchTerm = ''
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // 코드 블록에서 CodeBlock 컴포넌트 사용
        code({ className, children, ...props }) {
          const match = /language-(\\w+)/.exec(className || '');
          const codeString = String(children).replace(/\\n$/, '');
          const isInline = !match && !codeString.includes('\\n');

          if (isInline) {
            return <code {...props}>{codeString}</code>;
          }

          // ⭐ memo된 CodeBlock 사용
          return <CodeBlock language={match?.[1] || ''}>{codeString}</CodeBlock>;
        },
        // ... 기타 컴포넌트
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

export default MarkdownRenderer;

// 💡 memo 적용 효과:
// 1. content가 변경되지 않으면 전체 markdown 파싱/렌더링 건너뜀
// 2. 각 코드 블록도 독립적으로 memo되어 불필요한 re-highlighting 방지
// 3. 긴 문서에서 특히 효과적 (수십 개의 코드 블록이 있을 수 있음)`
        },
        {
          id: 'usememo-examples',
          title: 'useMemo/useCallback 활용 예제',
          description: '실제 프로젝트의 메모이제이션 패턴',
          fileName: '다양한 소스에서',
          language: 'tsx',
          code: `// useMemo와 useCallback 활용 패턴

// ═══════════════════════════════════════════
// 예제 1: SimpleListView - 컬럼 수 계산
// ═══════════════════════════════════════════

function SimpleListView<T extends { id: string | number }>({
  rows,
  columns,
  checkboxSelection = false,
  showRowNumber = false,
  // ...
}: SimpleListViewProps<T>) {

  // ⭐ useMemo: 컬럼 수 계산 (변경 시에만 재계산)
  const totalColumns = useMemo(() => {
    let count = columns.length;
    if (checkboxSelection) count++;
    if (showRowNumber) count++;
    return count;
  }, [columns.length, checkboxSelection, showRowNumber]);

  // 빈 상태에서 colSpan에 사용
  return (
    <TableCell colSpan={totalColumns} align="center">
      {emptyMessage}
    </TableCell>
  );
}

// ═══════════════════════════════════════════
// 예제 2: DataGrid - Export 핸들러
// ═══════════════════════════════════════════

function ExcelDataGrid({
  rows,
  columns,
  exportFileName = 'export'
}: ExcelDataGridProps) {

  // ⭐ useCallback: 의존성이 변경될 때만 함수 재생성
  const handleExport = useCallback(() => {
    try {
      // rows를 Excel 형식으로 변환
      const exportData = rows.map((row) => {
        const rowData: any = {};
        columns.forEach((col) => {
          if (col.field !== '__check__' && col.field !== 'actions') {
            rowData[col.headerName || col.field] = row[col.field];
          }
        });
        return rowData;
      });

      // XLSX 라이브러리로 파일 생성
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // 파일 저장
      XLSX.writeFile(wb, \`\${exportFileName}_\${new Date().toISOString().slice(0, 10)}.xlsx\`);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  }, [rows, columns, exportFileName]);  // 의존성 배열

  // handleExport는 rows/columns/exportFileName이 변경될 때만 새로 생성
  return (
    <DataGrid
      slots={{ toolbar: CustomToolbar }}
      slotProps={{
        toolbar: {
          onExport: handleExport,  // memo된 Toolbar에 전달
          // ...
        }
      }}
    />
  );
}

// ═══════════════════════════════════════════
// 예제 3: useBoardManagement - 파생 상태
// ═══════════════════════════════════════════

function useBoardManagement(options) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchCriteria, setSearchCriteria] = useState({...});
  const [paginationModel, setPaginationModel] = useState({...});
  const [rowCount, setRowCount] = useState(0);

  // ⭐ useMemo: 필터 활성화 여부 계산
  const hasAdvancedFilters = useMemo(() => {
    return Object.values(searchCriteria).some(v => v !== '');
  }, [searchCriteria]);

  // ⭐ useMemo: 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    return Object.entries(searchCriteria)
      .filter(([_, value]) => value !== '')
      .length;
  }, [searchCriteria]);

  // ⭐ useMemo: 페이지 범위 정보
  const pageRange = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize + 1;
    const end = Math.min(
      (paginationModel.page + 1) * paginationModel.pageSize,
      rowCount
    );
    return { start, end, total: rowCount };
  }, [paginationModel, rowCount]);

  // ⭐ useMemo: 고정글/일반글 분리
  const { pinnedPosts, normalPosts } = useMemo(() => {
    return {
      pinnedPosts: posts.filter(p => p.is_pinned),
      normalPosts: posts.filter(p => !p.is_pinned)
    };
  }, [posts]);

  // ⭐ useCallback: 핸들러들
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchPosts(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchPosts, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((
    field: keyof SearchCriteria,
    value: string
  ) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  return {
    // 파생 상태
    hasAdvancedFilters,
    activeFilterCount,
    pageRange,
    pinnedPosts,
    normalPosts,
    // 핸들러
    handleRefresh,
    handleSearchChange
  };
}`
        }
      ],
      tips: [
        '✅ memo는 "비용이 큰" 컴포넌트에만 적용하세요. 모든 컴포넌트에 적용할 필요 없습니다.',
        '✅ memo된 컴포넌트에 객체/배열/함수를 전달할 때는 useMemo/useCallback으로 참조를 유지하세요.',
        '⚠️ useMemo/useCallback 자체도 비용이 있습니다. 간단한 계산에는 사용하지 마세요.',
        'ℹ️ React DevTools의 Profiler로 실제 성능 향상을 측정한 후 최적화하세요.'
      ]
    },
    {
      id: 'devtools-profiler',
      title: 'Performance Measurement',
      titleKo: '렌더링 성능 측정 (React DevTools)',
      content: `
## React DevTools Profiler

React DevTools의 **Profiler** 탭은 컴포넌트의 렌더링 성능을 측정하고 시각화합니다.

### Profiler 사용법

1. **React DevTools 설치**: Chrome/Firefox 확장 프로그램
2. **Profiler 탭** 선택
3. **녹화 시작** (파란 원 버튼)
4. 앱에서 동작 수행
5. **녹화 중지**
6. 결과 분석

### Profiler 화면 이해

\`\`\`
┌─────────────────────────────────────────────────────────┐
│ Profiler                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Commit #1 (2.3ms)   Commit #2 (15.7ms)   Commit #3     │
│  ████████            ████████████████████               │
│                                                         │
│  ┌───────────────────────────────────────────┐          │
│  │ App (0.2ms)                               │          │
│  │ ├─ Header (0.1ms)                         │          │
│  │ ├─ Sidebar (0.3ms)                        │          │
│  │ └─ Main (14.8ms) ⚠️ 느림                  │          │
│  │    ├─ SearchBar (0.2ms)                   │          │
│  │    └─ DataGrid (14.3ms) ⚠️                │          │
│  │       └─ Row × 1000 (13.9ms)              │          │
│  └───────────────────────────────────────────┘          │
│                                                         │
│  🟡 렌더링됨 (변경)     ⬜ 렌더링됨 (변경 없음)         │
│  🟢 memo로 건너뜀                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 주요 지표

| 지표 | 설명 | 목표 |
|------|------|------|
| **Render duration** | 컴포넌트 렌더링 시간 | < 16ms (60fps) |
| **Commit count** | 상태 변경 횟수 | 최소화 |
| **Why did this render?** | 리렌더링 원인 | 불필요한 리렌더 확인 |

### "Why did this render?" 활성화

설정에서 "Record why each component rendered" 옵션을 켜면 리렌더링 원인을 확인할 수 있습니다:

\`\`\`
Component: UserList
Why did this render?
• Props changed: (users)        ← 예상된 리렌더
• Parent component rendered     ← 불필요할 수 있음!
• Context changed: (UserContext)
• Hooks changed: [useState]
\`\`\`

## Highlight Updates

DevTools에서 **Highlight updates when components render** 옵션을 켜면 리렌더되는 컴포넌트가 시각적으로 표시됩니다:

- 🟢 초록색 테두리: 정상 속도 리렌더
- 🟡 노란색 테두리: 느린 리렌더
- 🔴 빨간색 테두리: 매우 느린 리렌더

## 성능 문제 패턴 진단

### 1. 불필요한 부모 리렌더

\`\`\`
문제: Parent rendered → Child rendered (변경 없음)

해결: Child에 React.memo 적용
\`\`\`

### 2. 객체/배열 props 재생성

\`\`\`
문제: Props changed (style), Props changed (items)
       하지만 실제 값은 변경되지 않음

해결: useMemo로 참조 유지
\`\`\`

### 3. 콜백 함수 재생성

\`\`\`
문제: Props changed (onClick)
       하지만 함수 동작은 동일

해결: useCallback으로 함수 참조 유지
\`\`\`

### 4. Context 과도한 리렌더

\`\`\`
문제: Context changed (ThemeContext)
       하지만 해당 값을 사용하지 않음

해결: Context 분리 또는 선택적 구독
\`\`\`

## 콘솔 기반 측정

\`\`\`tsx
// 개발 중 간단한 측정
function ExpensiveComponent({ data }) {
  console.time('ExpensiveComponent render');

  const result = /* 비용이 큰 작업 */;

  console.timeEnd('ExpensiveComponent render');
  // 출력: ExpensiveComponent render: 45.23ms

  return <div>{result}</div>;
}

// useEffect로 마운트/업데이트 측정
useEffect(() => {
  console.log('Component mounted/updated');
  return () => console.log('Component will unmount');
});
\`\`\`
      `,
      codeExamples: [
        {
          id: 'performance-debugging',
          title: '성능 디버깅 패턴',
          description: 'useWhyDidYouUpdate 커스텀 훅',
          language: 'tsx',
          code: `// 성능 디버깅을 위한 커스텀 훅

// ═══════════════════════════════════════════
// useWhyDidYouUpdate: 리렌더링 원인 추적
// ═══════════════════════════════════════════

function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  // 이전 props 저장
  const previousProps = useRef<Record<string, any>>({});

  useEffect(() => {
    if (previousProps.current) {
      // 모든 키 수집
      const allKeys = Object.keys({ ...previousProps.current, ...props });

      // 변경된 props 찾기
      const changesObj: Record<string, { from: any; to: any }> = {};
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });

      // 변경 사항 출력
      if (Object.keys(changesObj).length > 0) {
        console.group(\`[WhyDidYouUpdate] \${name}\`);
        Object.entries(changesObj).forEach(([key, change]) => {
          console.log(\`\${key}:\`, change.from, '→', change.to);
        });
        console.groupEnd();
      }
    }

    // 현재 props 저장
    previousProps.current = props;
  });
}

// 사용 예시
function UserCard({ user, onClick, style }) {
  // 개발 중에만 사용!
  if (process.env.NODE_ENV === 'development') {
    useWhyDidYouUpdate('UserCard', { user, onClick, style });
  }

  return (
    <Card style={style} onClick={onClick}>
      <Typography>{user.name}</Typography>
    </Card>
  );
}

// 콘솔 출력 예시:
// [WhyDidYouUpdate] UserCard
//   style: {color: 'blue'} → {color: 'blue'}  // 같은 값이지만 새 참조!
//   onClick: ƒ → ƒ                            // 같은 동작이지만 새 함수!

// ═══════════════════════════════════════════
// useRenderCount: 렌더 횟수 추적
// ═══════════════════════════════════════════

function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    console.log(\`[\${componentName}] Render count: \${renderCount.current}\`);
  });

  return renderCount.current;
}

// 사용
function MyComponent() {
  const renderCount = useRenderCount('MyComponent');
  // 개발자 도구에서 렌더 횟수 확인 가능

  return <div>Rendered {renderCount} times</div>;
}

// ═══════════════════════════════════════════
// useProfiler: 렌더링 시간 측정
// ═══════════════════════════════════════════

function useProfiler(id: string) {
  const onRender = useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(\`[Profiler] \${id}:\`, {
        phase,
        actualDuration: \`\${actualDuration.toFixed(2)}ms\`,
        baseDuration: \`\${baseDuration.toFixed(2)}ms\`,
      });
    }
  }, []);

  return { id, onRender };
}

// 사용
function App() {
  const profiler = useProfiler('DataGrid');

  return (
    <React.Profiler {...profiler}>
      <DataGrid rows={rows} columns={columns} />
    </React.Profiler>
  );
}

// 콘솔 출력:
// [Profiler] DataGrid: { phase: 'mount', actualDuration: '23.45ms', ... }
// [Profiler] DataGrid: { phase: 'update', actualDuration: '5.12ms', ... }`
        }
      ],
      tips: [
        '✅ 성능 최적화 전에 항상 Profiler로 측정하세요. 추측하지 마세요.',
        '✅ "Highlight updates"를 켜고 불필요한 리렌더를 시각적으로 확인하세요.',
        '✅ "Why did this render?"를 활성화하여 리렌더 원인을 파악하세요.',
        '⚠️ 프로덕션 빌드에서는 디버깅 코드를 제거하세요.'
      ]
    },
    {
      id: 'virtualization',
      title: 'Virtualization',
      titleKo: '가상화 (Virtualization)',
      content: `
## 가상화란?

**가상화(Virtualization)** 는 긴 리스트에서 **화면에 보이는 항목만 렌더링**하는 기술입니다.

### 문제: 대용량 리스트

\`\`\`
10,000개 항목 리스트:

❌ 일반 렌더링:
- DOM 노드 10,000개 생성
- 메모리 사용량 급증
- 초기 렌더링 2-3초

✅ 가상화:
- 화면에 보이는 20-30개만 렌더링
- 스크롤 시 동적으로 교체
- 초기 렌더링 < 100ms
\`\`\`

### 가상화 원리

\`\`\`
┌────────────────────────────────────────┐
│                                        │
│  [빈 공간 - 위쪽 패딩]                 │  ← paddingTop (스크롤된 높이만큼)
│                                        │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ Item 101                         │  │
│  ├──────────────────────────────────┤  │  ← 실제 렌더링되는 영역
│  │ Item 102                         │  │    (뷰포트 + 버퍼)
│  ├──────────────────────────────────┤  │
│  │ Item 103                         │  │
│  │ ...                              │  │
│  │ Item 120                         │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│                                        │
│  [빈 공간 - 아래쪽 패딩]               │  ← paddingBottom
│                                        │
└────────────────────────────────────────┘

총 10,000개 중 20개만 DOM에 존재
나머지는 패딩으로 스크롤 높이 유지
\`\`\`

## MUI DataGrid의 가상화

MUI DataGrid는 **내장 가상화**를 제공합니다:

\`\`\`tsx
import { DataGrid } from '@mui/x-data-grid';

function LargeDataGrid() {
  // 30,000행 데이터
  const rows = generateLargeDataset(30000);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      // 기본적으로 가상화 적용됨
      // 화면에 보이는 행만 렌더링
    />
  );
}
\`\`\`

### DataGrid 가상화 옵션

\`\`\`tsx
<DataGrid
  rows={rows}
  columns={columns}

  // 행 높이 (가상화 계산에 필요)
  rowHeight={52}

  // 버퍼 행 수 (뷰포트 위아래 미리 렌더링)
  // 스크롤 시 빈 화면 방지
  rowBuffer={10}

  // 열 버퍼 (수평 스크롤 시)
  columnBuffer={3}

  // 고정 높이 지정 (가상화에 필수)
  sx={{ height: 600 }}
/>
\`\`\`

## react-window 라이브러리

커스텀 리스트에는 \`react-window\` 또는 \`react-virtuoso\`를 사용합니다:

\`\`\`tsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}         // 컨테이너 높이
      itemCount={items.length}  // 총 항목 수
      itemSize={50}        // 각 항목 높이
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

### 가변 높이 리스트

\`\`\`tsx
import { VariableSizeList } from 'react-window';

function VariableHeightList({ items }) {
  // 각 항목의 높이 계산
  const getItemSize = (index) => {
    return items[index].content.length > 100 ? 100 : 50;
  };

  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].content}
        </div>
      )}
    </VariableSizeList>
  );
}
\`\`\`

## 가상화 사용 기준

| 항목 수 | 권장 |
|---------|------|
| < 100 | 일반 렌더링 OK |
| 100 - 1,000 | 상황에 따라 고려 |
| > 1,000 | 가상화 필수 |

## 서버 사이드 페이지네이션과 결합

대용량 데이터는 **서버 페이지네이션 + 가상화**를 결합합니다:

\`\`\`tsx
// 서버에서 페이지 단위로 로드
// 클라이언트에서 가상화로 렌더링

<DataGrid
  rows={currentPageRows}
  rowCount={totalRowCount}  // 서버의 전체 행 수
  paginationMode="server"
  paginationModel={paginationModel}
  onPaginationModelChange={handlePageChange}
/>
\`\`\`
      `,
      codeExamples: [
        {
          id: 'datagrid-virtualization',
          title: 'ExcelDataGrid - 가상화 적용',
          description: 'MUI DataGrid의 대용량 데이터 처리',
          fileName: 'src/components/common/DataGrid/index.tsx',
          language: 'tsx',
          code: `// 프로젝트 ExcelDataGrid - 가상화 내장

import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  // ...
} from '@mui/x-data-grid';

interface ExcelDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  height?: number | string;
  // 서버 페이지네이션 지원
  paginationMode?: 'client' | 'server';
  rowCount?: number;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  // ...
}

export default function ExcelDataGrid({
  rows,
  columns,
  loading = false,
  height,
  paginationMode = 'client',
  rowCount,
  paginationModel,
  onPaginationModelChange,
  // ...
}: ExcelDataGridProps) {
  return (
    <Box sx={{ height: height || '100%', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}

        // ⭐ 가상화 관련 설정
        // MUI DataGrid는 기본적으로 가상화 적용
        // 화면에 보이는 행만 렌더링

        // 페이지네이션 옵션
        pageSizeOptions={[10, 25, 50, 100]}

        // 서버 페이지네이션 모드
        paginationMode={paginationMode}
        rowCount={rowCount}  // 서버의 전체 행 수
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}

        // 클라이언트 모드 기본값
        initialState={
          paginationMode === 'client'
            ? {
                pagination: {
                  paginationModel: { pageSize: 25 }
                }
              }
            : undefined
        }

        // 스타일
        sx={{
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#f5f5f5',
            fontWeight: 600
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f0f7ff'
          }
        }}
      />
    </Box>
  );
}

// ═══════════════════════════════════════════
// 사용 예시: Admin Users 페이지
// ═══════════════════════════════════════════

function UsersPage() {
  const {
    users,
    rowCount,       // 서버 전체 사용자 수 (예: 30,000)
    paginationModel,
    handlePaginationModelChange,
    // ...
  } = useUserManagement();

  return (
    <ExcelDataGrid
      rows={users}          // 현재 페이지 데이터만 (예: 50개)
      columns={columns}

      // ⭐ 서버 페이지네이션
      paginationMode="server"
      rowCount={rowCount}   // 전체 30,000개
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationModelChange}

      height={600}
    />
  );
}

// 💡 가상화 + 서버 페이지네이션 효과:
// 1. 30,000명 중 50명만 서버에서 로드
// 2. 50명 중 화면에 보이는 ~20명만 DOM에 렌더링
// 3. 스크롤 시 동적으로 교체
// 4. 페이지 변경 시 새 데이터 서버에서 로드`
        },
        {
          id: 'simple-listview-optimization',
          title: 'SimpleListView - 경량 리스트',
          description: 'MUI Table 기반의 경량 리스트 컴포넌트',
          fileName: 'src/components/common/SimpleListView/index.tsx',
          language: 'tsx',
          code: `// SimpleListView - 기본 MUI Table 사용

// DataGrid보다 가볍지만 가상화는 없음
// 중소규모 데이터 (< 500행)에 적합

export default function SimpleListView<T extends { id: string | number }>({
  rows,
  columns,
  loading = false,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  // ...
}: SimpleListViewProps<T>) {

  // ⭐ 서버 페이지네이션으로 대용량 처리
  // 클라이언트에는 항상 소량의 데이터만 유지

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* 로딩 인디케이터 */}
      {loading && <LinearProgress />}

      {/* 테이블 */}
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field}>
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 현재 페이지 데이터만 렌더링 */}
            {rows.map((row, index) => (
              <TableRow key={row.id} hover>
                {columns.map((column) => (
                  <TableCell key={column.field}>
                    {column.renderCell
                      ? column.renderCell(row, index)
                      : (row as any)[column.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ⭐ 서버 페이지네이션 */}
      <TablePagination
        component="div"
        count={totalCount}        // 서버 전체 수
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Paper>
  );
}

// ═══════════════════════════════════════════
// DataGrid vs SimpleListView 선택 기준
// ═══════════════════════════════════════════

/*
┌──────────────────┬─────────────────────┬─────────────────────┐
│     기능         │    DataGrid         │   SimpleListView    │
├──────────────────┼─────────────────────┼─────────────────────┤
│ 가상화           │ ✅ 내장             │ ❌ 없음             │
│ 번들 크기        │ ~200KB             │ ~10KB (MUI Table)   │
│ 정렬/필터        │ ✅ 내장             │ ❌ 직접 구현        │
│ Excel Export     │ ✅ 쉬움             │ ⚠️ 직접 구현       │
│ 열 리사이즈      │ ✅ 내장             │ ❌ 없음             │
│ 적합한 데이터    │ 대용량 (1000+)      │ 소량 (<500)         │
│ 복잡한 기능      │ ✅ 다양한 기능      │ ❌ 기본만           │
└──────────────────┴─────────────────────┴─────────────────────┘

사용 시나리오:
- 사용자 목록 (30,000명): DataGrid + 서버 페이지네이션
- 역할 목록 (10개): SimpleListView
- 게시글 목록 (페이지당 20개): SimpleListView
- 로그 목록 (10,000+): DataGrid + 서버 페이지네이션
*/`
        }
      ],
      tips: [
        '✅ 1,000개 이상의 항목은 반드시 가상화를 적용하세요.',
        '✅ MUI DataGrid는 기본적으로 가상화가 적용되어 있습니다.',
        '✅ 대용량 데이터는 서버 페이지네이션과 가상화를 결합하세요.',
        '⚠️ 고정 높이를 지정해야 가상화가 올바르게 동작합니다.'
      ]
    },
    {
      id: 'code-splitting',
      title: 'Code Splitting and Lazy Loading',
      titleKo: '코드 스플리팅과 Lazy Loading',
      content: `
## 코드 스플리팅이란?

**코드 스플리팅(Code Splitting)** 은 JavaScript 번들을 작은 청크로 나누어 **필요할 때 로드**하는 기술입니다.

### 문제: 거대한 번들

\`\`\`
❌ 코드 스플리팅 없이:

main.js (2MB)
├── React (130KB)
├── MUI (500KB)
├── 모든 페이지 코드 (800KB)
├── 라이브러리들 (570KB)
└── ...

→ 첫 페이지 로드 시 2MB 다운로드
→ 느린 초기 로딩


✅ 코드 스플리팅 적용:

main.js (200KB) - 공통 코드만
├── React
└── MUI 핵심

dashboard.js (50KB) - 필요 시 로드
users.js (80KB) - 필요 시 로드
reports.js (150KB) - 필요 시 로드

→ 첫 페이지 로드 시 200KB만
→ 빠른 초기 로딩
\`\`\`

## React.lazy와 Suspense

\`\`\`tsx
import React, { lazy, Suspense } from 'react';

// ⭐ 동적 import로 컴포넌트 로드
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <Router>
      {/* ⭐ Suspense로 로딩 상태 처리 */}
      <Suspense fallback={<CircularProgress />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
\`\`\`

## Next.js dynamic import

Next.js는 \`next/dynamic\`을 제공합니다:

\`\`\`tsx
import dynamic from 'next/dynamic';

// ⭐ SSR 비활성화 + 코드 스플리팅
const RichTextEditor = dynamic(
  () => import('@/components/common/RichTextEditor'),
  {
    ssr: false,  // 서버에서 렌더링하지 않음
    loading: () => <Skeleton variant="rectangular" height={200} />
  }
);

// ⭐ 무거운 라이브러리 지연 로드
const ChartComponent = dynamic(
  () => import('@/components/ChartComponent'),
  {
    ssr: false,
    loading: () => <CircularProgress />
  }
);
\`\`\`

### SSR 비활성화가 필요한 경우

- **브라우저 전용 API** 사용 (window, document)
- **서드파티 라이브러리**가 SSR 미지원
- **무거운 라이브러리** (차트, 에디터 등)

## 언제 코드 스플리팅을 사용할까?

| 상황 | 적용 |
|------|------|
| 페이지/라우트 단위 | ✅ 필수 (Next.js 자동) |
| 모달/다이얼로그 | ✅ 권장 (열릴 때 로드) |
| 무거운 라이브러리 | ✅ 권장 (사용 시 로드) |
| 관리자 전용 기능 | ✅ 권장 (일반 사용자 불필요) |
| 작은 컴포넌트 | ❌ 불필요 (오버헤드) |

## Next.js의 자동 코드 스플리팅

Next.js는 다음을 자동으로 스플리팅합니다:

\`\`\`
app/
├── page.tsx          → /              별도 청크
├── dashboard/
│   └── page.tsx      → /dashboard     별도 청크
├── users/
│   └── page.tsx      → /users         별도 청크
└── reports/
    └── page.tsx      → /reports       별도 청크
\`\`\`

### Prefetching

Next.js는 Link 컴포넌트에 마우스를 올리면 **자동으로 prefetch**합니다:

\`\`\`tsx
import Link from 'next/link';

// 마우스 올리면 /dashboard 청크 미리 로드
<Link href="/dashboard">Dashboard</Link>
\`\`\`

## 번들 분석

\`\`\`bash
# Next.js 번들 분석
npm install @next/bundle-analyzer

# next.config.js에 설정 추가 후
ANALYZE=true npm run build
\`\`\`

번들 분석기로 확인할 것:
- 어떤 라이브러리가 번들 크기를 차지하는지
- 불필요한 코드가 포함되어 있는지
- 스플리팅이 제대로 적용되었는지
      `,
      codeExamples: [
        {
          id: 'dynamic-import-richtexteditor',
          title: 'RichTextEditor - dynamic import',
          description: 'SSR 비활성화와 코드 스플리팅',
          fileName: 'src/components/admin/HelpFormFields.tsx',
          language: 'tsx',
          code: `// 프로젝트 실제 코드: HelpFormFields

import React from 'react';
import {
  TextField,
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material';
import dynamic from 'next/dynamic';

// ⭐ RichTextEditor 동적 import
// 이유:
// 1. Quill 에디터는 window 객체 필요 (SSR 불가)
// 2. 번들 크기가 큼 (~150KB)
// 3. 도움말 폼에서만 사용 (모든 페이지에 불필요)
const RichTextEditor = dynamic(
  () => import('@/components/common/RichTextEditor'),
  {
    ssr: false,  // 서버 사이드 렌더링 비활성화
    // loading: () => <Skeleton height={200} />  // 로딩 UI 옵션
  }
);

export default function HelpFormFields({
  help,
  onChange
}: HelpFormFieldsProps) {
  if (!help) return null;

  const handleChange = (field: keyof HelpContent, value: any) => {
    onChange({ ...help, [field]: value });
  };

  return (
    <Stack spacing={3}>
      {/* 일반 필드들 */}
      <TextField
        label="Program ID"
        value={help.programId || ''}
        onChange={(e) => handleChange('programId', e.target.value)}
        fullWidth
        size="small"
        required
      />

      <TextField
        label="Title"
        value={help.title || ''}
        onChange={(e) => handleChange('title', e.target.value)}
        fullWidth
        size="small"
        required
      />

      {/* ⭐ 동적 로드된 RichTextEditor */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Main Content
        </Typography>
        <RichTextEditor
          value={help.content || ''}
          onChange={(content) => handleChange('content', content)}
        />
      </Box>

      {/* ... 기타 필드들 */}
    </Stack>
  );
}

// 💡 dynamic import 효과:
// 1. 도움말 관리 페이지 방문 전까지 RichTextEditor 미로드
// 2. 메인 번들 크기 ~150KB 감소
// 3. SSR 에러 방지 (window is not defined)`
        },
        {
          id: 'lazy-loading-patterns',
          title: '다양한 Lazy Loading 패턴',
          description: '상황별 코드 스플리팅 전략',
          language: 'tsx',
          code: `// 다양한 Lazy Loading 패턴

// ═══════════════════════════════════════════
// 패턴 1: 모달/다이얼로그 Lazy Loading
// ═══════════════════════════════════════════

import { lazy, Suspense, useState } from 'react';

// 무거운 다이얼로그 컴포넌트 지연 로드
const UserEditDialog = lazy(() =>
  import('@/components/admin/UserEditDialog')
);

const ExportDialog = lazy(() =>
  import('@/components/common/ExportDialog')
);

function UserManagementPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setEditDialogOpen(true)}>
        Edit User
      </Button>
      <Button onClick={() => setExportDialogOpen(true)}>
        Export
      </Button>

      {/* ⭐ 다이얼로그가 열릴 때만 로드 */}
      <Suspense fallback={<CircularProgress />}>
        {editDialogOpen && (
          <UserEditDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
          />
        )}
        {exportDialogOpen && (
          <ExportDialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
          />
        )}
      </Suspense>
    </>
  );
}

// ═══════════════════════════════════════════
// 패턴 2: 조건부 기능 Lazy Loading
// ═══════════════════════════════════════════

// 관리자 전용 기능
const AdminPanel = lazy(() => import('./AdminPanel'));

// 프리미엄 사용자 전용 기능
const PremiumFeatures = lazy(() => import('./PremiumFeatures'));

function Dashboard({ user }) {
  return (
    <div>
      <MainContent />

      <Suspense fallback={<Skeleton />}>
        {/* 관리자만 로드 */}
        {user.role === 'admin' && <AdminPanel />}

        {/* 프리미엄 사용자만 로드 */}
        {user.isPremium && <PremiumFeatures />}
      </Suspense>
    </div>
  );
}

// ═══════════════════════════════════════════
// 패턴 3: 라이브러리 지연 로드
// ═══════════════════════════════════════════

// 차트 라이브러리 (번들 크기 큼)
const Chart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false }
);

// PDF 생성 라이브러리
const PDFGenerator = dynamic(
  () => import('@/lib/pdf').then(mod => mod.default),
  { ssr: false }
);

// Excel 라이브러리 (필요할 때만)
const exportToExcel = async (data) => {
  // 동적 import로 XLSX 로드
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, 'export.xlsx');
};

// ═══════════════════════════════════════════
// 패턴 4: 탭별 콘텐츠 Lazy Loading
// ═══════════════════════════════════════════

const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const AnalyticsTab = lazy(() => import('./tabs/AnalyticsTab'));
const SettingsTab = lazy(() => import('./tabs/SettingsTab'));

function DashboardTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Overview', Component: OverviewTab },
    { label: 'Analytics', Component: AnalyticsTab },
    { label: 'Settings', Component: SettingsTab },
  ];

  const ActiveComponent = tabs[activeTab].Component;

  return (
    <>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
        {tabs.map((tab, i) => (
          <Tab key={i} label={tab.label} />
        ))}
      </Tabs>

      {/* ⭐ 선택된 탭만 로드 */}
      <Suspense fallback={<TabSkeleton />}>
        <ActiveComponent />
      </Suspense>
    </>
  );
}

// ═══════════════════════════════════════════
// 패턴 5: 이미지/미디어 Lazy Loading
// ═══════════════════════════════════════════

import Image from 'next/image';

// Next.js Image는 자동으로 lazy loading
function Gallery({ images }) {
  return (
    <div className="grid">
      {images.map((image) => (
        <Image
          key={image.id}
          src={image.url}
          alt={image.alt}
          width={300}
          height={200}
          // 뷰포트에 들어올 때 로드
          loading="lazy"
          // 스크롤 시 미리 로드 (기본값)
          placeholder="blur"
          blurDataURL={image.blurUrl}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// 패턴 6: 에러 바운더리와 함께 사용
// ═══════════════════════════════════════════

import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary
      fallback={<div>Failed to load component</div>}
      onError={(error) => console.error('Lazy load error:', error)}
    >
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<lazy(() => import('./Dashboard'))} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}`
        }
      ],
      tips: [
        '✅ Next.js는 페이지 단위 코드 스플리팅이 자동 적용됩니다.',
        '✅ SSR이 불가능한 컴포넌트는 dynamic import에 ssr: false를 사용하세요.',
        '✅ 모달, 다이얼로그 등 조건부 UI는 lazy loading의 좋은 후보입니다.',
        '⚠️ 너무 많은 청크로 나누면 오히려 성능이 저하될 수 있습니다.'
      ]
    },
    {
      id: 'optimization-checklist',
      title: 'Performance Optimization Checklist',
      titleKo: '성능 최적화 체크리스트',
      content: `
## 성능 최적화 체크리스트

### 렌더링 최적화

\`\`\`
□ 무거운 컴포넌트에 React.memo 적용
□ memo된 컴포넌트에 전달하는 객체/배열에 useMemo 사용
□ memo된 컴포넌트에 전달하는 함수에 useCallback 사용
□ 큰 리스트에 가상화 적용 (DataGrid 또는 react-window)
□ 불필요한 리렌더링 React DevTools로 확인
\`\`\`

### 번들 최적화

\`\`\`
□ 무거운 라이브러리 dynamic import 사용
□ SSR 불가 컴포넌트에 ssr: false 설정
□ 조건부 기능 lazy loading
□ 번들 분석으로 불필요한 코드 확인
□ tree-shaking 가능한 import 사용
\`\`\`

### 데이터 처리

\`\`\`
□ 대용량 데이터 서버 페이지네이션 사용
□ API 응답 캐싱 (React Query 등)
□ 검색/필터 디바운싱 적용
□ 이미지 최적화 (Next.js Image)
\`\`\`

### 측정과 모니터링

\`\`\`
□ Lighthouse 점수 확인
□ React DevTools Profiler로 느린 컴포넌트 식별
□ Web Vitals 모니터링 (LCP, FID, CLS)
□ 실제 사용자 환경에서 테스트
\`\`\`

## 최적화 우선순위

\`\`\`
높음:
├── 서버 페이지네이션 (대용량 데이터)
├── 가상화 (긴 리스트)
└── 코드 스플리팅 (무거운 라이브러리)

중간:
├── React.memo (느린 컴포넌트)
├── useMemo (비용 높은 계산)
└── useCallback (memo된 자식에게 전달)

낮음:
├── 이미지 최적화
├── 폰트 최적화
└── CSS 최적화
\`\`\`

## 주의사항

\`\`\`
⚠️ 측정 없는 최적화는 하지 마세요
⚠️ 모든 컴포넌트에 memo를 적용하지 마세요
⚠️ 간단한 계산에 useMemo를 사용하지 마세요
⚠️ 과도한 코드 스플리팅은 오히려 성능을 저하시킵니다
\`\`\`
      `,
      tips: [
        '✅ 최적화는 측정 → 문제 식별 → 해결 → 측정 순으로 진행하세요.',
        '✅ 가장 큰 영향을 주는 문제부터 해결하세요.',
        '⚠️ 조기 최적화는 모든 악의 근원입니다. 먼저 동작하게 만든 후 최적화하세요.',
        'ℹ️ 사용자가 느끼지 못하는 최적화는 불필요합니다. 체감 성능을 중시하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - Optimizing Performance',
      url: 'https://react.dev/learn/render-and-commit',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - useMemo',
      url: 'https://react.dev/reference/react/useMemo',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - useCallback',
      url: 'https://react.dev/reference/react/useCallback',
      type: 'documentation'
    },
    {
      title: 'Next.js - Dynamic Import',
      url: 'https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading',
      type: 'documentation'
    },
    {
      title: 'MUI DataGrid - Virtualization',
      url: 'https://mui.com/x/react-data-grid/virtualization/',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
