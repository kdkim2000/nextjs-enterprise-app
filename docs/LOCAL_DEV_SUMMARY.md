# 로컬 개발 환경 - 빠른 참조

## ✅ 로컬에서 두 가지 방식으로 실행 가능

### 🎯 Option 1: Next.js API Routes (권장)

```bash
# 환경 설정 (.env.local)
NEXT_PUBLIC_API_URL=/api

# 실행
npm run dev

# 접속
Frontend: http://localhost:3000
Backend:  http://localhost:3000/api/*
```

**특징:**
- ✅ Vercel 프로덕션 환경과 동일
- ✅ 단일 프로세스로 실행
- ✅ 별도 Express 서버 불필요
- ✅ 빠른 시작

### 🎯 Option 2: Express Backend (레거시)

```bash
# 환경 설정 (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
BACKEND_PORT=3001

# 실행
npm run dev:express

# 접속
Frontend: http://localhost:3000
Backend:  http://localhost:3001/api/*
```

**특징:**
- ✅ 기존 Express 서버 사용
- ✅ 별도 포트(3001)에서 실행
- ✅ Express 미들웨어 테스트 가능
- ⚠️ 두 프로세스 필요 (Frontend + Backend)

---

## 📋 사용 가능한 명령어

| 명령어 | Backend | 설명 |
|--------|---------|------|
| `npm run dev` | Next.js API Routes | **권장** - Next.js API Routes 사용 |
| `npm run dev:express` | Express | Frontend + Express Backend 동시 실행 |
| `npm run dev:frontend` | 없음 | Frontend만 실행 |
| `npm run dev:backend` | Express | Express Backend만 실행 |

---

## 🔄 모드 전환

### Next.js API Routes로 전환
```bash
# .env.local 수정
NEXT_PUBLIC_API_URL=/api

npm run dev
```

### Express Backend로 전환
```bash
# .env.local 수정
NEXT_PUBLIC_API_URL=http://localhost:3001/api
BACKEND_PORT=3001

npm run dev:express
```

또는 템플릿 파일 사용:
```bash
# Next.js API Routes
cp .env.api-routes .env.local

# Express Backend
cp .env.express .env.local
```

---

## 📁 환경 설정 파일

- `.env.local` - 현재 활성 설정 (gitignore)
- `.env.api-routes` - Next.js API Routes 템플릿
- `.env.express` - Express Backend 템플릿
- `.env.production` - Vercel 프로덕션 설정

---

## 🧪 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# 결과 확인
✓ Generating static pages (38/38)
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/auth/refresh
├ ƒ /api/auth/verify-mfa
├ ƒ /api/menu
└ ƒ /api/user
```

---

## 💡 권장 사항

### 일반 개발
→ **Next.js API Routes** (`npm run dev`)

### Express 기능 테스트
→ **Express Backend** (`npm run dev:express`)

### 프로덕션 테스트
→ **Next.js API Routes** (`npm run build && npm start`)

---

## 📚 자세한 문서

- **[LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)** - 완전한 로컬 개발 가이드
- **[BACKEND_SOLUTION.md](./BACKEND_SOLUTION.md)** - Backend 솔루션 설명
- **[BACKEND_API_ROUTES.md](./BACKEND_API_ROUTES.md)** - API 엔드포인트 문서

---

## 🎓 데모 계정

- **Admin**: `admin` / `admin123` (MFA 활성화)
- **User**: `john.doe` / `password123`

---

**빠른 시작:**
```bash
npm install
npm run dev
# http://localhost:3000 접속
```
