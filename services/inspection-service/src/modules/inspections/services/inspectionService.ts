/**
 * Inspection Service - Business Logic for Inspection Execution
 */

import { query, transaction } from '../../../utils/database';
import { v4 as uuidv4 } from 'uuid';
import {
  Inspection,
  InspectionCreateRequest,
  InspectionUpdateRequest,
  InspectionResult,
  InspectionResultCreateRequest,
  ChecksheetItem,
  ChecksheetTemplate,
} from '../../../types';

export async function getAllInspections(options: {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  template_id?: string;
  inspector_id?: string;
  start_date?: string;
  end_date?: string;
} = {}): Promise<Inspection[]> {
  const { limit, offset, search, status, template_id, inspector_id, start_date, end_date } = options;

  let queryText = `
    SELECT i.*, t.name as template_name, t.code as template_code
    FROM inspections i
    LEFT JOIN checksheet_templates t ON i.template_id = t.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (i.inspection_code ILIKE $${paramIndex} OR i.target_name ILIKE $${paramIndex} OR i.notes ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND i.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (template_id) {
    queryText += ` AND i.template_id = $${paramIndex}`;
    params.push(template_id);
    paramIndex++;
  }

  if (inspector_id) {
    queryText += ` AND i.inspector_id = $${paramIndex}`;
    params.push(inspector_id);
    paramIndex++;
  }

  if (start_date) {
    queryText += ` AND i.created_at >= $${paramIndex}`;
    params.push(start_date);
    paramIndex++;
  }

  if (end_date) {
    queryText += ` AND i.created_at <= $${paramIndex}`;
    params.push(end_date);
    paramIndex++;
  }

  queryText += ' ORDER BY i.created_at DESC';

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

export async function getInspectionCount(filters: {
  search?: string;
  status?: string;
  template_id?: string;
  inspector_id?: string;
  start_date?: string;
  end_date?: string;
} = {}): Promise<number> {
  let queryText = 'SELECT COUNT(*) FROM inspections WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  const { search, status, template_id, inspector_id, start_date, end_date } = filters;

  if (search) {
    queryText += ` AND (inspection_code ILIKE $${paramIndex} OR target_name ILIKE $${paramIndex} OR notes ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (template_id) {
    queryText += ` AND template_id = $${paramIndex}`;
    params.push(template_id);
    paramIndex++;
  }

  if (inspector_id) {
    queryText += ` AND inspector_id = $${paramIndex}`;
    params.push(inspector_id);
    paramIndex++;
  }

  if (start_date) {
    queryText += ` AND created_at >= $${paramIndex}`;
    params.push(start_date);
    paramIndex++;
  }

  if (end_date) {
    queryText += ` AND created_at <= $${paramIndex}`;
    params.push(end_date);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count, 10);
}

export async function getInspectionById(
  id: string,
  includeResults: boolean = false,
  includeTemplate: boolean = false
): Promise<Inspection & { results?: InspectionResult[]; template?: ChecksheetTemplate & { items?: ChecksheetItem[] } } | null> {
  const result = await query(`
    SELECT i.*, t.name as template_name, t.code as template_code
    FROM inspections i
    LEFT JOIN checksheet_templates t ON i.template_id = t.id
    WHERE i.id = $1
  `, [id]);

  const inspection = result.rows[0] || null;

  if (inspection) {
    if (includeResults) {
      const resultsResult = await query(
        'SELECT * FROM inspection_results WHERE inspection_id = $1 ORDER BY recorded_at ASC',
        [id]
      );
      inspection.results = resultsResult.rows;
    }

    if (includeTemplate) {
      const templateResult = await query(
        'SELECT * FROM checksheet_templates WHERE id = $1',
        [inspection.template_id]
      );
      inspection.template = templateResult.rows[0] || null;

      if (inspection.template) {
        const itemsResult = await query(
          'SELECT * FROM checksheet_items WHERE template_id = $1 ORDER BY sort_order ASC',
          [inspection.template_id]
        );
        inspection.template.items = itemsResult.rows;
      }
    }
  }

  return inspection;
}

export async function generateInspectionCode(): Promise<string> {
  const date = new Date();
  const prefix = `INS-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

  const result = await query(
    `SELECT COUNT(*) FROM inspections WHERE inspection_code LIKE $1`,
    [`${prefix}%`]
  );

  const count = parseInt(result.rows[0].count, 10) + 1;
  return `${prefix}-${String(count).padStart(4, '0')}`;
}

export async function createInspection(data: InspectionCreateRequest & {
  inspector_id?: string;
  status?: string;
  started_at?: Date;
}): Promise<Inspection> {
  const id = uuidv4();

  const queryText = `
    INSERT INTO inspections (
      id, template_id, inspection_code, target_name, target_id,
      inspector_id, status, started_at, location, notes,
      sync_status, client_id, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    data.template_id,
    data.inspection_code || await generateInspectionCode(),
    data.target_name || null,
    data.target_id || null,
    data.inspector_id || null,
    data.status || 'draft',
    data.started_at || null,
    data.location || null,
    data.notes || null,
    'synced',
    data.client_id || null,
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function updateInspection(id: string, updates: InspectionUpdateRequest): Promise<Inspection | null> {
  const allowedFields = ['target_name', 'target_id', 'status', 'location', 'notes'];

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

  // Update status-related timestamps
  if (updates.status === 'completed') {
    setClause.push(`completed_at = NOW()`);
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);

  params.push(id);

  const queryText = `UPDATE inspections SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

export async function saveResults(inspectionId: string, results: InspectionResultCreateRequest[]): Promise<InspectionResult[]> {
  return transaction(async (client) => {
    const savedResults: InspectionResult[] = [];

    for (const result of results) {
      // Check if result already exists
      const existingResult = await client.query(
        'SELECT * FROM inspection_results WHERE inspection_id = $1 AND item_id = $2',
        [inspectionId, result.item_id]
      );

      if (existingResult.rows.length > 0) {
        // Update existing result
        const updateResult = await client.query(
          `UPDATE inspection_results SET
            value = $1,
            value_type = $2,
            is_passed = $3,
            remarks = $4,
            photo_urls = $5,
            recorded_at = NOW(),
            sync_version = sync_version + 1
          WHERE inspection_id = $6 AND item_id = $7
          RETURNING *`,
          [
            result.value || null,
            result.value_type || 'text',
            result.is_passed ?? null,
            result.remarks || null,
            result.photo_urls ? JSON.stringify(result.photo_urls) : null,
            inspectionId,
            result.item_id,
          ]
        );
        savedResults.push(updateResult.rows[0]);
      } else {
        // Create new result
        const id = uuidv4();
        const insertResult = await client.query(
          `INSERT INTO inspection_results (
            id, inspection_id, item_id, value, value_type,
            is_passed, remarks, photo_urls, recorded_at,
            offline_created_at, sync_version
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, 1)
          RETURNING *`,
          [
            id,
            inspectionId,
            result.item_id,
            result.value || null,
            result.value_type || 'text',
            result.is_passed ?? null,
            result.remarks || null,
            result.photo_urls ? JSON.stringify(result.photo_urls) : null,
            result.offline_created_at || null,
          ]
        );
        savedResults.push(insertResult.rows[0]);
      }
    }

    return savedResults;
  });
}

export async function validateInspectionCompletion(inspectionId: string): Promise<{
  isComplete: boolean;
  missingItems: { id: string; item_name: string }[];
}> {
  // Get inspection with template
  const inspection = await getInspectionById(inspectionId, false);
  if (!inspection) {
    throw new Error('Inspection not found');
  }

  // Get required items for the template
  const requiredItemsResult = await query(
    'SELECT id, item_name FROM checksheet_items WHERE template_id = $1 AND required = true',
    [inspection.template_id]
  );

  // Get results for this inspection
  const resultsResult = await query(
    'SELECT item_id FROM inspection_results WHERE inspection_id = $1 AND value IS NOT NULL',
    [inspectionId]
  );

  const answeredItemIds = new Set(resultsResult.rows.map(r => r.item_id));
  const missingItems: { id: string; item_name: string }[] = [];

  for (const item of requiredItemsResult.rows) {
    if (!answeredItemIds.has(item.id)) {
      missingItems.push({ id: item.id, item_name: item.item_name });
    }
  }

  return {
    isComplete: missingItems.length === 0,
    missingItems,
  };
}

export async function submitInspection(id: string): Promise<Inspection> {
  const result = await query(
    `UPDATE inspections SET
      status = 'submitted',
      completed_at = COALESCE(completed_at, NOW()),
      submitted_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [id]
  );

  return result.rows[0];
}

export async function deleteInspection(id: string): Promise<boolean> {
  return transaction(async (client) => {
    // Delete results first
    await client.query('DELETE FROM inspection_results WHERE inspection_id = $1', [id]);

    // Delete inspection
    const result = await client.query('DELETE FROM inspections WHERE id = $1 RETURNING id', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  });
}

export async function getInspectionResults(inspectionId: string): Promise<InspectionResult[]> {
  const result = await query(
    `SELECT r.*, i.item_name, i.item_type, i.item_code
    FROM inspection_results r
    LEFT JOIN checksheet_items i ON r.item_id = i.id
    WHERE r.inspection_id = $1
    ORDER BY i.sort_order ASC`,
    [inspectionId]
  );
  return result.rows;
}
