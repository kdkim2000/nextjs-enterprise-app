/**
 * Swagger Configuration for Content Service
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Content Service API',
    version: '1.0.0',
    description: `
# Content Service API

게시판, 게시글, 댓글, QnA, 도움말 관리 API를 제공합니다.

## Features
- 게시판 타입 관리
- 게시글 CRUD
- 댓글 관리
- QnA 관리
- 도움말 관리
    `,
  },
  servers: [
    { url: 'http://localhost:3013', description: 'Development' },
    { url: 'https://api.example.com/content', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
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
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Board Types', description: '게시판 타입 관리' },
    { name: 'Posts', description: '게시글 관리' },
    { name: 'Comments', description: '댓글 관리' },
    { name: 'QnA', description: 'QnA 관리' },
    { name: 'Help', description: '도움말 관리' },
  ],
  paths: {
    '/content/board-types': {
      get: { tags: ['Board Types'], summary: '게시판 타입 목록 조회', responses: { '200': { description: '게시판 타입 목록' } } },
      post: { tags: ['Board Types'], summary: '게시판 타입 생성', responses: { '201': { description: '생성됨' } } },
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
      get: { tags: ['Comments'], summary: '댓글 목록 조회', responses: { '200': { description: '댓글 목록' } } },
      post: { tags: ['Comments'], summary: '댓글 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/content/qna': {
      get: { tags: ['QnA'], summary: 'QnA 목록 조회', responses: { '200': { description: 'QnA 목록' } } },
      post: { tags: ['QnA'], summary: 'QnA 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/content/help': {
      get: { tags: ['Help'], summary: '도움말 목록 조회', responses: { '200': { description: '도움말 목록' } } },
      post: { tags: ['Help'], summary: '도움말 생성', responses: { '201': { description: '생성됨' } } },
    },
  },
};

export default swaggerSpec;
