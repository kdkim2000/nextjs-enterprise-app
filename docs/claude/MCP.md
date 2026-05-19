# MCP — Model Context Protocol 서버 설정

> 최종 업데이트: 2026-05-19

## 1. 설정 파일 위치

```
.claude/
├── settings.json        # 기본 설정 (빈 파일)
└── settings.local.json  # MCP 서버 설정 (로컬 전용, git 미포함)
```

---

## 2. 현재 등록된 MCP 서버

### mcp-server-cloud

| 항목 | 값 |
|------|-----|
| 서버명 | `mcp-server-cloud` |
| 엔드포인트 | `https://mcp-server.kdkim2000.workers.dev` |
| 런타임 | Cloudflare Workers |
| 연결 방식 | `npx -y mcp-remote` (SSE 기반) |
| 인증 | Bearer 토큰 (`cfat_...`) |

**settings.local.json 구조:**

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp-server.kdkim2000.workers.dev",
        "--header",
        "Authorization: Bearer cfat_..."
      ]
    }
  },
  "permissions": {
    "allow": [
      "mcp__mcp-server-cloud__log_usage"
    ]
  }
}
```

---

## 3. 사용 가능한 툴 목록

### 3.1 `mcp__mcp-server-cloud__log_usage`

**목적:** 현재 대화의 토큰 사용량을 Cloudflare D1 DB에 기록한다.

**파라미터:**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `model` | string | ✅ | 모델명 (예: `claude-sonnet-4-6`) |
| `input_tokens` | number | ✅ | 입력 토큰 수 |
| `output_tokens` | number | ✅ | 출력 토큰 수 |
| `email` | string | ❌ | 사용자 이메일 (기본값 있음) |
| `note` | string | ❌ | 메모 |

**사용 예시:**

```
대화 종료 시 호출:
- model: "claude-sonnet-4-6"
- input_tokens: 추정값
- output_tokens: 추정값
- email: "kdkim2000@samsung.com"
```

**자동 허용:** `permissions.allow`에 등록되어 있어 사용자 승인 없이 호출된다.

---

### 3.2 `mcp__mcp-server-cloud__get_my_stats`

**목적:** 누적 토큰 사용 통계를 조회한다.

**파라미터:** (스키마 로드 필요 — ToolSearch로 확인)

**사용 시점:** 사용량 현황 확인이 필요할 때

---

### 3.3 `mcp__mcp-server-cloud__submit_daily_report`

**목적:** 일일 사용 리포트를 제출한다.

**파라미터:** (스키마 로드 필요 — ToolSearch로 확인)

**사용 시점:** 하루 작업 종료 후 리포트 제출

---

## 4. 툴 호출 규칙

### log_usage 호출 시점

- 대화가 자연스럽게 종료될 때 `log_usage`를 호출한다.
- 입력/출력 토큰은 대화 규모에 따라 합리적으로 추정한다.
- 이메일: `kdkim2000@samsung.com` (고정)
- 모델: 현재 세션 모델 (`claude-sonnet-4-6`)

### 스키마 로딩 (Deferred Tools)

`get_my_stats`, `submit_daily_report`는 deferred tool이므로 사용 전 스키마를 로드해야 한다:

```
ToolSearch: "select:mcp__mcp-server-cloud__get_my_stats"
```

---

## 5. MCP 서버 추가 방법

새 MCP 서버를 추가하려면 `/update-config` 스킬을 사용하거나 `settings.local.json`을 직접 수정한다:

```json
{
  "mcpServers": {
    "새서버명": {
      "command": "npx",
      "args": ["-y", "패키지명", "..."]
    }
  }
}
```

특정 툴만 자동 허용하려면:

```json
{
  "permissions": {
    "allow": [
      "mcp__새서버명__툴이름"
    ]
  }
}
```

---

## 6. 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| MCP 서버 연결 안 됨 | `mcp-remote` 미설치 | `npx -y mcp-remote` 자동 설치됨, 네트워크 확인 |
| 토큰 만료 | Bearer 토큰 갱신 필요 | `settings.local.json`의 `cfat_...` 토큰 갱신 |
| 권한 프롬프트 반복 | `permissions.allow` 미등록 | `/fewer-permission-prompts` 스킬 실행 |
| Invalid permission rule | settings.json에 코드 오염 | settings.json 내용 검증, 코드 스니펫 제거 |
