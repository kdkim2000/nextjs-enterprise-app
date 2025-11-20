const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireProgramAccess, requirePermission } = require('../middleware/permissionMiddleware');
const departmentService = require('../services/departmentService');
const { transformToAPI } = require('../utils/multiLangTransform');

// Helper function to transform database row to API format
function transformDepartmentToAPI(dbDept) {
  if (!dbDept) return null;

  // Use transformToAPI to handle multilingual fields (name, description) and snake_case to camelCase conversion
  const transformed = transformToAPI(dbDept, ['name', 'description']);

  // Apply default values for optional fields
  return {
    ...transformed,
    level: transformed.level || 0,
    order: transformed.order || 1,
    status: transformed.status || 'active'
  };
}

// Helper function to flatten department tree
function flattenDepartments(departments, parentId = null, level = 0) {
  let result = [];
  const depts = departments.filter(d => d.parentId === parentId);

  depts.forEach(dept => {
    result.push({ ...dept, level });
    const children = flattenDepartments(departments, dept.id, level + 1);
    result = result.concat(children);
  });

  return result;
}

// Helper function to build department tree
function buildDepartmentTree(departments) {
  const map = {};
  const roots = [];

  // Create a map of all departments
  departments.forEach(dept => {
    map[dept.id] = { ...dept, children: [] };
  });

  // Build the tree
  departments.forEach(dept => {
    if (dept.parentId && map[dept.parentId]) {
      map[dept.parentId].children.push(map[dept.id]);
    } else {
      roots.push(map[dept.id]);
    }
  });

  return roots;
}

// GET /api/department - Get all departments (flat list) with search and pagination
router.get('/', authenticateToken, requireProgramAccess('PROG-DEPT-MGMT'), async (req, res) => {
  try {
    const { code, name, parentId, managerId, status, page, limit } = req.query;

    // Get all departments first
    const dbDepartments = await departmentService.getAllDepartments();
    let departments = dbDepartments.map(transformDepartmentToAPI);
    let flattened = flattenDepartments(departments);

    // Apply filters
    if (code || name || parentId || managerId || status) {
      flattened = flattened.filter(dept => {
        // Quick search: if same value in multiple fields, it's a quick search
        const isQuickSearch = (code === name);

        if (isQuickSearch && code) {
          const searchTerm = code.toLowerCase();
          return (
            dept.code?.toLowerCase().includes(searchTerm) ||
            dept.name?.en?.toLowerCase().includes(searchTerm) ||
            dept.name?.ko?.toLowerCase().includes(searchTerm)
          );
        }

        // Advanced search: check each field individually
        if (code && !dept.code?.toLowerCase().includes(code.toLowerCase())) return false;
        if (name && !dept.name?.en?.toLowerCase().includes(name.toLowerCase()) &&
            !dept.name?.ko?.toLowerCase().includes(name.toLowerCase())) return false;
        if (parentId && dept.parentId !== parentId) return false;
        if (managerId && dept.managerId !== managerId) return false;
        if (status && dept.status !== status) return false;

        return true;
      });
    }

    // Apply pagination
    const totalCount = flattened.length;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || totalCount;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedDepartments = flattened.slice(startIndex, endIndex);

    res.json({
      departments: paginatedDepartments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// GET /api/department/all - Get all departments (no pagination, no auth required for basic list)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const dbDepartments = await departmentService.getAllDepartments();
    const departments = dbDepartments.map(dept => ({
      id: dept.id,
      code: dept.code,
      name_ko: dept.name_ko,
      name_en: dept.name_en,
      name_zh: dept.name_zh,
      name_vi: dept.name_vi,
      parent_id: dept.parent_id,
      level: dept.level,
      status: dept.status
    }));
    res.json({ departments });
  } catch (error) {
    console.error('Error fetching all departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// GET /api/department/tree - Get departments as tree structure
router.get('/tree', async (req, res) => {
  try {
    const dbDepartments = await departmentService.getAllDepartments();
    const departments = dbDepartments.map(transformDepartmentToAPI);
    const tree = buildDepartmentTree(departments);
    res.json({ departments: tree });
  } catch (error) {
    console.error('Error fetching department tree:', error);
    res.status(500).json({ error: 'Failed to fetch department tree' });
  }
});

// GET /api/department/:id - Get a single department
router.get('/:id', async (req, res) => {
  try {
    const dbDepartment = await departmentService.getDepartmentById(req.params.id);

    if (!dbDepartment) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const department = transformDepartmentToAPI(dbDepartment);
    res.json({ department });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// POST /api/department - Create a new department
router.post('/', authenticateToken, requirePermission('PROG-DEPT-MGMT', 'create'), async (req, res) => {
  try {
    const { code, name, description, parentId, managerId, status } = req.body;

    // Validate required fields
    if (!code || !name || !name.en || !name.ko) {
      return res.status(400).json({ error: 'Code and names (English and Korean) are required' });
    }

    // Check if code already exists
    const existingDept = await departmentService.getDepartmentByCode(code);
    if (existingDept) {
      return res.status(400).json({ error: 'Department code already exists' });
    }

    // Calculate level based on parent
    let level = 0;
    if (parentId) {
      const parent = await departmentService.getDepartmentById(parentId);
      if (parent) {
        level = (parent.level || 0) + 1;
      }
    }

    // Calculate order
    const siblings = await departmentService.getDepartmentsByParentId(parentId);
    const order = siblings.length + 1;

    const departmentData = {
      code,
      nameEn: name.en,
      nameKo: name.ko,
      nameZh: name.zh || '',
      nameVi: name.vi || '',
      descriptionEn: description?.en || '',
      descriptionKo: description?.ko || '',
      descriptionZh: description?.zh || '',
      descriptionVi: description?.vi || '',
      parentId: parentId || null,
      managerId: managerId || null,
      level,
      order,
      status: status || 'active'
    };

    const dbDepartment = await departmentService.createDepartment(departmentData);
    const newDepartment = transformDepartmentToAPI(dbDepartment);

    res.status(201).json({ department: newDepartment });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// PUT /api/department/:id - Update a department
router.put('/:id', authenticateToken, requirePermission('PROG-DEPT-MGMT', 'update'), async (req, res) => {
  try {
    const existingDept = await departmentService.getDepartmentById(req.params.id);
    if (!existingDept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const { code, name, description, parentId, managerId, status, order } = req.body;

    // Check if code is being changed and already exists
    if (code && code !== existingDept.code) {
      const conflictDept = await departmentService.getDepartmentByCode(code);
      if (conflictDept && conflictDept.id !== req.params.id) {
        return res.status(400).json({ error: 'Department code already exists' });
      }
    }

    // Calculate level based on parent
    let level = existingDept.level || 0;
    if (parentId !== undefined) {
      if (parentId === req.params.id) {
        return res.status(400).json({ error: 'Department cannot be its own parent' });
      }

      if (parentId) {
        const parent = await departmentService.getDepartmentById(parentId);
        if (parent) {
          level = (parent.level || 0) + 1;
        }
      } else {
        level = 0;
      }
    }

    const updates = {};
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
    const updatedDepartment = transformDepartmentToAPI(dbDepartment);

    res.json({ department: updatedDepartment });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// DELETE /api/department/:id - Delete a department
router.delete('/:id', authenticateToken, requirePermission('PROG-DEPT-MGMT', 'delete'), async (req, res) => {
  try {
    const existingDept = await departmentService.getDepartmentById(req.params.id);
    if (!existingDept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if department has children
    const children = await departmentService.getDepartmentsByParentId(req.params.id);
    if (children.length > 0) {
      return res.status(400).json({ error: 'Cannot delete department with sub-departments' });
    }

    await departmentService.deleteDepartment(req.params.id);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

// DELETE /api/department - Bulk delete departments
router.delete('/', authenticateToken, requirePermission('PROG-DEPT-MGMT', 'delete'), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Department IDs are required' });
    }

    // Check if any department has children
    for (const id of ids) {
      const children = await departmentService.getDepartmentsByParentId(id);
      if (children.length > 0) {
        const dept = await departmentService.getDepartmentById(id);
        return res.status(400).json({
          error: `Cannot delete department "${dept?.name_en || id}" with sub-departments`
        });
      }
    }

    // Delete all departments
    let deletedCount = 0;
    for (const id of ids) {
      try {
        await departmentService.deleteDepartment(id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete department ${id}:`, error);
      }
    }

    res.json({ message: `${deletedCount} department(s) deleted successfully` });
  } catch (error) {
    console.error('Error deleting departments:', error);
    res.status(500).json({ error: 'Failed to delete departments' });
  }
});

module.exports = router;
