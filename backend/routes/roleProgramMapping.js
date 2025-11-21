const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const mappingService = require('../services/mappingService');
const roleService = require('../services/roleService');
const programService = require('../services/programService');

// Helper function to enrich mapping with role and program details
async function enrichMappingWithDetails(mapping) {
  try {
    const role = mapping.role_id ? await roleService.getRoleById(mapping.role_id) : null;
    const program = mapping.program_id ? await programService.getProgramById(mapping.program_id) : null;

    return {
      id: mapping.id,
      roleId: mapping.role_id,
      programId: mapping.program_id,
      canView: mapping.can_view,
      canCreate: mapping.can_create,
      canUpdate: mapping.can_update,
      canDelete: mapping.can_delete,
      createdBy: mapping.created_by,
      createdAt: mapping.created_at,
      updatedAt: mapping.updated_at,
      updatedBy: mapping.updated_by,
      roleName: role?.name,
      roleDisplayName: role?.display_name,
      programCode: program?.code,
      programName: program ? {
        en: program.name_en,
        ko: program.name_ko,
        zh: program.name_zh,
        vi: program.name_vi
      } : null
    };
  } catch (error) {
    console.error('Error enriching mapping:', error);
    // Return basic mapping if enrichment fails
    return {
      id: mapping.id,
      roleId: mapping.role_id,
      programId: mapping.program_id,
      canView: mapping.can_view,
      canCreate: mapping.can_create,
      canUpdate: mapping.can_update,
      canDelete: mapping.can_delete,
      createdBy: mapping.created_by,
      createdAt: mapping.created_at,
      updatedAt: mapping.updated_at,
      updatedBy: mapping.updated_by
    };
  }
}

// GET /api/role-program-mapping
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id, roleId, programId, includeDetails } = req.query;

    // Filter by ID
    if (id) {
      const mapping = await mappingService.getRoleProgramMappingById(id);
      if (!mapping) {
        return res.status(404).json({ error: 'Mapping not found' });
      }

      if (includeDetails === 'true') {
        const enrichedMapping = await enrichMappingWithDetails(mapping);
        return res.json({ mapping: enrichedMapping });
      }

      return res.json({
        mapping: {
          id: mapping.id,
          roleId: mapping.role_id,
          programId: mapping.program_id,
          canView: mapping.can_view,
          canCreate: mapping.can_create,
          canUpdate: mapping.can_update,
          canDelete: mapping.can_delete,
          createdBy: mapping.created_by,
          createdAt: mapping.created_at,
          updatedAt: mapping.updated_at,
          updatedBy: mapping.updated_by
        }
      });
    }

    // Get filtered mappings
    let mappings;
    if (roleId) {
      mappings = await mappingService.getRoleProgramMappingsByRoleId(roleId);
    } else if (programId) {
      mappings = await mappingService.getRoleProgramMappingsByProgramId(programId);
    } else {
      const result = await mappingService.getAllRoleProgramMappings();
      mappings = result;
    }

    // Format mappings
    const formattedMappings = mappings.map(m => ({
      id: m.id,
      roleId: m.role_id,
      programId: m.program_id,
      canView: m.can_view,
      canCreate: m.can_create,
      canUpdate: m.can_update,
      canDelete: m.can_delete,
      createdBy: m.created_by,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      updatedBy: m.updated_by
    }));

    // Enrich with role and program details if requested
    if (includeDetails === 'true') {
      const enrichedMappings = await Promise.all(
        mappings.map((m) => enrichMappingWithDetails(m))
      );
      return res.json({
        mappings: enrichedMappings,
        total: enrichedMappings.length
      });
    }

    res.json({
      mappings: formattedMappings,
      total: formattedMappings.length
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

    // Check if mapping already exists
    const existingMappings = await mappingService.getRoleProgramMappingsByRoleId(roleId);
    const duplicateMapping = existingMappings.find((m) => m.program_id === programId);

    if (duplicateMapping) {
      return res.status(400).json({
        error: 'Mapping already exists for this role and program'
      });
    }

    // Verify role exists
    const roleExists = await roleService.getRoleById(roleId);
    if (!roleExists) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Verify program exists
    const programExists = await programService.getProgramById(programId);
    if (!programExists) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Create new mapping
    const mappingData = {
      roleId,
      programId,
      canView: canView !== undefined ? canView : true,
      canCreate: canCreate !== undefined ? canCreate : false,
      canUpdate: canUpdate !== undefined ? canUpdate : false,
      canDelete: canDelete !== undefined ? canDelete : false,
      createdBy: req.user.username
    };

    const newMapping = await mappingService.createRoleProgramMapping(mappingData);
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

    const existingMapping = await mappingService.getRoleProgramMappingById(id);
    if (!existingMapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    const updates = {
      canView: canView !== undefined ? canView : existingMapping.can_view,
      canCreate: canCreate !== undefined ? canCreate : existingMapping.can_create,
      canUpdate: canUpdate !== undefined ? canUpdate : existingMapping.can_update,
      canDelete: canDelete !== undefined ? canDelete : existingMapping.can_delete,
      updatedBy: req.user.username
    };

    const updatedMapping = await mappingService.updateRoleProgramMapping(id, updates);
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

    const mapping = await mappingService.getRoleProgramMappingById(id);
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    await mappingService.deleteRoleProgramMapping(id);

    res.json({
      message: 'Role-program mapping deleted successfully',
      deletedMapping: {
        id: mapping.id,
        roleId: mapping.role_id,
        programId: mapping.program_id
      }
    });
  } catch (error) {
    console.error('Delete role-program mapping error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete role-program mapping' });
  }
});

module.exports = router;
