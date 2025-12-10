/**
 * Swagger Configuration for Communication Service
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Communication Service API',
    version: '1.0.0',
    description: `
# Communication Service API

메일, 메시지, 대화 관리 API를 제공합니다.

## Features
- 내부 메일 시스템
- 실시간 메시지
- 대화 관리
    `,
  },
  servers: [
    { url: 'http://localhost:3014', description: 'Development' },
    { url: 'https://api.example.com/communication', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Mail: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          from_user_id: { type: 'string' },
          to_user_ids: { type: 'array', items: { type: 'string' } },
          subject: { type: 'string' },
          content: { type: 'string' },
          is_read: { type: 'boolean' },
          sent_at: { type: 'string', format: 'date-time' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          conversation_id: { type: 'string' },
          sender_id: { type: 'string' },
          content: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          participants: { type: 'array', items: { type: 'string' } },
          last_message_at: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Mail', description: '메일 관리' },
    { name: 'Messages', description: '메시지 관리' },
    { name: 'Conversations', description: '대화 관리' },
  ],
  paths: {
    '/communication/mail': {
      get: {
        tags: ['Mail'],
        summary: '메일 목록 조회',
        parameters: [
          { name: 'folder', in: 'query', schema: { type: 'string', enum: ['inbox', 'sent', 'draft', 'trash'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: '메일 목록' } },
      },
      post: { tags: ['Mail'], summary: '메일 발송', responses: { '201': { description: '발송됨' } } },
    },
    '/communication/mail/{id}': {
      get: { tags: ['Mail'], summary: '메일 상세 조회', responses: { '200': { description: '메일 정보' } } },
      delete: { tags: ['Mail'], summary: '메일 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/communication/mail/{id}/read': {
      patch: { tags: ['Mail'], summary: '읽음 처리', responses: { '200': { description: '읽음 처리됨' } } },
    },
    '/communication/messages': {
      get: { tags: ['Messages'], summary: '메시지 목록 조회', responses: { '200': { description: '메시지 목록' } } },
      post: { tags: ['Messages'], summary: '메시지 전송', responses: { '201': { description: '전송됨' } } },
    },
    '/communication/conversations': {
      get: { tags: ['Conversations'], summary: '대화 목록 조회', responses: { '200': { description: '대화 목록' } } },
      post: { tags: ['Conversations'], summary: '대화 시작', responses: { '201': { description: '생성됨' } } },
    },
    '/communication/conversations/{id}': {
      get: { tags: ['Conversations'], summary: '대화 상세 조회', responses: { '200': { description: '대화 정보' } } },
    },
    '/communication/conversations/{id}/messages': {
      get: { tags: ['Conversations'], summary: '대화 내 메시지 조회', responses: { '200': { description: '메시지 목록' } } },
    },
  },
};

export default swaggerSpec;
