/**
 * Chapter 1: useEffect 심화
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'useeffect-advanced',
  order: 1,
  title: 'Advanced useEffect',
  titleKo: 'useEffect 심화',
  description: 'Master useEffect including dependency arrays, cleanup functions, and data fetching patterns.',
  descriptionKo: '의존성 배열, cleanup 함수, 데이터 페칭 패턴 등 useEffect를 완벽히 마스터합니다.',
  estimatedMinutes: 45,
  objectives: [
    'Understand dependency array deeply',
    'Implement proper cleanup functions',
    'Learn data fetching patterns with useEffect',
    'Handle race conditions and debouncing'
  ],
  objectivesKo: [
    '의존성 배열을 깊이 이해한다',
    '적절한 cleanup 함수를 구현한다',
    'useEffect를 활용한 데이터 페칭 패턴을 학습한다',
    'Race condition과 debouncing을 처리한다'
  ],
  sections: [
    {
      id: 'dependency-array-deep-dive',
      title: 'Dependency Array Deep Dive',
      titleKo: '의존성 배열 완벽 이해',
      content: `
## 의존성 배열의 역할

useEffect의 두 번째 인자인 **의존성 배열(dependency array)** 은 이펙트가 언제 실행될지를 결정합니다.

### 세 가지 패턴

| 패턴 | 코드 | 실행 시점 |
|------|------|----------|
| 의존성 없음 | \`useEffect(() => {})\` | 매 렌더링마다 |
| 빈 배열 | \`useEffect(() => {}, [])\` | 마운트 시 1회만 |
| 의존성 있음 | \`useEffect(() => {}, [a, b])\` | a 또는 b 변경 시 |

### 의존성 배열의 동작 원리

React는 **얕은 비교(shallow comparison)** 로 의존성 변경을 감지합니다:

\`\`\`tsx
// 원시값: 값 자체를 비교
const [count, setCount] = useState(0);
useEffect(() => {
  console.log('count 변경:', count);
}, [count]); // count 값이 변경되면 실행

// 객체/배열: 참조를 비교
const [user, setUser] = useState({ name: 'Kim' });
useEffect(() => {
  console.log('user 변경:', user);
}, [user]); // user 참조가 변경되면 실행
\`\`\`

### 흔한 실수: 객체 의존성

\`\`\`tsx
// ❌ 잘못된 예: 매 렌더링마다 새 객체 생성
function Component() {
  const options = { page: 1, limit: 10 }; // 매번 새 참조

  useEffect(() => {
    fetchData(options);
  }, [options]); // 무한 루프 위험!
}

// ✅ 올바른 예 1: 원시값으로 분리
function Component() {
  const page = 1;
  const limit = 10;

  useEffect(() => {
    fetchData({ page, limit });
  }, [page, limit]); // 원시값만 의존
}

// ✅ 올바른 예 2: useMemo로 메모이제이션
function Component() {
  const options = useMemo(() => ({ page: 1, limit: 10 }), []);

  useEffect(() => {
    fetchData(options);
  }, [options]); // 안정적인 참조
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'conversations-fetch-effect',
          title: 'ConversationsPage 데이터 페칭',
          description: '의존성 배열을 활용한 데이터 페칭 패턴',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// ConversationsPage의 데이터 페칭 패턴
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
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [page, pageSize, debouncedSearch, category, difficulty, branch]);

// fetchConversations가 변경될 때마다 실행
useEffect(() => {
  fetchConversations();
}, [fetchConversations]);`
        },
        {
          id: 'filter-reset-effect',
          title: '필터 변경 시 페이지 리셋',
          description: '여러 의존성을 가진 useEffect',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// 필터가 변경되면 페이지를 1로 리셋
useEffect(() => {
  setPage(1);
}, [debouncedSearch, category, difficulty, branch, pageSize]);

// 설명:
// - 검색어, 카테고리, 난이도, 브랜치, 페이지 크기 중 하나라도 변경되면
// - 페이지를 1로 초기화
// - 사용자가 필터 적용 후 2페이지에 있으면 자동으로 1페이지로 이동`
        }
      ],
      tips: [
        '✅ 의존성 배열에는 이펙트 내에서 사용하는 모든 외부 값을 포함하세요.',
        '⚠️ ESLint의 exhaustive-deps 규칙을 활성화하여 누락된 의존성을 감지하세요.',
        'ℹ️ 객체나 배열을 의존성으로 사용할 때는 useMemo나 useCallback으로 안정화하세요.'
      ]
    },
    {
      id: 'cleanup-functions',
      title: 'Cleanup Functions',
      titleKo: 'Cleanup 함수와 메모리 누수 방지',
      content: `
## Cleanup 함수란?

useEffect에서 **return하는 함수**가 cleanup 함수입니다. 이 함수는:

1. **컴포넌트 언마운트 시** 실행
2. **다음 이펙트 실행 전** 실행 (의존성 변경 시)

### Cleanup이 필요한 경우

| 상황 | 예시 | Cleanup 필요 여부 |
|------|------|------------------|
| 이벤트 리스너 등록 | window.addEventListener | ✅ 필요 |
| 타이머 설정 | setTimeout, setInterval | ✅ 필요 |
| 구독(Subscription) | WebSocket, EventEmitter | ✅ 필요 |
| 데이터 페칭 | API 호출 | ⚠️ 상황에 따라 |
| DOM 참조 저장 | ref 설정 | ❌ 불필요 |

### Cleanup 함수의 실행 순서

\`\`\`tsx
useEffect(() => {
  console.log('1. 이펙트 실행');

  return () => {
    console.log('2. Cleanup 실행');
  };
}, [dependency]);

// 의존성 변경 시 실행 순서:
// 1. 이전 이펙트의 Cleanup 실행 ("2. Cleanup 실행")
// 2. 새로운 이펙트 실행 ("1. 이펙트 실행")
\`\`\`

### 메모리 누수 예방

\`\`\`tsx
// ❌ 메모리 누수: 이벤트 리스너가 계속 누적
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ 올바른 방법: cleanup에서 제거
useEffect(() => {
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
\`\`\`
      `,
      codeExamples: [
        {
          id: 'debounce-cleanup',
          title: 'Debounce Timer Cleanup',
          description: 'ConversationsPage의 debounce 검색 - 타이머 cleanup 패턴',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// Debounced search - 타이머 cleanup 필수!
const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  // 300ms 후에 debouncedSearch 업데이트
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);

  // Cleanup: 이전 타이머 취소
  return () => clearTimeout(timer);
}, [search]);

// 동작 원리:
// 1. 사용자가 'a' 입력 → 타이머 시작 (300ms)
// 2. 100ms 후 'ab' 입력 → 이전 타이머 취소, 새 타이머 시작
// 3. 100ms 후 'abc' 입력 → 이전 타이머 취소, 새 타이머 시작
// 4. 300ms 동안 입력 없음 → 타이머 완료, debouncedSearch = 'abc'`
        },
        {
          id: 'subscription-cleanup',
          title: '구독 해제 패턴',
          description: 'WebSocket이나 EventEmitter 구독 해제',
          language: 'tsx',
          code: `// WebSocket 연결 예시
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/notifications');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setNotifications(prev => [...prev, data]);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  // Cleanup: 연결 종료
  return () => {
    ws.close();
  };
}, []);

// AbortController를 사용한 fetch 취소
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    });

  return () => controller.abort();
}, []);`
        }
      ],
      tips: [
        '✅ 타이머(setTimeout, setInterval)는 항상 cleanup에서 clear하세요.',
        '✅ 이벤트 리스너는 등록한 것과 동일한 함수 참조로 제거해야 합니다.',
        '⚠️ async 함수는 cleanup을 return할 수 없으므로 내부에서 별도로 처리하세요.'
      ]
    },
    {
      id: 'data-fetching-pattern',
      title: 'Data Fetching Pattern',
      titleKo: '데이터 페칭 패턴 (loading, error, data)',
      content: `
## 데이터 페칭의 세 가지 상태

API 호출 시 반드시 관리해야 하는 **세 가지 상태**:

| 상태 | 타입 | 설명 |
|------|------|------|
| loading | boolean | 로딩 중 여부 |
| error | string \\| null | 에러 메시지 |
| data | T \\| null | 응답 데이터 |

### 기본 패턴

\`\`\`tsx
function DataFetchingComponent() {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 조건부 렌더링
  if (loading) return <Skeleton />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  return <UserList users={data} />;
}
\`\`\`

### 상태 전이 다이어그램

\`\`\`
[초기 상태]
loading: true, error: null, data: null
        ↓
    API 호출
        ↓
   ┌────┴────┐
   ↓         ↓
[성공]     [실패]
loading: false   loading: false
error: null      error: "메시지"
data: {...}      data: null
\`\`\`
      `,
      codeExamples: [
        {
          id: 'conversations-data-fetching',
          title: 'ConversationsPage 데이터 페칭',
          description: '실제 프로젝트의 데이터 페칭 패턴',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// 상태 정의
const [conversations, setConversations] = useState<Conversation[]>([]);
const [stats, setStats] = useState<Stats | null>(null);
const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// 데이터 페칭 함수
const fetchConversations = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', pageSize.toString());
    if (debouncedSearch) params.append('search', debouncedSearch);
    // ... 필터 파라미터 추가

    const response = await axiosInstance.get(\`/conversation?\${params.toString()}\`);
    setConversations(response.data.data);
    setTotalPages(response.data.pagination.totalPages);
    setTotal(response.data.pagination.total);
  } catch (err) {
    setError('Failed to load conversations');
    console.error(err);
  } finally {
    setLoading(false);  // 성공/실패 모두 로딩 종료
  }
}, [page, pageSize, debouncedSearch, category, difficulty, branch]);

// JSX에서 상태별 렌더링
{error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
)}

<CardGrid
  items={conversations}
  loading={loading}
  skeletonCount={pageSize}
  // ...
/>`
        },
        {
          id: 'initial-data-fetch',
          title: '초기 데이터 로딩 (병렬 요청)',
          description: 'Promise.all을 사용한 병렬 API 호출',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// 초기 데이터를 병렬로 로딩
useEffect(() => {
  const fetchInitialData = async () => {
    try {
      // Promise.all로 병렬 요청 - 더 빠름!
      const [statsRes, filtersRes] = await Promise.all([
        axiosInstance.get('/conversation/stats'),
        axiosInstance.get('/conversation/filters')
      ]);

      setStats(statsRes.data);
      setFilterOptions(filtersRes.data);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  };

  fetchInitialData();
}, []); // 빈 배열: 마운트 시 1회만 실행

// 순차 요청 vs 병렬 요청 비교
// 순차: stats 완료(200ms) → filters 요청(200ms) = 400ms
// 병렬: stats + filters 동시 = 200ms (더 빠름!)`
        }
      ],
      tips: [
        '✅ loading, error, data 세 가지 상태를 항상 관리하세요.',
        '✅ finally 블록에서 setLoading(false)를 호출하면 성공/실패 모두 처리됩니다.',
        'ℹ️ 독립적인 API 호출은 Promise.all로 병렬 처리하여 성능을 개선하세요.'
      ]
    },
    {
      id: 'debounce-implementation',
      title: 'Debounce Implementation',
      titleKo: 'Debounce 검색 구현',
      content: `
## Debounce란?

**Debounce**는 연속된 이벤트 중 **마지막 이벤트만** 처리하는 기법입니다.

### Debounce vs Throttle

| 기법 | 동작 | 사용 예 |
|------|------|---------|
| Debounce | 마지막 이벤트 후 일정 시간 대기 | 검색 입력, 창 크기 조절 |
| Throttle | 일정 시간 간격으로 실행 | 스크롤 이벤트, 드래그 |

### Debounce 시각화

\`\`\`
입력: a----b----c---------d----
      |    |    |         |
      0ms  100ms 200ms    500ms

300ms Debounce 적용:
실행:              c         d
                   ↑         ↑
              200+300ms  500+300ms
\`\`\`

### useEffect로 Debounce 구현

\`\`\`tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 사용
function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'conversations-debounce',
          title: 'ConversationsPage Debounce 검색',
          description: '실제 프로젝트의 debounce 구현',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// Filter state
const [search, setSearch] = useState('');

// Debounced search - 별도 상태로 관리
const [debouncedSearch, setDebouncedSearch] = useState('');

// Debounce 구현
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

// 데이터 페칭은 debouncedSearch를 의존성으로 사용
const fetchConversations = useCallback(async () => {
  // ...
  if (debouncedSearch) params.append('search', debouncedSearch);
  // ...
}, [page, pageSize, debouncedSearch, category, difficulty, branch]);

// 입력 필드는 search 상태와 연결 (즉시 반영)
<QuickSearchBar
  searchValue={search}
  onSearchChange={setSearch}  // 타이핑 즉시 반영
  // ...
/>`
        },
        {
          id: 'custom-use-debounce',
          title: '재사용 가능한 useDebounce 훅',
          description: '커스텀 훅으로 추출한 debounce',
          language: 'tsx',
          code: `// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay ms 후에 value를 debouncedValue로 설정
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // value가 변경되면 이전 타이머 취소
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 사용 예시
function SearchPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // debouncedSearch가 변경될 때만 API 호출
    fetchSearchResults(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="검색어를 입력하세요"
    />
  );
}`
        }
      ],
      tips: [
        '✅ 검색 입력에는 300ms가 일반적인 debounce 시간입니다.',
        '✅ 사용자에게 즉각적인 피드백을 위해 입력값(search)과 API 호출값(debouncedSearch)을 분리하세요.',
        'ℹ️ Debounce는 API 호출 횟수를 줄여 서버 부하와 비용을 절감합니다.'
      ]
    },
    {
      id: 'race-condition',
      title: 'Race Condition Handling',
      titleKo: 'Race Condition 해결',
      content: `
## Race Condition이란?

**Race Condition**은 여러 비동기 작업의 완료 순서가 보장되지 않아 발생하는 문제입니다.

### 문제 상황

\`\`\`
사용자 입력: "react" → "react native"
API 요청:   요청1 →      요청2 →
응답 순서:         ← 요청2  ← 요청1 (늦게 도착!)

결과: "react native" 검색했는데 "react" 결과가 표시됨!
\`\`\`

### 해결 방법 1: 플래그 사용

\`\`\`tsx
useEffect(() => {
  let isCancelled = false;  // 플래그

  const fetchData = async () => {
    const result = await fetch(\`/api/search?q=\${query}\`);
    const data = await result.json();

    // 아직 유효한 요청인 경우에만 상태 업데이트
    if (!isCancelled) {
      setResults(data);
    }
  };

  fetchData();

  return () => {
    isCancelled = true;  // cleanup에서 플래그 설정
  };
}, [query]);
\`\`\`

### 해결 방법 2: AbortController

\`\`\`tsx
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(\`/api/search?q=\${query}\`, {
        signal: controller.signal  // 요청에 signal 연결
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      // AbortError는 의도된 취소이므로 무시
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    }
  };

  fetchData();

  return () => {
    controller.abort();  // cleanup에서 요청 취소
  };
}, [query]);
\`\`\`

### 해결 방법 3: 최신 요청 ID 비교

\`\`\`tsx
useEffect(() => {
  const requestId = Date.now();  // 또는 UUID
  latestRequestRef.current = requestId;

  const fetchData = async () => {
    const data = await fetchAPI(query);

    // 이 요청이 최신 요청인 경우에만 업데이트
    if (latestRequestRef.current === requestId) {
      setResults(data);
    }
  };

  fetchData();
}, [query]);
\`\`\`
      `,
      codeExamples: [
        {
          id: 'race-condition-flag',
          title: '플래그를 사용한 Race Condition 해결',
          description: '가장 간단하고 널리 사용되는 패턴',
          language: 'tsx',
          code: `// 검색 컴포넌트에서 Race Condition 해결
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 이 이펙트가 아직 유효한지 추적하는 플래그
    let isCancelled = false;

    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(\`/api/search?q=\${query}\`);

        // ⭐ 핵심: cleanup이 실행되지 않았을 때만 상태 업데이트
        if (!isCancelled) {
          setResults(response.data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('검색에 실패했습니다');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    // Cleanup: query가 변경되면 이전 요청 무효화
    return () => {
      isCancelled = true;
    };
  }, [query]);

  return (
    <div>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {results.map(item => (
        <SearchResultItem key={item.id} item={item} />
      ))}
    </div>
  );
}`
        },
        {
          id: 'axios-cancel-token',
          title: 'Axios와 AbortController',
          description: 'Axios에서 요청 취소하기',
          language: 'tsx',
          code: `// Axios + AbortController 조합
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get('/api/data', {
        signal: controller.signal  // Axios도 signal 지원
      });
      setData(response.data);
    } catch (err) {
      // Axios의 취소 에러 확인
      if (axios.isCancel(err)) {
        console.log('Request cancelled:', err.message);
        return;  // 취소된 요청은 에러 처리하지 않음
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  return () => {
    controller.abort();
  };
}, [dependency]);

// 참고: 이전 Axios 버전에서는 CancelToken 사용
// const source = axios.CancelToken.source();
// { cancelToken: source.token }
// source.cancel('Operation cancelled');`
        }
      ],
      tips: [
        '✅ 모든 비동기 데이터 페칭에 race condition 처리를 고려하세요.',
        '✅ AbortController는 실제로 네트워크 요청을 취소하여 리소스를 절약합니다.',
        '⚠️ 플래그 방식은 요청은 완료되지만 결과만 무시합니다. 네트워크 비용은 발생합니다.'
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      titleKo: 'useEffect 베스트 프랙티스',
      content: `
## useEffect 사용 가이드라인

### 1. useEffect가 필요 없는 경우

\`\`\`tsx
// ❌ 불필요한 useEffect
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);

// ✅ 렌더링 중 계산 (파생 상태)
const fullName = firstName + ' ' + lastName;
\`\`\`

### 2. 이벤트 핸들러 vs useEffect

\`\`\`tsx
// ❌ useEffect로 이벤트 처리
useEffect(() => {
  if (submitted) {
    sendAnalytics('form_submit');
    setSubmitted(false);
  }
}, [submitted]);

// ✅ 이벤트 핸들러에서 직접 처리
const handleSubmit = () => {
  submitForm();
  sendAnalytics('form_submit');
};
\`\`\`

### 3. 하나의 useEffect = 하나의 목적

\`\`\`tsx
// ❌ 여러 목적이 섞인 useEffect
useEffect(() => {
  fetchUser();
  logPageView();
  startWebSocket();
}, []);

// ✅ 목적별로 분리
useEffect(() => {
  fetchUser();
}, []);

useEffect(() => {
  logPageView();
}, []);

useEffect(() => {
  const ws = startWebSocket();
  return () => ws.close();
}, []);
\`\`\`

### 4. 의존성 관리 원칙

\`\`\`tsx
// ❌ 불안정한 의존성
useEffect(() => {
  fetchData({ page, limit });  // 매 렌더링마다 새 객체
}, [{ page, limit }]);

// ✅ 안정적인 의존성
useEffect(() => {
  fetchData({ page, limit });
}, [page, limit]);  // 원시값 사용
\`\`\`

### useEffect 체크리스트

- [ ] 렌더링 중 계산 가능한 값인가? → 파생 상태로 처리
- [ ] 이벤트에 대한 반응인가? → 이벤트 핸들러로 처리
- [ ] 외부 시스템과의 동기화인가? → useEffect 사용
- [ ] Cleanup이 필요한가? → return 함수 구현
- [ ] Race condition 가능성이 있는가? → 취소 로직 구현
      `,
      codeExamples: [
        {
          id: 'effect-separation',
          title: '목적별 useEffect 분리',
          description: 'ConversationsPage의 useEffect 분리 패턴',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// 1. 초기 데이터 로딩 (마운트 시 1회)
useEffect(() => {
  const fetchInitialData = async () => {
    try {
      const [statsRes, filtersRes] = await Promise.all([
        axiosInstance.get('/conversation/stats'),
        axiosInstance.get('/conversation/filters')
      ]);
      setStats(statsRes.data);
      setFilterOptions(filtersRes.data);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  };
  fetchInitialData();
}, []);  // 빈 배열: 마운트 시 1회

// 2. Debounce 처리 (검색어 변경 시)
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);
  return () => clearTimeout(timer);
}, [search]);  // search 변경 시

// 3. 데이터 페칭 (필터/페이지 변경 시)
useEffect(() => {
  fetchConversations();
}, [fetchConversations]);  // fetchConversations 변경 시

// 4. 페이지 리셋 (필터 변경 시)
useEffect(() => {
  setPage(1);
}, [debouncedSearch, category, difficulty, branch, pageSize]);

// 각 useEffect가 명확한 하나의 목적만 수행!`
        }
      ],
      tips: [
        '✅ "이 로직이 정말 useEffect가 필요한가?"를 항상 먼저 고민하세요.',
        '✅ useEffect는 React를 외부 시스템과 동기화하기 위한 도구입니다.',
        '⚠️ 불필요한 useEffect는 성능 저하와 버그의 원인이 됩니다.',
        'ℹ️ React 공식 문서의 "You Might Not Need an Effect" 가이드를 참고하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - useEffect',
      url: 'https://react.dev/reference/react/useEffect',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - You Might Not Need an Effect',
      url: 'https://react.dev/learn/you-might-not-need-an-effect',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - Synchronizing with Effects',
      url: 'https://react.dev/learn/synchronizing-with-effects',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
