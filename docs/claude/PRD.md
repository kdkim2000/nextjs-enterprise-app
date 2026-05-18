# PRD — CoreNext Enterprise Platform

> 최종 업데이트: 2026-05-19 | 버전: 2.0.0 (MSA 전환 이후)

## 1. 프로젝트 개요

**CoreNext Enterprise Platform**은 중대형 기업이 사용하는 내부 업무 시스템이다. 사용자 인증/권한 관리, 게시판, 검수(Inspection), 메일/메시지, 코드 마스터, 부서 관리, 대시보드 등 기업 운영에 필요한 핵심 기능을 단일 플랫폼에서 제공한다.

### 주요 특징

| 항목 | 내용 |
|------|------|
| 아키텍처 | Next.js 16 (App Router) + Express MSA 3서비스 |
| 데이터베이스 | PostgreSQL 16 (Oracle 19c+ 선택적 지원) |
| 다국어 | 영어(en) · 한국어(ko) · 중국어 간체(zh) · 베트남어(vi) |
| 인증 | JWT (Access + Refresh 토큰), 이메일 MFA, SSO |
| 권한 | 프로그램 코드 기반 RBAC (can_view/create/update/delete) |
| 모바일 | 반응형 + 오프라인 동기화 (Inspection 모듈) |

---

## 2. 기능 범위

### 2.1 인증 및 세션 관리 (core-service, port 3011)

| 기능 | 설명 |
|------|------|
| 로그인 | ID/Password → JWT accessToken + refreshToken 발급 |
| MFA | 이메일 기반 6자리 코드 (개발환경: 콘솔 출력) |
| SSO | `ssoLogin(loginid)` — 비밀번호 없이 로그인 |
| 자동 로그아웃 | 30분 무활동 시 (`useAutoLogout` 훅) |
| 토큰 갱신 | 401 응답 시 refreshToken으로 자동 갱신 후 재시도 |
| 사용자 설정 | 언어, 테마, 알림 설정 저장 (`/auth/user-settings`) |

### 2.2 사용자 및 역할 관리 (core-service)

| 기능 | 설명 |
|------|------|
| 사용자 CRUD | 직원 정보, 아바타, 부서 배정 |
| 역할(Role) CRUD | 역할 생성 및 프로그램 권한 매핑 |
| 사용자-역할 매핑 | N:M 관계 (`user_role_mappings`) |
| 역할-프로그램 매핑 | CRUD 플래그 (`role_program_mappings`) |
| 부서 관리 | 조직 계층 구조 |
| 프로그램 관리 | 기능 모듈 등록 (`programCode` 기반) |

### 2.3 메뉴 관리 (core-service)

| 기능 | 설명 |
|------|------|
| 계층형 메뉴 | 다단계 중첩, 드래그 앤 드롭 정렬 |
| 다국어 메뉴명 | en/ko/zh/vi 별도 필드 |
| 플랫폼별 표시 | `mobileEnabled`, `desktopEnabled` 플래그 |
| 즐겨찾기/최근 | MenuContext에서 추적 |

### 2.4 코드 마스터 (core-service)

| 기능 | 설명 |
|------|------|
| 코드 타입 | 동적 코드 분류 체계 |
| 코드 CRUD | 다국어 코드값 및 설명 |
| 공통 사용 | `useCodeOptions()` 훅으로 Select 컴포넌트에서 활용 |

### 2.5 게시판 시스템 (app-service, port 3012)

| 기능 | 설명 |
|------|------|
| 게시판 타입 | 공지, Q&A, 자유게시판 등 동적 생성 |
| 게시글 CRUD | TipTap 에디터, 첨부파일, 댓글 |
| Q&A | 답변 상태 추적, 담당자 배정 |
| 도움말 | 다국어 도움말 아티클 |
| 권한 | 게시판별 접근 제어 (`boardAccessControl`) |

### 2.6 메일 및 메시지 (app-service)

| 기능 | 설명 |
|------|------|
| 내부 메일 | 발신/수신/임시저장/삭제 |
| 인스턴트 메시지 | 실시간 메시지 (`/comm/messages`) |
| 대화 스레드 | 그룹 대화 (`/comm/conversations`) |

### 2.7 검수(Inspection) 시스템 (inspection-service, port 3013)

| 기능 | 설명 |
|------|------|
| 체크시트 템플릿 | 항목 계층 구조 (체크박스, 텍스트, 숫자, 사진, 서명 등) |
| 검수 실행 | 템플릿 기반 현장 검수 수행 |
| 오프라인 동기화 | `useOfflineInspection` + `/inspection/sync` |
| 대시보드 | 검수 통계 및 분석 |

### 2.8 공통 기능 (core-service)

| 기능 | 설명 |
|------|------|
| 첨부파일 | 타입별 업로드 제한, 파일 서빙 |
| 감사 로그 | 모든 CRUD 작업 기록 |
| 앱 설정 | `app_settings` 테이블 기반 동적 설정 |
| 대시보드 | Recharts 기반 통계 차트 |
| 알림 | 시스템 알림 (`useNotifications`) |

---

## 3. 사용자 유형

| 역할 유형 | 설명 |
|----------|------|
| 시스템 관리자 | 전체 기능 접근, 사용자/역할/메뉴 관리 |
| 일반 사용자 | 역할에 따른 제한된 기능 접근 |
| 현장 검수원 | 모바일 + 오프라인 Inspection 전용 |

---

## 4. 기술 스택

### Frontend

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router), React 19 |
| UI 라이브러리 | MUI v6 |
| 데이터 그리드 | MUI X Data Grid Premium |
| 리치 텍스트 | TipTap (extensions: table, image, code block 등) |
| 폼 | React Hook Form + Zod |
| 차트 | Recharts |
| 다국어 | next-international |
| HTTP 클라이언트 | Axios (6개 서비스별 클라이언트) |
| 상태 관리 | React Context API (3개 Context) |
| 내보내기 | exceljs, jsPDF |

### Backend (MSA)

| 서비스 | 기술 | 포트 |
|--------|------|------|
| core-service | Express.js + TypeScript | 3011 |
| app-service | Express.js + TypeScript | 3012 |
| inspection-service | Express.js + TypeScript | 3013 |
| 공유 라이브러리 | @enterprise/shared | — |

### 인프라

| 항목 | 기술 |
|------|------|
| 데이터베이스 | PostgreSQL 16 (pg-promise 풀링) |
| 세션 | Redis 7 (토큰 관리) |
| 마이그레이션 | Liquibase (XML 기반) |
| 역방향 프록시 | Nginx |
| 컨테이너 | Docker Compose |
| 모니터링 | Prometheus + Grafana + Loki + Promtail |

---

## 5. 비기능 요구사항

| 항목 | 요구사항 |
|------|----------|
| 보안 | JWT 토큰 만료, MFA, XSS/SQL Injection 방지, Zod 입력 검증 |
| 성능 | 코드 스플리팅, Next.js SSR/SSG, 가상 스크롤(`useVirtualList`) |
| 접근성 | MUI 접근성 기본 지원 |
| 확장성 | 서비스별 독립 배포 가능한 MSA 구조 |
| 오프라인 | Inspection 모듈 오프라인 데이터 로컬 저장 + 온라인 복귀 시 동기화 |

---

## 6. 환경 변수 (주요)

```bash
# 클라이언트 노출 (NEXT_PUBLIC_ prefix) — 비밀값 절대 사용 금지
NEXT_PUBLIC_ENV=development|production
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3011/auth
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3011/admin
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:3012/content
NEXT_PUBLIC_COMM_API_URL=http://localhost:3012/comm
NEXT_PUBLIC_COMMON_API_URL=http://localhost:3011/common
NEXT_PUBLIC_INSPECTION_API_URL=http://localhost:3013/inspection
NEXT_PUBLIC_BACKEND_URL=http://localhost:3011   # 파일 서빙용

# 서버 전용
SESSION_TIMEOUT=1800000   # 30분 (ms)
SESSION_WARNING_TIME=120000  # 2분 (ms)
```
