# next.js 기반 최신 어플리케이션을 claude code 를 통해 만들었다.  전체 구조를 분석하여 개선할 부분이 없는지 점검하라.

## 메타데이터

| 항목 | 값 |
|------|---|
| **날짜** | 2025-11-04 |
| **프로젝트** | nextjs-enterprise-app |
| **브랜치** | 01-init |
| **카테고리** | bug-fix |
| **난이도** | hard |
| **소요시간** | 45분 |
| **메시지 수** | 190 |
| **세션 ID** | 9dc09248-c10d-4ab0-86c2-05ad8d12e48f |

---

## 대화 내용

### 👤 사용자 (오전 12:38:25)

next.js 기반 최신 어플리케이션을 claude code 를 통해 만들었다. 
전체 구조를 분석하여 개선할 부분이 없는지 점검하라. 

### 🤖 Claude (오전 12:38:35)

Next.js 어플리케이션의 전체 구조를 분석하고 개선점을 찾아보겠습니다.

### 👤 사용자 (오전 12:38:39)



### 👤 사용자 (오전 12:38:46)



### 👤 사용자 (오전 12:38:55)



### 👤 사용자 (오전 12:38:55)



### 👤 사용자 (오전 12:38:55)



### 👤 사용자 (오전 12:38:59)



### 👤 사용자 (오전 12:38:59)



### 👤 사용자 (오전 12:39:21)



### 👤 사용자 (오전 12:39:21)



### 👤 사용자 (오전 12:39:21)



### 👤 사용자 (오전 12:39:21)



### 👤 사용자 (오전 12:39:21)



### 👤 사용자 (오전 12:39:34)



### 👤 사용자 (오전 12:39:53)



### 👤 사용자 (오전 12:39:53)



### 👤 사용자 (오전 12:39:53)



### 👤 사용자 (오전 12:39:53)



### 👤 사용자 (오전 12:39:53)



### 👤 사용자 (오전 12:40:16)



### 👤 사용자 (오전 12:40:27)



### 👤 사용자 (오전 12:40:27)



### 👤 사용자 (오전 12:41:24)



### 👤 사용자 (오전 12:41:25)



### 👤 사용자 (오전 12:41:43)



### 👤 사용자 (오전 12:41:46)



### 👤 사용자 (오전 12:41:46)



### 👤 사용자 (오전 12:42:08)



### 👤 사용자 (오전 12:42:08)



### 🤖 Claude (오전 12:42:56)

전체 코드베이스를 분석했습니다. 다음과 같이 개선이 필요한 부분들을 발견했습니다.

## 🚨 치명적인 보안 문제 (즉시 수정 필요)

### 1. **비밀번호 평문 저장** 
**위치**: backend/routes/auth.js:24
```javascript
const user = users.find(u => u.username === username && u.password: <REDACTED> password);
```
- **문제**: 비밀번호가 평문으로 저장되고 비교됨
- **해결책**: bcrypt를 사용하여 비밀번호 해싱 구현 필요

### 2. **JWT Secret 하드코딩**
**위치**: backend/utils/jwt.js:3-4
```javascript
const JWT_SECRET=<REDACTED> || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET=<REDACTED> || 'your-refresh-secret-key';
```
- **문제**: 기본 시크릿 키가 하드코딩되어 있음
- **해결책**: 환경 변수 없을 경우 서버 시작 불가하도록 수정

### 3. **Rate Limiting 없음**
**위치**: backend/routes/auth.js
- **문제**: 로그인 엔드포인트에 Rate Limiting이 없어 무차별 대입 공격에 취약
- **해결책**: express-rate-limit 라이브러리 도입

### 4. **파일 업로드 보안 검증 부족**
**위치**: backend/routes/file.js:30-33
```javascript
fileFilter: (req, file, cb) => {
  // Add file type validation here if needed
  cb(null, true);
}
```
- **문제**: 파일 타입 검증이 구현되지 않음
- **해결책**: MIME 타입 및 파일 확장자 화이트리스트 검증 추가

### 5. **Path Traversal 취약점**
**위치**: backend/routes/file.js:93-96
```javascript
router.get('/download/:filename', authenticateToken, async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../public/uploads', filename);
```
- **문제**: 파일명에 `../` 포함 시 디렉토리 탐색 가능
- **해결책**: 파일명 검증 및 path.normalize() 사용

---

## ⚠️ TypeScript 타입 에러 (빌드 실패)

### 1. **DataGrid onRowsChange 타입 불일치**
**위치**: 
- src/app/[locale]/dashboard/components/page.tsx:124
- src/app/[locale]/dashboard/user-management/page.tsx:183

**문제**: `readonly` 배열을 `mutable` 배열로 할당 불가

### 2. **DataGrid CustomToolbar 타입 불일치**
**위치**: src/components/common/DataGrid/index.tsx:276, 280

**문제**: GridToolbarProps와 커스텀 props 간 타입 충돌

### 3. **RichTextEditor import 오류**
**위치**: src/components/common/RichTextEditor/index.tsx:32
```typescript
error TS2724: '"@mui/icons-material"' has no exported member named 'Table'. Did you mean 'Tablet'?
```

### 4. **AuthContextType 필드 충돌**
**위치**: src/contexts/AuthContext.tsx:7
```typescript
interface AuthContextType extends AuthState {
  refreshToken: () => Promise<void>; // 메서드
}
// vs AuthState에서
refreshToken: string; // 속성
```

---

## 🔧 코드 품질 및 아키텍처 개선

### 1. **환경 변수 관리**
- `.env.example` 파일이 없음
- 필수 환경 변수 문서화 부족

**권장사항**: `.env.example` 파일 생성
```env
# Backend
BACKEND_PORT=3001
JWT_SECRET=<REDACTED>

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. **CORS 설정 개선 필요**
**위치**: backend/server.js:20-23
```javascript
app.use(cors({
  origin: 'http://localhost:3000', // 하드코딩됨
  credentials: true
}));
```
**권장사항**: 환경 변수로 관리

### 3. **토큰 블랙리스트 미구현**
**위치**: backend/routes/auth.js:288-298
```javascript
router.post('/logout', async (req, res) => {
  // In a real application, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
});
```
**권장사항**: Redis 등을 활용한 토큰 블랙리스트 구현

### 4. **에러 처리 개선 필요**
- axios 인터셉터에서 하드코딩된 리다이렉트 (src/lib/axios/index.ts:66)
- alert() 사용 (src/components/common/DataGrid/index.tsx:186, 231, 234)

**권장사항**: 
- React Context 기반 에러 처리
- Toast 라이브러리 도입 (react-toastify, notistack 등)

---

## ⚡ 성능 최적화

### 1. **Next.js 설정 개선**
**위치**: next.config.ts
```typescript
const nextConfig: NextConfig = {
  /* config options here */
};
```

**권장 추가 설정**:
```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // 보안
  compress: true, // gzip 압축
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // 프로덕션 최적화
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  }
};
```

### 2. **불필요한 클라이언트 컴포넌트**
일부 컴포넌트가 불필요하게 `'use client'`로 선언됨
- 서버 컴포넌트로 전환 가능한 부분 검토 필요

### 3. **번들 크기 최적화**
**현재 문제**:
- MUI 전체 번들 로드
- 사용하지 않는 아이콘 import

**권장사항**:
```typescript
// ❌ 나쁨
import * as Icons from '@mui/icons-material';

// ✅ 좋음
import { Add, Delete, Edit } from '@mui/icons-material';
```

### 4. **메모이제이션 부족**
**위치**: 여러 컴포넌트에서 불필요한 리렌더링 발생 가능

**권장사항**:
- `React.memo()` 활용
- `useMemo`, `useCallback` 적절히 사용

---

## 📝 코드 스타일 및 베스트 프랙티스

### 1. **일관성 없는 에러 로깅**
- 일부는 `console.error`, 일부는 로그 없음
- 구조화된 로깅 시스템 도입 필요 (winston, pino 등)

### 2. **하드코딩된 문자열**
**위치**: 여러 곳
```typescript
window.location.href = '/en/login'; // 하드코딩된 locale
```

### 3. **ESLint 설정 누락**
`.eslintrc.json` 파일이 없음

**권장사항**: ESLint 설정 추가
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

---

## 🎯 우선순위별 개선 계획

### 🔴 높음 (즉시 수정)
1. 비밀번호 해싱 구현
2. JWT Secret 환경 변수 필수화
3. TypeScript 타입 에러 수정
4. Path Traversal 취약점 수정
5. 파일 업로드 검증 추가

### 🟡 중간 (1-2주 내)
6. Rate Limiting 추가
7. 토큰 블랙리스트 구현
8. 에러 처리 개선 (Toast 도입)
9. ESLint 설정 추가
10. 환경 변수 문서화

### 🟢 낮음 (장기)
11. 번들 크기 최적화
12. 메모이제이션 개선
13. 구조화된 로깅 시스템
14. E2E 테스트 추가
15. 성능 모니터링 도구 도입

---

## ✅ 잘 구현된 부분

1. ✅ Next.js 16 최신 버전 활용
2. ✅ TypeScript strict 모드 활성화
3. ✅ 모듈화된 컴포넌트 구조
4. ✅ 다국어 지원 (next-international)
5. ✅ JWT 토큰 자동 갱신 로직
6. ✅ MFA 구현
7. ✅ 파일 업로드/다운로드 기능
8. ✅ Excel Import/Export 기능
9. ✅ 자동 로그아웃 기능

---

개선이 필요한 항목들을 수정하시겠습니까? 우선순위가 높은 보안 이슈부터 수정을 도와드릴 수 있습니다.

### 👤 사용자 (오전 12:43:07)



### 👤 사용자 (오전 12:44:20)

아래 사항을 개선해 줘.
```
  🔴 높음 (즉시 수정)

  1. 비밀번호 해싱 구현
  2. JWT Secret 환경 변수 필수화
  3. TypeScript 타입 에러 수정
  4. Path Traversal 취약점 수정
  5. 파일 업로드 검증 추가
```

### 🤖 Claude (오전 12:44:31)

높은 우선순위 개선사항들을 수정하겠습니다.

### 👤 사용자 (오전 12:44:37)



### 👤 사용자 (오전 12:44:51)



### 👤 사용자 (오전 12:45:07)



### 👤 사용자 (오전 12:45:21)



### 👤 사용자 (오전 12:45:43)



### 👤 사용자 (오전 12:45:57)



### 👤 사용자 (오전 12:46:08)



### 👤 사용자 (오전 12:46:23)



### 👤 사용자 (오전 12:46:32)



### 👤 사용자 (오전 12:46:47)



### 👤 사용자 (오전 12:46:57)



### 👤 사용자 (오전 12:47:05)



### 👤 사용자 (오전 12:47:13)



### 👤 사용자 (오전 12:47:28)



### 👤 사용자 (오전 12:47:55)



### 👤 사용자 (오전 12:48:16)



### 👤 사용자 (오전 12:48:29)



### 👤 사용자 (오전 12:48:44)



### 👤 사용자 (오전 12:48:57)



### 👤 사용자 (오전 12:49:08)



### 👤 사용자 (오전 12:49:32)



### 👤 사용자 (오전 12:49:39)



### 👤 사용자 (오전 12:49:50)



### 👤 사용자 (오전 12:50:03)



### 👤 사용자 (오전 12:50:11)



### 👤 사용자 (오전 12:50:29)



### 👤 사용자 (오전 12:50:43)



### 👤 사용자 (오전 12:50:52)



### 👤 사용자 (오전 12:51:02)



### 👤 사용자 (오전 12:51:20)



### 👤 사용자 (오전 12:51:28)



### 👤 사용자 (오전 12:51:39)



### 👤 사용자 (오전 12:51:56)



### 👤 사용자 (오전 12:52:05)



### 👤 사용자 (오전 12:52:15)



### 👤 사용자 (오전 12:52:23)



### 👤 사용자 (오전 12:52:31)



### 👤 사용자 (오전 12:52:48)



### 👤 사용자 (오전 12:53:05)



### 🤖 Claude (오전 12:53:44)

API Error: Claude Code is unable to respond to this request, which appears to violate our Usage Policy (https://www.anthropic.com/legal/aup). Please double press esc to edit your last message or start a new session for Claude Code to assist with a different task. If you are seeing this refusal repeatedly, try running /model claude-sonnet-4-20250514 to switch models.

### 👤 사용자 (오전 12:53:44)



### 👤 사용자 (오전 12:54:01)



### 🤖 Claude (오전 12:54:34)

높은 우선순위 개선사항이 모두 완료되었습니다! 🎉

## ✅ 완료된 작업 요약

### 1. 비밀번호 해싱 구현 ✅
- **bcrypt** 패키지 설치
- `backend/utils/password.js` 생성 - 비밀번호 해싱/검증 유틸리티
- `backend/routes/auth.js` 수정 - 평문 비교 대신 bcrypt 사용
- `backend/data/users.json` 업데이트 - 모든 비밀번호 해싱 완료
- `backend/scripts/hashPasswords.js` 생성 - 향후 비밀번호 해싱 스크립트

**데모 계정 (동일한 크리덴셜 사용 가능):**
- Admin: `admin` / `<TEST_PASSWORD>`
- User: `john.doe` / `<TEST_PASSWORD>`
- Manager: `jane.smith` / `<TEST_PASSWORD>`

### 2. JWT Secret 환경 변수 필수화 ✅
- `backend/utils/jwt.js` 수정
  - JWT_SECRET 환경 변수 없으면 서버 시작 불가
  - JWT_REFRESH_SECRET 환경 변수 필수화
  - 명확한 에러 메시지 및 키 생성 가이드 제공

### 3. TypeScript 타입 에러 수정 ✅
모든 TypeScript 컴파일 에러 해결:

**수정된 파일:**
- `src/types/auth.ts` - AuthState 타입 정의
- `src/contexts/AuthContext.tsx` 
  - `refreshToken` → `refreshAccessToken`으로 메서드명 변경 (속성명 충돌 해결)
- `src/components/common/DataGrid/index.tsx`
  - CustomToolbar 타입 정의 추가
  - onRowsChange prop 타입 수정
  - slots/slotProps 타입 assertion 추가
- `src/components/common/RichTextEditor/index.tsx`
  - `Table` → `TableChart` 아이콘으로 변경
- `src/app/[locale]/dashboard/components/page.tsx`
  - onRowsChange 콜백 래퍼 추가
- `src/app/[locale]/dashboard/user-management/page.tsx`
  - onRowsChange 콜백 래퍼 추가

**검증 완료:** `npm run type-check` 성공 ✅

### 4. Path Traversal 취약점 수정 ✅
`backend/routes/file.js` 보안 강화:

**추가된 검증:**
- `isValidFilename()` 함수 구현
  - `..`, `/`, `\` 패턴 차단
  - 숨김 파일 차단
  - 특수문자 제한 (알파벳, 숫자, `-`, `_`, `.`만 허용)
  - 파일명 길이 제한 (255자)

**적용된 엔드포인트:**
- `/api/file/download/:filename` (file.js:159)
- `/api/file/delete/:filename` (file.js:196)
- 경로 정규화 및 업로드 디렉토리 내 파일만 접근 허용

### 5. 파일 업로드 검증 추가 ✅
`backend/routes/file.js` 파일 타입 화이트리스트 구현:

**MIME 타입 검증:**
- 이미지: jpeg, png, gif, webp
- 문서: pdf, doc, docx, xls, xlsx
- 텍스트: txt, csv

**확장자 검증:**
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`
- `.txt`, `.csv`

**파일 크기 제한:** 10MB

### 6. 환경 변수 문서화 ✅
`.env.example` 파일 생성:
```bash
# Backend Configuration
BACKEND_PORT=3001

# JWT Secrets (REQUIRED)
JWT_SECRET=<REDACTED>
JWT_REFRESH_SECRET=<REDACTED>

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🔒 보안 개선 효과

| 항목 | 이전 | 개선 후 |
|------|------|---------|
| 비밀번호 저장 | 평문 | bcrypt 해싱 (SALT_ROUNDS=10) |
| JWT Secret | 하드코딩 기본값 | 환경 변수 필수 |
| 파일 다운로드 | Path Traversal 취약 | 경로 검증 + 정규화 |
| 파일 업로드 | 타입 검증 없음 | MIME + 확장자 화이트리스트 |
| TypeScript | 6개 컴파일 에러 | 0개 에러 ✅ |

---

## 📝 다음 단계

프로젝트를 실행하려면:

```bash
# 1. .env.local 파일 생성 (.env.example 참고)
cp .env.example .env.local

# 2. JWT Secret 생성 및 설정
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. .env.local에 생성된 키 설정
# JWT_SECRET=<REDACTED>
# JWT_REFRESH_SECRET=<REDACTED>

# 4. 개발 서버 실행
npm run dev
```

**중요:** `.env.local` 파일에 실제 프로덕션 환경에서 사용할 강력한 JWT Secret을 설정해야 합니다!

모든 높은 우선순위 보안 개선사항이 완료되었습니다. 🎊

### 👤 사용자 (오전 12:55:47)

아래 사항을 개선해 줘.
```
  🟡 중간 (1-2주 내)

  6. Rate Limiting 추가
  7. 토큰 블랙리스트 구현
  8. 에러 처리 개선 (Toast 도입)
  9. ESLint 설정 추가
  10. 환경 변수 문서화
```

### 🤖 Claude (오전 12:55:55)

중간 우선순위 개선사항을 진행하겠습니다.

### 👤 사용자 (오전 12:56:01)



### 👤 사용자 (오전 12:56:18)



### 👤 사용자 (오전 12:56:33)



### 👤 사용자 (오전 12:56:54)



### 👤 사용자 (오전 12:57:18)



### 👤 사용자 (오전 12:57:31)



### 👤 사용자 (오전 12:57:39)



### 👤 사용자 (오전 12:57:48)



### 👤 사용자 (오전 12:58:00)



### 👤 사용자 (오전 12:58:10)



### 👤 사용자 (오전 12:58:18)



### 👤 사용자 (오전 12:58:28)



### 👤 사용자 (오전 12:58:48)



### 👤 사용자 (오전 12:59:12)



### 👤 사용자 (오전 12:59:21)



### 👤 사용자 (오전 12:59:37)



### 👤 사용자 (오전 12:59:50)



### 👤 사용자 (오전 1:00:06)



### 👤 사용자 (오전 1:00:21)



### 👤 사용자 (오전 1:00:30)



### 👤 사용자 (오전 1:00:43)



### 👤 사용자 (오전 1:00:59)



### 👤 사용자 (오전 1:01:16)



### 👤 사용자 (오전 1:01:32)



### 👤 사용자 (오전 1:01:40)



### 👤 사용자 (오전 1:01:53)



### 👤 사용자 (오전 1:02:09)



### 👤 사용자 (오전 1:02:19)



### 👤 사용자 (오전 1:02:30)



### 👤 사용자 (오전 1:02:42)



### 👤 사용자 (오전 1:02:58)



### 👤 사용자 (오전 1:03:12)



### 👤 사용자 (오전 1:03:24)



### 👤 사용자 (오전 1:03:33)



### 👤 사용자 (오전 1:03:47)



### 👤 사용자 (오전 1:04:03)



### 👤 사용자 (오전 1:05:36)



### 👤 사용자 (오전 1:05:52)



### 👤 사용자 (오전 1:06:14)



### 👤 사용자 (오전 1:06:37)



### 🤖 Claude (오전 1:07:20)

중간 우선순위 개선사항이 모두 완료되었습니다! 🎉

## ✅ 완료된 작업 요약

### 6. Rate Limiting 추가 ✅

**구현 위치**: `backend/middleware/rateLimiter.js`

**적용된 Rate Limiter:**
- **generalLimiter**: 모든 API (100 req/15분)
- **authLimiter**: 로그인 엔드포인트 (5 req/15분) - 무차별 대입 공격 방지
- **mfaLimiter**: MFA 인증 (3 req/5분) - MFA 코드 무차별 대입 방지
- **uploadLimiter**: 파일 업로드 (50 req/1시간) - 업로드 남용 방지
- **modifyLimiter**: 데이터 수정 API (20 req/1분) - 스팸 방지

**적용된 엔드포인트:**
- `/api/auth/login` - authLimiter
- `/api/auth/verify-mfa` - mfaLimiter
- `/api/auth/resend-mfa` - mfaLimiter
- `/api/file/upload` - uploadLimiter
- `/api/file/upload-multiple` - uploadLimiter

### 7. 토큰 블랙리스트 구현 ✅

**구현 위치**: `backend/utils/tokenBlacklist.js`

**기능:**
- 메모리 기반 블랙리스트 캐시 (빠른 조회)
- 파일 기반 영속성 (`backend/data/tokenBlacklist.json`)
- 만료된 토큰 자동 정리 (1시간마다)
- 로그아웃 시 토큰 자동 블랙리스트 추가

**통합 위치:**
- `backend/middleware/auth.js` - 모든 인증 요청에서 블랙리스트 체크
- `backend/routes/auth.js` - 로그아웃 시 토큰 블랙리스트 추가

**동작 방식:**
```javascript
// 로그아웃 시
1. Authorization 헤더에서 토큰 추출
2. 토큰 디코딩하여 만료 시간 확인
3. 블랙리스트에 토큰 추가 (만료 시간 포함)

// 인증 요청 시
1. 토큰 검증 전 블랙리스트 체크
2. 블랙리스트에 있으면 401 반환
```

### 8. 에러 처리 개선 (Toast 도입) ✅

**패키지**: `react-toastify`

**구현 위치:**
- `src/components/providers/ClientProviders.tsx` - ToastContainer 추가
- `src/components/common/DataGrid/index.tsx` - alert() → toast 대체

**Toast 설정:**
```typescript
- 위치: top-right
- 자동 닫기: 5초
- 드래그 가능
- 진행률 바 표시
- 최신 항목 상단 표시
```

**대체된 alert():**
- ❌ `alert('Failed to export data')`
- ✅ `toast.error('Failed to export data')`
- ✅ `toast.success('Data exported successfully')`
- ✅ `toast.success('Successfully imported X rows')`

### 9. ESLint 설정 추가 ✅

**설정 파일**: `eslint.config.mjs`

**추가된 규칙:**
```javascript
// Console 규칙
- console.log() → 경고 (warn, error, info만 허용)

// TypeScript 규칙
- no-unused-vars: 에러 (언더스코어로 시작하는 변수 제외)
- no-explicit-any: 경고

// 코드 품질
- prefer-const: 에러
- no-var: 에러
- eqeqeq: 에러 (===, !== 강제)
```

**Ignore 설정:**
```javascript
- .next/**
- node_modules/**
- backend/** (CommonJS 사용)
- public/**
- dist/**
```

**ESLint 실행 결과:**
- Backend 폴더 제외됨 ✅
- Frontend 코드만 검사됨 ✅
- 일부 경고 발견 (주로 any 타입 사용)

### 10. 환경 변수 문서화 ✅
이미 높은 우선순위에서 완료됨 (.env.example 생성)

---

## 📊 개선 효과 요약

| 항목 | 이전 | 개선 후 |
|------|------|---------|
| Rate Limiting | ❌ 없음 | ✅ 5개 타입별 제한 |
| 로그아웃 후 토큰 | ✅ 만료까지 유효 | ✅ 즉시 무효화 |
| 에러 표시 | ❌ alert() (침습적) | ✅ Toast (사용자 친화적) |
| 코드 품질 검사 | ⚠️ 기본 규칙만 | ✅ 커스텀 규칙 추가 |
| Backend Lint | ❌ require 에러 | ✅ 제외 처리 |

---

## 🚀 사용 방법

### Rate Limiting 동작 확인
```bash
# 로그인 5번 이상 시도
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"wrong","password: <REDACTED>}'
done

# 6번째 요청에서 429 에러 발생
```

### 토큰 블랙리스트 확인
```bash
# 1. 로그인
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john.doe","password: <REDACTED>}' \
  | jq -r '.token')

# 2. 로그아웃
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# 3. 같은 토큰으로 API 호출 시도
curl http://localhost:3001/api/user \
  -H "Authorization: Bearer $TOKEN"

# 결과: "Token has been revoked" 에러
```

### Toast 확인
```typescript
// DataGrid에서 Excel Export 시
- 성공: 녹색 토스트 "Data exported successfully"
- 실패: 빨간색 토스트 "Failed to export data"
```

### ESLint 실행
```bash
# Lint 검사
npm run lint

# 자동 수정 가능한 항목 수정
npm run lint -- --fix
```

---

## ⚠️ 주의사항

1. **Rate Limiting**: 개발 중 로그인 5회 제한에 주의
2. **토큰 블랙리스트**: 메모리 기반이므로 서버 재시작 시 캐시 재로드 필요
3. **ESLint**: 일부 `any` 타입 경고 발생 (필요시 타입 개선 권장)

---

모든 중간 우선순위 개선사항이 완료되었습니다! 🎊

### 👤 사용자 (오전 1:12:55)

아래 오류의 원인을 파악하여 해결하라. 
```
forward-logs-shared.js:28 [HMR] connected
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 1768ms
E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:79 Network error: Network Error
overrideMethod @ hook.js:608
error @ intercept-console-error.js:52
eval @ E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:79
Promise.then
_request @ Axios.js:175
request @ Axios.js:52
httpMethod @ Axios.js:236
wrap @ bind.js:16
post @ E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:94
AuthProvider.useCallback[ssoLogin] @ E:\apps\nextjs-enterprise-app\src\contexts\AuthContext.tsx:160
handleSSO @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:85
executeDispatch @ react-dom-client.development.js:20448
runWithFiberInDEV @ react-dom-client.development.js:985
processDispatchQueue @ react-dom-client.development.js:20498
eval @ react-dom-client.development.js:21069
batchedUpdates$1 @ react-dom-client.development.js:3376
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20652
dispatchEvent @ react-dom-client.development.js:25581
dispatchDiscreteEvent @ react-dom-client.development.js:25549
<button>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButtonBase-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonBaseRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
ButtonBase @ ButtonBase.js:260
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(ButtonBase)>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButton-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
Button @ Button.js:631
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(Button)>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
LoginPage @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:241
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12093
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<LoginPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromFetch @ react-server-dom-webpack-client.browser.development.js:4948
createFromNextFetch @ fetch-server-response.js:254
createFetch @ fetch-server-response.js:196
fetchServerResponse @ fetch-server-response.js:91
navigateDynamicallyWithNoPrefetch @ navigation.js:243
navigate @ navigation.js:93
navigate @ segment-cache.js:78
navigateReducer @ navigate-reducer.js:145
clientReducer @ router-reducer.js:24
action @ app-router-instance.js:160
runAction @ app-router-instance.js:65
dispatchAction @ app-router-instance.js:128
dispatch @ app-router-instance.js:158
eval @ use-action-queue.js:57
startTransition @ react-dom-client.development.js:9199
dispatch @ use-action-queue.js:56
dispatchAppRouterAction @ use-action-queue.js:37
dispatchNavigateAction @ app-router-instance.js:211
eval @ app-router-instance.js:278
startTransition @ react.development.js:556
push @ app-router-instance.js:277
LocaleRoot.useEffect @ E:\apps\nextjs-enterprise-app\src\app\[locale]\page.tsx:12
react_stack_bottom_frame @ react-dom-client.development.js:28011
runWithFiberInDEV @ react-dom-client.development.js:985
commitHookEffectListMount @ react-dom-client.development.js:13612
commitHookPassiveMountEffects @ react-dom-client.development.js:13699
reconnectPassiveEffects @ react-dom-client.development.js:17030
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
commitPassiveMountOnFiber @ react-dom-client.development.js:16854
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16804
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
<LocaleRoot>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
eval @ react-server-dom-webpack-client.browser.development.js:4535
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1788
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1641
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:4365
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:4225
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:4438
progress @ react-server-dom-webpack-client.browser.development.js:4709
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:4981
eval @ app-index.js:146
(app-pages-browser)/./node_modules/next/dist/client/app-index.js @ main-app.js?v=1762272655825:138
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
fn @ webpack.js?v=1762272655825:361
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:60
loadScriptsInSequence @ app-bootstrap.js:25
appBootstrap @ app-bootstrap.js:54
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1762272655825:160
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
__webpack_exec__ @ main-app.js?v=1762272655825:1945
(anonymous) @ main-app.js?v=1762272655825:1946
webpackJsonpCallback @ webpack.js?v=1762272655825:1380
(anonymous) @ main-app.js?v=1762272655825:9
E:\apps\nextjs-enterprise-app\src\contexts\AuthContext.tsx:176 SSO login error: AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK', config: {…}, request: XMLHttpRequest, …}
overrideMethod @ hook.js:608
error @ intercept-console-error.js:52
AuthProvider.useCallback[ssoLogin] @ E:\apps\nextjs-enterprise-app\src\contexts\AuthContext.tsx:176
await in AuthProvider.useCallback[ssoLogin]
handleSSO @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:85
executeDispatch @ react-dom-client.development.js:20448
runWithFiberInDEV @ react-dom-client.development.js:985
processDispatchQueue @ react-dom-client.development.js:20498
eval @ react-dom-client.development.js:21069
batchedUpdates$1 @ react-dom-client.development.js:3376
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20652
dispatchEvent @ react-dom-client.development.js:25581
dispatchDiscreteEvent @ react-dom-client.development.js:25549
<button>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButtonBase-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonBaseRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
ButtonBase @ ButtonBase.js:260
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(ButtonBase)>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButton-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
Button @ Button.js:631
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(Button)>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
LoginPage @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:241
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12093
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<LoginPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromFetch @ react-server-dom-webpack-client.browser.development.js:4948
createFromNextFetch @ fetch-server-response.js:254
createFetch @ fetch-server-response.js:196
fetchServerResponse @ fetch-server-response.js:91
navigateDynamicallyWithNoPrefetch @ navigation.js:243
navigate @ navigation.js:93
navigate @ segment-cache.js:78
navigateReducer @ navigate-reducer.js:145
clientReducer @ router-reducer.js:24
action @ app-router-instance.js:160
runAction @ app-router-instance.js:65
dispatchAction @ app-router-instance.js:128
dispatch @ app-router-instance.js:158
eval @ use-action-queue.js:57
startTransition @ react-dom-client.development.js:9199
dispatch @ use-action-queue.js:56
dispatchAppRouterAction @ use-action-queue.js:37
dispatchNavigateAction @ app-router-instance.js:211
eval @ app-router-instance.js:278
startTransition @ react.development.js:556
push @ app-router-instance.js:277
LocaleRoot.useEffect @ E:\apps\nextjs-enterprise-app\src\app\[locale]\page.tsx:12
react_stack_bottom_frame @ react-dom-client.development.js:28011
runWithFiberInDEV @ react-dom-client.development.js:985
commitHookEffectListMount @ react-dom-client.development.js:13612
commitHookPassiveMountEffects @ react-dom-client.development.js:13699
reconnectPassiveEffects @ react-dom-client.development.js:17030
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
commitPassiveMountOnFiber @ react-dom-client.development.js:16854
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16804
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
<LocaleRoot>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
eval @ react-server-dom-webpack-client.browser.development.js:4535
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1788
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1641
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:4365
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:4225
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:4438
progress @ react-server-dom-webpack-client.browser.development.js:4709
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:4981
eval @ app-index.js:146
(app-pages-browser)/./node_modules/next/dist/client/app-index.js @ main-app.js?v=1762272655825:138
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
fn @ webpack.js?v=1762272655825:361
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:60
loadScriptsInSequence @ app-bootstrap.js:25
appBootstrap @ app-bootstrap.js:54
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1762272655825:160
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
__webpack_exec__ @ main-app.js?v=1762272655825:1945
(anonymous) @ main-app.js?v=1762272655825:1946
webpackJsonpCallback @ webpack.js?v=1762272655825:1380
(anonymous) @ main-app.js?v=1762272655825:9
E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:94  POST http://localhost:3001/api/auth/sso net::ERR_CONNECTION_REFUSED
dispatchXhrRequest @ xhr.js:212
xhr @ xhr.js:29
dispatchRequest @ dispatchRequest.js:61
Promise.then
_request @ Axios.js:175
request @ Axios.js:52
httpMethod @ Axios.js:236
wrap @ bind.js:16
post @ E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:94
AuthProvider.useCallback[ssoLogin] @ E:\apps\nextjs-enterprise-app\src\contexts\AuthContext.tsx:160
handleSSO @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:85
executeDispatch @ react-dom-client.development.js:20448
runWithFiberInDEV @ react-dom-client.development.js:985
processDispatchQueue @ react-dom-client.development.js:20498
eval @ react-dom-client.development.js:21069
batchedUpdates$1 @ react-dom-client.development.js:3376
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20652
dispatchEvent @ react-dom-client.development.js:25581
dispatchDiscreteEvent @ react-dom-client.development.js:25549
<button>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButtonBase-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonBaseRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
ButtonBase @ ButtonBase.js:260
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(ButtonBase)>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButton-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
Button @ Button.js:631
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(Button)>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
LoginPage @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:241
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12093
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<LoginPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromFetch @ react-server-dom-webpack-client.browser.development.js:4948
createFromNextFetch @ fetch-server-response.js:254
createFetch @ fetch-server-response.js:196
fetchServerResponse @ fetch-server-response.js:91
navigateDynamicallyWithNoPrefetch @ navigation.js:243
navigate @ navigation.js:93
navigate @ segment-cache.js:78
navigateReducer @ navigate-reducer.js:145
clientReducer @ router-reducer.js:24
action @ app-router-instance.js:160
runAction @ app-router-instance.js:65
dispatchAction @ app-router-instance.js:128
dispatch @ app-router-instance.js:158
eval @ use-action-queue.js:57
startTransition @ react-dom-client.development.js:9199
dispatch @ use-action-queue.js:56
dispatchAppRouterAction @ use-action-queue.js:37
dispatchNavigateAction @ app-router-instance.js:211
eval @ app-router-instance.js:278
startTransition @ react.development.js:556
push @ app-router-instance.js:277
LocaleRoot.useEffect @ E:\apps\nextjs-enterprise-app\src\app\[locale]\page.tsx:12
react_stack_bottom_frame @ react-dom-client.development.js:28011
runWithFiberInDEV @ react-dom-client.development.js:985
commitHookEffectListMount @ react-dom-client.development.js:13612
commitHookPassiveMountEffects @ react-dom-client.development.js:13699
reconnectPassiveEffects @ react-dom-client.development.js:17030
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
commitPassiveMountOnFiber @ react-dom-client.development.js:16854
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16804
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
<LocaleRoot>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
eval @ react-server-dom-webpack-client.browser.development.js:4535
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1788
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1641
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:4365
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:4225
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:4438
progress @ react-server-dom-webpack-client.browser.development.js:4709
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:4981
eval @ app-index.js:146
(app-pages-browser)/./node_modules/next/dist/client/app-index.js @ main-app.js?v=1762272655825:138
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
fn @ webpack.js?v=1762272655825:361
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:60
loadScriptsInSequence @ app-bootstrap.js:25
appBootstrap @ app-bootstrap.js:54
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1762272655825:160
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
__webpack_exec__ @ main-app.js?v=1762272655825:1945
(anonymous) @ main-app.js?v=1762272655825:1946
webpackJsonpCallback @ webpack.js?v=1762272655825:1380
(anonymous) @ main-app.js?v=1762272655825:9
E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:79 Network error: Network Error
overrideMethod @ hook.js:608
error @ intercept-console-error.js:52
eval @ E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:79
Promise.then
_request @ Axios.js:175
request @ Axios.js:52
httpMethod @ Axios.js:236
wrap @ bind.js:16
post @ E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:94
AuthProvider.useCallback[ssoLogin] @ E:\apps\nextjs-enterprise-app\src\contexts\AuthContext.tsx:160
handleSSO @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:85
executeDispatch @ react-dom-client.development.js:20448
runWithFiberInDEV @ react-dom-client.development.js:985
processDispatchQueue @ react-dom-client.development.js:20498
eval @ react-dom-client.development.js:21069
batchedUpdates$1 @ react-dom-client.development.js:3376
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20652
dispatchEvent @ react-dom-client.development.js:25581
dispatchDiscreteEvent @ react-dom-client.development.js:25549
<button>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButtonBase-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonBaseRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
ButtonBase @ ButtonBase.js:260
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(ButtonBase)>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButton-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
Button @ Button.js:631
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(Button)>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
LoginPage @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:241
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12093
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<LoginPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromFetch @ react-server-dom-webpack-client.browser.development.js:4948
createFromNextFetch @ fetch-server-response.js:254
createFetch @ fetch-server-response.js:196
fetchServerResponse @ fetch-server-response.js:91
navigateDynamicallyWithNoPrefetch @ navigation.js:243
navigate @ navigation.js:93
navigate @ segment-cache.js:78
navigateReducer @ navigate-reducer.js:145
clientReducer @ router-reducer.js:24
action @ app-router-instance.js:160
runAction @ app-router-instance.js:65
dispatchAction @ app-router-instance.js:128
dispatch @ app-router-instance.js:158
eval @ use-action-queue.js:57
startTransition @ react-dom-client.development.js:9199
dispatch @ use-action-queue.js:56
dispatchAppRouterAction @ use-action-queue.js:37
dispatchNavigateAction @ app-router-instance.js:211
eval @ app-router-instance.js:278
startTransition @ react.development.js:556
push @ app-router-instance.js:277
LocaleRoot.useEffect @ E:\apps\nextjs-enterprise-app\src\app\[locale]\page.tsx:12
react_stack_bottom_frame @ react-dom-client.development.js:28011
runWithFiberInDEV @ react-dom-client.development.js:985
commitHookEffectListMount @ react-dom-client.development.js:13612
commitHookPassiveMountEffects @ react-dom-client.development.js:13699
reconnectPassiveEffects @ react-dom-client.development.js:17030
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
commitPassiveMountOnFiber @ react-dom-client.development.js:16854
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16804
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
<LocaleRoot>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
eval @ react-server-dom-webpack-client.browser.development.js:4535
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1788
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1641
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:4365
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:4225
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:4438
progress @ react-server-dom-webpack-client.browser.development.js:4709
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:4981
eval @ app-index.js:146
(app-pages-browser)/./node_modules/next/dist/client/app-index.js @ main-app.js?v=1762272655825:138
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
fn @ webpack.js?v=1762272655825:361
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:60
loadScriptsInSequence @ app-bootstrap.js:25
appBootstrap @ app-bootstrap.js:54
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1762272655825:160
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
__webpack_exec__ @ main-app.js?v=1762272655825:1945
(anonymous) @ main-app.js?v=1762272655825:1946
webpackJsonpCallback @ webpack.js?v=1762272655825:1380
(anonymous) @ main-app.js?v=1762272655825:9
E:\apps\nextjs-enterprise-app\src\contexts\AuthContext.tsx:176 SSO login error: AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK', config: {…}, request: XMLHttpRequest, …}
overrideMethod @ hook.js:608
error @ intercept-console-error.js:52
AuthProvider.useCallback[ssoLogin] @ E:\apps\nextjs-enterprise-app\src\contexts\AuthContext.tsx:176
await in AuthProvider.useCallback[ssoLogin]
handleSSO @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:85
executeDispatch @ react-dom-client.development.js:20448
runWithFiberInDEV @ react-dom-client.development.js:985
processDispatchQueue @ react-dom-client.development.js:20498
eval @ react-dom-client.development.js:21069
batchedUpdates$1 @ react-dom-client.development.js:3376
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20652
dispatchEvent @ react-dom-client.development.js:25581
dispatchDiscreteEvent @ react-dom-client.development.js:25549
<button>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButtonBase-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonBaseRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
ButtonBase @ ButtonBase.js:260
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(ButtonBase)>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButton-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
Button @ Button.js:631
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(Button)>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
LoginPage @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:241
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12093
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<LoginPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromFetch @ react-server-dom-webpack-client.browser.development.js:4948
createFromNextFetch @ fetch-server-response.js:254
createFetch @ fetch-server-response.js:196
fetchServerResponse @ fetch-server-response.js:91
navigateDynamicallyWithNoPrefetch @ navigation.js:243
navigate @ navigation.js:93
navigate @ segment-cache.js:78
navigateReducer @ navigate-reducer.js:145
clientReducer @ router-reducer.js:24
action @ app-router-instance.js:160
runAction @ app-router-instance.js:65
dispatchAction @ app-router-instance.js:128
dispatch @ app-router-instance.js:158
eval @ use-action-queue.js:57
startTransition @ react-dom-client.development.js:9199
dispatch @ use-action-queue.js:56
dispatchAppRouterAction @ use-action-queue.js:37
dispatchNavigateAction @ app-router-instance.js:211
eval @ app-router-instance.js:278
startTransition @ react.development.js:556
push @ app-router-instance.js:277
LocaleRoot.useEffect @ E:\apps\nextjs-enterprise-app\src\app\[locale]\page.tsx:12
react_stack_bottom_frame @ react-dom-client.development.js:28011
runWithFiberInDEV @ react-dom-client.development.js:985
commitHookEffectListMount @ react-dom-client.development.js:13612
commitHookPassiveMountEffects @ react-dom-client.development.js:13699
reconnectPassiveEffects @ react-dom-client.development.js:17030
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
commitPassiveMountOnFiber @ react-dom-client.development.js:16854
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16804
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
<LocaleRoot>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
eval @ react-server-dom-webpack-client.browser.development.js:4535
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1788
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1641
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:4365
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:4225
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:4438
progress @ react-server-dom-webpack-client.browser.development.js:4709
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:4981
eval @ app-index.js:146
(app-pages-browser)/./node_modules/next/dist/client/app-index.js @ main-app.js?v=1762272655825:138
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
fn @ webpack.js?v=1762272655825:361
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:60
loadScriptsInSequence @ app-bootstrap.js:25
appBootstrap @ app-bootstrap.js:54
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1762272655825:160
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
__webpack_exec__ @ main-app.js?v=1762272655825:1945
(anonymous) @ main-app.js?v=1762272655825:1946
webpackJsonpCallback @ webpack.js?v=1762272655825:1380
(anonymous) @ main-app.js?v=1762272655825:9
E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:94  POST http://localhost:3001/api/auth/sso net::ERR_CONNECTION_REFUSED
dispatchXhrRequest @ xhr.js:212
xhr @ xhr.js:29
dispatchRequest @ dispatchRequest.js:61
Promise.then
_request @ Axios.js:175
request @ Axios.js:52
httpMethod @ Axios.js:236
wrap @ bind.js:16
post @ E:\apps\nextjs-enterprise-app\src\lib\axios\index.ts:94
AuthProvider.useCallback[ssoLogin] @ E:\apps\nextjs-enterprise-app\src\contexts\AuthContext.tsx:160
handleSSO @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:85
executeDispatch @ react-dom-client.development.js:20448
runWithFiberInDEV @ react-dom-client.development.js:985
processDispatchQueue @ react-dom-client.development.js:20498
eval @ react-dom-client.development.js:21069
batchedUpdates$1 @ react-dom-client.development.js:3376
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20652
dispatchEvent @ react-dom-client.development.js:25581
dispatchDiscreteEvent @ react-dom-client.development.js:25549
<button>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButtonBase-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonBaseRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
ButtonBase @ ButtonBase.js:260
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(ButtonBase)>
exports.createElement @ react.development.js:1139
eval @ emotion-styled-base.browser.development.esm.js:168
MuiButton-root @ emotion-element-489459f2.browser.development.esm.js:56
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<MuiButtonRoot>
exports.jsxs @ react-jsx-runtime.development.js:360
Button @ Button.js:631
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateForwardRef @ react-dom-client.development.js:10039
beginWork @ react-dom-client.development.js:12432
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef(Button)>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
LoginPage @ E:\apps\nextjs-enterprise-app\src\app\[locale]\login\page.tsx:241
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12093
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
<LoginPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromFetch @ react-server-dom-webpack-client.browser.development.js:4948
createFromNextFetch @ fetch-server-response.js:254
createFetch @ fetch-server-response.js:196
fetchServerResponse @ fetch-server-response.js:91
navigateDynamicallyWithNoPrefetch @ navigation.js:243
navigate @ navigation.js:93
navigate @ segment-cache.js:78
navigateReducer @ navigate-reducer.js:145
clientReducer @ router-reducer.js:24
action @ app-router-instance.js:160
runAction @ app-router-instance.js:65
dispatchAction @ app-router-instance.js:128
dispatch @ app-router-instance.js:158
eval @ use-action-queue.js:57
startTransition @ react-dom-client.development.js:9199
dispatch @ use-action-queue.js:56
dispatchAppRouterAction @ use-action-queue.js:37
dispatchNavigateAction @ app-router-instance.js:211
eval @ app-router-instance.js:278
startTransition @ react.development.js:556
push @ app-router-instance.js:277
LocaleRoot.useEffect @ E:\apps\nextjs-enterprise-app\src\app\[locale]\page.tsx:12
react_stack_bottom_frame @ react-dom-client.development.js:28011
runWithFiberInDEV @ react-dom-client.development.js:985
commitHookEffectListMount @ react-dom-client.development.js:13612
commitHookPassiveMountEffects @ react-dom-client.development.js:13699
reconnectPassiveEffects @ react-dom-client.development.js:17030
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17083
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
reconnectPassiveEffects @ react-dom-client.development.js:17022
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16982
commitPassiveMountOnFiber @ react-dom-client.development.js:16854
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16804
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16659
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16631
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
commitPassiveMountOnFiber @ react-dom-client.development.js:16916
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16584
<LocaleRoot>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.js:40
react_stack_bottom_frame @ react-dom-client.development.js:27926
renderWithHooksAgain @ react-dom-client.development.js:8073
renderWithHooks @ react-dom-client.development.js:7985
updateFunctionComponent @ react-dom-client.development.js:10481
beginWork @ react-dom-client.development.js:12042
runWithFiberInDEV @ react-dom-client.development.js:985
performUnitOfWork @ react-dom-client.development.js:18902
workLoopConcurrentByScheduler @ react-dom-client.development.js:18896
renderRootConcurrent @ react-dom-client.development.js:18878
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20289
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM408 <anonymous>:1
Function.all @ VM408 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1896
eval @ react-server-dom-webpack-client.browser.development.js:4535
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1788
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1641
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:4365
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:4225
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:4438
progress @ react-server-dom-webpack-client.browser.development.js:4709
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2722
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:4571
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:4981
eval @ app-index.js:146
(app-pages-browser)/./node_modules/next/dist/client/app-index.js @ main-app.js?v=1762272655825:138
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
fn @ webpack.js?v=1762272655825:361
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:60
loadScriptsInSequence @ app-bootstrap.js:25
appBootstrap @ app-bootstrap.js:54
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1762272655825:160
options.factory @ webpack.js?v=1762272655825:704
__webpack_require__ @ webpack.js?v=1762272655825:29
__webpack_exec__ @ main-app.js?v=1762272655825:1945
(anonymous) @ main-app.js?v=1762272655825:1946
webpackJsonpCallback @ webpack.js?v=1762272655825:1380
(anonymous) @ main-app.js?v=1762272655825:9

```

```

### 🤖 Claude (오전 1:13:14)

에러의 원인을 파악했습니다. `ERR_CONNECTION_REFUSED` 에러는 **백엔드 서버가 실행되지 않았거나 포트 3001에 연결할 수 없음**을 의미합니다.

이전에 JWT Secret을 필수화했기 때문에, `.env.local` 파일에 환경 변수가 설정되지 않으면 백엔드 서버가 시작되지 않습니다.

해결 방법을 진행하겠습니다.

### 👤 사용자 (오전 1:13:45)



### 👤 사용자 (오전 1:15:06)

This session is being continued from a previous conversation that ran out of context. The conversation is summarized below:
Analysis:
Let me analyze this conversation chronologically:

1. **Initial Request**: User asked to analyze a Next.js enterprise application structure and identify areas for improvement.

2. **First Phase - Code Analysis**: 
   - I read package.json, next.config.ts, tsconfig.json, and various source files
   - Identified 5 critical security issues and TypeScript errors
   - Created a comprehensive analysis report with priority levels

3. **Second Request**: User asked to fix high-priority issues:
   - Password hashing implementation
   - JWT Secret environment variable enforcement
   - TypeScript type errors
   - Path Traversal vulnerability
   - File upload validation

4. **Implementation of High Priority Fixes**:
   - Installed bcrypt package
   - Created .env.example file
   - Modified backend/utils/jwt.js to require JWT_SECRET
   - Created backend/utils/password.js for password hashing
   - Modified backend/routes/auth.js to use bcrypt
   - Created and ran backend/scripts/hashPasswords.js
   - Fixed file upload validation in backend/routes/file.js
   - Fixed all TypeScript type errors in multiple files
   - Successfully ran type-check with zero errors

5. **Third Request**: User asked to fix medium-priority issues:
   - Rate Limiting
   - Token Blacklist
   - Toast notifications (error handling improvement)
   - ESLint configuration

6. **Implementation of Medium Priority Fixes**:
   - Installed express-rate-limit
   - Created backend/middleware/rateLimiter.js with 5 different limiters
   - Applied rate limiting to auth and file routes
   - Created backend/utils/tokenBlacklist.js for token management
   - Modified backend/middleware/auth.js to check blacklist
   - Modified backend/routes/auth.js to add tokens to blacklist on logout
   - Installed react-toastify
   - Added ToastContainer to ClientProviders.tsx
   - Replaced alert() calls with toast in DataGrid component
   - Updated eslint.config.mjs with custom rules
   - Successfully ran ESLint (backend excluded)

7. **Final Issue**: User provided error log showing ERR_CONNECTION_REFUSED when trying SSO login
   - I identified the issue: backend server not running because JWT_SECRET was required but not properly set in .env.local
   - I checked .env.local and found JWT_REFRESH_SECRET still had placeholder value

The conversation ended with me checking the .env.local file and discovering that JWT_REFRESH_SECRET still has the placeholder value "your-refresh-secret-key" which would prevent the backend server from starting.

Summary:
1. Primary Request and Intent:
   - Analyze a Next.js 16 enterprise application structure and identify improvement areas
   - Fix high-priority issues (🔴): password hashing, JWT secret enforcement, TypeScript errors, path traversal vulnerability, file upload validation
   - Fix medium-priority issues (🟡): rate limiting, token blacklist, error handling with toast notifications, ESLint configuration, environment variable documentation
   - Troubleshoot ERR_CONNECTION_REFUSED error when attempting SSO login

2. Key Technical Concepts:
   - Next.js 16 App Router with TypeScript
   - Material-UI (MUI) v6
   - bcrypt password hashing (SALT_ROUNDS=10)
   - JWT authentication with token refresh and blacklist
   - express-rate-limit for API protection
   - react-toastify for user-friendly notifications
   - Path traversal attack prevention
   - MIME type and file extension whitelisting
   - ESLint with custom rules for Next.js
   - Environment variable validation and enforcement

3. Files and Code Sections:

   - **package.json**
     - Why: Check dependencies and scripts
     - Added: bcrypt, express-rate-limit, react-toastify

   - **.env.example** (Created)
     - Why: Document required environment variables
     - Contents:
     ```env
     BACKEND_PORT=3001
     JWT_SECRET=<REDACTED>
     JWT_REFRESH_SECRET=<REDACTED>
     CORS_ORIGIN=http://localhost:3000
     NEXT_PUBLIC_API_URL=http://localhost:3001/api
     EMAIL_FROM=noreply@example.com
     SESSION_TIMEOUT=1800000
     AUTO_LOGOUT_WARNING_TIME=120000
     ```

   - **backend/utils/jwt.js** (Modified)
     - Why: Enforce JWT_SECRET as required environment variable
     - Key change: Added validation at module load
     ```javascript
     if (!process.env.JWT_SECRET) {
       console.error('FATAL ERROR: JWT_SECRET is not defined');
       process.exit(1);
     }
     if (!process.env.JWT_REFRESH_SECRET) {
       console.error('FATAL ERROR: JWT_REFRESH_SECRET is not defined');
       process.exit(1);
     }
     const JWT_SECRET=<REDACTED>
     const JWT_REFRESH_SECRET=<REDACTED>
     ```

   - **backend/utils/password.js** (Created)
     - Why: Implement secure password hashing and verification
     ```javascript
     const bcrypt = require('bcrypt');
     const SALT_ROUNDS = 10;

     async function hashPassword(password) {
       const salt = await bcrypt.genSalt(SALT_ROUNDS);
       return await bcrypt.hash(password, salt);
     }

     async function comparePassword(password, hashedPassword) {
       return await bcrypt.compare(password, hashedPassword);
     }
     ```

   - **backend/routes/auth.js** (Modified)
     - Why: Use bcrypt for password comparison, add token blacklisting
     - Key changes:
       1. Import comparePassword and addToBlacklist
       2. Changed password verification:
       ```javascript
       const user = users.find(u => u.username === username);
       const isPasswordValid = await comparePassword(password, user.password);
       if (!isPasswordValid) {
         return res.status(401).json({ error: 'Invalid credentials' });
       }
       ```
       3. Updated logout to blacklist token:
       ```javascript
       router.post('/logout', async (req, res) => {
         const authHeader = req.headers['authorization'];
         const token = authHeader && authHeader.split(' ')[1];
         if (token) {
           const decoded = jwt.decode(token);
           if (decoded && decoded.exp) {
             await addToBlacklist(token, decoded.exp * 1000);
           }
         }
         res.json({ message: 'Logout successful' });
       });
       ```
       4. Added rate limiting to login, verify-mfa, resend-mfa routes

   - **backend/scripts/hashPasswords.js** (Created)
     - Why: Hash existing plaintext passwords in users.json
     - Successfully hashed all 3 user passwords

   - **backend/middleware/rateLimiter.js** (Created)
     - Why: Prevent brute force attacks and API abuse
     - Implements 5 rate limiters:
       - generalLimiter: 100 req/15min
       - authLimiter: 5 req/15min (login)
       - mfaLimiter: 3 req/5min (MFA verification)
       - uploadLimiter: 50 req/1hour (file uploads)
       - modifyLimiter: 20 req/1min (data modifications)

   - **backend/utils/tokenBlacklist.js** (Created)
     - Why: Invalidate tokens on logout
     - Features:
       - In-memory cache for fast lookup
       - File-based persistence
       - Automatic cleanup of expired tokens every hour
     ```javascript
     async function addToBlacklist(token, expiresAt) {
       blacklistCache.add(token);
       // Save to file...
     }
     function isBlacklisted(token) {
       return blacklistCache.has(token);
     }
     ```

   - **backend/middleware/auth.js** (Modified)
     - Why: Check blacklist before authenticating requests
     ```javascript
     if (isBlacklisted(token)) {
       return res.status(401).json({ error: 'Token has been revoked' });
     }
     ```

   - **backend/routes/file.js** (Modified)
     - Why: Fix path traversal vulnerability and add file type validation
     - Added MIME type whitelist and extension validation
     - Added isValidFilename() function to prevent path traversal
     - Applied validation to download and delete endpoints

   - **src/types/auth.ts** (Read)
     - Why: Understand AuthState interface for fixing type errors
     - Found conflict: refreshToken field name collision

   - **src/contexts/AuthContext.tsx** (Modified)
     - Why: Fix TypeScript type error - refreshToken name collision
     - Changed: `refreshToken: () => Promise<void>` → `refreshAccessToken: () => Promise<void>`

   - **src/components/common/DataGrid/index.tsx** (Modified)
     - Why: Fix TypeScript type errors and replace alert with toast
     - Changes:
       1. Fixed onRowsChange prop type: `(rows: any[]) => void`
       2. Added CustomToolbarProps interface
       3. Used `as any` for slots/slotProps type assertion
       4. Replaced alert() with toast.success() and toast.error()

   - **src/components/common/RichTextEditor/index.tsx** (Modified)
     - Why: Fix import error - Table icon doesn't exist
     - Changed: `Table as TableIcon` → `TableChart as TableIcon`

   - **src/components/providers/ClientProviders.tsx** (Modified)
     - Why: Add toast notification support
     ```typescript
     import { ToastContainer } from 'react-toastify';
     import 'react-toastify/dist/ReactToastify.css';
     
     <ToastContainer
       position="top-right"
       autoClose={5000}
       hideProgressBar={false}
       newestOnTop
       closeOnClick
       rtl={false}
       pauseOnFocusLoss
       draggable
       pauseOnHover
       theme="light"
     />
     ```

   - **eslint.config.mjs** (Modified)
     - Why: Add custom ESLint rules
     - Added custom rules for console warnings, unused vars, no-explicit-any
     - Excluded backend/** from linting (uses CommonJS)

   - **.env.local** (Read - Current Issue)
     - Why: Diagnose ERR_CONNECTION_REFUSED error
     - Found: JWT_REFRESH_SECRET still has placeholder "your-refresh-secret-key"
     - This causes backend server to fail startup due to validation in jwt.js

4. Errors and Fixes:

   - **TypeScript Compilation Errors (6 errors)**:
     - Error: AuthContext refreshToken name collision
       - Fix: Renamed method to `refreshAccessToken`
     - Error: DataGrid onRowsChange type mismatch
       - Fix: Changed type to `(rows: any[]) => void` and wrapped callbacks
     - Error: DataGrid CustomToolbar type incompatibility
       - Fix: Created CustomToolbarProps interface and used `as any`
     - Error: RichTextEditor Table icon import
       - Fix: Changed to `TableChart as TableIcon`
     - Result: `npm run type-check` passed with zero errors

   - **ESLint Errors (100+ errors in backend)**:
     - Error: require() imports not allowed in backend CommonJS files
       - Fix: Excluded backend/** from ESLint config
     - Result: ESLint now only checks frontend TypeScript files

   - **ERR_CONNECTION_REFUSED (Current Issue)**:
     - Error: POST http://localhost:3001/api/auth/sso net::ERR_CONNECTION_REFUSED
     - Root cause: Backend server not starting
     - Reason: JWT_REFRESH_SECRET in .env.local has placeholder value
     - Backend validation prevents server start if secrets are not set
     - Status: Identified but not yet fixed

5. Problem Solving:
   - **Security Vulnerabilities**: Fixed all 5 high-priority security issues including password hashing, JWT secret enforcement, path traversal prevention, and file upload validation
   - **TypeScript Type Safety**: Resolved all type errors through interface updates and type assertions
   - **Rate Limiting**: Implemented comprehensive rate limiting strategy to prevent various types of attacks
   - **Token Management**: Created token blacklist system to immediately invalidate logout tokens
   - **User Experience**: Replaced intrusive alert() with elegant toast notifications
   - **Code Quality**: Configured ESLint with appropriate rules and exclusions
   - **Current Troubleshooting**: Backend server not starting due to placeholder JWT_REFRESH_SECRET value in .env.local

6. All User Messages:
   - "next.js 기반 최신 어플리케이션을 claude code 를 통해 만들었다. 전체 구조를 분석하여 개선할 부분이 없는지 점검하라."
   - "아래 사항을 개선해 줘. [Listed 5 high-priority issues]"
   - "아래 사항을 개선해 줘. [Listed 5 medium-priority issues]"
   - "아래 오류의 원인을 파악하여 해결하라. [Provided ERR_CONNECTION_REFUSED error log]"

7. Pending Tasks:
   - Fix .env.local JWT_REFRESH_SECRET placeholder value to enable backend server startup
   - Generate proper JWT_REFRESH_SECRET using crypto.randomBytes()
   - Test SSO login functionality after backend starts
   - Verify all rate limiting is working correctly
   - Verify token blacklist functionality

8. Current Work:
   I was troubleshooting the ERR_CONNECTION_REFUSED error that occurs when attempting SSO login. The error log showed:
   ```
   POST http://localhost:3001/api/auth/sso net::ERR_CONNECTION_REFUSED
   SSO login error: AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK'...}
   ```

   I identified that the backend server is not running because of the JWT secret validation I added. I checked `.env.local` and discovered:
   ```env
   JWT_SECRET=<REDACTED>
   JWT_REFRESH_SECRET=<REDACTED>  # ← This is the problem
   ```

   The `JWT_REFRESH_SECRET` still has the placeholder value, which causes the backend server to exit during startup due to the validation code in `backend/utils/jwt.js`:
   ```javascript
   if (!process.env.JWT_REFRESH_SECRET) {
     console.error('FATAL ERROR: JWT_REFRESH_SECRET is not defined');
     process.exit(1);
   }
   ```

   However, the validation only checks if the variable exists, not if it's a placeholder. The actual issue is likely that the backend server hasn't been restarted after the recent changes, or the .env.local file needs a proper JWT_REFRESH_SECRET value.

9. Optional Next Step:
   Generate a secure JWT_REFRESH_SECRET and update the .env.local file, then restart the backend server to resolve the ERR_CONNECTION_REFUSED error.

   User's exact request: "아래 오류의 원인을 파악하여 해결하라." (Identify the cause of the error below and resolve it.)

   The next step is to:
   1. Generate a secure JWT_REFRESH_SECRET using Node.js crypto
   2. Update .env.local with the generated secret
   3. Restart the backend server (`npm run dev:backend` or `npm run dev`)
   4. Verify the SSO login works without connection errors.
Please continue the conversation from where we left it off without asking the user any further questions. Continue with the last task that you were asked to work on.

### 🤖 Claude (오전 1:15:14)

I'll now fix the issue by generating a secure JWT_REFRESH_SECRET and updating the .env.local file, then restart the backend server.

### 👤 사용자 (오전 1:15:48)



### 👤 사용자 (오전 1:15:55)



### 👤 사용자 (오전 1:16:04)



### 🤖 Claude (오전 1:16:12)

Good! I can see the JWT_REFRESH_SECRET has already been updated with a secure value. Now let me check if the backend server is running and restart the development servers:

### 👤 사용자 (오전 1:16:25)



### 👤 사용자 (오전 1:16:28)



### 🤖 Claude (오전 1:16:35)

The frontend is running on port 3000, but the backend server on port 3001 is not running. Let me check the package.json scripts and start the backend server:

### 👤 사용자 (오전 1:16:39)



### 🤖 Claude (오전 1:16:46)

I'll kill the current frontend server and restart both frontend and backend together using the `dev` script:

### 👤 사용자 (오전 1:16:56)



### 👤 사용자 (오전 1:17:11)



### 🤖 Claude (오전 1:17:16)

Let me check the current process status again:

### 👤 사용자 (오전 1:17:20)



### 👤 사용자 (오전 1:17:25)



### 🤖 Claude (오전 1:17:32)

Good! Both servers are stopped. Now I'll start both frontend and backend servers together:

### 👤 사용자 (오전 1:17:39)



### 🤖 Claude (오전 1:17:44)

Let me check the server startup output:

### 👤 사용자 (오전 1:17:44)



### 👤 사용자 (오전 1:17:50)



### 🤖 Claude (오전 1:17:57)

I see the issue! The backend server can't access the environment variables from .env.local because it's a separate Node.js process. Let me check the backend server configuration:

### 👤 사용자 (오전 1:18:02)



### 🤖 Claude (오전 1:18:09)

The backend server doesn't load environment variables from .env.local. I need to add dotenv configuration to load them. Let me first check if dotenv is installed:

### 👤 사용자 (오전 1:18:17)



### 👤 사용자 (오전 1:18:35)



### 🤖 Claude (오전 1:18:40)

Now I'll configure the backend server to load environment variables from .env.local:

### 👤 사용자 (오전 1:18:45)



### 👤 사용자 (오전 1:18:53)



### 👤 사용자 (오전 1:19:05)



### 🤖 Claude (오전 1:19:11)

Let me stop the dev server first before editing:

### 👤 사용자 (오전 1:19:11)



### 👤 사용자 (오전 1:19:20)



### 👤 사용자 (오전 1:19:29)



### 👤 사용자 (오전 1:19:39)



### 👤 사용자 (오전 1:19:55)



### 🤖 Claude (오전 1:20:00)

Now let me edit the server.js file:

### 👤 사용자 (오전 1:20:04)



### 🤖 Claude (오전 1:20:10)

Let me try a different approach and write the complete updated file:

### 👤 사용자 (오전 1:20:15)



### 👤 사용자 (오전 1:20:24)



### 👤 사용자 (오전 1:20:34)



### 👤 사용자 (오전 1:20:44)



### 🤖 Claude (오전 1:20:52)

Let me check what validation the jwt.js file is doing:

### 👤 사용자 (오전 1:20:56)



### 🤖 Claude (오전 1:21:06)

I see the issue. The backend server doesn't automatically load .env.local. Let me update the package.json script to load environment variables when starting the backend:

### 👤 사용자 (오전 1:21:10)



### 👤 사용자 (오전 1:21:18)



### 👤 사용자 (오전 1:21:28)



### 🤖 Claude (오전 1:21:35)

Let me try a simpler approach - create a `.env` file that dotenv will load automatically:

### 👤 사용자 (오전 1:21:43)



### 🤖 Claude (오전 1:21:48)

Now let me manually prepend the dotenv configuration to server.js using bash:

### 👤 사용자 (오전 1:22:09)



### 🤖 Claude (오전 1:22:14)

Let me verify the change:

### 👤 사용자 (오전 1:22:17)



### 🤖 Claude (오전 1:22:22)

Perfect! Now let me start the development servers:

### 👤 사용자 (오전 1:22:24)



### 🤖 Claude (오전 1:22:29)

Let me check the server startup output:

### 👤 사용자 (오전 1:22:30)



### 🤖 Claude (오전 1:22:36)

Excellent! The backend server is now running successfully. Let me check if the frontend has started too:

### 👤 사용자 (오전 1:22:36)



### 🤖 Claude (오전 1:22:41)

Perfect! Both servers are now running successfully:
- ✓ Backend server: http://localhost:3001
- ✓ Frontend server: http://localhost:3000

Let me verify the ports are listening:

### 👤 사용자 (오전 1:22:46)



### 👤 사용자 (오전 1:22:49)



### 🤖 Claude (오전 1:22:55)

Excellent! Both servers are now properly running and listening on their respective ports. Let me test the backend API to ensure it's responding:

### 👤 사용자 (오전 1:23:09)



### 🤖 Claude (오전 1:23:21)

Perfect! The issue has been resolved successfully. Here's what was causing the ERR_CONNECTION_REFUSED error and what I fixed:

## Problem Analysis
The backend server (port 3001) was failing to start because:
1. The backend Express server wasn't loading environment variables from `.env.local`
2. The JWT validation in `backend/utils/jwt.js` requires `JWT_SECRET` and `JWT_REFRESH_SECRET` to be set, otherwise it exits with error code 1
3. Without the backend running, the frontend couldn't connect to the API endpoints

## Solution Implemented
1. ✓ Installed `dotenv` package for environment variable loading
2. ✓ Created `.env` file with the necessary environment variables
3. ✓ Updated `backend/server.js` to load environment variables using `require('dotenv').config()`
4. ✓ Restarted both frontend and backend servers

## Current Status
Both servers are now running successfully:
- **Backend**: http://localhost:3001 (PID 9424) ✓
- **Frontend**: http://localhost:3000 (PID 28824) ✓
- **Health Check**: Verified backend is responding correctly

The ERR_CONNECTION_REFUSED error should now be resolved. You can test the SSO login functionality, and it should successfully connect to the backend API at `http://localhost:3001/api/auth/sso`.

