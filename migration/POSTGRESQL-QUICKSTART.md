# PostgreSQL 마이그레이션 빠른 시작 가이드

이 가이드는 backend/data의 JSON 파일들을 PostgreSQL 데이터베이스로 마이그레이션하는 전체 과정을 안내합니다.

## 📋 목차

1. [개요](#개요)
2. [사전 준비사항](#사전-준비사항)
3. [PostgreSQL 설치](#postgresql-설치)
4. [데이터베이스 생성](#데이터베이스-생성)
5. [마이그레이션 실행](#마이그레이션-실행)
6. [검증](#검증)
7. [문제 해결](#문제-해결)

## 개요

### 주요 특징

✅ **FK 제약조건 없음** - CASCADE 등 외래키 제약조건 미포함 (요청사항 반영)
✅ **언어별 컬럼 분리** - name_en, name_ko, name_zh, name_vi로 각 언어별 컬럼 생성
✅ **마이그레이션 오류 최소화** - 안전한 데이터 변환 및 검증 로직 포함
✅ **Dry-Run 모드** - 실제 적용 전 테스트 가능
✅ **배치 처리** - 대용량 데이터 효율적 처리

### 마이그레이션 대상 파일 (17개)

1. codeTypes.json → code_types 테이블
2. codes.json → codes 테이블
3. departments.json → departments 테이블
4. roles.json → roles 테이블
5. users.json → users 테이블
6. messages.json → messages 테이블
7. menus.json → menus 테이블
8. programs.json → programs 테이블
9. help.json → help 테이블
10. permissions.json → permissions 테이블
11. userRoleMappings.json → user_role_mappings 테이블
12. roleMenuMappings.json → role_menu_mappings 테이블
13. roleProgramMappings.json → role_program_mappings 테이블
14. userPreferences.json → user_preferences 테이블
15. logs.json → logs 테이블
16. tokenBlacklist.json → token_blacklist 테이블
17. mfaCodes.json → mfa_codes 테이블

## 사전 준비사항

### 필수 소프트웨어

- **PostgreSQL 12 이상**
- **Node.js 14 이상**
- **npm**

### 시스템 요구사항

- **디스크 공간**: 최소 1GB (JSON 파일 크기의 2배 권장)
- **메모리**: 최소 2GB RAM
- **네트워크**: PostgreSQL 서버 접속 가능

## PostgreSQL 설치

### Windows

1. **PostgreSQL 다운로드**
   - https://www.postgresql.org/download/windows/
   - 또는 https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **설치 실행**
   ```
   - PostgreSQL 버전 선택 (12 이상 권장)
   - 포트: 5432 (기본값)
   - 슈퍼유저 비밀번호 설정 (기억해두세요!)
   - 로케일: Korean, Korea 또는 English, United States
   ```

3. **설치 확인**
   ```cmd
   psql --version
   ```

### macOS

```bash
# Homebrew 사용
brew install postgresql@14
brew services start postgresql@14

# 또는 Postgres.app 사용
# https://postgresapp.com/
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 데이터베이스 생성

### 1. PostgreSQL 접속

```bash
# Windows (PowerShell 또는 CMD)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

### 2. 데이터베이스 생성

```sql
-- 데이터베이스 생성
CREATE DATABASE enterprise_app
WITH
    ENCODING='UTF8'
    LC_COLLATE='en_US.UTF-8'
    LC_CTYPE='en_US.UTF-8'
    TEMPLATE=template0;

-- 연결 확인
\c enterprise_app

-- 종료
\q
```

### 3. 스키마 생성

```bash
# migration 디렉토리에서 실행
cd E:\apps\nextjs-enterprise-app\migration

# 스키마 적용
psql -U postgres -d enterprise_app -f schema.sql
```

성공하면 다음과 같은 메시지가 출력됩니다:
```
DROP TABLE
DROP TABLE
...
CREATE TABLE
CREATE TABLE
...
CREATE INDEX
...
COMMENT
```

## 마이그레이션 실행

### 1. 의존성 설치

```bash
cd E:\apps\nextjs-enterprise-app\migration
npm install
```

### 2. 설정 파일 생성

```bash
# 예제 파일 복사
copy migrate.config.json.example migrate.config.json

# 또는 직접 생성
notepad migrate.config.json
```

**migrate.config.json 내용:**
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "database": "enterprise_app",
    "user": "postgres",
    "password": "여기에_설치시_설정한_비밀번호"
  },
  "dataPath": "../backend/data"
}
```

### 3. Dry-Run 테스트 (권장)

먼저 실제 변경 없이 테스트:

```bash
# 전체 테스트
node migrate.js --dry-run --verbose

# 특정 테이블만 테스트
node migrate.js --dry-run --table users
```

출력 예시:
```
============================================================
Starting Data Migration from JSON to PostgreSQL
============================================================
⚠ DRY-RUN MODE: No actual database changes will be made
✓ Migrating code_types table...
✓ code_types: 15 succeeded, 0 failed
✓ Migrating codes table...
✓ codes: 124 succeeded, 0 failed
...
============================================================
Total: 50000 records migrated, 0 failed
Duration: 12.34s
============================================================
```

### 4. 실제 마이그레이션 실행

Dry-run이 성공하면 실제 마이그레이션 실행:

```bash
# 전체 마이그레이션
node migrate.js

# 또는 NPM 스크립트 사용
npm run migrate
```

### 5. 선택적 마이그레이션

특정 테이블만 마이그레이션:

```bash
# 코드 관련 테이블만
node migrate.js --table code_types
node migrate.js --table codes

# 사용자 관련 테이블만
node migrate.js --table users
node migrate.js --table roles
node migrate.js --table user_role_mappings

# 대용량 테이블 (배치 크기 조정)
node migrate.js --table logs --batch 5000
```

## 검증

### 1. 자동 검증 스크립트

```bash
node verify.js
```

출력 예시:
```
======================================================================
PostgreSQL Migration Verification
======================================================================

Checking data counts...
----------------------------------------------------------------------
Table                    JSON Count     DB Count       Status
----------------------------------------------------------------------
Code Types               15             15             ✓ OK
Codes                    124            124            ✓ OK
Departments              10             10             ✓ OK
Users                    5000           5000           ✓ OK
...
----------------------------------------------------------------------

Checking sample data quality...
----------------------------------------------------------------------
✓ Multi-language columns (departments):
  IT: en=true, ko=true, zh=true, vi=true
  HR: en=true, ko=true, zh=true, vi=true

✓ JSONB fields (codes):
  Found 45 codes with attributes

✓ User status:
  Active users: 4523

======================================================================
Verification Summary
======================================================================
Total tables checked: 15
✓ Matches: 15
✗ Mismatches: 0

🎉 Migration verification PASSED! All data counts match.
======================================================================
```

### 2. 수동 검증 쿼리

```bash
psql -U postgres -d enterprise_app
```

```sql
-- 레코드 수 확인
SELECT
  'code_types' as table_name, COUNT(*) FROM code_types
UNION ALL
SELECT 'codes', COUNT(*) FROM codes
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'menus', COUNT(*) FROM menus;

-- 다국어 컬럼 확인
SELECT id, code, name_en, name_ko, name_zh, name_vi
FROM departments
LIMIT 5;

-- JSONB 필드 확인
SELECT id, code, attributes
FROM codes
WHERE attributes IS NOT NULL
LIMIT 5;

-- 사용자 데이터 확인
SELECT id, username, email, role, department, status
FROM users
WHERE status = 'active'
LIMIT 10;

-- 메뉴 구조 확인
SELECT id, code, name_ko, path, parent_id, level
FROM menus
ORDER BY level, "order";

-- 인덱스 확인
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 문제 해결

### 연결 오류

**문제**: `connection refused` 또는 `password authentication failed`

**해결**:
```bash
# PostgreSQL 서비스 상태 확인 (Windows)
sc query postgresql-x64-14

# 서비스 시작
net start postgresql-x64-14

# 비밀번호 재설정 (psql에서)
ALTER USER postgres WITH PASSWORD '새비밀번호';
```

### 중복 키 오류

**문제**: `duplicate key value violates unique constraint`

**해결**: 기존 데이터 삭제 후 재실행
```sql
-- 모든 테이블 데이터 삭제 (스키마는 유지)
TRUNCATE TABLE
  logs, user_preferences, role_program_mappings, role_menu_mappings,
  user_role_mappings, permissions, help, programs, menus, messages,
  users, roles, departments, codes, code_types, token_blacklist, mfa_codes
CASCADE;
```

### 대용량 파일 처리

**문제**: logs.json, userRoleMappings.json 등 대용량 파일 처리 시 메모리 부족

**해결**:
```bash
# Node.js 메모리 증가
node --max-old-space-size=4096 migrate.js --table logs

# 배치 크기 조정
node migrate.js --table logs --batch 10000
```

### 문자 인코딩 오류

**문제**: 한글, 중국어, 베트남어 등이 깨짐

**해결**:
```sql
-- 데이터베이스 재생성 (UTF-8)
DROP DATABASE enterprise_app;
CREATE DATABASE enterprise_app
WITH ENCODING='UTF8'
LC_COLLATE='en_US.UTF-8'
LC_CTYPE='en_US.UTF-8';
```

### 마이그레이션 중단/재시작

**문제**: 마이그레이션 중 오류로 중단됨

**해결**:
```bash
# 특정 테이블부터 재시작
node migrate.js --table menus
node migrate.js --table programs
# ... (실패한 테이블부터 순차 실행)

# 또는 전체 롤백 후 재시작
```

## 성능 최적화

### 인덱스 비활성화 (선택사항)

매우 큰 데이터셋의 경우:

```sql
-- 마이그레이션 전: 인덱스 삭제
DROP INDEX IF EXISTS idx_codes_code_type;
DROP INDEX IF EXISTS idx_users_username;
-- ... 기타 인덱스

-- 마이그레이션 실행
-- node migrate.js

-- 마이그레이션 후: 인덱스 재생성
CREATE INDEX idx_codes_code_type ON codes(code_type);
CREATE INDEX idx_users_username ON users(username);
-- ... 기타 인덱스
```

### PostgreSQL 설정 조정

```sql
-- 마이그레이션 중 임시 설정 (psql에서)
SET maintenance_work_mem = '1GB';
SET max_wal_size = '4GB';
SET checkpoint_timeout = '30min';
```

## 백업 및 복구

### 백업

```bash
# 전체 데이터베이스 백업
pg_dump -U postgres -d enterprise_app -F c -f enterprise_app_backup.dump

# 스키마만 백업
pg_dump -U postgres -d enterprise_app -s -f schema_backup.sql

# 데이터만 백업
pg_dump -U postgres -d enterprise_app -a -f data_backup.sql
```

### 복구

```bash
# 전체 복구
pg_restore -U postgres -d enterprise_app -c enterprise_app_backup.dump

# SQL 파일 복구
psql -U postgres -d enterprise_app -f data_backup.sql
```

## 마이그레이션 완료 후

### 1. Backend 코드 수정

기존 JSON 파일 읽기/쓰기를 PostgreSQL 쿼리로 변경:

```javascript
// 기존 (JSON)
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

// 변경 (PostgreSQL)
const { Pool } = require('pg');
const pool = new Pool({ /* config */ });
const result = await pool.query('SELECT * FROM users');
const users = result.rows;
```

### 2. API 라우트 업데이트

각 API 엔드포인트를 데이터베이스 쿼리로 변경

### 3. 정기 백업 설정

cron 또는 Windows Task Scheduler로 자동 백업 설정

### 4. 모니터링 설정

PostgreSQL 성능 모니터링 및 로그 관리

## 참고 자료

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [pg Node.js 드라이버](https://node-postgres.com/)
- [PostgreSQL 튜닝 가이드](https://wiki.postgresql.org/wiki/Performance_Optimization)

## 지원

문제가 발생하면:

1. 로그 확인: `cat /var/log/postgresql/postgresql-14-main.log` (Linux)
2. 마이그레이션 로그 확인 (콘솔 출력)
3. `--verbose` 옵션으로 상세 로그 확인
4. `--dry-run`으로 테스트 반복

---

**마이그레이션 체크리스트**

- [ ] PostgreSQL 설치 완료
- [ ] 데이터베이스 생성 완료
- [ ] 스키마 적용 완료 (schema.sql)
- [ ] 의존성 설치 완료 (npm install)
- [ ] 설정 파일 생성 완료 (migrate.config.json)
- [ ] Dry-run 테스트 성공
- [ ] 실제 마이그레이션 실행 성공
- [ ] 검증 스크립트 실행 성공
- [ ] 데이터 샘플 확인 완료
- [ ] 백업 생성 완료
- [ ] Backend 코드 업데이트 시작

---

작성일: 2025-11-17
버전: 1.0
