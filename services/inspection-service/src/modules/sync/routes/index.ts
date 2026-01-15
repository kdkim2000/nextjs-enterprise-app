/**
 * Sync Routes - Offline Data Synchronization
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '@enterprise/shared';
import * as syncService from '../services/syncService';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('inspection-service:sync');

/**
 * GET /inspection/sync/download
 * Download checksheet templates and items for offline use
 */
router.get('/download', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { template_ids, include_items = 'true' } = req.query;

    let templateIds: string[] | undefined;
    if (template_ids) {
      templateIds = (template_ids as string).split(',').map(id => id.trim());
    }

    const data = await syncService.downloadForOffline({
      template_ids: templateIds,
      include_items: include_items === 'true',
    });

    res.json(data);
  } catch (error) {
    logger.error('Download sync error:', error);
    res.status(500).json({ error: 'Failed to download sync data' });
  }
});

/**
 * POST /inspection/sync/upload
 * Upload offline inspection data
 */
router.post('/upload', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { client_id, inspections } = req.body;

    if (!client_id || !inspections || !Array.isArray(inspections)) {
      return res.status(400).json({ error: 'client_id and inspections array are required' });
    }

    const result = await syncService.uploadOfflineData({
      client_id,
      inspections,
      inspector_id: userId,
    });

    res.json(result);
  } catch (error) {
    logger.error('Upload sync error:', error);
    res.status(500).json({ error: 'Failed to upload sync data' });
  }
});

/**
 * GET /inspection/sync/status
 * Get sync status for a client
 */
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { client_id } = req.query;

    if (!client_id) {
      return res.status(400).json({ error: 'client_id is required' });
    }

    const status = await syncService.getSyncStatus(client_id as string);
    res.json(status);
  } catch (error) {
    logger.error('Get sync status error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

/**
 * POST /inspection/sync/resolve-conflict
 * Resolve a sync conflict
 */
router.post('/resolve-conflict', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { conflict_id, resolution, merged_data } = req.body;

    if (!conflict_id || !resolution) {
      return res.status(400).json({ error: 'conflict_id and resolution are required' });
    }

    const validResolutions = ['server_wins', 'client_wins', 'merge'];
    if (!validResolutions.includes(resolution)) {
      return res.status(400).json({ error: `Invalid resolution. Must be one of: ${validResolutions.join(', ')}` });
    }

    if (resolution === 'merge' && !merged_data) {
      return res.status(400).json({ error: 'merged_data is required for merge resolution' });
    }

    const result = await syncService.resolveConflict(conflict_id, resolution, merged_data);
    res.json(result);
  } catch (error) {
    logger.error('Resolve conflict error:', error);
    res.status(500).json({ error: 'Failed to resolve conflict' });
  }
});

/**
 * GET /inspection/sync/pending
 * Get pending sync items for a client
 */
router.get('/pending', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { client_id } = req.query;

    if (!client_id) {
      return res.status(400).json({ error: 'client_id is required' });
    }

    const pending = await syncService.getPendingSyncItems(client_id as string);
    res.json(pending);
  } catch (error) {
    logger.error('Get pending sync error:', error);
    res.status(500).json({ error: 'Failed to get pending sync items' });
  }
});

/**
 * DELETE /inspection/sync/queue/:id
 * Remove an item from the sync queue
 */
router.delete('/queue/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await syncService.removeSyncQueueItem(id);
    res.json({ message: 'Sync queue item removed successfully' });
  } catch (error) {
    logger.error('Remove sync queue item error:', error);
    res.status(500).json({ error: 'Failed to remove sync queue item' });
  }
});

export default router;
