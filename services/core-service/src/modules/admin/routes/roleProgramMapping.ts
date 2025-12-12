/**
 * Role Program Mapping Routes - Admin Module
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../../../middleware/authMiddleware';
import * as roleProgramMappingService from '../services/roleProgramMappingService';

const router = Router();
const logger = getLogger('core-service:admin:role-program-mapping-routes');

function transformMappingToAPI(dbMapping: any) {
  if (!dbMapping) return null;
  return {
    id: dbMapping.id, roleId: dbMapping.role_id, programCode: dbMapping.program_code,
    canView: dbMapping.can_view, canCreate: dbMapping.can_create, canUpdate: dbMapping.can_update, canDelete: dbMapping.can_delete,
    createdBy: dbMapping.created_by, createdAt: dbMapping.created_at, updatedAt: dbMapping.updated_at,
    roleName: dbMapping.role_name, roleDisplayName: dbMapping.role_display_name, programName: dbMapping.program_name
  };
}

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { roleId, programCode, includeDetails } = req.query;
    const options: any = {};
    if (roleId) options.roleId = roleId as string;
    if (programCode) options.programCode = programCode as string;
    if (includeDetails) options.includeDetails = includeDetails === 'true';

    const dbMappings = await roleProgramMappingService.getAllMappings(options);
    res.json({ mappings: dbMappings.map(transformMappingToAPI) });
  } catch (error: any) {
    logger.error('Error fetching role program mappings:', error);
    res.status(500).json({ error: 'Failed to fetch role program mappings' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbMapping = await roleProgramMappingService.getMappingById(req.params.id);
    if (!dbMapping) return res.status(404).json({ error: 'Mapping not found' });
    res.json({ mapping: transformMappingToAPI(dbMapping) });
  } catch (error: any) {
    logger.error('Error fetching role program mapping:', error);
    res.status(500).json({ error: 'Failed to fetch role program mapping' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { roleId, programCode, canView, canCreate, canUpdate, canDelete } = req.body;
    if (!roleId || !programCode) return res.status(400).json({ error: 'Role ID and Program Code are required' });

    if (await roleProgramMappingService.mappingExists(roleId, programCode)) {
      return res.status(400).json({ error: 'This role already has permissions for this program' });
    }

    const dbMapping = await roleProgramMappingService.createMapping({
      roleId, programCode,
      canView: canView !== undefined ? canView : true,
      canCreate: canCreate !== undefined ? canCreate : false,
      canUpdate: canUpdate !== undefined ? canUpdate : false,
      canDelete: canDelete !== undefined ? canDelete : false,
      createdBy: req.user?.userId
    });

    logger.info(`Role program mapping created: role=${roleId}, program=${programCode}`);
    res.status(201).json({ mapping: transformMappingToAPI(dbMapping) });
  } catch (error: any) {
    logger.error('Error creating role program mapping:', error);
    if (error.code === '23505') return res.status(400).json({ error: 'This role already has permissions for this program' });
    res.status(500).json({ error: 'Failed to create role program mapping' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { canView, canCreate, canUpdate, canDelete } = req.body;

    if (!(await roleProgramMappingService.getMappingById(id))) return res.status(404).json({ error: 'Mapping not found' });

    const dbMapping = await roleProgramMappingService.updateMapping(id, { canView, canCreate, canUpdate, canDelete });
    res.json({ mapping: transformMappingToAPI(dbMapping) });
  } catch (error: any) {
    logger.error('Error updating role program mapping:', error);
    res.status(500).json({ error: 'Failed to update role program mapping' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    if (!(await roleProgramMappingService.getMappingById(req.params.id))) return res.status(404).json({ error: 'Mapping not found' });

    await roleProgramMappingService.deleteMapping(req.params.id);
    logger.info(`Role program mapping deleted: ${req.params.id}`);
    res.json({ message: 'Mapping deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting role program mapping:', error);
    res.status(500).json({ error: 'Failed to delete role program mapping' });
  }
});

router.delete('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Mapping IDs are required' });

    let deletedCount = 0;
    for (const id of ids) {
      try { if (await roleProgramMappingService.deleteMapping(id)) deletedCount++; } catch (error) { logger.error(`Failed to delete mapping ${id}:`, error); }
    }

    logger.info(`Bulk deleted ${deletedCount} role program mappings`);
    res.json({ message: `${deletedCount} mapping(s) deleted successfully` });
  } catch (error: any) {
    logger.error('Error bulk deleting role program mappings:', error);
    res.status(500).json({ error: 'Failed to delete role program mappings' });
  }
});

export default router;
