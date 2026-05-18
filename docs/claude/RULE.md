# RULE — CoreNext 개발 규칙 및 컨벤션

> Claude Code가 이 프로젝트에서 코드를 작성하거나 수정할 때 반드시 따라야 할 규칙이다.

---

## 1. 빌드 및 의존성 규칙

### 빌드 순서

```bash
# 반드시 shared 먼저 빌드 후 서비스 빌드
npm run build:shared     # 1단계 (필수 선행)
npm run build:services   # 2단계 (병렬 빌드)
npm run build            # 3단계 (Next.js)
```

서비스 코드에서 `@enterprise/shared` 타입/함수를 추가하면 `build:shared`를 먼저 실행해야 서비스 컴파일이 성공한다.

### 패키지 추가 원칙

- MUI v6 범위 내에서 해결 가능한 UI는 새 라이브러리를 추가하지 않는다.
- 이미 존재하는 라이브러리(exceljs, jsPDF, TipTap 등)로 해결한다.
- 새 패키지 추가 시 프론트엔드/서비스 구분 후 올바른 `package.json`에 추가한다.

---

## 2. API 클라이언트 규칙

### 기존 클라이언트 사용

새 API 호출은 반드시 기존 6개 클라이언트 중 적합한 것을 사용한다:

| 클라이언트 | 사용 대상 |
|-----------|----------|
| `authApi` | `/auth/*` 엔드포인트 |
| `adminApi` | `/admin/*` 엔드포인트 |
| `commonApi` | `/common/*` 엔드포인트 |
| `contentApi` | `/content/*` 엔드포인트 |
| `commApi` | `/comm/*` 엔드포인트 |
| `inspectionApi` | `/inspection/*` 엔드포인트 |

```typescript
// 올바른 사용
import { adminApi } from '@/lib/axios';
const res = await adminApi.get('/users');

// 금지: 직접 axios 인스턴스 생성
import axios from 'axios'; // ❌ 새 인스턴스 생성 금지
```

### 토큰 처리

- `accessToken`, `refreshToken`은 `localStorage`에 저장하는 패턴을 유지한다.
- 토큰 저장 위치를 변경하려면 `src/lib/axios/index.ts` 인터셉터를 함께 수정해야 한다.
- 401 자동 갱신 로직은 axios 인터셉터에서만 처리한다. 각 컴포넌트에서 중복 처리하지 않는다.

---

## 3. 다국어 (i18n) 규칙

### 하드코딩 금지

```typescript
// 금지
<Typography>사용자 관리</Typography>  // ❌

// 올바른 사용
const t = useI18n();
<Typography>{t('userManagement')}</Typography>  // ✅
```

### 훅 사용 구분

```typescript
// 클라이언트 컴포넌트 ('use client')
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';

// 서버 컴포넌트
import { getI18n } from '@/lib/i18n/server';
```

### 번역 파일 위치

```
src/lib/i18n/locales/
├── en.ts   # 영어 (기준)
├── ko.ts
├── zh.ts
└── vi.ts
```

새 문자열 추가 시 4개 언어 파일 모두 추가한다.

### 다국어 데이터 필드 (DB/API)

메뉴명, 코드값 등 다국어가 필요한 필드는 `name_en`, `name_ko`, `name_zh`, `name_vi` 패턴을 사용한다. `multiLangTransform` 유틸리티를 활용한다.

---

## 4. 라우팅 및 페이지 규칙

### 새 페이지 생성

```
src/app/[locale]/새기능/
├── page.tsx          # 진입점
└── layout.tsx        # (필요 시)
```

- 반드시 `[locale]` 하위에 생성한다.
- 페이지에는 `RouteGuard`를 적용하고 `programCode`를 등록한다.
- 새 기능 모듈은 core-service의 `programs` 테이블에 등록해야 메뉴/권한 시스템에서 인식된다.

### RouteGuard 패턴

```tsx
// 모든 보호된 페이지에 적용
export default function UserManagementPage() {
  return (
    <RouteGuard programCode="PROG-USER-MGMT" requiredPermission="view">
      <UserManagementContent />
    </RouteGuard>
  );
}
```

---

## 5. 권한 시스템 규칙

### 버튼/액션 가시성

```typescript
// 데이터 그리드 페이지
const permissions = useDataGridPermissions('PROG-USER-MGMT');
// permissions.canCreate, canUpdate, canDelete

// 일반 페이지
const { canCreate, canUpdate, canDelete } = usePermissionControl('PROG-USER-MGMT');
```

- 권한이 없는 버튼은 숨긴다 (disabled가 아닌 hidden).
- 서버에서도 반드시 권한을 재검증한다 (클라이언트 권한 체크는 UX 용도).

---

## 6. 컴포넌트 규칙

### 타입 정의

- 새 타입은 `src/types/` (프론트엔드) 또는 `services/[서비스명]/src/types/` (서비스)에 정의한다.
- 공용 타입은 `shared/src/types/`에 추가한다.

### 컴포넌트 위치

```
src/components/
├── common/      # 여러 도메인에서 재사용
├── admin/       # 관리자 페이지 전용
├── boards/      # 게시판 전용
├── inspection/  # 검수 전용
└── layout/      # 레이아웃 전용
```

### 상태 관리

- 전역 상태는 기존 3개 Context(Auth/Menu/Permission)로 처리한다.
- **Redux, Zustand 도입 금지.** 새 전역 상태가 필요하면 Context 패턴으로 추가한다.

---

## 7. 데이터베이스 변경 규칙

### Liquibase 마이그레이션 필수

```xml
<!-- database/changelog/v1.0/NNN-description.xml -->
<changeSet id="NNN" author="작성자">
  <createTable tableName="new_table">
    ...
  </createTable>
</changeSet>
```

- **직접 SQL 수정 금지.** 모든 스키마 변경은 Liquibase XML로 작성한다.
- 새 마이그레이션 파일은 기존 번호를 이어서 순서를 맞춘다.
- `required/` 시드는 운영 환경에도 적용되므로 신중하게 작성한다.

---

## 8. 환경변수 규칙

| 규칙 | 설명 |
|------|------|
| `NEXT_PUBLIC_` prefix | 브라우저에 노출됨. 비밀값(토큰, 비밀번호) 절대 금지 |
| 서비스 시크릿 | 각 서비스 `.env` 파일에만 저장 |
| 기본값 | `.env.example`에 항상 업데이트 |

---

## 9. 절대 금지사항

| 금지 | 이유 |
|------|------|
| `output: 'standalone'` 활성화 | Next.js 16 middleware 버그 (next.config.ts 참고) |
| Redux / Zustand 도입 | 아키텍처 일관성 유지 (Context 패턴 사용) |
| Oracle 전용 SQL을 기본 경로에 포함 | PostgreSQL이 기본, Oracle은 선택적 지원 |
| `--no-verify` git commit | 훅 우회 금지 |
| 새 axios 인스턴스 직접 생성 | 6개 기존 클라이언트 사용 |
| `localStorage` 이외 위치에 토큰 저장 | 인터셉터와 AuthContext가 localStorage를 직접 읽음 |
| 서버 컴포넌트에서 `useI18n()` 사용 | 클라이언트 전용 훅, 서버에서는 `getI18n()` 사용 |

---

## 10. 서비스 경계 규칙

각 서비스는 독립적이다. 서비스 간 직접 HTTP 호출 없이 프론트엔드가 중간에서 조율한다.

| 서비스 | 담당 도메인 |
|--------|-----------|
| core-service | 인증, 사용자, 역할, 메뉴, 코드, 부서, 프로그램, 로그 |
| app-service | 게시판, 게시글, 댓글, 메일, 메시지, 대화 |
| inspection-service | 체크시트 템플릿, 검수, 오프라인 동기화 |

다른 서비스의 DB 테이블을 직접 참조하지 않는다.

---

## 11. 코드 품질

```bash
# 커밋 전 반드시 실행
npm run lint
npm run type-check
```

- TypeScript strict 모드 사용 중. `any` 타입 남용 금지.
- ESLint 규칙 위반 코드는 커밋하지 않는다.
- 테스트 스크립트 없음 — `npm run lint && npm run type-check`가 CI 대용.
