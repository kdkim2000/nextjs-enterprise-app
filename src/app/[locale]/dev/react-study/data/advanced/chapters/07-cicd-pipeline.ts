/**
 * Chapter 7: CI/CD 파이프라인
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'cicd-pipeline',
  order: 7,
  title: 'CI/CD Pipeline',
  titleKo: 'CI/CD 파이프라인',
  description: 'Learn to build automated CI/CD pipelines for React applications using GitHub Actions.',
  descriptionKo: 'GitHub Actions를 사용하여 React 애플리케이션의 자동화된 CI/CD 파이프라인을 구축하는 방법을 학습합니다.',
  estimatedMinutes: 60,
  objectives: [
    'Understand GitHub Actions basics',
    'Automate lint, type check, and tests',
    'Set up build and deploy workflows',
    'Implement environment-specific deployments',
    'Manage secrets securely'
  ],
  objectivesKo: [
    'GitHub Actions 기초를 이해한다',
    '린트, 타입체크, 테스트를 자동화한다',
    '빌드 및 배포 워크플로우를 설정한다',
    '환경별 배포 전략을 구현한다',
    '시크릿을 안전하게 관리한다'
  ],
  sections: [
    {
      id: 'github-actions-basics',
      title: 'GitHub Actions Basics',
      titleKo: 'GitHub Actions 기초',
      content: `
## GitHub Actions란?

**GitHub Actions**는 GitHub에 내장된 CI/CD 플랫폼입니다.

### 핵심 개념

| 개념 | 설명 |
|------|------|
| **Workflow** | 자동화된 프로세스 (.yml 파일) |
| **Event** | 워크플로우를 트리거하는 이벤트 |
| **Job** | 같은 러너에서 실행되는 단계들 |
| **Step** | 개별 작업 단위 |
| **Action** | 재사용 가능한 단위 |
| **Runner** | 워크플로우를 실행하는 서버 |

### 기본 구조

\`\`\`yaml
name: CI Pipeline          # 워크플로우 이름

on:                        # 트리거 이벤트
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:                      # 작업 정의
  build:                   # Job ID
    runs-on: ubuntu-latest # 실행 환경
    steps:                 # 단계들
      - uses: actions/checkout@v4
      - run: npm install
\`\`\`
      `,
      codeExamples: [
        {
          id: 'basic-workflow',
          title: '기본 CI 워크플로우',
          description: 'PR 검증 파이프라인',
          fileName: '.github/workflows/ci.yml',
          language: 'typescript',
          code: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# 동시 실행 제한
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run TypeScript
        run: npm run typecheck

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm run test:coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]  # 의존성
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload Build Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/
          retention-days: 7`
        },
        {
          id: 'matrix-strategy',
          title: '매트릭스 전략',
          description: '여러 환경에서 테스트',
          language: 'typescript',
          code: `# 매트릭스로 여러 환경 테스트
jobs:
  test:
    name: Test (Node \${{ matrix.node }})
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node: ['18', '20', '22']
      fail-fast: false  # 하나 실패해도 계속

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js \${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: 'npm'

      - run: npm ci
      - run: npm test

  # OS별 테스트
  cross-platform:
    name: Test on \${{ matrix.os }}
    runs-on: \${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test`
        }
      ],
      tips: [
        '✅ concurrency 설정으로 중복 실행을 방지하세요.',
        '✅ needs로 job 간 의존성을 명시하세요.',
        '⚠️ cache를 활용하여 빌드 시간을 단축하세요.',
        'ℹ️ fail-fast: false로 모든 매트릭스 결과를 확인할 수 있습니다.'
      ]
    },
    {
      id: 'lint-typecheck-test',
      title: 'Lint, Type Check, Test',
      titleKo: '린트/타입체크/테스트 자동화',
      content: `
## 코드 품질 검증 자동화

### 검증 단계

1. **린트 (ESLint)**: 코드 스타일, 잠재적 버그
2. **타입 체크 (TypeScript)**: 타입 오류
3. **단위 테스트**: 함수/컴포넌트 단위
4. **통합 테스트**: 여러 컴포넌트 조합
5. **E2E 테스트**: 전체 사용자 흐름

### 실행 순서

\`\`\`
[Lint] ──┐
         ├──→ [Build] ──→ [E2E]
[Type] ──┤
         │
[Test] ──┘
\`\`\`

빠른 검증(Lint, Type, Test)을 먼저 병렬 실행하고,
모두 통과하면 Build와 E2E를 진행합니다.
      `,
      codeExamples: [
        {
          id: 'complete-ci',
          title: '완전한 CI 파이프라인',
          description: '모든 검증 단계 포함',
          fileName: '.github/workflows/ci.yml',
          language: 'typescript',
          code: `# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'

jobs:
  # 빠른 검증 (병렬)
  lint:
    name: ESLint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
        continue-on-error: false

  typecheck:
    name: TypeScript
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  unit-test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
        env:
          CI: true
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        if: always()

  # 빌드 (검증 통과 후)
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, unit-test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: |
            .next/
            !.next/cache/
          retention-days: 1

  # E2E 테스트 (빌드 후)
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: .next/
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Run E2E Tests
        run: npm run test:e2e
        env:
          CI: true
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/`
        },
        {
          id: 'package-scripts',
          title: 'package.json 스크립트',
          description: 'CI용 npm 스크립트',
          fileName: 'package.json',
          language: 'json',
          code: `{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",

    "lint": "next lint",
    "lint:fix": "next lint --fix",

    "typecheck": "tsc --noEmit",

    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:watch": "vitest --watch",

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",

    "validate": "npm run lint && npm run typecheck && npm run test:ci"
  }
}`
        }
      ],
      tips: [
        '✅ 빠른 검증(lint, type, test)을 병렬로 실행하여 시간을 단축하세요.',
        '✅ 실패 시 아티팩트를 업로드하여 디버깅을 용이하게 하세요.',
        '⚠️ E2E 테스트는 시간이 오래 걸리므로 필요한 경우에만 실행하세요.',
        'ℹ️ npm run validate로 로컬에서도 전체 검증을 실행할 수 있습니다.'
      ]
    },
    {
      id: 'build-deploy',
      title: 'Build and Deploy',
      titleKo: '빌드 및 배포 워크플로우',
      content: `
## 배포 전략

| 전략 | 설명 | 사용 시점 |
|------|------|----------|
| **수동 배포** | 버튼 클릭으로 배포 | 중요한 릴리스 |
| **자동 배포** | 머지 시 자동 배포 | 개발/스테이징 |
| **태그 배포** | 태그 생성 시 배포 | 프로덕션 릴리스 |

### 배포 흐름

\`\`\`
[develop 브랜치]
    │
    ├── PR 머지 → Staging 자동 배포
    │
[main 브랜치]
    │
    ├── PR 머지 → Production 수동 승인 후 배포
    │
[v1.0.0 태그]
    │
    └── 태그 생성 → Production 자동 배포
\`\`\`
      `,
      codeExamples: [
        {
          id: 'deploy-workflow',
          title: '배포 워크플로우',
          description: 'Vercel 배포 예시',
          fileName: '.github/workflows/deploy.yml',
          language: 'typescript',
          code: `# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  workflow_dispatch:  # 수동 트리거
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          scope: \${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: \${{ secrets.VERCEL_ORG_ID }}`
        },
        {
          id: 'docker-deploy',
          title: 'Docker 배포',
          description: 'Docker 이미지 빌드 및 배포',
          fileName: '.github/workflows/docker-deploy.yml',
          language: 'typescript',
          code: `# .github/workflows/docker-deploy.yml
name: Docker Deploy

on:
  push:
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to Server
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: production

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker pull \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.ref_name }}
            docker-compose up -d --force-recreate`
        }
      ],
      tips: [
        '✅ environment를 사용하여 배포 대상을 명확히 구분하세요.',
        '✅ 프로덕션 배포는 승인 요구 설정을 권장합니다.',
        '⚠️ 시크릿은 절대 코드에 하드코딩하지 마세요.',
        'ℹ️ GitHub Environments에서 protection rules를 설정할 수 있습니다.'
      ]
    },
    {
      id: 'environment-deploy',
      title: 'Environment Deployments',
      titleKo: '환경별 배포 전략 (staging, production)',
      content: `
## 환경 분리의 중요성

| 환경 | 목적 | 배포 조건 |
|------|------|----------|
| **Development** | 개발자 로컬 | - |
| **Staging** | QA, 테스트 | develop 머지 |
| **Production** | 실제 서비스 | main 머지 + 승인 |

### 환경별 설정

\`\`\`
.env                 # 기본값 (공유 가능)
.env.development     # 로컬 개발
.env.staging        # 스테이징 환경
.env.production     # 프로덕션 환경
.env.local          # 로컬 오버라이드 (git 제외)
\`\`\`
      `,
      codeExamples: [
        {
          id: 'env-config',
          title: '환경별 설정',
          description: '환경 변수 관리',
          language: 'typescript',
          code: `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // 빌드 타임 환경 변수
    APP_ENV: process.env.APP_ENV || 'development',
    API_URL: process.env.API_URL,
  },
};

module.exports = nextConfig;

// .env.staging
APP_ENV=staging
API_URL=https://api-staging.example.com
NEXT_PUBLIC_APP_URL=https://staging.example.com

// .env.production
APP_ENV=production
API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://example.com

// lib/config.ts
export const config = {
  appEnv: process.env.APP_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // 환경별 기능 플래그
  features: {
    analytics: process.env.APP_ENV === 'production',
    debugMode: process.env.APP_ENV !== 'production',
    mockApi: process.env.APP_ENV === 'development',
  },
};`
        },
        {
          id: 'env-workflow',
          title: '환경별 배포 워크플로우',
          description: 'staging과 production 분리',
          fileName: '.github/workflows/deploy.yml',
          language: 'typescript',
          code: `# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  # Staging 배포 (develop 브랜치)
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Build for Staging
        run: npm run build
        env:
          APP_ENV: staging
          API_URL: \${{ secrets.STAGING_API_URL }}
          NEXT_PUBLIC_APP_URL: https://staging.example.com

      - name: Deploy to Staging
        run: |
          # 배포 스크립트
          echo "Deploying to staging..."

  # Production 배포 (main 브랜치)
  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Build for Production
        run: npm run build
        env:
          APP_ENV: production
          API_URL: \${{ secrets.PRODUCTION_API_URL }}
          NEXT_PUBLIC_APP_URL: https://example.com

      - name: Deploy to Production
        run: |
          echo "Deploying to production..."

      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Production deployed: \${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK }}`
        }
      ],
      tips: [
        '✅ GitHub Environments에서 환경별 시크릿을 관리하세요.',
        '✅ 프로덕션은 required reviewers를 설정하세요.',
        '⚠️ NEXT_PUBLIC_ 접두사가 있는 변수만 클라이언트에 노출됩니다.',
        'ℹ️ 배포 성공/실패 시 알림을 설정하여 모니터링하세요.'
      ]
    },
    {
      id: 'secrets-management',
      title: 'Secrets Management',
      titleKo: '시크릿 관리',
      content: `
## 시크릿 관리 원칙

1. **절대 코드에 하드코딩하지 않음**
2. **.gitignore에 민감한 파일 추가**
3. **환경별로 시크릿 분리**
4. **최소 권한 원칙**

### GitHub Secrets 종류

| 종류 | 범위 | 사용 |
|------|------|------|
| Repository secrets | 저장소 전체 | 일반적인 시크릿 |
| Environment secrets | 특정 환경 | 환경별 다른 값 |
| Organization secrets | 조직 전체 | 공통 시크릿 |

### 시크릿 접근

\`\`\`yaml
env:
  API_KEY: \${{ secrets.API_KEY }}

steps:
  - run: echo "Using secret"
    env:
      TOKEN: \${{ secrets.GITHUB_TOKEN }}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'secrets-usage',
          title: '시크릿 사용 예시',
          description: '다양한 시크릿 활용',
          fileName: '.github/workflows/deploy.yml',
          language: 'typescript',
          code: `# 시크릿 사용 패턴
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      # 1. 환경 변수로 시크릿 주입
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
          API_KEY: \${{ secrets.API_KEY }}
          JWT_SECRET: \${{ secrets.JWT_SECRET }}

      # 2. 파일로 시크릿 저장
      - name: Create env file
        run: |
          echo "DATABASE_URL=\${{ secrets.DATABASE_URL }}" >> .env
          echo "API_KEY=\${{ secrets.API_KEY }}" >> .env

      # 3. Docker 빌드 시 시크릿
      - name: Build Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: myapp:latest
          build-args: |
            DATABASE_URL=\${{ secrets.DATABASE_URL }}
          secrets: |
            "npm_token=\${{ secrets.NPM_TOKEN }}"

      # 4. SSH 키 시크릿
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d

      # 5. AWS 인증
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      # 6. 절대 시크릿 출력 금지!
      # ❌ 이렇게 하면 안 됨
      # - run: echo \${{ secrets.API_KEY }}
      #
      # GitHub가 자동으로 마스킹하지만 위험할 수 있음`
        },
        {
          id: 'gitignore',
          title: '.gitignore 설정',
          description: '민감한 파일 제외',
          fileName: '.gitignore',
          language: 'typescript',
          code: `# .gitignore

# 환경 변수 파일
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# 인증서/키
*.pem
*.key
*.cert
*.p12

# 시크릿 파일
secrets/
.secrets/
credentials.json
service-account.json

# IDE 설정 (개인 설정 포함 가능)
.idea/
.vscode/settings.json

# 빌드 출력
.next/
out/
dist/
build/

# 의존성
node_modules/

# 로그
*.log
npm-debug.log*

# 테스트 커버리지
coverage/

# 시스템 파일
.DS_Store
Thumbs.db`
        }
      ],
      tips: [
        '✅ Dependabot secrets로 의존성 업데이트도 자동화하세요.',
        '✅ 시크릿 로테이션 정책을 수립하세요.',
        '⚠️ 포크된 저장소의 PR에서는 시크릿에 접근할 수 없습니다.',
        'ℹ️ GITHUB_TOKEN은 자동으로 제공되는 토큰입니다.'
      ]
    }
  ],
  references: [
    {
      title: 'GitHub Actions Documentation',
      url: 'https://docs.github.com/en/actions',
      type: 'documentation'
    },
    {
      title: 'GitHub Actions for Next.js',
      url: 'https://nextjs.org/docs/pages/building-your-application/deploying/ci-build-caching',
      type: 'documentation'
    },
    {
      title: 'Vercel Deployment',
      url: 'https://vercel.com/docs/concepts/deployments/overview',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
