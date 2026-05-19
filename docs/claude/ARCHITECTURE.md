# ARCHITECTURE — CoreNext Enterprise Platform

> 최종 업데이트: 2026-05-19

## 1. 전체 구조도

```
브라우저 / 모바일 앱
        │
        ▼
┌─────────────────┐
│  Next.js 16     │  포트 3000 (dev) / 80 (prod)
│  (App Router)   │
└────────┬────────┘
         │ HTTP (dev: 직접 포트, prod: 상대 경로)
         ▼
┌─────────────────┐
│     Nginx       │  리버스 프록시 / 로드밸런서
└──┬──────┬───┬───┘
   │      │   │
   ▼      ▼   ▼
┌──────┐ ┌──────┐ ┌───────────┐
│core  │ │app   │ │inspection │
│:3011 │ │:3012 │ │:3013      │
└──┬───┘ └──┬───┘ └─────┬─────┘
   │        │            │
   └────────┼────────────┘
            ▼
   ┌────────────────────────────────┐
   │  Supabase PostgreSQL 16        │  (클라우드 DB, Transaction Pooler)
   │  aws-0-ap-southeast-1:6543     │
   └────────────────────────────────┘
            │
   ┌────────────────┐
   │    Redis 7     │  (세션/토큰 관리)
   └────────────────┘

모니터링 (선택적):
Prometheus → Grafana
Loki ← Promtail
```

---

## 2. 모노레포 구조 및 빌드 순서

```
nextjs-enterprise-app/
├── shared/           # @enterprise/shared — 반드시 먼저 빌드
├── services/
│   ├── core-service/   (3011)
│   ├── app-service/    (3012)
│   └── inspection-service/ (3013)
├── src/              # Next.js 16 프론트엔드
├── database/         # Liquibase 마이그레이션
└── infrastructure/   # Docker, Nginx, 모니터링
```

**빌드 순서 (필수):**

```bash
npm run build:shared   # 1단계: shared 라이브러리 먼저
npm run build:services # 2단계: 3개 서비스 병렬 빌드
npm run build          # 3단계: Next.js 프론트엔드
```

---

## 3. @enterprise/shared 라이브러리

**패키지명:** `@enterprise/shared` (v1.1.0)  
**경로:** `shared/src/`

| 모듈 | 주요 exports |
|------|-------------|
| `database/` | `query`, `queryOne`, `queryMany`, `withTransaction`, `getPool`, `setServiceName` |
| `middleware/` | `authenticateToken`, `errorHandler`, `requestLogger` |
| `utils/` | `jwt`, `password`, `response`, `multiLangTransform`, `validation` |
| `auth/` | JWT 생성/검증 유틸리티 |
| `types/` | 공용 TypeScript 타입 |
| `config/` | 환경변수 로딩, DB 설정 |

모든 서비스는 `@enterprise/shared`를 `file:../../shared`로 참조한다.

---

## 4. 마이크로서비스 상세

### 4.1 core-service (포트 3011)

**책임:** 인증 + 관리자 기능 + 공통 데이터

```
modules/
├── auth/       # 로그인, MFA, 토큰 갱신, SSO, user-settings
├── admin/      # users, roles, menus, departments, programs,
│               # user-role-mappings, role-program-mappings
└── common/     # codes, code-types, attachments, logs,
                # app-settings, dashboard
```

**공통 엔드포인트:**
- `GET /health` — 상태 확인
- `GET /metrics` — Prometheus 메트릭
- `GET /api-docs` — Swagger UI

### 4.2 app-service (포트 3012)

**책임:** 콘텐츠 + 커뮤니케이션

```
modules/
├── content/    # board-types, posts, comments, qna, help
└── communication/ # mail, messages, conversations
```

### 4.3 inspection-service (포트 3013)

**책임:** 현장 검수 워크플로우

```
modules/
├── templates/  # 체크시트 템플릿 CRUD
├── items/      # 템플릿 항목 (계층형)
├── inspections/ # 검수 실행 및 결과
├── sync/       # 오프라인 동기화 (download/upload/status)
└── dashboard/  # 통계 및 분석
```

---

## 5. Next.js 프론트엔드 아키텍처

### 5.1 i18n 라우팅

```
src/app/
├── page.tsx              # → /en/login 리다이렉트
└── [locale]/             # en | ko | zh | vi
    ├── layout.tsx        # ClientProviders 주입
    ├── login/
    ├── dashboard/
    ├── admin/
    ├── boards/[boardTypeId]/
    ├── inspection/
    ├── mail/
    ├── reports/
    └── dev/              # 컴포넌트 쇼케이스
```

**middleware.ts**: `next-international` 기반 URL 라우팅, `/api/`, `/_next/` 제외

### 5.2 Provider 계층구조

```tsx
I18nProviderClient
  └─ AppSettingsProvider
    └─ ThemeProvider (MUI)
      └─ AuthProvider (AuthContext)
        └─ LanguageLoader
          └─ PermissionProvider (PermissionContext)
            └─ MenuProvider (MenuContext)
              └─ {children}
              └─ NoticePopup
              └─ ToastContainer
```

**파일:** `src/components/providers/ClientProviders.tsx`

### 5.3 React Context (3개)

#### AuthContext — `src/contexts/AuthContext.tsx`

```typescript
// 상태
{ user, token, refreshToken, isAuthenticated, isLoading }

// 주요 메서드
login(username, password)    // MFA 또는 성공 반환
verifyMFA(mfaToken, code)
logout()
refreshAccessToken()
ssoLogin(loginid)
updateUser(user)

// localStorage 키
accessToken | refreshToken | user (JSON)
```

#### MenuContext — `src/contexts/MenuContext.tsx`

```typescript
{ menus, currentMenu, favoriteMenus, recentMenus, isLoading, error }

fetchMenus()     // 플랫폼 감지 (모바일/데스크톱)
getMenuByPath(path)
addToFavorites(menuId) / removeFromFavorites(menuId)
```

#### PermissionContext — `src/contexts/PermissionContext.tsx`

```typescript
{ permissions: ProgramPermission[] }

hasAccess(programCode) | canView | canCreate | canUpdate | canDelete
refreshPermissions()

// 커스텀 훅
usePermissions()
useProgramPermissions(programCode)
```

### 5.4 API 클라이언트 패턴

**파일:** `src/lib/axios/index.ts`

6개의 지연 초기화(lazy-init) Axios 인스턴스:

| 클라이언트 | 서비스 | 기본 경로 |
|-----------|--------|----------|
| `authApi` | core-service | `/auth` |
| `adminApi` | core-service | `/admin` |
| `commonApi` | core-service | `/common` |
| `contentApi` | app-service | `/content` |
| `commApi` | app-service | `/comm` |
| `inspectionApi` | inspection-service | `/inspection` |

**인터셉터 동작:**
1. **요청**: localStorage에서 `accessToken` 읽어 `Authorization: Bearer` 헤더 추가  
   (skip: `/auth/login`, `/auth/refresh`, `/auth/sso` 등)
2. **응답 401**: `refreshToken`으로 갱신 → 원본 요청 재시도
3. **갱신 실패**: localStorage 초기화 → `/en/login` 리다이렉트
4. **FormData**: `Content-Type` 헤더 자동 제거 (multipart 처리)

**URL 설정:**
- 개발: 포트 직접 지정 (`http://localhost:3011/auth`)
- 운영: 상대 경로 (`/auth`) — Nginx가 upstream으로 라우팅

**파일:** `src/lib/api/config.ts`

### 5.5 라우트 보호

**파일:** `src/components/auth/RouteGuard.tsx`

```tsx
<RouteGuard programCode="PROG-USER-MGMT" requiredPermission="view">
  {children}
</RouteGuard>
```

- 공개 라우트: `/[locale]/login`, `/`, `/[locale]`
- 미인증: `/en/login` 리다이렉트
- 권한 없음: Access Denied UI 표시 (리다이렉트 아님)

### 5.6 권한 시스템 (RBAC)

```
User ──N:M──> Role ──N:M──> Program
                  role_program_mappings
                  { can_view, can_create, can_update, can_delete }
```

**programCode 예시:** `PROG-USER-MGMT`, `PROG-BOARD-001`

**관련 훅:**
- `useProgramId()` — 현재 라우트에서 programCode 추출
- `usePermissionControl(programCode)` — 버튼 가시성 제어
- `useDataGridPermissions(programId)` — 데이터 그리드 툴바 제어

---

## 6. 데이터베이스

### 6.0 Supabase 운영 DB 연결 정보

프로덕션 DB는 Supabase 클라우드 PostgreSQL (프로젝트: `yomarhbjvsdtnjlawhkd`, 리전: `ap-southeast-1`)을 사용한다.

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | `yomarhbjvsdtnjlawhkd` |
| 리전 | `ap-southeast-1` (서울 인근) |
| 연결 방식 | Transaction Pooler (IPv4 지원) |
| **DB_HOST** | `aws-0-ap-southeast-1.pooler.supabase.com` |
| **DB_PORT** | `6543` |
| **DB_NAME** | `postgres` |
| **DB_USER** | `postgres.yomarhbjvsdtnjlawhkd` |
| **DB_SSL** | `true` |
| **DB_POOL_MAX** | `5` (서비스 3개 × 5 = 15 연결, 무료 플랜 상한 내) |

**연결 방식 비고:**
- **Transaction Pooler (port 6543)** — IPv4 지원, 무상태 쿼리에 최적 (권장)
- **Direct (db.*.supabase.co:5432)** — IPv6 전용 (Supabase 무료 플랜), 서버가 IPv6를 지원하는 경우 사용 가능
- Supabase 대시보드: `https://supabase.com/dashboard/project/yomarhbjvsdtnjlawhkd`

**마이그레이션 도구** (`database/` 디렉토리):
- `migrate-to-supabase.js` — 전체 마이그레이션 (로컬 pg → Supabase, Management API 사용)
- `migrate-failed-tables.js` — 특수 타입 테이블 재임포트 (text[], tsvector, 대용량 JSONB)
- `supabase-schema-only.sql` — 스키마 참조용

---

### 6.1 마이그레이션 순서 (Liquibase)

```
database/changelog/v1.0/
├── 001-create-code-tables.xml      # code_types, codes
├── 002-create-user-tables.xml      # users, roles, sessions
├── 003-create-menu-tables.xml      # menus, programs
├── 004-create-content-tables.xml   # board_types, posts, comments
├── 005-create-communication-tables.xml  # mail, messages, conversations
├── 006-create-system-tables.xml    # app_settings, logs, audit
├── 007-create-indexes.xml          # 성능 인덱스
├── 008-load-required-seed.xml      # 기본 역할/권한/코드
└── 009-load-sample-seed.xml        # 개발용 샘플 데이터

database/changelog/inspection/
├── 001_create_checksheet_tables.sql
├── 002_sample_data.sql
├── 003_additional_sample_templates.sql
└── 004_additional_items_and_inspections.sql
```

**시드 전략:**
- `database/seed/required/` — 항상 로드 (운영 포함)
- `database/seed/sample/` — 개발/테스트 전용

### 6.2 주요 테이블

| 테이블 | 서비스 | 설명 |
|--------|--------|------|
| `users` | core | 사용자 기본 정보 |
| `roles` | core | 역할 정의 |
| `user_role_mappings` | core | 사용자-역할 N:M |
| `role_program_mappings` | core | 역할-프로그램 CRUD 권한 |
| `menus` | core | 계층형 메뉴 |
| `programs` | core | 기능 모듈 등록 |
| `codes` / `code_types` | core | 코드 마스터 |
| `board_types` / `posts` | app | 게시판 |
| `conversations` | app | 대화 스레드 |
| `checksheet_templates` | inspection | 검수 양식 |
| `inspection_executions` | inspection | 검수 실행 기록 |

---

## 7. 인프라

### Docker Compose 서비스

| 서비스 | 이미지 | 외부 포트 |
|--------|--------|----------|
| postgres | postgres:16.11 | 9090→5432 |
| redis | redis:7-alpine | 없음 (내부) |
| nginx | nginx:alpine | 80 |
| frontend | 빌드 | 없음 (내부:3000) |
| core-service | 빌드 | 없음 (내부:3011) |
| app-service | 빌드 | 없음 (내부:3012) |
| inspection-service | 빌드 | 없음 (내부:3013) |

**볼륨:** `pg16_pgdata_16_11` — 외부 볼륨 (배포 전 수동 생성 필요)

### Nginx 업스트림

```nginx
upstream frontend      { server frontend:3000; }
upstream core_service  { server core-service:3011; }
upstream app_service   { server app-service:3012; }
upstream inspection    { server inspection-service:3013; }
```

파일 업로드 제한: 50MB | Gzip 압축 활성화 | Keep-alive 연결

---

## 8. 모니터링 스택 (선택적)

Docker Compose profile `monitoring`으로 활성화:

| 컴포넌트 | 역할 |
|---------|------|
| Prometheus 2.47.0 | 각 서비스 `/metrics` 수집 |
| Grafana 10.2.0 | 대시보드 시각화 |
| Loki 2.9.2 | 로그 집계 |
| Promtail 2.9.2 | 컨테이너 로그 → Loki 전달 |

---

## 9. 주요 파일 경로 참조

| 파일 | 역할 |
|------|------|
| `src/lib/axios/index.ts` | 6개 API 클라이언트 + 인터셉터 |
| `src/lib/api/config.ts` | 환경별 API URL 설정 |
| `src/lib/api/client.ts` | 서비스별 API 래퍼 |
| `src/contexts/AuthContext.tsx` | 인증 상태 관리 |
| `src/contexts/MenuContext.tsx` | 메뉴 상태 관리 |
| `src/contexts/PermissionContext.tsx` | 권한 상태 관리 |
| `src/components/providers/ClientProviders.tsx` | Provider 계층 조립 |
| `src/components/auth/RouteGuard.tsx` | 라우트 보호 |
| `middleware.ts` | i18n 미들웨어 |
| `shared/src/database/index.ts` | DB 풀 관리 |
| `infrastructure/docker/docker-compose.yml` | 전체 스택 정의 |
| `infrastructure/nginx/nginx.conf` | 리버스 프록시 설정 |

---

## 10. 배포 아키텍처 (Vercel + Render.com)

> 프로덕션 배포 방식: Next.js 프론트엔드는 Vercel, 3개 마이크로서비스는 Render.com에 배포한다.

### 10.1 배포 구조도

```
브라우저
    │
    ▼
┌─────────────────────────────────┐
│  Vercel (Next.js 프론트엔드)     │
│  https://<app>.vercel.app        │
└──────────────┬──────────────────┘
               │ NEXT_PUBLIC_*_API_URL
               ▼
┌─────────────────────────────────────────────────────┐
│                  Render.com                          │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ corenext-core-service                        │   │
│  │ https://corenext-core-service.onrender.com   │   │
│  │ 담당: /auth  /admin  /common                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ corenext-app-service                         │   │
│  │ https://corenext-app-service.onrender.com    │   │
│  │ 담당: /content  /comm                        │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ corenext-inspection-service                  │   │
│  │ https://corenext-inspection-service.onrender.com │
│  │ 담당: /inspection                            │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  Supabase             │
          │  PostgreSQL 16        │  (트랜잭션 풀러)
          │  + Storage (uploads)  │  (파일 업로드)
          └───────────────────────┘
```

### 10.2 Render.com 서비스 매핑

| Render 서비스명 | URL | 담당 모듈 |
|----------------|-----|----------|
| `corenext-core-service` | `https://corenext-core-service.onrender.com` | 인증, 관리자, 공통 데이터 |
| `corenext-app-service` | `https://corenext-app-service.onrender.com` | 게시판, 커뮤니케이션 |
| `corenext-inspection-service` | `https://corenext-inspection-service.onrender.com` | 체크시트, 검수, 동기화 |

**Render Blueprint 파일:** `render.yaml` (프로젝트 루트)

### 10.3 Vercel 환경변수 (NEXT_PUBLIC_*)

Vercel 대시보드에 설정하는 환경변수:

| 환경변수 | 값 |
|---------|-----|
| `NEXT_PUBLIC_AUTH_API_URL` | `https://corenext-core-service.onrender.com/auth` |
| `NEXT_PUBLIC_ADMIN_API_URL` | `https://corenext-core-service.onrender.com/admin` |
| `NEXT_PUBLIC_COMMON_API_URL` | `https://corenext-core-service.onrender.com/common` |
| `NEXT_PUBLIC_CONTENT_API_URL` | `https://corenext-app-service.onrender.com/content` |
| `NEXT_PUBLIC_COMM_API_URL` | `https://corenext-app-service.onrender.com/comm` |
| `NEXT_PUBLIC_INSPECTION_API_URL` | `https://corenext-inspection-service.onrender.com/inspection` |

**파일:** `.env.production` — 위 값들이 커밋되어 있다 (시크릿 없음, URL만 포함).

### 10.4 Supabase Storage (파일 업로드)

파일 업로드는 로컬 디스크 대신 Supabase Storage를 사용한다.

| 항목 | 값 |
|------|-----|
| 버킷명 | `uploads` |
| 접근 방식 | Public (공개 URL 직접 접근) |
| 헬퍼 파일 | 각 서비스의 `src/utils/supabaseStorage.ts` |
| Multer 설정 | `memoryStorage()` (디스크 저장 없음) |

**업로드 흐름:**
1. 클라이언트 → 서비스 API (multipart/form-data)
2. 서비스: `multer memoryStorage` → `buffer` 획득
3. 서비스: `supabaseStorage.ts` → Supabase Storage SDK로 업로드
4. 서비스: 반환된 공개 URL을 DB에 저장

**Render.com 서비스 환경변수 (수동 설정, `sync: false`):**

```
SUPABASE_URL=https://yomarhbjvsdtnjlawhkd.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>  # Supabase 대시보드에서 발급
```

### 10.5 URL 설정 파일

**`src/lib/api/config.ts`** — 환경별 API URL 분기:
- 개발: `localhost:3011/3012/3013` 직접 호출
- 운영: `NEXT_PUBLIC_*_API_URL` 환경변수 우선, 미설정 시 상대경로 (`/auth` 등, Nginx용) 폴백
