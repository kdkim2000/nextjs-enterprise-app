# 데이터베이스 설정 가이드 (초보자용)

이 문서는 CoreNext Enterprise Application의 데이터베이스를 처음부터 설정하는 방법을 설명합니다.
컴퓨터에 익숙하지 않은 분도 따라할 수 있도록 아주 쉽게 작성되었습니다.

---

## 지원 데이터베이스

| 데이터베이스 | 버전 | 스키마 파일 | 데이터 로드 |
|-------------|------|------------|------------|
| **PostgreSQL** | 14+ | `original-schema.sql` | `psql -f` 직접 실행 |
| **MySQL/MariaDB** | 8.0+ / 10.5+ | `original-schema-mysql.sql` | `load-mysql-data.js` |
| **Oracle** | 19c+ | `original-schema-oracle.sql` | `load-oracle-data.js` |

---

## 목차

1. [사전 준비물](#1-사전-준비물)
2. [PostgreSQL 설치](#2-postgresql-설치)
3. [데이터베이스 생성](#3-데이터베이스-생성)
4. [테이블 생성 (스키마 적용)](#4-테이블-생성-스키마-적용)
5. [데이터 입력](#5-데이터-입력)
6. [설치 확인](#6-설치-확인)
7. [문제 해결](#7-문제-해결)
8. [초기화 스크립트 사용](#초기화-스크립트-사용)
9. [MySQL/MariaDB 설정](#mysqlmariadb-데이터베이스-설정)
10. [Oracle 설정](#oracle-데이터베이스-설정)

---

## 1. 사전 준비물

시작하기 전에 다음이 필요합니다:

- **컴퓨터**: Windows, Mac, 또는 Linux
- **인터넷 연결**: PostgreSQL 다운로드용
- **관리자 권한**: 프로그램 설치를 위해 필요

---

## 2. PostgreSQL 설치

### Windows 사용자

1. **다운로드 페이지 접속**
   - 웹 브라우저에서 https://www.postgresql.org/download/windows/ 로 이동
   - "Download the installer" 버튼 클릭

2. **설치 파일 다운로드**
   - 최신 버전 (예: PostgreSQL 16.x) 선택
   - Windows x86-64 다운로드

3. **설치 진행**
   - 다운로드된 파일 실행 (예: postgresql-16.x-windows-x64.exe)
   - "Next" 버튼을 계속 클릭
   - **중요!** 비밀번호 설정 화면에서:
     - 비밀번호를 입력하고 **반드시 기억**하세요
     - 예: `MyPassword123`
   - 포트는 기본값 `5432` 그대로 두세요
   - 설치 완료까지 "Next" → "Finish"

4. **설치 확인**
   - 시작 메뉴에서 "SQL Shell (psql)" 검색
   - 실행하면 검은 창이 뜹니다
   - 엔터를 여러 번 눌러 기본값 선택
   - 비밀번호 입력 후 `postgres=#` 가 보이면 성공!

### Mac 사용자

1. **Homebrew로 설치** (터미널에서 실행)
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```

2. **설치 확인**
   ```bash
   psql postgres
   ```
   `postgres=#` 프롬프트가 보이면 성공!

---

## 3. 데이터베이스 생성

### 방법 A: 명령어로 생성 (권장)

1. **명령 프롬프트 또는 터미널 열기**
   - Windows: 시작 메뉴에서 "cmd" 검색 후 실행
   - Mac: Spotlight에서 "터미널" 검색 후 실행

2. **아래 명령어 복사해서 붙여넣기**

   ```bash
   psql -U postgres -c "CREATE USER corenext WITH PASSWORD '<YOUR_PASSWORD>';"
   psql -U postgres -c "CREATE DATABASE corenextdb OWNER corenext ENCODING 'UTF8';"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE corenextdb TO corenext;"
   ```

   > **참고**: 비밀번호를 묻는 경우, PostgreSQL 설치 시 설정한 비밀번호를 입력하세요.

### 방법 B: pgAdmin 사용 (GUI 방식)

1. **pgAdmin 실행**
   - 시작 메뉴에서 "pgAdmin 4" 검색 후 실행
   - 웹 브라우저가 열리며 관리 화면이 나타남

2. **새 사용자 생성**
   - 왼쪽 트리에서 "Servers" → "PostgreSQL" 클릭
   - 비밀번호 입력
   - "Login/Group Roles" 우클릭 → "Create" → "Login/Group Role"
   - General 탭: Name에 `corenext` 입력
   - Definition 탭: Password에 `<YOUR_PASSWORD>` 입력
   - Privileges 탭: "Can login?" 을 Yes로 변경
   - "Save" 클릭

3. **새 데이터베이스 생성**
   - "Databases" 우클릭 → "Create" → "Database"
   - Database: `corenextdb`
   - Owner: `corenext` 선택
   - "Save" 클릭

---

## 4. 테이블 생성 (스키마 적용)

테이블은 데이터를 저장하는 구조입니다. 미리 만들어진 스키마 파일을 적용합니다.

### 명령 프롬프트/터미널에서 실행

1. **프로젝트 폴더로 이동**
   ```bash
   cd E:\apps\nextjs-enterprise-app
   ```
   (Mac/Linux의 경우 경로가 다를 수 있습니다)

2. **스키마 적용 명령어 실행**
   ```bash
   psql -h localhost -p 5432 -U corenext -d corenextdb -f database/scripts/original-schema.sql
   ```

3. **비밀번호 입력**
   - `Password for user corenext:` 가 나오면
   - `<YOUR_PASSWORD>` 입력 후 엔터

4. **성공 확인**
   - 여러 줄의 `CREATE TABLE`, `CREATE INDEX` 메시지가 나오면 성공!

---

## 5. 데이터 입력

테이블이 만들어졌으면, 이제 기본 데이터를 넣어야 합니다.
데이터는 3개의 파일로 나뉘어 있습니다.

### 5.1 마스터 데이터 입력 (필수)

부서, 역할, 메뉴, 코드 등 시스템 기본 설정 데이터입니다.

```bash
psql -h localhost -p 5432 -U corenext -d corenextdb -f database/scripts/master-data.sql
```

### 5.2 콘텐츠 데이터 입력 (선택)

게시글, 댓글, 첨부파일 등의 샘플 데이터입니다.

```bash
psql -h localhost -p 5432 -U corenext -d corenextdb -f database/scripts/content-data.sql
```

### 5.3 커뮤니케이션 데이터 입력 (선택)

대화, 메일, 메시지 등의 샘플 데이터입니다.

```bash
psql -h localhost -p 5432 -U corenext -d corenextdb -f database/scripts/comm-data.sql
```

> **참고**: 각 명령어마다 비밀번호 `<YOUR_PASSWORD>`를 입력해야 합니다.

---

## 6. 설치 확인

모든 것이 제대로 설치되었는지 확인해봅시다.

### 테이블 목록 확인

```bash
psql -h localhost -p 5432 -U corenext -d corenextdb -c "\dt"
```

아래와 비슷한 목록이 나오면 성공입니다:

```
              List of relations
 Schema |         Name          | Type  |  Owner
--------+-----------------------+-------+----------
 public | answer_helpful        | table | corenext
 public | app_settings          | table | corenext
 public | attachment_files      | table | corenext
 public | attachment_types      | table | corenext
 public | attachments           | table | corenext
 public | board_types           | table | corenext
 public | code_types            | table | corenext
 public | codes                 | table | corenext
 public | comment_likes         | table | corenext
 public | comments              | table | corenext
 ... (총 35개 테이블)
```

### 데이터 확인

```bash
psql -h localhost -p 5432 -U corenext -d corenextdb -c "SELECT COUNT(*) FROM users;"
```

숫자가 나오면 데이터가 정상적으로 들어간 것입니다.

---

## 7. 문제 해결

### "connection refused" 오류

PostgreSQL 서비스가 실행 중이 아닙니다.

**Windows 해결방법:**
1. `Win + R` 키 누르기
2. `services.msc` 입력 후 엔터
3. "postgresql-x64-16" 서비스 찾기
4. 우클릭 → "시작"

**Mac 해결방법:**
```bash
brew services start postgresql@16
```

### "authentication failed" 오류

비밀번호가 틀렸습니다.
- corenext 사용자의 비밀번호가 `<YOUR_PASSWORD>`인지 확인
- 대소문자 구분에 주의하세요

### "database does not exist" 오류

데이터베이스가 생성되지 않았습니다.
- [3. 데이터베이스 생성](#3-데이터베이스-생성) 단계를 다시 진행하세요

### "permission denied" 오류

권한이 부족합니다. 다음 명령어로 권한을 부여하세요:

```bash
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE corenextdb TO corenext;"
psql -U postgres -d corenextdb -c "GRANT ALL ON SCHEMA public TO corenext;"
```

### 한글이 깨지는 경우

인코딩 문제입니다. 데이터베이스를 UTF-8로 다시 생성하세요:

```bash
psql -U postgres -c "DROP DATABASE corenextdb;"
psql -U postgres -c "CREATE DATABASE corenextdb OWNER corenext ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8' TEMPLATE template0;"
```

---

## 빠른 설치 (한 번에 실행)

모든 과정을 한 번에 실행하고 싶다면, 아래 스크립트를 사용하세요.

### Windows (PowerShell)

```powershell
# 프로젝트 폴더로 이동
cd E:\apps\nextjs-enterprise-app

# 환경변수 설정
$env:PGPASSWORD = "PostgreSQL설치시설정한비밀번호"

# 사용자 및 데이터베이스 생성
psql -U postgres -c "CREATE USER corenext WITH PASSWORD '<YOUR_PASSWORD>';"
psql -U postgres -c "CREATE DATABASE corenextdb OWNER corenext ENCODING 'UTF8';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE corenextdb TO corenext;"

# 환경변수 변경 (corenext 사용자용)
$env:PGPASSWORD = "<YOUR_PASSWORD>"

# 스키마 및 데이터 적용
psql -h localhost -U corenext -d corenextdb -f database/scripts/original-schema.sql
psql -h localhost -U corenext -d corenextdb -f database/scripts/master-data.sql
psql -h localhost -U corenext -d corenextdb -f database/scripts/content-data.sql
psql -h localhost -U corenext -d corenextdb -f database/scripts/comm-data.sql

# 확인
psql -h localhost -U corenext -d corenextdb -c "\dt"
```

### Mac/Linux (Bash)

```bash
# 프로젝트 폴더로 이동
cd /path/to/nextjs-enterprise-app

# 사용자 및 데이터베이스 생성
sudo -u postgres psql -c "CREATE USER corenext WITH PASSWORD '<YOUR_PASSWORD>';"
sudo -u postgres psql -c "CREATE DATABASE corenextdb OWNER corenext ENCODING 'UTF8';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE corenextdb TO corenext;"

# 환경변수 설정
export PGPASSWORD="<YOUR_PASSWORD>"

# 스키마 및 데이터 적용
psql -h localhost -U corenext -d corenextdb -f database/scripts/original-schema.sql
psql -h localhost -U corenext -d corenextdb -f database/scripts/master-data.sql
psql -h localhost -U corenext -d corenextdb -f database/scripts/content-data.sql
psql -h localhost -U corenext -d corenextdb -f database/scripts/comm-data.sql

# 확인
psql -h localhost -U corenext -d corenextdb -c "\dt"
```

---

## 애플리케이션 설정

데이터베이스 설치 후, 애플리케이션의 환경변수를 설정해야 합니다.

프로젝트 루트에 `.env.local` 파일을 만들고 다음 내용을 입력하세요:

```env
# 데이터베이스 설정
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=corenextdb
DB_USER=corenext
DB_PASSWORD=<YOUR_PASSWORD>
```

---

## 초기화 스크립트 사용

데이터베이스 초기화를 자동으로 수행하는 스크립트가 제공됩니다.
스키마 생성과 데이터 로드를 한 번에 처리합니다.

### 스크립트 위치

- **Linux/Mac**: `database/scripts/init-db.sh`
- **Windows**: `database/scripts/init-db.bat`

### 사용법

```bash
# 기본 사용법
./database/scripts/init-db.sh [OPTIONS]

# 옵션
  -t, --type TYPE   데이터베이스 타입: postgres (기본), mysql, oracle
  -s, --sample      콘텐츠 샘플 데이터 포함
  -c, --comm        커뮤니케이션 샘플 데이터 포함
  -h, --help        도움말 표시
```

### 예제

```bash
# PostgreSQL (기본)
DB_PASSWORD=<YOUR_PASSWORD> ./database/scripts/init-db.sh

# PostgreSQL + 샘플 데이터 포함
DB_PASSWORD=<YOUR_PASSWORD> ./database/scripts/init-db.sh -s -c

# MySQL/MariaDB
DB_PASSWORD=<YOUR_PASSWORD> ./database/scripts/init-db.sh -t mysql

# Oracle
DB_PASSWORD=<YOUR_PASSWORD> DB_SERVICE=ORCL ./database/scripts/init-db.sh -t oracle
```

### Windows에서 사용

```cmd
REM 환경변수 설정
set DB_PASSWORD=<YOUR_PASSWORD>
set DB_TYPE=postgres

REM 스크립트 실행
database\scripts\init-db.bat

REM MySQL로 실행
set DB_TYPE=mysql
database\scripts\init-db.bat

REM 샘플 데이터 포함
set INCLUDE_SAMPLE=true
set INCLUDE_COMM=true
database\scripts\init-db.bat
```

### 환경변수 목록

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DB_TYPE` | 데이터베이스 타입 | `postgres` |
| `DB_HOST` | 호스트 주소 | `localhost` |
| `DB_PORT` | 포트 번호 | DB별 기본값 |
| `DB_NAME` | 데이터베이스 이름 | `corenextdb` |
| `DB_USER` | 사용자 이름 | `corenext` |
| `DB_PASSWORD` | 비밀번호 | (필수) |
| `DB_SERVICE` | Oracle 서비스명 | `ORCL` |
| `INCLUDE_SAMPLE` | 콘텐츠 데이터 포함 | `false` |
| `INCLUDE_COMM` | 커뮤니케이션 데이터 포함 | `false` |

---

## MySQL/MariaDB 데이터베이스 설정

PostgreSQL 대신 MySQL 또는 MariaDB를 사용하는 경우 아래 가이드를 따르세요.

### MySQL 사전 준비

1. **MySQL 설치** (8.0 이상 권장) 또는 **MariaDB 설치** (10.5 이상 권장)
2. **mysql 클라이언트** 설치
3. **Node.js** 설치 (데이터 로드 스크립트 실행용)

### MySQL 사용자 및 데이터베이스 생성

```sql
-- root 계정으로 접속
mysql -u root -p

-- 사용자 생성
CREATE USER 'corenext'@'localhost' IDENTIFIED BY '<YOUR_PASSWORD>';
CREATE USER 'corenext'@'%' IDENTIFIED BY '<YOUR_PASSWORD>';

-- 데이터베이스 생성
CREATE DATABASE corenextdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 권한 부여
GRANT ALL PRIVILEGES ON corenextdb.* TO 'corenext'@'localhost';
GRANT ALL PRIVILEGES ON corenextdb.* TO 'corenext'@'%';
FLUSH PRIVILEGES;
```

### MySQL 스키마 적용

```bash
# 스키마 적용
mysql -h localhost -P 3306 -u corenext -p<YOUR_PASSWORD> corenextdb < database/scripts/original-schema-mysql.sql
```

### MySQL 데이터 입력

Node.js 스크립트를 사용하여 데이터를 로드합니다.

```bash
# mysql2 패키지 설치 (처음 한 번만)
npm install mysql2

# 마스터 데이터만 로드
node database/scripts/load-mysql-data.js --master

# 모든 데이터 로드
node database/scripts/load-mysql-data.js --all
```

### MySQL 초기화 스크립트 사용

```bash
# Linux/Mac
DB_PASSWORD=<YOUR_PASSWORD> ./database/scripts/init-db.sh -t mysql

# Windows
set DB_PASSWORD=<YOUR_PASSWORD>
set DB_TYPE=mysql
database\scripts\init-db.bat
```

### MySQL 환경변수 설정

`.env.local` 파일:

```env
# MySQL 데이터베이스 설정
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=corenextdb
DB_USER=corenext
DB_PASSWORD=<YOUR_PASSWORD>
```

---

## Oracle 데이터베이스 설정

PostgreSQL 대신 Oracle을 사용하는 경우 아래 가이드를 따르세요.

### Oracle 사전 준비

1. **Oracle Database 설치** (19c 이상 권장)
2. **SQL*Plus 클라이언트** 설치
3. **사용자 및 테이블스페이스 생성**

```sql
-- SYS 또는 SYSTEM 계정으로 접속
CREATE USER corenext IDENTIFIED BY "<YOUR_PASSWORD>"
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

GRANT CONNECT, RESOURCE TO corenext;
GRANT CREATE VIEW TO corenext;
GRANT CREATE SEQUENCE TO corenext;
```

### Oracle 스키마 적용

```bash
# 환경변수 설정
export DB_TYPE=oracle
export DB_HOST=localhost
export DB_PORT=1521
export DB_SERVICE=ORCL
export DB_USER=corenext
export DB_PASSWORD="<YOUR_PASSWORD>"

# 스키마 적용
sqlplus $DB_USER/$DB_PASSWORD@//$DB_HOST:$DB_PORT/$DB_SERVICE @database/scripts/original-schema-oracle.sql
```

### Oracle 데이터 입력

Oracle은 PostgreSQL의 COPY 형식을 직접 지원하지 않으므로, Node.js 스크립트를 사용하여 데이터를 로드합니다.

```bash
# oracledb 패키지 설치 (처음 한 번만)
npm install oracledb

# 환경변수 설정
export DB_USER=corenext
export DB_PASSWORD="<YOUR_PASSWORD>"
export DB_CONNECT_STRING=localhost:1521/ORCL

# 마스터 데이터만 로드
node database/scripts/load-oracle-data.js --master

# 콘텐츠 데이터 포함
node database/scripts/load-oracle-data.js --master --content

# 모든 데이터 로드
node database/scripts/load-oracle-data.js --all
```

#### 데이터 로드 스크립트 옵션

| 옵션 | 설명 |
|------|------|
| `--master` | 마스터 데이터 (부서, 역할, 메뉴, 코드 등) - 기본값 |
| `--content` | 콘텐츠 데이터 (게시글, 댓글, 첨부파일) |
| `--comm` | 커뮤니케이션 데이터 (메일, 메시지) |
| `--all` | 모든 데이터 |
| `--help` | 도움말 |

### Oracle 초기화 스크립트 사용

```bash
# 스키마만 적용 (데이터 로드는 Node.js 스크립트로 별도 실행)
DB_PASSWORD=<YOUR_PASSWORD> DB_SERVICE=ORCL ./database/scripts/init-db.sh -t oracle
```

### Oracle 환경변수 설정

`.env.local` 파일:

```env
# Oracle 데이터베이스 설정
DB_TYPE=oracle
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE=ORCL
DB_USER=corenext
DB_PASSWORD=<YOUR_PASSWORD>
```

---

## 스크립트 파일 목록

`database/scripts/` 디렉토리에 있는 파일들입니다.

### 스키마 파일

| 파일 | 설명 |
|------|------|
| `original-schema.sql` | PostgreSQL 스키마 (35개 테이블) |
| `original-schema-mysql.sql` | MySQL/MariaDB 스키마 |
| `original-schema-oracle.sql` | Oracle 스키마 |

### 데이터 파일 (PostgreSQL COPY 형식)

| 파일 | 설명 |
|------|------|
| `master-data.sql` | 마스터 데이터 (부서, 역할, 메뉴, 코드, 관리자 계정) |
| `content-data.sql` | 콘텐츠 데이터 (게시글, 댓글, 첨부파일) |
| `comm-data.sql` | 커뮤니케이션 데이터 (메일, 메시지) |

### 초기화 스크립트

| 파일 | 설명 |
|------|------|
| `init-db.sh` | Linux/Mac용 초기화 스크립트 |
| `init-db.bat` | Windows용 초기화 스크립트 |

### 데이터 로드 스크립트 (Node.js)

| 파일 | 설명 | 필요 패키지 |
|------|------|------------|
| `load-mysql-data.js` | MySQL/MariaDB 데이터 로드 | `mysql2` |
| `load-oracle-data.js` | Oracle 데이터 로드 | `oracledb` |
| `apply-oracle-schema.js` | Oracle 스키마 적용 | `oracledb` |

---

## 도움이 필요하신가요?

- 프로젝트 저장소의 Issues 페이지에서 질문하세요
- 또는 팀 슬랙 채널에 문의하세요

---

*이 문서는 2025년 12월에 작성되었습니다.*
