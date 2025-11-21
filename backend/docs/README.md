# Backend 문서

백엔드 프로젝트의 모든 문서를 체계적으로 관리합니다.

## 📁 문서 구조

```
docs/
├── architecture/          # 아키텍처 및 설계
│   ├── MAINTAINABILITY_PROPOSAL.md
│   ├── README_MAINTAINABILITY.md
│   └── BEFORE_AFTER_COMPARISON.md
├── development/          # 개발 가이드
│   ├── CODE_QUALITY_GUIDE.md
│   ├── ERROR_HANDLING_GUIDE.md
│   └── SECURITY_GUIDE.md
├── operations/           # 운영 및 배포
│   ├── migration/        # PostgreSQL 마이그레이션
│   ├── ENVIRONMENT_SETUP.md
│   ├── FIXES_SUMMARY.md
│   └── P0_OPTIMIZATION_SUMMARY.md
├── guides/              # 요약 및 빠른 참조
│   ├── PERFORMANCE_OPTIMIZATION.md
│   ├── CODE_QUALITY_SUMMARY.md
│   ├── PERFORMANCE_SUMMARY.md
│   └── SECURITY_SUMMARY.md
└── swagger/             # API 문서
    └── (Swagger 관련 파일)
```

## 📚 주요 문서

### 🏗️ Architecture (아키텍처)

#### [MAINTAINABILITY_PROPOSAL.md](./architecture/MAINTAINABILITY_PROPOSAL.md)
백엔드 유지보수성 개선을 위한 상세 제안서
- 현재 문제점 분석
- Repository 패턴 도입
- 5단계 개선 계획
- 8주 구현 로드맵

#### [README_MAINTAINABILITY.md](./architecture/README_MAINTAINABILITY.md)
유지보수성 개선을 위한 빠른 시작 가이드
- 즉시 실행 가능한 예제
- Phase별 체크리스트
- 성능 비교 및 FAQ

#### [BEFORE_AFTER_COMPARISON.md](./architecture/BEFORE_AFTER_COMPARISON.md)
리팩토링 전후 코드 비교
- 5가지 실전 예제
- 마이그레이션 가이드
- 코드 메트릭 비교

### 💻 Development (개발)

#### [CODE_QUALITY_GUIDE.md](./development/CODE_QUALITY_GUIDE.md)
코드 품질 가이드라인
- 코딩 표준
- Best Practices
- Code Review 체크리스트

#### [ERROR_HANDLING_GUIDE.md](./development/ERROR_HANDLING_GUIDE.md)
에러 처리 가이드
- 표준화된 에러 처리
- ApiError 클래스 사용법
- 에러 코드 체계

#### [SECURITY_GUIDE.md](./development/SECURITY_GUIDE.md)
보안 개발 가이드
- 인증/인가
- SQL Injection 방지
- XSS 방지
- 보안 Best Practices

### 🚀 Operations (운영)

#### [migration/README.md](./operations/migration/README.md)
PostgreSQL 마이그레이션 문서
- MongoDB → PostgreSQL 전환 과정
- 변환 완료 보고서 (9개 문서)
- 마이그레이션 가이드
- 적용 및 배포 로그

#### [ENVIRONMENT_SETUP.md](./operations/ENVIRONMENT_SETUP.md)
개발 환경 설정 가이드
- 필수 소프트웨어 설치
- 환경변수 설정
- 데이터베이스 설정

#### [FIXES_SUMMARY.md](./operations/FIXES_SUMMARY.md)
주요 버그 수정 내역
- 수정된 이슈 목록
- 해결 방법
- 영향 범위

#### [P0_OPTIMIZATION_SUMMARY.md](./operations/P0_OPTIMIZATION_SUMMARY.md)
최우선 성능 최적화 내역
- Critical 성능 개선
- 측정 결과
- 적용 가이드

### 📖 Guides (가이드)

#### [PERFORMANCE_OPTIMIZATION.md](./guides/PERFORMANCE_OPTIMIZATION.md)
성능 최적화 가이드
- 데이터베이스 최적화
- 쿼리 최적화
- 인덱스 전략

#### [CODE_QUALITY_SUMMARY.md](./guides/CODE_QUALITY_SUMMARY.md)
코드 품질 개선 요약
- 주요 개선 사항
- 빠른 참조

#### [PERFORMANCE_SUMMARY.md](./guides/PERFORMANCE_SUMMARY.md)
성능 개선 요약
- 측정 결과
- Before/After 비교

#### [SECURITY_SUMMARY.md](./guides/SECURITY_SUMMARY.md)
보안 개선 요약
- 적용된 보안 조치
- 체크리스트

## 🎯 문서 사용 가이드

### 신규 개발자 온보딩
1. [ENVIRONMENT_SETUP.md](./operations/ENVIRONMENT_SETUP.md) - 환경 설정
2. [CODE_QUALITY_GUIDE.md](./development/CODE_QUALITY_GUIDE.md) - 코딩 표준 학습
3. [README_MAINTAINABILITY.md](./architecture/README_MAINTAINABILITY.md) - 아키텍처 이해

### 기능 개발 시
1. [BEFORE_AFTER_COMPARISON.md](./architecture/BEFORE_AFTER_COMPARISON.md) - 코드 패턴 참조
2. [ERROR_HANDLING_GUIDE.md](./development/ERROR_HANDLING_GUIDE.md) - 에러 처리
3. [SECURITY_GUIDE.md](./development/SECURITY_GUIDE.md) - 보안 체크

### 성능 개선 시
1. [PERFORMANCE_OPTIMIZATION.md](./guides/PERFORMANCE_OPTIMIZATION.md) - 최적화 전략
2. [P0_OPTIMIZATION_SUMMARY.md](./operations/P0_OPTIMIZATION_SUMMARY.md) - 적용 사례

### 문제 해결 시
1. [FIXES_SUMMARY.md](./operations/FIXES_SUMMARY.md) - 기존 이슈 확인
2. [ERROR_HANDLING_GUIDE.md](./development/ERROR_HANDLING_GUIDE.md) - 에러 처리 방법

## 📝 문서 작성 규칙

### 새 문서 추가 시
1. 적절한 카테고리 선택 (architecture/development/operations/guides)
2. Markdown 형식 사용
3. 이 README에 문서 링크 추가
4. Git commit 메시지에 `docs:` 접두사 사용

### 문서 업데이트 시
1. 날짜와 버전 명시
2. 변경 이력 기록
3. 관련 문서 링크 업데이트

## 🔗 관련 리소스

### 내부 리소스
- [../repositories/](../repositories/) - Repository 패턴 구현
- [../queries/](../queries/) - SQL 쿼리 정의
- [../services/](../services/) - 비즈니스 로직
- [../routes/](../routes/) - API 라우트

### 외부 리소스
- [Express.js 문서](https://expressjs.com/)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 📞 문의

문서 관련 질문이나 개선 사항:
- GitHub Issue 생성
- 팀 슬랙 채널 `#backend`
- Pull Request로 직접 기여

---

**최종 업데이트**: 2025-11-21
**관리자**: Backend Team
