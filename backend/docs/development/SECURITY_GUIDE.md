# Security Guide

**Last Updated:** 2025-11-21
**Version:** 1.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Security Features](#security-features)
3. [Input Validation](#input-validation)
4. [File Upload Security](#file-upload-security)
5. [XSS Protection](#xss-protection)
6. [SQL Injection Prevention](#sql-injection-prevention)
7. [Security Headers](#security-headers)
8. [Rate Limiting](#rate-limiting)
9. [Authentication & Authorization](#authentication--authorization)
10. [Environment Variables](#environment-variables)
11. [Best Practices](#best-practices)
12. [Security Checklist](#security-checklist)
13. [Monitoring & Logging](#monitoring--logging)
14. [Incident Response](#incident-response)
15. [Regular Maintenance](#regular-maintenance)

---

## Overview

This application implements **defense in depth** security principles with multiple layers of protection:

```
User Request
    ↓
┌─────────────────────────────────────────┐
│ Layer 1: Rate Limiting                  │ ← Prevents brute force attacks
├─────────────────────────────────────────┤
│ Layer 2: Security Headers               │ ← Browser-level protection
├─────────────────────────────────────────┤
│ Layer 3: Input Validation (Zod)         │ ← Schema validation
├─────────────────────────────────────────┤
│ Layer 4: XSS/NoSQL/SQL Injection Check  │ ← Content filtering
├─────────────────────────────────────────┤
│ Layer 5: Authentication (JWT)           │ ← Identity verification
├─────────────────────────────────────────┤
│ Layer 6: Authorization (RBAC)           │ ← Permission check
├─────────────────────────────────────────┤
│ Layer 7: Database (Parameterized Query) │ ← SQL injection prevention
└─────────────────────────────────────────┘
    ↓
Database
```

**Key Security Principles:**
- ✅ **Fail Secure:** Default deny, explicit allow
- ✅ **Least Privilege:** Minimal permissions required
- ✅ **Defense in Depth:** Multiple security layers
- ✅ **Input Validation:** Trust nothing from users
- ✅ **Audit Logging:** Track all security events

---

## Security Features

### ✅ Implemented Security Features

| Feature | Status | Location | Description |
|---------|--------|----------|-------------|
| **Input Validation** | ✅ | `validators/`, `middleware/validate.js` | Zod schema validation |
| **File Upload Security** | ✅ | `middleware/fileUpload.js`, `utils/fileValidation.js` | Magic number validation, virus scanning |
| **XSS Protection** | ✅ | `middleware/security.js` | Input sanitization, CSP headers |
| **SQL Injection Prevention** | ✅ | `config/database.js`, `middleware/security.js` | Parameterized queries, pattern detection |
| **Security Headers** | ✅ | `middleware/security.js` | CSP, HSTS, X-Frame-Options, etc. |
| **Rate Limiting** | ✅ | `middleware/rateLimiter.js` | IP-based throttling |
| **Authentication** | ✅ | `middleware/auth.js`, `routes/auth.js` | JWT + MFA |
| **Authorization** | ✅ | `middleware/permission.js` | RBAC system |
| **Error Handling** | ✅ | `middleware/errorHandler.js`, `utils/ApiError.js` | Standardized errors |
| **Logging** | ✅ | `middleware/logger.js`, `services/logService.js` | Audit trail |

---

## Input Validation

### Zod Schema Validation

**Purpose:** Validate and sanitize all user input before processing.

**Location:** `validators/`, `middleware/validate.js`

#### User Input Validation

```javascript
// Example: Validate user creation
const { validateBody } = require('../middleware/validate');
const { createUserSchema } = require('../validators/userValidators');

router.post('/user',
  authenticateToken,
  validateBody(createUserSchema),
  async (req, res, next) => {
    // req.body is now validated and sanitized
    // ...
  }
);
```

#### Common Validators

**File:** `validators/commonValidators.js`

```javascript
const {
  idSchema,              // UUID or custom ID
  codeSchema,            // Entity codes (DEPT-001)
  emailSchema,           // Email validation
  urlSchema,             // URL validation
  paginationSchema,      // Page/limit validation
  searchSchema,          // Search term validation
  fileNameSchema,        // Safe filename validation
} = require('../validators/commonValidators');
```

#### Custom Validation

```javascript
const { z } = require('zod');

const customSchema = z.object({
  field: z.string()
    .min(1, 'Field is required')
    .max(100, 'Too long')
    .regex(/^[a-z0-9_-]+$/, 'Invalid format')
    .transform((val) => val.trim().toLowerCase())
});
```

#### Validation Features

- ✅ **Type checking:** String, number, boolean, date, etc.
- ✅ **Length limits:** Min/max character validation
- ✅ **Regex patterns:** Format enforcement
- ✅ **Transformation:** Automatic sanitization
- ✅ **Custom rules:** Refinements for complex logic
- ✅ **Error messages:** Clear, user-friendly feedback

---

## File Upload Security

### Multi-Layer File Validation

**Location:** `middleware/fileUpload.js`, `utils/fileValidation.js`

#### Security Layers

1. **MIME Type Whitelist** (Line 1)
   - Only approved file types allowed
   - Configured in `ALLOWED_MIME_TYPES`

2. **Extension Whitelist** (Line 2)
   - Double-check file extension
   - Prevents `.php.jpg` tricks

3. **Magic Number Validation** (Line 3)
   - Reads file signature (first bytes)
   - Detects MIME type spoofing
   - **Example:** JPEG must start with `FF D8 FF`

4. **File Size Limits** (Line 4)
   - Per-type size limits
   - Default: 10MB max

5. **Dangerous Pattern Detection** (Line 5)
   - Blocks `.exe`, `.sh`, `.php`, etc.
   - Prevents double extensions
   - Detects null byte injection

6. **Optional Virus Scanning** (Line 6)
   - ClamAV integration
   - Enable with `VIRUS_SCAN_ENABLED=true`

#### Usage Example

```javascript
const { uploadSingle, virusScanMiddleware } = require('../middleware/fileUpload');

router.post('/upload',
  uploadLimiter,
  authenticateToken,
  ...uploadSingle('file'),      // Validates file
  virusScanMiddleware,          // Optional virus scan
  async (req, res, next) => {
    // req.file is validated and safe
    res.success({ file: req.file });
  }
);
```

#### File Upload Configuration

**Environment Variables:**

```env
# Virus scanning (optional)
VIRUS_SCAN_ENABLED=false
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

#### Magic Number Examples

| File Type | Magic Number (Hex) | First Bytes |
|-----------|-------------------|-------------|
| JPEG | `FF D8 FF E0` | ÿØÿà |
| PNG | `89 50 4E 47 0D 0A 1A 0A` | ‰PNG␍␊␚␊ |
| PDF | `25 50 44 46 2D` | %PDF- |
| ZIP/DOCX/XLSX | `50 4B 03 04` | PK.. |

---

## XSS Protection

### Cross-Site Scripting Prevention

**Location:** `middleware/security.js`

#### Protection Mechanisms

1. **Input Sanitization**
   ```javascript
   // Automatically removes:
   - <script> tags
   - javascript: protocols
   - Event handlers (onclick=, onerror=)
   - Angle brackets (< >)
   ```

2. **Content Security Policy (CSP)**
   ```
   Content-Security-Policy:
   - default-src 'self'
   - script-src 'self'
   - style-src 'self' 'unsafe-inline'
   - img-src 'self' data: https:
   - frame-ancestors 'none'
   ```

3. **Output Encoding**
   - Use React's built-in XSS protection
   - Always use `{variable}` not `dangerouslySetInnerHTML`
   - If HTML needed, use DOMPurify

#### Frontend Protection (React)

```javascript
import DOMPurify from 'isomorphic-dompurify';

// Safe HTML rendering
const SafeHTML = ({ html }) => {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });

  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

#### XSS Attack Examples (Blocked)

```html
<!-- All of these are blocked by our security layers -->
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<a href="javascript:alert('XSS')">Click</a>
<iframe src="evil.com"></iframe>
```

---

## SQL Injection Prevention

### Multi-Layer Defense

#### Primary Defense: Parameterized Queries

**Location:** `config/database.js`

```javascript
// ✅ SAFE: Parameterized query
const result = await db.query(
  'SELECT * FROM users WHERE id = $1 AND status = $2',
  [userId, 'active']
);

// ❌ UNSAFE: String concatenation (NEVER DO THIS)
const result = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

#### Secondary Defense: Pattern Detection

**Location:** `middleware/security.js`

```javascript
// Blocks suspicious SQL patterns:
- SELECT, INSERT, UPDATE, DELETE
- UNION SELECT
- OR 1=1
- --, ;, /* */
- xp_, sp_ (stored procedures)
```

#### SQL Injection Examples (Blocked)

```javascript
// All of these are blocked by our security:

// 1. Classic SQL injection
username = "admin' OR '1'='1"
// Blocked by: Pattern detection + parameterized query

// 2. Union-based injection
id = "1 UNION SELECT password FROM users"
// Blocked by: UNION pattern detection

// 3. Comment-based injection
password = "'; DROP TABLE users; --"
// Blocked by: Comment pattern detection

// 4. Stored procedure injection
input = "'; EXEC xp_cmdshell('calc'); --"
// Blocked by: xp_ pattern detection
```

---

## Security Headers

### HTTP Security Headers

**Location:** `middleware/security.js`

All responses include these security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| **X-Content-Type-Options** | `nosniff` | Prevent MIME sniffing |
| **X-Frame-Options** | `DENY` | Prevent clickjacking |
| **X-XSS-Protection** | `1; mode=block` | Enable XSS filter (legacy) |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Control referrer info |
| **X-Download-Options** | `noopen` | Prevent IE download execution |
| **Content-Security-Policy** | (see below) | Restrict resource loading |
| **Strict-Transport-Security** | `max-age=31536000` | Force HTTPS (production) |

#### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**Note:** `unsafe-inline` and `unsafe-eval` are enabled for development. Tighten in production.

---

## Rate Limiting

### Tiered Rate Limiting

**Location:** `middleware/rateLimiter.js`

#### Rate Limit Configuration

| Limiter | Window | Max Requests | Use Case |
|---------|--------|--------------|----------|
| **generalLimiter** | 15 min | 100 | All API endpoints |
| **authLimiter** | 15 min | 5 | Login attempts |
| **mfaLimiter** | 5 min | 3 | MFA verification |
| **uploadLimiter** | 1 hour | 50 | File uploads |
| **modifyLimiter** | 1 min | 20 | Data modifications |
| **strictLimiter** | 1 hour | 3 | Sensitive operations |

#### Configuration via Environment Variables

```env
# General API rate limiting
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX=100                   # 100 requests

# Authentication rate limiting
RATE_LIMIT_AUTH_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_AUTH_MAX=5                # 5 login attempts

# MFA rate limiting
RATE_LIMIT_MFA_WINDOW_MS=300000      # 5 minutes
RATE_LIMIT_MFA_MAX=3                 # 3 MFA attempts

# Upload rate limiting
RATE_LIMIT_UPLOAD_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_UPLOAD_MAX=50             # 50 uploads

# Modify rate limiting
RATE_LIMIT_MODIFY_WINDOW_MS=60000    # 1 minute
RATE_LIMIT_MODIFY_MAX=20             # 20 modifications
```

#### Usage Example

```javascript
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');

// Login endpoint (5 attempts per 15 minutes)
router.post('/login', authLimiter, loginHandler);

// Password reset (3 attempts per hour)
router.post('/reset-password', strictLimiter, resetHandler);
```

#### Admin Bypass

Authenticated admin users bypass `generalLimiter` and `uploadLimiter`.

#### Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_001",
    "message": "Too many requests. Please try again later.",
    "timestamp": "2025-11-21T10:30:00.000Z",
    "retryAfter": 1732186200,
    "limit": 100
  }
}
```

---

## Authentication & Authorization

### JWT-Based Authentication

**Location:** `middleware/auth.js`, `routes/auth.js`

#### Authentication Flow

```
1. User logs in with credentials
   ↓
2. Credentials validated against database (bcrypt)
   ↓
3. JWT access token generated (15min expiry)
   ↓
4. JWT refresh token generated (7 days expiry)
   ↓
5. Tokens returned to client
   ↓
6. Client includes access token in Authorization header
   ↓
7. Server validates token on each request
   ↓
8. If expired, client uses refresh token to get new access token
```

#### MFA (Multi-Factor Authentication)

**Features:**
- Email-based verification codes
- 10-minute code expiry
- Rate limited (3 attempts per 5 minutes)
- Can be enabled per user

#### Token Blacklist

Revoked tokens are stored in `token_blacklist` table:
- Logout invalidates tokens
- Periodic cleanup of expired tokens

#### Authorization (RBAC)

**Role-Based Access Control:**

```javascript
const { checkPermission } = require('../middleware/permission');

// Require specific permission
router.get('/admin/users',
  authenticateToken,
  checkPermission('user.view'),
  getUsersHandler
);

// Require admin role
router.delete('/admin/users/:id',
  authenticateToken,
  checkPermission('user.delete'),
  deleteUserHandler
);
```

**Permission Format:** `resource.action`
- `user.view`, `user.create`, `user.update`, `user.delete`
- `menu.view`, `menu.create`, `menu.update`, `menu.delete`
- `role.view`, `role.create`, `role.update`, `role.delete`

---

## Environment Variables

### Secure Configuration

**Location:** `.env` (NEVER commit this file!)

#### Critical Environment Variables

```env
# JWT Secrets (MUST be strong random strings)
JWT_SECRET=<64+ character random string>
JWT_REFRESH_SECRET=<64+ character random string>

# Database Credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nextjs_enterprise_app
DB_USER=app_user
DB_PASSWORD=<strong password>

# Email Configuration (for MFA)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app password>

# Node Environment
NODE_ENV=production

# Rate Limiting (optional overrides)
RATE_LIMIT_MAX=100
RATE_LIMIT_AUTH_MAX=5

# File Upload Security
VIRUS_SCAN_ENABLED=false
CLAMAV_HOST=localhost
CLAMAV_PORT=3310

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Environment Variable Templates

**Development:** `.env.example`
**Production:** `.env.production.example`

#### Secret Generation

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Best Practices

### Development Guidelines

#### 1. Input Validation
- ✅ **DO:** Validate all user input with Zod schemas
- ✅ **DO:** Sanitize input before storing
- ❌ **DON'T:** Trust any user input
- ❌ **DON'T:** Skip validation for "internal" endpoints

#### 2. Database Queries
- ✅ **DO:** Always use parameterized queries
- ✅ **DO:** Use `db.query(sql, [params])`
- ❌ **DON'T:** Concatenate user input into SQL
- ❌ **DON'T:** Use raw SQL with user input

#### 3. File Uploads
- ✅ **DO:** Use `uploadSingle` or `uploadMultiple` middleware
- ✅ **DO:** Validate file content with magic numbers
- ❌ **DON'T:** Trust MIME types alone
- ❌ **DON'T:** Allow executable file uploads

#### 4. Authentication
- ✅ **DO:** Use JWT tokens with expiry
- ✅ **DO:** Implement refresh token rotation
- ✅ **DO:** Enable MFA for sensitive accounts
- ❌ **DON'T:** Store tokens in localStorage (use httpOnly cookies)
- ❌ **DON'T:** Put sensitive data in JWT payload

#### 5. Error Handling
- ✅ **DO:** Use ApiError classes
- ✅ **DO:** Log errors with context
- ❌ **DON'T:** Expose stack traces to users
- ❌ **DON'T:** Return database errors directly

#### 6. Logging
- ✅ **DO:** Log all authentication events
- ✅ **DO:** Log security-related errors
- ❌ **DON'T:** Log passwords or tokens
- ❌ **DON'T:** Log sensitive personal data

---

## Security Checklist

### Pre-Deployment Security Checklist

#### Environment
- [ ] `.env` file not committed to git
- [ ] Strong JWT secrets generated (64+ characters)
- [ ] Database credentials are strong
- [ ] `NODE_ENV=production` set
- [ ] HTTPS enabled
- [ ] CORS restricted to allowed origins

#### Configuration
- [ ] Rate limits configured appropriately
- [ ] File upload limits set
- [ ] Security headers enabled
- [ ] CSP policy reviewed and tightened
- [ ] HSTS enabled in production

#### Authentication
- [ ] JWT expiry times appropriate
- [ ] Refresh token rotation enabled
- [ ] MFA available for admins
- [ ] Token blacklist working
- [ ] Password strength requirements enforced

#### Database
- [ ] All queries use parameterization
- [ ] Database user has minimal permissions
- [ ] Sensitive data encrypted
- [ ] Indexes on security-related columns
- [ ] Regular backups configured

#### Logging
- [ ] Security events logged
- [ ] Failed login attempts logged
- [ ] Rate limit violations logged
- [ ] Sensitive data not in logs
- [ ] Log rotation configured

#### File Uploads
- [ ] Magic number validation enabled
- [ ] File size limits enforced
- [ ] Dangerous extensions blocked
- [ ] Upload directory not executable
- [ ] Consider virus scanning for production

#### Dependencies
- [ ] All npm packages up to date
- [ ] `npm audit` shows no vulnerabilities
- [ ] Unused dependencies removed
- [ ] License compliance checked

---

## Monitoring & Logging

### Security Event Logging

**Location:** `middleware/logger.js`, `services/logService.js`

#### Events to Monitor

| Event | Severity | Alert Threshold |
|-------|----------|----------------|
| Failed login attempts | WARN | 5 per IP per hour |
| Rate limit violations | WARN | 3 per IP per hour |
| MFA failures | ERROR | 3 per user per hour |
| SQL injection attempts | ERROR | 1 per IP |
| XSS attempts | ERROR | 1 per IP |
| File upload failures | WARN | 10 per IP per hour |
| Token blacklist hits | INFO | - |
| Permission denials | WARN | 10 per user per hour |

#### Log Analysis Queries

```sql
-- Failed login attempts by IP
SELECT
  metadata->>'ip' as ip,
  COUNT(*) as attempts,
  MAX(timestamp) as last_attempt
FROM logs
WHERE
  metadata->>'action' = 'login'
  AND status_code >= 400
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY metadata->>'ip'
HAVING COUNT(*) >= 5;

-- Rate limit violations
SELECT
  metadata->>'ip' as ip,
  COUNT(*) as violations,
  MAX(timestamp) as last_violation
FROM logs
WHERE
  status_code = 429
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY metadata->>'ip';

-- SQL injection attempts
SELECT
  metadata->>'ip' as ip,
  metadata->>'url' as endpoint,
  message,
  timestamp
FROM logs
WHERE
  message ILIKE '%SQL%injection%'
  OR message ILIKE '%UNION%SELECT%'
ORDER BY timestamp DESC;
```

---

## Incident Response

### Security Incident Response Plan

#### 1. Detection
- Monitor security logs
- Review rate limit violations
- Check for suspicious patterns
- Review database queries

#### 2. Analysis
- Identify attack vector
- Assess scope of breach
- Determine affected data
- Collect evidence

#### 3. Containment
```bash
# Block suspicious IP at firewall level
sudo iptables -A INPUT -s <IP_ADDRESS> -j DROP

# Revoke all tokens for compromised user
psql -d nextjs_enterprise_app -c "
INSERT INTO token_blacklist (token, user_id, revoked_at)
SELECT token, user_id, NOW()
FROM tokens
WHERE user_id = '<COMPROMISED_USER_ID>';
"

# Disable compromised account
psql -d nextjs_enterprise_app -c "
UPDATE users
SET status = 'locked', updated_at = NOW()
WHERE id = '<COMPROMISED_USER_ID>';
"
```

#### 4. Eradication
- Fix vulnerability
- Deploy patch
- Update dependencies
- Review similar code paths

#### 5. Recovery
- Restore from clean backup if needed
- Reset compromised credentials
- Notify affected users
- Monitor for continued attacks

#### 6. Post-Incident
- Document incident
- Review response effectiveness
- Update security policies
- Train team on lessons learned

---

## Regular Maintenance

### Daily Tasks
- [ ] Review security logs
- [ ] Monitor rate limit violations
- [ ] Check disk space (logs, uploads)

### Weekly Tasks
- [ ] Review failed login attempts
- [ ] Analyze slow queries
- [ ] Check for new CVEs in dependencies
- [ ] Review API usage patterns

### Monthly Tasks
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Update dependencies
- [ ] Review and rotate JWT secrets
- [ ] Clean up old uploaded files
- [ ] Run database performance tests
- [ ] Review user permissions

### Quarterly Tasks
- [ ] Security audit
- [ ] Penetration testing
- [ ] Review rate limit configuration
- [ ] Update CSP policy
- [ ] Review RBAC permissions
- [ ] Backup and disaster recovery test

---

## Additional Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency vulnerability scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Web application security scanner
- [Burp Suite](https://portswigger.net/burp) - Web vulnerability scanner
- [sqlmap](https://sqlmap.org/) - SQL injection testing tool (for authorized testing only)

### Internal Documentation
- `ERROR_HANDLING_GUIDE.md` - Error handling patterns
- `PERFORMANCE_OPTIMIZATION.md` - Performance best practices
- `ENVIRONMENT_SETUP.md` - Environment configuration

---

## Contact

For security issues, please contact:

- **Email:** security@yourdomain.com
- **Emergency:** Follow incident response plan

**DO NOT** disclose security vulnerabilities publicly before they are fixed.

---

**Document Version:** 1.0
**Last Review:** 2025-11-21
**Next Review:** 2026-02-21
