# Database Migration Guide
## Local DB → Remote Server DB

### 현재 로컬 DB 정보
- **Database**: nextjs_enterprise_app
- **Host**: localhost:5432
- **User**: app_user / postgres
- **테이블 수**: 40개
- **DB 크기**: ~270 MB

---

## Step 1: 로컬 DB 백업 (Full Dump)

```bash
# 전체 덤프 (스키마 + 데이터)
PGPASSWORD='<postgres_password>' pg_dump -h localhost -U postgres -d nextjs_enterprise_app -F c -f backup_full.dump

# 또는 SQL 형식
PGPASSWORD='<postgres_password>' pg_dump -h localhost -U postgres -d nextjs_enterprise_app -f backup_full.sql
```

### 선택적 백업

```bash
# 스키마만 (테이블 구조)
PGPASSWORD='<postgres_password>' pg_dump -h localhost -U postgres -d nextjs_enterprise_app --schema-only -f schema.sql

# 데이터만
PGPASSWORD='<postgres_password>' pg_dump -h localhost -U postgres -d nextjs_enterprise_app --data-only -f data.sql

# 특정 테이블 제외 (예: logs 테이블)
PGPASSWORD='<postgres_password>' pg_dump -h localhost -U postgres -d nextjs_enterprise_app --exclude-table=logs -f backup_no_logs.sql
```

---

## Step 2: 원격 서버에 DB 생성

```bash
# 원격 서버에 접속
psql -h <REMOTE_HOST> -U postgres

# DB 및 사용자 생성
CREATE DATABASE nextjs_enterprise_app;
CREATE USER app_user WITH ENCRYPTED PASSWORD '<NEW_PASSWORD>';
GRANT ALL PRIVILEGES ON DATABASE nextjs_enterprise_app TO app_user;

# DB 소유자 변경 (선택)
ALTER DATABASE nextjs_enterprise_app OWNER TO app_user;
```

---

## Step 3: 덤프 파일 복원

```bash
# Custom format (.dump) 복원
PGPASSWORD='<remote_password>' pg_restore -h <REMOTE_HOST> -U postgres -d nextjs_enterprise_app backup_full.dump

# SQL format (.sql) 복원
PGPASSWORD='<remote_password>' psql -h <REMOTE_HOST> -U postgres -d nextjs_enterprise_app -f backup_full.sql
```

---

## Step 4: 테이블 권한 부여

```sql
-- app_user에게 모든 테이블 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT USAGE, CREATE ON SCHEMA public TO app_user;

-- 향후 생성될 테이블에도 권한 부여
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

---

## Step 5: 백엔드 환경변수 수정

### backend/.env
```env
# 기존 (로컬)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nextjs_enterprise_app
DB_USER=app_user
DB_PASSWORD=<YOUR_LOCAL_PASSWORD>

# 변경 (원격 서버)
DB_HOST=<REMOTE_HOST>
DB_PORT=5432
DB_NAME=nextjs_enterprise_app
DB_USER=app_user
DB_PASSWORD=<NEW_PASSWORD>
```

---

## Step 6: 마이그레이션 검증

```bash
# 원격 DB 연결 테스트
PGPASSWORD='<NEW_PASSWORD>' psql -h <REMOTE_HOST> -U app_user -d nextjs_enterprise_app -c "SELECT COUNT(*) FROM users;"

# 테이블 수 확인
PGPASSWORD='<NEW_PASSWORD>' psql -h <REMOTE_HOST> -U app_user -d nextjs_enterprise_app -c "
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
"

# 주요 테이블 row count 확인
PGPASSWORD='<NEW_PASSWORD>' psql -h <REMOTE_HOST> -U app_user -d nextjs_enterprise_app -c "
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL SELECT 'departments', COUNT(*) FROM departments
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'menus', COUNT(*) FROM menus
UNION ALL SELECT 'programs', COUNT(*) FROM programs;
"
```

---

## 주요 테이블 목록

| 테이블명 | 크기 | 설명 |
|---------|------|------|
| users | 123 MB | 사용자 정보 (~30,000건) |
| conversation_messages | 48 MB | Claude 대화 메시지 |
| mail_folders | 44 MB | 메일 폴더 |
| logs | 22 MB | 시스템 로그 |
| user_role_mappings | 17 MB | 사용자-역할 매핑 |
| posts | 4.5 MB | 게시물 |
| departments | 200 KB | 부서 |
| menus | 224 KB | 메뉴 |
| programs | 184 KB | 프로그램 |
| roles | ~50 KB | 역할 |
| role_program_mappings | ~100 KB | 역할-프로그램 매핑 |

---

## 이관 제외 검토 대상

대용량이거나 로컬 전용 데이터:
- `logs` (22MB) - 로컬 로그, 필요시 제외
- `conversation_messages` (48MB) - Claude 대화 기록, 필요시 제외
- `token_blacklist` - 세션 토큰, 이관 불필요

```bash
# logs, conversation_messages 제외 백업
pg_dump -h localhost -U postgres -d nextjs_enterprise_app \
  --exclude-table=logs \
  --exclude-table=conversation_messages \
  --exclude-table=token_blacklist \
  -f backup_essential.sql
```

---

## 롤백 계획

문제 발생시 로컬 DB로 복귀:
```env
# backend/.env를 원래 값으로 복원
DB_HOST=localhost
```
