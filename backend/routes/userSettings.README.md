# User Settings API Documentation

## Overview
This API provides endpoints for managing user-specific settings and preferences. Each user can customize their application experience through various settings categories.

## Base URL
```
/api/user-settings
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Settings Structure

### Categories
- **general**: Language, timezone, date/time formats
- **appearance**: Theme, font size, UI density
- **notifications**: Email, push, desktop, sound preferences
- **dataGrid**: Table/grid display preferences
- **privacy**: Visibility and analytics preferences
- **advanced**: Debug mode, beta features, keyboard shortcuts

## Endpoints

### 1. Get Current User's Settings
Get the authenticated user's settings.

**Endpoint:** `GET /api/user-settings`

**Response:**
```json
{
  "settings": {
    "userId": "user-001",
    "general": {
      "language": "en",
      "timezone": "Asia/Seoul",
      "dateFormat": "YYYY-MM-DD",
      "timeFormat": "24h"
    },
    "appearance": {
      "theme": "light",
      "fontSize": "medium",
      "compactMode": false,
      "sidebarCollapsed": false
    },
    "notifications": {
      "email": true,
      "push": true,
      "desktop": false,
      "sound": true
    },
    "dataGrid": {
      "defaultPageSize": 50,
      "showDensitySelector": true,
      "showColumnSelector": true,
      "showFilterPanel": true,
      "autoRefresh": false,
      "autoRefreshInterval": 30
    },
    "privacy": {
      "showOnlineStatus": true,
      "showActivity": true,
      "allowAnalytics": true
    },
    "advanced": {
      "enableDebugMode": false,
      "enableBetaFeatures": false,
      "enableKeyboardShortcuts": true
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2025-11-08T22:10:07.000Z"
  }
}
```

### 2. Update Settings (Full or Partial)
Update one or more settings sections.

**Endpoint:** `PUT /api/user-settings`

**Request Body:**
```json
{
  "general": {
    "language": "ko"
  },
  "appearance": {
    "theme": "dark",
    "fontSize": "large"
  },
  "dataGrid": {
    "defaultPageSize": 100
  }
}
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "settings": { /* updated settings object */ }
}
```

**Notes:**
- Partial updates are supported - only send the fields you want to change
- Nested updates are merged with existing values
- Missing fields retain their current values

### 3. Update Specific Settings Section
Update only one section of settings.

**Endpoint:** `PATCH /api/user-settings/:section`

**Valid Sections:**
- `general`
- `appearance`
- `notifications`
- `dataGrid`
- `privacy`
- `advanced`

**Example:** `PATCH /api/user-settings/appearance`

**Request Body:**
```json
{
  "theme": "dark",
  "fontSize": "large"
}
```

**Response:**
```json
{
  "message": "appearance settings updated successfully",
  "settings": { /* updated settings object */ }
}
```

### 4. Reset Settings to Default
Reset all settings to their default values.

**Endpoint:** `POST /api/user-settings/reset`

**Response:**
```json
{
  "message": "Settings reset to default successfully",
  "settings": { /* default settings object */ }
}
```

### 5. Get All Users' Settings (Admin Only)
Retrieve settings for all users.

**Endpoint:** `GET /api/user-settings/all`

**Authorization:** Admin role required

**Response:**
```json
{
  "settings": [
    { /* user 1 settings */ },
    { /* user 2 settings */ },
    { /* user 3 settings */ }
  ]
}
```

### 6. Get Specific User's Settings (Admin Only)
Retrieve settings for a specific user by their user ID.

**Endpoint:** `GET /api/user-settings/user/:userId`

**Authorization:** Admin role required

**Example:** `GET /api/user-settings/user/user-001`

**Response:**
```json
{
  "settings": { /* user settings object */ }
}
```

**Error Response (404):**
```json
{
  "error": "User settings not found"
}
```

## Default Settings

When a user accesses their settings for the first time, default settings are automatically created:

```json
{
  "general": {
    "language": "en",
    "timezone": "Asia/Seoul",
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "24h"
  },
  "appearance": {
    "theme": "light",
    "fontSize": "medium",
    "compactMode": false,
    "sidebarCollapsed": false
  },
  "notifications": {
    "email": true,
    "push": true,
    "desktop": false,
    "sound": true
  },
  "dataGrid": {
    "defaultPageSize": 50,
    "showDensitySelector": true,
    "showColumnSelector": true,
    "showFilterPanel": true,
    "autoRefresh": false,
    "autoRefreshInterval": 30
  },
  "privacy": {
    "showOnlineStatus": true,
    "showActivity": true,
    "allowAnalytics": true
  },
  "advanced": {
    "enableDebugMode": false,
    "enableBetaFeatures": false,
    "enableKeyboardShortcuts": true
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid section. Must be one of: general, appearance, notifications, dataGrid, privacy, advanced"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "User settings not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch user settings"
}
```

## Usage Examples

### cURL Examples

#### Get your settings
```bash
curl -X GET http://localhost:3001/api/user-settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update appearance settings
```bash
curl -X PATCH http://localhost:3001/api/user-settings/appearance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","fontSize":"large"}'
```

#### Update multiple settings
```bash
curl -X PUT http://localhost:3001/api/user-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"general":{"language":"ko"},"dataGrid":{"defaultPageSize":100}}'
```

#### Reset to defaults
```bash
curl -X POST http://localhost:3001/api/user-settings/reset \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/TypeScript Examples

```typescript
import { api } from '@/lib/axios';

// Get settings
const getSettings = async () => {
  const response = await api.get('/user-settings');
  return response.settings;
};

// Update settings
const updateSettings = async (updates: Partial<UserSettings>) => {
  const response = await api.put('/user-settings', updates);
  return response.settings;
};

// Update specific section
const updateAppearance = async (appearance: Partial<AppearanceSettings>) => {
  const response = await api.patch('/user-settings/appearance', appearance);
  return response.settings;
};

// Reset settings
const resetSettings = async () => {
  const response = await api.post('/user-settings/reset');
  return response.settings;
};
```

## Notes

- Settings are automatically created with defaults on first access
- All timestamps are in ISO 8601 format (UTC)
- Partial updates merge with existing values (deep merge for section updates)
- Changes are immediately persisted to the JSON data file
- Admin users can view all users' settings but cannot modify other users' settings through this API
