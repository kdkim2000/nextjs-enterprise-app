# Claude Code Handoff — nextjs-enterprise-app 디자인 전면 재개편

> **Read this whole document before making any changes.** It is the master instruction for redesigning the entire frontend of `kdkim2000/nextjs-enterprise-app` while preserving all behavior, API contracts, and i18n logic.

---

## 0. TL;DR (1분 요약)

1. **백엔드는 건드리지 않는다.** `backend/`, `services/`, `shared/`, `database/`, `infrastructure/` 전부 무영향. API 응답 shape, 라우트, 인증 로직 변경 금지.
2. **이 패키지의 파일들을 그대로 프로젝트에 복사한다** — 새 `src/theme/*`, 새 `src/app/globals.css`, 새 `src/app/layout.tsx`, 새 `src/app/[locale]/layout.tsx`, 새 `src/components/common/{PageHeader,KpiCard,DataShell}.tsx`. 기존 파일 대체 또는 신규 생성.
3. **`patches/` 디렉터리의 3개 md 파일** — Sidebar, Login/MFA, Admin 페이지에 대한 코드 변경 지시를 따라 기존 파일을 수정.
4. **사용 패턴을 한 번에 전환**: 모든 admin CRUD 페이지를 `PageHeader + DataShell + DataGridPremium` 구조로.
5. **검증**: `npm run dev:frontend` 후 로그인 → 대시보드 → 사용자 관리 → 게시판 흐름이 빌드 + 작동.

---

## 1. 범위와 비범위

### ✅ 변경 (frontend only)
- `src/theme/**` — 완전 재작성
- `src/app/globals.css` — 완전 재작성 (Arial 누수 버그 수정 포함)
- `src/app/layout.tsx` — ThemeProvider 도입 + 폰트 프리로드
- `src/app/[locale]/layout.tsx` — `<html lang>` 동기화 + 언어별 폰트 로딩
- `src/components/layout/{Sidebar,DashboardHeader,AuthenticatedLayout}/index.tsx` — 부분 수정 (`patches/01-layout-components.md`)
- `src/app/[locale]/login/page.tsx` — 재구조화 (`patches/02-login-mfa.md`)
- `src/app/[locale]/admin/**/page.tsx` — 일괄 패턴 적용 (`patches/03-admin-pages.md`)
- `src/components/common/**` — `PageHeader.tsx`, `KpiCard.tsx`, `DataShell.tsx`, `StatusDot.tsx` 신규 추가

### ❌ 변경 금지
- `backend/**`, `services/**`, `shared/**`, `database/**`, `infrastructure/**`
- `src/lib/api/**` (API 클라이언트)
- `src/lib/i18n/**` (다국어 설정 자체)
- `src/contexts/**` (Auth/Menu/Permission 컨텍스트의 비즈니스 로직)
- `src/hooks/**` 의 데이터 페칭 로직 (UI hooks 제외)
- `package.json` 의존성 — 폰트는 CDN으로 받으므로 새 npm 패키지 불필요
- 라우팅 구조 (`[locale]/admin/users` 등 URL 보존)
- DB 스키마, 메뉴 코드, RBAC 규칙

### 변경하되 동작은 보존
- 컴포넌트 API (props) — 가능한 한 같은 시그니처 유지. 불가피하면 백워드 호환 어댑터 추가.
- 화면 흐름 (login → MFA → dashboard) — 단계 분기는 보존, 시각만 교체.

---

## 2. 코드 레벨 진단 (실제 소스 분석)

### 2.1 색상 시스템 — 5중 중복

`src/theme/palette.ts` 에 5개 색상 그룹이 정의되어 있고 일부 값이 충돌합니다:

```
palette.primary.main      = #1976d2  (MUI 디폴트 블루)
palette.secondary.main    = #9c27b0  (MUI 디폴트 보라 — 거의 미사용)
palette.success.main      = #2e7d32  (어두운 그린)
palette.status.success    = #4caf50  (밝은 그린 — success.main과 다름!)
palette.status.active     = #4caf50  (status.success와 같지만 의미 분리)
palette.role.user         = #1976d2  (primary.main과 동일 — 중복)
```

**Fix**: `tokens.ts` 한 곳에서 모든 색상을 정의하고, `palette.ts` 는 토큰을 매핑만. 중복 제거.

### 2.2 폰트 — `globals.css` 의 Arial 누수 (실제 버그)

`src/theme/typography.ts` 에서 `fontFamily: 'Inter, ...'` 를 선언하지만, `src/app/globals.css` 에서:

```css
body {
  font-family: Arial, Helvetica, sans-serif;  /* ← 이 줄이 모든 비-Typography 요소를 Arial로 강제 */
}
```

**결과**: `<Typography>` 로 감싼 텍스트만 Inter, raw `<p>`/`<span>`/`<div>`/입력 필드는 Arial 로 렌더 → 한 페이지 안에 2개 폰트 공존.

**Fix**: `globals.css` 의 `body { font-family }` 를 디자인 시스템 토큰의 sans 스택으로 교체. 자세히는 `handoff/src/app/globals.css` 참조.

### 2.3 한국어 폰트 부재

`typography.ts` 의 스택:
```
'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif
```

이 스택에는 **한국어 글리프를 가진 폰트가 없습니다.** Inter 는 라틴, 시스템 fallback 으로 한글이 표시되는데 OS마다 다른 폰트(Apple SD Gothic Neo, Malgun Gothic, Noto Sans CJK …)가 사용되어 일관성 없음.

**Fix**: Pretendard Variable(한+영 통합) 을 1순위로, 언어별 스택은 `:lang(ko)/:lang(zh)/:lang(vi)` CSS 로 분리.

### 2.4 borderRadius — 4개 값 공존

`components.ts` 를 보면:
- Button: 8
- Card: 12
- Dialog: 16
- DataGrid: 12
- Sidebar list item: 1.5 × 8 = 12

5개의 다른 곡률이 한 화면에 공존 → 디자인 시스템의 결정력 약화.

**Fix**: 전역 `tokens.radius.md = 6px` 으로 통일. 데이터 표면(DataGrid, Table)은 `0` (sharp).

### 2.5 hover boxShadow — admin에 부적합

```css
MuiButton.root: hover boxShadow '0 2px 8px rgba(0,0,0,0.15)'
```

엔터프라이즈 어드민은 사용자가 한 세션에서 수백 번 hover 합니다. 매번 그림자가 튀는 것은 산만함의 원천.

**Fix**: button hover shadow 제거. focus-ring 만 유지.

### 2.6 Sidebar 선택 상태 — solid blue 풀필

```tsx
'&.Mui-selected': {
  backgroundColor: 'primary.main',          // ← solid #1976d2 풀필
  color: 'primary.contrastText',
}
```

활성 메뉴 한 칸이 사이드바 시각 무게중심을 모두 가져감.

**Fix**: subtle accent tint (`action.selected` 8% opacity) + 2px 좌측 accent rule.

### 2.7 다크모드 — 미완성

`darkPalette` 에 `error/warning/info/success` 미정의 → MUI가 디폴트 라이트 컬러를 그대로 사용 → 다크 모드에서 대비 실패.

**Fix**: `palette.ts` 의 darkPalette 에 status 컬러 4종 모두 정의 (이 패키지에 포함됨).

### 2.8 AppBar — 디폴트 풀블루

`<AppBar position="static" elevation={1}>` 에 컬러 지정이 없어 MUI 디폴트 `primary.main` (블루) 풀블리드. 인지 노이즈 큼.

**Fix**: `MuiAppBar` 테마 오버라이드로 `backgroundColor: transparent`, `borderBottom: 1px solid divider` 만.

### 2.9 Avatar — 보라색

`<Avatar bgcolor="secondary.main">` → MUI 디폴트 `#9c27b0` (보라) — 청색 UI 에 갑자기 보라 점. secondary 가 정의되어 있지만 거의 미사용.

**Fix**: secondary 를 accent 의 다른 음영으로 재매핑 (이 패키지의 palette.ts 참조). 또는 Avatar 를 `palette.role[user.role]` 로 색칠하여 의미 부여.

### 2.10 Typography h6 — body1 과 충돌

```
h6: fontSize 1rem (16px), fontWeight 600
body1: fontSize 1rem (16px), fontWeight 400
```

두 변형이 사이즈가 같음 → 시각 위계 형성 안 됨.

**Fix**: h6 → 16px medium 으로, body1 과 무게/용도 분리. 더 명확히는 subtitle1 으로 대체 사용 권장.

---

## 3. 패키지 파일 적용 순서 (반드시 이 순서)

### Step 1 — 토큰 & 테마 (가장 먼저)
```
handoff/src/theme/tokens.ts        → src/theme/tokens.ts        [NEW]
handoff/src/theme/palette.ts       → src/theme/palette.ts       [REPLACE]
handoff/src/theme/typography.ts    → src/theme/typography.ts    [REPLACE]
handoff/src/theme/components.ts    → src/theme/components.ts    [REPLACE]
handoff/src/theme/index.ts         → src/theme/index.ts         [REPLACE]
```

Verify: `npm run type-check` 통과해야 함. 기존 컴포넌트가 `palette.primary.main` 등을 import 하는 곳은 그대로 동작 (시그니처 유지).

### Step 2 — Globals + 루트 레이아웃
```
handoff/src/app/globals.css        → src/app/globals.css        [REPLACE]
handoff/src/app/layout.tsx         → src/app/layout.tsx         [REPLACE]
handoff/src/app/[locale]/layout.tsx → src/app/[locale]/layout.tsx [REPLACE]
handoff/src/app/[locale]/LocaleSync.tsx → src/app/[locale]/LocaleSync.tsx [NEW]
```

Verify: 페이지 새로고침 시 한국어 텍스트가 Pretendard 로 렌더되는지, body 가 Arial 이 아닌지 DevTools 로 확인.

### Step 3 — 신규 공통 컴포넌트
```
handoff/src/components/common/PageHeader.tsx  → src/components/common/PageHeader.tsx  [NEW]
handoff/src/components/common/KpiCard.tsx     → src/components/common/KpiCard.tsx     [NEW]
handoff/src/components/common/DataShell.tsx   → src/components/common/DataShell.tsx   [NEW]
handoff/src/components/common/StatusDot.tsx   → src/components/common/StatusDot.tsx   [NEW — see patches/03]
```

기존 `src/components/common/` 의 73개 파일은 그대로 둠. 새 파일은 추가만.

### Step 4 — 레이아웃 컴포넌트 수정
`patches/01-layout-components.md` 를 따라 다음 파일 수정:
- `src/components/layout/Sidebar/index.tsx`
- `src/components/layout/DashboardHeader/index.tsx`
- `src/components/layout/AuthenticatedLayout/index.tsx`
- `src/components/layout/DashboardFooter/index.tsx`

Verify: 로그인 후 사이드바 + 헤더가 깔끔한 중성 톤으로 렌더, 활성 메뉴는 2px 좌측 rule + 옅은 tint.

### Step 5 — Login / MFA 페이지
`patches/02-login-mfa.md` 를 따라 `src/app/[locale]/login/page.tsx` 를 분할:
- `BrandPanel.tsx`, `LoginStep.tsx`, `MfaStep.tsx` 신규
- `page.tsx` 는 step state + auth API 호출만 담당

Verify: `/ko/login` 접속 시 좌우 2분할, MFA 단계에서 6자리 segmented 입력 동작.

### Step 6 — Admin 페이지 일괄 마이그레이션
`patches/03-admin-pages.md` 를 따라 20+ admin 페이지를 `PageHeader + DataShell + DataGridPremium` 패턴으로 전환.

권장 순서:
1. `users` (가장 트래픽 많음)
2. `roles`, `menus`, `codes`, `departments`, `programs`
3. `messages`, `boards`, `posts`, `help`, `logs`, `mail`, `app-settings`

각 페이지마다:
- `<PageHeader>` 로 타이틀+KPI+actions 통일
- `<DataShell>` 로 탭+툴바+DataGrid wrap
- DataGrid 컬럼: 숫자 우측정렬+mono, 상태는 `<StatusDot>`, 역할은 `palette.role` 컬러

### Step 7 — Dashboard 위젯
`src/app/[locale]/dashboard/components/KPICards.tsx` → `<KpiCard>` 로 교체. Recharts 차트들은 별도 PR 로 색상 테마만 토큰에 맞춤 (`charts/themeColors.ts` 신규 생성 권장).

### Step 8 — Mobile (Phase 3)
`MobileDrawer/`, `MobileHeader/`, `MobileBottomNavigation/`, `MobileLayout/` 는 마지막에 통합. 위 변경이 안정화된 후, MUI breakpoints 로 단일 AppShell 안에 흡수.

---

## 4. 검증 체크리스트 (Step 별 acceptance criteria)

### After Step 1 — Theme
- [ ] `npm run type-check` 통과
- [ ] `palette.primary.main` 등 기존 import 가 깨지지 않음
- [ ] DevTools 에서 임의 컴포넌트의 computed color 가 새 슬레이트 블루 (`oklch(0.48 0.09 245)` 또는 hex 근사값)

### After Step 2 — Globals
- [ ] DevTools → body 의 computed `font-family` 가 `Pretendard Variable, ...` 으로 시작 (Arial 아님)
- [ ] `<html lang="ko">` 인 페이지에서 한글 텍스트가 균일한 Pretendard 로 렌더
- [ ] `:focus-visible` 시 3px 슬레이트 블루 ring

### After Step 3 — Components
- [ ] PageHeader 가 breadcrumb + h2 + KPI 스트립 정상 표시
- [ ] KpiCard 가 hairline border + tabular nums
- [ ] DataShell 이 탭+툴바+그리드 컨테이너 정상

### After Step 4 — Layout
- [ ] Sidebar: 활성 메뉴는 옅은 tint + 2px 좌측 rule (solid blue 풀필 아님)
- [ ] Header: 흰/오프화이트 배경 + 하단 1px hairline (블루 풀블리드 아님)
- [ ] AuthenticatedLayout: 로딩 상태가 작은 스피너

### After Step 5 — Login
- [ ] `/ko/login` md+ 에서 좌우 2분할
- [ ] mobile 에서 단일 스택, 브랜드 패널 숨김
- [ ] MFA 6자리 입력 auto-advance + backspace + paste 동작
- [ ] resend 타이머가 mono 폰트로 카운트다운

### After Step 6 — Admin pages
- [ ] 모든 admin 페이지가 동일한 PageHeader 패턴
- [ ] DataGrid 가 sharp 코너 + hairline + dense compact density
- [ ] 상태 컬럼이 dot+label (chip 아님)
- [ ] 숫자 컬럼이 우측정렬 + tabular nums

### Final — System-wide
- [ ] WCAG AA: 본문 텍스트 명도비 ≥ 4.5
- [ ] 한 화면에 1개 강조색 (슬레이트 블루) + 위험 작업에만 caution (버닛 시에나)
- [ ] hover 시 그림자 튀는 곳 없음 (focus ring 만)
- [ ] light/dark 모드 모두 정상 (dark 의 error/warning/success 정의됨)

---

## 5. 자주 빠질 함정

1. **`globals.css` 의 body font 를 잊고 안 바꾸면** Typography 외 모든 텍스트가 Arial 그대로. theme 만 바꿔서는 안 됨.

2. **MUI Premium DataGrid 의 internal class** 이름이 minor 버전마다 변동. `MuiDataGrid-cell` 같은 ID 셀렉터는 `theme/components.ts` 의 `MuiDataGrid` styleOverrides 에 두고, page-level sx 로는 건드리지 않음.

3. **Pretendard Variable 의 CSS 사이즈**: 약 300KB. 첫 로드에 영향 — Next/Font 로 self-host 하거나 service-worker 캐시 권장. 일단 CDN 으로 시작.

4. **`<html lang>` 변경 시 hydration warning**: `suppressHydrationWarning` 을 root html 에 추가했음 (이미 layout.tsx 에 포함됨).

5. **CrudDialog 의 confirm 버튼**: 위험 작업(`삭제`, `회수`)은 반드시 `color="error"` + 1초 confirm 딜레이.

6. **다국어 폰트 로딩 순서**: `LocaleSync` 는 effect 에서 `<link>` 를 동적 주입. 첫 페인트는 fallback 으로 잠깐 보일 수 있음. 받아들이거나, `<head>` 에서 lazy `<link rel="preload">` 추가.

7. **Recharts 색상**: 차트는 MUI theme 을 자동으로 읽지 않음. `dashboard/components/*` 내에서 `useTheme()` 으로 받아 props 로 명시 전달해야 함.

---

## 6. 디자인 결정 4건 (사용자 확정 필요)

이 핸드오프는 다음 결정을 **이미 내려져 있다는 전제**로 작성되었습니다. 사용자가 다른 답을 원하면 토큰만 바꾸면 전 시스템이 따라옵니다.

| # | 질문 | 이 패키지의 답 | 변경 시 영향 |
|---|---|---|---|
| 1 | 브랜드 컬러? | 슬레이트 블루 `oklch(0.48 0.09 245)` | `tokens.accent` 만 교체 |
| 2 | 기본 폰트? | Pretendard Variable (KR/EN 통합) | `tokens.font.sans.default` 만 교체 |
| 3 | Light/Dark? | Light 우선, Dark 도 정의 완료 (선택 시 동작) | 변경 없음 |
| 4 | MUI 유지? | 유지 + 깊은 theme override | 별도 결정 필요 |

---

## 7. 참고 자산

이 핸드오프와 함께 제공된 자료:

- **`Redesign Plan.html`** — 16 슬라이드 시각 자료. 디자인 원칙 / 토큰 / Before-After 목업.
- **`handoff/src/`** — 즉시 적용 가능한 코드.
- **`handoff/patches/`** — 부분 수정이 필요한 파일들의 변경 가이드.

질문이 생기면 우선 슬라이드 5 (재개편 원칙), 6–7 (토큰), 8 (3개 시각 방언) 을 참고하세요. 모든 컴포넌트 결정은 이 3가지 원칙에서 파생됩니다.

---

## 8. 작업 완료의 정의

다음이 모두 참일 때 재개편 완료:

1. ✅ 모든 admin 페이지가 `PageHeader + DataShell` 패턴
2. ✅ Sidebar 활성 메뉴가 solid blue 풀필이 아닌 subtle tint + 좌측 accent rule
3. ✅ 한 화면에 슬레이트 블루 외 강조색 없음 (위험 작업에만 burnt sienna)
4. ✅ DevTools 에서 body font-family 가 Pretendard 로 시작
5. ✅ `/ko/login` 이 2분할 레이아웃, MFA segmented 입력
6. ✅ 4개 언어 (`ko/en/zh/vi`) 에서 텍스트가 각 언어 폰트로 렌더
7. ✅ `npm run build` 통과, `npm run lint` 통과, `npm run type-check` 통과
8. ✅ light + dark 모드 모두 정상 (사용자가 dark 채택 시)

---

**준비됐으면 Step 1 부터 시작하세요. 각 Step 종료 시 검증 체크리스트를 한 번 돌리고 다음으로 넘어가는 것이 가장 안전합니다.**
