/**
 * Conversation Routes
 * Claude Code 대화 조회 API (읽기 전용)
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import * as conversationService from '../services/conversationService';

const router = Router();
const logger = getLogger('app-service:communication:conversation-routes');

/**
 * GET /conversations - 대화 목록 조회
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page,
      limit,
      category,
      difficulty,
      branch,
      dateFrom,
      dateTo,
      search,
      tag,
      sortBy,
      sortOrder
    } = req.query;

    const result = await conversationService.getConversations({
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 20,
      category: category as string,
      difficulty: difficulty as string,
      branch: branch as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      search: search as string,
      tag: tag as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /conversations/stats - 통계 조회
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await conversationService.getStats();
    res.json(stats);
  } catch (error: any) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /conversations/tags - 태그 목록 조회
 */
router.get('/tags', async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await conversationService.getTags();
    res.json(tags);
  } catch (error: any) {
    logger.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

/**
 * GET /conversations/filters - 필터 옵션 조회
 */
router.get('/filters', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = await conversationService.getFilterOptions();
    res.json(filters);
  } catch (error: any) {
    logger.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

/**
 * GET /conversations/search - 전문 검색
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, page, limit } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const result = await conversationService.search(q as string, {
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 20
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Error searching conversations:', error);
    res.status(500).json({ error: 'Failed to search conversations' });
  }
});

/**
 * DELETE /conversations/batch - 여러 대화 일괄 삭제
 */
router.delete('/batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array is required' });
      return;
    }

    const result = await conversationService.deleteConversations(ids);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json(result);
  } catch (error: any) {
    logger.error('Error deleting conversations:', error);
    res.status(500).json({ error: 'Failed to delete conversations' });
  }
});

/**
 * GET /conversations/:id - 대화 상세 조회
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await conversationService.getConversationById(id);

    if (!result) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(result);
  } catch (error: any) {
    logger.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

/**
 * DELETE /conversations/:id - 대화 삭제
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await conversationService.deleteConversation(id);

    if (!result.success) {
      res.status(404).json({ error: result.error });
      return;
    }

    res.json(result);
  } catch (error: any) {
    logger.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
