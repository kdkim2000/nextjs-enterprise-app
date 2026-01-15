# 게시판 수정이 동작하지 않는 원인을 확인하라. httpREDACTED_IPkoboardsfbad52d2-2bda-4775-a87f-b9de37f2e6395c1f03...

## 메타데이터

| 항목 | 값 |
|------|---|
| **날짜** | 2025-12-16 |
| **프로젝트** | nextjs-enterprise-app |
| **브랜치** | 19-mobile |
| **카테고리** | bug-fix |
| **난이도** | hard |
| **소요시간** | 54분 |
| **메시지 수** | 101 |
| **세션 ID** | 61696de3-5b3b-4f74-b679-f836d52d503c |

---

## 대화 내용

### 👤 사용자 (오전 2:52:36)

게시판 수정이 동작하지 않는 원인을 확인하라.
http://<REDACTED_IP>/ko/boards/fbad52d2-2bda-4775-a87f-b9de37f2e639/5c1f0300-a81a-4471-830d-2938245bce5c/edit

### 🤖 Claude (오전 2:52:43)

게시판 수정 기능 문제를 확인하겠습니다. 먼저 관련 코드를 탐색합니다.

### 👤 사용자 (오전 2:52:59)



### 👤 사용자 (오전 2:52:59)



### 👤 사용자 (오전 2:53:18)



### 👤 사용자 (오전 2:53:18)



### 👤 사용자 (오전 2:53:28)



### 👤 사용자 (오전 2:53:36)



### 👤 사용자 (오전 2:53:47)



### 👤 사용자 (오전 2:53:55)



### 👤 사용자 (오전 2:54:04)



### 🤖 Claude (오전 2:54:08)

edit 페이지 파일을 찾았습니다. 해당 파일을 읽어보겠습니다.

### 👤 사용자 (오전 2:54:13)



### 👤 사용자 (오전 2:54:24)



### 🤖 Claude (오전 2:54:31)

API 클라이언트와 서버 측 엔드포인트를 확인해보겠습니다.

### 👤 사용자 (오전 2:54:42)



### 👤 사용자 (오전 2:54:48)



### 👤 사용자 (오전 2:54:54)



### 👤 사용자 (오전 2:54:59)



### 👤 사용자 (오전 2:55:13)



### 👤 사용자 (오전 2:55:13)



### 👤 사용자 (오전 2:55:24)



### 👤 사용자 (오전 2:55:24)



### 👤 사용자 (오전 2:55:37)



### 👤 사용자 (오전 2:55:39)



### 🤖 Claude (오전 2:55:47)

API 설정 파일을 확인해보겠습니다.

### 👤 사용자 (오전 2:55:53)



### 🤖 Claude (오전 2:56:13)

백엔드 API 코드가 있는지 확인해보겠습니다.

### 👤 사용자 (오전 2:56:18)



### 👤 사용자 (오전 2:56:28)



### 👤 사용자 (오전 2:56:29)



### 👤 사용자 (오전 2:56:40)



### 👤 사용자 (오전 2:56:42)



### 🤖 Claude (오전 2:56:46)

백엔드 post.js 파일을 확인하겠습니다.

### 👤 사용자 (오전 2:56:52)



### 🤖 Claude (오전 2:56:59)

`checkPostEditPermission` 미들웨어를 확인하겠습니다.

### 👤 사용자 (오전 2:57:05)



### 🤖 Claude (오전 2:57:18)

서버 라우팅 설정을 확인하겠습니다.

### 👤 사용자 (오전 2:57:23)



### 🤖 Claude (오전 2:57:37)

**문제 발견!** 클라이언트와 서버의 URL 경로가 불일치합니다.

- **클라이언트**: `contentApiClient.put('/posts/${postId}')` → `/content/posts/{postId}`
- **서버**: `/api/post/:id`

Nginx 프록시 설정을 확인하겠습니다.

### 👤 사용자 (오전 2:57:44)



### 👤 사용자 (오전 2:57:44)



### 👤 사용자 (오전 2:57:54)



### 👤 사용자 (오전 2:58:06)



### 🤖 Claude (오전 2:58:15)

MSA 서비스가 따로 있는 것 같습니다. app-service 코드를 찾아보겠습니다.

### 👤 사용자 (오전 2:58:23)



### 👤 사용자 (오전 2:58:28)



### 👤 사용자 (오전 2:58:38)



### 👤 사용자 (오전 2:58:48)



### 👤 사용자 (오전 2:58:59)



### 👤 사용자 (오전 2:59:09)



### 👤 사용자 (오전 2:59:21)



### 👤 사용자 (오전 2:59:33)



### 🤖 Claude (오전 2:59:53)

postService의 updatePost 함수를 확인해보겠습니다.

### 👤 사용자 (오전 2:59:59)



### 🤖 Claude (오전 3:01:14)

분석을 완료했습니다. 문제의 원인을 찾았습니다.

## 문제 분석 결과

### 발견된 문제: Nginx `if` 조건과 Accept 헤더

**Nginx 설정** (`infrastructure/nginx/nginx.conf` 145-156행):
```nginx
location /content/ {
    if ($http_accept !~* "application/json") {
        rewrite ^(.*)$ /api-redirect$1 last;
    }
    proxy_pass http://app_service/content/;
    ...
}
```

이 설정은 `Accept` 헤더에 `application/json`이 없으면 요청을 프론트엔드로 리다이렉트합니다.

**axios 설정** (`src/lib/axios/index.ts` 172-178행):
```typescript
const instance = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
    // Accept 헤더가 명시적으로 없음!
  }
});
```

axios는 기본적으로 `Accept: application/json, text/plain, */*`를 보내지만, 특정 상황(브라우저 캐시, 프리플라이트 요청 등)에서 이 헤더가 누락될 수 있습니다.

### 해결 방법

`src/lib/axios/index.ts` 파일에서 Accept 헤더를 명시적으로 추가해야 합니다.

### 👤 사용자 (오전 3:04:49)



### 👤 사용자 (오전 3:04:58)



### 🤖 Claude (오전 3:05:05)

두 곳에 Accept 헤더를 추가하겠습니다.

### 👤 사용자 (오전 3:05:11)



### 👤 사용자 (오전 3:05:20)



### 👤 사용자 (오전 3:05:31)



### 🤖 Claude (오전 3:05:46)

파일이 외부에서 계속 수정되고 있어 직접 편집이 어렵습니다. 분석 결과를 정리해드리겠습니다.

## 게시판 수정 동작 문제 분석 결과

### 1. 가장 가능성 높은 원인: Nginx Accept 헤더 검사

**문제 위치**: `infrastructure/nginx/nginx.conf` 145-156행

```nginx
location /content/ {
    if ($http_accept !~* "application/json") {
        rewrite ^(.*)$ /api-redirect$1 last;
    }
    proxy_pass http://app_service/content/;
    ...
}
```

이 설정은 `Accept` 헤더에 `application/json`이 없으면 요청을 **프론트엔드로 리다이렉트**합니다.

**해결 방법**: `src/lib/axios/index.ts`에서 두 곳 수정 필요

1. **14-21행** (기본 axiosInstance):
```typescript
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'  // 추가
  }
});
```

2. **172-178행** (createServiceApi):
```typescript
const instance = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'  // 추가
  }
});
```

### 2. 기타 확인 사항

| 확인 항목 | 상태 |
|----------|------|
| API 엔드포인트 | ✅ 정상 (`PUT /content/posts/:id`) |
| 권한 체크 로직 | ✅ 정상 (작성자 또는 admin만 수정 가능) |
| DB 업데이트 로직 | ✅ 정상 |
| 프론트엔드 호출 | ✅ 정상 (`contentApiClient.put`) |

### 3. 디버깅 방법

브라우저 개발자 도구에서 Network 탭을 열고 수정 요청을 확인하여:
- **응답 상태 코드** (200, 403, 401, 500 등)
- **응답 본문** (에러 메시지)
- **요청 헤더** (Accept 헤더 유무)

를 확인해주세요. 이 정보가 있으면 정확한 원인을 파악할 수 있습니다.

### 👤 사용자 (오전 3:10:33)

GET http://<REDACTED_IP>/content/content/board-types/fbad52d2-2bda-4775-a87f-b9de37f2e639 404 (Not Found)

### 🤖 Claude (오전 3:11:19)

문제를 찾았습니다! URL이 중복되고 있습니다:

```
/content/content/board-types/...
```

`/content`가 두 번 들어가고 있습니다. 환경 변수 설정을 확인해보겠습니다.

### 👤 사용자 (오전 3:11:28)



### 👤 사용자 (오전 3:11:28)



### 👤 사용자 (오전 3:11:40)



### 🤖 Claude (오전 3:12:29)

Docker 환경 설정을 확인해보겠습니다.

### 👤 사용자 (오전 3:12:36)



### 👤 사용자 (오전 3:12:36)



### 👤 사용자 (오전 3:12:50)



### 👤 사용자 (오전 3:12:50)



### 🤖 Claude (오전 3:13:13)

문제를 더 정확히 찾기 위해 코드에서 `/content/` 경로를 사용하는 곳을 검색해보겠습니다.

### 👤 사용자 (오전 3:13:19)



### 👤 사용자 (오전 3:13:29)



### 👤 사용자 (오전 3:13:39)



### 🤖 Claude (오전 3:14:07)

## 문제의 근본 원인 발견

**URL 중복 문제**: `/content/content/board-types/...`

### 현재 상황 분석

1. **Docker 설정** (`docker/docker-compose.yml`)에서:
   - MSA 서비스 (core-service, app-service)가 **없음**
   - 레거시 `backend` (port 3001)만 실행됨

2. **Nginx 설정** (`docker/nginx-ssl.conf`)에서:
   - `/api` → backend로 프록시
   - `/content`, `/admin`, `/auth` 경로가 **없음**
   - 나머지 모든 요청 → frontend로 전달

3. **프론트엔드 코드**:
   - `contentApiClient`가 `/content/posts/...`, `/content/board-types/...` 등으로 요청
   - 하지만 Nginx가 이 경로를 처리하지 않음

### 해결 방법

**옵션 1: Nginx에 MSA 경로 추가** (권장)

`docker/nginx-ssl.conf`에 다음 추가:

```nginx
# Content API → backend (레거시 모드에서는 backend의 /api로 리라이트)
location /content/ {
    rewrite ^/content/(.*)$ /api/$1 break;
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Admin API
location /admin/ {
    rewrite ^/admin/(.*)$ /api/$1 break;
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Auth API
location /auth/ {
    rewrite ^/auth/(.*)$ /api/auth/$1 break;
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Common API
location /common/ {
    rewrite ^/common/(.*)$ /api/$1 break;
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

이 설정을 추가하시겠습니까?

### 👤 사용자 (오전 3:20:05)

추가하라.

### 👤 사용자 (오전 3:20:15)



### 👤 사용자 (오전 3:20:32)



### 👤 사용자 (오전 3:20:42)



### 👤 사용자 (오전 3:21:00)



### 👤 사용자 (오전 3:21:09)



### 👤 사용자 (오전 3:21:27)



### 👤 사용자 (오전 3:21:36)



### 👤 사용자 (오전 3:21:53)



### 🤖 Claude (오전 3:21:57)

Bash로 직접 파일을 수정하겠습니다.

### 👤 사용자 (오전 3:37:27)



### 🤖 Claude (오전 3:37:32)

파일이 작성되었는지 확인합니다.

### 👤 사용자 (오전 3:37:37)



### 🤖 Claude (오전 3:37:49)

Nginx 설정이 추가되었습니다. 하지만 URL 중복 문제 (`/content/content/...`)의 근본 원인도 확인해야 합니다.

### 👤 사용자 (오전 3:37:55)



### 🤖 Claude (오전 3:38:16)

## 완료된 작업

**Nginx 설정 수정 완료** (`docker/nginx-ssl.conf`)

추가된 MSA 라우트:
- `/content/` → `/api/` (게시판, 게시글 등)
- `/admin/` → `/api/` (관리자 기능)
- `/auth/` → `/api/auth/` (인증)
- `/common/` → `/api/` (공통 기능)
- `/comm/` → `/api/` (커뮤니케이션)

## 다음 단계

### 1. 서버에서 Nginx 재시작
```bash
docker exec corenext-nginx nginx -s reload
# 또는
docker-compose restart nginx
```

### 2. URL 중복 문제 (`/content/content/...`) 원인

이 문제는 **프론트엔드 빌드 시 환경 변수 문제**일 가능성이 높습니다.

`docker/docker-compose.yml`의 frontend 환경 변수에 `NEXT_PUBLIC_CONTENT_API_URL`이 없어서, 빌드 시점에 development 기본값이 사용되었을 수 있습니다.

**확인 방법**: 브라우저 콘솔에서 다음 실행
```javascript
// 현재 환경 확인
console.log(process.env.NODE_ENV);
```

**해결 방법**: 프론트엔드 재빌드 필요
```bash
docker-compose build frontend
docker-compose up -d frontend
```

서버에서 Nginx를 재시작한 후 다시 테스트해보시겠습니까?

### 👤 사용자 (오전 3:45:19)

git commit

### 👤 사용자 (오전 3:45:31)



### 👤 사용자 (오전 3:45:32)



### 👤 사용자 (오전 3:45:33)



### 👤 사용자 (오전 3:46:14)



### 👤 사용자 (오전 3:46:23)



### 🤖 Claude (오전 3:46:30)

커밋 완료되었습니다.

```
6031ab1 fix(nginx): MSA API 라우트를 레거시 백엔드로 프록시하도록 설정 추가
```

현재 브랜치 `19-mobile`이 origin보다 1 커밋 앞서 있습니다. push가 필요하면 말씀해주세요.

