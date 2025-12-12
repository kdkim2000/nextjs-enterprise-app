/**
 * Message Service Layer (System Messages)
 */

import { query } from '@enterprise/shared';
import { transformToAPI, transformArrayToAPI } from '../utils/multiLangTransform';
import { SystemMessageApiResponse, MultiLangField } from '../types';

interface GetMessagesOptions {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get all messages
 */
export async function getAllMessages(
  options: GetMessagesOptions = {}
): Promise<SystemMessageApiResponse[]> {
  const { search, category, type, status, limit, offset } = options;
  let queryText = 'SELECT * FROM messages WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (code ILIKE $${paramIndex} OR message_en ILIKE $${paramIndex} OR message_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    queryText += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (type) {
    queryText += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
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
  return transformArrayToAPI(result.rows, ['message', 'description']);
}

/**
 * Get message by ID
 */
export async function getMessageById(id: string): Promise<SystemMessageApiResponse | null> {
  const result = await query('SELECT * FROM messages WHERE id = $1', [id]);
  return transformToAPI(result.rows[0], ['message', 'description']);
}

/**
 * Get message by code
 */
export async function getMessageByCode(code: string): Promise<SystemMessageApiResponse | null> {
  const result = await query('SELECT * FROM messages WHERE code = $1', [code]);
  return transformToAPI(result.rows[0], ['message', 'description']);
}

/**
 * Get messages by category
 */
export async function getMessagesByCategory(
  category: string
): Promise<SystemMessageApiResponse[]> {
  const result = await query(
    'SELECT * FROM messages WHERE category = $1 ORDER BY created_at DESC',
    [category]
  );
  return transformArrayToAPI(result.rows, ['message', 'description']);
}

/**
 * Create a new message
 */
export async function createMessage(data: {
  code: string;
  category: string;
  type: string;
  message: MultiLangField;
  description?: MultiLangField;
  status?: string;
}): Promise<SystemMessageApiResponse | null> {
  const { code, category, type, message, description, status } = data;

  // Generate ID
  const id = `MSG-${Date.now()}`;

  const queryText = `
    INSERT INTO messages (
      id, code, category, type,
      message_en, message_ko, message_zh, message_vi,
      description_en, description_ko, description_zh, description_vi,
      status, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    code,
    category,
    type,
    message.en || '',
    message.ko || '',
    message.zh || '',
    message.vi || '',
    description?.en || '',
    description?.ko || '',
    description?.zh || '',
    description?.vi || '',
    status || 'active'
  ];

  const result = await query(queryText, params);
  return transformToAPI(result.rows[0], ['message', 'description']);
}

/**
 * Update a message
 */
export async function updateMessage(
  id: string,
  updates: {
    code?: string;
    category?: string;
    type?: string;
    message?: MultiLangField;
    description?: MultiLangField;
    status?: string;
  }
): Promise<SystemMessageApiResponse | null> {
  const { code, category, type, message, description, status } = updates;

  const queryText = `
    UPDATE messages
    SET
      code = COALESCE($2, code),
      category = COALESCE($3, category),
      type = COALESCE($4, type),
      message_en = COALESCE($5, message_en),
      message_ko = COALESCE($6, message_ko),
      message_zh = COALESCE($7, message_zh),
      message_vi = COALESCE($8, message_vi),
      description_en = COALESCE($9, description_en),
      description_ko = COALESCE($10, description_ko),
      description_zh = COALESCE($11, description_zh),
      description_vi = COALESCE($12, description_vi),
      status = COALESCE($13, status),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const params = [
    id,
    code,
    category,
    type,
    message?.en,
    message?.ko,
    message?.zh,
    message?.vi,
    description?.en,
    description?.ko,
    description?.zh,
    description?.vi,
    status
  ];

  const result = await query(queryText, params);
  return transformToAPI(result.rows[0], ['message', 'description']);
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string): Promise<boolean> {
  const result = await query('DELETE FROM messages WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
