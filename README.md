# Enterprise Next.js Application

최신 Next.js 16 기반의 엔터프라이즈급 웹 애플리케이션입니다. MUI (Material-UI)를 채택하고, Node.js 기반 Mock 백엔드를 포함하며, 추후 Spring Boot로 마이그레이션 가능하도록 설계되었습니다.

## 주요 기능

### 인증 시스템
- ✅ ID/Password 기반 로그인
- ✅ MFA (Multi-Factor Authentication) 이메일 인증
- ✅ SSO 로그인 (Placeholder - 추후 구현)
- ✅ JWT 기반 인증 및 토큰 갱신
- ✅ 자동 로그아웃 (세션 타임아웃)

### 메뉴 시스템
- ✅ 다단계 메뉴 구조 (무제한 depth)
- ✅ 사용자별 접근 권한 관리
- ✅ 즐겨찾기 메뉴
- ✅ 최근 접속 메뉴 (최근 10개)
- ✅ Footer에 현재 프로그램 정보 표시

### 로깅 시스템
- ✅ 사용자 로그인 로깅
- ✅ 메뉴/화면 접속 로깅
- ✅ 모든 트랜잭션 로깅 (요청/응답)
- ✅ DB 저장 (JSON 파일로 모킹)

### 다국어 지원
- ✅ 한국어/영어 지원
- ✅ 실시간 언어 전환
- ✅ next-international 사용

### 추가 기능
- ✅ Excel 친화적 Grid (MUI X Data Grid)
- ✅ HTML5 Text Editor (TipTap)
- ✅ 파일 업로드/다운로드 (Drag & Drop)
- ✅ Excel 생성 및 내보내기
- ✅ PDF 생성 및 내보내기
- ✅ Grid Excel Import/Export

## 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Material-UI (MUI) v6
- **Language**: TypeScript
- **State Management**: React Context API
- **HTTP Client**: Axios
- **i18n**: next-international

### Backend (Mock)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT
- **Data Storage**: JSON files

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

프론트엔드와 백엔드를 동시에 실행:

```bash
npm run dev
```

또는 개별 실행:

```bash
# 프론트엔드만
npm run dev:frontend

# 백엔드만
npm run dev:backend
```

### 3. 애플리케이션 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001/api
- **백엔드 Health Check**: http://localhost:3001/health

## 데모 계정

### Admin 계정 (MFA 활성화)
- **Username**: admin
- **Password**: admin123
- **Role**: admin
- **MFA**: 활성화됨 (개발 모드에서는 코드가 콘솔에 출력됩니다)

### User 계정
- **Username**: john.doe
- **Password**: password123
- **Role**: user

## 주요 기능 사용법

### 로그인
1. http://localhost:3000 접속
2. 데모 계정으로 로그인
3. MFA가 활성화된 경우, 백엔드 콘솔에서 인증 코드 확인
4. 인증 코드 입력 후 로그인 완료

### 메뉴 탐색
- 좌측 상단 메뉴 버튼 클릭
- 계층적 메뉴 구조 탐색
- 별 아이콘으로 즐겨찾기 추가/제거

### 자동 로그아웃
- 30분간 활동이 없으면 세션 만료
- 만료 2분 전에 경고 모달 표시

### 언어 변경
- 우측 상단 언어 버튼 (EN/KO) 클릭

## 프로젝트 구조

상세한 구조는 `ARCHITECTURE.md` 파일을 참고하세요.

## 추가 문서

- `ARCHITECTURE.md` - 상세한 아키텍처 설계 문서
- `FEATURES.md` - 모든 기능 상세 가이드 및 사용법
- `VERCEL_DEPLOYMENT.md` - Vercel 배포 가이드 ⭐ NEW
- `backend/` - Mock 백엔드 구현
- `src/` - 프론트엔드 소스 코드

## Vercel 배포

이 프로젝트는 Vercel에 배포할 수 있습니다:

- **Live Demo**: https://nextjs-enterprise-app-gamma.vercel.app
- **배포 가이드**: `VERCEL_DEPLOYMENT.md` 참고

⚠️ **중요**: 이 애플리케이션은 프론트엔드(Next.js)와 백엔드(Express)로 구성되어 있습니다. Vercel에는 프론트엔드만 배포되므로, 완전한 기능을 위해서는 백엔드를 별도로 배포해야 합니다. 자세한 내용은 `VERCEL_DEPLOYMENT.md`를 참고하세요.

## 구현된 모든 컴포넌트

### 공통 컴포넌트
1. **ExcelDataGrid** (`src/components/common/DataGrid/`)
   - Excel 친화적 그리드
   - Import/Export 기능
   - 인라인 편집
   - 정렬, 필터링, 페이지네이션

2. **RichTextEditor** (`src/components/common/RichTextEditor/`)
   - HTML5 기반 에디터
   - Editor/Viewer 모드
   - Bold, Italic, Lists, Links, Images, Tables
   - XSS 보호

3. **FileUpload** (`src/components/common/FileUpload/`)
   - Drag & Drop 파일 업로드
   - 진행률 표시
   - 멀티 파일 지원
   - 파일 크기/형식 제한

4. **Footer** (`src/components/common/Footer/`)
   - 현재 프로그램 정보 표시
   - 버전 및 저작권

5. **AutoLogoutWarning** (`src/components/common/AutoLogoutWarning/`)
   - 세션 만료 경고 모달
   - 자동 로그아웃 타이머

### 레이아웃 컴포넌트
1. **Sidebar** (`src/components/layout/Sidebar/`)
   - 다단계 메뉴 네비게이션
   - 즐겨찾기 메뉴
   - 메뉴 검색 (예정)

### 페이지
1. **Dashboard** (`src/app/[locale]/dashboard/page.tsx`)
2. **Login** (`src/app/[locale]/login/page.tsx`)
3. **Components Showcase** (`src/app/[locale]/dashboard/components/page.tsx`)
4. **User Management** (`src/app/[locale]/dashboard/user-management/page.tsx`)

### 유틸리티
1. **Excel** (`src/lib/excel/`)
   - Excel 파일 생성
   - Excel 파일 파싱
   - 템플릿 생성

2. **PDF** (`src/lib/pdf/`)
   - PDF 테이블 생성
   - PDF 리포트 생성
   - HTML to PDF

3. **Axios** (`src/lib/axios/`)
   - HTTP 클라이언트
   - 인터셉터 (토큰, 에러 처리)

4. **i18n** (`src/lib/i18n/`)
   - 다국어 지원
   - 한국어/영어

## 빠른 시작 데모

### 1. 컴포넌트 쇼케이스 접속
1. 로그인 (admin/admin123)
2. 사이드바에서 "Components" 메뉴 클릭
3. 3개 탭에서 각 컴포넌트 테스트

### 2. Excel Export 테스트
1. Components 페이지 → Data Grid 탭
2. "Export" 버튼 클릭
3. Excel 파일 다운로드 확인

### 3. File Upload 테스트
1. Components 페이지 → File Upload 탭
2. 파일을 드래그하여 업로드
3. 진행률 및 완료 확인

### 4. Text Editor 테스트
1. Components 페이지 → Rich Text Editor 탭
2. 텍스트 입력 및 서식 적용
3. Editor/Viewer 모드 전환

## Spring Boot 마이그레이션

백엔드를 Spring Boot로 마이그레이션할 때:
- `backend/routes/` → Spring Controllers
- `backend/data/` → JPA Entities + Repositories
- `backend/middleware/` → Spring Interceptors/Filters
- API 계약은 동일하게 유지

자세한 내용은 `ARCHITECTURE.md`의 "Migration Path to Spring Boot" 섹션을 참고하세요.

## 라이선스

MIT
