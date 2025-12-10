# Windows 로컬 개발 환경 구성 가이드

> 작성일: 2024-12-08
> 버전: 1.1
> 대상: Windows 10/11 개발자

---

## 목차

1. [개요](#1-개요)
2. [사전 요구사항](#2-사전-요구사항)
3. [개발 환경 구성](#3-개발-환경-구성)
4. [개발 워크플로우](#4-개발-워크플로우)
5. [VS Code 설정](#5-vs-code-설정)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. 개요

### 1.1 환경별 구성 전략

```
┌─────────────────────────────────────────────────────────────────┐
│                         환경별 구성                              │
├────────────────────────────┬────────────────────────────────────┤
│      로컬 개발 환경         │          서버 운영 환경             │
│      (Windows)             │          (Linux)                   │
├────────────────────────────┼────────────────────────────────────┤
│                            │                                    │
│  Frontend ──► Backend      │  Frontend ──► Nginx ──► APISIX    │
│              Services      │                          │         │
│              (직접 호출)    │                          ▼         │
│                            │                    Backend Services │
│                            │                                    │
│  ✅ Docker 미사용          │  ✅ Docker Compose 전체 구동       │
│  ✅ Node.js 직접 실행      │  ✅ API Gateway 경유               │
│  ✅ 빠른 Hot Reload        │  ✅ 프로덕션 준비                  │
│  ✅ 쉬운 디버깅            │                                    │
│                            │                                    │
└────────────────────────────┴────────────────────────────────────┘
```

### 1.2 로컬 개발의 장점

- **Docker 불필요**: Windows에서 Docker 설정 복잡도 제거
- **빠른 Hot Reload**: 파일 시스템 직접 접근으로 즉각 반영
- **쉬운 디버깅**: VS Code에서 직접 브레이크포인트 설정
- **리소스 효율**: Docker 오버헤드 없음

---

## 2. 사전 요구사항

### 2.1 필수 소프트웨어

| 소프트웨어 | 버전 | 설치 링크 |
|-----------|------|----------|
| **Node.js** | 20 LTS | https://nodejs.org/ |
| **Git** | Latest | https://git-scm.com/ |
| **VS Code** | Latest | https://code.visualstudio.com/ |

### 2.2 권장 VS Code 확장

```
- ESLint
- Prettier
- GitLens
- Thunder Client (API 테스트)
- PostgreSQL (by Chris Kolkman)
```

### 2.3 시스템 요구사항

- **RAM**: 최소 8GB (권장 16GB)
- **Storage**: SSD 20GB 이상 여유공간
- **OS**: Windows 10/11

---

## 3. 개발 환경 구성

### 3.1 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    로컬 개발 환경 (Windows)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Browser                                                        │
│      │                                                           │
│      ▼                                                           │
│   Frontend (localhost:3000)                                      │
│      │                                                           │
│      │ 직접 호출 (환경변수로 URL 설정)                           │
│      │                                                           │
│      ├──► Legacy Backend (localhost:3001)                       │
│      │        └── 마이그레이션 전 API                            │
│      │                                                           │
│      ├──► Auth Service (localhost:3011)                         │
│      ├──► Admin Service (localhost:3012)                        │
│      ├──► Content Service (localhost:3013)                      │
│      ├──► Comm Service (localhost:3014)                         │
│      └──► Common Service (localhost:3015)                       │
│                     │                                            │
│                     ▼                                            │
│              PostgreSQL (원격: 123.37.36.45:9090)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 포트 할당

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Frontend | 3000 | Next.js |
| Legacy Backend | 3001 | 기존 Express.js (마이그레이션 중) |
| Auth Service | 3011 | 인증 서비스 |
| Admin Service | 3012 | 관리 서비스 |
| Content Service | 3013 | 콘텐츠 서비스 |
| Communication Service | 3014 | 커뮤니케이션 서비스 |
| Common Service | 3015 | 공통 서비스 |
| PostgreSQL | 9090 | 원격 DB |

### 3.3 프로젝트 설치

```powershell
# 1. 저장소 클론
git clone <repository-url>
cd nextjs-enterprise-app

# 2. 의존성 설치
npm install

# 3. Backend 의존성 설치
cd backend && npm install && cd ..

# 4. (향후) 마이크로서비스 의존성 설치
# cd services/auth-service && npm install && cd ../..
```

### 3.4 환경 변수 설정

```env
# .env.development (루트)

# 환경
NODE_ENV=development
NEXT_PUBLIC_ENV=development

# Database (원격)
DB_HOST=123.37.36.45
DB_PORT=9090
DB_NAME=corenextdb
DB_USER=corenext
DB_PASSWORD=CoreNext2025#

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key

# Frontend API URLs (로컬 직접 호출)
NEXT_PUBLIC_LEGACY_API_URL=http://localhost:3001/api
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3011
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3012
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:3013
NEXT_PUBLIC_COMM_API_URL=http://localhost:3014
NEXT_PUBLIC_COMMON_API_URL=http://localhost:3015
```

---

## 4. 개발 워크플로우

### 4.1 기본 개발 (마이그레이션 전)

현재 모놀리식 구조에서 개발:

```powershell
# 터미널 1: Frontend + Backend 동시 실행
npm run dev

# 또는 별도 실행
# 터미널 1: Frontend
cd src && npm run dev

# 터미널 2: Backend
cd backend && npm run dev
```

**접속 URL:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

### 4.2 마이크로서비스 개발 (마이그레이션 후)

특정 서비스 개발 시:

```powershell
# 터미널 1: Frontend
npm run dev:frontend

# 터미널 2: Legacy Backend (아직 이관되지 않은 API)
npm run dev:backend

# 터미널 3: 개발 중인 마이크로서비스
npm run dev:auth      # Auth Service 개발 시
npm run dev:admin     # Admin Service 개발 시
npm run dev:content   # Content Service 개발 시
npm run dev:comm      # Communication Service 개발 시
npm run dev:common    # Common Service 개발 시
```

### 4.3 VS Code 터미널 구성 예시

```
┌─────────────────────────────────────────────────────────────────┐
│  VS Code                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Terminal 1: Frontend                                            │
│  └─ npm run dev:frontend        → localhost:3000                │
│                                                                  │
│  Terminal 2: Legacy Backend                                      │
│  └─ npm run dev:backend         → localhost:3001                │
│                                                                  │
│  Terminal 3: Auth Service (개발 중일 때만)                       │
│  └─ npm run dev:auth            → localhost:3011                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 API 테스트

#### Thunder Client (VS Code Extension)

```http
# Legacy Backend 테스트
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "loginid": "admin",
  "password": "password"
}

# Auth Service 테스트 (마이그레이션 후)
POST http://localhost:3011/auth/login
Content-Type: application/json

{
  "loginid": "admin",
  "password": "password"
}
```

#### curl (PowerShell)

```powershell
# Legacy Backend 테스트
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"loginid":"admin","password":"password"}'

# Health Check
curl http://localhost:3001/api/health
```

---

## 5. VS Code 설정

### 5.1 Launch 설정

```json
// .vscode/launch.json

{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Auth Service",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/services/auth-service",
      "console": "integratedTerminal",
      "env": {
        "PORT": "3011"
      }
    }
  ],
  "compounds": [
    {
      "name": "Full Stack Debug",
      "configurations": ["Debug Frontend", "Debug Backend"]
    }
  ]
}
```

### 5.2 Tasks 설정

```json
// .vscode/tasks.json

{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Dev: All",
      "type": "shell",
      "command": "npm run dev",
      "problemMatcher": [],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Dev: Frontend",
      "type": "shell",
      "command": "npm run dev:frontend",
      "problemMatcher": []
    },
    {
      "label": "Dev: Backend",
      "type": "shell",
      "command": "npm run dev:backend",
      "problemMatcher": []
    }
  ]
}
```

---

## 6. 트러블슈팅

### 6.1 포트 충돌

```powershell
# 사용 중인 포트 확인
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 특정 PID 프로세스 종료
taskkill /PID <PID> /F

# 모든 Node 프로세스 종료
taskkill /IM node.exe /F
```

### 6.2 환경 변수 로드 안됨

```powershell
# dotenv 설치 확인
npm list dotenv

# 환경 변수 파일 위치 확인
ls .env*
```

### 6.3 DB 연결 실패

```powershell
# PostgreSQL 연결 테스트
psql -h 123.37.36.45 -p 9090 -U corenext -d corenextdb

# 방화벽 확인 (PowerShell 관리자)
Test-NetConnection -ComputerName 123.37.36.45 -Port 9090
```

### 6.4 CORS 오류

Backend에서 CORS 설정 확인:

```javascript
// backend/server.js
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

### 6.5 자주 발생하는 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| `ECONNREFUSED 127.0.0.1:3001` | Backend 미실행 | `npm run dev:backend` 실행 |
| `EADDRINUSE :::3000` | 포트 사용 중 | 기존 프로세스 종료 |
| `ECONNREFUSED DB` | DB 연결 실패 | 환경변수, 네트워크 확인 |
| `JWT malformed` | 토큰 형식 오류 | 환경변수 JWT_SECRET 확인 |

---

## 부록: 빠른 시작 체크리스트

```
□ 사전 준비
  ├── □ Node.js 20 LTS 설치
  ├── □ Git 설치
  └── □ VS Code 설치

□ 프로젝트 설정
  ├── □ 저장소 클론
  ├── □ npm install (루트)
  ├── □ npm install (backend)
  └── □ .env.development 파일 생성

□ 개발 시작
  ├── □ npm run dev 실행
  ├── □ localhost:3000 접속 확인
  └── □ 로그인 테스트

□ 문제 발생 시
  ├── □ 포트 충돌 확인 (netstat)
  ├── □ 환경 변수 확인
  └── □ Node 프로세스 재시작
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2024-12-08 | 초안 작성 |
| 1.1 | 2024-12-08 | Docker 미사용 방식으로 간소화 |
