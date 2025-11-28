/**
 * Conversation Routes
 * Claude Code 대화 조회 API (읽기 전용)
 */

const express = require('express');
const router = express.Router();
const conversationService = require('../services/conversationService');

/**
 * @swagger
 * /api/conversation:
 *   get:
 *     summary: 대화 목록 조회
 *     tags: [Conversation]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: 난이도 필터
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어
 */
router.get('/', async (req, res) => {
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
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      category,
      difficulty,
      branch,
      dateFrom,
      dateTo,
      search,
      tag,
      sortBy,
      sortOrder
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * @swagger
 * /api/conversation/stats:
 *   get:
 *     summary: 통계 조회
 *     tags: [Conversation]
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await conversationService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * @swagger
 * /api/conversation/tags:
 *   get:
 *     summary: 태그 목록 조회
 *     tags: [Conversation]
 */
router.get('/tags', async (req, res) => {
  try {
    const tags = await conversationService.getTags();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

/**
 * @swagger
 * /api/conversation/filters:
 *   get:
 *     summary: 필터 옵션 조회
 *     tags: [Conversation]
 */
router.get('/filters', async (req, res) => {
  try {
    const filters = await conversationService.getFilterOptions();
    res.json(filters);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

/**
 * @swagger
 * /api/conversation/search:
 *   get:
 *     summary: 전문 검색
 *     tags: [Conversation]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: 검색어
 */
router.get('/search', async (req, res) => {
  try {
    const { q, page, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await conversationService.search(q, {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20
    });

    res.json(result);
  } catch (error) {
    console.error('Error searching conversations:', error);
    res.status(500).json({ error: 'Failed to search conversations' });
  }
});

/**
 * @swagger
 * /api/conversation/{id}:
 *   get:
 *     summary: 대화 상세 조회
 *     tags: [Conversation]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 대화 ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await conversationService.getConversationById(id);

    if (!result) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

module.exports = router;
