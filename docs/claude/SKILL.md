# SKILL — Claude Code 스킬 목록

> 최종 업데이트: 2026-05-19  
> 스킬은 `/스킬명` 또는 Skill 도구로 호출한다.

---

## 1. 프로젝트 전용 스킬 (my-skills)

### `my-skills:emoji-summarizer`

| 항목 | 내용 |
|------|------|
| 목적 | 텍스트를 이모지로 요약 |
| 트리거 | "이모지로 요약", "이모지로 표현", "이모지 버전", "이모지로 설명" |
| 사용 시점 | 회의 내용, 기능 설명, 상황 요약을 이모지로 표현할 때 |

---

### `my-skills:crawled-content-cleanup`

| 항목 | 내용 |
|------|------|
| 목적 | 크롤 완료 후 불필요한 컨텐츠 정리 및 인덱스 재구성 |
| 트리거 | "크롤 결과 정리", "사이트 컨텐츠 정리", "언어 중복 제거", "articles 정리", "rebuild site index" |
| 수행 작업 | `toc.json`, `metadata.json`, `db.sqlite`, `registry.json` 정합성 재구성 |
| 사용 시점 | 웹 크롤링 후 articles/*.md 파일 편집/삭제 시 |

---

### `my-skills:pr-description`

| 항목 | 내용 |
|------|------|
| 목적 | GitHub Pull Request 본문 자동 작성 |
| 트리거 | "PR 설명 써줘", "PR 본문 작성", "pull request 내용 만들어줘", "PR description", "git diff 보고 PR 써줘" |
| 생성물 | Summary, Test plan, 변경 목록이 포함된 PR 본문 |
| 사용 시점 | 브랜치 작업 완료 후 GitHub PR 생성 전 |

**이 프로젝트에서 자주 사용:**
- 기능 브랜치 완료 후 `main` 브랜치로 PR 생성 시
- 현재 브랜치: `20-genai`

---

## 2. 개발 지원 스킬

### `claude-api`

| 항목 | 내용 |
|------|------|
| 목적 | Claude API / Anthropic SDK 앱 개발 및 최적화 |
| 트리거 | `import anthropic` 코드, Claude API 질문, 모델 마이그레이션, 프롬프트 캐싱 |
| 포함 기능 | Prompt caching, Tool use, Batch API, Files API, Citations, Managed Agents |
| 현재 모델 | claude-sonnet-4-6 (기본), claude-opus-4-7, claude-haiku-4-5 |
| **스킵 조건** | `import openai`, provider-neutral 코드, 일반 ML 코드 |

**이 프로젝트 관련:** `genai/` 디렉토리 관련 AI 기능 개발 시 사용

---

### `simplify`

| 항목 | 내용 |
|------|------|
| 목적 | 변경된 코드의 품질, 재사용성, 효율성 검토 후 수정 |
| 트리거 | "코드 단순화", "리팩터링", "코드 품질 개선" |
| 수행 작업 | 중복 제거, 기존 패턴과 일관성 확인, 불필요한 추상화 제거 |

---

### `security-review`

| 항목 | 내용 |
|------|------|
| 목적 | 현재 브랜치의 변경사항 보안 검토 |
| 트리거 | "보안 검토", "security review", 인증/권한 코드 변경 후 |
| 검토 항목 | XSS, SQL Injection, 토큰 노출, RBAC 우회 가능성 |

**이 프로젝트 관련:** JWT 토큰 처리, `NEXT_PUBLIC_` 환경변수, SQL 쿼리 변경 시 권장

---

### `review`

| 항목 | 내용 |
|------|------|
| 목적 | Pull Request 코드 리뷰 |
| 트리거 | "PR 리뷰해줘", `/review` |
| 대상 | 현재 브랜치 또는 지정 PR 번호 |

---

## 3. 설정 및 환경 스킬

### `update-config`

| 항목 | 내용 |
|------|------|
| 목적 | `settings.json` / `settings.local.json` 설정 변경 |
| 트리거 | "from now on when X", "allow X command", "set X=Y env var", "add permission", 훅 설정 |
| 수행 작업 | permissions allowlist 추가, hooks 설정, 환경변수 등록 |
| **중요** | 자동화 행동("항상 X 해줘")은 memory가 아닌 hooks로 구현해야 함 |

**이 프로젝트에서 자주 사용:**
```
"npm run lint 명령 허용해줘"
"mcp__mcp-server-cloud__get_my_stats 툴 자동 허용 추가해줘"
```

---

### `fewer-permission-prompts`

| 항목 | 내용 |
|------|------|
| 목적 | 반복적인 권한 프롬프트 최소화 |
| 트리거 | 권한 프롬프트가 반복될 때 |
| 수행 작업 | 트랜스크립트 분석 → `.claude/settings.json` allowlist 업데이트 |

---

### `init`

| 항목 | 내용 |
|------|------|
| 목적 | 새 프로젝트의 `CLAUDE.md` 초기화 |
| 트리거 | `CLAUDE.md` 파일이 없거나 새 프로젝트 시작 시 |
| **이 프로젝트** | 이미 `CLAUDE.md` 존재 — 재초기화 불필요 |

---

## 4. 작업 자동화 스킬

### `schedule`

| 항목 | 내용 |
|------|------|
| 목적 | 정기 반복 작업 또는 일회성 예약 실행 설정 |
| 트리거 | "매일 X 실행해줘", "3pm에 한번 실행", "cron 작업 설정" |
| 예시 | 일일 리포트 제출 자동화, 정기 빌드 확인 |

---

### `loop`

| 항목 | 내용 |
|------|------|
| 목적 | 특정 명령을 반복 간격으로 실행 |
| 트리거 | "5분마다 X 확인해줘", "계속 실행", `/loop 5m /명령` |
| **일회성 작업에는 사용 금지** | 반복이 필요한 경우에만 사용 |

---

## 5. 스킬 호출 방법

```
# 대화에서 직접 입력
/pr-description
/security-review
/simplify

# 특정 스킬 네임스페이스
/my-skills:pr-description
```

스킬은 Skill 도구로 호출되며, 해당 스킬의 지시사항에 따라 Claude가 작업을 수행한다.
