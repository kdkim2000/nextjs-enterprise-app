const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const mappingService = require('../services/mappingService');
const userService = require('../services/userService');
const roleService = require('../services/roleService');

// Helper function to enrich mapping with user and role details
async function enrichMappingWithDetails(mapping) {
  try {
    const user = mapping.user_id ? await userService.getUserById(mapping.user_id) : null;
    const role = mapping.role_id ? await roleService.getRoleById(mapping.role_id) : null;

    return {
      id: mapping.id,
      userId: mapping.user_id,
      roleId: mapping.role_id,
      assignedBy: mapping.assigned_by,
      assignedAt: mapping.assigned_at,
      expiresAt: mapping.expires_at,
      isActive: mapping.is_active,
      updatedAt: mapping.updated_at,
      updatedBy: mapping.updated_by,
      userName: user?.username || user?.name,
      userEmail: user?.email,
      userDepartment: user?.department,
      roleName: role?.name,
      roleDisplayName: role?.display_name
    };
  } catch (error) {
    console.error('Error enriching mapping:', error);
    // Return basic mapping if enrichment fails
    return {
      id: mapping.id,
      userId: mapping.user_id,
      roleId: mapping.role_id,
      assignedBy: mapping.assigned_by,
      assignedAt: mapping.assigned_at,
      expiresAt: mapping.expires_at,
      isActive: mapping.is_active,
      updatedAt: mapping.updated_at,
      updatedBy: mapping.updated_by
    };
  }
}

// GET /api/user-role-mapping
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id, userId, roleId, isActive, includeDetails } = req.query;

    // Filter by ID
    if (id) {
      const mapping = await mappingService.getUserRoleMappingById(id);
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
          userId: mapping.user_id,
          roleId: mapping.role_id,
          assignedBy: mapping.assigned_by,
          assignedAt: mapping.assigned_at,
          expiresAt: mapping.expires_at,
          isActive: mapping.is_active,
          updatedAt: mapping.updated_at,
          updatedBy: mapping.updated_by
        }
      });
    }

    // Get filtered mappings
    let mappings;
    const shouldIncludeDetails = includeDetails === 'true';
    if (userId) {
      mappings = await mappingService.getUserRoleMappingsByUserId(userId, shouldIncludeDetails);
    } else if (roleId) {
      mappings = await mappingService.getUserRoleMappingsByRoleId(roleId, shouldIncludeDetails);
    } else {
      mappings = await mappingService.getAllUserRoleMappings();
    }

    // Filter by active status
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      mappings = mappings.filter((m) => m.is_active === activeStatus);
    }

    // Format mappings
    const formattedMappings = mappings.map(m => {
      const baseMapping = {
        id: m.id,
        userId: m.user_id,
        roleId: m.role_id,
        assignedBy: m.assigned_by,
        assignedAt: m.assigned_at,
        expiresAt: m.expires_at,
        isActive: m.is_active,
        updatedAt: m.updated_at,
        updatedBy: m.updated_by
      };

      // If includeDetails was requested, the service already joined user and role data
      if (shouldIncludeDetails) {
        return {
          ...baseMapping,
          userName: m.username,
          userEmail: m.email,
          userFullName: m.user_name,
          userDepartment: m.user_department,
          roleName: m.role_name,
          roleDisplayName: m.role_display_name,
          roleDescription: m.role_description
        };
      }

      return baseMapping;
    });

    res.json({
      mappings: formattedMappings,
      total: formattedMappings.length
    });
  } catch (error) {
    console.error('Get user-role mappings error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user-role mappings' });
  }
});

// POST /api/user-role-mapping
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { userId, roleId, expiresAt } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ error: 'User ID and Role ID are required' });
    }

    // Check if active mapping already exists
    const existingMappings = await mappingService.getUserRoleMappingsByUserId(userId);
    const activeMapping = existingMappings.find((m) =>
      m.role_id === roleId && m.is_active
    );

    if (activeMapping) {
      return res.status(400).json({
        error: 'Active mapping already exists for this user and role'
      });
    }

    // Verify user exists
    const userExists = await userService.getUserById(userId);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify role exists
    const roleExists = await roleService.getRoleById(roleId);
    if (!roleExists) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Create new mapping
    const mappingData = {
      userId,
      roleId,
      assignedBy: req.user.username,
      expiresAt: expiresAt || null,
      isActive: true
    };

    const newMapping = await mappingService.createUserRoleMapping(mappingData);
    const enrichedMapping = await enrichMappingWithDetails(newMapping);

    res.status(201).json({ mapping: enrichedMapping });
  } catch (error) {
    console.error('Create user-role mapping error:', error);
    res.status(500).json({ error: error.message || 'Failed to create user-role mapping' });
  }
});

// PUT /api/user-role-mapping
router.put('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id, expiresAt, isActive } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Mapping ID is required' });
    }

    const existingMapping = await mappingService.getUserRoleMappingById(id);
    if (!existingMapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    const updates = {
      expiresAt: expiresAt !== undefined ? expiresAt : existingMapping.expires_at,
      isActive: isActive !== undefined ? isActive : existingMapping.is_active,
      updatedBy: req.user.username
    };

    const updatedMapping = await mappingService.updateUserRoleMapping(id, updates);
    const enrichedMapping = await enrichMappingWithDetails(updatedMapping);

    res.json({ mapping: enrichedMapping });
  } catch (error) {
    console.error('Update user-role mapping error:', error);
    res.status(500).json({ error: error.message || 'Failed to update user-role mapping' });
  }
});

// DELETE /api/user-role-mapping
router.delete('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Mapping ID is required' });
    }

    const mapping = await mappingService.getUserRoleMappingById(id);
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    await mappingService.deleteUserRoleMapping(id);

    res.json({
      message: 'User-role mapping deleted successfully',
      deletedMapping: {
        id: mapping.id,
        userId: mapping.user_id,
        roleId: mapping.role_id
      }
    });
  } catch (error) {
    console.error('Delete user-role mapping error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user-role mapping' });
  }
});

module.exports = router;
