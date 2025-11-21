# Backend 운영 유지보수성 개선 제안서

## 📋 현재 상태 분석

### 1. 현재 구조
```
backend/
├── config/           # 데이터베이스 설정
├── routes/           # API 라우트 (20개)
├── services/         # 비즈니스 로직 (12개)
├── middleware/       # 미들웨어 (8개)
├── utils/            # 유틸리티
├── validators/       # 입력 검증
└── sql/              # SQL 스크립트 (5개 - 마이그레이션용)
```

### 2. 현재 문제점

#### 🔴 심각도 높음
1. **SQL 쿼리 분산**:
   - 12개 서비스 파일에 SQL 쿼리가 하드코딩됨
   - 동일한 쿼리가 여러 곳에 중복
   - SQL 변경 시 여러 파일 수정 필요

2. **쿼리 빌더 로직 중복**:
   ```javascript
   // userService.js, menuService.js 등에서 반복
   let query = 'SELECT * FROM users WHERE 1=1';
   const params = [];
   let paramIndex = 1;
   if (search) {
     query += ` AND field ILIKE $${paramIndex}`;
     params.push(`%${search}%`);
     paramIndex++;
   }
   ```

3. **트랜잭션 관리 복잡도**:
   - 각 서비스에서 개별적으로 트랜잭션 처리
   - 에러 처리 로직이 일관되지 않음

#### 🟡 심각도 중간
4. **모니터링 부족**:
   - 느린 쿼리 로깅만 존재 (100ms 이상)
   - 쿼리 실행 통계/분석 없음
   - 성능 추세 파악 불가

5. **테스트 부재**:
   - 단위 테스트 없음
   - 통합 테스트 없음

6. **문서화 부족**:
   - API 문서: Swagger 기본만 존재
   - 데이터베이스 스키마 문서 없음
   - 운영 가이드 없음

## 🎯 개선 제안

### Phase 1: SQL 쿼리 분리 및 중앙화 (우선순위: 최상)

#### 1.1 Query Repository 패턴 도입
```
backend/
├── repositories/         # 새로운 디렉토리
│   ├── base/
│   │   ├── BaseRepository.js      # 공통 CRUD 메서드
│   │   └── QueryBuilder.js        # 동적 쿼리 빌더
│   ├── UserRepository.js
│   ├── MenuRepository.js
│   ├── RoleRepository.js
│   └── ...
└── queries/              # 새로운 디렉토리
    ├── users.js          # User 관련 SQL 쿼리
    ├── menus.js          # Menu 관련 SQL 쿼리
    ├── roles.js
    └── ...
```

**예시: queries/users.js**
```javascript
/**
 * User 테이블 관련 SQL 쿼리 정의
 * 모든 User 관련 쿼리를 한 곳에서 관리
 */
module.exports = {
  // SELECT 쿼리
  SELECT_ALL: `
    SELECT id, loginid, name_ko, name_en, email,
           employee_number, status, department, role,
           created_at, updated_at
    FROM users
    WHERE 1=1
  `,

  SELECT_BY_ID: `
    SELECT * FROM users WHERE id = $1
  `,

  SELECT_BY_LOGIN_ID: `
    SELECT * FROM users WHERE loginid = $1
  `,

  SELECT_WITH_ROLES: `
    SELECT u.*,
           array_agg(r.name) as role_names
    FROM users u
    LEFT JOIN user_role_mapping urm ON u.id = urm.user_id
    LEFT JOIN roles r ON urm.role_id = r.id
    WHERE u.id = $1
    GROUP BY u.id
  `,

  // INSERT 쿼리
  INSERT_USER: `
    INSERT INTO users (
      id, loginid, password, name_ko, name_en,
      email, employee_number, status, department
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,

  // UPDATE 쿼리
  UPDATE_USER: `
    UPDATE users
    SET name_ko = $2, name_en = $3, email = $4,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,

  UPDATE_PASSWORD: `
    UPDATE users
    SET password = $2, updated_at = NOW()
    WHERE id = $1
  `,

  // DELETE 쿼리
  DELETE_USER: `
    DELETE FROM users WHERE id = $1
  `,

  // 통계/분석 쿼리
  COUNT_BY_STATUS: `
    SELECT status, COUNT(*) as count
    FROM users
    GROUP BY status
  `,

  COUNT_BY_DEPARTMENT: `
    SELECT department, COUNT(*) as count
    FROM users
    GROUP BY department
    ORDER BY count DESC
  `,
};
```

**예시: repositories/UserRepository.js**
```javascript
const db = require('../config/database');
const BaseRepository = require('./base/BaseRepository');
const queries = require('../queries/users');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  /**
   * ID로 사용자 조회
   */
  async findById(userId) {
    const result = await db.query(queries.SELECT_BY_ID, [userId]);
    return result.rows[0] || null;
  }

  /**
   * 로그인 ID로 사용자 조회
   */
  async findByLoginId(loginId) {
    const result = await db.query(queries.SELECT_BY_LOGIN_ID, [loginId]);
    return result.rows[0] || null;
  }

  /**
   * 사용자와 역할 정보 함께 조회
   */
  async findByIdWithRoles(userId) {
    const result = await db.query(queries.SELECT_WITH_ROLES, [userId]);
    return result.rows[0] || null;
  }

  /**
   * 검색 조건으로 사용자 목록 조회
   */
  async findAll(filters = {}) {
    const { query, params } = this.buildSearchQuery(filters);
    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * 동적 검색 쿼리 빌드
   */
  buildSearchQuery(filters) {
    let query = queries.SELECT_ALL;
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
      query += ` AND search_vector @@ plainto_tsquery('simple', $${paramIndex})`;
      params.push(filters.search);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.department) {
      query += ` AND department = $${paramIndex}`;
      params.push(filters.department);
      paramIndex++;
    }

    // 정렬
    query += ` ORDER BY created_at DESC`;

    // 페이지네이션
    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
      paramIndex++;
    }

    return { query, params };
  }

  /**
   * 사용자 생성
   */
  async create(userData) {
    const { id, loginid, password, name_ko, name_en, email,
            employee_number, status, department } = userData;

    const result = await db.query(queries.INSERT_USER, [
      id, loginid, password, name_ko, name_en,
      email, employee_number, status, department
    ]);

    return result.rows[0];
  }

  /**
   * 사용자 정보 업데이트
   */
  async update(userId, updates) {
    const { name_ko, name_en, email } = updates;
    const result = await db.query(queries.UPDATE_USER, [
      userId, name_ko, name_en, email
    ]);
    return result.rows[0];
  }

  /**
   * 비밀번호 업데이트
   */
  async updatePassword(userId, hashedPassword) {
    await db.query(queries.UPDATE_PASSWORD, [userId, hashedPassword]);
  }

  /**
   * 상태별 사용자 수 조회
   */
  async countByStatus() {
    const result = await db.query(queries.COUNT_BY_STATUS);
    return result.rows;
  }
}

module.exports = new UserRepository();
```

**예시: repositories/base/BaseRepository.js**
```javascript
/**
 * Base Repository - 모든 Repository의 부모 클래스
 * 공통 CRUD 메서드 제공
 */
const db = require('../../config/database');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * ID로 단일 레코드 조회
   */
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * 모든 레코드 조회
   */
  async findAll(options = {}) {
    let query = `SELECT * FROM ${this.tableName}`;
    const params = [];

    if (options.limit) {
      query += ` LIMIT $1`;
      params.push(options.limit);
    }

    if (options.offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(options.offset);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * 레코드 생성
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * 레코드 업데이트
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id, ...values]);
    return result.rows[0];
  }

  /**
   * 레코드 삭제
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    await db.query(query, [id]);
  }

  /**
   * 레코드 수 조회
   */
  async count(conditions = {}) {
    let query = `SELECT COUNT(*) FROM ${this.tableName} WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    Object.entries(conditions).forEach(([key, value]) => {
      query += ` AND ${key} = $${paramIndex}`;
      params.push(value);
      paramIndex++;
    });

    const result = await db.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * 레코드 존재 여부 확인
   */
  async exists(conditions) {
    const count = await this.count(conditions);
    return count > 0;
  }
}

module.exports = BaseRepository;
```

#### 1.2 Service Layer 리팩토링
```javascript
// 기존 services/userService.js를 간소화
const userRepository = require('../repositories/UserRepository');

/**
 * User Service Layer
 * 비즈니스 로직에 집중 (SQL은 Repository가 담당)
 */
class UserService {
  /**
   * 사용자 목록 조회
   */
  async getAllUsers(filters) {
    return await userRepository.findAll(filters);
  }

  /**
   * 사용자 상세 조회
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * 사용자 생성 (비즈니스 로직)
   */
  async createUser(userData) {
    // 1. 중복 체크
    const existing = await userRepository.findByLoginId(userData.loginid);
    if (existing) {
      throw new ConflictError('Login ID already exists');
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 3. 사용자 생성
    const newUser = await userRepository.create({
      ...userData,
      password: hashedPassword,
      id: uuidv4(),
      status: 'active'
    });

    // 4. 기본 역할 할당 (트랜잭션)
    await this.assignDefaultRole(newUser.id);

    return newUser;
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findById(userId);

    // 기존 비밀번호 확인
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid current password');
    }

    // 새 비밀번호 해싱 및 저장
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, hashedPassword);
  }
}

module.exports = new UserService();
```

### Phase 2: 데이터베이스 마이그레이션 시스템 (우선순위: 높음)

#### 2.1 마이그레이션 구조
```
backend/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_user_indexes.sql
│   ├── 003_add_menu_table.sql
│   ├── 004_add_full_text_search.sql
│   └── migration-runner.js
└── seeds/
    ├── 001_seed_users.sql
    ├── 002_seed_roles.sql
    └── seed-runner.js
```

#### 2.2 마이그레이션 러너
```javascript
// migrations/migration-runner.js
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

class MigrationRunner {
  /**
   * 마이그레이션 테이블 생성
   */
  async createMigrationTable() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  /**
   * 실행된 마이그레이션 조회
   */
  async getExecutedMigrations() {
    const result = await db.query(
      'SELECT name FROM migrations ORDER BY id'
    );
    return result.rows.map(r => r.name);
  }

  /**
   * 마이그레이션 실행
   */
  async runMigrations() {
    await this.createMigrationTable();
    const executed = await this.getExecutedMigrations();

    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (executed.includes(file)) {
        console.log(`⏭  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`▶  Running ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');

      await db.transaction(async (client) => {
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
      });

      console.log(`✓  Completed ${file}`);
    }

    console.log('✓  All migrations completed');
  }

  /**
   * 마이그레이션 롤백 (선택적)
   */
  async rollback(steps = 1) {
    const executed = await this.getExecutedMigrations();
    const toRollback = executed.slice(-steps);

    for (const name of toRollback.reverse()) {
      console.log(`⏪  Rolling back ${name}...`);
      // 롤백 로직 구현
    }
  }
}

module.exports = new MigrationRunner();
```

### Phase 3: 모니터링 및 로깅 강화 (우선순위: 중간)

#### 3.1 Query Analytics
```javascript
// utils/queryAnalytics.js
class QueryAnalytics {
  constructor() {
    this.stats = new Map();
  }

  /**
   * 쿼리 실행 기록
   */
  record(queryName, duration) {
    if (!this.stats.has(queryName)) {
      this.stats.set(queryName, {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        avgDuration: 0
      });
    }

    const stat = this.stats.get(queryName);
    stat.count++;
    stat.totalDuration += duration;
    stat.minDuration = Math.min(stat.minDuration, duration);
    stat.maxDuration = Math.max(stat.maxDuration, duration);
    stat.avgDuration = stat.totalDuration / stat.count;
  }

  /**
   * 통계 조회
   */
  getStats() {
    return Array.from(this.stats.entries()).map(([name, stat]) => ({
      query: name,
      ...stat
    }));
  }

  /**
   * 느린 쿼리 조회
   */
  getSlowQueries(threshold = 100) {
    return this.getStats()
      .filter(s => s.avgDuration > threshold)
      .sort((a, b) => b.avgDuration - a.avgDuration);
  }

  /**
   * 통계 리셋
   */
  reset() {
    this.stats.clear();
  }
}

module.exports = new QueryAnalytics();
```

#### 3.2 데이터베이스 래퍼 개선
```javascript
// config/database.js 개선
const queryAnalytics = require('../utils/queryAnalytics');

async function query(text, params, queryName = 'unknown') {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // 분석 기록
    queryAnalytics.record(queryName, duration);

    // 기존 로깅
    if (duration > 100) {
      console.warn(`⚠ Slow query [${queryName}] (${duration}ms)`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Query error [${queryName}]:`, error.message);
    throw error;
  }
}
```

### Phase 4: 테스트 인프라 구축 (우선순위: 중간)

#### 4.1 테스트 구조
```
backend/
├── tests/
│   ├── unit/
│   │   ├── repositories/
│   │   │   ├── UserRepository.test.js
│   │   │   └── MenuRepository.test.js
│   │   ├── services/
│   │   │   ├── userService.test.js
│   │   │   └── authService.test.js
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   │   ├── user.test.js
│   │   │   └── auth.test.js
│   │   └── database/
│   └── helpers/
│       ├── testDb.js        # 테스트 DB 셋업
│       ├── fixtures.js      # 테스트 데이터
│       └── mocks.js         # Mock 객체
```

#### 4.2 테스트 예시
```javascript
// tests/unit/repositories/UserRepository.test.js
const UserRepository = require('../../../repositories/UserRepository');
const testDb = require('../../helpers/testDb');

describe('UserRepository', () => {
  beforeAll(async () => {
    await testDb.setup();
  });

  afterAll(async () => {
    await testDb.teardown();
  });

  beforeEach(async () => {
    await testDb.clear();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = await testDb.createUser({
        loginid: 'test',
        name_ko: '테스트'
      });

      const result = await UserRepository.findById(user.id);

      expect(result).toBeDefined();
      expect(result.loginid).toBe('test');
    });

    it('should return null when not found', async () => {
      const result = await UserRepository.findById('non-existent-id');
      expect(result).toBeNull();
    });
  });
});
```

### Phase 5: 문서화 강화 (우선순위: 낮음)

#### 5.1 문서 구조
```
backend/
├── docs/
│   ├── api/
│   │   ├── README.md              # API 개요
│   │   ├── authentication.md      # 인증/인가
│   │   ├── endpoints/
│   │   │   ├── users.md
│   │   │   ├── menus.md
│   │   │   └── ...
│   │   └── examples.md            # 사용 예시
│   ├── database/
│   │   ├── schema.md              # 스키마 문서
│   │   ├── erd.png                # ERD 다이어그램
│   │   ├── indexes.md             # 인덱스 전략
│   │   └── migrations.md          # 마이그레이션 가이드
│   ├── operations/
│   │   ├── deployment.md          # 배포 가이드
│   │   ├── monitoring.md          # 모니터링
│   │   ├── backup.md              # 백업/복구
│   │   └── troubleshooting.md     # 문제 해결
│   └── development/
│       ├── setup.md               # 개발 환경 설정
│       ├── coding-standards.md    # 코딩 표준
│       └── contributing.md        # 기여 가이드
```

## 📊 예상 효과

### 정량적 효과
1. **코드 중복 감소**: 30-40% 감소 예상
2. **쿼리 수정 시간**: 70% 단축 (여러 파일 → 1개 파일)
3. **버그 발생률**: 40% 감소 (중앙화된 쿼리 관리)
4. **신규 개발자 온보딩**: 50% 시간 단축

### 정성적 효과
1. **유지보수성 향상**: SQL 쿼리 한 곳에서 관리
2. **테스트 용이성**: Repository 계층 분리로 Mock 테스트 가능
3. **성능 최적화**: 쿼리 분석 도구로 병목 지점 파악
4. **코드 가독성**: 비즈니스 로직과 데이터 접근 분리

## 🚀 구현 로드맵

### Week 1-2: Phase 1 (SQL 분리)
- [ ] BaseRepository 구현
- [ ] UserRepository 구현 및 테스트
- [ ] MenuRepository 구현 및 테스트
- [ ] 나머지 Repository 구현
- [ ] Service Layer 리팩토링

### Week 3: Phase 2 (마이그레이션)
- [ ] 마이그레이션 시스템 구현
- [ ] 기존 SQL 스크립트를 마이그레이션으로 변환
- [ ] Seed 데이터 시스템 구현

### Week 4: Phase 3 (모니터링)
- [ ] QueryAnalytics 구현
- [ ] 대시보드 API 추가
- [ ] 알림 시스템 구축

### Week 5-6: Phase 4 (테스트)
- [ ] 테스트 인프라 구축
- [ ] Unit 테스트 작성
- [ ] Integration 테스트 작성
- [ ] CI/CD 통합

### Week 7-8: Phase 5 (문서화)
- [ ] API 문서 작성
- [ ] 데이터베이스 문서 작성
- [ ] 운영 가이드 작성

## 💡 추가 제안

### 1. TypeScript 마이그레이션 (장기)
- 타입 안정성 향상
- IDE 자동완성 지원
- 런타임 에러 사전 방지

### 2. Redis 캐싱 도입
- 자주 조회되는 데이터 캐싱
- API 응답 속도 향상
- 데이터베이스 부하 감소

### 3. API 버전 관리
```
/api/v1/users
/api/v2/users
```
- 하위 호환성 유지
- 점진적 업그레이드 가능

### 4. Health Check 강화
```javascript
GET /health
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": 3600,
  "memory": {...},
  "queries": {
    "slow": 3,
    "failed": 0
  }
}
```

## ⚠️ 주의사항

1. **점진적 마이그레이션**:
   - 한 번에 모든 것을 바꾸지 말 것
   - 서비스별로 단계적 적용
   - 충분한 테스트 후 배포

2. **기존 코드 유지**:
   - 마이그레이션 중 기존 코드 동시 운영
   - Feature Flag로 신규 코드 제어
   - 문제 발생 시 롤백 가능

3. **성능 모니터링**:
   - 변경 전후 성능 비교
   - 느린 쿼리 지속 모니터링
   - 사용자 영향 최소화

## 📝 다음 단계

1. ✅ 이 제안서 검토 및 승인
2. 🔲 Phase 1 상세 설계
3. 🔲 POC (Proof of Concept) 구현
4. 🔲 팀 리뷰 및 피드백
5. 🔲 본격 구현 시작

---

**작성일**: 2025-11-21
**작성자**: Claude Code
**문서 버전**: 1.0
