/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../utils/fileUtils');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/program - Get all programs with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const programs = await readJSON('backend/data/programs.json') || [];
    const {
      code,
      name,
      category,
      type,
      status,
      page = 1,
      limit = 50
    } = req.query;

    let filteredPrograms = programs;

    // Apply filters
    if (code) {
      filteredPrograms = filteredPrograms.filter(p =>
        p.code.toLowerCase().includes(code.toLowerCase())
      );
    }
    if (name) {
      filteredPrograms = filteredPrograms.filter(p =>
        p.name.en.toLowerCase().includes(name.toLowerCase()) ||
        p.name.ko.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (category) {
      filteredPrograms = filteredPrograms.filter(p => p.category === category);
    }
    if (type) {
      filteredPrograms = filteredPrograms.filter(p => p.type === type);
    }
    if (status) {
      filteredPrograms = filteredPrograms.filter(p => p.status === status);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPrograms = filteredPrograms.slice(startIndex, endIndex);

    res.json({
      programs: paginatedPrograms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount: filteredPrograms.length,
        totalPages: Math.ceil(filteredPrograms.length / limitNum)
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
    const programs = await readJSON('backend/data/programs.json') || [];
    res.json({ programs });
  } catch (error) {
    console.error('Error fetching all programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// GET /api/program/:id - Get a specific program by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const programs = await readJSON('backend/data/programs.json') || [];
    const program = programs.find(p => p.id === req.params.id);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    res.json({ program });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

// GET /api/program/code/:code - Get a specific program by code
router.get('/code/:code', authenticateToken, async (req, res) => {
  try {
    const programs = await readJSON('backend/data/programs.json') || [];
    const program = programs.find(p => p.code === req.params.code);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

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

    const programs = await readJSON('backend/data/programs.json') || [];
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

    // Validate required fields
    if (!code || !name || !category || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if program code already exists
    if (programs.some(p => p.code === code)) {
      return res.status(409).json({ error: 'Program code already exists' });
    }

    const newProgram = {
      id: uuidv4(),
      code,
      name,
      description: description || { en: '', ko: '' },
      category,
      type,
      status: status || 'development',
      permissions: permissions || [],
      config: config || {},
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    programs.push(newProgram);
    await writeJSON('backend/data/programs.json', programs);

    res.status(201).json({ program: newProgram });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ error: 'Failed to create program' });
  }
});

// PUT /api/program/:id - Update a program
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admin can update programs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const programs = await readJSON('backend/data/programs.json') || [];
    const index = programs.findIndex(p => p.id === req.params.id);

    if (index === -1) {
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
    if (code && code !== programs[index].code) {
      if (programs.some(p => p.code === code && p.id !== req.params.id)) {
        return res.status(409).json({ error: 'Program code already exists' });
      }
    }

    const updatedProgram = {
      ...programs[index],
      code: code || programs[index].code,
      name: name || programs[index].name,
      description: description || programs[index].description,
      category: category || programs[index].category,
      type: type || programs[index].type,
      status: status !== undefined ? status : programs[index].status,
      permissions: permissions !== undefined ? permissions : programs[index].permissions,
      config: config !== undefined ? config : programs[index].config,
      metadata: {
        ...programs[index].metadata,
        ...metadata,
        updatedAt: new Date().toISOString()
      }
    };

    programs[index] = updatedProgram;
    await writeJSON('backend/data/programs.json', programs);

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

    const programs = await readJSON('backend/data/programs.json') || [];
    const index = programs.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const deletedProgram = programs[index];
    programs.splice(index, 1);
    await writeJSON('backend/data/programs.json', programs);

    res.json({ message: 'Program deleted successfully', program: deletedProgram });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

// GET /api/program/:id/permissions - Get program permissions
router.get('/:id/permissions', authenticateToken, async (req, res) => {
  try {
    const programs = await readJSON('backend/data/programs.json') || [];
    const program = programs.find(p => p.id === req.params.id);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

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

    const programs = await readJSON('backend/data/programs.json') || [];
    const index = programs.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }

    programs[index].permissions = permissions;
    programs[index].metadata = {
      ...programs[index].metadata,
      updatedAt: new Date().toISOString()
    };

    await writeJSON('backend/data/programs.json', programs);

    res.json({ program: programs[index] });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

module.exports = router;
