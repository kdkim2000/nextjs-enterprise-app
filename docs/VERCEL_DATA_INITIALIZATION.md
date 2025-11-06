# Vercel 데이터 초기화 가이드

## ✅ 자동 초기화

Vercel 배포 시 데이터는 **자동으로 초기화**됩니다!

### 🎯 작동 방식

1. **첫 API 호출 시 자동 초기화**
   - 데이터 파일이 없으면 자동으로 기본 데이터 생성
   - `/tmp/data/` 디렉토리에 저장
   - 로그인 시도 시 자동으로 users.json 생성

2. **기본 제공 데이터**
   - Users (3명)
   - Menus (8개)
   - User Preferences (2개)
   - MFA Codes (빈 배열)
   - Logs (빈 배열)

---

## 📋 기본 제공 계정

### Admin 계정
- **Username**: `admin`
- **Password**: `<TEST_PASSWORD>`
- **Role**: admin
- **Department**: IT
- **MFA**: 비활성화 (배포 시)
- **SSO**: 활성화

### 일반 사용자 1
- **Username**: `john.doe`
- **Password**: `<TEST_PASSWORD>`
- **Role**: user
- **Department**: Sales

### 일반 사용자 2
- **Username**: `jane.smith`
- **Password**: `<TEST_PASSWORD>`
- **Role**: user
- **Department**: Engineering

---

## 🔄 수동 초기화 (Admin 전용)

필요한 경우 Admin이 수동으로 데이터를 초기화할 수 있습니다.

### API 엔드포인트

```bash
POST /api/admin/init-data
```

### 사용 방법

1. **Admin으로 로그인**
   ```bash
   curl https://your-app.vercel.app/api/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"<TEST_PASSWORD>"}'
   ```

2. **토큰 받기**
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {...}
   }
   ```

3. **데이터 초기화 실행**
   ```bash
   curl https://your-app.vercel.app/api/admin/init-data \
     -X POST \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

4. **응답**
   ```json
   {
     "message": "Data initialized successfully",
     "initialized": [
       "users.json",
       "menus.json",
       "userPreferences.json",
       "mfaCodes.json",
       "logs.json"
     ],
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

### ⚠️ 주의사항

- **모든 기존 데이터가 삭제됩니다!**
- Admin 권한이 필요합니다
- 프로덕션에서는 신중하게 사용하세요

---

## 🗂️ 데이터 파일 위치

### Development (로컬)
```
backend/data/
├── users.json
├── menus.json
├── userPreferences.json
├── mfaCodes.json
└── logs.json
```

### Production (Vercel)
```
/tmp/data/
├── users.json          ← 첫 로그인 시 자동 생성
├── menus.json          ← 첫 메뉴 조회 시 자동 생성
├── userPreferences.json
├── mfaCodes.json
└── logs.json
```

---

## 📊 자동 초기화 과정

### 1단계: 첫 로그인 시도
```
User -> POST /api/auth/login
         ↓
    users.json 없음?
         ↓
    자동으로 생성 (defaultUsers)
         ↓
    로그인 성공
```

### 2단계: 메뉴 로드
```
User -> GET /api/menu
         ↓
    menus.json 없음?
         ↓
    자동으로 생성 (defaultMenus)
         ↓
    메뉴 반환
```

### 3단계: 기타 데이터
- 필요할 때마다 자동으로 생성됩니다
- 기본값이 정의된 모든 파일에 적용됩니다

---

## 🔍 초기화 상태 확인

```bash
# Admin 토큰으로 상태 확인
curl https://your-app.vercel.app/api/admin/init-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**응답:**
```json
{
  "message": "Data initialization endpoint",
  "usage": {
    "method": "POST",
    "endpoint": "/api/admin/init-data",
    "description": "Reset all data to default values",
    "warning": "This will DELETE all existing data!",
    "requires": "Admin authentication"
  },
  "defaultData": {
    "users": 3,
    "menus": 8,
    "userPreferences": 2,
    "mfaCodes": 0,
    "logs": 0
  }
}
```

---

## 🛠️ 커스텀 초기 데이터

기본 데이터를 수정하려면:

1. **`src/lib/api/defaultData.ts` 수정**
   ```typescript
   export const defaultUsers = [
     {
       id: 'user-001',
       username: 'admin',
       password: '$2b$10$...', // bcrypt hash
       // ... 기타 필드
     },
     // 더 많은 사용자 추가
   ];
   ```

2. **재배포**
   ```bash
   git add src/lib/api/defaultData.ts
   git commit -m "Update default data"
   git push
   ```

3. **Vercel 자동 배포**
   - 다음 배포부터 새로운 기본 데이터 사용

---

## 🔐 비밀번호 해시 생성

새 사용자의 비밀번호 해시를 생성하려면:

```bash
# Node.js REPL에서
node
> const bcrypt = require('bcrypt');
> bcrypt.hashSync('your-password', 10);
'$2b$10$...'  // 이 값을 defaultData.ts에 사용
```

또는 온라인 도구:
- https://bcrypt-generator.com/

---

## 📝 초기 데이터 목록

### Users (3명)
| Username | Password | Role | Department |
|----------|----------|------|------------|
| admin | <TEST_PASSWORD> | admin | IT |
| john.doe | <TEST_PASSWORD> | user | Sales |
| jane.smith | <TEST_PASSWORD> | user | Engineering |

### Menus (8개)
1. Dashboard
2. Admin
3. ├─ User Management
4. └─ Menu Management
5. Reports
6. └─ Sales Report
7. Settings
8. Components (Dev)

---

## 🎓 베스트 프랙티스

### 첫 배포 후
1. ✅ 기본 admin 계정으로 로그인
2. ✅ 비밀번호 변경
3. ✅ 필요한 사용자 추가
4. ✅ 불필요한 기본 사용자 삭제

### 정기적인 백업
Vercel의 `/tmp`는 영구 저장소가 아니므로:
- 중요한 데이터는 데이터베이스 사용 권장
- 또는 정기적으로 데이터 export

### 프로덕션 권장사항
- **Vercel Postgres** 또는
- **MongoDB Atlas** 또는
- **Supabase** 사용

---

## 🔄 데이터베이스 마이그레이션

JSON 파일에서 실제 데이터베이스로 마이그레이션:

### 1. 데이터베이스 선택
```bash
# Vercel Postgres
vercel postgres create

# 또는 MongoDB Atlas
# https://www.mongodb.com/cloud/atlas
```

### 2. 스키마 정의
```sql
-- users 테이블
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50),
  ...
);
```

### 3. API 업데이트
```typescript
// fileUtils.ts 대신 DB 쿼리 사용
import { db } from '@/lib/db';

export async function getUsers() {
  return await db.users.findMany();
}
```

---

## 🐛 문제 해결

### 문제: 로그인이 안 됨
**원인**: users.json이 생성되지 않음

**해결:**
```bash
# 수동 초기화
curl https://your-app.vercel.app/api/admin/init-data \
  -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 문제: 메뉴가 표시되지 않음
**원인**: menus.json이 생성되지 않음

**해결:**
- 로그아웃 후 재로그인
- 또는 수동 초기화 실행

### 문제: 데이터가 사라짐
**원인**: Vercel Serverless Functions의 `/tmp`는 임시 저장소

**해결:**
- 데이터베이스 사용으로 마이그레이션
- 또는 Vercel KV (Redis) 사용

---

## 📚 관련 문서

- **[BACKEND_API_ROUTES.md](./BACKEND_API_ROUTES.md)** - API 엔드포인트 문서
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel 배포 가이드
- **[LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)** - 로컬 개발 가이드

---

## ✨ 요약

1. **자동 초기화**: 첫 API 호출 시 자동으로 데이터 생성
2. **기본 계정**: admin/<TEST_PASSWORD>으로 즉시 로그인 가능
3. **수동 초기화**: Admin이 `/api/admin/init-data` 사용 가능
4. **프로덕션**: 실제 데이터베이스 사용 권장

**Vercel에 배포하면 바로 사용 가능합니다!** 🚀
