/**
 * Swagger/OpenAPI Configuration
 *
 * Installation Required:
 * npm install swagger-jsdoc swagger-ui-express
 * npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enterprise Application API',
      version: '1.0.0',
      description: `
# Enterprise Application REST API Documentation

This is a comprehensive REST API for the Enterprise Application.

## Features

- **Authentication**: JWT-based authentication with MFA support
- **Authorization**: Role-based access control (RBAC)
- **User Management**: Complete CRUD operations for users
- **Department Management**: Hierarchical department structure
- **Menu Management**: Dynamic menu system
- **File Upload**: Secure file upload with validation
- **Logging**: Comprehensive audit logging
- **Rate Limiting**: Protection against brute force attacks

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

To obtain a token, use the \`/api/auth/login\` endpoint.

## Error Handling

All errors follow a standard format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2025-11-21T10:30:00.000Z",
    "details": {}
  }
}
\`\`\`

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Login**: 5 attempts per 15 minutes
- **MFA**: 3 attempts per 5 minutes
- **File Upload**: 50 uploads per hour

## Pagination

List endpoints support pagination with the following query parameters:

- \`page\`: Page number (default: 1, max: 10000)
- \`limit\`: Items per page (default: 50, max: 1000)

Response format:
\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
\`\`\`

      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization token. Obtain from /api/auth/login',
        },
      },
      schemas: {
        // Common Schemas
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'AUTH_001',
                },
                message: {
                  type: 'string',
                  example: 'Authentication failed',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-11-21T10:30:00.000Z',
                },
                details: {
                  type: 'object',
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 50,
            },
            total: {
              type: 'integer',
              example: 1000,
            },
            totalPages: {
              type: 'integer',
              example: 20,
            },
          },
        },
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user-123',
            },
            loginid: {
              type: 'string',
              example: 'john_doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            name_ko: {
              type: 'string',
              example: '홍길동',
            },
            name_en: {
              type: 'string',
              example: 'John Doe',
            },
            employee_number: {
              type: 'string',
              example: 'EMP-001',
            },
            phone_number: {
              type: 'string',
              example: '010-1234-5678',
            },
            mobile_number: {
              type: 'string',
              example: '010-1234-5678',
            },
            user_category: {
              type: 'string',
              enum: ['admin', 'regular', 'guest', 'system'],
              example: 'regular',
            },
            position: {
              type: 'string',
              example: 'Software Engineer',
            },
            department: {
              type: 'string',
              example: 'DEPT-001',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'locked'],
              example: 'active',
            },
            mfa_enabled: {
              type: 'boolean',
              example: false,
            },
            last_login_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-21T10:30:00.000Z',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-21T10:30:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-21T10:30:00.000Z',
            },
          },
        },
        UserCreate: {
          type: 'object',
          required: ['loginid', 'email', 'password'],
          properties: {
            loginid: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              pattern: '^[a-zA-Z0-9_-]+$',
              example: 'john_doe',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 100,
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              maxLength: 100,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$',
              example: 'SecurePass123',
              description: 'Must contain at least one uppercase, one lowercase, and one number',
            },
            name_ko: {
              type: 'string',
              example: '홍길동',
            },
            name_en: {
              type: 'string',
              example: 'John Doe',
            },
            employee_number: {
              type: 'string',
              example: 'EMP-001',
            },
            phone_number: {
              type: 'string',
              example: '010-1234-5678',
            },
            mobile_number: {
              type: 'string',
              example: '010-1234-5678',
            },
            user_category: {
              type: 'string',
              enum: ['admin', 'regular', 'guest', 'system'],
              default: 'regular',
            },
            position: {
              type: 'string',
              example: 'Software Engineer',
            },
            department: {
              type: 'string',
              example: 'DEPT-001',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'locked'],
              default: 'active',
            },
            mfa_enabled: {
              type: 'boolean',
              default: false,
            },
          },
        },
        // Department Schema
        Department: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'dept-123',
            },
            code: {
              type: 'string',
              example: 'DEPT-001',
            },
            name_en: {
              type: 'string',
              example: 'Engineering',
            },
            name_ko: {
              type: 'string',
              example: '엔지니어링',
            },
            parent_id: {
              type: 'string',
              nullable: true,
              example: 'dept-100',
            },
            manager_id: {
              type: 'string',
              nullable: true,
              example: 'user-123',
            },
            level: {
              type: 'integer',
              example: 1,
            },
            order_num: {
              type: 'integer',
              example: 1,
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              example: 'active',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Menu Schema
        Menu: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'menu-123',
            },
            code: {
              type: 'string',
              example: 'MENU-001',
            },
            name_en: {
              type: 'string',
              example: 'Dashboard',
            },
            name_ko: {
              type: 'string',
              example: '대시보드',
            },
            parent_id: {
              type: 'string',
              nullable: true,
              example: null,
            },
            path: {
              type: 'string',
              example: '/dashboard',
            },
            icon: {
              type: 'string',
              example: 'DashboardIcon',
            },
            order_num: {
              type: 'integer',
              example: 1,
            },
            level: {
              type: 'integer',
              example: 1,
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              example: 'active',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Departments',
        description: 'Department management endpoints',
      },
      {
        name: 'Menus',
        description: 'Menu management endpoints',
      },
      {
        name: 'Roles',
        description: 'Role management endpoints',
      },
      {
        name: 'Files',
        description: 'File upload and management endpoints',
      },
      {
        name: 'Logs',
        description: 'Audit log endpoints',
      },
    ],
  },
  apis: [
    './routes/*.js',
    './routes/*.ts',
    './docs/swagger/*.yaml',
    './docs/swagger/*.yml',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
