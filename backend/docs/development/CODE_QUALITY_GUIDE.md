# Code Quality Guide

**Last Updated:** 2025-11-21
**Version:** 1.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [TypeScript Migration](#typescript-migration)
3. [Logging System](#logging-system)
4. [API Documentation](#api-documentation)
5. [Code Standards](#code-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Performance Best Practices](#performance-best-practices)
8. [Maintenance](#maintenance)

---

## Overview

This guide provides comprehensive guidelines for maintaining high code quality in the Enterprise Application backend.

### Code Quality Goals

- ✅ **Type Safety:** TypeScript for compile-time error detection
- ✅ **Maintainability:** Clear, documented, and testable code
- ✅ **Performance:** Optimized queries and efficient algorithms
- ✅ **Security:** Secure coding practices
- ✅ **Documentation:** Comprehensive API documentation

---

## TypeScript Migration

### Current Status

**TypeScript Setup:** ✅ Configured (tsconfig.json)
**Type Definitions:** ✅ Created (types/index.ts, types/express.ts)
**Migration Strategy:** Incremental (JavaScript + TypeScript coexistence)

### TypeScript Configuration

**File:** `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "allowJs": true,          // Allow JS files
    "checkJs": false,         // Don't check JS files (yet)
    "outDir": "./dist",
    "sourceMap": true
  }
}
```

### Type Definitions

**Location:** `backend/types/`

```typescript
// types/index.ts
export interface User {
  id: string;
  loginid: string;
  email: string;
  // ... more fields
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
```

### Migration Strategy

#### Phase 1: Setup (✅ Completed)
- [x] Create tsconfig.json
- [x] Install TypeScript dependencies
- [x] Create type definition files
- [x] Configure build scripts

#### Phase 2: Core Utilities (Next)
- [ ] Migrate utils/ApiError.js → utils/ApiError.ts
- [ ] Migrate utils/logger.js → utils/logger.ts
- [ ] Migrate validators → TypeScript
- [ ] Migrate middleware → TypeScript

#### Phase 3: Services
- [ ] Migrate services/userService.js
- [ ] Migrate services/authService.js
- [ ] Migrate services/logService.js
- [ ] Add comprehensive type annotations

#### Phase 4: Routes
- [ ] Migrate routes/auth.js
- [ ] Migrate routes/user.js
- [ ] Add request/response types
- [ ] Update Swagger documentation

#### Phase 5: Finalization
- [ ] Enable `checkJs: true` (type check existing JS)
- [ ] Fix all type errors
- [ ] Remove `allowJs` option
- [ ] Full TypeScript codebase

### Migration Guidelines

#### 1. Start with Utilities

```typescript
// Before (JS)
function parseToken(token) {
  return jwt.verify(token, secret);
}

// After (TS)
import { JWTPayload } from '../types';

function parseToken(token: string): JWTPayload {
  return jwt.verify(token, secret) as JWTPayload;
}
```

#### 2. Add Type Annotations

```typescript
// Request handlers
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

async function getUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    // ...
  } catch (error) {
    next(error);
  }
}
```

#### 3. Use Type Guards

```typescript
function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Usage
if (isApiError(error)) {
  res.status(error.statusCode).json(error.toJSON());
}
```

#### 4. Leverage Union Types

```typescript
type UserStatus = 'active' | 'inactive' | 'locked';
type UserCategory = 'admin' | 'regular' | 'guest' | 'system';

interface User {
  status: UserStatus;
  user_category: UserCategory;
}
```

### Build Scripts

**Installation:**
```bash
npm install --save-dev typescript ts-node @types/node
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt
```

**package.json scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "dev": "ts-node backend/server.ts",
    "start": "node backend/dist/server.js"
  }
}
```

---

## Logging System

### Enhanced Logging with Winston

**File:** `backend/utils/logger.ts`

**Installation Required:**
```bash
npm install winston winston-daily-rotate-file
npm install --save-dev @types/winston
```

### Log Levels

```typescript
export enum LogLevel {
  ERROR = 'error',   // System errors, exceptions
  WARN = 'warn',     // Warnings, deprecated features
  INFO = 'info',     // General information
  HTTP = 'http',     // HTTP request logs
  DEBUG = 'debug',   // Debugging information
}
```

### Usage Examples

#### 1. Basic Logging

```typescript
import { log } from '../utils/logger';

// Error logging
log.error('Database connection failed', {
  error: error.message,
  stack: error.stack
});

// Warning
log.warn('Deprecated API endpoint used', {
  endpoint: '/api/old-endpoint',
  userId: req.user?.id
});

// Info
log.info('User logged in successfully', {
  userId: user.id,
  ip: req.ip
});

// Debug
log.debug('Query executed', {
  query: 'SELECT * FROM users WHERE id = $1',
  params: [userId],
  duration: 45
});
```

#### 2. Performance Logging

```typescript
const startTime = Date.now();

// ... operation ...

const duration = Date.now() - startTime;
log.performance('User search', duration, {
  userId: req.user?.id,
  searchTerm: 'john',
  resultCount: 25
});

// Automatically warns if duration > 1000ms
```

#### 3. Security Logging

```typescript
log.security('Failed login attempt', {
  loginid: 'admin',
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

log.security('Rate limit exceeded', {
  endpoint: '/api/auth/login',
  ip: req.ip,
  attempts: 6
});
```

#### 4. Audit Logging

```typescript
log.audit('User created', {
  adminId: req.user?.id,
  newUserId: newUser.id,
  action: 'CREATE_USER'
});

log.audit('Permission changed', {
  adminId: req.user?.id,
  targetUserId: userId,
  oldRole: 'regular',
  newRole: 'admin'
});
```

### Log Format

#### Development (Console)
```
2025-11-21 10:30:00 [INFO]: User logged in successfully
{ userId: 'user-123', ip: '127.0.0.1' }
```

#### Production (File)
```json
{
  "timestamp": "2025-11-21T10:30:00.000Z",
  "level": "info",
  "message": "User logged in successfully",
  "metadata": {
    "userId": "user-123",
    "ip": "127.0.0.1"
  }
}
```

### Log Configuration

```typescript
// Environment variables
LOG_LEVEL=info           // debug, info, warn, error
LOG_DIR=./logs           // Log file directory
NODE_ENV=production      // Enables file logging
```

### Log Rotation

**Production:**
- Error logs: 14 days retention, 20MB max size
- Combined logs: 7 days retention, 20MB max size
- Automatic compression (zippedArchive: true)

### Log Analysis Queries

```sql
-- Recent errors
SELECT * FROM logs
WHERE level = 'error'
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Slow operations (performance)
SELECT * FROM logs
WHERE metadata->>'type' = 'performance'
  AND (metadata->>'duration')::int > 1000
ORDER BY timestamp DESC;

-- Security events
SELECT * FROM logs
WHERE metadata->>'type' = 'security'
ORDER BY timestamp DESC
LIMIT 100;
```

---

## API Documentation

### Swagger/OpenAPI Setup

**Status:** ✅ Configured

**Files:**
- `backend/swagger.config.js` - Swagger configuration
- `backend/routes/swagger.js` - Swagger UI route
- `backend/docs/swagger/*.yaml` - API documentation

**Installation Required:**
```bash
npm install swagger-jsdoc swagger-ui-express
npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express
```

### Accessing Documentation

**Development:**
```
http://localhost:3001/api-docs
```

**JSON Schema:**
```
http://localhost:3001/api-docs/json
```

### Documentation Structure

```
backend/
├── swagger.config.js          # Main configuration
├── routes/swagger.js          # UI route
└── docs/
    └── swagger/
        ├── auth.yaml          # Authentication endpoints
        ├── users.yaml         # User management endpoints
        ├── departments.yaml   # Department endpoints
        └── ...
```

### Writing API Documentation

#### Method 1: YAML Files (Recommended)

**File:** `backend/docs/swagger/users.yaml`

```yaml
paths:
  /api/user:
    get:
      tags:
        - Users
      summary: List users
      description: Get a paginated list of users
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: page
          schema:
            type: integer
            minimum: 1
            default: 1
      responses:
        '200':
          description: Users retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
```

#### Method 2: JSDoc Comments

**File:** `backend/routes/user.js`

```javascript
/**
 * @swagger
 * /api/user:
 *   get:
 *     tags:
 *       - Users
 *     summary: List users
 *     description: Get a paginated list of users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', async (req, res) => {
  // ...
});
```

### Swagger UI Features

- **Interactive Testing:** Test endpoints directly from browser
- **Authentication:** Save JWT token for authenticated requests
- **Schema Validation:** View request/response schemas
- **Examples:** Multiple request/response examples
- **Try it Out:** Execute real API calls

### Best Practices

1. **Document All Endpoints**
   - Every public API endpoint should have documentation
   - Include all parameters and responses
   - Provide examples

2. **Use Examples**
   ```yaml
   examples:
     success:
       summary: Successful response
       value:
         success: true
         data: { ... }
     error:
       summary: Validation error
       value:
         success: false
         error: { ... }
   ```

3. **Document Error Codes**
   ```yaml
   responses:
     '400':
       description: |
         Validation error

         **Error Codes:**
         - `VALID_001`: Invalid input data
         - `VALID_002`: Missing required field
   ```

4. **Group by Tags**
   ```yaml
   tags:
     - name: Authentication
       description: Auth endpoints
     - name: Users
       description: User management
   ```

---

## Code Standards

### JavaScript/TypeScript Style

#### 1. Naming Conventions

```typescript
// Constants (UPPER_SNAKE_CASE)
const MAX_LOGIN_ATTEMPTS = 5;
const JWT_EXPIRY = '15m';

// Classes (PascalCase)
class UserService { }
class ApiError { }

// Functions/Variables (camelCase)
function getUserById(id) { }
const currentUser = { };

// Interfaces (PascalCase with 'I' prefix optional)
interface User { }
interface IAuthService { }  // Optional 'I' prefix

// Types (PascalCase)
type UserStatus = 'active' | 'inactive';
```

#### 2. File Structure

```typescript
// 1. Imports (grouped)
import { Request, Response } from 'express';  // External
import { User } from '../types';              // Internal types
import { userService } from '../services';    // Internal modules

// 2. Constants
const MAX_RESULTS = 100;

// 3. Types/Interfaces
interface UserQuery {
  page: number;
  limit: number;
}

// 4. Main code
export async function getUsers(req: Request, res: Response) {
  // ...
}

// 5. Exports
export default {
  getUsers,
  createUser,
};
```

#### 3. Error Handling

```typescript
// ✅ DO: Use try-catch with ApiError
async function getUser(req, res, next) {
  try {
    const user = await userService.findById(req.params.id);

    if (!user) {
      throw new NotFoundError(ErrorCodes.RES_USER_NOT_FOUND);
    }

    res.success({ user });
  } catch (error) {
    next(error);
  }
}

// ❌ DON'T: Silent failures
async function getUser(req, res) {
  const user = await userService.findById(req.params.id);
  if (!user) return;  // Silent failure!
  res.json(user);
}
```

#### 4. Async/Await

```typescript
// ✅ DO: Use async/await
async function loadUserData(userId) {
  const user = await userService.findById(userId);
  const roles = await roleService.getUserRoles(userId);
  return { user, roles };
}

// ❌ DON'T: Promise chains
function loadUserData(userId) {
  return userService.findById(userId)
    .then(user => roleService.getUserRoles(userId)
      .then(roles => ({ user, roles })));
}
```

### Database Query Standards

#### 1. Parameterized Queries

```javascript
// ✅ SAFE: Parameterized query
const result = await db.query(
  'SELECT * FROM users WHERE id = $1 AND status = $2',
  [userId, 'active']
);

// ❌ UNSAFE: String concatenation
const result = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

#### 2. Transaction Management

```javascript
async function transferUser(userId, fromDept, toDept) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE users SET department = $1 WHERE id = $2',
      [toDept, userId]
    );

    await client.query(
      'INSERT INTO audit_log (action, user_id) VALUES ($1, $2)',
      ['TRANSFER', userId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### 3. Query Optimization

```javascript
// ✅ DO: Use indexes
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',  // Indexed column
  [email]
);

// ✅ DO: Limit results
const result = await db.query(
  'SELECT * FROM logs ORDER BY timestamp DESC LIMIT $1',
  [limit]
);

// ✅ DO: Use Full-Text Search
const result = await db.query(`
  SELECT * FROM users
  WHERE to_tsvector('simple', loginid || email)
    @@ plainto_tsquery('simple', $1)
`, [searchTerm]);

// ❌ DON'T: LIKE with leading wildcard
const result = await db.query(
  "SELECT * FROM users WHERE email LIKE '%@example.com'"  // Slow!
);
```

---

## Testing Guidelines

### Test Structure

```
backend/
├── __tests__/
│   ├── unit/
│   │   ├── utils/
│   │   ├── services/
│   │   └── middleware/
│   ├── integration/
│   │   ├── routes/
│   │   └── database/
│   └── e2e/
│       └── scenarios/
```

### Unit Tests

```typescript
// __tests__/unit/utils/ApiError.test.ts
import { ValidationError, ErrorCodes } from '../../../utils/ApiError';

describe('ApiError', () => {
  describe('ValidationError', () => {
    it('should create error with correct status code', () => {
      const error = new ValidationError(ErrorCodes.VALID_INVALID_INPUT);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALID_001');
    });

    it('should convert to JSON correctly', () => {
      const error = new ValidationError(ErrorCodes.VALID_INVALID_INPUT);
      const json = error.toJSON();

      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALID_001');
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/routes/auth.test.ts
import request from 'supertest';
import app from '../../../server';

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        loginid: 'testuser',
        password: 'TestPass123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        loginid: 'testuser',
        password: 'wrong'
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTH_005');
  });
});
```

### Test Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Critical paths covered
- **E2E Tests:** Major user flows tested

---

## Performance Best Practices

### 1. Database Performance

✅ **Use Indexes**
- Full-text search (GIN)
- Foreign keys
- Frequently queried columns

✅ **Optimize Queries**
- Use parameterized queries
- Avoid N+1 queries
- Use JOINs instead of multiple queries
- Limit result sets

✅ **Connection Pooling**
- Min: 2 connections
- Max: 50 connections (production)
- Timeout: 5 seconds

### 2. Caching Strategy

```typescript
// Consider caching for:
// - User permissions (15 min TTL)
// - Menu structure (1 hour TTL)
// - Department hierarchy (1 hour TTL)
// - Static configuration (indefinite)

// Implementation (future):
import Redis from 'ioredis';
const redis = new Redis();

async function getUserWithCache(userId: string) {
  const cached = await redis.get(`user:${userId}`);

  if (cached) {
    return JSON.parse(cached);
  }

  const user = await userService.findById(userId);
  await redis.setex(`user:${userId}`, 900, JSON.stringify(user));

  return user;
}
```

### 3. Rate Limiting

- Already implemented
- Configurable via environment variables
- Per-endpoint limits

### 4. File Upload Optimization

- UUID-based filenames
- File size limits per type
- Streaming for large files
- Optional virus scanning

---

## Maintenance

### Daily Tasks
- [ ] Review error logs
- [ ] Monitor slow queries
- [ ] Check rate limit violations

### Weekly Tasks
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review and rotate logs
- [ ] Check disk space

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review and optimize queries
- [ ] Clean up old logs and files
- [ ] Review API usage patterns

### Quarterly Tasks
- [ ] Full security audit
- [ ] Performance testing
- [ ] TypeScript migration progress review
- [ ] Documentation updates

---

## Additional Resources

### Documentation
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Winston Logger: https://github.com/winstonjs/winston
- Swagger/OpenAPI: https://swagger.io/specification/

### Tools
- ESLint: Code linting
- Prettier: Code formatting
- Jest: Testing framework
- Supertest: API testing

### Internal Guides
- `SECURITY_GUIDE.md` - Security best practices
- `PERFORMANCE_OPTIMIZATION.md` - Performance tuning
- `ERROR_HANDLING_GUIDE.md` - Error handling patterns

---

**Document Version:** 1.0
**Last Review:** 2025-11-21
**Next Review:** 2026-02-21
