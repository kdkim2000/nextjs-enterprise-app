/**
 * Swagger Configuration for Admin Service
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Admin Service API',
    version: '1.0.0',
    description: `
# Admin Service API

사용자, 역할, 메뉴, 부서, 프로그램 관리 API를 제공합니다.

## Features
- 사용자 관리 (CRUD)
- 역할 관리 (RBAC)
- 메뉴 관리
- 부서 관리
- 프로그램 관리
- 권한 매핑 (User-Role, Role-Program)
    `,
  },
  servers: [
    { url: 'http://localhost:3012', description: 'Development' },
    { url: 'https://api.example.com/admin', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          loginid: { type: 'string' },
          email: { type: 'string' },
          name_ko: { type: 'string' },
          name_en: { type: 'string' },
          department: { type: 'string' },
          position: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'locked'] },
        },
      },
      Role: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          display_name: { type: 'string' },
          description: { type: 'string' },
          is_active: { type: 'boolean' },
        },
      },
      Menu: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          name_en: { type: 'string' },
          name_ko: { type: 'string' },
          path: { type: 'string' },
          icon: { type: 'string' },
          parent_id: { type: 'string', nullable: true },
          order_num: { type: 'integer' },
        },
      },
      Department: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          name_en: { type: 'string' },
          name_ko: { type: 'string' },
          parent_id: { type: 'string', nullable: true },
          level: { type: 'integer' },
        },
      },
      Program: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          name_en: { type: 'string' },
          name_ko: { type: 'string' },
          path: { type: 'string' },
          status: { type: 'string' },
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
    { name: 'Users', description: '사용자 관리' },
    { name: 'Roles', description: '역할 관리' },
    { name: 'Menus', description: '메뉴 관리' },
    { name: 'Departments', description: '부서 관리' },
    { name: 'Programs', description: '프로그램 관리' },
    { name: 'User-Role Mappings', description: '사용자-역할 매핑' },
    { name: 'Role-Program Mappings', description: '역할-프로그램 매핑' },
  ],
  paths: {
    '/admin/users': {
      get: {
        tags: ['Users'],
        summary: '사용자 목록 조회',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive', 'locked'] } },
        ],
        responses: {
          '200': {
            description: '사용자 목록',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: '사용자 생성',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
        },
        responses: { '201': { description: '생성됨' } },
      },
    },
    '/admin/users/{id}': {
      get: {
        tags: ['Users'],
        summary: '사용자 상세 조회',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: '사용자 정보' } },
      },
      put: {
        tags: ['Users'],
        summary: '사용자 수정',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: '수정됨' } },
      },
      delete: {
        tags: ['Users'],
        summary: '사용자 삭제',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: '삭제됨' } },
      },
    },
    '/admin/roles': {
      get: {
        tags: ['Roles'],
        summary: '역할 목록 조회',
        responses: {
          '200': {
            description: '역할 목록',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Role' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Roles'],
        summary: '역할 생성',
        responses: { '201': { description: '생성됨' } },
      },
    },
    '/admin/roles/{id}': {
      get: { tags: ['Roles'], summary: '역할 상세 조회', responses: { '200': { description: '역할 정보' } } },
      put: { tags: ['Roles'], summary: '역할 수정', responses: { '200': { description: '수정됨' } } },
      delete: { tags: ['Roles'], summary: '역할 삭제', responses: { '200': { description: '삭제됨' } } },
    },
    '/admin/menus': {
      get: {
        tags: ['Menus'],
        summary: '메뉴 목록 조회',
        responses: { '200': { description: '메뉴 목록' } },
      },
      post: { tags: ['Menus'], summary: '메뉴 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/admin/menus/tree': {
      get: { tags: ['Menus'], summary: '메뉴 트리 조회', responses: { '200': { description: '메뉴 트리' } } },
    },
    '/admin/departments': {
      get: { tags: ['Departments'], summary: '부서 목록 조회', responses: { '200': { description: '부서 목록' } } },
      post: { tags: ['Departments'], summary: '부서 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/admin/departments/tree': {
      get: { tags: ['Departments'], summary: '부서 트리 조회', responses: { '200': { description: '부서 트리' } } },
    },
    '/admin/programs': {
      get: { tags: ['Programs'], summary: '프로그램 목록 조회', responses: { '200': { description: '프로그램 목록' } } },
      post: { tags: ['Programs'], summary: '프로그램 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/admin/user-role-mappings': {
      get: { tags: ['User-Role Mappings'], summary: '사용자-역할 매핑 조회', responses: { '200': { description: '매핑 목록' } } },
      post: { tags: ['User-Role Mappings'], summary: '매핑 생성', responses: { '201': { description: '생성됨' } } },
    },
    '/admin/role-program-mappings': {
      get: { tags: ['Role-Program Mappings'], summary: '역할-프로그램 매핑 조회', responses: { '200': { description: '매핑 목록' } } },
      post: { tags: ['Role-Program Mappings'], summary: '매핑 생성', responses: { '201': { description: '생성됨' } } },
    },
  },
};

export default swaggerSpec;
