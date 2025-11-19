/**
 * Route Conversion Helper Script
 *
 * This script helps convert JSON-based routes to PostgreSQL-based routes
 * by providing a mapping guide and conversion patterns.
 */

const fs = require('fs');
const path = require('path');

const SERVICE_MAPPING = {
  'users.json': 'userService',
  'roles.json': 'roleService',
  'menus.json': 'menuService',
  'programs.json': 'programService',
  'codes.json': 'codeService',
  'codeTypes.json': 'codeService',
  'departments.json': 'departmentService',
  'messages.json': 'messageService',
  'help.json': 'helpService',
  'userRoleMappings.json': 'mappingService',
  'roleMenuMappings.json': 'mappingService',
  'roleProgramMappings.json': 'mappingService',
  'userPreferences.json': 'preferencesService',
  'logs.json': 'logService',
  'mfaCodes.json': 'authService',
  'tokenBlacklist.json': 'authService',
};

const FIELD_MAPPING = {
  // User fields
  'firstName': 'first_name',
  'lastName': 'last_name',
  'mfaEnabled': 'mfa_enabled',
  'profileImage': 'profile_image',
  'lastLogin': 'last_login',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',

  // Common multi-language fields
  'nameEn': 'name_en',
  'nameKo': 'name_ko',
  'nameZh': 'name_zh',
  'nameVi': 'name_vi',
  'titleEn': 'title_en',
  'titleKo': 'title_ko',
  'titleZh': 'title_zh',
  'titleVi': 'title_vi',
  'contentEn': 'content_en',
  'contentKo': 'content_ko',
  'contentZh': 'content_zh',
  'contentVi': 'content_vi',

  // Code fields
  'codeType': 'code_type',

  // Program/Menu fields
  'parentId': 'parent_id',
  'programId': 'program_id',

  // Permission fields
  'canView': 'can_view',
  'canCreate': 'can_create',
  'canUpdate': 'can_update',
  'canDelete': 'can_delete',

  // Role mapping fields
  'roleId': 'role_id',
  'userId': 'user_id',
  'menuId': 'menu_id',
  'assignedBy': 'assigned_by',
  'assignedAt': 'assigned_at',

  // Log fields
  'statusCode': 'status_code',
  'userAgent': 'user_agent',
  'errorMessage': 'error_message',

  // Preferences fields
  'dateFormat': 'date_format',
};

console.log('='.repeat(70));
console.log('JSON to PostgreSQL Route Conversion Guide');
console.log('='.repeat(70));
console.log('\nSERVICE MAPPING:');
console.log(JSON.stringify(SERVICE_MAPPING, null, 2));
console.log('\nFIELD MAPPING (camelCase to snake_case):');
console.log(JSON.stringify(FIELD_MAPPING, null, 2));
console.log('\n' + '='.repeat(70));

module.exports = {
  SERVICE_MAPPING,
  FIELD_MAPPING,
};
