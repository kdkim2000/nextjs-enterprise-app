/**
 * User Service - Admin Module
 */

import { query } from '../../../utils/database';
import { buildUserSearchCondition, cleanSearchTerm } from '../utils/searchHelper';
import { User, UserCreateRequest } from '../types';

export async function getAllUsers(options: {
  limit?: number;
  offset?: number;
  search?: string;
  loginid?: string;
  name_ko?: string;
  name_en?: string;
  email?: string;
  employee_number?: string;
  phone_number?: string;
  mobile_number?: string;
  user_category?: string;
  position?: string;
  status?: string;
  department?: string;
  departments?: string[];
  role?: string;
} = {}): Promise<User[]> {
  const {
    limit, offset, search, loginid, name_ko, name_en, email,
    employee_number, phone_number, mobile_number, user_category,
    position, status, department, departments, role,
  } = options;

  let queryText = 'SELECT * FROM users WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    const cleanedSearch = cleanSearchTerm(search);
    const { condition, param } = buildUserSearchCondition(cleanedSearch, paramIndex);
    if (condition) {
      queryText += ' AND ' + condition;
      params.push(param);
      paramIndex++;
    }
  }

  if (loginid) {
    queryText += ` AND loginid ILIKE $${paramIndex}`;
    params.push(`%${loginid}%`);
    paramIndex++;
  }

  if (name_ko) {
    queryText += ` AND name_ko ILIKE $${paramIndex}`;
    params.push(`%${name_ko}%`);
    paramIndex++;
  }

  if (name_en) {
    queryText += ` AND name_en ILIKE $${paramIndex}`;
    params.push(`%${name_en}%`);
    paramIndex++;
  }

  if (email) {
    queryText += ` AND email ILIKE $${paramIndex}`;
    params.push(`%${email}%`);
    paramIndex++;
  }

  if (employee_number) {
    queryText += ` AND employee_number ILIKE $${paramIndex}`;
    params.push(`%${employee_number}%`);
    paramIndex++;
  }

  if (phone_number) {
    queryText += ` AND phone_number ILIKE $${paramIndex}`;
    params.push(`%${phone_number}%`);
    paramIndex++;
  }

  if (mobile_number) {
    queryText += ` AND mobile_number ILIKE $${paramIndex}`;
    params.push(`%${mobile_number}%`);
    paramIndex++;
  }

  if (user_category) {
    queryText += ` AND user_category = $${paramIndex}`;
    params.push(user_category);
    paramIndex++;
  }

  if (position) {
    queryText += ` AND position ILIKE $${paramIndex}`;
    params.push(`%${position}%`);
    paramIndex++;
  }

  if (role) {
    queryText += ` AND role = $${paramIndex}`;
    params.push(role);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (departments && Array.isArray(departments) && departments.length > 0) {
    const placeholders = departments.map((_, index) => `$${paramIndex + index}`).join(', ');
    queryText += ` AND department IN (${placeholders})`;
    departments.forEach(dept => params.push(dept));
    paramIndex += departments.length;
  } else if (department) {
    queryText += ` AND department = $${paramIndex}`;
    params.push(department);
    paramIndex++;
  }

  queryText += ' ORDER BY created_at DESC';

  if (limit) {
    queryText += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    queryText += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await query(queryText, params);
  return result.rows;
}

export async function getUserCount(filters: any = {}): Promise<number> {
  let queryText = 'SELECT COUNT(*) FROM users WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  const { search, status, department, departments, role } = filters;

  if (search) {
    const cleanedSearch = cleanSearchTerm(search);
    const { condition, param } = buildUserSearchCondition(cleanedSearch, paramIndex);
    if (condition) {
      queryText += ' AND ' + condition;
      params.push(param);
      paramIndex++;
    }
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (role) {
    queryText += ` AND role = $${paramIndex}`;
    params.push(role);
    paramIndex++;
  }

  if (departments && Array.isArray(departments) && departments.length > 0) {
    const placeholders = departments.map((_, index) => `$${paramIndex + index}`).join(', ');
    queryText += ` AND department IN (${placeholders})`;
    departments.forEach((dept: string) => params.push(dept));
    paramIndex += departments.length;
  } else if (department) {
    queryText += ` AND department = $${paramIndex}`;
    params.push(department);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count, 10);
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}

export async function getUserByLoginId(loginid: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE loginid = $1', [loginid]);
  return result.rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function createUser(userData: UserCreateRequest & { id: string }): Promise<User> {
  const systemKey = `USR-${userData.id}`;
  const emptyToNull = (val: any) => (val === '' || val === undefined) ? null : val;

  const queryText = `
    INSERT INTO users (
      id, loginid, email, password, name_ko, name_en,
      employee_number, system_key, phone_number, mobile_number,
      user_category, position, department, status, mfa_enabled, avatar_url, avatar_image,
      last_password_changed, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
    RETURNING *`;

  const params = [
    userData.id,
    userData.loginid,
    userData.email,
    userData.password,
    userData.name_ko,
    emptyToNull(userData.name_en),
    emptyToNull(userData.employee_number),
    systemKey,
    emptyToNull(userData.phone_number),
    emptyToNull(userData.mobile_number),
    userData.user_category || 'regular',
    emptyToNull(userData.position),
    emptyToNull(userData.department),
    userData.status || 'active',
    false,
    emptyToNull(userData.avatar_url),
    emptyToNull(userData.avatar_image),
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function updateUser(userId: string, updates: any): Promise<User | null> {
  const allowedFields = [
    'loginid', 'email', 'password', 'name_ko', 'name_en',
    'employee_number', 'phone_number', 'mobile_number',
    'user_category', 'position', 'department', 'status',
    'role', 'mfa_enabled', 'sso_enabled', 'avatar_url', 'avatar_image',
    'last_password_changed'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (updates.password) {
    updates.last_password_changed = new Date().toISOString();
  }

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(key) || allowedFields.includes(dbField)) {
      setClause.push(`${dbField} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  params.push(userId);

  const queryText = `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await query("UPDATE users SET status = 'inactive' WHERE id = $1 RETURNING id", [userId]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function loginidExists(loginid: string, excludeUserId?: string): Promise<boolean> {
  let queryText = 'SELECT COUNT(*) FROM users WHERE loginid = $1';
  const params: any[] = [loginid];

  if (excludeUserId) {
    queryText += ' AND id != $2';
    params.push(excludeUserId);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count, 10) > 0;
}

export async function emailExists(email: string, excludeUserId?: string): Promise<boolean> {
  let queryText = 'SELECT COUNT(*) FROM users WHERE email = $1';
  const params: any[] = [email];

  if (excludeUserId) {
    queryText += ' AND id != $2';
    params.push(excludeUserId);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count, 10) > 0;
}
