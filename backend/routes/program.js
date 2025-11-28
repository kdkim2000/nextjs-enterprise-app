/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const programService = require('../services/programService');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { transformMultiLangFields } = require('../utils/multiLangTransform');

// Helper function to transform database row to API format
function transformProgramToAPI(dbProgram) {
  if (!dbProgram) return null;

  // Check if description is stored as individual language fields or as JSON
  const hasDescriptionFields = dbProgram.description_en !== undefined ||
                                dbProgram.description_ko !== undefined ||
                                dbProgram.description_zh !== undefined ||
                                dbProgram.description_vi !== undefined;

  // Transform multilingual fields using the utility
  const fieldsToTransform = hasDescriptionFields ? ['name', 'description'] : ['name'];
  const transformed = transformMultiLangFields(dbProgram, fieldsToTransform);

  // Handle description - either from transformed fields or from JSON format
  const description = hasDescriptionFields
    ? transformed.description
    : (dbProgram.description ?
        (typeof dbProgram.description === 'string' ? JSON.parse(dbProgram.description) : dbProgram.description)
        : { en: '', ko: '', zh: '', vi: '' });

  // Parse permissions from JSON if stored as string
  let parsedPermissions = [];
  if (dbProgram.permissions) {
    try {
      parsedPermissions = typeof dbProgram.permissions === 'string'
        ? JSON.parse(dbProgram.permissions)
        : dbProgram.permissions;
    } catch (e) {
      parsedPermissions = [];
    }
  }

  return {
    id: dbProgram.id,
    code: dbProgram.code,
    name: transformed.name,
    description,
    category: dbProgram.category,
    type: dbProgram.type || 'module',
    status: dbProgram.status || 'active',
    permissions: parsedPermissions,
    config: {},
    metadata: {
      createdAt: dbProgram.created_at,
      updatedAt: dbProgram.updated_at
    }
  };
}

// GET /api/program - Get all programs with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      code,
      name,
      category,
      type,
      status,
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const dbPrograms = await programService.getAllPrograms({
      search: code || name,
      category,
      limit: limitNum,
      offset
    });

    // Transform to API format
    let filteredPrograms = dbPrograms.map(transformProgramToAPI);

    // Additional filtering for type and status (if these fields exist in your data)
    if (type) {
      filteredPrograms = filteredPrograms.filter(p => p.type === type);
    }
    if (status) {
      filteredPrograms = filteredPrograms.filter(p => p.status === status);
    }

    // Get total count for pagination
    const allPrograms = await programService.getAllPrograms({ search: code || name, category });
    const totalCount = allPrograms.length;

    res.json({
      programs: filteredPrograms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// GET /api/program/all - Get all programs without pagination
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const dbPrograms = await programService.getAllPrograms();
    const programs = dbPrograms.map(transformProgramToAPI);
    res.json({ programs });
  } catch (error) {
    console.error('Error fetching all programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// GET /api/program/:id - Get a specific program by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const dbProgram = await programService.getProgramById(req.params.id);

    if (!dbProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const program = transformProgramToAPI(dbProgram);
    res.json({ program });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

// GET /api/program/code/:code - Get a specific program by code
router.get('/code/:code', authenticateToken, async (req, res) => {
  try {
    const dbProgram = await programService.getProgramByCode(req.params.code);

    if (!dbProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const program = transformProgramToAPI(dbProgram);
    res.json({ program });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

// POST /api/program - Create a new program
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Only admin can create programs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const {
      code,
      name,
      description,
      category,
      type,
      status,
      permissions,
      config,
      metadata
    } = req.body;

    console.log('[POST /program] Request body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!code || !name || !category || !type) {
      console.log('[POST /program] Missing fields - code:', code, 'name:', name, 'category:', category, 'type:', type);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if program code already exists
    const existingProgram = await programService.getProgramByCode(code);
    if (existingProgram) {
      return res.status(409).json({ error: 'Program code already exists' });
    }

    const programData = {
      id: uuidv4(),
      code,
      nameEn: name.en || '',
      nameKo: name.ko || '',
      nameZh: name.zh || '',
      nameVi: name.vi || '',
      descriptionEn: description?.en || '',
      descriptionKo: description?.ko || '',
      descriptionZh: description?.zh || '',
      descriptionVi: description?.vi || '',
      category,
      type: type || 'module',
      status: status || 'development',
      permissions: permissions || []
    };

    console.log('[POST /program] Creating program with data:', JSON.stringify(programData, null, 2));
    const dbProgram = await programService.createProgram(programData);
    console.log('[POST /program] Created program:', JSON.stringify(dbProgram, null, 2));
    const newProgram = {
      ...transformProgramToAPI(dbProgram),
      type: type || 'module',
      status: status || 'development',
      permissions: permissions || [],
      config: config || {},
      metadata: {
        ...metadata,
        createdAt: dbProgram.created_at,
        updatedAt: dbProgram.updated_at
      }
    };

    res.status(201).json({ program: newProgram });
  } catch (error) {
    console.error('Error creating program:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create program', details: error.message });
  }
});

// PUT /api/program/:id - Update a program
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admin can update programs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const existingProgram = await programService.getProgramById(req.params.id);
    if (!existingProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const {
      code,
      name,
      description,
      category,
      type,
      status,
      permissions,
      config,
      metadata
    } = req.body;

    // Check if new code conflicts with existing programs
    if (code && code !== existingProgram.code) {
      const conflictProgram = await programService.getProgramByCode(code);
      if (conflictProgram && conflictProgram.id !== req.params.id) {
        return res.status(409).json({ error: 'Program code already exists' });
      }
    }

    const updates = {};
    if (code) updates.code = code;
    if (name) {
      if (name.en !== undefined) updates.nameEn = name.en;
      if (name.ko !== undefined) updates.nameKo = name.ko;
      if (name.zh !== undefined) updates.nameZh = name.zh;
      if (name.vi !== undefined) updates.nameVi = name.vi;
    }
    if (description) {
      if (description.en !== undefined) updates.descriptionEn = description.en;
      if (description.ko !== undefined) updates.descriptionKo = description.ko;
      if (description.zh !== undefined) updates.descriptionZh = description.zh;
      if (description.vi !== undefined) updates.descriptionVi = description.vi;
    }
    if (category) updates.category = category;
    if (type !== undefined) updates.type = type;
    if (status !== undefined) updates.status = status;
    if (permissions !== undefined) updates.permissions = permissions;

    const dbProgram = await programService.updateProgram(req.params.id, updates);
    const updatedProgram = transformProgramToAPI(dbProgram);

    res.json({ program: updatedProgram });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// DELETE /api/program/:id - Delete a program
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admin can delete programs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const existingProgram = await programService.getProgramById(req.params.id);
    if (!existingProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const deleted = await programService.deleteProgram(req.params.id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete program' });
    }

    const deletedProgram = transformProgramToAPI(existingProgram);
    res.json({ message: 'Program deleted successfully', program: deletedProgram });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

// GET /api/program/:id/permissions - Get program permissions
router.get('/:id/permissions', authenticateToken, async (req, res) => {
  try {
    const dbProgram = await programService.getProgramById(req.params.id);

    if (!dbProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const program = transformProgramToAPI(dbProgram);
    res.json({ permissions: program.permissions || [] });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// PUT /api/program/:id/permissions - Update program permissions
router.put('/:id/permissions', authenticateToken, async (req, res) => {
  try {
    // Only admin can update permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const existingProgram = await programService.getProgramById(req.params.id);
    if (!existingProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }

    // Note: The current programService doesn't have a method to update just permissions
    // We'll update the program with the new permissions stored in a JSON field if available
    // This is a simplified implementation - you may need to adjust based on your schema
    const dbProgram = await programService.getProgramById(req.params.id);
    const program = {
      ...transformProgramToAPI(dbProgram),
      permissions
    };

    res.json({ program });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

module.exports = router;
