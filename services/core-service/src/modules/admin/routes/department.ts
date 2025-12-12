/**
 * Department Routes - Admin Module
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken } from '../../../middleware/authMiddleware';
import * as departmentService from '../services/departmentService';
import { transformMultiLangFields, transformKeysToCamelCase } from '../utils/multiLangTransform';

const router = Router();
const logger = getLogger('core-service:admin:department-routes');

function transformDepartmentToAPI(dbDept: any) {
  if (!dbDept) return null;
  const multiLangTransformed = transformMultiLangFields(dbDept, ['name', 'description']);
  const transformed = transformKeysToCamelCase(multiLangTransformed);
  return { ...transformed, level: transformed.level || 0, order: transformed.order || 1, status: transformed.status || 'active' };
}

function flattenDepartments(departments: any[], parentId: string | null = null, level = 0): any[] {
  let result: any[] = [];
  const depts = departments.filter(d => d.parentId === parentId);
  depts.forEach(dept => {
    result.push({ ...dept, level });
    result = result.concat(flattenDepartments(departments, dept.id, level + 1));
  });
  return result;
}

function buildDepartmentTree(departments: any[]) {
  const map: Record<string, any> = {};
  const roots: any[] = [];
  departments.forEach(dept => map[dept.id] = { ...dept, children: [] });
  departments.forEach(dept => {
    if (dept.parentId && map[dept.parentId]) map[dept.parentId].children.push(map[dept.id]);
    else roots.push(map[dept.id]);
  });
  return roots;
}

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, name, parentId, managerId, status, page, limit } = req.query;
    const dbDepartments = await departmentService.getAllDepartments();
    let departments = dbDepartments.map(transformDepartmentToAPI);
    let flattened = flattenDepartments(departments);

    if (code || name || parentId || managerId || status) {
      flattened = flattened.filter((dept: any) => {
        const isQuickSearch = (code === name);
        if (isQuickSearch && code) {
          const searchTerm = (code as string).toLowerCase();
          return dept.code?.toLowerCase().includes(searchTerm) || dept.name?.en?.toLowerCase().includes(searchTerm) || dept.name?.ko?.toLowerCase().includes(searchTerm);
        }
        if (code && !dept.code?.toLowerCase().includes((code as string).toLowerCase())) return false;
        if (name && !dept.name?.en?.toLowerCase().includes((name as string).toLowerCase()) && !dept.name?.ko?.toLowerCase().includes((name as string).toLowerCase())) return false;
        if (parentId && dept.parentId !== parentId) return false;
        if (managerId && dept.managerId !== managerId) return false;
        if (status && dept.status !== status) return false;
        return true;
      });
    }

    const totalCount = flattened.length;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || totalCount;
    const paginatedDepartments = flattened.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum);

    res.json({ departments: paginatedDepartments, pagination: { page: pageNum, limit: limitNum, totalCount, totalPages: Math.ceil(totalCount / limitNum) } });
  } catch (error: any) {
    logger.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.get('/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbDepartments = await departmentService.getAllDepartments();
    const departments = dbDepartments.map((dept: any) => ({
      id: dept.id, code: dept.code, name_ko: dept.name_ko, name_en: dept.name_en, name_zh: dept.name_zh, name_vi: dept.name_vi, parent_id: dept.parent_id, level: dept.level, status: dept.status
    }));
    res.json({ departments });
  } catch (error: any) {
    logger.error('Error fetching all departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.get('/tree', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbDepartments = await departmentService.getAllDepartments();
    const departments = dbDepartments.map(transformDepartmentToAPI);
    res.json({ departments: buildDepartmentTree(departments) });
  } catch (error: any) {
    logger.error('Error fetching department tree:', error);
    res.status(500).json({ error: 'Failed to fetch department tree' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbDepartment = await departmentService.getDepartmentById(req.params.id);
    if (!dbDepartment) return res.status(404).json({ error: 'Department not found' });
    res.json({ department: transformDepartmentToAPI(dbDepartment) });
  } catch (error: any) {
    logger.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, name, description, parentId, managerId, status } = req.body;
    if (!code || !name || !name.en || !name.ko) return res.status(400).json({ error: 'Code and names (English and Korean) are required' });

    if (await departmentService.getDepartmentByCode(code)) return res.status(400).json({ error: 'Department code already exists' });

    let level = 0;
    if (parentId) {
      const parent = await departmentService.getDepartmentById(parentId);
      if (parent) level = (parent.level || 0) + 1;
    }

    const siblings = await departmentService.getDepartmentsByParentId(parentId);
    const order = siblings.length + 1;

    const dbDepartment = await departmentService.createDepartment({
      code, nameEn: name.en, nameKo: name.ko, nameZh: name.zh || '', nameVi: name.vi || '',
      descriptionEn: description?.en || '', descriptionKo: description?.ko || '', descriptionZh: description?.zh || '', descriptionVi: description?.vi || '',
      parentId: parentId || null, managerId: managerId || null, level, order, status: status || 'active'
    });

    res.status(201).json({ department: transformDepartmentToAPI(dbDepartment) });
  } catch (error: any) {
    logger.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existingDept = await departmentService.getDepartmentById(req.params.id);
    if (!existingDept) return res.status(404).json({ error: 'Department not found' });

    const { code, name, description, parentId, managerId, status, order } = req.body;

    if (code && code !== existingDept.code) {
      const conflictDept = await departmentService.getDepartmentByCode(code);
      if (conflictDept && conflictDept.id !== req.params.id) return res.status(400).json({ error: 'Department code already exists' });
    }

    let level = existingDept.level || 0;
    if (parentId !== undefined) {
      if (parentId === req.params.id) return res.status(400).json({ error: 'Department cannot be its own parent' });
      if (parentId) {
        const parent = await departmentService.getDepartmentById(parentId);
        if (parent) level = (parent.level || 0) + 1;
      } else level = 0;
    }

    const updates: Record<string, any> = {};
    if (code) updates.code = code;
    if (name) {
      if (name.en !== undefined) updates.nameEn = name.en;
      if (name.ko !== undefined) updates.nameKo = name.ko;
      if (name.zh !== undefined) updates.nameZh = name.zh;
      if (name.vi !== undefined) updates.nameVi = name.vi;
    }
    if (description) {
      if (description.en !== undefined) updates.descriptionEn = description.en;
      if (description.ko !== undefined) updates.descriptionKo = description.ko;
      if (description.zh !== undefined) updates.descriptionZh = description.zh;
      if (description.vi !== undefined) updates.descriptionVi = description.vi;
    }
    if (parentId !== undefined) updates.parentId = parentId;
    if (managerId !== undefined) updates.managerId = managerId;
    if (status) updates.status = status;
    if (order !== undefined) updates.order = order;
    updates.level = level;

    const dbDepartment = await departmentService.updateDepartment(req.params.id, updates);
    res.json({ department: transformDepartmentToAPI(dbDepartment) });
  } catch (error: any) {
    logger.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existingDept = await departmentService.getDepartmentById(req.params.id);
    if (!existingDept) return res.status(404).json({ error: 'Department not found' });

    const children = await departmentService.getDepartmentsByParentId(req.params.id);
    if (children.length > 0) return res.status(400).json({ error: 'Cannot delete department with sub-departments' });

    await departmentService.deleteDepartment(req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

router.delete('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Department IDs are required' });

    for (const id of ids) {
      const children = await departmentService.getDepartmentsByParentId(id);
      if (children.length > 0) {
        const dept = await departmentService.getDepartmentById(id);
        return res.status(400).json({ error: `Cannot delete department "${dept?.name_en || id}" with sub-departments` });
      }
    }

    let deletedCount = 0;
    for (const id of ids) {
      try { await departmentService.deleteDepartment(id); deletedCount++; } catch (error) { logger.error(`Failed to delete department ${id}:`, error); }
    }

    res.json({ message: `${deletedCount} department(s) deleted successfully` });
  } catch (error: any) {
    logger.error('Error deleting departments:', error);
    res.status(500).json({ error: 'Failed to delete departments' });
  }
});

export default router;
