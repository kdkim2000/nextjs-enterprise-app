/**
 * Chapter 2: TypeScript 고급 패턴
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'typescript-advanced',
  order: 2,
  title: 'Advanced TypeScript Patterns',
  titleKo: 'TypeScript 고급 패턴',
  description: 'Master advanced TypeScript features for building type-safe React applications.',
  descriptionKo: '타입 안전한 React 애플리케이션을 위한 TypeScript 고급 기능을 마스터합니다.',
  estimatedMinutes: 75,
  objectives: [
    'Apply generics in real-world scenarios',
    'Master utility types (Pick, Omit, Partial, Required)',
    'Understand conditional types and type inference',
    'Use type guards and type assertions effectively',
    'Know when to use interface vs type'
  ],
  objectivesKo: [
    '제네릭을 실전에서 활용한다',
    '유틸리티 타입(Pick, Omit, Partial, Required)을 마스터한다',
    '조건부 타입과 타입 추론을 이해한다',
    '타입 가드와 타입 단언을 효과적으로 사용한다',
    '인터페이스와 타입 별칭의 사용 시점을 안다'
  ],
  sections: [
    {
      id: 'generics-practical',
      title: 'Practical Generics',
      titleKo: '제네릭 실전 활용',
      content: `
## 제네릭(Generics)이란?

**제네릭**은 타입을 매개변수화하여 재사용 가능한 컴포넌트를 만드는 기능입니다.

### 기본 문법

\`\`\`typescript
// 함수 제네릭
function identity<T>(value: T): T {
  return value;
}

// 사용
identity<string>("hello");  // 명시적 타입
identity(42);               // 타입 추론 (number)
\`\`\`

### 제네릭이 필요한 이유

\`\`\`typescript
// ❌ any 사용 - 타입 안전성 없음
function getFirst(arr: any[]): any {
  return arr[0];
}

// ❌ 타입별 함수 - 중복 코드
function getFirstString(arr: string[]): string { return arr[0]; }
function getFirstNumber(arr: number[]): number { return arr[0]; }

// ✅ 제네릭 - 재사용 가능하고 타입 안전
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

getFirst<string>(["a", "b"]);  // string 반환
getFirst([1, 2, 3]);           // number 추론
\`\`\`

### 제네릭 제약 조건 (Constraints)

\`\`\`typescript
// T는 반드시 length 속성을 가져야 함
function logLength<T extends { length: number }>(value: T): T {
  console.log(value.length);
  return value;
}

logLength("hello");      // ✅ string은 length 있음
logLength([1, 2, 3]);    // ✅ array도 length 있음
logLength(123);          // ❌ number는 length 없음
\`\`\`
      `,
      codeExamples: [
        {
          id: 'generic-api-response',
          title: 'API 응답 타입의 제네릭',
          description: '실제 프로젝트의 API 응답 타입',
          fileName: 'src/types/index.ts',
          language: 'typescript',
          code: `// 제네릭을 활용한 API 응답 타입
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 사용 예시
type UserResponse = ApiResponse<User>;
type UserListResponse = PaginatedResponse<User>;

// API 호출에서 활용
async function fetchUsers(): Promise<PaginatedResponse<User>> {
  const response = await axiosInstance.get('/user');
  return response.data;  // 타입이 자동 추론됨
}

// 응답 데이터 사용
const result = await fetchUsers();
result.data.forEach(user => {
  console.log(user.name);  // User 타입으로 추론
});`
        },
        {
          id: 'generic-hook',
          title: '제네릭 Custom Hook',
          description: '재사용 가능한 CRUD 훅',
          language: 'typescript',
          code: `// 제네릭을 활용한 범용 CRUD 훅
interface CrudHookResult<T, CreateDto, UpdateDto> {
  items: T[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  createItem: (data: CreateDto) => Promise<T>;
  updateItem: (id: number, data: UpdateDto) => Promise<T>;
  deleteItem: (id: number) => Promise<void>;
}

function useCrud<T extends { id: number }, CreateDto, UpdateDto>(
  endpoint: string
): CrudHookResult<T, CreateDto, UpdateDto> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<PaginatedResponse<T>>(endpoint);
      setItems(response.data.data);
    } catch (err) {
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data: CreateDto): Promise<T> => {
    const response = await axiosInstance.post<ApiResponse<T>>(endpoint, data);
    setItems(prev => [...prev, response.data.data]);
    return response.data.data;
  };

  // ... updateItem, deleteItem

  return { items, loading, error, fetchItems, createItem, updateItem, deleteItem };
}

// 사용
const userCrud = useCrud<User, CreateUserDto, UpdateUserDto>('/user');
const deptCrud = useCrud<Department, CreateDeptDto, UpdateDeptDto>('/department');`
        },
        {
          id: 'generic-component',
          title: '제네릭 컴포넌트',
          description: 'DataGrid의 제네릭 타입',
          language: 'tsx',
          code: `// 제네릭 DataGrid 컴포넌트
interface DataGridProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string | number;
}

interface ColumnDef<T> {
  field: keyof T | string;
  headerName: string;
  width?: number;
  renderCell?: (row: T) => React.ReactNode;
  valueGetter?: (row: T) => string | number;
}

function DataGrid<T extends { id: number | string }>({
  rows,
  columns,
  loading,
  onRowClick,
  getRowId = (row) => row.id,
}: DataGridProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.field)}>{col.headerName}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={getRowId(row)} onClick={() => onRowClick?.(row)}>
            {columns.map(col => (
              <td key={String(col.field)}>
                {col.renderCell
                  ? col.renderCell(row)
                  : String(row[col.field as keyof T])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 사용 - 타입 안전한 컬럼 정의
const userColumns: ColumnDef<User>[] = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: '이름' },
  { field: 'email', headerName: '이메일' },  // User에 없는 필드면 타입 에러!
];

<DataGrid<User> rows={users} columns={userColumns} />`
        }
      ],
      tips: [
        '✅ 제네릭 이름은 의미 있게: T, U보다 TData, TResponse가 명확합니다.',
        '✅ 제약 조건(extends)으로 타입을 좁혀 안전성을 높이세요.',
        '⚠️ 너무 많은 제네릭 매개변수는 가독성을 해칩니다. 3개 이하로 유지하세요.'
      ]
    },
    {
      id: 'utility-types',
      title: 'Utility Types',
      titleKo: '유틸리티 타입 (Pick, Omit, Partial, Required)',
      content: `
## TypeScript 내장 유틸리티 타입

기존 타입을 **변환**하여 새로운 타입을 만드는 도구입니다.

### 주요 유틸리티 타입

| 유틸리티 | 설명 | 사용 예 |
|---------|------|---------|
| \`Partial<T>\` | 모든 속성을 선택적으로 | 업데이트 DTO |
| \`Required<T>\` | 모든 속성을 필수로 | 기본값 객체 |
| \`Pick<T, K>\` | 일부 속성만 선택 | 뷰 모델 |
| \`Omit<T, K>\` | 일부 속성 제외 | 생성 DTO |
| \`Record<K, V>\` | 키-값 매핑 타입 | 설정 객체 |
| \`Readonly<T>\` | 모든 속성 읽기 전용 | 불변 상태 |

### Partial<T> - 부분 업데이트

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Partial로 모든 필드가 선택적인 타입 생성
type UpdateUserDto = Partial<User>;
// 결과: { id?: number; name?: string; email?: string; role?: string; }

// 일부 필드만 업데이트 가능
const updateData: UpdateUserDto = { name: "New Name" };  // ✅
\`\`\`

### Pick<T, K> - 필요한 것만 선택

\`\`\`typescript
// User에서 name과 email만 선택
type UserPreview = Pick<User, 'name' | 'email'>;
// 결과: { name: string; email: string; }
\`\`\`

### Omit<T, K> - 불필요한 것 제외

\`\`\`typescript
// id를 제외한 생성 DTO
type CreateUserDto = Omit<User, 'id'>;
// 결과: { name: string; email: string; role: string; }
\`\`\`
      `,
      codeExamples: [
        {
          id: 'dto-types',
          title: 'DTO 타입 정의',
          description: 'API 요청/응답 타입 설계',
          fileName: 'src/types/index.ts',
          language: 'typescript',
          code: `// 기본 Entity 타입
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// DTO 타입 정의 - 유틸리티 타입 활용

// 생성 DTO: id와 자동 생성 필드 제외
type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// 업데이트 DTO: id 제외, 모든 필드 선택적
type UpdateUserDto = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

// 목록 표시용: 필요한 필드만
type UserListItem = Pick<User, 'id' | 'username' | 'name' | 'status'>;

// 상세 조회용: 전체 + 관계 데이터
interface UserDetail extends User {
  roles: Role[];
  permissions: string[];
}

// 사용 예시
const createUser = async (data: CreateUserDto): Promise<User> => {
  return await axiosInstance.post('/user', data);
};

const updateUser = async (id: number, data: UpdateUserDto): Promise<User> => {
  return await axiosInstance.patch(\`/user/\${id}\`, data);
};`
        },
        {
          id: 'record-type',
          title: 'Record 타입 활용',
          description: '키-값 매핑과 설정 객체',
          language: 'typescript',
          code: `// Record<K, V>: 키 타입 K, 값 타입 V인 객체

// 상태별 색상 매핑
type Status = 'active' | 'inactive' | 'pending';

const statusColors: Record<Status, string> = {
  active: '#4caf50',
  inactive: '#f44336',
  pending: '#ff9800',
};

// 다국어 지원
type Locale = 'en' | 'ko' | 'zh' | 'vi';

interface Translation {
  title: string;
  description: string;
}

const translations: Record<Locale, Translation> = {
  en: { title: 'Users', description: 'Manage users' },
  ko: { title: '사용자', description: '사용자 관리' },
  zh: { title: '用户', description: '用户管理' },
  vi: { title: 'Người dùng', description: 'Quản lý người dùng' },
};

// 폼 에러 상태
type FormField = 'username' | 'email' | 'password';

const formErrors: Partial<Record<FormField, string>> = {
  email: '유효한 이메일을 입력하세요',  // 일부 필드만 에러
};

// 동적 키 객체
const userById: Record<number, User> = {
  1: { id: 1, name: 'Kim', ... },
  2: { id: 2, name: 'Lee', ... },
};`
        },
        {
          id: 'combined-utility',
          title: '유틸리티 타입 조합',
          description: '복잡한 타입 변환',
          language: 'typescript',
          code: `// 유틸리티 타입 조합으로 복잡한 타입 생성

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  categoryId: number;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  createdAt: string;
  updatedAt: string;
}

// 1. 작성 DTO: 자동 생성 필드 제외
type CreatePostDto = Omit<Post, 'id' | 'views' | 'createdAt' | 'updatedAt'>;

// 2. 수정 DTO: 작성 DTO의 모든 필드를 선택적으로
type UpdatePostDto = Partial<CreatePostDto>;

// 3. 목록 아이템: 내용 제외, 읽기 전용
type PostListItem = Readonly<Omit<Post, 'content'>>;

// 4. 작성 폼 초기값: 필수 필드만, 나머지 선택적
type PostFormData = Pick<Post, 'title' | 'content'> &
  Partial<Pick<Post, 'categoryId' | 'tags' | 'status'>>;

// 5. 관계 데이터 포함
interface PostWithRelations extends Post {
  author: Pick<User, 'id' | 'name'>;
  category: { id: number; name: string };
}

// 실제 사용
const initialFormData: PostFormData = {
  title: '',     // 필수
  content: '',   // 필수
  // categoryId, tags, status는 선택적
};`
        }
      ],
      tips: [
        '✅ Entity → DTO 변환에 Omit과 Partial을 활용하세요.',
        '✅ API 응답과 폼 데이터의 타입을 명확히 분리하세요.',
        'ℹ️ Record는 동적 키를 가진 객체에 타입을 부여할 때 유용합니다.',
        '⚠️ 너무 복잡한 타입 조합은 가독성을 해칩니다. 필요시 타입 별칭을 만드세요.'
      ]
    },
    {
      id: 'conditional-types',
      title: 'Conditional Types',
      titleKo: '조건부 타입과 타입 추론',
      content: `
## 조건부 타입 (Conditional Types)

조건에 따라 **다른 타입을 반환**하는 타입입니다.

### 기본 문법

\`\`\`typescript
T extends U ? X : Y
\`\`\`

- T가 U에 할당 가능하면 X, 아니면 Y

### 예시

\`\`\`typescript
// 배열이면 요소 타입 추출, 아니면 그대로
type ElementOf<T> = T extends (infer E)[] ? E : T;

type A = ElementOf<string[]>;   // string
type B = ElementOf<number>;     // number

// NonNullable 구현
type NonNullable<T> = T extends null | undefined ? never : T;

type C = NonNullable<string | null>;  // string
\`\`\`

### infer 키워드

조건부 타입 내에서 **타입 변수를 추론**합니다.

\`\`\`typescript
// 함수의 반환 타입 추출
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser(): User { ... }
type UserType = ReturnType<typeof getUser>;  // User

// Promise의 내부 타입 추출
type Awaited<T> = T extends Promise<infer U> ? U : T;

type D = Awaited<Promise<string>>;  // string
\`\`\`
      `,
      codeExamples: [
        {
          id: 'api-response-inference',
          title: 'API 응답 타입 추론',
          description: '조건부 타입으로 응답 타입 추출',
          language: 'typescript',
          code: `// API 응답에서 data 타입 추출
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

// ApiResponse에서 data 타입 추출
type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;

// 사용
type UserResponse = ApiResponse<User>;
type ExtractedUser = ExtractData<UserResponse>;  // User

// 함수 반환 타입에서 응답 데이터 추출
async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const res = await axiosInstance.get('/users');
  return res.data;
}

type FetchUsersReturn = Awaited<ReturnType<typeof fetchUsers>>;
// ApiResponse<User[]>

type UsersData = ExtractData<FetchUsersReturn>;
// User[]

// 실용적인 타입 유틸리티
type ApiData<T extends (...args: any[]) => Promise<ApiResponse<any>>> =
  ExtractData<Awaited<ReturnType<T>>>;

type Users = ApiData<typeof fetchUsers>;  // User[]`
        },
        {
          id: 'discriminated-union',
          title: '판별 유니온 타입',
          description: '태그로 타입 좁히기',
          language: 'typescript',
          code: `// 판별 유니온 (Discriminated Union)
// 공통 속성(태그)으로 타입을 구분

type ApiResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' };

function handleResult<T>(result: ApiResult<T>): T | null {
  switch (result.status) {
    case 'success':
      // 이 블록에서 result.data 접근 가능 (타입 좁혀짐)
      return result.data;
    case 'error':
      // 이 블록에서 result.error 접근 가능
      console.error(result.error);
      return null;
    case 'loading':
      // data나 error 없음
      return null;
  }
}

// 액션 타입 정의 (Redux 스타일)
type UserAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'UPDATE_USER'; payload: { id: number; data: Partial<User> } };

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'UPDATE_USER':
      // action.payload.id와 action.payload.data 접근 가능
      return state;
  }
}`
        },
        {
          id: 'mapped-conditional',
          title: '매핑된 조건부 타입',
          description: '객체의 각 속성에 조건 적용',
          language: 'typescript',
          code: `// 매핑된 타입 + 조건부 타입 조합

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isAdmin: boolean;
}

// 문자열 속성만 선택
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type UserStringKeys = StringKeys<User>;  // "name" | "email"

// 함수 속성만 필수로, 나머지는 선택적으로
type Config = {
  name: string;
  value: number;
  onChange: (value: number) => void;
  onReset?: () => void;
};

type FunctionsRequired<T> = {
  [K in keyof T as T[K] extends Function ? K : never]-?: T[K];
} & {
  [K in keyof T as T[K] extends Function ? never : K]?: T[K];
};

type ConfigMapped = FunctionsRequired<Config>;
// { onChange: (value: number) => void } & { name?: string; value?: number; onReset?: () => void; }

// 실용적 예: 폼 필드 타입 자동 생성
type FormFieldType<T> = T extends string
  ? 'text'
  : T extends number
  ? 'number'
  : T extends boolean
  ? 'checkbox'
  : T extends Date
  ? 'date'
  : 'custom';

type UserFormFields = {
  [K in keyof User]: {
    name: K;
    type: FormFieldType<User[K]>;
    value: User[K];
  };
};
// { id: { name: 'id', type: 'number', value: number }, ... }`
        }
      ],
      tips: [
        '✅ 조건부 타입은 타입 레벨의 if-else입니다.',
        '✅ infer로 복잡한 타입에서 원하는 부분을 추출하세요.',
        '⚠️ 조건부 타입이 복잡해지면 별도 유틸리티 타입으로 분리하세요.',
        'ℹ️ ReturnType, Parameters, Awaited 등 내장 유틸리티를 활용하세요.'
      ]
    },
    {
      id: 'type-guards',
      title: 'Type Guards',
      titleKo: '타입 가드와 타입 단언',
      content: `
## 타입 가드 (Type Guards)

런타임에 타입을 확인하여 **타입을 좁히는** 기법입니다.

### 타입 가드의 종류

| 종류 | 사용법 | 예시 |
|------|--------|------|
| typeof | 원시 타입 확인 | \`typeof x === 'string'\` |
| instanceof | 클래스 인스턴스 확인 | \`x instanceof Date\` |
| in | 속성 존재 확인 | \`'name' in x\` |
| 사용자 정의 | 커스텀 로직 | \`isUser(x)\` |

### typeof 가드

\`\`\`typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    // 이 블록에서 value는 string
    return value.toUpperCase();
  }
  // 이 블록에서 value는 number
  return value.toFixed(2);
}
\`\`\`

### in 가드

\`\`\`typescript
interface Bird { fly(): void; }
interface Fish { swim(): void; }

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly();  // Bird로 좁혀짐
  } else {
    animal.swim(); // Fish로 좁혀짐
  }
}
\`\`\`

### 사용자 정의 타입 가드

\`\`\`typescript
// 반환 타입에 'is' 사용
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    // value는 string으로 좁혀짐
    console.log(value.toUpperCase());
  }
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'api-error-guard',
          title: 'API 에러 타입 가드',
          description: '에러 응답 구분',
          language: 'typescript',
          code: `// API 에러 타입 정의
interface ApiError {
  status: number;
  message: string;
  code: string;
}

interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  fields: Record<string, string[]>;
}

interface AuthError extends ApiError {
  code: 'AUTH_ERROR' | 'TOKEN_EXPIRED';
}

// 타입 가드 함수들
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    'code' in error
  );
}

function isValidationError(error: ApiError): error is ValidationError {
  return error.code === 'VALIDATION_ERROR' && 'fields' in error;
}

function isAuthError(error: ApiError): error is AuthError {
  return error.code === 'AUTH_ERROR' || error.code === 'TOKEN_EXPIRED';
}

// 에러 핸들러
function handleApiError(error: unknown) {
  if (!isApiError(error)) {
    console.error('Unknown error:', error);
    return;
  }

  if (isValidationError(error)) {
    // ValidationError로 좁혀짐
    Object.entries(error.fields).forEach(([field, messages]) => {
      console.error(\`\${field}: \${messages.join(', ')}\`);
    });
  } else if (isAuthError(error)) {
    // AuthError로 좁혀짐
    if (error.code === 'TOKEN_EXPIRED') {
      refreshToken();
    } else {
      redirectToLogin();
    }
  } else {
    showError(error.message);
  }
}`
        },
        {
          id: 'assertion-functions',
          title: '단언 함수 (Assertion Functions)',
          description: 'asserts 키워드 활용',
          language: 'typescript',
          code: `// 단언 함수: 조건 불만족 시 예외 발생
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Expected string');
  }
}

function processValue(value: unknown) {
  assertIsString(value);
  // 이후 value는 string으로 확정
  console.log(value.toUpperCase());
}

// Non-null 단언
function assertIsDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined');
  }
}

// 사용
function processUser(user: User | null) {
  assertIsDefined(user);
  // user는 User로 확정
  console.log(user.name);
}

// 실전 예: API 응답 검증
function assertApiSuccess<T>(
  response: ApiResult<T>
): asserts response is { status: 'success'; data: T } {
  if (response.status !== 'success') {
    throw new Error(
      response.status === 'error' ? response.error : 'Request failed'
    );
  }
}

async function fetchUser(id: number): Promise<User> {
  const response = await api.getUser(id);
  assertApiSuccess(response);
  // response.data가 User로 확정됨
  return response.data;
}`
        },
        {
          id: 'type-assertion-best',
          title: '타입 단언 (as) 올바른 사용',
          description: '타입 단언의 위험과 대안',
          language: 'typescript',
          code: `// 타입 단언 (Type Assertion)
// 컴파일러에게 "내가 타입을 안다"고 알려줌

// ❌ 위험한 사용: 런타임 오류 가능
const user = {} as User;
console.log(user.name.toUpperCase());  // 런타임 오류!

// ✅ 안전한 사용 1: 외부 데이터 변환 후
const apiData = await fetchData();
if (isUser(apiData)) {
  // 타입 가드로 검증 후 사용
  const user = apiData;
}

// ✅ 안전한 사용 2: 타입 좁히기 불가능한 경우
const element = document.getElementById('app') as HTMLDivElement;
// 또는 non-null assertion
const element2 = document.getElementById('app')!;

// ✅ 안전한 사용 3: 리터럴 타입 단언
const config = {
  env: 'development' as const,  // 'development' 리터럴 타입
  port: 3000 as const,
};

// ❌ 피해야 할 패턴
const data = JSON.parse(response) as User;  // 검증 없이 단언

// ✅ 대신 타입 가드 사용
function parseUser(data: unknown): User | null {
  if (isUser(data)) {
    return data;
  }
  return null;
}

// 또는 Zod 같은 런타임 검증 라이브러리 사용
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const parsedUser = UserSchema.parse(data);  // 런타임 검증 + 타입 추론`
        }
      ],
      tips: [
        '✅ 타입 가드는 런타임 안전성과 타입 안전성을 모두 제공합니다.',
        '✅ as 단언보다 타입 가드를 선호하세요.',
        '⚠️ as 단언은 컴파일러를 무시하므로 런타임 오류 가능성이 있습니다.',
        'ℹ️ 외부 데이터는 Zod, Yup 등 런타임 검증 라이브러리로 검증하세요.'
      ]
    },
    {
      id: 'interface-vs-type',
      title: 'Interface vs Type',
      titleKo: '인터페이스 vs 타입 별칭',
      content: `
## Interface vs Type Alias

둘 다 타입을 정의하지만 **사용 목적과 기능**이 다릅니다.

### 주요 차이점

| 특성 | Interface | Type |
|------|-----------|------|
| 선언 병합 | ✅ 가능 | ❌ 불가능 |
| extends | ✅ 가능 | ❌ (& 사용) |
| implements | ✅ 가능 | ✅ 가능 |
| 유니온/교차 | ❌ 불가능 | ✅ 가능 |
| 원시 타입 별칭 | ❌ 불가능 | ✅ 가능 |
| 매핑된 타입 | ❌ 불가능 | ✅ 가능 |

### 선언 병합 (Declaration Merging)

\`\`\`typescript
// Interface는 같은 이름으로 여러 번 선언 가능 (병합됨)
interface User {
  id: number;
}

interface User {
  name: string;  // 기존에 추가됨
}

// 결과: { id: number; name: string; }

// Type은 중복 선언 불가
type Product = { id: number; };
type Product = { name: string; };  // ❌ 에러!
\`\`\`

### 권장 사용 가이드

| 상황 | 추천 | 이유 |
|------|------|------|
| 객체 구조 정의 | Interface | 확장성, 선언 병합 |
| 유니온 타입 | Type | Interface 불가능 |
| 유틸리티 타입 결과 | Type | 표현력 |
| 함수 타입 | Type | 가독성 |
| 라이브러리 확장 | Interface | 선언 병합 |
      `,
      codeExamples: [
        {
          id: 'interface-extension',
          title: 'Interface 확장',
          description: 'extends와 선언 병합',
          language: 'typescript',
          code: `// Interface 확장

// 1. extends로 확장
interface Entity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface User extends Entity {
  username: string;
  email: string;
}

// 2. 다중 상속
interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

interface Identifiable {
  id: number;
}

interface User extends Timestamped, Identifiable {
  name: string;
}

// 3. 선언 병합 활용 - 라이브러리 타입 확장
// @types/express에 정의된 Request 확장
declare global {
  namespace Express {
    interface Request {
      user?: User;           // 추가
      session?: SessionData; // 추가
    }
  }
}

// 이제 req.user 사용 가능
app.get('/profile', (req, res) => {
  const user = req.user;  // User | undefined
});

// 4. 환경 변수 타입 확장
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      API_KEY: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

// process.env.DATABASE_URL 타입 안전`
        },
        {
          id: 'type-alias-power',
          title: 'Type Alias의 강력한 기능',
          description: '유니온, 조건부, 매핑 타입',
          language: 'typescript',
          code: `// Type Alias만 가능한 것들

// 1. 유니온 타입
type Status = 'pending' | 'approved' | 'rejected';
type Result<T> = { success: true; data: T } | { success: false; error: string };

// Interface로는 불가능
// interface Status = 'pending' | 'approved' | 'rejected';  // ❌

// 2. 원시 타입 별칭
type ID = number | string;
type Callback = (error: Error | null, data: any) => void;

// 3. 조건부 타입
type NonNullable<T> = T extends null | undefined ? never : T;
type ElementType<T> = T extends (infer E)[] ? E : never;

// 4. 매핑된 타입
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Optional<T> = { [K in keyof T]?: T[K] };

// 5. 템플릿 리터럴 타입
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiRoute = \`/api/\${string}\`;
type EventName = \`on\${Capitalize<string>}\`;

// 6. 튜플 타입
type Point = [number, number];
type RGB = [number, number, number];
type UseStateReturn<T> = [T, (value: T) => void];

// 7. 복잡한 타입 조합
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type AsyncFunction<T> = () => Promise<T>;
type Awaited<T> = T extends Promise<infer U> ? U : T;`
        },
        {
          id: 'practical-guidelines',
          title: '실전 가이드라인',
          description: '프로젝트에서의 선택 기준',
          language: 'typescript',
          code: `// 실전 타입 정의 가이드라인

// ✅ Interface 사용: 객체 구조, 클래스 계약
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserService {
  getUser(id: number): Promise<User>;
  createUser(data: CreateUserDto): Promise<User>;
}

class UserServiceImpl implements UserService {
  async getUser(id: number) { ... }
  async createUser(data: CreateUserDto) { ... }
}

// ✅ Type 사용: 유틸리티, 유니온, 조합
type CreateUserDto = Omit<User, 'id'>;
type UpdateUserDto = Partial<CreateUserDto>;
type UserRole = 'admin' | 'user' | 'guest';
type UserWithRole = User & { role: UserRole };

// ✅ 컴포넌트 Props - 둘 다 가능, 일관성 유지
// Interface 스타일 (확장성 중시)
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

// Type 스타일 (간결함 중시)
type ButtonProps = {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
};

// 🎯 프로젝트 컨벤션 예시
// - Entity/Model: interface
// - DTO: type (유틸리티 타입 활용)
// - Props: interface (일관성)
// - 유틸리티/유니온: type
// - 함수 타입: type`
        }
      ],
      tips: [
        '✅ 프로젝트 내에서 일관된 컨벤션을 유지하세요.',
        '✅ 객체 구조는 interface, 유니온/유틸리티는 type이 일반적입니다.',
        'ℹ️ 라이브러리 타입을 확장할 때는 interface의 선언 병합을 활용하세요.',
        '⚠️ 과도한 타입 복잡성은 코드 이해를 방해합니다. 단순함을 유지하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'TypeScript Handbook - Generics',
      url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
      type: 'documentation'
    },
    {
      title: 'TypeScript Handbook - Utility Types',
      url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html',
      type: 'documentation'
    },
    {
      title: 'TypeScript Deep Dive',
      url: 'https://basarat.gitbook.io/typescript/',
      type: 'article'
    }
  ],
  status: 'ready'
};

export default chapter;
