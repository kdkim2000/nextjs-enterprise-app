/**
 * Swagger Configuration for Auth Service
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Service API',
    version: '1.0.0',
    description: `
# Authentication Service API

인증 및 사용자 설정 관련 API를 제공합니다.

## Features
- JWT 기반 인증 (Access/Refresh Token)
- 비밀번호 기반 로그인
- MFA (Multi-Factor Authentication) 지원
- 사용자 설정 관리

## Authentication
대부분의 엔드포인트는 인증이 필요합니다. Authorization 헤더에 JWT 토큰을 포함하세요:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`
    `,
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    { url: 'http://localhost:3011', description: 'Development' },
    { url: 'https://api.example.com/auth', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Authentication failed' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['loginid', 'password'],
        properties: {
          loginid: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          loginid: { type: 'string' },
          email: { type: 'string' },
          name_ko: { type: 'string' },
          name_en: { type: 'string' },
          role: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'locked'] },
        },
      },
      UserSettings: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          general: {
            type: 'object',
            properties: {
              language: { type: 'string', enum: ['en', 'ko', 'zh', 'vi'] },
              timezone: { type: 'string' },
              dateFormat: { type: 'string' },
              timeFormat: { type: 'string' },
            },
          },
          appearance: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] },
              fontSize: { type: 'string' },
              compactMode: { type: 'boolean' },
            },
          },
          notifications: {
            type: 'object',
            properties: {
              email: { type: 'boolean' },
              push: { type: 'boolean' },
              desktop: { type: 'boolean' },
              sound: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Authentication', description: '로그인/로그아웃' },
    { name: 'User Settings', description: '사용자 설정' },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: '로그인',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '401': {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: '로그아웃',
        responses: {
          '200': { description: '로그아웃 성공' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Access Token 갱신',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: '토큰 갱신 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: '현재 사용자 정보',
        responses: {
          '200': {
            description: '사용자 정보',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    },
    '/auth/user-settings': {
      get: {
        tags: ['User Settings'],
        summary: '현재 사용자 설정 조회',
        responses: {
          '200': {
            description: '사용자 설정',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    settings: { $ref: '#/components/schemas/UserSettings' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['User Settings'],
        summary: '사용자 설정 업데이트',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserSettings' },
            },
          },
        },
        responses: {
          '200': { description: '설정 업데이트 성공' },
        },
      },
    },
    '/auth/user-settings/{section}': {
      patch: {
        tags: ['User Settings'],
        summary: '특정 섹션 설정 업데이트',
        parameters: [
          {
            name: 'section',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['general', 'appearance', 'notifications', 'dataGrid', 'privacy', 'advanced'],
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: '설정 업데이트 성공' },
        },
      },
    },
    '/auth/user-settings/reset': {
      post: {
        tags: ['User Settings'],
        summary: '사용자 설정 초기화',
        responses: {
          '200': { description: '설정 초기화 성공' },
        },
      },
    },
  },
};

export default swaggerSpec;
