# Docker 배포 가이드

## 📋 목차

1. [개요](#개요)
2. [사전 요구사항](#사전-요구사항)
3. [빠른 시작](#빠른-시작)
4. [상세 배포 방법](#상세-배포-방법)
5. [환경 변수 설정](#환경-변수-설정)
6. [데이터 영속성](#데이터-영속성)
7. [Docker Hub 배포](#docker-hub-배포)
8. [프로덕션 배포](#프로덕션-배포)
9. [문제 해결](#문제-해결)

---

## 개요

이 프로젝트는 Docker를 사용하여 컨테이너화된 환경에서 실행할 수 있습니다.

### 특징

- **Multi-stage Build**: 최적화된 이미지 크기
- **Non-root User**: 보안을 위한 비특권 사용자 실행
- **Health Check**: 컨테이너 상태 모니터링
- **Volume 지원**: 데이터 영속성 보장
- **Production-ready**: 프로덕션 환경에 최적화

---

## 사전 요구사항

### 필수 소프트웨어

- **Docker**: 20.10 이상
- **Docker Compose**: 2.0 이상 (선택사항)

### 설치 확인

```bash
# Docker 버전 확인
docker --version
# Docker version 24.0.0 이상

# Docker Compose 버전 확인
docker compose version
# Docker Compose version v2.20.0 이상
```

### Docker 설치

#### Windows
- Docker Desktop for Windows 다운로드: https://www.docker.com/products/docker-desktop

#### macOS
- Docker Desktop for Mac 다운로드: https://www.docker.com/products/docker-desktop

#### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 빠른 시작

### 방법 1: Docker Compose 사용 (권장)

```bash
# 1. 환경 변수 설정
cp env.docker.template .env

# 2. JWT Secret 생성 및 설정 (.env 파일 수정)
# JWT_SECRET과 JWT_REFRESH_SECRET을 안전한 값으로 변경

# 3. Docker Compose로 실행
docker compose up -d

# 4. 로그 확인
docker compose logs -f

# 5. 브라우저에서 접속
# http://localhost:3000
```

### 방법 2: Docker 명령어 직접 사용

```bash
# 1. 이미지 빌드
docker build -t nextjs-enterprise-app:latest .

# 2. 컨테이너 실행
docker run -d \
  --name nextjs-enterprise-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=/api \
  -e JWT_SECRET=your-secret-key \
  -e JWT_REFRESH_SECRET=your-refresh-secret-key \
  -v nextjs-data:/app/data \
  nextjs-enterprise-app:latest

# 3. 로그 확인
docker logs -f nextjs-enterprise-app
```

---

## 상세 배포 방법

### 1. 프로젝트 준비

```bash
# 프로젝트 클론
git clone https://github.com/yourusername/nextjs-enterprise-app.git
cd nextjs-enterprise-app

# 브랜치 확인
git branch
```

### 2. 환경 변수 설정

```bash
# 템플릿 복사
cp env.docker.template .env

# .env 파일 수정
nano .env  # 또는 vi, code 등 사용
```

### 3. Docker 이미지 빌드

```bash
# 기본 빌드
docker build -t nextjs-enterprise-app:latest .

# 빌드 캐시 없이 빌드
docker build --no-cache -t nextjs-enterprise-app:latest .

# 특정 플랫폼용 빌드 (ARM64)
docker build --platform linux/arm64 -t nextjs-enterprise-app:latest .

# 빌드 진행상황 확인
docker build --progress=plain -t nextjs-enterprise-app:latest .
```

### 4. 컨테이너 실행

#### Docker Compose 사용

```bash
# 백그라운드 실행
docker compose up -d

# 포그라운드 실행 (로그 실시간 확인)
docker compose up

# 특정 서비스만 실행
docker compose up nextjs-app

# 재빌드하며 실행
docker compose up --build
```

#### Docker 명령어 사용

```bash
# 기본 실행
docker run -d \
  --name nextjs-enterprise-app \
  -p 3000:3000 \
  --env-file .env \
  nextjs-enterprise-app:latest

# Volume 마운트와 함께 실행
docker run -d \
  --name nextjs-enterprise-app \
  -p 3000:3000 \
  --env-file .env \
  -v nextjs-data:/app/data \
  -v $(pwd)/backend/data:/app/backend/data \
  nextjs-enterprise-app:latest

# 재시작 정책 설정
docker run -d \
  --name nextjs-enterprise-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  nextjs-enterprise-app:latest
```

### 5. 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps

# 상세 정보 확인
docker inspect nextjs-enterprise-app

# 헬스체크 상태 확인
docker inspect --format='{{.State.Health.Status}}' nextjs-enterprise-app

# 로그 확인
docker logs nextjs-enterprise-app

# 실시간 로그
docker logs -f nextjs-enterprise-app

# 최근 100줄만 확인
docker logs --tail 100 nextjs-enterprise-app
```

### 6. 컨테이너 관리

```bash
# 컨테이너 중지
docker stop nextjs-enterprise-app

# 컨테이너 시작
docker start nextjs-enterprise-app

# 컨테이너 재시작
docker restart nextjs-enterprise-app

# 컨테이너 삭제
docker rm nextjs-enterprise-app

# 강제 삭제
docker rm -f nextjs-enterprise-app
```

---

## 환경 변수 설정

### 필수 환경 변수

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `NEXT_PUBLIC_API_URL` | API 엔드포인트 URL | `/api` | `/api` |
| `JWT_SECRET` | JWT 토큰 시크릿 | - | `your-32-char-secret-key` |
| `JWT_REFRESH_SECRET` | JWT 리프레시 토큰 시크릿 | - | `your-32-char-refresh-secret` |

### 선택적 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NODE_ENV` | 실행 환경 | `production` |
| `SESSION_TIMEOUT` | 세션 타임아웃 (ms) | `1800000` (30분) |
| `SESSION_WARNING_TIME` | 세션 경고 시간 (ms) | `120000` (2분) |
| `PORT` | 애플리케이션 포트 | `3000` |
| `HOSTNAME` | 호스트명 | `0.0.0.0` |

### JWT Secret 생성

```bash
# OpenSSL 사용 (권장)
openssl rand -base64 32

# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Python 사용
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### .env 파일 예시

```bash
# Production Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=/api

# JWT Secrets (MUST CHANGE IN PRODUCTION!)
JWT_SECRET=3k8N9mP2qR5sT7uV0wX1yZ4aB6cD8eF0
JWT_REFRESH_SECRET=9jK8lM7nO6pQ5rS4tU3vW2xY1zA0bC9

# Session Configuration
SESSION_TIMEOUT=1800000
SESSION_WARNING_TIME=120000

# Server Configuration
PORT=3000
HOSTNAME=0.0.0.0
```

---

## 데이터 영속성

### Volume 사용

#### Named Volume (권장)

```bash
# Named Volume 생성
docker volume create nextjs-data

# Volume 사용
docker run -d \
  --name nextjs-enterprise-app \
  -p 3000:3000 \
  -v nextjs-data:/app/data \
  nextjs-enterprise-app:latest

# Volume 확인
docker volume ls

# Volume 상세 정보
docker volume inspect nextjs-data

# Volume 내용 확인
docker run --rm -v nextjs-data:/data alpine ls -la /data
```

#### Bind Mount

```bash
# 로컬 디렉토리 생성
mkdir -p ./docker-data

# Bind Mount 사용
docker run -d \
  --name nextjs-enterprise-app \
  -p 3000:3000 \
  -v $(pwd)/docker-data:/app/data \
  nextjs-enterprise-app:latest

# Windows의 경우
docker run -d \
  --name nextjs-enterprise-app \
  -p 3000:3000 \
  -v %cd%/docker-data:/app/data \
  nextjs-enterprise-app:latest
```

### 데이터 백업

```bash
# Volume 백업
docker run --rm \
  -v nextjs-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/nextjs-data-backup.tar.gz -C /data .

# 백업 복원
docker run --rm \
  -v nextjs-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/nextjs-data-backup.tar.gz -C /data
```

### 데이터 초기화

```bash
# Volume 삭제
docker volume rm nextjs-data

# 또는 컨테이너 내부에서 Admin API 사용
curl http://localhost:3000/api/admin/init-data \
  -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Docker Hub 배포

### 1. Docker Hub 로그인

```bash
docker login
# Username: your-dockerhub-username
# Password: your-dockerhub-password
```

### 2. 이미지 태그 지정

```bash
# 태그 형식: username/repository:tag
docker tag nextjs-enterprise-app:latest your-username/nextjs-enterprise-app:latest
docker tag nextjs-enterprise-app:latest your-username/nextjs-enterprise-app:v1.0.0
docker tag nextjs-enterprise-app:latest your-username/nextjs-enterprise-app:$(date +%Y%m%d)
```

### 3. 이미지 푸시

```bash
# Latest 태그 푸시
docker push your-username/nextjs-enterprise-app:latest

# 특정 버전 푸시
docker push your-username/nextjs-enterprise-app:v1.0.0

# 모든 태그 푸시
docker push your-username/nextjs-enterprise-app --all-tags
```

### 4. 다른 서버에서 실행

```bash
# 이미지 Pull
docker pull your-username/nextjs-enterprise-app:latest

# 실행
docker run -d \
  --name nextjs-enterprise-app \
  -p 3000:3000 \
  --env-file .env \
  -v nextjs-data:/app/data \
  your-username/nextjs-enterprise-app:latest
```

---

## 프로덕션 배포

### 1. 보안 설정

```bash
# 1. 안전한 JWT Secret 생성
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# 2. .env 파일에 저장
echo "JWT_SECRET=$JWT_SECRET" >> .env
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" >> .env

# 3. 파일 권한 설정
chmod 600 .env
```

### 2. Reverse Proxy 설정 (Nginx)

```nginx
# /etc/nginx/sites-available/nextjs-app
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Nginx 설정 활성화
sudo ln -s /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL/TLS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

### 4. Docker Compose 프로덕션 설정

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nextjs-app:
    image: your-username/nextjs-enterprise-app:latest
    container_name: nextjs-enterprise-app
    restart: always
    ports:
      - "127.0.0.1:3000:3000"  # localhost에만 바인딩
    env_file:
      - .env
    volumes:
      - app-data:/app/data
    networks:
      - nextjs-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

volumes:
  app-data:
    driver: local

networks:
  nextjs-network:
    driver: bridge
```

```bash
# 프로덕션 실행
docker compose -f docker-compose.prod.yml up -d
```

### 5. 모니터링 설정

```bash
# 컨테이너 리소스 사용량 확인
docker stats nextjs-enterprise-app

# 헬스체크 상태 확인
docker inspect --format='{{json .State.Health}}' nextjs-enterprise-app | jq

# 자동 재시작 확인
docker inspect --format='{{.HostConfig.RestartPolicy}}' nextjs-enterprise-app
```

---

## 문제 해결

### 문제 1: 빌드 실패

**증상:**
```
Error: Cannot find module 'next'
```

**해결:**
```bash
# node_modules 정리
rm -rf node_modules package-lock.json

# 캐시 없이 재빌드
docker build --no-cache -t nextjs-enterprise-app:latest .
```

### 문제 2: 컨테이너 시작 실패

**증상:**
```
Error: EACCES: permission denied
```

**해결:**
```bash
# Volume 권한 확인
docker run --rm -v nextjs-data:/data alpine ls -la /data

# Volume 재생성
docker volume rm nextjs-data
docker volume create nextjs-data

# 다시 실행
docker compose up -d
```

### 문제 3: 데이터가 저장되지 않음

**증상:**
- 컨테이너 재시작 시 데이터 손실

**해결:**
```bash
# Volume이 마운트되었는지 확인
docker inspect nextjs-enterprise-app | grep -A 10 Mounts

# Volume 마운트 추가
docker run -d \
  --name nextjs-enterprise-app \
  -p 3000:3000 \
  -v nextjs-data:/app/data \
  nextjs-enterprise-app:latest
```

### 문제 4: 포트 충돌

**증상:**
```
Error: port is already allocated
```

**해결:**
```bash
# 사용 중인 포트 확인
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# 다른 포트 사용
docker run -d \
  --name nextjs-enterprise-app \
  -p 8080:3000 \
  nextjs-enterprise-app:latest

# 접속: http://localhost:8080
```

### 문제 5: 환경 변수가 적용되지 않음

**증상:**
- JWT_SECRET 오류 발생

**해결:**
```bash
# 환경 변수 확인
docker exec nextjs-enterprise-app printenv | grep JWT

# .env 파일 확인
cat .env

# 컨테이너 재시작
docker restart nextjs-enterprise-app
```

### 문제 6: 이미지 크기가 너무 큼

**현재 상태 확인:**
```bash
docker images | grep nextjs-enterprise-app
```

**최적화:**
```bash
# Multi-stage build 이미 적용됨
# 추가 최적화: 불필요한 파일 제거
echo "docs/" >> .dockerignore
echo "*.md" >> .dockerignore

# 재빌드
docker build -t nextjs-enterprise-app:latest .

# 이미지 정리
docker image prune -f
```

---

## 유용한 명령어 모음

### 이미지 관리

```bash
# 모든 이미지 목록
docker images

# 특정 이미지 삭제
docker rmi nextjs-enterprise-app:latest

# 사용하지 않는 이미지 정리
docker image prune -a

# 이미지 크기 확인
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### 컨테이너 관리

```bash
# 모든 컨테이너 (실행 중 + 중지)
docker ps -a

# 컨테이너 내부 접속
docker exec -it nextjs-enterprise-app sh

# 컨테이너 리소스 사용량
docker stats nextjs-enterprise-app

# 컨테이너 로그 다운로드
docker logs nextjs-enterprise-app > container.log
```

### Docker Compose

```bash
# 모든 서비스 중지 및 삭제
docker compose down

# Volume까지 삭제
docker compose down -v

# 이미지까지 삭제
docker compose down --rmi all

# 특정 서비스만 재시작
docker compose restart nextjs-app
```

### 시스템 정리

```bash
# 사용하지 않는 모든 리소스 정리
docker system prune -a

# 사용량 확인
docker system df

# Volume 정리
docker volume prune
```

---

## 참고 자료

- **Docker 공식 문서**: https://docs.docker.com/
- **Next.js Docker 가이드**: https://nextjs.org/docs/deployment#docker-image
- **Docker Compose 문서**: https://docs.docker.com/compose/

---

## 관련 문서

- **[LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)** - 로컬 개발 환경 설정
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel 배포 가이드
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 아키텍처 상세 문서
- **[BACKEND_API_ROUTES.md](./BACKEND_API_ROUTES.md)** - API 엔드포인트 문서

---

## 데모 계정

- **Admin**: `admin` / `admin123`
- **User**: `john.doe` / `password123`

---

**Happy Docker Deployment! 🐳**
