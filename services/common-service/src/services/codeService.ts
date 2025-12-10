/**
 * Code Service Layer
 * Provides data access methods for codes and code types.
 */

import { query } from '../utils/database';
import { transformMultiLangFields, transformMultiLangArray } from '../utils/multiLangTransform';
import { Code, CodeType, CodeQueryOptions, MultiLangField } from '../types';

// ==========================================
// Code Types Operations
// ==========================================

export async function getAllCodeTypes(options: { search?: string } = {}): Promise<CodeType[]> {
  const { search } = options;

  let queryText = 'SELECT * FROM code_types WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  queryText += ' ORDER BY code';

  const result = await query(queryText, params);
  return transformMultiLangArray(result.rows, ['name', 'description']);
}

export async function getCodeTypeByCode(code: string): Promise<CodeType | null> {
  const queryText = 'SELECT * FROM code_types WHERE code = $1';
  const result = await query(queryText, [code]);
  return result.rows[0] ? transformMultiLangFields(result.rows[0], ['name', 'description']) : null;
}

export async function getCodeTypeById(id: string): Promise<CodeType | null> {
  const queryText = 'SELECT * FROM code_types WHERE id = $1';
  const result = await query(queryText, [id]);
  return result.rows[0] ? transformMultiLangFields(result.rows[0], ['name', 'description']) : null;
}

export async function createCodeType(data: {
  id: string;
  code: string;
  nameEn: string;
  nameKo: string;
  nameZh?: string;
  nameVi?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
}): Promise<CodeType> {
  const queryText = `
    INSERT INTO code_types (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    data.id, data.code, data.nameEn, data.nameKo, data.nameZh || '', data.nameVi || '',
    data.descriptionEn || '', data.descriptionKo || '', data.descriptionZh || '', data.descriptionVi || ''
  ];

  const result = await query(queryText, params);
  return transformMultiLangFields(result.rows[0], ['name', 'description']);
}

export async function updateCodeType(id: string, updates: Record<string, any>): Promise<CodeType | null> {
  const allowedFields = ['code', 'name_en', 'name_ko', 'name_zh', 'name_vi', 'description_en', 'description_ko', 'description_zh', 'description_vi'];
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

  const queryText = `UPDATE code_types SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] ? transformMultiLangFields(result.rows[0], ['name', 'description']) : null;
}

export async function deleteCodeType(id: string): Promise<boolean> {
  const queryText = 'DELETE FROM code_types WHERE id = $1';
  const result = await query(queryText, [id]);
  return (result.rowCount ?? 0) > 0;
}

// ==========================================
// Codes Operations
// ==========================================

export async function getAllCodes(options: CodeQueryOptions = {}): Promise<any[]> {
  const { search, codeType, status, limit, offset } = options;

  let queryText = 'SELECT * FROM codes WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (codeType) {
    queryText += ` AND code_type = $${paramIndex}`;
    params.push(codeType);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  queryText += ' ORDER BY code_type, "order", code';

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

export async function getCodesByType(codeType: string): Promise<any[]> {
  const queryText = 'SELECT * FROM codes WHERE code_type = $1 AND status = $2 ORDER BY "order", code';
  const result = await query(queryText, [codeType, 'active']);
  return result.rows;
}

export async function getCodeById(id: string): Promise<any | null> {
  const queryText = 'SELECT * FROM codes WHERE id = $1';
  const result = await query(queryText, [id]);
  return result.rows[0] || null;
}

export async function getCodeByTypeAndCode(codeType: string, code: string): Promise<any | null> {
  const queryText = 'SELECT * FROM codes WHERE code_type = $1 AND code = $2';
  const result = await query(queryText, [codeType, code]);
  return result.rows[0] || null;
}

export async function getCodeCount(options: CodeQueryOptions = {}): Promise<number> {
  const { search, codeType, status } = options;

  let queryText = 'SELECT COUNT(*) FROM codes WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (codeType) {
    queryText += ` AND code_type = $${paramIndex}`;
    params.push(codeType);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count);
}

export async function getDistinctCodeTypes(): Promise<string[]> {
  const queryText = 'SELECT DISTINCT code_type FROM codes ORDER BY code_type';
  const result = await query(queryText);
  return result.rows.map((row: any) => row.code_type);
}

export async function createCode(data: {
  id: string;
  code: string;
  codeType: string;
  nameEn: string;
  nameKo: string;
  nameZh?: string;
  nameVi?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
  order?: number;
  status?: string;
  parentCode?: string;
  attributes?: Record<string, any>;
}): Promise<any> {
  const queryText = `
    INSERT INTO codes (
      id, code, code_type, name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      "order", status, attributes, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    data.id, data.code, data.codeType, data.nameEn, data.nameKo, data.nameZh || '', data.nameVi || '',
    data.descriptionEn || '', data.descriptionKo || '', data.descriptionZh || '', data.descriptionVi || '',
    data.order || 1, data.status || 'active',
    data.attributes ? JSON.stringify(data.attributes) : null
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function updateCode(id: string, updates: Record<string, any>): Promise<any | null> {
  const allowedFields = [
    'code', 'code_type', 'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'order', 'status', 'attributes'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      if (dbField === 'attributes' && value !== null) {
        setClause.push(`${dbField} = $${paramIndex}::jsonb`);
        params.push(JSON.stringify(value));
      } else {
        setClause.push(`${dbField} = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(id);

  const queryText = `UPDATE codes SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

export async function deleteCode(id: string): Promise<boolean> {
  const queryText = 'DELETE FROM codes WHERE id = $1';
  const result = await query(queryText, [id]);
  return (result.rowCount ?? 0) > 0;
}
