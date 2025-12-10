# MSA 서비스 통합 계획 (방안 B)

> 작성일: 2024-12-11
> 브랜치: 16-msa
> 상태: 계획 수립 완료

## 1. 개요

### 1.1 목표
- 5개 마이크로서비스를 2개로 통합하여 운영 효율성 향상
- 중복 코드 제거 및 유지보수성 개선
- 리소스 사용량 최적화 (DB 커넥션, 메모리)

### 1.2 통합 전략
- **core-service**: 인증, 관리, 공통 기능 통합
- **app-service**: 콘텐츠, 커뮤니케이션 기능 통합
- 기존 API 경로 유지 (프론트엔드 변경 최소화)

---

## 2. 현재 아키텍처 (AS-IS)

### 2.1 서비스 구성
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  auth-service   │ │  admin-service  │ │ common-service  │
│     (3011)      │ │     (3012)      │ │     (3015)      │
│   14 files      │ │   28 files      │ │   26 files      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐
│content-service  │ │ communication   │
│     (3013)      │ │     (3014)      │
│   22 files      │ │   17 files      │
└─────────────────┘ └─────────────────┘
```

### 2.2 현재 문제점
| 문제 | 상세 |
|------|------|
| 코드 중복 | database.ts, jwt.ts, authMiddleware.ts 등 5개 서비스에 중복 |
| 리소스 낭비 | 각 서비스 max 20 커넥션 → 총 100개 DB 커넥션 |
| 운영 복잡성 | 5개 서비스 개별 배포/관리/모니터링 |
| 빌드 시간 | 5개 Docker 이미지 개별 빌드 |

---

## 3. 목표 아키텍처 (TO-BE)

### 3.1 통합 구성
```
┌──────────────────────────────────────────────────┐
│              core-service (3011)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │   auth   │ │  admin   │ │  common  │         │
│  │ /auth/*  │ │ /admin/* │ │ /common/*│         │
│  └──────────┘ └──────────┘ └──────────┘         │
│  Routes: auth, users, roles, menus, codes, etc. │
│  68 files → ~45 files (중복 제거)                │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│              app-service (3012)                  │
│  ┌──────────────────┐ ┌──────────────────┐      │
│  │     content      │ │  communication   │      │
│  │   /content/*     │ │     /comm/*      │      │
│  └──────────────────┘ └──────────────────┘      │
│  Routes: posts, comments, mail, messages, etc.  │
│  39 files → ~30 files (중복 제거)                │
└──────────────────────────────────────────────────┘
```

### 3.2 서비스별 라우트 매핑

#### core-service (포트: 3011)
| 원본 서비스 | 라우트 | 기능 |
|-------------|--------|------|
| auth-service | `/auth/*` | 로그인, 로그아웃, 토큰 관리 |
| auth-service | `/auth/user-settings/*` | 사용자 설정 |
| admin-service | `/admin/users/*` | 사용자 관리 |
| admin-service | `/admin/roles/*` | 역할 관리 |
| admin-service | `/admin/menus/*` | 메뉴 관리 |
| admin-service | `/admin/departments/*` | 부서 관리 |
| admin-service | `/admin/programs/*` | 프로그램 관리 |
| admin-service | `/admin/role-program-mappings/*` | 역할-프로그램 매핑 |
| admin-service | `/admin/user-role-mappings/*` | 사용자-역할 매핑 |
| common-service | `/common/codes/*` | 공통 코드 |
| common-service | `/common/code-types/*` | 코드 타입 |
| common-service | `/common/attachments/*` | 첨부파일 |
| common-service | `/common/attachment-types/*` | 첨부파일 타입 |
| common-service | `/common/app-settings/*` | 앱 설정 |
| common-service | `/common/logs/*` | 로그 |
| common-service | `/common/log-analytics/*` | 로그 분석 |
| common-service | `/common/dashboard/*` | 대시보드 |

#### app-service (포트: 3012)
| 원본 서비스 | 라우트 | 기능 |
|-------------|--------|------|
| content-service | `/content/board-types/*` | 게시판 타입 |
| content-service | `/content/posts/*` | 게시글 |
| content-service | `/content/comments/*` | 댓글 |
| content-service | `/content/qna/*` | Q&A |
| content-service | `/content/help/*` | 도움말 |
| communication-service | `/comm/mail/*` | 메일 |
| communication-service | `/comm/messages/*` | 메시지 |
| communication-service | `/comm/conversations/*` | 대화 |

---

## 4. 구현 Phase 및 Task

### Phase 1: 준비 단계 (Shared 라이브러리 확장)

| Task ID | Task | 설명 | 예상 파일 | 우선순위 |
|---------|------|------|-----------|----------|
| P1-01 | 공통 Database 모듈 추가 | 중복 database.ts 통합 | `shared/src/database/index.ts` | 필수 |
| P1-02 | 공통 JWT 모듈 추가 | 중복 jwt.ts 통합 | `shared/src/auth/jwt.ts` | 필수 |
| P1-03 | 공통 Auth Middleware 추가 | 중복 authMiddleware.ts 통합 | `shared/src/middleware/auth.ts` | 필수 |
| P1-04 | 공통 Types 통합 | TokenPayload 등 타입 통합 | `shared/src/types/index.ts` | 필수 |
| P1-05 | 공통 Utils 통합 | multiLangTransform 등 | `shared/src/utils/index.ts` | 선택 |
| P1-06 | Shared 빌드 및 테스트 | 통합된 shared 패키지 검증 | - | 필수 |

**예상 산출물:**
```
shared/
├── src/
│   ├── database/
│   │   └── index.ts          # DB Pool 생성, query 함수
│   ├── auth/
│   │   └── jwt.ts            # 토큰 생성/검증
│   ├── middleware/
│   │   └── auth.ts           # authenticateToken, requireAdmin
│   ├── types/
│   │   └── index.ts          # TokenPayload, Request 확장
│   └── utils/
│       └── multiLangTransform.ts
└── package.json
```

---

### Phase 2: core-service 생성

| Task ID | Task | 설명 | 예상 파일 | 우선순위 |
|---------|------|------|-----------|----------|
| P2-01 | core-service 프로젝트 생성 | 기본 구조 및 package.json | `services/core-service/*` | 필수 |
| P2-02 | auth 모듈 이전 | auth-service 코드 이전 | `src/modules/auth/*` | 필수 |
| P2-03 | admin 모듈 이전 | admin-service 코드 이전 | `src/modules/admin/*` | 필수 |
| P2-04 | common 모듈 이전 | common-service 코드 이전 | `src/modules/common/*` | 필수 |
| P2-05 | 통합 server.ts 작성 | 모든 라우트 통합 | `src/server.ts` | 필수 |
| P2-06 | Swagger 통합 | 3개 서비스 API 문서 통합 | `src/swagger.ts` | 선택 |
| P2-07 | Dockerfile 작성 | 통합 서비스용 Docker 설정 | `Dockerfile` | 필수 |
| P2-08 | 빌드 및 단위 테스트 | 통합 서비스 검증 | - | 필수 |

**예상 산출물:**
```
services/core-service/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   └── userSettings.ts
│   │   │   └── services/
│   │   │       ├── authService.ts
│   │   │       ├── userService.ts
│   │   │       └── userSettingsService.ts
│   │   ├── admin/
│   │   │   ├── routes/
│   │   │   │   ├── user.ts
│   │   │   │   ├── role.ts
│   │   │   │   ├── menu.ts
│   │   │   │   ├── department.ts
│   │   │   │   ├── program.ts
│   │   │   │   ├── roleProgramMapping.ts
│   │   │   │   └── userRoleMapping.ts
│   │   │   └── services/
│   │   │       └── ...
│   │   └── common/
│   │       ├── routes/
│   │       │   ├── code.ts
│   │       │   ├── codeType.ts
│   │       │   ├── attachment.ts
│   │       │   ├── attachmentType.ts
│   │       │   ├── appSettings.ts
│   │       │   ├── log.ts
│   │       │   ├── logAnalytics.ts
│   │       │   └── dashboard.ts
│   │       ├── services/
│   │       └── middleware/
│   │           └── fileUpload.ts
│   ├── middleware/
│   │   └── rateLimiter.ts
│   ├── server.ts
│   └── swagger.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

### Phase 3: app-service 생성

| Task ID | Task | 설명 | 예상 파일 | 우선순위 |
|---------|------|------|-----------|----------|
| P3-01 | app-service 프로젝트 생성 | 기본 구조 및 package.json | `services/app-service/*` | 필수 |
| P3-02 | content 모듈 이전 | content-service 코드 이전 | `src/modules/content/*` | 필수 |
| P3-03 | communication 모듈 이전 | communication-service 코드 이전 | `src/modules/communication/*` | 필수 |
| P3-04 | 통합 server.ts 작성 | 모든 라우트 통합 | `src/server.ts` | 필수 |
| P3-05 | Swagger 통합 | 2개 서비스 API 문서 통합 | `src/swagger.ts` | 선택 |
| P3-06 | Dockerfile 작성 | 통합 서비스용 Docker 설정 | `Dockerfile` | 필수 |
| P3-07 | 빌드 및 단위 테스트 | 통합 서비스 검증 | - | 필수 |

**예상 산출물:**
```
services/app-service/
├── src/
│   ├── modules/
│   │   ├── content/
│   │   │   ├── routes/
│   │   │   │   ├── boardType.ts
│   │   │   │   ├── post.ts
│   │   │   │   ├── comment.ts
│   │   │   │   ├── qna.ts
│   │   │   │   └── help.ts
│   │   │   ├── services/
│   │   │   │   ├── boardTypeService.ts
│   │   │   │   ├── postService.ts
│   │   │   │   ├── commentService.ts
│   │   │   │   └── helpService.ts
│   │   │   └── middleware/
│   │   │       └── boardAccessControl.ts
│   │   └── communication/
│   │       ├── routes/
│   │       │   ├── mail.ts
│   │       │   ├── message.ts
│   │       │   └── conversation.ts
│   │       └── services/
│   │           ├── mailService.ts
│   │           ├── messageService.ts
│   │           └── conversationService.ts
│   ├── server.ts
│   └── swagger.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

### Phase 4: 인프라 업데이트

| Task ID | Task | 설명 | 예상 파일 | 우선순위 |
|---------|------|------|-----------|----------|
| P4-01 | docker-compose.yml 수정 | 5개 → 2개 서비스로 변경 | `infrastructure/docker/docker-compose.yml` | 필수 |
| P4-02 | nginx.conf 수정 | upstream 및 location 업데이트 | `infrastructure/nginx/nginx.conf` | 필수 |
| P4-03 | 환경변수 정리 | .env 파일 정리 | `.env.example` | 선택 |
| P4-04 | 프론트엔드 API URL 검토 | 필요시 API 경로 수정 | `frontend/src/lib/api.ts` | 검토 |

**Nginx 설정 변경:**
```nginx
# AS-IS: 5개 upstream
upstream auth_service { server corenext-auth-service:3011; }
upstream admin_service { server corenext-admin-service:3012; }
upstream content_service { server corenext-content-service:3013; }
upstream communication_service { server corenext-communication-service:3014; }
upstream common_service { server corenext-common-service:3015; }

# TO-BE: 2개 upstream
upstream core_service {
    server corenext-core-service:3011;
    keepalive 64;
}
upstream app_service {
    server corenext-app-service:3012;
    keepalive 64;
}

# Location 라우팅
location /auth/    { proxy_pass http://core_service/auth/; }
location /admin/   { proxy_pass http://core_service/admin/; }
location /common/  { proxy_pass http://core_service/common/; }
location /content/ { proxy_pass http://app_service/content/; }
location /comm/    { proxy_pass http://app_service/comm/; }
```

**docker-compose.yml 변경:**
```yaml
# AS-IS: 5개 서비스
services:
  auth-service:
    ports: ["3011:3011"]
  admin-service:
    ports: ["3012:3012"]
  content-service:
    ports: ["3013:3013"]
  communication-service:
    ports: ["3014:3014"]
  common-service:
    ports: ["3015:3015"]

# TO-BE: 2개 서비스
services:
  core-service:
    build:
      context: ../..
      dockerfile: services/core-service/Dockerfile
    container_name: corenext-core-service
    expose:
      - "3011"
    environment:
      - NODE_ENV=production
      - PORT=3011
      - DB_HOST=corenext-postgres
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@corenext-redis:6379
    volumes:
      - /data/uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3011/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  app-service:
    build:
      context: ../..
      dockerfile: services/app-service/Dockerfile
    container_name: corenext-app-service
    expose:
      - "3012"
    environment:
      - NODE_ENV=production
      - PORT=3012
      - DB_HOST=corenext-postgres
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - /data/uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3012/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

### Phase 5: 배포 및 검증

| Task ID | Task | 설명 | 우선순위 |
|---------|------|------|----------|
| P5-01 | 스테이징 환경 배포 | 통합 서비스 테스트 배포 | 필수 |
| P5-02 | 통합 테스트 | API 엔드포인트 전체 테스트 | 필수 |
| P5-03 | 성능 테스트 | 응답 시간, 메모리 사용량 비교 | 선택 |
| P5-04 | 프로덕션 배포 | 블루-그린 또는 롤링 배포 | 필수 |
| P5-05 | 기존 서비스 제거 | 5개 서비스 폴더 및 Docker 이미지 정리 | 완료 후 |

**배포 전략:**
```
1. 블루-그린 배포
   - 기존 서비스 (Blue) 유지
   - 새 서비스 (Green) 배포
   - Nginx에서 트래픽 전환
   - 문제 발생 시 즉시 롤백

2. 검증 체크리스트
   □ 인증 API (/auth/login, /auth/logout, /auth/refresh)
   □ 사용자 관리 API (/admin/users/*)
   □ 역할 관리 API (/admin/roles/*)
   □ 메뉴 관리 API (/admin/menus/*)
   □ 공통 코드 API (/common/codes/*)
   □ 첨부파일 API (/common/attachments/*)
   □ 게시판 API (/content/posts/*)
   □ 메일 API (/comm/mail/*)
   □ 메시지 API (/comm/messages/*)
```

---

## 5. 예상 효과

| 항목 | AS-IS | TO-BE | 개선율 |
|------|-------|-------|--------|
| 서비스 수 | 5개 | 2개 | **-60%** |
| Docker 컨테이너 | 5개 | 2개 | **-60%** |
| DB 커넥션 풀 | 100개 (5×20) | 40개 (2×20) | **-60%** |
| 메모리 사용량 | ~500MB | ~200MB | **-60%** |
| 빌드 시간 | 5회 빌드 | 2회 빌드 | **-60%** |
| 중복 파일 | ~25개 | 0개 | **-100%** |
| 배포 복잡도 | 5개 서비스 | 2개 서비스 | **-60%** |

---

## 6. 리스크 및 대응 방안

| 리스크 | 영향도 | 발생 가능성 | 대응 방안 |
|--------|--------|-------------|-----------|
| 마이그레이션 중 서비스 중단 | 높음 | 낮음 | 블루-그린 배포, 기존 서비스 병행 운영 |
| API 경로 변경으로 인한 프론트 오류 | 중간 | 낮음 | 기존 경로 100% 유지 |
| 장애 범위 확대 | 중간 | 중간 | 모듈별 에러 격리, 헬스체크 강화 |
| 롤백 필요 시 | 낮음 | 낮음 | 기존 Docker 이미지 보존, 즉시 롤백 가능 |
| 성능 저하 | 낮음 | 낮음 | 성능 테스트 후 배포, 모니터링 강화 |

---

## 7. 일정 (예상)

| Phase | Task 수 | 예상 기간 |
|-------|---------|-----------|
| Phase 1: Shared 확장 | 6개 | - |
| Phase 2: core-service | 8개 | - |
| Phase 3: app-service | 7개 | - |
| Phase 4: 인프라 | 4개 | - |
| Phase 5: 배포/검증 | 5개 | - |
| **총계** | **30개** | - |

---

## 8. 추후 계획 (방안 C - API Gateway)

서비스 통합 완료 후, 필요 시 API Gateway 도입 검토:

```
                    ┌─────────────────┐
                    │  APISIX / Kong  │
                    │  - 인증 통합     │
                    │  - Rate Limit   │
                    │  - 로깅/모니터링 │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────┴──────┐ ┌─────┴─────┐ ┌─────┴─────┐
       │core-service │ │app-service│ │  legacy   │
       │   (3011)    │ │  (3012)   │ │  (3001)   │
       └─────────────┘ └───────────┘ └───────────┘
```

**API Gateway 도입 시점:**
- 트래픽 증가로 고급 라우팅 필요 시
- 서비스 간 통신 복잡도 증가 시
- 중앙 집중식 인증/인가 필요 시
- A/B 테스트, 카나리 배포 필요 시

---

## 부록 A: 중복 코드 목록

### 현재 중복 파일
| 파일 | 위치 | 중복 수 |
|------|------|---------|
| database.ts | `services/*/src/utils/` | 5개 |
| jwt.ts | `services/*/src/utils/` | 5개 |
| authMiddleware.ts | `services/*/src/middleware/` | 5개 |
| types/index.ts | `services/*/src/types/` | 5개 |
| multiLangTransform.ts | `services/*/src/utils/` | 4개 |

### 통합 후
| 파일 | 위치 | 수 |
|------|------|---|
| database/index.ts | `shared/src/` | 1개 |
| auth/jwt.ts | `shared/src/` | 1개 |
| middleware/auth.ts | `shared/src/` | 1개 |
| types/index.ts | `shared/src/` | 1개 |
| utils/multiLangTransform.ts | `shared/src/` | 1개 |

---

## 부록 B: API 엔드포인트 전체 목록

### core-service
```
# Auth Module
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
GET    /auth/user-settings
PUT    /auth/user-settings

# Admin Module
GET    /admin/users
POST   /admin/users
GET    /admin/users/:id
PUT    /admin/users/:id
DELETE /admin/users/:id

GET    /admin/roles
POST   /admin/roles
GET    /admin/roles/:id
PUT    /admin/roles/:id
DELETE /admin/roles/:id

GET    /admin/menus
POST   /admin/menus
GET    /admin/menus/:id
PUT    /admin/menus/:id
DELETE /admin/menus/:id

GET    /admin/departments
POST   /admin/departments
GET    /admin/departments/:id
PUT    /admin/departments/:id
DELETE /admin/departments/:id

GET    /admin/programs
POST   /admin/programs
GET    /admin/programs/:id
PUT    /admin/programs/:id
DELETE /admin/programs/:id

GET    /admin/role-program-mappings
POST   /admin/role-program-mappings
DELETE /admin/role-program-mappings/:id

GET    /admin/user-role-mappings
POST   /admin/user-role-mappings
DELETE /admin/user-role-mappings/:id

# Common Module
GET    /common/codes
POST   /common/codes
GET    /common/codes/:id
PUT    /common/codes/:id
DELETE /common/codes/:id

GET    /common/code-types
POST   /common/code-types

GET    /common/attachments
POST   /common/attachments
GET    /common/attachments/:id
DELETE /common/attachments/:id

GET    /common/attachment-types

GET    /common/app-settings
PUT    /common/app-settings

GET    /common/logs
GET    /common/log-analytics

GET    /common/dashboard
```

### app-service
```
# Content Module
GET    /content/board-types
POST   /content/board-types
GET    /content/board-types/:id
PUT    /content/board-types/:id
DELETE /content/board-types/:id

GET    /content/posts
POST   /content/posts
GET    /content/posts/:id
PUT    /content/posts/:id
DELETE /content/posts/:id

GET    /content/comments
POST   /content/comments
PUT    /content/comments/:id
DELETE /content/comments/:id

GET    /content/qna
POST   /content/qna
GET    /content/qna/:id
PUT    /content/qna/:id

GET    /content/help
POST   /content/help
GET    /content/help/:id

# Communication Module
GET    /comm/mail
POST   /comm/mail
GET    /comm/mail/:id
PUT    /comm/mail/:id
DELETE /comm/mail/:id

GET    /comm/messages
POST   /comm/messages
GET    /comm/messages/:id
PUT    /comm/messages/:id
DELETE /comm/messages/:id

GET    /comm/conversations
POST   /comm/conversations
GET    /comm/conversations/:id
```

---

*문서 끝*
