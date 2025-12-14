# DB 스키마 관리 및 자동화 계획서

## 1. 개요

이 문서는 Enterprise Application의 데이터베이스 스키마 관리 및 자동화를 위한 계획을 정의합니다.
여러 사이트에 패키지로 배포할 수 있도록 DB 생성, 테이블 생성, 초기 데이터 적재를 자동화합니다.

### 1.1 의사결정 사항

| 항목 | 선택 | 근거 |
|------|------|------|
| **마이그레이션 도구** | Liquibase | PostgreSQL + Oracle 모두 지원, DB 독립적 |
| **초기 데이터 관리** | SQL 파일 | 직관적, DB 도구로 직접 실행 가능 |
| **멀티테넌시** | 단일 테넌트 | 사이트별 별도 DB 인스턴스, 격리 완벽 |
| **지원 DB** | PostgreSQL + Oracle | 엔터프라이즈 환경 대응 |

### 1.2 목표

- 신규 사이트 배포 시 DB 자동 초기화
- 버전별 스키마 마이그레이션 관리
- PostgreSQL/Oracle 동시 지원
- 롤백 가능한 마이그레이션 체계

---

## 2. 아키텍처

### 2.1 디렉토리 구조

```
database/
├── liquibase.properties              # 기본 설정
├── liquibase-postgres.properties     # PostgreSQL 설정
├── liquibase-oracle.properties       # Oracle 설정
├── changelog/
│   ├── changelog-master.xml          # 마스터 changelog
│   └── v1.0/
│       ├── 001-create-code-tables.xml
│       ├── 002-create-user-tables.xml
│       ├── 003-create-menu-tables.xml
│       ├── 004-create-content-tables.xml
│       ├── 005-create-communication-tables.xml
│       ├── 006-create-system-tables.xml
│       ├── 007-create-indexes.xml
│       ├── 008-load-required-seed.xml
│       └── 009-load-sample-seed.xml
├── seed/
│   ├── required/                     # 필수 초기 데이터
│   │   ├── 001-roles.sql
│   │   ├── 002-root-department.sql
│   │   ├── 003-admin-user.sql
│   │   ├── 004-code-types.sql
│   │   ├── 005-codes.sql
│   │   ├── 006-attachment-types.sql
│   │   └── 007-app-settings.sql
│   └── sample/                       # 샘플 데이터 (개발용)
│       ├── 001-sample-departments.sql
│       ├── 002-sample-users.sql
│       └── 003-sample-board-types.sql
├── scripts/
│   ├── init-db.sh                    # DB 초기화 (Linux/Mac)
│   ├── init-db.bat                   # DB 초기화 (Windows)
│   ├── db-status.sh                  # 마이그레이션 상태 확인
│   ├── db-rollback.sh                # 롤백
│   ├── db-validate.sh                # 유효성 검사
│   └── db-generate-sql.sh            # SQL 생성 (리뷰용)
└── docker/
    └── liquibase/
        └── Dockerfile                # Liquibase Docker 이미지
```

### 2.2 Changelog 버전 관리

```
v1.0.0 - 초기 스키마 (현재)
├── 코드 테이블 (code_types, codes)
├── 사용자 테이블 (departments, roles, users, user_role_mappings)
├── 메뉴 테이블 (menus, programs, help, permissions, role_menu_mappings, role_program_mappings)
├── 컨텐츠 테이블 (attachment_types, attachments, board_types, posts, comments)
├── 커뮤니케이션 테이블 (mail_messages, mail_recipients, mail_user_messages, messages)
├── 시스템 테이블 (app_settings, user_preferences, logs, token_blacklist, mfa_codes, conversations, conversation_messages, conversation_code_changes)
└── 인덱스 (모든 테이블)

v1.1.0 - (향후 확장)
└── 새로운 기능 테이블
```

---

## 3. DB 호환성 매핑

### 3.1 데이터 타입 매핑 (changelog-master.xml)

```xml
<!-- PostgreSQL -->
<property name="clob.type" value="TEXT" dbms="postgresql"/>
<property name="boolean.type" value="BOOLEAN" dbms="postgresql"/>
<property name="json.type" value="JSONB" dbms="postgresql"/>

<!-- Oracle -->
<property name="clob.type" value="CLOB" dbms="oracle"/>
<property name="boolean.type" value="NUMBER(1)" dbms="oracle"/>
<property name="json.type" value="CLOB" dbms="oracle"/>

<!-- 공통 -->
<property name="timestamp.type" value="TIMESTAMP WITH TIME ZONE" dbms="postgresql,oracle"/>
```

### 3.2 사용 예시

```xml
<column name="content" type="${clob.type}"/>
<column name="is_active" type="${boolean.type}" defaultValueBoolean="true"/>
<column name="metadata" type="${json.type}"/>
<column name="created_at" type="${timestamp.type}"/>
```

### 3.3 주의사항

1. **JSONB 컬럼**: Oracle에서는 CLOB으로 저장, JSON 함수는 앱 레벨에서 처리
2. **Boolean**: Oracle에서는 NUMBER(1)로 변환 (0/1)
3. **대소문자**: Oracle은 기본적으로 대문자, PostgreSQL은 소문자

---

## 4. 테이블 목록

### 4.1 코드 테이블

| 테이블 | 설명 | 파일 |
|--------|------|------|
| code_types | 코드 유형 | 001-create-code-tables.xml |
| codes | 공통 코드 | 001-create-code-tables.xml |

### 4.2 사용자 테이블

| 테이블 | 설명 | 파일 |
|--------|------|------|
| departments | 부서 | 002-create-user-tables.xml |
| roles | 역할 | 002-create-user-tables.xml |
| users | 사용자 | 002-create-user-tables.xml |
| user_role_mappings | 사용자-역할 매핑 | 002-create-user-tables.xml |

### 4.3 메뉴/권한 테이블

| 테이블 | 설명 | 파일 |
|--------|------|------|
| menus | 메뉴 | 003-create-menu-tables.xml |
| programs | 프로그램 | 003-create-menu-tables.xml |
| help | 도움말 | 003-create-menu-tables.xml |
| permissions | 권한 | 003-create-menu-tables.xml |
| role_menu_mappings | 역할-메뉴 매핑 | 003-create-menu-tables.xml |
| role_program_mappings | 역할-프로그램 매핑 | 003-create-menu-tables.xml |

### 4.4 컨텐츠 테이블

| 테이블 | 설명 | 파일 |
|--------|------|------|
| attachment_types | 첨부파일 유형 | 004-create-content-tables.xml |
| attachments | 첨부파일 | 004-create-content-tables.xml |
| board_types | 게시판 유형 | 004-create-content-tables.xml |
| posts | 게시물 | 004-create-content-tables.xml |
| comments | 댓글 | 004-create-content-tables.xml |

### 4.5 커뮤니케이션 테이블

| 테이블 | 설명 | 파일 |
|--------|------|------|
| mail_messages | 메일 메시지 | 005-create-communication-tables.xml |
| mail_recipients | 메일 수신자 | 005-create-communication-tables.xml |
| mail_user_messages | 사용자 메일함 | 005-create-communication-tables.xml |
| messages | 시스템 메시지 | 005-create-communication-tables.xml |

### 4.6 시스템 테이블

| 테이블 | 설명 | 파일 |
|--------|------|------|
| app_settings | 앱 설정 | 006-create-system-tables.xml |
| user_preferences | 사용자 설정 | 006-create-system-tables.xml |
| logs | 로그 | 006-create-system-tables.xml |
| token_blacklist | 토큰 블랙리스트 | 006-create-system-tables.xml |
| mfa_codes | MFA 코드 | 006-create-system-tables.xml |
| conversations | 대화 | 006-create-system-tables.xml |
| conversation_messages | 대화 메시지 | 006-create-system-tables.xml |
| conversation_code_changes | 코드 변경 | 006-create-system-tables.xml |

---

## 5. 초기 데이터

### 5.1 필수 데이터 (Required)

모든 배포에 필수적으로 포함되어야 하는 데이터:

| 파일 | 내용 | 테이블 |
|------|------|--------|
| 001-roles.sql | 기본 역할 (admin, manager, user, guest) | roles |
| 002-root-department.sql | 최상위 조직 (전사) | departments |
| 003-admin-user.sql | 관리자 계정 | users, user_role_mappings |
| 004-code-types.sql | 코드 유형 | code_types |
| 005-codes.sql | 시스템 코드 | codes |
| 006-attachment-types.sql | 첨부파일 유형 | attachment_types |
| 007-app-settings.sql | 앱 설정 기본값 | app_settings |

### 5.2 샘플 데이터 (Sample)

개발/테스트 환경에서만 사용 (context: sample):

| 파일 | 내용 | 테이블 |
|------|------|--------|
| 001-sample-departments.sql | 샘플 부서 구조 | departments |
| 002-sample-users.sql | 테스트 사용자 | users, user_role_mappings |
| 003-sample-board-types.sql | 샘플 게시판 | board_types |

---

## 6. 실행 방법

### 6.1 환경변수 설정

```bash
# 필수
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=corenextdb
export DB_USER=corenext
export DB_PASSWORD=your_password

# Oracle (필요시)
export DB_TYPE=oracle
export DB_SERVICE=ORCL
```

### 6.2 NPM 스크립트

```bash
# DB 초기화 (스키마 + 필수 데이터)
npm run db:init

# 샘플 데이터 포함 초기화
npm run db:init:sample

# Oracle DB 초기화
npm run db:init:oracle

# 마이그레이션 상태 확인
npm run db:status

# changelog 유효성 검사
npm run db:validate

# 롤백 (1개 changeset)
npm run db:rollback
```

### 6.3 직접 스크립트 실행

```bash
# Linux/Mac
./database/scripts/init-db.sh --type postgres --sample

# Windows
database\scripts\init-db.bat
```

### 6.4 Docker 환경

```bash
# Docker Compose 사용
docker-compose up -d db
docker-compose run liquibase update

# 또는 직접 실행
docker run --rm \
    -v $(pwd)/database:/liquibase/changelog \
    -e DB_HOST=host.docker.internal \
    -e DB_PASSWORD=$DB_PASSWORD \
    liquibase/liquibase \
    --defaults-file=/liquibase/changelog/liquibase-postgres.properties \
    update
```

---

## 7. Liquibase Context

### 7.1 Context 종류

| Context | 설명 | 포함 시점 |
|---------|------|----------|
| seed | 필수 데이터 | 기본 포함 |
| sample | 샘플 데이터 | `--sample` 옵션 |

### 7.2 Context 사용 예시

```bash
# 필수 데이터만
liquibase --contexts=seed update

# 샘플 데이터 포함
liquibase --contexts=seed,sample update

# 샘플 데이터 제외 (운영)
liquibase --contexts=seed update
```

---

## 8. CI/CD 연동

### 8.1 GitHub Actions 예시

```yaml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'database/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Liquibase Update
        uses: liquibase/liquibase-github-action@v7
        with:
          operation: 'update'
          classpath: 'database/changelog'
          changeLogFile: 'changelog-master.xml'
          username: ${{ secrets.DB_USER }}
          password: ${{ secrets.DB_PASSWORD }}
          url: 'jdbc:postgresql://${{ secrets.DB_HOST }}:5432/${{ secrets.DB_NAME }}'
```

### 8.2 롤백 전략

1. **태그 기반 롤백**: 배포 전 태그 생성
   ```bash
   liquibase tag v1.0.0
   liquibase rollback v1.0.0
   ```

2. **카운트 기반 롤백**: N개 changeset 롤백
   ```bash
   liquibase rollback-count 1
   ```

3. **날짜 기반 롤백**: 특정 날짜로 롤백
   ```bash
   liquibase rollback-to-date 2024-01-01
   ```

---

## 9. 트러블슈팅

### 9.1 일반적인 문제

| 문제 | 원인 | 해결 |
|------|------|------|
| Connection refused | DB 서버 미실행 | DB 서버 시작 |
| Access denied | 권한 부족 | DB 사용자 권한 확인 |
| Checksum mismatch | changelog 수정됨 | `liquibase clear-checksums` |
| Lock 해제 안됨 | 비정상 종료 | `liquibase release-locks` |

### 9.2 Oracle 관련

| 문제 | 원인 | 해결 |
|------|------|------|
| ORA-00942 | 테이블 없음 | 스키마 확인 |
| ORA-01017 | 인증 실패 | 사용자/비밀번호 확인 |
| ORA-12154 | TNS 설정 | tnsnames.ora 확인 |

### 9.3 유용한 명령어

```bash
# Lock 해제
liquibase release-locks

# Checksum 재계산
liquibase clear-checksums

# 변경 이력 확인
liquibase history

# SQL 미리보기
liquibase update-sql > preview.sql
```

---

## 10. 참고 자료

- [Liquibase Documentation](https://docs.liquibase.com/)
- [Liquibase Best Practices](https://docs.liquibase.com/concepts/bestpractices.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
