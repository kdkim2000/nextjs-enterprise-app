/**
 * Help Service Layer
 */

const db = require('../config/database');

/**
 * Transform database row from snake_case to camelCase
 */
function transformHelpRow(row) {
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

async function getAllHelp(options = {}) {
  const { search, programId, language, status, limit, offset } = options;
  let query = 'SELECT * FROM help WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (programId) {
    query += ` AND program_id = $${paramIndex}`;
    params.push(programId);
    paramIndex++;
  }

  if (language) {
    query += ` AND language = $${paramIndex}`;
    params.push(language);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ' ORDER BY created_at DESC';

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await db.query(query, params);
  return result.rows.map(transformHelpRow);
}

async function getHelpById(id) {
  const result = await db.query('SELECT * FROM help WHERE id = $1', [id]);
  return transformHelpRow(result.rows[0]);
}

async function getHelpByProgram(programId, language = 'en', includeUnpublished = false) {
  let query = 'SELECT * FROM help WHERE program_id = $1 AND language = $2';
  const params = [programId, language];

  if (!includeUnpublished) {
    query += ' AND status = $3';
    params.push('published');
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.query(query, params);
  return transformHelpRow(result.rows[0]);
}

async function createHelp(data) {
  const {
    id,
    programId,
    title,
    content,
    sections,
    faq,
    tips,
    troubleshooting,
    videoUrl,
    relatedTopics,
    language,
    status,
    createdBy
  } = data;

  const query = `
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
    content,
    sections ? JSON.stringify(sections) : null,
    faq ? JSON.stringify(faq) : null,
    tips ? JSON.stringify(tips) : null,
    troubleshooting ? JSON.stringify(troubleshooting) : null,
    videoUrl,
    relatedTopics ? JSON.stringify(relatedTopics) : null,
    language || 'en',
    status || 'draft',
    createdBy
  ];

  const result = await db.query(query, params);
  return transformHelpRow(result.rows[0]);
}

async function updateHelp(id, updates) {
  const allowedFields = [
    'program_id',
    'title',
    'content',
    'sections',
    'faq',
    'tips',
    'troubleshooting',
    'video_url',
    'related_topics',
    'language',
    'status',
    'updated_by'
  ];
  const setClause = [];
  const params = [];
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

  if (setClause.length === 0) throw new Error('No valid fields to update');
  setClause.push(`updated_at = NOW()`);
  params.push(id);

  const query = `UPDATE help SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return transformHelpRow(result.rows[0]);
}

async function deleteHelp(id) {
  const result = await db.query('DELETE FROM help WHERE id = $1', [id]);
  return result.rowCount > 0;
}

async function getHelpCount(options = {}) {
  const { search, programId, language, status } = options;
  let query = 'SELECT COUNT(*) FROM help WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (programId) {
    query += ` AND program_id = $${paramIndex}`;
    params.push(programId);
    paramIndex++;
  }

  if (language) {
    query += ` AND language = $${paramIndex}`;
    params.push(language);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
}

module.exports = {
  getAllHelp,
  getHelpById,
  getHelpByProgram,
  createHelp,
  updateHelp,
  deleteHelp,
  getHelpCount,
};
