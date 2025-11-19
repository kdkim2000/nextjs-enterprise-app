const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleService = require('../services/roleService');
const userService = require('../services/userService');

// Helper function to enrich role with user names
async function enrichRoleWithUserNames(role, users) {
  const enrichedRole = { ...role };

  if (role.manager) {
    const managerUser = users.find(u => u.id === role.manager);
    enrichedRole.manager_name = managerUser ? managerUser.name : null;
  }

  if (role.representative) {
    const repUser = users.find(u => u.id === role.representative);
    enrichedRole.representative_name = repUser ? repUser.name : null;
  }

  return enrichedRole;
}

// GET /api/role - Get all roles or filter by query params
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id, name, isActive } = req.query;

    // Filter by ID - return single role
    if (id) {
      const role = await roleService.getRoleById(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Load users to enrich role data
      const users = await userService.getAllUsers();
      const enrichedRole = await enrichRoleWithUserNames(role, users);

      return res.json({ role: enrichedRole });
    }

    // Get all roles
    let roles = await roleService.getAllRoles();

    // Filter by name (search in name or display_name)
    if (name) {
      roles = roles.filter((r) =>
        (r.name && r.name.toLowerCase().includes(name.toLowerCase())) ||
        (r.display_name && r.display_name.toLowerCase().includes(name.toLowerCase()))
      );
    }

    // Filter by active status
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      roles = roles.filter((r) => r.is_active === activeStatus);
    }

    // Load users to enrich role data
    const users = await userService.getAllUsers();
    const enrichedRoles = await Promise.all(
      roles.map(role => enrichRoleWithUserNames(role, users))
    );

    res.json({
      roles: enrichedRoles,
      total: enrichedRoles.length
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: error.message || 'Failed to get roles' });
  }
});

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

    // Check if role name already exists
    const roles = await roleService.getAllRoles();
    const existingRole = roles.find((r) => r.name && r.name.toLowerCase() === name.toLowerCase());
    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    // Generate new role ID
    const maxId = roles.reduce((max, r) => {
      if (r.id && r.id.startsWith('role-')) {
        const num = parseInt(r.id.replace('role-', ''));
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const newId = `role-${String(maxId + 1).padStart(3, '0')}`;

    // Create new role with snake_case fields
    const roleData = {
      id: newId,
      name: name.toLowerCase(),
      display_name: displayName,
      description: description || '',
      role_type: roleType || 'general',
      manager: manager || null,
      representative: representative || null,
      is_system: false,
      is_active: isActive !== undefined ? isActive : true,
      created_by: req.user.username
    };

    const newRole = await roleService.createRole(roleData);

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

    // Find role to update
    const existingRole = await roleService.getRoleById(id);
    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if it's a system role and trying to change critical fields
    if (existingRole.is_system && name && name !== existingRole.name) {
      return res.status(400).json({ error: 'Cannot change name of system role' });
    }

    // Check if new name conflicts with another role
    if (name && name !== existingRole.name) {
      const roles = await roleService.getAllRoles();
      const nameConflict = roles.find((r) =>
        r.id !== id && r.name && r.name.toLowerCase() === name.toLowerCase()
      );
      if (nameConflict) {
        return res.status(400).json({ error: 'Role name already exists' });
      }
    }

    // Prepare updates with snake_case fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (displayName !== undefined) updates.display_name = displayName;
    if (description !== undefined) updates.description = description;
    if (roleType !== undefined) updates.role_type = roleType;
    if (manager !== undefined) updates.manager = manager;
    if (representative !== undefined) updates.representative = representative;
    if (isActive !== undefined) updates.is_active = isActive;
    updates.updated_by = req.user.username;

    const updatedRole = await roleService.updateRole(id, updates);

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

    // Find role to delete
    const role = await roleService.getRoleById(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if it's a system role
    if (role.is_system) {
      return res.status(400).json({ error: 'Cannot delete system role' });
    }

    // Check if any users have this role
    const userCount = await roleService.countUsersByRole(role.name);

    if (userCount > 0) {
      return res.status(400).json({
        error: `Cannot delete role: ${userCount} user(s) still have this role`
      });
    }

    // Delete the role
    await roleService.deleteRole(id);

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
