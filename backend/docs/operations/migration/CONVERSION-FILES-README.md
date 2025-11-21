# PostgreSQL Conversion - New Route Files

이 디렉토리에는 PostgreSQL로 변환된 새로운 라우트 파일들이 `.NEW` 확장자로 저장되어 있습니다.

## 파일 교체 방법

각 파일을 적용하려면:

1. **백업 생성** (중요!)
   ```bash
   cp backend/routes/user.js backend/routes/user.js.backup
   ```

2. **새 파일로 교체**
   ```bash
   cp backend/routes/user.js.NEW backend/routes/user.js
   ```

3. **또는 Windows에서**
   ```cmd
   copy backend\routes\user.js backend\routes\user.js.backup
   copy backend\routes\user.js.NEW backend\routes\user.js
   ```

## 변환된 파일 목록

### ✅ 완전 변환 완료
- `auth.js` - 인증 라우트 (이미 적용됨)
- `role.js` - 역할 관리 (이미 적용됨)
- `user.js.NEW` - 사용자 관리 (교체 필요)

### 🔄 곧 제공 예정
- `menu.js.NEW`
- `program.js.NEW`
- `department.js.NEW`
- `code.js.NEW`
- `codeType.js.NEW`
- `message.js.NEW`
- `help.js.NEW`
- `log.js.NEW`
- `userRoleMapping.js.NEW`
- `roleMenuMapping.js.NEW`
- `roleProgramMapping.js.NEW`
- `userSettings.js.NEW`

## 주요 변경 사항

### 1. 서비스 레이어 사용
**이전:**
```javascript
const users = await readJSON(USERS_FILE);
```

**이후:**
```javascript
const users = await userService.getAllUsers(options);
```

### 2. 필드명 변환 (DB snake_case ↔ API camelCase)
- `first_name` ↔ `firstName`
- `last_name` ↔ `lastName`
- `mfa_enabled` ↔ `mfaEnabled`
- `profile_image` ↔ `profileImage`
- `created_at` ↔ `createdAt`

### 3. 비밀번호 제거
DB에서 가져온 사용자 객체에서 password 필드를 응답 전에 제거

### 4. UUID 생성
```javascript
const { v4: uuidv4 } = require('uuid');
const id = uuidv4(); // 대신 이전의 user-001 형식
```

## 변환 후 테스트

각 라우트 변환 후 다음을 테스트하세요:

1. **GET 요청** - 데이터 조회
2. **POST 요청** - 새 데이터 생성
3. **PUT 요청** - 데이터 업데이트
4. **DELETE 요청** - 데이터 삭제
5. **검색/필터링** - 쿼리 파라미터 테스트
6. **페이지네이션** - page, limit 파라미터

## DB 연결 확인

변환된 파일을 사용하기 전에 DB 연결이 설정되어 있는지 확인:

```javascript
// backend/server.js에 추가 필요
const db = require('./config/database');

// 서버 시작 전에 DB 연결 테스트
db.testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
```

## 문제 해결

### 연결 오류
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ PostgreSQL 서비스가 실행 중인지 확인

### 테이블 없음 오류
```
Error: relation "users" does not exist
```
→ migration/schema.sql을 실행했는지 확인

### 데이터 없음
```
Empty result set
```
→ migration/migrate.js를 실행하여 데이터를 마이그레이션했는지 확인
