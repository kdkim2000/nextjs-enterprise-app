# MSA 전환 실행 계획서

> 작성일: 2024-12-08
> 버전: 1.1
> 상태: Draft

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [목표 아키텍처](#2-목표-아키텍처)
3. [환경별 구성 전략](#3-환경별-구성-전략)
4. [기술 스택 결정](#4-기술-스택-결정)
5. [서비스 분리 상세](#5-서비스-분리-상세)
6. [Frontend 운영 전략](#6-frontend-운영-전략)
7. [마이그레이션 전략](#7-마이그레이션-전략)
8. [인프라 구성](#8-인프라-구성)
9. [실행 일정](#9-실행-일정)
10. [검토 및 의사결정 필요사항](#10-검토-및-의사결정-필요사항)
11. [리스크 관리](#11-리스크-관리)
12. [부록](#부록)

---

## 1. 프로젝트 개요

### 1.1 현재 상태

```
┌─────────────────────────────────────────────┐
│              현재 모놀리식 구조              │
├─────────────────────────────────────────────┤
│  Frontend (Next.js)     │  Port: 3000       │
│  Backend (Express.js)   │  Port: 3001       │
│  Database (PostgreSQL)  │  Port: 9090       │
├─────────────────────────────────────────────┤
│  Backend 구성:                               │
│  - 26개 API 라우트                           │
│  - 20개 비즈니스 서비스                       │
│  - 단일 데이터베이스 연결                     │
└─────────────────────────────────────────────┘
```

### 1.2 전환 목표

- 비즈니스 도메인별 독립 서비스 운영
- 개별 서비스의 독립적 배포/확장
- 장애 격리 및 시스템 안정성 향상
- 새로운 비즈니스 기능의 유연한 추가

### 1.3 제약 조건

| 항목 | 결정 |
|------|------|
| Load Balancer | Nginx (서버만) |
| API Gateway | Apache APISIX (서버만) |
| Container Orchestration | Docker Compose (서버만) |
| Database | 현상태 유지 (단일 PostgreSQL) |
| 로컬 개발 | Docker 미사용, 직접 실행 |

---

## 2. 목표 아키텍처

### 2.1 환경별 아키텍처 요약

```
┌─────────────────────────────────────────────────────────────────┐
│                         환경별 구성                              │
├────────────────────────────┬────────────────────────────────────┤
│      로컬 개발 환경         │          서버 운영 환경             │
│      (Windows)             │          (Linux)                   │
├────────────────────────────┼────────────────────────────────────┤
│                            │                                    │
│  Frontend ──┬──► Backend   │  Frontend ──► Nginx ──► APISIX    │
│             │   Services   │                          │         │
│             │              │                          ▼         │
│             └──► Legacy    │                    Backend Services │
│                 Backend    │                                    │
│                            │                                    │
│  • Docker 미사용           │  • Docker Compose 전체 구동        │
│  • 직접 Node.js 실행       │  • API Gateway 경유                │
│  • 빠른 Hot Reload         │  • 프로덕션 준비                   │
│                            │                                    │
└────────────────────────────┴────────────────────────────────────┘
```

### 2.2 서버 운영 환경 구조도

```
                         ┌─────────────────────────┐
                         │      Client (Browser)   │
                         └───────────┬─────────────┘
                                     │
                         ┌───────────▼─────────────┐
                         │    Nginx Load Balancer  │
                         │    (SSL Termination)    │
                         │    Port: 80/443         │
                         └───────────┬─────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
   ┌──────────▼──────────┐ ┌────────▼────────┐             │
   │   Frontend (Next.js) │ │  Apache APISIX  │             │
   │   Port: 3000         │ │  (API Gateway)  │             │
   │                      │ │  Port: 9080     │             │
   └──────────────────────┘ └────────┬────────┘             │
                                     │                      │
         ┌───────────┬───────────┬───┴───┬───────────┐      │
         │           │           │       │           │      │
   ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐ ┌▼─────┐ ┌──▼──┐  │
   │   Auth    │ │ Admin │ │  Content  │ │ Comm │ │Common│  │
   │  Service  │ │Service│ │  Service  │ │Service│ │Service│ │
   │  :3011    │ │ :3012 │ │   :3013   │ │:3014 │ │:3015 │  │
   └─────┬─────┘ └───┬───┘ └─────┬─────┘ └──┬───┘ └──┬──┘  │
         │           │           │          │        │      │
         └───────────┴───────────┴────┬─────┴────────┘      │
                                      │                     │
                         ┌────────────▼────────────┐        │
                         │   PostgreSQL Database   │        │
                         │   Port: 9090            │        │
                         └─────────────────────────┘        │
                                                            │
                         ┌──────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Redis (Optional)  │
              │   Port: 6379        │
              └─────────────────────┘
```

### 2.3 로컬 개발 환경 구조도

```
                         ┌─────────────────────────┐
                         │      Browser            │
                         └───────────┬─────────────┘
                                     │
                         ┌───────────▼─────────────┐
                         │   Frontend (Next.js)    │
                         │   localhost:3000        │
                         └───────────┬─────────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
                     ▼               ▼               ▼
              ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
              │   Legacy    │ │    Auth     │ │   Other     │
              │   Backend   │ │   Service   │ │  Services   │
              │   :3001     │ │   :3011     │ │ :3012-3015  │
              └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
                     │               │               │
                     └───────────────┼───────────────┘
                                     │
                         ┌───────────▼─────────────┐
                         │   PostgreSQL (Remote)   │
                         │   123.37.36.45:9090     │
                         └─────────────────────────┘

  ✅ Docker 불필요
  ✅ Node.js 직접 실행
  ✅ VS Code 디버깅 가능
  ✅ 빠른 Hot Reload
```

### 2.4 포트 할당 계획

| 서비스 | 포트 | 로컬 | 서버 |
|--------|------|------|------|
| Nginx | 80, 443 | ❌ | ✅ |
| APISIX | 9080 | ❌ | ✅ |
| APISIX Admin | 9180 | ❌ | ✅ |
| etcd | 2379 | ❌ | ✅ |
| Frontend | 3000 | ✅ | ✅ |
| Legacy Backend | 3001 | ✅ | ✅ (마이그레이션 중) |
| Auth Service | 3011 | ✅ | ✅ |
| Admin Service | 3012 | ✅ | ✅ |
| Content Service | 3013 | ✅ | ✅ |
| Communication Service | 3014 | ✅ | ✅ |
| Common Service | 3015 | ✅ | ✅ |
| PostgreSQL | 9090 | 원격 | 원격 |
| Redis | 6379 | ❌ (선택) | ✅ |

---

## 3. 환경별 구성 전략

### 3.1 로컬 개발 환경 (Windows)

#### 특징
- **Docker 미사용**: 모든 서비스를 Node.js로 직접 실행
- **직접 API 호출**: Frontend에서 Backend 서비스 직접 호출
- **빠른 개발 사이클**: Hot Reload, 쉬운 디버깅

#### 구성

```
Windows PC
├── Node.js 20 LTS
├── Git
├── VS Code
│
├── Frontend (npm run dev)           → localhost:3000
├── Legacy Backend (npm run dev)     → localhost:3001
│
└── Microservices (개발 중인 것만 실행)
    ├── Auth Service                 → localhost:3011
    ├── Admin Service                → localhost:3012
    ├── Content Service              → localhost:3013
    ├── Communication Service        → localhost:3014
    └── Common Service               → localhost:3015
```

#### API 호출 방식

```typescript
// 로컬 환경: 직접 호출
Frontend → http://localhost:3011/auth/login
Frontend → http://localhost:3012/admin/users
Frontend → http://localhost:3001/api/...  // Legacy
```

### 3.2 서버 운영 환경 (Linux)

#### 특징
- **Docker Compose**: 전체 서비스 컨테이너화
- **API Gateway**: APISIX를 통한 라우팅/인증
- **Nginx**: SSL 종단, 로드밸런싱

#### 구성

```
Linux Server (Docker Compose)
├── Nginx (80/443)
├── APISIX (9080)
├── etcd (2379)
├── Redis (6379)
│
├── Frontend Container (3000)
│
└── Backend Containers
    ├── Auth Service (3011)
    ├── Admin Service (3012)
    ├── Content Service (3013)
    ├── Communication Service (3014)
    └── Common Service (3015)
```

#### API 호출 방식

```typescript
// 서버 환경: API Gateway 경유
Frontend → /auth/login      → APISIX → Auth Service
Frontend → /admin/users     → APISIX → Admin Service
Frontend → /api/...         → APISIX → Legacy Backend
```

### 3.3 환경 전환 전략

```
┌─────────────────────────────────────────────────────────────────┐
│                    환경별 API 호출 흐름                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [로컬 개발]                                                    │
│  ─────────────────────────────────────────────                  │
│  NEXT_PUBLIC_ENV=development                                    │
│                                                                  │
│  authApi.post('/auth/login')                                    │
│       │                                                          │
│       └──► http://localhost:3011/auth/login                     │
│                                                                  │
│                                                                  │
│  [서버 운영]                                                    │
│  ─────────────────────────────────────────────                  │
│  NEXT_PUBLIC_ENV=production                                     │
│                                                                  │
│  authApi.post('/auth/login')                                    │
│       │                                                          │
│       └──► /auth/login (상대 경로)                              │
│                 │                                                │
│                 └──► Nginx ──► APISIX ──► Auth Service          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 기술 스택 결정

### 4.1 인프라 컴포넌트 (서버만)

#### Nginx (Load Balancer)

**역할:**
- SSL/TLS 종단점
- Static 파일 서빙
- 기본 로드밸런싱
- Health Check

#### Apache APISIX (API Gateway)

**역할:**
- API 라우팅
- JWT 검증
- Rate Limiting
- 로깅 및 모니터링

### 4.2 서비스 기술 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| Runtime | Node.js 20 LTS | 기존 유지 |
| Framework | Express.js 4.x | 기존 유지 |
| Language | TypeScript | 기존 유지 |
| Database Client | pg-promise | 기존 유지 |
| Container | Docker (서버만) | - |

### 4.3 공유 라이브러리

```
shared/
├── types/           # 공통 TypeScript 타입
├── utils/           # 공통 유틸리티 함수
├── constants/       # 공통 상수
├── middleware/      # 공통 미들웨어
│   ├── auth.ts      # JWT 검증
│   ├── logger.ts    # 로깅
│   └── errorHandler.ts
└── config/          # 공통 설정
    └── database.ts  # DB 연결 설정
```

---

## 5. 서비스 분리 상세

### 5.1 Auth Service (인증 서비스)

#### 책임 범위

```
┌─────────────────────────────────────────────┐
│              Auth Service                    │
├─────────────────────────────────────────────┤
│  API Endpoints:                              │
│  ├── POST /auth/login                        │
│  ├── POST /auth/logout                       │
│  ├── POST /auth/refresh                      │
│  ├── POST /auth/verify-mfa                   │
│  ├── POST /auth/send-mfa                     │
│  ├── POST /auth/sso                          │
│  ├── GET  /auth/validate (internal)          │
│  └── GET  /auth/me                           │
├─────────────────────────────────────────────┤
│  Database Tables:                            │
│  ├── users (id, loginid, password, mfa_*)    │
│  ├── sessions                                │
│  ├── refresh_tokens                          │
│  └── login_history                           │
└─────────────────────────────────────────────┘
```

### 5.2 Admin Service (관리 서비스)

```
┌─────────────────────────────────────────────┐
│              Admin Service                   │
├─────────────────────────────────────────────┤
│  API Endpoints:                              │
│  ├── /admin/users/*                          │
│  ├── /admin/roles/*                          │
│  ├── /admin/departments/*                    │
│  ├── /admin/menus/*                          │
│  ├── /admin/programs/*                       │
│  ├── /admin/user-role-mappings/*             │
│  ├── /admin/role-menu-mappings/*             │
│  └── /admin/role-program-mappings/*          │
└─────────────────────────────────────────────┘
```

### 5.3 Content Service (콘텐츠 서비스)

```
┌─────────────────────────────────────────────┐
│             Content Service                  │
├─────────────────────────────────────────────┤
│  API Endpoints:                              │
│  ├── /content/board-types/*                  │
│  ├── /content/posts/*                        │
│  ├── /content/comments/*                     │
│  ├── /content/qna/*                          │
│  └── /content/help/*                         │
└─────────────────────────────────────────────┘
```

### 5.4 Communication Service (커뮤니케이션 서비스)

```
┌─────────────────────────────────────────────┐
│          Communication Service               │
├─────────────────────────────────────────────┤
│  API Endpoints:                              │
│  ├── /comm/mail/*                            │
│  ├── /comm/messages/*                        │
│  └── /comm/notifications/* (향후)            │
└─────────────────────────────────────────────┘
```

### 5.5 Common Service (공통 서비스)

```
┌─────────────────────────────────────────────┐
│              Common Service                  │
├─────────────────────────────────────────────┤
│  API Endpoints:                              │
│  ├── /common/codes/*                         │
│  ├── /common/code-types/*                    │
│  ├── /common/attachments/*                   │
│  ├── /common/attachment-types/*              │
│  ├── /common/logs/*                          │
│  ├── /common/settings/*                      │
│  └── /common/dashboard/*                     │
└─────────────────────────────────────────────┘
```

---

## 6. Frontend 운영 전략

### 6.1 단일 Frontend 유지 (권장)

- 공통 컴포넌트/테마 재사용
- 일관된 UX
- 배포 단순화

### 6.2 환경별 API 호출 설정

```typescript
// src/lib/api/config.ts

const ENV = process.env.NEXT_PUBLIC_ENV || 'development';

export const API_CONFIG = {
  development: {
    // 로컬: 직접 호출
    auth: 'http://localhost:3011',
    admin: 'http://localhost:3012',
    content: 'http://localhost:3013',
    comm: 'http://localhost:3014',
    common: 'http://localhost:3015',
    legacy: 'http://localhost:3001/api',
  },
  production: {
    // 서버: 상대 경로 (API Gateway 경유)
    auth: '/auth',
    admin: '/admin',
    content: '/content',
    comm: '/comm',
    common: '/common',
    legacy: '/api',
  }
};

export const getApiConfig = () => API_CONFIG[ENV] || API_CONFIG.development;
```

### 6.3 API 경로 변경 매핑

| 현재 경로 | 로컬 개발 | 서버 운영 |
|----------|----------|----------|
| `/api/auth/*` | `localhost:3011/auth/*` | `/auth/*` |
| `/api/user/*` | `localhost:3012/admin/users/*` | `/admin/users/*` |
| `/api/role/*` | `localhost:3012/admin/roles/*` | `/admin/roles/*` |
| `/api/post/*` | `localhost:3013/content/posts/*` | `/content/posts/*` |
| `/api/mail/*` | `localhost:3014/comm/mail/*` | `/comm/mail/*` |
| `/api/code/*` | `localhost:3015/common/codes/*` | `/common/codes/*` |

---

## 7. 마이그레이션 전략

### 7.1 Strangler Fig Pattern

기존 모놀리식을 유지하면서 점진적으로 서비스를 분리

```
┌─────────────────────────────────────────────────────────────────┐
│                    Strangler Fig Pattern                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 1          Phase 2          Phase 3          Phase 4     │
│  ┌──────┐        ┌──────┐         ┌──────┐         ┌──────┐    │
│  │Mono  │        │Mono  │         │ Auth │         │ Auth │    │
│  │lithic│   →    ├──────┤    →    ├──────┤    →    ├──────┤    │
│  │      │        │ Auth │         │Admin │         │Admin │    │
│  │      │        │Service│        │Service│        ├──────┤    │
│  │      │        │      │         ├──────┤         │Content│   │
│  │      │        │      │         │Mono  │         ├──────┤    │
│  │      │        │      │         │(rest)│         │ Comm │    │
│  │      │        │      │         │      │         ├──────┤    │
│  └──────┘        └──────┘         └──────┘         │Common│    │
│                                                    └──────┘    │
│                                                                  │
│  인프라 구축      Auth 분리        Admin 분리      전체 분리     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 단계별 상세 계획

#### Phase 0: 사전 준비 (1주)

**목표:** 프로젝트 구조 및 개발 환경 설정

**작업 내용:**

1. 디렉토리 구조 생성
2. 공유 라이브러리 설정
3. 환경별 설정 파일 생성
4. 개발 스크립트 설정

**산출물:**
- [ ] 디렉토리 구조
- [ ] shared 패키지
- [ ] 환경 변수 파일
- [ ] package.json 스크립트

#### Phase 1: 인프라 구축 (2주)

**목표:** 서버 환경 인프라 구성

**작업 내용:**

1. Docker Compose 설정 (서버용)
2. Nginx 설정
3. APISIX 설정
4. 기존 Backend 라우팅 연동

**산출물:**
- [ ] docker-compose.yml
- [ ] nginx.conf
- [ ] APISIX 설정
- [ ] 서버 배포 테스트

#### Phase 2: Auth Service 분리 (2주)

**작업 내용:**

1. Auth Service 프로젝트 생성
2. 인증 로직 이관
3. Frontend API 설정 업데이트
4. 테스트

#### Phase 3: Admin Service 분리 (3주)

**작업 내용:**

1. Admin Service 프로젝트 생성
2. 사용자/역할/메뉴 관리 이관
3. 테스트

#### Phase 4: 나머지 서비스 분리 (4주)

- Content Service (1.5주)
- Communication Service (1주)
- Common Service (1.5주)

#### Phase 5: 안정화 및 최적화 (2주)

- 모니터링 구축
- 문서화
- 성능 테스트

---

## 8. 인프라 구성

### 8.1 서버용 Docker Compose

```yaml
# infrastructure/docker/docker-compose.yml

version: '3.8'

services:
  # ===== Infrastructure =====
  nginx:
    image: nginx:alpine
    container_name: nginx-lb
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ../nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ../nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - apisix
      - frontend
    restart: unless-stopped
    networks:
      - app-network

  etcd:
    image: bitnami/etcd:3.5
    container_name: etcd
    environment:
      - ALLOW_NONE_AUTHENTICATION=yes
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd:2379
    volumes:
      - etcd_data:/bitnami/etcd
    restart: unless-stopped
    networks:
      - app-network

  apisix:
    image: apache/apisix:3.8.0-debian
    container_name: apisix
    ports:
      - "9080:9080"
      - "9180:9180"
    volumes:
      - ../apisix/config.yaml:/usr/local/apisix/conf/config.yaml:ro
      - ../apisix/apisix.yaml:/usr/local/apisix/conf/apisix.yaml:ro
    depends_on:
      - etcd
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    networks:
      - app-network

  # ===== Frontend =====
  frontend:
    build:
      context: ../../
      dockerfile: Dockerfile.frontend
    container_name: frontend
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_ENV=production
    restart: unless-stopped
    networks:
      - app-network

  # ===== Backend Services =====
  auth-service:
    build:
      context: ../../services/auth-service
      dockerfile: Dockerfile
    container_name: auth-service
    environment:
      - NODE_ENV=production
      - PORT=3011
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    restart: unless-stopped
    networks:
      - app-network

  admin-service:
    build:
      context: ../../services/admin-service
      dockerfile: Dockerfile
    container_name: admin-service
    environment:
      - NODE_ENV=production
      - PORT=3012
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped
    networks:
      - app-network

  content-service:
    build:
      context: ../../services/content-service
      dockerfile: Dockerfile
    container_name: content-service
    environment:
      - NODE_ENV=production
      - PORT=3013
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped
    networks:
      - app-network

  communication-service:
    build:
      context: ../../services/communication-service
      dockerfile: Dockerfile
    container_name: communication-service
    environment:
      - NODE_ENV=production
      - PORT=3014
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped
    networks:
      - app-network

  common-service:
    build:
      context: ../../services/common-service
      dockerfile: Dockerfile
    container_name: common-service
    environment:
      - NODE_ENV=production
      - PORT=3015
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    volumes:
      - uploads_data:/app/uploads
    restart: unless-stopped
    networks:
      - app-network

volumes:
  etcd_data:
  redis_data:
  uploads_data:

networks:
  app-network:
    driver: bridge
```

### 8.2 Nginx 설정 (서버용)

```nginx
# infrastructure/nginx/nginx.conf

upstream frontend {
    server frontend:3000;
}

upstream apisix {
    server apisix:9080;
}

server {
    listen 80;
    server_name localhost;

    # Frontend (React/Next.js)
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /auth/ {
        proxy_pass http://apisix/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /admin/ {
        proxy_pass http://apisix/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /content/ {
        proxy_pass http://apisix/content/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /comm/ {
        proxy_pass http://apisix/comm/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /common/ {
        proxy_pass http://apisix/common/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Legacy API (마이그레이션 중)
    location /api/ {
        proxy_pass http://apisix/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 8.3 APISIX 설정 (서버용)

```yaml
# infrastructure/apisix/config.yaml

apisix:
  node_listen: 9080
  enable_ipv6: false
  enable_admin: true
  admin_key:
    - name: admin
      key: ${APISIX_ADMIN_KEY}
      role: admin

deployment:
  admin:
    admin_listen:
      ip: 0.0.0.0
      port: 9180
  etcd:
    host:
      - "http://etcd:2379"
    prefix: "/apisix"
    timeout: 30
```

```yaml
# infrastructure/apisix/apisix.yaml

routes:
  - uri: /auth/*
    name: auth-service
    upstream:
      type: roundrobin
      nodes:
        "auth-service:3011": 1

  - uri: /admin/*
    name: admin-service
    upstream:
      type: roundrobin
      nodes:
        "admin-service:3012": 1
    plugins:
      jwt-auth:
        key: user-key

  - uri: /content/*
    name: content-service
    upstream:
      type: roundrobin
      nodes:
        "content-service:3013": 1
    plugins:
      jwt-auth:
        key: user-key

  - uri: /comm/*
    name: communication-service
    upstream:
      type: roundrobin
      nodes:
        "communication-service:3014": 1
    plugins:
      jwt-auth:
        key: user-key

  - uri: /common/*
    name: common-service
    upstream:
      type: roundrobin
      nodes:
        "common-service:3015": 1
    plugins:
      jwt-auth:
        key: user-key

  # Legacy Backend (마이그레이션 중)
  - uri: /api/*
    name: legacy-backend
    priority: -1
    upstream:
      type: roundrobin
      nodes:
        "legacy-backend:3001": 1

#END
```

---

## 9. 실행 일정

### 9.1 전체 타임라인

```
Phase 0 (1주)  : 사전 준비
Phase 1 (2주)  : 서버 인프라 구축
Phase 2 (2주)  : Auth Service 분리
Phase 3 (3주)  : Admin Service 분리
Phase 4 (4주)  : 나머지 서비스 분리
Phase 5 (2주)  : 안정화

총 14-16주 (3.5-4개월)
```

---

## 10. 검토 및 의사결정 필요사항

### 10.1 기술적 의사결정

| # | 항목 | 옵션 | 권장 | 결정 시점 |
|---|------|------|------|----------|
| 1 | 서비스 간 통신 | REST / gRPC | REST | Phase 2 전 |
| 2 | JWT 검증 위치 | APISIX / 각 서비스 | APISIX (서버) | Phase 1 |
| 3 | 세션 저장소 | Redis / DB | Redis | Phase 2 |
| 4 | 로그 수집 | ELK / Loki | Loki | Phase 5 |
| 5 | CI/CD | GitHub Actions / Jenkins | - | Phase 1 |

### 10.2 추가 검토 필요

1. **DB 분리 로드맵** - 향후 검토
2. **보안** - Secret 관리 (Vault)
3. **모니터링** - 메트릭 수집, 알람

---

## 11. 리스크 관리

### 11.1 주요 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 서비스 분리 중 장애 | 높음 | Strangler Pattern, 점진적 이관 |
| 환경 불일치 | 중간 | 환경별 설정 분리, 테스트 강화 |
| 네트워크 레이턴시 | 중간 | 캐싱, 서비스 간 통신 최적화 |

### 11.2 롤백 전략

- **로컬**: 즉시 Legacy Backend로 전환 가능
- **서버**: APISIX 라우팅 변경으로 롤백

---

## 부록

### A. 로컬 개발 빠른 시작

```powershell
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.development

# 3. 개발 서버 시작
npm run dev
```

### B. 서버 배포

```bash
# 1. 서버 접속
ssh user@server

# 2. 코드 업데이트
cd /app && git pull

# 3. Docker Compose 실행
cd infrastructure/docker
docker-compose up -d --build
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2024-12-08 | 초안 작성 |
| 1.1 | 2024-12-08 | 로컬/서버 환경 분리 구성으로 변경 |
