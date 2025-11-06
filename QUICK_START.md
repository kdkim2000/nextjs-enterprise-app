# 🚀 Quick Start Guide

로컬 개발을 위한 빠른 시작 가이드입니다.

## 📋 목차

1. [두 가지 개발 모드](#두-가지-개발-모드)
2. [빠른 시작 (권장)](#빠른-시작-권장)
3. [Express Backend 모드](#express-backend-모드)
4. [모드 전환](#모드-전환)
5. [문제 해결](#문제-해결)

---

## 두 가지 개발 모드

이 프로젝트는 **2가지 방식**으로 로컬 개발할 수 있습니다:

### 1️⃣ Next.js API Routes (권장) ⭐

```bash
npm run dev
```

**특징:**
- ✅ 단일 프로세스 (포트 3000만 사용)
- ✅ Vercel 프로덕션 환경과 동일
- ✅ 빠른 시작
- ✅ 간단한 설정

**접속 URL:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3000/api/*`

### 2️⃣ Express Backend (레거시)

```bash
npm run dev:express
```

**특징:**
- ✅ 기존 Express 서버 사용
- ✅ Express 미들웨어 테스트 가능
- ⚠️ 두 개의 프로세스 필요
- ⚠️ 포트 2개 사용 (3000, 3001)

**접속 URL:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api/*`

---

## 빠른 시작 (권장)

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 시작

```bash
npm run dev
```

### 3. 브라우저에서 접속

```
http://localhost:3000
```

### 4. 로그인

**Admin 계정:**
- Username: `admin`
- Password: `<TEST_PASSWORD>`

**일반 사용자:**
- Username: `john.doe`
- Password: `<TEST_PASSWORD>`

---

## Express Backend 모드

Express 서버를 사용하고 싶다면:

### 방법 1: 스크립트 사용 (권장)

**Windows:**
```bash
switch-mode.bat
# 2번 선택 (Express Backend)
```

**Linux/macOS:**
```bash
chmod +x switch-mode.sh
./switch-mode.sh
# 2번 선택 (Express Backend)
```

### 방법 2: 수동 설정

```bash
# 1. Express 모드로 환경 변수 설정
cp env.express.template .env.local

# 2. Express Backend와 Frontend 동시 실행
npm run dev:express
```

### 3. 확인

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api/*`
- Health Check: `http://localhost:3001/health`

---

## 모드 전환

### 자동 전환 (권장)

**Windows:**
```bash
switch-mode.bat
```

**Linux/macOS:**
```bash
./switch-mode.sh
```

### 수동 전환

#### Next.js API Routes로 전환

```bash
# 1. 환경 변수 변경
cp env.api-routes.template .env.local

# 2. 실행
npm run dev
```

#### Express Backend로 전환

```bash
# 1. 환경 변수 변경
cp env.express.template .env.local

# 2. 실행
npm run dev:express
```

---

## 문제 해결

### ❌ 포트 3000이 이미 사용 중

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
lsof -ti:3000 | xargs kill -9
```

### ❌ 포트 3001이 이미 사용 중 (Express 모드)

**Windows:**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
lsof -ti:3001 | xargs kill -9
```

### ❌ 404 Error - API 호출 실패

**원인:** 잘못된 API URL 설정

**해결:**

1. `.env.local` 파일 확인:

**Next.js API Routes 모드:**
```env
NEXT_PUBLIC_API_URL=/api
```

**Express Backend 모드:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

2. 서버 재시작:
```bash
# Ctrl+C로 중지 후 다시 실행
npm run dev          # API Routes 모드
# 또는
npm run dev:express  # Express 모드
```

### ❌ Express 서버가 시작되지 않음

**확인사항:**

1. `.env.local`에 `BACKEND_PORT` 설정 확인:
```env
BACKEND_PORT=3001
```

2. Express 의존성 설치 확인:
```bash
npm install express cors body-parser
```

3. Backend 서버만 별도로 실행 테스트:
```bash
npm run dev:backend
```

### ❌ 환경 변수가 반영되지 않음

**해결:**
```bash
# 1. 서버 완전히 중지 (Ctrl+C)
# 2. .next 캐시 삭제
rm -rf .next    # Linux/macOS
rmdir /s .next  # Windows

# 3. 서버 재시작
npm run dev
```

### ❌ CORS 오류 (Express 모드에서)

**해결:**

`backend/server.js` 확인:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 🎯 빠른 참조

### 명령어 요약

| 명령어 | 설명 | Backend |
|--------|------|---------|
| `npm run dev` | Next.js API Routes 모드 ⭐ | Next.js API Routes |
| `npm run dev:express` | Express Backend 모드 | Express (port 3001) |
| `npm run dev:frontend` | Frontend만 실행 | 없음 |
| `npm run dev:backend` | Express Backend만 실행 | Express (port 3001) |
| `npm run build` | 프로덕션 빌드 | Next.js API Routes |
| `npm start` | 프로덕션 서버 시작 | Next.js API Routes |

### 환경 변수 파일

| 파일 | 용도 |
|------|------|
| `.env.local` | **현재 활성 설정** (gitignore) |
| `env.api-routes.template` | Next.js API Routes 템플릿 |
| `env.express.template` | Express Backend 템플릿 |
| `env.docker.template` | Docker 배포 템플릿 |
| `.env.production` | Vercel 프로덕션 설정 |

### 데이터 파일 위치

**Development (로컬):**
```
backend/data/
├── users.json           # 사용자 데이터
├── menus.json           # 메뉴 데이터
├── userPreferences.json # 사용자 설정
├── mfaCodes.json        # MFA 코드
└── logs.json            # 로그 데이터
```

---

## 📚 추가 문서

더 자세한 내용은 다음 문서를 참고하세요:

- **[docs/LOCAL_DEVELOPMENT.md](./docs/LOCAL_DEVELOPMENT.md)** - 로컬 개발 완전 가이드
- **[docs/LOCAL_DEV_SUMMARY.md](./docs/LOCAL_DEV_SUMMARY.md)** - 로컬 개발 빠른 참조
- **[docs/BACKEND_API_ROUTES.md](./docs/BACKEND_API_ROUTES.md)** - API 엔드포인트 문서
- **[docs/DOCKER_DEPLOYMENT.md](./docs/DOCKER_DEPLOYMENT.md)** - Docker 배포 가이드

---

## 💡 권장 워크플로우

### 일반 개발

```bash
# 1. Next.js API Routes 모드로 시작
npm run dev

# 2. 브라우저에서 개발
# http://localhost:3000

# 3. 필요시 Express 모드로 전환
./switch-mode.sh  # 또는 switch-mode.bat
```

### Express 기능 테스트

```bash
# 1. Express 모드로 전환
./switch-mode.sh  # 2번 선택

# 2. Express Backend와 Frontend 동시 실행
npm run dev:express

# 3. Express 서버 직접 테스트
curl http://localhost:3001/health
```

### 프로덕션 테스트

```bash
# 1. Next.js API Routes 모드로 전환
./switch-mode.sh  # 1번 선택

# 2. 빌드
npm run build

# 3. 프로덕션 서버 시작
npm start

# 4. 접속
# http://localhost:3000
```

---

**Happy Coding! 🚀**
