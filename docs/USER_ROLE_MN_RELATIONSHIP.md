# User-Role M:N Relationship Implementation

## Overview

The user-role relationship in this application is implemented as a **Many-to-Many (M:N)** relationship, allowing:
- A single user to have multiple roles
- A single role to be assigned to multiple users

This implementation provides flexible role-based access control (RBAC) for enterprise applications.

## Database Schema

### Table: `user_role_mappings`

```sql
CREATE TABLE user_role_mappings (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  role_id VARCHAR(50) NOT NULL,
  assigned_by VARCHAR(50),
  assigned_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(50),
  CONSTRAINT unique_user_role_active UNIQUE (user_id, role_id)
);
```

### Indexes
- `idx_user_role_mappings_user_id` - Fast lookups by user
- `idx_user_role_mappings_role_id` - Fast lookups by role
- `idx_user_role_mappings_is_active` - Filter active mappings

### Unique Constraint
- `unique_user_role_active (user_id, role_id)` - Prevents duplicate role assignments

## Backend Implementation

### API Endpoints

#### 1. GET `/api/user-role-mapping`

Get user-role mappings with optional filtering.

**Query Parameters:**
- `id` - Mapping ID
- `userId` - User ID (returns all roles for user)
- `roleId` - Role ID (returns all users with role)
- `isActive` - Filter by active status (true/false)
- `includeDetails` - Include user and role details (true/false)

**Response:**
```json
{
  "mappings": [
    {
      "id": "URM-admin-role-001",
      "userId": "admin",
      "roleId": "role-001",
      "assignedBy": "system",
      "assignedAt": "2025-11-21T02:01:02.718Z",
      "expiresAt": null,
      "isActive": true,
      "updatedAt": "2025-11-21T02:01:02.718Z",
      "updatedBy": null,
      "userName": "admin",
      "roleName": "admin",
      "roleDisplayName": "Administrator"
    }
  ],
  "total": 1
}
```

#### 2. POST `/api/user-role-mapping`

Create a new user-role mapping.

**Request Body:**
```json
{
  "userId": "U100012950444",
  "roleId": "role-002",
  "expiresAt": null  // optional
}
```

**Response:**
```json
{
  "mapping": {
    "id": "URM-U100012950444-role-002-1732123456789",
    "userId": "U100012950444",
    "roleId": "role-002",
    "assignedBy": "admin",
    "assignedAt": "2025-11-21T02:01:02.718Z",
    "isActive": true
  }
}
```

#### 3. PUT `/api/user-role-mapping`

Update an existing mapping (mainly for deactivation or expiry date).

**Request Body:**
```json
{
  "id": "URM-U100012950444-role-002-1732123456789",
  "isActive": false,  // or update expiresAt
  "expiresAt": "2026-01-01T00:00:00Z"
}
```

#### 4. DELETE `/api/user-role-mapping?id=<mapping_id>`

Delete a user-role mapping.

**Query Parameters:**
- `id` - Mapping ID (required)

## Frontend Implementation

### Component: `UserRoleAssignment`

Located at: `src/components/admin/UserRoleAssignment.tsx`

This component is automatically included in the User Edit Drawer and provides:

**Features:**
1. **Display Current Roles**
   - Shows all active roles assigned to the user
   - Displays role chips with remove functionality

2. **Add New Roles**
   - Dropdown selector with available roles (not yet assigned)
   - Add button to assign new role
   - Prevents duplicate assignments

3. **Remove Roles**
   - Click delete icon on role chip to remove
   - Confirmation and success/error messages

**Usage in UserFormFields:**
```tsx
<UserRoleAssignment
  userId={user.id}
  onRolesChange={(roleIds) => {
    // Handle role changes if needed
    console.log('User roles updated:', roleIds);
  }}
  disabled={false}
/>
```

### Integration with User Management

The `UserRoleAssignment` component is already integrated into the User Edit Drawer at:
`src/components/admin/UserFormFields.tsx` (lines 264-276)

**Important:** Role assignment is only available for **existing users** (users that have been created and have an ID). For new users, the component displays a message: "Role assignment will be available after creating the user."

## How to Use (User Guide)

### Assigning Multiple Roles to a User

1. **Navigate to User Management**
   - Go to Admin → Users
   - Search for and click on a user to edit

2. **Scroll to "Role Assignment" Section**
   - This section appears below the basic user information
   - Shows currently assigned roles as colored chips

3. **Add a New Role**
   - Select a role from the "Add Role" dropdown
   - Click the "Add" button
   - The role will be immediately assigned and appear in the list

4. **Remove a Role**
   - Click the 'X' icon on any role chip
   - The role will be immediately removed
   - Success message will confirm the removal

5. **Save User**
   - Click "Save" button at the bottom of the drawer
   - All role assignments are saved automatically as you add/remove them

### Viewing User Roles

**In User Grid:**
- The main "Role" column shows the legacy single role field
- To see all M:N roles, click "Edit" on a user

**In User Detail:**
- Open the edit drawer for a user
- Scroll to "Role Assignment" section
- All assigned roles are displayed

## Service Layer

### MappingService (`backend/services/mappingService.js`)

**Key Functions:**

- `getUserRoleMappingsByUserId(userId, includeDetails)` - Get all roles for a user
- `getUserRoleMappingsByRoleId(roleId, includeDetails)` - Get all users with a role
- `createUserRoleMapping(data)` - Assign a role to a user
- `updateUserRoleMapping(id, updates)` - Update mapping (activate/deactivate, expiry)
- `deleteUserRoleMapping(id)` - Remove role assignment

**Auto-generated IDs:**
```javascript
const mappingId = `URM-${userId}-${roleId}-${Date.now()}`;
```

**Upsert Logic:**
```sql
ON CONFLICT (user_id, role_id) DO UPDATE
SET
  is_active = EXCLUDED.is_active,
  expires_at = EXCLUDED.expires_at,
  updated_at = NOW(),
  updated_by = EXCLUDED.assigned_by
```

## Migration Applied

**File:** `migration/add_user_role_mapping_columns.sql`

**Changes:**
1. Added `updated_at` column with default NOW()
2. Added `updated_by` column (VARCHAR(50))
3. Added UNIQUE constraint on `(user_id, role_id)`
4. Updated existing rows with initial values

## Testing the M:N Relationship

### Test Case 1: Assign Multiple Roles to One User

```bash
# User ID: admin
# Assign roles: role-001 (admin), role-002 (manager), role-003 (user)

curl -X POST http://localhost:3001/api/user-role-mapping \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "admin", "roleId": "role-002"}'

curl -X POST http://localhost:3001/api/user-role-mapping \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "admin", "roleId": "role-003"}'

# Verify
curl -X GET "http://localhost:3001/api/user-role-mapping?userId=admin&includeDetails=true" \
  -H "Authorization: Bearer <token>"
```

### Test Case 2: Assign Same Role to Multiple Users

```bash
# Role ID: role-001 (admin)
# Assign to users: admin, user1, user2

curl -X POST http://localhost:3001/api/user-role-mapping \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "roleId": "role-001"}'

curl -X POST http://localhost:3001/api/user-role-mapping \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user2", "roleId": "role-001"}'

# Verify
curl -X GET "http://localhost:3001/api/user-role-mapping?roleId=role-001&includeDetails=true" \
  -H "Authorization: Bearer <token>"
```

### Test Case 3: Prevent Duplicate Assignments

```bash
# Try to assign same role twice - should update instead of error

curl -X POST http://localhost:3001/api/user-role-mapping \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "admin", "roleId": "role-001"}'

curl -X POST http://localhost:3001/api/user-role-mapping \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "admin", "roleId": "role-001"}'

# Second request will update the existing mapping instead of creating duplicate
```

### Test Case 4: UI Testing

1. Login as admin
2. Navigate to Admin → Users
3. Click on a user to edit
4. Scroll to "Role Assignment" section
5. Add 2-3 different roles using the dropdown
6. Verify all roles appear as chips
7. Remove one role by clicking X
8. Refresh the page and verify changes persist
9. Check the role is removed from database:
   ```sql
   SELECT * FROM user_role_mappings WHERE user_id = '<user_id>';
   ```

## Current Data

As of migration:
- **29,998 existing mappings** in `user_role_mappings` table
- Each user currently has 1 role assigned (backward compatible)
- New M:N functionality allows adding additional roles

## Benefits of M:N Implementation

1. **Flexibility**: Users can have multiple roles (e.g., Manager + Developer)
2. **Granular Permissions**: Combine permissions from multiple roles
3. **Temporal Control**: Role assignments can have expiry dates
4. **Audit Trail**: Track who assigned roles and when
5. **Deactivation**: Soft delete roles without removing records
6. **Enterprise Ready**: Supports complex organizational structures

## Backward Compatibility

- The legacy `users.role` column still exists for backward compatibility
- New M:N relationship in `user_role_mappings` table
- UI shows both: single role field + M:N role assignment section
- Gradually migrate to use M:N roles exclusively

## Future Enhancements

1. **Role Hierarchy**: Implement role inheritance (Manager inherits User permissions)
2. **Conditional Roles**: Time-based or location-based role activation
3. **Role Groups**: Create role bundles for common job functions
4. **Bulk Assignment**: Assign roles to multiple users at once
5. **Role Audit Log**: Detailed history of all role changes

## Summary

✅ M:N relationship fully implemented
✅ Database schema with proper constraints
✅ Backend API with CRUD operations
✅ Frontend UI component integrated
✅ Migration applied successfully
✅ Ready for production use

The user-role M:N relationship implementation is **complete and functional**. Users can now be assigned multiple roles through the User Management interface.
