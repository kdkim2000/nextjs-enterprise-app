# Database Migration

Enterprise Application DB 스키마 관리를 위한 Liquibase 기반 마이그레이션 패키지입니다.

## Quick Start

### 1. 환경변수 설정

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=corenextdb
export DB_USER=corenext
export DB_PASSWORD=your_password
```

### 2. DB 초기화

```bash
# 스키마 + 필수 데이터
npm run db:init

# 샘플 데이터 포함
npm run db:init:sample
```

## 디렉토리 구조

```
database/
├── changelog/           # Liquibase changelog 파일
│   ├── changelog-master.xml
│   └── v1.0/
├── seed/               # 초기 데이터 SQL
│   ├── required/       # 필수 데이터 (운영 배포시 필요)
│   └── sample/         # 샘플 데이터 (개발/테스트용)
├── scripts/            # 실행 스크립트
└── docker/             # Docker 설정
```

## NPM Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run db:init` | DB 초기화 (스키마 + 필수 데이터) |
| `npm run db:init:sample` | 샘플 데이터 포함 초기화 |
| `npm run db:init:oracle` | Oracle DB 초기화 |
| `npm run db:status` | 마이그레이션 상태 확인 |
| `npm run db:validate` | changelog 유효성 검사 |
| `npm run db:rollback` | 1개 changeset 롤백 |

## 지원 데이터베이스

- PostgreSQL 14+
- Oracle 19c+

## 상세 문서

자세한 내용은 [Database Migration Plan](/docs/database-migration-plan.md) 문서를 참조하세요.
