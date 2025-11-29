/**
 * Chapter 4: 단위 테스트 (Unit Testing)
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'unit-testing',
  order: 4,
  title: 'Unit Testing',
  titleKo: '단위 테스트 (Unit Testing)',
  description: 'Learn how to write effective unit tests for React applications using Jest/Vitest.',
  descriptionKo: 'Jest/Vitest를 사용하여 React 애플리케이션의 효과적인 단위 테스트 작성법을 학습합니다.',
  estimatedMinutes: 60,
  objectives: [
    'Set up Jest/Vitest for React projects',
    'Write tests for pure functions',
    'Test custom hooks effectively',
    'Use mocks and spies correctly',
    'Understand test coverage'
  ],
  objectivesKo: [
    'Jest/Vitest를 React 프로젝트에 설정한다',
    '순수 함수에 대한 테스트를 작성한다',
    '커스텀 훅을 효과적으로 테스트한다',
    'Mock과 Spy를 올바르게 사용한다',
    '테스트 커버리지를 이해한다'
  ],
  sections: [
    {
      id: 'jest-vitest-setup',
      title: 'Jest/Vitest Setup',
      titleKo: 'Jest/Vitest 설정과 기본 사용법',
      content: `
## 테스트 프레임워크 선택

| 특성 | Jest | Vitest |
|------|------|--------|
| 설정 | 풍부한 기본 설정 | 최소 설정 |
| 속도 | 보통 | 빠름 (Vite 기반) |
| 호환성 | 넓음 | Jest API 호환 |
| ESM 지원 | 설정 필요 | 네이티브 |
| 권장 환경 | CRA, 기존 프로젝트 | Vite, Next.js |

### Next.js에서 Vitest 설정

\`\`\`bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
\`\`\`

### 기본 설정 파일

\`\`\`typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
\`\`\`

### 테스트 기본 구조

\`\`\`typescript
// AAA 패턴: Arrange, Act, Assert
describe('Calculator', () => {
  it('should add two numbers', () => {
    // Arrange (준비)
    const a = 1;
    const b = 2;

    // Act (실행)
    const result = add(a, b);

    // Assert (검증)
    expect(result).toBe(3);
  });
});
\`\`\`
      `,
      codeExamples: [
        {
          id: 'vitest-config',
          title: 'Vitest 설정 예시',
          description: 'Next.js 프로젝트용 Vitest 설정',
          fileName: 'vitest.config.ts',
          language: 'typescript',
          code: `// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 테스트 환경
    environment: 'jsdom',

    // 전역 API (describe, it, expect 등)
    globals: true,

    // 테스트 전 실행할 설정 파일
    setupFiles: ['./vitest.setup.ts'],

    // 테스트 파일 패턴
    include: ['**/*.{test,spec}.{ts,tsx}'],

    // 제외 패턴
    exclude: ['node_modules', '.next', 'e2e'],

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
    },

    // 타임아웃 설정
    testTimeout: 10000,

    // 병렬 실행
    pool: 'threads',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});`
        },
        {
          id: 'vitest-setup',
          title: 'Vitest Setup 파일',
          description: '전역 설정 및 매처 확장',
          fileName: 'vitest.setup.ts',
          language: 'typescript',
          code: `// vitest.setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// 전역 모킹 설정
beforeAll(() => {
  // window.matchMedia 모킹 (MUI 등에서 필요)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // ResizeObserver 모킹
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// 각 테스트 후 정리
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// 모든 테스트 후 정리
afterAll(() => {
  vi.resetAllMocks();
});

// 커스텀 매처 추가 (선택사항)
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          \`expected \${received} not to be within range \${floor} - \${ceiling}\`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          \`expected \${received} to be within range \${floor} - \${ceiling}\`,
        pass: false,
      };
    }
  },
});`
        },
        {
          id: 'test-structure',
          title: '테스트 파일 구조',
          description: '기본적인 테스트 파일 작성',
          language: 'typescript',
          code: `// utils/format.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { formatCurrency, formatDate, truncateText } from './format';

describe('format utilities', () => {
  // 그룹 내 공통 설정
  beforeEach(() => {
    // 각 테스트 전 실행
  });

  // 중첩된 describe로 하위 그룹화
  describe('formatCurrency', () => {
    it('should format number to KRW', () => {
      expect(formatCurrency(1000)).toBe('₩1,000');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₩0');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('-₩1,000');
    });

    // 여러 케이스를 한 번에 테스트
    it.each([
      [100, '₩100'],
      [1000, '₩1,000'],
      [1000000, '₩1,000,000'],
    ])('formatCurrency(%i) should return %s', (input, expected) => {
      expect(formatCurrency(input)).toBe(expected);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should handle string input', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncateText(text, 10)).toBe('This is a...');
    });

    it('should not truncate short text', () => {
      const text = 'Short';
      expect(truncateText(text, 10)).toBe('Short');
    });
  });
});`
        }
      ],
      tips: [
        '✅ describe로 관련 테스트를 그룹화하여 가독성을 높이세요.',
        '✅ it.each로 여러 입력값을 한 번에 테스트하세요.',
        '⚠️ 테스트 간 상태가 공유되지 않도록 beforeEach에서 초기화하세요.'
      ]
    },
    {
      id: 'pure-function-testing',
      title: 'Testing Pure Functions',
      titleKo: '순수 함수 테스트',
      content: `
## 순수 함수란?

**순수 함수**는 같은 입력에 항상 같은 출력을 반환하고, **부수 효과가 없는** 함수입니다.

### 순수 함수의 특징

1. **결정적(Deterministic)**: 같은 입력 → 같은 출력
2. **부수 효과 없음**: 외부 상태 변경 없음
3. **참조 투명성**: 함수 호출을 결과값으로 대체 가능

### 테스트하기 쉬운 이유

\`\`\`typescript
// 순수 함수 - 테스트 쉬움
function add(a: number, b: number): number {
  return a + b;
}

// 비순수 함수 - 테스트 어려움
let total = 0;
function addToTotal(value: number): void {
  total += value;  // 외부 상태 변경
}
\`\`\`

### 일반적인 순수 함수 테스트 패턴

| 테스트 유형 | 설명 |
|------------|------|
| 정상 케이스 | 일반적인 입력에 대한 출력 |
| 경계 케이스 | 최소값, 최대값, 빈 값 |
| 엣지 케이스 | 예외적인 입력 |
| 에러 케이스 | 잘못된 입력에 대한 예외 |
      `,
      codeExamples: [
        {
          id: 'utility-function-test',
          title: '유틸리티 함수 테스트',
          description: '문자열, 배열 유틸리티 테스트',
          language: 'typescript',
          code: `// utils/string.ts
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

// utils/string.test.ts
import { describe, it, expect } from 'vitest';
import { capitalize, slugify, truncate } from './string';

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should handle already capitalized', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('should return empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('should handle korean text', () => {
    expect(slugify('안녕 World')).toBe('world');
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });

  it('should not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should use custom suffix', () => {
    expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
  });
});`
        },
        {
          id: 'validation-function-test',
          title: '검증 함수 테스트',
          description: '폼 검증 함수 테스트',
          language: 'typescript',
          code: `// utils/validation.ts
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email) {
    errors.push('이메일을 입력하세요');
  } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    errors.push('유효한 이메일 형식이 아닙니다');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('비밀번호를 입력하세요');
  } else {
    if (password.length < 8) {
      errors.push('비밀번호는 8자 이상이어야 합니다');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('숫자를 포함해야 합니다');
    }
  }

  return { valid: errors.length === 0, errors };
}

// utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from './validation';

describe('validateEmail', () => {
  it('should return valid for correct email', () => {
    const result = validateEmail('test@example.com');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return error for empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('이메일을 입력하세요');
  });

  it('should return error for invalid format', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('유효한 이메일 형식이 아닙니다');
  });

  // 다양한 유효한 이메일 테스트
  it.each([
    'user@domain.com',
    'user.name@domain.com',
    'user+tag@domain.co.kr',
  ])('should accept valid email: %s', (email) => {
    expect(validateEmail(email).valid).toBe(true);
  });

  // 다양한 무효한 이메일 테스트
  it.each([
    'nodomain',
    '@nodomain.com',
    'user@',
    'user @domain.com',
  ])('should reject invalid email: %s', (email) => {
    expect(validateEmail(email).valid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should return valid for strong password', () => {
    const result = validatePassword('MyPassword123');
    expect(result.valid).toBe(true);
  });

  it('should return all errors for empty password', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('비밀번호를 입력하세요');
  });

  it('should return error for short password', () => {
    const result = validatePassword('Short1');
    expect(result.errors).toContain('비밀번호는 8자 이상이어야 합니다');
  });

  it('should return error for missing uppercase', () => {
    const result = validatePassword('password123');
    expect(result.errors).toContain('대문자를 포함해야 합니다');
  });

  it('should return error for missing number', () => {
    const result = validatePassword('Password');
    expect(result.errors).toContain('숫자를 포함해야 합니다');
  });
});`
        },
        {
          id: 'data-transform-test',
          title: '데이터 변환 함수 테스트',
          description: 'API 응답 변환, 필터링 등',
          language: 'typescript',
          code: `// utils/transform.ts
export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface UserListItem {
  id: number;
  displayName: string;
  isActive: boolean;
}

export function transformUserToListItem(user: User): UserListItem {
  return {
    id: user.id,
    displayName: \`\${user.name} (\${user.email})\`,
    isActive: user.status === 'active',
  };
}

export function filterActiveUsers(users: User[]): User[] {
  return users.filter(user => user.status === 'active');
}

export function sortUsersByName(users: User[]): User[] {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}

export function groupUsersByStatus(users: User[]): Record<string, User[]> {
  return users.reduce((acc, user) => {
    const key = user.status;
    if (!acc[key]) acc[key] = [];
    acc[key].push(user);
    return acc;
  }, {} as Record<string, User[]>);
}

// utils/transform.test.ts
import { describe, it, expect } from 'vitest';
import {
  transformUserToListItem,
  filterActiveUsers,
  sortUsersByName,
  groupUsersByStatus,
  User,
} from './transform';

// 테스트용 픽스처
const mockUsers: User[] = [
  { id: 1, name: 'Kim', email: 'kim@test.com', status: 'active' },
  { id: 2, name: 'Lee', email: 'lee@test.com', status: 'inactive' },
  { id: 3, name: 'Park', email: 'park@test.com', status: 'active' },
];

describe('transformUserToListItem', () => {
  it('should transform user to list item', () => {
    const user = mockUsers[0];
    const result = transformUserToListItem(user);

    expect(result).toEqual({
      id: 1,
      displayName: 'Kim (kim@test.com)',
      isActive: true,
    });
  });

  it('should set isActive false for inactive user', () => {
    const user = mockUsers[1];
    const result = transformUserToListItem(user);

    expect(result.isActive).toBe(false);
  });
});

describe('filterActiveUsers', () => {
  it('should return only active users', () => {
    const result = filterActiveUsers(mockUsers);

    expect(result).toHaveLength(2);
    expect(result.every(u => u.status === 'active')).toBe(true);
  });

  it('should return empty array when no active users', () => {
    const inactiveUsers = [mockUsers[1]];
    const result = filterActiveUsers(inactiveUsers);

    expect(result).toHaveLength(0);
  });

  it('should not modify original array', () => {
    const original = [...mockUsers];
    filterActiveUsers(mockUsers);

    expect(mockUsers).toEqual(original);
  });
});

describe('sortUsersByName', () => {
  it('should sort users alphabetically by name', () => {
    const result = sortUsersByName(mockUsers);

    expect(result.map(u => u.name)).toEqual(['Kim', 'Lee', 'Park']);
  });

  it('should not modify original array', () => {
    const original = [...mockUsers];
    sortUsersByName(mockUsers);

    expect(mockUsers).toEqual(original);
  });
});

describe('groupUsersByStatus', () => {
  it('should group users by status', () => {
    const result = groupUsersByStatus(mockUsers);

    expect(result.active).toHaveLength(2);
    expect(result.inactive).toHaveLength(1);
  });
});`
        }
      ],
      tips: [
        '✅ 순수 함수는 테스트하기 가장 쉽습니다. 비즈니스 로직을 순수 함수로 분리하세요.',
        '✅ 경계값과 엣지 케이스를 항상 테스트하세요.',
        '✅ 테스트용 픽스처(mock data)를 재사용 가능하게 정의하세요.',
        '⚠️ 원본 데이터가 변경되지 않는지 확인하는 테스트를 추가하세요.'
      ]
    },
    {
      id: 'custom-hook-testing',
      title: 'Custom Hook Testing',
      titleKo: 'Custom Hook 테스트',
      content: `
## Custom Hook 테스트의 어려움

Hooks는 **컴포넌트 내부에서만** 호출할 수 있어서 직접 테스트하기 어렵습니다.

### @testing-library/react의 renderHook

\`\`\`typescript
import { renderHook, act } from '@testing-library/react';

const { result } = renderHook(() => useCounter());

// result.current로 훅의 반환값 접근
expect(result.current.count).toBe(0);

// act로 상태 변경 래핑
act(() => {
  result.current.increment();
});

expect(result.current.count).toBe(1);
\`\`\`

### act()가 필요한 이유

React 상태 업데이트는 **비동기**입니다. act()는 모든 업데이트가 **완료될 때까지** 기다립니다.

\`\`\`typescript
// ❌ act 없이 - 경고 발생, 불안정한 테스트
result.current.increment();
expect(result.current.count).toBe(1); // 실패할 수 있음

// ✅ act로 래핑
act(() => {
  result.current.increment();
});
expect(result.current.count).toBe(1); // 안정적
\`\`\`
      `,
      codeExamples: [
        {
          id: 'use-counter-test',
          title: 'useCounter 훅 테스트',
          description: '기본적인 상태 훅 테스트',
          language: 'typescript',
          code: `// hooks/useCounter.ts
import { useState, useCallback } from 'react';

interface UseCounterOptions {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export function useCounter({
  initialValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
}: UseCounterOptions = {}) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => Math.min(c + step, max));
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount(c => Math.max(c - step, min));
  }, [step, min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback((value: number) => {
    setCount(Math.min(Math.max(value, min), max));
  }, [min, max]);

  return { count, increment, decrement, reset, set };
}

// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10 }));
    expect(result.current.count).toBe(10);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 5 }));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('should respect max limit', () => {
    const { result } = renderHook(() =>
      useCounter({ initialValue: 9, max: 10 })
    );

    act(() => {
      result.current.increment();
      result.current.increment(); // max에 도달
    });

    expect(result.current.count).toBe(10);
  });

  it('should respect min limit', () => {
    const { result } = renderHook(() =>
      useCounter({ initialValue: 1, min: 0 })
    );

    act(() => {
      result.current.decrement();
      result.current.decrement(); // min에 도달
    });

    expect(result.current.count).toBe(0);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 5 }));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });

  it('should set value within bounds', () => {
    const { result } = renderHook(() =>
      useCounter({ min: 0, max: 100 })
    );

    act(() => {
      result.current.set(50);
    });
    expect(result.current.count).toBe(50);

    act(() => {
      result.current.set(150); // max 초과
    });
    expect(result.current.count).toBe(100);

    act(() => {
      result.current.set(-10); // min 미만
    });
    expect(result.current.count).toBe(0);
  });
});`
        },
        {
          id: 'use-page-state-test',
          title: 'usePageState 훅 테스트',
          description: '현재 프로젝트 훅 테스트 예시',
          fileName: 'src/hooks/usePageState.test.ts',
          language: 'typescript',
          code: `// hooks/usePageState.ts
import { useState, useCallback } from 'react';

interface UsePageStateOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePageState({
  initialPage = 1,
  initialPageSize = 10,
}: UsePageStateOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // 페이지 크기 변경 시 1페이지로
  }, []);

  const resetPage = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
  };
}

// hooks/usePageState.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePageState } from './usePageState';

describe('usePageState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePageState());

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('should initialize with custom values', () => {
    const { result } = renderHook(() =>
      usePageState({ initialPage: 2, initialPageSize: 20 })
    );

    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(20);
  });

  it('should change page', () => {
    const { result } = renderHook(() => usePageState());

    act(() => {
      result.current.handlePageChange(5);
    });

    expect(result.current.page).toBe(5);
  });

  it('should reset page to 1 when page size changes', () => {
    const { result } = renderHook(() => usePageState());

    act(() => {
      result.current.handlePageChange(5);
    });
    expect(result.current.page).toBe(5);

    act(() => {
      result.current.handlePageSizeChange(25);
    });
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(25);
  });

  it('should reset page to initial value', () => {
    const { result } = renderHook(() =>
      usePageState({ initialPage: 3 })
    );

    act(() => {
      result.current.handlePageChange(10);
    });

    act(() => {
      result.current.resetPage();
    });

    expect(result.current.page).toBe(3);
  });
});`
        },
        {
          id: 'async-hook-test',
          title: '비동기 훅 테스트',
          description: 'API 호출 훅 테스트',
          language: 'typescript',
          code: `// hooks/useAsync.ts
import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(asyncFn: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, [asyncFn]);

  return { ...state, execute };
}

// hooks/useAsync.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('should have initial state', () => {
    const asyncFn = vi.fn();
    const { result } = renderHook(() => useAsync(asyncFn));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state when executing', async () => {
    const asyncFn = vi.fn(() => new Promise(resolve =>
      setTimeout(() => resolve('data'), 100)
    ));

    const { result } = renderHook(() => useAsync(asyncFn));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should set data on success', async () => {
    const mockData = { id: 1, name: 'Test' };
    const asyncFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useAsync(asyncFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error on failure', async () => {
    const mockError = new Error('API Error');
    const asyncFn = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useAsync(asyncFn));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // 에러 예상됨
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });
});`
        }
      ],
      tips: [
        '✅ renderHook과 act를 사용하여 훅을 안전하게 테스트하세요.',
        '✅ 비동기 훅은 waitFor를 사용하여 상태 변경을 기다리세요.',
        '⚠️ 모든 상태 변경은 act로 래핑해야 합니다.',
        'ℹ️ 훅의 옵션, 초기값, 경계 케이스를 모두 테스트하세요.'
      ]
    },
    {
      id: 'mocks-and-spies',
      title: 'Mocks and Spies',
      titleKo: 'Mock과 Spy 활용',
      content: `
## Mock vs Spy

| 개념 | 설명 | 사용 시점 |
|------|------|----------|
| **Mock** | 가짜 구현을 제공 | 외부 의존성 대체 |
| **Spy** | 실제 함수를 감시 | 호출 여부/인자 확인 |
| **Stub** | 고정된 값 반환 | 특정 시나리오 테스트 |

### vi.fn() - 모의 함수

\`\`\`typescript
const mockFn = vi.fn();
mockFn();
mockFn('arg1', 'arg2');

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
\`\`\`

### vi.spyOn() - 스파이

\`\`\`typescript
const spy = vi.spyOn(object, 'method');
object.method();

expect(spy).toHaveBeenCalled();
spy.mockRestore(); // 원래 구현 복원
\`\`\`

### vi.mock() - 모듈 모킹

\`\`\`typescript
vi.mock('@/lib/axios', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
\`\`\`
      `,
      codeExamples: [
        {
          id: 'mock-api-calls',
          title: 'API 호출 모킹',
          description: 'Axios 모킹',
          language: 'typescript',
          code: `// __tests__/userService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axiosInstance } from '@/lib/axios';
import { fetchUsers, createUser, deleteUser } from '@/services/userService';

// Axios 모킹
vi.mock('@/lib/axios', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        { id: 1, name: 'Kim' },
        { id: 2, name: 'Lee' },
      ];

      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: { data: mockUsers, pagination: { total: 2 } },
      });

      const result = await fetchUsers({ page: 1, limit: 10 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/user', {
        params: { page: 1, limit: 10 },
      });
      expect(result.data).toEqual(mockUsers);
    });

    it('should handle error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(
        new Error('Network Error')
      );

      await expect(fetchUsers({ page: 1 })).rejects.toThrow('Network Error');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const newUser = { name: 'Park', email: 'park@test.com' };
      const createdUser = { id: 3, ...newUser };

      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: createdUser,
      });

      const result = await createUser(newUser);

      expect(axiosInstance.post).toHaveBeenCalledWith('/user', newUser);
      expect(result).toEqual(createdUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return void', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      await deleteUser(1);

      expect(axiosInstance.delete).toHaveBeenCalledWith('/user/1');
    });
  });
});`
        },
        {
          id: 'spy-example',
          title: 'Spy 활용',
          description: '함수 호출 감시',
          language: 'typescript',
          code: `// analytics.ts
export const analytics = {
  track(event: string, properties?: Record<string, unknown>) {
    // 실제 분석 서버로 전송
    console.log('Track:', event, properties);
  },
  identify(userId: string) {
    console.log('Identify:', userId);
  },
};

// components/LoginForm.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { analytics } from '@/lib/analytics';

describe('LoginForm', () => {
  // Spy 생성
  const trackSpy = vi.spyOn(analytics, 'track');
  const identifySpy = vi.spyOn(analytics, 'identify');

  afterEach(() => {
    trackSpy.mockClear();
    identifySpy.mockClear();
  });

  it('should track login_start event on form render', () => {
    render(<LoginForm />);

    expect(trackSpy).toHaveBeenCalledWith('login_start');
  });

  it('should track login_attempt event on submit', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(trackSpy).toHaveBeenCalledWith('login_attempt', {
      email: 'test@test.com',
    });
  });

  it('should identify user on successful login', async () => {
    const mockOnSuccess = vi.fn();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    // ... 폼 작성 및 제출

    await waitFor(() => {
      expect(identifySpy).toHaveBeenCalledWith('user-123');
    });
  });
});`
        },
        {
          id: 'timer-mocks',
          title: '타이머 모킹',
          description: 'setTimeout, setInterval 테스트',
          language: 'typescript',
          code: `// hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // 값 변경
    rerender({ value: 'updated' });

    // 아직 변경 안 됨
    expect(result.current).toBe('initial');

    // 500ms 경과
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 이제 변경됨
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } }
    );

    // 빠르게 여러 번 변경
    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(200));

    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(200));

    rerender({ value: 'd' });
    act(() => vi.advanceTimersByTime(200));

    // 아직 원래 값
    expect(result.current).toBe('a');

    // 마지막 변경에서 500ms 경과
    act(() => vi.advanceTimersByTime(300));

    // 최종 값으로 업데이트
    expect(result.current).toBe('d');
  });
});

// 날짜 모킹
describe('date functions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format current date', () => {
    const result = formatCurrentDate();
    expect(result).toBe('2024-01-15');
  });

  it('should check if date is today', () => {
    expect(isToday(new Date('2024-01-15'))).toBe(true);
    expect(isToday(new Date('2024-01-14'))).toBe(false);
  });
});`
        }
      ],
      tips: [
        '✅ 각 테스트 후 vi.clearAllMocks()로 모킹 상태를 초기화하세요.',
        '✅ 타이머 테스트는 vi.useFakeTimers()를 사용하세요.',
        '⚠️ 모킹을 과도하게 사용하면 실제 동작을 테스트하지 못합니다.',
        'ℹ️ vi.mocked()를 사용하면 타입 안전하게 모킹할 수 있습니다.'
      ]
    },
    {
      id: 'test-coverage',
      title: 'Test Coverage',
      titleKo: '테스트 커버리지',
      content: `
## 테스트 커버리지란?

**커버리지**는 테스트가 코드의 얼마나 많은 부분을 실행하는지 측정합니다.

### 커버리지 지표

| 지표 | 설명 |
|------|------|
| **Statement** | 실행된 문장 비율 |
| **Branch** | 실행된 분기(if/else) 비율 |
| **Function** | 호출된 함수 비율 |
| **Line** | 실행된 라인 비율 |

### 커버리지 목표

\`\`\`
일반적인 권장 수치:
- Statement: 80%+
- Branch: 70%+
- Function: 80%+
- Line: 80%+
\`\`\`

### 주의사항

- **100% 커버리지 ≠ 버그 없음**: 잘못된 로직도 100% 커버 가능
- **양보다 질**: 의미 있는 테스트가 중요
- **비즈니스 로직 우선**: 핵심 로직에 집중
      `,
      codeExamples: [
        {
          id: 'coverage-config',
          title: '커버리지 설정',
          description: 'Vitest 커버리지 설정',
          fileName: 'vitest.config.ts',
          language: 'typescript',
          code: `// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      // 커버리지 프로바이더
      provider: 'v8',  // 또는 'istanbul'

      // 리포터 형식
      reporter: ['text', 'html', 'lcov', 'json'],

      // 결과 저장 위치
      reportsDirectory: './coverage',

      // 커버리지 대상 파일
      include: ['src/**/*.{ts,tsx}'],

      // 제외 파일
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/types/**',
        'src/**/index.ts',  // barrel exports
      ],

      // 커버리지 임계값 (실패 조건)
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },

      // 전체 임계값 미달 시 실패
      thresholdsAutoUpdate: false,

      // 브랜치별 임계값
      // perFile: true,
    },
  },
});`
        },
        {
          id: 'coverage-commands',
          title: '커버리지 명령어',
          description: 'package.json 스크립트',
          fileName: 'package.json',
          language: 'json',
          code: `{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui"
  }
}

// 명령어 설명:
// npm run test          - watch 모드로 테스트 실행
// npm run test:run      - 한 번만 테스트 실행
// npm run test:coverage - 커버리지 포함 테스트
// npm run test:watch    - 파일 변경 감지 테스트
// npm run test:ui       - 브라우저 UI로 테스트 결과 확인`
        },
        {
          id: 'coverage-interpretation',
          title: '커버리지 리포트 해석',
          description: '커버리지 결과 분석',
          language: 'typescript',
          code: `// 커버리지 리포트 예시
// ----------------------------|---------|----------|---------|---------|
// File                        | % Stmts | % Branch | % Funcs | % Lines |
// ----------------------------|---------|----------|---------|---------|
// All files                   |   85.23 |    72.15 |   81.25 |   84.56 |
//  src/hooks                  |   92.30 |    85.00 |   90.00 |   92.30 |
//   useCounter.ts             |  100.00 |   100.00 |  100.00 |  100.00 |
//   useDebounce.ts            |   95.00 |    80.00 |  100.00 |   95.00 |
//   usePageState.ts           |   82.00 |    75.00 |   70.00 |   82.00 |
//  src/utils                  |   88.50 |    78.00 |   85.00 |   88.00 |
//   format.ts                 |  100.00 |   100.00 |  100.00 |  100.00 |
//   validation.ts             |   85.00 |    70.00 |   80.00 |   85.00 |
//   transform.ts              |   80.00 |    65.00 |   75.00 |   79.00 |
// ----------------------------|---------|----------|---------|---------|

// 리포트 해석:
// 1. usePageState.ts의 Branch 커버리지가 75%
//    → 일부 조건문이 테스트되지 않음
//    → 엣지 케이스 테스트 추가 필요

// 2. validation.ts의 Branch가 70%
//    → 검증 실패 케이스가 부족할 수 있음

// 3. transform.ts 전체적으로 낮음
//    → 테스트 케이스 추가 필요

// HTML 리포트에서 상세 확인
// - 빨간색: 실행되지 않은 코드
// - 노란색: 부분적으로 실행된 분기
// - 녹색: 완전히 커버된 코드`
        },
        {
          id: 'improve-coverage',
          title: '커버리지 개선 전략',
          description: '효과적인 커버리지 향상',
          language: 'typescript',
          code: `// 커버리지 개선 전략

// 1. 누락된 분기 테스트 추가
function processStatus(status: string) {
  if (status === 'active') {
    return 'Active User';
  } else if (status === 'inactive') {
    return 'Inactive User';
  } else if (status === 'pending') {  // 이 분기가 테스트 안 됨
    return 'Pending Approval';
  }
  return 'Unknown';
}

// 테스트 추가
it('should handle pending status', () => {
  expect(processStatus('pending')).toBe('Pending Approval');
});

// 2. 엣지 케이스 테스트
function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// 엣지 케이스 테스트
it('should throw on division by zero', () => {
  expect(() => divide(10, 0)).toThrow('Division by zero');
});

// 3. 에러 경로 테스트
async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch');  // 이 경로 테스트
    }
    return await response.json();
  } catch (error) {
    console.error(error);  // 이 경로도 테스트
    throw error;
  }
}

// 에러 경로 테스트
it('should throw on non-ok response', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: false,
  } as Response);

  await expect(fetchData('/api/data')).rejects.toThrow('Failed to fetch');
});

// 4. 불필요한 코드 제거 (커버리지 대신)
// 사용되지 않는 코드가 커버리지를 낮춤
// → 죽은 코드(dead code)는 테스트 대신 삭제`
        }
      ],
      tips: [
        '✅ 커버리지는 지표일 뿐, 테스트 품질의 절대적 기준이 아닙니다.',
        '✅ 비즈니스 크리티컬 코드는 높은 커버리지를 목표로 하세요.',
        '⚠️ 100% 달성을 위해 의미 없는 테스트를 추가하지 마세요.',
        'ℹ️ CI에서 커버리지 임계값을 설정하여 품질을 유지하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'Vitest Documentation',
      url: 'https://vitest.dev/',
      type: 'documentation'
    },
    {
      title: 'Testing Library - React Hooks',
      url: 'https://testing-library.com/docs/react-testing-library/api/#renderhook',
      type: 'documentation'
    },
    {
      title: 'Jest Mocking',
      url: 'https://jestjs.io/docs/mock-functions',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
