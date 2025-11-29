/**
 * Chapter 5: 컴포넌트 테스트 (React Testing Library)
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'component-testing',
  order: 5,
  title: 'Component Testing',
  titleKo: '컴포넌트 테스트 (React Testing Library)',
  description: 'Learn to test React components from a user perspective using React Testing Library.',
  descriptionKo: 'React Testing Library를 사용하여 사용자 관점에서 React 컴포넌트를 테스트하는 방법을 학습합니다.',
  estimatedMinutes: 75,
  objectives: [
    'Understand Testing Library philosophy',
    'Master render and query methods',
    'Simulate user events',
    'Test async components with waitFor and findBy',
    'Mock APIs with MSW'
  ],
  objectivesKo: [
    'Testing Library의 철학을 이해한다',
    '렌더링과 쿼리 메서드를 마스터한다',
    '사용자 이벤트를 시뮬레이션한다',
    'waitFor와 findBy로 비동기 컴포넌트를 테스트한다',
    'MSW로 API를 모킹한다'
  ],
  sections: [
    {
      id: 'testing-library-philosophy',
      title: 'Testing Library Philosophy',
      titleKo: 'Testing Library 철학 (사용자 관점)',
      content: `
## Testing Library의 핵심 철학

> "The more your tests resemble the way your software is used,
> the more confidence they can give you."
>
> 테스트가 소프트웨어 사용 방식과 유사할수록,
> 더 많은 신뢰를 줄 수 있습니다.

### 구현 상세 vs 사용자 행동

| 피해야 할 것 (구현 상세) | 권장하는 것 (사용자 행동) |
|------------------------|-------------------------|
| 상태 값 직접 확인 | 화면에 표시된 텍스트 확인 |
| 메서드 호출 확인 | 버튼 클릭 후 결과 확인 |
| 컴포넌트 인스턴스 접근 | DOM 요소 확인 |
| props 직접 검사 | 렌더링된 내용 확인 |

### 쿼리 우선순위

Testing Library는 **접근성 기반** 쿼리를 권장합니다:

1. **모든 사용자가 접근 가능한 쿼리** (최우선)
   - getByRole
   - getByLabelText
   - getByPlaceholderText
   - getByText
   - getByDisplayValue

2. **시맨틱 쿼리**
   - getByAltText
   - getByTitle

3. **테스트 ID** (최후의 수단)
   - getByTestId

### 왜 getByRole이 최우선인가?

\`\`\`tsx
// ❌ 구현 상세에 의존
const button = container.querySelector('button.submit-btn');

// ❌ 테스트 ID (의미 없음)
const button = screen.getByTestId('submit-button');

// ✅ 접근성 기반 (사용자가 보는 것)
const button = screen.getByRole('button', { name: '제출' });
\`\`\`
      `,
      codeExamples: [
        {
          id: 'query-comparison',
          title: '쿼리 메서드 비교',
          description: '다양한 쿼리 방법',
          language: 'tsx',
          code: `// 다양한 쿼리 메서드 비교

// 1. getByRole - 역할과 접근 가능한 이름으로 찾기
const submitButton = screen.getByRole('button', { name: '제출' });
const emailInput = screen.getByRole('textbox', { name: '이메일' });
const checkbox = screen.getByRole('checkbox', { name: '약관 동의' });
const link = screen.getByRole('link', { name: '자세히 보기' });

// 2. getByLabelText - label로 연결된 입력 찾기
const passwordInput = screen.getByLabelText('비밀번호');
// <label htmlFor="password">비밀번호</label>
// <input id="password" type="password" />

// 3. getByPlaceholderText - placeholder로 찾기
const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

// 4. getByText - 텍스트 내용으로 찾기
const heading = screen.getByText('사용자 관리');
const paragraph = screen.getByText(/환영합니다/);  // 정규식 사용

// 5. getByDisplayValue - 현재 값으로 찾기
const filledInput = screen.getByDisplayValue('현재 입력된 값');

// 6. getByAltText - 이미지 alt 텍스트로 찾기
const userAvatar = screen.getByAltText('사용자 프로필 이미지');

// 7. getByTestId - 테스트 ID로 찾기 (최후의 수단)
const complexWidget = screen.getByTestId('complex-chart-widget');

// 쿼리 변형
// - getBy*    : 찾지 못하면 에러 발생
// - queryBy*  : 찾지 못하면 null 반환 (존재하지 않음 확인용)
// - findBy*   : Promise 반환 (비동기)
// - getAllBy* : 여러 요소 반환

// 예시
const modal = screen.queryByRole('dialog'); // 모달이 없으면 null
if (!modal) {
  // 모달이 닫혀있음
}

const listItems = screen.getAllByRole('listitem');
expect(listItems).toHaveLength(5);`
        },
        {
          id: 'role-examples',
          title: 'ARIA Role 참고',
          description: '자주 사용되는 역할들',
          language: 'tsx',
          code: `// 자주 사용되는 ARIA 역할(Role)

// 버튼
<button>클릭</button>  // button
<Button variant="contained">저장</Button>  // button

// 입력 필드
<input type="text" />  // textbox
<input type="checkbox" />  // checkbox
<input type="radio" />  // radio
<select>...</select>  // combobox
<textarea />  // textbox

// 구조 요소
<heading>제목</h1>  // heading (level 1)
<nav>...</nav>  // navigation
<main>...</main>  // main
<aside>...</aside>  // complementary
<article>...</article>  // article
<dialog>...</dialog>  // dialog

// 목록
<ul><li>...</li></ul>  // list, listitem
<table>...</table>  // table
<tr>...</tr>  // row
<th>...</th>  // columnheader
<td>...</td>  // cell

// 접근 가능한 이름 찾기
screen.getByRole('heading', { name: '사용자 목록' });
screen.getByRole('button', { name: /저장/i });  // 대소문자 무시
screen.getByRole('checkbox', { name: '약관에 동의합니다' });
screen.getByRole('row', { name: /kim@test.com/ });  // 행 내용으로

// MUI 컴포넌트의 역할
<TextField label="이메일" />  // textbox with name "이메일"
<Switch checked />  // switch 또는 checkbox
<Dialog open>...</Dialog>  // dialog
<Menu>...</Menu>  // menu
<MenuItem>...</MenuItem>  // menuitem
<Tab>...</Tab>  // tab
<TabPanel>...</TabPanel>  // tabpanel`
        }
      ],
      tips: [
        '✅ getByRole을 기본으로 사용하고, 불가능할 때 다른 쿼리를 사용하세요.',
        '✅ 정규식(/text/i)으로 대소문자를 무시하고 부분 매칭할 수 있습니다.',
        '⚠️ getByTestId는 최후의 수단입니다. 접근성 있는 마크업을 먼저 고려하세요.',
        'ℹ️ screen.debug()로 현재 DOM 상태를 확인할 수 있습니다.'
      ]
    },
    {
      id: 'rendering-queries',
      title: 'Rendering and Queries',
      titleKo: '렌더링과 쿼리 메서드',
      content: `
## render 함수

\`\`\`tsx
import { render, screen } from '@testing-library/react';

// 기본 렌더링
render(<MyComponent />);

// 래퍼(Provider) 포함 렌더링
render(<MyComponent />, {
  wrapper: ({ children }) => (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  ),
});
\`\`\`

## screen 객체

\`screen\`은 전역적으로 접근 가능한 쿼리 바인딩입니다:

\`\`\`tsx
// container 대신 screen 사용 권장
const { container } = render(<MyComponent />);
container.querySelector('.btn');  // ❌

render(<MyComponent />);
screen.getByRole('button');  // ✅
\`\`\`

## 쿼리 변형 (Query Variants)

| 변형 | 요소 없을 때 | 여러 요소 | 비동기 |
|------|------------|----------|--------|
| getBy | 에러 발생 | 에러 발생 | ❌ |
| queryBy | null | 에러 발생 | ❌ |
| findBy | 에러 발생 | 에러 발생 | ✅ |
| getAllBy | 에러 발생 | 배열 | ❌ |
| queryAllBy | 빈 배열 | 배열 | ❌ |
| findAllBy | 에러 발생 | 배열 | ✅ |
      `,
      codeExamples: [
        {
          id: 'render-with-providers',
          title: '커스텀 렌더 함수',
          description: 'Provider 래핑 자동화',
          language: 'tsx',
          code: `// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const theme = createTheme();

// 기본 래퍼
function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// 커스텀 렌더 함수
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// re-export everything
export * from '@testing-library/react';
export { customRender as render };

// 사용 (테스트 파일)
import { render, screen } from '@/test-utils';

it('should render with providers', () => {
  render(<MyComponent />);  // 모든 Provider 자동 래핑
  expect(screen.getByText('...')).toBeInTheDocument();
});`
        },
        {
          id: 'query-methods-usage',
          title: '쿼리 메서드 실전 사용',
          description: '상황별 적절한 쿼리 선택',
          language: 'tsx',
          code: `import { render, screen, within } from '@testing-library/react';

// 1. 요소가 반드시 존재해야 할 때: getBy
it('should display heading', () => {
  render(<UserList users={users} />);

  expect(screen.getByRole('heading', { name: '사용자 목록' })).toBeInTheDocument();
});

// 2. 요소가 없어야 할 때: queryBy
it('should not show error when valid', () => {
  render(<LoginForm />);

  expect(screen.queryByText('이메일을 입력하세요')).not.toBeInTheDocument();
});

// 3. 여러 요소를 확인할 때: getAllBy
it('should render all users', () => {
  render(<UserList users={users} />);

  const rows = screen.getAllByRole('row');
  expect(rows).toHaveLength(users.length + 1); // +1 for header
});

// 4. 특정 영역 내에서 찾을 때: within
it('should show user info in row', () => {
  render(<UserList users={users} />);

  const firstRow = screen.getAllByRole('row')[1]; // 첫 데이터 행
  const utils = within(firstRow);

  expect(utils.getByText('kim@test.com')).toBeInTheDocument();
  expect(utils.getByRole('button', { name: '수정' })).toBeInTheDocument();
});

// 5. 요소가 나타날 때까지 기다릴 때: findBy
it('should show user after loading', async () => {
  render(<UserProfile userId={1} />);

  // 로딩 중에는 스피너
  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  // 로딩 완료 후 사용자 정보 표시
  expect(await screen.findByText('Kim')).toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});

// 6. 조건부 렌더링 테스트
it('should show admin badge for admin users', () => {
  render(<UserCard user={{ ...user, role: 'admin' }} />);

  expect(screen.getByText('관리자')).toBeInTheDocument();
});

it('should not show admin badge for regular users', () => {
  render(<UserCard user={{ ...user, role: 'user' }} />);

  expect(screen.queryByText('관리자')).not.toBeInTheDocument();
});`
        }
      ],
      tips: [
        '✅ 테스트 파일에서 커스텀 render를 import하여 Provider 래핑을 자동화하세요.',
        '✅ 요소 존재 확인: getBy, 부재 확인: queryBy, 비동기: findBy',
        '⚠️ within()으로 검색 범위를 좁혀 정확한 요소를 찾으세요.',
        'ℹ️ screen.debug()로 현재 렌더링된 DOM을 확인할 수 있습니다.'
      ]
    },
    {
      id: 'user-events',
      title: 'User Event Simulation',
      titleKo: '이벤트 시뮬레이션',
      content: `
## fireEvent vs userEvent

| 특성 | fireEvent | userEvent |
|------|-----------|-----------|
| 구현 | 단순 이벤트 발생 | 실제 사용자 동작 시뮬레이션 |
| 클릭 | click만 발생 | mouseDown → click → mouseUp |
| 타이핑 | 한 번에 입력 | 한 글자씩 입력 |
| 권장도 | 특수 케이스 | 대부분의 경우 |

### userEvent 사용법

\`\`\`tsx
import userEvent from '@testing-library/user-event';

it('should handle click', async () => {
  const user = userEvent.setup();

  render(<Button onClick={handleClick}>클릭</Button>);

  await user.click(screen.getByRole('button', { name: '클릭' }));

  expect(handleClick).toHaveBeenCalled();
});
\`\`\`

### 주요 userEvent 메서드

\`\`\`tsx
const user = userEvent.setup();

// 클릭
await user.click(element);
await user.dblClick(element);
await user.tripleClick(element);  // 텍스트 전체 선택

// 타이핑
await user.type(input, 'Hello');
await user.clear(input);
await user.type(input, 'New{enter}');  // 특수키

// 키보드
await user.keyboard('{Enter}');
await user.keyboard('{Shift>}A{/Shift}');  // Shift+A

// 선택
await user.selectOptions(select, ['option1']);
await user.deselectOptions(select, ['option1']);

// 기타
await user.hover(element);
await user.unhover(element);
await user.tab();  // Tab 키
await user.paste('pasted text');
\`\`\`
      `,
      codeExamples: [
        {
          id: 'form-interaction-test',
          title: '폼 상호작용 테스트',
          description: '사용자 입력 및 제출',
          language: 'tsx',
          code: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should submit form with user inputs', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    // 이메일 입력
    await user.type(
      screen.getByLabelText('이메일'),
      'test@example.com'
    );

    // 비밀번호 입력
    await user.type(
      screen.getByLabelText('비밀번호'),
      'password123'
    );

    // 약관 동의 체크
    await user.click(
      screen.getByRole('checkbox', { name: /약관에 동의/ })
    );

    // 제출 버튼 클릭
    await user.click(
      screen.getByRole('button', { name: '로그인' })
    );

    // 검증
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      agreeToTerms: true,
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    // 빈 상태로 제출
    await user.click(screen.getByRole('button', { name: '로그인' }));

    // 에러 메시지 확인
    expect(screen.getByText('이메일을 입력하세요')).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 입력하세요')).toBeInTheDocument();
  });

  it('should clear error on input', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    // 에러 발생
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(screen.getByText('이메일을 입력하세요')).toBeInTheDocument();

    // 입력하면 에러 사라짐
    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    expect(screen.queryByText('이메일을 입력하세요')).not.toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    const passwordInput = screen.getByLabelText('비밀번호');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // 비밀번호 보기 버튼 클릭
    await user.click(screen.getByRole('button', { name: /비밀번호 보기/ }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    // 다시 숨기기
    await user.click(screen.getByRole('button', { name: /비밀번호 숨기기/ }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});`
        },
        {
          id: 'select-interaction',
          title: 'Select/Dropdown 테스트',
          description: '드롭다운 선택 테스트',
          language: 'tsx',
          code: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserFilter } from './UserFilter';

describe('UserFilter', () => {
  it('should filter by role', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();

    render(<UserFilter onFilter={onFilter} />);

    // HTML select
    const roleSelect = screen.getByLabelText('역할');
    await user.selectOptions(roleSelect, 'admin');

    expect(onFilter).toHaveBeenCalledWith({ role: 'admin' });
  });

  it('should work with MUI Select', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();

    render(<UserFilter onFilter={onFilter} />);

    // MUI Select는 버튼으로 동작
    await user.click(screen.getByLabelText('상태'));

    // 옵션 선택 (메뉴가 열림)
    await user.click(screen.getByRole('option', { name: '활성' }));

    expect(onFilter).toHaveBeenCalledWith({ status: 'active' });
  });

  it('should allow multiple selection', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();

    render(<UserFilter onFilter={onFilter} multiple />);

    // 여러 옵션 선택
    await user.selectOptions(
      screen.getByLabelText('부서'),
      ['dev', 'design', 'marketing']
    );

    expect(onFilter).toHaveBeenCalledWith({
      departments: ['dev', 'design', 'marketing'],
    });
  });
});

describe('Autocomplete', () => {
  it('should search and select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UserAutocomplete onChange={onChange} />);

    const input = screen.getByLabelText('사용자 검색');

    // 검색어 입력
    await user.type(input, 'kim');

    // 검색 결과에서 선택
    const option = await screen.findByRole('option', { name: /Kim/ });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      name: expect.stringContaining('Kim'),
    }));
  });
});`
        },
        {
          id: 'keyboard-navigation',
          title: '키보드 내비게이션 테스트',
          description: '접근성 키보드 테스트',
          language: 'tsx',
          code: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGrid } from './DataGrid';

describe('DataGrid Keyboard Navigation', () => {
  it('should navigate with arrow keys', async () => {
    const user = userEvent.setup();

    render(<DataGrid rows={mockRows} columns={columns} />);

    // 첫 번째 셀 포커스
    const firstCell = screen.getAllByRole('cell')[0];
    await user.click(firstCell);

    // 오른쪽 화살표
    await user.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('cell')[1]).toHaveFocus();

    // 아래 화살표
    await user.keyboard('{ArrowDown}');
    // 다음 행 같은 열로 이동
  });

  it('should select row with Space', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    render(
      <DataGrid
        rows={mockRows}
        columns={columns}
        selectable
        onSelectionChange={onSelectionChange}
      />
    );

    // Tab으로 체크박스 이동
    await user.tab();
    await user.tab(); // 첫 번째 행 체크박스

    // Space로 선택
    await user.keyboard(' ');

    expect(onSelectionChange).toHaveBeenCalledWith([mockRows[0].id]);
  });

  it('should open modal with Enter', async () => {
    const user = userEvent.setup();

    render(<DataGrid rows={mockRows} columns={columns} />);

    // 행 선택 후 Enter
    const firstRow = screen.getAllByRole('row')[1];
    await user.click(firstRow);
    await user.keyboard('{Enter}');

    // 상세 모달 열림
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should support Tab navigation', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <input aria-label="이름" />
        <input aria-label="이메일" />
        <button>제출</button>
      </form>
    );

    await user.tab();
    expect(screen.getByLabelText('이름')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('이메일')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });
});`
        }
      ],
      tips: [
        '✅ userEvent.setup()을 테스트 시작 시 호출하고 재사용하세요.',
        '✅ userEvent는 async/await와 함께 사용해야 합니다.',
        '⚠️ MUI 컴포넌트는 실제 DOM 구조가 다를 수 있어 확인이 필요합니다.',
        'ℹ️ 키보드 내비게이션 테스트는 접근성을 보장합니다.'
      ]
    },
    {
      id: 'async-testing',
      title: 'Async Testing',
      titleKo: '비동기 테스트 (waitFor, findBy)',
      content: `
## 비동기 테스트가 필요한 경우

1. API 호출 후 데이터 표시
2. 로딩 상태 → 완료 상태 전환
3. 디바운스된 검색
4. 모달/토스트 애니메이션

### findBy vs waitFor

| 메서드 | 용도 |
|--------|------|
| findBy | 요소가 나타날 때까지 대기 |
| waitFor | 조건이 충족될 때까지 대기 |

### findBy 사용

\`\`\`tsx
// 요소가 나타날 때까지 대기 (기본 1000ms)
const userName = await screen.findByText('Kim');

// 타임아웃 설정
const slowElement = await screen.findByText('Loaded', {
  timeout: 5000,
});
\`\`\`

### waitFor 사용

\`\`\`tsx
// 조건이 충족될 때까지 대기
await waitFor(() => {
  expect(screen.getByText('완료')).toBeInTheDocument();
});

// 여러 조건 검사
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
\`\`\`
      `,
      codeExamples: [
        {
          id: 'data-loading-test',
          title: '데이터 로딩 테스트',
          description: '로딩 → 데이터 표시 흐름',
          language: 'tsx',
          code: `import { render, screen, waitFor } from '@testing-library/react';
import { UserList } from './UserList';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('UserList', () => {
  it('should show loading then data', async () => {
    render(<UserList />);

    // 1. 로딩 상태 확인
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // 2. 데이터 로딩 완료 대기
    expect(await screen.findByText('Kim')).toBeInTheDocument();

    // 3. 로딩 인디케이터 사라짐
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    // 4. 모든 데이터 표시
    expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 users
  });

  it('should show error on API failure', async () => {
    // MSW로 에러 응답 설정
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server Error' }));
      })
    );

    render(<UserList />);

    // 에러 메시지 표시 대기
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '데이터를 불러올 수 없습니다'
    );

    // 재시도 버튼 표시
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('should show empty state when no data', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.json({ data: [], total: 0 }));
      })
    );

    render(<UserList />);

    expect(await screen.findByText('등록된 사용자가 없습니다')).toBeInTheDocument();
  });
});`
        },
        {
          id: 'debounced-search-test',
          title: '디바운스 검색 테스트',
          description: '타이머와 비동기 조합',
          language: 'tsx',
          code: `import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SearchableList } from './SearchableList';

describe('SearchableList', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce search input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();

    render(<SearchableList onSearch={onSearch} />);

    // 빠르게 타이핑
    const searchInput = screen.getByPlaceholderText('검색');
    await user.type(searchInput, 'test');

    // 아직 호출 안 됨 (디바운스 중)
    expect(onSearch).not.toHaveBeenCalled();

    // 디바운스 시간 경과
    await vi.advanceTimersByTimeAsync(300);

    // 이제 호출됨
    expect(onSearch).toHaveBeenCalledWith('test');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('should show search results after debounce', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<SearchableList />);

    await user.type(screen.getByPlaceholderText('검색'), 'kim');

    // 디바운스 대기
    await vi.advanceTimersByTimeAsync(300);

    // API 응답 대기
    await waitFor(() => {
      expect(screen.getByText('Kim')).toBeInTheDocument();
    });

    expect(screen.queryByText('Lee')).not.toBeInTheDocument();
  });

  it('should cancel previous search on new input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();

    render(<SearchableList onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('검색');

    // 첫 번째 입력
    await user.type(input, 'first');
    await vi.advanceTimersByTimeAsync(200); // 디바운스 완료 전

    // 두 번째 입력 (이전 타이머 취소됨)
    await user.clear(input);
    await user.type(input, 'second');
    await vi.advanceTimersByTimeAsync(300);

    // 두 번째 검색어로만 호출
    expect(onSearch).toHaveBeenCalledWith('second');
    expect(onSearch).not.toHaveBeenCalledWith('first');
  });
});`
        },
        {
          id: 'modal-animation-test',
          title: '모달/토스트 테스트',
          description: '열기/닫기 애니메이션',
          language: 'tsx',
          code: `import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('should open and close dialog', async () => {
    const user = userEvent.setup();

    render(<ConfirmDialog trigger={<button>삭제</button>} />);

    // 초기에는 다이얼로그 없음
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 트리거 클릭으로 열기
    await user.click(screen.getByRole('button', { name: '삭제' }));

    // 다이얼로그 표시
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();

    // 취소 버튼 클릭
    await user.click(screen.getByRole('button', { name: '취소' }));

    // 다이얼로그 닫힘 대기 (애니메이션)
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
  });

  it('should call onConfirm when confirmed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        trigger={<button>삭제</button>}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: '삭제' }));
    await user.click(screen.getByRole('button', { name: '확인' }));

    expect(onConfirm).toHaveBeenCalled();
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
  });
});

describe('Toast', () => {
  it('should auto dismiss after timeout', async () => {
    vi.useFakeTimers();

    render(<Toast message="저장되었습니다" duration={3000} />);

    expect(screen.getByText('저장되었습니다')).toBeInTheDocument();

    // 3초 경과
    await vi.advanceTimersByTimeAsync(3000);

    // 토스트 사라짐
    await waitForElementToBeRemoved(() =>
      screen.queryByText('저장되었습니다')
    );

    vi.useRealTimers();
  });
});`
        }
      ],
      tips: [
        '✅ findBy는 단일 요소 대기, waitFor는 복잡한 조건에 사용하세요.',
        '✅ waitForElementToBeRemoved로 요소가 사라지는 것을 테스트하세요.',
        '⚠️ 타이머 테스트 시 userEvent와 vi.useFakeTimers 설정에 주의하세요.',
        'ℹ️ 비동기 테스트는 타임아웃을 적절히 설정하세요.'
      ]
    },
    {
      id: 'msw-mocking',
      title: 'MSW API Mocking',
      titleKo: 'MSW로 API 모킹',
      content: `
## MSW (Mock Service Worker)란?

**MSW**는 서비스 워커를 사용하여 **네트워크 레벨에서** API를 모킹합니다.

### MSW의 장점

| 특징 | 설명 |
|------|------|
| 네트워크 레벨 | 실제 fetch/axios 요청을 가로챔 |
| 코드 수정 없음 | 프로덕션 코드 변경 불필요 |
| DevTools 호환 | Network 탭에서 요청 확인 가능 |
| 브라우저/Node | 테스트와 개발 모두 사용 가능 |

### 설치 및 설정

\`\`\`bash
npm install -D msw
\`\`\`

### 핸들러 정의

\`\`\`typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({
      data: [
        { id: 1, name: 'Kim' },
        { id: 2, name: 'Lee' },
      ],
    });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 3,
      ...body,
    }, { status: 201 });
  }),
];
\`\`\`
      `,
      codeExamples: [
        {
          id: 'msw-setup',
          title: 'MSW 설정',
          description: '테스트용 서버 설정',
          language: 'typescript',
          code: `// mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  // GET 요청
  http.get('/api/users', async () => {
    await delay(100); // 네트워크 지연 시뮬레이션

    return HttpResponse.json({
      data: [
        { id: 1, name: 'Kim', email: 'kim@test.com' },
        { id: 2, name: 'Lee', email: 'lee@test.com' },
      ],
      pagination: { total: 2, page: 1, limit: 10 },
    });
  }),

  // POST 요청
  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as { name: string; email: string };

    return HttpResponse.json(
      { id: 3, ...body },
      { status: 201 }
    );
  }),

  // DELETE 요청
  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    return new HttpResponse(null, { status: 204 });
  }),

  // 에러 응답
  http.get('/api/error', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());`
        },
        {
          id: 'msw-dynamic-handlers',
          title: 'MSW 동적 핸들러',
          description: '테스트별 응답 커스터마이징',
          language: 'tsx',
          code: `import { render, screen } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { server } from '@/mocks/server';
import { UserList } from './UserList';

describe('UserList with MSW', () => {
  it('should handle empty response', async () => {
    // 이 테스트에서만 빈 배열 반환
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json({
          data: [],
          pagination: { total: 0 },
        });
      })
    );

    render(<UserList />);

    expect(await screen.findByText('사용자가 없습니다')).toBeInTheDocument();
  });

  it('should handle network error', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.error();
      })
    );

    render(<UserList />);

    expect(await screen.findByText('네트워크 오류가 발생했습니다')).toBeInTheDocument();
  });

  it('should handle slow response', async () => {
    server.use(
      http.get('/api/users', async () => {
        await delay(2000); // 2초 지연
        return HttpResponse.json({ data: [{ id: 1, name: 'Kim' }] });
      })
    );

    render(<UserList />);

    // 로딩 상태 확인
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // 데이터 로드 대기 (타임아웃 늘리기)
    expect(await screen.findByText('Kim', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('should handle pagination', async () => {
    server.use(
      http.get('/api/users', ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page')) || 1;

        const users = page === 1
          ? [{ id: 1, name: 'Kim' }]
          : [{ id: 2, name: 'Lee' }];

        return HttpResponse.json({
          data: users,
          pagination: { total: 2, page, limit: 1, totalPages: 2 },
        });
      })
    );

    render(<UserList />);

    expect(await screen.findByText('Kim')).toBeInTheDocument();

    // 다음 페이지로 이동
    await userEvent.click(screen.getByRole('button', { name: /다음/ }));

    expect(await screen.findByText('Lee')).toBeInTheDocument();
    expect(screen.queryByText('Kim')).not.toBeInTheDocument();
  });
});`
        },
        {
          id: 'msw-mutation-test',
          title: 'MSW로 CRUD 테스트',
          description: '생성/수정/삭제 테스트',
          language: 'tsx',
          code: `import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { UserManagement } from './UserManagement';

describe('UserManagement CRUD', () => {
  it('should create user', async () => {
    const user = userEvent.setup();
    let createdUser: any = null;

    // POST 요청 캡처
    server.use(
      http.post('/api/users', async ({ request }) => {
        createdUser = await request.json();
        return HttpResponse.json(
          { id: 100, ...createdUser },
          { status: 201 }
        );
      })
    );

    render(<UserManagement />);

    // 추가 버튼 클릭
    await user.click(screen.getByRole('button', { name: '사용자 추가' }));

    // 폼 입력
    await user.type(screen.getByLabelText('이름'), '새 사용자');
    await user.type(screen.getByLabelText('이메일'), 'new@test.com');

    // 저장
    await user.click(screen.getByRole('button', { name: '저장' }));

    // 요청 검증
    await waitFor(() => {
      expect(createdUser).toEqual({
        name: '새 사용자',
        email: 'new@test.com',
      });
    });

    // 목록에 추가됨
    expect(await screen.findByText('새 사용자')).toBeInTheDocument();
  });

  it('should update user', async () => {
    const user = userEvent.setup();
    let updatedData: any = null;

    server.use(
      http.patch('/api/users/:id', async ({ request, params }) => {
        updatedData = { id: params.id, ...(await request.json()) };
        return HttpResponse.json(updatedData);
      })
    );

    render(<UserManagement />);

    // 편집 버튼 클릭
    const editButton = await screen.findByRole('button', { name: /Kim.*수정/ });
    await user.click(editButton);

    // 이름 수정
    const nameInput = screen.getByLabelText('이름');
    await user.clear(nameInput);
    await user.type(nameInput, '수정된 이름');

    // 저장
    await user.click(screen.getByRole('button', { name: '저장' }));

    // 검증
    await waitFor(() => {
      expect(updatedData.name).toBe('수정된 이름');
    });
  });

  it('should delete user with confirmation', async () => {
    const user = userEvent.setup();
    let deletedId: string | null = null;

    server.use(
      http.delete('/api/users/:id', ({ params }) => {
        deletedId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      })
    );

    render(<UserManagement />);

    // 삭제 버튼 클릭
    const deleteButton = await screen.findByRole('button', { name: /Kim.*삭제/ });
    await user.click(deleteButton);

    // 확인 다이얼로그
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '확인' }));

    // 삭제 확인
    await waitFor(() => {
      expect(deletedId).toBe('1');
    });

    // 목록에서 제거됨
    expect(screen.queryByText('Kim')).not.toBeInTheDocument();
  });
});`
        }
      ],
      tips: [
        '✅ MSW는 실제 네트워크 요청을 가로채므로 가장 현실적인 테스트가 가능합니다.',
        '✅ server.use()로 특정 테스트의 응답을 오버라이드하세요.',
        '⚠️ afterEach에서 server.resetHandlers()를 호출하여 핸들러를 초기화하세요.',
        'ℹ️ delay()로 네트워크 지연을 시뮬레이션하여 로딩 상태를 테스트하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'Testing Library Documentation',
      url: 'https://testing-library.com/docs/react-testing-library/intro/',
      type: 'documentation'
    },
    {
      title: 'MSW Documentation',
      url: 'https://mswjs.io/docs/',
      type: 'documentation'
    },
    {
      title: 'Testing Library Cheatsheet',
      url: 'https://testing-library.com/docs/react-testing-library/cheatsheet/',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
