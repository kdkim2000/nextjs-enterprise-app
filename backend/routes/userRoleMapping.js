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

// Helper function to enrich mapping with user and role details
async function enrichMappingWithDetails(mapping) {
  try {
    const usersData = await readJSON('users.json');
    const rolesData = await readJSON('roles.json');

    const users = usersData.users || [];
    const roles = rolesData.roles || [];

    const user = users.find((u) => u.id === mapping.userId);
    const role = roles.find((r) => r.id === mapping.roleId);

    return {
      ...mapping,
      userName: user?.name || user?.username,
      userEmail: user?.email,
      roleName: role?.name,
      roleDisplayName: role?.displayName
    };
  } catch (error) {
    console.error('Error enriching mapping:', error);
    return mapping;
  }
}

// GET /api/user-role-mapping
router.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await readJSON('userRoleMappings.json');
    const mappings = data?.userRoleMappings || [];

    const { id, userId, roleId, isActive, includeDetails } = req.query;

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

    // Filter by userId
    if (userId) {
      filteredMappings = filteredMappings.filter((m) => m.userId === userId);
    }

    // Filter by roleId
    if (roleId) {
      filteredMappings = filteredMappings.filter((m) => m.roleId === roleId);
    }

    // Filter by active status
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      filteredMappings = filteredMappings.filter((m) => m.isActive === activeStatus);
    }

    // Enrich with user and role details if requested
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

    const data = await readJSON('userRoleMappings.json');
    const mappings = data.userRoleMappings || [];

    // Check if mapping already exists
    const existingMapping = mappings.find((m) =>
      m.userId === userId && m.roleId === roleId && m.isActive
    );
    if (existingMapping) {
      return res.status(400).json({
        error: 'Active mapping already exists for this user and role'
      });
    }

    // Verify user exists
    const usersData = await readJSON('users.json');
    const users = usersData.users || [];
    const userExists = users.find((u) => u.id === userId);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify role exists
    const rolesData = await readJSON('roles.json');
    const roles = rolesData.roles || [];
    const roleExists = roles.find((r) => r.id === roleId);
    if (!roleExists) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Generate new mapping ID
    const maxId = mappings.reduce((max, m) => {
      const num = parseInt(m.id.replace('urm-', ''));
      return num > max ? num : max;
    }, 0);
    const newId = `urm-${String(maxId + 1).padStart(3, '0')}`;

    // Create new mapping
    const newMapping = {
      id: newId,
      userId,
      roleId,
      assignedBy: req.user.username,
      assignedAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      isActive: true
    };

    mappings.push(newMapping);
    await writeJSON('userRoleMappings.json', { ...data, userRoleMappings: mappings });

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

    const data = await readJSON('userRoleMappings.json');
    const mappings = data.userRoleMappings || [];

    const mappingIndex = mappings.findIndex((m) => m.id === id);
    if (mappingIndex === -1) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    const existingMapping = mappings[mappingIndex];

    const updatedMapping = {
      ...existingMapping,
      expiresAt: expiresAt !== undefined ? expiresAt : existingMapping.expiresAt,
      isActive: isActive !== undefined ? isActive : existingMapping.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.username
    };

    mappings[mappingIndex] = updatedMapping;
    await writeJSON('userRoleMappings.json', { ...data, userRoleMappings: mappings });

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

    const data = await readJSON('userRoleMappings.json');
    const mappings = data.userRoleMappings || [];

    const mapping = mappings.find((m) => m.id === id);
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    const filteredMappings = mappings.filter((m) => m.id !== id);
    await writeJSON('userRoleMappings.json', { ...data, userRoleMappings: filteredMappings });

    res.json({
      message: 'User-role mapping deleted successfully',
      deletedMapping: mapping
    });
  } catch (error) {
    console.error('Delete user-role mapping error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user-role mapping' });
  }
});

module.exports = router;
