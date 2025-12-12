/**
 * Swagger Configuration for App Service
 * Content + Communication 통합 API 문서
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'App Service API',
    version: '1.0.0',
    description: `
# App Service API

Content와 Communication 모듈을 통합한 애플리케이션 서비스 API입니다.

## Modules

### Content Module
- 게시판 타입 관리 (Board Types)
- 게시글 CRUD (Posts)
- 댓글 관리 (Comments)
- QnA 관리
- 도움말 관리 (Help)

### Communication Module
- 내부 메일 시스템 (Mail)
- 시스템 메시지 (Messages)
- 대화 관리 (Conversations)
    `,
  },
  servers: [
    { url: 'http://localhost:3012', description: 'Development' },
    { url: 'https://api.example.com', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      // Content Schemas
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          board_type_id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          author_id: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          view_count: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          post_id: { type: 'string' },
          content: { type: 'string' },
          author_id: { type: 'string' },
          parent_id: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      BoardType: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          name_en: { type: 'string' },
          name_ko: { type: 'string' },
          description: { type: 'string' },
          is_active: { type: 'boolean' },
        },
      },
      Help: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          program_id: { type: 'string' },
          language: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      // Communication Schemas
      Mail: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sender_id: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
          is_draft: { type: 'boolean' },
          sent_at: { type: 'string', format: 'date-time' },
        },
      },
      SystemMessage: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          category: { type: 'string' },
          type: { type: 'string' },
          message: {
            type: 'object',
            properties: {
              en: { type: 'string' },
              ko: { type: 'string' },
              zh: { type: 'string' },
              vi: { type: 'string' },
            },
          },
          status: { type: 'string' },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          category: { type: 'string' },
          total_messages: { type: 'integer' },
          started_at: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    // Content Tags
    { name: 'Board Types', description: '게시판 타입 관리' },
    { name: 'Posts', description: '게시글 관리' },
    { name: 'Comments', description: '댓글 관리' },
    { name: 'QnA', description: 'QnA 관리' },
    { name: 'Help', description: '도움말 관리' },
    // Communication Tags
    { name: 'Mail', description: '메일 관리' },
    { name: 'System Messages', description: '시스템 메시지 관리' },
    { name: 'Conversations', description: '대화 관리' },
  ],
  paths: {
    // ==================== Content Module Paths ====================
    '/content/board-types': {
      get: {
        tags: ['Board Types'],
        summary: '게시판 타입 목록 조회',
        responses: { '200': { description: '게시판 타입 목록' } }
      },
      post: {
        tags: ['Board Types'],
        summary: '게시판 타입 생성',
        responses: { '201': { description: '생성됨' } }
      },
    },
    '/content/board-types/{id}': {
      get: {
        tags: ['Board Types'],
        summary: '게시판 타입 상세 조회',
        responses: { '200': { description: '게시판 타입 정보' } }
      },
      put: {
        tags: ['Board Types'],
        summary: '게시판 타입 수정',
        responses: { '200': { description: '수정됨' } }
      },
      delete: {
        tags: ['Board Types'],
        summary: '게시판 타입 삭제',
        responses: { '200': { description: '삭제됨' } }
      },
    },
    '/content/posts': {
      get: {
        tags: ['Posts'],
        summary: '게시글 목록 조회',
        parameters: [
          { name: 'boardTypeId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: '게시글 목록' } },
      },
      post: { tags: ['Posts'], summary: '게시글 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/content/posts/{id}': {
      get: { tags: ['Posts'], summary: '게시글 상세 조회', responses: { '200': { description: '게시글 정보' } } },
      put: { tags: ['Posts'], summary: '게시글 수정', responses: { '200': { description: '수정됨' } } },
      delete: { tags: ['Posts'], summary: '게시글 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/content/comments': {
      get: {
        tags: ['Comments'],
        summary: '댓글 목록 조회',
        parameters: [
          { name: 'postId', in: 'query', schema: { type: 'string' }, required: true },
        ],
        responses: { '200': { description: '댓글 목록' } }
      },
      post: { tags: ['Comments'], summary: '댓글 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/content/comments/{id}': {
      put: { tags: ['Comments'], summary: '댓글 수정', responses: { '200': { description: '수정됨' } } },
      delete: { tags: ['Comments'], summary: '댓글 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/content/qna': {
      get: { tags: ['QnA'], summary: 'QnA 목록 조회', responses: { '200': { description: 'QnA 목록' } } },
      post: { tags: ['QnA'], summary: 'QnA 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/content/qna/{id}': {
      get: { tags: ['QnA'], summary: 'QnA 상세 조회', responses: { '200': { description: 'QnA 정보' } } },
      put: { tags: ['QnA'], summary: 'QnA 수정', responses: { '200': { description: '수정됨' } } },
      delete: { tags: ['QnA'], summary: 'QnA 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/content/help': {
      get: {
        tags: ['Help'],
        summary: '도움말 목록/단일 조회',
        parameters: [
          { name: 'programId', in: 'query', schema: { type: 'string' }, description: '프로그램 ID로 단일 조회' },
          { name: 'language', in: 'query', schema: { type: 'string' }, description: '언어 코드' },
        ],
        responses: { '200': { description: '도움말 목록 또는 단일 도움말' } }
      },
      post: { tags: ['Help'], summary: '도움말 생성', responses: { '201': { description: '생성됨' } } },
      put: { tags: ['Help'], summary: '도움말 수정 (body.id 사용)', responses: { '200': { description: '수정됨' } } },
      delete: {
        tags: ['Help'],
        summary: '도움말 삭제 (query.id 사용)',
        parameters: [
          { name: 'id', in: 'query', schema: { type: 'string' }, required: true },
        ],
        responses: { '200': { description: '삭제됨' } }
      },
    },
    '/content/help/{id}': {
      get: { tags: ['Help'], summary: '도움말 상세 조회', responses: { '200': { description: '도움말 정보' } } },
      put: { tags: ['Help'], summary: '도움말 수정', responses: { '200': { description: '수정됨' } } },
      delete: { tags: ['Help'], summary: '도움말 삭제', responses: { '200': { description: '삭제됨' } } },
    },

    // ==================== Communication Module Paths ====================
    '/comm/mail/messages': {
      get: {
        tags: ['Mail'],
        summary: '메일 목록 조회',
        parameters: [
          { name: 'folder', in: 'query', schema: { type: 'string', enum: ['inbox', 'sent', 'draft', 'trash'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: '메일 목록' } },
      },
    },
    '/comm/mail/messages/{id}': {
      get: { tags: ['Mail'], summary: '메일 상세 조회', responses: { '200': { description: '메일 정보' } } },
      delete: { tags: ['Mail'], summary: '메일 영구 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/comm/mail/draft': {
      post: { tags: ['Mail'], summary: '임시저장 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/comm/mail/draft/{id}': {
      put: { tags: ['Mail'], summary: '임시저장 수정', responses: { '200': { description: '수정됨' } } },
      delete: { tags: ['Mail'], summary: '임시저장 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/comm/mail/send': {
      post: { tags: ['Mail'], summary: '메일 발송', responses: { '200': { description: '발송됨' } } },
    },
    '/comm/mail/counts': {
      get: { tags: ['Mail'], summary: '폴더별 메일 수 조회', responses: { '200': { description: '폴더별 카운트' } } },
    },
    '/comm/mail/bulk': {
      post: { tags: ['Mail'], summary: '메일 일괄 작업', responses: { '200': { description: '완료' } } },
    },
    '/comm/messages': {
      get: {
        tags: ['System Messages'],
        summary: '시스템 메시지 목록 조회',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: '메시지 목록' } }
      },
      post: { tags: ['System Messages'], summary: '시스템 메시지 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/comm/messages/category/{category}': {
      get: { tags: ['System Messages'], summary: '카테고리별 메시지 조회', responses: { '200': { description: '메시지 목록' } } },
    },
    '/comm/messages/code/{code}': {
      get: { tags: ['System Messages'], summary: '코드로 메시지 조회', responses: { '200': { description: '메시지 정보' } } },
    },
    '/comm/messages/{id}': {
      get: { tags: ['System Messages'], summary: '메시지 상세 조회', responses: { '200': { description: '메시지 정보' } } },
      put: { tags: ['System Messages'], summary: '메시지 수정', responses: { '200': { description: '수정됨' } } },
      delete: { tags: ['System Messages'], summary: '메시지 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/comm/conversations': {
      get: {
        tags: ['Conversations'],
        summary: '대화 목록 조회',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'difficulty', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: '대화 목록' } },
      },
    },
    '/comm/conversations/stats': {
      get: { tags: ['Conversations'], summary: '대화 통계 조회', responses: { '200': { description: '통계 정보' } } },
    },
    '/comm/conversations/tags': {
      get: { tags: ['Conversations'], summary: '태그 목록 조회', responses: { '200': { description: '태그 목록' } } },
    },
    '/comm/conversations/filters': {
      get: { tags: ['Conversations'], summary: '필터 옵션 조회', responses: { '200': { description: '필터 옵션' } } },
    },
    '/comm/conversations/search': {
      get: {
        tags: ['Conversations'],
        summary: '대화 검색',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, required: true },
        ],
        responses: { '200': { description: '검색 결과' } }
      },
    },
    '/comm/conversations/batch': {
      delete: { tags: ['Conversations'], summary: '대화 일괄 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/comm/conversations/{id}': {
      get: { tags: ['Conversations'], summary: '대화 상세 조회', responses: { '200': { description: '대화 정보' } } },
      delete: { tags: ['Conversations'], summary: '대화 삭제', responses: { '200': { description: '삭제됨' } } },
    },
  },
};

export default swaggerSpec;
