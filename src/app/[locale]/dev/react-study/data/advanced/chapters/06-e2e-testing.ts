/**
 * Chapter 6: E2E 테스트 (Playwright)
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'e2e-testing',
  order: 6,
  title: 'E2E Testing with Playwright',
  titleKo: 'E2E 테스트 (Playwright)',
  description: 'Learn end-to-end testing with Playwright to test complete user flows.',
  descriptionKo: 'Playwright를 사용하여 완전한 사용자 플로우를 테스트하는 E2E 테스트를 학습합니다.',
  estimatedMinutes: 75,
  objectives: [
    'Set up Playwright for Next.js projects',
    'Apply Page Object Model pattern',
    'Test authentication flows',
    'Implement visual regression testing',
    'Run E2E tests in CI environment'
  ],
  objectivesKo: [
    'Playwright를 Next.js 프로젝트에 설정한다',
    'Page Object Model 패턴을 적용한다',
    '인증 흐름을 테스트한다',
    '시각적 회귀 테스트를 구현한다',
    'CI 환경에서 E2E 테스트를 실행한다'
  ],
  sections: [
    {
      id: 'playwright-setup',
      title: 'Playwright Setup',
      titleKo: 'Playwright 설정과 기본 사용법',
      content: `
## Playwright란?

**Playwright**는 Microsoft가 만든 E2E 테스트 프레임워크입니다.

### 주요 특징

| 특징 | 설명 |
|------|------|
| 크로스 브라우저 | Chromium, Firefox, WebKit |
| 자동 대기 | 요소가 준비될 때까지 자동 대기 |
| 네트워크 모킹 | API 응답 가로채기 |
| 트레이싱 | 실패 시 스크린샷, 비디오 자동 저장 |
| 병렬 실행 | 여러 브라우저/테스트 동시 실행 |

### 설치

\`\`\`bash
npm init playwright@latest
\`\`\`

### 설정 파일 구조

\`\`\`
e2e/
├── playwright.config.ts
├── tests/
│   ├── login.spec.ts
│   └── users.spec.ts
└── fixtures/
    └── auth.ts
\`\`\`
      `,
      codeExamples: [
        {
          id: 'playwright-config',
          title: 'Playwright 설정',
          description: 'playwright.config.ts 구성',
          fileName: 'playwright.config.ts',
          language: 'typescript',
          code: `// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 테스트 디렉토리
  testDir: './e2e/tests',

  // 테스트 파일 패턴
  testMatch: '**/*.spec.ts',

  // 병렬 실행
  fullyParallel: true,

  // CI에서는 재시도 2회
  retries: process.env.CI ? 2 : 0,

  // 워커 수 (CI에서는 제한)
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  // 전역 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:3000',

    // 트레이스 (실패 시만)
    trace: 'on-first-retry',

    // 스크린샷 (실패 시만)
    screenshot: 'only-on-failure',

    // 비디오 (실패 시만)
    video: 'on-first-retry',

    // 뷰포트
    viewport: { width: 1280, height: 720 },
  },

  // 브라우저 프로젝트
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 모바일 테스트
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // 테스트 전 서버 시작
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});`
        },
        {
          id: 'basic-test',
          title: '기본 테스트 작성',
          description: '첫 번째 E2E 테스트',
          fileName: 'e2e/tests/home.spec.ts',
          language: 'typescript',
          code: `// e2e/tests/home.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display home page', async ({ page }) => {
    // 페이지 이동
    await page.goto('/');

    // 제목 확인
    await expect(page).toHaveTitle(/Next.js Enterprise/);

    // 요소 확인
    await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();
  });

  test('should navigate to login', async ({ page }) => {
    await page.goto('/');

    // 로그인 링크 클릭
    await page.getByRole('link', { name: '로그인' }).click();

    // URL 확인
    await expect(page).toHaveURL('/login');

    // 폼 존재 확인
    await expect(page.getByRole('form')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });

    // 햄버거 메뉴 표시 확인
    await expect(page.getByRole('button', { name: '메뉴' })).toBeVisible();

    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1280, height: 720 });

    // 네비게이션 바 표시 확인
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});`
        },
        {
          id: 'locators',
          title: 'Playwright Locators',
          description: '요소 선택 방법',
          language: 'typescript',
          code: `import { test, expect } from '@playwright/test';

test('locator examples', async ({ page }) => {
  await page.goto('/users');

  // 역할 기반 (권장)
  const addButton = page.getByRole('button', { name: '사용자 추가' });
  const table = page.getByRole('table');
  const rows = page.getByRole('row');

  // 텍스트 기반
  const heading = page.getByText('사용자 관리');
  const partialMatch = page.getByText(/관리/); // 정규식

  // 라벨 기반
  const emailInput = page.getByLabel('이메일');
  const checkbox = page.getByLabel('약관 동의');

  // Placeholder
  const searchInput = page.getByPlaceholder('검색...');

  // Test ID
  const widget = page.getByTestId('user-stats-widget');

  // CSS 선택자 (최후의 수단)
  const customElement = page.locator('.custom-class');

  // 필터링
  const activeUsers = page.getByRole('row').filter({
    hasText: '활성',
  });

  // 체이닝
  const editButton = page.getByRole('row')
    .filter({ hasText: 'kim@test.com' })
    .getByRole('button', { name: '수정' });

  // nth 선택
  const firstRow = page.getByRole('row').nth(1); // 0은 헤더
  const lastRow = page.getByRole('row').last();

  // 단언
  await expect(addButton).toBeEnabled();
  await expect(table).toBeVisible();
  await expect(rows).toHaveCount(5);
});`
        }
      ],
      tips: [
        '✅ getByRole을 우선 사용하고, 불가능할 때 다른 locator를 사용하세요.',
        '✅ webServer 설정으로 테스트 전 개발 서버를 자동 시작할 수 있습니다.',
        '⚠️ CI에서는 workers를 1로 설정하여 안정성을 높이세요.',
        'ℹ️ npx playwright test --ui로 UI 모드에서 디버깅할 수 있습니다.'
      ]
    },
    {
      id: 'page-object-model',
      title: 'Page Object Model',
      titleKo: '페이지 객체 모델 (Page Object Model)',
      content: `
## Page Object Model (POM)

**POM**은 페이지별로 클래스를 만들어 **재사용성**과 **유지보수성**을 높이는 패턴입니다.

### POM의 장점

1. **재사용**: 여러 테스트에서 같은 페이지 객체 사용
2. **유지보수**: UI 변경 시 한 곳만 수정
3. **가독성**: 테스트 코드가 비즈니스 로직에 집중
4. **캡슐화**: 선택자와 액션을 숨김

### 기본 구조

\`\`\`typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  // 요소 정의
  get emailInput() {
    return this.page.getByLabel('이메일');
  }

  // 액션 정의
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
\`\`\`
      `,
      codeExamples: [
        {
          id: 'login-page-object',
          title: 'LoginPage 클래스',
          description: '로그인 페이지 객체',
          fileName: 'e2e/pages/LoginPage.ts',
          language: 'typescript',
          code: `// e2e/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('이메일');
    this.passwordInput = page.getByLabel('비밀번호');
    this.submitButton = page.getByRole('button', { name: '로그인' });
    this.errorMessage = page.getByRole('alert');
    this.rememberMeCheckbox = page.getByLabel('로그인 상태 유지');
  }

  // Navigation
  async goto() {
    await this.page.goto('/login');
  }

  // Actions
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginWithRemember(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.check();
    await this.submitButton.click();
  }

  // Assertions
  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL('/login');
    await expect(this.submitButton).toBeVisible();
  }

  async expectToBeLoggedIn() {
    await expect(this.page).not.toHaveURL('/login');
  }
}`
        },
        {
          id: 'users-page-object',
          title: 'UsersPage 클래스',
          description: '사용자 관리 페이지 객체',
          fileName: 'e2e/pages/UsersPage.ts',
          language: 'typescript',
          code: `// e2e/pages/UsersPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class UsersPage {
  readonly page: Page;

  // Locators
  readonly heading: Locator;
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly table: Locator;
  readonly loadingSpinner: Locator;

  // Dialog Locators
  readonly dialog: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly roleSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: '사용자 관리' });
    this.addButton = page.getByRole('button', { name: '사용자 추가' });
    this.searchInput = page.getByPlaceholder('검색...');
    this.table = page.getByRole('table');
    this.loadingSpinner = page.getByRole('progressbar');

    // Dialog
    this.dialog = page.getByRole('dialog');
    this.nameInput = page.getByLabel('이름');
    this.emailInput = page.getByLabel('이메일');
    this.roleSelect = page.getByLabel('역할');
    this.saveButton = page.getByRole('button', { name: '저장' });
    this.cancelButton = page.getByRole('button', { name: '취소' });
  }

  async goto() {
    await this.page.goto('/admin/users');
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await expect(this.loadingSpinner).not.toBeVisible();
    await expect(this.table).toBeVisible();
  }

  // 사용자 추가
  async addUser(name: string, email: string, role: string) {
    await this.addButton.click();
    await expect(this.dialog).toBeVisible();

    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.roleSelect.selectOption(role);
    await this.saveButton.click();

    await expect(this.dialog).not.toBeVisible();
  }

  // 사용자 검색
  async search(query: string) {
    await this.searchInput.fill(query);
    // 디바운스 대기
    await this.page.waitForTimeout(300);
    await this.waitForLoaded();
  }

  // 사용자 행 찾기
  getUserRow(email: string) {
    return this.page.getByRole('row').filter({ hasText: email });
  }

  // 사용자 수정
  async editUser(email: string, newName: string) {
    const row = this.getUserRow(email);
    await row.getByRole('button', { name: '수정' }).click();

    await expect(this.dialog).toBeVisible();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.saveButton.click();

    await expect(this.dialog).not.toBeVisible();
  }

  // 사용자 삭제
  async deleteUser(email: string) {
    const row = this.getUserRow(email);
    await row.getByRole('button', { name: '삭제' }).click();

    // 확인 다이얼로그
    await this.page.getByRole('button', { name: '확인' }).click();
  }

  // 단언
  async expectUserInTable(email: string) {
    await expect(this.getUserRow(email)).toBeVisible();
  }

  async expectUserNotInTable(email: string) {
    await expect(this.getUserRow(email)).not.toBeVisible();
  }

  async expectRowCount(count: number) {
    // +1 for header row
    await expect(this.page.getByRole('row')).toHaveCount(count + 1);
  }
}`
        },
        {
          id: 'pom-test-usage',
          title: 'POM 사용 테스트',
          description: 'Page Object를 활용한 테스트',
          fileName: 'e2e/tests/users.spec.ts',
          language: 'typescript',
          code: `// e2e/tests/users.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { UsersPage } from '../pages/UsersPage';

test.describe('User Management', () => {
  let loginPage: LoginPage;
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    usersPage = new UsersPage(page);

    // 로그인
    await loginPage.goto();
    await loginPage.login('admin@test.com', 'password123');
    await loginPage.expectToBeLoggedIn();
  });

  test('should display users list', async () => {
    await usersPage.goto();
    await expect(usersPage.heading).toBeVisible();
    await expect(usersPage.table).toBeVisible();
  });

  test('should add new user', async () => {
    await usersPage.goto();

    await usersPage.addUser(
      '새 사용자',
      'newuser@test.com',
      'user'
    );

    await usersPage.expectUserInTable('newuser@test.com');
  });

  test('should search users', async () => {
    await usersPage.goto();

    await usersPage.search('kim');

    await usersPage.expectUserInTable('kim@test.com');
    await usersPage.expectUserNotInTable('lee@test.com');
  });

  test('should edit user', async () => {
    await usersPage.goto();

    await usersPage.editUser('kim@test.com', '수정된 이름');

    const row = usersPage.getUserRow('kim@test.com');
    await expect(row).toContainText('수정된 이름');
  });

  test('should delete user', async () => {
    await usersPage.goto();

    await usersPage.deleteUser('delete-me@test.com');

    await usersPage.expectUserNotInTable('delete-me@test.com');
  });
});`
        }
      ],
      tips: [
        '✅ Page Object는 재사용 가능한 컴포넌트 단위로도 만들 수 있습니다.',
        '✅ 복잡한 워크플로우는 별도의 helper 함수로 분리하세요.',
        '⚠️ Page Object에 단언(expect)을 포함하면 테스트 의도가 명확해집니다.',
        'ℹ️ fixture를 활용하면 Page Object를 더 깔끔하게 주입할 수 있습니다.'
      ]
    },
    {
      id: 'auth-testing',
      title: 'Authentication Testing',
      titleKo: '인증 흐름 테스트',
      content: `
## 인증 상태 관리

E2E 테스트에서 인증은 가장 흔한 사전 조건입니다.

### 접근 방법

| 방법 | 장점 | 단점 |
|------|------|------|
| 매번 로그인 | 실제와 동일 | 느림 |
| 저장된 상태 | 빠름 | 설정 복잡 |
| API 인증 | 가장 빠름 | UI 테스트 안함 |

### Playwright의 storageState

\`\`\`typescript
// 인증 상태를 파일로 저장
await context.storageState({ path: 'auth.json' });

// 저장된 상태로 시작
const context = await browser.newContext({
  storageState: 'auth.json',
});
\`\`\`
      `,
      codeExamples: [
        {
          id: 'auth-setup',
          title: '인증 설정 (Setup)',
          description: 'Global Setup으로 인증 상태 저장',
          fileName: 'e2e/auth.setup.ts',
          language: 'typescript',
          code: `// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  // 로그인 페이지로 이동
  await page.goto('/login');

  // 로그인 수행
  await page.getByLabel('이메일').fill('admin@test.com');
  await page.getByLabel('비밀번호').fill('password123');
  await page.getByRole('button', { name: '로그인' }).click();

  // 로그인 성공 확인
  await expect(page).toHaveURL('/dashboard');

  // 인증 상태 저장
  await page.context().storageState({ path: authFile });
});

// playwright.config.ts에서 설정
export default defineConfig({
  projects: [
    // Setup project
    {
      name: 'setup',
      testMatch: /.*\\.setup\\.ts/,
    },

    // 인증이 필요한 테스트
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // 인증 없이 실행할 테스트
    {
      name: 'unauthenticated',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\\.unauth\\.spec\\.ts/,
    },
  ],
});`
        },
        {
          id: 'auth-fixture',
          title: '인증 Fixture',
          description: '역할별 인증 Fixture',
          fileName: 'e2e/fixtures/auth.ts',
          language: 'typescript',
          code: `// e2e/fixtures/auth.ts
import { test as base, Page } from '@playwright/test';
import path from 'path';

// 역할별 인증 파일 경로
const authFiles = {
  admin: path.join(__dirname, '../.auth/admin.json'),
  user: path.join(__dirname, '../.auth/user.json'),
  guest: undefined, // 인증 없음
};

type UserRole = keyof typeof authFiles;

// 커스텀 Fixture 정의
export const test = base.extend<{
  authenticatedPage: Page;
  role: UserRole;
}>({
  role: ['user', { option: true }], // 기본값 'user'

  authenticatedPage: async ({ browser, role }, use) => {
    const authFile = authFiles[role];

    const context = await browser.newContext({
      storageState: authFile,
    });

    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// 사용 예시
// e2e/tests/admin.spec.ts
import { test, expect } from '../fixtures/auth';

test.describe('Admin Features', () => {
  // 이 테스트 파일은 admin 권한 필요
  test.use({ role: 'admin' });

  test('should access admin dashboard', async ({ authenticatedPage: page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: '관리자 대시보드' })).toBeVisible();
  });

  test('should manage users', async ({ authenticatedPage: page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('button', { name: '사용자 추가' })).toBeEnabled();
  });
});

// e2e/tests/user.spec.ts
import { test, expect } from '../fixtures/auth';

test.describe('User Features', () => {
  // 기본 user 권한
  test('should access profile', async ({ authenticatedPage: page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: '내 프로필' })).toBeVisible();
  });

  test('should not access admin', async ({ authenticatedPage: page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/403'); // 권한 없음
  });
});`
        },
        {
          id: 'auth-flow-test',
          title: '인증 흐름 테스트',
          description: '로그인/로그아웃 전체 흐름',
          fileName: 'e2e/tests/auth.spec.ts',
          language: 'typescript',
          code: `// e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('user@test.com', 'password123');

    // 대시보드로 리다이렉트
    await expect(page).toHaveURL('/dashboard');

    // 사용자 메뉴 표시
    await expect(page.getByRole('button', { name: /user@test.com/ })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('user@test.com', 'wrongpassword');

    await loginPage.expectError('이메일 또는 비밀번호가 올바르지 않습니다');
    await loginPage.expectToBeOnLoginPage();
  });

  test('should logout', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 로그인
    await loginPage.goto();
    await loginPage.login('user@test.com', 'password123');
    await expect(page).toHaveURL('/dashboard');

    // 로그아웃
    await page.getByRole('button', { name: /user@test.com/ }).click();
    await page.getByRole('menuitem', { name: '로그아웃' }).click();

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // 인증 없이 보호된 페이지 접근
    await page.goto('/admin/users');

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\\/login\\?redirect=/);
  });

  test('should remember login state', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // "로그인 상태 유지" 체크 후 로그인
    await loginPage.loginWithRemember('user@test.com', 'password123');
    await expect(page).toHaveURL('/dashboard');

    // 쿠키 확인
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'auth-token');
    expect(authCookie).toBeDefined();
    expect(authCookie?.expires).toBeGreaterThan(Date.now() / 1000);
  });
});`
        }
      ],
      tips: [
        '✅ 인증 상태는 storageState로 저장하여 테스트 속도를 높이세요.',
        '✅ 역할별 인증 fixture를 만들어 재사용하세요.',
        '⚠️ 테스트 데이터는 테스트 간 격리되어야 합니다.',
        'ℹ️ CI에서는 테스트 사용자 계정을 별도로 관리하세요.'
      ]
    },
    {
      id: 'visual-regression',
      title: 'Visual Regression Testing',
      titleKo: '시각적 회귀 테스트',
      content: `
## 시각적 회귀 테스트란?

**시각적 회귀 테스트**는 스크린샷을 비교하여 UI 변경을 감지합니다.

### Playwright의 스크린샷 비교

\`\`\`typescript
// 스크린샷 비교
await expect(page).toHaveScreenshot('home.png');

// 요소만 스크린샷
await expect(component).toHaveScreenshot('button.png');
\`\`\`

### 설정 옵션

\`\`\`typescript
await expect(page).toHaveScreenshot({
  maxDiffPixels: 100,        // 허용 픽셀 차이
  maxDiffPixelRatio: 0.02,   // 허용 비율
  threshold: 0.2,            // 색상 차이 임계값
  animations: 'disabled',    // 애니메이션 비활성화
});
\`\`\`
      `,
      codeExamples: [
        {
          id: 'visual-test',
          title: '시각적 테스트 예시',
          description: '페이지 스크린샷 비교',
          fileName: 'e2e/tests/visual.spec.ts',
          language: 'typescript',
          code: `// e2e/tests/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  // 애니메이션 비활성화
  test.use({
    launchOptions: {
      args: ['--force-prefers-reduced-motion'],
    },
  });

  test('home page', async ({ page }) => {
    await page.goto('/');

    // 페이지 전체 스크린샷
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('login form', async ({ page }) => {
    await page.goto('/login');

    // 폼 영역만 스크린샷
    const form = page.getByRole('form');
    await expect(form).toHaveScreenshot('login-form.png');
  });

  test('user table', async ({ page }) => {
    await page.goto('/admin/users');

    // 데이터 로딩 대기
    await page.waitForSelector('table tbody tr');

    // 테이블 스크린샷
    const table = page.getByRole('table');
    await expect(table).toHaveScreenshot('users-table.png', {
      maxDiffPixelRatio: 0.05, // 5% 차이 허용
    });
  });

  test('responsive design', async ({ page }) => {
    await page.goto('/');

    // 다양한 뷰포트에서 테스트
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await expect(page).toHaveScreenshot(\`home-\${vp.name}.png\`);
    }
  });

  test('dark mode', async ({ page }) => {
    // 다크 모드 설정
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await expect(page).toHaveScreenshot('home-dark.png');
  });
});`
        },
        {
          id: 'visual-config',
          title: '시각적 테스트 설정',
          description: 'playwright.config.ts 설정',
          fileName: 'playwright.config.ts',
          language: 'typescript',
          code: `// playwright.config.ts
export default defineConfig({
  // 스크린샷 설정
  expect: {
    toHaveScreenshot: {
      // 기준 스크린샷 저장 위치
      // 기본: <testDir>/__screenshots__/<testFileName>/<testName>
      maxDiffPixels: 50,
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },

  // 스냅샷 경로 커스터마이징
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',

  // 업데이트 모드
  // npx playwright test --update-snapshots
  updateSnapshots: 'missing', // 'all' | 'none' | 'missing'
});

// package.json scripts
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:update": "playwright test --update-snapshots",
    "test:e2e:visual": "playwright test --grep @visual"
  }
}

// 시각적 테스트만 태그로 구분
test('home page @visual', async ({ page }) => {
  // ...
});`
        }
      ],
      tips: [
        '✅ 시각적 테스트는 CI에서 일관된 환경(Docker)으로 실행하세요.',
        '✅ 동적 콘텐츠(시간, 랜덤 데이터)는 마스킹하세요.',
        '⚠️ 폰트 렌더링은 OS마다 다를 수 있어 주의가 필요합니다.',
        'ℹ️ --update-snapshots로 기준 스크린샷을 업데이트할 수 있습니다.'
      ]
    },
    {
      id: 'ci-e2e',
      title: 'E2E Tests in CI',
      titleKo: 'CI 환경에서 E2E 테스트',
      content: `
## CI에서 E2E 테스트 실행

CI 환경에서 E2E 테스트는 **일관성**과 **안정성**이 중요합니다.

### 고려사항

1. **브라우저 설치**: CI 환경에 브라우저 설치 필요
2. **타임아웃**: 네트워크 지연 고려
3. **재시도**: Flaky 테스트 처리
4. **아티팩트**: 실패 시 스크린샷, 비디오 저장

### GitHub Actions 예시

\`\`\`yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npx playwright test

- name: Upload Artifacts
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
\`\`\`
      `,
      codeExamples: [
        {
          id: 'github-actions',
          title: 'GitHub Actions 워크플로우',
          description: 'E2E 테스트 자동화',
          fileName: '.github/workflows/e2e.yml',
          language: 'typescript',
          code: `# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Build Application
        run: npm run build

      - name: Run E2E Tests
        run: npx playwright test
        env:
          CI: true
          BASE_URL: http://localhost:3000

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload Test Screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-screenshots
          path: test-results/
          retention-days: 7`
        },
        {
          id: 'ci-config',
          title: 'CI용 Playwright 설정',
          description: 'CI 환경 최적화 설정',
          fileName: 'playwright.config.ts',
          language: 'typescript',
          code: `// playwright.config.ts - CI 최적화
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',

  // CI에서는 재시도 2회
  retries: process.env.CI ? 2 : 0,

  // CI에서는 단일 워커 (안정성)
  workers: process.env.CI ? 1 : undefined,

  // CI에서는 모든 리포터 활성화
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['github'],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // CI에서는 항상 트레이스 수집
    trace: process.env.CI ? 'on' : 'on-first-retry',

    // CI에서는 항상 스크린샷
    screenshot: process.env.CI ? 'on' : 'only-on-failure',

    // CI에서는 비디오 수집
    video: process.env.CI ? 'on' : 'off',

    // 타임아웃 설정
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // CI에서는 Chromium만 (속도)
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],

  // 서버 설정
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});`
        }
      ],
      tips: [
        '✅ CI에서는 단일 워커로 실행하여 안정성을 높이세요.',
        '✅ 실패 시 아티팩트(스크린샷, 비디오, 트레이스)를 항상 업로드하세요.',
        '⚠️ Flaky 테스트는 재시도로 처리하되, 근본 원인을 해결하세요.',
        'ℹ️ Docker 컨테이너를 사용하면 환경 일관성을 보장할 수 있습니다.'
      ]
    }
  ],
  references: [
    {
      title: 'Playwright Documentation',
      url: 'https://playwright.dev/docs/intro',
      type: 'documentation'
    },
    {
      title: 'Playwright Best Practices',
      url: 'https://playwright.dev/docs/best-practices',
      type: 'documentation'
    },
    {
      title: 'Page Object Model',
      url: 'https://playwright.dev/docs/pom',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
