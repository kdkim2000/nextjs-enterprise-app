/**
 * Swagger Configuration for Common Service
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Common Service API',
    version: '1.0.0',
    description: `
# Common Service API

공통 코드, 첨부파일, 로그, 설정, 대시보드 API를 제공합니다.

## Features
- 공통 코드 관리
- 첨부파일 업로드/다운로드
- 로그 조회 및 분석
- 앱 설정 관리
- 대시보드 통계
    `,
  },
  servers: [
    { url: 'http://localhost:3015', description: 'Development' },
    { url: 'https://api.example.com/common', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Code: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code_type_id: { type: 'string' },
          code: { type: 'string' },
          name_en: { type: 'string' },
          name_ko: { type: 'string' },
          order_num: { type: 'integer' },
          is_active: { type: 'boolean' },
        },
      },
      CodeType: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          name_en: { type: 'string' },
          name_ko: { type: 'string' },
          description: { type: 'string' },
        },
      },
      Attachment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          original_name: { type: 'string' },
          stored_name: { type: 'string' },
          mime_type: { type: 'string' },
          size: { type: 'integer' },
          path: { type: 'string' },
          uploaded_by: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Log: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          method: { type: 'string' },
          path: { type: 'string' },
          statusCode: { type: 'integer' },
          duration: { type: 'string' },
          userId: { type: 'string' },
          ip: { type: 'string' },
        },
      },
      LogAnalytics: {
        type: 'object',
        properties: {
          summary: {
            type: 'object',
            properties: {
              totalRequests: { type: 'integer' },
              errorRate: { type: 'string' },
              avgResponseTime: { type: 'string' },
              slowRequestCount: { type: 'integer' },
            },
          },
          methodStats: { type: 'object' },
          statusStats: { type: 'object' },
          topEndpoints: { type: 'array', items: { type: 'object' } },
          topUsers: { type: 'array', items: { type: 'object' } },
          timeSeriesData: { type: 'array', items: { type: 'object' } },
          recentErrors: { type: 'array', items: { type: 'object' } },
        },
      },
      AppSetting: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          value: { type: 'string' },
          value_ko: { type: 'string' },
          value_en: { type: 'string' },
          description: { type: 'string' },
          is_public: { type: 'boolean' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Codes', description: '공통 코드 관리' },
    { name: 'Code Types', description: '코드 타입 관리' },
    { name: 'Attachments', description: '첨부파일 관리' },
    { name: 'Attachment Types', description: '첨부파일 타입 관리' },
    { name: 'Logs', description: '로그 조회' },
    { name: 'Log Analytics', description: '로그 분석' },
    { name: 'App Settings', description: '앱 설정 관리' },
    { name: 'Dashboard', description: '대시보드' },
  ],
  paths: {
    '/common/codes': {
      get: { tags: ['Codes'], summary: '공통 코드 목록 조회', responses: { '200': { description: '코드 목록' } } },
      post: { tags: ['Codes'], summary: '공통 코드 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/common/code-types': {
      get: { tags: ['Code Types'], summary: '코드 타입 목록 조회', responses: { '200': { description: '코드 타입 목록' } } },
      post: { tags: ['Code Types'], summary: '코드 타입 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/common/attachments': {
      get: { tags: ['Attachments'], summary: '첨부파일 목록 조회', responses: { '200': { description: '첨부파일 목록' } } },
      post: {
        tags: ['Attachments'],
        summary: '파일 업로드',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                  attachmentTypeCode: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: '업로드됨' } },
      },
    },
    '/common/attachments/{id}': {
      get: { tags: ['Attachments'], summary: '첨부파일 상세 조회', responses: { '200': { description: '첨부파일 정보' } } },
      delete: { tags: ['Attachments'], summary: '첨부파일 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/common/attachments/{id}/download': {
      get: { tags: ['Attachments'], summary: '파일 다운로드', responses: { '200': { description: '파일 스트림' } } },
    },
    '/common/attachment-types': {
      get: { tags: ['Attachment Types'], summary: '첨부파일 타입 목록 조회', responses: { '200': { description: '타입 목록' } } },
    },
    '/common/logs': {
      get: {
        tags: ['Logs'],
        summary: '로그 목록 조회 (Admin)',
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'method', in: 'query', schema: { type: 'string' } },
          { name: 'statusCode', in: 'query', schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: { '200': { description: '로그 목록' } },
      },
    },
    '/common/logs/my-logs': {
      get: { tags: ['Logs'], summary: '내 활동 로그 조회', responses: { '200': { description: '로그 목록' } } },
    },
    '/common/logs/analytics': {
      get: { tags: ['Logs'], summary: '로그 분석 (기본)', responses: { '200': { description: '분석 결과' } } },
    },
    '/common/logs/errors': {
      get: { tags: ['Logs'], summary: '에러 로그 조회', responses: { '200': { description: '에러 로그' } } },
    },
    '/common/log-analytics': {
      get: {
        tags: ['Log Analytics'],
        summary: '상세 로그 분석 (Legacy 호환)',
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': {
            description: '상세 분석 결과',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LogAnalytics' },
              },
            },
          },
        },
      },
    },
    '/common/log-analytics/errors': {
      get: { tags: ['Log Analytics'], summary: '에러 로그 분석', responses: { '200': { description: '에러 로그' } } },
    },
    '/common/app-settings': {
      get: { tags: ['App Settings'], summary: '앱 설정 조회', responses: { '200': { description: '설정 목록' } } },
      post: { tags: ['App Settings'], summary: '앱 설정 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/common/app-settings/{key}': {
      get: { tags: ['App Settings'], summary: '설정 상세 조회', responses: { '200': { description: '설정 정보' } } },
      put: { tags: ['App Settings'], summary: '설정 수정', responses: { '200': { description: '수정됨' } } },
    },
    '/common/dashboard': {
      get: { tags: ['Dashboard'], summary: '대시보드 통계', responses: { '200': { description: '통계 데이터' } } },
    },
  },
};

export default swaggerSpec;
