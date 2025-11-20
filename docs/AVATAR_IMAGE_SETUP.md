# Avatar Image Display Setup Guide

## ✅ 완료된 작업

### 1. 데이터베이스 설정
- **컬럼 추가**: `users` 테이블에 `avatar_image TEXT` 컬럼 추가
- **인덱스**: `idx_users_has_avatar_image` 생성
- **샘플 데이터**: 30명의 사용자에게 색상별 아바타 이미지 삽입

### 2. 백엔드 업데이트
- **userService.js**: `SELECT *` 사용으로 자동으로 `avatar_image` 포함
- **routes/user.js**: API 응답에 `avatar_image` 필드 추가

### 3. 프론트엔드 업데이트
- **types.ts**: User 인터페이스에 `avatar_image?: string` 추가
- **constants.tsx**: Avatar 컴포넌트에서 DB 이미지 우선 표시
- **디버깅 로그**: 콘솔에 아바타 소스 정보 출력

---

## 🎯 아바타 표시 우선순위

```
1. avatar_image (DB에 저장된 Base64 이미지) ← 최우선
   ↓
2. avatarUrl (외부 이미지 URL)
   ↓
3. 이니셜 (한글 1자 또는 영문 2자)
```

---

## 📊 현재 데이터 상태

### 아바타가 있는 사용자 (30명)

| 직급 | 사용자 수 | 아바타 색상 | 샘플 사용자 |
|------|----------|------------|------------|
| 대표 | 1명 | 🔴 빨강 | admin |
| 부문장 | 4명 | 🔵 파랑 | 유다은, 고유나, 심소율, 장소율 |
| 팀장 | 5명 | 🟢 초록 | - |
| 부장 | 5명 | 🟠 주황 | 장채윤, 유하은, 조지후, 문우진, 허예린 |
| 과장 | 5명 | 🟣 보라 | 박은서, 배유나, 백가은, 송현우, 유채윤 |
| 직장 | 5명 | 🩷 분홍 | - |
| 반장 | 5명 | 🩵 청록 | 허민서, 윤소윤, 김현우, 서민서, 유유준 |

---

## 🧪 테스트 방법

### 1. 백엔드 서버 재시작
```bash
# 터미널에서 실행
npm run dev:backend
```

### 2. 프론트엔드 접속
```
http://localhost:3000/ko/admin/users
```

### 3. 브라우저 개발자 도구 확인
1. **F12** 키를 눌러 개발자 도구 열기
2. **Console** 탭으로 이동
3. Users 페이지 로드 시 다음과 같은 로그 확인:
   ```
   [Avatar] Using DB image for user: admin size: 194
   [Avatar] Using DB image for user: eunseo.park.6 size: 192
   [Avatar] Using DB image for user: yuna.bae.9 size: 192
   ```

### 4. 아바타 이미지 확인
- **admin** 사용자: 빨간색 사각형 아바타
- **부문장들**: 파란색 사각형 아바타
- **기타 관리자들**: 각 직급별 색상 아바타
- **일반 직원들**: 이니셜 표시 (한글 1자)

---

## 🔍 데이터베이스 확인 쿼리

### 아바타가 있는 사용자 조회
```sql
SELECT
    id,
    loginid,
    name_ko,
    position,
    CASE
        WHEN avatar_image IS NOT NULL THEN 'HAS IMAGE'
        ELSE 'NO IMAGE'
    END as avatar_status,
    LENGTH(avatar_image) as img_size
FROM users
WHERE avatar_image IS NOT NULL
ORDER BY position;
```

### 통계 확인
```sql
SELECT
    COUNT(*) as total_users,
    COUNT(avatar_image) as users_with_db_image,
    COUNT(avatar_url) as users_with_url,
    COUNT(*) - COUNT(avatar_image) - COUNT(avatar_url) as users_without_avatar,
    ROUND(COUNT(avatar_image) * 100.0 / COUNT(*), 2) as percentage_with_image
FROM users;
```

---

## ➕ 새로운 아바타 추가 방법

### 방법 1: SQL로 직접 추가
```sql
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSU...'
WHERE id = 'USER-ID';
```

### 방법 2: Base64 이미지 생성

#### 온라인 도구
- https://www.base64-image.de/
- 이미지 업로드 → Base64 변환 → 복사

#### JavaScript
```javascript
// 파일에서 Base64 생성
const file = document.getElementById('fileInput').files[0];
const reader = new FileReader();
reader.onloadend = function() {
    const base64String = reader.result; // data:image/png;base64,...
    console.log(base64String);
};
reader.readAsDataURL(file);
```

#### Python
```python
import base64

with open('avatar.png', 'rb') as image_file:
    encoded = base64.b64encode(image_file.read()).decode()
    data_uri = f'data:image/png;base64,{encoded}'
    print(data_uri)
```

### 방법 3: 여러 사용자에게 같은 이미지 적용
```sql
-- 모든 팀장에게 초록색 아바타 추가
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARklEQVR42mNgGAWDFjAyMjL8Z2Rk+M/IyPCfkZHhPyMjw39GRob/jIwM/xkZGf4zMjL8Z2Rk+M8w+AADA8MoGBIAALFTBf2hDks9AAAAAElFTkSuQmCC'
WHERE position = '팀장' AND avatar_image IS NULL;
```

---

## 🎨 Base64 이미지 형식

### 올바른 형식
```
data:image/[TYPE];base64,[BASE64_ENCODED_DATA]
```

### 지원 이미지 타입
- `image/png`
- `image/jpeg` 또는 `image/jpg`
- `image/gif`
- `image/webp`

### 예시
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
```

---

## 🐛 문제 해결

### 아바타가 표시되지 않을 때

#### 1. 백엔드 로그 확인
```bash
# 백엔드 터미널에서 에러 확인
# API 요청 시 avatar_image가 반환되는지 확인
```

#### 2. 프론트엔드 콘솔 로그 확인
```javascript
// 브라우저 콘솔에서 다음 로그 확인:
[Avatar] Using DB image for user: XXX size: XXX
```

#### 3. 네트워크 탭 확인
- F12 → Network 탭
- `/api/user` 요청 클릭
- Response에서 `avatar_image` 필드 확인

#### 4. 이미지 형식 확인
```sql
-- DB에서 이미지 형식 확인
SELECT
    id,
    SUBSTRING(avatar_image, 1, 50) as image_prefix
FROM users
WHERE avatar_image IS NOT NULL
LIMIT 5;

-- 올바른 형식: data:image/png;base64,...
```

### Base64 이미지가 너무 클 때
- **권장 크기**: 32x32 ~ 64x64 픽셀
- **최대 크기**: 100KB 이하
- 큰 이미지는 압축 또는 리사이즈 필요

---

## 📝 데이터베이스 스키마

```sql
-- users 테이블 컬럼
avatar_url    TEXT   -- 외부 이미지 URL (기존)
avatar_image  TEXT   -- Base64 인코딩된 이미지 (신규)

-- 인덱스
idx_users_has_avatar_image ON users(id) WHERE avatar_image IS NOT NULL
```

---

## 🔄 마이그레이션 파일

### 실행된 마이그레이션
1. `migration/add_avatar_image_column.sql` - 컬럼 추가
2. `migration/insert_sample_avatar_images.sql` - 샘플 데이터 삽입

### 롤백 방법
```sql
-- avatar_image 컬럼 제거 (필요 시)
ALTER TABLE users DROP COLUMN IF EXISTS avatar_image;
DROP INDEX IF EXISTS idx_users_has_avatar_image;
```

---

## ✅ 체크리스트

- [x] DB에 `avatar_image` 컬럼 추가됨
- [x] 샘플 이미지 30개 삽입됨
- [x] 백엔드 API에서 `avatar_image` 반환됨
- [x] 프론트엔드 타입 정의 추가됨
- [x] Avatar 컴포넌트에서 DB 이미지 우선 표시
- [x] 디버깅 로그 추가됨
- [ ] 실제 브라우저에서 아바타 표시 확인 ← **다음 단계**

---

## 🚀 다음 단계

1. **백엔드 재시작** (필수)
   ```bash
   npm run dev:backend
   ```

2. **프론트엔드 새로고침** (Ctrl + Shift + R)

3. **Users 페이지 접속**
   - http://localhost:3000/ko/admin/users

4. **콘솔 로그 확인**
   - F12 → Console
   - `[Avatar]` 로그 확인

5. **아바타 시각적 확인**
   - admin: 빨간색
   - 부문장들: 파란색
   - 기타 관리자: 각 색상

---

## 📧 문의

문제가 발생하면 다음 정보를 포함하여 문의:
1. 브라우저 콘솔 로그
2. 네트워크 탭의 API 응답
3. DB 쿼리 결과
4. 에러 메시지
