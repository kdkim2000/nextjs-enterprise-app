# Error Handling Guide

## Overview
This application uses a standardized error handling system for consistent API responses and better debugging.

## Architecture

```
Route Handler → Service Layer → Database
     ↓              ↓              ↓
  Throw ApiError    ↓              ↓
     ↓              ↓              ↓
  Error Middleware ←────────────────
     ↓
  Standardized JSON Response
```

## Error Classes

### ApiError (Base Class)
```javascript
const { ApiError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');

throw new ApiError(
  ErrorCodes.RES_NOT_FOUND,
  'User not found',
  404,
  { userId: 123 }
);
```

### Convenience Classes

#### AuthenticationError
```javascript
const { AuthenticationError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');

throw new AuthenticationError(ErrorCodes.AUTH_TOKEN_EXPIRED);
```

#### ValidationError
```javascript
const { ValidationError } = require('../utils/ApiError');

throw new ValidationError('Invalid email format', {
  field: 'email',
  value: 'invalid-email'
});
```

#### NotFoundError
```javascript
const { NotFoundError } = require('../utils/ApiError');

throw new NotFoundError('User');
// Response: "User not found" with 404 status
```

#### ForbiddenError
```javascript
const { ForbiddenError } = require('../utils/ApiError');

throw new ForbiddenError('Cannot delete system role');
```

#### DatabaseError
```javascript
const { DatabaseError } = require('../utils/ApiError');

throw new DatabaseError('Failed to insert record');
```

## Usage in Routes

### Before (Old Way)
```javascript
router.get('/user/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
```

### After (New Way)
```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError } = require('../utils/ApiError');

router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.success(user);
}));
```

### Benefits
- ✅ No more try-catch blocks in every route
- ✅ Automatic error handling
- ✅ Consistent error format
- ✅ Less code duplication

## Success Responses

### Using res.success()
```javascript
// Simple success
res.success(userData);

// With custom status code
res.success(newUser, 201);

// With metadata
res.success(users, 200, {
  total: 100,
  page: 1,
  limit: 50
});
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-21T12:00:00.000Z",
  "meta": {
    "total": 100,
    "page": 1
  }
}
```

## Error Response Format

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "RES_001",
    "message": "User not found",
    "timestamp": "2025-11-21T12:00:00.000Z"
  }
}
```

### With Details
```json
{
  "success": false,
  "error": {
    "code": "VALID_001",
    "message": "Invalid input data",
    "timestamp": "2025-11-21T12:00:00.000Z",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "rule": "email format"
    }
  }
}
```

### Development Mode (includes stack trace)
```json
{
  "success": false,
  "error": {
    "code": "SYS_001",
    "message": "Internal server error",
    "timestamp": "2025-11-21T12:00:00.000Z",
    "stack": "Error: ...\n  at ..."
  }
}
```

## Error Codes Reference

### Authentication (AUTH_xxx)
| Code | Status | Message |
|------|--------|---------|
| AUTH_001 | 401 | Access token is required |
| AUTH_002 | 401 | Invalid access token |
| AUTH_003 | 401 | Access token has expired |
| AUTH_004 | 401 | Access token has been revoked |
| AUTH_005 | 401 | Invalid username or password |
| AUTH_009 | 403 | Permission denied |
| AUTH_010 | 403 | Insufficient permissions |

### Validation (VALID_xxx)
| Code | Status | Message |
|------|--------|---------|
| VALID_001 | 400 | Invalid input data |
| VALID_002 | 400 | Required field is missing |
| VALID_003 | 400 | Invalid data format |
| VALID_004 | 400 | Invalid email address |

### Resource (RES_xxx)
| Code | Status | Message |
|------|--------|---------|
| RES_001 | 404 | Resource not found |
| RES_002 | 409 | Resource already exists |
| RES_101 | 404 | User not found |
| RES_102 | 404 | Role not found |

### Database (DB_xxx)
| Code | Status | Message |
|------|--------|---------|
| DB_001 | 500 | Database connection failed |
| DB_002 | 500 | Database query failed |
| DB_005 | 409 | Duplicate entry |
| DB_006 | 400 | Referenced record not found |

See `constants/errorCodes.js` for complete list.

## Service Layer Pattern

### Good Practice
```javascript
// userService.js
const { NotFoundError, ConflictError } = require('../utils/ApiError');
const db = require('../config/database');

async function getUserById(id) {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  if (!result.rows[0]) {
    throw new NotFoundError('User');
  }

  return result.rows[0];
}

async function createUser(userData) {
  // Check for duplicates
  const existing = await db.query(
    'SELECT id FROM users WHERE loginid = $1',
    [userData.loginid]
  );

  if (existing.rows[0]) {
    throw new ConflictError('User with this login ID already exists');
  }

  // Insert user
  const result = await db.query(
    'INSERT INTO users (loginid, email, ...) VALUES ($1, $2, ...) RETURNING *',
    [userData.loginid, userData.email, ...]
  );

  return result.rows[0];
}

module.exports = { getUserById, createUser };
```

### Route Implementation
```javascript
// routes/user.js
const { asyncHandler } = require('../middleware/errorHandler');
const userService = require('../services/userService');

// Get user by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.success(user);
}));

// Create user
router.post('/', asyncHandler(async (req, res) => {
  const newUser = await userService.createUser(req.body);
  res.success(newUser, 201);
}));
```

## Database Error Handling

### Automatic Conversion
Database errors are automatically converted to ApiError:

```javascript
// PostgreSQL duplicate key error (23505)
// Automatically becomes:
{
  "success": false,
  "error": {
    "code": "DB_005",
    "message": "A record with this value already exists",
    "details": {
      "constraint": "users_loginid_key"
    }
  }
}
```

### Foreign Key Violations
```javascript
// PostgreSQL foreign key error (23503)
// Automatically becomes:
{
  "success": false,
  "error": {
    "code": "DB_006",
    "message": "Referenced record not found",
    "details": {
      "constraint": "users_department_fkey"
    }
  }
}
```

## Validation with Zod (Recommended)

### Define Schema
```javascript
const { z } = require('zod');
const { ValidationError } = require('../utils/ApiError');

const createUserSchema = z.object({
  loginid: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  name_ko: z.string().min(1),
  department: z.string().optional(),
});
```

### Validation Middleware
```javascript
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Validation failed', details);
    }
  };
}
```

### Usage
```javascript
router.post(
  '/user',
  validateRequest(createUserSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.success(user, 201);
  })
);
```

## Migration Checklist

### Per Route File
- [ ] Import `asyncHandler` and error classes
- [ ] Wrap async handlers with `asyncHandler()`
- [ ] Replace `res.json()` with `res.success()`
- [ ] Replace manual error responses with `throw new XxxError()`
- [ ] Remove try-catch blocks (unless specific handling needed)

### Example Migration
```javascript
// Before
router.get('/user/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// After
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.success(user);
}));
```

## Testing Error Responses

### Manual Testing
```bash
# Missing token
curl http://localhost:3001/api/user/1
# Response: { "success": false, "error": { "code": "AUTH_001", ... }}

# Invalid token
curl -H "Authorization: Bearer invalid" http://localhost:3001/api/user/1
# Response: { "success": false, "error": { "code": "AUTH_002", ... }}

# Not found
curl -H "Authorization: Bearer valid_token" http://localhost:3001/api/user/99999
# Response: { "success": false, "error": { "code": "RES_101", ... }}
```

### Unit Testing
```javascript
const request = require('supertest');
const app = require('../server');

describe('Error Handling', () => {
  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .get('/api/user/99999')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('RES_101');
    expect(response.body.error.message).toBe('User not found');
  });
});
```

## Best Practices

1. **Always use asyncHandler** for async routes
2. **Throw errors, don't return them** - Let middleware handle responses
3. **Use specific error classes** - NotFoundError, ValidationError, etc.
4. **Include helpful details** - But don't expose sensitive info
5. **Use error codes** - For client-side error handling
6. **Log errors appropriately** - Use proper logging levels
7. **Test error scenarios** - Don't just test happy paths
8. **Document custom errors** - Add to errorCodes.js

## Troubleshooting

### Error not caught by middleware
**Cause:** Route handler not wrapped with `asyncHandler`
**Solution:** Use `asyncHandler()` wrapper

### Stack trace exposed in production
**Cause:** NODE_ENV not set to 'production'
**Solution:** Set `NODE_ENV=production` in .env

### Custom error message not showing
**Cause:** Error not thrown correctly
**Solution:** Use `throw new ApiError(...)` not `return new ApiError(...)`
