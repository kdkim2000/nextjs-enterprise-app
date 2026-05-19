# DEPLOY — Vercel + Render.com 배포 가이드

> 최종 업데이트: 2026-05-19  
> CoreNext 프로덕션 배포: Next.js 프론트엔드는 Vercel, 3개 마이크로서비스는 Render.com에 배포한다.

---

## Architecture

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
          │  PostgreSQL 16        │  (트랜잭션 풀러, 포트 6543)
          │  + Storage (uploads)  │  (파일 업로드 버킷)
          └───────────────────────┘
```

---

## Prerequisites

- Vercel 계정 (무료)
- Render.com 계정 (무료)
- Supabase 프로젝트 (이미 구성됨: `yomarhbjvsdtnjlawhkd`, 리전: `ap-southeast-1`)
- GitHub 저장소 (CI/CD 연동용)

---

## One-Time Setup

### Supabase Storage Setup

1. [Supabase 대시보드](https://supabase.com/dashboard/project/yomarhbjvsdtnjlawhkd) 접속
2. 좌측 메뉴 → **Storage**
3. **New bucket** 클릭
4. 버킷 이름: `uploads`
5. **Public bucket** 체크 활성화 (공개 URL 접근 허용)
6. **Create bucket** 클릭
7. **Settings → API** 에서 아래 값 확인:
   - `SUPABASE_URL`: `https://yomarhbjvsdtnjlawhkd.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `service_role` 키 (anon 키 아님)

---

### Render.com Setup

1. [render.com](https://render.com) → **New** → **Blueprint**
2. GitHub 저장소 연결
3. Render가 프로젝트 루트의 `render.yaml`을 자동 감지
4. 각 서비스에 아래 환경변수를 **수동으로 설정** (render.yaml에서 `sync: false`로 표시된 항목):

**corenext-core-service:**
```
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_USER=postgres.yomarhbjvsdtnjlawhkd
DB_PASSWORD=<supabase-db-password>
JWT_SECRET=<generate-secure-random>
JWT_REFRESH_SECRET=<generate-secure-random>
CORS_ORIGINS=https://<your-vercel-app>.vercel.app
SUPABASE_URL=https://yomarhbjvsdtnjlawhkd.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
```

**corenext-app-service:**
```
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_USER=postgres.yomarhbjvsdtnjlawhkd
DB_PASSWORD=<supabase-db-password>
JWT_SECRET=<same-as-core-service>
JWT_REFRESH_SECRET=<same-as-core-service>
CORS_ORIGINS=https://<your-vercel-app>.vercel.app
SUPABASE_URL=https://yomarhbjvsdtnjlawhkd.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
```

**corenext-inspection-service:**
```
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_USER=postgres.yomarhbjvsdtnjlawhkd
DB_PASSWORD=<supabase-db-password>
CORS_ORIGINS=https://<your-vercel-app>.vercel.app
SUPABASE_URL=https://yomarhbjvsdtnjlawhkd.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
```

5. **Apply** 클릭 → 배포 시작
6. 배포 완료 후 서비스 URL 확인:
   - `https://corenext-core-service.onrender.com`
   - `https://corenext-app-service.onrender.com`
   - `https://corenext-inspection-service.onrender.com`

---

### Vercel Setup

1. [vercel.com](https://vercel.com) → **New Project**
2. GitHub 저장소 Import
3. **Environment Variables** 섹션에서 아래 변수 추가:

```
NEXT_PUBLIC_AUTH_API_URL=https://corenext-core-service.onrender.com/auth
NEXT_PUBLIC_ADMIN_API_URL=https://corenext-core-service.onrender.com/admin
NEXT_PUBLIC_COMMON_API_URL=https://corenext-core-service.onrender.com/common
NEXT_PUBLIC_CONTENT_API_URL=https://corenext-app-service.onrender.com/content
NEXT_PUBLIC_COMM_API_URL=https://corenext-app-service.onrender.com/comm
NEXT_PUBLIC_INSPECTION_API_URL=https://corenext-inspection-service.onrender.com/inspection
```

> **Note:** 이 값들은 `.env.production`에도 커밋되어 있다. Vercel 대시보드 설정이 우선 적용된다.

4. **Deploy** 클릭

---

## After Deployment: Update CORS

Vercel 배포 완료 후 실제 Vercel 앱 URL을 확인하여, 각 Render.com 서비스의 `CORS_ORIGINS` 환경변수를 실제 도메인으로 업데이트한다.

1. Vercel 대시보드에서 배포된 URL 확인 (예: `https://corenext.vercel.app`)
2. Render.com → 각 서비스 → **Environment** → `CORS_ORIGINS` 수정:
   ```
   CORS_ORIGINS=https://corenext.vercel.app
   ```
3. 각 서비스 **Manual Deploy** 또는 git push로 재배포

---

## Verification

배포 완료 후 아래 항목을 순서대로 확인한다:

```
1. https://<app>.vercel.app/ko/login  → 로그인 페이지 렌더링 확인
2. 로그인 시도 → 성공 여부 확인
3. https://corenext-core-service.onrender.com/health → {"status":"healthy"}
4. https://corenext-app-service.onrender.com/health → {"status":"healthy"}
5. https://corenext-inspection-service.onrender.com/health → {"status":"healthy"}
6. 파일 업로드 기능 → Supabase Storage 버킷에 저장 확인
7. 브라우저 콘솔 → CORS 에러 없음 확인
```

---

## Render.com Blueprint 파일 구조

`render.yaml` (프로젝트 루트) — Render Blueprint 정의:

| 항목 | 값 |
|------|-----|
| 런타임 | `node` |
| 리전 | `singapore` (ap-southeast-1, Supabase DB와 동일 리전) |
| 플랜 | `free` |
| rootDir | `.` (모노레포 루트) |

**빌드 순서 (각 서비스 공통):**
```bash
# 1단계: shared 라이브러리 빌드 (필수 선행)
npm ci --prefix shared && npm run build --prefix shared

# 2단계: 해당 서비스 빌드
npm ci --prefix services/<service-name> && npm run build --prefix services/<service-name>
```

---

## Continuous Deployment

| 플랫폼 | 트리거 | 대상 |
|--------|--------|------|
| Vercel | `main` 브랜치 push | Next.js 프론트엔드 자동 배포 |
| Render.com | `main` 브랜치 push | 3개 서비스 자동 배포 |

> **Note:** `render.yaml` 변경 후 git push만으로 Render.com 서비스 구성이 자동으로 업데이트된다.

---

## Free Tier Limitations

| 서비스 | 제한 사항 |
|--------|---------|
| **Render.com** | 서비스 15분 비활성 시 슬립; 최초 요청 시 약 30초 콜드 스타트 |
| **Supabase** | DB 스토리지 500MB, 파일 스토리지 1GB |
| **Vercel** | 월 100GB 대역폭, 무제한 배포 |

**콜드 스타트 해결 방법 (유료 플랜 사용 불가 시):**
- UptimeRobot 등 무료 헬스체크 서비스로 `/health` 엔드포인트를 5분 간격으로 핑한다.

---

## Troubleshooting

### CORS 에러

```
Access to XMLHttpRequest at 'https://corenext-core-service.onrender.com/...'
has been blocked by CORS policy
```

**해결:** Render.com → 서비스 → Environment → `CORS_ORIGINS` 값이 현재 Vercel 도메인과 일치하는지 확인.

### 서비스 빌드 실패

```
Cannot find module '@enterprise/shared'
```

**해결:** `render.yaml`의 buildCommand에서 `shared` 빌드 선행 명령이 있는지 확인:
```
npm ci --prefix shared && npm run build --prefix shared && ...
```

### Supabase Storage 업로드 실패

```
Error: Unauthorized
```

**해결:** `SUPABASE_SERVICE_KEY`가 `service_role` 키인지 확인 (`anon` 키는 스토리지 쓰기 권한 없음).

### DB 연결 실패

```
Error: connect ECONNREFUSED
```

**해결:**
- `DB_HOST`가 Transaction Pooler 주소인지 확인: `aws-0-ap-southeast-1.pooler.supabase.com`
- `DB_PORT=6543` 확인
- `DB_SSL=true` 확인

---

## Related Files

| 파일 | 역할 |
|------|------|
| `render.yaml` | Render.com Blueprint 정의 (3개 서비스) |
| `.env.production` | Vercel 배포용 API URL 환경변수 |
| `src/lib/api/config.ts` | 환경별 API URL 분기 로직 |
| `services/*/src/utils/supabaseStorage.ts` | Supabase Storage 헬퍼 (각 서비스) |
| `services/*/src/services/attachmentService.ts` | 파일 업로드/다운로드 서비스 |
