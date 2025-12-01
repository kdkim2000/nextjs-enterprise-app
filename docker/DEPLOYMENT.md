# Docker Deployment Guide

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Server                         │
│  ┌─────────┐    ┌──────────────┐    ┌──────────────┐        │
│  │  Nginx  │───▶│   Frontend   │    │   Backend    │        │
│  │  :80    │    │   :3000      │    │   :3001      │        │
│  └────┬────┘    └──────────────┘    └──────┬───────┘        │
│       │                                     │                │
│       └────────────── /api ────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │  <REDACTED_IP>    │
                    │     :9090        │
                    └──────────────────┘
```

## 파일 구조

```
docker/
├── backend.Dockerfile      # Backend 이미지
├── frontend.Dockerfile     # Frontend 이미지
├── docker-compose.yml      # 전체 서비스 구성
├── nginx.conf              # Reverse proxy 설정
├── .env.docker             # 환경변수 템플릿
└── DEPLOYMENT.md           # 이 문서
```

---

## 로컬에서 빌드 & 테스트

### 1. 이미지 빌드

```bash
cd E:/apps/nextjs-enterprise-app

# Backend 이미지 빌드
docker build -f docker/backend.Dockerfile -t corenext-backend:latest .

# Frontend 이미지 빌드
docker build -f docker/frontend.Dockerfile -t corenext-frontend:latest .
```

### 2. 로컬 테스트

```bash
# 환경변수 설정
cp docker/.env.docker docker/.env
# .env 파일 수정 (비밀번호 등)

# 서비스 실행
cd docker
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

---

## 운영 서버 배포

### 방법 1: Docker Hub 이용

```bash
# 1. 로컬에서 이미지 빌드 & 푸시
docker build -f docker/backend.Dockerfile -t your-registry/corenext-backend:v1.0 .
docker build -f docker/frontend.Dockerfile -t your-registry/corenext-frontend:v1.0 .

docker push your-registry/corenext-backend:v1.0
docker push your-registry/corenext-frontend:v1.0

# 2. 운영 서버에서 Pull & Run
docker pull your-registry/corenext-backend:v1.0
docker pull your-registry/corenext-frontend:v1.0
```

### 방법 2: 이미지 파일 직접 전송

```bash
# 1. 로컬에서 이미지 저장
docker save corenext-backend:latest | gzip > corenext-backend.tar.gz
docker save corenext-frontend:latest | gzip > corenext-frontend.tar.gz

# 2. 서버로 전송
scp corenext-*.tar.gz user@server:/path/to/

# 3. 서버에서 이미지 로드
docker load < corenext-backend.tar.gz
docker load < corenext-frontend.tar.gz
```

### 방법 3: 서버에서 직접 빌드

```bash
# 1. 소스 코드 전송
scp -r . user@server:/app/corenext/

# 2. 서버에서 빌드
ssh user@server
cd /app/corenext
docker-compose -f docker/docker-compose.yml build
docker-compose -f docker/docker-compose.yml up -d
```

---

## 환경변수 설정

### 필수 환경변수

```env
# Database
DB_HOST=<REDACTED_IP>
DB_PORT=9090
DB_NAME=corenextdb
DB_USER=corenext
DB_PASSWORD=<REDACTED_PASSWORD>

# JWT (운영환경에서는 새로 생성)
JWT_SECRET=<새로운_비밀키>
JWT_REFRESH_SECRET=<새로운_비밀키>

# API URL (상대경로 사용 - Nginx가 /api를 backend로 프록시)
NEXT_PUBLIC_API_URL=/api
```

### JWT 비밀키 생성

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 배포 후 확인

```bash
# 서비스 상태
docker-compose ps

# 헬스 체크
curl http://localhost:3001/health
curl http://localhost:3000

# 로그 확인
docker-compose logs backend
docker-compose logs frontend
```

---

## 트러블슈팅

### Frontend 빌드 실패
- `output: 'standalone'`이 next.config.ts에 활성화되어 있는지 확인
- 메모리 부족시: `docker build --memory=4g`

### DB 연결 실패
- 비밀번호에 특수문자(`#`, `$`)가 있으면 따옴표로 감싸기
- 방화벽에서 9090 포트 열려있는지 확인

### 컨테이너간 통신 실패
- docker-compose network 확인
- `http://backend:3001` vs `http://localhost:3001`
