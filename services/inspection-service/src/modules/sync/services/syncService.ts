/**
 * Sync Service - Offline Data Synchronization Logic
 */

import { query, transaction } from '../../../utils/database';
import { v4 as uuidv4 } from 'uuid';
import {
  SyncDownloadRequest,
  SyncDownloadResponse,
  SyncUploadRequest,
  SyncUploadResponse,
  OfflineInspection,
  SyncConflict,
  ChecksheetTemplate,
  ChecksheetItem,
} from '../../../types';

export async function downloadForOffline(options: SyncDownloadRequest): Promise<SyncDownloadResponse> {
  let templatesQuery = `SELECT * FROM checksheet_templates WHERE status = 'active'`;
  const params: any[] = [];

  if (options.template_ids && options.template_ids.length > 0) {
    const placeholders = options.template_ids.map((_, i) => `$${i + 1}`).join(', ');
    templatesQuery += ` AND id IN (${placeholders})`;
    params.push(...options.template_ids);
  }

  templatesQuery += ' ORDER BY name ASC';

  const templatesResult = await query(templatesQuery, params);
  const templates: ChecksheetTemplate[] = templatesResult.rows;

  let items: ChecksheetItem[] = [];
  if (options.include_items !== false && templates.length > 0) {
    const templateIds = templates.map(t => t.id);
    const placeholders = templateIds.map((_, i) => `$${i + 1}`).join(', ');

    const itemsResult = await query(
      `SELECT * FROM checksheet_items WHERE template_id IN (${placeholders}) ORDER BY template_id, sort_order ASC`,
      templateIds
    );
    items = itemsResult.rows;
  }

  return {
    templates,
    items,
    sync_timestamp: new Date(),
  };
}

export async function uploadOfflineData(data: SyncUploadRequest & { inspector_id?: string }): Promise<SyncUploadResponse> {
  const { client_id, inspections, inspector_id } = data;

  return transaction(async (client) => {
    let synced_count = 0;
    let failed_count = 0;
    const conflicts: SyncConflict[] = [];
    const id_mappings: { local_id: string; server_id: string }[] = [];

    for (const offlineInspection of inspections) {
      try {
        // Check for duplicate inspection code
        const existingResult = await client.query(
          'SELECT id, sync_status FROM inspections WHERE inspection_code = $1',
          [offlineInspection.inspection_code]
        );

        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0];

          // If already synced, this is a conflict
          if (existing.sync_status === 'synced') {
            conflicts.push({
              local_id: offlineInspection.local_id,
              server_id: existing.id,
              entity_type: 'inspection',
              conflict_type: 'duplicate',
              message: `Inspection code ${offlineInspection.inspection_code} already exists on server`,
            });
            failed_count++;
            continue;
          }
        }

        // Create new inspection
        const inspectionId = uuidv4();
        await client.query(
          `INSERT INTO inspections (
            id, template_id, inspection_code, target_name, target_id,
            inspector_id, status, started_at, completed_at, location, notes,
            sync_status, client_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())`,
          [
            inspectionId,
            offlineInspection.template_id,
            offlineInspection.inspection_code,
            offlineInspection.target_name || null,
            offlineInspection.target_id || null,
            inspector_id || null,
            offlineInspection.status,
            offlineInspection.started_at || null,
            offlineInspection.completed_at || null,
            offlineInspection.location || null,
            offlineInspection.notes || null,
            'synced',
            client_id,
            offlineInspection.created_at,
          ]
        );

        id_mappings.push({
          local_id: offlineInspection.local_id,
          server_id: inspectionId,
        });

        // Create results
        for (const result of offlineInspection.results || []) {
          const resultId = uuidv4();
          await client.query(
            `INSERT INTO inspection_results (
              id, inspection_id, item_id, value, value_type,
              is_passed, remarks, photo_urls, recorded_at,
              offline_created_at, sync_version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)`,
            [
              resultId,
              inspectionId,
              result.item_id,
              result.value || null,
              result.value_type || 'text',
              result.is_passed ?? null,
              result.remarks || null,
              result.photo_urls ? JSON.stringify(result.photo_urls) : null,
              result.recorded_at || new Date(),
              result.recorded_at || null,
            ]
          );

          id_mappings.push({
            local_id: result.local_id,
            server_id: resultId,
          });
        }

        synced_count++;
      } catch (error: any) {
        conflicts.push({
          local_id: offlineInspection.local_id,
          entity_type: 'inspection',
          conflict_type: 'version_mismatch',
          message: error.message || 'Failed to sync inspection',
        });
        failed_count++;
      }
    }

    // Record sync event
    await client.query(
      `INSERT INTO sync_queue (
        id, client_id, entity_type, entity_id, operation, payload,
        created_at, synced_at, sync_status
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), 'synced')`,
      [
        uuidv4(),
        client_id,
        'batch_upload',
        client_id,
        'create',
        JSON.stringify({ synced_count, failed_count }),
      ]
    );

    return {
      synced_count,
      failed_count,
      conflicts,
      id_mappings,
    };
  });
}

export async function getSyncStatus(client_id: string): Promise<{
  last_sync: Date | null;
  pending_count: number;
  conflict_count: number;
  synced_inspections: number;
}> {
  const [lastSyncResult, pendingResult, conflictResult, syncedResult] = await Promise.all([
    query(
      `SELECT MAX(synced_at) as last_sync FROM sync_queue WHERE client_id = $1 AND sync_status = 'synced'`,
      [client_id]
    ),
    query(
      `SELECT COUNT(*) FROM sync_queue WHERE client_id = $1 AND sync_status = 'pending'`,
      [client_id]
    ),
    query(
      `SELECT COUNT(*) FROM sync_queue WHERE client_id = $1 AND sync_status = 'failed'`,
      [client_id]
    ),
    query(
      `SELECT COUNT(*) FROM inspections WHERE client_id = $1 AND sync_status = 'synced'`,
      [client_id]
    ),
  ]);

  return {
    last_sync: lastSyncResult.rows[0]?.last_sync || null,
    pending_count: parseInt(pendingResult.rows[0].count, 10),
    conflict_count: parseInt(conflictResult.rows[0].count, 10),
    synced_inspections: parseInt(syncedResult.rows[0].count, 10),
  };
}

export async function resolveConflict(
  conflict_id: string,
  resolution: 'server_wins' | 'client_wins' | 'merge',
  merged_data?: any
): Promise<{ success: boolean; message: string }> {
  return transaction(async (client) => {
    // Get the conflict from sync_queue
    const conflictResult = await client.query(
      'SELECT * FROM sync_queue WHERE id = $1',
      [conflict_id]
    );

    if (conflictResult.rows.length === 0) {
      throw new Error('Conflict not found');
    }

    const conflict = conflictResult.rows[0];
    const payload = typeof conflict.payload === 'string' ? JSON.parse(conflict.payload) : conflict.payload;

    switch (resolution) {
      case 'server_wins':
        // Just mark the conflict as resolved, server data stays
        await client.query(
          `UPDATE sync_queue SET sync_status = 'synced', synced_at = NOW() WHERE id = $1`,
          [conflict_id]
        );
        return { success: true, message: 'Conflict resolved - server version kept' };

      case 'client_wins':
        // Replace server data with client data
        if (conflict.entity_type === 'inspection' && payload.inspection) {
          await client.query(
            `UPDATE inspections SET
              target_name = $1, target_id = $2, location = $3, notes = $4,
              status = $5, sync_status = 'synced', updated_at = NOW()
            WHERE id = $6`,
            [
              payload.inspection.target_name,
              payload.inspection.target_id,
              payload.inspection.location,
              payload.inspection.notes,
              payload.inspection.status,
              conflict.entity_id,
            ]
          );
        }

        await client.query(
          `UPDATE sync_queue SET sync_status = 'synced', synced_at = NOW() WHERE id = $1`,
          [conflict_id]
        );
        return { success: true, message: 'Conflict resolved - client version applied' };

      case 'merge':
        // Apply merged data
        if (!merged_data) {
          throw new Error('Merged data is required for merge resolution');
        }

        if (conflict.entity_type === 'inspection') {
          await client.query(
            `UPDATE inspections SET
              target_name = $1, target_id = $2, location = $3, notes = $4,
              status = $5, sync_status = 'synced', updated_at = NOW()
            WHERE id = $6`,
            [
              merged_data.target_name,
              merged_data.target_id,
              merged_data.location,
              merged_data.notes,
              merged_data.status,
              conflict.entity_id,
            ]
          );
        }

        await client.query(
          `UPDATE sync_queue SET sync_status = 'synced', synced_at = NOW() WHERE id = $1`,
          [conflict_id]
        );
        return { success: true, message: 'Conflict resolved - merged version applied' };

      default:
        throw new Error('Invalid resolution type');
    }
  });
}

export async function getPendingSyncItems(client_id: string): Promise<any[]> {
  const result = await query(
    `SELECT * FROM sync_queue WHERE client_id = $1 AND sync_status = 'pending' ORDER BY created_at ASC`,
    [client_id]
  );
  return result.rows;
}

export async function removeSyncQueueItem(id: string): Promise<boolean> {
  const result = await query('DELETE FROM sync_queue WHERE id = $1 RETURNING id', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function markInspectionAsPending(inspectionId: string, clientId: string): Promise<void> {
  await query(
    `UPDATE inspections SET sync_status = 'pending' WHERE id = $1`,
    [inspectionId]
  );

  await query(
    `INSERT INTO sync_queue (
      id, client_id, entity_type, entity_id, operation, payload, created_at, sync_status
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'pending')`,
    [
      uuidv4(),
      clientId,
      'inspection',
      inspectionId,
      'update',
      JSON.stringify({ inspection_id: inspectionId }),
    ]
  );
}
