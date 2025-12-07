/**
 * Mapping Service Layer
 * Handles user-role and role-program mappings
 * Note: role_menu_mappings table has been removed - use role_program_mappings instead
 */

const db = require('../config/database');

/**
 * User-Role Mappings
 */

async function getUserRoleMappings(userId) {
  const query = 'SELECT * FROM user_role_mappings WHERE user_id = $1';
  const result = await db.query(query, [userId]);
  return result.rows;
}

async function getUserRoleMappingById(id) {
  const query = 'SELECT * FROM user_role_mappings WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

async function getUserRoleMappingsByUserId(userId, includeDetails = false) {
  if (includeDetails) {
    const query = `
      SELECT urm.*, u.loginid as username, u.email,
        COALESCE(u.name_ko, u.name_en, u.loginid) as user_name,
        u.department as user_department, r.name as role_name,
        r.display_name as role_display_name, r.description as role_description
      FROM user_role_mappings urm
      LEFT JOIN users u ON urm.user_id = u.id
      LEFT JOIN roles r ON urm.role_id = r.id
      WHERE urm.user_id = $1 ORDER BY urm.assigned_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }
  return getUserRoleMappings(userId);
}

async function getUserRoleMappingsByRoleId(roleId, includeDetails = false) {
  if (includeDetails) {
    const query = `
      SELECT urm.*, u.loginid as username, u.email,
        COALESCE(u.name_ko, u.name_en, u.loginid) as user_name,
        u.department as user_department, r.name as role_name,
        r.display_name as role_display_name, r.description as role_description
      FROM user_role_mappings urm
      LEFT JOIN users u ON urm.user_id = u.id
      LEFT JOIN roles r ON urm.role_id = r.id
      WHERE urm.role_id = $1 ORDER BY urm.assigned_at DESC
    `;
    const result = await db.query(query, [roleId]);
    return result.rows;
  }
  const query = 'SELECT * FROM user_role_mappings WHERE role_id = $1 ORDER BY assigned_at DESC';
  const result = await db.query(query, [roleId]);
  return result.rows;
}

async function getAllUserRoleMappings(options = {}) {
  const { userId, roleId, limit, offset } = options;
  let query = 'SELECT * FROM user_role_mappings WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (userId) { query += ` AND user_id = $${paramIndex}`; params.push(userId); paramIndex++; }
  if (roleId) { query += ` AND role_id = $${paramIndex}`; params.push(roleId); paramIndex++; }
  query += ' ORDER BY assigned_at DESC';
  if (limit) { query += ` LIMIT $${paramIndex}`; params.push(limit); paramIndex++; }
  if (offset) { query += ` OFFSET $${paramIndex}`; params.push(offset); }

  const result = await db.query(query, params);
  return result.rows;
}

async function createUserRoleMapping(data) {
  const { userId, roleId, assignedBy, expiresAt, isActive } = data;
  // Generate shorter ID to fit varchar(50) - use last 8 chars of timestamp
  const timestamp = Date.now().toString().slice(-8);
  const shortUserId = userId.length > 12 ? userId.slice(0, 12) : userId;
  const shortRoleId = roleId.replace('role-', 'R');
  const mappingId = `URM-${shortUserId}-${shortRoleId}-${timestamp}`;
  const query = `
    INSERT INTO user_role_mappings (id, user_id, role_id, assigned_by, assigned_at, expires_at, is_active, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW())
    ON CONFLICT (user_id, role_id) DO UPDATE SET
      is_active = EXCLUDED.is_active, expires_at = EXCLUDED.expires_at,
      updated_at = NOW(), updated_by = EXCLUDED.assigned_by
    RETURNING *
  `;
  const result = await db.query(query, [mappingId, userId, roleId, assignedBy, expiresAt || null, isActive !== undefined ? isActive : true]);
  return result.rows[0];
}

async function updateUserRoleMapping(id, updates) {
  const allowedFields = ['expires_at', 'is_active', 'updated_by'];
  const setClause = []; const params = []; let paramIndex = 1;
  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      setClause.push(`${dbField} = $${paramIndex}`); params.push(value); paramIndex++;
    }
  }
  if (setClause.length === 0) throw new Error('No valid fields to update');
  setClause.push('updated_at = NOW()'); params.push(id);
  const query = `UPDATE user_role_mappings SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

async function deleteUserRoleMapping(id) {
  const result = await db.query('DELETE FROM user_role_mappings WHERE id = $1', [id]);
  return result.rowCount > 0;
}

async function deleteUserRoleMappingByUserAndRole(userId, roleId) {
  const result = await db.query('DELETE FROM user_role_mappings WHERE user_id = $1 AND role_id = $2', [userId, roleId]);
  return result.rowCount > 0;
}

/**
 * Role-Program Mappings (program_code stores programs.code)
 */

async function getRoleProgramMappings(roleId) {
  const query = 'SELECT * FROM role_program_mappings WHERE role_id = $1';
  const result = await db.query(query, [roleId]);
  return result.rows;
}

async function getRoleProgramMappingById(id) {
  const query = 'SELECT * FROM role_program_mappings WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

async function getRoleProgramMappingsByRoleId(roleId) {
  return getRoleProgramMappings(roleId);
}

async function getRoleProgramMappingsByProgramCode(programCode) {
  const query = 'SELECT * FROM role_program_mappings WHERE program_code = $1';
  const result = await db.query(query, [programCode]);
  return result.rows;
}

async function getRoleProgramMappingsByProgramId(programCode) {
  return getRoleProgramMappingsByProgramCode(programCode);
}

async function getAllRoleProgramMappings(options = {}) {
  const { roleId, programCode } = options;
  let query = 'SELECT * FROM role_program_mappings WHERE 1=1';
  const params = []; let paramIndex = 1;
  if (roleId) { query += ` AND role_id = $${paramIndex}`; params.push(roleId); paramIndex++; }
  if (programCode) { query += ` AND program_code = $${paramIndex}`; params.push(programCode); }
  const result = await db.query(query, params);
  return result.rows;
}

async function createRoleProgramMapping(data) {
  const { id, roleId, programCode, canView, canCreate, canUpdate, canDelete, createdBy } = data;
  const query = `
    INSERT INTO role_program_mappings (id, role_id, program_code, can_view, can_create, can_update, can_delete, created_by, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *
  `;
  const result = await db.query(query, [id, roleId, programCode, canView, canCreate, canUpdate, canDelete, createdBy]);
  return result.rows[0];
}

async function updateRoleProgramMapping(id, updates) {
  const allowedFields = ['can_view', 'can_create', 'can_update', 'can_delete'];
  const setClause = []; const params = []; let paramIndex = 1;
  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      setClause.push(`${dbField} = $${paramIndex}`); params.push(value); paramIndex++;
    }
  }
  if (setClause.length === 0) throw new Error('No valid fields to update');
  params.push(id);
  const query = `UPDATE role_program_mappings SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

async function deleteRoleProgramMapping(id) {
  const result = await db.query('DELETE FROM role_program_mappings WHERE id = $1', [id]);
  return result.rowCount > 0;
}

async function deleteRoleProgramMappingByRoleAndProgram(roleId, programCode) {
  const result = await db.query('DELETE FROM role_program_mappings WHERE role_id = $1 AND program_code = $2', [roleId, programCode]);
  return result.rowCount > 0;
}

module.exports = {
  getUserRoleMappings, getUserRoleMappingById, getUserRoleMappingsByUserId,
  getUserRoleMappingsByRoleId, getAllUserRoleMappings, createUserRoleMapping,
  updateUserRoleMapping, deleteUserRoleMapping, deleteUserRoleMappingByUserAndRole,
  getRoleProgramMappings, getRoleProgramMappingById, getRoleProgramMappingsByRoleId,
  getRoleProgramMappingsByProgramCode, getRoleProgramMappingsByProgramId,
  getAllRoleProgramMappings, createRoleProgramMapping, updateRoleProgramMapping,
  deleteRoleProgramMapping, deleteRoleProgramMappingByRoleAndProgram,
};
