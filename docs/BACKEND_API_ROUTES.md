# Backend API Routes (Next.js Serverless Functions)

## ✅ Backend가 Vercel에서 실행됩니다!

이 애플리케이션은 이제 **Next.js API Routes**를 사용하여 백엔드 기능을 제공합니다. 별도의 Express 서버를 배포할 필요가 없습니다!

## 🚀 작동 방식

- **프론트엔드**: `https://your-app.vercel.app`
- **백엔드 API**: `https://your-app.vercel.app/api/*`

모든 API 엔드포인트가 Vercel Serverless Functions로 자동 배포됩니다.

## 📋 구현된 API Routes

### Authentication (`/api/auth/*`)

#### POST `/api/auth/login`
사용자 로그인
- **Body**: `{ username, password }`
- **Response**: `{ token, refreshToken, user }` 또는 `{ mfaRequired, userId, email }`

#### POST `/api/auth/verify-mfa`
MFA 코드 검증
- **Body**: `{ userId, code }`
- **Response**: `{ token, refreshToken, user }`

#### POST `/api/auth/refresh`
액세스 토큰 갱신
- **Body**: `{ refreshToken }`
- **Response**: `{ token }`

#### POST `/api/auth/logout`
로그아웃
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message }`

### Menu Management (`/api/menu`)

#### GET `/api/menu`
모든 메뉴 조회
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `[ { menu objects } ]`

#### POST `/api/menu`
새 메뉴 생성 (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ menu data }`
- **Response**: `{ new menu }`

#### PUT `/api/menu`
메뉴 업데이트 (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ id, ...updates }`
- **Response**: `{ updated menu }`

#### DELETE `/api/menu?id={menuId}`
메뉴 삭제 (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `id`
- **Response**: `{ message }`

### User Management (`/api/user`)

#### GET `/api/user`
사용자 목록 조회 (필터링 & 페이지네이션)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: 페이지 번호 (default: 0)
  - `pageSize`: 페이지 크기 (default: 50)
  - `username`: 사용자명 필터
  - `name`: 이름 필터
  - `email`: 이메일 필터
  - `role`: 역할 필터
  - `department`: 부서 필터
  - `status`: 상태 필터
- **Response**: `{ users, total, page, pageSize }`

#### POST `/api/user`
새 사용자 생성 (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ username, password, name, email, role, department, ... }`
- **Response**: `{ new user }`

#### PUT `/api/user`
사용자 업데이트 (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ id, ...updates }`
- **Response**: `{ updated user }`

#### DELETE `/api/user?id={userId}`
사용자 삭제 (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `id`
- **Response**: `{ message }`

## 🗄️ 데이터 저장

### Development (로컬)
- 데이터는 `backend/data/*.json` 파일에 저장됩니다
- 파일: `users.json`, `menus.json`, `mfaCodes.json` 등

### Production (Vercel)
- 데이터는 `/tmp/data/` 디렉토리에 임시 저장됩니다
- ⚠️ **중요**: Vercel의 `/tmp`는 서버리스 함수 실행 간에 지속되지 않을 수 있습니다
- 프로덕션 환경에서는 다음을 권장합니다:
  - **Vercel KV** (Redis)
  - **Vercel Postgres**
  - **MongoDB Atlas**
  - **Supabase**

## 🔐 인증

모든 보호된 엔드포인트는 JWT Bearer 토큰이 필요합니다:

```
Authorization: Bearer <your-jwt-token>
```

## 📦 환경 변수

Vercel Dashboard에서 다음 환경 변수를 설정하세요:

### 필수 변수
```bash
# API 설정 (Next.js API Routes 사용)
NEXT_PUBLIC_API_URL=/api

# JWT Secrets
JWT_SECRET=<your-secure-secret-key>
JWT_REFRESH_SECRET=<your-secure-refresh-key>

# Session Configuration
SESSION_TIMEOUT=1800000
SESSION_WARNING_TIME=120000
```

### 시크릿 키 생성
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔄 Migration from Express Backend

### 이전 구조 (Express)
```
backend/
  ├── server.js (Express 서버)
  ├── routes/ (API 라우트)
  └── data/ (JSON 데이터)
```

### 새로운 구조 (Next.js API Routes)
```
src/
  ├── app/api/ (API Routes - Serverless Functions)
  │   ├── auth/
  │   │   ├── login/route.ts
  │   │   ├── verify-mfa/route.ts
  │   │   ├── refresh/route.ts
  │   │   └── logout/route.ts
  │   ├── menu/route.ts
  │   └── user/route.ts
  └── lib/api/ (Utility Functions)
      ├── jwt.ts
      ├── password.ts
      └── fileUtils.ts
```

## ✨ 장점

1. **별도 서버 불필요**: Express 백엔드를 따로 배포할 필요 없음
2. **자동 확장**: Vercel이 자동으로 확장 처리
3. **빠른 배포**: 프론트엔드와 백엔드가 함께 배포됨
4. **동일 도메인**: CORS 문제 없음
5. **비용 효율적**: 서버리스 요금제

## 🚦 API 사용 예시

### 로그인
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: '<TEST_PASSWORD>' })
});
const data = await response.json();
```

### 메뉴 조회
```typescript
const response = await fetch('/api/menu', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const menus = await response.json();
```

### 사용자 목록 (필터링)
```typescript
const response = await fetch('/api/user?page=0&pageSize=10&role=admin', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { users, total } = await response.json();
```

## 🧪 로컬 테스트

```bash
# 개발 서버 시작
npm run dev

# API 테스트
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<TEST_PASSWORD>"}'
```

## 📚 추가 정보

- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Vercel Serverless Functions: https://vercel.com/docs/functions/serverless-functions

## ⚠️ 제한사항

1. **파일 저장소**: JSON 파일은 임시적입니다. 프로덕션에서는 데이터베이스 사용 권장
2. **실행 시간**: Serverless 함수는 최대 10초(Hobby), 60초(Pro) 제한
3. **메모리**: 1024MB(Hobby), 3008MB(Pro) 제한

## 🎯 프로덕션 권장사항

프로덕션 환경에서는 다음을 고려하세요:

1. **데이터베이스 연결**
   - Vercel Postgres
   - MongoDB Atlas
   - Supabase
   - PlanetScale

2. **파일 스토리지**
   - Vercel Blob
   - AWS S3
   - Cloudinary

3. **캐싱**
   - Vercel KV (Redis)
   - Next.js caching

4. **모니터링**
   - Vercel Analytics
   - Sentry
   - LogRocket
