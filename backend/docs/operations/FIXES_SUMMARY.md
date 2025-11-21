# Fixes Summary - User Preferences 500 Error & Rate Limiter

## Date: 2025-11-21

## Issues Fixed

### 1. User Preferences 500 Error

**Problem:** The `/api/user/preferences` endpoint was returning 500 errors when called from the frontend.

**Root Causes:**
1. Backend route was accessing `req.user.userId` without validation
2. Frontend components were incorrectly accessing `response.preferences` instead of `response.data.preferences`
3. No proper error handling for missing userId or user not found scenarios

**Solutions Implemented:**

#### Backend Fix (backend/routes/user.js:169-247)
- Added explicit validation for `userId` from JWT token
- Added 401 response when userId is missing from token
- Added 404 response when user is not found
- Added comprehensive error logging with context
- Wrapped response in standardized format with `success: true`
- Added proper error propagation with `next(error)`

```javascript
router.get('/preferences', authenticateToken, async (req, res, next) => {
  try {
    // Validate userId from JWT
    const userId = req.user?.userId;

    if (!userId) {
      console.error('Get preferences error: userId not found in JWT token', req.user);
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Invalid access token - userId missing',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Get user's MFA status
    const user = await userService.getUserById(userId);

    if (!user) {
      console.error('Get preferences error: user not found', { userId });
      return res.status(404).json({
        success: false,
        error: {
          code: 'RES_101',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    // ... rest of preferences logic

    res.json({
      success: true,
      preferences: apiPreferences
    });
  } catch (error) {
    console.error('Get preferences error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });
    next(error);
  }
});
```

#### Frontend Fixes

**File: src/components/providers/LanguageLoader.tsx (line 43)**
```typescript
// Before:
const { preferences } = response;

// After:
const { preferences } = response.data;
```

**File: src/app/[locale]/dashboard/settings/page.tsx (line 153)**
```typescript
// Before:
const response = await api.get('/user/preferences');
const { preferences } = response;

// After:
const response = await api.get('/user/preferences');
const { preferences } = response.data;
```

### 2. Rate Limiter IPv6 Validation Error

**Problem:** Backend was failing to start with error:
```
ValidationError: Custom keyGenerator appears to use request IP without calling
the ipKeyGenerator helper function for IPv6 addresses.
```

**Root Cause:**
The `authLimiter` in `backend/middleware/rateLimiter.js` was using `req.ip` directly in a custom keyGenerator without properly handling IPv6 addresses.

**Solution Implemented:**

**File: backend/middleware/rateLimiter.js**

1. Imported the `ipKeyGenerator` helper function:
```javascript
const { ipKeyGenerator } = require('express-rate-limit');
```

2. Updated the authLimiter keyGenerator to use the helper:
```javascript
const authLimiter = rateLimit({
  windowMs: config.auth.windowMs,
  max: config.auth.max,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP + username for more accurate rate limiting
  // Using ipKeyGenerator to properly handle IPv6 addresses
  keyGenerator: (req) => {
    const username = req.body?.loginid || req.body?.email || 'unknown';
    const ip = ipKeyGenerator(req);
    return `${ip}-${username}`;
  },
  handler: createRateLimitHandler(ErrorCodes.RATE_LOGIN_LIMIT_EXCEEDED),
});
```

## Verification

### JWT Token Structure Verified
- Tokens are generated with `userId` property (auth.js:62-65, 130-133)
- Authentication middleware correctly sets `req.user` to decoded payload (auth.js:36-37)
- Backend routes now validate `req.user?.userId` before use

### Backend Status
✅ Backend server running successfully on http://localhost:3001
✅ Database connected: nextjs_enterprise_app
✅ No startup errors
✅ Rate limiter IPv6 issue resolved

### Expected Behavior
1. When user logs in, JWT token contains `userId`, `username`, and `role`
2. LanguageLoader component loads user preferences on authentication
3. Settings page loads and displays user preferences correctly
4. All responses follow standardized format: `{ success: true, preferences: {...} }`
5. Proper error responses with error codes (AUTH_002, RES_101, etc.)

## Testing Recommendations

1. **Login Flow Test:**
   - Login with valid credentials
   - Verify LanguageLoader component loads language preference
   - Check browser console for any errors

2. **Settings Page Test:**
   - Navigate to /dashboard/settings
   - Verify preferences load correctly
   - Check that language, theme, and other settings are displayed

3. **Error Scenarios:**
   - Test with invalid/expired token → should get 401 error
   - Test with valid token for non-existent user → should get 404 error
   - Verify error responses have proper structure with error codes

4. **Rate Limiting Test:**
   - Test from IPv4 address
   - Test from IPv6 address (if available)
   - Verify rate limiting works for both address types

## Files Modified

1. `backend/routes/user.js` (lines 169-247)
2. `backend/middleware/rateLimiter.js` (lines 1-2, 74-88)
3. `src/components/providers/LanguageLoader.tsx` (line 43)
4. `src/app/[locale]/dashboard/settings/page.tsx` (line 153)

## Related Error Codes

- `AUTH_002`: Invalid access token - userId missing
- `RES_101`: User not found
- `RATE_LOGIN_LIMIT_EXCEEDED`: Too many login attempts

## Notes

- All fixes maintain backward compatibility
- Error responses follow the standardized error code system
- Enhanced logging added for debugging
- IPv6 support now properly implemented in rate limiter
