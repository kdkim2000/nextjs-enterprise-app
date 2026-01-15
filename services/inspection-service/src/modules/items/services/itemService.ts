/**
 * Item Service - Business Logic for Checksheet Items
 */

import { query, transaction } from '../../../utils/database';
import { v4 as uuidv4 } from 'uuid';
import {
  ChecksheetItem,
  ChecksheetItemCreateRequest,
  ChecksheetItemUpdateRequest,
} from '../../../types';

export async function getItemById(id: string): Promise<ChecksheetItem | null> {
  const result = await query('SELECT * FROM checksheet_items WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getItemsByTemplateId(templateId: string): Promise<ChecksheetItem[]> {
  const result = await query(
    'SELECT * FROM checksheet_items WHERE template_id = $1 ORDER BY sort_order ASC',
    [templateId]
  );
  return result.rows;
}

export async function createItem(data: ChecksheetItemCreateRequest): Promise<ChecksheetItem> {
  const id = uuidv4();

  // If no sort_order provided, get the max sort_order for the template
  let sortOrder = data.sort_order;
  if (sortOrder === undefined) {
    const maxResult = await query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM checksheet_items WHERE template_id = $1',
      [data.template_id]
    );
    sortOrder = maxResult.rows[0].next_order;
  }

  const queryText = `
    INSERT INTO checksheet_items (
      id, template_id, parent_id, sort_order, item_code, item_name,
      item_type, options, required, description, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING *
  `;

  const params = [
    id,
    data.template_id,
    data.parent_id || null,
    sortOrder,
    data.item_code || null,
    data.item_name,
    data.item_type,
    data.options ? JSON.stringify(data.options) : null,
    data.required ?? false,
    data.description || null,
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function updateItem(id: string, updates: ChecksheetItemUpdateRequest): Promise<ChecksheetItem | null> {
  const allowedFields = ['parent_id', 'sort_order', 'item_code', 'item_name', 'item_type', 'options', 'required', 'description'];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      if (key === 'options') {
        setClause.push(`${key} = $${paramIndex}`);
        params.push(value ? JSON.stringify(value) : null);
      } else {
        setClause.push(`${key} = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  params.push(id);

  const queryText = `UPDATE checksheet_items SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

export async function deleteItem(id: string): Promise<boolean> {
  // First, update any child items to remove parent reference
  await query('UPDATE checksheet_items SET parent_id = NULL WHERE parent_id = $1', [id]);

  const result = await query('DELETE FROM checksheet_items WHERE id = $1 RETURNING id', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function reorderItems(templateId: string, items: { id: string; sort_order: number; parent_id?: string }[]): Promise<void> {
  await transaction(async (client) => {
    for (const item of items) {
      await client.query(
        'UPDATE checksheet_items SET sort_order = $1, parent_id = $2 WHERE id = $3 AND template_id = $4',
        [item.sort_order, item.parent_id || null, item.id, templateId]
      );
    }
  });
}

export async function bulkCreateItems(templateId: string, items: Omit<ChecksheetItemCreateRequest, 'template_id'>[]): Promise<ChecksheetItem[]> {
  return transaction(async (client) => {
    const createdItems: ChecksheetItem[] = [];
    const idMapping: { [key: string]: string } = {};

    // First pass: Create all items without parent references
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const id = uuidv4();
      const tempId = `temp_${i}`;
      idMapping[tempId] = id;

      const result = await client.query(
        `INSERT INTO checksheet_items (
          id, template_id, parent_id, sort_order, item_code, item_name,
          item_type, options, required, description, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *`,
        [
          id,
          templateId,
          null,
          item.sort_order ?? i + 1,
          item.item_code || null,
          item.item_name,
          item.item_type,
          item.options ? JSON.stringify(item.options) : null,
          item.required ?? false,
          item.description || null,
        ]
      );
      createdItems.push(result.rows[0]);
    }

    // Second pass: Update parent references if needed
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.parent_id) {
        // Check if parent_id is a temp reference or actual ID
        const actualParentId = idMapping[item.parent_id] || item.parent_id;
        await client.query(
          'UPDATE checksheet_items SET parent_id = $1 WHERE id = $2',
          [actualParentId, createdItems[i].id]
        );
        createdItems[i].parent_id = actualParentId;
      }
    }

    return createdItems;
  });
}

export async function getItemCount(templateId: string): Promise<number> {
  const result = await query(
    'SELECT COUNT(*) FROM checksheet_items WHERE template_id = $1',
    [templateId]
  );
  return parseInt(result.rows[0].count, 10);
}

export async function getItemsByParentId(templateId: string, parentId: string | null): Promise<ChecksheetItem[]> {
  let queryText: string;
  let params: any[];

  if (parentId === null) {
    queryText = 'SELECT * FROM checksheet_items WHERE template_id = $1 AND parent_id IS NULL ORDER BY sort_order ASC';
    params = [templateId];
  } else {
    queryText = 'SELECT * FROM checksheet_items WHERE template_id = $1 AND parent_id = $2 ORDER BY sort_order ASC';
    params = [templateId, parentId];
  }

  const result = await query(queryText, params);
  return result.rows;
}
