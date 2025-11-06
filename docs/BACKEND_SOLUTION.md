# Backend Solution for Vercel Deployment

## ✅ 문제 해결완료!

### 질문: "서버에서 기동시 backend를 어떻게 기동해야 하는가?"

**답변**: **더 이상 별도로 기동할 필요가 없습니다!**

## 🎯 해결 방법

Backend를 **Next.js API Routes**로 마이그레이션하여 Vercel Serverless Functions로 실행되도록 구현했습니다.

### 이전 (Express Backend)
```
❌ 별도 Express 서버 필요
❌ Railway/Render/Heroku 등 추가 배포 필요
❌ CORS 설정 필요
❌ 추가 비용 발생
```

### 현재 (Next.js API Routes)
```
✅ Vercel에서 자동 실행
✅ 단일 배포로 완료
✅ CORS 문제 없음
✅ 비용 효율적
```

## 📂 구현된 API Routes

### Authentication
- `POST /api/auth/login` - 로그인
- `POST /api/auth/verify-mfa` - MFA 검증
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/logout` - 로그아웃

### Menu Management
- `GET /api/menu` - 메뉴 목록
- `POST /api/menu` - 메뉴 생성
- `PUT /api/menu` - 메뉴 수정
- `DELETE /api/menu` - 메뉴 삭제

### User Management
- `GET /api/user` - 사용자 목록 (필터링/페이지네이션)
- `POST /api/user` - 사용자 생성
- `PUT /api/user` - 사용자 수정
- `DELETE /api/user` - 사용자 삭제

## 🚀 작동 방식

### Vercel에서
```
https://your-app.vercel.app/          → Frontend (Next.js)
https://your-app.vercel.app/api/*     → Backend (Serverless Functions)
```

### 로컬에서
```
http://localhost:3000/                → Frontend (Next.js)
http://localhost:3000/api/*           → Backend (Next.js API Routes)
```

모든 것이 **하나의 Next.js 애플리케이션**으로 실행됩니다!

## 📦 파일 구조

```
src/
├── app/
│   ├── api/                          ← Backend API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts        ← POST /api/auth/login
│   │   │   ├── verify-mfa/route.ts   ← POST /api/auth/verify-mfa
│   │   │   ├── refresh/route.ts      ← POST /api/auth/refresh
│   │   │   └── logout/route.ts       ← POST /api/auth/logout
│   │   ├── menu/route.ts             ← CRUD /api/menu
│   │   └── user/route.ts             ← CRUD /api/user
│   └── [locale]/...                  ← Frontend Pages
└── lib/
    └── api/                          ← Backend Utilities
        ├── jwt.ts                    ← JWT 생성/검증
        ├── password.ts               ← 비밀번호 해싱
        └── fileUtils.ts              ← 데이터 파일 읽기/쓰기
```

## 🔐 보안 & 인증

- JWT Bearer Token 인증
- bcrypt 비밀번호 해싱
- Role-based access control (Admin/User)
- MFA 지원

## 💾 데이터 저장

### Development (로컬)
```
backend/data/
├── users.json
├── menus.json
└── mfaCodes.json
```

### Production (Vercel)
```
/tmp/data/
├── users.json
├── menus.json
└── mfaCodes.json
```

⚠️ **참고**: Vercel의 `/tmp`는 임시 스토리지입니다. 프로덕션에서는 데이터베이스 사용을 권장합니다.

## 📋 환경 변수

Vercel Dashboard에서 설정:

```bash
# API 엔드포인트 (상대 경로 사용)
NEXT_PUBLIC_API_URL=/api

# JWT Secrets
JWT_SECRET=<your-secure-secret>
JWT_REFRESH_SECRET=<your-secure-refresh-secret>

# Session
SESSION_TIMEOUT=1800000
SESSION_WARNING_TIME=120000
```

## 🧪 로컬 테스트

```bash
# 1. 환경 변수 설정 (.env.local)
NEXT_PUBLIC_API_URL=/api
JWT_SECRET=your-dev-secret
JWT_REFRESH_SECRET=your-dev-refresh-secret

# 2. 개발 서버 시작
npm run dev

# 3. API 테스트
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## ✅ 빌드 확인

```bash
npm run build
```

빌드 결과:
```
✓ Generating static pages (38/38) in 7.2s

Route (app)
...
├ ƒ /api/auth/login          ← API Route (Serverless)
├ ƒ /api/auth/logout         ← API Route (Serverless)
├ ƒ /api/auth/refresh        ← API Route (Serverless)
├ ƒ /api/auth/verify-mfa     ← API Route (Serverless)
├ ƒ /api/menu                ← API Route (Serverless)
└ ƒ /api/user                ← API Route (Serverless)
```

## 🎯 배포 단계

1. **코드 푸시**
   ```bash
   git add .
   git commit -m "feat: Add Next.js API Routes backend"
   git push origin main
   ```

2. **Vercel 설정**
   - Import from GitHub
   - 환경 변수 설정
   - Deploy

3. **완료!**
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-app.vercel.app/api/*`
   - 모두 자동으로 작동합니다!

## 📚 관련 문서

- **[BACKEND_API_ROUTES.md](./BACKEND_API_ROUTES.md)** - API 엔드포인트 상세 문서
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel 배포 가이드
- **[DEPLOY_SUMMARY.md](./DEPLOY_SUMMARY.md)** - 배포 요약

## 🔄 마이그레이션 완료

| 항목 | Express Backend | Next.js API Routes |
|------|----------------|-------------------|
| 배포 방법 | 별도 서버 필요 | Vercel 통합 배포 |
| 인증 | ✅ JWT | ✅ JWT |
| 사용자 관리 | ✅ CRUD | ✅ CRUD |
| 메뉴 관리 | ✅ CRUD | ✅ CRUD |
| MFA | ✅ 지원 | ✅ 지원 |
| 파일 업로드 | ⚠️ 별도 구현 | ⚠️ 별도 구현 필요 |
| 로깅 | ✅ 지원 | ⏳ TODO |

## 💡 장점

1. **단순성**: 하나의 애플리케이션으로 통합
2. **비용**: Vercel의 관대한 무료 tier 사용
3. **성능**: Edge Network를 통한 빠른 응답
4. **확장성**: 자동 스케일링
5. **보안**: HTTPS 기본 제공
6. **CORS**: 동일 도메인, 문제 없음

## ⚠️ 제한사항

1. **실행 시간**: Serverless 함수는 최대 10-60초
2. **메모리**: 1024-3008MB 제한
3. **파일 시스템**: 읽기 전용 (쓰기는 /tmp만 가능)
4. **데이터**: /tmp는 영구 저장소가 아님

## 🎓 프로덕션 권장사항

장기 운영을 위해서는:

1. **데이터베이스 연결**
   - Vercel Postgres
   - MongoDB Atlas
   - Supabase

2. **파일 저장소**
   - Vercel Blob
   - AWS S3
   - Cloudinary

3. **로깅 & 모니터링**
   - Vercel Analytics
   - Sentry
   - LogRocket

## 🎉 결론

✅ **Backend가 Vercel에서 자동으로 실행됩니다!**

별도의 서버 설정이나 배포가 필요 없습니다.
Git에 푸시하고 Vercel에서 Import하면 끝입니다!
