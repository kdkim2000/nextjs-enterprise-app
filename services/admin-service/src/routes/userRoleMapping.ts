/**
 * User Role Mapping Routes
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import * as userRoleMappingService from '../services/userRoleMappingService';

const router = Router();
const logger = getLogger('admin-service:user-role-mapping-routes');

// Helper function to transform database row to API format
function transformMappingToAPI(dbMapping: any) {
  if (!dbMapping) return null;

  return {
    id: dbMapping.id,
    userId: dbMapping.user_id,
    roleId: dbMapping.role_id,
    assignedBy: dbMapping.assigned_by,
    assignedAt: dbMapping.assigned_at,
    expiresAt: dbMapping.expires_at,
    isActive: dbMapping.is_active,
    createdAt: dbMapping.created_at,
    updatedAt: dbMapping.updated_at,
    updatedBy: dbMapping.updated_by,
    // Details from joined tables
    userName: dbMapping.user_name,
    userLoginid: dbMapping.user_loginid,
    userEmail: dbMapping.user_email,
    roleName: dbMapping.role_name,
    roleDisplayName: dbMapping.role_display_name
  };
}

/**
 * GET /admin/user-role-mappings - Get all user role mappings
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId, roleId, isActive, includeDetails } = req.query;

    const options: any = {};
    if (userId) options.userId = userId as string;
    if (roleId) options.roleId = roleId as string;
    if (isActive !== undefined) options.isActive = isActive === 'true';
    if (includeDetails) options.includeDetails = includeDetails === 'true';

    const dbMappings = await userRoleMappingService.getAllMappings(options);
    const mappings = dbMappings.map(transformMappingToAPI);

    res.json({ mappings });
  } catch (error: any) {
    logger.error('Error fetching user role mappings:', error);
    res.status(500).json({ error: 'Failed to fetch user role mappings' });
  }
});

/**
 * GET /admin/user-role-mappings/:id - Get single mapping by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbMapping = await userRoleMappingService.getMappingById(id);

    if (!dbMapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    const mapping = transformMappingToAPI(dbMapping);
    res.json({ mapping });
  } catch (error: any) {
    logger.error('Error fetching user role mapping:', error);
    res.status(500).json({ error: 'Failed to fetch user role mapping' });
  }
});

/**
 * POST /admin/user-role-mappings - Create user role mapping
 */
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, roleId, expiresAt, isActive } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ error: 'User ID and Role ID are required' });
    }

    // Check if mapping already exists
    const exists = await userRoleMappingService.mappingExists(userId, roleId);
    if (exists) {
      return res.status(400).json({ error: 'User already has this role assigned' });
    }

    const dbMapping = await userRoleMappingService.createMapping({
      userId,
      roleId,
      assignedBy: req.user?.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive !== undefined ? isActive : true
    });

    const mapping = transformMappingToAPI(dbMapping);
    logger.info(`User role mapping created: user=${userId}, role=${roleId}`);

    res.status(201).json({ mapping });
  } catch (error: any) {
    logger.error('Error creating user role mapping:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ error: 'User already has this role assigned' });
    }

    res.status(500).json({ error: 'Failed to create user role mapping' });
  }
});

/**
 * PUT /admin/user-role-mappings/:id - Update user role mapping
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, expiresAt } = req.body;

    const existingMapping = await userRoleMappingService.getMappingById(id);
    if (!existingMapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    const dbMapping = await userRoleMappingService.updateMapping(id, {
      isActive,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      updatedBy: req.user?.userId
    });

    const mapping = transformMappingToAPI(dbMapping);
    res.json({ mapping });
  } catch (error: any) {
    logger.error('Error updating user role mapping:', error);
    res.status(500).json({ error: 'Failed to update user role mapping' });
  }
});

/**
 * DELETE /admin/user-role-mappings/:id - Delete user role mapping
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingMapping = await userRoleMappingService.getMappingById(id);
    if (!existingMapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    await userRoleMappingService.deleteMapping(id);
    logger.info(`User role mapping deleted: ${id}`);

    res.json({ message: 'Mapping deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting user role mapping:', error);
    res.status(500).json({ error: 'Failed to delete user role mapping' });
  }
});

/**
 * DELETE /admin/user-role-mappings - Bulk delete user role mappings
 */
router.delete('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Mapping IDs are required' });
    }

    let deletedCount = 0;
    for (const id of ids) {
      try {
        const deleted = await userRoleMappingService.deleteMapping(id);
        if (deleted) deletedCount++;
      } catch (error) {
        logger.error(`Failed to delete mapping ${id}:`, error);
      }
    }

    logger.info(`Bulk deleted ${deletedCount} user role mappings`);
    res.json({ message: `${deletedCount} mapping(s) deleted successfully` });
  } catch (error: any) {
    logger.error('Error bulk deleting user role mappings:', error);
    res.status(500).json({ error: 'Failed to delete user role mappings' });
  }
});

export default router;
