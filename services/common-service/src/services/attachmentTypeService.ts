/**
 * Attachment Type Service Layer
 * Manages file upload configurations by type.
 */

import { query } from '../utils/database';
import { AttachmentType } from '../types';

export async function getAllAttachmentTypes(options: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<any[]> {
  const { search, status, limit, offset } = options;

  let queryText = 'SELECT * FROM attachment_types WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  queryText += ' ORDER BY "order", code';

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

export async function getAttachmentTypeById(id: string): Promise<any | null> {
  const queryText = 'SELECT * FROM attachment_types WHERE id = $1';
  const result = await query(queryText, [id]);
  return result.rows[0] || null;
}

export async function getAttachmentTypeByCode(code: string): Promise<any | null> {
  const queryText = 'SELECT * FROM attachment_types WHERE code = $1';
  const result = await query(queryText, [code]);
  return result.rows[0] || null;
}

export async function createAttachmentType(data: {
  id: string;
  code: string;
  nameEn?: string;
  nameKo?: string;
  nameZh?: string;
  nameVi?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
  storagePath: string;
  maxFileCount?: number;
  maxFileSize?: number;
  maxTotalSize?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
  status?: string;
  order?: number;
}): Promise<any> {
  const queryText = `
    INSERT INTO attachment_types (
      id, code, name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      storage_path, max_file_count, max_file_size, max_total_size,
      allowed_extensions, allowed_mime_types, status, "order",
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    data.id, data.code,
    data.nameEn || '', data.nameKo || '', data.nameZh || '', data.nameVi || '',
    data.descriptionEn || '', data.descriptionKo || '', data.descriptionZh || '', data.descriptionVi || '',
    data.storagePath,
    data.maxFileCount || 5,
    data.maxFileSize || 10485760,
    data.maxTotalSize || 52428800,
    data.allowedExtensions || [],
    data.allowedMimeTypes || [],
    data.status || 'active',
    data.order || 0
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function updateAttachmentType(id: string, updates: Record<string, any>): Promise<any | null> {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'storage_path', 'max_file_count', 'max_file_size', 'max_total_size',
    'allowed_extensions', 'allowed_mime_types', 'status', 'order'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      setClause.push(`${dbField} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(id);

  const queryText = `UPDATE attachment_types SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

export async function deleteAttachmentType(id: string): Promise<boolean> {
  const queryText = 'DELETE FROM attachment_types WHERE id = $1';
  const result = await query(queryText, [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getAttachmentTypeCount(options: {
  search?: string;
  status?: string;
} = {}): Promise<number> {
  const { search, status } = options;

  let queryText = 'SELECT COUNT(*) FROM attachment_types WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count, 10);
}
