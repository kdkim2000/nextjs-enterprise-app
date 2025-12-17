# Enterprise Next.js Application

Next.js 16 기반의 대규모 엔터프라이즈 웹 애플리케이션입니다. Material-UI(MUI) v6를 UI 프레임워크로 채택하고, Express.js 기반 백엔드와 마이크로서비스 아키텍처를 지원하며, PostgreSQL/Oracle 데이터베이스와 Docker 기반 인프라를 갖추고 있습니다.

---

## 목차

- [주요 특징](#주요-특징)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [실행 방법](#실행-방법)
- [데모 계정](#데모-계정)
- [주요 기능](#주요-기능)
- [아키텍처](#아키텍처)
- [문서](#문서)
- [라이선스](#라이선스)

---

## 주요 특징

### 엔터프라이즈급 기능
- **인증 시스템**: JWT 기반 인증, MFA(이메일), SSO 지원, 자동 로그아웃
- **권한 관리**: 역할 기반 접근 제어(RBAC), 메뉴/프로그램별 권한 매핑
- **다국어 지원**: 한국어, 영어, 중국어, 베트남어 (4개 언어)
- **관리자 패널**: 사용자, 역할, 메뉴, 코드, 부서, 프로그램 등 20+ 관리 페이지
- **게시판 시스템**: 동적 게시판 타입, 댓글, 첨부파일, 권한 관리
- **메일/메시징**: 내부 메일 시스템, 알림 기능

### 고급 UI 컴포넌트
- **Excel 친화적 Data Grid**: MUI X Data Grid Premium (정렬, 필터, 페이지네이션, 인라인 편집)
- **Rich Text Editor**: TipTap 기반 (이미지, 테이블, 서식 등)
- **파일 업로드**: Drag & Drop, 진행률 표시, 멀티 파일
- **Excel/PDF 내보내기**: xlsx, exceljs, jsPDF 활용
- **차트/대시보드**: Recharts 기반 데이터 시각화

### 확장 가능한 아키텍처
- **모놀리식 & MSA 지원**: Express 백엔드 또는 7개 마이크로서비스
- **데이터베이스**: PostgreSQL 16 (기본), Oracle 지원
- **인프라**: Docker Compose, Nginx, Prometheus/Grafana 모니터링
- **마이그레이션**: Liquibase 기반 스키마 버전 관리

---

## 기술 스택

### Frontend
| 기술 | 버전 | 설명 |
|-----|------|------|
| Next.js | 16.0.10 | React 프레임워크 (App Router) |
| React | 19.2.0 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| MUI (Material-UI) | v6 | UI 컴포넌트 라이브러리 |
| MUI X Data Grid | Premium | Excel 스타일 데이터 그리드 |
| TipTap | 2.x | Rich Text Editor |
| React Hook Form | - | 폼 관리 |
| Zod | - | 스키마 검증 |
| Axios | - | HTTP 클라이언트 |
| Recharts | - | 차트 라이브러리 |
| next-international | - | i18n (다국어) |

### Backend
| 기술 | 설명 |
|-----|------|
| Node.js | 런타임 환경 |
| Express.js | 웹 프레임워크 |
| PostgreSQL 16 | 기본 데이터베이스 |
| Oracle | 지원 데이터베이스 |
| pg-promise | PostgreSQL 클라이언트 |
| jsonwebtoken | JWT 인증 |
| bcrypt | 비밀번호 해싱 |
| multer | 파일 업로드 |
| nodemailer | 이메일 발송 |
| winston | 로깅 |
| Liquibase | DB 마이그레이션 |

### Infrastructure
| 기술 | 설명 |
|-----|------|
| Docker | 컨테이너화 |
| Docker Compose | 멀티 컨테이너 오케스트레이션 |
| Nginx | 리버스 프록시, SSL |
| Prometheus | 메트릭 수집 |
| Grafana | 모니터링 대시보드 |
| Loki | 로그 수집 |
| Vercel | 클라우드 배포 |

---

## 프로젝트 구조

```
nextjs-enterprise-app/
├── src/                          # 프론트엔드 소스 (461 파일)
│   ├── app/                      # Next.js App Router
│   │   └── [locale]/             # 다국어 라우팅 (en, ko, zh, vi)
│   │       ├── login/            # 로그인 페이지
│   │       ├── dashboard/        # 대시보드
│   │       ├── admin/            # 관리자 페이지 (20+)
│   │       ├── boards/           # 게시판 시스템
│   │       ├── mail/             # 메일 시스템
│   │       └── reports/          # 리포트
│   ├── components/               # 재사용 컴포넌트 (136개)
│   │   ├── admin/                # 관리자 폼 컴포넌트
│   │   ├── auth/                 # 인증 컴포넌트
│   │   ├── boards/               # 게시판 컴포넌트
│   │   ├── common/               # 공통 컴포넌트 (73개)
│   │   ├── layout/               # 레이아웃 컴포넌트
│   │   └── mobile/               # 모바일 컴포넌트
│   ├── contexts/                 # React Context (Auth, Menu, Permission)
│   ├── hooks/                    # 커스텀 Hooks (15+)
│   ├── lib/                      # 유틸리티 라이브러리
│   │   ├── api/                  # API 클라이언트
│   │   ├── i18n/                 # 다국어 설정
│   │   ├── excel/                # Excel 유틸리티
│   │   └── pdf/                  # PDF 유틸리티
│   ├── types/                    # TypeScript 타입 정의
│   └── theme/                    # MUI 테마 설정
│
├── backend/                      # Express.js 백엔드 (112 파일)
│   ├── routes/                   # API 라우트 (29개)
│   ├── services/                 # 비즈니스 로직 (18개)
│   ├── middleware/               # 미들웨어 (보안, 로깅 등)
│   ├── repositories/             # 데이터 액세스 레이어
│   ├── data/                     # JSON 데이터 (목업)
│   └── docs/                     # 백엔드 문서
│
├── services/                     # 마이크로서비스 (7개)
│   ├── core-service/             # 핵심 비즈니스 로직
│   ├── app-service/              # 애플리케이션 기능
│   ├── auth-service/             # 인증 서비스
│   ├── admin-service/            # 관리자 서비스
│   ├── content-service/          # 콘텐츠 관리
│   ├── communication-service/    # 메시징/이메일
│   └── common-service/           # 공통 유틸리티
│
├── shared/                       # MSA 공유 라이브러리
│   ├── config/                   # 설정
│   ├── auth/                     # 인증 공통
│   ├── middleware/               # 공통 미들웨어
│   ├── types/                    # 공유 타입
│   └── database/                 # DB 연결
│
├── database/                     # 데이터베이스
│   ├── changelog/                # Liquibase 마이그레이션
│   ├── seed/                     # 시드 데이터
│   └── scripts/                  # DB 스크립트
│
├── infrastructure/               # 인프라 설정
│   ├── docker/                   # Docker Compose
│   ├── nginx/                    # Nginx 설정
│   └── monitoring/               # Prometheus, Grafana, Loki
│
├── docs/                         # 문서 (40+ 파일)
├── test/                         # 테스트
├── scripts/                      # 유틸리티 스크립트
│
├── next.config.ts                # Next.js 설정
├── middleware.ts                 # Next.js 미들웨어 (i18n)
├── package.json                  # 의존성
├── tsconfig.json                 # TypeScript 설정
├── docker-compose.yml            # Docker 설정
└── vercel.json                   # Vercel 배포 설정
```

---

## 시작하기

### 사전 요구사항

- **Node.js** 18.x 이상
- **npm** 또는 **yarn**
- **Docker** (Docker 배포 시)
- **PostgreSQL** 16 (DB 연동 시)

### 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-org/nextjs-enterprise-app.git
cd nextjs-enterprise-app

# 의존성 설치
npm install

# 환경 변수 설정
cp env.api-routes.template .env.local  # Next.js API Routes 모드
# 또는
cp env.express.template .env.local     # Express 백엔드 모드
# 또는
cp env.docker.template .env            # Docker 모드
```

---

## 실행 방법

### 방법 1: 로컬 개발 (Next.js + Express)

```bash
# 프론트엔드 + 백엔드 동시 실행
npm run dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001/api
```

### 방법 2: 프론트엔드만 실행

```bash
npm run dev:frontend

# http://localhost:3000
```

### 방법 3: 백엔드만 실행

```bash
npm run dev:backend

# http://localhost:3001/api
```

### 방법 4: 마이크로서비스 모드 (MSA)

```bash
# Frontend + Core Service + App Service
npm run dev:msa

# 또는 전체 서비스 실행
npm run dev:msa:legacy

# Frontend:     http://localhost:3000
# Core Service: http://localhost:4001
# App Service:  http://localhost:4002
```

### 방법 5: Docker Compose

```bash
# 환경 변수 설정
cp env.docker.template .env

# JWT Secret 생성
openssl rand -base64 32
# .env 파일에 JWT_SECRET, JWT_REFRESH_SECRET 설정

# 전체 스택 실행 (PostgreSQL + Nginx + Services)
cd infrastructure/docker
docker compose up -d

# 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f

# 종료
docker compose down
```

### 방법 6: 데이터베이스 초기화

```bash
# PostgreSQL 초기화
npm run db:init

# 샘플 데이터 포함 초기화
npm run db:init:sample

# Oracle 초기화
npm run db:init:oracle

# 상태 확인
npm run db:status

# 스키마 검증
npm run db:validate
```

### 방법 7: 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 실행
npm start

# 또는 마이크로서비스 빌드
npm run build:services
```

---

## 데모 계정

### Admin 계정 (MFA 활성화)
| 항목 | 값 |
|-----|-----|
| Username | `admin` |
| Password | `Password123!` |
| Role | admin |
| MFA | 활성화 (개발 모드에서 콘솔 출력) |

### User 계정
| 항목 | 값 |
|-----|-----|
| Username | `john.doe` |
| Password | `Password123!` |
| Role | user |

---

## 주요 기능

### 인증 시스템
- JWT 기반 인증 (Access Token + Refresh Token)
- MFA (Multi-Factor Authentication) 이메일 인증
- SSO 로그인 지원 (확장 가능)
- 자동 로그아웃 (30분 세션 타임아웃)
- 토큰 블랙리스트 관리

### 권한 관리
- 역할 기반 접근 제어 (RBAC)
- 역할-메뉴 매핑
- 역할-프로그램 매핑
- 게시판별 접근 권한

### 관리자 기능 (20+ 페이지)
| 기능 | 경로 | 설명 |
|-----|------|------|
| 사용자 관리 | `/admin/users` | CRUD, 역할 할당 |
| 역할 관리 | `/admin/roles` | 역할 생성, 권한 매핑 |
| 메뉴 관리 | `/admin/menus` | 다단계 메뉴 구성 |
| 코드 관리 | `/admin/codes` | 공통 코드 관리 |
| 부서 관리 | `/admin/departments` | 조직 구조 관리 |
| 프로그램 관리 | `/admin/programs` | 프로그램 등록 |
| 메시지 관리 | `/admin/messages` | 시스템 메시지 |
| 게시판 관리 | `/admin/boards` | 게시판 타입 설정 |
| 게시물 관리 | `/admin/posts` | 전체 게시물 관리 |
| 도움말 관리 | `/admin/help` | 도움말 콘텐츠 |
| 로그 조회 | `/admin/logs` | 시스템 로그 |
| 메일 관리 | `/admin/mail` | 메일 템플릿 |
| 앱 설정 | `/admin/app-settings` | 애플리케이션 설정 |

### 게시판 시스템
- 동적 게시판 타입 (공지사항, 자유게시판, Q&A 등)
- 계층형 댓글
- 파일 첨부 (멀티 파일)
- 조회수, 좋아요
- 권한별 접근 제어

### 메일/메시징
- 내부 메일 시스템
- 대화 스레드
- 첨부파일 지원
- 읽음 상태 추적

### 다국어 지원
| 언어 | 코드 | 경로 |
|-----|------|------|
| 한국어 | ko | `/ko/*` |
| 영어 | en | `/en/*` |
| 중국어 | zh | `/zh/*` |
| 베트남어 | vi | `/vi/*` |

### 공통 컴포넌트 (73개)
- **DataGrid**: Excel 스타일 그리드 (정렬, 필터, 페이지네이션, 인라인 편집)
- **RichTextEditor**: TipTap 기반 WYSIWYG 에디터
- **FileUpload**: Drag & Drop 파일 업로드
- **CrudDialog**: 재사용 가능한 CRUD 모달
- **CodeSelect**: 공통 코드 드롭다운
- **Charts**: Recharts 기반 차트 컴포넌트
- **Badge, Card, Dialog, LoadingSpinner** 등

---

## 아키텍처

### 프론트엔드 아키텍처
```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
├─────────────────────────────────────────────────────────────┤
│  Pages (App Router)                                         │
│  ├── [locale]/                                              │
│  │   ├── login/                                             │
│  │   ├── dashboard/                                         │
│  │   ├── admin/*                                            │
│  │   └── boards/*                                           │
├─────────────────────────────────────────────────────────────┤
│  Components                                                 │
│  ├── common/ (73 components)                                │
│  ├── layout/ (Sidebar, Header, Footer)                      │
│  └── admin/ (Form components)                               │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├── AuthContext (인증 상태)                                │
│  ├── MenuContext (메뉴 상태)                                │
│  └── PermissionContext (권한 상태)                          │
├─────────────────────────────────────────────────────────────┤
│  Hooks (15+)                                                │
│  ├── useAuth, useMenu, usePermissionControl                 │
│  ├── useAttachment, useBoardPermissions                     │
│  └── useAutoLogout, useMobile                               │
├─────────────────────────────────────────────────────────────┤
│  Libraries                                                  │
│  ├── api/ (Axios client)                                    │
│  ├── i18n/ (next-international)                             │
│  ├── excel/ (xlsx, exceljs)                                 │
│  └── pdf/ (jsPDF)                                           │
└─────────────────────────────────────────────────────────────┘
```

### 백엔드 아키텍처
```
┌─────────────────────────────────────────────────────────────┐
│                     Express.js Server                       │
├─────────────────────────────────────────────────────────────┤
│  Middleware                                                 │
│  ├── security (CORS, XSS, Rate Limiting)                    │
│  ├── logger (Winston)                                       │
│  ├── errorHandler                                           │
│  └── fileUpload (Multer)                                    │
├─────────────────────────────────────────────────────────────┤
│  Routes (29)                                                │
│  ├── auth, user, role, menu, program                        │
│  ├── code, department, post, comment                        │
│  ├── attachment, conversation, mail                         │
│  └── log, dashboard, help, appSettings                      │
├─────────────────────────────────────────────────────────────┤
│  Services (18)                                              │
│  ├── authService, userService, menuService                  │
│  ├── attachmentService, mailService                         │
│  └── mappingService, conversationService                    │
├─────────────────────────────────────────────────────────────┤
│  Repositories (Repository Pattern)                          │
│  └── UserRepository, BaseRepository                         │
├─────────────────────────────────────────────────────────────┤
│  Database                                                   │
│  ├── PostgreSQL 16 (pg-promise)                             │
│  ├── Oracle (oracledb)                                      │
│  └── JSON files (목업)                                      │
└─────────────────────────────────────────────────────────────┘
```

### 마이크로서비스 아키텍처
```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx Gateway                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Frontend     │   │ Core Service  │   │ App Service   │
│  (Next.js)    │   │   :4001       │   │   :4002       │
│    :3000      │   └───────────────┘   └───────────────┘
└───────────────┘
                    ┌───────────────┐   ┌───────────────┐
                    │ Auth Service  │   │ Admin Service │
                    │   :4003       │   │   :4004       │
                    └───────────────┘   └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    │    :5432      │
                    └───────────────┘
```

### 인프라 아키텍처 (Docker)
```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose Stack                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  Nginx  │───▶│  Frontend   │    │     Services        │ │
│  │  :80    │    │  Next.js    │    │  ┌───────────────┐  │ │
│  │  :443   │    │  :3000      │    │  │ Core  :4001   │  │ │
│  └─────────┘    └─────────────┘    │  │ App   :4002   │  │ │
│       │                             │  └───────────────┘  │ │
│       │         ┌─────────────┐    └─────────────────────┘ │
│       └────────▶│  Backend    │             │              │
│                 │  Express    │             │              │
│                 │  :3001      │             │              │
│                 └─────────────┘             │              │
│                        │                    │              │
│                        ▼                    ▼              │
│                 ┌─────────────────────────────────────┐    │
│                 │           PostgreSQL 16             │    │
│                 │              :5432                  │    │
│                 └─────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Monitoring                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │Prometheus│  │ Grafana  │  │   Loki   │          │   │
│  │  │  :9090   │  │  :3001   │  │  :3100   │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## NPM 스크립트

### 개발
```bash
npm run dev              # Frontend + Backend 동시 실행
npm run dev:frontend     # Frontend만 실행
npm run dev:backend      # Backend만 실행
npm run dev:msa          # Frontend + Core + App 서비스
npm run dev:msa:legacy   # 전체 마이크로서비스
```

### 빌드
```bash
npm run build            # Next.js 프로덕션 빌드
npm run build:services   # 마이크로서비스 빌드
npm start                # 프로덕션 서버 실행
```

### 코드 품질
```bash
npm run lint             # ESLint 검사
npm run type-check       # TypeScript 타입 검사
```

### 데이터베이스
```bash
npm run db:init          # PostgreSQL 초기화
npm run db:init:sample   # 샘플 데이터 포함 초기화
npm run db:init:oracle   # Oracle 초기화
npm run db:status        # 상태 확인
npm run db:validate      # 스키마 검증
```

---

## 프로젝트 통계

| 항목 | 수량 |
|-----|------|
| 프론트엔드 파일 | 461 TS/TSX |
| 백엔드 파일 | 112 JS |
| 재사용 컴포넌트 | 136개 |
| 커스텀 Hooks | 15+ |
| API 라우트 | 29개 |
| 백엔드 서비스 | 18개 |
| 관리자 페이지 | 20+ |
| 지원 언어 | 4개 |
| NPM 패키지 | 70+ |

---

## 문서

### 개발 가이드
- [`docs/LOCAL_DEVELOPMENT.md`](./docs/LOCAL_DEVELOPMENT.md) - 로컬 개발 환경 설정
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - 아키텍처 설계 문서
- [`docs/FEATURES.md`](./docs/FEATURES.md) - 기능 상세 가이드
- [`docs/COMPONENT_STRATEGY.md`](./docs/COMPONENT_STRATEGY.md) - 컴포넌트 전략

### 백엔드 문서
- [`docs/BACKEND_API_ROUTES.md`](./docs/BACKEND_API_ROUTES.md) - API 엔드포인트
- [`docs/BACKEND_SOLUTION.md`](./docs/BACKEND_SOLUTION.md) - 백엔드 솔루션
- [`backend/docs/`](./backend/docs/) - 백엔드 상세 문서

### 데이터베이스 문서
- [`docs/DATABASE_MIGRATION_GUIDE.md`](./docs/DATABASE_MIGRATION_GUIDE.md) - DB 마이그레이션
- [`docs/POSTGRESQL_MIGRATION_GUIDE.md`](./docs/POSTGRESQL_MIGRATION_GUIDE.md) - PostgreSQL 가이드
- [`docs/ORACLE_MIGRATION_GUIDE.md`](./docs/ORACLE_MIGRATION_GUIDE.md) - Oracle 가이드

### 배포 가이드
- [`docs/DOCKER_DEPLOYMENT.md`](./docs/DOCKER_DEPLOYMENT.md) - Docker 배포
- [`docs/VERCEL_DEPLOYMENT.md`](./docs/VERCEL_DEPLOYMENT.md) - Vercel 배포
- [`docs/DEPLOY_SUMMARY.md`](./docs/DEPLOY_SUMMARY.md) - 배포 요약

### 기타 문서
- [`docs/PERMISSION_SYSTEM.md`](./docs/PERMISSION_SYSTEM.md) - 권한 시스템
- [`docs/I18N_GUIDE.md`](./docs/I18N_GUIDE.md) - 다국어 가이드
- [`docs/CODE_MANAGEMENT.md`](./docs/CODE_MANAGEMENT.md) - 코드 관리

---

## 배포 옵션

### 1. Vercel (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```
- **Live Demo**: https://nextjs-enterprise-app-gamma.vercel.app
- 자동 HTTPS, CDN, 무중단 배포

### 2. Docker
```bash
cd infrastructure/docker
docker compose up -d
```
- 모든 클라우드 및 온프레미스 지원
- 완전한 데이터 제어

### 3. 전통적 Node.js
```bash
npm run build
npm start
```
- VPS, EC2, Azure VM 등

---

## 라이선스

MIT License

---

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 문의

- **GitHub Issues**: [https://github.com/your-org/nextjs-enterprise-app/issues](https://github.com/your-org/nextjs-enterprise-app/issues)
