/**
 * Inspection Service - Swagger/OpenAPI Specification
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Inspection Service API',
    version: '1.0.0',
    description: 'Inspection Service API - Checksheet templates, items, inspections, and offline sync',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3013',
      description: 'Development server'
    },
    {
      url: '/inspection',
      description: 'Production server (via gateway)'
    }
  ],
  tags: [
    { name: 'Templates', description: 'Checksheet template management' },
    { name: 'Items', description: 'Checksheet item management' },
    { name: 'Inspections', description: 'Inspection execution management' },
    { name: 'Sync', description: 'Offline data synchronization' }
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
      ChecksheetTemplate: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          version: { type: 'integer' },
          status: { type: 'string', enum: ['active', 'inactive', 'archived'] },
          created_by: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      ChecksheetTemplateCreate: {
        type: 'object',
        required: ['code', 'name'],
        properties: {
          code: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] }
        }
      },
      ChecksheetItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          template_id: { type: 'string', format: 'uuid' },
          parent_id: { type: 'string', format: 'uuid' },
          sort_order: { type: 'integer' },
          item_code: { type: 'string' },
          item_name: { type: 'string' },
          item_type: { type: 'string', enum: ['checkbox', 'text', 'number', 'select', 'photo', 'signature', 'date', 'time'] },
          options: { type: 'object' },
          required: { type: 'boolean' },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      ChecksheetItemCreate: {
        type: 'object',
        required: ['template_id', 'item_name', 'item_type'],
        properties: {
          template_id: { type: 'string', format: 'uuid' },
          parent_id: { type: 'string', format: 'uuid' },
          sort_order: { type: 'integer' },
          item_code: { type: 'string' },
          item_name: { type: 'string' },
          item_type: { type: 'string', enum: ['checkbox', 'text', 'number', 'select', 'photo', 'signature', 'date', 'time'] },
          options: { type: 'object' },
          required: { type: 'boolean' },
          description: { type: 'string' }
        }
      },
      Inspection: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          template_id: { type: 'string', format: 'uuid' },
          inspection_code: { type: 'string' },
          target_name: { type: 'string' },
          target_id: { type: 'string' },
          inspector_id: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['draft', 'in_progress', 'completed', 'submitted'] },
          started_at: { type: 'string', format: 'date-time' },
          completed_at: { type: 'string', format: 'date-time' },
          submitted_at: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          notes: { type: 'string' },
          sync_status: { type: 'string', enum: ['synced', 'pending', 'conflict'] },
          client_id: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      InspectionCreate: {
        type: 'object',
        required: ['template_id'],
        properties: {
          template_id: { type: 'string', format: 'uuid' },
          inspection_code: { type: 'string' },
          target_name: { type: 'string' },
          target_id: { type: 'string' },
          location: { type: 'string' },
          notes: { type: 'string' },
          client_id: { type: 'string' }
        }
      },
      InspectionResult: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          inspection_id: { type: 'string', format: 'uuid' },
          item_id: { type: 'string', format: 'uuid' },
          value: { type: 'string' },
          value_type: { type: 'string', enum: ['text', 'number', 'boolean', 'json'] },
          is_passed: { type: 'boolean' },
          remarks: { type: 'string' },
          photo_urls: { type: 'array', items: { type: 'string' } },
          recorded_at: { type: 'string', format: 'date-time' },
          sync_version: { type: 'integer' }
        }
      },
      InspectionResultCreate: {
        type: 'object',
        required: ['item_id'],
        properties: {
          item_id: { type: 'string', format: 'uuid' },
          value: { type: 'string' },
          value_type: { type: 'string', enum: ['text', 'number', 'boolean', 'json'] },
          is_passed: { type: 'boolean' },
          remarks: { type: 'string' },
          photo_urls: { type: 'array', items: { type: 'string' } }
        }
      },
      SyncDownloadResponse: {
        type: 'object',
        properties: {
          templates: { type: 'array', items: { $ref: '#/components/schemas/ChecksheetTemplate' } },
          items: { type: 'array', items: { $ref: '#/components/schemas/ChecksheetItem' } },
          sync_timestamp: { type: 'string', format: 'date-time' }
        }
      },
      SyncUploadRequest: {
        type: 'object',
        required: ['client_id', 'inspections'],
        properties: {
          client_id: { type: 'string' },
          inspections: { type: 'array', items: { type: 'object' } }
        }
      },
      SyncUploadResponse: {
        type: 'object',
        properties: {
          synced_count: { type: 'integer' },
          failed_count: { type: 'integer' },
          conflicts: { type: 'array', items: { type: 'object' } },
          id_mappings: { type: 'array', items: { type: 'object' } }
        }
      },
      SyncStatus: {
        type: 'object',
        properties: {
          last_sync: { type: 'string', format: 'date-time' },
          pending_count: { type: 'integer' },
          conflict_count: { type: 'integer' },
          synced_inspections: { type: 'integer' }
        }
      }
    }
  },
  paths: {
    '/inspection/templates': {
      get: {
        tags: ['Templates'],
        summary: 'List all templates',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Template list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    templates: { type: 'array', items: { $ref: '#/components/schemas/ChecksheetTemplate' } },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Templates'],
        summary: 'Create new template',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChecksheetTemplateCreate' }
            }
          }
        },
        responses: {
          201: { description: 'Template created' },
          400: { description: 'Validation error' },
          409: { description: 'Template code already exists' }
        }
      }
    },
    '/inspection/templates/{id}': {
      get: {
        tags: ['Templates'],
        summary: 'Get template by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'includeItems', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: { description: 'Template details' },
          404: { description: 'Template not found' }
        }
      },
      put: {
        tags: ['Templates'],
        summary: 'Update template',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Template updated' },
          404: { description: 'Template not found' }
        }
      },
      delete: {
        tags: ['Templates'],
        summary: 'Delete template',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'hard', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: { description: 'Template deleted' },
          404: { description: 'Template not found' }
        }
      }
    },
    '/inspection/templates/{id}/clone': {
      post: {
        tags: ['Templates'],
        summary: 'Clone template with items',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newCode', 'newName'],
                properties: {
                  newCode: { type: 'string' },
                  newName: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Template cloned' },
          404: { description: 'Template not found' }
        }
      }
    },
    '/inspection/templates/{id}/items': {
      get: {
        tags: ['Templates'],
        summary: 'Get items for a template',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Item list' },
          404: { description: 'Template not found' }
        }
      }
    },
    '/inspection/items': {
      post: {
        tags: ['Items'],
        summary: 'Create new item',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChecksheetItemCreate' }
            }
          }
        },
        responses: {
          201: { description: 'Item created' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/inspection/items/{id}': {
      get: {
        tags: ['Items'],
        summary: 'Get item by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Item details' },
          404: { description: 'Item not found' }
        }
      },
      put: {
        tags: ['Items'],
        summary: 'Update item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Item updated' },
          404: { description: 'Item not found' }
        }
      },
      delete: {
        tags: ['Items'],
        summary: 'Delete item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Item deleted' },
          404: { description: 'Item not found' }
        }
      }
    },
    '/inspection/items/reorder': {
      put: {
        tags: ['Items'],
        summary: 'Reorder items',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['template_id', 'items'],
                properties: {
                  template_id: { type: 'string' },
                  items: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Items reordered' }
        }
      }
    },
    '/inspection/items/bulk': {
      post: {
        tags: ['Items'],
        summary: 'Bulk create items',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['template_id', 'items'],
                properties: {
                  template_id: { type: 'string' },
                  items: { type: 'array', items: { $ref: '#/components/schemas/ChecksheetItemCreate' } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Items created' }
        }
      }
    },
    '/inspection/executions': {
      get: {
        tags: ['Inspections'],
        summary: 'List all inspections',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'template_id', in: 'query', schema: { type: 'string' } },
          { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: {
            description: 'Inspection list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    inspections: { type: 'array', items: { $ref: '#/components/schemas/Inspection' } },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Inspections'],
        summary: 'Create new inspection',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InspectionCreate' }
            }
          }
        },
        responses: {
          201: { description: 'Inspection created' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/inspection/executions/{id}': {
      get: {
        tags: ['Inspections'],
        summary: 'Get inspection by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'includeResults', in: 'query', schema: { type: 'boolean', default: true } },
          { name: 'includeTemplate', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: { description: 'Inspection details' },
          404: { description: 'Inspection not found' }
        }
      },
      put: {
        tags: ['Inspections'],
        summary: 'Update inspection',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Inspection updated' },
          404: { description: 'Inspection not found' }
        }
      },
      delete: {
        tags: ['Inspections'],
        summary: 'Delete inspection',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Inspection deleted' },
          400: { description: 'Cannot delete completed/submitted inspection' },
          404: { description: 'Inspection not found' }
        }
      }
    },
    '/inspection/executions/{id}/results': {
      get: {
        tags: ['Inspections'],
        summary: 'Get inspection results',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Result list' },
          404: { description: 'Inspection not found' }
        }
      },
      put: {
        tags: ['Inspections'],
        summary: 'Save inspection results',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['results'],
                properties: {
                  results: { type: 'array', items: { $ref: '#/components/schemas/InspectionResultCreate' } }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Results saved' },
          400: { description: 'Cannot modify submitted inspection' },
          404: { description: 'Inspection not found' }
        }
      }
    },
    '/inspection/executions/{id}/submit': {
      post: {
        tags: ['Inspections'],
        summary: 'Submit inspection',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Inspection submitted' },
          400: { description: 'Inspection not complete or already submitted' },
          404: { description: 'Inspection not found' }
        }
      }
    },
    '/inspection/sync/download': {
      get: {
        tags: ['Sync'],
        summary: 'Download templates for offline use',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'template_ids', in: 'query', schema: { type: 'string' }, description: 'Comma-separated template IDs' },
          { name: 'include_items', in: 'query', schema: { type: 'boolean', default: true } }
        ],
        responses: {
          200: {
            description: 'Sync download data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SyncDownloadResponse' }
              }
            }
          }
        }
      }
    },
    '/inspection/sync/upload': {
      post: {
        tags: ['Sync'],
        summary: 'Upload offline inspection data',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SyncUploadRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Sync upload result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SyncUploadResponse' }
              }
            }
          }
        }
      }
    },
    '/inspection/sync/status': {
      get: {
        tags: ['Sync'],
        summary: 'Get sync status',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'client_id', in: 'query', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Sync status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SyncStatus' }
              }
            }
          }
        }
      }
    },
    '/inspection/sync/resolve-conflict': {
      post: {
        tags: ['Sync'],
        summary: 'Resolve sync conflict',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['conflict_id', 'resolution'],
                properties: {
                  conflict_id: { type: 'string' },
                  resolution: { type: 'string', enum: ['server_wins', 'client_wins', 'merge'] },
                  merged_data: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Conflict resolved' }
        }
      }
    },
    '/inspection/sync/pending': {
      get: {
        tags: ['Sync'],
        summary: 'Get pending sync items',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'client_id', in: 'query', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Pending sync items' }
        }
      }
    }
  }
};

export default swaggerSpec;
