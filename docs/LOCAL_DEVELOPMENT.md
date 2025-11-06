# Local Development Guide

## 🎯 두 가지 Backend 모드

로컬 개발 시 두 가지 방식으로 백엔드를 실행할 수 있습니다:

### 1. Next.js API Routes (권장) ⭐
- Vercel 프로덕션 환경과 동일
- 별도 Express 서버 불필요
- 간단하고 빠른 시작

### 2. Express Backend (레거시)
- 기존 Express 서버 사용
- 별도 포트(3001)에서 실행
- 기존 코드와 호환성 유지

---

## 🚀 빠른 시작

### Option 1: Next.js API Routes (기본, 권장)

```bash
# 1. 환경 설정 확인 (.env.local이 올바른지 확인)
cat .env.local
# NEXT_PUBLIC_API_URL=/api 확인

# 2. 개발 서버 시작
npm run dev

# 3. 브라우저에서 접속
# http://localhost:3000
```

**동작 방식:**
```
Frontend: http://localhost:3000
Backend:  http://localhost:3000/api/*
```

### Option 2: Express Backend (레거시)

```bash
# 1. 환경 설정 변경
# .env.express 내용을 .env.local로 복사하거나
cp .env.express .env.local

# 또는 수동으로 수정:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 2. Frontend + Backend 동시 시작
npm run dev:express

# 3. 브라우저에서 접속
# http://localhost:3000
```

**동작 방식:**
```
Frontend: http://localhost:3000
Backend:  http://localhost:3001/api/*
```

---

## 📋 사용 가능한 Scripts

| 명령어 | 설명 | Backend 모드 |
|--------|------|-------------|
| `npm run dev` | Next.js 개발 서버 (API Routes 사용) | Next.js API Routes |
| `npm run dev:express` | Frontend + Express Backend 동시 실행 | Express Backend |
| `npm run dev:frontend` | Frontend만 실행 | (Backend 없음) |
| `npm run dev:backend` | Express Backend만 실행 | Express Backend |
| `npm run dev:api-routes` | Next.js API Routes 모드 (`npm run dev`와 동일) | Next.js API Routes |
| `npm run build` | 프로덕션 빌드 | Next.js API Routes |
| `npm start` | 프로덕션 서버 시작 | Next.js API Routes |

---

## 🔧 환경 설정 파일

### `.env.local` (활성 설정)
현재 사용 중인 환경 변수 파일

### `.env.api-routes` (템플릿)
Next.js API Routes 모드 템플릿
```bash
NEXT_PUBLIC_API_URL=/api
```

### `.env.express` (템플릿)
Express Backend 모드 템플릿
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
BACKEND_PORT=3001
```

### `.env.production` (프로덕션)
Vercel 배포용 설정
```bash
NEXT_PUBLIC_API_URL=/api
```

---

## 🔄 모드 전환하기

### Next.js API Routes로 전환

```bash
# 1. .env.local 수정
cat .env.api-routes > .env.local

# 2. 개발 서버 재시작
npm run dev
```

### Express Backend로 전환

```bash
# 1. .env.local 수정
cat .env.express > .env.local

# 2. Frontend + Backend 실행
npm run dev:express
```

---

## 🧪 테스트하기

### API 엔드포인트 테스트

#### Next.js API Routes 모드
```bash
# 로그인 테스트
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<TEST_PASSWORD>"}'
```

#### Express Backend 모드
```bash
# 로그인 테스트
curl http://localhost:3001/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<TEST_PASSWORD>"}'

# Health Check
curl http://localhost:3001/health
```

---

## 📊 비교표

| 특징 | Next.js API Routes | Express Backend |
|------|-------------------|-----------------|
| **시작 명령** | `npm run dev` | `npm run dev:express` |
| **Backend URL** | `/api/*` | `http://localhost:3001/api/*` |
| **별도 서버** | ❌ 불필요 | ✅ 필요 (port 3001) |
| **CORS 설정** | ❌ 불필요 | ✅ 필요 |
| **Vercel 배포** | ✅ 자동 포함 | ❌ 별도 배포 필요 |
| **개발 속도** | ⚡ 빠름 | 🐢 약간 느림 |
| **Hot Reload** | ✅ 지원 | ⚠️ Backend는 수동 재시작 |
| **데이터 저장** | `backend/data/` | `backend/data/` |
| **프로덕션 권장** | ✅ 권장 | ❌ 비권장 |

---

## 🗂️ 데이터 파일 위치

### Development (로컬)
```
backend/data/
├── users.json          # 사용자 데이터
├── menus.json          # 메뉴 데이터
├── mfaCodes.json       # MFA 인증 코드
└── logs.json           # 로그 데이터
```

두 모드 모두 동일한 데이터 파일을 사용합니다.

### Production (Vercel)
```
/tmp/data/              # 임시 저장소
└── *.json              # 동적 생성
```

---

## 🐛 문제 해결

### 문제: API 호출이 실패함

**Next.js API Routes 모드:**
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_API_URL
# 출력: /api

# 개발 서버 재시작
npm run dev
```

**Express Backend 모드:**
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_API_URL
# 출력: http://localhost:3001/api

# Backend가 실행 중인지 확인
curl http://localhost:3001/health

# 실행 중이 아니면 시작
npm run dev:express
```

### 문제: Port 3001이 이미 사용 중

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

### 문제: 환경 변수가 반영되지 않음

```bash
# 개발 서버 완전히 중지 후 재시작
# Ctrl+C로 중지
npm run dev
```

---

## 💡 권장 사항

### 일반 개발
- **Next.js API Routes 모드** 사용 (`npm run dev`)
- Vercel 배포 환경과 동일하여 예상치 못한 문제 감소

### Express Backend 테스트 필요 시
- **Express Backend 모드** 사용 (`npm run dev:express`)
- Express 관련 미들웨어, 로깅 등 테스트

### 프로덕션 배포 전
- **Next.js API Routes 모드**로 빌드 및 테스트
  ```bash
  npm run build
  npm start
  ```

---

## 📚 관련 문서

- **[BACKEND_API_ROUTES.md](./BACKEND_API_ROUTES.md)** - API 엔드포인트 상세 문서
- **[BACKEND_SOLUTION.md](./BACKEND_SOLUTION.md)** - Backend 솔루션 설명
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel 배포 가이드
- **[../README.md](../README.md)** - 프로젝트 개요

---

## 🎯 빠른 참조

### 첫 실행 (Next.js API Routes)
```bash
npm install
npm run dev
# http://localhost:3000 접속
```

### 첫 실행 (Express Backend)
```bash
npm install
cp .env.express .env.local
npm run dev:express
# http://localhost:3000 접속
```

### 데모 계정
- **Admin**: username: `admin`, password: `<TEST_PASSWORD>` (MFA 활성화)
- **User**: username: `john.doe`, password: `<TEST_PASSWORD>`

---

**Happy Coding! 🚀**
