/**
 * Chapter 4: 커스텀 훅 만들기
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'custom-hooks',
  order: 4,
  title: 'Creating Custom Hooks',
  titleKo: '커스텀 훅 만들기',
  description: 'Learn how to extract and reuse logic by creating custom hooks.',
  descriptionKo: '커스텀 훅을 만들어 로직을 추출하고 재사용하는 방법을 학습합니다.',
  estimatedMinutes: 55,
  objectives: [
    'Understand when to extract logic into custom hooks',
    'Create reusable custom hooks with proper encapsulation',
    'Compose multiple hooks together for complex functionality',
    'Design testable and maintainable custom hooks'
  ],
  objectivesKo: [
    '언제 로직을 커스텀 훅으로 추출해야 하는지 이해한다',
    '적절한 캡슐화로 재사용 가능한 커스텀 훅을 만든다',
    '여러 훅을 조합하여 복잡한 기능을 구현한다',
    '테스트와 유지보수가 쉬운 커스텀 훅을 설계한다'
  ],
  sections: [
    {
      id: 'custom-hooks-basics',
      title: 'Custom Hooks Fundamentals',
      titleKo: '커스텀 훅 기본 개념',
      content: `
## 커스텀 훅이란?

**커스텀 훅(Custom Hook)** 은 React의 내장 Hook들(useState, useEffect 등)을 조합하여 만든 **재사용 가능한 함수**입니다. 이름이 반드시 \`use\`로 시작해야 합니다.

### 왜 커스텀 훅이 필요한가?

| 문제 | 해결책 |
|------|--------|
| 컴포넌트에 로직이 많아 복잡해짐 | 로직을 훅으로 분리 |
| 같은 로직이 여러 컴포넌트에서 반복 | 공통 훅으로 추출 |
| 테스트하기 어려운 컴포넌트 | 로직과 UI 분리 |
| 관심사가 뒤섞인 코드 | 관심사별로 훅 분리 |

### 커스텀 훅의 규칙

\`\`\`tsx
// ✅ 올바른 이름: use로 시작
function useCounter() { ... }
function useFetchData() { ... }
function useLocalStorage() { ... }

// ❌ 잘못된 이름: use로 시작하지 않음
function getCounter() { ... }  // 일반 함수로 인식됨
function Counter() { ... }     // 컴포넌트로 인식됨
\`\`\`

### 훅 규칙 (Rules of Hooks)

커스텀 훅 내부에서도 같은 규칙이 적용됩니다:

\`\`\`tsx
function useCustomHook() {
  // ✅ 최상위에서만 Hook 호출
  const [state, setState] = useState(0);

  // ❌ 조건문 안에서 Hook 호출 금지
  if (condition) {
    const [other, setOther] = useState(0);  // 에러!
  }

  // ❌ 반복문 안에서 Hook 호출 금지
  for (let i = 0; i < 3; i++) {
    useEffect(() => {});  // 에러!
  }

  return { state, setState };
}
\`\`\`

### 기본 구조

\`\`\`tsx
import { useState, useEffect, useCallback } from 'react';

// 옵션 인터페이스 정의
interface UseExampleOptions {
  initialValue?: number;
  onError?: (error: Error) => void;
}

// 반환 타입 정의
interface UseExampleReturn {
  value: number;
  loading: boolean;
  error: Error | null;
  increment: () => void;
  reset: () => void;
}

// 커스텀 훅 구현
export function useExample(options: UseExampleOptions = {}): UseExampleReturn {
  const { initialValue = 0, onError } = options;

  // 내부 상태
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 메서드들 - useCallback으로 안정화
  const increment = useCallback(() => {
    setValue(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  // 사이드 이펙트
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // 반환값 - 상태와 메서드를 객체로 반환
  return {
    value,
    loading,
    error,
    increment,
    reset
  };
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'simple-hook-example',
          title: '간단한 커스텀 훅 예제',
          description: 'useAutoHideMessage - 자동 숨김 메시지 관리',
          fileName: 'src/hooks/useAutoHideMessage.ts',
          language: 'tsx',
          code: `// useAutoHideMessage - 자동 숨김 메시지 관리 훅

import { useState, useEffect, useCallback } from 'react';

export interface UseAutoHideMessageOptions {
  duration?: number; // in milliseconds, default 10000 (10 seconds)
}

/**
 * Hook for managing auto-hiding messages (success/error)
 * Automatically hides the message after specified duration
 */
export function useAutoHideMessage(options: UseAutoHideMessageOptions = {}) {
  const { duration = 10000 } = options;

  // 상태 정의
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ⭐ 성공 메시지 자동 숨김
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, duration);
      return () => clearTimeout(timer);  // cleanup
    }
  }, [successMessage, duration]);

  // ⭐ 에러 메시지 자동 숨김
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, duration);
      return () => clearTimeout(timer);  // cleanup
    }
  }, [errorMessage, duration]);

  // ⭐ 안정적인 함수 반환 (useCallback)
  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);  // 성공 시 에러 클리어
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);  // 에러 시 성공 클리어
  }, []);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  // 반환: 상태와 메서드
  return {
    successMessage,
    errorMessage,
    showSuccess,
    showError,
    clearMessages,
    setSuccessMessage,
    setErrorMessage
  };
}

// 사용 예시
function MyComponent() {
  const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage({
    duration: 5000  // 5초 후 자동 숨김
  });

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('저장되었습니다!');
    } catch (err) {
      showError('저장 실패!');
    }
  };

  return (
    <>
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <Button onClick={handleSave}>저장</Button>
    </>
  );
}`
        },
        {
          id: 'localized-name-hook',
          title: '유틸리티 훅 예제',
          description: 'useLocalizedName - 다국어 필드 값 추출',
          fileName: 'src/hooks/useLocalizedName.ts',
          language: 'tsx',
          code: `// useLocalizedName - 객체에서 현재 로케일에 맞는 이름 추출

import { useMemo } from 'react';

export interface UseLocalizedNameOptions {
  object: Record<string, any> | null | undefined;
  locale: string;
  fallback?: string;
  fieldPrefix?: string;  // 기본값: 'name'
}

/**
 * Get localized name from an object with name fields
 *
 * Supports two formats:
 * 1. Object format: { name: { en: 'English', ko: '한국어' } }
 * 2. Flat format: { name_en: 'English', name_ko: '한국어' }
 */
export function useLocalizedName({
  object,
  locale,
  fallback = '',
  fieldPrefix = 'name'
}: UseLocalizedNameOptions): string {
  // ⭐ useMemo로 계산 결과 캐싱
  return useMemo(() => {
    if (!object) return fallback;

    // 1. 객체 형식 체크: { name: { en: '...', ko: '...' } }
    const nameField = object[fieldPrefix];
    if (nameField && typeof nameField === 'object') {
      return nameField[locale] || nameField.en || fallback;
    }

    // 2. 플랫 형식 체크: { name_en: '...', name_ko: '...' }
    const localizedField = \`\${fieldPrefix}_\${locale}\`;
    const localizedValue = object[localizedField];
    if (localizedValue) {
      return localizedValue;
    }

    // 3. 영어 fallback
    const enField = \`\${fieldPrefix}_en\`;
    const enValue = object[enField];
    if (enValue) {
      return enValue;
    }

    return fallback;
  }, [object, locale, fallback, fieldPrefix]);
}

// 사용 예시
function DepartmentDisplay({ department }) {
  const locale = useCurrentLocale();

  // 부서 이름 가져오기
  const name = useLocalizedName({
    object: department,
    locale,
    fallback: department?.code
  });

  // 설명도 다국어로 가져오기
  const description = useLocalizedName({
    object: department,
    locale,
    fieldPrefix: 'description',
    fallback: ''
  });

  return (
    <div>
      <h2>{name}</h2>
      <p>{description}</p>
    </div>
  );
}`
        }
      ],
      tips: [
        '✅ 커스텀 훅 이름은 반드시 use로 시작해야 합니다.',
        '✅ 반환하는 함수는 useCallback으로 안정화하세요.',
        '⚠️ 훅 내부에서 조건문/반복문 안에 다른 훅을 호출하면 안 됩니다.',
        'ℹ️ 인터페이스(options, return type)를 명확히 정의하면 사용이 쉬워집니다.'
      ]
    },
    {
      id: 'when-to-extract',
      title: 'When to Extract Custom Hooks',
      titleKo: '훅 추출 시점과 기준',
      content: `
## 언제 커스텀 훅을 만들어야 하는가?

### 추출 기준 체크리스트

| 기준 | 설명 | 예시 |
|------|------|------|
| **반복** | 같은 로직이 2+ 곳에서 사용됨 | 폼 검증, API 호출, 권한 체크 |
| **복잡도** | 컴포넌트가 50줄+ 또는 상태 5개+ | CRUD 페이지, 대시보드 |
| **관심사 분리** | UI와 비즈니스 로직을 분리하고 싶음 | 데이터 페칭, 상태 관리 |
| **테스트** | 로직만 독립적으로 테스트하고 싶음 | 계산 로직, 유효성 검사 |

### 추출하면 좋은 로직 유형

\`\`\`tsx
// 1. API 데이터 페칭
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ...fetch logic
  return { user, loading };
}

// 2. 폼 상태 관리
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  // ...validation logic
  return { values, errors, handleChange, handleSubmit };
}

// 3. 브라우저 API 래핑
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  });
  // ...sync logic
  return [value, setValue];
}

// 4. 구독 관리
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // ...event listener logic
  return isOnline;
}

// 5. 권한/인증
function usePermission(resource) {
  const { user } = useAuth();
  const canRead = useMemo(() => checkPermission(user, resource, 'read'), [user, resource]);
  // ...
  return { canRead, canWrite, canDelete };
}
\`\`\`

### 추출하지 말아야 하는 경우

\`\`\`tsx
// ❌ 한 곳에서만 사용하는 단순 로직
function useToggle() {
  const [value, setValue] = useState(false);
  const toggle = () => setValue(v => !v);
  return [value, toggle];
}
// → 그냥 컴포넌트에 인라인으로 두는 것이 나음

// ❌ 과도하게 세분화된 훅
function useFirstName() { return useState(''); }
function useLastName() { return useState(''); }
function useEmail() { return useState(''); }
// → useForm 하나로 통합하는 것이 나음

// ❌ UI 로직과 밀접하게 결합된 경우
function useModalAnimation() {
  // 특정 UI 구현에만 종속된 로직
}
// → 컴포넌트에 두거나 UI 라이브러리 사용
\`\`\`

### 점진적 추출 전략

\`\`\`
1단계: 컴포넌트 내에 로직 구현
         ↓
2단계: 로직이 복잡해지면 섹션으로 분리 (주석으로 구분)
         ↓
3단계: 같은 로직이 다른 곳에서도 필요하면 커스텀 훅으로 추출
         ↓
4단계: 훅이 복잡해지면 더 작은 훅들로 분리
\`\`\`
      `,
      codeExamples: [
        {
          id: 'before-extraction',
          title: '추출 전: 복잡한 컴포넌트',
          description: '한 컴포넌트에 모든 로직이 있는 경우',
          language: 'tsx',
          code: `// ❌ 추출 전: 모든 로직이 컴포넌트에 혼재

function BoardListPage() {
  // 검색 상태
  const [searchCriteria, setSearchCriteria] = useState({...});
  const [quickSearch, setQuickSearch] = useState('');

  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);

  // 데이터 상태
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 삭제 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState([]);

  // 메시지 상태
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 데이터 페칭 로직 (30줄+)
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCriteria.title) params.append('title', searchCriteria.title);
      // ... 10줄의 파라미터 구성
      const response = await apiClient.get(\`/post?\${params}\`);
      setPosts(response.data);
      setRowCount(response.pagination.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchCriteria, page, pageSize]);

  // 삭제 로직 (20줄+)
  const handleDelete = useCallback(async () => {
    // ... 삭제 로직
  }, [deleteTargetIds]);

  // 검색 핸들러들 (15줄+)
  const handleSearchChange = useCallback((field, value) => {
    // ...
  }, []);

  // ... 더 많은 핸들러들

  // 효과들
  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [successMessage]);

  // 150줄 이상의 컴포넌트...
  return (
    <div>
      {/* 복잡한 UI */}
    </div>
  );
}`
        },
        {
          id: 'after-extraction',
          title: '추출 후: 깔끔한 컴포넌트',
          description: '커스텀 훅으로 로직을 분리한 경우',
          fileName: 'src/app/[locale]/boards/[boardTypeId]/page.tsx',
          language: 'tsx',
          code: `// ✅ 추출 후: 커스텀 훅으로 로직 분리

import { useBoardManagement } from './hooks/useBoardManagement';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';

export default function BoardListPage() {
  const params = useParams();
  const boardTypeId = params.boardTypeId as string;

  // ⭐ 권한 훅
  const { canWrite, canRead, boardType, loading: permLoading } = useBoardPermissions(boardTypeId);

  // ⭐ 게시판 관리 훅 - 모든 비즈니스 로직 포함
  const {
    posts,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    successMessage,
    errorMessage,
    deleteDialogOpen,
    deleteTargetIds,
    deleteLoading,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    handleAdd,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handlePostClick
  } = useBoardManagement({
    storageKey: \`board-\${boardTypeId}-page-state\`,
    boardTypeId,
    boardType
  });

  // 컴포넌트는 이제 UI 렌더링에만 집중
  return (
    <PageStateWrapper loading={permLoading}>
      <StandardCrudPageLayout
        successMessage={successMessage}
        errorMessage={errorMessage}
        quickSearch={quickSearch}
        onQuickSearchChange={setQuickSearch}
        onQuickSearch={handleQuickSearch}
        // ... UI props만 전달
      >
        <BoardListView
          posts={posts}
          loading={searching}
          onRowClick={handlePostClick}
          onAdd={canWrite ? handleAdd : undefined}
          onDelete={canWrite ? handleDelete : undefined}
        />
      </StandardCrudPageLayout>
    </PageStateWrapper>
  );
}

// 장점:
// 1. 컴포넌트가 40줄 → UI만 담당
// 2. useBoardManagement 300줄 → 비즈니스 로직만 담당
// 3. 다른 게시판에서 재사용 가능
// 4. 로직만 독립적으로 테스트 가능`
        }
      ],
      tips: [
        '✅ "같은 로직이 2번 이상 쓰이면" 추출을 고려하세요.',
        '✅ 컴포넌트가 100줄 이상이면 로직 분리를 고려하세요.',
        '⚠️ 성급한 추상화는 피하세요. 먼저 반복 패턴을 확인하세요.',
        'ℹ️ 점진적으로 추출하세요: 인라인 → 섹션 분리 → 훅 추출'
      ]
    },
    {
      id: 'state-logic-encapsulation',
      title: 'State and Logic Encapsulation',
      titleKo: '상태와 로직 캡슐화',
      content: `
## 커스텀 훅에서의 캡슐화

커스텀 훅의 핵심 가치는 **관련된 상태와 로직을 하나의 단위로 묶는 것**입니다.

### 캡슐화의 원칙

\`\`\`tsx
// ❌ 나쁜 예: 상태만 묶음 (로직 없음)
function useBoardState() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  return { posts, setPosts, loading, setLoading, error, setError };
}
// 사용하는 곳에서 로직을 직접 구현해야 함

// ✅ 좋은 예: 상태 + 로직 + 핸들러 함께 캡슐화
function useBoardManagement(options) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 로직도 함께
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const data = await apiClient.get('/posts');
    setPosts(data);
    setLoading(false);
  }, []);

  // 핸들러도 함께
  const handleDelete = useCallback(async (id) => {
    await apiClient.delete(\`/posts/\${id}\`);
    fetchPosts();  // 내부 로직 호출
  }, [fetchPosts]);

  return { posts, loading, fetchPosts, handleDelete };
}
// 사용하는 곳은 단순히 호출만
\`\`\`

### 인터페이스 설계

\`\`\`tsx
// 옵션: 훅의 동작을 커스터마이즈
interface UseBoardManagementOptions {
  storageKey?: string;        // 선택적, 기본값 제공
  boardTypeId: string;        // 필수
  boardType?: BoardType;      // 선택적, 외부 주입
  initialPageSize?: number;   // 선택적, 기본값 제공
}

// 반환값: 상태 + 핸들러 + 유틸리티
interface UseBoardManagementReturn {
  // 상태 (읽기 전용으로 취급)
  posts: Post[];
  loading: boolean;
  error: string | null;

  // 파생 상태
  isEmpty: boolean;
  totalCount: number;

  // 액션 핸들러 (이벤트 처리용)
  handleAdd: () => void;
  handleDelete: (ids: string[]) => void;
  handleRefresh: () => void;

  // 상태 업데이트 (필요시 노출)
  setSearchCriteria: (criteria: SearchCriteria) => void;
}
\`\`\`

### 내부 상태 숨기기

\`\`\`tsx
function useMessage(options = {}) {
  // 내부 상태 - 직접 노출하지 않을 것
  const messageCache = useRef(new Map());  // 캐시 (노출 안함)
  const [internalLoading, setInternalLoading] = useState(false);

  // 공개 상태
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 내부 함수 - 노출하지 않음
  const fetchFromApi = useCallback(async (code) => {
    // 캐시 확인 등 내부 로직
  }, []);

  // 공개 함수 - 사용자가 필요한 것만
  const showSuccessMessage = useCallback(async (code, params) => {
    setInternalLoading(true);
    const text = await fetchFromApi(code);
    setSuccessMessage(text);
    setInternalLoading(false);
  }, [fetchFromApi]);

  // 반환: 필요한 것만 노출
  return {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage,
    loading: internalLoading,  // 이름 변경해서 노출
    // messageCache는 노출하지 않음
  };
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'page-state-hook',
          title: 'usePageState - 페이지 상태 영속화',
          description: '검색 조건과 페이지네이션을 세션에 저장',
          fileName: 'src/hooks/usePageState.ts',
          language: 'tsx',
          code: `// usePageState - 페이지 상태 관리 및 세션 저장

import { useState, useEffect } from 'react';

export interface PageState<TCriteria = Record<string, any>, TData = any> {
  searchCriteria: TCriteria;
  paginationModel?: { page: number; pageSize: number };
  quickSearch: string;
  data?: TData[];
  rowCount?: number;
}

export interface UsePageStateOptions<TCriteria, TData = any> {
  storageKey: string;
  initialCriteria: TCriteria;
  initialPaginationModel?: { page: number; pageSize: number };
}

/**
 * Hook for managing page state with session storage persistence
 * Automatically saves and restores page state
 */
export function usePageState<TCriteria = Record<string, any>, TData = any>(
  options: UsePageStateOptions<TCriteria, TData>
) {
  const { storageKey, initialCriteria, initialPaginationModel } = options;

  // ⭐ 초기화 시 저장된 상태 로드
  const loadSavedState = (): PageState<TCriteria, TData> | null => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load page state:', error);
      return null;
    }
  };

  const savedState = loadSavedState();

  // 상태들 - 저장된 값이 있으면 복원
  const [searchCriteria, setSearchCriteria] = useState<TCriteria>(
    savedState?.searchCriteria || initialCriteria
  );
  const [paginationModel, setPaginationModel] = useState(
    savedState?.paginationModel || initialPaginationModel || { page: 0, pageSize: 50 }
  );
  const [quickSearch, setQuickSearch] = useState(savedState?.quickSearch || '');
  const [data, setData] = useState<TData[]>(savedState?.data || []);
  const [rowCount, setRowCount] = useState(savedState?.rowCount || 0);

  // ⭐ 상태 변경 시 자동 저장
  useEffect(() => {
    const state: PageState<TCriteria, TData> = {
      searchCriteria,
      paginationModel,
      quickSearch,
      data,
      rowCount
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save page state:', error);
    }
  }, [storageKey, searchCriteria, paginationModel, quickSearch, data, rowCount]);

  // 상태 초기화 함수
  const clearPageState = () => {
    try {
      sessionStorage.removeItem(storageKey);
      setSearchCriteria(initialCriteria);
      setPaginationModel(initialPaginationModel || { page: 0, pageSize: 50 });
      setQuickSearch('');
      setData([]);
      setRowCount(0);
    } catch (error) {
      console.error('Failed to clear page state:', error);
    }
  };

  return {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data,
    setData,
    rowCount,
    setRowCount,
    clearPageState,
    hasSavedState: savedState !== null
  };
}

// 사용 예시: useBoardManagement 내부에서 사용
const {
  searchCriteria,
  paginationModel,
  quickSearch,
  data: posts,
  setData: setPosts,
  // ...
} = usePageState<SearchCriteria, Post>({
  storageKey: 'board-list-state',
  initialCriteria: { title: '', author: '', status: '' },
  initialPaginationModel: { page: 0, pageSize: 20 }
});`
        },
        {
          id: 'message-hook',
          title: 'useMessage - 통합 메시지 관리',
          description: 'API 기반 다국어 메시지 + 캐싱 + 자동 숨김',
          fileName: 'src/hooks/useMessage.ts',
          language: 'tsx',
          code: `// useMessage - 통합 메시지 관리 훅

import { useState, useCallback, useRef } from 'react';
import { api } from '@/lib/axios';
import { useAutoHideMessage } from './useAutoHideMessage';

interface UseMessageOptions {
  duration?: number;
  locale?: string;
}

/**
 * Unified message management hook
 * - API에서 메시지 코드로 메시지 조회
 * - 메시지 캐싱으로 중복 API 호출 방지
 * - 다국어 지원
 * - 플레이스홀더 치환
 * - 자동 숨김
 */
export function useMessage(options: UseMessageOptions = {}) {
  const { duration = 10000, locale: defaultLocale = 'en' } = options;

  // ⭐ 다른 커스텀 훅 조합
  const {
    successMessage,
    errorMessage,
    showSuccess,
    showError,
    clearMessages,
    setSuccessMessage,
    setErrorMessage
  } = useAutoHideMessage({ duration });

  // ⭐ 내부 상태 (useRef로 캐시 - 리렌더링 방지)
  const messageCache = useRef<Map<string, Message>>(new Map());
  const [loading, setLoading] = useState(false);

  // ⭐ 내부 함수 - 캐시 확인 후 API 호출
  const fetchMessage = useCallback(async (code: string): Promise<Message | null> => {
    try {
      // 캐시 먼저 확인
      if (messageCache.current.has(code)) {
        return messageCache.current.get(code)!;
      }

      // API 호출
      const message = await api.get<Message>(\`/message/code/\${code}\`);

      // 캐시에 저장
      messageCache.current.set(code, message);

      return message;
    } catch (error) {
      console.error(\`Failed to fetch message: \${code}\`, error);
      return null;
    }
  }, []);

  // ⭐ 플레이스홀더 치환: {count} → 5
  const replacePlaceholders = useCallback((text: string, params?: Record<string, any>): string => {
    if (!params) return text;

    return Object.entries(params).reduce((result, [key, value]) => {
      const regex = new RegExp(\`\\\\{\${key}\\\\}\`, 'g');
      return result.replace(regex, String(value));
    }, text);
  }, []);

  // ⭐ 공개 함수: 메시지 코드로 성공 메시지 표시
  const showSuccessMessage = useCallback(async (
    code: string,
    params?: Record<string, any>,
    locale: string = defaultLocale
  ): Promise<void> => {
    setLoading(true);
    try {
      const message = await fetchMessage(code);
      if (!message) {
        showSuccess(code);  // 메시지를 못 찾으면 코드 그대로 표시
        return;
      }

      // 다국어 메시지 선택
      let text = message.message[locale] || message.message.en || code;

      // 플레이스홀더 치환
      if (params) {
        text = replacePlaceholders(text, params);
      }

      showSuccess(text);
    } finally {
      setLoading(false);
    }
  }, [defaultLocale, fetchMessage, replacePlaceholders, showSuccess]);

  // 캐시 클리어 (관리자가 메시지 수정 후 필요)
  const clearCache = useCallback(() => {
    messageCache.current.clear();
  }, []);

  return {
    // 메시지 표시
    showSuccessMessage,
    showErrorMessage,
    showSuccess,  // 직접 텍스트 표시용 (레거시 지원)
    showError,

    // 현재 표시된 메시지
    successMessage,
    errorMessage,

    // 상태 관리
    clearMessages,
    setSuccessMessage,
    setErrorMessage,

    // 캐시 관리
    clearCache,

    // 로딩 상태
    loading
  };
}`
        }
      ],
      tips: [
        '✅ 관련된 상태, 로직, 핸들러를 하나의 훅에 묶으세요.',
        '✅ 내부 구현은 숨기고 필요한 인터페이스만 노출하세요.',
        '⚠️ 너무 많은 것을 노출하면 사용자가 잘못 사용할 수 있습니다.',
        'ℹ️ 캐시나 내부 상태는 useRef로 관리하면 리렌더링을 방지합니다.'
      ]
    },
    {
      id: 'hook-composition',
      title: 'Hook Composition and Reuse',
      titleKo: '훅 조합과 재사용',
      content: `
## 훅 조합 패턴

커스텀 훅의 강력한 점은 **다른 훅들을 조합**하여 더 복잡한 기능을 만들 수 있다는 것입니다.

### 조합 패턴

\`\`\`tsx
// 레벨 1: 기본 훅 (React 내장)
useState, useEffect, useCallback, useMemo, useRef

// 레벨 2: 범용 유틸리티 훅
useAutoHideMessage     // 메시지 + 타이머
useLocalStorage        // 로컬 스토리지 + 상태
useDebounce           // 값 + 지연

// 레벨 3: 도메인 훅
usePageState          // 검색 + 페이지네이션 + 저장
usePermissionControl  // 권한 조회 + 검사

// 레벨 4: 기능 훅
useMessage            // useAutoHideMessage + API + 캐싱
useBoardManagement    // usePageState + useMessage + CRUD

// 레벨 5: 페이지 훅
useBoardListPage      // useBoardManagement + useBoardPermissions
\`\`\`

### 조합 예시

\`\`\`tsx
// useMessage는 useAutoHideMessage를 조합
function useMessage(options) {
  // ⭐ 다른 커스텀 훅 사용
  const {
    successMessage,
    errorMessage,
    showSuccess,
    showError,
    clearMessages
  } = useAutoHideMessage({ duration: options.duration });

  // 추가 기능
  const showSuccessMessage = useCallback(async (code) => {
    const text = await fetchMessage(code);
    showSuccess(text);  // useAutoHideMessage의 함수 사용
  }, [showSuccess]);

  return {
    successMessage,  // 그대로 전달
    errorMessage,
    showSuccessMessage,  // 확장된 버전
    clearMessages
  };
}

// useBoardManagement는 여러 훅을 조합
function useBoardManagement(options) {
  // ⭐ 페이지 상태 훅
  const {
    searchCriteria,
    paginationModel,
    data: posts,
    setData: setPosts,
    // ...
  } = usePageState({ storageKey: options.storageKey, ... });

  // ⭐ 메시지 훅
  const {
    successMessage,
    errorMessage,
    showSuccess,
    showError
  } = useMessage({ locale: options.locale });

  // 추가 비즈니스 로직...
  const fetchPosts = useCallback(async () => { ... }, []);
  const handleDelete = useCallback(async () => { ... }, []);

  return {
    // usePageState에서
    posts,
    searchCriteria,
    paginationModel,
    // useMessage에서
    successMessage,
    errorMessage,
    // 자체 로직
    handleDelete,
    handleAdd
  };
}
\`\`\`

### 재사용 패턴

\`\`\`tsx
// 1. 제네릭 훅: 다양한 타입에 적용
function usePageState<TCriteria, TData>(options) {
  // TCriteria와 TData 타입에 따라 동작
}

// 2. 옵션 기반 커스터마이징
function useDataGrid(options: {
  storageKey: string;
  fetchUrl: string;
  defaultPageSize?: number;
  // ...
}) {
  // 옵션에 따라 다르게 동작
}

// 3. 합성 패턴: 여러 기능 조합
function useCrudPage(options) {
  const pageState = usePageState(options);
  const message = useMessage({ locale: options.locale });
  const permission = usePermissionControl(options.programCode);

  return {
    ...pageState,
    ...message,
    ...permission,
    // 추가 로직
  };
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'permission-control-hook',
          title: 'usePermissionControl - 권한 제어',
          description: 'Context 기반 권한을 편리하게 사용',
          fileName: 'src/hooks/usePermissionControl.ts',
          language: 'tsx',
          code: `// usePermissionControl - 프로그램 권한 관리 훅

import { useMemo } from 'react';
import { useProgramPermissions } from '@/contexts/PermissionContext';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

/**
 * usePermissionControl - 프로그램 권한을 편리하게 사용
 *
 * @param programCode - 프로그램 코드 (예: 'PROG-USER-LIST')
 * @returns 권한 체크 함수 및 권한 상태 객체
 */
export function usePermissionControl(programCode: string) {
  // ⭐ Context에서 권한 정보 가져오기
  const permissions = useProgramPermissions(programCode);

  // ⭐ 특정 액션 권한 체크 함수
  const can = useMemo(() => {
    return (action: PermissionAction): boolean => {
      switch (action) {
        case 'view': return permissions.canView;
        case 'create': return permissions.canCreate;
        case 'update': return permissions.canUpdate;
        case 'delete': return permissions.canDelete;
        default: return false;
      }
    };
  }, [permissions]);

  // ⭐ 여러 액션 모두 권한 체크
  const canAll = useMemo(() => {
    return (...actions: PermissionAction[]): boolean => {
      return actions.every((action) => can(action));
    };
  }, [can]);

  // ⭐ 여러 액션 중 하나라도 권한 체크
  const canAny = useMemo(() => {
    return (...actions: PermissionAction[]): boolean => {
      return actions.some((action) => can(action));
    };
  }, [can]);

  return {
    // 함수형 체크
    can,         // can('create')
    canAll,      // canAll('view', 'update')
    canAny,      // canAny('create', 'delete')

    // 개별 권한 상태
    canView: permissions.canView,
    canCreate: permissions.canCreate,
    canUpdate: permissions.canUpdate,
    canDelete: permissions.canDelete,
    hasAccess: permissions.hasAccess,

    loading: permissions.loading,
    permissions: permissions.permissions
  };
}

// 사용 예시
function UserListPage() {
  const { can, canAll, canView, loading } = usePermissionControl('PROG-USER-LIST');

  if (loading) return <Loading />;
  if (!canView) return <NoPermission />;

  return (
    <>
      {can('create') && <Button onClick={handleAdd}>Add User</Button>}
      {canAll('update', 'delete') && <Button>Manage</Button>}
    </>
  );
}

// ⭐ 확장: DataGrid용 권한 설정
export function useDataGridPermissions(programCode: string) {
  const { canCreate, canUpdate, canDelete } = usePermissionControl(programCode);

  return useMemo(() => ({
    showAddButton: canCreate,
    showDeleteButton: canDelete,
    editable: canUpdate,
    checkboxSelection: canDelete
  }), [canCreate, canUpdate, canDelete]);
}`
        },
        {
          id: 'board-permissions-hook',
          title: 'useBoardPermissions - 게시판 권한',
          description: 'API 데이터 페칭 + 권한 계산 조합',
          fileName: 'src/hooks/useBoardPermissions.ts',
          language: 'tsx',
          code: `// useBoardPermissions - 게시판 권한 관리 훅

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useBoardPermissions - 게시판 타입별 권한 관리
 *
 * @param boardTypeIdOrCode - Board type ID or code
 * @returns Board permissions and settings
 */
export function useBoardPermissions(boardTypeIdOrCode?: string) {
  // ⭐ 인증 컨텍스트 사용
  const { user } = useAuth();

  // 상태
  const [boardType, setBoardType] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐ 게시판 타입 정보 페칭
  useEffect(() => {
    if (!boardTypeIdOrCode) {
      setBoardType(null);
      return;
    }

    const fetchBoardType = async () => {
      try {
        setLoading(true);
        setError(null);

        // ID인지 코드인지 판별
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-.../i.test(boardTypeIdOrCode);
        const endpoint = isUUID
          ? \`/board-type/\${boardTypeIdOrCode}\`
          : \`/board-type/code/\${boardTypeIdOrCode}\`;

        const response = await apiClient.get(endpoint);

        if (response.success && response.data) {
          setBoardType(response.data);
        } else {
          setError(response.error || 'Failed to fetch board type');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardType();
  }, [boardTypeIdOrCode]);

  // ⭐ 권한 계산 (useMemo로 최적화)
  const permissions = useMemo(() => {
    if (!boardType || !user) {
      return {
        canRead: false,
        canWrite: false,
        canComment: false,
        canAttach: false,
        canLike: false,
        requiresApproval: false
      };
    }

    const userRole = user.role;

    // 읽기 권한
    const canRead = boardType.readRoles?.includes(userRole) ?? false;

    // 쓰기 권한 (공지게시판은 관리자만)
    let canWrite = boardType.writeRoles?.includes(userRole) ?? false;
    if (boardType.type === 'notice') {
      canWrite = userRole === 'admin';
    }

    // 기능별 권한 (게시판 설정 기반)
    const canComment = canRead && (boardType.settings?.allowComments ?? true);
    const canAttach = canWrite && (boardType.settings?.allowAttachments ?? true);
    const canLike = canRead && (boardType.settings?.allowLikes ?? true);
    const requiresApproval = boardType.settings?.requireApproval ?? false;

    return { canRead, canWrite, canComment, canAttach, canLike, requiresApproval };
  }, [boardType, user]);

  return {
    ...permissions,
    loading,
    error,
    boardType
  };
}

// 사용 예시
function BoardPage({ boardTypeId }) {
  const { canWrite, canRead, canComment, boardType, loading } = useBoardPermissions(boardTypeId);

  if (loading) return <Loading />;

  return (
    <>
      {canRead && <PostList boardType={boardType} />}
      {canWrite && <Button onClick={handleWrite}>Write Post</Button>}
      {canComment && <CommentSection />}
    </>
  );
}`
        },
        {
          id: 'board-management-hook',
          title: 'useBoardManagement - 게시판 관리',
          description: '여러 훅을 조합한 복합 훅',
          fileName: 'src/app/[locale]/boards/[boardTypeId]/hooks/useBoardManagement.ts',
          language: 'tsx',
          code: `// useBoardManagement - 게시판 관리 종합 훅

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';

interface UseBoardManagementOptions {
  storageKey?: string;
  boardTypeId: string;
  boardType?: BoardType;
}

export const useBoardManagement = (options: UseBoardManagementOptions) => {
  const { storageKey = 'board-list-page-state', boardTypeId, boardType } = options;
  const router = useRouter();
  const locale = useCurrentLocale();

  // ⭐ 1. 페이지 상태 훅 조합
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: posts,
    setData: setPosts,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, Post>({
    storageKey,
    initialCriteria: {
      title: '', author_name: '', content: '',
      tags: '', category: '', status: '',
      is_pinned: '', is_secret: ''
    },
    initialPaginationModel: { page: 0, pageSize: 20 }
  });

  // ⭐ 2. 메시지 훅 조합
  const {
    successMessage,
    errorMessage,
    showSuccess,
    showError
  } = useMessage({ locale });

  // ⭐ 3. 자체 상태
  const [searching, setSearching] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ⭐ 4. 비즈니스 로직
  const fetchPosts = useCallback(async (
    page: number = 0,
    pageSize: number = 20,
    useQuickSearch: boolean = false
  ) => {
    if (!boardType?.id) return;

    try {
      setSearching(true);
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        params.append('search', quickSearch);
      } else {
        // 상세 검색 조건 추가
        Object.entries(searchCriteria).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      params.append('page', (page + 1).toString());
      params.append('limit', pageSize.toString());

      const response = await apiClient.get(\`/post/board/\${boardType.id}?\${params}\`);

      if (response.success && response.data?.posts) {
        setPosts(response.data.posts);
        setRowCount(response.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      showError('Failed to load posts');
      setPosts([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [boardType, quickSearch, searchCriteria, setPosts, setRowCount, showError]);

  // ⭐ 5. 이벤트 핸들러들
  const handleDelete = useCallback((ids: (string | number)[]) => {
    if (!ids?.length) return;
    setDeleteTargetIds(ids);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetIds.length) return;

    try {
      setDeleteLoading(true);
      await Promise.all(
        deleteTargetIds.map(id => apiClient.delete(\`/post/\${id}\`))
      );
      showSuccess(\`Successfully deleted \${deleteTargetIds.length} post(s)\`);
      fetchPosts(paginationModel.page, paginationModel.pageSize);
    } catch (error) {
      showError('Failed to delete posts');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeleteTargetIds([]);
    }
  }, [deleteTargetIds, showSuccess, showError, fetchPosts, paginationModel]);

  const handleAdd = useCallback(() => {
    router.push(\`/\${locale}/boards/\${boardTypeId}/write\`);
  }, [router, locale, boardTypeId]);

  // ... 더 많은 핸들러들

  // ⭐ 6. 초기 데이터 로드
  useEffect(() => {
    if (boardType?.id) {
      const useQuickSearch = quickSearch.trim() !== '';
      fetchPosts(paginationModel.page, paginationModel.pageSize, useQuickSearch);
    }
  }, [boardType?.id, quickSearch, paginationModel.page, paginationModel.pageSize]);

  // ⭐ 7. 통합 반환
  return {
    // 상태
    posts, searchCriteria, quickSearch, setQuickSearch,
    paginationModel, rowCount, searching,
    advancedFilterOpen, setAdvancedFilterOpen,
    successMessage, errorMessage,
    deleteDialogOpen, deleteTargetIds, deleteLoading,

    // 핸들러
    handleRefresh: fetchPosts,
    handleSearchChange: (field, value) => setSearchCriteria(prev => ({ ...prev, [field]: value })),
    handleQuickSearch: () => fetchPosts(0, paginationModel.pageSize, true),
    handleAdd,
    handleDelete,
    handleConfirmDelete,
    // ... 더 많은 핸들러들
  };
};`
        }
      ],
      tips: [
        '✅ 기본 훅 → 유틸리티 훅 → 도메인 훅 → 기능 훅 순으로 계층화하세요.',
        '✅ 하위 훅의 반환값을 그대로 전달하거나 확장하세요.',
        '⚠️ 너무 깊은 훅 체인은 디버깅을 어렵게 만들 수 있습니다.',
        'ℹ️ 제네릭과 옵션 패턴으로 훅의 재사용성을 높이세요.'
      ]
    },
    {
      id: 'testable-hooks',
      title: 'Designing Testable Hooks',
      titleKo: '테스트 가능한 훅 설계',
      content: `
## 테스트 가능한 훅 설계 원칙

### 1. 의존성 주입

\`\`\`tsx
// ❌ 테스트하기 어려움: 내부에서 직접 import
function useFetchData() {
  const fetch = async (url) => {
    const response = await apiClient.get(url);  // 하드코딩된 의존성
    return response.data;
  };
  // ...
}

// ✅ 테스트하기 쉬움: 의존성 주입
function useFetchData(options: {
  fetcher?: (url: string) => Promise<any>;
} = {}) {
  const { fetcher = defaultFetcher } = options;

  const fetch = async (url) => {
    const response = await fetcher(url);  // 주입된 의존성
    return response.data;
  };
  // ...
}

// 테스트에서
const mockFetcher = jest.fn().mockResolvedValue({ data: mockData });
const { result } = renderHook(() => useFetchData({ fetcher: mockFetcher }));
\`\`\`

### 2. 순수 로직 분리

\`\`\`tsx
// 순수 함수로 분리 (쉽게 테스트 가능)
export function calculateActiveFilterCount(criteria: SearchCriteria): number {
  return Object.values(criteria).filter(v => v !== '').length;
}

export function normalizePost(apiPost: any): Post {
  return {
    id: apiPost.id,
    title: apiPost.title,
    authorId: apiPost.authorId || apiPost.author_id,
    // ...
  };
}

// 훅에서 순수 함수 사용
function useBoardManagement() {
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const fetchPosts = useCallback(async () => {
    const response = await apiClient.get('/posts');
    const posts = response.data.map(normalizePost);  // 순수 함수 사용
    setPosts(posts);
  }, []);
}

// 테스트: 순수 함수는 독립적으로 테스트
describe('calculateActiveFilterCount', () => {
  it('counts non-empty fields', () => {
    const criteria = { title: 'test', author: '', status: 'active' };
    expect(calculateActiveFilterCount(criteria)).toBe(2);
  });
});
\`\`\`

### 3. 초기 상태 제어

\`\`\`tsx
interface UsePageStateOptions<T> {
  initialCriteria: T;
  initialData?: any[];  // 테스트용 초기 데이터
  // ...
}

function usePageState<T>(options: UsePageStateOptions<T>) {
  const [data, setData] = useState(options.initialData || []);
  // ...
}

// 테스트에서 초기 상태 주입
const { result } = renderHook(() =>
  usePageState({
    initialCriteria: { title: '' },
    initialData: [{ id: 1, title: 'Test' }]
  })
);
expect(result.current.data).toHaveLength(1);
\`\`\`

### 4. 비동기 처리 테스트

\`\`\`tsx
// @testing-library/react-hooks 사용
import { renderHook, act, waitFor } from '@testing-library/react';

test('fetchPosts updates posts state', async () => {
  const mockApi = {
    get: jest.fn().mockResolvedValue({
      data: { posts: [{ id: 1, title: 'Test' }] }
    })
  };

  const { result } = renderHook(() =>
    useBoardManagement({ api: mockApi })
  );

  // 비동기 작업 트리거
  await act(async () => {
    await result.current.fetchPosts();
  });

  // 또는 waitFor 사용
  await waitFor(() => {
    expect(result.current.posts).toHaveLength(1);
  });
});
\`\`\`
      `,
      codeExamples: [
        {
          id: 'testable-hook-design',
          title: '테스트 가능한 훅 설계 예시',
          description: '의존성 주입과 순수 함수 분리',
          language: 'tsx',
          code: `// 테스트 가능한 훅 설계

// 1. 순수 함수로 로직 분리
export function filterPosts(posts: Post[], criteria: SearchCriteria): Post[] {
  return posts.filter(post => {
    if (criteria.title && !post.title.includes(criteria.title)) return false;
    if (criteria.status && post.status !== criteria.status) return false;
    return true;
  });
}

export function sortPosts(posts: Post[], sortBy: string, order: 'asc' | 'desc'): Post[] {
  return [...posts].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });
}

// 2. 의존성 주입 가능한 훅 설계
interface UseBoardManagementOptions {
  boardTypeId: string;
  // 의존성 주입 (테스트용)
  apiClient?: typeof defaultApiClient;
  storage?: Storage;
}

export function useBoardManagement(options: UseBoardManagementOptions) {
  const {
    boardTypeId,
    apiClient = defaultApiClient,  // 기본값 제공
    storage = sessionStorage
  } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});

  // 순수 함수 사용
  const filteredPosts = useMemo(
    () => filterPosts(posts, searchCriteria),
    [posts, searchCriteria]
  );

  // 주입된 apiClient 사용
  const fetchPosts = useCallback(async () => {
    const response = await apiClient.get(\`/board/\${boardTypeId}/posts\`);
    setPosts(response.data);
  }, [apiClient, boardTypeId]);

  // 주입된 storage 사용
  const saveState = useCallback(() => {
    storage.setItem('board-state', JSON.stringify({ searchCriteria }));
  }, [storage, searchCriteria]);

  return {
    posts,
    filteredPosts,
    searchCriteria,
    setSearchCriteria,
    fetchPosts,
    saveState
  };
}

// 3. 테스트 코드
describe('useBoardManagement', () => {
  // Mock 생성
  const mockApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn()
  };

  const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch posts on mount', async () => {
    const mockPosts = [
      { id: '1', title: 'Post 1', status: 'published' },
      { id: '2', title: 'Post 2', status: 'draft' }
    ];

    mockApiClient.get.mockResolvedValue({ data: mockPosts });

    const { result } = renderHook(() =>
      useBoardManagement({
        boardTypeId: 'test-board',
        apiClient: mockApiClient,
        storage: mockStorage
      })
    );

    await act(async () => {
      await result.current.fetchPosts();
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/board/test-board/posts');
    expect(result.current.posts).toEqual(mockPosts);
  });

  it('should filter posts based on criteria', async () => {
    mockApiClient.get.mockResolvedValue({
      data: [
        { id: '1', title: 'React Hooks', status: 'published' },
        { id: '2', title: 'Vue Composition', status: 'draft' }
      ]
    });

    const { result } = renderHook(() =>
      useBoardManagement({
        boardTypeId: 'test',
        apiClient: mockApiClient,
        storage: mockStorage
      })
    );

    await act(async () => {
      await result.current.fetchPosts();
    });

    act(() => {
      result.current.setSearchCriteria({ title: 'React' });
    });

    expect(result.current.filteredPosts).toHaveLength(1);
    expect(result.current.filteredPosts[0].title).toBe('React Hooks');
  });
});

// 4. 순수 함수 테스트 (별도)
describe('filterPosts', () => {
  const posts: Post[] = [
    { id: '1', title: 'React Hooks Guide', status: 'published' },
    { id: '2', title: 'Vue Tutorial', status: 'draft' },
    { id: '3', title: 'React State', status: 'published' }
  ];

  it('filters by title', () => {
    const result = filterPosts(posts, { title: 'React' });
    expect(result).toHaveLength(2);
  });

  it('filters by status', () => {
    const result = filterPosts(posts, { status: 'published' });
    expect(result).toHaveLength(2);
  });

  it('combines filters', () => {
    const result = filterPosts(posts, { title: 'React', status: 'published' });
    expect(result).toHaveLength(2);
  });

  it('returns all when no criteria', () => {
    const result = filterPosts(posts, {});
    expect(result).toHaveLength(3);
  });
});`
        },
        {
          id: 'hook-testing-patterns',
          title: '훅 테스트 패턴',
          description: '다양한 테스트 시나리오',
          language: 'tsx',
          code: `// 훅 테스트 패턴 모음

import { renderHook, act, waitFor } from '@testing-library/react';

// 1. 기본 상태 테스트
describe('useAutoHideMessage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should show success message', () => {
    const { result } = renderHook(() => useAutoHideMessage());

    act(() => {
      result.current.showSuccess('Success!');
    });

    expect(result.current.successMessage).toBe('Success!');
    expect(result.current.errorMessage).toBeNull();
  });

  it('should auto-hide message after duration', () => {
    const { result } = renderHook(() =>
      useAutoHideMessage({ duration: 5000 })
    );

    act(() => {
      result.current.showSuccess('Success!');
    });

    expect(result.current.successMessage).toBe('Success!');

    // 타이머 진행
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.successMessage).toBeNull();
  });
});

// 2. 비동기 테스트
describe('useFetchData', () => {
  it('should handle loading state', async () => {
    const mockFetcher = jest.fn().mockImplementation(
      () => new Promise(resolve =>
        setTimeout(() => resolve({ data: 'test' }), 100)
      )
    );

    const { result } = renderHook(() =>
      useFetchData({ fetcher: mockFetcher })
    );

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.fetch('/api/data');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('test');
  });

  it('should handle errors', async () => {
    const mockFetcher = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useFetchData({ fetcher: mockFetcher })
    );

    await act(async () => {
      await result.current.fetch('/api/data').catch(() => {});
    });

    expect(result.current.error).toBe('Network error');
  });
});

// 3. Context가 필요한 훅 테스트
describe('usePermissionControl', () => {
  const wrapper = ({ children }) => (
    <AuthProvider value={{ user: { role: 'admin' } }}>
      <PermissionProvider>
        {children}
      </PermissionProvider>
    </AuthProvider>
  );

  it('should return correct permissions for admin', () => {
    const { result } = renderHook(
      () => usePermissionControl('PROG-USER-LIST'),
      { wrapper }
    );

    expect(result.current.canView).toBe(true);
    expect(result.current.canCreate).toBe(true);
    expect(result.current.canDelete).toBe(true);
  });
});

// 4. 옵션 변경 테스트
describe('usePageState', () => {
  it('should reset state when storage key changes', () => {
    const { result, rerender } = renderHook(
      ({ storageKey }) => usePageState({
        storageKey,
        initialCriteria: { search: '' }
      }),
      { initialProps: { storageKey: 'key-1' } }
    );

    act(() => {
      result.current.setSearchCriteria({ search: 'test' });
    });

    expect(result.current.searchCriteria.search).toBe('test');

    // storageKey 변경
    rerender({ storageKey: 'key-2' });

    // 새 키로 초기화됨
    expect(result.current.searchCriteria.search).toBe('');
  });
});`
        }
      ],
      tips: [
        '✅ 비즈니스 로직을 순수 함수로 분리하면 테스트가 쉬워집니다.',
        '✅ 의존성(API, Storage 등)은 옵션으로 주입받도록 설계하세요.',
        '⚠️ 타이머 테스트는 jest.useFakeTimers()를 사용하세요.',
        'ℹ️ @testing-library/react의 renderHook을 사용하면 훅을 쉽게 테스트할 수 있습니다.'
      ]
    },
    {
      id: 'best-practices',
      title: 'Custom Hook Best Practices',
      titleKo: '커스텀 훅 베스트 프랙티스',
      content: `
## 커스텀 훅 체크리스트

### 네이밍 규칙

| 패턴 | 예시 | 설명 |
|------|------|------|
| use + 명사 | useUser, usePost | 데이터 페칭 |
| use + 동사 | useFetch, useSubmit | 액션 수행 |
| use + 형용사 | useOnline, useVisible | 상태 구독 |
| use + 명사 + Management | useBoardManagement | CRUD 전체 |
| use + 명사 + Permissions | useBoardPermissions | 권한 관련 |

### 인터페이스 설계

\`\`\`tsx
// 1. 옵션은 객체로, 선택적 속성 사용
interface UseXxxOptions {
  required: string;      // 필수
  optional?: number;     // 선택적 + 기본값 제공
}

// 2. 반환은 객체로, 명확한 이름
interface UseXxxReturn {
  // 상태 (명사)
  data: T[];
  loading: boolean;
  error: Error | null;

  // 파생 상태 (명사/형용사)
  isEmpty: boolean;
  activeCount: number;

  // 액션 (동사)
  handleAdd: () => void;
  handleDelete: (id: string) => void;
  refresh: () => Promise<void>;

  // 상태 설정 (set + 명사)
  setSearchCriteria: (criteria: SearchCriteria) => void;
}
\`\`\`

### 반환값 안정화

\`\`\`tsx
function useExample() {
  // ✅ 함수는 useCallback으로
  const handleClick = useCallback(() => {
    // ...
  }, []);

  // ✅ 객체/배열은 useMemo로
  const derivedValue = useMemo(() => ({
    count: items.length,
    total: items.reduce((a, b) => a + b.price, 0)
  }), [items]);

  // ✅ 반환 객체도 useMemo로 (선택적)
  return useMemo(() => ({
    handleClick,
    derivedValue,
    // ...
  }), [handleClick, derivedValue]);
}
\`\`\`

### 에러 처리

\`\`\`tsx
function useFetch(url: string) {
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      const data = await apiClient.get(url);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;  // 호출자가 처리할 수 있도록
    }
  }, [url]);

  return { fetch, error };
}
\`\`\`

### 문서화

\`\`\`tsx
/**
 * useBoardManagement - 게시판 CRUD 및 상태 관리 훅
 *
 * @param options - 훅 옵션
 * @param options.boardTypeId - 게시판 타입 ID (필수)
 * @param options.storageKey - 상태 저장 키 (기본값: 'board-state')
 *
 * @returns 게시판 상태와 핸들러
 *
 * @example
 * \`\`\`tsx
 * const {
 *   posts,
 *   loading,
 *   handleAdd,
 *   handleDelete
 * } = useBoardManagement({ boardTypeId: 'notice' });
 * \`\`\`
 */
export function useBoardManagement(options: UseBoardManagementOptions) {
  // ...
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'checklist-summary',
          title: '커스텀 훅 체크리스트 요약',
          description: '훅 작성 시 확인할 항목들',
          language: 'tsx',
          code: `// 커스텀 훅 체크리스트

// ✅ 1. 네이밍
// - use로 시작하는가?
// - 역할을 명확히 설명하는가?
export function useBoardManagement() {}  // ✅
export function getBoardData() {}        // ❌

// ✅ 2. 타입 정의
// - Options 인터페이스가 있는가?
// - Return 인터페이스가 있는가?
interface UseBoardManagementOptions { ... }
interface UseBoardManagementReturn { ... }

// ✅ 3. 기본값 제공
const {
  storageKey = 'default-key',   // 기본값 제공
  initialPageSize = 20
} = options;

// ✅ 4. 함수 안정화
const handleClick = useCallback(() => { ... }, [dependencies]);
const derivedValue = useMemo(() => calculate(data), [data]);

// ✅ 5. 에러 처리
const [error, setError] = useState<Error | null>(null);
try {
  await fetchData();
} catch (err) {
  setError(err instanceof Error ? err : new Error('Unknown'));
}

// ✅ 6. Cleanup
useEffect(() => {
  const timer = setTimeout(...);
  return () => clearTimeout(timer);  // cleanup
}, []);

// ✅ 7. 의존성 배열
useCallback(() => {
  doSomething(value);  // value 사용
}, [value]);           // value 포함

// ✅ 8. 문서화
/**
 * @param options.required - 필수 옵션 설명
 * @param options.optional - 선택 옵션 설명 (기본값: 10)
 * @returns 반환값 설명
 * @example 사용 예시
 */

// ✅ 9. 테스트 가능성
// - 의존성 주입 가능?
// - 순수 함수 분리?
export function calculateTotal(items) { ... }  // 순수 함수
export function useTotals({ calculator = calculateTotal }) { ... }

// ✅ 10. 반환값 구조
return {
  // 상태
  data,
  loading,
  error,

  // 파생 상태
  isEmpty: data.length === 0,
  totalCount: data.length,

  // 액션
  handleAdd,
  handleDelete,
  refresh,

  // 설정
  setSearchCriteria
};`
        },
        {
          id: 'project-hooks-summary',
          title: '프로젝트 훅 구조 요약',
          description: '실제 프로젝트의 커스텀 훅 계층',
          language: 'tsx',
          code: `// 프로젝트 커스텀 훅 구조

// ═══════════════════════════════════════════
// 📁 src/hooks/ - 범용 훅
// ═══════════════════════════════════════════

// 유틸리티 훅
useAutoHideMessage.ts    // 메시지 자동 숨김
useLocalizedName.ts      // 다국어 필드 추출
usePageState.ts          // 페이지 상태 영속화

// 권한 훅
usePermissionControl.ts  // 프로그램 권한 체크
useBoardPermissions.ts   // 게시판 권한 체크

// 비즈니스 훅
useMessage.ts            // 통합 메시지 관리
useAttachment.ts         // 첨부파일 관리
useCodeOptions.ts        // 코드 옵션 로드
useMenu.ts               // 메뉴 데이터

// ═══════════════════════════════════════════
// 📁 각 페이지/hooks/ - 페이지별 훅
// ═══════════════════════════════════════════

// Admin 페이지들
admin/users/hooks/useUserManagement.ts
admin/roles/hooks/useRoleManagement.ts
admin/departments/hooks/useDepartmentManagement.ts
admin/board-types/hooks/useBoardTypeManagement.ts
admin/attachment-types/hooks/useAttachmentTypeManagement.ts
admin/programs/hooks/useProgramManagement.ts
admin/menus/hooks/useMenuManagement.ts
admin/help/hooks/useHelpManagement.ts
admin/posts/hooks/usePostManagement.ts
admin/messages/hooks/useMessageManagement.ts
admin/codes/hooks/useCodeManagement.ts

// 게시판 페이지
boards/[boardTypeId]/hooks/useBoardManagement.ts

// ═══════════════════════════════════════════
// 조합 관계
// ═══════════════════════════════════════════

// useAutoHideMessage
//   ↓ 사용
// useMessage
//   ↓ 사용
// useBoardManagement ← usePageState
//   ↓ 사용
// BoardListPage ← useBoardPermissions

// 계층별 책임
// Level 1: 기본 상태/사이드 이펙트 (useState, useEffect)
// Level 2: 범용 유틸리티 (useAutoHideMessage, usePageState)
// Level 3: 도메인 로직 (useMessage, usePermissionControl)
// Level 4: 페이지 로직 (useBoardManagement, useUserManagement)`
        }
      ],
      tips: [
        '✅ 훅 이름은 "use + 역할"로 명확하게 짓습니다.',
        '✅ 옵션 객체에 기본값을 제공하여 사용을 쉽게 합니다.',
        '✅ 반환하는 함수는 모두 useCallback으로 안정화합니다.',
        '⚠️ 훅이 너무 커지면 더 작은 훅으로 분리합니다.',
        'ℹ️ JSDoc으로 문서화하면 IDE에서 자동완성과 설명이 표시됩니다.'
      ]
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - Reusing Logic with Custom Hooks',
      url: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - Rules of Hooks',
      url: 'https://react.dev/reference/rules/rules-of-hooks',
      type: 'documentation'
    },
    {
      title: 'Testing Library - Testing Custom Hooks',
      url: 'https://testing-library.com/docs/react-testing-library/api/#renderhook',
      type: 'documentation'
    },
    {
      title: 'Kent C. Dodds - How to Test Custom React Hooks',
      url: 'https://kentcdodds.com/blog/how-to-test-custom-react-hooks',
      type: 'article'
    }
  ],
  status: 'ready'
};

export default chapter;
