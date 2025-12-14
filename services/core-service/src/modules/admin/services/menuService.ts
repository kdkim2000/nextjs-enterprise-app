/**
 * Menu Service - Admin Module
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../utils/database';
import { buildMenuSearchCondition, cleanSearchTerm } from '../utils/searchHelper';
import { Menu } from '../types';

export async function getAllMenus(options: {
  search?: string;
  level?: number;
  platform?: 'mobile' | 'desktop' | 'all';
} = {}): Promise<Menu[]> {
  const { search, level, platform = 'all' } = options;

  let queryText = 'SELECT * FROM menus WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    const cleanedSearch = cleanSearchTerm(search);
    const { condition, param } = buildMenuSearchCondition(cleanedSearch, paramIndex);
    if (condition) {
      queryText += ' AND ' + condition;
      params.push(param);
      paramIndex++;
    }
  }

  if (level !== undefined) {
    queryText += ` AND level = $${paramIndex}`;
    params.push(level);
    paramIndex++;
  }

  // Filter by platform
  if (platform === 'mobile') {
    queryText += ' AND (mobile_enabled = true OR mobile_enabled IS NULL)';
  } else if (platform === 'desktop') {
    queryText += ' AND (desktop_enabled = true OR desktop_enabled IS NULL)';
  }

  queryText += ' ORDER BY level, "order", code';

  const result = await query(queryText, params);
  return result.rows;
}

export async function getMenuById(menuId: string): Promise<Menu | null> {
  const result = await query('SELECT * FROM menus WHERE id = $1', [menuId]);
  return result.rows[0] || null;
}

export async function getMenuByCode(code: string): Promise<Menu | null> {
  const result = await query('SELECT * FROM menus WHERE code = $1', [code]);
  return result.rows[0] || null;
}

export async function getMenuByPath(path: string): Promise<Menu | null> {
  const result = await query('SELECT * FROM menus WHERE path = $1', [path]);
  return result.rows[0] || null;
}

export async function getChildMenus(parentId: string): Promise<Menu[]> {
  const result = await query('SELECT * FROM menus WHERE parent_id = $1 ORDER BY "order", code', [parentId]);
  return result.rows;
}

export async function createMenu(menuData: {
  code: string;
  nameEn?: string;
  nameKo?: string;
  nameZh?: string;
  nameVi?: string;
  path?: string;
  icon?: string;
  parentId?: string;
  level?: number;
  order?: number;
  programId?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
  mobileEnabled?: boolean;
  desktopEnabled?: boolean;
  id?: string;
}): Promise<Menu> {
  const id = menuData.id || uuidv4();

  const queryText = `
    INSERT INTO menus (
      id, code, name_en, name_ko, name_zh, name_vi, path, icon,
      parent_id, level, "order", program_id,
      description_en, description_ko, description_zh, description_vi,
      mobile_enabled, desktop_enabled,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
    RETURNING *`;

  const params = [
    id,
    menuData.code,
    menuData.nameEn,
    menuData.nameKo,
    menuData.nameZh,
    menuData.nameVi,
    menuData.path,
    menuData.icon,
    menuData.parentId,
    menuData.level,
    menuData.order,
    menuData.programId,
    menuData.descriptionEn,
    menuData.descriptionKo,
    menuData.descriptionZh,
    menuData.descriptionVi,
    menuData.mobileEnabled ?? true,
    menuData.desktopEnabled ?? true
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function updateMenu(menuId: string, updates: any): Promise<Menu | null> {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi', 'path', 'icon',
    'parent_id', 'level', 'order', 'program_id',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'mobile_enabled', 'desktop_enabled'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      // Quote 'order' as it's a PostgreSQL reserved keyword
      const quotedField = dbField === 'order' ? '"order"' : dbField;
      setClause.push(`${quotedField} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push('updated_at = NOW()');
  params.push(menuId);

  const queryText = `UPDATE menus SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

export async function deleteMenu(menuId: string): Promise<boolean> {
  const result = await query('DELETE FROM menus WHERE id = $1', [menuId]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function getUserMenus(userId: string): Promise<Menu[]> {
  const queryText = `
    SELECT DISTINCT m.* FROM menus m
    INNER JOIN user_role_mappings urm ON urm.user_id = $1
    INNER JOIN role_program_mappings rpm ON m.program_id = rpm.program_code AND rpm.role_id = urm.role_id
    WHERE rpm.can_view = true
    ORDER BY m.level, m."order", m.code`;

  const result = await query(queryText, [userId]);
  return result.rows;
}
