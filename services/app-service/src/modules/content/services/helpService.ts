/**
 * Help Service Layer
 */

import { query } from '@enterprise/shared';
import { Help, HelpQueryOptions, HelpApiResponse } from '../types';

/**
 * Transform database row from snake_case to camelCase
 */
function transformHelpRow(row: any): HelpApiResponse | null {
  if (!row) return null;

  return {
    id: row.id,
    programId: row.program_id,
    title: row.title,
    content: row.content,
    sections: row.sections,
    faq: row.faq,
    tips: row.tips,
    troubleshooting: row.troubleshooting,
    videoUrl: row.video_url,
    relatedTopics: row.related_topics,
    language: row.language,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by
  };
}

/**
 * Get all help contents with pagination and filtering
 */
export async function getAllHelp(options: HelpQueryOptions = {}): Promise<HelpApiResponse[]> {
  const { search, programId, language, status, limit, offset } = options;
  let queryText = 'SELECT * FROM help WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (programId) {
    queryText += ` AND program_id = $${paramIndex}`;
    params.push(programId);
    paramIndex++;
  }

  if (language) {
    queryText += ` AND language = $${paramIndex}`;
    params.push(language);
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
  return result.rows.map(transformHelpRow).filter((r): r is HelpApiResponse => r !== null);
}

/**
 * Get help by ID
 */
export async function getHelpById(id: string): Promise<HelpApiResponse | null> {
  const result = await query('SELECT * FROM help WHERE id = $1', [id]);
  return transformHelpRow(result.rows[0]);
}

/**
 * Get help by program ID and language
 */
export async function getHelpByProgram(
  programId: string,
  language: string = 'en',
  includeUnpublished: boolean = false
): Promise<HelpApiResponse | null> {
  let queryText = 'SELECT * FROM help WHERE program_id = $1 AND language = $2';
  const params: any[] = [programId, language];

  if (!includeUnpublished) {
    queryText += ' AND status = $3';
    params.push('published');
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await query(queryText, params);
  return transformHelpRow(result.rows[0]);
}

/**
 * Create a new help content
 */
export async function createHelp(data: {
  id: string;
  programId: string;
  title: string;
  content?: string;
  sections?: any[];
  faq?: any[];
  tips?: any[];
  troubleshooting?: any[];
  videoUrl?: string;
  relatedTopics?: any[];
  language?: string;
  status?: string;
  createdBy?: string;
}): Promise<HelpApiResponse | null> {
  const {
    id, programId, title, content, sections, faq, tips,
    troubleshooting, videoUrl, relatedTopics, language, status, createdBy
  } = data;

  const queryText = `
    INSERT INTO help (
      id, program_id, title, content, sections, faq, tips, troubleshooting,
      video_url, related_topics, language, status, created_at, updated_at, created_by, updated_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), $13, $13)
    RETURNING *
  `;

  const params = [
    id,
    programId,
    title,
    content || null,
    sections ? JSON.stringify(sections) : null,
    faq ? JSON.stringify(faq) : null,
    tips ? JSON.stringify(tips) : null,
    troubleshooting ? JSON.stringify(troubleshooting) : null,
    videoUrl || null,
    relatedTopics ? JSON.stringify(relatedTopics) : null,
    language || 'en',
    status || 'draft',
    createdBy || null
  ];

  const result = await query(queryText, params);
  return transformHelpRow(result.rows[0]);
}

/**
 * Update a help content
 */
export async function updateHelp(
  id: string,
  updates: Record<string, any>
): Promise<HelpApiResponse | null> {
  const allowedFields = [
    'program_id', 'title', 'content', 'sections', 'faq', 'tips',
    'troubleshooting', 'video_url', 'related_topics', 'language', 'status', 'updated_by'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      // Handle JSON fields
      if (['sections', 'faq', 'tips', 'troubleshooting', 'related_topics'].includes(dbField)) {
        setClause.push(`${dbField} = $${paramIndex}::jsonb`);
        params.push(value ? JSON.stringify(value) : null);
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

  const queryText = `UPDATE help SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return transformHelpRow(result.rows[0]);
}

/**
 * Delete a help content
 */
export async function deleteHelp(id: string): Promise<boolean> {
  const result = await query('DELETE FROM help WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get help count
 */
export async function getHelpCount(options: HelpQueryOptions = {}): Promise<number> {
  const { search, programId, language, status } = options;
  let queryText = 'SELECT COUNT(*) FROM help WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (programId) {
    queryText += ` AND program_id = $${paramIndex}`;
    params.push(programId);
    paramIndex++;
  }

  if (language) {
    queryText += ` AND language = $${paramIndex}`;
    params.push(language);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count);
}
