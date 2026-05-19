# AGENT — Claude Code 서브에이전트 가이드

> 최종 업데이트: 2026-05-19  
> 이 문서는 CoreNext 프로젝트에서 Claude Code 서브에이전트를 효과적으로 활용하는 방법을 설명한다.

---

## 1. 사용 가능한 에이전트 타입

| 에이전트 | 특징 | 이 프로젝트 적합 용도 |
|---------|------|---------------------|
| `Explore` | 읽기 전용 탐색 | 코드 패턴 확인, 파일 위치 파악 |
| `Plan` | 구현 계획 설계 | 기능 설계, 리팩터링 전략 |
| `claude-code-guide` | Claude API/SDK 질문 | AI 기능 개발 (genai 모듈) |
| `general-purpose` | 복합 작업 | 다단계 조사 및 구현 |

---

## 2. 에이전트 타입별 사용 가이드

### 2.1 Explore 에이전트

**언제 사용하나:**
- 특정 패턴이 어디에 구현되어 있는지 찾을 때
- 기존 컴포넌트/훅의 인터페이스 확인
- 파일 구조 탐색 (읽기 전용)

**이 프로젝트 예시:**

```
"src/components/common/ 에서 DataGrid 관련 컴포넌트 구조를 파악해줘"
"adminApi 클라이언트가 어떤 엔드포인트에서 사용되는지 찾아줘"
"inspection-service의 sync 모듈 API 설계 확인해줘"
```

**병렬 실행 최적화:**

프론트엔드와 백엔드를 동시에 탐색할 때 병렬로 실행:

```
에이전트 1: src/components/, src/hooks/, src/contexts/ 탐색
에이전트 2: services/core-service/src/ 탐색
에이전트 3: services/inspection-service/src/ 탐색
```

---

### 2.2 Plan 에이전트

**언제 사용하나:**
- 새 기능 추가 전 구현 전략 수립
- 여러 서비스에 걸친 변경 설계
- 리팩터링 영향 범위 분석

**이 프로젝트 예시:**

```
"게시판에 좋아요 기능을 추가하려고 해. 
app-service API, 프론트엔드 컴포넌트, DB 변경 계획 세워줘"

"현재 AuthContext가 localStorage를 직접 사용하는데 
httpOnly 쿠키로 전환하는 계획 작성해줘"
```

---

### 2.3 claude-code-guide 에이전트

**언제 사용하나:**
- Anthropic SDK (`import anthropic`) 코드 작성
- Claude API 기능 (Tool use, Prompt caching, Batch 등) 구현
- AI 관련 기능을 CoreNext에 통합할 때

**이 프로젝트 맥락:**
- `genai/` 디렉토리 또는 AI 기능 추가 시
- 모델 선택: 기본적으로 `claude-sonnet-4-6` 사용

---

### 2.4 general-purpose 에이전트

**언제 사용하나:**
- 코드베이스 전반을 탐색 + 수정하는 복합 작업
- 위의 특수 에이전트로 분류되지 않는 작업

---

## 3. 병렬 실행 전략

### 독립적 작업의 병렬화

아래 작업들은 서로 독립적이므로 동시에 실행할 수 있다:

```
병렬 그룹 예시:
┌─ 에이전트 A: 프론트엔드 컴포넌트 구현
├─ 에이전트 B: 백엔드 API 엔드포인트 추가
└─ 에이전트 C: DB 마이그레이션 스크립트 작성
```

### 의존성이 있는 작업 (순차 실행)

```
순차 실행 필수:
1. shared 라이브러리 타입 추가
2. (1 완료 후) 서비스 코드에서 새 타입 사용
3. (2 완료 후) 프론트엔드에서 API 호출 구현
```

---

## 4. 이 프로젝트 특화 주의사항

### 서비스 독립성

각 에이전트에게 서비스 경계를 명시한다:

```
# 올바른 지시
"core-service의 users 모듈만 수정해줘. 
app-service는 건드리지 마."

# 잘못된 지시 (서비스 경계 모호)
"사용자 관련 코드 전체 수정해줘"
```

### shared 빌드 의존성

shared 라이브러리 변경이 포함된 작업:

```
에이전트 지시 예시:
"shared/src/types/에 새 타입을 추가한 후,
npm run build:shared를 실행해서 빌드가 성공하는지 확인해줘.
그 다음 core-service에서 해당 타입을 import해서 사용해줘."
```

### Liquibase 마이그레이션

DB 스키마 변경 에이전트:

```
에이전트 지시 예시:
"database/changelog/v1.0/ 에서 기존 파일 번호를 확인하고,
다음 번호의 XML 마이그레이션 파일을 생성해줘.
직접 SQL을 실행하거나 기존 파일을 수정하지 말것."
```

### 다국어 문자열

UI 관련 에이전트:

```
에이전트 지시 예시:
"새 문자열을 하드코딩하지 말고,
src/lib/i18n/locales/ 아래 en.ts, ko.ts, zh.ts, vi.ts
4개 파일 모두에 번역을 추가하고 useI18n() 훅으로 사용해줘."
```

---

## 5. 에이전트 프롬프트 작성 팁

에이전트는 현재 대화 맥락을 모른다. 프롬프트에 다음을 포함한다:

1. **작업 목적** — 무엇을 달성하려는지
2. **관련 파일 경로** — 작업 범위를 명시 (`src/lib/axios/index.ts`)
3. **제약 조건** — 건드리지 말아야 할 것 (`output: standalone 수정 금지`)
4. **기존 패턴** — 따라야 할 패턴 (`기존 6개 axios 클라이언트 패턴 유지`)
5. **검증 방법** — 작업 완료 확인 방법

**예시:**

```
"src/contexts/AuthContext.tsx에 
getCurrentUser() 함수를 추가해줘.
- accessToken을 localStorage에서 읽어 JWT를 디코딩
- 토큰이 없거나 만료되면 null 반환
- 기존 AuthState 타입은 변경하지 않을 것
- src/types/auth.ts의 User 타입을 반환 타입으로 사용
- 검증: type-check 통과 확인"
```

---

## 6. 에이전트 사용 시 금지사항

| 금지 | 이유 |
|------|------|
| 에이전트에게 "전체 리팩터링" 위임 | 범위가 너무 넓어 예상치 못한 변경 발생 |
| 결과 확인 없이 바로 커밋 | 에이전트 출력은 의도한 것이지 실제 변경이 아닐 수 있음 |
| 서비스 경계 무시 지시 | 의존성 오염 발생 |
| 병렬로 같은 파일 수정 | 충돌 발생 |

---

## 7. 배포 전용 에이전트

배포 작업은 아래 전문화된 에이전트로 분리하여 수행한다. 각 에이전트는 단일 책임을 갖는다.

### 7.1 DeployStorageAgent

**역할:** 파일 저장소를 로컬 디스크에서 Supabase Storage로 마이그레이션한다.

**트리거 조건:**
- multer diskStorage를 사용하는 라우트가 발견될 때
- 파일 업로드 관련 `attachmentService` 변경이 필요할 때
- 서비스에 `supabaseStorage.ts` 헬퍼가 없을 때

**수행 작업:**
1. `services/*/src/routes/` 에서 multer diskStorage 설정 파악
2. `services/*/src/services/attachmentService.ts` 읽기
3. `multer.diskStorage()` → `multer.memoryStorage()` 교체
4. `services/*/src/utils/supabaseStorage.ts` 헬퍼 생성 (업로드/삭제/URL 반환)
5. 정적 파일 서빙(`express.static('uploads/')`) 제거

**예시 프롬프트:**
```
"services/ 아래 3개 서비스의 파일 업로드를 Supabase Storage로 마이그레이션해줘.
multer memoryStorage 패턴과 supabaseStorage.ts 헬퍼를 각 서비스에 생성하고,
attachmentService.ts가 Supabase SDK를 사용하도록 업데이트해줘."
```

---

### 7.2 DeployRenderAgent

**역할:** Render.com 배포용 Blueprint 파일(`render.yaml`)과 빌드 파이프라인을 설정한다.

**트리거 조건:**
- `render.yaml`이 없거나 서비스 구성이 변경될 때
- Render.com에 신규 서비스를 추가할 때
- CORS 설정을 업데이트해야 할 때

**수행 작업:**
1. `render.yaml` 생성/수정 — 3개 서비스(core/app/inspection) 정의
2. 각 서비스의 buildCommand에 `shared` 빌드 선행 포함
3. `sync: false` 시크릿(DB 비밀번호, JWT 시크릿 등) 처리
4. 각 서비스 `.env` 파일의 `CORS_ORIGINS` 업데이트

**주의사항:**
- 빌드 명령에 반드시 `shared` 빌드가 먼저 실행되어야 한다
- `CORS_ORIGINS` 환경변수 이름을 사용한다 (`ALLOWED_ORIGINS` 아님)
- 시크릿은 `sync: false`로 표시하고 Render 대시보드에서 수동 설정

**예시 프롬프트:**
```
"render.yaml을 생성해줘. 3개 Express 서비스를 정의하고,
shared 라이브러리를 먼저 빌드하는 buildCommand를 포함해줘.
DB 비밀번호와 JWT 시크릿은 sync: false로 표시해줘."
```

---

### 7.3 DeployVercelAgent

**역할:** Next.js 프론트엔드를 Vercel에 배포하기 위한 환경 설정을 구성한다.

**트리거 조건:**
- Vercel 배포를 처음 설정할 때
- Render.com 서비스 URL이 변경될 때
- `.env.production`의 API URL을 업데이트해야 할 때

**수행 작업:**
1. `.env.production` 파일에 `NEXT_PUBLIC_*_API_URL` 값 설정
2. `src/lib/api/config.ts` production 섹션 검토 및 업데이트
3. `next.config.ts`에 localhost를 가리키는 프록시 rewrites가 없는지 확인
4. `output: 'standalone'` 비활성화 상태 유지 확인 (Next.js 16 버그)

**절대 금지:**
- `.env.local`, `.env` 파일에 시크릿 커밋
- `.env.production`에 DB 비밀번호, JWT 시크릿 포함
- `NEXT_PUBLIC_*` 변수에 시크릿 값 저장

**예시 프롬프트:**
```
".env.production을 Render.com 서비스 URL로 업데이트해줘.
NEXT_PUBLIC_*_API_URL 환경변수 6개를 설정하고,
src/lib/api/config.ts가 이 값을 올바르게 읽는지 확인해줘."
```

---

### 7.4 DeployDocAgent

**역할:** 배포 관련 변경 사항이 발생할 때 `docs/claude/` 문서를 최신 상태로 유지한다.

**트리거 조건:**
- 배포 아키텍처가 변경될 때 (서비스 추가, URL 변경 등)
- 다른 배포 에이전트 작업이 완료된 후
- `render.yaml`, `.env.production`, `src/lib/api/config.ts` 변경 후

**수행 작업:**
1. `docs/claude/ARCHITECTURE.md` — 배포 아키텍처 섹션 업데이트
2. `docs/claude/AGENT.md` — 신규 에이전트 타입 추가/수정
3. `docs/claude/RULE.md` — 배포 규칙 섹션 최신화
4. `docs/claude/DEPLOY.md` — 단계별 배포 가이드 업데이트

**주의사항:**
- `docs/claude/` 이외의 문서 파일은 수정하지 않는다
- 기존 내용을 삭제하지 않고 섹션을 추가/업데이트한다

**예시 프롬프트:**
```
"배포 아키텍처 변경 사항을 docs/claude/ 문서에 반영해줘.
ARCHITECTURE.md에 새 배포 구조도를 추가하고,
DEPLOY.md의 환경변수 목록을 업데이트해줘."
```

---

### 7.5 DeployTokenAgent

**역할:** 배포 세션 완료 후 토큰 사용량을 D1 서버에 기록한다.

**트리거 조건:**
- 배포 관련 다중 에이전트 세션이 완료될 때
- 일일 보고서 제출이 필요할 때

**수행 작업:**
1. MCP 클라우드 도구(`mcp__mcp-server-cloud__get_my_stats`)로 현재 사용량 조회
2. 작업 내용 요약 및 토큰 사용량 집계
3. `mcp__mcp-server-cloud__submit_daily_report`로 보고서 제출

**예시 프롬프트:**
```
"오늘 배포 작업 완료. DeployTokenAgent로 토큰 사용량을 기록하고
일일 보고서를 제출해줘."
```

---

### 7.6 배포 에이전트 실행 순서

새 환경 배포 시 권장 순서:

```
순차 실행:
1. DeployStorageAgent  — Supabase Storage 마이그레이션
2. DeployRenderAgent   — render.yaml 생성
3. DeployVercelAgent   — .env.production + config.ts 업데이트
4. DeployDocAgent      — 문서 동기화
5. DeployTokenAgent    — 토큰 사용량 기록
```

기존 서비스 재배포 (URL/CORS 변경 시):

```
병렬 가능:
├─ DeployRenderAgent  — render.yaml CORS 업데이트
└─ DeployVercelAgent  — .env.production URL 업데이트

완료 후 순차:
└─ DeployDocAgent     — 문서 최신화
```
