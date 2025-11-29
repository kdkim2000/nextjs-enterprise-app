/**
 * Chapter 3: useMemo와 useCallback
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'usememo-usecallback',
  order: 3,
  title: 'useMemo and useCallback',
  titleKo: 'useMemo와 useCallback',
  description: 'Optimize performance with memoization techniques using useMemo and useCallback.',
  descriptionKo: 'useMemo와 useCallback을 활용한 메모이제이션 기법으로 성능을 최적화합니다.',
  estimatedMinutes: 50,
  objectives: [
    'Understand memoization concepts and referential equality',
    'Optimize expensive calculations with useMemo',
    'Prevent unnecessary re-renders with useCallback',
    'Know when to use and when to avoid memoization'
  ],
  objectivesKo: [
    '메모이제이션 개념과 참조 동등성을 이해한다',
    'useMemo로 비용이 큰 계산을 최적화한다',
    'useCallback으로 불필요한 리렌더링을 방지한다',
    '메모이제이션을 언제 사용하고 피해야 하는지 안다'
  ],
  sections: [
    {
      id: 'memoization-basics',
      title: 'Memoization Fundamentals',
      titleKo: '메모이제이션 기본 개념',
      content: `
## 메모이제이션이란?

**메모이제이션(Memoization)** 은 이전에 계산한 결과를 **캐싱**하여 동일한 입력에 대해 **재계산을 피하는** 최적화 기법입니다.

### 기본 원리

\`\`\`
입력 A → 계산 → 결과 X (저장)
입력 A → 캐시 확인 → 결과 X 반환 (재계산 없음)
입력 B → 계산 → 결과 Y (저장)
\`\`\`

### React에서의 메모이제이션

React에서 메모이제이션은 **두 가지 문제**를 해결합니다:

| 문제 | 해결책 | Hook |
|------|--------|------|
| 비용이 큰 계산 반복 | 계산 결과 캐싱 | useMemo |
| 함수 참조 변경으로 인한 리렌더링 | 함수 참조 유지 | useCallback |

### useMemo vs useCallback

\`\`\`tsx
// useMemo: 값을 메모이제이션
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);

// useCallback: 함수를 메모이제이션
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// ⭐ useCallback은 useMemo의 특수 케이스
// useCallback(fn, deps) === useMemo(() => fn, deps)
\`\`\`

### 왜 필요한가?

\`\`\`tsx
// 문제 1: 비용이 큰 계산이 매 렌더링마다 실행됨
function Component({ items }) {
  // ❌ items가 변하지 않아도 매번 정렬
  const sortedItems = items.sort((a, b) => a.price - b.price);

  // ✅ items가 변할 때만 정렬
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.price - b.price),
    [items]
  );
}

// 문제 2: 함수가 매 렌더링마다 새로 생성됨
function Parent() {
  // ❌ 매 렌더링마다 새 함수 → Child 리렌더링
  const handleClick = () => console.log('clicked');

  // ✅ 함수 참조 유지 → Child 리렌더링 방지
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <Child onClick={handleClick} />;
}
\`\`\`

### 참조 동등성 이해

JavaScript에서 객체와 함수는 **참조로 비교**됩니다:

\`\`\`tsx
// 원시값: 값이 같으면 동등
'hello' === 'hello'  // true
5 === 5              // true

// 객체/배열/함수: 참조가 같아야 동등
{} === {}            // false (다른 참조)
[] === []            // false (다른 참조)
(() => {}) === (() => {})  // false (다른 참조)

const obj = {};
obj === obj          // true (같은 참조)

// React에서의 영향
function Component() {
  // 매 렌더링마다 새 객체 생성 → 자식에게 전달 시 리렌더링 유발
  const options = { page: 1, limit: 10 };

  // useMemo로 참조 유지
  const options = useMemo(() => ({ page: 1, limit: 10 }), []);
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'basic-usememo',
          title: 'useMemo 기본 사용법',
          description: '값을 메모이제이션하는 기본 패턴',
          language: 'tsx',
          code: `import { useMemo, useState } from 'react';

function ProductList({ products, sortBy }) {
  // ❌ 잘못된 예: 매 렌더링마다 정렬 실행
  // const sortedProducts = products.sort((a, b) => {
  //   console.log('Sorting...');  // 매 렌더링마다 출력
  //   return sortBy === 'price'
  //     ? a.price - b.price
  //     : a.name.localeCompare(b.name);
  // });

  // ✅ 올바른 예: products 또는 sortBy가 변할 때만 정렬
  const sortedProducts = useMemo(() => {
    console.log('Sorting...');  // 의존성 변경 시에만 출력
    return [...products].sort((a, b) =>
      sortBy === 'price'
        ? a.price - b.price
        : a.name.localeCompare(b.name)
    );
  }, [products, sortBy]);  // 의존성 배열

  return (
    <ul>
      {sortedProducts.map(product => (
        <li key={product.id}>{product.name}: \${product.price}</li>
      ))}
    </ul>
  );
}`
        },
        {
          id: 'basic-usecallback',
          title: 'useCallback 기본 사용법',
          description: '함수를 메모이제이션하는 기본 패턴',
          language: 'tsx',
          code: `import { useCallback, useState, memo } from 'react';

// memo로 감싼 자식 컴포넌트
const ExpensiveChild = memo(function ExpensiveChild({
  onClick,
  label
}: {
  onClick: () => void;
  label: string;
}) {
  console.log(\`ExpensiveChild rendered: \${label}\`);
  return <button onClick={onClick}>{label}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ 잘못된 예: 매 렌더링마다 새 함수 생성
  // const handleClickBad = () => {
  //   console.log('Clicked!');
  // };

  // ✅ 올바른 예: 함수 참조 유지
  const handleClick = useCallback(() => {
    console.log('Clicked!');
  }, []);  // 의존성 없음 → 함수 영원히 유지

  // 상태에 의존하는 함수
  const handleCountClick = useCallback(() => {
    setCount(prev => prev + 1);  // 함수형 업데이트 사용
  }, []);  // setCount는 안정적이므로 의존성 불필요

  return (
    <div>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type here..."
      />
      <p>Count: {count}</p>

      {/* handleClick이 변하지 않으므로 리렌더링 안됨 */}
      <ExpensiveChild onClick={handleClick} label="Click me" />

      {/* text 입력해도 이 버튼은 리렌더링 안됨 */}
      <ExpensiveChild onClick={handleCountClick} label="Increment" />
    </div>
  );
}`
        }
      ],
      tips: [
        '✅ useMemo는 "값"을, useCallback은 "함수"를 메모이제이션합니다.',
        '✅ 의존성 배열이 변경되면 새로운 값/함수가 생성됩니다.',
        '⚠️ 의존성 배열을 정확히 지정하지 않으면 버그가 발생합니다.',
        'ℹ️ 메모이제이션도 비용이 있으므로 필요한 곳에만 사용하세요.'
      ]
    },
    {
      id: 'expensive-calculations',
      title: 'Optimizing Expensive Calculations',
      titleKo: '계산 비용이 큰 연산 최적화',
      content: `
## useMemo로 비용이 큰 계산 최적화

useMemo의 주요 용도는 **계산 비용이 큰 연산의 결과를 캐싱**하는 것입니다.

### 언제 "비용이 크다"고 할 수 있나?

| 연산 유형 | 예시 | 비용 |
|----------|------|------|
| O(n) 이상의 배열 연산 | filter, map, sort, reduce | 중간~높음 |
| 중첩 루프 | 2차원 배열 처리 | 높음 |
| 문자열 파싱 | JSON.parse, 정규식 | 중간 |
| 복잡한 계산 | 통계, 차트 데이터 변환 | 높음 |
| 객체 변환 | 데이터 정규화, 그룹화 | 중간~높음 |

### 측정 방법

\`\`\`tsx
// console.time으로 실행 시간 측정
console.time('calculation');
const result = expensiveCalculation(data);
console.timeEnd('calculation');  // calculation: 15.234ms

// React DevTools Profiler 사용
// - 컴포넌트별 렌더링 시간 확인
// - "Highlight updates" 옵션으로 리렌더링 시각화
\`\`\`

### 일반적인 사용 패턴

\`\`\`tsx
// 1. 필터링 결과 캐싱
const filteredItems = useMemo(() => {
  return items.filter(item => item.status === 'active');
}, [items]);

// 2. 정렬 결과 캐싱
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => b.date - a.date);
}, [items]);

// 3. 파생 상태 계산
const statistics = useMemo(() => {
  return {
    total: items.length,
    sum: items.reduce((acc, item) => acc + item.price, 0),
    average: items.reduce((acc, item) => acc + item.price, 0) / items.length
  };
}, [items]);

// 4. 복잡한 데이터 변환
const chartData = useMemo(() => {
  return items.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + item.value;
    return acc;
  }, {} as Record<string, number>);
}, [items]);
\`\`\`
      `,
      codeExamples: [
        {
          id: 'active-filter-count',
          title: 'ConversationsPage의 activeFilterCount',
          description: '활성화된 필터 개수를 계산하는 useMemo 예제',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// ConversationsPage에서 활성 필터 개수 계산

export default function ConversationsPage() {
  // 필터 상태들
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [branch, setBranch] = useState('');

  // ⭐ 활성 필터 개수 계산 - useMemo로 최적화
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;      // 카테고리 필터 활성화
    if (difficulty) count++;    // 난이도 필터 활성화
    if (branch) count++;        // 브랜치 필터 활성화
    return count;
  }, [category, difficulty, branch]);  // 필터 값이 변할 때만 재계산

  // activeFilterCount를 사용하는 곳들:
  // 1. 검색 바에 배지로 표시
  // 2. 필터 패널 헤더에 표시
  return (
    <QuickSearchBar
      // ... other props
      activeFilterCount={activeFilterCount}  // 배지 표시
    />
  );
}

// 왜 useMemo가 필요한가?
// - 다른 상태(search, page 등)가 변해도 재계산 안됨
// - 단순한 계산이지만 불필요한 반복을 피함`
        },
        {
          id: 'filtered-messages',
          title: 'ConversationDetailPage의 메시지 필터링',
          description: '대량 데이터 필터링에 useMemo 적용',
          fileName: 'src/app/[locale]/dev/conversations/[id]/page.tsx',
          language: 'tsx',
          code: `// ConversationDetailPage에서 메시지 필터링 최적화

export default function ConversationDetailPage({ params }) {
  const [data, setData] = useState<ConversationDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ⭐ 1단계: 빈 메시지 필터링 + 인덱스 보존
  const filteredMessages = useMemo(() => {
    if (!data) return [];
    return data.messages
      .map((msg, originalIdx) => ({ ...msg, originalIdx }))  // 원본 인덱스 보존
      .filter((msg) => msg.content && msg.content.trim());   // 빈 메시지 제외
  }, [data]);  // data가 변할 때만 재계산

  // ⭐ 2단계: 검색어 매칭 인덱스 계산
  const matchingMessageIndices = useMemo(() => {
    // 검색어가 2글자 미만이면 검색 안함
    if (!searchTerm || searchTerm.length < 2 || !filteredMessages.length) {
      return [];
    }
    const term = searchTerm.toLowerCase();
    return filteredMessages
      .map((msg, idx) => (msg.content.toLowerCase().includes(term) ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [searchTerm, filteredMessages]);  // 검색어 또는 메시지가 변할 때만

  // 최적화 효과:
  // 1. data가 변하지 않으면 filteredMessages 재계산 안됨
  // 2. searchTerm이 변해도 filteredMessages는 그대로 사용
  // 3. filteredMessages를 의존성으로 사용하여 체인 최적화

  return (
    <div>
      {/* 검색 결과: {matchingMessageIndices.length}건 */}
      {filteredMessages.map((msg, idx) => (
        <MessageItem
          key={msg.id}
          message={msg}
          isMatch={matchingMessageIndices.includes(idx)}
        />
      ))}
    </div>
  );
}`
        },
        {
          id: 'calculate-active-filter',
          title: 'BoardListPage의 필터 계산 유틸',
          description: '검색 조건에서 활성 필터 개수 계산',
          fileName: 'src/app/[locale]/boards/[boardTypeId]/utils.ts',
          language: 'tsx',
          code: `// utils.ts - 순수 함수로 분리된 필터 계산 로직
export const calculateActiveFilterCount = (searchCriteria: SearchCriteria): number => {
  return Object.entries(searchCriteria).filter(([_key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;  // 배열은 길이로 체크
    }
    return value !== '';  // 문자열은 빈 문자열 체크
  }).length;
};

// page.tsx에서 useMemo로 활용
export default function BoardListPage() {
  const { searchCriteria } = useBoardManagement({ ... });

  // ⭐ useMemo로 계산 결과 캐싱
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  // ⭐ 다른 계산들도 useMemo로 최적화
  const filterFields = useMemo(
    () => createFilterFields(currentLocale),
    [currentLocale]
  );

  const deleteItemsList = useMemo(
    () => buildSimpleDeleteItemsList(deleteTargetIds, posts, 'title', 'Post'),
    [deleteTargetIds, posts]
  );

  // 각 useMemo는 독립적인 의존성을 가짐:
  // - filterFields: locale 변경 시에만 재생성
  // - activeFilterCount: 검색 조건 변경 시에만 재계산
  // - deleteItemsList: 삭제 대상이나 포스트가 변경될 때만
}`
        },
        {
          id: 'columns-memoization',
          title: 'DataGrid 컬럼 정의 메모이제이션',
          description: '컬럼 설정을 useMemo로 캐싱',
          fileName: 'src/app/[locale]/admin/users/page.tsx',
          language: 'tsx',
          code: `// Admin Users Page - 컬럼 정의 메모이제이션

export default function UsersPage() {
  const t = useI18n();
  const { allDepartments } = useUserManagement({ ... });

  // ⭐ DataGrid 컬럼 정의를 useMemo로 캐싱
  const columns = useMemo(() => {
    // createColumns는 번역 함수와 부서 목록을 받아 컬럼 배열 생성
    return createColumns(t, allDepartments);
  }, [t, allDepartments]);

  // ⭐ 필터 필드도 useMemo로 캐싱
  const filterFields = useMemo(
    () => createFilterFields(t, currentLocale, allDepartments),
    [t, currentLocale, allDepartments]
  );

  return (
    <DataGrid
      columns={columns}  // 메모이제이션된 컬럼
      rows={users}
      // ...
    />
  );
}

// 왜 중요한가?
// - columns 배열이 매번 새로 생성되면 DataGrid가 불필요하게 리렌더링
// - t, allDepartments가 변하지 않으면 같은 columns 배열 재사용
// - 특히 대량의 데이터를 표시하는 DataGrid에서 성능 차이 큼`
        }
      ],
      tips: [
        '✅ O(n) 이상의 배열 연산(filter, map, sort)은 useMemo 후보입니다.',
        '✅ 계산 결과를 다른 useMemo의 의존성으로 사용하면 체인 최적화가 됩니다.',
        '⚠️ 단순한 계산(숫자 덧셈 등)에는 useMemo가 오히려 오버헤드입니다.',
        'ℹ️ 계산 로직을 순수 함수로 분리하면 테스트와 재사용이 쉬워집니다.'
      ]
    },
    {
      id: 'referential-equality',
      title: 'Referential Equality and Re-renders',
      titleKo: '참조 동등성과 리렌더링',
      content: `
## 참조 동등성이 리렌더링에 미치는 영향

React는 props나 의존성 배열의 값이 변경되었는지 **얕은 비교(shallow comparison)** 로 판단합니다.

### 얕은 비교의 동작

\`\`\`tsx
// 원시값: 값 자체를 비교
1 === 1           // true
'a' === 'a'       // true
true === true     // true

// 객체/배열/함수: 참조를 비교
{a: 1} === {a: 1}     // false (다른 참조)
[1,2] === [1,2]       // false (다른 참조)
(() => {}) === (() => {})  // false (다른 참조)
\`\`\`

### 문제 상황

\`\`\`tsx
// ❌ 문제: 매 렌더링마다 새 객체/함수 생성
function Parent() {
  // style 객체가 매번 새로 생성됨
  const style = { color: 'red', fontSize: 14 };

  // onClick 함수가 매번 새로 생성됨
  const handleClick = () => console.log('clicked');

  // options 배열이 매번 새로 생성됨
  const options = ['a', 'b', 'c'];

  return (
    <Child
      style={style}        // 매번 새 참조 → Child 리렌더링
      onClick={handleClick}  // 매번 새 참조 → Child 리렌더링
      options={options}     // 매번 새 참조 → Child 리렌더링
    />
  );
}
\`\`\`

### useEffect 의존성 문제

\`\`\`tsx
function Component() {
  // ❌ 문제: options가 매번 새 참조
  const options = { page: 1, limit: 10 };

  useEffect(() => {
    fetchData(options);  // 매 렌더링마다 실행됨!
  }, [options]);  // options 참조가 항상 다르므로

  // ✅ 해결 1: useMemo로 참조 유지
  const options = useMemo(() => ({ page: 1, limit: 10 }), []);

  // ✅ 해결 2: 원시값으로 분리
  const page = 1;
  const limit = 10;
  useEffect(() => {
    fetchData({ page, limit });
  }, [page, limit]);  // 원시값이므로 안정적
}
\`\`\`

### memo와 함께 사용

\`\`\`tsx
// memo로 감싼 컴포넌트는 props가 변경되지 않으면 리렌더링 안됨
const MemoizedChild = memo(function Child({ data, onClick }) {
  console.log('Child rendered');
  return <div onClick={onClick}>{data.name}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ⭐ useMemo/useCallback으로 참조 유지
  const data = useMemo(() => ({ name: 'Kim' }), []);
  const handleClick = useCallback(() => console.log('click'), []);

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      {/* count가 변해도 MemoizedChild는 리렌더링 안됨 */}
      <MemoizedChild data={data} onClick={handleClick} />
    </>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'useeffect-dependency',
          title: 'useEffect 의존성과 useCallback',
          description: 'fetchConversations 함수를 의존성으로 사용',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// ConversationsPage - useCallback과 useEffect 의존성

export default function ConversationsPage() {
  // 필터 상태들
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [branch, setBranch] = useState('');

  // ⭐ 데이터 페칭 함수를 useCallback으로 메모이제이션
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      if (branch) params.append('branch', branch);

      const response = await axiosInstance.get(\`/conversation?\${params.toString()}\`);
      setConversations(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, category, difficulty, branch]);
  // ↑ 이 값들이 변할 때만 함수가 새로 생성됨

  // ⭐ useCallback 함수를 useEffect 의존성으로 사용
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  // ↑ fetchConversations 참조가 변할 때만 실행

  // 이 패턴의 장점:
  // 1. fetchConversations를 다른 곳(버튼 클릭 등)에서도 재사용 가능
  // 2. 의존성이 명확하게 선언됨
  // 3. ESLint exhaustive-deps 규칙 만족
}`
        },
        {
          id: 'navigation-callback',
          title: 'navigateMatch - 의존성이 있는 useCallback',
          description: '외부 상태를 참조하는 콜백 함수 최적화',
          fileName: 'src/app/[locale]/dev/conversations/[id]/page.tsx',
          language: 'tsx',
          code: `// ConversationDetailPage - 검색 네비게이션 콜백

export default function ConversationDetailPage() {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // useMemo로 계산된 값
  const filteredMessages = useMemo(() => { /* ... */ }, [data]);
  const matchingMessageIndices = useMemo(() => { /* ... */ }, [searchTerm, filteredMessages]);

  // ⭐ 검색 결과 네비게이션 - 여러 의존성 참조
  const navigateMatch = useCallback(
    (direction: 'prev' | 'next') => {
      if (matchingMessageIndices.length === 0) return;

      // 이전/다음 인덱스 계산 (순환)
      let newIndex = currentMatchIndex;
      if (direction === 'next') {
        newIndex = (currentMatchIndex + 1) % matchingMessageIndices.length;
      } else {
        newIndex = (currentMatchIndex - 1 + matchingMessageIndices.length)
          % matchingMessageIndices.length;
      }
      setCurrentMatchIndex(newIndex);

      // 해당 메시지 확장 및 스크롤
      const messageIdx = matchingMessageIndices[newIndex];
      const originalIdx = filteredMessages[messageIdx].originalIdx;
      setExpandedMessages((prev) => new Set([...prev, originalIdx]));

      setTimeout(() => {
        const element = document.getElementById(\`message-\${messageIdx}\`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    },
    [currentMatchIndex, matchingMessageIndices, filteredMessages]
    // ↑ 의존성 배열에 사용하는 모든 값 포함
  );

  // navigateMatch가 재생성되는 경우:
  // 1. currentMatchIndex가 변경될 때 (네비게이션 시)
  // 2. matchingMessageIndices가 변경될 때 (검색어 변경 시)
  // 3. filteredMessages가 변경될 때 (데이터 변경 시)
}`
        },
        {
          id: 'toggle-message-stable',
          title: '안정적인 콜백 - 의존성 없음',
          description: '상태 업데이터 함수만 사용하는 콜백',
          fileName: 'src/app/[locale]/dev/conversations/[id]/page.tsx',
          language: 'tsx',
          code: `// ConversationDetailPage - 안정적인 토글 함수

export default function ConversationDetailPage() {
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  // ⭐ 의존성이 없는 안정적인 콜백
  const toggleMessage = useCallback((originalIdx: number) => {
    // 함수형 업데이트를 사용하면 현재 상태를 참조할 필요 없음
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(originalIdx)) {
        newSet.delete(originalIdx);
      } else {
        newSet.add(originalIdx);
      }
      return newSet;
    });
  }, []);  // ⭐ 빈 배열 - 함수가 절대 변하지 않음

  // 이 함수는 컴포넌트 수명 동안 동일한 참조 유지
  // → memo로 감싼 자식 컴포넌트에 전달해도 리렌더링 안 유발

  // ⭐ 비교: 의존성이 필요한 경우
  const expandAll = useCallback(() => {
    if (filteredMessages.length) {
      setExpandedMessages(
        new Set<number>(filteredMessages.map((msg) => msg.originalIdx))
      );
    }
  }, [filteredMessages]);  // filteredMessages를 직접 참조하므로 의존성 필요

  // ⭐ 모범 사례: 함수형 업데이트 활용
  // const increment = useCallback(() => {
  //   setCount(count + 1);  // ❌ count 의존성 필요
  // }, [count]);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);  // ✅ 의존성 불필요
  }, []);
}`
        }
      ],
      tips: [
        '✅ 함수형 업데이트(prev => ...)를 사용하면 상태 의존성을 줄일 수 있습니다.',
        '✅ useMemo 결과를 useCallback 의존성으로 사용하면 최적화가 연쇄됩니다.',
        '⚠️ 의존성 배열을 빈 배열로 두면 함수 내에서 stale closure 문제가 발생할 수 있습니다.',
        'ℹ️ ESLint react-hooks/exhaustive-deps 규칙을 켜두면 누락된 의존성을 감지합니다.'
      ]
    },
    {
      id: 'usecallback-patterns',
      title: 'useCallback Patterns',
      titleKo: 'useCallback 함수 메모이제이션 패턴',
      content: `
## useCallback 사용 패턴

useCallback은 **함수 참조를 안정화**하여 불필요한 리렌더링과 Effect 재실행을 방지합니다.

### 주요 사용 케이스

| 케이스 | 설명 | 필요성 |
|--------|------|--------|
| memo 컴포넌트에 전달 | props로 전달되는 함수 | ⭐⭐⭐ |
| useEffect 의존성 | Effect에서 호출되는 함수 | ⭐⭐⭐ |
| 다른 Hook 의존성 | useMemo, useCallback 의존성 | ⭐⭐ |
| Context value | Provider의 value 객체 내 함수 | ⭐⭐⭐ |
| Custom Hook 반환 | Hook에서 반환하는 함수 | ⭐⭐⭐ |

### 이벤트 핸들러 패턴

\`\`\`tsx
function Component() {
  const [items, setItems] = useState([]);

  // 패턴 1: ID를 인자로 받는 핸들러
  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // 패턴 2: 이벤트와 추가 데이터를 받는 핸들러
  const handleChange = useCallback((id: string, field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: e.target.value } : item
    ));
  }, []);

  // 패턴 3: 비동기 핸들러
  const handleSave = useCallback(async (data: FormData) => {
    try {
      await saveToServer(data);
      showSuccess('Saved!');
    } catch (err) {
      showError('Failed to save');
    }
  }, []);  // showSuccess, showError가 안정적이면 의존성 불필요

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <input
            value={item.name}
            onChange={handleChange(item.id, 'name')}
          />
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

### Custom Hook에서 useCallback

\`\`\`tsx
// 커스텀 훅에서 반환하는 함수는 useCallback으로 안정화
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  // 안정적인 함수들을 반환
  return { count, increment, decrement, reset };
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'custom-hook-callbacks',
          title: 'useAttachmentTypeManagement Hook',
          description: '커스텀 훅에서 다양한 핸들러를 useCallback으로 최적화',
          fileName: 'src/app/[locale]/admin/attachment-types/hooks/useAttachmentTypeManagement.ts',
          language: 'tsx',
          code: `// useAttachmentTypeManagement - 관리 훅의 useCallback 패턴

export const useAttachmentTypeManagement = (options = {}) => {
  const { storageKey = 'admin-attachment-types-page-state' } = options;

  // 상태들...
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttachmentType | null>(null);

  // ⭐ 데이터 페칭 - 검색 조건을 의존성으로
  const fetchAttachmentTypes = useCallback(async (
    page: number = 0,
    pageSize: number = 50,
    useQuickSearch: boolean = false
  ) => {
    try {
      setSearching(true);
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        params.append('search', quickSearch);
      } else {
        if (searchCriteria.code) params.append('search', searchCriteria.code);
        // ... other params
      }

      const response = await api.get(\`/attachment-type?\${params}\`);
      setAttachmentTypes(response.attachmentTypes || []);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setAttachmentTypes]);

  // ⭐ CRUD 핸들러들 - 의존성 최소화
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setDialogOpen(true);
  }, []);  // 의존성 없음

  const handleEdit = useCallback((id: string | number) => {
    const item = attachmentTypes.find(at => at.id === id);
    if (item) {
      setEditingItem(item);
      setDialogOpen(true);
    }
  }, [attachmentTypes]);  // attachmentTypes만 의존

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);  // 의존성 없음

  // ⭐ 검색 관련 핸들러들
  const handleSearchChange = useCallback((
    field: keyof SearchCriteria,
    value: string | string[]
  ) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    fetchAttachmentTypes(0, paginationModel.pageSize, true);
  }, [fetchAttachmentTypes, paginationModel.pageSize]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setSearchCriteria({ code: '', name: '', status: '' });
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    fetchAttachmentTypes(0, paginationModel.pageSize, false);
  }, [fetchAttachmentTypes, paginationModel.pageSize]);

  // ⭐ 안정적인 객체 반환
  return {
    // 상태들
    attachmentTypes,
    searching,
    // 핸들러들 - 모두 useCallback으로 안정화됨
    handleAdd,
    handleEdit,
    handleDeleteClick,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    // ...
  };
};`
        },
        {
          id: 'search-handlers',
          title: 'ConversationDetailPage 검색 핸들러',
          description: '검색 관련 핸들러들의 useCallback 패턴',
          fileName: 'src/app/[locale]/dev/conversations/[id]/page.tsx',
          language: 'tsx',
          code: `// ConversationDetailPage - 검색 관련 useCallback 패턴

export default function ConversationDetailPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // ⭐ 단순 상태 업데이트 핸들러 - 의존성 없음
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentMatchIndex(0);  // 검색어 변경 시 인덱스 리셋
  }, []);

  // ⭐ DOM 접근이 포함된 핸들러
  const handleSearchOpen = useCallback(() => {
    setSearchOpen(true);
    // ref 접근은 의존성에 포함하지 않음 (ref 객체 자체는 안정적)
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  // ⭐ 여러 상태를 초기화하는 핸들러
  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setSearchTerm('');
    // currentMatchIndex는 searchTerm이 ''가 되면 자동으로 의미 없어짐
  }, []);

  return (
    <>
      {searchOpen ? (
        <input
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      ) : (
        <IconButton onClick={handleSearchOpen}>
          <Search />
        </IconButton>
      )}
    </>
  );
}

// ⭐ useCallback 의존성 결정 가이드:
// 1. 함수 내에서 사용하는 props나 state → 의존성에 포함
// 2. setState 함수 → 의존성에 불필요 (React가 보장)
// 3. useRef.current → 의존성에 불필요 (ref 객체는 안정적)
// 4. 외부 상수/함수 → 의존성에 불필요`
        },
        {
          id: 'expand-collapse-callbacks',
          title: '전체 펼치기/접기 핸들러',
          description: 'useMemo 결과를 사용하는 useCallback',
          fileName: 'src/app/[locale]/dev/conversations/[id]/page.tsx',
          language: 'tsx',
          code: `// 전체 펼치기/접기 기능

export default function ConversationDetailPage() {
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  // useMemo로 계산된 필터링 결과
  const filteredMessages = useMemo(() => {
    if (!data) return [];
    return data.messages
      .map((msg, originalIdx) => ({ ...msg, originalIdx }))
      .filter((msg) => msg.content && msg.content.trim());
  }, [data]);

  // ⭐ 전체 펼치기 - filteredMessages를 의존성으로
  const expandAll = useCallback(() => {
    if (filteredMessages.length) {
      setExpandedMessages(
        new Set<number>(filteredMessages.map((msg) => msg.originalIdx))
      );
    }
  }, [filteredMessages]);
  // filteredMessages가 변하면 expandAll도 새로 생성됨
  // 하지만 filteredMessages는 data가 변할 때만 변함

  // ⭐ 전체 접기 - 의존성 없음
  const collapseAll = useCallback(() => {
    setExpandedMessages(new Set<number>());
  }, []);
  // 빈 Set을 만드는 것은 상태에 의존하지 않음

  return (
    <Box>
      {/* 툴바 버튼들 */}
      <Tooltip title="Expand All">
        <IconButton onClick={expandAll}>
          <UnfoldMore />
        </IconButton>
      </Tooltip>
      <Tooltip title="Collapse All">
        <IconButton onClick={collapseAll}>
          <UnfoldLess />
        </IconButton>
      </Tooltip>

      {/* 메시지 목록 */}
      {filteredMessages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          expanded={expandedMessages.has(msg.originalIdx)}
          onToggle={() => toggleMessage(msg.originalIdx)}
        />
      ))}
    </Box>
  );
}`
        }
      ],
      tips: [
        '✅ Custom Hook에서 반환하는 함수는 항상 useCallback으로 감싸세요.',
        '✅ 이벤트 핸들러 내에서 setState의 함수형 업데이트를 사용하면 의존성을 줄일 수 있습니다.',
        '⚠️ useCallback 자체도 비용이 있으므로 모든 함수에 적용할 필요는 없습니다.',
        'ℹ️ 함수를 props로 전달하지 않거나 의존성으로 사용하지 않으면 useCallback 불필요합니다.'
      ]
    },
    {
      id: 'when-to-use',
      title: 'When to Use and Avoid',
      titleKo: '언제 사용하고 언제 피할 것인가',
      content: `
## 메모이제이션 사용 가이드라인

### useMemo 사용이 권장되는 경우

| 상황 | 예시 | 권장도 |
|------|------|--------|
| 비용이 큰 계산 | 정렬, 필터링, 통계 계산 | ⭐⭐⭐ |
| useEffect 의존성 객체 | { page, limit } 객체 | ⭐⭐⭐ |
| memo 컴포넌트에 전달하는 객체 | style, options 객체 | ⭐⭐⭐ |
| Context value | Provider의 value | ⭐⭐⭐ |
| 체인 의존성 | useMemo → useMemo → useCallback | ⭐⭐ |

### useCallback 사용이 권장되는 경우

| 상황 | 예시 | 권장도 |
|------|------|--------|
| memo 컴포넌트에 전달 | onClick, onChange | ⭐⭐⭐ |
| useEffect 의존성 | fetchData 함수 | ⭐⭐⭐ |
| Custom Hook 반환 | handleAdd, handleDelete | ⭐⭐⭐ |
| Context value 내 함수 | login, logout | ⭐⭐⭐ |
| 다른 Hook 의존성 | useMemo 의존성 | ⭐⭐ |

### 메모이제이션이 불필요한 경우

\`\`\`tsx
// ❌ 불필요: 단순 계산
const double = useMemo(() => count * 2, [count]);
// count * 2는 즉시 계산됨, useMemo 오버헤드가 더 큼

// ❌ 불필요: 원시값만 의존성인 경우
const sum = useMemo(() => a + b + c, [a, b, c]);
// 원시값은 참조 동등성 문제 없음

// ❌ 불필요: 컴포넌트 내부에서만 사용하는 함수
function Component() {
  // 이 함수는 아무 곳에도 전달되지 않음
  const handleClick = () => console.log('clicked');
  return <button onClick={handleClick}>Click</button>;
}

// ❌ 불필요: memo 안된 컴포넌트에 전달
function Parent() {
  const handleClick = useCallback(() => {}, []);
  // Child가 memo로 감싸지 않았으면 의미 없음
  return <Child onClick={handleClick} />;
}
\`\`\`

### 성능 측정 방법

\`\`\`tsx
// 1. React DevTools Profiler
// - "Highlight updates" 옵션으로 리렌더링 시각화
// - "Record why each component rendered" 옵션 활성화

// 2. console.time / console.timeEnd
useEffect(() => {
  console.time('render');
  return () => console.timeEnd('render');
});

// 3. useDebugValue (커스텀 훅용)
function useExpensiveValue(input) {
  const value = useMemo(() => {
    console.time('expensive');
    const result = expensiveCalculation(input);
    console.timeEnd('expensive');
    return result;
  }, [input]);

  useDebugValue(value);  // DevTools에서 확인 가능
  return value;
}
\`\`\`

### 최적화 순서

1. **문제 확인**: DevTools Profiler로 병목 지점 확인
2. **원인 파악**: 왜 리렌더링/재계산이 발생하는지 분석
3. **memo 적용**: 불필요한 리렌더링 방지
4. **useMemo/useCallback**: 필요한 곳에만 적용
5. **검증**: 실제로 성능이 개선되었는지 측정
      `,
      codeExamples: [
        {
          id: 'good-vs-bad',
          title: '좋은 사용 vs 나쁜 사용',
          description: '메모이제이션의 적절한 사용 판단',
          language: 'tsx',
          code: `// ✅ 좋은 사용 예시

// 1. 비용이 큰 필터링/정렬
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => b.date - a.date);
}, [items]);

// 2. memo 컴포넌트에 전달하는 콜백
const MemoizedList = memo(List);
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
<MemoizedList items={items} onSelect={handleSelect} />

// 3. useEffect 의존성으로 사용되는 객체
const fetchOptions = useMemo(
  () => ({ page, limit, sortBy }),
  [page, limit, sortBy]
);
useEffect(() => {
  fetchData(fetchOptions);
}, [fetchOptions]);

// 4. Custom Hook에서 반환하는 함수
function useDataFetcher() {
  const fetch = useCallback(async (params) => {
    const response = await api.get('/data', { params });
    return response.data;
  }, []);

  return { fetch };
}

// ❌ 나쁜 사용 예시

// 1. 단순 계산
const double = useMemo(() => count * 2, [count]);
// Better: const double = count * 2;

// 2. memo 없는 컴포넌트에 전달
function Parent() {
  const handler = useCallback(() => {}, []);
  return <NormalChild onClick={handler} />;  // 의미 없음
}

// 3. 의존성이 매번 변하는 경우
const value = useMemo(() => calculate(obj), [obj]);
// obj가 매 렌더링마다 새로 생성되면 useMemo 무용지물

// 4. 모든 함수에 무조건 적용
const handleMouseMove = useCallback((e) => {
  console.log(e.clientX);  // 아무 곳에도 전달 안됨
}, []);`
        },
        {
          id: 'optimization-checklist',
          title: '최적화 체크리스트',
          description: '메모이제이션 적용 전 체크할 항목들',
          language: 'tsx',
          code: `// 메모이제이션 적용 전 체크리스트

// □ 1. 실제로 성능 문제가 있는가?
//    - DevTools Profiler로 측정
//    - 사용자가 느낄 수 있는 지연인가?

// □ 2. useMemo 적용 후보
const expensiveResult = useMemo(() => {
  // 체크: O(n) 이상의 배열 연산인가?
  // 체크: 복잡한 객체 변환인가?
  // 체크: 외부 API 결과 가공인가?
  return items.filter(...).map(...).reduce(...);
}, [items]);

// □ 3. useCallback 적용 후보
const handler = useCallback(() => {
  // 체크: memo 컴포넌트에 전달되는가?
  // 체크: useEffect 의존성으로 사용되는가?
  // 체크: Custom Hook에서 반환되는가?
}, [dependencies]);

// □ 4. 의존성 배열이 정확한가?
//    - ESLint exhaustive-deps 경고 확인
//    - 의존성이 너무 많으면 의미 없음

// □ 5. 최적화 후 검증
//    - 실제로 리렌더링이 감소했는가?
//    - 계산 시간이 감소했는가?
//    - 코드 복잡도 증가가 정당화되는가?

// 실제 프로젝트에서의 최적화 패턴
export default function OptimizedPage() {
  // 1단계: 계산 결과 캐싱
  const filteredData = useMemo(() => filter(data), [data]);
  const sortedData = useMemo(() => sort(filteredData), [filteredData]);

  // 2단계: 파생 계산 캐싱
  const stats = useMemo(() => calculate(sortedData), [sortedData]);
  const activeCount = useMemo(() => count(sortedData), [sortedData]);

  // 3단계: 핸들러 안정화
  const handleSelect = useCallback((id) => { ... }, []);
  const handleDelete = useCallback((id) => { ... }, []);

  // 4단계: memo 컴포넌트에 전달
  return (
    <MemoizedTable
      data={sortedData}
      stats={stats}
      onSelect={handleSelect}
      onDelete={handleDelete}
    />
  );
}`
        },
        {
          id: 'project-patterns-summary',
          title: '프로젝트 패턴 요약',
          description: '실제 프로젝트에서 사용된 메모이제이션 패턴',
          language: 'tsx',
          code: `// 프로젝트 전반의 useMemo/useCallback 패턴 요약

// ═══════════════════════════════════════════
// 📊 useMemo 사용 패턴
// ═══════════════════════════════════════════

// 1. 필터 개수 계산 (ConversationsPage, BoardListPage)
const activeFilterCount = useMemo(() => {
  return calculateActiveFilterCount(searchCriteria);
}, [searchCriteria]);

// 2. 메시지 필터링 (ConversationDetailPage)
const filteredMessages = useMemo(() => {
  return data.messages.filter(msg => msg.content?.trim());
}, [data]);

// 3. 검색 매칭 (ConversationDetailPage)
const matchingIndices = useMemo(() => {
  if (!searchTerm) return [];
  return items.filter(item => item.includes(searchTerm));
}, [searchTerm, items]);

// 4. DataGrid 컬럼 정의 (Admin Pages)
const columns = useMemo(() => {
  return createColumns(t, departments);
}, [t, departments]);

// 5. 필터 필드 설정 (Admin Pages)
const filterFields = useMemo(() => {
  return createFilterFields(locale);
}, [locale]);

// ═══════════════════════════════════════════
// 🔗 useCallback 사용 패턴
// ═══════════════════════════════════════════

// 1. 데이터 페칭 함수 (ConversationsPage)
const fetchData = useCallback(async () => {
  const params = new URLSearchParams({ page, limit, search });
  const response = await api.get(\`/data?\${params}\`);
  setData(response.data);
}, [page, limit, search]);

// 2. 상태 토글 (ConversationDetailPage)
const toggleMessage = useCallback((id: number) => {
  setExpanded(prev => {
    const newSet = new Set(prev);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    return newSet;
  });
}, []);

// 3. 네비게이션 함수 (ConversationDetailPage)
const navigateMatch = useCallback((direction: 'prev' | 'next') => {
  setIndex(prev => direction === 'next'
    ? (prev + 1) % total
    : (prev - 1 + total) % total
  );
}, [total]);

// 4. CRUD 핸들러 (useAttachmentTypeManagement)
const handleAdd = useCallback(() => {
  setEditingItem(null);
  setDialogOpen(true);
}, []);

const handleDelete = useCallback((ids: string[]) => {
  setSelectedForDelete(ids);
  setDeleteConfirmOpen(true);
}, []);

// 5. 검색 핸들러 (useAttachmentTypeManagement)
const handleSearchChange = useCallback((field, value) => {
  setSearchCriteria(prev => ({ ...prev, [field]: value }));
}, []);`
        }
      ],
      tips: [
        '✅ "측정 → 최적화 → 검증" 순서를 지키세요. 추측으로 최적화하지 마세요.',
        '✅ memo, useMemo, useCallback은 함께 사용할 때 가장 효과적입니다.',
        '⚠️ 과도한 메모이제이션은 오히려 성능을 저하시킬 수 있습니다.',
        'ℹ️ React 19부터 컴파일러가 자동으로 메모이제이션을 적용할 예정입니다.'
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices Summary',
      titleKo: '베스트 프랙티스 정리',
      content: `
## useMemo/useCallback 체크리스트

### useMemo 체크리스트

- [ ] 계산 비용이 실제로 큰가? (O(n) 이상)
- [ ] 의존성이 자주 변하지 않는가?
- [ ] 결과가 참조 동등성이 중요한 곳에 사용되는가?
- [ ] 최적화 후 성능 개선이 측정되었는가?

### useCallback 체크리스트

- [ ] 함수가 memo 컴포넌트에 전달되는가?
- [ ] 함수가 useEffect/useMemo 의존성인가?
- [ ] 함수가 Custom Hook에서 반환되는가?
- [ ] 의존성 배열이 정확한가?

### 공통 함정

\`\`\`tsx
// 함정 1: 의존성 배열 누락
const callback = useCallback(() => {
  console.log(value);  // value가 의존성에 없음!
}, []);  // ❌ stale closure 발생

// 함정 2: 불안정한 의존성
const callback = useCallback(() => {
  doSomething(options);
}, [{ page, limit }]);  // ❌ 객체 리터럴은 매번 새 참조

// 함정 3: 과도한 메모이제이션
const value = useMemo(() => 1 + 1, []);  // ❌ 오버헤드가 더 큼

// 함정 4: memo 없이 useCallback만 사용
<NonMemoChild onClick={useCallback(() => {}, [])} />  // ❌ 의미 없음
\`\`\`

### 권장 패턴

\`\`\`tsx
// 패턴 1: 계산 체인
const filtered = useMemo(() => filter(items), [items]);
const sorted = useMemo(() => sort(filtered), [filtered]);
const stats = useMemo(() => calculate(sorted), [sorted]);

// 패턴 2: memo + useCallback 조합
const MemoizedChild = memo(Child);
const handleClick = useCallback(() => {}, []);
<MemoizedChild onClick={handleClick} />

// 패턴 3: Custom Hook 반환값 안정화
function useData() {
  const fetch = useCallback(async () => { ... }, []);
  const data = useMemo(() => process(raw), [raw]);
  return { data, fetch };
}

// 패턴 4: Context 최적화
const AuthContext = createContext();
function AuthProvider({ children }) {
  const login = useCallback(async () => { ... }, []);
  const logout = useCallback(async () => { ... }, []);
  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'complete-example',
          title: '종합 예제: 최적화된 목록 컴포넌트',
          description: 'useMemo, useCallback, memo를 함께 사용한 예제',
          language: 'tsx',
          code: `// 종합 예제: 최적화된 목록 컴포넌트

import { useState, useMemo, useCallback, memo } from 'react';

// 타입 정의
interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface ItemCardProps {
  item: Item;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selected: boolean;
}

// ⭐ 개별 아이템 카드 - memo로 감싸서 props 변경 시에만 리렌더링
const ItemCard = memo(function ItemCard({
  item,
  onSelect,
  onDelete,
  selected
}: ItemCardProps) {
  console.log(\`ItemCard rendered: \${item.id}\`);  // 디버깅용

  return (
    <div style={{ border: selected ? '2px solid blue' : '1px solid gray' }}>
      <h3>{item.name}</h3>
      <p>\${item.price}</p>
      <button onClick={() => onSelect(item.id)}>Select</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
});

// 메인 컴포넌트
export default function OptimizedList({ items }: { items: Item[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ⭐ 1단계: 필터링 - search가 변할 때만 재계산
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(term)
    );
  }, [items, search]);

  // ⭐ 2단계: 정렬 - filteredItems나 sortBy가 변할 때만 재계산
  const sortedItems = useMemo(() => {
    console.log('Sorting items...');
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      return a.name.localeCompare(b.name);
    });
  }, [filteredItems, sortBy]);

  // ⭐ 3단계: 통계 계산 - sortedItems가 변할 때만 재계산
  const stats = useMemo(() => {
    console.log('Calculating stats...');
    return {
      total: sortedItems.length,
      avgPrice: sortedItems.reduce((sum, item) => sum + item.price, 0)
        / sortedItems.length || 0
    };
  }, [sortedItems]);

  // ⭐ 이벤트 핸들러 - memo 컴포넌트에 전달되므로 useCallback 필수
  const handleSelect = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    // 실제로는 상위 컴포넌트에 알림
    console.log('Delete:', id);
  }, []);

  return (
    <div>
      {/* 검색 및 정렬 컨트롤 */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="name">Sort by Name</option>
        <option value="price">Sort by Price</option>
      </select>

      {/* 통계 표시 */}
      <p>Total: {stats.total} | Avg Price: \${stats.avgPrice.toFixed(2)}</p>

      {/* 아이템 목록 - 각 아이템은 props가 변할 때만 리렌더링 */}
      <div>
        {sortedItems.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onSelect={handleSelect}  // 안정적인 함수 참조
            onDelete={handleDelete}  // 안정적인 함수 참조
            selected={item.id === selectedId}
          />
        ))}
      </div>
    </div>
  );
}

// 최적화 결과:
// 1. search 변경: filteredItems → sortedItems → stats 재계산 (ItemCard 리렌더링 없음)
// 2. sortBy 변경: sortedItems → stats 재계산 (filteredItems 재사용)
// 3. selectedId 변경: 해당 ItemCard만 리렌더링 (다른 카드는 memo로 스킵)`
        }
      ],
      tips: [
        '✅ memo, useMemo, useCallback은 세트로 사용할 때 효과적입니다.',
        '✅ 의존성 체인을 활용하면 계산을 단계별로 최적화할 수 있습니다.',
        '⚠️ 모든 컴포넌트와 함수에 적용하는 것은 권장하지 않습니다.',
        'ℹ️ React DevTools Profiler로 최적화 전후를 비교하세요.'
      ]
    }
  ],
  references: [
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
      title: 'React 공식 문서 - memo',
      url: 'https://react.dev/reference/react/memo',
      type: 'documentation'
    },
    {
      title: 'Kent C. Dodds - When to useMemo and useCallback',
      url: 'https://kentcdodds.com/blog/usememo-and-usecallback',
      type: 'article'
    }
  ],
  status: 'ready'
};

export default chapter;
