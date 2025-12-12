# MSA 통합 서비스 배포 가이드

## 개요

이 문서는 5개 마이크로서비스를 2개로 통합한 새로운 MSA 구조의 배포 절차를 설명합니다.

### 서비스 구조

| 서비스 | 포트 | 통합 모듈 | API 경로 |
|--------|------|-----------|----------|
| **core-service** | 3011 | Auth + Admin + Common | `/auth/*`, `/admin/*`, `/common/*` |
| **app-service** | 3012 | Content + Communication | `/content/*`, `/comm/*` |

---

## 1. 사전 준비

### 1.1 필수 요구사항

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### 1.2 환경 변수 설정

```bash
cd infrastructure/docker
cp .env.example .env
```

`.env` 파일 편집:
```env
# Database
DB_NAME=corenextdb
DB_USER=corenext
DB_PASSWORD=<secure-password>

# JWT
JWT_SECRET=<64-byte-random-string>
JWT_REFRESH_SECRET=<64-byte-random-string>

# Redis
REDIS_PASSWORD=<secure-password>

# CORS
CORS_ORIGINS=https://your-domain.com
```

---

## 2. 로컬 개발 환경

### 2.1 의존성 설치 및 빌드

```bash
# Shared 라이브러리 빌드
cd shared
npm install && npm run build
cd ..

# Core Service 빌드
cd services/core-service
npm install && npm run build
cd ../..

# App Service 빌드
cd services/app-service
npm install && npm run build
cd ../..
```

### 2.2 서비스 실행

```bash
# Core Service (터미널 1)
cd services/core-service
npm start
# 포트 3011에서 실행

# App Service (터미널 2)
cd services/app-service
npm start
# 포트 3012에서 실행
```

### 2.3 API 테스트

```bash
# Health Check
curl http://localhost:3011/health  # core-service
curl http://localhost:3012/health  # app-service

# 통합 테스트 스크립트
./scripts/test-api.sh
```

---

## 3. Docker 배포

### 3.1 이미지 빌드

```bash
cd infrastructure/docker

# Core Service
docker build -t corenext-core-service:latest \
  -f ../../services/core-service/Dockerfile \
  ../..

# App Service
docker build -t corenext-app-service:latest \
  -f ../../services/app-service/Dockerfile \
  ../..
```

### 3.2 서비스 시작

```bash
# 전체 서비스 시작
docker-compose up -d

# MSA 서비스만 시작
docker-compose up -d core-service app-service

# 로그 확인
docker-compose logs -f core-service app-service
```

### 3.3 서비스 상태 확인

```bash
# 컨테이너 상태
docker-compose ps

# 헬스체크
curl http://localhost:3011/health
curl http://localhost:3012/health
```

---

## 4. 배포 전략

### 4.1 블루-그린 배포 (권장)

```bash
# 1. 새 버전 이미지 빌드
docker build -t corenext-core-service:v2 ...
docker build -t corenext-app-service:v2 ...

# 2. 새 컨테이너 시작 (다른 포트)
docker run -d --name core-service-green -p 3021:3011 corenext-core-service:v2
docker run -d --name app-service-green -p 3022:3012 corenext-app-service:v2

# 3. 헬스체크 확인
curl http://localhost:3021/health
curl http://localhost:3022/health

# 4. Nginx 설정 변경 (트래픽 전환)
# nginx.conf에서 upstream 포트 변경

# 5. 기존 컨테이너 제거
docker stop core-service-blue app-service-blue
docker rm core-service-blue app-service-blue
```

### 4.2 롤백 절차

```bash
# 1. Nginx 설정 복원
# 2. 이전 버전 컨테이너 시작
docker run -d --name core-service -p 3011:3011 corenext-core-service:v1
docker run -d --name app-service -p 3012:3012 corenext-app-service:v1
```

---

## 5. API 체크리스트

### 5.1 Core Service (Port 3011)

| API | 경로 | 인증 | 상태 |
|-----|------|------|------|
| **Auth** | | | |
| 로그인 | POST /auth/login | 불필요 | |
| 로그아웃 | POST /auth/logout | 필요 | |
| 토큰 갱신 | POST /auth/refresh | 필요 | |
| 비밀번호 변경 | POST /auth/change-password | 필요 | |
| **Admin** | | | |
| 사용자 목록 | GET /admin/users | Admin | |
| 사용자 상세 | GET /admin/users/:id | Admin | |
| 역할 목록 | GET /admin/roles | Admin | |
| 메뉴 목록 | GET /admin/menus | Admin | |
| 부서 목록 | GET /admin/departments | Admin | |
| **Common** | | | |
| 코드 목록 | GET /common/codes | 필요 | |
| 코드 타입 | GET /common/code-types | 필요 | |
| 설정 | GET /common/settings | 필요 | |
| 첨부파일 업로드 | POST /common/attachments | 필요 | |

### 5.2 App Service (Port 3012)

| API | 경로 | 인증 | 상태 |
|-----|------|------|------|
| **Content** | | | |
| 게시판 타입 | GET /content/board-types | 불필요 | |
| 게시글 목록 | GET /content/posts | 불필요 | |
| 게시글 작성 | POST /content/posts | 필요 | |
| 댓글 목록 | GET /content/comments?postId= | 불필요 | |
| Q&A 목록 | GET /content/qna | 불필요 | |
| 도움말 | GET /content/help | 불필요 | |
| **Communication** | | | |
| 메일 목록 | GET /comm/mail/messages | 필요 | |
| 메일 발송 | POST /comm/mail/send | 필요 | |
| 시스템 메시지 | GET /comm/messages | 필요 | |
| 대화 목록 | GET /comm/conversations | 불필요 | |
| 대화 통계 | GET /comm/conversations/stats | 불필요 | |

---

## 6. 모니터링

### 6.1 헬스체크 엔드포인트

```bash
# Core Service
GET http://localhost:3011/health
GET http://localhost:3011/metrics

# App Service
GET http://localhost:3012/health
GET http://localhost:3012/metrics
```

### 6.2 로그 확인

```bash
# Docker 로그
docker-compose logs -f core-service
docker-compose logs -f app-service

# 서비스별 로그 위치
# core-service: /app/logs/core-service.log
# app-service: /app/logs/app-service.log
```

### 6.3 Grafana 대시보드

```
http://localhost:3100
- 사용자: admin
- 비밀번호: (GRAFANA_ADMIN_PASSWORD)
```

---

## 7. 문제 해결

### 7.1 일반적인 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| ECONNREFUSED | DB 연결 실패 | DB 서비스 상태 확인 |
| 401 Unauthorized | JWT 토큰 만료/무효 | 토큰 갱신 또는 재로그인 |
| 503 Service Unavailable | 서비스 미실행 | 컨테이너 상태 확인 |

### 7.2 디버깅

```bash
# 컨테이너 쉘 접속
docker exec -it corenext-core-service /bin/sh
docker exec -it corenext-app-service /bin/sh

# 환경 변수 확인
docker exec corenext-core-service env

# 네트워크 확인
docker network inspect corenext-network
```

---

## 8. 기존 서비스 제거 (마이그레이션 완료 후)

```bash
# 기존 5개 서비스 중지 및 제거
docker-compose down auth-service admin-service content-service communication-service common-service

# 기존 이미지 제거
docker rmi corenext-auth-service corenext-admin-service \
           corenext-content-service corenext-communication-service \
           corenext-common-service

# 기존 서비스 폴더 (deprecated로 표시 또는 삭제)
# services/auth-service/
# services/admin-service/
# services/content-service/
# services/communication-service/
# services/common-service/
```

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2025-12-12 | 1.0 | 초기 작성 - MSA 통합 (5개 → 2개) |
