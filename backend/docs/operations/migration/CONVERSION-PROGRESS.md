# PostgreSQL 변환 진행 상황

## 완료된 변환 (8개 파일)

다음 라우트 파일들이 완전히 PostgreSQL로 변환되었습니다:

### 1. 간단한 CRUD 라우트 ✅

**help.js.NEW** (133→122 라인)
- helpService 사용
- 프로그램별, 언어별 도움말 조회
- CRUD 작업 완료

**message.js.NEW** (161→147 라인)
- messageService 사용
- 카테고리별, 코드별 메시지 조회
- CRUD 작업 완료

**code.js.NEW** (262→241 라인)
- codeService 사용
- 코드 타입별 조회, 검색, 페이지네이션
- Bulk delete 지원

**codeType.js.NEW** (194→175 라인)
- codeService 사용
- 코드 타입 관리
- Cascade delete (관련 코드 자동 삭제)

**userSettings.js.NEW** (281→293 라인)
- preferencesService 사용
- 섹션별 설정 업데이트 (general, appearance, notifications, dataGrid, privacy, advanced)
- 관리자 기능: 모든 사용자 설정 조회

### 2. 매핑 라우트 ✅

**userRoleMapping.js.NEW** (318→259 라인)
- mappingService 사용
- 사용자-역할 매핑 관리
- enrichMappingWithDetails: 사용자 및 역할 정보 포함
- 중복 검사, 존재 검증

**roleMenuMapping.js.NEW** (255→253 라인)
- mappingService 사용
- 역할-메뉴 매핑 및 권한 (canView, canCreate, canUpdate, canDelete)
- enrichMappingWithDetails: 역할 및 메뉴 정보 포함

**roleProgramMapping.js.NEW** (254→256 라인)
- mappingService 사용
- 역할-프로그램 매핑 및 권한
- enrichMappingWithDetails: 역할 및 프로그램 정보 포함

---

## 변환 파일 적용 방법

### Windows CMD 사용:
```cmd
cd E:\apps\nextjs-enterprise-app\backend

REM 1. 백업 생성 (이미 .backup이 있으면 건너뛰기)
if not exist routes\help.js.backup copy routes\help.js routes\help.js.backup
if not exist routes\message.js.backup copy routes\message.js routes\message.js.backup
if not exist routes\code.js.backup copy routes\code.js routes\code.js.backup
if not exist routes\codeType.js.backup copy routes\codeType.js routes\codeType.js.backup
if not exist routes\userSettings.js.backup copy routes\userSettings.js routes\userSettings.js.backup
if not exist routes\userRoleMapping.js.backup copy routes\userRoleMapping.js routes\userRoleMapping.js.backup
if not exist routes\roleMenuMapping.js.backup copy routes\roleMenuMapping.js routes\roleMenuMapping.js.backup
if not exist routes\roleProgramMapping.js.backup copy routes\roleProgramMapping.js routes\roleProgramMapping.js.backup

REM 2. 새 파일 적용
copy routes\help.js.NEW routes\help.js
copy routes\message.js.NEW routes\message.js
copy routes\code.js.NEW routes\code.js
copy routes\codeType.js.NEW routes\codeType.js
copy routes\userSettings.js.NEW routes\userSettings.js
copy routes\userRoleMapping.js.NEW routes\userRoleMapping.js
copy routes\roleMenuMapping.js.NEW routes\roleMenuMapping.js
copy routes\roleProgramMapping.js.NEW routes\roleProgramMapping.js
```

### Git Bash 또는 Linux 사용:
```bash
cd /e/apps/nextjs-enterprise-app/backend

# 1. 백업 생성
for file in help message code codeType userSettings userRoleMapping roleMenuMapping roleProgramMapping; do
  [ ! -f "routes/${file}.js.backup" ] && cp "routes/${file}.js" "routes/${file}.js.backup"
done

# 2. 새 파일 적용
for file in help message code codeType userSettings userRoleMapping roleMenuMapping roleProgramMapping; do
  cp "routes/${file}.js.NEW" "routes/${file}.js"
done
```

---

## 아직 변환이 필요한 파일

### High Priority (복잡한 로직)

**menu.js** (434 라인)
- 복잡한 트리 구조 빌딩 로직
- getUserAccessiblePrograms 사용 (권한 미들웨어)
- 최근 메뉴, 즐겨찾기 업데이트
- 여전히 `readJSON(MENUS_FILE)` 사용 중
- menuService는 이미 import되어 있지만 아직 사용 안 됨

**program.js** (311 라인)
- programService 사용 필요
- 다국어 name 객체 처리 필요
- 권한 조회 엔드포인트 있음

**department.js** (291 라인)
- departmentService 사용 필요
- 부서 계층 구조 (parentId)

### Medium Priority (로그 및 분석)

**log.js**
- logService 사용 필요
- 로그 조회 및 필터링

**logAnalytics.js** (151 라인)
- logService 사용 필요
- 로그 통계 및 분석

### Middleware 업데이트

**middleware/permissionMiddleware.js**
- getUserAccessiblePrograms 함수 업데이트 필요
- 현재 JSON 파일 읽기 → PostgreSQL 서비스 사용

**middleware/logger.js**
- logService 사용하도록 업데이트 필요

---

## 변환 후 테스트 방법

### 1. 서버 재시작
```bash
# 현재 실행 중인 서버 중지 (Ctrl+C)
# 새로 시작
cd E:/apps/nextjs-enterprise-app
npm run dev:backend
```

### 2. Health Check
```bash
curl http://localhost:3001/health
```

예상 출력:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "database": {
    "connected": true,
    "pool": {
      "total": 2,
      "idle": 2,
      "waiting": 0
    }
  }
}
```

### 3. 개별 라우트 테스트

**도움말 조회:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/help?programId=USER_MGMT&language=en"
```

**메시지 조회:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/message"
```

**코드 조회:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/code?codeType=USER_STATUS&page=1&limit=10"
```

**코드 타입 조회:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/code-type"
```

**사용자 설정 조회:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/user-settings"
```

**사용자-역할 매핑 조회:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/user-role-mapping?includeDetails=true"
```

**역할-메뉴 매핑 조회:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/role-menu-mapping?includeDetails=true"
```

**역할-프로그램 매핑 조회:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/role-program-mapping?includeDetails=true"
```

---

## 변환 패턴 요약

모든 변환된 파일은 동일한 패턴을 따릅니다:

### Before (JSON 파일):
```javascript
const { readJSON, writeJSON } = require('../utils/fileUtils');
const DATA_FILE = path.join(__dirname, '../data/something.json');

router.get('/', async (req, res) => {
  const items = await readJSON(DATA_FILE);
  // ...
});

router.post('/', async (req, res) => {
  const items = await readJSON(DATA_FILE);
  items.push(newItem);
  await writeJSON(DATA_FILE, items);
  // ...
});
```

### After (PostgreSQL):
```javascript
const someService = require('../services/someService');

router.get('/', async (req, res) => {
  const items = await someService.getAllItems(filters);
  // ...
});

router.post('/', async (req, res) => {
  const newItem = await someService.createItem(itemData);
  // ...
});
```

### 필드 이름 변환:
- API (camelCase) ↔ Database (snake_case)
- `userId` ↔ `user_id`
- `roleId` ↔ `role_id`
- `canView` ↔ `can_view`
- `createdAt` ↔ `created_at`

---

## 다음 단계

1. **위의 8개 파일 적용**
   - 백업 생성
   - .NEW 파일을 원본으로 복사
   - 서버 재시작

2. **테스트**
   - Health check
   - 각 라우트 엔드포인트 테스트
   - 프론트엔드에서 기능 테스트

3. **나머지 파일 변환** (필요시)
   - menu.js (복잡한 트리 구조)
   - program.js
   - department.js
   - log 관련 파일들

4. **미들웨어 업데이트**
   - permissionMiddleware.js
   - logger.js

---

## 롤백 방법

문제가 발생하면 백업으로 복원:

```cmd
REM Windows
copy routes\help.js.backup routes\help.js
copy routes\message.js.backup routes\message.js
REM ... (나머지 파일들도 동일)
```

```bash
# Git Bash / Linux
cp routes/help.js.backup routes/help.js
cp routes/message.js.backup routes/message.js
# ... (나머지 파일들도 동일)
```

---

**작성일:** 2025-11-17
**상태:** 8개 파일 변환 완료, 적용 대기
**다음:** 파일 적용 및 테스트
