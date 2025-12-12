/**
 * User Role Mapping Routes - Admin Module
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../../../middleware/authMiddleware';
import * as userRoleMappingService from '../services/userRoleMappingService';

const router = Router();
const logger = getLogger('core-service:admin:user-role-mapping-routes');

function transformMappingToAPI(dbMapping: any) {
  if (!dbMapping) return null;
  return {
    id: dbMapping.id, userId: dbMapping.user_id, roleId: dbMapping.role_id,
    assignedBy: dbMapping.assigned_by, assignedAt: dbMapping.assigned_at, expiresAt: dbMapping.expires_at,
    isActive: dbMapping.is_active, createdAt: dbMapping.created_at, updatedAt: dbMapping.updated_at, updatedBy: dbMapping.updated_by,
    userName: dbMapping.user_name, userLoginid: dbMapping.user_loginid, userEmail: dbMapping.user_email,
    roleName: dbMapping.role_name, roleDisplayName: dbMapping.role_display_name
  };
}

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId, roleId, isActive, includeDetails } = req.query;
    const options: any = {};
    if (userId) options.userId = userId as string;
    if (roleId) options.roleId = roleId as string;
    if (isActive !== undefined) options.isActive = isActive === 'true';
    if (includeDetails) options.includeDetails = includeDetails === 'true';

    const dbMappings = await userRoleMappingService.getAllMappings(options);
    res.json({ mappings: dbMappings.map(transformMappingToAPI) });
  } catch (error: any) {
    logger.error('Error fetching user role mappings:', error);
    res.status(500).json({ error: 'Failed to fetch user role mappings' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbMapping = await userRoleMappingService.getMappingById(req.params.id);
    if (!dbMapping) return res.status(404).json({ error: 'Mapping not found' });
    res.json({ mapping: transformMappingToAPI(dbMapping) });
  } catch (error: any) {
    logger.error('Error fetching user role mapping:', error);
    res.status(500).json({ error: 'Failed to fetch user role mapping' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, roleId, expiresAt, isActive } = req.body;
    if (!userId || !roleId) return res.status(400).json({ error: 'User ID and Role ID are required' });

    if (await userRoleMappingService.mappingExists(userId, roleId)) {
      return res.status(400).json({ error: 'User already has this role assigned' });
    }

    const dbMapping = await userRoleMappingService.createMapping({
      userId, roleId, assignedBy: req.user?.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null, isActive: isActive !== undefined ? isActive : true
    });

    logger.info(`User role mapping created: user=${userId}, role=${roleId}`);
    res.status(201).json({ mapping: transformMappingToAPI(dbMapping) });
  } catch (error: any) {
    logger.error('Error creating user role mapping:', error);
    if (error.code === '23505') return res.status(400).json({ error: 'User already has this role assigned' });
    res.status(500).json({ error: 'Failed to create user role mapping' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, expiresAt } = req.body;

    if (!(await userRoleMappingService.getMappingById(id))) return res.status(404).json({ error: 'Mapping not found' });

    const dbMapping = await userRoleMappingService.updateMapping(id, {
      isActive, expiresAt: expiresAt ? new Date(expiresAt) : null, updatedBy: req.user?.userId
    });

    res.json({ mapping: transformMappingToAPI(dbMapping) });
  } catch (error: any) {
    logger.error('Error updating user role mapping:', error);
    res.status(500).json({ error: 'Failed to update user role mapping' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    if (!(await userRoleMappingService.getMappingById(req.params.id))) return res.status(404).json({ error: 'Mapping not found' });

    await userRoleMappingService.deleteMapping(req.params.id);
    logger.info(`User role mapping deleted: ${req.params.id}`);
    res.json({ message: 'Mapping deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting user role mapping:', error);
    res.status(500).json({ error: 'Failed to delete user role mapping' });
  }
});

router.delete('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Mapping IDs are required' });

    let deletedCount = 0;
    for (const id of ids) {
      try { if (await userRoleMappingService.deleteMapping(id)) deletedCount++; } catch (error) { logger.error(`Failed to delete mapping ${id}:`, error); }
    }

    logger.info(`Bulk deleted ${deletedCount} user role mappings`);
    res.json({ message: `${deletedCount} mapping(s) deleted successfully` });
  } catch (error: any) {
    logger.error('Error bulk deleting user role mappings:', error);
    res.status(500).json({ error: 'Failed to delete user role mappings' });
  }
});

export default router;
