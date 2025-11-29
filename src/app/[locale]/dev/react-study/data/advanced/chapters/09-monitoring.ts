/**
 * Chapter 9: 모니터링과 에러 추적
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'monitoring',
  order: 9,
  title: 'Monitoring and Error Tracking',
  titleKo: '모니터링과 에러 추적',
  description: 'Learn to implement comprehensive error tracking and performance monitoring.',
  descriptionKo: '포괄적인 에러 추적과 성능 모니터링을 구현하는 방법을 학습합니다.',
  estimatedMinutes: 60,
  objectives: [
    'Implement advanced Error Boundaries',
    'Integrate Sentry for error tracking',
    'Monitor Core Web Vitals',
    'Design logging strategies',
    'Track user behavior'
  ],
  objectivesKo: [
    'Error Boundary를 고급으로 활용한다',
    'Sentry를 통합하여 에러를 추적한다',
    'Core Web Vitals을 모니터링한다',
    '로깅 전략을 설계한다',
    '사용자 행동을 분석한다'
  ],
  sections: [
    {
      id: 'error-boundary-advanced',
      title: 'Advanced Error Boundary',
      titleKo: 'Error Boundary 고급 활용',
      content: `
## Error Boundary란?

**Error Boundary**는 하위 컴포넌트의 JavaScript 에러를 캐치하고 폴백 UI를 표시합니다.

### Error Boundary 동작

\`\`\`
                   ┌─────────────────────┐
                   │   Error Boundary    │
                   │   (에러 캐치)        │
                   └──────────┬──────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ↓                   ↓                   ↓
     [Component A]      [Component B]      [Component C]
          │                   │
          ↓                   ↓
    [Child A-1]   ← 에러 →  [Child B-1]

    Child B-1에서 에러 발생 시:
    - Error Boundary가 캐치
    - 전체 Boundary 영역에 폴백 UI 표시
\`\`\`

### Error Boundary가 캐치하지 못하는 에러

- 이벤트 핸들러 (try-catch 사용)
- 비동기 코드 (setTimeout, Promise)
- 서버 사이드 렌더링
- Error Boundary 자체의 에러
      `,
      codeExamples: [
        {
          id: 'error-boundary-class',
          title: 'Error Boundary 구현',
          description: '재사용 가능한 Error Boundary',
          fileName: 'src/components/common/ErrorBoundary.tsx',
          language: 'tsx',
          code: `// components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('Error caught by boundary:', error, errorInfo);

    // 콜백 호출
    this.props.onError?.(error, errorInfo);

    // Sentry 등 에러 트래킹 서비스로 전송
    // Sentry.captureException(error, { extra: errorInfo });
  }

  componentDidUpdate(prevProps: Props) {
    // resetKeys가 변경되면 에러 상태 리셋
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys !== this.props.resetKeys
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">오류가 발생했습니다</Typography>
            <Typography variant="body2" color="text.secondary">
              {this.state.error?.message}
            </Typography>
          </Alert>
          <Button variant="contained" onClick={this.resetError}>
            다시 시도
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// 사용
<ErrorBoundary
  fallback={<CustomErrorPage />}
  onError={(error, info) => logError(error, info)}
  resetKeys={[userId]}
>
  <UserProfile userId={userId} />
</ErrorBoundary>`
        },
        {
          id: 'granular-boundaries',
          title: '세분화된 Error Boundary',
          description: '영역별 에러 처리',
          language: 'tsx',
          code: `// 세분화된 Error Boundary 전략

// 1. 페이지 레벨 Boundary
function DashboardPage() {
  return (
    <ErrorBoundary fallback={<PageErrorFallback />}>
      <DashboardLayout>
        {/* 위젯별 독립적 Boundary */}
        <ErrorBoundary fallback={<WidgetError name="통계" />}>
          <StatsWidget />
        </ErrorBoundary>

        <ErrorBoundary fallback={<WidgetError name="차트" />}>
          <ChartWidget />
        </ErrorBoundary>

        <ErrorBoundary fallback={<WidgetError name="사용자 목록" />}>
          <UsersWidget />
        </ErrorBoundary>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

// 2. 위젯 에러 폴백
function WidgetError({ name }: { name: string }) {
  return (
    <Card sx={{ bgcolor: 'error.light', p: 2 }}>
      <Typography color="error">
        {name} 위젯을 불러올 수 없습니다
      </Typography>
      <Button size="small">새로고침</Button>
    </Card>
  );
}

// 3. 라우트 레벨 Error Boundary (Next.js)
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>문제가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}

// 4. 전역 에러 페이지
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>심각한 오류가 발생했습니다</h2>
        <button onClick={reset}>앱 재시작</button>
      </body>
    </html>
  );
}`
        }
      ],
      tips: [
        '✅ 세분화된 Error Boundary로 하나의 에러가 전체 UI를 망가뜨리지 않게 하세요.',
        '✅ Next.js의 error.tsx를 활용하면 라우트별 에러 처리가 가능합니다.',
        '⚠️ 이벤트 핸들러의 에러는 Error Boundary가 캐치하지 못합니다.',
        'ℹ️ 에러 발생 시 사용자가 복구할 수 있는 방법(재시도 버튼)을 제공하세요.'
      ]
    },
    {
      id: 'sentry-integration',
      title: 'Sentry Integration',
      titleKo: 'Sentry 통합',
      content: `
## Sentry란?

**Sentry**는 실시간 에러 추적, 성능 모니터링 서비스입니다.

### 주요 기능

| 기능 | 설명 |
|------|------|
| Error Tracking | 에러 자동 수집, 그룹화 |
| Performance | 트랜잭션 추적, 병목 탐지 |
| Session Replay | 에러 발생 상황 재현 |
| Release Tracking | 배포별 에러 추적 |

### 설치

\`\`\`bash
npx @sentry/wizard@latest -i nextjs
\`\`\`
      `,
      codeExamples: [
        {
          id: 'sentry-setup',
          title: 'Sentry 설정',
          description: 'Next.js Sentry 초기화',
          fileName: 'sentry.client.config.ts',
          language: 'typescript',
          code: `// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 설정
  environment: process.env.NODE_ENV,

  // 릴리스 버전
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // 샘플링 레이트
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 세션 리플레이
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 디버그 모드
  debug: process.env.NODE_ENV === 'development',

  // 통합 설정
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // 민감 정보 필터링
  beforeSend(event) {
    // PII 제거
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },

  // 무시할 에러
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    /Loading chunk \\d+ failed/,
  ],
});

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// sentry.edge.config.ts (Edge Runtime용)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});`
        },
        {
          id: 'sentry-usage',
          title: 'Sentry 활용',
          description: '에러 및 컨텍스트 전송',
          language: 'typescript',
          code: `import * as Sentry from '@sentry/nextjs';

// 1. 수동 에러 캡처
try {
  await processPayment(order);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'payment',
      orderId: order.id,
    },
    extra: {
      orderAmount: order.amount,
      paymentMethod: order.paymentMethod,
    },
  });
  throw error;
}

// 2. 사용자 컨텍스트 설정
Sentry.setUser({
  id: user.id,
  username: user.username,
  // email은 PII로 주의
});

// 3. 커스텀 태그
Sentry.setTag('page', 'checkout');
Sentry.setTag('theme', 'dark');

// 4. 브레드크럼 (이벤트 타임라인)
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked checkout button',
  level: 'info',
});

// 5. 성능 추적
const transaction = Sentry.startTransaction({
  name: 'checkout-flow',
  op: 'checkout',
});

const span = transaction.startChild({
  op: 'http',
  description: 'Create order API',
});

await createOrder(data);
span.finish();

await processPayment(orderId);
transaction.finish();

// 6. 컨텍스트 추가
Sentry.setContext('order', {
  id: order.id,
  items: order.items.length,
  total: order.total,
});

// 7. 메시지 로깅
Sentry.captureMessage('User completed checkout', 'info');

// 8. Error Boundary와 연동
class SentryErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }
}`
        }
      ],
      tips: [
        '✅ 프로덕션에서는 샘플링 레이트를 낮춰 비용을 관리하세요.',
        '✅ beforeSend로 민감한 정보가 전송되지 않도록 필터링하세요.',
        '⚠️ Sentry DSN은 공개되어도 되지만 악용 방지를 위해 도메인 제한을 설정하세요.',
        'ℹ️ Source Maps를 업로드하면 에러 위치를 정확히 파악할 수 있습니다.'
      ]
    },
    {
      id: 'web-vitals',
      title: 'Core Web Vitals',
      titleKo: '성능 모니터링 (Core Web Vitals)',
      content: `
## Core Web Vitals

Google이 정의한 사용자 경험 핵심 지표입니다.

### 주요 지표

| 지표 | 설명 | 좋음 | 개선 필요 |
|------|------|------|----------|
| **LCP** | Largest Contentful Paint | ≤2.5s | >4s |
| **INP** | Interaction to Next Paint | ≤200ms | >500ms |
| **CLS** | Cumulative Layout Shift | ≤0.1 | >0.25 |

### 측정 방법

\`\`\`typescript
// Next.js 기본 지원
// next.config.js
experimental: {
  webVitalsAttribution: ['CLS', 'LCP']
}

// pages/_app.tsx 또는 app/layout.tsx
export function reportWebVitals(metric) {
  console.log(metric);
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'web-vitals-reporting',
          title: 'Web Vitals 리포팅',
          description: '성능 지표 수집 및 전송',
          language: 'typescript',
          code: `// lib/analytics.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

type ReportCallback = (metric: Metric) => void;

// 분석 서비스로 전송
function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,  // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Beacon API (페이지 언로드 시에도 전송)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body);
  } else {
    fetch('/api/analytics', {
      body,
      method: 'POST',
      keepalive: true,
    });
  }
}

// Google Analytics 4로 전송
function sendToGA4(metric: Metric) {
  window.gtag?.('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  });
}

// Sentry로 전송
function sendToSentry(metric: Metric) {
  Sentry.captureMessage(\`Web Vital: \${metric.name}\`, {
    level: metric.rating === 'poor' ? 'warning' : 'info',
    tags: {
      webVital: metric.name,
      rating: metric.rating,
    },
    extra: {
      value: metric.value,
      delta: metric.delta,
    },
  });
}

// 모든 지표 수집
export function reportWebVitals(callback: ReportCallback = sendToAnalytics) {
  onCLS(callback);
  onINP(callback);
  onLCP(callback);
  onFCP(callback);
  onTTFB(callback);
}

// Next.js에서 사용
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/analytics';

export function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals((metric) => {
      sendToAnalytics(metric);
      sendToGA4(metric);

      // 성능이 나쁘면 Sentry에 보고
      if (metric.rating === 'poor') {
        sendToSentry(metric);
      }
    });
  }, []);

  return null;
}`
        },
        {
          id: 'performance-optimization',
          title: '성능 최적화 체크리스트',
          description: 'Core Web Vitals 개선',
          language: 'typescript',
          code: `// Core Web Vitals 최적화 체크리스트

// 1. LCP (Largest Contentful Paint) 개선
// - 이미지 최적화
import Image from 'next/image';
<Image
  src="/hero.jpg"
  alt="Hero"
  priority  // LCP 요소는 priority 사용
  sizes="100vw"
  quality={85}
/>

// - 폰트 최적화
import { Inter } from 'next/font/google';
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // FOUT 방지
});

// - 서버 응답 시간 단축
// next.config.js
module.exports = {
  experimental: {
    ppr: true,  // Partial Prerendering
  },
};

// 2. INP (Interaction to Next Paint) 개선
// - 이벤트 핸들러 최적화
const handleClick = useCallback(() => {
  // 무거운 작업은 비동기로
  startTransition(() => {
    setExpensiveState(compute());
  });
}, []);

// - 긴 작업 분할
async function processData(items: Item[]) {
  for (const item of items) {
    await processItem(item);
    // 메인 스레드 양보
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// 3. CLS (Cumulative Layout Shift) 개선
// - 이미지 크기 명시
<Image
  src="/photo.jpg"
  width={800}
  height={600}
  alt="Photo"
/>

// - 동적 콘텐츠 공간 예약
<div style={{ minHeight: 200 }}>
  {isLoading ? <Skeleton height={200} /> : <Content />}
</div>

// - 폰트 FOUT 방지
const font = localFont({
  src: './fonts/MyFont.woff2',
  display: 'swap',
  adjustFontFallback: 'Arial',  // 폴백 폰트 크기 조정
});`
        }
      ],
      tips: [
        '✅ LCP 요소(주로 메인 이미지)에는 priority를 사용하세요.',
        '✅ CLS 방지를 위해 이미지와 동적 콘텐츠의 크기를 명시하세요.',
        '⚠️ 무거운 작업은 Web Worker나 startTransition으로 분리하세요.',
        'ℹ️ Chrome DevTools의 Lighthouse와 Performance 탭으로 측정하세요.'
      ]
    },
    {
      id: 'logging-strategy',
      title: 'Logging Strategy',
      titleKo: '로깅 전략',
      content: `
## 로깅 레벨

| 레벨 | 용도 | 예시 |
|------|------|------|
| **error** | 심각한 오류 | 결제 실패, DB 연결 끊김 |
| **warn** | 경고 | 폐기 예정 API 사용 |
| **info** | 중요 정보 | 사용자 로그인, 주문 완료 |
| **debug** | 디버깅 | 함수 호출, 변수 값 |

### 구조화된 로깅

\`\`\`typescript
// 일반 로깅
console.log('User logged in');

// 구조화된 로깅
logger.info('User logged in', {
  userId: user.id,
  method: 'email',
  timestamp: new Date().toISOString(),
});
\`\`\`
      `,
      codeExamples: [
        {
          id: 'logger-implementation',
          title: '로거 구현',
          description: '구조화된 로깅 시스템',
          fileName: 'lib/logger.ts',
          language: 'typescript',
          code: `// lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private context: Record<string, unknown> = {};

  // 기본 컨텍스트 설정
  setContext(context: Record<string, unknown>) {
    this.context = { ...this.context, ...context };
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...meta },
    };

    // 개발 환경: 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
      const color = {
        debug: '\\x1b[36m',  // cyan
        info: '\\x1b[32m',   // green
        warn: '\\x1b[33m',   // yellow
        error: '\\x1b[31m',  // red
      }[level];

      console.log(
        \`\${color}[\${level.toUpperCase()}]\\x1b[0m \${message}\`,
        entry.context
      );
    }

    // 프로덕션: 외부 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToService(entry);
    }
  }

  private async sendToService(entry: LogEntry) {
    // LogDNA, Datadog, CloudWatch 등으로 전송
    try {
      await fetch('/api/logs', {
        method: 'POST',
        body: JSON.stringify(entry),
        keepalive: true,
      });
    } catch {
      // 로깅 실패는 무시 (무한 루프 방지)
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>) {
    this.log('error', message, {
      ...meta,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }
}

export const logger = new Logger();

// 사용 예시
logger.setContext({ service: 'web-app', version: '1.0.0' });

logger.info('User logged in', { userId: 123, method: 'oauth' });
logger.warn('API rate limit approaching', { remaining: 10 });
logger.error('Payment failed', error, { orderId: 456 });`
        },
        {
          id: 'request-logging',
          title: '요청 로깅',
          description: 'API 요청/응답 로깅',
          language: 'typescript',
          code: `// API Route 로깅 미들웨어

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // 요청 로깅
    logger.info('API Request', {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
    });

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      // 응답 로깅
      logger.info('API Response', {
        requestId,
        status: response.status,
        duration: \`\${duration}ms\`,
      });

      // 응답 헤더에 요청 ID 추가
      response.headers.set('x-request-id', requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 에러 로깅
      logger.error('API Error', error as Error, {
        requestId,
        duration: \`\${duration}ms\`,
      });

      return NextResponse.json(
        { error: 'Internal Server Error', requestId },
        { status: 500 }
      );
    }
  };
}

// 사용
// app/api/users/route.ts
export const GET = withLogging(async (request) => {
  const users = await getUsers();
  return NextResponse.json(users);
});`
        }
      ],
      tips: [
        '✅ 구조화된 JSON 로깅으로 검색과 분석을 용이하게 하세요.',
        '✅ 요청 ID로 관련 로그를 추적할 수 있게 하세요.',
        '⚠️ 민감한 정보(비밀번호, 토큰)는 로깅하지 마세요.',
        'ℹ️ 로그 레벨을 환경변수로 제어하여 프로덕션 로그를 관리하세요.'
      ]
    },
    {
      id: 'user-analytics',
      title: 'User Analytics',
      titleKo: '사용자 행동 분석',
      content: `
## 사용자 분석의 목적

1. **UX 개선**: 사용자 행동 패턴 파악
2. **문제 발견**: 이탈 지점, 에러 발생 경로
3. **기능 평가**: A/B 테스트, 기능 사용률
4. **비즈니스**: 전환율, 리텐션

### 분석 도구

| 도구 | 특징 |
|------|------|
| Google Analytics | 무료, 표준 |
| Mixpanel | 이벤트 중심, 퍼널 |
| Amplitude | 프로덕트 분석 |
| Posthog | 오픈소스, 세션 리플레이 |
      `,
      codeExamples: [
        {
          id: 'analytics-hook',
          title: '분석 훅 구현',
          description: '이벤트 트래킹 시스템',
          fileName: 'hooks/useAnalytics.ts',
          language: 'typescript',
          code: `// hooks/useAnalytics.ts
import { useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

// 분석 서비스 어댑터
interface AnalyticsProvider {
  track: (event: AnalyticsEvent) => void;
  page: (name: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
}

// Google Analytics 어댑터
const ga4Provider: AnalyticsProvider = {
  track: ({ name, properties }) => {
    window.gtag?.('event', name, properties);
  },
  page: (name, properties) => {
    window.gtag?.('event', 'page_view', {
      page_title: name,
      ...properties,
    });
  },
  identify: (userId) => {
    window.gtag?.('set', { user_id: userId });
  },
};

// Mixpanel 어댑터
const mixpanelProvider: AnalyticsProvider = {
  track: ({ name, properties }) => {
    window.mixpanel?.track(name, properties);
  },
  page: (name, properties) => {
    window.mixpanel?.track('Page View', { page: name, ...properties });
  },
  identify: (userId, traits) => {
    window.mixpanel?.identify(userId);
    if (traits) {
      window.mixpanel?.people.set(traits);
    }
  },
};

// 통합 분석 훅
export function useAnalytics() {
  const pathname = usePathname();

  const providers = [ga4Provider, mixpanelProvider];

  const track = useCallback((name: string, properties?: Record<string, unknown>) => {
    providers.forEach((p) => p.track({ name, properties }));
  }, []);

  const page = useCallback((properties?: Record<string, unknown>) => {
    providers.forEach((p) => p.page(pathname, properties));
  }, [pathname]);

  const identify = useCallback((userId: string, traits?: Record<string, unknown>) => {
    providers.forEach((p) => p.identify(userId, traits));
  }, []);

  return { track, page, identify };
}

// 사용 예시
function CheckoutPage() {
  const { track } = useAnalytics();

  const handlePurchase = async () => {
    track('purchase_started', { cartValue: 50000 });

    try {
      await processPayment();
      track('purchase_completed', { cartValue: 50000, orderId: '123' });
    } catch (error) {
      track('purchase_failed', { error: error.message });
    }
  };
}`
        },
        {
          id: 'page-view-tracking',
          title: '페이지뷰 자동 추적',
          description: 'Next.js 라우트 변경 감지',
          language: 'tsx',
          code: `// components/AnalyticsProvider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, identify } = useAnalytics();

  // 페이지뷰 자동 추적
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? \`?\${searchParams}\` : '');

    page({
      url,
      referrer: document.referrer,
    });
  }, [pathname, searchParams, page]);

  // 사용자 식별
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      identify(user.id, {
        email: user.email,
        plan: user.subscription?.plan,
        createdAt: user.createdAt,
      });
    }
  }, [identify]);

  return <>{children}</>;
}

// app/layout.tsx
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { Suspense } from 'react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </Suspense>
      </body>
    </html>
  );
}`
        }
      ],
      tips: [
        '✅ 이벤트 이름은 일관된 네이밍 규칙을 사용하세요 (예: snake_case).',
        '✅ 사용자 동의 후에만 분석 데이터를 수집하세요 (GDPR).',
        '⚠️ 과도한 이벤트 트래킹은 성능에 영향을 줄 수 있습니다.',
        'ℹ️ 핵심 지표(전환율, 리텐션)에 집중하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'Sentry Next.js Documentation',
      url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/',
      type: 'documentation'
    },
    {
      title: 'Web Vitals',
      url: 'https://web.dev/vitals/',
      type: 'documentation'
    },
    {
      title: 'Next.js Error Handling',
      url: 'https://nextjs.org/docs/app/building-your-application/routing/error-handling',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
