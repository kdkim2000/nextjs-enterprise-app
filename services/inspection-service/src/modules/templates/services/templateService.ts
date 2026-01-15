/**
 * Template Service - Business Logic for Checksheet Templates
 */

import { query, transaction } from '../../../utils/database';
import { v4 as uuidv4 } from 'uuid';
import {
  ChecksheetTemplate,
  ChecksheetTemplateCreateRequest,
  ChecksheetTemplateUpdateRequest,
  ChecksheetItem,
} from '../../../types';

export async function getAllTemplates(options: {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  status?: string;
} = {}): Promise<ChecksheetTemplate[]> {
  const { limit, offset, search, category, status } = options;

  let queryText = 'SELECT * FROM checksheet_templates WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
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

export async function getTemplateCount(filters: {
  search?: string;
  category?: string;
  status?: string;
} = {}): Promise<number> {
  let queryText = 'SELECT COUNT(*) FROM checksheet_templates WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  const { search, category, status } = filters;

  if (search) {
    queryText += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
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
  return parseInt(result.rows[0].count, 10);
}

export async function getTemplateById(id: string, includeItems: boolean = false): Promise<ChecksheetTemplate & { items?: ChecksheetItem[] } | null> {
  const result = await query('SELECT * FROM checksheet_templates WHERE id = $1', [id]);
  const template = result.rows[0] || null;

  if (template && includeItems) {
    const itemsResult = await query(
      'SELECT * FROM checksheet_items WHERE template_id = $1 ORDER BY sort_order ASC',
      [id]
    );
    template.items = itemsResult.rows;
  }

  return template;
}

export async function getTemplateByCode(code: string): Promise<ChecksheetTemplate | null> {
  const result = await query('SELECT * FROM checksheet_templates WHERE code = $1', [code]);
  return result.rows[0] || null;
}

export async function createTemplate(data: ChecksheetTemplateCreateRequest & { created_by?: string }): Promise<ChecksheetTemplate> {
  const id = uuidv4();

  const queryText = `
    INSERT INTO checksheet_templates (
      id, code, name, description, category, version, status, created_by, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    data.code,
    data.name,
    data.description || null,
    data.category || null,
    1, // Initial version
    data.status || 'active',
    data.created_by || null,
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function updateTemplate(id: string, updates: ChecksheetTemplateUpdateRequest): Promise<ChecksheetTemplate | null> {
  const allowedFields = ['code', 'name', 'description', 'category', 'status'];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClause.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Always update the updated_at timestamp
  setClause.push(`updated_at = NOW()`);

  params.push(id);

  const queryText = `UPDATE checksheet_templates SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

export async function archiveTemplate(id: string): Promise<boolean> {
  const result = await query(
    "UPDATE checksheet_templates SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  // This will cascade delete items due to foreign key constraint
  const result = await query('DELETE FROM checksheet_templates WHERE id = $1 RETURNING id', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function cloneTemplate(
  sourceId: string,
  newCode: string,
  newName: string,
  createdBy?: string
): Promise<ChecksheetTemplate & { items: ChecksheetItem[] }> {
  return transaction(async (client) => {
    // Get source template
    const sourceResult = await client.query('SELECT * FROM checksheet_templates WHERE id = $1', [sourceId]);
    const sourceTemplate = sourceResult.rows[0];

    if (!sourceTemplate) {
      throw new Error('Source template not found');
    }

    // Create new template
    const newId = uuidv4();
    const templateResult = await client.query(
      `INSERT INTO checksheet_templates (
        id, code, name, description, category, version, status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        newId,
        newCode,
        newName,
        sourceTemplate.description,
        sourceTemplate.category,
        1,
        'active',
        createdBy || null,
      ]
    );

    const newTemplate = templateResult.rows[0];

    // Get source items
    const itemsResult = await client.query(
      'SELECT * FROM checksheet_items WHERE template_id = $1 ORDER BY sort_order ASC',
      [sourceId]
    );

    // Create ID mapping for parent references
    const idMapping: { [key: string]: string } = {};
    const newItems: ChecksheetItem[] = [];

    // First pass: Create all items without parent references
    for (const item of itemsResult.rows) {
      const newItemId = uuidv4();
      idMapping[item.id] = newItemId;

      const newItemResult = await client.query(
        `INSERT INTO checksheet_items (
          id, template_id, parent_id, sort_order, item_code, item_name,
          item_type, options, required, description, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *`,
        [
          newItemId,
          newId,
          null, // Will update parent_id in second pass
          item.sort_order,
          item.item_code,
          item.item_name,
          item.item_type,
          item.options,
          item.required,
          item.description,
        ]
      );
      newItems.push(newItemResult.rows[0]);
    }

    // Second pass: Update parent references
    for (const item of itemsResult.rows) {
      if (item.parent_id) {
        const newItemId = idMapping[item.id];
        const newParentId = idMapping[item.parent_id];
        await client.query(
          'UPDATE checksheet_items SET parent_id = $1 WHERE id = $2',
          [newParentId, newItemId]
        );
      }
    }

    // Fetch updated items
    const finalItemsResult = await client.query(
      'SELECT * FROM checksheet_items WHERE template_id = $1 ORDER BY sort_order ASC',
      [newId]
    );

    return {
      ...newTemplate,
      items: finalItemsResult.rows,
    };
  });
}

export async function getTemplateItems(templateId: string): Promise<ChecksheetItem[]> {
  const result = await query(
    'SELECT * FROM checksheet_items WHERE template_id = $1 ORDER BY sort_order ASC',
    [templateId]
  );
  return result.rows;
}

export async function incrementTemplateVersion(id: string): Promise<number> {
  const result = await query(
    'UPDATE checksheet_templates SET version = version + 1, updated_at = NOW() WHERE id = $1 RETURNING version',
    [id]
  );
  return result.rows[0]?.version || 1;
}
