/**
 * Conversation Service
 * Claude Code 대화 조회 서비스 (읽기 전용)
 */

const db = require('../config/database');

const conversationService = {
  /**
   * 대화 목록 조회 (페이지네이션, 필터, 검색)
   */
  async getConversations(options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      difficulty,
      branch,
      dateFrom,
      dateTo,
      search,
      tag,
      sortBy = 'started_at',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;

    // WHERE 조건 구성
    const conditions = ['1=1'];

    if (category) {
      conditions.push(`c.category = $${paramIndex++}`);
      params.push(category);
    }

    if (difficulty) {
      conditions.push(`c.difficulty_level = $${paramIndex++}`);
      params.push(difficulty);
    }

    if (branch) {
      conditions.push(`c.branch_name = $${paramIndex++}`);
      params.push(branch);
    }

    if (dateFrom) {
      conditions.push(`c.started_at >= $${paramIndex++}`);
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push(`c.started_at <= $${paramIndex++}`);
      params.push(dateTo + ' 23:59:59');
    }

    if (search) {
      conditions.push(`(
        c.title ILIKE $${paramIndex} OR
        EXISTS (
          SELECT 1 FROM conversation_messages cm
          WHERE cm.conversation_id = c.id AND cm.content ILIKE $${paramIndex}
        )
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (tag) {
      conditions.push(`EXISTS (
        SELECT 1 FROM conversation_tag_mappings ctm
        WHERE ctm.conversation_id = c.id AND ctm.tag_id = $${paramIndex++}
      )`);
      params.push(tag);
    }

    const whereClause = conditions.join(' AND ');

    // 정렬 유효성 검사
    const validSortColumns = ['started_at', 'total_messages', 'duration_minutes', 'title', 'category'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'started_at';
    const sortDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM conversations c
      WHERE ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // 데이터 조회
    const dataQuery = `
      SELECT
        c.id,
        c.title,
        c.category,
        c.difficulty_level,
        c.branch_name,
        c.total_messages,
        c.duration_minutes,
        c.status,
        c.started_at,
        c.ended_at,
        c.created_at,
        (
          SELECT array_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
          FROM conversation_tag_mappings ctm
          JOIN conversation_tags t ON t.id = ctm.tag_id
          WHERE ctm.conversation_id = c.id
        ) as tags
      FROM conversations c
      WHERE ${whereClause}
      ORDER BY c.${sortColumn} ${sortDir}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query(dataQuery, dataParams);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * 대화 상세 조회 (메시지 포함)
   */
  async getConversationById(id) {
    // 대화 정보 조회
    const conversationQuery = `
      SELECT
        c.*,
        (
          SELECT array_agg(json_build_object('id', t.id, 'name', t.name, 'name_ko', t.name_ko, 'color', t.color))
          FROM conversation_tag_mappings ctm
          JOIN conversation_tags t ON t.id = ctm.tag_id
          WHERE ctm.conversation_id = c.id
        ) as tags
      FROM conversations c
      WHERE c.id = $1
    `;
    const conversationResult = await db.query(conversationQuery, [id]);

    if (conversationResult.rows.length === 0) {
      return null;
    }

    const conversation = conversationResult.rows[0];

    // 메시지 조회
    const messagesQuery = `
      SELECT
        id,
        role,
        content,
        content_type,
        has_code,
        has_error,
        tool_calls,
        "order",
        created_at
      FROM conversation_messages
      WHERE conversation_id = $1
      ORDER BY "order" ASC
    `;
    const messagesResult = await db.query(messagesQuery, [id]);

    // 코드 변경사항 조회
    const codeChangesQuery = `
      SELECT
        id,
        file_path,
        file_name,
        change_type,
        language,
        lines_added,
        lines_removed,
        explanation,
        created_at
      FROM conversation_code_changes
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `;
    const codeChangesResult = await db.query(codeChangesQuery, [id]);

    return {
      conversation,
      messages: messagesResult.rows,
      codeChanges: codeChangesResult.rows
    };
  },

  /**
   * 통계 조회
   */
  async getStats() {
    // 기본 통계
    const basicStatsQuery = `
      SELECT
        COUNT(*) as total,
        COALESCE(AVG(duration_minutes), 0) as avg_duration,
        COALESCE(AVG(total_messages), 0) as avg_messages,
        COALESCE(SUM(total_messages), 0) as total_messages
      FROM conversations
    `;
    const basicStats = await db.query(basicStatsQuery);

    // 카테고리별 통계
    const categoryStatsQuery = `
      SELECT category, COUNT(*) as count
      FROM conversations
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;
    const categoryStats = await db.query(categoryStatsQuery);

    // 난이도별 통계
    const difficultyStatsQuery = `
      SELECT difficulty_level, COUNT(*) as count
      FROM conversations
      WHERE difficulty_level IS NOT NULL
      GROUP BY difficulty_level
      ORDER BY
        CASE difficulty_level
          WHEN 'easy' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'hard' THEN 3
        END
    `;
    const difficultyStats = await db.query(difficultyStatsQuery);

    // 월별 통계
    const monthlyStatsQuery = `
      SELECT
        TO_CHAR(started_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM conversations
      WHERE started_at IS NOT NULL
      GROUP BY TO_CHAR(started_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;
    const monthlyStats = await db.query(monthlyStatsQuery);

    // 브랜치별 통계
    const branchStatsQuery = `
      SELECT branch_name, COUNT(*) as count
      FROM conversations
      WHERE branch_name IS NOT NULL AND branch_name != 'unknown'
      GROUP BY branch_name
      ORDER BY count DESC
      LIMIT 10
    `;
    const branchStats = await db.query(branchStatsQuery);

    return {
      total: parseInt(basicStats.rows[0].total, 10),
      avgDuration: Math.round(parseFloat(basicStats.rows[0].avg_duration)),
      avgMessages: Math.round(parseFloat(basicStats.rows[0].avg_messages)),
      totalMessages: parseInt(basicStats.rows[0].total_messages, 10),
      byCategory: categoryStats.rows.reduce((acc, row) => {
        acc[row.category] = parseInt(row.count, 10);
        return acc;
      }, {}),
      byDifficulty: difficultyStats.rows.reduce((acc, row) => {
        acc[row.difficulty_level] = parseInt(row.count, 10);
        return acc;
      }, {}),
      byMonth: monthlyStats.rows.reduce((acc, row) => {
        acc[row.month] = parseInt(row.count, 10);
        return acc;
      }, {}),
      byBranch: branchStats.rows.reduce((acc, row) => {
        acc[row.branch_name] = parseInt(row.count, 10);
        return acc;
      }, {})
    };
  },

  /**
   * 태그 목록 조회
   */
  async getTags() {
    const query = `
      SELECT
        t.id,
        t.name,
        t.name_ko,
        t.description,
        t.color,
        t.category,
        t.usage_count
      FROM conversation_tags t
      ORDER BY t.usage_count DESC, t.name ASC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  /**
   * 전문 검색
   */
  async search(query, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // PostgreSQL Full-Text Search 사용
    const searchQuery = `
      WITH search_results AS (
        SELECT DISTINCT c.id,
          c.title,
          c.category,
          c.difficulty_level,
          c.branch_name,
          c.total_messages,
          c.started_at,
          ts_rank(
            to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.summary, '')),
            plainto_tsquery('english', $1)
          ) as rank
        FROM conversations c
        LEFT JOIN conversation_messages cm ON cm.conversation_id = c.id
        WHERE
          to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.summary, '')) @@ plainto_tsquery('english', $1)
          OR c.title ILIKE $2
          OR cm.content ILIKE $2
      )
      SELECT * FROM search_results
      ORDER BY rank DESC, started_at DESC
      LIMIT $3 OFFSET $4
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM conversations c
      LEFT JOIN conversation_messages cm ON cm.conversation_id = c.id
      WHERE
        to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.summary, '')) @@ plainto_tsquery('english', $1)
        OR c.title ILIKE $2
        OR cm.content ILIKE $2
    `;

    const searchPattern = `%${query}%`;

    const [dataResult, countResult] = await Promise.all([
      db.query(searchQuery, [query, searchPattern, limit, offset]),
      db.query(countQuery, [query, searchPattern])
    ]);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total, 10),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total, 10) / limit)
      }
    };
  },

  /**
   * 필터 옵션 조회 (카테고리, 난이도, 브랜치 목록)
   */
  async getFilterOptions() {
    const categoriesQuery = `
      SELECT DISTINCT category
      FROM conversations
      WHERE category IS NOT NULL
      ORDER BY category
    `;

    const difficultiesQuery = `
      SELECT difficulty_level
      FROM (
        SELECT DISTINCT difficulty_level
        FROM conversations
        WHERE difficulty_level IS NOT NULL
      ) sub
      ORDER BY
        CASE difficulty_level
          WHEN 'easy' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'hard' THEN 3
        END
    `;

    const branchesQuery = `
      SELECT DISTINCT branch_name
      FROM conversations
      WHERE branch_name IS NOT NULL AND branch_name != 'unknown'
      ORDER BY branch_name
    `;

    const [categories, difficulties, branches] = await Promise.all([
      db.query(categoriesQuery),
      db.query(difficultiesQuery),
      db.query(branchesQuery)
    ]);

    return {
      categories: categories.rows.map(r => r.category),
      difficulties: difficulties.rows.map(r => r.difficulty_level),
      branches: branches.rows.map(r => r.branch_name)
    };
  }
};

module.exports = conversationService;
