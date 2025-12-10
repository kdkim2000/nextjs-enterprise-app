/**
 * Board Type Service Layer
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/database';
import { BoardType, BoardTypeQueryOptions } from '../types';

/**
 * Get all board types with pagination and filtering
 */
export async function getAllBoardTypes(options: BoardTypeQueryOptions = {}): Promise<BoardType[]> {
  const { search, type, category, status, limit, offset } = options;

  let queryText = 'SELECT * FROM board_types WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (type) {
    queryText += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (category) {
    queryText += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  queryText += ' ORDER BY "order" ASC, created_at DESC';

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

/**
 * Get board type by ID
 */
export async function getBoardTypeById(boardTypeId: string): Promise<BoardType | null> {
  const result = await query('SELECT * FROM board_types WHERE id = $1', [boardTypeId]);
  return result.rows[0] || null;
}

/**
 * Get board type by code
 */
export async function getBoardTypeByCode(code: string): Promise<BoardType | null> {
  const result = await query('SELECT * FROM board_types WHERE code = $1', [code]);
  return result.rows[0] || null;
}

/**
 * Create a new board type
 */
export async function createBoardType(boardTypeData: {
  code: string;
  nameEn?: string;
  nameKo?: string;
  nameZh?: string;
  nameVi?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
  type?: string;
  settings?: Record<string, any>;
  writeRoles?: string[];
  readRoles?: string[];
  category?: string;
  order?: number;
  status?: string;
  createdBy?: string;
}): Promise<BoardType> {
  const {
    code, nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    type, settings, writeRoles, readRoles,
    category, order, status, createdBy
  } = boardTypeData;

  const id = uuidv4();

  const queryText = `
    INSERT INTO board_types (
      id, code,
      name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      type, settings, write_roles, read_roles,
      category, "order", status,
      created_at, updated_at, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW(), $18)
    RETURNING *
  `;

  const params = [
    id, code,
    nameEn || '', nameKo || '', nameZh || '', nameVi || '',
    descriptionEn || '', descriptionKo || '', descriptionZh || '', descriptionVi || '',
    type || 'normal',
    JSON.stringify(settings || {}),
    JSON.stringify(writeRoles || ['admin', 'manager', 'user']),
    JSON.stringify(readRoles || ['admin', 'manager', 'user']),
    category || null, order || 0, status || 'active',
    createdBy || null
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

/**
 * Update a board type
 */
export async function updateBoardType(
  boardTypeId: string,
  updates: Record<string, any>
): Promise<BoardType | null> {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'type', 'settings', 'write_roles', 'read_roles',
    'category', 'order', 'status', 'updated_by'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      // Handle JSON fields
      if (['settings', 'write_roles', 'read_roles'].includes(dbField)) {
        setClause.push(`${dbField} = $${paramIndex}`);
        params.push(JSON.stringify(value));
      } else {
        // Handle reserved keywords (like 'order') by wrapping in double quotes
        const fieldName = dbField === 'order' ? '"order"' : dbField;
        setClause.push(`${fieldName} = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(boardTypeId);

  const queryText = `UPDATE board_types SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

/**
 * Delete a board type
 */
export async function deleteBoardType(boardTypeId: string): Promise<boolean> {
  // Check if there are posts associated with this board type
  const checkResult = await query('SELECT COUNT(*) FROM posts WHERE board_type_id = $1', [boardTypeId]);
  const postCount = parseInt(checkResult.rows[0].count);

  if (postCount > 0) {
    throw new Error(`Cannot delete board type with ${postCount} existing posts`);
  }

  const result = await query('DELETE FROM board_types WHERE id = $1', [boardTypeId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get board type statistics
 */
export async function getBoardTypeStats(boardTypeId: string): Promise<any | null> {
  const queryText = `
    SELECT
      bt.id,
      bt.code,
      bt.name_en,
      bt.name_ko,
      bt.total_posts,
      bt.total_views,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'published') as published_posts,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'draft') as draft_posts,
      COUNT(DISTINCT c.id) as total_comments,
      COUNT(DISTINCT pl.id) as total_likes,
      COUNT(DISTINCT a.id) as total_attachments
    FROM board_types bt
    LEFT JOIN posts p ON bt.id = p.board_type_id
    LEFT JOIN comments c ON p.id = c.post_id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN attachments a ON a.reference_type = 'post' AND a.reference_id = p.id AND a.status = 'active'
    WHERE bt.id = $1
    GROUP BY bt.id, bt.code, bt.name_en, bt.name_ko, bt.total_posts, bt.total_views
  `;

  const result = await query(queryText, [boardTypeId]);
  return result.rows[0] || null;
}

/**
 * Get total count of board types
 */
export async function getBoardTypeCount(filters: BoardTypeQueryOptions = {}): Promise<number> {
  const { search, type, category, status } = filters;

  let queryText = 'SELECT COUNT(*) FROM board_types WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (type) {
    queryText += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (category) {
    queryText += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count);
}
