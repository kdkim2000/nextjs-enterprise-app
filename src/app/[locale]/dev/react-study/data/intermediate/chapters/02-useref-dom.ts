/**
 * Chapter 2: useRef와 DOM 제어
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'useref-dom',
  order: 2,
  title: 'useRef and DOM Control',
  titleKo: 'useRef와 DOM 제어',
  description: 'Learn how to use useRef for DOM manipulation, storing previous values, and managing focus.',
  descriptionKo: 'DOM 조작, 이전 값 저장, 포커스 관리 등 useRef 활용법을 학습합니다.',
  estimatedMinutes: 45,
  objectives: [
    'Access DOM elements directly with useRef',
    'Store previous values without triggering re-renders',
    'Manage focus and scroll positions',
    'Store timer and interval references',
    'Understand forwardRef and useImperativeHandle'
  ],
  objectivesKo: [
    'useRef로 DOM 요소에 직접 접근한다',
    '리렌더링 없이 이전 값을 저장한다',
    '포커스와 스크롤 위치를 관리한다',
    '타이머와 인터벌 참조를 저장한다',
    'forwardRef와 useImperativeHandle을 이해한다'
  ],
  sections: [
    {
      id: 'useref-basics',
      title: 'useRef Fundamentals',
      titleKo: 'useRef 기본 개념',
      content: `
## useRef란?

**useRef**는 React에서 제공하는 Hook으로, **렌더링 사이에 값을 유지**하면서 **값이 변경되어도 리렌더링을 트리거하지 않는** 특별한 참조 객체를 생성합니다.

### useRef vs useState

| 특성 | useState | useRef |
|------|----------|--------|
| 값 변경 시 리렌더링 | ✅ 발생 | ❌ 발생 안함 |
| 렌더링 사이 값 유지 | ✅ 유지 | ✅ 유지 |
| 주 사용 목적 | UI에 표시되는 데이터 | DOM 참조, 내부 값 저장 |
| 값 접근 방법 | \`state\` 직접 접근 | \`ref.current\` |

### useRef의 구조

\`\`\`tsx
// useRef는 { current: T } 형태의 객체를 반환
const ref = useRef<HTMLInputElement>(null);

// ref.current로 값에 접근
console.log(ref.current);

// ref.current에 직접 할당 가능
ref.current = someValue;
\`\`\`

### useRef의 두 가지 주요 용도

1. **DOM 요소 참조**: HTML 요소에 직접 접근
2. **변경 가능한 값 저장**: 리렌더링 없이 값을 저장

### 기본 사용 패턴

\`\`\`tsx
import { useRef, useEffect } from 'react';

function TextInput() {
  // 1. ref 생성 (초기값: null)
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 3. 마운트 후 inputRef.current는 실제 DOM 요소
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    // 2. ref 속성으로 DOM 요소에 연결
    <input ref={inputRef} type="text" placeholder="자동 포커스됨" />
  );
}
\`\`\`

### ref 연결 타이밍

\`\`\`
컴포넌트 생성 → ref = { current: null }
         ↓
  JSX 렌더링 → <input ref={inputRef} />
         ↓
DOM 마운트 완료 → ref = { current: <input> }
         ↓
useEffect 실행 → ref.current로 DOM 접근 가능
\`\`\`

### 주의사항

\`\`\`tsx
// ❌ 잘못된 예: 렌더링 중 ref.current 읽기/쓰기
function BadExample() {
  const ref = useRef(0);
  ref.current += 1;  // 렌더링 중 수정 - 예측 불가능한 동작
  return <div>{ref.current}</div>;  // UI 표시 - useState 사용해야 함
}

// ✅ 올바른 예: 이벤트 핸들러나 useEffect에서 접근
function GoodExample() {
  const ref = useRef(0);

  const handleClick = () => {
    ref.current += 1;  // 이벤트 핸들러에서 수정
    console.log(ref.current);
  };

  return <button onClick={handleClick}>클릭</button>;
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'file-input-ref',
          title: 'RichTextEditor의 파일 입력 참조',
          description: '숨겨진 파일 입력 요소를 프로그래밍 방식으로 클릭하는 예제',
          fileName: 'src/components/common/RichTextEditor/RichTextEditor.tsx',
          language: 'tsx',
          code: `// RichTextEditor에서 파일 업로드를 위한 useRef 사용

const RichTextEditor: React.FC<RichTextEditorProps> = ({ ... }) => {
  // 숨겨진 file input 요소를 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 업로드 트리거 함수
  const triggerFileUpload = useCallback(() => {
    handleImageMenuClose();
    // ⭐ ref.current?.click()으로 숨겨진 input 클릭
    fileInputRef.current?.click();
  }, [handleImageMenuClose]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }

    // 파일 선택 후 input 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor, uploadImage]);

  return (
    <>
      {/* 숨겨진 파일 입력 - 실제로 보이지 않음 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* 버튼 클릭 시 숨겨진 input을 프로그래밍 방식으로 클릭 */}
      <MenuItem onClick={triggerFileUpload}>
        <CloudUpload fontSize="small" />
        <ListItemText>Upload Image</ListItemText>
      </MenuItem>
    </>
  );
};`
        },
        {
          id: 'ref-type-safety',
          title: 'TypeScript와 useRef',
          description: '다양한 타입의 ref 선언 방법',
          language: 'tsx',
          code: `// DOM 요소 참조 - 초기값 null
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);

// 일반 값 저장 - 초기값 필수
const countRef = useRef<number>(0);
const timerRef = useRef<NodeJS.Timeout | null>(null);
const previousValueRef = useRef<string>('');

// 컴포넌트 인스턴스 참조
const childRef = useRef<ChildComponentHandle>(null);

// ⭐ null 초기값의 두 가지 타입
// MutableRefObject<T | null> - ref.current 변경 가능
const mutableRef = useRef<HTMLDivElement | null>(null);

// RefObject<T> - ref.current는 읽기 전용 (JSX ref 속성용)
const readOnlyRef = useRef<HTMLDivElement>(null);`
        }
      ],
      tips: [
        '✅ useRef는 컴포넌트 생명주기 동안 값을 유지합니다.',
        '✅ ref.current 변경은 리렌더링을 트리거하지 않습니다.',
        '⚠️ 렌더링 중에 ref.current를 읽거나 쓰지 마세요.',
        'ℹ️ DOM 참조용 ref는 초기값으로 null을 사용합니다.'
      ]
    },
    {
      id: 'dom-access',
      title: 'DOM Element Access',
      titleKo: 'DOM 요소 직접 접근',
      content: `
## DOM에 직접 접근해야 하는 경우

React는 선언적 방식으로 UI를 다루지만, 때로는 **명령적(imperative)** 방식으로 DOM에 직접 접근해야 합니다:

### DOM 접근이 필요한 상황

| 상황 | 예시 | React만으로 가능? |
|------|------|-------------------|
| 포커스 관리 | input.focus() | ❌ |
| 미디어 제어 | video.play(), video.pause() | ❌ |
| 스크롤 제어 | element.scrollIntoView() | ❌ |
| 크기/위치 측정 | getBoundingClientRect() | ❌ |
| 애니메이션 | Web Animation API | ❌ |
| 외부 라이브러리 통합 | Chart.js, D3.js | ❌ |

### 기본 DOM 접근 패턴

\`\`\`tsx
function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    // DOM API 직접 호출
    videoRef.current?.play();
  };

  const handlePause = () => {
    videoRef.current?.pause();
  };

  return (
    <div>
      <video ref={videoRef} src="/video.mp4" />
      <button onClick={handlePlay}>재생</button>
      <button onClick={handlePause}>일시정지</button>
    </div>
  );
}
\`\`\`

### 요소 크기/위치 측정

\`\`\`tsx
function MeasuredBox() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height
      });
    }
  }, []);

  return (
    <div ref={boxRef} style={{ padding: 20, border: '1px solid' }}>
      크기: {dimensions.width} x {dimensions.height}
    </div>
  );
}
\`\`\`

### 콜백 ref 패턴

요소가 마운트/언마운트될 때 특정 동작을 실행:

\`\`\`tsx
function CallbackRefExample() {
  // 콜백 함수를 ref로 사용
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // 마운트 시
      console.log('Element mounted:', node.offsetHeight);
    }
    // node가 null이면 언마운트됨
  }, []);

  return <div ref={setRef}>Callback Ref Example</div>;
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'search-input-focus',
          title: 'ConversationDetailPage의 검색 포커스',
          description: '검색창 열기 시 자동 포커스 구현',
          fileName: 'src/app/[locale]/dev/conversations/[id]/page.tsx',
          language: 'tsx',
          code: `// ConversationDetailPage에서 검색 입력 포커스 관리

export default function ConversationDetailPage({ params }) {
  // 검색 입력 요소 참조
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색 UI 상태
  const [searchOpen, setSearchOpen] = useState(false);

  // 검색창 열기 핸들러
  const handleSearchOpen = useCallback(() => {
    setSearchOpen(true);
    // ⭐ 100ms 후 검색 입력에 포커스
    // setTimeout이 필요한 이유: 상태 변경 후 DOM이 업데이트되어야 ref에 접근 가능
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  return (
    <>
      {/* 검색 버튼 */}
      <Tooltip title="Search (Ctrl+F)">
        <IconButton size="small" onClick={handleSearchOpen}>
          <Search sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      {/* 검색 입력 UI - searchOpen일 때만 렌더링 */}
      {searchOpen && (
        <ClickAwayListener onClickAway={() => !searchTerm && handleSearchClose()}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Search sx={{ fontSize: 18, color: 'grey.500' }} />
            <input
              ref={searchInputRef}  // ⭐ ref 연결
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.85rem',
                width: 150
              }}
            />
            {/* 검색 결과 네비게이션 UI */}
          </Box>
        </ClickAwayListener>
      )}
    </>
  );
}`
        },
        {
          id: 'scroll-into-view',
          title: 'scrollIntoView로 검색 결과 이동',
          description: '검색 결과를 화면 중앙에 스크롤',
          fileName: 'src/app/[locale]/dev/conversations/[id]/page.tsx',
          language: 'tsx',
          code: `// 검색 결과 네비게이션 - 특정 메시지로 스크롤

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

    // 해당 메시지 확장
    const messageIdx = matchingMessageIndices[newIndex];
    const originalIdx = filteredMessages[messageIdx].originalIdx;
    setExpandedMessages((prev) => new Set([...prev, originalIdx]));

    // ⭐ 100ms 후 해당 요소로 스크롤
    setTimeout(() => {
      const element = document.getElementById(\`message-\${messageIdx}\`);
      if (element && messagesContainerRef.current) {
        // scrollIntoView 옵션:
        // - behavior: 'smooth' - 부드러운 스크롤 애니메이션
        // - block: 'center' - 요소를 화면 중앙에 위치
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  },
  [currentMatchIndex, matchingMessageIndices, filteredMessages]
);

// JSX에서 각 메시지에 id 부여
{filteredMessages.map((msg, idx) => (
  <Box
    id={\`message-\${idx}\`}  // ⭐ 스크롤 대상 id
    key={msg.id}
    sx={{
      mb: 2,
      transition: 'all 0.2s ease',
      ...(isCurrentMatch && {
        transform: 'scale(1.01)',
        '& > div': { boxShadow: '0 0 0 2px #f59e0b' }
      })
    }}
  >
    {/* 메시지 내용 */}
  </Box>
))}`
        },
        {
          id: 'messages-container-ref',
          title: '스크롤 컨테이너 참조',
          description: '스크롤 가능한 영역의 DOM 참조',
          fileName: 'src/app/[locale]/dev/conversations/[id]/page.tsx',
          language: 'tsx',
          code: `// 스크롤 컨테이너 참조

export default function ConversationDetailPage() {
  // 메시지 목록 컨테이너 참조
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 영역 - 고정 */}
      <Box sx={{ flexShrink: 0 }}>
        {/* 헤더 내용 */}
      </Box>

      {/* 메시지 영역 - 스크롤 가능 */}
      <Box
        ref={messagesContainerRef}  // ⭐ 스크롤 컨테이너 참조
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          bgcolor: 'grey.50'
        }}
      >
        {/* 메시지 목록 */}
      </Box>
    </Box>
  );
}

// 사용 예: 맨 아래로 스크롤
const scrollToBottom = useCallback(() => {
  if (messagesContainerRef.current) {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }
}, []);

// 사용 예: 스크롤 위치 확인
const checkScrollPosition = useCallback(() => {
  if (messagesContainerRef.current) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    return isAtBottom;
  }
  return false;
}, []);`
        }
      ],
      tips: [
        '✅ DOM 접근은 마운트 후(useEffect 내부)에 해야 안전합니다.',
        '✅ Optional chaining(?.)을 사용하여 null 체크하세요.',
        '⚠️ 가능하면 React의 선언적 방식을 우선 사용하세요.',
        'ℹ️ setTimeout은 상태 변경 후 DOM 업데이트를 기다릴 때 유용합니다.'
      ]
    },
    {
      id: 'previous-value',
      title: 'Storing Previous Values',
      titleKo: '이전 값(previous value) 저장',
      content: `
## useRef로 이전 값 저장하기

useRef의 또 다른 중요한 용도는 **리렌더링 없이 값을 저장**하는 것입니다. 특히 **이전 렌더링의 값**을 기억할 때 유용합니다.

### useState vs useRef for 값 저장

\`\`\`tsx
// ❌ useState: 매번 리렌더링 발생
const [prevCount, setPrevCount] = useState(0);

useEffect(() => {
  setPrevCount(count);  // 리렌더링 발생!
}, [count]);

// ✅ useRef: 리렌더링 없이 값 저장
const prevCountRef = useRef(0);

useEffect(() => {
  prevCountRef.current = count;  // 리렌더링 없음
}, [count]);
\`\`\`

### usePrevious 커스텀 훅

\`\`\`tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // 현재 렌더링에서는 이전 값 반환
  // (useEffect는 렌더링 후 실행되므로)
  return ref.current;
}

// 사용 예
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>현재: {count}, 이전: {prevCount}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
\`\`\`

### 실행 순서 이해

\`\`\`
1번째 렌더링:
  count = 0
  prevCountRef.current = undefined (아직 useEffect 실행 안됨)
  → 렌더링 완료
  → useEffect 실행: prevCountRef.current = 0

2번째 렌더링 (count 증가):
  count = 1
  prevCountRef.current = 0 (이전 useEffect에서 설정)
  → 렌더링 완료
  → useEffect 실행: prevCountRef.current = 1
\`\`\`

### 변경 감지 패턴

\`\`\`tsx
function DetectChange() {
  const [data, setData] = useState({ name: 'Kim' });
  const prevDataRef = useRef(data);

  useEffect(() => {
    // 이전 값과 현재 값 비교
    if (prevDataRef.current.name !== data.name) {
      console.log('이름이 변경됨:',
        prevDataRef.current.name, '→', data.name);
    }
    // 현재 값을 이전 값으로 저장
    prevDataRef.current = data;
  }, [data]);

  return (
    <input
      value={data.name}
      onChange={e => setData({ name: e.target.value })}
    />
  );
}
\`\`\`

### 렌더링 카운터

\`\`\`tsx
function RenderCounter() {
  const renderCount = useRef(0);

  // 매 렌더링마다 증가 (useEffect 불필요)
  renderCount.current += 1;

  // ⚠️ 주의: UI에 표시하면 안됨 (정확한 값이 아닐 수 있음)
  console.log('렌더링 횟수:', renderCount.current);

  return <div>컴포넌트</div>;
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'debounce-with-ref',
          title: 'Debounce와 이전 값 비교',
          description: 'SearchInput에서 값 변경 추적',
          fileName: 'src/components/common/SearchInput/index.tsx',
          language: 'tsx',
          code: `// SearchInput의 debounce 구현

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 0,
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  // 외부 value와 동기화
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (debounceMs === 0) return;

    const timer = setTimeout(() => {
      // ⭐ 이전 값과 비교하여 변경된 경우에만 호출
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, value]);

  // ...
}

// usePrevious 활용 버전
function EnhancedSearchInput({ value, onChange, debounceMs = 300 }) {
  const prevValue = usePrevious(value);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    // 외부에서 값이 변경된 경우에만 동기화
    if (value !== prevValue && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value, prevValue, internalValue]);

  // debounce 로직...
}`
        },
        {
          id: 'first-render-check',
          title: '첫 렌더링 감지',
          description: 'useRef로 마운트 상태 추적',
          language: 'tsx',
          code: `// 첫 렌더링 여부 확인

function useIsFirstRender(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}

// 사용 예: 첫 렌더링 시 특정 동작 건너뛰기
function SkipFirstEffect() {
  const [value, setValue] = useState('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 첫 렌더링 시에는 실행하지 않음
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 두 번째 렌더링부터 실행
    console.log('Value changed:', value);
    // API 호출 등...
  }, [value]);

  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// useDidUpdate 커스텀 훅
function useDidUpdate(callback: () => void, deps: any[]) {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      callback();
    } else {
      didMount.current = true;
    }
  }, deps);
}`
        },
        {
          id: 'track-changes',
          title: '복잡한 상태 변경 추적',
          description: '여러 상태의 이전 값 추적',
          language: 'tsx',
          code: `// 여러 상태의 이전 값을 객체로 관리

interface FormData {
  name: string;
  email: string;
  phone: string;
}

function FormWithChangeTracking() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });

  // 모든 이전 값을 객체로 저장
  const prevFormRef = useRef<FormData>(form);

  useEffect(() => {
    const changes: string[] = [];

    // 각 필드별 변경 감지
    (Object.keys(form) as (keyof FormData)[]).forEach(key => {
      if (form[key] !== prevFormRef.current[key]) {
        changes.push(\`\${key}: \${prevFormRef.current[key]} → \${form[key]}\`);
      }
    });

    if (changes.length > 0) {
      console.log('변경된 필드:', changes);
      // 변경 로그 저장, 분석 전송 등
    }

    // 현재 값을 이전 값으로 업데이트
    prevFormRef.current = form;
  }, [form]);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form>
      <input value={form.name} onChange={handleChange('name')} />
      <input value={form.email} onChange={handleChange('email')} />
      <input value={form.phone} onChange={handleChange('phone')} />
    </form>
  );
}`
        }
      ],
      tips: [
        '✅ 이전 값이 필요하지만 UI에 표시하지 않는 경우 useRef를 사용하세요.',
        '✅ useEffect는 렌더링 후 실행되므로 ref.current는 "이전" 값입니다.',
        '⚠️ ref.current를 직접 렌더링하면 값이 정확하지 않을 수 있습니다.',
        'ℹ️ usePrevious 같은 커스텀 훅으로 재사용성을 높이세요.'
      ]
    },
    {
      id: 'timer-references',
      title: 'Timer and Interval References',
      titleKo: '타이머/인터벌 참조 저장',
      content: `
## 타이머와 인터벌 관리

setTimeout과 setInterval은 React 외부의 **브라우저 API**입니다. 이들을 안전하게 관리하려면:

1. **타이머 ID를 useRef에 저장**
2. **cleanup 함수에서 정리**

### 왜 useRef가 필요한가?

\`\`\`tsx
// ❌ 잘못된 예: 지역 변수 사용
function BadTimer() {
  let timerId: number;  // 매 렌더링마다 초기화됨!

  useEffect(() => {
    timerId = setInterval(() => console.log('tick'), 1000);
    return () => clearInterval(timerId);  // 정리 가능
  }, []);

  const stop = () => {
    clearInterval(timerId);  // ❌ timerId가 undefined일 수 있음
  };
}

// ✅ 올바른 예: useRef 사용
function GoodTimer() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => console.log('tick'), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}
\`\`\`

### 타이머 관리 패턴

\`\`\`tsx
function TimerControl() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(() => {
    if (intervalRef.current) return;  // 이미 실행 중이면 무시

    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setCount(0);
  }, [stop]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <p>{count}</p>
      <button onClick={start} disabled={isRunning}>시작</button>
      <button onClick={stop} disabled={!isRunning}>정지</button>
      <button onClick={reset}>리셋</button>
    </div>
  );
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'dashboard-footer-timer',
          title: 'DashboardFooter 실시간 시계',
          description: '1초마다 업데이트되는 시계 구현',
          fileName: 'src/components/layout/DashboardFooter/index.tsx',
          language: 'tsx',
          code: `// DashboardFooter의 실시간 시계

export default function DashboardFooter() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 1초마다 시간 업데이트하는 인터벌 설정
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // ⭐ Cleanup: 컴포넌트 언마운트 시 인터벌 정리
    // 이 cleanup이 없으면 메모리 누수 발생!
    return () => clearInterval(timer);
  }, []);  // 빈 배열: 마운트 시 1회만 설정

  return (
    <Chip
      icon={<AccessTimeIcon />}
      label={currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })}
      size="small"
      variant="filled"
      sx={{
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        fontWeight: 600
      }}
    />
  );
}

// ⚠️ 위 코드는 timer를 useEffect 내에서만 사용
// 외부에서 정지/시작이 필요하면 useRef 사용:

function ControlledClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused]);

  const togglePause = () => setIsPaused(!isPaused);

  return (
    <div>
      <span>{currentTime.toLocaleTimeString()}</span>
      <button onClick={togglePause}>
        {isPaused ? '시작' : '일시정지'}
      </button>
    </div>
  );
}`
        },
        {
          id: 'debounce-timer-ref',
          title: 'Debounce 타이머 관리',
          description: 'setTimeout과 useRef 조합',
          fileName: 'src/app/[locale]/dev/conversations/page.tsx',
          language: 'tsx',
          code: `// Debounce 구현 - 타이머 관리

function ConversationsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 방법 1: useEffect 내 cleanup (권장)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    // ⭐ 검색어가 변경되면 이전 타이머 취소
    return () => clearTimeout(timer);
  }, [search]);

  // 방법 2: useRef로 타이머 관리 (외부 제어 필요 시)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);

    // 이전 타이머 취소
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 새 타이머 설정
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      timerRef.current = null;
    }, 300);
  }, []);

  // 즉시 검색 (debounce 무시)
  const searchNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDebouncedSearch(search);
  }, [search]);

  return (
    <input
      value={search}
      onChange={(e) => handleSearchChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') searchNow();
      }}
    />
  );
}`
        },
        {
          id: 'auto-hide-message',
          title: '자동 숨김 메시지',
          description: '일정 시간 후 자동으로 사라지는 알림',
          language: 'tsx',
          code: `// 자동 숨김 메시지 컴포넌트

function AutoHideMessage() {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = useCallback((msg: string, duration = 3000) => {
    // 기존 타이머가 있으면 취소
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 메시지 표시
    setMessage(msg);

    // duration 후 자동 숨김
    timerRef.current = setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, duration);
  }, []);

  // 즉시 숨기기
  const hideMessage = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessage(null);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div>
      {message && (
        <Alert severity="success" onClose={hideMessage}>
          {message}
        </Alert>
      )}
      <Button onClick={() => showMessage('저장되었습니다!')}>
        저장
      </Button>
    </div>
  );
}

// 실제 프로젝트 예시 (UserRoleAssignment)
// setTimeout으로 성공 메시지 자동 숨김
const handleSave = async () => {
  try {
    await saveData();
    setSuccessMessage('저장되었습니다');
    setTimeout(() => setSuccessMessage(null), 3000);  // 3초 후 숨김
  } catch (err) {
    setError('저장 실패');
    setTimeout(() => setError(null), 3000);  // 에러도 3초 후 숨김
  }
};`
        }
      ],
      tips: [
        '✅ 모든 타이머/인터벌은 cleanup에서 정리해야 합니다.',
        '✅ 외부에서 타이머를 제어해야 하면 useRef를 사용하세요.',
        '⚠️ 타이머를 정리하지 않으면 메모리 누수가 발생합니다.',
        'ℹ️ 상태 업데이트가 필요 없는 단순 타이머는 useEffect만으로 충분합니다.'
      ]
    },
    {
      id: 'forward-ref',
      title: 'forwardRef and useImperativeHandle',
      titleKo: 'forwardRef와 useImperativeHandle',
      content: `
## 자식 컴포넌트 DOM에 ref 전달하기

기본적으로 **함수 컴포넌트는 ref를 받을 수 없습니다**. \`forwardRef\`를 사용하면 부모가 자식 컴포넌트의 DOM 요소에 접근할 수 있습니다.

### 왜 필요한가?

\`\`\`tsx
// ❌ 작동하지 않음: ref는 일반 props가 아님
function MyInput(props) {
  return <input ref={props.ref} />;  // ref는 props로 전달되지 않음
}

// 사용
const ref = useRef(null);
<MyInput ref={ref} />  // 경고: ref는 무시됨
\`\`\`

### forwardRef 기본 사용법

\`\`\`tsx
import { forwardRef } from 'react';

// forwardRef로 감싸면 두 번째 인자로 ref 받음
const MyInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});

// 사용
function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();  // 자식의 DOM에 접근
  };

  return (
    <>
      <MyInput ref={inputRef} placeholder="입력하세요" />
      <button onClick={focusInput}>포커스</button>
    </>
  );
}
\`\`\`

### useImperativeHandle: 노출할 메서드 제한

부모에게 **전체 DOM 노드 대신 특정 메서드만** 노출하고 싶을 때:

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

// 부모에게 노출할 인터페이스 정의
interface InputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const CustomInput = forwardRef<InputHandle, InputProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 부모에게 노출할 메서드 정의
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      if (inputRef.current) inputRef.current.value = '';
    },
    getValue: () => {
      return inputRef.current?.value || '';
    }
  }));

  return <input ref={inputRef} {...props} />;
});

// 사용
function Parent() {
  const inputRef = useRef<InputHandle>(null);

  return (
    <>
      <CustomInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>포커스</button>
      <button onClick={() => inputRef.current?.clear()}>지우기</button>
      <button onClick={() => console.log(inputRef.current?.getValue())}>
        값 읽기
      </button>
    </>
  );
}
\`\`\`

### 장점

| 직접 DOM 노출 | useImperativeHandle |
|--------------|---------------------|
| 모든 DOM 메서드 접근 가능 | 필요한 메서드만 노출 |
| 내부 구현 노출됨 | 캡슐화 유지 |
| 타입 추론 어려움 | 명확한 인터페이스 |
| 부모가 과도하게 제어 가능 | 제어 범위 제한 |
      `,
      codeExamples: [
        {
          id: 'forward-ref-basic',
          title: '기본 forwardRef 패턴',
          description: '커스텀 입력 컴포넌트에 ref 전달',
          language: 'tsx',
          code: `// 기본 forwardRef 예제

import { forwardRef, InputHTMLAttributes } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

// 1. 간단한 HTML 요소 래핑
interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="input-wrapper">
        {label && <label>{label}</label>}
        <input
          ref={ref}  // ⭐ ref를 실제 input에 전달
          className={error ? 'error' : ''}
          {...props}
        />
      </div>
    );
  }
);

// displayName 설정 (DevTools에서 보기 좋게)
CustomInput.displayName = 'CustomInput';

// 2. MUI 컴포넌트 래핑
const StyledTextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    return (
      <TextField
        inputRef={ref}  // MUI는 inputRef 사용
        variant="outlined"
        size="small"
        {...props}
      />
    );
  }
);

StyledTextField.displayName = 'StyledTextField';

// 사용 예
function Form() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 첫 번째 빈 필드에 포커스
    if (!emailRef.current?.value) {
      emailRef.current?.focus();
      return;
    }
    if (!passwordRef.current?.value) {
      passwordRef.current?.focus();
      return;
    }
    // 제출...
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomInput ref={emailRef} label="이메일" type="email" />
      <CustomInput ref={passwordRef} label="비밀번호" type="password" />
      <button type="submit">로그인</button>
    </form>
  );
}`
        },
        {
          id: 'imperative-handle',
          title: 'useImperativeHandle 고급 예제',
          description: '폼 컴포넌트에 커스텀 메서드 노출',
          language: 'tsx',
          code: `// useImperativeHandle을 활용한 폼 컴포넌트

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

// 부모에게 노출할 인터페이스
interface FormHandle {
  validate: () => boolean;
  reset: () => void;
  getValues: () => FormData;
  setError: (field: string, message: string) => void;
  focusFirstError: () => void;
}

interface FormData {
  email: string;
  password: string;
  name: string;
}

interface FormErrors {
  [key: string]: string;
}

const AdvancedForm = forwardRef<FormHandle, { onSubmit: (data: FormData) => void }>(
  ({ onSubmit }, ref) => {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    const [errors, setErrors] = useState<FormErrors>({});

    // ⭐ 부모에게 노출할 메서드 정의
    useImperativeHandle(ref, () => ({
      validate: () => {
        const newErrors: FormErrors = {};

        if (!emailRef.current?.value) {
          newErrors.email = '이메일을 입력하세요';
        } else if (!emailRef.current.value.includes('@')) {
          newErrors.email = '올바른 이메일 형식이 아닙니다';
        }

        if (!passwordRef.current?.value) {
          newErrors.password = '비밀번호를 입력하세요';
        } else if (passwordRef.current.value.length < 8) {
          newErrors.password = '비밀번호는 8자 이상이어야 합니다';
        }

        if (!nameRef.current?.value) {
          newErrors.name = '이름을 입력하세요';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },

      reset: () => {
        if (emailRef.current) emailRef.current.value = '';
        if (passwordRef.current) passwordRef.current.value = '';
        if (nameRef.current) nameRef.current.value = '';
        setErrors({});
      },

      getValues: () => ({
        email: emailRef.current?.value || '',
        password: passwordRef.current?.value || '',
        name: nameRef.current?.value || ''
      }),

      setError: (field: string, message: string) => {
        setErrors(prev => ({ ...prev, [field]: message }));
      },

      focusFirstError: () => {
        if (errors.email) emailRef.current?.focus();
        else if (errors.password) passwordRef.current?.focus();
        else if (errors.name) nameRef.current?.focus();
      }
    }), [errors]);

    return (
      <form>
        <div>
          <input ref={emailRef} placeholder="이메일" />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div>
          <input ref={passwordRef} type="password" placeholder="비밀번호" />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <div>
          <input ref={nameRef} placeholder="이름" />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
      </form>
    );
  }
);

// 부모 컴포넌트에서 사용
function ParentComponent() {
  const formRef = useRef<FormHandle>(null);

  const handleSubmit = async () => {
    // 폼 유효성 검사
    if (!formRef.current?.validate()) {
      formRef.current?.focusFirstError();
      return;
    }

    // 값 가져오기
    const values = formRef.current?.getValues();
    console.log('제출할 데이터:', values);

    try {
      await submitToServer(values);
      formRef.current?.reset();  // 성공 시 폼 리셋
    } catch (err) {
      // 서버에서 받은 에러 표시
      formRef.current?.setError('email', '이미 사용 중인 이메일입니다');
    }
  };

  return (
    <div>
      <AdvancedForm ref={formRef} onSubmit={handleSubmit} />
      <button onClick={handleSubmit}>제출</button>
      <button onClick={() => formRef.current?.reset()}>초기화</button>
    </div>
  );
}`
        },
        {
          id: 'editor-imperative-handle',
          title: 'RichTextEditor 스타일 Imperative Handle',
          description: '에디터 컴포넌트의 메서드 노출',
          language: 'tsx',
          code: `// RichTextEditor 스타일의 Imperative Handle

import { forwardRef, useImperativeHandle, useRef } from 'react';

// 에디터에서 부모로 노출할 인터페이스
interface EditorHandle {
  focus: () => void;
  clear: () => void;
  getHTML: () => string;
  getText: () => string;
  insertText: (text: string) => void;
  insertImage: (url: string) => void;
  getCharacterCount: () => number;
  getWordCount: () => number;
  undo: () => void;
  redo: () => void;
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ImperativeEditor = forwardRef<EditorHandle, EditorProps>(
  ({ value, onChange, placeholder }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },

      clear: () => {
        onChange('');
      },

      getHTML: () => {
        return editorRef.current?.innerHTML || '';
      },

      getText: () => {
        return editorRef.current?.textContent || '';
      },

      insertText: (text: string) => {
        // 현재 커서 위치에 텍스트 삽입
        document.execCommand('insertText', false, text);
      },

      insertImage: (url: string) => {
        document.execCommand('insertHTML', false, \`<img src="\${url}" />\`);
      },

      getCharacterCount: () => {
        return (editorRef.current?.textContent || '').length;
      },

      getWordCount: () => {
        const text = editorRef.current?.textContent || '';
        return text.trim() ? text.trim().split(/\\s+/).length : 0;
      },

      undo: () => {
        document.execCommand('undo');
      },

      redo: () => {
        document.execCommand('redo');
      }
    }));

    return (
      <div
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="editor-content"
      />
    );
  }
);

// 부모 컴포넌트에서 사용
function DocumentEditor() {
  const editorRef = useRef<EditorHandle>(null);
  const [content, setContent] = useState('');

  return (
    <div>
      {/* 툴바 */}
      <div className="toolbar">
        <button onClick={() => editorRef.current?.undo()}>
          <UndoIcon /> 실행 취소
        </button>
        <button onClick={() => editorRef.current?.redo()}>
          <RedoIcon /> 다시 실행
        </button>
        <button onClick={() => {
          const url = prompt('이미지 URL을 입력하세요');
          if (url) editorRef.current?.insertImage(url);
        }}>
          <ImageIcon /> 이미지 삽입
        </button>
      </div>

      {/* 에디터 */}
      <ImperativeEditor
        ref={editorRef}
        value={content}
        onChange={setContent}
        placeholder="내용을 입력하세요..."
      />

      {/* 상태 표시줄 */}
      <div className="status-bar">
        글자 수: {editorRef.current?.getCharacterCount() || 0} |
        단어 수: {editorRef.current?.getWordCount() || 0}
      </div>
    </div>
  );
}`
        }
      ],
      tips: [
        '✅ forwardRef는 함수 컴포넌트에 ref를 전달할 때 사용합니다.',
        '✅ useImperativeHandle로 부모에게 필요한 메서드만 노출하세요.',
        '⚠️ 과도한 imperative 패턴은 React의 선언적 특성을 해칩니다.',
        'ℹ️ displayName을 설정하면 DevTools에서 컴포넌트를 쉽게 식별할 수 있습니다.'
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      titleKo: 'useRef 베스트 프랙티스',
      content: `
## useRef 사용 가이드라인

### 1. useRef vs useState 선택 기준

| 상황 | 선택 |
|------|------|
| 값이 UI에 표시됨 | useState |
| 값 변경 시 리렌더링 필요 | useState |
| DOM 요소 참조 | useRef |
| 타이머/인터벌 ID 저장 | useRef |
| 이전 값 저장 (UI 무관) | useRef |
| 렌더링 간 유지할 내부 값 | useRef |

### 2. ref 사용 시 주의사항

\`\`\`tsx
// ❌ 렌더링 중 ref.current 읽기/쓰기
function BadExample() {
  const ref = useRef(0);
  ref.current += 1;  // 렌더링 중 수정
  return <div>{ref.current}</div>;  // 렌더링 중 읽기
}

// ✅ 이벤트 핸들러나 useEffect에서 접근
function GoodExample() {
  const ref = useRef(0);

  useEffect(() => {
    ref.current += 1;  // useEffect 내에서 수정
  });

  const handleClick = () => {
    console.log(ref.current);  // 이벤트 핸들러에서 읽기
  };

  return <button onClick={handleClick}>클릭</button>;
}
\`\`\`

### 3. 조건부 ref 사용

\`\`\`tsx
// ❌ 조건부로 ref 생성 (Hook 규칙 위반)
function BadConditionalRef({ showInput }) {
  if (showInput) {
    const inputRef = useRef(null);  // Hook 규칙 위반!
  }
}

// ✅ 항상 ref 생성, 조건부로 사용
function GoodConditionalRef({ showInput }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  return showInput ? <input ref={inputRef} /> : null;
}
\`\`\`

### 4. ref 콜백으로 동적 목록 처리

\`\`\`tsx
function DynamicRefs() {
  // Map으로 여러 ref 관리
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setRef = (id: string) => (node: HTMLDivElement | null) => {
    if (node) {
      itemRefs.current.set(id, node);
    } else {
      itemRefs.current.delete(id);
    }
  };

  const scrollToItem = (id: string) => {
    itemRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id} ref={setRef(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
\`\`\`

### useRef 체크리스트

- [ ] UI에 표시되는 값인가? → useState 사용
- [ ] 값 변경 시 리렌더링 필요? → useState 사용
- [ ] DOM 접근이 필요? → useRef 사용
- [ ] 외부 API 참조 저장? → useRef 사용
- [ ] cleanup이 필요한 타이머? → useRef + cleanup
- [ ] 자식에게 ref 전달? → forwardRef 사용
      `,
      codeExamples: [
        {
          id: 'ref-summary',
          title: 'useRef 사용 패턴 요약',
          description: '실제 프로젝트의 다양한 useRef 사용 사례',
          language: 'tsx',
          code: `// 프로젝트 전반의 useRef 사용 패턴 요약

// 1. DOM 요소 참조 (RichTextEditor)
const fileInputRef = useRef<HTMLInputElement>(null);
fileInputRef.current?.click();

// 2. 스크롤 컨테이너 참조 (ConversationDetailPage)
const messagesContainerRef = useRef<HTMLDivElement>(null);
messagesContainerRef.current?.scrollTop = 0;

// 3. 포커스 관리 (ConversationDetailPage)
const searchInputRef = useRef<HTMLInputElement>(null);
setTimeout(() => searchInputRef.current?.focus(), 100);

// 4. 타이머 관리 (여러 컴포넌트)
const timerRef = useRef<NodeJS.Timeout | null>(null);
timerRef.current = setTimeout(() => {}, 300);
return () => clearTimeout(timerRef.current!);

// 5. 이전 값 저장 (커스텀 훅)
const prevValueRef = useRef(value);
useEffect(() => { prevValueRef.current = value; }, [value]);

// 6. 렌더링 간 상태 유지 (첫 렌더링 체크)
const isFirstRender = useRef(true);
if (isFirstRender.current) {
  isFirstRender.current = false;
}

// 7. 외부 라이브러리 인스턴스 (차트, 에디터 등)
const chartRef = useRef<Chart | null>(null);
chartRef.current = new Chart(canvas, config);
return () => chartRef.current?.destroy();`
        },
        {
          id: 'common-mistakes',
          title: '흔한 실수와 해결책',
          description: 'useRef 사용 시 자주 발생하는 문제',
          language: 'tsx',
          code: `// 흔한 실수와 해결책

// ❌ 실수 1: 렌더링 중 ref.current 값을 UI에 표시
function Mistake1() {
  const countRef = useRef(0);
  countRef.current += 1;
  return <div>렌더링 횟수: {countRef.current}</div>;  // 업데이트 안됨
}

// ✅ 해결: UI 표시는 useState 사용
function Solution1() {
  const [count, setCount] = useState(0);
  const renderCountRef = useRef(0);  // 디버깅용
  renderCountRef.current += 1;
  console.log('실제 렌더링:', renderCountRef.current);
  return <div>카운트: {count}</div>;
}

// ❌ 실수 2: cleanup 없는 타이머
function Mistake2() {
  const timerRef = useRef<NodeJS.Timeout>();

  const startTimer = () => {
    timerRef.current = setInterval(() => {}, 1000);
    // cleanup 없음 - 메모리 누수!
  };
}

// ✅ 해결: useEffect cleanup에서 정리
function Solution2() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {}, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);
}

// ❌ 실수 3: 마운트 전 ref 접근
function Mistake3() {
  const divRef = useRef<HTMLDivElement>(null);
  console.log(divRef.current?.offsetHeight);  // null!
  return <div ref={divRef}>내용</div>;
}

// ✅ 해결: useEffect에서 접근
function Solution3() {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(divRef.current?.offsetHeight);  // 정상 동작
  }, []);

  return <div ref={divRef}>내용</div>;
}

// ❌ 실수 4: 의존성 배열에 ref.current 포함
function Mistake4() {
  const valueRef = useRef(0);

  useEffect(() => {
    console.log(valueRef.current);
  }, [valueRef.current]);  // ESLint 경고 발생
}

// ✅ 해결: ref 객체 자체는 변하지 않으므로 의존성에 불필요
function Solution4() {
  const valueRef = useRef(0);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    console.log(valueRef.current);
  }, [trigger]);  // 필요한 경우 별도 트리거 사용
}`
        }
      ],
      tips: [
        '✅ ref.current는 "상자 안의 값"처럼 생각하세요 - 상자는 변하지 않지만 내용물은 변합니다.',
        '✅ DOM 접근은 가능하면 React의 선언적 방식을 먼저 고려하세요.',
        '⚠️ ref.current를 의존성 배열에 넣어도 변경 감지가 되지 않습니다.',
        'ℹ️ forwardRef + useImperativeHandle 조합으로 컴포넌트 API를 깔끔하게 설계하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'React 공식 문서 - useRef',
      url: 'https://react.dev/reference/react/useRef',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - forwardRef',
      url: 'https://react.dev/reference/react/forwardRef',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - useImperativeHandle',
      url: 'https://react.dev/reference/react/useImperativeHandle',
      type: 'documentation'
    },
    {
      title: 'React 공식 문서 - Manipulating the DOM with Refs',
      url: 'https://react.dev/learn/manipulating-the-dom-with-refs',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
