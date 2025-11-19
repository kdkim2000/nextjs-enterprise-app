# 완전한 PostgreSQL 변환 가이드

이 문서는 남은 모든 라우트 파일을 PostgreSQL로 변환하는 완전한 가이드입니다.

## 📋 변환 상태

### ✅ 완료 (3/17)
- ✅ `auth.js` - 완전 변환 완료
- ✅ `role.js` - 완전 변환 완료
- ✅ `user.js` - 새 파일 생성 완료 (`user.js.NEW`)

### 🔄 변환 필요 (14/17)
1. `menu.js`
2. `program.js`
3. `department.js`
4. `code.js`
5. `codeType.js`
6. `message.js`
7. `help.js`
8. `log.js`
9. `logAnalytics.js`
10. `userRoleMapping.js`
11. `roleMenuMapping.js`
12. `roleProgramMapping.js`
13. `userSettings.js`
14. `file.js` (변환 불필요 - 파일 업로드만 처리)

## 🔧 일괄 변환 스크립트

모든 라우트를 자동으로 변환하는 Node.js 스크립트:

```bash
cd E:/apps/nextjs-enterprise-app/backend
node bulk-convert-routes.js
```

## 📝 개별 파일 변환 패턴

### 1. menu.js 변환

**교체할 import:**
```javascript
// 제거
const { readJSON, writeJSON } = require('../utils/fileUtils');
const path = require('path');
const MENUS_FILE = path.join(__dirname, '../data/menus.json');

// 추가
const menuService = require('../services/menuService');
const { v4: uuidv4 } = require('uuid');
```

**변환 패턴:**
```javascript
// ❌ 이전
const menus = await readJSON(MENUS_FILE);
const menu = menus.find(m => m.id === id);

// ✅ 이후
const menu = await menuService.getMenuById(id);

// ❌ 이전
menus.push(newMenu);
await writeJSON(MENUS_FILE, menus);

// ✅ 이후
const created = await menuService.createMenu({
  id: uuidv4(),
  code,
  nameEn, nameKo, nameZh, nameVi,
  path, icon, parentId, level, order, visible, programId
});
```

**필드명 변환:**
- `parentId` → `parent_id`
- `programId` → `program_id`
- `nameEn/Ko/Zh/Vi` → `name_en/ko/zh/vi`

---

### 2. program.js 변환

**교체할 import:**
```javascript
// 추가
const programService = require('../services/programService');
```

**변환 패턴:**
```javascript
// ❌ 이전
const programs = await readJSON(PROGRAMS_FILE);

// ✅ 이후
const programs = await programService.getAllPrograms({ search, category, limit, offset });

// 사용자 프로그램 권한
const userPrograms = await programService.getUserPrograms(userId);
```

---

### 3. department.js 변환

**교체할 import:**
```javascript
const departmentService = require('../services/departmentService');
```

**변환 패턴:**
```javascript
// GET all
const departments = await departmentService.getAllDepartments({ search });

// GET by ID
const dept = await departmentService.getDepartmentById(id);

// CREATE
const created = await departmentService.createDepartment({
  id: uuidv4(),
  code, nameEn, nameKo, nameZh, nameVi, description, parentId, level
});

// UPDATE
const updated = await departmentService.updateDepartment(id, updates);

// DELETE
const deleted = await departmentService.deleteDepartment(id);
```

---

### 4. code.js & codeType.js 변환

**교체할 import:**
```javascript
const codeService = require('../services/codeService');
```

**code.js 변환:**
```javascript
// GET all codes
const codes = await codeService.getAllCodes({ search, codeType, status });

// GET by type
const codes = await codeService.getCodesByType(codeType);

// CREATE
const created = await codeService.createCode({
  id: uuidv4(),
  code, codeType, nameEn, nameKo, nameZh, nameVi,
  description, order, status, attributes
});
```

**codeType.js 변환:**
```javascript
// GET all
const codeTypes = await codeService.getAllCodeTypes({ search });

// CREATE
const created = await codeService.createCodeType({
  id: uuidv4(),
  code, nameEn, nameKo, nameZh, nameVi, description
});
```

---

### 5. message.js 변환

**교체할 import:**
```javascript
const messageService = require('../services/messageService');
```

**변환 패턴:**
```javascript
// GET all
const messages = await messageService.getAllMessages({ search, type, status, limit, offset });

// GET by ID
const message = await messageService.getMessageById(id);

// CREATE
const created = await messageService.createMessage({
  id: uuidv4(),
  title, content, type, status, senderId, recipientId
});

// UPDATE
const updated = await messageService.updateMessage(id, { title, content, type, status });

// DELETE
const deleted = await messageService.deleteMessage(id);
```

---

### 6. help.js 변환

**교체할 import:**
```javascript
const helpService = require('../services/helpService');
```

**변환 패턴:**
```javascript
// GET all
const helpItems = await helpService.getAllHelp({ search, category, limit, offset });

// CREATE
const created = await helpService.createHelp({
  id: uuidv4(),
  titleEn, titleKo, titleZh, titleVi,
  contentEn, contentKo, contentZh, contentVi,
  category, order
});
```

---

### 7. log.js & logAnalytics.js 변환

**교체할 import:**
```javascript
const logService = require('../services/logService');
```

**log.js 변환:**
```javascript
// GET logs with filters
const logs = await logService.getLogs({
  userId, path, method, programId, statusCode,
  startDate, endDate, limit, offset
});

// GET count
const count = await logService.getLogCount(filters);
```

**logAnalytics.js 변환:**
```javascript
// GET analytics
const analytics = await logService.getLogAnalytics({
  startDate, endDate, groupBy: 'day'
});
```

---

### 8. Mapping Routes 변환

**userRoleMapping.js:**
```javascript
const mappingService = require('../services/mappingService');

// GET mappings
const mappings = await mappingService.getAllUserRoleMappings({ userId, roleId });

// CREATE
const created = await mappingService.createUserRoleMapping({
  id: uuidv4(),
  userId, roleId, assignedBy
});

// DELETE
const deleted = await mappingService.deleteUserRoleMapping(id);
```

**roleMenuMapping.js:**
```javascript
// GET mappings
const mappings = await mappingService.getAllRoleMenuMappings({ roleId, menuId });

// CREATE
const created = await mappingService.createRoleMenuMapping({
  id: uuidv4(),
  roleId, menuId
});
```

**roleProgramMapping.js:**
```javascript
// GET mappings
const mappings = await mappingService.getAllRoleProgramMappings({ roleId, programId });

// CREATE/UPDATE (upsert)
const created = await mappingService.createRoleProgramMapping({
  id: uuidv4(),
  roleId, programId, canView, canCreate, canUpdate, canDelete
});
```

---

### 9. userSettings.js 변환

**교체할 import:**
```javascript
const preferencesService = require('../services/preferencesService');
```

**변환 패턴:**
```javascript
// GET
const prefs = await preferencesService.getUserPreferences(userId);

// CREATE/UPDATE
const updated = await preferencesService.createUserPreferences({
  userId, language, theme, timezone, dateFormat, notifications, settings
});
```

---

## 🔨 미들웨어 업데이트

### 1. middleware/auth.js

**추가할 import:**
```javascript
const authService = require('../services/authService');
```

**토큰 블랙리스트 체크:**
```javascript
// ❌ 이전
const { isBlacklisted } = require('../utils/tokenBlacklist');
const blacklisted = await isBlacklisted(token);

// ✅ 이후
const blacklisted = await authService.isTokenBlacklisted(token);
```

---

### 2. middleware/permissionMiddleware.js

**추가할 import:**
```javascript
const programService = require('../services/programService');
const roleService = require('../services/roleService');
const mappingService = require('../services/mappingService');
```

**권한 체크 로직:**
```javascript
// 사용자 프로그램 권한 가져오기
async function getUserProgramPermissions(userId, programCode) {
  return await programService.getUserProgramPermissions(userId, programCode);
}

// 사용자 역할 가져오기
async function getUserRoles(userId) {
  return await roleService.getUserRoles(userId);
}
```

---

### 3. middleware/logger.js

**추가할 import:**
```javascript
const logService = require('../services/logService');
```

**로그 저장:**
```javascript
// ❌ 이전
const logs = await readJSON(LOG_FILE);
logs.push(logEntry);
await writeJSON(LOG_FILE, logs);

// ✅ 이후
await logService.createLog({
  userId, method, path, statusCode, duration,
  ip, userAgent, programId, errorMessage
});
```

---

## 🚀 server.js 업데이트

**DB 연결 초기화 추가:**

```javascript
const express = require('express');
const cors = require('cors');
const db = require('./config/database');  // 추가

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
// ... 나머지 라우트

// Database connection test and server start
db.testConnection()
  .then(() => {
    console.log('✓ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('✗ Database connection failed:', error.message);
    console.error('✗ Please check your database configuration in .env');
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠ Shutting down gracefully...');
  await db.closePool();
  process.exit(0);
});
```

---

## 🧪 테스트 체크리스트

각 라우트 변환 후:

- [ ] GET /api/[resource] - 목록 조회
- [ ] GET /api/[resource]/:id - 단일 조회
- [ ] POST /api/[resource] - 생성
- [ ] PUT /api/[resource]/:id - 수정
- [ ] DELETE /api/[resource]/:id - 삭제
- [ ] 검색/필터링 동작
- [ ] 페이지네이션 동작
- [ ] 권한 체크 동작
- [ ] 에러 핸들링

---

## 📊 변환 우선순위

1. **High Priority** (핵심 기능)
   - ✅ user.js
   - ✅ auth.js
   - ✅ role.js
   - 🔄 menu.js
   - 🔄 program.js

2. **Medium Priority** (일반 기능)
   - 🔄 department.js
   - 🔄 code.js, codeType.js
   - 🔄 userRoleMapping.js
   - 🔄 roleMenuMapping.js
   - 🔄 roleProgramMapping.js

3. **Low Priority** (부가 기능)
   - 🔄 message.js
   - 🔄 help.js
   - 🔄 userSettings.js
   - 🔄 log.js, logAnalytics.js

---

## 🐛 문제 해결

### 문제: "relation does not exist"
**해결:**
```bash
cd E:/apps/nextjs-enterprise-app/migration
psql -U postgres -d enterprise_app -f schema.sql
```

### 문제: "password authentication failed"
**해결:** `.env` 파일의 DB_PASSWORD 확인

### 문제: Empty results
**해결:** 마이그레이션 실행
```bash
cd E:/apps/nextjs-enterprise-app/migration
node migrate.js
```

### 문제: Connection refused
**해결:** PostgreSQL 서비스 시작
```bash
# Windows
net start postgresql-x64-14

# macOS/Linux
sudo systemctl start postgresql
```

---

## 📚 추가 리소스

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Node-postgres 문서](https://node-postgres.com/)
- [마이그레이션 가이드](./migration/POSTGRESQL-QUICKSTART.md)

---

**작성일:** 2025-11-17
**버전:** 1.0
