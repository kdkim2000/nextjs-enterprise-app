const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const DEPARTMENTS_FILE = path.join(__dirname, '../data/departments.json');

// Helper function to read departments
async function readDepartments() {
  try {
    const data = await fs.readFile(DEPARTMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading departments:', error);
    return [];
  }
}

// Helper function to write departments
async function writeDepartments(departments) {
  try {
    await fs.writeFile(DEPARTMENTS_FILE, JSON.stringify(departments, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing departments:', error);
    return false;
  }
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

// GET /api/department - Get all departments (flat list)
router.get('/', async (req, res) => {
  try {
    const departments = await readDepartments();
    const flattened = flattenDepartments(departments);
    res.json({ departments: flattened });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// GET /api/department/tree - Get departments as tree structure
router.get('/tree', async (req, res) => {
  try {
    const departments = await readDepartments();
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
    const departments = await readDepartments();
    const department = departments.find(d => d.id === req.params.id);

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ department });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// POST /api/department - Create a new department
router.post('/', async (req, res) => {
  try {
    const departments = await readDepartments();
    const { code, name, description, parentId, managerId, status, email, phone, location } = req.body;

    // Validate required fields
    if (!code || !name || !name.en || !name.ko) {
      return res.status(400).json({ error: 'Code and names (English and Korean) are required' });
    }

    // Check if code already exists
    if (departments.some(d => d.code === code)) {
      return res.status(400).json({ error: 'Department code already exists' });
    }

    // Calculate level based on parent
    let level = 0;
    let order = departments.filter(d => d.parentId === parentId).length + 1;

    if (parentId) {
      const parent = departments.find(d => d.id === parentId);
      if (parent) {
        level = parent.level + 1;
      }
    }

    // Generate new ID
    const maxId = departments.reduce((max, dept) => {
      const num = parseInt(dept.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    const newId = `dept-${String(maxId + 1).padStart(3, '0')}`;

    const newDepartment = {
      id: newId,
      code,
      name,
      description: description || { en: '', ko: '' },
      parentId: parentId || null,
      managerId: managerId || null,
      level,
      order,
      status: status || 'active',
      email: email || '',
      phone: phone || '',
      location: location || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    departments.push(newDepartment);
    await writeDepartments(departments);

    res.status(201).json({ department: newDepartment });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// PUT /api/department/:id - Update a department
router.put('/:id', async (req, res) => {
  try {
    const departments = await readDepartments();
    const index = departments.findIndex(d => d.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const { code, name, description, parentId, managerId, status, email, phone, location, order } = req.body;

    // Check if code is being changed and already exists
    if (code && code !== departments[index].code) {
      if (departments.some(d => d.code === code && d.id !== req.params.id)) {
        return res.status(400).json({ error: 'Department code already exists' });
      }
    }

    // Calculate level based on parent
    let level = departments[index].level;
    if (parentId !== undefined) {
      if (parentId === req.params.id) {
        return res.status(400).json({ error: 'Department cannot be its own parent' });
      }

      if (parentId) {
        const parent = departments.find(d => d.id === parentId);
        if (parent) {
          level = parent.level + 1;
        }
      } else {
        level = 0;
      }
    }

    const updatedDepartment = {
      ...departments[index],
      code: code || departments[index].code,
      name: name || departments[index].name,
      description: description || departments[index].description,
      parentId: parentId !== undefined ? parentId : departments[index].parentId,
      managerId: managerId !== undefined ? managerId : departments[index].managerId,
      level,
      order: order !== undefined ? order : departments[index].order,
      status: status || departments[index].status,
      email: email !== undefined ? email : departments[index].email,
      phone: phone !== undefined ? phone : departments[index].phone,
      location: location !== undefined ? location : departments[index].location,
      updatedAt: new Date().toISOString()
    };

    departments[index] = updatedDepartment;
    await writeDepartments(departments);

    res.json({ department: updatedDepartment });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// DELETE /api/department/:id - Delete a department
router.delete('/:id', async (req, res) => {
  try {
    const departments = await readDepartments();
    const index = departments.findIndex(d => d.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if department has children
    const hasChildren = departments.some(d => d.parentId === req.params.id);
    if (hasChildren) {
      return res.status(400).json({ error: 'Cannot delete department with sub-departments' });
    }

    departments.splice(index, 1);
    await writeDepartments(departments);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

// DELETE /api/department - Bulk delete departments
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Department IDs are required' });
    }

    let departments = await readDepartments();

    // Check if any department has children
    for (const id of ids) {
      const hasChildren = departments.some(d => d.parentId === id);
      if (hasChildren) {
        const dept = departments.find(d => d.id === id);
        return res.status(400).json({
          error: `Cannot delete department "${dept?.name?.en || id}" with sub-departments`
        });
      }
    }

    // Filter out the departments to be deleted
    departments = departments.filter(d => !ids.includes(d.id));
    await writeDepartments(departments);

    res.json({ message: `${ids.length} department(s) deleted successfully` });
  } catch (error) {
    console.error('Error deleting departments:', error);
    res.status(500).json({ error: 'Failed to delete departments' });
  }
});

module.exports = router;
