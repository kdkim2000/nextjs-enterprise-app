/**
 * Chapter 8: 보안 베스트 프랙티스
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'security',
  order: 8,
  title: 'Security Best Practices',
  titleKo: '보안 베스트 프랙티스',
  description: 'Learn essential security practices for React/Next.js applications.',
  descriptionKo: 'React/Next.js 애플리케이션을 위한 필수 보안 실천 방법을 학습합니다.',
  estimatedMinutes: 60,
  objectives: [
    'Prevent XSS attacks',
    'Implement CSRF protection',
    'Understand authentication patterns (JWT, Session)',
    'Manage environment variables securely',
    'Scan for dependency vulnerabilities'
  ],
  objectivesKo: [
    'XSS 공격을 방지한다',
    'CSRF 방지 전략을 구현한다',
    '인증/인가 패턴(JWT, Session)을 이해한다',
    '환경 변수를 안전하게 관리한다',
    '의존성 취약점을 검사한다'
  ],
  sections: [
    {
      id: 'xss-prevention',
      title: 'XSS Prevention',
      titleKo: 'XSS 방지 (dangerouslySetInnerHTML, DOMPurify)',
      content: `
## XSS (Cross-Site Scripting)란?

**XSS**는 악성 스크립트를 웹 페이지에 삽입하는 공격입니다.

### XSS 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| **Stored XSS** | DB에 저장된 악성 코드 | 게시글, 댓글 |
| **Reflected XSS** | URL 파라미터 반영 | 검색 결과 |
| **DOM XSS** | 클라이언트에서 실행 | innerHTML 조작 |

### React의 기본 보호

React는 JSX에서 **자동 이스케이프**합니다:

\`\`\`tsx
const userInput = '<script>alert("XSS")</script>';

// ✅ 안전: 텍스트로 렌더링됨
<div>{userInput}</div>

// 결과: &lt;script&gt;alert("XSS")&lt;/script&gt;
\`\`\`

### 위험한 패턴

\`\`\`tsx
// ❌ 위험: XSS 가능
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ 위험: eval 사용
eval(userInput);

// ❌ 위험: href에 javascript:
<a href={userInput}>Click</a>  // javascript:alert('XSS')
\`\`\`
      `,
      codeExamples: [
        {
          id: 'dompurify-usage',
          title: 'DOMPurify로 HTML 정화',
          description: '안전한 HTML 렌더링',
          language: 'tsx',
          code: `// DOMPurify 설치
// npm install dompurify
// npm install -D @types/dompurify

import DOMPurify from 'dompurify';

// 기본 사용
function SafeHTML({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// 옵션 설정
function RichContent({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content, {
    // 허용할 태그
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],

    // 허용할 속성
    ALLOWED_ATTR: ['href', 'target', 'rel'],

    // href의 프로토콜 제한
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,

    // 스타일 제거
    FORBID_ATTR: ['style', 'onerror', 'onclick'],
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// 링크 처리
function SafeLink({ href, children }: { href: string; children: React.ReactNode }) {
  // javascript: 프로토콜 차단
  const isSafe = /^(https?:\\/\\/|mailto:|tel:|\\/)/.test(href);

  if (!isSafe) {
    console.warn('Blocked unsafe href:', href);
    return <span>{children}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"  // 보안 속성 추가
    >
      {children}
    </a>
  );
}

// 마크다운 렌더링 (react-markdown + rehype-sanitize)
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

function SafeMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeSanitize]}
    >
      {content}
    </ReactMarkdown>
  );
}`
        },
        {
          id: 'input-validation',
          title: '입력 검증',
          description: '서버/클라이언트 검증',
          language: 'typescript',
          code: `// 입력 검증 (Zod 사용)
import { z } from 'zod';

// 스키마 정의
const userInputSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력하세요')
    .max(50, '이름은 50자 이내여야 합니다')
    .regex(/^[가-힣a-zA-Z\\s]+$/, '한글과 영문만 가능합니다'),

  email: z
    .string()
    .email('유효한 이메일을 입력하세요')
    .max(100),

  // HTML 태그 금지
  comment: z
    .string()
    .max(1000)
    .refine(
      (val) => !/<[^>]*>/g.test(val),
      'HTML 태그는 사용할 수 없습니다'
    ),

  // URL 검증
  website: z
    .string()
    .url()
    .refine(
      (val) => val.startsWith('https://'),
      'HTTPS URL만 허용됩니다'
    )
    .optional(),
});

// API Route에서 검증
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 서버에서 검증 (절대 신뢰하지 않음)
    const validated = userInputSchema.parse(body);

    // 추가 정화
    const sanitizedComment = DOMPurify.sanitize(validated.comment, {
      ALLOWED_TAGS: [], // 모든 태그 제거
    });

    // DB 저장
    const user = await prisma.user.create({
      data: {
        ...validated,
        comment: sanitizedComment,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}`
        }
      ],
      tips: [
        '✅ 사용자 입력을 HTML로 렌더링해야 하면 반드시 DOMPurify를 사용하세요.',
        '✅ 클라이언트와 서버 모두에서 입력을 검증하세요.',
        '⚠️ dangerouslySetInnerHTML은 정화된 콘텐츠에만 사용하세요.',
        'ℹ️ CSP(Content Security Policy) 헤더로 추가 보호가 가능합니다.'
      ]
    },
    {
      id: 'csrf-protection',
      title: 'CSRF Protection',
      titleKo: 'CSRF 방지 전략',
      content: `
## CSRF (Cross-Site Request Forgery)란?

**CSRF**는 인증된 사용자가 의도하지 않은 요청을 보내게 하는 공격입니다.

### 공격 시나리오

\`\`\`
1. 사용자가 bank.com에 로그인 (쿠키 저장)
2. 악성 사이트 방문
3. 악성 사이트가 은밀히 bank.com/transfer 요청
4. 브라우저가 자동으로 쿠키 포함 → 인증된 요청!
\`\`\`

### 방어 방법

| 방법 | 설명 |
|------|------|
| **CSRF 토큰** | 각 요청에 고유 토큰 포함 |
| **SameSite 쿠키** | 쿠키 전송 범위 제한 |
| **Origin 검증** | 요청 출처 확인 |
| **Double Submit** | 쿠키와 헤더 값 비교 |
      `,
      codeExamples: [
        {
          id: 'csrf-token',
          title: 'CSRF 토큰 구현',
          description: 'Next.js에서 CSRF 보호',
          language: 'typescript',
          code: `// CSRF 토큰 생성 및 검증

// lib/csrf.ts
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// 토큰 생성
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

// 토큰 설정 (Server Component/Route Handler)
export async function setCsrfToken(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1시간
  });

  return token;
}

// 토큰 검증 (Middleware/Route Handler)
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // 상수 시간 비교 (타이밍 공격 방지)
  return timingSafeEqual(cookieToken, headerToken);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// 클라이언트에서 CSRF 토큰 포함
// lib/axios.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
});

// 모든 요청에 CSRF 토큰 포함
apiClient.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf-token='))
    ?.split('=')[1];

  if (token && config.method !== 'get') {
    config.headers['x-csrf-token'] = token;
  }

  return config;
});`
        },
        {
          id: 'samesite-cookies',
          title: 'SameSite 쿠키 설정',
          description: '쿠키 보안 옵션',
          language: 'typescript',
          code: `// 쿠키 보안 설정

// 인증 쿠키 설정
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('auth-token', token, {
    // 자바스크립트 접근 차단 (XSS 방지)
    httpOnly: true,

    // HTTPS에서만 전송
    secure: process.env.NODE_ENV === 'production',

    // 같은 사이트에서만 전송 (CSRF 방지)
    sameSite: 'strict',  // 또는 'lax'

    // 쿠키 유효 경로
    path: '/',

    // 만료 시간 (초)
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
}

// SameSite 옵션 설명
// - 'strict': 같은 사이트 요청에만 전송
//             외부 링크로 접근 시 쿠키 없음
// - 'lax': GET 요청(링크 클릭)은 허용
//          POST 요청은 차단 (기본값)
// - 'none': 모든 요청에 전송 (secure 필수)
//           서드파티 쿠키 필요 시

// middleware.ts에서 쿠키 검증
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 상태 변경 요청에서 Origin 검증
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Origin이 다르면 CSRF 공격 가능성
    if (origin && !origin.includes(host!)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}`
        }
      ],
      tips: [
        '✅ 상태 변경 요청(POST, PUT, DELETE)에는 CSRF 보호를 적용하세요.',
        '✅ SameSite=Strict가 가장 안전하지만 UX를 고려하여 Lax도 고려하세요.',
        '⚠️ GET 요청으로 상태를 변경하지 마세요.',
        'ℹ️ Next.js의 Server Actions는 자동 CSRF 보호가 포함됩니다.'
      ]
    },
    {
      id: 'auth-patterns',
      title: 'Authentication Patterns',
      titleKo: '인증/인가 패턴 (JWT, Session)',
      content: `
## JWT vs Session

| 특성 | JWT | Session |
|------|-----|---------|
| 저장 위치 | 클라이언트 | 서버 |
| 상태 | Stateless | Stateful |
| 확장성 | 높음 | 세션 저장소 필요 |
| 무효화 | 어려움 | 즉시 가능 |
| 크기 | 큼 (페이로드) | 작음 (ID만) |

### JWT 보안 고려사항

- 민감한 정보를 페이로드에 넣지 않음
- 적절한 만료 시간 설정
- Refresh Token으로 토큰 갱신
- 블랙리스트로 무효화 (필요 시)
      `,
      codeExamples: [
        {
          id: 'jwt-implementation',
          title: 'JWT 인증 구현',
          description: 'Access Token + Refresh Token',
          language: 'typescript',
          code: `// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

// Access Token 생성 (짧은 수명)
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',  // 15분
  });
}

// Refresh Token 생성 (긴 수명)
export function generateRefreshToken(userId: number): string {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',  // 7일
  });
}

// Access Token 검증
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Refresh Token 검증
export function verifyRefreshToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

// 토큰 갱신 엔드포인트
// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh-token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // 사용자 정보 조회
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  // 새 토큰 발급
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return NextResponse.json({ accessToken: newAccessToken });
}`
        },
        {
          id: 'auth-context',
          title: 'AuthContext 보안 분석',
          description: '현재 프로젝트 인증 패턴',
          fileName: 'src/providers/AuthProvider.tsx',
          language: 'tsx',
          code: `// AuthProvider 보안 분석

// ✅ 좋은 패턴
// 1. Context로 인증 상태 중앙 관리
// 2. 로딩 상태 처리로 플래시 방지
// 3. 토큰 갱신 로직 포함

// ⚠️ 개선 가능한 부분
// 1. 토큰을 localStorage 대신 httpOnly 쿠키로
// 2. Refresh Token 추가
// 3. 토큰 만료 자동 감지

// 개선된 AuthProvider 예시
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // httpOnly 쿠키로 인증 - 토큰이 JavaScript에 노출되지 않음
        const response = await fetch('/api/auth/me', {
          credentials: 'include',  // 쿠키 포함
        });

        if (response.ok) {
          const user = await response.json();
          setState({ user, isLoading: false, isAuthenticated: true });
        } else {
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      } catch {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    };

    checkAuth();
  }, []);

  // 자동 토큰 갱신
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // 갱신 실패 시 로그아웃
        logout();
      }
    }, 14 * 60 * 1000); // 14분마다

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated]);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const user = await response.json();
    setState({ user, isLoading: false, isAuthenticated: true });
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}`
        }
      ],
      tips: [
        '✅ Access Token은 짧게(15분), Refresh Token은 길게(7일) 설정하세요.',
        '✅ 토큰은 httpOnly 쿠키에 저장하여 XSS로부터 보호하세요.',
        '⚠️ JWT 페이로드에는 민감한 정보(비밀번호, 개인정보)를 넣지 마세요.',
        'ℹ️ 중요한 작업(결제, 비밀번호 변경)에는 재인증을 요구하세요.'
      ]
    },
    {
      id: 'env-management',
      title: 'Environment Variables',
      titleKo: '환경 변수 관리',
      content: `
## 환경 변수 보안

### Next.js 환경 변수 규칙

| 접두사 | 접근 범위 | 용도 |
|--------|----------|------|
| NEXT_PUBLIC_ | 클라이언트 + 서버 | 공개 가능한 값 |
| (없음) | 서버만 | 시크릿, API 키 |

### 민감한 정보 관리

\`\`\`
# ❌ 클라이언트에 노출됨
NEXT_PUBLIC_API_KEY=secret123

# ✅ 서버에서만 접근
DATABASE_URL=postgresql://...
JWT_SECRET=supersecret
API_KEY=secret123
\`\`\`
      `,
      codeExamples: [
        {
          id: 'env-validation',
          title: '환경 변수 검증',
          description: 'Zod로 환경 변수 타입 검증',
          fileName: 'lib/env.ts',
          language: 'typescript',
          code: `// lib/env.ts
import { z } from 'zod';

// 서버 전용 환경 변수
const serverEnvSchema = z.object({
  // 데이터베이스
  DATABASE_URL: z.string().url(),

  // 인증
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // 외부 API
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  SENDGRID_API_KEY: z.string(),

  // 환경
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

// 클라이언트 공개 환경 변수
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().startsWith('pk_'),
});

// 서버에서만 실행
function validateServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:');
    console.error(parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

// 클라이언트에서도 실행 가능
function validateClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  });

  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:');
    console.error(parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

// 타입 안전한 환경 변수
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();

// 사용
// import { serverEnv } from '@/lib/env';
// const dbUrl = serverEnv.DATABASE_URL;  // 타입 안전!`
        },
        {
          id: 'env-files',
          title: '환경 파일 관리',
          description: '.env 파일 구성',
          language: 'typescript',
          code: `# .env.example (버전 관리에 포함)
# 필수 환경 변수 목록과 설명

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db

# Authentication
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# External APIs
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG....

# Public (클라이언트 노출)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# ----------------------------

# .gitignore
.env
.env.local
.env.*.local
!.env.example

# ----------------------------

# 환경별 파일
# .env.development   - 개발 환경 (git 제외)
# .env.production    - 프로덕션 환경 (git 제외)
# .env.local         - 로컬 오버라이드 (git 제외)

# CI/CD에서는 GitHub Secrets/Vercel env 사용`
        }
      ],
      tips: [
        '✅ .env.example 파일로 필요한 환경 변수를 문서화하세요.',
        '✅ 서버 전용 시크릿에는 NEXT_PUBLIC_ 접두사를 붙이지 마세요.',
        '⚠️ .env 파일은 절대 git에 커밋하지 마세요.',
        'ℹ️ 환경 변수 검증으로 배포 시 누락을 방지하세요.'
      ]
    },
    {
      id: 'dependency-security',
      title: 'Dependency Security',
      titleKo: '의존성 취약점 검사',
      content: `
## 의존성 보안

### npm audit

\`\`\`bash
# 취약점 검사
npm audit

# 자동 수정 (안전한 것만)
npm audit fix

# 강제 수정 (주의 필요)
npm audit fix --force
\`\`\`

### Dependabot 설정

GitHub Dependabot으로 자동 취약점 감지 및 PR 생성

### 보안 도구

| 도구 | 기능 |
|------|------|
| npm audit | npm 내장 취약점 검사 |
| Snyk | 종합 보안 스캔 |
| Dependabot | 자동 업데이트 PR |
| Socket | 공급망 공격 탐지 |
      `,
      codeExamples: [
        {
          id: 'dependabot-config',
          title: 'Dependabot 설정',
          description: '자동 의존성 업데이트',
          fileName: '.github/dependabot.yml',
          language: 'typescript',
          code: `# .github/dependabot.yml
version: 2
updates:
  # npm 의존성
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Seoul"

    # PR 설정
    open-pull-requests-limit: 10

    # 버전 업데이트 전략
    versioning-strategy: increase

    # 라벨
    labels:
      - "dependencies"
      - "security"

    # 리뷰어
    reviewers:
      - "team-lead"

    # 무시할 의존성
    ignore:
      - dependency-name: "aws-sdk"
        update-types: ["version-update:semver-major"]

    # 그룹화
    groups:
      dev-dependencies:
        dependency-type: "development"
      production-dependencies:
        dependency-type: "production"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"`
        },
        {
          id: 'security-workflow',
          title: '보안 검사 워크플로우',
          description: 'CI에서 보안 검사',
          fileName: '.github/workflows/security.yml',
          language: 'typescript',
          code: `# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # 매일 자정 실행
    - cron: '0 0 * * *'

jobs:
  audit:
    name: npm Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=high

  snyk:
    name: Snyk Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2`
        }
      ],
      tips: [
        '✅ CI에서 npm audit을 실행하여 취약점이 있는 PR을 차단하세요.',
        '✅ Dependabot으로 의존성을 자동으로 최신 상태로 유지하세요.',
        '⚠️ npm audit fix --force는 주요 버전 변경이 있을 수 있어 주의하세요.',
        'ℹ️ 정기적인 보안 스캔 스케줄을 설정하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'OWASP Top 10',
      url: 'https://owasp.org/www-project-top-ten/',
      type: 'documentation'
    },
    {
      title: 'React Security Best Practices',
      url: 'https://snyk.io/blog/10-react-security-best-practices/',
      type: 'article'
    },
    {
      title: 'Next.js Security Headers',
      url: 'https://nextjs.org/docs/advanced-features/security-headers',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
