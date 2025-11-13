const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ROLES_FILE = path.join(DATA_DIR, 'roles.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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

// GET /api/role - Get all roles or filter by query params
router.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await readJSON('roles.json');
    const roles = data?.roles || [];

    // Load users to get user names
    const usersData = await readJSON('users.json');
    const users = Array.isArray(usersData) ? usersData : [];

    const { id, name, isActive } = req.query;

    let filteredRoles = roles;

    // Filter by ID
    if (id) {
      const role = roles.find((r) => r.id === id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Enrich with user names
      const enrichedRole = enrichRoleWithUserNames(role, users);
      return res.json({ role: enrichedRole });
    }

    // Filter by name
    if (name) {
      filteredRoles = filteredRoles.filter((r) =>
        r.name.toLowerCase().includes(name.toLowerCase()) ||
        r.displayName.toLowerCase().includes(name.toLowerCase())
      );
    }

    // Filter by active status
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      filteredRoles = filteredRoles.filter((r) => r.isActive === activeStatus);
    }

    // Enrich all roles with user names
    const enrichedRoles = filteredRoles.map(role => enrichRoleWithUserNames(role, users));

    res.json({
      roles: enrichedRoles,
      total: enrichedRoles.length
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: error.message || 'Failed to get roles' });
  }
});

// Helper function to enrich role with user names
function enrichRoleWithUserNames(role, users) {
  const enrichedRole = { ...role };

  if (role.manager) {
    const managerUser = users.find(u => u.id === role.manager);
    enrichedRole.managerName = managerUser ? managerUser.name : null;
  }

  if (role.representative) {
    const repUser = users.find(u => u.id === role.representative);
    enrichedRole.representativeName = repUser ? repUser.name : null;
  }

  return enrichedRole;
}

// POST /api/role - Create a new role
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { name, displayName, description, roleType, manager, representative, isActive } = req.body;

    // Validate required fields
    if (!name || !displayName) {
      return res.status(400).json({ error: 'Name and display name are required' });
    }

    // Validate roleType
    if (roleType && !['management', 'general'].includes(roleType)) {
      return res.status(400).json({ error: 'Role type must be either "management" or "general"' });
    }

    // Read current data
    const data = await readJSON('roles.json');
    const roles = data.roles || [];

    // Check if role name already exists
    const existingRole = roles.find((r) => r.name.toLowerCase() === name.toLowerCase());
    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    // Generate new role ID
    const maxId = roles.reduce((max, r) => {
      const num = parseInt(r.id.replace('role-', ''));
      return num > max ? num : max;
    }, 0);
    const newId = `role-${String(maxId + 1).padStart(3, '0')}`;

    // Create new role
    const newRole = {
      id: newId,
      name: name.toLowerCase(),
      displayName,
      description: description || '',
      roleType: roleType || 'general',
      manager: manager || null,
      representative: representative || null,
      isSystem: false,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.username
    };

    // Add to roles array
    roles.push(newRole);

    // Save to file
    await writeJSON('roles.json', { ...data, roles });

    res.status(201).json({ role: newRole });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: error.message || 'Failed to create role' });
  }
});

// PUT /api/role - Update a role
router.put('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id, name, displayName, description, roleType, manager, representative, isActive } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    // Validate roleType if provided
    if (roleType && !['management', 'general'].includes(roleType)) {
      return res.status(400).json({ error: 'Role type must be either "management" or "general"' });
    }

    // Read current data
    const data = await readJSON('roles.json');
    const roles = data.roles || [];

    // Find role to update
    const roleIndex = roles.findIndex((r) => r.id === id);
    if (roleIndex === -1) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const existingRole = roles[roleIndex];

    // Check if it's a system role and trying to change critical fields
    if (existingRole.isSystem && name && name !== existingRole.name) {
      return res.status(400).json({ error: 'Cannot change name of system role' });
    }

    // Check if new name conflicts with another role
    if (name && name !== existingRole.name) {
      const nameConflict = roles.find((r) =>
        r.id !== id && r.name.toLowerCase() === name.toLowerCase()
      );
      if (nameConflict) {
        return res.status(400).json({ error: 'Role name already exists' });
      }
    }

    // Update role
    const updatedRole = {
      ...existingRole,
      name: name || existingRole.name,
      displayName: displayName || existingRole.displayName,
      description: description !== undefined ? description : existingRole.description,
      roleType: roleType !== undefined ? roleType : existingRole.roleType,
      manager: manager !== undefined ? manager : existingRole.manager,
      representative: representative !== undefined ? representative : existingRole.representative,
      isActive: isActive !== undefined ? isActive : existingRole.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.username
    };

    roles[roleIndex] = updatedRole;

    // Save to file
    await writeJSON('roles.json', { ...data, roles });

    res.json({ role: updatedRole });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: error.message || 'Failed to update role' });
  }
});

// DELETE /api/role - Delete a role
router.delete('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    // Read current data
    const data = await readJSON('roles.json');
    const roles = data.roles || [];

    // Find role to delete
    const role = roles.find((r) => r.id === id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if it's a system role
    if (role.isSystem) {
      return res.status(400).json({ error: 'Cannot delete system role' });
    }

    // Check if any users have this role
    const usersData = await readJSON('users.json');
    const users = usersData.users || [];
    const usersWithRole = users.filter((u) => u.role === role.name);

    if (usersWithRole.length > 0) {
      return res.status(400).json({
        error: `Cannot delete role: ${usersWithRole.length} user(s) still have this role`
      });
    }

    // Remove role from array
    const filteredRoles = roles.filter((r) => r.id !== id);

    // Save to file
    await writeJSON('roles.json', { ...data, roles: filteredRoles });

    res.json({
      message: 'Role deleted successfully',
      deletedRole: role
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete role' });
  }
});

module.exports = router;
