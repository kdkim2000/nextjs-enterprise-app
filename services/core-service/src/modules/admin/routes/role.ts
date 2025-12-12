/**
 * Role Routes - Admin Module
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../../../middleware/authMiddleware';
import * as roleService from '../services/roleService';
import * as userService from '../services/userService';

const router = Router();
const logger = getLogger('core-service:admin:role-routes');

// Helper function to transform snake_case to camelCase
function toCamelCase(obj: any): any {
  if (!obj) return obj;
  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    transformed[camelKey] = value;
  }
  return transformed;
}

// Helper function to enrich role with user names
async function enrichRoleWithUserNames(role: any, users: any[]): Promise<any> {
  const camelRole = toCamelCase(role);

  if (camelRole.manager) {
    const managerUser = users.find(u => u.id === camelRole.manager);
    camelRole.managerName = managerUser ? (managerUser.name_ko || managerUser.name_en || managerUser.loginid) : null;
  }

  if (camelRole.representative) {
    const repUser = users.find(u => u.id === camelRole.representative);
    camelRole.representativeName = repUser ? (repUser.name_ko || repUser.name_en || repUser.loginid) : null;
  }

  return camelRole;
}

/**
 * GET /admin/roles - Get all roles
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id, name, isActive } = req.query;

    if (id) {
      const role = await roleService.getRoleById(id as string);
      if (!role) return res.status(404).json({ error: 'Role not found' });

      const users = await userService.getAllUsers({});
      const enrichedRole = await enrichRoleWithUserNames(role, users);
      return res.json({ role: enrichedRole });
    }

    let roles = await roleService.getAllRoles({});

    if (name) {
      const searchName = (name as string).toLowerCase();
      roles = roles.filter((r) => (r.name && r.name.toLowerCase().includes(searchName)) || (r.display_name && r.display_name.toLowerCase().includes(searchName)));
    }

    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      roles = roles.filter((r) => r.is_active === activeStatus);
    }

    const users = await userService.getAllUsers({});
    const enrichedRoles = await Promise.all(roles.map(role => enrichRoleWithUserNames(role, users)));

    res.json({ roles: enrichedRoles, total: enrichedRoles.length });
  } catch (error: any) {
    logger.error('Get roles error:', error);
    res.status(500).json({ error: error.message || 'Failed to get roles' });
  }
});

/**
 * POST /admin/roles - Create a new role
 */
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, displayName, description, roleType, manager, representative, isActive, isSystem } = req.body;

    if (!name || !displayName) return res.status(400).json({ error: 'Name and display name are required' });
    if (roleType && !['management', 'general'].includes(roleType)) return res.status(400).json({ error: 'Role type must be either "management" or "general"' });

    const roles = await roleService.getAllRoles({});
    const existingRole = roles.find((r) => r.name && r.name.toLowerCase() === name.toLowerCase());
    if (existingRole) return res.status(400).json({ error: 'Role name already exists' });

    const maxId = roles.reduce((max, r) => {
      if (r.id && r.id.startsWith('role-')) {
        const num = parseInt(r.id.replace('role-', ''));
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const newId = `role-${String(maxId + 1).padStart(3, '0')}`;

    const roleData = {
      id: newId,
      name: name.toLowerCase(),
      display_name: displayName,
      description: description || '',
      role_type: roleType || 'general',
      manager: manager || null,
      representative: representative || null,
      is_system: isSystem !== undefined ? isSystem : false,
      is_active: isActive !== undefined ? isActive : true,
      created_by: req.user?.loginid
    };

    const newRole = await roleService.createRole(roleData);
    const camelRole = toCamelCase(newRole);

    logger.info(`Role created: ${name}`);
    res.status(201).json({ role: camelRole });
  } catch (error: any) {
    logger.error('Create role error:', error);
    res.status(500).json({ error: error.message || 'Failed to create role' });
  }
});

/**
 * PUT /admin/roles/:id - Update a role
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, displayName, description, roleType, manager, representative, isActive, isSystem } = req.body;

    if (roleType && !['management', 'general'].includes(roleType)) return res.status(400).json({ error: 'Role type must be either "management" or "general"' });

    const existingRole = await roleService.getRoleById(id);
    if (!existingRole) return res.status(404).json({ error: 'Role not found' });

    if (existingRole.is_system && name && name !== existingRole.name) {
      return res.status(400).json({ error: 'Cannot change name of system role' });
    }

    if (name && name !== existingRole.name) {
      const roles = await roleService.getAllRoles({});
      const nameConflict = roles.find((r) => r.id !== id && r.name && r.name.toLowerCase() === name.toLowerCase());
      if (nameConflict) return res.status(400).json({ error: 'Role name already exists' });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (displayName !== undefined) updates.display_name = displayName;
    if (description !== undefined) updates.description = description;
    if (roleType !== undefined) updates.role_type = roleType;
    if (manager !== undefined) updates.manager = manager;
    if (representative !== undefined) updates.representative = representative;
    if (isActive !== undefined) updates.is_active = isActive;
    if (isSystem !== undefined) updates.is_system = isSystem;
    updates.updated_by = req.user?.loginid;

    const updatedRole = await roleService.updateRole(id, updates);
    const camelRole = toCamelCase(updatedRole);

    res.json({ role: camelRole });
  } catch (error: any) {
    logger.error('Update role error:', error);
    res.status(500).json({ error: error.message || 'Failed to update role' });
  }
});

/**
 * DELETE /admin/roles/:id - Delete a role
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = await roleService.getRoleById(id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    if (role.is_system) return res.status(400).json({ error: 'Cannot delete system role' });

    const userCount = await roleService.countUsersByRole(role.name);
    if (userCount > 0) return res.status(400).json({ error: `Cannot delete role: ${userCount} user(s) still have this role` });

    await roleService.deleteRole(id);

    logger.info(`Role deleted: ${role.name}`);
    res.json({ message: 'Role deleted successfully', deletedRole: role });
  } catch (error: any) {
    logger.error('Delete role error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete role' });
  }
});

export default router;
