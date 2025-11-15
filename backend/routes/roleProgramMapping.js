const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Helper function to read JSON file
async function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write JSON file
async function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Helper function to enrich mapping with role and program details
async function enrichMappingWithDetails(mapping) {
  try {
    const rolesData = await readJSON('roles.json');
    const programsData = await readJSON('programs.json');

    const roles = rolesData.roles || [];
    const programs = programsData || [];

    const role = roles.find((r) => r.id === mapping.roleId);
    const program = programs.find((p) => p.id === mapping.programId);

    return {
      ...mapping,
      roleName: role?.name,
      roleDisplayName: role?.displayName,
      programCode: program?.code,
      programName: program?.name
    };
  } catch (error) {
    console.error('Error enriching mapping:', error);
    return mapping;
  }
}

// GET /api/role-program-mapping
router.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await readJSON('roleProgramMappings.json');
    const mappings = data?.roleProgramMappings || [];

    const { id, roleId, programId, includeDetails } = req.query;

    let filteredMappings = mappings;

    // Filter by ID
    if (id) {
      const mapping = mappings.find((m) => m.id === id);
      if (!mapping) {
        return res.status(404).json({ error: 'Mapping not found' });
      }

      if (includeDetails === 'true') {
        const enrichedMapping = await enrichMappingWithDetails(mapping);
        return res.json({ mapping: enrichedMapping });
      }

      return res.json({ mapping });
    }

    // Filter by roleId
    if (roleId) {
      filteredMappings = filteredMappings.filter((m) => m.roleId === roleId);
    }

    // Filter by programId
    if (programId) {
      filteredMappings = filteredMappings.filter((m) => m.programId === programId);
    }

    // Enrich with role and program details if requested
    if (includeDetails === 'true') {
      const enrichedMappings = await Promise.all(
        filteredMappings.map((m) => enrichMappingWithDetails(m))
      );
      return res.json({
        mappings: enrichedMappings,
        total: enrichedMappings.length
      });
    }

    res.json({
      mappings: filteredMappings,
      total: filteredMappings.length
    });
  } catch (error) {
    console.error('Get role-program mappings error:', error);
    res.status(500).json({ error: error.message || 'Failed to get role-program mappings' });
  }
});

// POST /api/role-program-mapping
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { roleId, programId, canView, canCreate, canUpdate, canDelete } = req.body;

    if (!roleId || !programId) {
      return res.status(400).json({ error: 'Role ID and Program ID are required' });
    }

    const data = await readJSON('roleProgramMappings.json');
    const mappings = data.roleProgramMappings || [];

    // Check if mapping already exists
    const existingMapping = mappings.find((m) =>
      m.roleId === roleId && m.programId === programId
    );
    if (existingMapping) {
      return res.status(400).json({
        error: 'Mapping already exists for this role and program'
      });
    }

    // Verify role exists
    const rolesData = await readJSON('roles.json');
    const roles = rolesData.roles || [];
    const roleExists = roles.find((r) => r.id === roleId);
    if (!roleExists) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Verify program exists
    const programsData = await readJSON('programs.json');
    const programs = programsData || [];
    const programExists = programs.find((p) => p.id === programId);
    if (!programExists) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Generate new mapping ID
    const maxId = mappings.reduce((max, m) => {
      const num = parseInt(m.id.replace('rpm-', ''));
      return num > max ? num : max;
    }, 0);
    const newId = `rpm-${String(maxId + 1).padStart(3, '0')}`;

    // Create new mapping
    const newMapping = {
      id: newId,
      roleId,
      programId,
      canView: canView !== undefined ? canView : true,
      canCreate: canCreate !== undefined ? canCreate : false,
      canUpdate: canUpdate !== undefined ? canUpdate : false,
      canDelete: canDelete !== undefined ? canDelete : false,
      createdBy: req.user.username,
      createdAt: new Date().toISOString()
    };

    mappings.push(newMapping);
    await writeJSON('roleProgramMappings.json', { ...data, roleProgramMappings: mappings });

    const enrichedMapping = await enrichMappingWithDetails(newMapping);
    res.status(201).json({ mapping: enrichedMapping });
  } catch (error) {
    console.error('Create role-program mapping error:', error);
    res.status(500).json({ error: error.message || 'Failed to create role-program mapping' });
  }
});

// PUT /api/role-program-mapping
router.put('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id, canView, canCreate, canUpdate, canDelete } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Mapping ID is required' });
    }

    const data = await readJSON('roleProgramMappings.json');
    const mappings = data.roleProgramMappings || [];

    const mappingIndex = mappings.findIndex((m) => m.id === id);
    if (mappingIndex === -1) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    const existingMapping = mappings[mappingIndex];

    const updatedMapping = {
      ...existingMapping,
      canView: canView !== undefined ? canView : existingMapping.canView,
      canCreate: canCreate !== undefined ? canCreate : existingMapping.canCreate,
      canUpdate: canUpdate !== undefined ? canUpdate : existingMapping.canUpdate,
      canDelete: canDelete !== undefined ? canDelete : existingMapping.canDelete,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.username
    };

    mappings[mappingIndex] = updatedMapping;
    await writeJSON('roleProgramMappings.json', { ...data, roleProgramMappings: mappings });

    const enrichedMapping = await enrichMappingWithDetails(updatedMapping);
    res.json({ mapping: enrichedMapping });
  } catch (error) {
    console.error('Update role-program mapping error:', error);
    res.status(500).json({ error: error.message || 'Failed to update role-program mapping' });
  }
});

// DELETE /api/role-program-mapping
router.delete('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Mapping ID is required' });
    }

    const data = await readJSON('roleProgramMappings.json');
    const mappings = data.roleProgramMappings || [];

    const mapping = mappings.find((m) => m.id === id);
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    const filteredMappings = mappings.filter((m) => m.id !== id);
    await writeJSON('roleProgramMappings.json', { ...data, roleProgramMappings: filteredMappings });

    res.json({
      message: 'Role-program mapping deleted successfully',
      deletedMapping: mapping
    });
  } catch (error) {
    console.error('Delete role-program mapping error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete role-program mapping' });
  }
});

module.exports = router;
