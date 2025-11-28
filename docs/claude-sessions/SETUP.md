# Claude Code 대화 마이그레이션 설정 가이드

## 개요

Claude Code와의 대화를 자동으로 저장하고 관리하는 시스템입니다.

---

## 1. 수동 실행 (npm scripts)

### 사용 가능한 명령어

```bash
# 새로운 세션만 마이그레이션 (증분 모드, 기본값)
npm run migrate:conversations

# 모든 세션 강제 재처리
npm run migrate:conversations:force

# 현재 마이그레이션 상태 확인
npm run migrate:conversations:status

# Markdown만 생성 (DB SQL 제외)
npm run migrate:conversations:md

# DB SQL만 생성 (Markdown 제외)
npm run migrate:conversations:db
```

### 직접 스크립트 실행

```bash
# 기본 실행
node scripts/migrate-conversations.js

# 옵션 사용
node scripts/migrate-conversations.js --force          # 강제 재처리
node scripts/migrate-conversations.js --status         # 상태 확인
node scripts/migrate-conversations.js --md-only        # Markdown만
node scripts/migrate-conversations.js --db-only        # DB SQL만
node scripts/migrate-conversations.js --limit=10       # 10개만 처리
node scripts/migrate-conversations.js --session=abc123 # 특정 세션만
node scripts/migrate-conversations.js --reset          # 추적 파일 초기화
```

---

## 2. 자동 실행 (Windows Task Scheduler)

### 설정 방법

1. **작업 스케줄러 열기**
   - `Win + R` → `taskschd.msc` 입력

2. **새 작업 만들기**
   - 오른쪽 패널에서 "작업 만들기" 클릭

3. **일반 탭**
   - 이름: `Claude Code Conversation Migration`
   - 설명: `Claude Code 대화를 자동으로 저장합니다`
   - "사용자가 로그온 상태인지 여부에 관계없이 실행" 선택 (선택사항)

4. **트리거 탭**
   - "새로 만들기" 클릭
   - 시작: 매일
   - 시간: 오전 2:00 (또는 원하는 시간)
   - "사용" 체크

5. **동작 탭**
   - "새로 만들기" 클릭
   - 동작: 프로그램 시작
   - 프로그램/스크립트: `E:\apps\nextjs-enterprise-app\scripts\migrate-conversations.bat`
   - 시작 위치: `E:\apps\nextjs-enterprise-app`

6. **조건 탭** (선택사항)
   - "컴퓨터가 AC 전원을 사용하는 경우에만 시작" 해제 (노트북인 경우)

7. **설정 탭**
   - "요청 시 작업 실행 허용" 체크
   - "예약된 시작 시간을 놓친 경우 최대한 빨리 작업 시작" 체크

8. **확인** 클릭하여 저장

### 수동 테스트

설정 후 작업 스케줄러에서:
1. 생성한 작업 우클릭
2. "실행" 선택
3. `logs/migration/` 폴더에서 로그 확인

---

## 3. 중복 방지 메커니즘

### 작동 방식

```
.migrated-sessions.json
├── migratedSessions: []  # 처리된 세션 ID 목록
├── lastMigration: ""     # 마지막 마이그레이션 시간
├── totalMigrated: 0      # 총 마이그레이션 수
└── stats: {}             # 통계 정보
```

### 중복 방지 레이어

| 레이어 | 방법 | 설명 |
|--------|------|------|
| 스크립트 | `.migrated-sessions.json` | 세션 ID 추적 |
| DB | `ON CONFLICT DO NOTHING` | 중복 INSERT 무시 |
| Markdown | 동일 파일명 덮어쓰기 | 자연스러운 업데이트 |

### 추적 파일 관리

```bash
# 상태 확인
npm run migrate:conversations:status

# 추적 파일 초기화 (모든 세션 재처리 필요)
node scripts/migrate-conversations.js --reset

# 강제 재처리 (추적 파일 유지하며 재처리)
npm run migrate:conversations:force
```

---

## 4. 출력 구조

### Markdown 파일

```
docs/claude-sessions/
├── _index.md                    # 전체 인덱스
├── README.md                    # 문서화
├── SETUP.md                     # 이 파일
├── templates/
│   └── session-template.md
├── 2025-11/                     # 월별 폴더
│   ├── 2025-11-04-xxx.md
│   └── ...
└── 2025-12/
    └── ...
```

### SQL 파일

```
migration/
├── create_conversations_tables.sql     # 테이블 생성 (최초 1회)
├── insert_conversations.sql            # 전체 마이그레이션
└── insert_conversations_YYYY-MM-DD.sql # 증분 마이그레이션
```

---

## 5. 문제 해결

### Q: 새로운 세션이 감지되지 않음

```bash
# 추적 상태 확인
npm run migrate:conversations:status

# 강제 재처리
npm run migrate:conversations:force
```

### Q: DB 연결 실패

생성된 SQL 파일을 수동으로 실행:
```bash
psql -h localhost -U app_user -d app_db -f migration/insert_conversations_*.sql
```

### Q: 모든 기록을 처음부터 다시 하고 싶음

```bash
# 1. 추적 파일 초기화
node scripts/migrate-conversations.js --reset

# 2. 강제 재처리
npm run migrate:conversations:force
```

---

## 6. 권장 워크플로우

### 일상적 사용

1. **자동 배치**: Task Scheduler가 매일 새벽 자동 실행
2. **수동 저장**: 중요한 세션 직후 `npm run migrate:conversations` 실행

### 주기적 점검

```bash
# 주 1회 상태 확인
npm run migrate:conversations:status
```

### Git에 포함할 파일

```
# .gitignore에 추가하지 않음 (버전 관리 권장)
docs/claude-sessions/**/*.md

# .gitignore에 추가 (선택사항)
.migrated-sessions.json
logs/migration/
```
