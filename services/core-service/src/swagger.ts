/**
 * Core Service - Unified Swagger/OpenAPI Specification
 * Integrates Auth + Admin + Common modules
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Core Service API',
    version: '1.0.0',
    description: 'Unified Core Service API - Auth, Admin, Common modules integrated',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3011',
      description: 'Development server'
    },
    {
      url: '/api/core',
      description: 'Production server (via gateway)'
    }
  ],
  tags: [
    // Auth Module Tags
    { name: 'Auth', description: 'Authentication operations' },
    { name: 'User Settings', description: 'User settings management' },
    // Admin Module Tags
    { name: 'Users', description: 'User management' },
    { name: 'Roles', description: 'Role management' },
    { name: 'Menus', description: 'Menu management' },
    { name: 'Departments', description: 'Department management' },
    { name: 'Programs', description: 'Program management' },
    { name: 'User Role Mappings', description: 'User-Role mapping management' },
    { name: 'Role Program Mappings', description: 'Role-Program mapping management' },
    // Common Module Tags
    { name: 'Codes', description: 'Code management' },
    { name: 'Code Types', description: 'Code type management' },
    { name: 'Attachments', description: 'File attachment management' },
    { name: 'Attachment Types', description: 'Attachment type configuration' },
    { name: 'Logs', description: 'System log management' },
    { name: 'Log Analytics', description: 'Log analytics and reporting' },
    { name: 'App Settings', description: 'Application settings management' },
    { name: 'Dashboard', description: 'Dashboard and analytics' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      // Common Schemas
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'string' }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' }
        }
      },
      MultiLangField: {
        type: 'object',
        properties: {
          ko: { type: 'string' },
          en: { type: 'string' },
          zh: { type: 'string' },
          vi: { type: 'string' }
        }
      },

      // Auth Schemas
      LoginRequest: {
        type: 'object',
        required: ['loginId', 'password'],
        properties: {
          loginId: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'password123' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['loginId', 'password', 'name'],
        properties: {
          loginId: { type: 'string' },
          password: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' }
        }
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      MfaSetupResponse: {
        type: 'object',
        properties: {
          secret: { type: 'string' },
          qrCodeUrl: { type: 'string' }
        }
      },
      UserSettings: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          general: { type: 'object' },
          appearance: { type: 'object' },
          notifications: { type: 'object' },
          dataGrid: { type: 'object' },
          privacy: { type: 'object' },
          advanced: { type: 'object' }
        }
      },

      // Admin Schemas - User
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          loginid: { type: 'string' },
          name: { $ref: '#/components/schemas/MultiLangField' },
          email: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
          departmentId: { type: 'string', format: 'uuid' },
          department: { $ref: '#/components/schemas/Department' },
          mfaEnabled: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      UserCreate: {
        type: 'object',
        required: ['loginid', 'password', 'name_ko'],
        properties: {
          loginid: { type: 'string' },
          password: { type: 'string' },
          name_ko: { type: 'string' },
          name_en: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string' },
          status: { type: 'string' },
          departmentId: { type: 'string' }
        }
      },
      UserUpdate: {
        type: 'object',
        properties: {
          name_ko: { type: 'string' },
          name_en: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string' },
          status: { type: 'string' },
          departmentId: { type: 'string' }
        }
      },

      // Admin Schemas - Role
      Role: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          displayName: { $ref: '#/components/schemas/MultiLangField' },
          description: { $ref: '#/components/schemas/MultiLangField' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      RoleCreate: {
        type: 'object',
        required: ['name', 'display_name_ko'],
        properties: {
          name: { type: 'string' },
          display_name_ko: { type: 'string' },
          display_name_en: { type: 'string' },
          description_ko: { type: 'string' },
          description_en: { type: 'string' },
          is_active: { type: 'boolean' }
        }
      },

      // Admin Schemas - Menu
      Menu: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { $ref: '#/components/schemas/MultiLangField' },
          path: { type: 'string' },
          icon: { type: 'string' },
          parentId: { type: 'string', format: 'uuid' },
          sortOrder: { type: 'integer' },
          isActive: { type: 'boolean' },
          children: {
            type: 'array',
            items: { $ref: '#/components/schemas/Menu' }
          }
        }
      },
      MenuCreate: {
        type: 'object',
        required: ['name_ko', 'path'],
        properties: {
          name_ko: { type: 'string' },
          name_en: { type: 'string' },
          path: { type: 'string' },
          icon: { type: 'string' },
          parent_id: { type: 'string' },
          sort_order: { type: 'integer' },
          is_active: { type: 'boolean' }
        }
      },

      // Admin Schemas - Department
      Department: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          name: { $ref: '#/components/schemas/MultiLangField' },
          parentId: { type: 'string', format: 'uuid' },
          sortOrder: { type: 'integer' },
          isActive: { type: 'boolean' },
          children: {
            type: 'array',
            items: { $ref: '#/components/schemas/Department' }
          }
        }
      },
      DepartmentCreate: {
        type: 'object',
        required: ['code', 'name_ko'],
        properties: {
          code: { type: 'string' },
          name_ko: { type: 'string' },
          name_en: { type: 'string' },
          parent_id: { type: 'string' },
          sort_order: { type: 'integer' },
          is_active: { type: 'boolean' }
        }
      },

      // Admin Schemas - Program
      Program: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          name: { $ref: '#/components/schemas/MultiLangField' },
          description: { $ref: '#/components/schemas/MultiLangField' },
          url: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      ProgramCreate: {
        type: 'object',
        required: ['code', 'name_ko'],
        properties: {
          code: { type: 'string' },
          name_ko: { type: 'string' },
          name_en: { type: 'string' },
          description_ko: { type: 'string' },
          description_en: { type: 'string' },
          url: { type: 'string' },
          is_active: { type: 'boolean' }
        }
      },

      // Admin Schemas - Mappings
      UserRoleMapping: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          roleId: { type: 'string', format: 'uuid' },
          isActive: { type: 'boolean' },
          user: { $ref: '#/components/schemas/User' },
          role: { $ref: '#/components/schemas/Role' }
        }
      },
      RoleProgramMapping: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          roleId: { type: 'string', format: 'uuid' },
          programId: { type: 'string', format: 'uuid' },
          canCreate: { type: 'boolean' },
          canRead: { type: 'boolean' },
          canUpdate: { type: 'boolean' },
          canDelete: { type: 'boolean' },
          role: { $ref: '#/components/schemas/Role' },
          program: { $ref: '#/components/schemas/Program' }
        }
      },

      // Common Schemas - Code
      Code: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          typeId: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          name: { $ref: '#/components/schemas/MultiLangField' },
          description: { $ref: '#/components/schemas/MultiLangField' },
          sortOrder: { type: 'integer' },
          isActive: { type: 'boolean' }
        }
      },
      CodeType: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          name: { $ref: '#/components/schemas/MultiLangField' },
          description: { $ref: '#/components/schemas/MultiLangField' },
          isActive: { type: 'boolean' }
        }
      },

      // Common Schemas - Attachment
      Attachment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          referenceType: { type: 'string' },
          referenceId: { type: 'string' },
          files: {
            type: 'array',
            items: { $ref: '#/components/schemas/AttachmentFile' }
          }
        }
      },
      AttachmentFile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          originalName: { type: 'string' },
          storedName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'integer' },
          path: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      AttachmentType: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          name: { $ref: '#/components/schemas/MultiLangField' },
          maxFileCount: { type: 'integer' },
          maxFileSize: { type: 'integer' },
          maxTotalSize: { type: 'integer' },
          allowedExtensions: { type: 'array', items: { type: 'string' } },
          allowedMimeTypes: { type: 'array', items: { type: 'string' } },
          storagePath: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      },

      // Common Schemas - Log
      Log: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string' },
          action: { type: 'string' },
          method: { type: 'string' },
          path: { type: 'string' },
          statusCode: { type: 'integer' },
          requestBody: { type: 'object' },
          responseBody: { type: 'object' },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' },
          duration: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      LogAnalytics: {
        type: 'object',
        properties: {
          totalRequests: { type: 'integer' },
          errorRate: { type: 'number' },
          avgResponseTime: { type: 'number' },
          topEndpoints: { type: 'array', items: { type: 'object' } },
          statusDistribution: { type: 'object' },
          hourlyTrend: { type: 'array', items: { type: 'object' } }
        }
      },

      // Common Schemas - App Settings
      AppSetting: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          key: { type: 'string' },
          value: { type: 'string' },
          type: { type: 'string', enum: ['string', 'number', 'boolean', 'json'] },
          category: { type: 'string' },
          description: { type: 'string' },
          isReady: { type: 'boolean' },
          isApplied: { type: 'boolean' }
        }
      },

      // Common Schemas - Dashboard
      DashboardSummary: {
        type: 'object',
        properties: {
          totalUsers: { type: 'integer' },
          activeUsers: { type: 'integer' },
          totalRoles: { type: 'integer' },
          totalDepartments: { type: 'integer' },
          totalRequests: { type: 'integer' },
          errorCount: { type: 'integer' },
          avgResponseTime: { type: 'number' }
        }
      }
    }
  },
  paths: {
    // ==========================================
    // AUTH MODULE PATHS
    // ==========================================
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'User registration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation error' },
          409: { description: 'User already exists' }
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Token refreshed' },
          401: { description: 'Invalid refresh token' }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'User logout',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Logout successful' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user info',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User info',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      }
    },
    '/auth/mfa/setup': {
      post: {
        tags: ['Auth'],
        summary: 'Setup MFA for user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'MFA setup info',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MfaSetupResponse' }
              }
            }
          }
        }
      }
    },
    '/auth/mfa/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify MFA token',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'MFA verified' },
          400: { description: 'Invalid token' }
        }
      }
    },
    '/auth/user-settings': {
      get: {
        tags: ['User Settings'],
        summary: 'Get user settings',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User settings',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserSettings' }
              }
            }
          }
        }
      },
      put: {
        tags: ['User Settings'],
        summary: 'Update user settings',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserSettings' }
            }
          }
        },
        responses: {
          200: { description: 'Settings updated' }
        }
      }
    },

    // ==========================================
    // ADMIN MODULE PATHS - Users
    // ==========================================
    '/admin/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'User list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create new user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserCreate' }
            }
          }
        },
        responses: {
          201: { description: 'User created' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/admin/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'User details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          404: { description: 'User not found' }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserUpdate' }
            }
          }
        },
        responses: {
          200: { description: 'User updated' },
          404: { description: 'User not found' }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'User deleted' },
          404: { description: 'User not found' }
        }
      }
    },

    // ==========================================
    // ADMIN MODULE PATHS - Roles
    // ==========================================
    '/admin/roles': {
      get: {
        tags: ['Roles'],
        summary: 'List all roles',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Role list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Role' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Roles'],
        summary: 'Create new role',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RoleCreate' }
            }
          }
        },
        responses: {
          201: { description: 'Role created' }
        }
      }
    },
    '/admin/roles/{id}': {
      get: {
        tags: ['Roles'],
        summary: 'Get role by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Role details' },
          404: { description: 'Role not found' }
        }
      },
      put: {
        tags: ['Roles'],
        summary: 'Update role',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Role updated' }
        }
      },
      delete: {
        tags: ['Roles'],
        summary: 'Delete role',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Role deleted' }
        }
      }
    },

    // ==========================================
    // ADMIN MODULE PATHS - Menus
    // ==========================================
    '/admin/menus': {
      get: {
        tags: ['Menus'],
        summary: 'List all menus (tree structure)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Menu tree',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Menu' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Menus'],
        summary: 'Create new menu',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MenuCreate' }
            }
          }
        },
        responses: {
          201: { description: 'Menu created' }
        }
      }
    },
    '/admin/menus/{id}': {
      get: {
        tags: ['Menus'],
        summary: 'Get menu by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Menu details' }
        }
      },
      put: {
        tags: ['Menus'],
        summary: 'Update menu',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Menu updated' }
        }
      },
      delete: {
        tags: ['Menus'],
        summary: 'Delete menu',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Menu deleted' }
        }
      }
    },
    '/admin/menus/my-menus': {
      get: {
        tags: ['Menus'],
        summary: 'Get menus for current user based on roles',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User menu tree' }
        }
      }
    },

    // ==========================================
    // ADMIN MODULE PATHS - Departments
    // ==========================================
    '/admin/departments': {
      get: {
        tags: ['Departments'],
        summary: 'List all departments (tree structure)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Department tree',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Department' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Departments'],
        summary: 'Create new department',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DepartmentCreate' }
            }
          }
        },
        responses: {
          201: { description: 'Department created' }
        }
      }
    },
    '/admin/departments/{id}': {
      get: {
        tags: ['Departments'],
        summary: 'Get department by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Department details' }
        }
      },
      put: {
        tags: ['Departments'],
        summary: 'Update department',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Department updated' }
        }
      },
      delete: {
        tags: ['Departments'],
        summary: 'Delete department',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Department deleted' }
        }
      }
    },

    // ==========================================
    // ADMIN MODULE PATHS - Programs
    // ==========================================
    '/admin/programs': {
      get: {
        tags: ['Programs'],
        summary: 'List all programs',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Program list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Program' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Programs'],
        summary: 'Create new program',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProgramCreate' }
            }
          }
        },
        responses: {
          201: { description: 'Program created' }
        }
      }
    },
    '/admin/programs/{id}': {
      get: {
        tags: ['Programs'],
        summary: 'Get program by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Program details' }
        }
      },
      put: {
        tags: ['Programs'],
        summary: 'Update program',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Program updated' }
        }
      },
      delete: {
        tags: ['Programs'],
        summary: 'Delete program',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Program deleted' }
        }
      }
    },

    // ==========================================
    // ADMIN MODULE PATHS - User Role Mappings
    // ==========================================
    '/admin/user-role-mappings': {
      get: {
        tags: ['User Role Mappings'],
        summary: 'List all user-role mappings',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Mapping list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/UserRoleMapping' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['User Role Mappings'],
        summary: 'Create user-role mapping',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Mapping created' }
        }
      }
    },
    '/admin/user-role-mappings/user/{userId}': {
      get: {
        tags: ['User Role Mappings'],
        summary: 'Get roles for a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'User roles' }
        }
      }
    },

    // ==========================================
    // ADMIN MODULE PATHS - Role Program Mappings
    // ==========================================
    '/admin/role-program-mappings': {
      get: {
        tags: ['Role Program Mappings'],
        summary: 'List all role-program mappings',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Mapping list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/RoleProgramMapping' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Role Program Mappings'],
        summary: 'Create role-program mapping',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Mapping created' }
        }
      }
    },
    '/admin/role-program-mappings/role/{roleId}': {
      get: {
        tags: ['Role Program Mappings'],
        summary: 'Get programs for a role',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roleId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Role programs' }
        }
      }
    },

    // ==========================================
    // COMMON MODULE PATHS - Codes
    // ==========================================
    '/common/codes': {
      get: {
        tags: ['Codes'],
        summary: 'List codes',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'typeId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Code list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    codes: { type: 'array', items: { $ref: '#/components/schemas/Code' } },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Codes'],
        summary: 'Create new code',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Code created' }
        }
      }
    },
    '/common/codes/{id}': {
      get: {
        tags: ['Codes'],
        summary: 'Get code by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Code details' }
        }
      },
      put: {
        tags: ['Codes'],
        summary: 'Update code',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Code updated' }
        }
      },
      delete: {
        tags: ['Codes'],
        summary: 'Delete code',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Code deleted' }
        }
      }
    },

    // ==========================================
    // COMMON MODULE PATHS - Code Types
    // ==========================================
    '/common/code-types': {
      get: {
        tags: ['Code Types'],
        summary: 'List code types',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Code type list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/CodeType' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Code Types'],
        summary: 'Create code type',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Code type created' }
        }
      }
    },
    '/common/code-types/{id}': {
      get: {
        tags: ['Code Types'],
        summary: 'Get code type by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Code type details' }
        }
      },
      put: {
        tags: ['Code Types'],
        summary: 'Update code type',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Code type updated' }
        }
      },
      delete: {
        tags: ['Code Types'],
        summary: 'Delete code type (cascade deletes codes)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Code type deleted' }
        }
      }
    },

    // ==========================================
    // COMMON MODULE PATHS - Attachments
    // ==========================================
    '/common/attachments/upload': {
      post: {
        tags: ['Attachments'],
        summary: 'Upload files',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  files: { type: 'array', items: { type: 'string', format: 'binary' } },
                  typeCode: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Files uploaded' }
        }
      }
    },
    '/common/attachments/download/{fileId}': {
      get: {
        tags: ['Attachments'],
        summary: 'Download file',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'fileId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'File content' },
          404: { description: 'File not found' }
        }
      }
    },
    '/common/attachments/{id}': {
      get: {
        tags: ['Attachments'],
        summary: 'Get attachment by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Attachment details' }
        }
      },
      delete: {
        tags: ['Attachments'],
        summary: 'Delete attachment',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Attachment deleted' }
        }
      }
    },

    // ==========================================
    // COMMON MODULE PATHS - Attachment Types
    // ==========================================
    '/common/attachment-types': {
      get: {
        tags: ['Attachment Types'],
        summary: 'List attachment types',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Attachment type list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AttachmentType' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Attachment Types'],
        summary: 'Create attachment type',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Attachment type created' }
        }
      }
    },
    '/common/attachment-types/{id}': {
      get: {
        tags: ['Attachment Types'],
        summary: 'Get attachment type by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Attachment type details' }
        }
      },
      put: {
        tags: ['Attachment Types'],
        summary: 'Update attachment type',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Attachment type updated' }
        }
      },
      delete: {
        tags: ['Attachment Types'],
        summary: 'Delete attachment type',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Attachment type deleted' }
        }
      }
    },

    // ==========================================
    // COMMON MODULE PATHS - Logs
    // ==========================================
    '/common/logs': {
      get: {
        tags: ['Logs'],
        summary: 'List logs (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'method', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: {
            description: 'Log list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    logs: { type: 'array', items: { $ref: '#/components/schemas/Log' } },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/common/logs/my-logs': {
      get: {
        tags: ['Logs'],
        summary: 'Get current user logs',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User logs' }
        }
      }
    },
    '/common/logs/analytics': {
      get: {
        tags: ['Logs'],
        summary: 'Get log analytics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Log analytics',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LogAnalytics' }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // COMMON MODULE PATHS - Log Analytics
    // ==========================================
    '/common/log-analytics': {
      get: {
        tags: ['Log Analytics'],
        summary: 'Get detailed log analytics',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: { description: 'Detailed analytics' }
        }
      }
    },
    '/common/log-analytics/errors': {
      get: {
        tags: ['Log Analytics'],
        summary: 'Get error logs with pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: { description: 'Error logs' }
        }
      }
    },

    // ==========================================
    // COMMON MODULE PATHS - App Settings
    // ==========================================
    '/common/app-settings': {
      get: {
        tags: ['App Settings'],
        summary: 'List all app settings',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Settings list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AppSetting' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['App Settings'],
        summary: 'Create app setting',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Setting created' }
        }
      }
    },
    '/common/app-settings/public': {
      get: {
        tags: ['App Settings'],
        summary: 'Get public app settings (no auth required)',
        responses: {
          200: { description: 'Public settings' }
        }
      }
    },
    '/common/app-settings/{id}': {
      get: {
        tags: ['App Settings'],
        summary: 'Get app setting by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Setting details' }
        }
      },
      put: {
        tags: ['App Settings'],
        summary: 'Update app setting',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Setting updated' }
        }
      },
      delete: {
        tags: ['App Settings'],
        summary: 'Delete app setting',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Setting deleted' }
        }
      }
    },

    // ==========================================
    // COMMON MODULE PATHS - Dashboard
    // ==========================================
    '/common/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard summary',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard summary',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardSummary' }
              }
            }
          }
        }
      }
    },
    '/common/dashboard/activity-trend': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get activity trend',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'days', in: 'query', schema: { type: 'integer', default: 7 } }
        ],
        responses: {
          200: { description: 'Activity trend data' }
        }
      }
    },
    '/common/dashboard/user-status': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get user status distribution',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User status distribution' }
        }
      }
    },
    '/common/dashboard/department-stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get department statistics',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 8 } }
        ],
        responses: {
          200: { description: 'Department stats' }
        }
      }
    },
    '/common/dashboard/board-activity': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get board activity',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Board activity data' }
        }
      }
    },
    '/common/dashboard/system-performance': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get system performance metrics',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'hours', in: 'query', schema: { type: 'integer', default: 24 } }
        ],
        responses: {
          200: { description: 'System performance data' }
        }
      }
    },
    '/common/dashboard/http-status': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get HTTP status distribution',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'HTTP status distribution' }
        }
      }
    },
    '/common/dashboard/top-posts': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get top posts',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5 } }
        ],
        responses: {
          200: { description: 'Top posts' }
        }
      }
    },
    '/common/dashboard/error-endpoints': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get error-prone endpoints',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5 } }
        ],
        responses: {
          200: { description: 'Error endpoints' }
        }
      }
    },
    '/common/dashboard/recent-activity': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get recent activities',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          200: { description: 'Recent activities' }
        }
      }
    },
    '/common/dashboard/login-stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get login statistics',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'days', in: 'query', schema: { type: 'integer', default: 7 } }
        ],
        responses: {
          200: { description: 'Login stats' }
        }
      }
    },
    '/common/dashboard/menu-usage': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get menu usage statistics',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          200: { description: 'Menu usage stats' }
        }
      }
    }
  }
};

export default swaggerSpec;
